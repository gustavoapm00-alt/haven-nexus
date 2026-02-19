import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { buildCorsHeaders } from "../_shared/rate-limiter.ts";

interface CredentialPayload {
  requestId: string;
  credentialType: string;
  serviceName: string;
  credentials: Record<string, string>; // The sensitive data to encrypt
  metadata?: Record<string, unknown>; // Non-sensitive metadata
}

// Validate that a base64 string decodes to exactly 32 bytes (256 bits)
function validateEncryptionKey(keyBase64: string): { valid: boolean; keyBytes?: Uint8Array; error?: string } {
  try {
    // Check if it's valid base64
    const keyBytes = Uint8Array.from(atob(keyBase64), (c) => c.charCodeAt(0));
    
    // AES-256 requires exactly 32 bytes (256 bits)
    if (keyBytes.length !== 32) {
      return { 
        valid: false, 
        error: `Invalid key length: expected 32 bytes for AES-256, got ${keyBytes.length} bytes` 
      };
    }
    
    return { valid: true, keyBytes };
  } catch (e) {
    return { 
      valid: false, 
      error: "Invalid base64 encoding for encryption key" 
    };
  }
}

// AES-256-GCM encryption using Web Crypto API
async function encryptCredentials(
  plaintext: string,
  keyBytes: Uint8Array
): Promise<{ encryptedData: string; iv: string; tag: string }> {
  // Import the key - cast ArrayBuffer for proper typing with Deno
  const keyBuffer = keyBytes.buffer.slice(keyBytes.byteOffset, keyBytes.byteOffset + keyBytes.byteLength) as ArrayBuffer;
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyBuffer,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt"]
  );
  
  // Generate random IV (12 bytes for GCM)
  const iv = crypto.getRandomValues(new Uint8Array(12));
  
  // Encrypt
  const encoder = new TextEncoder();
  const plaintextBytes = encoder.encode(plaintext);
  
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv, tagLength: 128 },
    cryptoKey,
    plaintextBytes
  );
  
  // The last 16 bytes of the ciphertext are the auth tag in Web Crypto API
  const ciphertextArray = new Uint8Array(ciphertext);
  const encryptedBytes = ciphertextArray.slice(0, -16);
  const tagBytes = ciphertextArray.slice(-16);
  
  return {
    encryptedData: btoa(String.fromCharCode(...encryptedBytes)),
    iv: btoa(String.fromCharCode(...iv)),
    tag: btoa(String.fromCharCode(...tagBytes)),
  };
}

Deno.serve(async (req) => {
  const corsHeaders = buildCorsHeaders(req);
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Missing or invalid Authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const encryptionKey = Deno.env.get("CREDENTIAL_ENCRYPTION_KEY");
    
    if (!encryptionKey) {
      console.error("CREDENTIAL_ENCRYPTION_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Server configuration error: encryption key not set" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate the encryption key format and length
    const keyValidation = validateEncryptionKey(encryptionKey);
    if (!keyValidation.valid) {
      console.error("CREDENTIAL_ENCRYPTION_KEY validation failed:", keyValidation.error);
      return new Response(
        JSON.stringify({ error: "Server configuration error: invalid encryption key format. Generate with: openssl rand -base64 32" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const keyBytes = keyValidation.keyBytes!;

    // Create Supabase client with user's auth
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Verify JWT and get user
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !userData?.user) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userEmail = userData.user.email;
    if (!userEmail) {
      return new Response(
        JSON.stringify({ error: "User email not found" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request body
    const payload: CredentialPayload = await req.json();
    const { requestId, credentialType, serviceName, credentials, metadata } = payload;

    // Validate required fields
    if (!requestId || !credentialType || !serviceName || !credentials) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: requestId, credentialType, serviceName, credentials" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify user owns this installation request
    const { data: installRequest, error: requestError } = await supabase
      .from("installation_requests")
      .select("id, email, status")
      .eq("id", requestId)
      .single();

    if (requestError || !installRequest) {
      return new Response(
        JSON.stringify({ error: "Installation request not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (installRequest.email !== userEmail) {
      return new Response(
        JSON.stringify({ error: "You do not have permission to add credentials to this request" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // SECURITY: Never log credential values
    console.log(`Encrypting credentials for request ${requestId}, type: ${credentialType}`);

    // Encrypt the credentials
    const credentialsJson = JSON.stringify(credentials);
    const { encryptedData, iv, tag } = await encryptCredentials(credentialsJson, keyBytes);

    // Store encrypted credentials
    const { data: credentialRecord, error: insertError } = await supabase
      .from("activation_credentials")
      .upsert({
        request_id: requestId,
        credential_type: credentialType,
        service_name: serviceName,
        encrypted_data: encryptedData,
        encryption_iv: iv,
        encryption_tag: tag,
        created_by: userEmail,
        status: "active",
        metadata: metadata || {},
        updated_at: new Date().toISOString(),
      }, {
        onConflict: "request_id,credential_type",
      })
      .select("id, credential_type, service_name, status, created_at")
      .single();

    if (insertError) {
      console.error("Failed to store credentials:", insertError.message);
      return new Response(
        JSON.stringify({ error: "Failed to store credentials" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update installation request to track credential submission
    const { data: existingCreds } = await supabase
      .from("activation_credentials")
      .select("id")
      .eq("request_id", requestId)
      .eq("status", "active");

    await supabase
      .from("installation_requests")
      .update({
        credentials_submitted_at: new Date().toISOString(),
        credentials_count: existingCreds?.length || 1,
        customer_visible_status: "in_review",
        status_updated_at: new Date().toISOString(),
      })
      .eq("id", requestId);

    console.log(`Credentials stored successfully for request ${requestId}`);

    // Create admin notification (in-app, no email dependency)
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (serviceRoleKey) {
      try {
        const adminClient = createClient(supabaseUrl, serviceRoleKey);
        
        // Insert admin notification
        const { error: adminNotifyError } = await adminClient
          .from("admin_notifications")
          .insert({
            type: "credential_submitted",
            title: "Credentials Submitted",
            body: `${serviceName} access authorized for request ${requestId.slice(0, 8)}...`,
            severity: "info",
            metadata: {
              requestId,
              serviceName,
              credentialType,
              customerEmail: userEmail,
              credentialsCount: existingCreds?.length || 1,
            },
          });

        if (adminNotifyError) {
          console.error("Failed to create admin notification:", adminNotifyError.message);
        } else {
          console.log("Admin notification created for credential submission");
        }

        // Create in-app notification for the client
        const { data: profileData } = await adminClient
          .from("profiles")
          .select("id")
          .eq("id", userData.user.id)
          .single();
        
        if (profileData) {
          const { error: clientNotifyError } = await adminClient
            .from("client_notifications")
            .insert({
              user_id: profileData.id,
              type: "credential_submitted",
              title: "Access Authorized",
              body: `Your ${serviceName} credentials have been securely stored. AERELION is now activating your automation.`,
              severity: "success",
              metadata: { requestId, serviceName, credentialType },
            });

          if (clientNotifyError) {
            console.error("Failed to create client notification:", clientNotifyError.message);
          } else {
            console.log("Client notification created");
          }
        }

        // Optional: Send to Slack webhook if configured
        const slackWebhookUrl = Deno.env.get("SLACK_WEBHOOK_URL");
        if (slackWebhookUrl) {
          try {
            await fetch(slackWebhookUrl, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                text: `🔑 *Credentials Submitted*\n*Service:* ${serviceName}\n*Type:* ${credentialType}\n*Request:* ${requestId.slice(0, 8)}...`,
                blocks: [
                  {
                    type: "section",
                    text: {
                      type: "mrkdwn",
                      text: `🔑 *Credentials Submitted*\n*Service:* ${serviceName}\n*Type:* ${credentialType}\n*Request:* \`${requestId.slice(0, 8)}...\``,
                    },
                  },
                ],
              }),
            });
            console.log("Slack notification sent");
          } catch (slackError) {
            console.error("Slack notification failed (non-fatal):", slackError);
          }
        }
      } catch (notifyError) {
        // Don't fail the request if notification fails
        console.error("Failed to send notifications:", notifyError);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        credential: {
          id: credentialRecord.id,
          credentialType: credentialRecord.credential_type,
          serviceName: credentialRecord.service_name,
          status: credentialRecord.status,
          createdAt: credentialRecord.created_at,
        },
        message: "Credentials encrypted and stored securely",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in store-activation-credentials:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
