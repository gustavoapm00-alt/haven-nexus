import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";
import { buildCorsHeaders } from "../_shared/rate-limiter.ts";


const HOSTINGER_BASE = "https://api.hosting.hostinger.com/v1";

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

    // ── MULTI-TENANCY GATE: verify this instance belongs to the user ──────────
    const { data: instance, error: fetchErr } = await supabase
      .from("vps_instances" as any)
      .select("virtual_machine_id, user_id, status")
      .eq("id", instance_id)
      .single();

    if (fetchErr || !instance) throw new Error("INSTANCE_NOT_FOUND");

    // Critical: enforce ownership — admin bypass allowed
    const { data: roleRow } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    const isAdmin = !!roleRow;
    if (!isAdmin && (instance as any).user_id !== user.id) {
      throw new Error("ACCESS_DENIED: INSTANCE_NOT_OWNED_BY_USER");
    }

    const HOSTINGER_API_TOKEN = Deno.env.get("HOSTINGER_API_TOKEN");
    if (!HOSTINGER_API_TOKEN) throw new Error("HOSTINGER_API_TOKEN_NOT_CONFIGURED");

    const vmId = (instance as any).virtual_machine_id;

    // ── Fetch metrics from Hostinger ──────────────────────────────────────────
    const metricsRes = await fetch(
      `${HOSTINGER_BASE}/vps/virtual-machines/${vmId}/metrics`,
      {
        headers: {
          "Authorization": `Bearer ${HOSTINGER_API_TOKEN}`,
          "Accept": "application/json",
        },
      }
    );

    if (!metricsRes.ok) {
      const errText = await metricsRes.text();
      throw new Error(`HOSTINGER_METRICS_ERROR: ${metricsRes.status} - ${errText}`);
    }

    const metricsData = await metricsRes.json();

    // Normalize to AERELION Vitality Stream format
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
      status: (instance as any).status,
      sampled_at: new Date().toISOString(),
    };

    return new Response(JSON.stringify({ success: true, vitality }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const status = msg.startsWith("UNAUTHORIZED") ? 401 : msg.startsWith("ACCESS_DENIED") ? 403 : 500;
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status,
    });
  }
});
