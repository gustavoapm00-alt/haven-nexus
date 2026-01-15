import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Log without exposing PII
const logStep = (step: string, details?: Record<string, unknown>) => {
  const safeDetails = details ? { ...details } : undefined;
  if (safeDetails) {
    delete safeDetails.email;
    if (safeDetails.userId && typeof safeDetails.userId === 'string') {
      safeDetails.userId = safeDetails.userId.substring(0, 8) + '...';
    }
  }
  const detailsStr = safeDetails ? ` - ${JSON.stringify(safeDetails)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
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
      
      logStep(`Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms`);
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
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const checkedAt = new Date().toISOString();

  try {
    logStep("Function started");

    // Check Stripe key
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      logStep("ERROR: STRIPE_SECRET_KEY not set");
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
      logStep("Missing or malformed auth token");
      return new Response(JSON.stringify({ error: "Missing auth token" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const token = authHeader.replace("Bearer ", "");
    
    // Create a Supabase client bound to the user's token
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: `Bearer ${token}` },
        },
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );

    // Validate the user via getUser() - no session needed
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    
    if (userError) {
      logStep("User auth error", { error: userError.message });
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }
    
    if (!user?.email) {
      logStep("No user email available");
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }
    
    logStep("User authenticated", { userId: user.id });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    
    // Fetch customer with retry
    const customers = await withRetry(
      async () => stripe.customers.list({ email: user.email!, limit: 1 }),
      { maxRetries: 3 }
    );
    
    if (customers.data.length === 0) {
      logStep("No Stripe customer found, returning inactive");
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
    logStep("Found Stripe customer", { customerId });

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
      logStep("Active subscription found", { subscriptionId: subscription.id, productId, priceId });
    } else {
      logStep("No active subscription found");
    }

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
    logStep("ERROR", { message: errorMessage });
    
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
