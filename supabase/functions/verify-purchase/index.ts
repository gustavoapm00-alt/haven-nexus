import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { PURCHASE_SUCCESS_STATUS } from "../_shared/purchase-constants.ts";
import { buildCorsHeaders } from "../_shared/rate-limiter.ts";

interface VerifyRequest {
  session_id: string;
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

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
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
      throw new Error("User not authenticated");
    }

    const { session_id }: VerifyRequest = await req.json();

    if (!session_id) {
      throw new Error("session_id is required");
    }

    // Initialize Stripe with stable API version
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2024-12-18.acacia",
    });

    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (!session) {
      throw new Error("Session not found");
    }

    // Verify the email matches
    const sessionEmail = session.customer_email || session.customer_details?.email;
    if (sessionEmail !== user.email) {
      throw new Error("This purchase belongs to a different account");
    }

    if (session.payment_status !== "paid") {
      throw new Error("Payment not completed");
    }

    const metadata = session.metadata;
    if (!metadata?.item_type || !metadata?.item_id) {
      throw new Error("Invalid session metadata");
    }

    // Check if purchase already recorded
    const { data: existingPurchase } = await supabaseClient
      .from("purchases")
      .select("id")
      .eq("stripe_session_id", session_id)
      .single();

    // If not recorded (webhook hasn't fired yet), record it now
    if (!existingPurchase) {
      const { error: insertError } = await supabaseAdmin
        .from("purchases")
        .insert({
          email: user.email,
          item_type: metadata.item_type,
          item_id: metadata.item_id,
          amount_cents: session.amount_total || 0,
          status: PURCHASE_SUCCESS_STATUS,
          stripe_session_id: session.id,
          stripe_payment_intent: typeof session.payment_intent === "string" 
            ? session.payment_intent 
            : session.payment_intent?.id,
          user_id: user.id,
        });

      if (insertError) {
        console.error("Failed to record purchase:", insertError);
        // Don't throw - the webhook might handle it
      }
    }

    // Get item details for the response
    let itemName = "";
    let itemSlug = "";

    if (metadata.item_type === "agent") {
      const { data: agent } = await supabaseClient
        .from("automation_agents")
        .select("name, slug")
        .eq("id", metadata.item_id)
        .single();
      
      if (agent) {
        itemName = agent.name;
        itemSlug = agent.slug;
      }
    } else {
      const { data: bundle } = await supabaseClient
        .from("automation_bundles")
        .select("name, slug")
        .eq("id", metadata.item_id)
        .single();
      
      if (bundle) {
        itemName = bundle.name;
        itemSlug = bundle.slug;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        item_type: metadata.item_type,
        item_id: metadata.item_id,
        item_name: itemName,
        item_slug: itemSlug,
        amount_cents: session.amount_total,
        email: user.email,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Verify purchase error:", error);
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
