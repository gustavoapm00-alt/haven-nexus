import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

/**
 * Integration Connection Manager
 * 
 * CONNECT ONCE. RUN MANY.
 * 
 * Credentials are stored at the USER LEVEL, not per-activation.
 * This allows users to connect HubSpot once and use it across all automations.
 * 
 * Schema: integration_connections
 * - user_id: Owner of the credential
 * - provider: hubspot, gmail, etc.
 * - encrypted_payload: AES-256-GCM encrypted credentials
 * - activation_request_id: NULL (user-level connections, not activation-specific)
 * 
 * Auto-Activation:
 * When all required integrations for an activation are connected,
 * automatically triggers the provisioning webhook.
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Encryption utilities using Web Crypto API
async function encryptData(data: string, keyBase64: string): Promise<{ encrypted: string; iv: string; tag: string }> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  
  // Decode base64 key using standard base64 decoding that handles padding correctly
  let keyBytes: Uint8Array;
  try {
    // Handle both standard and URL-safe base64
    const normalizedKey = keyBase64.replace(/-/g, '+').replace(/_/g, '/');
    const binaryString = atob(normalizedKey);
    keyBytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      keyBytes[i] = binaryString.charCodeAt(i);
    }
  } catch (e) {
    console.error("Failed to decode encryption key - ensure it's valid base64");
    throw new Error("Invalid encryption key format");
  }
  
  if (keyBytes.length !== 32) {
    throw new Error(`Encryption key must be 32 bytes, got ${keyBytes.length}`);
  }
  
  // Generate IV (12 bytes for GCM)
  const iv = crypto.getRandomValues(new Uint8Array(12));
  
  // Import key - use ArrayBuffer for compatibility
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyBytes.buffer as ArrayBuffer,
    { name: "AES-GCM" },
    false,
    ["encrypt"]
  );
  
  // Encrypt
  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    cryptoKey,
    dataBuffer
  );
  
  // Extract ciphertext and auth tag (last 16 bytes)
  const encryptedArray = new Uint8Array(encryptedBuffer);
  const ciphertext = encryptedArray.slice(0, -16);
  const tag = encryptedArray.slice(-16);
  
  // Convert to base64 strings
  const toBase64 = (arr: Uint8Array): string => {
    let binary = '';
    for (let i = 0; i < arr.length; i++) {
      binary += String.fromCharCode(arr[i]);
    }
    return btoa(binary);
  };
  
  return {
    encrypted: toBase64(ciphertext),
    iv: toBase64(iv),
    tag: toBase64(tag),
  };
}

// Types for Supabase data
interface Activation {
  automation_id: string | null;
  status: string | null;
}

interface Automation {
  id: string;
  slug: string;
  systems: string[] | null;
  required_integrations: { provider?: string }[] | null;
  n8n_template_ids: string[] | null;
}

interface UserConnection {
  id: string;
  provider: string;
  status: string;
  connected_email: string | null;
  granted_scopes: string[] | null;
}

// Helper to check if all required integrations are connected and trigger auto-activation
async function checkAndAutoActivate(
  supabaseAdmin: any,
  userId: string,
  userEmail: string,
  activationRequestId: string
): Promise<{ triggered: boolean; error?: string }> {
  // Get activation and its automation
  const { data: activation } = await supabaseAdmin
    .from("installation_requests")
    .select("automation_id, status")
    .eq("id", activationRequestId)
    .eq("email", userEmail)
    .maybeSingle() as { data: Activation | null };

  if (!activation?.automation_id) {
    return { triggered: false, error: "Activation not found" };
  }

  // Don't auto-activate if already live or in_build
  if (["live", "active", "in_build"].includes(activation.status || "")) {
    return { triggered: false };
  }

  // Get automation details
  const { data: automation } = await supabaseAdmin
    .from("automation_agents")
    .select("id, slug, systems, required_integrations, n8n_template_ids")
    .eq("id", activation.automation_id)
    .maybeSingle() as { data: Automation | null };

  if (!automation) {
    return { triggered: false, error: "Automation not found" };
  }

  // Determine required providers
  let requiredProviders: string[] = [];
  if (automation.required_integrations && Array.isArray(automation.required_integrations)) {
    requiredProviders = automation.required_integrations
      .map((ri) => (ri.provider || '').toLowerCase())
      .filter(Boolean);
  } else if (automation.systems) {
    requiredProviders = automation.systems.map((s: string) => s.toLowerCase());
  }

  // Get user's connected integrations (user-level)
  const { data: userConnections } = await supabaseAdmin
    .from("integration_connections")
    .select("provider")
    .eq("user_id", userId)
    .eq("status", "connected") as { data: { provider: string }[] | null };

  const connectedProviders = new Set(
    (userConnections || []).map(c => c.provider.toLowerCase())
  );

  const allConnected = requiredProviders.length > 0 && 
    requiredProviders.every(p => connectedProviders.has(p));

  if (!allConnected) {
    return { triggered: false };
  }

  // All required integrations connected - ready for activation!
  console.log(`Ready for activation: All required integrations connected for activation ${activationRequestId}`);

  // Verify automation has templates configured (template-based model)
  if (!automation.n8n_template_ids || automation.n8n_template_ids.length === 0) {
    console.log(`No n8n_template_ids configured for automation ${automation.id}, marking ready but not auto-activating`);
    
    // Update to indicate ready for manual activation
    await supabaseAdmin
      .from("installation_requests")
      .update({
        status: "awaiting_activation",
        customer_visible_status: "awaiting_activation",
        credentials_submitted_at: new Date().toISOString(),
        status_updated_at: new Date().toISOString(),
      })
      .eq("id", activationRequestId);
    
    return { triggered: false, error: "No template linked to automation" };
  }

  // Update activation status - mark as ready for provisioning
  await supabaseAdmin
    .from("installation_requests")
    .update({
      status: "in_build",
      customer_visible_status: "in_build",
      credentials_submitted_at: new Date().toISOString(),
      status_updated_at: new Date().toISOString(),
    })
    .eq("id", activationRequestId);

  // AUTO-ACTIVATE: Call the n8n-provision edge function to duplicate and activate
  // This uses the template-based model (no deprecated automation_agents.webhook_url)
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !serviceRoleKey) {
      console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
      return { triggered: false, error: "Server configuration error" };
    }

    console.log(`Auto-activating via n8n-provision for activation ${activationRequestId}`);
    
    const response = await fetch(`${supabaseUrl}/functions/v1/n8n-provision`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${serviceRoleKey}`,
      },
      body: JSON.stringify({
        action: "activate",
        activationRequestId,
        userId,
        config: {},
      }),
    });

    const result = await response.json();
    const provisionSuccess = response.ok && result.success;

    if (provisionSuccess) {
      // Create success notification
      await supabaseAdmin
        .from("client_notifications")
        .insert({
          user_id: userId,
          type: "automation_activated",
          title: "Automation Activated!",
          body: "All required integrations connected. Your automation is now live.",
          severity: "success",
          metadata: { 
            activation_request_id: activationRequestId,
            webhook_url: result.webhookUrl,
          },
        });

      console.log(`Auto-activation successful: ${result.webhookUrl}`);
    } else {
      console.error("Auto-activation failed:", result.error || result.message);
      
      // Update status to needs_attention
      await supabaseAdmin
        .from("installation_requests")
        .update({
          status: "needs_attention",
          customer_visible_status: "needs_attention",
          activation_notes_internal: `Auto-activation failed: ${result.error || result.message || "Unknown error"}`,
          status_updated_at: new Date().toISOString(),
        })
        .eq("id", activationRequestId);
    }

    return { triggered: provisionSuccess, error: provisionSuccess ? undefined : (result.error || "Provisioning failed") };
  } catch (err) {
    console.error("Auto-activation call failed:", err);
    
    // Update status to needs_attention
    await supabaseAdmin
      .from("installation_requests")
      .update({
        status: "needs_attention",
        customer_visible_status: "needs_attention",
        activation_notes_internal: `Auto-activation exception: ${err instanceof Error ? err.message : "Unknown error"}`,
        status_updated_at: new Date().toISOString(),
      })
      .eq("id", activationRequestId);
    
    return { triggered: false, error: err instanceof Error ? err.message : "Activation failed" };
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate authorization
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    // Use getUser() - stable method in supabase-js v2
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) {
      console.warn("JWT verification failed:", userError?.message);
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = userData.user.id;
    const userEmail = userData.user.email as string;

    const { 
      action, 
      activationRequestId,  // Optional - for checking required integrations
      provider, 
      credentials, 
      grantedScopes,
      connectedEmail,
    } = await req.json();

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    switch (action) {
      case "connect": {
        // Encrypt credentials
        const encryptionKey = Deno.env.get("CREDENTIAL_ENCRYPTION_KEY");
        if (!encryptionKey) {
          console.error("CREDENTIAL_ENCRYPTION_KEY not configured");
          return new Response(
            JSON.stringify({ error: "Server configuration error" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const { encrypted, iv, tag } = await encryptData(
          JSON.stringify(credentials),
          encryptionKey
        );

        // CONNECT ONCE: Upsert by user_id + provider only (no activation_request_id)
        // Check for existing connection for this user + provider
        const { data: existingConnection } = await supabaseAdmin
          .from("integration_connections")
          .select("id")
          .eq("user_id", userId)
          .eq("provider", provider)
          .not("status", "in", "(archived,revoked)")
          .maybeSingle();

        if (existingConnection) {
          // Update existing connection
          const { error: updateError } = await supabaseAdmin
            .from("integration_connections")
            .update({
              status: "connected",
              encrypted_payload: encrypted,
              encryption_iv: iv,
              encryption_tag: tag,
              granted_scopes: grantedScopes || [],
              connected_email: connectedEmail || null,
              activation_request_id: null, // User-level, not activation-specific
              updated_at: new Date().toISOString(),
            })
            .eq("id", existingConnection.id);

          if (updateError) {
            console.error("Failed to update connection:", updateError);
            return new Response(
              JSON.stringify({ error: "Failed to update connection" }),
              { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
        } else {
          // Insert new connection (user-level, no activation binding)
          const { error: insertError } = await supabaseAdmin
            .from("integration_connections")
            .insert({
              user_id: userId,
              activation_request_id: null,  // CONNECT ONCE: No activation binding
              provider,
              status: "connected",
              encrypted_payload: encrypted,
              encryption_iv: iv,
              encryption_tag: tag,
              granted_scopes: grantedScopes || [],
              connected_email: connectedEmail || null,
            });

          if (insertError) {
            console.error("Failed to save connection:", insertError);
            return new Response(
              JSON.stringify({ error: "Failed to save connection" }),
              { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
        }

        // If activation request provided, check if auto-activation should happen
        let autoActivated = false;
        if (activationRequestId) {
          const result = await checkAndAutoActivate(
            supabaseAdmin,
            userId as string,
            userEmail,
            activationRequestId
          );
          autoActivated = result.triggered;
        }

        // Create admin notification
        await supabaseAdmin
          .from("admin_notifications")
          .insert({
            type: "integration_connected",
            title: `Integration Connected: ${provider}`,
            body: `User ${userEmail} connected ${provider} (account-level credential)`,
            severity: "info",
            metadata: {
              user_id: userId,
              provider,
              customer_email: userEmail,
              activation_request_id: activationRequestId || null,
              auto_activated: autoActivated,
            },
          });

        return new Response(
          JSON.stringify({ 
            success: true, 
            autoActivated,
            message: autoActivated 
              ? `${provider} connected and automation activated!`
              : `${provider} connected successfully` 
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "revoke": {
        // Revoke user's connection for this provider (user-level revocation)
        await supabaseAdmin
          .from("integration_connections")
          .update({
            status: "revoked",
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", userId)
          .eq("provider", provider);

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "status": {
        // Get all user's connections (account-level)
        const { data: connections } = await supabaseAdmin
          .from("integration_connections")
          .select("provider, status, connected_email, granted_scopes, created_at, updated_at")
          .eq("user_id", userId)
          .not("status", "in", "(revoked,archived)");

        return new Response(
          JSON.stringify({ connections: connections || [] }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "check_ready": {
        // Check if all required integrations for an activation are connected
        if (!activationRequestId) {
          return new Response(
            JSON.stringify({ error: "activationRequestId required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Get activation and verify ownership
        const { data: activation } = await supabaseAdmin
          .from("installation_requests")
          .select("automation_id, status")
          .eq("id", activationRequestId)
          .eq("email", userEmail)
          .maybeSingle();

        if (!activation?.automation_id) {
          return new Response(
            JSON.stringify({ error: "Activation not found" }),
            { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Get required integrations
        const { data: automation } = await supabaseAdmin
          .from("automation_agents")
          .select("systems, required_integrations")
          .eq("id", activation.automation_id)
          .maybeSingle();

        let requiredProviders: string[] = [];
        if (automation?.required_integrations && Array.isArray(automation.required_integrations)) {
          requiredProviders = automation.required_integrations
            .map((ri: { provider?: string }) => (ri.provider || '').toLowerCase())
            .filter(Boolean);
        } else if (automation?.systems) {
          requiredProviders = automation.systems.map((s: string) => s.toLowerCase());
        }

        // Get user's connected integrations (user-level)
        const { data: userConnections } = await supabaseAdmin
          .from("integration_connections")
          .select("provider, status, connected_email")
          .eq("user_id", userId)
          .eq("status", "connected");

        const connectedProviders = new Set(
          (userConnections || []).map(c => c.provider.toLowerCase())
        );

        const missing = requiredProviders.filter(p => !connectedProviders.has(p));
        const allConnected = missing.length === 0 && requiredProviders.length > 0;

        return new Response(
          JSON.stringify({
            allConnected,
            required: requiredProviders,
            connected: Array.from(connectedProviders),
            missing,
            connections: userConnections || [],
            activationStatus: activation.status,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: "Invalid action" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
  } catch (error) {
    console.error("Connect integration error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
