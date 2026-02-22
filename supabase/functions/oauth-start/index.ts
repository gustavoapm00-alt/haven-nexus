import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

/**
 * OAuth Start Handler (HARDENED)
 * 
 * Initiates OAuth flow for supported providers.
 * Creates a CSRF state token, stores it in oauth_states, and returns authorization URL.
 * 
 * SECURITY:
 * - Uses getUser() for stable JWT verification (not getClaims)
 * - Validates redirect_path to prevent open redirects
 * - State stored server-side with short expiry
 * 
 * Supported providers: google, hubspot, slack, notion
 * 
 * Query params:
 * - provider: google | hubspot | slack | notion
 * - redirect_path: Optional path to redirect after callback (default: /integrations)
 * - activation_request_id: Optional activation context for post-connect redirect
 */

import { buildCorsHeaders } from "../_shared/rate-limiter.ts";

interface ProviderConfig {
  authUrl: string;
  scopes: string[];
  clientIdEnv: string;
  redirectUriEnv: string;
}

const PROVIDERS: Record<string, ProviderConfig> = {
  google: {
    authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    scopes: [
      "openid",
      "email",
      "profile",
      "https://www.googleapis.com/auth/gmail.send",
      "https://www.googleapis.com/auth/gmail.readonly",
      "https://www.googleapis.com/auth/calendar",
      "https://www.googleapis.com/auth/spreadsheets",
    ],
    clientIdEnv: "GOOGLE_CLIENT_ID",
    redirectUriEnv: "GOOGLE_REDIRECT_URI",
  },
  hubspot: {
    authUrl: "https://app.hubspot.com/oauth/authorize",
    scopes: [
      "crm.objects.contacts.read",
      "crm.objects.contacts.write",
      "crm.objects.deals.read",
      "crm.objects.deals.write",
      "crm.objects.companies.read",
      "crm.objects.companies.write",
    ],
    clientIdEnv: "HUBSPOT_CLIENT_ID",
    redirectUriEnv: "HUBSPOT_REDIRECT_URI",
  },
  slack: {
    authUrl: "https://slack.com/oauth/v2/authorize",
    scopes: [
      "channels:read",
      "chat:write",
      "users:read",
      "users:read.email",
    ],
    clientIdEnv: "SLACK_CLIENT_ID",
    redirectUriEnv: "SLACK_REDIRECT_URI",
  },
  notion: {
    authUrl: "https://api.notion.com/v1/oauth/authorize",
    scopes: [], // Notion doesn't use scopes in the same way
    clientIdEnv: "NOTION_CLIENT_ID",
    redirectUriEnv: "NOTION_REDIRECT_URI",
  },
};

/**
 * Validates redirect_path to prevent open redirect attacks.
 * Only allows safe relative paths.
 */
function validateRedirectPath(path: string | null): string {
  const defaultPath = "/integrations";
  
  if (!path) {
    return defaultPath;
  }
  
  // Must start with /
  if (!path.startsWith("/")) {
    console.warn(`Invalid redirect_path rejected (no leading /): ${path}`);
    return defaultPath;
  }
  
  // Disallow protocol handlers
  if (path.includes("://") || path.toLowerCase().includes("http")) {
    console.warn(`Invalid redirect_path rejected (protocol detected): ${path}`);
    return defaultPath;
  }
  
  // Disallow double slashes (could be protocol-relative URL)
  if (path.includes("//")) {
    console.warn(`Invalid redirect_path rejected (double slash): ${path}`);
    return defaultPath;
  }
  
  // Disallow path traversal
  if (path.includes("..")) {
    console.warn(`Invalid redirect_path rejected (path traversal): ${path}`);
    return defaultPath;
  }
  
  // Disallow javascript: or data: schemes that might slip through
  const lowerPath = path.toLowerCase();
  if (lowerPath.includes("javascript:") || lowerPath.includes("data:")) {
    console.warn(`Invalid redirect_path rejected (script scheme): ${path}`);
    return defaultPath;
  }
  
  return path;
}

Deno.serve(async (req) => {
  const corsHeaders = buildCorsHeaders(req);
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Authenticate user via JWT
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    
    // Create client with user's token for authentication
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Use getUser() - stable method in supabase-js v2
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError || !userData?.user) {
      console.warn("JWT verification failed:", userError?.message);
      return new Response(
        JSON.stringify({ error: "Invalid or expired token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = userData.user.id;

    // Parse request
    const url = new URL(req.url);
    const provider = url.searchParams.get("provider")?.toLowerCase();
    const rawRedirectPath = url.searchParams.get("redirect_path");
    const activationRequestId = url.searchParams.get("activation_request_id");

    // Validate provider
    if (!provider || !PROVIDERS[provider]) {
      return new Response(
        JSON.stringify({ 
          error: "Invalid provider", 
          supported: Object.keys(PROVIDERS) 
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate redirect_path (prevent open redirects)
    const redirectPath = validateRedirectPath(rawRedirectPath);

    const config = PROVIDERS[provider];
    const clientId = Deno.env.get(config.clientIdEnv);
    const redirectUri = Deno.env.get(config.redirectUriEnv);

    if (!clientId || !redirectUri) {
      console.error(`OAuth not configured for ${provider}: missing ${config.clientIdEnv} or ${config.redirectUriEnv}`);
      return new Response(
        JSON.stringify({ error: `OAuth not configured for ${provider}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate CSRF state token
    const stateToken = crypto.randomUUID();

    // Store state in database with service role (bypasses RLS)
    const supabaseAdmin = createClient(
      supabaseUrl,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { error: stateError } = await supabaseAdmin
      .from("oauth_states")
      .insert({
        user_id: userId,
        provider,
        state_token: stateToken,
        redirect_path: redirectPath,
        activation_request_id: activationRequestId || null,
        // expires_at defaults to now() + 15 minutes via DB default
      });

    if (stateError) {
      console.error("Failed to store OAuth state:", stateError);
      return new Response(
        JSON.stringify({ error: "Failed to initiate OAuth" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build OAuth URL
    const authParams = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "code",
      state: stateToken,
    });

    // Provider-specific parameters
    if (provider === "google") {
      authParams.set("scope", config.scopes.join(" "));
      authParams.set("access_type", "offline");
      authParams.set("prompt", "consent");
    } else if (provider === "hubspot") {
      authParams.set("scope", config.scopes.join(" "));
    } else if (provider === "slack") {
      authParams.set("scope", config.scopes.join(","));
    } else if (provider === "notion") {
      authParams.set("owner", "user");
    }

    const authorizationUrl = `${config.authUrl}?${authParams.toString()}`;

    // Log only non-sensitive info
    console.log(`OAuth started: user=${userId}, provider=${provider}`);

    return new Response(
      JSON.stringify({ 
        authorization_url: authorizationUrl,
        state: stateToken,
      }),
      { 
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
        } 
      }
    );

  } catch (error) {
    console.error("OAuth start error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
