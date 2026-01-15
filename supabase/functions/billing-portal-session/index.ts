import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const safeDetails = details ? { ...details } : undefined;
  if (safeDetails) {
    delete safeDetails.email;
    if (safeDetails.userId && typeof safeDetails.userId === 'string') {
      safeDetails.userId = safeDetails.userId.substring(0, 8) + '...';
    }
  }
  console.log(`[BILLING-PORTAL] ${step}${safeDetails ? ` - ${JSON.stringify(safeDetails)}` : ''}`);
};

// Retry helper with exponential backoff
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 250
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      
      // Check if retryable
      const isRetryable = 
        lastError.message.includes('network') ||
        lastError.message.includes('timeout') ||
        lastError.message.includes('429') ||
        lastError.message.includes('5');
      
      if (!isRetryable || attempt === maxRetries) {
        throw lastError;
      }
      
      // Exponential backoff with jitter
      const jitter = 0.8 + Math.random() * 0.4;
      const delay = baseDelay * Math.pow(2, attempt) * jitter;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    // Validate auth token
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Missing auth token" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    
    // Create token-bound Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: { headers: { Authorization: `Bearer ${token}` } },
        auth: { persistSession: false, autoRefreshToken: false }
      }
    );

    const { data: userData, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !userData.user) {
      logStep("Auth validation failed", { error: userError?.message });
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }

    const user = userData.user;
    if (!user.email) throw new Error("User email not available");
    logStep("User authenticated", { userId: user.id });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Find customer (with simple retry logic inline)
    let customers: Stripe.ApiList<Stripe.Customer> | null = null;
    let retries = 0;
    while (retries < 3 && !customers) {
      try {
        customers = await stripe.customers.list({ email: user.email!, limit: 1 });
      } catch (err) {
        retries++;
        if (retries >= 3) throw err;
        await new Promise(r => setTimeout(r, 250 * Math.pow(2, retries)));
      }
    }

    if (!customers || customers.data.length === 0) {
      logStep("No Stripe customer found - returning inactive state");
      return new Response(
        JSON.stringify({ 
          error: null,
          inactive: true,
          message: "No billing account found. Please subscribe first."
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    const customerId = customers.data[0].id;
    logStep("Found Stripe customer", { customerId });

    const origin = req.headers.get("origin") || "https://haven-matrix.lovable.app";
    
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${origin}/portal/dashboard`,
    });

    logStep("Billing portal session created", { sessionId: portalSession.id });

    return new Response(
      JSON.stringify({ url: portalSession.url }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
