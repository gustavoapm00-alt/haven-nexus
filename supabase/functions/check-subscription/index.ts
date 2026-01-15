import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { createLogger, getClientIP } from "../_shared/edge-logger.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Retry helper with exponential backoff and jitter
async function withRetry<T>(
  fn: () => Promise<T>,
  options: { maxRetries?: number; baseDelayMs?: number; shouldRetry?: (error: unknown) => boolean } = {}
): Promise<T> {
  const { maxRetries = 3, baseDelayMs = 250, shouldRetry = defaultShouldRetry } = options;
  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxRetries || !shouldRetry(error)) {
        throw error;
      }

      // Calculate delay with exponential backoff: 250ms, 600ms, 1200ms approx
      const baseDelay = baseDelayMs * Math.pow(2.4, attempt);
      // Add jitter ±20%
      const jitter = baseDelay * (0.8 + Math.random() * 0.4);
      const delay = Math.round(jitter);
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

// Determine if an error is retryable
function defaultShouldRetry(error: unknown): boolean {
  if (!error) return false;
  
  // Network errors
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return true;
  }
  
  // Stripe errors with specific codes
  if (typeof error === 'object' && error !== null) {
    const err = error as { statusCode?: number; code?: string; type?: string };
    
    // Rate limit
    if (err.statusCode === 429) return true;
    
    // Server errors (5xx)
    if (err.statusCode && err.statusCode >= 500 && err.statusCode < 600) return true;
    
    // Stripe-specific transient errors
    if (err.type === 'StripeConnectionError' || err.type === 'StripeAPIError') {
      return true;
    }
  }
  
  return false;
}

serve(async (req) => {
  const logger = createLogger('check-subscription', req);
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const checkedAt = new Date().toISOString();

  try {
    logger.debug("Function started");

    // Check Stripe key
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      logger.error("STRIPE_SECRET_KEY not configured");
      await logger.logResponse(500, "Server configuration error", { missing: "STRIPE_SECRET_KEY" });
      return new Response(JSON.stringify({
        subscribed: false,
        status: "unknown",
        product_id: null,
        price_id: null,
        subscription_end: null,
        checked_at: checkedAt,
        error: "Server configuration error"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    // Validate Authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      logger.warn("Missing or malformed auth header");
      await logger.logResponse(401, "Missing auth token");
      return new Response(JSON.stringify({ error: "Missing auth token" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const token = authHeader.slice("Bearer ".length).trim();

    // Guard against accidental "Bearer undefined" etc.
    if (!token || token === "undefined" || token === "null") {
      logger.warn("Empty or invalid token value");
      await logger.logResponse(401, "Missing auth token", { tokenValue: "empty_or_invalid" });
      return new Response(JSON.stringify({ error: "Missing auth token" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    // Create admin client to validate JWT (required when verify_jwt = false)
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );

    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user?.email) {
      logger.warn("JWT validation failed", { error: userError?.message ?? "no_user_or_email" });
      await logger.logResponse(401, "Invalid token", { authError: userError?.message ?? "no_user_or_email" });
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const userId = user.id;
    const email = user.email;

    logger.setUserId(userId);
    logger.debug("User authenticated", { userId });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    
    // Fetch customer with retry
    const customers = await withRetry(
      async () => stripe.customers.list({ email, limit: 1 }),
      { maxRetries: 3 }
    );
    
    if (customers.data.length === 0) {
      await logger.logResponse(200, "No Stripe customer found - inactive");
      return new Response(JSON.stringify({
        subscribed: false,
        status: "inactive",
        product_id: null,
        price_id: null,
        subscription_end: null,
        checked_at: checkedAt,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;

    // Fetch subscriptions with retry
    const subscriptions = await withRetry(
      async () => stripe.subscriptions.list({
        customer: customerId,
        status: "active",
        limit: 1,
      }),
      { maxRetries: 3 }
    );

    const hasActiveSub = subscriptions.data.length > 0;
    let productId: string | null = null;
    let priceId: string | null = null;
    let subscriptionEnd: string | null = null;

    if (hasActiveSub) {
      const subscription = subscriptions.data[0];
      subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
      productId = subscription.items.data[0].price.product as string;
      priceId = subscription.items.data[0].price.id;
    }

    await logger.logResponse(200, hasActiveSub ? "Active subscription" : "Inactive subscription", {
      subscribed: hasActiveSub,
    });

    return new Response(JSON.stringify({
      subscribed: hasActiveSub,
      status: hasActiveSub ? "active" : "inactive",
      product_id: productId,
      price_id: priceId,
      subscription_end: subscriptionEnd,
      checked_at: checkedAt,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error("Unhandled error", { message: errorMessage });
    await logger.logResponse(200, "Unknown status due to error", { error: errorMessage });
    
    // Return 200 with unknown status for consistency
    return new Response(JSON.stringify({
      subscribed: false,
      status: "unknown",
      product_id: null,
      price_id: null,
      subscription_end: null,
      checked_at: checkedAt,
      error: "Unable to verify subscription status"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  }
});
