import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const auditId = url.searchParams.get("audit");

    if (!auditId) {
      return new Response(
        JSON.stringify({ error: "Missing audit parameter" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch audit
    const { data: audit, error: auditError } = await supabase
      .from("audits")
      .select("*")
      .eq("id", auditId)
      .single();

    if (auditError || !audit) {
      console.error("Audit not found:", auditError);
      return new Response(
        JSON.stringify({ error: "Audit not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch diagnosis
    const { data: diagnosis, error: diagError } = await supabase
      .from("diagnoses")
      .select("*")
      .eq("audit_id", auditId)
      .single();

    // If still processing, return processing state
    if (audit.status === "processing" && !diagnosis) {
      return new Response(
        JSON.stringify({
          status: "processing",
          audit: {
            id: audit.id,
            name: audit.name,
            email: audit.email,
            status: audit.status,
          },
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (diagError || !diagnosis) {
      console.error("Diagnosis not found:", diagError);
      return new Response(
        JSON.stringify({ error: "Diagnosis not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Returning audit result:", { audit_id: auditId });

    return new Response(
      JSON.stringify({
        status: "complete",
        audit: {
          id: audit.id,
          name: audit.name,
          email: audit.email,
          primary_friction: audit.primary_friction,
          created_at: audit.created_at,
        },
        diagnosis: {
          id: diagnosis.id,
          leak_hours_low: diagnosis.leak_hours_low,
          leak_hours_high: diagnosis.leak_hours_high,
          recovered_hours_low: diagnosis.recovered_hours_low,
          recovered_hours_high: diagnosis.recovered_hours_high,
          primary_failure_mode: diagnosis.primary_failure_mode,
          plain_language_cause: diagnosis.plain_language_cause,
          what_is_happening: diagnosis.what_is_happening,
          recommended_systems: diagnosis.recommended_systems,
          readiness_level: diagnosis.readiness_level,
          next_step: diagnosis.next_step,
          confidence: diagnosis.confidence,
          disclaimer: diagnosis.disclaimer,
        },
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Audit result error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});