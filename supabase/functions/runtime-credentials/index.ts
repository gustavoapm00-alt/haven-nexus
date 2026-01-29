import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

/**
 * Runtime Credentials Endpoint
 * 
 * Called by n8n at execution time to resolve tenant credentials.
 * This enables TRUE multi-tenancy: one workflow template → unlimited customers.
 * 
 * Security:
 * - Authenticated via N8N_API_KEY bearer token (server-to-server only)
 * - Credentials decrypted server-side, never exposed to client
 * - Validates activation exists and is active
 * 
 * Request:
 *   GET /functions/v1/runtime-credentials?activation_id=UUID
 *   Authorization: Bearer <N8N_API_KEY>
 * 
 * Response:
 * {
 *   "activation_id": "uuid",
 *   "automation_slug": "client-onboarding-pack",
 *   "tenant_id": "user-uuid",
 *   "status": "active",
 *   "credentials": {
 *     "hubspot": { "access_token": "...", "refresh_token": "..." },
 *     "gmail": { "access_token": "..." }
 *   },
 *   "config": { ... }
 * }
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// AES-256-GCM decryption using Web Crypto API
async function decryptCredentials(
  encryptedData: string,
  iv: string,
  tag: string,
  keyBase64: string
): Promise<string> {
  const keyBytes = Uint8Array.from(atob(keyBase64), (c) => c.charCodeAt(0));
  
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyBytes,
    { name: "AES-GCM", length: 256 },
    false,
    ["decrypt"]
  );
  
  const ivBytes = Uint8Array.from(atob(iv), (c) => c.charCodeAt(0));
  const encryptedBytes = Uint8Array.from(atob(encryptedData), (c) => c.charCodeAt(0));
  const tagBytes = Uint8Array.from(atob(tag), (c) => c.charCodeAt(0));
  
  // Combine ciphertext and tag (Web Crypto expects them together)
  const ciphertextWithTag = new Uint8Array(encryptedBytes.length + tagBytes.length);
  ciphertextWithTag.set(encryptedBytes);
  ciphertextWithTag.set(tagBytes, encryptedBytes.length);
  
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: ivBytes, tagLength: 128 },
    cryptoKey,
    ciphertextWithTag
  );
  
  return new TextDecoder().decode(decrypted);
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // SECURITY: Authenticate via N8N_API_KEY (server-to-server only)
    const authHeader = req.headers.get("Authorization");
    const n8nApiKey = Deno.env.get("N8N_API_KEY");
    
    if (!n8nApiKey) {
      console.error("N8N_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Missing authorization" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const providedKey = authHeader.replace("Bearer ", "");
    
    // Constant-time comparison
    if (providedKey.length !== n8nApiKey.length) {
      return new Response(
        JSON.stringify({ error: "Invalid authorization" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    let mismatch = 0;
    for (let i = 0; i < n8nApiKey.length; i++) {
      mismatch |= n8nApiKey.charCodeAt(i) ^ providedKey.charCodeAt(i);
    }
    
    if (mismatch !== 0) {
      return new Response(
        JSON.stringify({ error: "Invalid authorization" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse activation_id from query params
    const url = new URL(req.url);
    const activationId = url.searchParams.get("activation_id");
    
    if (!activationId) {
      return new Response(
        JSON.stringify({ error: "activation_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const encryptionKey = Deno.env.get("CREDENTIAL_ENCRYPTION_KEY");
    if (!encryptionKey) {
      console.error("CREDENTIAL_ENCRYPTION_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch activation request
    const { data: activation, error: activationError } = await supabase
      .from("installation_requests")
      .select("id, email, status, automation_id, bundle_id")
      .eq("id", activationId)
      .maybeSingle();

    if (activationError || !activation) {
      console.error("Activation not found:", activationId);
      return new Response(
        JSON.stringify({ error: "Activation not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify activation is in a valid state
    const validStatuses = ["live", "active", "in_build", "testing"];
    if (!validStatuses.includes(activation.status || "")) {
      console.warn(`Activation ${activationId} status is ${activation.status}, denying credentials`);
      return new Response(
        JSON.stringify({ 
          error: "Activation not active",
          status: activation.status,
        }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch automation details for slug
    let automationSlug = "";
    if (activation.automation_id) {
      const { data: automation } = await supabase
        .from("automation_agents")
        .select("slug")
        .eq("id", activation.automation_id)
        .maybeSingle();
      automationSlug = automation?.slug || "";
    }

    // Fetch n8n mapping for config
    const { data: mapping } = await supabase
      .from("n8n_mappings")
      .select("metadata")
      .eq("activation_request_id", activationId)
      .maybeSingle();

    const config = (mapping?.metadata as Record<string, unknown>)?.config || {};

    // Fetch all connected integration connections for this activation
    const { data: connections, error: connError } = await supabase
      .from("integration_connections")
      .select("id, provider, encrypted_payload, encryption_iv, encryption_tag, status")
      .eq("activation_request_id", activationId)
      .eq("status", "connected");

    if (connError) {
      console.error("Failed to fetch connections:", connError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch credentials" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Decrypt each connection's credentials
    const credentials: Record<string, unknown> = {};
    
    for (const conn of connections || []) {
      if (conn.encrypted_payload && conn.encryption_iv && conn.encryption_tag) {
        try {
          const decryptedJson = await decryptCredentials(
            conn.encrypted_payload,
            conn.encryption_iv,
            conn.encryption_tag,
            encryptionKey
          );
          credentials[conn.provider] = JSON.parse(decryptedJson);
        } catch (decryptError) {
          console.error(`Failed to decrypt credentials for ${conn.provider}:`, decryptError);
          credentials[conn.provider] = { error: "decryption_failed" };
        }
      }
    }

    // Log access for audit trail
    console.log(`Runtime credentials accessed for activation ${activationId}`);

    return new Response(
      JSON.stringify({
        activation_id: activationId,
        automation_slug: automationSlug,
        tenant_email: activation.email,
        status: activation.status,
        credentials,
        config,
      }),
      { 
        status: 200, 
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json",
          "Cache-Control": "no-store, no-cache, must-revalidate",
        } 
      }
    );

  } catch (error) {
    console.error("Error in runtime-credentials:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
