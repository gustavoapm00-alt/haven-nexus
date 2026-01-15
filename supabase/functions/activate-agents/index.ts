import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.2";
import { checkRateLimit, getClientIp, rateLimitResponse } from "../_shared/rate-limiter.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// HMAC-SHA256 signing for n8n webhook
async function signPayload(secret: string, payload: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return btoa(String.fromCharCode(...new Uint8Array(signature)));
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const n8nWebhookUrl = Deno.env.get("N8N_ACTIVATE_WEBHOOK_URL") ?? "";
    const n8nWebhookSecret = Deno.env.get("N8N_WEBHOOK_SECRET") ?? "";
    
    // Get auth token
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("[activate-agents] Missing authorization header");
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "").trim();
    
    // Create admin client for user validation
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    });

    // Validate user
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    
    if (userError || !user?.email) {
      console.error("[activate-agents] Invalid token:", userError?.message ?? "no_user");
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Rate limiting: 5 activations per hour per user
    const clientIp = getClientIp(req);
    const rateCheck = await checkRateLimit(
      { functionName: "activate_agents", maxRequests: 5, windowSeconds: 720 }, // 12 min cooldown
      user.id,
      clientIp
    );

    if (!rateCheck.allowed) {
      console.warn("[activate-agents] Rate limit exceeded for user:", user.id);
      return rateLimitResponse(rateCheck.retryAfterSeconds ?? 720);
    }

    // Parse request body
    const body = await req.json();
    const { audit_id, name } = body;

    if (!audit_id) {
      return new Response(
        JSON.stringify({ error: "audit_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate audit ownership - user must own this audit
    const { data: audit, error: auditError } = await supabaseAdmin
      .from("audits")
      .select("id, email, name")
      .eq("id", audit_id)
      .single();

    if (auditError || !audit) {
      console.error("[activate-agents] Audit not found:", auditError?.message);
      return new Response(
        JSON.stringify({ error: "Audit not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify the user email matches the audit email (ownership check)
    if (audit.email.toLowerCase() !== user.email.toLowerCase()) {
      console.warn("[activate-agents] Unauthorized access attempt:", {
        userId: user.id,
        userEmail: user.email,
        auditEmail: audit.email,
      });
      return new Response(
        JSON.stringify({ error: "Unauthorized - you don't own this audit" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check for duplicate activations
    const { data: existingActivation } = await supabaseAdmin
      .from("diagnoses")
      .select("id")
      .eq("audit_id", audit_id)
      .single();

    // Prepare payload for n8n
    const payload = {
      audit_id,
      name: name || audit.name,
      email: user.email,
      user_id: user.id,
      is_duplicate: !!existingActivation,
      timestamp: new Date().toISOString(),
    };

    const payloadString = JSON.stringify(payload);
    
    // Sign the payload if secret is configured
    let signature = "";
    if (n8nWebhookSecret) {
      signature = await signPayload(n8nWebhookSecret, payloadString);
    }

    // Generate request ID for idempotency
    const requestId = crypto.randomUUID();

    console.log("[activate-agents] Calling n8n webhook:", {
      auditId: audit_id,
      userEmail: user.email,
      requestId,
    });

    // Call n8n webhook if configured
    if (!n8nWebhookUrl) {
      console.warn("[activate-agents] N8N_ACTIVATE_WEBHOOK_URL not configured, returning mock response");
      return new Response(
        JSON.stringify({
          success: true,
          message: "Activation request received (n8n not configured)",
          request_id: requestId,
          audit_id,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const n8nResponse = await fetch(n8nWebhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-AERELION-SIGNATURE": signature,
        "X-AERELION-REQUEST-ID": requestId,
        "X-AERELION-AUDIT-ID": audit_id,
      },
      body: payloadString,
    });

    const n8nResult = await n8nResponse.json().catch(() => ({}));

    if (!n8nResponse.ok) {
      console.error("[activate-agents] n8n webhook error:", n8nResponse.status, n8nResult);
      return new Response(
        JSON.stringify({
          error: "Activation service error",
          details: n8nResult.message || "Unknown error",
        }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("[activate-agents] n8n webhook success:", {
      auditId: audit_id,
      requestId,
      tenantId: n8nResult.tenant_id,
    });

    return new Response(
      JSON.stringify({
        success: true,
        tenant_id: n8nResult.tenant_id,
        message: n8nResult.message || "Agent engine provisioning started",
        request_id: requestId,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[activate-agents] Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
