import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { requireAdminAuth } from "../_shared/admin-auth.ts";
import { buildCorsHeaders } from "../_shared/rate-limiter.ts";

// AES-256-GCM decryption using Web Crypto API
async function decryptCredentials(
  encryptedData: string,
  iv: string,
  tag: string,
  keyBase64: string
): Promise<string> {
  // Decode the base64 key
  const keyBytes = Uint8Array.from(atob(keyBase64), (c) => c.charCodeAt(0));
  
  // Import the key
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyBytes,
    { name: "AES-GCM", length: 256 },
    false,
    ["decrypt"]
  );
  
  // Decode IV, ciphertext, and tag
  const ivBytes = Uint8Array.from(atob(iv), (c) => c.charCodeAt(0));
  const encryptedBytes = Uint8Array.from(atob(encryptedData), (c) => c.charCodeAt(0));
  const tagBytes = Uint8Array.from(atob(tag), (c) => c.charCodeAt(0));
  
  // Combine ciphertext and tag (Web Crypto expects them together)
  const ciphertextWithTag = new Uint8Array(encryptedBytes.length + tagBytes.length);
  ciphertextWithTag.set(encryptedBytes);
  ciphertextWithTag.set(tagBytes, encryptedBytes.length);
  
  // Decrypt
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: ivBytes, tagLength: 128 },
    cryptoKey,
    ciphertextWithTag
  );
  
  const decoder = new TextDecoder();
  return decoder.decode(decrypted);
}

Deno.serve(async (req) => {
  const corsHeaders = buildCorsHeaders(req);
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Verify admin authentication
    const authResult = await requireAdminAuth(req);
    if (!authResult.authorized) {
      return new Response(
        JSON.stringify({ error: authResult.error }),
        { status: authResult.statusCode, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const encryptionKey = Deno.env.get("CREDENTIAL_ENCRYPTION_KEY");
    if (!encryptionKey) {
      console.error("CREDENTIAL_ENCRYPTION_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    // Use service role for admin access
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request
    const url = new URL(req.url);
    const credentialId = url.searchParams.get("credentialId");
    const requestId = url.searchParams.get("requestId");

    if (!credentialId && !requestId) {
      return new Response(
        JSON.stringify({ error: "Either credentialId or requestId is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // SECURITY: Log admin access for audit trail
    console.log(`Admin ${authResult.userId} requesting credential decryption for ${credentialId || `request ${requestId}`}`);

    // Fetch credential(s)
    let query = supabase
      .from("activation_credentials")
      .select("*");

    if (credentialId) {
      query = query.eq("id", credentialId);
    } else if (requestId) {
      query = query.eq("request_id", requestId);
    }

    const { data: credentials, error: fetchError } = await query;

    if (fetchError) {
      console.error("Failed to fetch credentials:", fetchError.message);
      return new Response(
        JSON.stringify({ error: "Failed to fetch credentials" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!credentials || credentials.length === 0) {
      return new Response(
        JSON.stringify({ error: "No credentials found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Decrypt each credential
    const decryptedCredentials = await Promise.all(
      credentials.map(async (cred) => {
        try {
          const decryptedJson = await decryptCredentials(
            cred.encrypted_data,
            cred.encryption_iv,
            cred.encryption_tag,
            encryptionKey
          );
          
          const decryptedData = JSON.parse(decryptedJson);
          
          return {
            id: cred.id,
            requestId: cred.request_id,
            credentialType: cred.credential_type,
            serviceName: cred.service_name,
            status: cred.status,
            createdAt: cred.created_at,
            createdBy: cred.created_by,
            metadata: cred.metadata,
            // IMPORTANT: Decrypted credentials - handle with extreme care
            credentials: decryptedData,
          };
        } catch (decryptError) {
          console.error(`Failed to decrypt credential ${cred.id}:`, decryptError);
          return {
            id: cred.id,
            requestId: cred.request_id,
            credentialType: cred.credential_type,
            serviceName: cred.service_name,
            status: cred.status,
            error: "Decryption failed - credential may be corrupted",
          };
        }
      })
    );

    // Update last_verified_at for accessed credentials
    const credentialIds = credentials.map((c) => c.id);
    await supabase
      .from("activation_credentials")
      .update({ last_verified_at: new Date().toISOString() })
      .in("id", credentialIds);

    return new Response(
      JSON.stringify({
        success: true,
        credentials: decryptedCredentials,
        accessedBy: authResult.userId,
        accessedAt: new Date().toISOString(),
        warning: "SENSITIVE DATA - Do not log, store, or transmit these credentials",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in read-activation-credentials:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
