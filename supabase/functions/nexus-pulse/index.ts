import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { buildCorsHeaders } from "../_shared/rate-limiter.ts";

Deno.serve(async (req) => {
  const corsHeaders = buildCorsHeaders(req);
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  // Validate JWT and admin role
  const authHeader = req.headers.get("authorization") || "";
  const token = authHeader.replace("Bearer ", "");
  if (!token) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  const { data: { user }, error: userError } = await supabase.auth.getUser(token);
  if (userError || !user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Check admin role
  const { data: roleData } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .eq("role", "admin")
    .maybeSingle();

  if (!roleData) {
    return new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json();
    const { agent_id, status = "NOMINAL", message = "MANUAL_PULSE_SIGNAL", metadata = {} } = body;

    // Validate agent ID against canonical agent_registry table (single source of truth).
    // Note: VALID_AGENTS was previously an undefined reference — fixed here.
    const { data: registryEntry } = await supabase
      .from("agent_registry")
      .select("id")
      .eq("id", agent_id)
      .maybeSingle();
    if (!agent_id || !registryEntry) {
      return new Response(JSON.stringify({ error: "Invalid agent_id" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Insert heartbeat with service role
    const { data, error } = await supabase
      .from("agent_heartbeats")
      .insert({
        agent_id,
        status,
        message,
        metadata: { ...metadata, triggered_by: user.id, source: "nexus_pulse" },
      })
      .select()
      .single();

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Log to provenance
    await supabase.from("edge_function_logs").insert({
      function_name: "nexus-pulse",
      level: "info",
      message: `${agent_id}: PULSE_SIGNAL from admin ${user.id}`,
      status_code: 200,
      user_id: user.id,
      details: { agent_id, status, message },
    });

    return new Response(JSON.stringify({ success: true, heartbeat: data }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch {
    return new Response(JSON.stringify({ error: "Invalid request body" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
