import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
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

    // Build email content
    const emailHtml = `
      <h2>New Activation Request</h2>
      <p>A new activation setup request has been submitted.</p>
      
      <table style="border-collapse: collapse; width: 100%; max-width: 600px;">
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Business Name</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${payload.businessName}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Contact Email</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${payload.contactEmail}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Phone</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${payload.phone || 'Not provided'}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Purchase Type</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${payload.purchaseType}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Item Name</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${payload.itemName || 'Not specified'}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Selected Tools</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${payload.selectedTools.length > 0 ? payload.selectedTools.join(', ') : 'None selected'}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Setup Window</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${payload.setupWindow}</td>
        </tr>
      </table>
      
      ${payload.notes ? `
        <h3>Additional Notes</h3>
        <p style="background: #f5f5f5; padding: 12px; border-radius: 4px;">${payload.notes}</p>
      ` : ''}
      
      <p style="margin-top: 24px; color: #666;">
        <em>This is an automated notification from AERELION Systems.</em>
      </p>
    `;

    // Check if RESEND_API_KEY is available
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    
    if (resendApiKey) {
      // Send email via Resend
      const emailRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'AERELION <noreply@aerelion.systems>',
          to: ['contact@aerelion.systems'],
          subject: `New Activation Request: ${payload.businessName}`,
          html: emailHtml,
        }),
      });

      if (!emailRes.ok) {
        const errorData = await emailRes.text();
        console.error('Resend API error:', errorData);
        // Don't fail the request if email fails - the data is still saved
      } else {
        console.log('Activation notification email sent successfully');
      }
    } else {
      console.log('RESEND_API_KEY not configured - skipping email notification');
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Notification processed' }),
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
