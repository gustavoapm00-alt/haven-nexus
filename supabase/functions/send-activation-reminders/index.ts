import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { requireCronSecret } from "../_shared/admin-auth.ts";
import { buildCorsHeaders } from "../_shared/rate-limiter.ts";


interface ActivationRequest {
  id: string;
  name: string;
  email: string;
  purchased_item: string | null;
  customer_visible_status: string;
  reminder_count: number;
  last_reminder_sent_at: string | null;
  awaiting_credentials_since: string | null;
}

// Mask email for logging (security)
function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!domain) return '***@***';
  const maskedLocal = local.length > 2 ? local[0] + '***' + local[local.length - 1] : '***';
  return `${maskedLocal}@${domain}`;
}

serve(async (req: Request) => {
  const corsHeaders = buildCorsHeaders(req);
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // SECURITY: Require cron secret for scheduled jobs
  const authResult = requireCronSecret(req);
  if (!authResult.authorized) {
    console.warn("Unauthorized send-activation-reminders attempt");
    return new Response(
      JSON.stringify({ error: authResult.error }),
      { 
        status: authResult.statusCode, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const appBaseUrl = Deno.env.get("APP_BASE_URL") || "https://aerelion.systems";
    // CRITICAL: Fallback MUST be a valid "Name <email>" format for Resend
    const senderEmail = Deno.env.get("RESEND_FROM") || "AERELION Systems <noreply@aerelion.systems>";

    // Validate required environment variables
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
      return new Response(
        JSON.stringify({ error: "Server configuration error: missing Supabase credentials" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!resendApiKey) {
      console.warn("RESEND_API_KEY not configured, skipping reminders");
      return new Response(
        JSON.stringify({ success: true, message: "Reminders skipped - no API key", sent: 0 }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find requests needing reminders (48+ hours since last reminder or never sent)
    const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();

    const { data: requests, error: fetchError } = await supabase
      .from("installation_requests")
      .select("id, name, email, purchased_item, customer_visible_status, reminder_count, last_reminder_sent_at, awaiting_credentials_since")
      .in("customer_visible_status", ["awaiting_credentials", "needs_attention"])
      .eq("reminders_disabled", false)
      .lt("reminder_count", 3)
      .or(`last_reminder_sent_at.is.null,last_reminder_sent_at.lt.${fortyEightHoursAgo}`);

    if (fetchError) {
      console.error("Error fetching requests:", fetchError);
      throw fetchError;
    }

    console.log(`Found ${requests?.length || 0} requests needing reminders`);

    let sentCount = 0;
    const errors: string[] = [];

    for (const request of (requests || []) as ActivationRequest[]) {
      try {
        const isFirstReminder = request.reminder_count === 0;
        const reminderNumber = request.reminder_count + 1;

        // Determine email subject based on status and reminder count
        let subject: string;
        if (request.customer_visible_status === "needs_attention") {
          subject = "⚠️ Action needed to continue activation | AERELION";
        } else if (reminderNumber === 1) {
          subject = "🔑 Action needed to activate your automation | AERELION";
        } else if (reminderNumber === 2) {
          subject = "🔑 Reminder: We still need access to continue | AERELION";
        } else {
          subject = "🔑 Final reminder: Access info needed | AERELION";
        }

        const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 16px; padding: 40px; border: 1px solid rgba(255,255,255,0.1);">
      
      <div style="text-align: center; margin-bottom: 32px;">
        <h1 style="color: #ffffff; font-size: 24px; margin: 0; letter-spacing: 2px;">AERELION</h1>
        <p style="color: #888; font-size: 12px; margin-top: 4px; text-transform: uppercase; letter-spacing: 1px;">Systems</p>
      </div>

      <div style="background: rgba(234, 179, 8, 0.1); border: 1px solid rgba(234, 179, 8, 0.3); border-radius: 12px; padding: 16px; margin-bottom: 24px;">
        <p style="color: #eab308; margin: 0; font-weight: 600; font-size: 14px;">
          ${request.customer_visible_status === "needs_attention" 
            ? "⚠️ We need additional information to continue" 
            : "🔑 We're waiting for access information"}
        </p>
      </div>

      <p style="color: #e0e0e0; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
        Hi ${request.name.split(" ")[0]},
      </p>

      <p style="color: #888; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">
        ${request.customer_visible_status === "needs_attention"
          ? "We need some additional information to proceed with your automation activation. Please review our message and submit the requested details."
          : `Your activation for <strong style="color: #fff;">${request.purchased_item || "your automation"}</strong> is on hold while we wait for access information to your tools.`}
      </p>

      <p style="color: #888; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">
        To continue, please submit your connection details securely through our portal. We don't store credentials directly – you can provide OAuth links, user invitations, or references to where keys are stored.
      </p>

      <div style="text-align: center; margin-bottom: 24px;">
        <a href="${appBaseUrl}/activation-request/${request.id}" style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: #fff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 600; font-size: 16px;">Submit Access Information</a>
      </div>

      <div style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 20px; margin-bottom: 24px;">
        <p style="color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 12px 0;">Connection Options</p>
        <ul style="color: #e0e0e0; font-size: 14px; margin: 0; padding-left: 20px; line-height: 1.8;">
          <li>OAuth / Secure authorization link</li>
          <li>Invite <strong>contact@aerelion.systems</strong> to your workspace</li>
          <li>Reference where API keys are stored (e.g., 1Password)</li>
        </ul>
      </div>

      <div style="text-align: center; margin-bottom: 24px;">
        <a href="${appBaseUrl}/security" style="color: #6366f1; font-size: 13px; text-decoration: none;">Learn about our security practices →</a>
      </div>

      <div style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: 24px; text-align: center;">
        <p style="color: #666; font-size: 12px; margin: 0;">
          Questions? Reply to this email or contact <a href="mailto:contact@aerelion.systems" style="color: #6366f1;">contact@aerelion.systems</a>
        </p>
      </div>

    </div>
  </div>
</body>
</html>`;

        // Send email via Resend
        const emailRes = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: senderEmail,
            to: [request.email],
            subject,
            html: emailHtml,
          }),
        });

        if (!emailRes.ok) {
          const errorText = await emailRes.text();
          console.error(`Failed to send reminder to ${maskEmail(request.email)}:`, emailRes.status, errorText);
          errors.push(`${request.id}: ${emailRes.status}`);
          continue;
        }

        // Update request with reminder tracking
        const updates: Record<string, unknown> = {
          last_reminder_sent_at: new Date().toISOString(),
          reminder_count: request.reminder_count + 1,
        };

        // Set awaiting_credentials_since on first reminder if not already set
        if (isFirstReminder && !request.awaiting_credentials_since) {
          updates.awaiting_credentials_since = new Date().toISOString();
        }

        const { error: updateError } = await supabase
          .from("installation_requests")
          .update(updates)
          .eq("id", request.id);

        if (updateError) {
          console.error(`Failed to update reminder tracking for ${request.id}:`, updateError);
          errors.push(`${request.id}: Failed to update tracking`);
        }

        sentCount++;
        console.log(`Sent reminder ${reminderNumber} to ${maskEmail(request.email)} for request ${request.id}`);
      } catch (reqError) {
        console.error(`Error processing request ${request.id}:`, reqError);
        errors.push(`${request.id}: ${reqError instanceof Error ? reqError.message : "Unknown error"}`);
      }
    }

    console.log(`Completed: sent ${sentCount} reminders, ${errors.length} errors`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        sent: sentCount, 
        errors: errors.length > 0 ? errors : undefined 
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in send-activation-reminders:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
