import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

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
      activationRequestId, 
      provider, 
      credentials, 
      grantedScopes,
      connectedEmail,
    } = await req.json();

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Verify user owns this activation request
    const { data: activation, error: activationError } = await supabaseAdmin
      .from("installation_requests")
      .select("id, email, automation_id, bundle_id")
      .eq("id", activationRequestId)
      .eq("email", userEmail)
      .maybeSingle();

    if (activationError || !activation) {
      return new Response(
        JSON.stringify({ error: "Activation request not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

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

        // Upsert integration connection
        const { data: connection, error: upsertError } = await supabaseAdmin
          .from("integration_connections")
          .upsert(
            {
              user_id: userId,
              activation_request_id: activationRequestId,
              provider,
              status: "connected",
              encrypted_payload: encrypted,
              encryption_iv: iv,
              encryption_tag: tag,
              granted_scopes: grantedScopes || [],
              connected_email: connectedEmail || null,
              updated_at: new Date().toISOString(),
            },
            {
              onConflict: "user_id,activation_request_id,provider",
            }
          )
          .select()
          .single();

        if (upsertError) {
          // If onConflict fails, try insert without it
          const { error: insertError } = await supabaseAdmin
            .from("integration_connections")
            .insert({
              user_id: userId,
              activation_request_id: activationRequestId,
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

        // Check if all required integrations are now connected
        const { data: automation } = await supabaseAdmin
          .from("automation_agents")
          .select("systems")
          .eq("id", activation.automation_id)
          .maybeSingle();

        const requiredSystems = automation?.systems || [];
        
        const { data: connections } = await supabaseAdmin
          .from("integration_connections")
          .select("provider")
          .eq("activation_request_id", activationRequestId)
          .eq("status", "connected");

        const connectedProviders = new Set((connections || []).map(c => c.provider.toLowerCase()));
        const allConnected = requiredSystems.every((s: string) => 
          connectedProviders.has(s.toLowerCase())
        );

        if (allConnected && requiredSystems.length > 0) {
          // Update activation status to in_build (ready for provisioning)
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

        // Create admin notification
        await supabaseAdmin
          .from("admin_notifications")
          .insert({
            type: "integration_connected",
            title: `Integration Connected: ${provider}`,
            body: `Customer connected ${provider} for activation ${activationRequestId}`,
            severity: "info",
            metadata: {
              activation_request_id: activationRequestId,
              provider,
              customer_email: userEmail,
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
        // Mark connection as revoked
        await supabaseAdmin
          .from("integration_connections")
          .update({
            status: "revoked",
            updated_at: new Date().toISOString(),
          })
          .eq("activation_request_id", activationRequestId)
          .eq("provider", provider)
          .eq("user_id", userId);

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "status": {
        // Get connection status
        const { data: connections } = await supabaseAdmin
          .from("integration_connections")
          .select("provider, status, connected_email, granted_scopes, created_at, updated_at")
          .eq("activation_request_id", activationRequestId)
          .eq("user_id", userId);

        return new Response(
          JSON.stringify({ connections: connections || [] }),
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
