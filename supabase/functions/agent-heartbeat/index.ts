import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-heartbeat-key",
};

const VALID_AGENTS = ["AG-01", "AG-02", "AG-03", "AG-04", "AG-05", "AG-06", "AG-07"];
const VALID_STATUSES = ["NOMINAL", "PROCESSING", "DRIFT", "ERROR"];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Validate heartbeat secret
  const heartbeatSecret = Deno.env.get("HEARTBEAT_SECRET");
  if (!heartbeatSecret) {
    return new Response(JSON.stringify({ error: "Server configuration error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const providedKey = req.headers.get("x-heartbeat-key") || "";
  if (providedKey.length !== heartbeatSecret.length) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let mismatch = 0;
  for (let i = 0; i < heartbeatSecret.length; i++) {
    mismatch |= heartbeatSecret.charCodeAt(i) ^ providedKey.charCodeAt(i);
  }
  if (mismatch !== 0) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json();
    const { agent_id, status = "NOMINAL", message = "", metadata = {} } = body;

    if (!agent_id || !VALID_AGENTS.includes(agent_id)) {
      return new Response(JSON.stringify({ error: "Invalid agent_id" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!VALID_STATUSES.includes(status)) {
      return new Response(JSON.stringify({ error: "Invalid status" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data, error } = await supabase
      .from("agent_heartbeats")
      .insert({ agent_id, status, message, metadata })
      .select()
      .single();

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Log to edge_function_logs with agent_id in details for terminal prefixing
    await supabase.from("edge_function_logs").insert({
      function_name: "agent-heartbeat",
      level: status === "ERROR" ? "error" : status === "DRIFT" ? "warn" : "info",
      message: `${agent_id}: ${message || status}`,
      status_code: 200,
      details: { agent_id, status, message },
    });

    return new Response(JSON.stringify({ success: true, heartbeat: data }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: "Invalid request body" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
