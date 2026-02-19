import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { buildCorsHeaders } from "../_shared/rate-limiter.ts";


interface PurchaseEmailRequest {
  email: string;
  item_type: "agent" | "bundle";
  item_id: string;
  item_name: string;
  amount_cents: number;
  session_id: string;
}

serve(async (req: Request): Promise<Response> => {
  const corsHeaders = buildCorsHeaders(req);
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  if (!resendApiKey) {
    console.error("RESEND_API_KEY not configured");
    return new Response(
      JSON.stringify({ error: "Email service not configured" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const resend = new Resend(resendApiKey);
  const appBaseUrl = Deno.env.get("APP_BASE_URL") || "https://aerelion.com";
  const fromEmail = Deno.env.get("FROM_EMAIL") || "AERELION <noreply@aerelion.com>";

  try {
    const { email, item_type, item_id, item_name, amount_cents, session_id }: PurchaseEmailRequest = await req.json();

    if (!email || !item_type || !item_id || !item_name) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const formattedPrice = `$${(amount_cents / 100).toFixed(2)}`;
    const itemTypeLabel = item_type === "agent" ? "Automation Agent" : "System Bundle";
    const downloadUrl = `${appBaseUrl}/library/purchase-success?session_id=${session_id}`;
    const itemDetailUrl = item_type === "agent" 
      ? `${appBaseUrl}/library/agents/${item_id}`
      : `${appBaseUrl}/library/bundles/${item_id}`;

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Purchase Confirmation</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
          
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background-color: #1a1a1a; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600; letter-spacing: 2px;">AERELION</h1>
              <p style="margin: 8px 0 0; color: #707070; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Operational Automation</p>
            </td>
          </tr>
          
          <!-- Success Icon -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center;">
              <div style="width: 64px; height: 64px; margin: 0 auto; background-color: #22c55e; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                <span style="color: #ffffff; font-size: 32px; line-height: 64px;">✓</span>
              </div>
              <h2 style="margin: 24px 0 8px; color: #1a1a1a; font-size: 22px; font-weight: 600;">Purchase Confirmed</h2>
              <p style="margin: 0; color: #707070; font-size: 14px;">Thank you for your purchase</p>
            </td>
          </tr>
          
          <!-- Order Details -->
          <tr>
            <td style="padding: 0 40px 30px;">
              <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f9fafb; border-radius: 6px;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="margin: 0 0 4px; color: #707070; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">${itemTypeLabel}</p>
                    <p style="margin: 0 0 12px; color: #1a1a1a; font-size: 18px; font-weight: 600;">${item_name}</p>
                    <p style="margin: 0; color: #003366; font-size: 20px; font-weight: 600;">${formattedPrice}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Next Steps -->
          <tr>
            <td style="padding: 0 40px 30px; text-align: center;">
              <a href="${downloadUrl}" style="display: inline-block; padding: 14px 32px; background-color: #003366; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 600; border-radius: 6px; letter-spacing: 0.5px;">
                Start Activation Setup
              </a>
              <p style="margin: 16px 0 0; color: #707070; font-size: 13px;">
                We'll guide you through connecting your tools so we can activate your automation.
              </p>
            </td>
          </tr>
          
          <!-- What Happens Next -->
          <tr>
            <td style="padding: 0 40px 30px;">
              <h3 style="margin: 0 0 16px; color: #1a1a1a; font-size: 16px; font-weight: 600;">What Happens Next</h3>
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                    <span style="color: #22c55e; margin-right: 8px;">1</span>
                    <span style="color: #374151; font-size: 14px;">Complete your activation setup form</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                    <span style="color: #22c55e; margin-right: 8px;">2</span>
                    <span style="color: #374151; font-size: 14px;">Connect your tools securely</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;">
                    <span style="color: #22c55e; margin-right: 8px;">3</span>
                    <span style="color: #374151; font-size: 14px;">We activate and maintain your automation</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Support -->
          <tr>
            <td style="padding: 0 40px 40px;">
              <div style="padding: 20px; background-color: #f0f9ff; border-radius: 6px; border-left: 4px solid #003366;">
                <p style="margin: 0 0 8px; color: #1a1a1a; font-size: 14px; font-weight: 600;">Need Help?</p>
                <p style="margin: 0; color: #707070; font-size: 13px;">
                  If you have questions about your automation, visit our <a href="${appBaseUrl}/activation-walkthrough" style="color: #003366; text-decoration: none;">activation guide</a> or <a href="${appBaseUrl}/contact" style="color: #003366; text-decoration: none;">contact support</a>.
                </p>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background-color: #f9fafb; border-radius: 0 0 8px 8px; text-align: center;">
              <p style="margin: 0 0 8px; color: #707070; font-size: 12px;">
                © ${new Date().getFullYear()} AERELION Systems. All rights reserved.
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 11px;">
                This email was sent to ${email} regarding your purchase.
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    const emailResponse = await resend.emails.send({
      from: fromEmail,
      to: [email],
      subject: `Purchase Confirmed: ${item_name}`,
      html: emailHtml,
    });

    console.log("Purchase confirmation email sent:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, data: emailResponse }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error sending purchase email:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
