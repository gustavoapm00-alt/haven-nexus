/**
 * refresh-oauth-tokens — OAuth Token Refresh Background Job
 * 
 * Stage 2 Consolidate: Addresses the missing token refresh loop identified
 * in the audit. Tokens expire silently causing workflows to fail.
 * 
 * Triggers: Can be called by a cron n8n workflow or admin action.
 * Auth: Requires X-Admin-Key header (AERELION_SERVICE_ROLE_KEY value).
 * 
 * Logic:
 * - Finds integration_connections where expires_at < now() + 2h (expiring soon)
 * - Attempts refresh via provider's refresh endpoint
 * - Re-encrypts and upserts updated tokens
 * - Logs results to edge_function_logs
 * - Skips providers without refresh_token (e.g. Notion basic)
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": Deno.env.get("SITE_URL") || "https://haven-matrix.lovable.app",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-admin-key",
};

interface ProviderRefreshConfig {
  tokenUrl: string;
  clientIdEnv: string;
  clientSecretEnv: string;
}

const REFRESH_PROVIDERS: Record<string, ProviderRefreshConfig> = {
  google: {
    tokenUrl: "https://oauth2.googleapis.com/token",
    clientIdEnv: "GOOGLE_CLIENT_ID",
    clientSecretEnv: "GOOGLE_CLIENT_SECRET",
  },
  hubspot: {
    tokenUrl: "https://api.hubapi.com/oauth/v1/token",
    clientIdEnv: "HUBSPOT_CLIENT_ID",
    clientSecretEnv: "HUBSPOT_CLIENT_SECRET",
  },
  slack: {
    tokenUrl: "https://slack.com/api/oauth.v2.access",
    clientIdEnv: "SLACK_CLIENT_ID",
    clientSecretEnv: "SLACK_CLIENT_SECRET",
  },
};

async function decryptData(
  encryptedData: string,
  iv: string,
  tag: string,
  keyBase64: string
): Promise<string> {
  const normalizedKey = keyBase64.replace(/-/g, "+").replace(/_/g, "/");
  const keyBytes = Uint8Array.from(atob(normalizedKey), (c) => c.charCodeAt(0));

  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyBytes.buffer as ArrayBuffer,
    { name: "AES-GCM" },
    false,
    ["decrypt"]
  );

  const ivBytes = Uint8Array.from(atob(iv), (c) => c.charCodeAt(0));
  const encryptedBytes = Uint8Array.from(atob(encryptedData), (c) => c.charCodeAt(0));
  const tagBytes = Uint8Array.from(atob(tag), (c) => c.charCodeAt(0));

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

async function encryptData(
  data: string,
  keyBase64: string
): Promise<{ encrypted: string; iv: string; tag: string }> {
  const normalizedKey = keyBase64.replace(/-/g, "+").replace(/_/g, "/");
  const keyBytes = Uint8Array.from(atob(normalizedKey), (c) => c.charCodeAt(0));

  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyBytes.buffer as ArrayBuffer,
    { name: "AES-GCM" },
    false,
    ["encrypt"]
  );

  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    cryptoKey,
    new TextEncoder().encode(data)
  );

  const encryptedArray = new Uint8Array(encryptedBuffer);
  const toBase64 = (arr: Uint8Array) =>
    btoa(Array.from(arr).map((b) => String.fromCharCode(b)).join(""));

  return {
    encrypted: toBase64(encryptedArray.slice(0, -16)),
    iv: toBase64(iv),
    tag: toBase64(encryptedArray.slice(-16)),
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Auth: accept both service role and explicit admin key
    const adminKey = req.headers.get("x-admin-key");
    const authHeader = req.headers.get("Authorization");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const isServiceAuth =
      authHeader === `Bearer ${serviceRoleKey}` ||
      adminKey === serviceRoleKey;

    if (!isServiceAuth) {
      return new Response(
        JSON.stringify({ error: "Unauthorized: service role required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const encryptionKey = Deno.env.get("CREDENTIAL_ENCRYPTION_KEY");
    if (!encryptionKey) {
      return new Response(
        JSON.stringify({ error: "CREDENTIAL_ENCRYPTION_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Find tokens expiring within the next 2 hours
    const twoHoursFromNow = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();
    const { data: expiringConnections, error: fetchError } = await supabase
      .from("integration_connections")
      .select("id, user_id, provider, encrypted_payload, encryption_iv, encryption_tag, expires_at")
      .eq("status", "connected")
      .not("encrypted_payload", "is", null)
      .lt("expires_at", twoHoursFromNow);

    if (fetchError) {
      console.error("Failed to fetch expiring connections:", fetchError.message);
      return new Response(
        JSON.stringify({ error: "DB query failed" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const connections = expiringConnections || [];
    console.log(`Found ${connections.length} connection(s) expiring within 2 hours`);

    const results: { id: string; provider: string; status: string; reason?: string }[] = [];

    for (const conn of connections) {
      const config = REFRESH_PROVIDERS[conn.provider];
      if (!config) {
        results.push({ id: conn.id, provider: conn.provider, status: "skipped", reason: "no_refresh_support" });
        continue;
      }

      const clientId = Deno.env.get(config.clientIdEnv);
      const clientSecret = Deno.env.get(config.clientSecretEnv);
      if (!clientId || !clientSecret) {
        results.push({ id: conn.id, provider: conn.provider, status: "skipped", reason: "provider_not_configured" });
        continue;
      }

      // Decrypt existing tokens
      let existingTokens: Record<string, unknown>;
      try {
        const decrypted = await decryptData(
          conn.encrypted_payload,
          conn.encryption_iv,
          conn.encryption_tag,
          encryptionKey
        );
        existingTokens = JSON.parse(decrypted);
      } catch (e) {
        console.error(`Failed to decrypt tokens for connection ${conn.id}`);
        results.push({ id: conn.id, provider: conn.provider, status: "error", reason: "decrypt_failed" });
        continue;
      }

      const refreshToken = existingTokens.refresh_token as string | undefined;
      if (!refreshToken) {
        results.push({ id: conn.id, provider: conn.provider, status: "skipped", reason: "no_refresh_token" });
        continue;
      }

      // Attempt token refresh
      let tokenResponse: Response;
      try {
        const params = new URLSearchParams({
          grant_type: "refresh_token",
          refresh_token: refreshToken,
          client_id: clientId,
          client_secret: clientSecret,
        });

        tokenResponse = await fetch(config.tokenUrl, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: params.toString(),
        });
      } catch (e) {
        console.error(`Network error refreshing token for ${conn.provider}`);
        results.push({ id: conn.id, provider: conn.provider, status: "error", reason: "network_error" });
        continue;
      }

      if (!tokenResponse.ok) {
        console.error(`Token refresh failed for ${conn.provider}: ${tokenResponse.status}`);
        // Mark connection as needing re-auth
        await supabase
          .from("integration_connections")
          .update({ status: "expired", updated_at: new Date().toISOString() })
          .eq("id", conn.id);
        results.push({ id: conn.id, provider: conn.provider, status: "expired", reason: `http_${tokenResponse.status}` });
        continue;
      }

      const newTokens = await tokenResponse.json();

      // Merge: keep existing refresh_token if provider didn't return a new one
      const mergedTokens = {
        ...existingTokens,
        access_token: newTokens.access_token || existingTokens.access_token,
        refresh_token: newTokens.refresh_token || refreshToken,
        expires_in: newTokens.expires_in,
        token_type: newTokens.token_type || existingTokens.token_type,
      };

      // Re-encrypt and update
      const { encrypted, iv, tag } = await encryptData(
        JSON.stringify(mergedTokens),
        encryptionKey
      );

      const newExpiresAt = newTokens.expires_in
        ? new Date(Date.now() + newTokens.expires_in * 1000).toISOString()
        : null;

      await supabase
        .from("integration_connections")
        .update({
          encrypted_payload: encrypted,
          encryption_iv: iv,
          encryption_tag: tag,
          expires_at: newExpiresAt,
          status: "connected",
          updated_at: new Date().toISOString(),
        })
        .eq("id", conn.id);

      results.push({ id: conn.id, provider: conn.provider, status: "refreshed" });
      console.log(`Refreshed token for connection ${conn.id} (${conn.provider})`);
    }

    // Log summary to edge_function_logs
    const refreshed = results.filter((r) => r.status === "refreshed").length;
    const expired = results.filter((r) => r.status === "expired").length;
    const errors = results.filter((r) => r.status === "error").length;

    await supabase.from("edge_function_logs").insert({
      function_name: "refresh-oauth-tokens",
      level: errors > 0 || expired > 0 ? "warn" : "info",
      message: `TOKEN_REFRESH_CYCLE: ${refreshed} refreshed, ${expired} expired, ${errors} errors`,
      details: { total: connections.length, refreshed, expired, errors, results },
      status_code: 200,
    });

    return new Response(
      JSON.stringify({ summary: { total: connections.length, refreshed, expired, errors }, results }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("refresh-oauth-tokens error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
