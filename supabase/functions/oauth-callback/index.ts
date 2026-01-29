import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

/**
 * OAuth Callback Handler (HARDENED)
 * 
 * Handles OAuth callback from providers, exchanges code for tokens,
 * encrypts and stores credentials in integration_connections.
 * 
 * SECURITY:
 * - Validates state token from oauth_states table (CSRF protection)
 * - Deletes state after use (one-time use)
 * - Encrypts credentials with AES-256-GCM
 * - Validates redirect_path before redirecting
 * - Never logs tokens or sensitive data
 * 
 * CONNECT ONCE: Credentials stored at user level (activation_request_id = NULL)
 * 
 * Supports: google, hubspot, slack, notion
 */

interface ProviderTokenConfig {
  tokenUrl: string;
  clientIdEnv: string;
  clientSecretEnv: string;
  redirectUriEnv: string;
}

const PROVIDERS: Record<string, ProviderTokenConfig> = {
  google: {
    tokenUrl: "https://oauth2.googleapis.com/token",
    clientIdEnv: "GOOGLE_CLIENT_ID",
    clientSecretEnv: "GOOGLE_CLIENT_SECRET",
    redirectUriEnv: "GOOGLE_REDIRECT_URI",
  },
  hubspot: {
    tokenUrl: "https://api.hubapi.com/oauth/v1/token",
    clientIdEnv: "HUBSPOT_CLIENT_ID",
    clientSecretEnv: "HUBSPOT_CLIENT_SECRET",
    redirectUriEnv: "HUBSPOT_REDIRECT_URI",
  },
  slack: {
    tokenUrl: "https://slack.com/api/oauth.v2.access",
    clientIdEnv: "SLACK_CLIENT_ID",
    clientSecretEnv: "SLACK_CLIENT_SECRET",
    redirectUriEnv: "SLACK_REDIRECT_URI",
  },
  notion: {
    tokenUrl: "https://api.notion.com/v1/oauth/token",
    clientIdEnv: "NOTION_CLIENT_ID",
    clientSecretEnv: "NOTION_CLIENT_SECRET",
    redirectUriEnv: "NOTION_REDIRECT_URI",
  },
};

/**
 * Validates redirect_path to prevent open redirect attacks.
 */
function validateRedirectPath(path: string | null): string {
  const defaultPath = "/integrations";
  
  if (!path) return defaultPath;
  if (!path.startsWith("/")) return defaultPath;
  if (path.includes("://") || path.toLowerCase().includes("http")) return defaultPath;
  if (path.includes("//")) return defaultPath;
  if (path.includes("..")) return defaultPath;
  
  const lowerPath = path.toLowerCase();
  if (lowerPath.includes("javascript:") || lowerPath.includes("data:")) return defaultPath;
  
  return path;
}

// Encryption using AES-256-GCM
async function encryptData(data: string, keyBase64: string): Promise<{ encrypted: string; iv: string; tag: string }> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const keyBytes = Uint8Array.from(atob(keyBase64), c => c.charCodeAt(0));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyBytes,
    { name: "AES-GCM" },
    false,
    ["encrypt"]
  );
  
  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    cryptoKey,
    dataBuffer
  );
  
  const encryptedArray = new Uint8Array(encryptedBuffer);
  const ciphertext = encryptedArray.slice(0, -16);
  const tag = encryptedArray.slice(-16);
  
  return {
    encrypted: btoa(String.fromCharCode(...ciphertext)),
    iv: btoa(String.fromCharCode(...iv)),
    tag: btoa(String.fromCharCode(...tag)),
  };
}

async function fetchUserInfo(provider: string, accessToken: string): Promise<{ email?: string; scopes?: string[] }> {
  try {
    if (provider === "google") {
      const resp = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (resp.ok) {
        const data = await resp.json();
        return { email: data.email };
      }
    } else if (provider === "hubspot") {
      const resp = await fetch("https://api.hubapi.com/oauth/v1/access-tokens/" + accessToken);
      if (resp.ok) {
        const data = await resp.json();
        return { email: data.user, scopes: data.scopes };
      }
    } else if (provider === "slack") {
      const resp = await fetch("https://slack.com/api/auth.test", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (resp.ok) {
        const data = await resp.json();
        return { email: data.user };
      }
    } else if (provider === "notion") {
      const resp = await fetch("https://api.notion.com/v1/users/me", {
        headers: { 
          Authorization: `Bearer ${accessToken}`,
          "Notion-Version": "2022-06-28",
        },
      });
      if (resp.ok) {
        const data = await resp.json();
        return { email: data.person?.email };
      }
    }
  } catch (e) {
    // Don't log the error details as they might contain token info
    console.error(`Failed to fetch user info for ${provider}`);
  }
  return {};
}

Deno.serve(async (req) => {
  const siteUrl = Deno.env.get("SITE_URL") || "https://haven-matrix.lovable.app";
  
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const error = url.searchParams.get("error");

    // Handle OAuth error from provider
    if (error) {
      console.error("OAuth error from provider:", error);
      return Response.redirect(`${siteUrl}/integrations?error=${encodeURIComponent(error)}`, 302);
    }

    if (!code || !state) {
      return Response.redirect(`${siteUrl}/integrations?error=missing_params`, 302);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAdmin = createClient(
      supabaseUrl,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Validate state token and get user info
    const { data: oauthState, error: stateError } = await supabaseAdmin
      .from("oauth_states")
      .select("*")
      .eq("state_token", state)
      .gt("expires_at", new Date().toISOString())
      .maybeSingle();

    if (stateError || !oauthState) {
      console.warn("Invalid or expired state token");
      return Response.redirect(`${siteUrl}/integrations?error=invalid_state`, 302);
    }

    const { user_id, provider, redirect_path, activation_request_id } = oauthState;

    // Delete the used state token immediately (one-time use)
    await supabaseAdmin.from("oauth_states").delete().eq("id", oauthState.id);

    const config = PROVIDERS[provider];
    if (!config) {
      return Response.redirect(`${siteUrl}/integrations?error=invalid_provider`, 302);
    }

    const clientId = Deno.env.get(config.clientIdEnv);
    const clientSecret = Deno.env.get(config.clientSecretEnv);
    const redirectUri = Deno.env.get(config.redirectUriEnv);

    if (!clientId || !clientSecret || !redirectUri) {
      console.error(`OAuth not fully configured for ${provider}`);
      return Response.redirect(`${siteUrl}/integrations?error=config_error`, 302);
    }

    // Exchange code for tokens
    let tokenResponse: Response;
    
    if (provider === "notion") {
      // Notion uses Basic auth
      tokenResponse = await fetch(config.tokenUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
        },
        body: JSON.stringify({
          grant_type: "authorization_code",
          code,
          redirect_uri: redirectUri,
        }),
      });
    } else {
      // Standard OAuth2 token exchange
      const tokenParams = new URLSearchParams({
        grant_type: "authorization_code",
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
      });

      tokenResponse = await fetch(config.tokenUrl, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: tokenParams.toString(),
      });
    }

    if (!tokenResponse.ok) {
      // Don't log the full error response as it might contain sensitive info
      console.error(`Token exchange failed for ${provider}: status ${tokenResponse.status}`);
      return Response.redirect(`${siteUrl}/integrations?error=token_exchange_failed`, 302);
    }

    const tokens = await tokenResponse.json();
    
    // Get user info from provider
    const accessToken = tokens.access_token || tokens.authed_user?.access_token;
    const userInfo = await fetchUserInfo(provider, accessToken);

    // Encrypt credentials
    const encryptionKey = Deno.env.get("CREDENTIAL_ENCRYPTION_KEY");
    if (!encryptionKey) {
      console.error("CREDENTIAL_ENCRYPTION_KEY not configured");
      return Response.redirect(`${siteUrl}/integrations?error=config_error`, 302);
    }

    // Build credentials object (exclude logging)
    const credentials = {
      access_token: accessToken,
      refresh_token: tokens.refresh_token,
      expires_in: tokens.expires_in,
      token_type: tokens.token_type,
      scope: tokens.scope,
      // Include provider-specific fields except logging
      ...(provider === "slack" && tokens.authed_user ? { authed_user: tokens.authed_user } : {}),
      ...(provider === "notion" && tokens.workspace_id ? { workspace_id: tokens.workspace_id } : {}),
    };

    const { encrypted, iv, tag } = await encryptData(
      JSON.stringify(credentials),
      encryptionKey
    );

    // CONNECT ONCE: Upsert connection at user level (activation_request_id = NULL)
    const { data: existingConnection } = await supabaseAdmin
      .from("integration_connections")
      .select("id")
      .eq("user_id", user_id)
      .eq("provider", provider)
      .not("status", "in", "(archived,revoked)")
      .maybeSingle();

    const connectionData = {
      user_id,
      provider,
      status: "connected",
      encrypted_payload: encrypted,
      encryption_iv: iv,
      encryption_tag: tag,
      granted_scopes: userInfo.scopes || (tokens.scope ? tokens.scope.split(/[,\s]+/) : []),
      connected_email: userInfo.email || null,
      activation_request_id: null, // CONNECT ONCE: User-level, not activation-specific
      expires_at: tokens.expires_in 
        ? new Date(Date.now() + tokens.expires_in * 1000).toISOString() 
        : null,
      updated_at: new Date().toISOString(),
    };

    if (existingConnection) {
      await supabaseAdmin
        .from("integration_connections")
        .update(connectionData)
        .eq("id", existingConnection.id);
    } else {
      await supabaseAdmin
        .from("integration_connections")
        .insert(connectionData);
    }

    // Log only non-sensitive info
    console.log(`OAuth completed: user=${user_id}, provider=${provider}, success=true`);

    // Create admin notification (no sensitive data)
    await supabaseAdmin
      .from("admin_notifications")
      .insert({
        type: "oauth_connected",
        title: `OAuth Connected: ${provider}`,
        body: `User connected ${provider} via OAuth (account-level credential)`,
        severity: "info",
        metadata: { user_id, provider, connected_email: userInfo.email },
      });

    // Determine redirect URL
    const validatedRedirectPath = validateRedirectPath(redirect_path);
    
    // If activation_request_id was provided, redirect to connector screen
    if (activation_request_id) {
      return Response.redirect(
        `${siteUrl}/connect/${activation_request_id}?oauth_success=true&provider=${provider}`,
        302
      );
    }

    // Redirect to integrations page with success
    return Response.redirect(`${siteUrl}${validatedRedirectPath}?connected=${provider}`, 302);

  } catch (error) {
    // Don't log the full error as it might contain sensitive info
    console.error("OAuth callback error occurred");
    const siteUrl = Deno.env.get("SITE_URL") || "https://haven-matrix.lovable.app";
    return Response.redirect(`${siteUrl}/integrations?error=internal_error`, 302);
  }
});
