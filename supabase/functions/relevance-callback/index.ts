import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-relevance-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // 1. Verify secret header
    const callbackSecret = Deno.env.get("RELEVANCE_CALLBACK_SECRET");
    const providedSecret = req.headers.get("x-relevance-secret");

    if (callbackSecret) {
      if (providedSecret !== callbackSecret) {
        console.error("[relevance-callback] Invalid callback secret provided");
        return new Response(
          JSON.stringify({ error: "unauthorized_callback" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    } else {
      console.warn("[relevance-callback] RELEVANCE_CALLBACK_SECRET is not configured. Accepting callback without verification.");
    }

    const { runId, status, output, error, relevanceTraceId } = await req.json();

    // 2. Validate runId
    if (!runId) {
      console.error("[relevance-callback] Missing runId in callback");
      return new Response(
        JSON.stringify({ error: "runId is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. Map status
    let mappedStatus: string;
    switch (status) {
      case "succeeded":
        mappedStatus = "succeeded";
        break;
      case "failed":
        mappedStatus = "failed";
        break;
      case "running":
        mappedStatus = "running";
        break;
      default:
        mappedStatus = "running";
    }

    // 4. Create Supabase service role client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("[relevance-callback] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
      return new Response(
        JSON.stringify({ error: "server_configuration_error", message: "Missing Supabase configuration" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 5. Check if run exists
    const { data: existingRun, error: fetchError } = await supabase
      .from("agent_runs")
      .select("id")
      .eq("id", runId)
      .maybeSingle();

    if (fetchError) {
      console.error("[relevance-callback] Error fetching run:", fetchError);
      return new Response(
        JSON.stringify({ error: "db_fetch_failed", message: fetchError.message, runId }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!existingRun) {
      console.error("[relevance-callback] Run not found:", runId);
      return new Response(
        JSON.stringify({ error: "run_not_found", runId }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 6. Build update payload
    const updatePayload: Record<string, any> = {
      status: mappedStatus,
      relevance_trace_id: relevanceTraceId ?? null,
    };

    // Store output if provided
    if (output !== undefined) {
      updatePayload.output_json = output;
    }

    // Store error if provided or if status is failed
    if (error !== undefined && error !== null) {
      updatePayload.error = typeof error === 'string' ? error : JSON.stringify(error);
    } else if (mappedStatus === 'failed' && !error) {
      updatePayload.error = 'Agent run failed without error details';
    }

    // 7. Update agent_runs
    const { error: updateError } = await supabase
      .from("agent_runs")
      .update(updatePayload)
      .eq("id", runId);

    if (updateError) {
      console.error("[relevance-callback] Update error:", updateError);
      return new Response(
        JSON.stringify({ error: "db_update_failed", message: updateError.message, runId }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[relevance-callback] Successfully updated run ${runId} to status: ${mappedStatus}`);

    return new Response(
      JSON.stringify({ ok: true, runId, status: mappedStatus }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    console.error("[relevance-callback] Unhandled error:", errorMessage, errorStack);
    
    return new Response(
      JSON.stringify({ error: errorMessage, stack: errorStack }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});