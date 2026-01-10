import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { checkRateLimit, getClientIp, rateLimitResponse } from "../_shared/rate-limiter.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
    apiVersion: "2024-12-18.acacia",
  });

  // Use service role for admin operations
  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    // Rate limiting for webhook endpoint (higher threshold)
    const clientIp = getClientIp(req);
    const rateLimitResult = await checkRateLimit(
      { functionName: "library-webhook", maxRequests: 120, windowSeconds: 60 },
      null, // No user for webhooks
      clientIp
    );

    if (!rateLimitResult.allowed) {
      console.warn("Rate limit exceeded for webhook from IP:", clientIp);
      return rateLimitResponse(rateLimitResult.retryAfterSeconds || 60);
    }

    const signature = req.headers.get("stripe-signature");
    const body = await req.text();
    
    let event: Stripe.Event;
    
    const webhookSecret = Deno.env.get("STRIPE_LIBRARY_WEBHOOK_SECRET");
    const allowInsecure = Deno.env.get("ALLOW_INSECURE_STRIPE_WEBHOOK") === "true";
    
    if (webhookSecret && signature) {
      try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
        console.log("✅ Webhook signature verified successfully");
      } catch (err) {
        const errMessage = err instanceof Error ? err.message : "Unknown error";
        console.error("Webhook signature verification failed:", errMessage);
        return new Response(JSON.stringify({ error: "Invalid signature" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    } else if (allowInsecure) {
      // Development mode only - allow unsigned parsing
      event = JSON.parse(body);
      console.warn("⚠️ DEV MODE: Processing webhook without signature verification");
    } else {
      // Production: require signature verification
      console.error("Webhook signature verification not configured");
      return new Response(
        JSON.stringify({ error: "Webhook signature verification is not configured." }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Log event type and session ID for observability
    console.log("Processing webhook event:", event.type);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      console.log("Processing checkout session:", session.id);
      
      if (session.payment_status === "paid") {
        const metadata = session.metadata;
        
        if (!metadata?.item_type || !metadata?.item_id) {
          console.error("Missing metadata in session:", session.id);
          return new Response(JSON.stringify({ error: "Missing metadata" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const customerEmail = session.customer_email || 
          (session.customer_details?.email) || 
          metadata.user_email;

        if (!customerEmail) {
          console.error("No customer email found");
          return new Response(JSON.stringify({ error: "No customer email" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Record the purchase
        const { error: insertError } = await supabaseAdmin
          .from("purchases")
          .upsert({
            email: customerEmail,
            item_type: metadata.item_type,
            item_id: metadata.item_id,
            amount_cents: session.amount_total || 0,
            status: "paid",
            stripe_session_id: session.id,
            stripe_payment_intent: typeof session.payment_intent === "string" 
              ? session.payment_intent 
              : session.payment_intent?.id,
            user_id: metadata.user_id || null,
          }, {
            onConflict: "stripe_session_id",
          });

        if (insertError) {
          console.error("Failed to record purchase:", insertError);
          throw new Error("Failed to record purchase");
        }

        console.log(`✅ Purchase recorded for ${customerEmail}: ${metadata.item_type} ${metadata.item_id}`);
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Webhook error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
