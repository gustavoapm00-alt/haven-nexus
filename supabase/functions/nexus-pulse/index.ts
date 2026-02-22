import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-heartbeat-key, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  // 1. Handle Preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS_HEADERS });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }

  try {
    // 2. Fail-Fast JWT Integrity Check (Pioneer Standard — DB never touched on bad token)
    const authHeader = req.headers.get("authorization") ?? "";
    const token = authHeader.replace("Bearer ", "").trim();
    if (!token || token.split(".").length !== 3) {
      return new Response(
        JSON.stringify({ error: "Unauthorized: malformed token" }),
        { status: 401, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    // 3. Parse & Validate Payload before touching DB
    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid request body" }), {
        status: 400,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    const { agent_id, status = "NOMINAL", telemetry } = body as {
      agent_id?: string;
      status?: string;
      telemetry?: Record<string, unknown>;
    };

    if (!agent_id || typeof agent_id !== "string") {
      return new Response(JSON.stringify({ error: "Invalid agent_id" }), {
        status: 400,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    // 4. Authenticate & Authorize (admin-only gate)
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    // 5. Database Integrity Check — agent must exist in registry
    const { data: agent, error: registryError } = await supabase
      .from("agent_registry")
      .select("id")
      .eq("id", agent_id)
      .single();

    if (registryError || !agent) {
      return new Response(JSON.stringify({ error: "Agent not registered" }), {
        status: 404,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    // 6. Atomic Pulse Write → agent_heartbeats (immutable provenance log)
    const { data, error: logError } = await supabase
      .from("agent_heartbeats")
      .insert({
        agent_id,
        status,
        message: "MANUAL_PULSE_SIGNAL",
        metadata: {
          ...(telemetry ?? {}),
          triggered_by: user.id,
          source: "nexus_pulse",
          timestamp: new Date().toISOString(),
        },
      })
      .select()
      .single();

    if (logError) throw logError;

    // 7. Provenance Log
    await supabase.from("edge_function_logs").insert({
      function_name: "nexus-pulse",
      level: "info",
      message: `${agent_id}: PULSE_SIGNAL from admin ${user.id}`,
      status_code: 200,
      user_id: user.id,
      details: { agent_id, status },
    });

    return new Response(JSON.stringify({ success: true, heartbeat: data }), {
      status: 200,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error(`[SYSTEM CRITICAL] Pulse Failure: ${message}`);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }
});
