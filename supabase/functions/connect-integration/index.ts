import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

/**
 * Integration Connection Manager
 * 
 * CONNECT ONCE. RUN MANY.
 * 
 * Credentials are stored at the USER LEVEL, not per-activation.
 * This allows users to connect HubSpot once and use it across all automations.
 * 
 * Schema: integration_connections
 * - user_id: Owner of the credential
 * - provider: hubspot, gmail, etc.
 * - encrypted_payload: AES-256-GCM encrypted credentials
 * - activation_request_id: NULL (user-level connections, not activation-specific)
 * 
 * Auto-Activation:
 * When all required integrations for an activation are connected,
 * automatically triggers the provisioning webhook.
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Encryption utilities using Web Crypto API
async function encryptData(data: string, key: string): Promise<{ encrypted: string; iv: string; tag: string }> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  
  // Decode base64 key
  const keyBytes = Uint8Array.from(atob(key), c => c.charCodeAt(0));
  
  // Generate IV
  const iv = crypto.getRandomValues(new Uint8Array(12));
  
  // Import key
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyBytes,
    { name: "AES-GCM" },
    false,
    ["encrypt"]
  );
  
  // Encrypt
  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    cryptoKey,
    dataBuffer
  );
  
  // Extract ciphertext and auth tag (last 16 bytes)
  const encryptedArray = new Uint8Array(encryptedBuffer);
  const ciphertext = encryptedArray.slice(0, -16);
  const tag = encryptedArray.slice(-16);
  
  return {
    encrypted: btoa(String.fromCharCode(...ciphertext)),
    iv: btoa(String.fromCharCode(...iv)),
    tag: btoa(String.fromCharCode(...tag)),
  };
}

// Types for Supabase data
interface Activation {
  automation_id: string | null;
  status: string | null;
}

interface Automation {
  id: string;
  slug: string;
  systems: string[] | null;
  required_integrations: { provider?: string }[] | null;
  webhook_url: string | null;
}

interface UserConnection {
  id: string;
  provider: string;
  status: string;
  connected_email: string | null;
  granted_scopes: string[] | null;
}

// Helper to check if all required integrations are connected and trigger auto-activation
async function checkAndAutoActivate(
  supabaseAdmin: any,
  userId: string,
  userEmail: string,
  activationRequestId: string
): Promise<{ triggered: boolean; error?: string }> {
  // Get activation and its automation
  const { data: activation } = await supabaseAdmin
    .from("installation_requests")
    .select("automation_id, status")
    .eq("id", activationRequestId)
    .eq("email", userEmail)
    .maybeSingle() as { data: Activation | null };

  if (!activation?.automation_id) {
    return { triggered: false, error: "Activation not found" };
  }

  // Don't auto-activate if already live or in_build
  if (["live", "active", "in_build"].includes(activation.status || "")) {
    return { triggered: false };
  }

  // Get automation details
  const { data: automation } = await supabaseAdmin
    .from("automation_agents")
    .select("id, slug, systems, required_integrations, webhook_url")
    .eq("id", activation.automation_id)
    .maybeSingle() as { data: Automation | null };

  if (!automation) {
    return { triggered: false, error: "Automation not found" };
  }

  // Determine required providers
  let requiredProviders: string[] = [];
  if (automation.required_integrations && Array.isArray(automation.required_integrations)) {
    requiredProviders = automation.required_integrations
      .map((ri) => (ri.provider || '').toLowerCase())
      .filter(Boolean);
  } else if (automation.systems) {
    requiredProviders = automation.systems.map((s: string) => s.toLowerCase());
  }

  // Get user's connected integrations (user-level)
  const { data: userConnections } = await supabaseAdmin
    .from("integration_connections")
    .select("provider")
    .eq("user_id", userId)
    .eq("status", "connected") as { data: { provider: string }[] | null };

  const connectedProviders = new Set(
    (userConnections || []).map(c => c.provider.toLowerCase())
  );

  const allConnected = requiredProviders.length > 0 && 
    requiredProviders.every(p => connectedProviders.has(p));

  if (!allConnected) {
    return { triggered: false };
  }

  // All required integrations connected - auto-activate!
  console.log(`Auto-activating: All required integrations connected for activation ${activationRequestId}`);

  // Update activation status
  await supabaseAdmin
    .from("installation_requests")
    .update({
      status: "in_build",
      customer_visible_status: "in_build",
      credentials_submitted_at: new Date().toISOString(),
      status_updated_at: new Date().toISOString(),
    })
    .eq("id", activationRequestId);

  // Check if webhook_url is configured
  if (!automation.webhook_url) {
    console.log(`No webhook_url configured for automation ${automation.id}, skipping auto-trigger`);
    return { triggered: false };
  }

  // Trigger the provisioning webhook
  const activationPayload = {
    activation_id: activationRequestId,
    automation_slug: automation.slug,
    config: {},
  };

  try {
    console.log(`Triggering auto-activation webhook: ${automation.webhook_url}`);
    const response = await fetch(automation.webhook_url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(activationPayload),
    });

    const webhookSuccess = response.ok;

    // Create or update n8n mapping
    const credentialsReferenceId = `cred_bundle_${activationRequestId}`;
    const { data: existingMapping } = await supabaseAdmin
      .from("n8n_mappings")
      .select("id")
      .eq("activation_request_id", activationRequestId)
      .eq("user_id", userId)
      .maybeSingle() as { data: { id: string } | null };

    const mappingData = {
      user_id: userId,
      activation_request_id: activationRequestId,
      automation_id: automation.id,
      status: webhookSuccess ? "active" : "error",
      credentials_reference_id: credentialsReferenceId,
      webhook_status: webhookSuccess ? "success" : "error",
      provisioned_at: webhookSuccess ? new Date().toISOString() : null,
      metadata: { auto_activated: true, customer_email: userEmail },
      updated_at: new Date().toISOString(),
    };

    if (existingMapping) {
      await supabaseAdmin
        .from("n8n_mappings")
        .update(mappingData)
        .eq("id", existingMapping.id);
    } else {
      await supabaseAdmin
        .from("n8n_mappings")
        .insert(mappingData);
    }

    // Update activation status based on webhook result
    await supabaseAdmin
      .from("installation_requests")
      .update({
        status: webhookSuccess ? "live" : "needs_attention",
        customer_visible_status: webhookSuccess ? "live" : "needs_attention",
        status_updated_at: new Date().toISOString(),
      })
      .eq("id", activationRequestId);

    if (webhookSuccess) {
      // Create success notification
      await supabaseAdmin
        .from("client_notifications")
        .insert({
          user_id: userId,
          type: "automation_activated",
          title: "Automation Activated!",
          body: "All required integrations connected. Your automation is now live.",
          severity: "success",
          metadata: { activation_request_id: activationRequestId },
        });
    }

    return { triggered: true };
  } catch (err) {
    console.error("Auto-activation webhook failed:", err);
    return { triggered: false, error: err instanceof Error ? err.message : "Webhook failed" };
  }
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

    const userId = claimsData.claims.sub;
    const userEmail = claimsData.claims.email as string;

    const { 
      action, 
      activationRequestId,  // Optional - for checking required integrations
      provider, 
      credentials, 
      grantedScopes,
      connectedEmail,
    } = await req.json();

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    switch (action) {
      case "connect": {
        // Encrypt credentials
        const encryptionKey = Deno.env.get("CREDENTIAL_ENCRYPTION_KEY");
        if (!encryptionKey) {
          console.error("CREDENTIAL_ENCRYPTION_KEY not configured");
          return new Response(
            JSON.stringify({ error: "Server configuration error" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const { encrypted, iv, tag } = await encryptData(
          JSON.stringify(credentials),
          encryptionKey
        );

        // CONNECT ONCE: Upsert by user_id + provider only (no activation_request_id)
        // Check for existing connection for this user + provider
        const { data: existingConnection } = await supabaseAdmin
          .from("integration_connections")
          .select("id")
          .eq("user_id", userId)
          .eq("provider", provider)
          .not("status", "in", "(archived,revoked)")
          .maybeSingle();

        if (existingConnection) {
          // Update existing connection
          const { error: updateError } = await supabaseAdmin
            .from("integration_connections")
            .update({
              status: "connected",
              encrypted_payload: encrypted,
              encryption_iv: iv,
              encryption_tag: tag,
              granted_scopes: grantedScopes || [],
              connected_email: connectedEmail || null,
              activation_request_id: null, // User-level, not activation-specific
              updated_at: new Date().toISOString(),
            })
            .eq("id", existingConnection.id);

          if (updateError) {
            console.error("Failed to update connection:", updateError);
            return new Response(
              JSON.stringify({ error: "Failed to update connection" }),
              { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
        } else {
          // Insert new connection (user-level, no activation binding)
          const { error: insertError } = await supabaseAdmin
            .from("integration_connections")
            .insert({
              user_id: userId,
              activation_request_id: null,  // CONNECT ONCE: No activation binding
              provider,
              status: "connected",
              encrypted_payload: encrypted,
              encryption_iv: iv,
              encryption_tag: tag,
              granted_scopes: grantedScopes || [],
              connected_email: connectedEmail || null,
            });

          if (insertError) {
            console.error("Failed to save connection:", insertError);
            return new Response(
              JSON.stringify({ error: "Failed to save connection" }),
              { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
        }

        // If activation request provided, check if auto-activation should happen
        let autoActivated = false;
        if (activationRequestId) {
          const result = await checkAndAutoActivate(
            supabaseAdmin,
            userId as string,
            userEmail,
            activationRequestId
          );
          autoActivated = result.triggered;
        }

        // Create admin notification
        await supabaseAdmin
          .from("admin_notifications")
          .insert({
            type: "integration_connected",
            title: `Integration Connected: ${provider}`,
            body: `User ${userEmail} connected ${provider} (account-level credential)`,
            severity: "info",
            metadata: {
              user_id: userId,
              provider,
              customer_email: userEmail,
              activation_request_id: activationRequestId || null,
              auto_activated: autoActivated,
            },
          });

        return new Response(
          JSON.stringify({ 
            success: true, 
            autoActivated,
            message: autoActivated 
              ? `${provider} connected and automation activated!`
              : `${provider} connected successfully` 
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "revoke": {
        // Revoke user's connection for this provider (user-level revocation)
        await supabaseAdmin
          .from("integration_connections")
          .update({
            status: "revoked",
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", userId)
          .eq("provider", provider);

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "status": {
        // Get all user's connections (account-level)
        const { data: connections } = await supabaseAdmin
          .from("integration_connections")
          .select("provider, status, connected_email, granted_scopes, created_at, updated_at")
          .eq("user_id", userId)
          .not("status", "in", "(revoked,archived)");

        return new Response(
          JSON.stringify({ connections: connections || [] }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "check_ready": {
        // Check if all required integrations for an activation are connected
        if (!activationRequestId) {
          return new Response(
            JSON.stringify({ error: "activationRequestId required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Get activation and verify ownership
        const { data: activation } = await supabaseAdmin
          .from("installation_requests")
          .select("automation_id, status")
          .eq("id", activationRequestId)
          .eq("email", userEmail)
          .maybeSingle();

        if (!activation?.automation_id) {
          return new Response(
            JSON.stringify({ error: "Activation not found" }),
            { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Get required integrations
        const { data: automation } = await supabaseAdmin
          .from("automation_agents")
          .select("systems, required_integrations")
          .eq("id", activation.automation_id)
          .maybeSingle();

        let requiredProviders: string[] = [];
        if (automation?.required_integrations && Array.isArray(automation.required_integrations)) {
          requiredProviders = automation.required_integrations
            .map((ri: { provider?: string }) => (ri.provider || '').toLowerCase())
            .filter(Boolean);
        } else if (automation?.systems) {
          requiredProviders = automation.systems.map((s: string) => s.toLowerCase());
        }

        // Get user's connected integrations (user-level)
        const { data: userConnections } = await supabaseAdmin
          .from("integration_connections")
          .select("provider, status, connected_email")
          .eq("user_id", userId)
          .eq("status", "connected");

        const connectedProviders = new Set(
          (userConnections || []).map(c => c.provider.toLowerCase())
        );

        const missing = requiredProviders.filter(p => !connectedProviders.has(p));
        const allConnected = missing.length === 0 && requiredProviders.length > 0;

        return new Response(
          JSON.stringify({
            allConnected,
            required: requiredProviders,
            connected: Array.from(connectedProviders),
            missing,
            connections: userConnections || [],
            activationStatus: activation.status,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: "Invalid action" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
  } catch (error) {
    console.error("Connect integration error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
