import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { buildCorsHeaders, checkRateLimit, getClientIp } from "../_shared/rate-limiter.ts";

const VALID_AGENTS = ["AG-01", "AG-02", "AG-03", "AG-04", "AG-05", "AG-06", "AG-07"];

// Lightweight UUID-v4 pattern check
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

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

  // ── PHASE 1: JWT INTEGRITY CHECK ──────────────────────────────────────────
  // Validate auth header format before touching the database.
  const authHeader = req.headers.get("authorization") || "";
  const token = authHeader.replace("Bearer ", "").trim();

  if (!token || token.split(".").length !== 3) {
    return new Response(JSON.stringify({ error: "Unauthorized: malformed token" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // ── PHASE 2: RATE LIMIT CHECK ─────────────────────────────────────────────
  // Block flood attempts before making any DB auth call.
  // Use IP as the identifier at this stage since we haven't verified user yet.
  const clientIp = getClientIp(req);
  const ipKey = clientIp ?? "unknown";

  const rateCheck = await checkRateLimit(
    { functionName: "nexus-pulse", maxRequests: 20, windowSeconds: 60 },
    null,
    ipKey
  );

  if (!rateCheck.allowed) {
    return new Response(
      JSON.stringify({ error: "Rate limit exceeded", retry_after_seconds: rateCheck.retryAfterSeconds }),
      {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json", "Retry-After": String(rateCheck.retryAfterSeconds ?? 60) },
      }
    );
  }

  // ── PHASE 3: DATABASE AUTH & ROLE CHECK ───────────────────────────────────
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const { data: { user }, error: userError } = await supabase.auth.getUser(token);
  if (userError || !user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Validate that the resolved user ID is a proper UUID (guards against token-stuffing)
  if (!UUID_RE.test(user.id)) {
    return new Response(JSON.stringify({ error: "Unauthorized: invalid identity" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
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
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // ── PHASE 4: PAYLOAD VALIDATION ───────────────────────────────────────────
  // Parse and validate the request body only after auth is confirmed.
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid request body" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const {
    agent_id,
    status = "NOMINAL",
    message = "MANUAL_PULSE_SIGNAL",
    metadata = {},
  } = body as { agent_id?: string; status?: string; message?: string; metadata?: Record<string, unknown> };

  if (!agent_id || !VALID_AGENTS.includes(agent_id)) {
    return new Response(JSON.stringify({ error: "Invalid agent_id" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // ── PHASE 5: WRITE HEARTBEAT ──────────────────────────────────────────────
  const { data, error } = await supabase
    .from("agent_heartbeats")
    .insert({
      agent_id,
      status,
      message,
      metadata: { ...(metadata as object), triggered_by: user.id, source: "nexus_pulse" },
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
});
