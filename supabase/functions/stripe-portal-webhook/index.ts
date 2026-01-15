import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const safeDetails = details ? { ...details } : undefined;
  if (safeDetails?.email) delete safeDetails.email;
  console.log(`[STRIPE-PORTAL-WEBHOOK] ${step}${safeDetails ? ` - ${JSON.stringify(safeDetails)}` : ''}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Webhook received");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_LIBRARY_WEBHOOK_SECRET");
    const resendKey = Deno.env.get("RESEND_API_KEY");

    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY not set");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const signature = req.headers.get("stripe-signature");
    const body = await req.text();

    let event: Stripe.Event;

    // Verify signature if secret is configured
    if (webhookSecret && signature) {
      try {
        event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
        logStep("Signature verified");
      } catch (err) {
        logStep("Signature verification failed", { error: String(err) });
        return new Response(
          JSON.stringify({ error: "Invalid signature" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
      }
    } else {
      // Allow insecure for testing
      const allowInsecure = Deno.env.get("ALLOW_INSECURE_STRIPE_WEBHOOK") === "true";
      if (!allowInsecure) {
        return new Response(
          JSON.stringify({ error: "Webhook secret not configured" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
      }
      event = JSON.parse(body);
      logStep("Insecure mode - parsed without verification");
    }

    // Create admin Supabase client
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Map customer to user
    const getCustomerEmail = async (customerId: string): Promise<string | null> => {
      const customer = await stripe.customers.retrieve(customerId);
      if (customer.deleted) return null;
      return (customer as Stripe.Customer).email;
    };

    const getUserByEmail = async (email: string): Promise<string | null> => {
      const { data } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .limit(1)
        .single();
      return data?.id || null;
    };

    const createNotification = async (
      userId: string,
      type: string,
      title: string,
      body: string,
      severity: string = 'info',
      metadata: Record<string, unknown> = {}
    ) => {
      await supabase.from('client_notifications').insert({
        user_id: userId,
        type,
        title,
        body,
        severity,
        metadata
      });
      logStep("Notification created", { userId: userId.substring(0, 8), type });
    };

    const updateBillingStatus = async (
      userId: string,
      customerId: string,
      subscription?: Stripe.Subscription
    ) => {
      const billingData: Record<string, unknown> = {
        user_id: userId,
        stripe_customer_id: customerId,
        updated_at: new Date().toISOString()
      };

      if (subscription) {
        billingData.subscription_id = subscription.id;
        billingData.status = subscription.status === 'active' ? 'active' : 
                             subscription.status === 'trialing' ? 'trialing' :
                             subscription.status === 'past_due' ? 'past_due' :
                             subscription.status === 'canceled' ? 'canceled' : 'inactive';
        billingData.current_price_id = subscription.items.data[0]?.price.id || null;
        billingData.current_product_id = subscription.items.data[0]?.price.product as string || null;
        billingData.subscription_end = subscription.current_period_end 
          ? new Date(subscription.current_period_end * 1000).toISOString()
          : null;
      }

      await supabase.from('client_billing').upsert(billingData, { onConflict: 'user_id' });
      logStep("Billing status updated", { userId: userId.substring(0, 8), status: billingData.status });
    };

    const sendEmail = async (email: string, subject: string, html: string) => {
      if (!resendKey) {
        logStep("Email skipped - no RESEND_API_KEY");
        return;
      }

      // Check user preferences
      const { data: billing } = await supabase
        .from('client_billing')
        .select('email_notifications_enabled')
        .eq('stripe_customer_id', (event.data.object as { customer?: string }).customer)
        .single();

      if (billing && billing.email_notifications_enabled === false) {
        logStep("Email skipped - user disabled notifications");
        return;
      }

      // Use fetch to call Resend API directly
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${resendKey}`
        },
        body: JSON.stringify({
          from: "AERELION <notifications@resend.dev>",
          to: [email],
          subject,
          html
        })
      });
      
      if (!res.ok) {
        const errText = await res.text();
        logStep("Email failed", { status: res.status, error: errText });
        return;
      }
      logStep("Email sent", { subject });
    };

    // Handle events
    logStep("Processing event", { type: event.type });

    switch (event.type) {
      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        const email = await getCustomerEmail(customerId);
        
        if (email) {
          const userId = await getUserByEmail(email);
          if (userId) {
            await createNotification(
              userId,
              'sub_active',
              'Payment Successful',
              `Your payment of $${(invoice.amount_paid / 100).toFixed(2)} was processed successfully.`,
              'success',
              { invoice_id: invoice.id, amount: invoice.amount_paid }
            );

            if (invoice.subscription) {
              const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
              await updateBillingStatus(userId, customerId, subscription);
            }

            await sendEmail(
              email,
              'Payment Successful - AERELION',
              `<h2>Payment Received</h2>
               <p>Your payment of <strong>$${(invoice.amount_paid / 100).toFixed(2)}</strong> has been processed.</p>
               <p>Thank you for your continued trust in AERELION.</p>
               <p><a href="https://haven-matrix.lovable.app/portal/dashboard">View Dashboard</a></p>`
            );
          }
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        const email = await getCustomerEmail(customerId);
        
        if (email) {
          const userId = await getUserByEmail(email);
          if (userId) {
            await createNotification(
              userId,
              'payment_failed',
              'Payment Failed',
              'We couldn\'t process your payment. Please update your payment method to avoid service interruption.',
              'critical',
              { invoice_id: invoice.id }
            );

            await sendEmail(
              email,
              'Action Required: Payment Failed - AERELION',
              `<h2>Payment Failed</h2>
               <p>We were unable to process your payment.</p>
               <p>Please <a href="https://haven-matrix.lovable.app/portal/dashboard">update your payment method</a> to continue using AERELION services.</p>`
            );
          }
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const email = await getCustomerEmail(customerId);
        
        if (email) {
          const userId = await getUserByEmail(email);
          if (userId) {
            await updateBillingStatus(userId, customerId, subscription);

            // Check for renewal reminder (7 days before)
            const endDate = new Date(subscription.current_period_end * 1000);
            const now = new Date();
            const daysUntilRenewal = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

            if (daysUntilRenewal <= 7 && daysUntilRenewal > 0 && subscription.status === 'active') {
              // Check if user wants renewal reminders
              const { data: billing } = await supabase
                .from('client_billing')
                .select('renewal_reminders_enabled')
                .eq('user_id', userId)
                .single();

              if (!billing || billing.renewal_reminders_enabled !== false) {
                await createNotification(
                  userId,
                  'renewal_soon',
                  'Subscription Renewal Coming Up',
                  `Your subscription will renew on ${endDate.toLocaleDateString()}.`,
                  'info',
                  { renewal_date: endDate.toISOString(), days_until: daysUntilRenewal }
                );
              }
            }
          }
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const email = await getCustomerEmail(customerId);
        
        if (email) {
          const userId = await getUserByEmail(email);
          if (userId) {
            await supabase
              .from('client_billing')
              .update({
                status: 'canceled',
                subscription_id: null,
                current_price_id: null,
                current_product_id: null,
                updated_at: new Date().toISOString()
              })
              .eq('user_id', userId);

            await createNotification(
              userId,
              'canceled',
              'Subscription Canceled',
              'Your subscription has been canceled. We\'re sorry to see you go.',
              'warning',
              { subscription_id: subscription.id }
            );

            await sendEmail(
              email,
              'Subscription Canceled - AERELION',
              `<h2>Your Subscription Has Been Canceled</h2>
               <p>We're sorry to see you go. Your access will continue until your billing period ends.</p>
               <p>You can resubscribe anytime from your <a href="https://haven-matrix.lovable.app/portal/dashboard">dashboard</a>.</p>`
            );
          }
        }
        break;
      }

      default:
        logStep("Unhandled event type", { type: event.type });
    }

    return new Response(
      JSON.stringify({ received: true }),
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
