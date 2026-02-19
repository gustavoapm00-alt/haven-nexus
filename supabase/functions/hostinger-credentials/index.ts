import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";
import { buildCorsHeaders } from "../_shared/rate-limiter.ts";

async function decryptPayload(encBase64: string, ivBase64: string, tagBase64: string, keyBase64: string): Promise<string> {
  const raw = Uint8Array.from(atob(keyBase64), c => c.charCodeAt(0));
  const key = await crypto.subtle.importKey("raw", raw.buffer.slice(0, 32), { name: "AES-GCM" }, false, ["decrypt"]);
  const iv = Uint8Array.from(atob(ivBase64), c => c.charCodeAt(0));
  const tag = Uint8Array.from(atob(tagBase64), c => c.charCodeAt(0));
  const cipher = Uint8Array.from(atob(encBase64), c => c.charCodeAt(0));
  // Re-assemble ciphertext+tag as Web Crypto expects them concatenated
  const combined = new Uint8Array(cipher.length + tag.length);
  combined.set(cipher);
  combined.set(tag, cipher.length);
  const plainBuf = await crypto.subtle.decrypt({ name: "AES-GCM", iv, tagLength: 128 }, key, combined.buffer);
  return new TextDecoder().decode(plainBuf);
}

serve(async (req) => {
  const corsHeaders = buildCorsHeaders(req);
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    // ── Auth ──────────────────────────────────────────────────────────────────
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("UNAUTHORIZED");
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
    if (authErr || !user) throw new Error("UNAUTHORIZED");

    const { instance_id } = await req.json();
    if (!instance_id) throw new Error("MISSING_INSTANCE_ID");

    // ── Fetch and ownership-gate instance ─────────────────────────────────────
    const { data: instance, error: fetchErr } = await supabase
      .from("vps_instances" as any)
      .select("*")
      .eq("id", instance_id)
      .single();

    if (fetchErr || !instance) throw new Error("INSTANCE_NOT_FOUND");

    const { data: roleRow } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    const isAdmin = !!roleRow;
    if (!isAdmin && (instance as any).user_id !== user.id) {
      throw new Error("ACCESS_DENIED");
    }

    const ENCRYPTION_KEY = Deno.env.get("CREDENTIAL_ENCRYPTION_KEY");
    if (!ENCRYPTION_KEY) throw new Error("ENCRYPTION_KEY_NOT_CONFIGURED");

    // ── Decrypt SSH credentials ───────────────────────────────────────────────
    const inst = instance as any;
    let sshCreds: { private_key: string; public_key: string } | null = null;
    let n8nCreds: { url: string; username: string; password: string } | null = null;

    if (inst.encrypted_ssh_private_key && inst.ssh_encryption_iv && inst.ssh_encryption_tag) {
      const decrypted = await decryptPayload(
        inst.encrypted_ssh_private_key,
        inst.ssh_encryption_iv,
        inst.ssh_encryption_tag,
        ENCRYPTION_KEY
      );
      sshCreds = JSON.parse(decrypted);
    }

    if (inst.encrypted_n8n_credentials && inst.n8n_encryption_iv && inst.n8n_encryption_tag) {
      const decrypted = await decryptPayload(
        inst.encrypted_n8n_credentials,
        inst.n8n_encryption_iv,
        inst.n8n_encryption_tag,
        ENCRYPTION_KEY
      );
      n8nCreds = JSON.parse(decrypted);
    }

    // ── Mark as viewed (one-time gate for UI) ─────────────────────────────────
    if (!inst.credentials_viewed_at) {
      await supabase
        .from("vps_instances" as any)
        .update({ credentials_viewed_at: new Date().toISOString() })
        .eq("id", instance_id);
    }

    // ── Log access ────────────────────────────────────────────────────────────
    await supabase.from("edge_function_logs").insert({
      function_name: "hostinger-credentials",
      level: "info",
      message: `CREDENTIAL_READ // instance=${instance_id} first_view=${!inst.credentials_viewed_at}`,
      user_id: user.id,
    });

    return new Response(JSON.stringify({
      success: true,
      first_view: !inst.credentials_viewed_at,
      instance_id,
      ip_address: inst.ip_address,
      hostname: inst.hostname,
      ssh: sshCreds,
      n8n: n8nCreds,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const status = msg === "UNAUTHORIZED" ? 401 : msg === "ACCESS_DENIED" ? 403 : 500;
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status,
    });
  }
});
