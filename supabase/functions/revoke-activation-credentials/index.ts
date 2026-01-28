import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface RevokePayload {
  credentialId: string;
  reason?: string;
}

Deno.serve(async (req) => {
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
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

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
    const userId = userData.user.id;

    // Check if user is admin
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    const { data: roleData } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();

    const isAdmin = !!roleData;

    // Parse request body
    const payload: RevokePayload = await req.json();
    const { credentialId, reason } = payload;

    if (!credentialId) {
      return new Response(
        JSON.stringify({ error: "credentialId is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch the credential to verify ownership
    const { data: credential, error: fetchError } = await supabaseAdmin
      .from("activation_credentials")
      .select(`
        id,
        request_id,
        credential_type,
        service_name,
        status,
        created_by
      `)
      .eq("id", credentialId)
      .single();

    if (fetchError || !credential) {
      return new Response(
        JSON.stringify({ error: "Credential not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify ownership (customer can revoke own, admin can revoke any)
    if (!isAdmin && credential.created_by !== userEmail) {
      return new Response(
        JSON.stringify({ error: "You do not have permission to revoke this credential" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (credential.status === "revoked") {
      return new Response(
        JSON.stringify({ error: "Credential is already revoked" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Revoke the credential
    const { error: updateError } = await supabaseAdmin
      .from("activation_credentials")
      .update({
        status: "revoked",
        revoked_at: new Date().toISOString(),
        revoked_by: userEmail,
        revocation_reason: reason || "User requested revocation",
      })
      .eq("id", credentialId);

    if (updateError) {
      console.error("Failed to revoke credential:", updateError.message);
      return new Response(
        JSON.stringify({ error: "Failed to revoke credential" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update credential count on installation request
    const { data: activeCreds } = await supabaseAdmin
      .from("activation_credentials")
      .select("id")
      .eq("request_id", credential.request_id)
      .eq("status", "active");

    await supabaseAdmin
      .from("installation_requests")
      .update({
        credentials_count: activeCreds?.length || 0,
        status_updated_at: new Date().toISOString(),
      })
      .eq("id", credential.request_id);

    console.log(`Credential ${credentialId} revoked by ${userEmail}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Credential revoked successfully",
        credential: {
          id: credentialId,
          serviceName: credential.service_name,
          revokedAt: new Date().toISOString(),
          revokedBy: userEmail,
        },
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in revoke-activation-credentials:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
