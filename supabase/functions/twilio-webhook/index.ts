 import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
 import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
 import { createLogger } from "../_shared/edge-logger.ts";
 import { buildCorsHeaders } from "../_shared/rate-limiter.ts";
 
 // Twilio signature validation
 async function validateTwilioSignature(
   req: Request,
   body: string,
   authToken: string
 ): Promise<boolean> {
   const signature = req.headers.get("x-twilio-signature");
   if (!signature) return false;
 
   const url = req.url;
   const params = new URLSearchParams(body);
   const sortedParams = [...params.entries()].sort((a, b) => a[0].localeCompare(b[0]));
   const paramString = sortedParams.map(([k, v]) => `${k}${v}`).join("");
   const dataToSign = url + paramString;
 
   const encoder = new TextEncoder();
   const key = await crypto.subtle.importKey(
     "raw",
     encoder.encode(authToken),
     { name: "HMAC", hash: "SHA-1" },
     false,
     ["sign"]
   );
   const signatureBytes = await crypto.subtle.sign("HMAC", key, encoder.encode(dataToSign));
   const expectedSignature = btoa(String.fromCharCode(...new Uint8Array(signatureBytes)));
 
   return signature === expectedSignature;
 }
 
 // Determine notification details based on Twilio event type
 function parseNotification(params: URLSearchParams): {
   type: string;
   title: string;
   body: string;
   severity: string;
   metadata: Record<string, unknown>;
 } | null {
   const callStatus = params.get("CallStatus");
   const messageSid = params.get("MessageSid");
   const from = params.get("From") || "Unknown";
   const to = params.get("To") || "";
   
   // SMS received
   if (messageSid && params.get("Body")) {
     const messageBody = params.get("Body") || "";
     return {
       type: "sms_received",
       title: "New SMS Received",
       body: `Message from ${from}: "${messageBody.substring(0, 100)}${messageBody.length > 100 ? '...' : ''}"`,
       severity: "info",
       metadata: {
         from,
         to,
         messageSid,
         messageBody: messageBody.substring(0, 500),
       },
     };
   }
 
   // Missed call (no-answer, busy, failed, canceled)
   if (callStatus && ["no-answer", "busy", "failed", "canceled"].includes(callStatus)) {
     return {
       type: "missed_call",
       title: "Missed Call",
       body: `You missed a call from ${from}. Status: ${callStatus}`,
       severity: "warning",
       metadata: {
         from,
         to,
         callStatus,
         callSid: params.get("CallSid"),
         callDuration: params.get("CallDuration"),
       },
     };
   }
 
   // Voicemail (recording available)
   const recordingUrl = params.get("RecordingUrl");
   if (recordingUrl) {
     return {
       type: "voicemail",
       title: "New Voicemail",
       body: `Voicemail received from ${from}`,
       severity: "info",
       metadata: {
         from,
         to,
         recordingUrl,
         recordingSid: params.get("RecordingSid"),
         recordingDuration: params.get("RecordingDuration"),
         callSid: params.get("CallSid"),
       },
     };
   }
 
   // Completed call (for logging, not notification)
   if (callStatus === "completed") {
     return {
       type: "call_completed",
       title: "Call Completed",
       body: `Call with ${from} completed`,
       severity: "success",
       metadata: {
         from,
         to,
         callSid: params.get("CallSid"),
         callDuration: params.get("CallDuration"),
       },
     };
   }
 
   return null;
 }
 
 serve(async (req) => {
   const corsHeaders = buildCorsHeaders(req);
   const logger = createLogger("twilio-webhook", req);

   if (req.method === "OPTIONS") {
     return new Response(null, { headers: corsHeaders });
   }
 
   // Twilio sends POST requests
   if (req.method !== "POST") {
     return new Response("Method not allowed", { status: 405, headers: corsHeaders });
   }
 
   try {
     const body = await req.text();
     const params = new URLSearchParams(body);
     
     logger.info("Twilio webhook received", {
       from: params.get("From"),
       callStatus: params.get("CallStatus"),
       messageSid: params.get("MessageSid"),
     });
 
     // Validate Twilio signature if auth token is configured
     const authToken = Deno.env.get("TWILIO_AUTH_TOKEN");
     if (authToken) {
       const isValid = await validateTwilioSignature(req, body, authToken);
       if (!isValid) {
         logger.warn("Invalid Twilio signature");
         return new Response("Invalid signature", { status: 403, headers: corsHeaders });
       }
       logger.info("Twilio signature validated");
     } else {
       logger.warn("TWILIO_AUTH_TOKEN not configured - skipping signature validation");
     }
 
     // Parse the notification
     const notification = parseNotification(params);
     if (!notification) {
       logger.info("No notification to create for this event");
       // Return TwiML empty response
       return new Response(
         '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
         { 
           status: 200, 
           headers: { ...corsHeaders, "Content-Type": "text/xml" } 
         }
       );
     }
 
     // Find user by phone number (To field is the Twilio number, we need to find owner)
     // For now, we'll use a mapping table or the From number to find the user
     // This requires additional setup - for MVP, we'll log and create admin notification
     
     const supabaseAdmin = createClient(
       Deno.env.get("SUPABASE_URL") ?? "",
       Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
     );
 
     // Look for user with this phone number in their profile or integration
     // For now, create an admin notification for visibility
     const { error: adminNotifError } = await supabaseAdmin
       .from("admin_notifications")
       .insert({
         type: `twilio_${notification.type}`,
         title: notification.title,
         body: notification.body,
         severity: notification.severity,
         metadata: notification.metadata,
       });
 
     if (adminNotifError) {
       logger.error("Failed to create admin notification", { error: adminNotifError });
     } else {
       logger.info("Admin notification created", { type: notification.type });
     }
 
     // If we have a way to map the phone number to a user, create client notification
     const toNumber = params.get("To");
     if (toNumber) {
       // Try to find user by phone number in integrations or a phone_numbers table
       // This is a placeholder for when phone-to-user mapping is implemented
       const { data: integration } = await supabaseAdmin
         .from("client_integrations")
         .select("user_id")
         .eq("provider", "twilio")
         .eq("status", "active")
         .limit(1)
         .maybeSingle();
 
       if (integration?.user_id) {
         const { error: clientNotifError } = await supabaseAdmin
           .from("client_notifications")
           .insert({
             user_id: integration.user_id,
             type: notification.type,
             title: notification.title,
             body: notification.body,
             severity: notification.severity,
             metadata: notification.metadata,
           });
 
         if (clientNotifError) {
           logger.error("Failed to create client notification", { error: clientNotifError });
         } else {
           logger.info("Client notification created", { userId: integration.user_id });
         }
       }
     }
 
     await logger.logResponse(200, "Webhook processed successfully");
 
     // Return TwiML response (empty for status callbacks, or with instructions for calls)
     return new Response(
       '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
       { 
         status: 200, 
         headers: { ...corsHeaders, "Content-Type": "text/xml" } 
       }
     );
 
   } catch (error) {
     const errorMessage = error instanceof Error ? error.message : "Unknown error";
     logger.error("Webhook error", { error: errorMessage });
     
     return new Response(
       JSON.stringify({ error: errorMessage }),
       { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
     );
   }
 });