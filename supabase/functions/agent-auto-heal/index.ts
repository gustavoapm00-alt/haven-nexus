import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { buildCorsHeaders } from "../_shared/rate-limiter.ts";

serve(async (req) => {
  const corsHeaders = buildCorsHeaders(req);
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
      // Look up the n8n workflow ID mapped to this agent
      const { data: mappings } = await adminSupabase
        .from("n8n_mappings")
        .select("workflow_id, n8n_base_url")
        .eq("agent_id", agent_id)
        .eq("status", "active")
        .limit(5);

      const n8nBaseUrl = Deno.env.get("N8N_BASE_URL");
      const n8nApiKey = Deno.env.get("N8N_API_KEY");

      if (!n8nBaseUrl || !n8nApiKey) {
        return new Response(
          JSON.stringify({ error: "N8N_BASE_URL or N8N_API_KEY not configured" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const workflowIds: string[] = (mappings ?? [])
        .map((m: { workflow_id: string }) => m.workflow_id)
        .filter(Boolean);

      if (workflowIds.length === 0) {
        return new Response(
          JSON.stringify({
            error: `No active n8n workflow mappings found for ${agent_id}. Cannot restart.`,
          }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      await adminSupabase.from("agent_heartbeats").insert({
        agent_id,
        status: "PROCESSING",
        message: `AUTO_HEAL: Reactivating ${workflowIds.length} workflow(s) via n8n API`,
        metadata: { heal_type: "restart_init", previous_status: currentStatus, triggered_by: user.id, workflow_ids: workflowIds },
      });

      const reactivationResults: Array<{ workflow_id: string; ok: boolean; error?: string }> = [];
      for (const workflowId of workflowIds) {
        try {
          // Deactivate then re-activate to ensure a clean restart
          await fetch(`${n8nBaseUrl}/api/v1/workflows/${workflowId}/deactivate`, {
            method: "POST",
            headers: { "X-N8N-API-KEY": n8nApiKey },
          });

          const activateResp = await fetch(
            `${n8nBaseUrl}/api/v1/workflows/${workflowId}/activate`,
            { method: "POST", headers: { "X-N8N-API-KEY": n8nApiKey } }
          );

          if (!activateResp.ok) {
            const text = await activateResp.text();
            throw new Error(`n8n activate returned ${activateResp.status}: ${text.slice(0, 200)}`);
          }

          // Verify activation via GET
          const verifyResp = await fetch(
            `${n8nBaseUrl}/api/v1/workflows/${workflowId}`,
            { headers: { "X-N8N-API-KEY": n8nApiKey } }
          );
          const workflow = await verifyResp.json();
          if (!workflow?.active) {
            throw new Error(`Workflow ${workflowId} did not activate — active=${workflow?.active}`);
          }

          reactivationResults.push({ workflow_id: workflowId, ok: true });
        } catch (restartErr) {
          const msg = restartErr instanceof Error ? restartErr.message : String(restartErr);
          reactivationResults.push({ workflow_id: workflowId, ok: false, error: msg });
        }
      }

      const allOk = reactivationResults.every((r) => r.ok);
      await adminSupabase.from("agent_heartbeats").insert({
        agent_id,
        status: allOk ? "NOMINAL" : "ERROR",
        message: allOk
          ? `AUTO_HEAL: All ${workflowIds.length} workflow(s) reactivated successfully`
          : `AUTO_HEAL: Partial restart — ${reactivationResults.filter((r) => !r.ok).length} workflow(s) failed`,
        metadata: {
          heal_type: "restart_complete",
          previous_status: currentStatus,
          triggered_by: user.id,
          reactivation_results: reactivationResults,
        },
      });
      healActions.push("N8N_WORKFLOW_RESTART");
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
