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

    if (callbackSecret && providedSecret !== callbackSecret) {
      console.error("Invalid callback secret");
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { runId, status, output, error, relevanceTraceId } = await req.json();

    // 2. Validate runId
    if (!runId) {
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
      default:
        mappedStatus = "running";
    }

    // 4. Create Supabase service role client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 5. Update agent_runs
    const { error: updateError } = await supabase
      .from("agent_runs")
      .update({
        status: mappedStatus,
        output_json: output ?? null,
        error: error ?? null,
        relevance_trace_id: relevanceTraceId ?? null,
      })
      .eq("id", runId);

    if (updateError) {
      console.error("Update error:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to update run" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ ok: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("relevance-callback error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
