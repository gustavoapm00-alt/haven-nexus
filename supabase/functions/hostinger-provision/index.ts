import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";
import { checkRateLimit, getClientIp, rateLimitResponse } from "../_shared/rate-limiter.ts";

// ─── CORS: allowlisted origins only ───────────────────────────────────────
const STATIC_ALLOWED_ORIGINS = [
  "https://aerelion.systems",
  "https://haven-matrix.lovable.app",
  Deno.env.get("SITE_URL") || "",
].filter(Boolean);

function isLovablePreview(origin: string): boolean {
  return /^https:\/\/id-preview--[a-z0-9-]+\.lovable\.app$/.test(origin);
}

function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("Origin") ?? "";
  const allowedOrigin = (STATIC_ALLOWED_ORIGINS.includes(origin) || isLovablePreview(origin))
    ? origin : STATIC_ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Vary": "Origin",
  };
}

/**
 * hostinger-provision — STAGE_2 NON-BLOCKING GATE
 *
 * Accepts a VPS provisioning request, enqueues it in provisioning_queue,
 * and returns HTTP 202 immediately. The queue-processor cron handles the
 * actual 60s+ Hostinger API call asynchronously with exponential backoff.
 *
 * AES-256-GCM helpers and direct Hostinger API calls are now in the
 * queue-processor → hostinger-provision-worker flow only.
 */
serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    // ── Auth: admin only ──────────────────────────────────────────────────
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("UNAUTHORIZED");
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
    if (authErr || !user) throw new Error("UNAUTHORIZED");

    const { data: roleRow } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    const body = await req.json();
    const isAdmin = !!roleRow;

    // ── Rate limit: 1 provision per 60 min per user ──────────────────────
    const clientIp = getClientIp(req);
    const rl = await checkRateLimit(
      { functionName: "hostinger-provision", maxRequests: 1, windowSeconds: 3600 },
      user.id,
      clientIp
    );
    if (!rl.allowed) return rateLimitResponse(rl.retryAfterSeconds ?? 3600);

    const targetUserId: string = isAdmin && body.target_user_id ? body.target_user_id : user.id;
    const { plan = "starter", region = "us-east-1", activation_request_id, notes } = body;

    // ── NON-BLOCKING: Enqueue and return 202 immediately ─────────────────
    // Heavy VPS spin-up (60s+) is handled by queue-processor cron.
    const ENCRYPTION_KEY = Deno.env.get("CREDENTIAL_ENCRYPTION_KEY");
    if (!ENCRYPTION_KEY) throw new Error("ENCRYPTION_KEY_NOT_CONFIGURED");

    const jobPayload = { plan, region, target_user_id: targetUserId, notes: notes ?? null };
    const { data: queueJob, error: queueErr } = await supabase
      .from("provisioning_queue")
      .insert({
        user_id: targetUserId,
        action: "provision_vps",
        payload: jobPayload,
        activation_request_id: activation_request_id ?? null,
        max_attempts: 3,
        status: "queued",
        scheduled_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (queueErr) throw new Error(`QUEUE_INSERT_ERROR: ${queueErr.message}`);

    await supabase.from("edge_function_logs").insert({
      function_name: "hostinger-provision",
      level: "info",
      message: `PROVISION_QUEUED // user=${targetUserId} plan=${plan} region=${region} job=${queueJob?.id}`,
      user_id: user.id,
    });

    return new Response(JSON.stringify({
      success: true,
      status: "queued",
      job_id: queueJob?.id,
      message: "VPS provisioning job accepted. Poll provisioning_queue by job_id for status.",
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 202 });

  } catch (err) {
    const corsHeaders2 = getCorsHeaders(req);
    const msg = err instanceof Error ? err.message : String(err);
    await supabase.from("edge_function_logs").insert({
      function_name: "hostinger-provision",
      level: "error",
      message: `PROVISION_GATE_FAILED: ${msg}`,
    }).catch(() => {});

    const status = msg === "UNAUTHORIZED" ? 401 : 500;
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders2, "Content-Type": "application/json" },
      status,
    });
  }
});
