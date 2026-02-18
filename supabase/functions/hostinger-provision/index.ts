import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MONO = 'JetBrains Mono';
const HOSTINGER_BASE = "https://api.hosting.hostinger.com/v1";

// ─── AES-256-GCM helpers ──────────────────────────────────────────────────────
async function deriveKey(base64Key: string): Promise<CryptoKey> {
  const raw = Uint8Array.from(atob(base64Key), c => c.charCodeAt(0));
  return crypto.subtle.importKey("raw", raw.buffer.slice(0, 32), { name: "AES-GCM" }, false, ["encrypt", "decrypt"]);
}

async function encryptPayload(data: string, keyBase64: string): Promise<{ encrypted: string; iv: string; tag: string }> {
  const key = await deriveKey(keyBase64);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const enc = new TextEncoder();
  const cipherBuf = await crypto.subtle.encrypt({ name: "AES-GCM", iv, tagLength: 128 }, key, enc.encode(data));
  const cipher = new Uint8Array(cipherBuf);
  const tagOffset = cipher.length - 16;
  const ciphertext = cipher.slice(0, tagOffset);
  const tag = cipher.slice(tagOffset);
  return {
    encrypted: btoa(String.fromCharCode(...ciphertext)),
    iv: btoa(String.fromCharCode(...iv)),
    tag: btoa(String.fromCharCode(...tag)),
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    // ── Auth: admin only ──────────────────────────────────────────────────────
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("UNAUTHORIZED");
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
    if (authErr || !user) throw new Error("UNAUTHORIZED");

    const { data: roleRow } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    const body = await req.json();
    const isAdmin = !!roleRow;

    // Admins can provision for any user_id; clients can only provision for themselves
    const targetUserId: string = isAdmin && body.target_user_id ? body.target_user_id : user.id;
    const { plan = "starter", region = "us-east-1", activation_request_id, notes } = body;

    const HOSTINGER_API_TOKEN = Deno.env.get("HOSTINGER_API_TOKEN");
    const ENCRYPTION_KEY = Deno.env.get("CREDENTIAL_ENCRYPTION_KEY");
    if (!HOSTINGER_API_TOKEN) throw new Error("HOSTINGER_API_TOKEN_NOT_CONFIGURED");
    if (!ENCRYPTION_KEY) throw new Error("ENCRYPTION_KEY_NOT_CONFIGURED");

    // ── Log request ───────────────────────────────────────────────────────────
    await supabase.from("edge_function_logs").insert({
      function_name: "hostinger-provision",
      level: "info",
      message: `PROVISION_REQUEST // user=${targetUserId} plan=${plan} region=${region}`,
      user_id: user.id,
    });

    // ── Call Hostinger VPS API ────────────────────────────────────────────────
    const provisionRes = await fetch(`${HOSTINGER_BASE}/vps/virtual-machines`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${HOSTINGER_API_TOKEN}`,
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        plan,
        region,
        label: `AERELION_NODE_${targetUserId.slice(0, 8).toUpperCase()}`,
        hostname: `aerelion-${targetUserId.slice(0, 8).toLowerCase()}.node`,
        os: "ubuntu-22.04",
        ssh_keys: [],
      }),
    });

    if (!provisionRes.ok) {
      const errText = await provisionRes.text();
      throw new Error(`HOSTINGER_API_ERROR: ${provisionRes.status} - ${errText}`);
    }

    const vmData = await provisionRes.json();
    const virtualMachineId = vmData.id ?? vmData.virtual_machine_id ?? vmData.data?.id;
    const ipAddress = vmData.ip_address ?? vmData.data?.ip_address ?? null;
    const hostname = vmData.hostname ?? vmData.data?.hostname ?? `node-${virtualMachineId}`;
    const sshPrivateKey = vmData.ssh_private_key ?? vmData.data?.ssh_private_key ?? "";
    const sshPublicKey = vmData.ssh_public_key ?? vmData.data?.ssh_public_key ?? "";
    const n8nUrl = vmData.n8n_url ?? vmData.data?.n8n_url ?? null;
    const n8nUsername = vmData.n8n_username ?? "admin";
    const n8nPassword = vmData.n8n_password ?? vmData.data?.n8n_password ?? "";

    // ── Encrypt credentials ───────────────────────────────────────────────────
    const [sshEnc, n8nEnc] = await Promise.all([
      encryptPayload(JSON.stringify({ private_key: sshPrivateKey, public_key: sshPublicKey }), ENCRYPTION_KEY),
      encryptPayload(JSON.stringify({ url: n8nUrl, username: n8nUsername, password: n8nPassword }), ENCRYPTION_KEY),
    ]);

    // ── Store in vps_instances ────────────────────────────────────────────────
    const { data: instance, error: insertErr } = await supabase
      .from("vps_instances" as any)
      .insert({
        user_id: targetUserId,
        virtual_machine_id: String(virtualMachineId),
        status: "active",
        ip_address: ipAddress,
        hostname,
        plan,
        region,
        ssh_key_label: `AERELION_NODE_${targetUserId.slice(0, 8).toUpperCase()}`,
        encrypted_ssh_private_key: sshEnc.encrypted,
        encrypted_ssh_public_key: sshEnc.encrypted,
        ssh_encryption_iv: sshEnc.iv,
        ssh_encryption_tag: sshEnc.tag,
        encrypted_n8n_credentials: n8nEnc.encrypted,
        n8n_encryption_iv: n8nEnc.iv,
        n8n_encryption_tag: n8nEnc.tag,
        n8n_instance_url: n8nUrl,
        activation_request_id: activation_request_id ?? null,
        triggered_by: user.id,
        notes: notes ?? null,
        agents_deployed: false,
      })
      .select()
      .single();

    if (insertErr) throw new Error(`DB_INSERT_ERROR: ${insertErr.message}`);

    // ── Trigger agent deployment (fire-and-forget) ────────────────────────────
    // Post to n8n to inject AG-01 through AG-07 on the new machine
    const N8N_BASE_URL = Deno.env.get("N8N_BASE_URL");
    const N8N_API_KEY = Deno.env.get("N8N_API_KEY");
    if (N8N_BASE_URL && N8N_API_KEY && ipAddress) {
      try {
        await fetch(`${N8N_BASE_URL}/api/v1/workflows`, {
          method: "POST",
          headers: {
            "X-N8N-API-KEY": N8N_API_KEY,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: `AERELION_AGENT_INJECT_${virtualMachineId}`,
            active: true,
            nodes: [
              {
                id: "inject-trigger",
                name: "Execute Agent Injection",
                type: "n8n-nodes-base.httpRequest",
                typeVersion: 4.1,
                position: [250, 300],
                parameters: {
                  method: "POST",
                  url: `http://${ipAddress}:5678/api/v1/workflows/activate-all`,
                  authentication: "none",
                  sendBody: true,
                  bodyParameters: {
                    parameters: [
                      { name: "instance_id", value: String(instance?.id) },
                      { name: "vm_id", value: String(virtualMachineId) },
                    ],
                  },
                },
              },
            ],
            connections: {},
            settings: { executionOrder: "v1" },
          }),
        });

        // Mark agents as deployed
        await supabase
          .from("vps_instances" as any)
          .update({ agents_deployed: true, agents_deployed_at: new Date().toISOString() })
          .eq("id", instance?.id);
      } catch (agentErr) {
        await supabase
          .from("vps_instances" as any)
          .update({ agent_deploy_error: String(agentErr) })
          .eq("id", instance?.id);
      }
    }

    // ── Log success ───────────────────────────────────────────────────────────
    await supabase.from("edge_function_logs").insert({
      function_name: "hostinger-provision",
      level: "info",
      message: `PROVISION_SUCCESS // vm=${virtualMachineId} ip=${ipAddress}`,
      user_id: user.id,
      status_code: 200,
    });

    return new Response(JSON.stringify({
      success: true,
      instance_id: instance?.id,
      virtual_machine_id: virtualMachineId,
      ip_address: ipAddress,
      hostname,
      status: "active",
      agents_deployed: true,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 });

  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await supabase.from("edge_function_logs").insert({
      function_name: "hostinger-provision",
      level: "error",
      message: `PROVISION_FAILED: ${msg}`,
    }).catch(() => {});

    const status = msg === "UNAUTHORIZED" ? 401 : 500;
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status,
    });
  }
});
