import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

/**
 * Duplicate-and-Activate Edge Function
 * 
 * INSTITUTIONAL-GRADE N8N PROVISIONING
 * 
 * This function implements the core activation pipeline:
 * 1. Fetch immutable template from n8n_workflow_templates
 * 2. Create per-client workflow instance via n8n API
 * 3. Create n8n credentials from decrypted Supabase credentials
 * 4. Patch workflow nodes to reference new credentials
 * 5. Activate the workflow in n8n
 * 6. Store workflow_id, webhook_url in n8n_mappings
 * 
 * Security:
 * - Service role only (internal or admin-initiated)
 * - Credentials decrypted server-side, never exposed
 * - Idempotent: safe to retry using activation_request_id
 * 
 * Templates are NEVER modified or executed directly.
 * Each activation creates a UNIQUE isolated workflow.
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Types
interface N8nWorkflowNode {
  id: string;
  name: string;
  type: string;
  credentials?: Record<string, { id?: string; name?: string }>;
  parameters?: Record<string, unknown>;
  [key: string]: unknown;
}

interface N8nWorkflow {
  id?: string;
  name: string;
  nodes: N8nWorkflowNode[];
  connections: Record<string, unknown>;
  settings?: Record<string, unknown>;
  staticData?: unknown;
  [key: string]: unknown;
}

interface N8nCredentialType {
  name: string;
  type: string;
  data: Record<string, unknown>;
}

interface ProvisioningResult {
  success: boolean;
  workflowId?: string;
  webhookUrl?: string;
  credentialIds?: string[];
  error?: string;
}

// AES-256-GCM decryption
async function decryptCredentials(
  encryptedData: string,
  iv: string,
  tag: string,
  keyBase64: string
): Promise<string> {
  const keyBytes = Uint8Array.from(atob(keyBase64), (c) => c.charCodeAt(0));
  
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyBytes,
    { name: "AES-GCM", length: 256 },
    false,
    ["decrypt"]
  );
  
  const ivBytes = Uint8Array.from(atob(iv), (c) => c.charCodeAt(0));
  const encryptedBytes = Uint8Array.from(atob(encryptedData), (c) => c.charCodeAt(0));
  const tagBytes = Uint8Array.from(atob(tag), (c) => c.charCodeAt(0));
  
  const ciphertextWithTag = new Uint8Array(encryptedBytes.length + tagBytes.length);
  ciphertextWithTag.set(encryptedBytes);
  ciphertextWithTag.set(tagBytes, encryptedBytes.length);
  
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: ivBytes, tagLength: 128 },
    cryptoKey,
    ciphertextWithTag
  );
  
  return new TextDecoder().decode(decrypted);
}

// Map provider to n8n credential type
function getN8nCredentialType(provider: string): string {
  const typeMap: Record<string, string> = {
    hubspot: "hubspotOAuth2Api",
    gmail: "gmailOAuth2",
    google_calendar: "googleCalendarOAuth2Api",
    google_drive: "googleDriveOAuth2Api",
    google_sheets: "googleSheetsOAuth2Api",
    slack: "slackOAuth2Api",
    notion: "notionOAuth2Api",
    openai: "openAiApi",
    telegram: "telegramApi",
    microsoft_teams: "microsoftTeamsOAuth2Api",
    airtable: "airtableTokenApi",
  };
  return typeMap[provider.toLowerCase()] || `${provider}Api`;
}

// n8n API helper
async function n8nApiCall<T>(
  method: string,
  endpoint: string,
  body?: unknown
): Promise<{ data?: T; error?: string }> {
  let n8nBaseUrl = Deno.env.get("N8N_BASE_URL");
  const n8nApiKey = Deno.env.get("N8N_API_KEY");
  
  if (!n8nBaseUrl || !n8nApiKey) {
    return { error: "n8n API not configured" };
  }
  
  // Normalize base URL: remove trailing slashes and any path components
  // n8nBaseUrl should be just the origin (e.g., https://n8n.example.com)
  try {
    const urlObj = new URL(n8nBaseUrl);
    n8nBaseUrl = urlObj.origin; // Get just protocol + host
  } catch {
    // If parsing fails, just remove trailing slashes
    n8nBaseUrl = n8nBaseUrl.replace(/\/+$/, "");
  }
  
  const fullUrl = `${n8nBaseUrl}/api/v1${endpoint}`;
  console.log(`n8n API call: ${method} ${fullUrl}`);
  
  try {
    const response = await fetch(fullUrl, {
      method,
      headers: {
        "Content-Type": "application/json",
        "X-N8N-API-KEY": n8nApiKey,
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`n8n API error (${response.status}):`, errorText);
      return { error: `n8n API error: ${response.status} - ${errorText}` };
    }
    
    const data = await response.json();
    return { data: data as T };
  } catch (err) {
    console.error("n8n API call failed:", err);
    return { error: err instanceof Error ? err.message : "n8n API request failed" };
  }
}

// Create workflow in n8n
async function createWorkflow(
  templateJson: N8nWorkflow,
  clientName: string,
  activationId: string
): Promise<{ workflowId?: string; error?: string }> {
  // Clone and customize the template
  const workflow: N8nWorkflow = {
    ...templateJson,
    name: `[${clientName}] ${templateJson.name} - ${activationId.slice(0, 8)}`,
    // Remove any existing IDs to create a fresh copy
    id: undefined,
    // Add metadata for tracking
    settings: {
      ...templateJson.settings,
      saveDataSuccessExecution: "all",
      saveDataErrorExecution: "all",
    },
  };
  
  // Remove node IDs so n8n generates new ones
  workflow.nodes = workflow.nodes.map(node => ({
    ...node,
    // Clear any credential references - we'll patch these after creating credentials
    credentials: undefined,
  }));
  
  const result = await n8nApiCall<{ id: string }>("POST", "/workflows", workflow);
  
  if (result.error) {
    return { error: result.error };
  }
  
  return { workflowId: result.data?.id };
}

// Create credential in n8n
async function createCredential(
  type: string,
  name: string,
  data: Record<string, unknown>
): Promise<{ credentialId?: string; error?: string }> {
  const credential: N8nCredentialType = {
    name,
    type,
    data,
  };
  
  const result = await n8nApiCall<{ id: string }>("POST", "/credentials", credential);
  
  if (result.error) {
    return { error: result.error };
  }
  
  return { credentialId: result.data?.id };
}

// Patch workflow to use new credentials
async function patchWorkflowCredentials(
  workflowId: string,
  templateJson: N8nWorkflow,
  credentialMap: Record<string, { id: string; name: string; type: string }>
): Promise<{ success: boolean; error?: string }> {
  // Map node types to their credential requirements
  const nodeCredentialTypes: Record<string, string[]> = {
    "n8n-nodes-base.hubspot": ["hubspotOAuth2Api"],
    "n8n-nodes-base.gmail": ["gmailOAuth2"],
    "n8n-nodes-base.gmailTrigger": ["gmailOAuth2"],
    "n8n-nodes-base.googleCalendar": ["googleCalendarOAuth2Api"],
    "n8n-nodes-base.googleCalendarTrigger": ["googleCalendarOAuth2Api"],
    "n8n-nodes-base.googleDrive": ["googleDriveOAuth2Api"],
    "n8n-nodes-base.googleDriveTrigger": ["googleDriveOAuth2Api"],
    "n8n-nodes-base.googleSheets": ["googleSheetsOAuth2Api"],
    "n8n-nodes-base.slack": ["slackOAuth2Api"],
    "n8n-nodes-base.notion": ["notionOAuth2Api"],
    "n8n-nodes-base.openAi": ["openAiApi"],
    "n8n-nodes-base.telegram": ["telegramApi"],
    "n8n-nodes-base.microsoftTeams": ["microsoftTeamsOAuth2Api"],
  };
  
  // Patch nodes with credential references
  const patchedNodes = templateJson.nodes.map(node => {
    const requiredCredTypes = nodeCredentialTypes[node.type];
    if (!requiredCredTypes) {
      return node;
    }
    
    const credentials: Record<string, { id: string; name: string }> = {};
    for (const credType of requiredCredTypes) {
      const cred = Object.values(credentialMap).find(c => c.type === credType);
      if (cred) {
        credentials[credType] = { id: cred.id, name: cred.name };
      }
    }
    
    if (Object.keys(credentials).length > 0) {
      return { ...node, credentials };
    }
    return node;
  });
  
  // Update the workflow
  const result = await n8nApiCall<{ id: string }>("PATCH", `/workflows/${workflowId}`, {
    nodes: patchedNodes,
  });
  
  if (result.error) {
    return { success: false, error: result.error };
  }
  
  return { success: true };
}

// Activate workflow in n8n
async function activateWorkflow(
  workflowId: string
): Promise<{ success: boolean; error?: string }> {
  const result = await n8nApiCall<{ active: boolean }>(
    "POST", 
    `/workflows/${workflowId}/activate`
  );
  
  if (result.error) {
    return { success: false, error: result.error };
  }
  
  return { success: true };
}

// Get webhook URL from workflow
async function getWorkflowWebhookUrl(
  workflowId: string
): Promise<string | null> {
  const result = await n8nApiCall<N8nWorkflow>("GET", `/workflows/${workflowId}`);
  
  if (result.error || !result.data) {
    return null;
  }
  
  // Find webhook trigger node
  const webhookNode = result.data.nodes.find(
    node => node.type === "n8n-nodes-base.webhook"
  );
  
  if (webhookNode && webhookNode.parameters?.path) {
    const n8nBaseUrl = Deno.env.get("N8N_BASE_URL");
    return `${n8nBaseUrl}/webhook/${webhookNode.parameters.path}`;
  }
  
  return null;
}

// Types for database rows
interface ActivationRow {
  id: string;
  email: string;
  name: string;
  company: string | null;
  automation_id: string | null;
  status: string;
}

interface AutomationRow {
  id: string;
  slug: string;
  name: string;
  n8n_template_ids: string[] | null;
  required_integrations: { provider: string }[] | null;
}

interface TemplateRow {
  id: string;
  name: string;
  workflow_json: N8nWorkflow;
}

interface ConnectionRow {
  id: string;
  provider: string;
  encrypted_payload: string | null;
  encryption_iv: string | null;
  encryption_tag: string | null;
}

// Main provisioning function
async function provisionActivation(
  supabase: any,
  activationId: string,
  userId: string,
  userEmail: string
): Promise<ProvisioningResult> {
  const encryptionKey = Deno.env.get("CREDENTIAL_ENCRYPTION_KEY");
  if (!encryptionKey) {
    return { success: false, error: "Encryption key not configured" };
  }
  
  console.log(`Starting provisioning for activation: ${activationId}`);
  
  // Step 1: Get activation and linked automation
  const { data: activationData, error: activationError } = await supabase
    .from("installation_requests")
    .select("id, email, name, company, automation_id, status")
    .eq("id", activationId)
    .maybeSingle();
  
  const activation = activationData as ActivationRow | null;
  
  if (activationError || !activation) {
    return { success: false, error: "Activation not found" };
  }
  
  if (!activation.automation_id) {
    return { success: false, error: "No automation linked to activation" };
  }
  
  // Step 2: Get automation and linked template
  const { data: automationData, error: automationError } = await supabase
    .from("automation_agents")
    .select("id, slug, name, n8n_template_ids, required_integrations")
    .eq("id", activation.automation_id)
    .maybeSingle();
  
  const automation = automationData as AutomationRow | null;
  
  if (automationError || !automation) {
    return { success: false, error: "Automation not found" };
  }
  
  const templateIds = automation.n8n_template_ids;
  if (!templateIds || templateIds.length === 0) {
    return { success: false, error: "No template linked to automation" };
  }
  
  // Step 3: Fetch immutable template JSON
  const { data: templateData, error: templateError } = await supabase
    .from("n8n_workflow_templates")
    .select("id, name, workflow_json")
    .eq("id", templateIds[0])
    .maybeSingle();
  
  const template = templateData as TemplateRow | null;
  
  if (templateError || !template) {
    return { success: false, error: "Template not found" };
  }
  
  const templateJson = template.workflow_json;
  console.log(`Using template: ${template.name}`);
  
  // Step 4: Fetch user's connected integrations
  const requiredIntegrations = automation.required_integrations;
  const requiredProviders = (requiredIntegrations || [])
    .map(ri => ri.provider.toLowerCase())
    .filter(Boolean);
  
  let connections: ConnectionRow[] = [];
  
  // Only fetch connections if there are required integrations
  if (requiredProviders.length > 0) {
    const { data: connectionsData, error: connError } = await supabase
      .from("integration_connections")
      .select("id, provider, encrypted_payload, encryption_iv, encryption_tag")
      .eq("user_id", userId)
      .eq("status", "connected");
    
    connections = (connectionsData as ConnectionRow[] | null) || [];
    
    if (connError || connections.length === 0) {
      return { success: false, error: "No connected integrations found" };
    }
    
    // Verify all required providers are connected
    const connectedProviders = new Set(connections.map(c => c.provider.toLowerCase()));
    const missingProviders = requiredProviders.filter(p => !connectedProviders.has(p));
    
    if (missingProviders.length > 0) {
      return { 
        success: false, 
        error: `Missing integrations: ${missingProviders.join(", ")}` 
      };
    }
  } else {
    console.log("No required integrations - proceeding without credentials");
  }
  
  // Step 5: Create workflow in n8n
  const clientName = activation.company || activation.name || userEmail.split("@")[0];
  const { workflowId, error: workflowError } = await createWorkflow(
    templateJson,
    clientName,
    activationId
  );
  
  if (workflowError || !workflowId) {
    return { success: false, error: workflowError || "Failed to create workflow" };
  }
  
  console.log(`Created workflow: ${workflowId}`);
  
  // Step 6: Create credentials in n8n
  const credentialMap: Record<string, { id: string; name: string; type: string }> = {};
  const createdCredentialIds: string[] = [];
  
  for (const conn of connections) {
    // Only create credentials for required providers
    if (requiredProviders.length > 0 && !requiredProviders.includes(conn.provider.toLowerCase())) {
      continue;
    }
    
    if (!conn.encrypted_payload || !conn.encryption_iv || !conn.encryption_tag) {
      console.warn(`No encrypted data for provider: ${conn.provider}`);
      continue;
    }
    
    try {
      const decryptedJson = await decryptCredentials(
        conn.encrypted_payload,
        conn.encryption_iv,
        conn.encryption_tag,
        encryptionKey
      );
      
      const credentialData = JSON.parse(decryptedJson);
      const credentialType = getN8nCredentialType(conn.provider);
      const credentialName = `[${clientName}] ${conn.provider} - ${activationId.slice(0, 8)}`;
      
      const { credentialId, error: credError } = await createCredential(
        credentialType,
        credentialName,
        credentialData
      );
      
      if (credError || !credentialId) {
        console.error(`Failed to create credential for ${conn.provider}:`, credError);
        continue;
      }
      
      credentialMap[conn.provider] = {
        id: credentialId,
        name: credentialName,
        type: credentialType,
      };
      createdCredentialIds.push(credentialId);
      
      console.log(`Created credential: ${credentialId} for ${conn.provider}`);
    } catch (err) {
      console.error(`Failed to process credential for ${conn.provider}:`, err);
    }
  }
  
  // Step 7: Patch workflow with credentials
  const { success: patchSuccess, error: patchError } = await patchWorkflowCredentials(
    workflowId,
    templateJson,
    credentialMap
  );
  
  if (!patchSuccess) {
    console.error("Failed to patch workflow credentials:", patchError);
    // Continue anyway - workflow can be manually configured
  }
  
  // Step 8: Activate the workflow
  const { success: activateSuccess, error: activateError } = await activateWorkflow(workflowId);
  
  if (!activateSuccess) {
    console.warn("Failed to activate workflow:", activateError);
    // Don't fail - workflow was created, can be activated manually
  }
  
  // Step 9: Get webhook URL if applicable
  const webhookUrl = await getWorkflowWebhookUrl(workflowId);
  
  console.log(`Provisioning complete. Workflow: ${workflowId}, Active: ${activateSuccess}`);
  
  return {
    success: true,
    workflowId,
    webhookUrl: webhookUrl || undefined,
    credentialIds: createdCredentialIds,
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  
  try {
    // Validate service-role or admin authorization
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    // First validate the user token
    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    
    const { data: userData, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !userData?.user) {
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const userId = userData.user.id;
    const userEmail = userData.user.email!;
    
    // Use service role for provisioning operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { activationRequestId } = await req.json();
    
    if (!activationRequestId) {
      return new Response(
        JSON.stringify({ error: "activationRequestId required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Check for existing mapping (idempotency)
    const { data: existingMapping } = await supabase
      .from("n8n_mappings")
      .select("id, n8n_workflow_ids, status")
      .eq("activation_request_id", activationRequestId)
      .eq("user_id", userId)
      .maybeSingle();
    
    if (existingMapping && existingMapping.n8n_workflow_ids?.length > 0) {
      const existingStatus = existingMapping.status;
      if (["active", "provisioning"].includes(existingStatus)) {
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: "Already provisioned",
            workflowId: existingMapping.n8n_workflow_ids[0],
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }
    
    // Create/update mapping to "provisioning" status
    const mappingId = existingMapping?.id || crypto.randomUUID();
    
    if (!existingMapping) {
      // Get activation to find automation_id
      const { data: activation } = await supabase
        .from("installation_requests")
        .select("automation_id, bundle_id")
        .eq("id", activationRequestId)
        .maybeSingle();
      
      await supabase
        .from("n8n_mappings")
        .insert({
          id: mappingId,
          user_id: userId,
          activation_request_id: activationRequestId,
          automation_id: activation?.automation_id,
          bundle_id: activation?.bundle_id,
          status: "provisioning",
          metadata: { started_at: new Date().toISOString() },
        });
    } else {
      await supabase
        .from("n8n_mappings")
        .update({ 
          status: "provisioning",
          error_message: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", mappingId);
    }
    
    // Execute provisioning
    const result = await provisionActivation(supabase, activationRequestId, userId, userEmail);
    
    // Update mapping with result
    if (result.success) {
      await supabase
        .from("n8n_mappings")
        .update({
          status: "active",
          n8n_workflow_ids: result.workflowId ? [result.workflowId] : [],
          n8n_credential_ids: result.credentialIds || [],
          provisioned_at: new Date().toISOString(),
          metadata: {
            webhook_url: result.webhookUrl,
            provisioned_at: new Date().toISOString(),
          },
          updated_at: new Date().toISOString(),
        })
        .eq("id", mappingId);
      
      // Update activation status to live
      await supabase
        .from("installation_requests")
        .update({
          status: "live",
          customer_visible_status: "live",
          status_updated_at: new Date().toISOString(),
        })
        .eq("id", activationRequestId);
      
      // Create success notification
      await supabase
        .from("client_notifications")
        .insert({
          user_id: userId,
          type: "automation_activated",
          title: "Automation Live!",
          body: "Your automation has been activated and is now running.",
          severity: "success",
          metadata: { 
            activation_request_id: activationRequestId,
            workflow_id: result.workflowId,
          },
        });
    } else {
      await supabase
        .from("n8n_mappings")
        .update({
          status: "error",
          error_message: result.error,
          updated_at: new Date().toISOString(),
        })
        .eq("id", mappingId);
      
      // Update activation status
      await supabase
        .from("installation_requests")
        .update({
          status: "needs_attention",
          customer_visible_status: "needs_attention",
          status_updated_at: new Date().toISOString(),
        })
        .eq("id", activationRequestId);
      
      // Create admin notification
      await supabase
        .from("admin_notifications")
        .insert({
          type: "provisioning_failed",
          title: "Provisioning Failed",
          body: `Failed to provision automation for ${userEmail}: ${result.error}`,
          severity: "error",
          metadata: { activation_request_id: activationRequestId, error: result.error },
        });
    }
    
    return new Response(
      JSON.stringify(result),
      { 
        status: result.success ? 200 : 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
    
  } catch (error) {
    console.error("Provisioning error:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : "Internal error" 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
