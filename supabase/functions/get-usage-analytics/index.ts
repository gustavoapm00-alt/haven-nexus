import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const safeDetails = details ? { ...details } : undefined;
  if (safeDetails?.userId && typeof safeDetails.userId === 'string') {
    safeDetails.userId = safeDetails.userId.substring(0, 8) + '...';
  }
  console.log(`[GET-USAGE-ANALYTICS] ${step}${safeDetails ? ` - ${JSON.stringify(safeDetails)}` : ''}`);
};

interface UsageAnalytics {
  lifetime: {
    downloads: number;
    installs: number;
    runs: number;
    logins: number;
  };
  last30d: {
    downloads: number;
    installs: number;
    runs: number;
    logins: number;
  };
  daily_series: Array<{
    date: string;
    downloads: number;
    installs: number;
    runs: number;
  }>;
  last_activity_at: string | null;
  recent_events: Array<{
    id: string;
    event_type: string;
    item_type: string | null;
    item_id: string | null;
    created_at: string;
    metadata: Record<string, unknown>;
  }>;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    // Validate auth token
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Missing auth token" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    
    // Create token-bound Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: { headers: { Authorization: `Bearer ${token}` } },
        auth: { persistSession: false, autoRefreshToken: false }
      }
    );

    const { data: userData, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !userData.user) {
      logStep("Auth validation failed", { error: userError?.message });
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }

    const userId = userData.user.id;
    logStep("User authenticated", { userId });

    // Get analytics using the database function
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { data: analyticsData, error: analyticsError } = await supabaseAdmin.rpc(
      'get_usage_analytics',
      { p_user_id: userId }
    );

    if (analyticsError) {
      logStep("Analytics query failed", { error: analyticsError.message });
      throw new Error(analyticsError.message);
    }

    // Get recent events
    const { data: recentEvents, error: eventsError } = await supabaseAdmin
      .from('client_usage_events')
      .select('id, event_type, item_type, item_id, created_at, metadata')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (eventsError) {
      logStep("Recent events query failed", { error: eventsError.message });
    }

    const response: UsageAnalytics = {
      lifetime: analyticsData?.lifetime || { downloads: 0, installs: 0, runs: 0, logins: 0 },
      last30d: analyticsData?.last30d || { downloads: 0, installs: 0, runs: 0, logins: 0 },
      daily_series: analyticsData?.daily_series || [],
      last_activity_at: analyticsData?.last_activity_at || null,
      recent_events: recentEvents || []
    };

    logStep("Analytics retrieved successfully");

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
