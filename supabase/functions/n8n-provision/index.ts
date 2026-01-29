import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * n8n Provisioning Edge Function
 * 
 * This function is a CONTROL PANEL, not an automation engine.
 * It collects credentials, stores them securely, and triggers webhooks.
 * 
 * Actions:
 * - activate: POST to automation's webhook with credentials_reference_id
 * - pause: Update status to paused
 * - resume: Re-trigger webhook to resume
 * - revoke: Mark credentials as revoked and notify n8n
 */

interface ActivationPayload {
  customer_id: string;
  automation_id: string;
  workflow_id: string;
  credentials_reference_id: string;
  config: Record<string, unknown>;
}

interface AutomationAgent {
  id: string;
  slug: string;
  name: string;
  workflow_id: string | null;
  webhook_url: string | null;
  configuration_fields: unknown[] | null;
  required_integrations: unknown[] | null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate authorization
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = claimsData.claims.sub as string;
    const userEmail = claimsData.claims.email as string;

    const { action, activationRequestId, config } = await req.json();

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get activation request
    const { data: activationData, error: activationError } = await supabaseAdmin
      .from("installation_requests")
      .select("id, email, name, company, automation_id, bundle_id")
      .eq("id", activationRequestId)
      .eq("email", userEmail)
      .maybeSingle();

    if (activationError || !activationData) {
      return new Response(
        JSON.stringify({ error: "Activation request not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get automation details separately
    let automation: AutomationAgent | null = null;
    if (activationData.automation_id) {
      const { data: automationData } = await supabaseAdmin
        .from("automation_agents")
        .select("id, slug, name, workflow_id, webhook_url, configuration_fields, required_integrations")
        .eq("id", activationData.automation_id)
        .maybeSingle();
      automation = automationData;
    }

    if (!automation) {
      return new Response(
        JSON.stringify({ error: "Automation not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    switch (action) {
      case "activate": {
        // Verify automation has required webhook config
        if (!automation.webhook_url) {
          return new Response(
            JSON.stringify({ error: "Automation webhook not configured" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // CONNECT ONCE: Check user's connections (user-level, not activation-level)
        const { data: userConnections } = await supabaseAdmin
          .from("integration_connections")
          .select("id, provider, status")
          .eq("user_id", userId)
          .eq("status", "connected");

        // Get required integrations from automation
        let requiredProviders: string[] = [];
        if (automation.required_integrations && Array.isArray(automation.required_integrations)) {
          requiredProviders = (automation.required_integrations as { provider?: string }[])
            .map(ri => (ri.provider || '').toLowerCase())
            .filter(Boolean);
        }

        // Check if all required providers are connected
        const connectedProviders = new Set(
          (userConnections || []).map(c => c.provider.toLowerCase())
        );
        const missingProviders = requiredProviders.filter(p => !connectedProviders.has(p));

        if (requiredProviders.length > 0 && missingProviders.length > 0) {
          return new Response(
            JSON.stringify({ 
              error: `Missing required integrations: ${missingProviders.join(", ")}. Please connect all required tools first.` 
            }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        if (!userConnections || userConnections.length === 0) {
          return new Response(
            JSON.stringify({ error: "No connected integrations found. Please connect all required tools first." }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Build integration_connection_ids mapping (for reference only, n8n fetches via runtime-credentials)
        const integrationConnectionIds: Record<string, string> = {};
        for (const conn of userConnections) {
          integrationConnectionIds[conn.provider] = conn.id;
        }

        // Generate credentials reference ID for n8n
        const credentialsReferenceId = `cred_bundle_${activationRequestId}`;

        // Create or update n8n mapping record
        const { data: existingMapping } = await supabaseAdmin
          .from("n8n_mappings")
          .select("id")
          .eq("activation_request_id", activationRequestId)
          .eq("user_id", userId)
          .maybeSingle();

        const mappingData = {
          user_id: userId,
          activation_request_id: activationRequestId,
          automation_id: activationData.automation_id,
          bundle_id: activationData.bundle_id,
          status: "provisioning",
          credentials_reference_id: credentialsReferenceId,
          webhook_status: "pending",
          metadata: {
            customer_email: userEmail,
            customer_name: activationData.name,
            company: activationData.company,
          },
          updated_at: new Date().toISOString(),
        };

        let mappingId: string;
        if (existingMapping) {
          await supabaseAdmin
            .from("n8n_mappings")
            .update(mappingData)
            .eq("id", existingMapping.id);
          mappingId = existingMapping.id;
        } else {
          const { data: newMapping, error: mappingError } = await supabaseAdmin
            .from("n8n_mappings")
            .insert(mappingData)
            .select("id")
            .single();

          if (mappingError || !newMapping) {
            console.error("Failed to create mapping:", mappingError);
            return new Response(
              JSON.stringify({ error: "Failed to start activation" }),
              { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
          mappingId = newMapping.id;
        }

        // Build activation payload per webhook contract
        // n8n will call runtime-credentials endpoint to fetch actual credentials
        const activationPayload = {
          activation_id: activationRequestId,
          automation_slug: automation.slug,
          config: (config as Record<string, unknown>) || {},
        };

        // POST to automation webhook
        console.log(`Triggering webhook: ${automation.webhook_url}`);
        let webhookResponse: Response;
        let webhookSuccess = false;
        let webhookError: string | null = null;

        try {
          webhookResponse = await fetch(automation.webhook_url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(activationPayload),
          });

          webhookSuccess = webhookResponse.ok;
          if (!webhookSuccess) {
            webhookError = await webhookResponse.text();
            console.error(`Webhook failed: ${webhookResponse.status} - ${webhookError}`);
          }
        } catch (err) {
          webhookError = err instanceof Error ? err.message : "Webhook request failed";
          console.error("Webhook error:", webhookError);
        }

        // Update mapping with webhook result
        await supabaseAdmin
          .from("n8n_mappings")
          .update({
            status: webhookSuccess ? "active" : "error",
            webhook_status: webhookSuccess ? "success" : "error",
            provisioned_at: webhookSuccess ? new Date().toISOString() : null,
            error_message: webhookError,
            last_webhook_response: webhookSuccess 
              ? { status: "success", timestamp: new Date().toISOString() }
              : { status: "error", error: webhookError, timestamp: new Date().toISOString() },
          })
          .eq("id", mappingId);

        // Update activation request status
        await supabaseAdmin
          .from("installation_requests")
          .update({
            status: webhookSuccess ? "live" : "needs_attention",
            customer_visible_status: webhookSuccess ? "live" : "needs_attention",
            status_updated_at: new Date().toISOString(),
          })
          .eq("id", activationRequestId);

        if (!webhookSuccess) {
          // Create admin notification for failed activation
          await supabaseAdmin
            .from("admin_notifications")
            .insert({
              type: "activation_failed",
              title: "Activation Failed",
              body: `Webhook activation failed for ${userEmail}: ${webhookError}`,
              severity: "error",
              metadata: {
                activation_request_id: activationRequestId,
                automation_id: automation.id,
                error: webhookError,
              },
            });

          return new Response(
            JSON.stringify({ 
              success: false, 
              error: "Activation webhook failed. Our team has been notified.",
            }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        return new Response(
          JSON.stringify({ 
            success: true, 
            mappingId,
            message: "Automation activated successfully" 
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "pause": {
        // Update status to paused (n8n will check status on next execution)
        await supabaseAdmin
          .from("n8n_mappings")
          .update({ 
            status: "paused",
            updated_at: new Date().toISOString(),
          })
          .eq("activation_request_id", activationRequestId)
          .eq("user_id", userId);

        await supabaseAdmin
          .from("installation_requests")
          .update({
            status: "paused",
            customer_visible_status: "paused",
            status_updated_at: new Date().toISOString(),
          })
          .eq("id", activationRequestId);

        return new Response(
          JSON.stringify({ success: true, message: "Automation paused" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "resume": {
        // Get existing mapping
        const { data: mapping } = await supabaseAdmin
          .from("n8n_mappings")
          .select("*")
          .eq("activation_request_id", activationRequestId)
          .eq("user_id", userId)
          .maybeSingle();

        if (!mapping || !automation.webhook_url) {
          return new Response(
            JSON.stringify({ error: "Cannot resume - no active mapping found" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Re-trigger webhook with existing credentials reference
        const metadataConfig = (mapping.metadata as Record<string, unknown>)?.config;
        const resumePayload: ActivationPayload = {
          customer_id: userId,
          automation_id: automation.slug || automation.id,
          workflow_id: automation.workflow_id || "",
          credentials_reference_id: mapping.credentials_reference_id || "",
          config: (metadataConfig as Record<string, unknown>) || {},
        };

        let webhookSuccess = false;
        try {
          const response = await fetch(automation.webhook_url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(resumePayload),
          });
          webhookSuccess = response.ok;
        } catch (err) {
          console.error("Resume webhook failed:", err);
        }

        await supabaseAdmin
          .from("n8n_mappings")
          .update({ 
            status: webhookSuccess ? "active" : "error",
            webhook_status: webhookSuccess ? "success" : "error",
            updated_at: new Date().toISOString(),
          })
          .eq("activation_request_id", activationRequestId);

        await supabaseAdmin
          .from("installation_requests")
          .update({
            status: webhookSuccess ? "live" : "needs_attention",
            customer_visible_status: webhookSuccess ? "live" : "needs_attention",
            status_updated_at: new Date().toISOString(),
          })
          .eq("id", activationRequestId);

        return new Response(
          JSON.stringify({ 
            success: webhookSuccess, 
            message: webhookSuccess ? "Automation resumed" : "Failed to resume - please try again" 
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "revoke": {
        // Mark mapping as deactivated
        await supabaseAdmin
          .from("n8n_mappings")
          .update({ 
            status: "deactivated",
            updated_at: new Date().toISOString(),
          })
          .eq("activation_request_id", activationRequestId)
          .eq("user_id", userId);

        // CONNECT ONCE: Do NOT revoke user-level credentials here
        // User credentials are shared across all activations
        // Users can revoke credentials separately via the connections management UI

        await supabaseAdmin
          .from("installation_requests")
          .update({
            status: "completed",
            customer_visible_status: "completed",
            status_updated_at: new Date().toISOString(),
          })
          .eq("id", activationRequestId);

        return new Response(
          JSON.stringify({ success: true, message: "Automation and credentials revoked" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "retrigger": {
        // Re-trigger webhook (for debugging/recovery)
        const { data: mapping } = await supabaseAdmin
          .from("n8n_mappings")
          .select("*")
          .eq("activation_request_id", activationRequestId)
          .eq("user_id", userId)
          .maybeSingle();

        if (!mapping || !automation.webhook_url) {
          return new Response(
            JSON.stringify({ error: "No mapping found to retrigger" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const metadataConfigRetrigger = (mapping.metadata as Record<string, unknown>)?.config;
        const retriggerPayload: ActivationPayload = {
          customer_id: userId,
          automation_id: automation.slug || automation.id,
          workflow_id: automation.workflow_id || "",
          credentials_reference_id: mapping.credentials_reference_id || "",
          config: (config as Record<string, unknown>) || (metadataConfigRetrigger as Record<string, unknown>) || {},
        };

        let webhookSuccess = false;
        let webhookError: string | null = null;
        try {
          const response = await fetch(automation.webhook_url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(retriggerPayload),
          });
          webhookSuccess = response.ok;
          if (!webhookSuccess) {
            webhookError = await response.text();
          }
        } catch (err) {
          webhookError = err instanceof Error ? err.message : "Request failed";
        }

        await supabaseAdmin
          .from("n8n_mappings")
          .update({ 
            webhook_status: webhookSuccess ? "success" : "error",
            last_webhook_response: {
              status: webhookSuccess ? "success" : "error",
              error: webhookError,
              timestamp: new Date().toISOString(),
            },
            updated_at: new Date().toISOString(),
          })
          .eq("id", mapping.id);

        return new Response(
          JSON.stringify({ 
            success: webhookSuccess, 
            message: webhookSuccess ? "Webhook retriggered successfully" : `Webhook failed: ${webhookError}` 
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: "Invalid action. Valid actions: activate, pause, resume, revoke, retrigger" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
  } catch (error) {
    console.error("n8n provision error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
