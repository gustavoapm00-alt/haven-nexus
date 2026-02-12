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
    const lovableKey = Deno.env.get("LOVABLE_API_KEY");
    if (!lovableKey) throw new Error("LOVABLE_API_KEY not configured");

    const supabase = createClient(supabaseUrl, serviceKey);

    const { window_hours = 24 } = await req.json().catch(() => ({}));
    const since = new Date(Date.now() - window_hours * 3600000).toISOString();

    // Fetch heartbeats
    const { data: heartbeats } = await supabase
      .from("agent_heartbeats")
      .select("agent_id, status, message, metadata, created_at")
      .gte("created_at", since)
      .order("created_at", { ascending: true })
      .limit(500);

    // Fetch edge function logs
    const { data: logs } = await supabase
      .from("edge_function_logs")
      .select("function_name, level, message, status_code, created_at")
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(200);

    // Build agent summary
    const agentMap: Record<string, { total: number; statuses: Record<string, number>; drifts: number; errors: number; lastMsg: string }> = {};
    for (const hb of heartbeats || []) {
      if (!agentMap[hb.agent_id]) agentMap[hb.agent_id] = { total: 0, statuses: {}, drifts: 0, errors: 0, lastMsg: "" };
      const a = agentMap[hb.agent_id];
      a.total++;
      a.statuses[hb.status] = (a.statuses[hb.status] || 0) + 1;
      if (hb.status === "DRIFT") a.drifts++;
      if (hb.status === "ERROR") a.errors++;
      a.lastMsg = hb.message || a.lastMsg;
    }

    const logSummary = {
      total: logs?.length || 0,
      errors: logs?.filter((l) => l.level === "error").length || 0,
      functions: [...new Set(logs?.map((l) => l.function_name) || [])],
    };

    const telemetryPayload = JSON.stringify({ window_hours, since, agents: agentMap, edge_logs: logSummary }, null, 2);

    const systemPrompt = `You are AG-07 "The Envoy", AERELION's Executive Briefing AI. Generate a structured After-Action Report (AAR) from the provided telemetry data.

FORMAT (use exact headers):
## AFTER-ACTION REPORT
**[REF-ID]** AAR-${Date.now().toString(36).toUpperCase()}
**[WINDOW]** Last ${window_hours}h
**[GENERATED]** ${new Date().toISOString().replace("T", " ").slice(0, 19)} UTC

### EXECUTIVE SUMMARY
Brief 2-3 sentence overview of system health.

### AGENT STATUS MATRIX
Table of each agent's heartbeat count, drift events, error events, and current posture.

### DRIFT & INCIDENT LOG
List any DRIFT or ERROR events with timestamps and context. If none, state "NO_INCIDENTS_DETECTED".

### EDGE FUNCTION TELEMETRY
Summary of backend function activity and any errors.

### RISK ASSESSMENT
Identify any patterns, recurring failures, or emerging threats.

### RECOMMENDATIONS
Actionable next steps for the operator.

---
*AERELION // SYS.OPS.V3.00 // GHOST_OPERATOR*

RULES:
- Use clinical, infrastructure terminology
- No marketing language
- Reference agent IDs (AG-01 through AG-07) by their codenames
- If data is sparse, note "INSUFFICIENT_TELEMETRY" rather than fabricating`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Generate an AAR from the following telemetry:\n\n${telemetryPayload}` },
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Retry in 60s." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Credits exhausted. Top up workspace." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI gateway error");
    }

    // Log the AAR generation
    await supabase.from("edge_function_logs").insert({
      function_name: "generate-aar",
      level: "info",
      message: `AAR generated for ${window_hours}h window`,
      details: { window_hours, agent_count: Object.keys(agentMap).length },
    });

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("generate-aar error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
