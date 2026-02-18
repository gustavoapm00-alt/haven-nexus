import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

/**
 * Runtime Credentials Endpoint
 *
 * CONNECT ONCE. RUN MANY.
 *
 * Called by n8n at execution time to resolve tenant credentials.
 * Authenticates via N8N_API_KEY bearer token (server-to-server only).
 * Resolves user via direct user_id lookup — no email-based fallback.
 *
 * Request:
 *   GET /functions/v1/runtime-credentials?activation_id=UUID
 *   Authorization: Bearer <N8N_API_KEY>
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // n8n server-side — no browser origin needed
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// AES-256-GCM decryption
async function decryptCredentials(
  encryptedData: string,
  iv: string,
  tag: string,
  keyBase64: string
): Promise<string> {
  const keyBytes = Uint8Array.from(atob(keyBase64), (c) => c.charCodeAt(0));
  const cryptoKey = await crypto.subtle.importKey(
    "raw", keyBytes, { name: "AES-GCM", length: 256 }, false, ["decrypt"]
  );
  const ivBytes = Uint8Array.from(atob(iv), (c) => c.charCodeAt(0));
  const encryptedBytes = Uint8Array.from(atob(encryptedData), (c) => c.charCodeAt(0));
  const tagBytes = Uint8Array.from(atob(tag), (c) => c.charCodeAt(0));
  const ciphertextWithTag = new Uint8Array(encryptedBytes.length + tagBytes.length);
  ciphertextWithTag.set(encryptedBytes);
  ciphertextWithTag.set(tagBytes, encryptedBytes.length);
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: ivBytes, tagLength: 128 }, cryptoKey, ciphertextWithTag
  );
  return new TextDecoder().decode(decrypted);
}

// Constant-time comparison (fixed-length safe)
function safeEqual(a: string, b: string): boolean {
  const encoder = new TextEncoder();
  const aBytes = encoder.encode(a);
  const bBytes = encoder.encode(b);
  if (aBytes.length !== bBytes.length) {
    // Compare anyway to prevent timing leak on length difference
    let dummy = 0;
    for (let i = 0; i < Math.max(aBytes.length, bBytes.length); i++) {
      dummy |= (aBytes[i] ?? 0) ^ (bBytes[i] ?? 0);
    }
    return false;
  }
  let mismatch = 0;
  for (let i = 0; i < aBytes.length; i++) {
    mismatch |= aBytes[i] ^ bBytes[i];
  }
  return mismatch === 0;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    // ── Auth: N8N_API_KEY bearer token ─────────────────────────────────
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
    if (!safeEqual(providedKey, n8nApiKey)) {
      return new Response(
        JSON.stringify({ error: "Invalid authorization" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Parse activation_id ────────────────────────────────────────────
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

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // ── Step 1: Fetch activation ───────────────────────────────────────
    const { data: activation, error: activationError } = await supabase
      .from("installation_requests")
      .select("id, email, status, automation_id, bundle_id, user_id")
      .eq("id", activationId)
      .maybeSingle();

    if (activationError || !activation) {
      console.error("Activation not found:", activationId);
      return new Response(
        JSON.stringify({ error: "Activation not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const validStatuses = ["live", "active", "in_build", "testing"];
    if (!validStatuses.includes(activation.status || "")) {
      return new Response(
        JSON.stringify({ error: "Activation not active", status: activation.status }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Step 2: Resolve user_id — direct lookup only, NO email fallback ─
    // Email-based user resolution bypasses proper isolation and is removed.
    // All installation_requests must have user_id populated at creation time.
    const userId = activation.user_id;

    if (!userId) {
      console.error(`No user_id on activation ${activationId}. Email fallback removed for security.`);
      return new Response(
        JSON.stringify({ error: "User not associated with activation. Contact support." }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Step 3: Automation details + required integrations ────────────
    let automationSlug = "";
    let requiredProviders: string[] = [];

    if (activation.automation_id) {
      const { data: automation } = await supabase
        .from("automation_agents")
        .select("slug, systems, required_integrations")
        .eq("id", activation.automation_id)
        .maybeSingle();

      automationSlug = automation?.slug || "";
      if (automation?.required_integrations && Array.isArray(automation.required_integrations)) {
        requiredProviders = automation.required_integrations
          .map((ri: { provider?: string }) => (ri.provider || "").toLowerCase())
          .filter(Boolean);
      } else if (automation?.systems) {
        requiredProviders = automation.systems.map((s: string) => s.toLowerCase());
      }
    }

    // ── Step 4: n8n mapping config ─────────────────────────────────────
    const { data: mapping } = await supabase
      .from("n8n_mappings")
      .select("metadata")
      .eq("activation_request_id", activationId)
      .maybeSingle();

    const config = (mapping?.metadata as Record<string, unknown>)?.config || {};

    // ── Step 5: Fetch user's connected integrations ────────────────────
    const { data: connections, error: connError } = await supabase
      .from("integration_connections")
      .select("id, provider, encrypted_payload, encryption_iv, encryption_tag, status")
      .eq("user_id", userId)
      .eq("status", "connected");

    if (connError) {
      console.error("Failed to fetch connections:", connError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch credentials" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Step 6: Decrypt credentials for required providers only ────────
    const credentials: Record<string, unknown> = {};
    for (const conn of connections || []) {
      const providerLower = conn.provider.toLowerCase();
      if (requiredProviders.length === 0 || requiredProviders.includes(providerLower)) {
        if (conn.encrypted_payload && conn.encryption_iv && conn.encryption_tag) {
          try {
            const decryptedJson = await decryptCredentials(
              conn.encrypted_payload, conn.encryption_iv, conn.encryption_tag, encryptionKey
            );
            credentials[conn.provider] = JSON.parse(decryptedJson);
          } catch (decryptError) {
            console.error(`Failed to decrypt credentials for ${conn.provider}`);
            credentials[conn.provider] = { error: "decryption_failed" };
          }
        }
      }
    }

    console.log(`Runtime credentials accessed: activation=${activationId} user=${userId} providers=[${Object.keys(credentials).join(",")}]`);

    return new Response(
      JSON.stringify({
        activation_id: activationId,
        automation_slug: automationSlug,
        tenant_id: userId,
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
        },
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
