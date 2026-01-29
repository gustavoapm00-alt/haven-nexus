import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface N8nCredentialCreate {
  name: string;
  type: string;
  data: Record<string, unknown>;
}

interface N8nWorkflowCreate {
  name: string;
  nodes: unknown[];
  connections: Record<string, unknown>;
  settings?: Record<string, unknown>;
  active?: boolean;
}

// n8n API client
class N8nClient {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = Deno.env.get("N8N_BASE_URL") || "";
    this.apiKey = Deno.env.get("N8N_API_KEY") || "";
    
    if (!this.baseUrl || !this.apiKey) {
      throw new Error("N8N_BASE_URL and N8N_API_KEY must be configured");
    }
    
    // Ensure base URL doesn't have trailing slash
    this.baseUrl = this.baseUrl.replace(/\/$/, "");
  }

  private async request(endpoint: string, options: RequestInit = {}): Promise<unknown> {
    const url = `${this.baseUrl}/api/v1${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        "X-N8N-API-KEY": this.apiKey,
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`n8n API error: ${response.status} - ${errorText}`);
      throw new Error(`n8n API error: ${response.status}`);
    }

    return response.json();
  }

  async createCredential(credential: N8nCredentialCreate): Promise<{ id: string }> {
    const result = await this.request("/credentials", {
      method: "POST",
      body: JSON.stringify(credential),
    });
    return result as { id: string };
  }

  async getWorkflow(workflowId: string): Promise<N8nWorkflowCreate> {
    const result = await this.request(`/workflows/${workflowId}`);
    return result as N8nWorkflowCreate;
  }

  async createWorkflow(workflow: N8nWorkflowCreate): Promise<{ id: string }> {
    const result = await this.request("/workflows", {
      method: "POST",
      body: JSON.stringify(workflow),
    });
    return result as { id: string };
  }

  async activateWorkflow(workflowId: string): Promise<void> {
    await this.request(`/workflows/${workflowId}/activate`, {
      method: "POST",
    });
  }

  async deactivateWorkflow(workflowId: string): Promise<void> {
    await this.request(`/workflows/${workflowId}/deactivate`, {
      method: "POST",
    });
  }

  async deleteCredential(credentialId: string): Promise<void> {
    await this.request(`/credentials/${credentialId}`, {
      method: "DELETE",
    });
  }

  async deleteWorkflow(workflowId: string): Promise<void> {
    await this.request(`/workflows/${workflowId}`, {
      method: "DELETE",
    });
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate authorization
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = claimsData.claims.sub;
    const userEmail = claimsData.claims.email as string;

    const { action, activationRequestId, credentialData, templateWorkflowId } = await req.json();

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const n8n = new N8nClient();

    switch (action) {
      case "provision": {
        // Get activation request
        const { data: activation, error: activationError } = await supabaseAdmin
          .from("installation_requests")
          .select("*, automation_agents(*), automation_bundles(*)")
          .eq("id", activationRequestId)
          .eq("email", userEmail)
          .maybeSingle();

        if (activationError || !activation) {
          return new Response(
            JSON.stringify({ error: "Activation request not found" }),
            { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Check all required connections are ready
        const { data: connections } = await supabaseAdmin
          .from("integration_connections")
          .select("*")
          .eq("activation_request_id", activationRequestId)
          .eq("status", "connected");

        if (!connections || connections.length === 0) {
          return new Response(
            JSON.stringify({ error: "No connected integrations found" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Create n8n mapping record
        const { data: mapping, error: mappingError } = await supabaseAdmin
          .from("n8n_mappings")
          .insert({
            user_id: userId,
            activation_request_id: activationRequestId,
            automation_id: activation.automation_id,
            bundle_id: activation.bundle_id,
            status: "provisioning",
            metadata: {
              customer_email: userEmail,
              customer_name: activation.name,
            },
          })
          .select()
          .single();

        if (mappingError) {
          console.error("Failed to create mapping:", mappingError);
          return new Response(
            JSON.stringify({ error: "Failed to start provisioning" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // For now, return success - actual n8n workflow creation happens when templates are provided
        // Update mapping to active (placeholder until templates are configured)
        await supabaseAdmin
          .from("n8n_mappings")
          .update({
            status: "active",
            provisioned_at: new Date().toISOString(),
          })
          .eq("id", mapping.id);

        // Update activation request status
        await supabaseAdmin
          .from("installation_requests")
          .update({
            status: "live",
            customer_visible_status: "live",
            status_updated_at: new Date().toISOString(),
          })
          .eq("id", activationRequestId);

        return new Response(
          JSON.stringify({ 
            success: true, 
            mappingId: mapping.id,
            message: "Provisioning initiated successfully" 
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "create_credential": {
        // Create credential in n8n
        const credential = await n8n.createCredential(credentialData);
        
        return new Response(
          JSON.stringify({ success: true, credentialId: credential.id }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "clone_workflow": {
        // Clone a template workflow
        const templateWorkflow = await n8n.getWorkflow(templateWorkflowId);
        
        // Modify workflow for customer
        const customerWorkflow: N8nWorkflowCreate = {
          ...templateWorkflow,
          name: `${templateWorkflow.name} - ${userEmail}`,
          active: false,
        };

        const newWorkflow = await n8n.createWorkflow(customerWorkflow);
        
        return new Response(
          JSON.stringify({ success: true, workflowId: newWorkflow.id }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "activate_workflow": {
        const { workflowId } = await req.json();
        await n8n.activateWorkflow(workflowId);
        
        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "pause": {
        // Pause all workflows for an activation
        const { data: mapping } = await supabaseAdmin
          .from("n8n_mappings")
          .select("*")
          .eq("activation_request_id", activationRequestId)
          .eq("user_id", userId)
          .maybeSingle();

        if (mapping && mapping.n8n_workflow_ids?.length > 0) {
          for (const workflowId of mapping.n8n_workflow_ids) {
            try {
              await n8n.deactivateWorkflow(workflowId);
            } catch (err) {
              console.error(`Failed to deactivate workflow ${workflowId}:`, err);
            }
          }
        }

        await supabaseAdmin
          .from("n8n_mappings")
          .update({ status: "paused" })
          .eq("activation_request_id", activationRequestId);

        await supabaseAdmin
          .from("installation_requests")
          .update({
            status: "paused",
            customer_visible_status: "paused",
            status_updated_at: new Date().toISOString(),
          })
          .eq("id", activationRequestId);

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "resume": {
        // Resume all workflows for an activation
        const { data: mapping } = await supabaseAdmin
          .from("n8n_mappings")
          .select("*")
          .eq("activation_request_id", activationRequestId)
          .eq("user_id", userId)
          .maybeSingle();

        if (mapping && mapping.n8n_workflow_ids?.length > 0) {
          for (const workflowId of mapping.n8n_workflow_ids) {
            try {
              await n8n.activateWorkflow(workflowId);
            } catch (err) {
              console.error(`Failed to activate workflow ${workflowId}:`, err);
            }
          }
        }

        await supabaseAdmin
          .from("n8n_mappings")
          .update({ status: "active" })
          .eq("activation_request_id", activationRequestId);

        await supabaseAdmin
          .from("installation_requests")
          .update({
            status: "live",
            customer_visible_status: "live",
            status_updated_at: new Date().toISOString(),
          })
          .eq("id", activationRequestId);

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "revoke": {
        // Revoke/deactivate all resources for an activation
        const { data: mapping } = await supabaseAdmin
          .from("n8n_mappings")
          .select("*")
          .eq("activation_request_id", activationRequestId)
          .eq("user_id", userId)
          .maybeSingle();

        if (mapping) {
          // Deactivate and optionally delete workflows
          for (const workflowId of mapping.n8n_workflow_ids || []) {
            try {
              await n8n.deactivateWorkflow(workflowId);
            } catch (err) {
              console.error(`Failed to deactivate workflow ${workflowId}:`, err);
            }
          }

          await supabaseAdmin
            .from("n8n_mappings")
            .update({ status: "deactivated" })
            .eq("id", mapping.id);
        }

        // Mark connections as revoked
        await supabaseAdmin
          .from("integration_connections")
          .update({ status: "revoked", updated_at: new Date().toISOString() })
          .eq("activation_request_id", activationRequestId);

        await supabaseAdmin
          .from("installation_requests")
          .update({
            status: "completed",
            customer_visible_status: "completed",
            status_updated_at: new Date().toISOString(),
          })
          .eq("id", activationRequestId);

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: "Invalid action" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
  } catch (error) {
    console.error("n8n provision error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
