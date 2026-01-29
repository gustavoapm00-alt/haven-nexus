/**
 * Template Intake Specification
 * 
 * AERELION Automation Template Asset System
 * 
 * This file defines the dropped file categories, validation rules,
 * and metadata requirements for the admin template intake system.
 */

// =============================================================================
// FILE CATEGORIES
// =============================================================================

export const TEMPLATE_FILE_CATEGORIES = {
  workflow: {
    file_type: 'workflow',
    label: 'Workflow Template',
    description: 'n8n workflow JSON file (must contain nodes)',
    required: true,
    accept: '.json',
    extensions: ['json'],
    icon: 'json',
    validation: {
      mustBeValidJSON: true,
      mustContainNodes: true,
      mustContainTrigger: true,
    },
  },
  deployment_guide: {
    file_type: 'deployment_guide',
    label: 'Deployment Guide',
    description: 'PDF or Markdown guide for internal reference',
    required: false,
    accept: '.pdf,.md',
    extensions: ['pdf', 'md'],
    icon: 'pdf',
    validation: {
      maxSizeMB: 10,
    },
  },
  requirements: {
    file_type: 'requirements',
    label: 'Requirements',
    description: 'Markdown file listing prerequisites and dependencies',
    required: false,
    accept: '.md,.txt',
    extensions: ['md', 'txt'],
    icon: 'markdown',
    validation: {
      maxSizeMB: 1,
    },
  },
  prompt_template: {
    file_type: 'prompt_template',
    label: 'Prompt Template',
    description: 'Optional AI prompts used by the workflow',
    required: false,
    accept: '.md,.txt',
    extensions: ['md', 'txt'],
    icon: 'markdown',
    validation: {
      maxSizeMB: 1,
    },
  },
} as const;

export type TemplateFileCategory = keyof typeof TEMPLATE_FILE_CATEGORIES;

// =============================================================================
// STORAGE PATH CONVENTION
// =============================================================================

/**
 * Storage path format:
 * agents/{slug}/{version}/{file_type}.{extension}
 * 
 * Examples:
 * - agents/client-onboarding-pack/v1/workflow.json
 * - agents/client-onboarding-pack/v1/deployment_guide.pdf
 * - agents/client-onboarding-pack/v2/requirements.md
 */
export function buildTemplatePath(
  slug: string,
  version: string,
  fileType: TemplateFileCategory,
  extension: string
): string {
  return `agents/${slug}/${version}/${fileType}.${extension}`;
}

// =============================================================================
// WORKFLOW JSON SCHEMA
// =============================================================================

export interface N8nWorkflowNode {
  id: string;
  name: string;
  type: string;
  typeVersion?: number;
  position: [number, number];
  parameters?: Record<string, unknown>;
  credentials?: Record<string, { id: string; name: string }>;
}

export interface N8nWorkflowJSON {
  name: string;
  nodes: N8nWorkflowNode[];
  connections: Record<string, unknown>;
  active?: boolean;
  settings?: Record<string, unknown>;
  staticData?: unknown;
  tags?: { id: string; name: string }[];
  meta?: {
    instanceId?: string;
    templateId?: string;
    templateCredsSetupCompleted?: boolean;
  };
}

// =============================================================================
// WORKFLOW PARSING & VALIDATION
// =============================================================================

export interface WorkflowParseResult {
  valid: boolean;
  name: string;
  nodeCount: number;
  hasTrigger: boolean;
  triggerType: string | null;
  requiredCredentials: string[];
  extractedIntegrations: string[];
  errors: string[];
}

/**
 * Parse and validate an n8n workflow JSON file
 */
export function parseWorkflowJSON(content: string): WorkflowParseResult {
  const result: WorkflowParseResult = {
    valid: false,
    name: '',
    nodeCount: 0,
    hasTrigger: false,
    triggerType: null,
    requiredCredentials: [],
    extractedIntegrations: [],
    errors: [],
  };

  try {
    const workflow = JSON.parse(content) as N8nWorkflowJSON;

    // Check for required fields
    if (!workflow.nodes || !Array.isArray(workflow.nodes)) {
      result.errors.push('Workflow must contain a "nodes" array');
      return result;
    }

    result.name = workflow.name || 'Untitled Workflow';
    result.nodeCount = workflow.nodes.length;

    if (result.nodeCount === 0) {
      result.errors.push('Workflow must contain at least one node');
      return result;
    }

    // Find trigger node
    const triggerNode = workflow.nodes.find(node => 
      node.type.toLowerCase().includes('trigger') ||
      node.type.toLowerCase().includes('webhook') ||
      node.type === 'n8n-nodes-base.webhook' ||
      node.type === 'n8n-nodes-base.manualTrigger' ||
      node.type === 'n8n-nodes-base.scheduleTrigger'
    );

    if (triggerNode) {
      result.hasTrigger = true;
      result.triggerType = triggerNode.type;
    } else {
      result.errors.push('Workflow should contain a trigger node (webhook, schedule, or manual)');
    }

    // Extract required credentials and integrations
    const credentialTypes = new Set<string>();
    const integrations = new Set<string>();

    for (const node of workflow.nodes) {
      // Extract credential types
      if (node.credentials) {
        for (const credType of Object.keys(node.credentials)) {
          credentialTypes.add(credType);
          
          // Map credential type to integration name
          const integrationName = mapCredentialToIntegration(credType);
          if (integrationName) {
            integrations.add(integrationName);
          }
        }
      }

      // Also extract from node type
      const nodeIntegration = extractIntegrationFromNodeType(node.type);
      if (nodeIntegration) {
        integrations.add(nodeIntegration);
      }
    }

    result.requiredCredentials = Array.from(credentialTypes);
    result.extractedIntegrations = Array.from(integrations);
    result.valid = result.errors.length === 0;

  } catch (e) {
    result.errors.push(`Invalid JSON: ${e instanceof Error ? e.message : 'Parse error'}`);
  }

  return result;
}

/**
 * Map n8n credential types to integration provider names
 */
function mapCredentialToIntegration(credentialType: string): string | null {
  const credentialMap: Record<string, string> = {
    // Google
    'googleApi': 'google',
    'googleOAuth2Api': 'google',
    'gmailOAuth2Api': 'gmail',
    'googleSheetsOAuth2Api': 'sheets',
    'googleCalendarOAuth2Api': 'calendar',
    'googleDriveOAuth2Api': 'google_drive',
    
    // CRM
    'hubspotApi': 'hubspot',
    'hubspotOAuth2Api': 'hubspot',
    'salesforceOAuth2Api': 'salesforce',
    'pipedriveApi': 'pipedrive',
    
    // Communication
    'slackApi': 'slack',
    'slackOAuth2Api': 'slack',
    'twilioApi': 'twilio',
    
    // Project Management
    'notionApi': 'notion',
    'notionOAuth2Api': 'notion',
    'airtableApi': 'airtable',
    'asanaApi': 'asana',
    
    // Payments
    'stripeApi': 'stripe',
    'quickBooksOAuth2Api': 'quickbooks',
    
    // Other
    'openAiApi': 'openai',
    'anthropicApi': 'anthropic',
    'httpBasicAuth': null, // Generic, skip
    'httpHeaderAuth': null,
  };

  return credentialMap[credentialType] || null;
}

/**
 * Extract integration name from n8n node type
 */
function extractIntegrationFromNodeType(nodeType: string): string | null {
  // e.g., "n8n-nodes-base.hubspot" -> "hubspot"
  const match = nodeType.match(/n8n-nodes-base\.(\w+)/);
  if (match) {
    const name = match[1].toLowerCase();
    // Skip generic nodes
    const skipList = ['set', 'if', 'switch', 'code', 'function', 'http', 'webhook', 'start', 'wait', 'merge'];
    if (!skipList.includes(name)) {
      return name;
    }
  }
  return null;
}

// =============================================================================
// AUTOMATION TEMPLATE METADATA
// =============================================================================

export interface AutomationTemplateMetadata {
  slug: string;
  name: string;
  description: string;
  short_outcome: string;
  
  // Extracted from workflow
  required_integrations: {
    provider: string;
    displayName: string;
    description: string;
    authType: 'oauth' | 'api_key' | 'token';
  }[];
  
  // Configuration fields for customer input
  configuration_fields: {
    name: string;
    label: string;
    type: 'text' | 'email' | 'number' | 'select' | 'textarea';
    placeholder?: string;
    required: boolean;
    options?: string[]; // For select type
  }[];
  
  // Execution
  workflow_engine: 'n8n';
  n8n_workflow_id?: string;
  webhook_url?: string;
  
  // Versioning
  version: string;
  
  // Business
  price_cents: number;
  setup_time_min: number;
  setup_time_max: number;
  capacity_recovered_min: number;
  capacity_recovered_max: number;
  
  // Categorization
  sectors: string[];
  systems: string[];
}

// =============================================================================
// BULK IMPORT STRUCTURE
// =============================================================================

export interface BulkTemplateImport {
  templates: {
    slug: string;
    metadata: Partial<AutomationTemplateMetadata>;
    files: {
      workflow?: File;
      deployment_guide?: File;
      requirements?: File;
      prompt_template?: File;
    };
  }[];
}

/**
 * Validate a bulk import payload
 */
export function validateBulkImport(payload: BulkTemplateImport): {
  valid: boolean;
  errors: { slug: string; errors: string[] }[];
} {
  const results: { slug: string; errors: string[] }[] = [];

  for (const template of payload.templates) {
    const errors: string[] = [];

    if (!template.slug) {
      errors.push('slug is required');
    }

    if (!template.files.workflow) {
      errors.push('workflow file is required');
    }

    if (errors.length > 0) {
      results.push({ slug: template.slug || 'unknown', errors });
    }
  }

  return {
    valid: results.length === 0,
    errors: results,
  };
}
