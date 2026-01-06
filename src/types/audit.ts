// Audit verdict JSON shape from the backend
export interface AuditVerdict {
  audit_id: string;
  created_at: string;
  website_url: string;
  name?: string;
  email?: string;
  primary_friction: string;
  breakdown_first: string;
  tool_entropy: string;
  absence_test_48h: string;
  operational_volume: string;
  decision_maker: boolean;
  notes?: string;
  consent_ack: boolean;
  diagnosis: DiagnosisData;
}

export interface DiagnosisData {
  id: string;
  audit_id: string;
  leak_hours_low: number;
  leak_hours_high: number;
  recovered_hours_low: number;
  recovered_hours_high: number;
  primary_failure_mode: string;
  plain_language_cause: string;
  what_is_happening: string;
  recommended_systems: RecommendedSystem[];
  recommended_agents?: AgentPack[];
  equation?: string;
  readiness_level: "low" | "medium" | "high";
  next_step: string;
  confidence: number;
  disclaimer?: string;
  raw_signals?: Record<string, unknown>;
}

export interface RecommendedSystem {
  name: string;
  description: string;
  priority?: number;
}

export interface AgentPack {
  agent_name: string;
  purpose: string;
  inputs: string[];
  automations: string[];
  success_metric: string;
  deployment_complexity: "low" | "medium" | "high";
}

export interface AuditData {
  id: string;
  created_at: string;
  website_url?: string;
  name: string;
  email: string;
  primary_friction: string;
  breakdown_first: string;
  tool_entropy: string;
  absence_test_48h: string;
  operational_volume: string;
  decision_maker: boolean;
  notes?: string;
  status: string;
}

// Form data types
export interface AuditFormData {
  // Step 1: Business
  website_url: string;
  name: string;
  email: string;
  decision_maker: boolean | null;
  // Step 2: Operational Reality
  primary_friction: string;
  breakdown_first: string;
  tool_entropy: string;
  absence_test_48h: string;
  operational_volume: string;
  // Step 3: Context + Consent
  notes: string;
  consent_ack: boolean;
}

export interface DeploymentFormData {
  audit_id: string;
  diagnosis_id: string;
  name: string;
  email: string;
  preferred_tools: string[];
  timeline: string;
  budget_comfort: string;
  notes: string;
}
