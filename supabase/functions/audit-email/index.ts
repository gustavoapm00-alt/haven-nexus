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
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const appBaseUrl = Deno.env.get("APP_BASE_URL") || "https://aerelion.com";
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json();
    const auditId = body.audit_id;

    if (!auditId) {
      return new Response(
        JSON.stringify({ error: "Missing audit_id" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch audit and diagnosis
    const { data: audit, error: auditError } = await supabase
      .from("audits")
      .select("*")
      .eq("id", auditId)
      .single();

    if (auditError || !audit) {
      return new Response(
        JSON.stringify({ error: "Audit not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: diagnosis } = await supabase
      .from("diagnoses")
      .select("*")
      .eq("audit_id", auditId)
      .single();

    if (!diagnosis) {
      return new Response(
        JSON.stringify({ error: "Diagnosis not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // For now, since email provider isn't configured, we'll return a success
    // but note that email sending would be implemented here
    console.log("Email request for audit:", auditId);
    console.log("Would send to:", audit.email);
    console.log("Result link:", `${appBaseUrl}/system-audit/result?audit=${auditId}`);

    // In a real implementation, you would:
    // 1. Format the diagnosis into an email template
    // 2. Send via configured email provider (Resend, SendGrid, etc.)
    
    // For now, return success with a note
    return new Response(
      JSON.stringify({
        success: true,
        message: "Your diagnosis has been saved. You can return to view it anytime.",
        result_url: `${appBaseUrl}/system-audit/result?audit=${auditId}`,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Audit email error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});