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

  // Determine the key based on user or IP
  let key: string;
  if (userId) {
    key = `${config.functionName}:user:${userId}`;
  } else if (clientIp) {
    key = `${config.functionName}:ip:${clientIp}`;
  } else {
    // If no identifier, allow but log warning
    console.warn("Rate limit check called without user or IP identifier");
    return { allowed: true };
  }

  const now = new Date();
  // Calculate window start (floor to the nearest window)
  const windowStartMs = Math.floor(now.getTime() / (config.windowSeconds * 1000)) * (config.windowSeconds * 1000);
  const windowStart = new Date(windowStartMs).toISOString();

  try {
    // Use the check_rate_limit database function
    const { data, error } = await supabaseAdmin.rpc('check_rate_limit', {
      p_identifier: key,
      p_action_type: config.functionName,
      p_cooldown_seconds: config.windowSeconds,
    });

    if (error) {
      console.error("Rate limit check error:", error);
      // On error, allow the request but log it
      return { allowed: true };
    }

    // If the function returns false, we're rate limited
    if (data === false) {
      return {
        allowed: false,
        retryAfterSeconds: config.windowSeconds,
      };
    }

    return { allowed: true };
  } catch (err) {
    console.error("Rate limit exception:", err);
    // On exception, allow the request
    return { allowed: true };
  }
}

export function getClientIp(req: Request): string | null {
  // Try various headers that might contain the client IP
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return forwardedFor.split(",")[0].trim();
  }

  const realIp = req.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }

  const cfConnectingIp = req.headers.get("cf-connecting-ip");
  if (cfConnectingIp) {
    return cfConnectingIp.trim();
  }

  return null;
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
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    }
  );
}
