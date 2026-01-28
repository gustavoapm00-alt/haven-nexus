import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

export interface AuthResult {
  authorized: boolean;
  userId?: string;
  error?: string;
  statusCode: number;
}

/**
 * Validates that the request comes from an authenticated admin user.
 * Returns authorization result with user ID if authorized.
 */
export async function requireAdminAuth(req: Request): Promise<AuthResult> {
  const authHeader = req.headers.get("Authorization");
  
  if (!authHeader?.startsWith("Bearer ")) {
    return {
      authorized: false,
      error: "Missing or invalid Authorization header",
      statusCode: 401,
    };
  }

  const token = authHeader.replace("Bearer ", "");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
    console.error("Missing Supabase configuration");
    return {
      authorized: false,
      error: "Server configuration error",
      statusCode: 500,
    };
  }

  // Create client with user's token to verify
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

  // Verify the JWT and get claims
  const { data: claimsData, error: claimsError } = await supabase.auth.getUser(token);
  
  if (claimsError || !claimsData?.user) {
    console.warn("JWT verification failed:", claimsError?.message);
    return {
      authorized: false,
      error: "Invalid or expired token",
      statusCode: 401,
    };
  }

  const userId = claimsData.user.id;

  // Use service role to check admin status (bypasses RLS)
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

  const { data: roleData } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();

  if (!roleData) {
    console.warn("Non-admin user attempted admin action:", userId);
    return {
      authorized: false,
      error: "Admin access required",
      statusCode: 403,
    };
  }

  return {
    authorized: true,
    userId,
    statusCode: 200,
  };
}

/**
 * Validates a cron secret token for scheduled jobs.
 * The secret should be passed in Authorization header as: Bearer <CRON_SECRET>
 */
export function requireCronSecret(req: Request): AuthResult {
  const cronSecret = Deno.env.get("CRON_SECRET");
  
  if (!cronSecret) {
    console.error("CRON_SECRET not configured");
    return {
      authorized: false,
      error: "Server configuration error",
      statusCode: 500,
    };
  }

  const authHeader = req.headers.get("Authorization");
  
  if (!authHeader?.startsWith("Bearer ")) {
    return {
      authorized: false,
      error: "Missing or invalid Authorization header",
      statusCode: 401,
    };
  }

  const providedSecret = authHeader.replace("Bearer ", "");
  
  // Constant-time comparison to prevent timing attacks
  if (providedSecret.length !== cronSecret.length) {
    return {
      authorized: false,
      error: "Invalid cron secret",
      statusCode: 403,
    };
  }
  
  let mismatch = 0;
  for (let i = 0; i < cronSecret.length; i++) {
    mismatch |= cronSecret.charCodeAt(i) ^ providedSecret.charCodeAt(i);
  }
  
  if (mismatch !== 0) {
    return {
      authorized: false,
      error: "Invalid cron secret",
      statusCode: 403,
    };
  }

  return {
    authorized: true,
    statusCode: 200,
  };
}
