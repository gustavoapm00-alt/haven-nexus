// Credential schema definitions for each automation type
// These define what credentials are required for each service

export interface CredentialField {
  key: string;
  label: string;
  type: 'text' | 'password' | 'textarea' | 'url' | 'email';
  placeholder?: string;
  helpText?: string;
  required: boolean;
  sensitive: boolean; // If true, this field contains sensitive data
}

export interface CredentialSchema {
  credentialType: string;
  serviceName: string;
  description: string;
  iconName: string; // Lucide icon name
  fields: CredentialField[];
  additionalInstructions?: string;
  authMethod: 'oauth' | 'token' | 'webhook' | 'api_key'; // Real auth method
  oauthProvider?: string; // For OAuth flows
}

// Common credential schemas for supported services
export const CREDENTIAL_SCHEMAS: Record<string, CredentialSchema> = {
  // --- Email Services ---
  gmail_oauth: {
    credentialType: 'gmail_oauth',
    serviceName: 'Gmail / Google Workspace',
    description: 'Authorize secure access to send and receive emails on your behalf',
    iconName: 'Mail',
    authMethod: 'oauth',
    oauthProvider: 'google',
    fields: [
      {
        key: 'client_id',
        label: 'OAuth Client ID',
        type: 'text',
        placeholder: 'xxxx.apps.googleusercontent.com',
        helpText: 'From Google Cloud Console → APIs & Services → Credentials',
        required: true,
        sensitive: false,
      },
      {
        key: 'client_secret',
        label: 'OAuth Client Secret',
        type: 'password',
        placeholder: 'GOCSPX-...',
        helpText: 'Keep this secret secure',
        required: true,
        sensitive: true,
      },
      {
        key: 'refresh_token',
        label: 'OAuth Refresh Token',
        type: 'password',
        helpText: 'We can help you generate this during setup',
        required: false,
        sensitive: true,
      },
    ],
    additionalInstructions: 'You may need to enable the Gmail API in your Google Cloud Console.',
  },

  email: {
    credentialType: 'email',
    serviceName: 'Email',
    description: 'Authorize access to your email for automation workflows',
    iconName: 'Mail',
    authMethod: 'oauth',
    oauthProvider: 'google',
    fields: [
      {
        key: 'client_id',
        label: 'OAuth Client ID',
        type: 'text',
        placeholder: 'xxxx.apps.googleusercontent.com',
        helpText: 'From Google Cloud Console → APIs & Services → Credentials',
        required: true,
        sensitive: false,
      },
      {
        key: 'client_secret',
        label: 'OAuth Client Secret',
        type: 'password',
        helpText: 'Keep this secret secure',
        required: true,
        sensitive: true,
      },
    ],
    additionalInstructions: 'We support Gmail and Google Workspace email accounts.',
  },

  // --- Communication ---
  slack_bot: {
    credentialType: 'slack_bot',
    serviceName: 'Slack',
    description: 'Authorize access to send messages and interact with your Slack workspace',
    iconName: 'MessageSquare',
    authMethod: 'token',
    fields: [
      {
        key: 'bot_token',
        label: 'Bot User OAuth Token',
        type: 'password',
        placeholder: 'xoxb-...',
        helpText: 'From Slack App → OAuth & Permissions → Bot User OAuth Token',
        required: true,
        sensitive: true,
      },
      {
        key: 'signing_secret',
        label: 'Signing Secret',
        type: 'password',
        placeholder: 'Found in Basic Information',
        helpText: 'Used to verify requests from Slack',
        required: false,
        sensitive: true,
      },
    ],
    additionalInstructions: 'Create a Slack App at api.slack.com/apps with the necessary scopes.',
  },

  // --- Productivity ---
  notion_api: {
    credentialType: 'notion_api',
    serviceName: 'Notion',
    description: 'Authorize access to read and write to your Notion workspace',
    iconName: 'BookOpen',
    authMethod: 'api_key',
    fields: [
      {
        key: 'api_key',
        label: 'Integration Token',
        type: 'password',
        placeholder: 'secret_...',
        helpText: 'From Notion Settings → Integrations → Internal Integration',
        required: true,
        sensitive: true,
      },
      {
        key: 'database_id',
        label: 'Database ID (optional)',
        type: 'text',
        placeholder: 'The ID from your database URL',
        helpText: 'If the automation targets a specific database',
        required: false,
        sensitive: false,
      },
    ],
    additionalInstructions: 'Share the relevant pages/databases with your integration.',
  },

  airtable_api: {
    credentialType: 'airtable_api',
    serviceName: 'Airtable',
    description: 'Authorize access to read and write to your Airtable bases',
    iconName: 'Table',
    authMethod: 'api_key',
    fields: [
      {
        key: 'api_key',
        label: 'Personal Access Token',
        type: 'password',
        placeholder: 'pat...',
        helpText: 'From Airtable → Account → Developer Hub → Personal Access Tokens',
        required: true,
        sensitive: true,
      },
      {
        key: 'base_id',
        label: 'Base ID',
        type: 'text',
        placeholder: 'app...',
        helpText: 'Found in your base URL or API documentation',
        required: false,
        sensitive: false,
      },
    ],
  },

  // --- Calendar ---
  google_calendar: {
    credentialType: 'google_calendar',
    serviceName: 'Google Calendar',
    description: 'Authorize access to create and manage calendar events',
    iconName: 'Calendar',
    authMethod: 'oauth',
    oauthProvider: 'google',
    fields: [
      {
        key: 'client_id',
        label: 'OAuth Client ID',
        type: 'text',
        placeholder: 'xxxx.apps.googleusercontent.com',
        required: true,
        sensitive: false,
      },
      {
        key: 'client_secret',
        label: 'OAuth Client Secret',
        type: 'password',
        required: true,
        sensitive: true,
      },
      {
        key: 'refresh_token',
        label: 'OAuth Refresh Token',
        type: 'password',
        required: false,
        sensitive: true,
      },
    ],
    additionalInstructions: 'Enable Google Calendar API in your Google Cloud Console.',
  },

  calendar: {
    credentialType: 'calendar',
    serviceName: 'Calendar',
    description: 'Authorize calendar access for scheduling automations',
    iconName: 'Calendar',
    authMethod: 'oauth',
    oauthProvider: 'google',
    fields: [
      {
        key: 'client_id',
        label: 'OAuth Client ID',
        type: 'text',
        placeholder: 'xxxx.apps.googleusercontent.com',
        required: true,
        sensitive: false,
      },
      {
        key: 'client_secret',
        label: 'OAuth Client Secret',
        type: 'password',
        required: true,
        sensitive: true,
      },
    ],
    additionalInstructions: 'We support Google Calendar.',
  },

  // --- SMS/Phone ---
  twilio_sms: {
    credentialType: 'twilio_sms',
    serviceName: 'Twilio (SMS)',
    description: 'Authorize access to send and receive SMS messages',
    iconName: 'Phone',
    authMethod: 'api_key',
    fields: [
      {
        key: 'account_sid',
        label: 'Account SID',
        type: 'text',
        placeholder: 'AC...',
        helpText: 'From Twilio Console dashboard',
        required: true,
        sensitive: false,
      },
      {
        key: 'auth_token',
        label: 'Auth Token',
        type: 'password',
        helpText: 'From Twilio Console dashboard',
        required: true,
        sensitive: true,
      },
      {
        key: 'phone_number',
        label: 'Twilio Phone Number',
        type: 'text',
        placeholder: '+1...',
        helpText: 'Your Twilio phone number for sending messages',
        required: true,
        sensitive: false,
      },
    ],
  },

  // --- Payments ---
  stripe_api: {
    credentialType: 'stripe_api',
    serviceName: 'Stripe',
    description: 'Authorize access to process payments and manage subscriptions',
    iconName: 'CreditCard',
    authMethod: 'api_key',
    fields: [
      {
        key: 'secret_key',
        label: 'Secret API Key',
        type: 'password',
        placeholder: 'sk_live_... or sk_test_...',
        helpText: 'From Stripe Dashboard → Developers → API Keys',
        required: true,
        sensitive: true,
      },
      {
        key: 'webhook_secret',
        label: 'Webhook Signing Secret',
        type: 'password',
        placeholder: 'whsec_...',
        helpText: 'From your webhook endpoint configuration',
        required: false,
        sensitive: true,
      },
    ],
    additionalInstructions: 'Use test keys during setup, switch to live keys when ready.',
  },

  // --- Accounting ---
  quickbooks_oauth: {
    credentialType: 'quickbooks_oauth',
    serviceName: 'QuickBooks',
    description: 'Authorize access to sync invoices and financial data',
    iconName: 'Receipt',
    authMethod: 'oauth',
    oauthProvider: 'intuit',
    fields: [
      {
        key: 'client_id',
        label: 'Client ID',
        type: 'text',
        helpText: 'From Intuit Developer portal',
        required: true,
        sensitive: false,
      },
      {
        key: 'client_secret',
        label: 'Client Secret',
        type: 'password',
        required: true,
        sensitive: true,
      },
      {
        key: 'realm_id',
        label: 'Company ID (Realm ID)',
        type: 'text',
        helpText: 'Your QuickBooks company identifier',
        required: true,
        sensitive: false,
      },
      {
        key: 'refresh_token',
        label: 'Refresh Token',
        type: 'password',
        required: false,
        sensitive: true,
      },
    ],
  },

  // --- CRM ---
  crm: {
    credentialType: 'crm',
    serviceName: 'CRM',
    description: 'Authorize CRM access for customer data syncing',
    iconName: 'Users',
    authMethod: 'api_key',
    fields: [
      {
        key: 'api_key',
        label: 'API Key',
        type: 'password',
        helpText: 'Your CRM API key or access token',
        required: true,
        sensitive: true,
      },
      {
        key: 'api_url',
        label: 'API URL (optional)',
        type: 'url',
        placeholder: 'https://api.yourcrm.com',
        helpText: 'If your CRM requires a custom endpoint',
        required: false,
        sensitive: false,
      },
    ],
    additionalInstructions: 'We support HubSpot, Salesforce, Pipedrive, and custom CRMs.',
  },

  hubspot: {
    credentialType: 'hubspot',
    serviceName: 'HubSpot',
    description: 'Authorize HubSpot access for CRM automation',
    iconName: 'Users',
    authMethod: 'oauth',
    oauthProvider: 'hubspot',
    fields: [
      {
        key: 'access_token',
        label: 'Private App Access Token',
        type: 'password',
        placeholder: 'pat-...',
        helpText: 'From HubSpot → Settings → Private Apps',
        required: true,
        sensitive: true,
      },
    ],
  },

  // --- Custom/Fallback ---
  custom_api: {
    credentialType: 'custom_api',
    serviceName: 'Custom API',
    description: 'Connect to any REST API endpoint',
    iconName: 'Code',
    authMethod: 'api_key',
    fields: [
      {
        key: 'base_url',
        label: 'API Base URL',
        type: 'url',
        placeholder: 'https://api.example.com',
        required: true,
        sensitive: false,
      },
      {
        key: 'api_key',
        label: 'API Key',
        type: 'password',
        helpText: 'Your API authentication key',
        required: false,
        sensitive: true,
      },
      {
        key: 'additional_headers',
        label: 'Additional Headers (JSON)',
        type: 'textarea',
        placeholder: '{"X-Custom-Header": "value"}',
        helpText: 'Optional JSON object of extra headers',
        required: false,
        sensitive: false,
      },
    ],
  },
};

// Normalize system names to credential types
const SYSTEM_TO_CREDENTIAL_MAP: Record<string, string> = {
  // Email variants
  'email': 'email',
  'gmail': 'gmail_oauth',
  'google workspace': 'gmail_oauth',
  'google mail': 'gmail_oauth',
  
  // Communication
  'slack': 'slack_bot',
  
  // Productivity
  'notion': 'notion_api',
  'airtable': 'airtable_api',
  
  // Calendar
  'calendar': 'calendar',
  'google calendar': 'google_calendar',
  
  // Phone/SMS
  'twilio': 'twilio_sms',
  'sms': 'twilio_sms',
  'phone': 'twilio_sms',
  
  // Payments
  'stripe': 'stripe_api',
  'payments': 'stripe_api',
  
  // Accounting
  'quickbooks': 'quickbooks_oauth',
  'accounting': 'quickbooks_oauth',
  
  // CRM
  'crm': 'crm',
  'hubspot': 'hubspot',
  'salesforce': 'crm',
};

/**
 * Get credential schemas based on an automation's systems array
 * This maps real automation.systems values to credential schemas
 */
export function getSchemasForSystems(systems: string[]): CredentialSchema[] {
  if (!systems || systems.length === 0) return [];
  
  const schemas: CredentialSchema[] = [];
  const addedTypes = new Set<string>();

  for (const system of systems) {
    const normalizedSystem = system.toLowerCase().trim();
    
    // Direct lookup in map
    const credentialType = SYSTEM_TO_CREDENTIAL_MAP[normalizedSystem];
    if (credentialType && CREDENTIAL_SCHEMAS[credentialType] && !addedTypes.has(credentialType)) {
      schemas.push(CREDENTIAL_SCHEMAS[credentialType]);
      addedTypes.add(credentialType);
      continue;
    }
    
    // Partial match fallback
    for (const [keyword, schemaType] of Object.entries(SYSTEM_TO_CREDENTIAL_MAP)) {
      if (normalizedSystem.includes(keyword) && !addedTypes.has(schemaType)) {
        if (CREDENTIAL_SCHEMAS[schemaType]) {
          schemas.push(CREDENTIAL_SCHEMAS[schemaType]);
          addedTypes.add(schemaType);
        }
        break;
      }
    }
  }

  return schemas;
}

// Legacy function - kept for backwards compatibility
export function getSchemasForAutomation(systems: string[]): CredentialSchema[] {
  return getSchemasForSystems(systems);
}

// Automation-specific credential requirements (by slug)
export const AUTOMATION_CREDENTIAL_REQUIREMENTS: Record<string, string[]> = {
  'client-onboarding-pack': ['gmail_oauth', 'google_calendar', 'slack_bot'],
  'appointment-confirmations': ['google_calendar', 'twilio_sms'],
  'missed-call-autoresponse': ['twilio_sms'],
  'customer-support-triage': ['gmail_oauth', 'slack_bot'],
  'invoice-receipt-automation': ['quickbooks_oauth', 'gmail_oauth'],
  'weekly-kpi-digest': ['airtable_api', 'slack_bot'],
  'resume-intake-screening': ['gmail_oauth', 'airtable_api'],
  'internal-document-assistant': ['notion_api', 'slack_bot'],
};

/**
 * Get required schemas for a specific automation by slug
 * Falls back to systems-based lookup if no specific mapping exists
 */
export function getRequiredSchemasForAutomation(automationSlug: string, systems?: string[]): CredentialSchema[] {
  // First try specific automation requirements
  const requiredTypes = AUTOMATION_CREDENTIAL_REQUIREMENTS[automationSlug];
  if (requiredTypes && requiredTypes.length > 0) {
    return requiredTypes
      .filter(type => CREDENTIAL_SCHEMAS[type])
      .map(type => CREDENTIAL_SCHEMAS[type]);
  }
  
  // Fall back to systems-based lookup
  if (systems && systems.length > 0) {
    return getSchemasForSystems(systems);
  }
  
  return [];
}
