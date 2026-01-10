import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DownloadRequest {
  item_type: "agent" | "bundle";
  item_id: string;
}

interface DownloadLink {
  name: string;
  type: "workflow" | "guide";
  url: string;
  expires_in: number;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    // Retrieve authenticated user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Authorization header required");
    }
    
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !user?.email) {
      throw new Error("User not authenticated");
    }

    const { item_type, item_id }: DownloadRequest = await req.json();

    if (!item_type || !item_id) {
      throw new Error("item_type and item_id are required");
    }

    // Check if user has a valid purchase
    const { data: purchase, error: purchaseError } = await supabaseClient
      .from("purchases")
      .select("id, status, download_count")
      .eq("email", user.email)
      .eq("item_id", item_id)
      .eq("item_type", item_type)
      .eq("status", "paid")
      .single();

    // Also check if user is admin (they get free access)
    const { data: adminRole } = await supabaseClient
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .single();

    if (!purchase && !adminRole) {
      throw new Error("No valid purchase found for this item");
    }

    const downloads: DownloadLink[] = [];
    const expiresIn = 3600; // 1 hour

    if (item_type === "agent") {
      // Get agent file paths
      const { data: agent, error } = await supabaseClient
        .from("automation_agents")
        .select("name, workflow_file_path, guide_file_path")
        .eq("id", item_id)
        .single();

      if (error || !agent) {
        throw new Error("Agent not found");
      }

      // Generate signed URLs for each file
      if (agent.workflow_file_path) {
        const { data: workflowUrl, error: workflowError } = await supabaseAdmin.storage
          .from("agent-files")
          .createSignedUrl(agent.workflow_file_path, expiresIn);

        if (workflowUrl && !workflowError) {
          downloads.push({
            name: `${agent.name} - Workflow.json`,
            type: "workflow",
            url: workflowUrl.signedUrl,
            expires_in: expiresIn,
          });
        }
      }

      if (agent.guide_file_path) {
        const { data: guideUrl, error: guideError } = await supabaseAdmin.storage
          .from("agent-files")
          .createSignedUrl(agent.guide_file_path, expiresIn);

        if (guideUrl && !guideError) {
          downloads.push({
            name: `${agent.name} - Deployment Guide.pdf`,
            type: "guide",
            url: guideUrl.signedUrl,
            expires_in: expiresIn,
          });
        }
      }
    } else if (item_type === "bundle") {
      // Get bundle and its included agents
      const { data: bundle, error: bundleError } = await supabaseClient
        .from("automation_bundles")
        .select("name, included_agent_ids, bundle_zip_path")
        .eq("id", item_id)
        .single();

      if (bundleError || !bundle) {
        throw new Error("Bundle not found");
      }

      // If there's a bundle zip, use that
      if (bundle.bundle_zip_path) {
        const { data: zipUrl, error: zipError } = await supabaseAdmin.storage
          .from("agent-files")
          .createSignedUrl(bundle.bundle_zip_path, expiresIn);

        if (zipUrl && !zipError) {
          downloads.push({
            name: `${bundle.name} - Complete Bundle.zip`,
            type: "workflow",
            url: zipUrl.signedUrl,
            expires_in: expiresIn,
          });
        }
      }

      // Also get individual agent files
      if (bundle.included_agent_ids && bundle.included_agent_ids.length > 0) {
        const { data: agents, error: agentsError } = await supabaseClient
          .from("automation_agents")
          .select("id, name, workflow_file_path, guide_file_path")
          .in("id", bundle.included_agent_ids);

        if (agents && !agentsError) {
          for (const agent of agents) {
            if (agent.workflow_file_path) {
              const { data: workflowUrl } = await supabaseAdmin.storage
                .from("agent-files")
                .createSignedUrl(agent.workflow_file_path, expiresIn);

              if (workflowUrl) {
                downloads.push({
                  name: `${agent.name} - Workflow.json`,
                  type: "workflow",
                  url: workflowUrl.signedUrl,
                  expires_in: expiresIn,
                });
              }
            }

            if (agent.guide_file_path) {
              const { data: guideUrl } = await supabaseAdmin.storage
                .from("agent-files")
                .createSignedUrl(agent.guide_file_path, expiresIn);

              if (guideUrl) {
                downloads.push({
                  name: `${agent.name} - Deployment Guide.pdf`,
                  type: "guide",
                  url: guideUrl.signedUrl,
                  expires_in: expiresIn,
                });
              }
            }
          }
        }
      }
    }

    // Update download count if purchase exists
    if (purchase) {
      const currentCount = (purchase as { download_count?: number | null }).download_count ?? 0;
      await supabaseAdmin
        .from("purchases")
        .update({
          download_count: currentCount + 1,
          last_download_at: new Date().toISOString(),
        })
        .eq("id", purchase.id);
    }

    return new Response(
      JSON.stringify({ 
        downloads,
        item_type,
        item_id,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Download links error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
