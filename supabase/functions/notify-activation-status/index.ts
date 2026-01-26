import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface StatusNotificationPayload {
  requestId: string;
  customerEmail: string;
  businessName: string;
  newStatus: string;
  activationEta?: string;
  activationNotes?: string;
  itemName?: string;
}

const STATUS_MESSAGES: Record<string, { emoji: string; subject: string; heading: string; message: string }> = {
  received: {
    emoji: '📥',
    subject: 'Activation request received',
    heading: 'Request Received',
    message: 'We received your activation request and will begin reviewing it shortly.',
  },
  in_review: {
    emoji: '🔍',
    subject: 'Activation in review',
    heading: 'In Review',
    message: 'We are currently reviewing your activation request and the tools you need connected.',
  },
  awaiting_credentials: {
    emoji: '🔑',
    subject: 'Action needed - Credentials required',
    heading: 'Credentials Needed',
    message: 'We need access credentials for your connected tools to proceed with activation. Please check your email for next steps or reply to this message.',
  },
  in_build: {
    emoji: '🛠️',
    subject: 'Activation in progress',
    heading: 'Building Your Automation',
    message: 'We are actively configuring and building your automation. You will hear from us soon with an update.',
  },
  testing: {
    emoji: '🧪',
    subject: 'Testing your automation',
    heading: 'Testing Phase',
    message: 'Your automation is built and we are now running tests to ensure everything works correctly.',
  },
  live: {
    emoji: '✅',
    subject: 'Your automation is live!',
    heading: 'You are Live!',
    message: 'Congratulations! Your automation is now live and running. We will continue monitoring to ensure everything runs smoothly.',
  },
  paused: {
    emoji: '⏸️',
    subject: 'Activation paused',
    heading: 'Activation Paused',
    message: 'Your activation has been paused. Please contact us if you have questions or are ready to resume.',
  },
  needs_attention: {
    emoji: '⚠️',
    subject: 'Action needed on your activation',
    heading: 'Attention Needed',
    message: 'We need your input to continue with your activation. Please review the notes below or contact us.',
  },
  completed: {
    emoji: '🎉',
    subject: 'Activation completed',
    heading: 'Activation Complete',
    message: 'Your automation setup is complete. Thank you for choosing AERELION Systems.',
  },
};

const generateStatusEmailHtml = (payload: StatusNotificationPayload) => {
  const statusInfo = STATUS_MESSAGES[payload.newStatus] || STATUS_MESSAGES.received;
  
  return `
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
          
          <!-- Status Badge -->
          <tr>
            <td style="padding: 32px 40px 0; text-align: center;">
              <span style="display: inline-block; padding: 12px 24px; background: ${payload.newStatus === 'live' ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)' : payload.newStatus === 'needs_attention' || payload.newStatus === 'awaiting_credentials' ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' : 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)'}; border-radius: 100px; color: #ffffff; font-size: 16px; font-weight: 600;">
                ${statusInfo.emoji} ${statusInfo.heading}
              </span>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 32px 40px 40px;">
              <p style="margin: 0 0 24px; color: rgba(255,255,255,0.8); font-size: 16px; line-height: 1.6; text-align: center;">
                ${statusInfo.message}
              </p>
              
              <!-- Details Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background: rgba(255,255,255,0.05); border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);">
                <tr>
                  <td style="padding: 24px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 8px 0; color: rgba(255,255,255,0.6); font-size: 14px;">Business</td>
                        <td style="padding: 8px 0; color: #ffffff; font-size: 14px; text-align: right; font-weight: 500;">${payload.businessName}</td>
                      </tr>
                      ${payload.itemName ? `
                      <tr>
                        <td style="padding: 8px 0; color: rgba(255,255,255,0.6); font-size: 14px;">Automation</td>
                        <td style="padding: 8px 0; color: #ffffff; font-size: 14px; text-align: right; font-weight: 500;">${payload.itemName}</td>
                      </tr>
                      ` : ''}
                      ${payload.activationEta ? `
                      <tr>
                        <td style="padding: 8px 0; color: rgba(255,255,255,0.6); font-size: 14px;">ETA</td>
                        <td style="padding: 8px 0; color: #ffffff; font-size: 14px; text-align: right; font-weight: 500;">${payload.activationEta}</td>
                      </tr>
                      ` : ''}
                    </table>
                  </td>
                </tr>
              </table>
              
              ${payload.activationNotes ? `
              <div style="margin-top: 24px; padding: 20px; background: rgba(59, 130, 246, 0.1); border-radius: 12px; border: 1px solid rgba(59, 130, 246, 0.3);">
                <p style="margin: 0 0 8px; color: #3b82f6; font-size: 14px; font-weight: 600;">Note from AERELION:</p>
                <p style="margin: 0; color: rgba(255,255,255,0.8); font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${payload.activationNotes}</p>
              </div>
              ` : ''}
              
              <!-- CTA -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 32px;">
                <tr>
                  <td align="center">
                    <a href="https://aerelion.systems/dashboard" style="display: inline-block; padding: 14px 28px; background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px;">View Dashboard</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background: rgba(0,0,0,0.3); border-top: 1px solid rgba(255,255,255,0.1);">
              <p style="margin: 0; color: rgba(255,255,255,0.5); font-size: 13px; text-align: center;">
                Questions? Reply to this email or contact <a href="mailto:contact@aerelion.systems" style="color: #3b82f6; text-decoration: none;">contact@aerelion.systems</a>
              </p>
              <p style="margin: 12px 0 0; color: rgba(255,255,255,0.4); font-size: 12px; text-align: center;">
                AERELION Systems. All rights reserved.
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
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload: StatusNotificationPayload = await req.json();
    
    if (!payload.customerEmail || !payload.newStatus) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    const statusInfo = STATUS_MESSAGES[payload.newStatus] || STATUS_MESSAGES.received;
    
    if (resendApiKey) {
      const emailRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'AERELION Systems <noreply@aerelion.systems>',
          to: [payload.customerEmail],
          subject: `${statusInfo.emoji} ${statusInfo.subject} | AERELION Systems`,
          html: generateStatusEmailHtml(payload),
        }),
      });

      if (!emailRes.ok) {
        const errorData = await emailRes.text();
        console.error('Status notification email error:', errorData);
      } else {
        console.log(`Status notification email sent: ${payload.newStatus}`);
      }
    } else {
      console.log('RESEND_API_KEY not configured - skipping status notification');
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Status notification processed' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in notify-activation-status:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
