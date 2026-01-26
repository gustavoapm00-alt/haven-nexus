import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CustomerUpdatePayload {
  request_id: string;
  customer_email: string;
  business_name: string;
  purchased_item: string | null;
  tool_name: string;
  credential_method: string;
  message?: string;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload: CustomerUpdatePayload = await req.json();
    const { request_id, customer_email, business_name, purchased_item, tool_name, credential_method, message } = payload;

    console.log("Processing customer update notification:", { request_id, customer_email, tool_name });

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const appBaseUrl = Deno.env.get("APP_BASE_URL") || "https://aerelion.systems";
    const senderEmail = Deno.env.get("RESEND_FROM") || "noreply@aerelion.systems";

    if (!resendApiKey) {
      console.warn("RESEND_API_KEY not configured, skipping email notifications");
      return new Response(
        JSON.stringify({ success: true, message: "Email skipped - no API key" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const methodLabels: Record<string, string> = {
      oauth: "OAuth / Secure Link",
      api_key: "API Key Reference",
      invite_user: "User Invitation",
      other: "Other Method",
    };

    // Send admin notification
    const adminEmailHtml = `
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

      <div style="background: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.3); border-radius: 12px; padding: 16px; margin-bottom: 24px;">
        <p style="color: #22c55e; margin: 0; font-weight: 600; font-size: 14px;">🔑 Customer Submitted Access Information</p>
      </div>

      <div style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 24px; margin-bottom: 24px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="color: #888; padding: 8px 0; font-size: 14px;">Business</td>
            <td style="color: #fff; padding: 8px 0; font-size: 14px; text-align: right;">${business_name}</td>
          </tr>
          <tr>
            <td style="color: #888; padding: 8px 0; font-size: 14px;">Item</td>
            <td style="color: #fff; padding: 8px 0; font-size: 14px; text-align: right;">${purchased_item || "Automation"}</td>
          </tr>
          <tr>
            <td style="color: #888; padding: 8px 0; font-size: 14px;">Tool</td>
            <td style="color: #fff; padding: 8px 0; font-size: 14px; text-align: right;">${tool_name}</td>
          </tr>
          <tr>
            <td style="color: #888; padding: 8px 0; font-size: 14px;">Method</td>
            <td style="color: #fff; padding: 8px 0; font-size: 14px; text-align: right;">${methodLabels[credential_method] || credential_method}</td>
          </tr>
          <tr>
            <td style="color: #888; padding: 8px 0; font-size: 14px;">Customer Email</td>
            <td style="color: #fff; padding: 8px 0; font-size: 14px; text-align: right;">${customer_email}</td>
          </tr>
        </table>
      </div>

      ${message ? `
      <div style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 20px; margin-bottom: 24px;">
        <p style="color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 8px 0;">Customer Notes</p>
        <p style="color: #fff; margin: 0; font-size: 14px; line-height: 1.6;">${message}</p>
      </div>
      ` : ""}

      <div style="text-align: center;">
        <a href="${appBaseUrl}/admin" style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: #fff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 14px;">View in Admin Dashboard</a>
      </div>

    </div>
  </div>
</body>
</html>`;

    // Send customer confirmation
    const customerEmailHtml = `
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

      <div style="background: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.3); border-radius: 12px; padding: 16px; margin-bottom: 24px;">
        <p style="color: #22c55e; margin: 0; font-weight: 600; font-size: 14px;">✅ Access information received</p>
      </div>

      <p style="color: #e0e0e0; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
        Thank you for submitting your connection details for <strong style="color: #fff;">${tool_name}</strong>.
      </p>

      <p style="color: #888; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">
        We'll review your access information and proceed with activation. If we need anything else, we'll reach out.
      </p>

      <div style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 24px; margin-bottom: 24px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="color: #888; padding: 8px 0; font-size: 14px;">Automation</td>
            <td style="color: #fff; padding: 8px 0; font-size: 14px; text-align: right;">${purchased_item || "Hosted Automation"}</td>
          </tr>
          <tr>
            <td style="color: #888; padding: 8px 0; font-size: 14px;">Tool</td>
            <td style="color: #fff; padding: 8px 0; font-size: 14px; text-align: right;">${tool_name}</td>
          </tr>
          <tr>
            <td style="color: #888; padding: 8px 0; font-size: 14px;">Method</td>
            <td style="color: #fff; padding: 8px 0; font-size: 14px; text-align: right;">${methodLabels[credential_method] || credential_method}</td>
          </tr>
        </table>
      </div>

      <div style="text-align: center; margin-bottom: 24px;">
        <a href="${appBaseUrl}/activation-request/${request_id}" style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: #fff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 14px;">View Request Status</a>
      </div>

      <div style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: 24px; text-align: center;">
        <p style="color: #666; font-size: 12px; margin: 0;">
          Questions? Contact us at <a href="mailto:contact@aerelion.systems" style="color: #6366f1;">contact@aerelion.systems</a>
        </p>
      </div>

    </div>
  </div>
</body>
</html>`;

    // Track email results
    const emailResults: { admin: boolean; customer: boolean } = { admin: false, customer: false };

    // Send admin email
    try {
      const adminRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: `AERELION Systems <${senderEmail}>`,
          to: ["contact@aerelion.systems"],
          subject: `🔑 Access Info Submitted: ${business_name} – ${tool_name}`,
          html: adminEmailHtml,
        }),
      });

      if (adminRes.ok) {
        emailResults.admin = true;
        console.log("Admin email sent successfully");
      } else {
        const errorText = await adminRes.text();
        console.error("Failed to send admin email:", adminRes.status, errorText);
      }
    } catch (adminError) {
      console.error("Admin email error:", adminError);
    }

    // Send customer confirmation
    try {
      const customerRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: `AERELION Systems <${senderEmail}>`,
          to: [customer_email],
          subject: "✅ Access information received | AERELION Systems",
          html: customerEmailHtml,
        }),
      });

      if (customerRes.ok) {
        emailResults.customer = true;
        console.log("Customer confirmation email sent successfully");
      } else {
        const errorText = await customerRes.text();
        console.error("Failed to send customer email:", customerRes.status, errorText);
      }
    } catch (customerError) {
      console.error("Customer email error:", customerError);
    }

    console.log("Customer update notifications completed:", emailResults);

    return new Response(
      JSON.stringify({ success: true, emailResults }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in notify-activation-customer-update:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
