import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

interface RateLimitConfig {
  functionName: string;
  maxRequests: number;
  windowSeconds: number;
}

interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds?: number;
}

export async function checkRateLimit(
  config: RateLimitConfig,
  userId: string | null,
  clientIp: string | null
): Promise<RateLimitResult> {
  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  let key: string;
  if (userId) {
    key = `${config.functionName}:user:${userId}`;
  } else if (clientIp) {
    key = `${config.functionName}:ip:${clientIp}`;
  } else {
    console.warn("Rate limit check called without user or IP identifier");
    return { allowed: true };
  }

  try {
    const { data, error } = await supabaseAdmin.rpc("check_rate_limit", {
      p_identifier: key,
      p_action_type: config.functionName,
      p_cooldown_seconds: config.windowSeconds,
    });

    if (error) {
      console.error("Rate limit check error:", error);
      return { allowed: true };
    }

    if (data === false) {
      return { allowed: false, retryAfterSeconds: config.windowSeconds };
    }

    return { allowed: true };
  } catch (err) {
    console.error("Rate limit exception:", err);
    return { allowed: true };
  }
}

export function getClientIp(req: Request): string | null {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  const cfIp = req.headers.get("cf-connecting-ip");
  if (cfIp) return cfIp.trim();
  return null;
}

// ── Allowlisted origins helper ─────────────────────────────────────────────
const ALLOWED_ORIGINS = [
  "https://aerelion.systems",
  "https://haven-matrix.lovable.app",
  Deno.env.get("SITE_URL") || "",
].filter(Boolean);

export function getAllowedOrigin(req: Request): string {
  const origin = req.headers.get("Origin") ?? "";
  return ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
}

export function buildCorsHeaders(req: Request): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": getAllowedOrigin(req),
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type, x-heartbeat-key",
    "Vary": "Origin",
  };
}

export function rateLimitResponse(retryAfterSeconds: number): Response {
  return new Response(
    JSON.stringify({
      error: "Rate limit exceeded",
      retry_after_seconds: retryAfterSeconds,
    }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": retryAfterSeconds.toString(),
        "Access-Control-Allow-Origin": ALLOWED_ORIGINS[0],
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    }
  );
}
