// Tenant and Agent types for Hosted Agents flow

export type SetupStep = "provisioning" | "connect" | "deploy" | "live";

export interface AgentPackRecommendation {
  agent_name: string;
  agent_slug: string;
  purpose: string;
  required_connectors: string[];
  trigger_type: string;
  run_frequency: string;
  deliverable_outputs: string[];
  deployment_complexity: "low" | "medium" | "high";
  success_metric: string;
}

export interface ConnectorStatus {
  connector: string;
  status: "needs_auth" | "connected" | "error";
}

export interface AgentStatus {
  agent_slug: string;
  status: "pending" | "deploying" | "active" | "error";
  last_run_at?: string;
  last_status?: "success" | "failed" | "running";
}

export interface TenantActivationResponse {
  tenant_id: string;
  tenant_status: "provisioning" | "ready" | "error";
  n8n_base_url: string;
  n8n_embed_url: string;
  required_connectors: string[];
  agents: AgentStatus[];
}

export interface TenantStatusResponse {
  tenant_id: string;
  connectors: ConnectorStatus[];
  agents: AgentStatus[];
  n8n_embed_url: string;
}

export interface RunAgentResponse {
  run_id: string;
  status: "queued" | "running" | "success" | "failed";
}
