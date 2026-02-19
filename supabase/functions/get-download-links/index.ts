import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { checkRateLimit, getClientIp, rateLimitResponse, buildCorsHeaders } from "../_shared/rate-limiter.ts";
import { SUCCESS_STATUSES } from "../_shared/purchase-constants.ts";
import { CANONICAL_FILE_TYPES, getFileTypeLabel } from "../_shared/file-types.ts";

interface DownloadRequest {
  item_type: "agent" | "bundle";
  item_id: string;
}

interface DownloadLink {
  name: string;
  type: string;
  url: string;
  expires_in: number;
}

serve(async (req) => {
  const corsHeaders = buildCorsHeaders(req);
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

    // Rate limiting
    const clientIp = getClientIp(req);
    const rateLimitResult = await checkRateLimit(
      { functionName: "get-download-links", maxRequests: 15, windowSeconds: 60 },
      user.id,
      clientIp
    );

    if (!rateLimitResult.allowed) {
      return rateLimitResponse(rateLimitResult.retryAfterSeconds || 60);
    }

    const { item_type, item_id }: DownloadRequest = await req.json();

    if (!item_type || !item_id) {
      throw new Error("item_type and item_id are required");
    }

    // Check if user is admin (they get free access)
    const { data: adminRole } = await supabaseClient
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .single();

    let hasAccess = !!adminRole;
    let purchaseId: string | null = null;
    let purchaseDownloadCount = 0;

    if (!hasAccess) {
      // Check for direct purchase
      const { data: directPurchase } = await supabaseClient
        .from("purchases")
        .select("id, status, download_count")
        .eq("email", user.email)
        .eq("item_id", item_id)
        .eq("item_type", item_type)
        .in("status", SUCCESS_STATUSES)
        .limit(1);

      if (directPurchase && directPurchase.length > 0) {
        hasAccess = true;
        purchaseId = directPurchase[0].id;
        purchaseDownloadCount = directPurchase[0].download_count ?? 0;
      }
    }

    // For agents, also check if user purchased a bundle containing this agent
    if (!hasAccess && item_type === "agent") {
      // Get all user's bundle purchases
      const { data: bundlePurchases } = await supabaseClient
        .from("purchases")
        .select("id, item_id, download_count")
        .eq("email", user.email)
        .eq("item_type", "bundle")
        .in("status", SUCCESS_STATUSES);

      if (bundlePurchases && bundlePurchases.length > 0) {
        // Check if any of these bundles contain the requested agent
        const bundleIds = bundlePurchases.map(p => p.item_id);
        
        const { data: bundles } = await supabaseClient
          .from("automation_bundles")
          .select("id, included_agent_ids")
          .in("id", bundleIds);

        if (bundles) {
          for (const bundle of bundles) {
            if (bundle.included_agent_ids && bundle.included_agent_ids.includes(item_id)) {
              hasAccess = true;
              // Find the corresponding purchase
              const bundlePurchase = bundlePurchases.find(p => p.item_id === bundle.id);
              if (bundlePurchase) {
                purchaseId = bundlePurchase.id;
                purchaseDownloadCount = bundlePurchase.download_count ?? 0;
              }
              break;
            }
          }
        }
      }
    }

    if (!hasAccess) {
      throw new Error("No valid purchase found for this item");
    }

    const downloads: DownloadLink[] = [];
    const expiresIn = 3600; // 1 hour
    let itemName = "";

    if (item_type === "agent") {
      // Get agent details and files
      const { data: agent, error } = await supabaseClient
        .from("automation_agents")
        .select("id, name, slug, current_version, workflow_file_path, guide_file_path")
        .eq("id", item_id)
        .single();

      if (error || !agent) {
        throw new Error("Agent not found");
      }

      itemName = agent.name;
      const version = agent.current_version || 'v1';

      // Try to get files from agent_files table first (versioned)
      const { data: agentFiles } = await supabaseClient
        .from("agent_files")
        .select("file_type, storage_path")
        .eq("agent_id", item_id)
        .eq("version", version);

      if (agentFiles && agentFiles.length > 0) {
        // Use versioned files - canonical file types
        for (const file of agentFiles) {
          const { data: signedUrl, error: signError } = await supabaseAdmin.storage
            .from("agent-files")
            .createSignedUrl(file.storage_path, expiresIn);

          if (signedUrl && !signError) {
            downloads.push({
              name: `${agent.name} - ${getFileTypeLabel(file.file_type)}`,
              type: file.file_type,
              url: signedUrl.signedUrl,
              expires_in: expiresIn,
            });
          }
        }
      } else {
        // Fallback to legacy file paths on the agent record
        if (agent.workflow_file_path) {
          const { data: workflowUrl, error: workflowError } = await supabaseAdmin.storage
            .from("agent-files")
            .createSignedUrl(agent.workflow_file_path, expiresIn);

          if (workflowUrl && !workflowError) {
            downloads.push({
              name: `${agent.name} - ${getFileTypeLabel(CANONICAL_FILE_TYPES.workflow)}`,
              type: CANONICAL_FILE_TYPES.workflow,
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
              name: `${agent.name} - ${getFileTypeLabel(CANONICAL_FILE_TYPES.deployment_guide)}`,
              type: CANONICAL_FILE_TYPES.deployment_guide,
              url: guideUrl.signedUrl,
              expires_in: expiresIn,
            });
          }
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

      itemName = bundle.name;

      // If there's a bundle zip, use that
      if (bundle.bundle_zip_path) {
        const { data: zipUrl, error: zipError } = await supabaseAdmin.storage
          .from("agent-files")
          .createSignedUrl(bundle.bundle_zip_path, expiresIn);

        if (zipUrl && !zipError) {
          downloads.push({
            name: `${bundle.name} - Complete Bundle.zip`,
            type: CANONICAL_FILE_TYPES.workflow,
            url: zipUrl.signedUrl,
            expires_in: expiresIn,
          });
        }
      }

      // Also get individual agent files
      if (bundle.included_agent_ids && bundle.included_agent_ids.length > 0) {
        const { data: agents, error: agentsError } = await supabaseClient
          .from("automation_agents")
          .select("id, name, slug, current_version, workflow_file_path, guide_file_path")
          .in("id", bundle.included_agent_ids);

        if (agents && !agentsError) {
          for (const agent of agents) {
            const version = agent.current_version || 'v1';
            
            // Try versioned files first
            const { data: agentFiles } = await supabaseClient
              .from("agent_files")
              .select("file_type, storage_path")
              .eq("agent_id", agent.id)
              .eq("version", version);

            if (agentFiles && agentFiles.length > 0) {
              for (const file of agentFiles) {
                const { data: signedUrl } = await supabaseAdmin.storage
                  .from("agent-files")
                  .createSignedUrl(file.storage_path, expiresIn);

                if (signedUrl) {
                  downloads.push({
                    name: `${agent.name} - ${getFileTypeLabel(file.file_type)}`,
                    type: file.file_type,
                    url: signedUrl.signedUrl,
                    expires_in: expiresIn,
                  });
                }
              }
            } else {
              // Fallback to legacy paths
              if (agent.workflow_file_path) {
                const { data: workflowUrl } = await supabaseAdmin.storage
                  .from("agent-files")
                  .createSignedUrl(agent.workflow_file_path, expiresIn);

                if (workflowUrl) {
                  downloads.push({
                    name: `${agent.name} - ${getFileTypeLabel(CANONICAL_FILE_TYPES.workflow)}`,
                    type: CANONICAL_FILE_TYPES.workflow,
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
                    name: `${agent.name} - ${getFileTypeLabel(CANONICAL_FILE_TYPES.deployment_guide)}`,
                    type: CANONICAL_FILE_TYPES.deployment_guide,
                    url: guideUrl.signedUrl,
                    expires_in: expiresIn,
                  });
                }
              }
            }
          }
        }
      }
    }

    // Update download count if we have a purchase to track
    if (purchaseId) {
      await supabaseAdmin
        .from("purchases")
        .update({
          download_count: purchaseDownloadCount + 1,
          last_download_at: new Date().toISOString(),
        })
        .eq("id", purchaseId);
    }

    // Determine if files were actually uploaded or not
    const filesAvailable = downloads.length > 0;
    
    return new Response(
      JSON.stringify({ 
        downloads,
        item_type,
        item_id,
        item_name: itemName || undefined,
        files_available: filesAvailable,
        message: filesAvailable 
          ? undefined 
          : "No files have been uploaded for this item yet. Files will be available once uploaded by the admin.",
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
