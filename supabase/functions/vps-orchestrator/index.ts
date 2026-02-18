import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const HOSTINGER_BASE = "https://api.hosting.hostinger.com/v1";

serve(async (req) => {
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

    const HOSTINGER_API_TOKEN = Deno.env.get("HOSTINGER_API_TOKEN");
    if (!HOSTINGER_API_TOKEN) throw new Error("HOSTINGER_API_TOKEN_NOT_CONFIGURED");

    const body = await req.json().catch(() => ({}));
    const { action, instance_id } = body;

    // ── Helper: ownership gate ─────────────────────────────────────────────
    const assertOwnership = async (instanceId: string) => {
      const { data: inst, error: fetchErr } = await supabase
        .from("vps_instances" as any)
        .select("virtual_machine_id, user_id, status")
        .eq("id", instanceId)
        .single();

      if (fetchErr || !inst) throw new Error("INSTANCE_NOT_FOUND");

      const { data: roleRow } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();

      const isAdmin = !!roleRow;
      if (!isAdmin && (inst as any).user_id !== user.id) {
        throw new Error("ACCESS_DENIED: INSTANCE_NOT_OWNED_BY_USER");
      }
      return inst as any;
    };

    const hostingerFetch = async (path: string, method = "GET", reqBody?: unknown) => {
      const res = await fetch(`${HOSTINGER_BASE}${path}`, {
        method,
        headers: {
          "Authorization": `Bearer ${HOSTINGER_API_TOKEN}`,
          "Accept": "application/json",
          "Content-Type": "application/json",
        },
        body: reqBody ? JSON.stringify(reqBody) : undefined,
      });
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`HOSTINGER_ERROR: ${res.status} - ${errText}`);
      }
      return res.json();
    };

    // ── Route actions ──────────────────────────────────────────────────────
    switch (action) {

      case "list": {
        // Return only instances belonging to this user from our DB
        const { data: instances, error: listErr } = await supabase
          .from("vps_instances" as any)
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (listErr) throw new Error(listErr.message);
        return new Response(JSON.stringify({ success: true, instances }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "metrics": {
        if (!instance_id) throw new Error("MISSING_INSTANCE_ID");
        const inst = await assertOwnership(instance_id);
        const vmId = inst.virtual_machine_id;
        if (!vmId) throw new Error("VM_NOT_YET_ASSIGNED");

        const metricsData = await hostingerFetch(`/vps/virtual-machines/${vmId}/metrics`);

        const vitality = {
          cpu_percent: metricsData.cpu?.usage_percent ?? metricsData.cpu_percent ?? 0,
          ram_percent: metricsData.memory?.usage_percent ?? metricsData.ram_percent ?? 0,
          ram_used_mb: metricsData.memory?.used_mb ?? metricsData.ram_used_mb ?? 0,
          ram_total_mb: metricsData.memory?.total_mb ?? metricsData.ram_total_mb ?? 0,
          disk_percent: metricsData.disk?.usage_percent ?? metricsData.disk_percent ?? 0,
          disk_used_gb: metricsData.disk?.used_gb ?? metricsData.disk_used_gb ?? 0,
          disk_total_gb: metricsData.disk?.total_gb ?? metricsData.disk_total_gb ?? 0,
          network_in_mbps: metricsData.network?.in_mbps ?? metricsData.network_in_mbps ?? 0,
          network_out_mbps: metricsData.network?.out_mbps ?? metricsData.network_out_mbps ?? 0,
          uptime_seconds: metricsData.uptime?.seconds ?? metricsData.uptime_seconds ?? 0,
          status: inst.status,
          sampled_at: new Date().toISOString(),
        };

        return new Response(JSON.stringify({ success: true, vitality }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "reboot": {
        if (!instance_id) throw new Error("MISSING_INSTANCE_ID");
        const inst = await assertOwnership(instance_id);
        const vmId = inst.virtual_machine_id;
        if (!vmId) throw new Error("VM_NOT_YET_ASSIGNED");

        const rebootData = await hostingerFetch(`/vps/virtual-machines/${vmId}/reboot`, "POST");

        // Log the reboot action
        await supabase.from("edge_function_logs" as any).insert({
          function_name: "vps-orchestrator",
          level: "info",
          message: `NODE_REBOOT: instance ${instance_id} rebooted by user ${user.id}`,
          user_id: user.id,
          details: { action: "reboot", instance_id, vm_id: vmId },
        });

        // Update instance status
        await supabase.from("vps_instances" as any)
          .update({ status: "rebooting", updated_at: new Date().toISOString() })
          .eq("id", instance_id);

        return new Response(JSON.stringify({ success: true, reboot: rebootData }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "scale_request": {
        if (!instance_id) throw new Error("MISSING_INSTANCE_ID");
        await assertOwnership(instance_id);

        const { message } = body;

        // Insert an admin notification
        await supabase.from("admin_notifications" as any).insert({
          type: "scale_request",
          title: `SCALE_REQUEST: Node ${instance_id.slice(0, 8).toUpperCase()}`,
          body: message ?? `Client ${user.id} has requested node scaling for instance ${instance_id}.`,
          severity: "warn",
          metadata: { instance_id, user_id: user.id, requested_at: new Date().toISOString() },
        });

        // Log it
        await supabase.from("edge_function_logs" as any).insert({
          function_name: "vps-orchestrator",
          level: "warn",
          message: `SCALE_REQUEST: user ${user.id} requested scaling for instance ${instance_id}`,
          user_id: user.id,
          details: { action: "scale_request", instance_id },
        });

        return new Response(JSON.stringify({ success: true, message: "SCALE_REQUEST_LOGGED" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      default:
        throw new Error(`UNKNOWN_ACTION: ${action}`);
    }

  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const status = msg.startsWith("UNAUTHORIZED") ? 401 : msg.startsWith("ACCESS_DENIED") ? 403 : 500;
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status,
    });
  }
});
