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
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json();

    console.log("Deployment request received:", { email: body.email, audit_id: body.audit_id });

    // Validate required fields
    const requiredFields = [
      "audit_id", "diagnosis_id", "name", "email",
      "preferred_involvement", "timeline", "contact_method"
    ];

    for (const field of requiredFields) {
      if (!body[field]) {
        return new Response(
          JSON.stringify({ error: `Missing required field: ${field}` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Create deployment request
    const { data, error } = await supabase
      .from("deployment_requests")
      .insert({
        audit_id: body.audit_id,
        diagnosis_id: body.diagnosis_id,
        name: body.name,
        email: body.email,
        preferred_involvement: body.preferred_involvement,
        timeline: body.timeline,
        tools_stack: body.tools_stack || null,
        contact_method: body.contact_method,
        notes: body.notes || null,
        status: "received",
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating deployment request:", error);
      return new Response(
        JSON.stringify({ error: "Failed to create deployment request" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Deployment request created:", data.id);

    return new Response(
      JSON.stringify({ success: true, deployment_request_id: data.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Deployment request error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});