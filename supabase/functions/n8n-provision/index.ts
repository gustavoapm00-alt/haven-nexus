import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * n8n Provisioning Edge Function
 * 
 * ORCHESTRATION LAYER for automation lifecycle management.
 * 
 * Actions:
 * - activate: Calls duplicate-and-activate to create per-client workflow
 * - pause: Update status to paused (n8n checks status at runtime)
 * - resume: Re-trigger the workflow via n8n_mappings.webhook_url
 * - revoke: Deactivate workflow in n8n and mark as revoked
 * - retrigger: Re-trigger webhook for debugging
 * 
 * WEBHOOK ISOLATION:
 * - Runtime webhook URLs are stored per-activation in n8n_mappings.webhook_url
 * - automation_agents.webhook_url is DEPRECATED for runtime use
 * - Format: {N8N_BASE_URL}/webhook/aerelion/{activation_request_id}
 * 
 * Templates are NEVER executed directly. Each activation creates an 
 * ISOLATED per-client workflow instance via the n8n API.
 */

// n8n API helper - normalized base URL
function getN8nBaseUrl(): string | null {
  let n8nBaseUrl = Deno.env.get("N8N_BASE_URL");
  if (!n8nBaseUrl) return null;
  
  try {
    const urlObj = new URL(n8nBaseUrl);
    return urlObj.origin;
  } catch {
    return n8nBaseUrl.replace(/\/+$/, "");
  }
}

async function n8nApiCall<T>(
  method: string,
  endpoint: string,
  body?: unknown
): Promise<{ data?: T; error?: string }> {
  const n8nBaseUrl = getN8nBaseUrl();
  const n8nApiKey = Deno.env.get("N8N_API_KEY");
  
  if (!n8nBaseUrl || !n8nApiKey) {
    return { error: "n8n API not configured" };
  }
  
  const fullUrl = `${n8nBaseUrl}/api/v1${endpoint}`;
  console.log(`n8n API call: ${method} ${fullUrl}`);
  
  try {
    const response = await fetch(fullUrl, {
      method,
      headers: {
        "Content-Type": "application/json",
        "X-N8N-API-KEY": n8nApiKey,
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      return { error: `n8n API error: ${response.status} - ${errorText}` };
    }
    
    const data = await response.json();
    return { data: data as T };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "n8n API request failed" };
  }
}

// Deactivate workflow in n8n with verification
interface DeactivationResult {
  success: boolean;
  attempted: boolean;
  verified: boolean;
  error?: string;
}

async function deactivateWorkflowInN8n(workflowId: string): Promise<DeactivationResult> {
  console.log(`Attempting to deactivate workflow ${workflowId}`);
  
  // Try POST /workflows/{id}/deactivate first (preferred)
  const deactivateResult = await n8nApiCall<{ active: boolean }>(
    "POST",
    `/workflows/${workflowId}/deactivate`
  );
  
  let attempted = true;
  let deactivationError: string | undefined;
  
  if (deactivateResult.error) {
    console.log(`/deactivate failed, trying PATCH fallback for ${workflowId}`);
    // Fallback: PATCH workflow with active: false
    const patchResult = await n8nApiCall<{ id: string; active: boolean }>(
      "PATCH",
      `/workflows/${workflowId}`,
      { active: false }
    );
    
    if (patchResult.error) {
      deactivationError = patchResult.error;
      console.error(`Both deactivation methods failed: ${deactivationError}`);
    } else {
      console.log(`Deactivated workflow ${workflowId} via PATCH`);
    }
  } else {
    console.log(`Deactivated workflow ${workflowId} via /deactivate endpoint`);
  }
  
  // CRITICAL: Verify deactivation via GET
  let verified = false;
  const verifyResult = await n8nApiCall<{ id: string; active: boolean }>(
    "GET",
    `/workflows/${workflowId}`
  );
  
  if (verifyResult.data) {
    verified = verifyResult.data.active === false;
    console.log(`Deactivation verification for ${workflowId}: active=${verifyResult.data.active}, verified=${verified}`);
  } else {
    console.warn(`Could not verify workflow state: ${verifyResult.error}`);
  }
  
  if (deactivationError) {
    return { success: false, attempted, verified, error: deactivationError };
  }
  
  return { success: true, attempted, verified };
}

interface N8nMappingRow {
  id: string;
  n8n_workflow_ids: string[] | null;
  webhook_url: string | null;
  status: string;
  credentials_reference_id: string | null;
  metadata: Record<string, unknown> | null;
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

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = user.id;
    const userEmail = user.email!;

    const { action, activationRequestId, config } = await req.json();

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get activation request - just verify it exists and belongs to user
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

    switch (action) {
      case "activate": {
        // Delegate to duplicate-and-activate edge function
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        
        console.log(`Delegating activation for ${activationRequestId} to duplicate-and-activate`);
        
        const duplicateResponse = await fetch(
          `${supabaseUrl}/functions/v1/duplicate-and-activate`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": authHeader,
            },
            body: JSON.stringify({ activationRequestId }),
          }
        );

        const duplicateResult = await duplicateResponse.json();
        
        if (!duplicateResponse.ok || !duplicateResult.success) {
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: duplicateResult.error || "Activation failed",
            }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        return new Response(
          JSON.stringify({ 
            success: true, 
            workflowId: duplicateResult.workflowId,
            webhookUrl: duplicateResult.webhookUrl,
            message: duplicateResult.message || "Automation activated successfully",
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "pause": {
        // Get mapping to find workflow
        const { data: mappingData } = await supabaseAdmin
          .from("n8n_mappings")
          .select("id, n8n_workflow_ids, status")
          .eq("activation_request_id", activationRequestId)
          .eq("user_id", userId)
          .maybeSingle();

        const mapping = mappingData as N8nMappingRow | null;

        // Deactivate workflow in n8n if we have one
        if (mapping?.n8n_workflow_ids?.length) {
          const workflowId = mapping.n8n_workflow_ids[0];
          const { error: deactivateError } = await deactivateWorkflowInN8n(workflowId);
          if (deactivateError) {
            console.warn(`Failed to deactivate workflow in n8n: ${deactivateError}`);
          }
        }

        // Update mapping status
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
        // Get mapping with webhook_url
        const { data: mappingData } = await supabaseAdmin
          .from("n8n_mappings")
          .select("id, n8n_workflow_ids, webhook_url, status, metadata")
          .eq("activation_request_id", activationRequestId)
          .eq("user_id", userId)
          .maybeSingle();

        const mapping = mappingData as N8nMappingRow | null;

        if (!mapping || !mapping.n8n_workflow_ids?.length) {
          return new Response(
            JSON.stringify({ error: "Activation not provisioned yet (no workflow)" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // First, re-activate the workflow in n8n
        const workflowId = mapping.n8n_workflow_ids[0];
        const activateResult = await n8nApiCall<{ active: boolean }>(
          "POST",
          `/workflows/${workflowId}/activate`
        );

        if (activateResult.error) {
          console.error(`Failed to reactivate workflow: ${activateResult.error}`);
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: `Failed to reactivate workflow: ${activateResult.error}` 
            }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Update status
        await supabaseAdmin
          .from("n8n_mappings")
          .update({ 
            status: "active",
            updated_at: new Date().toISOString(),
          })
          .eq("id", mapping.id);

        await supabaseAdmin
          .from("installation_requests")
          .update({
            status: "live",
            customer_visible_status: "live",
            status_updated_at: new Date().toISOString(),
          })
          .eq("id", activationRequestId);

        return new Response(
          JSON.stringify({ 
            success: true, 
            message: "Automation resumed",
            webhookUrl: mapping.webhook_url,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "revoke": {
        // Get mapping
        const { data: mappingData } = await supabaseAdmin
          .from("n8n_mappings")
          .select("id, n8n_workflow_ids, webhook_url, status")
          .eq("activation_request_id", activationRequestId)
          .eq("user_id", userId)
          .maybeSingle();

        const mapping = mappingData as N8nMappingRow | null;
        
        let deactivationAttempted = false;
        let deactivationVerified = false;
        let workflowId: string | null = null;

        // Deactivate workflow in n8n if we have one
        if (mapping?.n8n_workflow_ids?.length) {
          workflowId = mapping.n8n_workflow_ids[0];
          console.log(`Revoking: deactivating workflow ${workflowId} in n8n`);
          
          const deactivateResult = await deactivateWorkflowInN8n(workflowId);
          deactivationAttempted = deactivateResult.attempted;
          deactivationVerified = deactivateResult.verified;
          
          if (!deactivateResult.success) {
            console.warn(`Failed to deactivate workflow in n8n: ${deactivateResult.error}`);
            // Continue with revocation even if n8n deactivation fails
          }
          
          console.log(`Deactivation result: attempted=${deactivationAttempted}, verified=${deactivationVerified}`);
        }

        // Mark mapping as revoked
        const revokedAt = new Date().toISOString();
        await supabaseAdmin
          .from("n8n_mappings")
          .update({ 
            status: "revoked",
            updated_at: revokedAt,
            metadata: {
              ...(mapping?.metadata || {}),
              revoked_at: revokedAt,
              revoked_by: userEmail,
              deactivation_attempted: deactivationAttempted,
              deactivation_verified: deactivationVerified,
            },
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
            status_updated_at: revokedAt,
          })
          .eq("id", activationRequestId);

        return new Response(
          JSON.stringify({ 
            success: true, 
            message: "Automation revoked and workflow deactivated",
            workflowId,
            deactivation_attempted: deactivationAttempted,
            deactivation_verified: deactivationVerified,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "retrigger": {
        // Get mapping with webhook_url from dedicated column
        const { data: mappingData } = await supabaseAdmin
          .from("n8n_mappings")
          .select("id, n8n_workflow_ids, webhook_url, status, metadata")
          .eq("activation_request_id", activationRequestId)
          .eq("user_id", userId)
          .maybeSingle();

        const mapping = mappingData as N8nMappingRow | null;

        if (!mapping) {
          return new Response(
            JSON.stringify({ error: "Activation not provisioned yet (no mapping)" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        
        // CRITICAL: Block retriggering revoked activations
        if (mapping.status === "revoked") {
          console.log(`Blocked retrigger for revoked activation: ${activationRequestId}`);
          return new Response(
            JSON.stringify({ error: "Activation revoked" }),
            { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Use webhook_url from n8n_mappings (NOT automation_agents)
        const webhookUrl = mapping.webhook_url;
        
        if (!webhookUrl) {
          return new Response(
            JSON.stringify({ error: "Activation not provisioned yet (no webhook_url). Run 'activate' first." }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Trigger the webhook
        console.log(`Retriggering webhook: POST ${webhookUrl}`);
        
        let webhookSuccess = false;
        let webhookError: string | null = null;
        
        try {
          const response = await fetch(webhookUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              activation_id: activationRequestId,
              config: config || {},
              triggered_by: "retrigger",
              timestamp: new Date().toISOString(),
            }),
          });
          webhookSuccess = response.ok;
          if (!webhookSuccess) {
            webhookError = await response.text();
          }
        } catch (err) {
          webhookError = err instanceof Error ? err.message : "Request failed";
        }

        // Update mapping with result
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
            webhookUrl,
            message: webhookSuccess ? "Webhook triggered successfully" : `Webhook failed: ${webhookError}` 
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
