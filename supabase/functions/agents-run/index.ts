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

  let runId: string | null = null;

  try {
    const { orgId, agentKey, input, idempotencyKey } = await req.json();

    // 1. Validate required fields
    if (!orgId || !agentKey) {
      return new Response(
        JSON.stringify({ error: "orgId and agentKey are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Validate environment configuration early
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing required environment variables: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
      return new Response(
        JSON.stringify({ 
          error: "Server configuration error: Missing Supabase configuration",
          details: "Contact administrator to configure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY"
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. Check for optional secrets and log warnings
    const defaultSecret = Deno.env.get("RELEVANCE_DEFAULT_OUTBOUND_SECRET");
    const callbackSecret = Deno.env.get("RELEVANCE_CALLBACK_SECRET");
    
    if (!defaultSecret) {
      console.warn("[agents-run] RELEVANCE_DEFAULT_OUTBOUND_SECRET is not configured. Outbound requests will not include authentication header unless agent has custom outbound_secret.");
    }
    if (!callbackSecret) {
      console.warn("[agents-run] RELEVANCE_CALLBACK_SECRET is not configured. Callbacks will accept any request without verification.");
    }

    // 4. Create Supabase service role client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 5. Lookup agent
    const { data: agent, error: agentError } = await supabase
      .from("relevance_agents")
      .select("*")
      .eq("org_id", orgId)
      .eq("agent_key", agentKey)
      .single();

    if (agentError || !agent) {
      console.error("Agent lookup error:", agentError);
      return new Response(
        JSON.stringify({ error: "Agent not found", agentKey, orgId }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!agent.is_enabled) {
      return new Response(
        JSON.stringify({ error: "Agent is disabled", agentKey }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 6. Insert run into agent_runs
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
            JSON.stringify({ runId: existingRun.id, status: existingRun.status, idempotent: true }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }
      console.error("Insert error:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to create run", details: insertError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    runId = run.id;

    // 7. Build payload for Relevance webhook
    const callbackUrl = `${supabaseUrl}/functions/v1/relevance-callback`;
    const payload = {
      runId: run.id,
      orgId,
      agentKey,
      input: input ?? {},
      callbackUrl,
    };

    // 8. Determine outbound secret
    const outboundSecret = agent.outbound_secret || defaultSecret;

    // 9. Build webhook headers
    const webhookHeaders: Record<string, string> = {
      "Content-Type": "application/json",
    };
    
    if (outboundSecret) {
      webhookHeaders["x-aerelion-secret"] = outboundSecret;
    } else {
      console.warn(`[agents-run] No outbound secret for agent ${agentKey}. Sending request without authentication header.`);
    }

    // 10. POST to Relevance webhook
    try {
      console.log(`[agents-run] Calling Relevance trigger URL for agent ${agentKey}: ${agent.trigger_url}`);
      
      const webhookResponse = await fetch(agent.trigger_url, {
        method: "POST",
        headers: webhookHeaders,
        body: JSON.stringify(payload),
      });

      const relevanceTraceId = webhookResponse.headers.get("x-trace-id");
      const responseBody = await webhookResponse.text();

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

        console.log(`[agents-run] Successfully sent to Relevance. Run ID: ${run.id}, Trace ID: ${relevanceTraceId}`);

        return new Response(
          JSON.stringify({ runId: run.id, status: "sent" }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } else {
        // Webhook returned non-2xx
        const errorMessage = `Relevance webhook failed: ${webhookResponse.status} ${responseBody.substring(0, 2000)}`;
        console.error(`[agents-run] ${errorMessage}`);

        await supabase
          .from("agent_runs")
          .update({
            status: "failed",
            attempt_count: 1,
            error: errorMessage,
            relevance_trace_id: relevanceTraceId ?? null,
          })
          .eq("id", run.id);

        return new Response(
          JSON.stringify({ 
            runId: run.id, 
            status: "failed", 
            error: "relevance_non_2xx",
            http_status: webhookResponse.status,
            body: responseBody.substring(0, 2000)
          }),
          { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    } catch (fetchError) {
      // Network error calling Relevance
      const errorMessage = fetchError instanceof Error ? fetchError.message : "Unknown fetch error";
      const errorStack = fetchError instanceof Error ? fetchError.stack : undefined;
      
      console.error(`[agents-run] Network error calling Relevance:`, errorMessage, errorStack);

      await supabase
        .from("agent_runs")
        .update({
          status: "failed",
          attempt_count: 1,
          error: `Network error: ${errorMessage}`,
        })
        .eq("id", run.id);

      return new Response(
        JSON.stringify({ 
          runId: run.id, 
          status: "failed", 
          error: errorMessage,
          stack: errorStack
        }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    // Top-level catch for any unhandled errors
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    console.error("[agents-run] Unhandled error:", errorMessage, errorStack);
    
    return new Response(
      JSON.stringify({ 
        runId: runId ?? null,
        status: runId ? "failed" : "error",
        error: errorMessage, 
        stack: errorStack 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});