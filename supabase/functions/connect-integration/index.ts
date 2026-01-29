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
 * - activation_request_id: NULL (legacy) or optionally set for tracking
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

        // If activation request provided, check if all required integrations are now connected
        let allConnected = false;
        if (activationRequestId) {
          // Get activation and its automation
          const { data: activation } = await supabaseAdmin
            .from("installation_requests")
            .select("automation_id")
            .eq("id", activationRequestId)
            .eq("email", userEmail)
            .maybeSingle();

          if (activation?.automation_id) {
            // Get required integrations from automation
            const { data: automation } = await supabaseAdmin
              .from("automation_agents")
              .select("systems, required_integrations")
              .eq("id", activation.automation_id)
              .maybeSingle();

            // Determine required providers
            let requiredProviders: string[] = [];
            if (automation?.required_integrations && Array.isArray(automation.required_integrations)) {
              requiredProviders = automation.required_integrations.map((ri: { provider?: string }) => 
                (ri.provider || '').toLowerCase()
              ).filter(Boolean);
            } else if (automation?.systems) {
              requiredProviders = automation.systems.map((s: string) => s.toLowerCase());
            }

            // Get user's connected integrations (user-level)
            const { data: userConnections } = await supabaseAdmin
              .from("integration_connections")
              .select("provider")
              .eq("user_id", userId)
              .eq("status", "connected");

            const connectedProviders = new Set(
              (userConnections || []).map(c => c.provider.toLowerCase())
            );

            allConnected = requiredProviders.length > 0 && 
              requiredProviders.every(p => connectedProviders.has(p));

            if (allConnected) {
              // Update activation status to ready for provisioning
              await supabaseAdmin
                .from("installation_requests")
                .update({
                  status: "in_build",
                  customer_visible_status: "in_build",
                  credentials_submitted_at: new Date().toISOString(),
                  status_updated_at: new Date().toISOString(),
                })
                .eq("id", activationRequestId);
            }
          }
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
            },
          });

        return new Response(
          JSON.stringify({ 
            success: true, 
            allConnected,
            message: `${provider} connected successfully` 
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "revoke": {
        // Revoke user's connection for this provider
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
          .neq("status", "revoked");

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
          .select("automation_id")
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
          requiredProviders = automation.required_integrations.map((ri: { provider?: string }) => 
            (ri.provider || '').toLowerCase()
          ).filter(Boolean);
        } else if (automation?.systems) {
          requiredProviders = automation.systems.map((s: string) => s.toLowerCase());
        }

        // Get user's connected integrations
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
