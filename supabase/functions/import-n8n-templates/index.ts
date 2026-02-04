import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { requireAdminAuth } from "../_shared/admin-auth.ts";

/**
 * Import n8n Templates Edge Function
 * 
 * Handles batch import of n8n workflow JSON files as IMMUTABLE templates.
 * Templates are stored for later duplication into per-client workflows.
 * 
 * CRITICAL RULES:
 * - Templates NEVER execute directly
 * - No n8n API calls
 * - No workflow activation
 * - No JSON modification
 * - Deduplication via SHA-256 hash
 * 
 * POST /import-n8n-templates
 * Content-Type: application/json
 * Body: {
 *   templates: [
 *     { 
 *       filename: string,
 *       content: string (JSON string),
 *       name?: string,
 *       slug?: string,
 *       description?: string
 *     }
 *   ]
 * }
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TemplateInput {
  filename: string;
  content: string;
  name?: string;
  slug?: string;
  description?: string;
}

interface ImportedTemplate {
  id: string;
  slug: string;
  name: string;
  source_filename: string;
}

interface SkippedTemplate {
  source_filename: string;
  reason: string;
}

interface ErrorTemplate {
  source_filename: string;
  error: string;
}

interface ImportResult {
  imported: ImportedTemplate[];
  skipped: SkippedTemplate[];
  errors: ErrorTemplate[];
}

// Node type to provider mapping
const NODE_TO_PROVIDER: Record<string, string> = {
  // Google
  "n8n-nodes-base.gmail": "google",
  "n8n-nodes-base.gmailTrigger": "google",
  "n8n-nodes-base.googleSheets": "google",
  "n8n-nodes-base.googleCalendar": "google",
  "n8n-nodes-base.googleDrive": "google",
  "n8n-nodes-base.googleDriveTrigger": "google",
  // HubSpot
  "n8n-nodes-base.hubspot": "hubspot",
  "n8n-nodes-base.hubspotTrigger": "hubspot",
  // Slack
  "n8n-nodes-base.slack": "slack",
  "n8n-nodes-base.slackTrigger": "slack",
  // Notion
  "n8n-nodes-base.notion": "notion",
  "n8n-nodes-base.notionTrigger": "notion",
  // Microsoft Teams
  "n8n-nodes-base.microsoftTeams": "microsoft",
  // Jira
  "n8n-nodes-base.jira": "jira",
  // Telegram
  "n8n-nodes-base.telegram": "telegram",
  // Airtable
  "n8n-nodes-base.airtable": "airtable",
  // Stripe
  "n8n-nodes-base.stripe": "stripe",
  "n8n-nodes-base.stripeTrigger": "stripe",
  // Twilio
  "n8n-nodes-base.twilio": "twilio",
  // OpenAI / AI
  "@n8n/n8n-nodes-langchain.lmChatOpenAi": "openai",
  "@n8n/n8n-nodes-langchain.openAi": "openai",
};

// Skip these generic node types from provider detection
const SKIP_NODES = new Set([
  "n8n-nodes-base.webhook",
  "n8n-nodes-base.httpRequest",
  "n8n-nodes-base.set",
  "n8n-nodes-base.if",
  "n8n-nodes-base.switch",
  "n8n-nodes-base.merge",
  "n8n-nodes-base.code",
  "n8n-nodes-base.function",
  "n8n-nodes-base.stickyNote",
  "n8n-nodes-base.noOp",
  "n8n-nodes-base.wait",
  "n8n-nodes-base.respondToWebhook",
  "n8n-nodes-base.splitInBatches",
  "n8n-nodes-base.scheduleTrigger",
  "n8n-nodes-base.manualTrigger",
  "n8n-nodes-base.formTrigger",
  "n8n-nodes-base.removeDuplicates",
]);

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

async function computeHash(content: string): Promise<string> {
  // Canonical JSON: parse and re-stringify with sorted keys
  let canonical: string;
  try {
    const parsed = JSON.parse(content);
    canonical = JSON.stringify(parsed, Object.keys(parsed).sort());
  } catch {
    canonical = content;
  }
  
  const encoder = new TextEncoder();
  const data = encoder.encode(canonical);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

interface N8nNode {
  id?: string;
  name?: string;
  type?: string;
  position?: [number, number];
  parameters?: Record<string, unknown>;
}

interface N8nWorkflow {
  name?: string;
  description?: string;
  nodes?: N8nNode[];
  connections?: Record<string, unknown>;
}

function validateWorkflowStructure(json: unknown): { valid: boolean; error?: string; workflow?: N8nWorkflow } {
  if (!json || typeof json !== "object") {
    return { valid: false, error: "Not a valid JSON object" };
  }

  const workflow = json as N8nWorkflow;

  if (!workflow.nodes || !Array.isArray(workflow.nodes)) {
    return { valid: false, error: "Missing 'nodes' array" };
  }

  if (workflow.nodes.length === 0) {
    return { valid: false, error: "Workflow has no nodes" };
  }

  // Verify at least one node has a type
  const hasValidNode = workflow.nodes.some((n) => n.type && typeof n.type === "string");
  if (!hasValidNode) {
    return { valid: false, error: "No nodes with valid 'type' field found" };
  }

  return { valid: true, workflow };
}

function detectProviders(nodes: N8nNode[]): string[] {
  const providers = new Set<string>();
  
  for (const node of nodes) {
    const nodeType = node.type || "";
    
    // Skip generic nodes
    if (SKIP_NODES.has(nodeType)) continue;
    
    // Check direct mapping
    const provider = NODE_TO_PROVIDER[nodeType];
    if (provider) {
      providers.add(provider);
    }
  }
  
  return Array.from(providers);
}

function detectTriggerType(nodes: N8nNode[]): string | null {
  const triggerNode = nodes.find(
    (n) =>
      n.type?.toLowerCase().includes("trigger") ||
      n.type === "n8n-nodes-base.webhook"
  );
  return triggerNode?.type || null;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // Only allow POST
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
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

    const adminUserId = authResult.userId;
    console.log(`Template import started by admin: ${adminUserId}`);

    // Parse request body
    let body: { templates?: TemplateInput[] };
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid JSON body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const templates = body.templates;
    if (!Array.isArray(templates) || templates.length === 0) {
      return new Response(
        JSON.stringify({ error: "No templates provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (templates.length > 100) {
      return new Response(
        JSON.stringify({ error: "Maximum 100 templates per import" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create service role client for DB writes
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const result: ImportResult = {
      imported: [],
      skipped: [],
      errors: [],
    };

    for (const template of templates) {
      const { filename, content, name: providedName, slug: providedSlug, description: providedDescription } = template;

      // Validate input
      if (!filename || !content) {
        result.errors.push({
          source_filename: filename || "unknown",
          error: "Missing filename or content",
        });
        continue;
      }

      // Parse JSON
      let workflowJson: unknown;
      try {
        workflowJson = JSON.parse(content);
      } catch (e) {
        result.errors.push({
          source_filename: filename,
          error: `Invalid JSON: ${e instanceof Error ? e.message : "Parse error"}`,
        });
        continue;
      }

      // Validate n8n structure
      const validation = validateWorkflowStructure(workflowJson);
      if (!validation.valid || !validation.workflow) {
        result.errors.push({
          source_filename: filename,
          error: validation.error || "Invalid workflow structure",
        });
        continue;
      }

      const workflow = validation.workflow;
      const nodes = workflow.nodes || [];

      // Compute hash for deduplication
      const fileHash = await computeHash(content);

      // Check for duplicate
      const { data: existingByHash } = await supabaseAdmin
        .from("n8n_workflow_templates")
        .select("id, slug, name")
        .eq("file_hash", fileHash)
        .maybeSingle();

      if (existingByHash) {
        result.skipped.push({
          source_filename: filename,
          reason: `Duplicate of existing template: ${existingByHash.slug} (${existingByHash.name})`,
        });
        continue;
      }

      // Extract metadata
      const workflowName = providedName || workflow.name || filename.replace(/\.json$/i, "");
      let slug = providedSlug || generateSlug(workflowName);
      const description = providedDescription || workflow.description || "";
      const detectedProviders = detectProviders(nodes);
      const triggerType = detectTriggerType(nodes);
      const nodeCount = nodes.length;

      // Ensure slug is unique
      let slugSuffix = 0;
      let finalSlug = slug;
      while (true) {
        const { data: existingBySlug } = await supabaseAdmin
          .from("n8n_workflow_templates")
          .select("id")
          .eq("slug", finalSlug)
          .maybeSingle();

        if (!existingBySlug) break;
        
        slugSuffix++;
        finalSlug = `${slug}-${slugSuffix}`;
      }

      // Insert template (immutable - no updates allowed after this)
      try {
        const { data: insertedTemplate, error: insertError } = await supabaseAdmin
          .from("n8n_workflow_templates")
          .insert({
            name: workflowName,
            slug: finalSlug,
            description,
            workflow_json: workflowJson,
            original_filename: filename,
            file_hash: fileHash,
            detected_providers: detectedProviders,
            trigger_type: triggerType,
            node_count: nodeCount,
            imported_by: adminUserId,
          })
          .select("id, slug, name")
          .single();

        if (insertError) throw insertError;

        result.imported.push({
          id: insertedTemplate.id,
          slug: insertedTemplate.slug,
          name: insertedTemplate.name,
          source_filename: filename,
        });

        console.log(`Template imported: ${finalSlug} (${nodeCount} nodes, providers: ${detectedProviders.join(", ")})`);
      } catch (err) {
        result.errors.push({
          source_filename: filename,
          error: err instanceof Error ? err.message : "Insert failed",
        });
      }
    }

    // Summary logging
    console.log(`Template import completed: imported=${result.imported.length}, skipped=${result.skipped.length}, errors=${result.errors.length}`);

    return new Response(
      JSON.stringify(result),
      { 
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
        } 
      }
    );
  } catch (error) {
    console.error("Template import error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
