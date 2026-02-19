import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { requireAdminAuth } from "../_shared/admin-auth.ts";
import { buildCorsHeaders } from "../_shared/rate-limiter.ts";

interface ActivationRequestPayload {
  businessName: string;
  contactEmail: string;
  phone?: string;
  purchaseType: string;
  itemName?: string;
  selectedTools: string[];
  setupWindow: string;
  notes?: string;
}

// Mask email for logging (security)
function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!domain) return '***@***';
  const maskedLocal = local.length > 2 ? local[0] + '***' + local[local.length - 1] : '***';
  return `${maskedLocal}@${domain}`;
}

const generateCustomerEmailHtml = (payload: ActivationRequestPayload) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 16px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 30px; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.1);">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600; letter-spacing: -0.5px;">AERELION</h1>
              <p style="margin: 8px 0 0; color: rgba(255,255,255,0.6); font-size: 14px;">Systems</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 16px; color: #22c55e; font-size: 20px; font-weight: 600;">✅ Activation Request Received</h2>
              <p style="margin: 0 0 24px; color: rgba(255,255,255,0.8); font-size: 16px; line-height: 1.6;">
                We received your activation request. Next, we'll review your tools and reach out if anything is missing.
              </p>
              
              <!-- Summary Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background: rgba(255,255,255,0.05); border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);">
                <tr>
                  <td style="padding: 24px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 8px 0; color: rgba(255,255,255,0.6); font-size: 14px;">Business Name</td>
                        <td style="padding: 8px 0; color: #ffffff; font-size: 14px; text-align: right; font-weight: 500;">${payload.businessName}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: rgba(255,255,255,0.6); font-size: 14px;">Item</td>
                        <td style="padding: 8px 0; color: #ffffff; font-size: 14px; text-align: right; font-weight: 500;">${payload.itemName || payload.purchaseType}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: rgba(255,255,255,0.6); font-size: 14px;">Tools to Connect</td>
                        <td style="padding: 8px 0; color: #ffffff; font-size: 14px; text-align: right; font-weight: 500;">${payload.selectedTools.length > 0 ? payload.selectedTools.join(', ') : 'To be determined'}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: rgba(255,255,255,0.6); font-size: 14px;">Setup Window</td>
                        <td style="padding: 8px 0; color: #ffffff; font-size: 14px; text-align: right; font-weight: 500;">${payload.setupWindow}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <!-- CTA Buttons -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 32px;">
                <tr>
                  <td align="center">
                    <a href="https://aerelion.systems/activation-walkthrough" style="display: inline-block; padding: 14px 28px; background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; margin-right: 12px;">View Activation Walkthrough</a>
                    <a href="https://aerelion.systems/security" style="display: inline-block; padding: 14px 28px; background: transparent; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 500; font-size: 14px; border: 1px solid rgba(255,255,255,0.3);">Security Practices</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background: rgba(0,0,0,0.3); border-top: 1px solid rgba(255,255,255,0.1);">
              <p style="margin: 0; color: rgba(255,255,255,0.5); font-size: 13px; text-align: center;">
                Questions? Contact us at <a href="mailto:contact@aerelion.systems" style="color: #3b82f6; text-decoration: none;">contact@aerelion.systems</a>
              </p>
              <p style="margin: 12px 0 0; color: rgba(255,255,255,0.4); font-size: 12px; text-align: center;">
                © ${new Date().getFullYear()} AERELION Systems. All rights reserved.
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

const generateAdminEmailHtml = (payload: ActivationRequestPayload) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
</head>
<body style="margin: 0; padding: 20px; background-color: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
    <tr>
      <td style="padding: 24px; background: #1a1a2e; color: #ffffff;">
        <h1 style="margin: 0; font-size: 18px; font-weight: 600;">🚀 New Activation Request</h1>
      </td>
    </tr>
    <tr>
      <td style="padding: 24px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
          <tr>
            <td style="padding: 12px; border: 1px solid #e5e5e5; font-weight: 600; background: #f9f9f9; width: 40%;">Business Name</td>
            <td style="padding: 12px; border: 1px solid #e5e5e5;">${payload.businessName}</td>
          </tr>
          <tr>
            <td style="padding: 12px; border: 1px solid #e5e5e5; font-weight: 600; background: #f9f9f9;">Contact Email</td>
            <td style="padding: 12px; border: 1px solid #e5e5e5;"><a href="mailto:${payload.contactEmail}">${payload.contactEmail}</a></td>
          </tr>
          <tr>
            <td style="padding: 12px; border: 1px solid #e5e5e5; font-weight: 600; background: #f9f9f9;">Phone</td>
            <td style="padding: 12px; border: 1px solid #e5e5e5;">${payload.phone || 'Not provided'}</td>
          </tr>
          <tr>
            <td style="padding: 12px; border: 1px solid #e5e5e5; font-weight: 600; background: #f9f9f9;">Purchase Type</td>
            <td style="padding: 12px; border: 1px solid #e5e5e5;">${payload.purchaseType}</td>
          </tr>
          <tr>
            <td style="padding: 12px; border: 1px solid #e5e5e5; font-weight: 600; background: #f9f9f9;">Item Name</td>
            <td style="padding: 12px; border: 1px solid #e5e5e5;">${payload.itemName || 'Not specified'}</td>
          </tr>
          <tr>
            <td style="padding: 12px; border: 1px solid #e5e5e5; font-weight: 600; background: #f9f9f9;">Selected Tools</td>
            <td style="padding: 12px; border: 1px solid #e5e5e5;">${payload.selectedTools.length > 0 ? payload.selectedTools.join(', ') : 'None selected'}</td>
          </tr>
          <tr>
            <td style="padding: 12px; border: 1px solid #e5e5e5; font-weight: 600; background: #f9f9f9;">Setup Window</td>
            <td style="padding: 12px; border: 1px solid #e5e5e5;">${payload.setupWindow}</td>
          </tr>
        </table>
        
        ${payload.notes ? `
          <div style="margin-top: 20px; padding: 16px; background: #f5f5f5; border-radius: 6px; border-left: 4px solid #3b82f6;">
            <p style="margin: 0 0 8px; font-weight: 600; color: #333;">Notes:</p>
            <p style="margin: 0; color: #666; white-space: pre-wrap;">${payload.notes}</p>
          </div>
        ` : ''}
        
        <div style="margin-top: 24px; text-align: center;">
          <a href="https://aerelion.systems/admin" style="display: inline-block; padding: 12px 24px; background: #3b82f6; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600;">Open Admin Dashboard</a>
        </div>
      </td>
    </tr>
    <tr>
      <td style="padding: 16px 24px; background: #f9f9f9; border-top: 1px solid #e5e5e5;">
        <p style="margin: 0; color: #888; font-size: 13px; text-align: center;">
          This is an automated notification from AERELION Systems.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
`;

serve(async (req) => {
  const corsHeaders = buildCorsHeaders(req);
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // SECURITY: Require admin authentication
  const authResult = await requireAdminAuth(req);
  if (!authResult.authorized) {
    console.warn("Unauthorized notify-activation-request attempt");
    return new Response(
      JSON.stringify({ error: authResult.error }),
      { 
        status: authResult.statusCode, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }

  try {
    const payload: ActivationRequestPayload = await req.json();
    
    // Validate required fields
    if (!payload.businessName || !payload.contactEmail) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(payload.contactEmail)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    
    if (resendApiKey) {
      // Send customer confirmation email
      const customerEmailRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'AERELION Systems <noreply@aerelion.systems>',
          to: [payload.contactEmail],
          subject: '✅ Activation request received | AERELION Systems',
          html: generateCustomerEmailHtml(payload),
        }),
      });

      if (!customerEmailRes.ok) {
        const errorData = await customerEmailRes.text();
        console.error('Customer email error:', errorData);
      } else {
        console.log('Customer confirmation email sent to:', maskEmail(payload.contactEmail));
      }

      // Send admin notification email
      const adminEmailRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'AERELION Systems <noreply@aerelion.systems>',
          to: ['contact@aerelion.systems'],
          subject: `🚀 New Activation Request: ${payload.businessName}`,
          html: generateAdminEmailHtml(payload),
        }),
      });

      if (!adminEmailRes.ok) {
        const errorData = await adminEmailRes.text();
        console.error('Admin email error:', errorData);
      } else {
        console.log('Admin notification email sent');
      }
    } else {
      console.log('RESEND_API_KEY not configured - skipping email notifications');
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Notifications processed' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in notify-activation-request:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
