import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { requireAdminAuth } from "../_shared/admin-auth.ts";

/**
 * Admin Import Workflows Edge Function
 * 
 * Server-side handler for bulk importing n8n workflow templates.
 * Enforces admin-only access and performs all DB writes securely.
 * 
 * SECURITY:
 * - Requires authenticated admin user (JWT + user_roles check)
 * - All writes use service role (bypasses RLS)
 * - Validates input strictly
 * - Never trusts client-side admin checks
 * 
 * POST /admin-import-workflows
 * Body: {
 *   workflows: [
 *     { filename: string, content: string, override_slug?: string }
 *   ]
 * }
 * 
 * Returns: { results: [{ slug, status, message, automationAgentId? }] }
 */

import { buildCorsHeaders } from "../_shared/rate-limiter.ts";

// Node type to provider mapping
const NODE_TO_PROVIDER: Record<string, string> = {
  // Google
  "n8n-nodes-base.gmail": "google",
  "n8n-nodes-base.googleSheets": "google",
  "n8n-nodes-base.googleCalendar": "google",
  "n8n-nodes-base.googleDrive": "google",
  // HubSpot
  "n8n-nodes-base.hubspot": "hubspot",
  "n8n-nodes-base.hubspotTrigger": "hubspot",
  // Slack
  "n8n-nodes-base.slack": "slack",
  "n8n-nodes-base.slackTrigger": "slack",
  // Notion
  "n8n-nodes-base.notion": "notion",
  "n8n-nodes-base.notionTrigger": "notion",
  // Airtable
  "n8n-nodes-base.airtable": "airtable",
  // Stripe
  "n8n-nodes-base.stripe": "stripe",
  "n8n-nodes-base.stripeTrigger": "stripe",
  // Twilio
  "n8n-nodes-base.twilio": "twilio",
  // HTTP/Webhook (excluded from required integrations)
  "n8n-nodes-base.webhook": "webhook",
  "n8n-nodes-base.httpRequest": "http",
  // Email
  "n8n-nodes-base.emailSend": "email",
  "n8n-nodes-base.emailReadImap": "email",
};

interface WorkflowInput {
  filename: string;
  content: string;
  override_slug?: string;
}

interface ImportResult {
  slug: string;
  status: "created" | "updated" | "error";
  message: string;
  automationAgentId?: string;
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50);
}

async function hashContent(content: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(content);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("").slice(0, 16);
}

function detectProviders(nodes: Array<{ type?: string }>): string[] {
  const providers = new Set<string>();
  for (const node of nodes) {
    const nodeType = node.type || "";
    const provider = NODE_TO_PROVIDER[nodeType];
    // Exclude webhook/http as they're not external integrations
    if (provider && provider !== "webhook" && provider !== "http") {
      providers.add(provider);
    }
  }
  return Array.from(providers);
}

function detectTriggerType(nodes: Array<{ type?: string }>): string | null {
  const triggerNode = nodes.find(
    (n) =>
      n.type?.includes("Trigger") ||
      n.type === "n8n-nodes-base.webhook" ||
      n.type === "n8n-nodes-base.scheduleTrigger"
  );
  return triggerNode?.type || null;
}

Deno.serve(async (req) => {
  const corsHeaders = buildCorsHeaders(req);
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // Only allow POST
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { 
        status: 405, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }

  try {
    // Verify admin authentication (server-side check)
    const authResult = await requireAdminAuth(req);
    if (!authResult.authorized) {
      return new Response(
        JSON.stringify({ error: authResult.error }),
        { 
          status: authResult.statusCode, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    const adminUserId = authResult.userId;
    console.log(`Admin import started by user: ${adminUserId}`);

    // Parse request body
    let body: { workflows?: WorkflowInput[] };
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid JSON body" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    const workflows = body.workflows;
    if (!Array.isArray(workflows) || workflows.length === 0) {
      return new Response(
        JSON.stringify({ error: "No workflows provided" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Validate max workflows
    if (workflows.length > 50) {
      return new Response(
        JSON.stringify({ error: "Maximum 50 workflows per import" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Create service role client for DB writes
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const results: ImportResult[] = [];

    for (const workflowInput of workflows) {
      const { filename, content, override_slug } = workflowInput;

      // Validate input
      if (!filename || !content) {
        results.push({
          slug: override_slug || filename || "unknown",
          status: "error",
          message: "Missing filename or content",
        });
        continue;
      }

      // Parse JSON
      let rawJson: Record<string, unknown>;
      try {
        rawJson = JSON.parse(content);
      } catch {
        results.push({
          slug: override_slug || generateSlug(filename),
          status: "error",
          message: "Invalid JSON",
        });
        continue;
      }

      // Extract workflow info
      const nodes = (rawJson.nodes as Array<{ type?: string; name?: string }>) || [];
      if (!Array.isArray(nodes) || nodes.length === 0) {
        results.push({
          slug: override_slug || generateSlug(filename),
          status: "error",
          message: "No nodes found in workflow",
        });
        continue;
      }

      const workflowName = (rawJson.name as string) || filename.replace(".json", "");
      const slug = override_slug || generateSlug(workflowName);
      const description = (rawJson.description as string) || "";
      const detectedProviders = detectProviders(nodes);
      const triggerType = detectTriggerType(nodes);
      const fileHash = await hashContent(content);

      try {
        // Check if automation agent exists
        const { data: existingAgent } = await supabaseAdmin
          .from("automation_agents")
          .select("id, status")
          .eq("slug", slug)
          .maybeSingle();

        // Prepare required_integrations
        const requiredIntegrations = detectedProviders.map((p) => ({ provider: p }));

        // Determine status: don't downgrade live/published to draft
        let newStatus = "draft";
        if (existingAgent && ["live", "published"].includes(existingAgent.status)) {
          newStatus = existingAgent.status;
        }

        const agentData = {
          name: workflowName,
          slug,
          description: description || `Imported workflow: ${workflowName}`,
          short_outcome: detectedProviders.length > 0 
            ? `Automates ${detectedProviders.join(", ")} integration`
            : "Automated workflow",
          systems: detectedProviders,
          required_integrations: requiredIntegrations,
          status: newStatus,
          updated_at: new Date().toISOString(),
        };

        let automationAgentId: string;

        if (existingAgent) {
          // Update existing
          const { error: updateError } = await supabaseAdmin
            .from("automation_agents")
            .update(agentData)
            .eq("id", existingAgent.id);

          if (updateError) throw updateError;
          automationAgentId = existingAgent.id;

          results.push({
            slug,
            status: "updated",
            message: "Automation agent updated",
            automationAgentId,
          });
        } else {
          // Create new
          const { data: newAgent, error: insertError } = await supabaseAdmin
            .from("automation_agents")
            .insert(agentData)
            .select("id")
            .single();

          if (insertError) throw insertError;
          automationAgentId = newAgent.id;

          results.push({
            slug,
            status: "created",
            message: "Automation agent created",
            automationAgentId,
          });
        }

        // Store workflow template (upsert by slug)
        const templateData = {
          slug,
          name: workflowName,
          description,
          workflow_json: rawJson,
          detected_providers: detectedProviders,
          node_count: nodes.length,
          trigger_type: triggerType,
          file_hash: fileHash,
          original_filename: filename,
          automation_agent_id: automationAgentId,
          imported_by: adminUserId,
          updated_at: new Date().toISOString(),
        };

        let templateId: string;
        const { data: existingTemplate } = await supabaseAdmin
          .from("n8n_workflow_templates")
          .select("id")
          .eq("slug", slug)
          .maybeSingle();

        if (existingTemplate) {
          await supabaseAdmin
            .from("n8n_workflow_templates")
            .update(templateData)
            .eq("id", existingTemplate.id);
          templateId = existingTemplate.id;
        } else {
          const { data: newTemplate, error: templateError } = await supabaseAdmin
            .from("n8n_workflow_templates")
            .insert(templateData)
            .select("id")
            .single();
          if (templateError) throw templateError;
          templateId = newTemplate.id;
        }

        // CRITICAL: Auto-link template to automation agent via n8n_template_ids
        // This ensures the template-based provisioning model works correctly
        await supabaseAdmin
          .from("automation_agents")
          .update({ 
            n8n_template_ids: [templateId],
            updated_at: new Date().toISOString(),
          })
          .eq("id", automationAgentId);
      } catch (err) {
        results.push({
          slug,
          status: "error",
          message: err instanceof Error ? err.message : "Unknown error",
        });
      }
    }

    // Summary logging (no sensitive data)
    const created = results.filter((r) => r.status === "created").length;
    const updated = results.filter((r) => r.status === "updated").length;
    const errors = results.filter((r) => r.status === "error").length;
    console.log(`Admin import completed: created=${created}, updated=${updated}, errors=${errors}`);

    return new Response(
      JSON.stringify({ results }),
      { 
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
        } 
      }
    );
  } catch (error) {
    console.error("Admin import error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
