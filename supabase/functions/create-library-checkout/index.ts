import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { checkRateLimit, getClientIp, rateLimitResponse, buildCorsHeaders } from "../_shared/rate-limiter.ts";
import { SUCCESS_STATUSES } from "../_shared/purchase-constants.ts";

interface CheckoutRequest {
  item_type: "agent" | "bundle";
  item_id: string;
}

serve(async (req) => {
  const corsHeaders = buildCorsHeaders(req);
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    // Retrieve authenticated user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Authorization header required");
    }
    
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !user?.email) {
      throw new Error("User not authenticated or email not available. Please sign in to purchase.");
    }

    // Rate limiting
    const clientIp = getClientIp(req);
    const rateLimitResult = await checkRateLimit(
      { functionName: "create-library-checkout", maxRequests: 10, windowSeconds: 60 },
      user.id,
      clientIp
    );

    if (!rateLimitResult.allowed) {
      return rateLimitResponse(rateLimitResult.retryAfterSeconds || 60);
    }

    const { item_type, item_id }: CheckoutRequest = await req.json();

    if (!item_type || !item_id) {
      throw new Error("item_type and item_id are required");
    }

    // Get item details from database
    let itemName: string;
    let priceCents: number;
    let itemSlug: string;

    if (item_type === "agent") {
      const { data: agent, error } = await supabaseClient
        .from("automation_agents")
        .select("id, name, slug, price_cents, status")
        .eq("id", item_id)
        .eq("status", "published")
        .single();

      if (error || !agent) {
        throw new Error("Agent not found or not available for purchase");
      }

      itemName = agent.name;
      priceCents = agent.price_cents;
      itemSlug = agent.slug;
    } else if (item_type === "bundle") {
      const { data: bundle, error } = await supabaseClient
        .from("automation_bundles")
        .select("id, name, slug, bundle_price_cents, status")
        .eq("id", item_id)
        .eq("status", "published")
        .single();

      if (error || !bundle) {
        throw new Error("Bundle not found or not available for purchase");
      }

      itemName = bundle.name;
      priceCents = bundle.bundle_price_cents;
      itemSlug = bundle.slug;
    } else {
      throw new Error("Invalid item_type. Must be 'agent' or 'bundle'");
    }

    // Check if user already purchased this item
    const { data: existingPurchase } = await supabaseClient
      .from("purchases")
      .select("id")
      .eq("email", user.email)
      .eq("item_id", item_id)
      .eq("item_type", item_type)
      .in("status", SUCCESS_STATUSES)
      .limit(1);

    if (existingPurchase && existingPurchase.length > 0) {
      throw new Error("You have already purchased this item. Check your downloads.");
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2024-12-18.acacia",
    });

    // Check if customer exists
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId: string | undefined;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    const origin = req.headers.get("origin") || "https://aerelion.com";

    // Create checkout session with price_data for dynamic pricing
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: itemName,
              description: `${item_type === "agent" ? "Hosted Automation" : "System Bundle"}: ${itemName}`,
            },
            unit_amount: priceCents,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${origin}/purchase-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/${item_type === "agent" ? "automations" : "bundles"}/${itemSlug}?canceled=true`,
      metadata: {
        item_type,
        item_id,
        item_slug: itemSlug,
        item_name: itemName,
        user_id: user.id,
        user_email: user.email,
        mode: "self_serve",
      },
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Checkout error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
