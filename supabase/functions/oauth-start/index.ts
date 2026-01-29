import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

/**
 * OAuth Start Handler
 * 
 * Initiates OAuth flow for supported providers.
 * Creates a CSRF state token, stores it in oauth_states, and redirects to provider.
 * 
 * Supported providers: google, hubspot, slack, notion
 * 
 * Query params:
 * - provider: google | hubspot | slack | notion
 * - redirect_path: Optional path to redirect after callback (default: /integrations)
 * - activation_request_id: Optional activation to check after connecting
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = claimsData.claims.sub as string;

    // Parse request
    const url = new URL(req.url);
    const provider = url.searchParams.get("provider")?.toLowerCase();
    const redirectPath = url.searchParams.get("redirect_path") || "/integrations";
    const activationRequestId = url.searchParams.get("activation_request_id");

    if (!provider || !PROVIDERS[provider]) {
      return new Response(
        JSON.stringify({ 
          error: "Invalid provider", 
          supported: Object.keys(PROVIDERS) 
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

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

    // Store state in database with service role
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

    console.log(`OAuth started for user ${userId}, provider ${provider}`);

    return new Response(
      JSON.stringify({ 
        authorization_url: authorizationUrl,
        state: stateToken,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("OAuth start error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
