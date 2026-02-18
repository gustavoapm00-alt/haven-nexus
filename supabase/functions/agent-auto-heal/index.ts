import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // SECURITY: Validate JWT and enforce admin role — unauthenticated heal writes are not allowed
    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.replace("Bearer ", "");
    if (!token) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminSupabase = createClient(supabaseUrl, serviceKey);
    const { data: { user }, error: userError } = await adminSupabase.auth.getUser(token);
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Enforce admin role
    const { data: roleData } = await adminSupabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Forbidden: Admin role required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { agent_id, action = "stabilize" } = await req.json();

    if (!agent_id) {
      return new Response(JSON.stringify({ error: "agent_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate agent ID
    const validAgents = ["AG-01", "AG-02", "AG-03", "AG-04", "AG-05", "AG-06", "AG-07"];
    if (!validAgents.includes(agent_id)) {
      return new Response(JSON.stringify({ error: "Invalid agent_id" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check current state
    const { data: latest } = await adminSupabase
      .from("agent_heartbeats")
      .select("status, message, created_at")
      .eq("agent_id", agent_id)
      .order("created_at", { ascending: false })
      .limit(1);

    const currentStatus = latest?.[0]?.status || "OFFLINE";
    const healActions: string[] = [];

    if (action === "stabilize") {
      await adminSupabase.from("agent_heartbeats").insert({
        agent_id,
        status: "NOMINAL",
        message: "AUTO_HEAL: Stabilization protocol executed",
        metadata: {
          previous_status: currentStatus,
          heal_type: "auto_stabilize",
          triggered_at: new Date().toISOString(),
          triggered_by: user.id,
        },
      });
      healActions.push("FORCE_STABILIZATION");
    } else if (action === "restart") {
      await adminSupabase.from("agent_heartbeats").insert({
        agent_id,
        status: "PROCESSING",
        message: "AUTO_HEAL: Restart sequence initiated",
        metadata: { heal_type: "restart_init", previous_status: currentStatus, triggered_by: user.id },
      });

      await new Promise((r) => setTimeout(r, 2000));

      await adminSupabase.from("agent_heartbeats").insert({
        agent_id,
        status: "NOMINAL",
        message: "AUTO_HEAL: Restart complete — module online",
        metadata: { heal_type: "restart_complete", previous_status: currentStatus, triggered_by: user.id },
      });
      healActions.push("RESTART_SEQUENCE");
    }

    // Log the healing action
    await adminSupabase.from("edge_function_logs").insert({
      function_name: "agent-auto-heal",
      level: "info",
      message: `Auto-heal executed for ${agent_id}: ${healActions.join(", ")}`,
      details: {
        agent_id,
        action,
        previous_status: currentStatus,
        heal_actions: healActions,
        triggered_by: user.id,
      },
    });

    // Insert admin notification for visibility
    await adminSupabase.from("admin_notifications").insert({
      type: "auto_heal",
      title: `Auto-Heal: ${agent_id}`,
      body: `${agent_id} was auto-healed from ${currentStatus}. Action: ${action.toUpperCase()}.`,
      severity: currentStatus === "ERROR" ? "warning" : "info",
      metadata: { agent_id, action, previous_status: currentStatus, triggered_by: user.id },
    });

    return new Response(
      JSON.stringify({
        success: true,
        agent_id,
        previous_status: currentStatus,
        new_status: "NOMINAL",
        actions: healActions,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("agent-auto-heal error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
