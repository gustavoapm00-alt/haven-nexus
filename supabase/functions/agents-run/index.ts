import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { orgId, agentKey, input, idempotencyKey } = await req.json();

    // 1. Validate required fields
    if (!orgId || !agentKey) {
      return new Response(
        JSON.stringify({ error: "orgId and agentKey are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Create Supabase service role client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 3. Lookup agent
    const { data: agent, error: agentError } = await supabase
      .from("relevance_agents")
      .select("*")
      .eq("org_id", orgId)
      .eq("agent_key", agentKey)
      .single();

    if (agentError || !agent) {
      console.error("Agent lookup error:", agentError);
      return new Response(
        JSON.stringify({ error: "Agent not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!agent.is_enabled) {
      return new Response(
        JSON.stringify({ error: "Agent is disabled" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 4. Insert run into agent_runs
    const { data: run, error: insertError } = await supabase
      .from("agent_runs")
      .insert({
        org_id: orgId,
        relevance_agent_id: agent.id,
        status: "queued",
        attempt_count: 0,
        idempotency_key: idempotencyKey ?? null,
        input_json: input ?? {},
      })
      .select()
      .single();

    // Handle idempotency conflict
    if (insertError) {
      if (insertError.code === "23505" && idempotencyKey) {
        // Unique constraint violation - fetch existing run
        const { data: existingRun } = await supabase
          .from("agent_runs")
          .select("id, status")
          .eq("org_id", orgId)
          .eq("idempotency_key", idempotencyKey)
          .single();

        if (existingRun) {
          return new Response(
            JSON.stringify({ runId: existingRun.id, status: existingRun.status }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }
      console.error("Insert error:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to create run" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 5. Build payload for Relevance webhook
    const callbackUrl = `${supabaseUrl}/functions/v1/relevance-callback`;
    const payload = {
      runId: run.id,
      orgId,
      agentKey,
      input: input ?? {},
      callbackUrl,
    };

    // 6. Determine outbound secret
    const defaultSecret = Deno.env.get("RELEVANCE_DEFAULT_OUTBOUND_SECRET");
    const outboundSecret = agent.outbound_secret || defaultSecret;

    // 7. POST to Relevance webhook
    const webhookHeaders: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (outboundSecret) {
      webhookHeaders["x-aerelion-secret"] = outboundSecret;
    }

    try {
      const webhookResponse = await fetch(agent.trigger_url, {
        method: "POST",
        headers: webhookHeaders,
        body: JSON.stringify(payload),
      });

      const relevanceTraceId = webhookResponse.headers.get("x-trace-id");

      if (webhookResponse.ok) {
        // Update run to 'sent'
        await supabase
          .from("agent_runs")
          .update({
            status: "sent",
            attempt_count: 1,
            relevance_trace_id: relevanceTraceId ?? null,
          })
          .eq("id", run.id);

        return new Response(
          JSON.stringify({ runId: run.id, status: "sent" }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } else {
        // Webhook failed
        const errorText = await webhookResponse.text();
        const truncatedError = `HTTP ${webhookResponse.status}: ${errorText.substring(0, 1000)}`;

        await supabase
          .from("agent_runs")
          .update({
            status: "failed",
            attempt_count: 1,
            error: truncatedError,
          })
          .eq("id", run.id);

        return new Response(
          JSON.stringify({ runId: run.id, status: "failed" }),
          { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    } catch (fetchError) {
      // Network error
      const errorMessage = fetchError instanceof Error ? fetchError.message : "Unknown fetch error";
      
      await supabase
        .from("agent_runs")
        .update({
          status: "failed",
          attempt_count: 1,
          error: errorMessage.substring(0, 1000),
        })
        .eq("id", run.id);

      return new Response(
        JSON.stringify({ runId: run.id, status: "failed" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    console.error("agents-run error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
