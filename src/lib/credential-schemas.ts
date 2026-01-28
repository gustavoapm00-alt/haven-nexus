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
}

// Common credential schemas for supported services
export const CREDENTIAL_SCHEMAS: Record<string, CredentialSchema> = {
  gmail_oauth: {
    credentialType: 'gmail_oauth',
    serviceName: 'Gmail / Google Workspace',
    description: 'Access to send and receive emails on your behalf',
    iconName: 'Mail',
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
        helpText: 'We\'ll help you generate this during setup',
        required: false,
        sensitive: true,
      },
    ],
    additionalInstructions: 'You may need to enable the Gmail API in your Google Cloud Console.',
  },

  slack_bot: {
    credentialType: 'slack_bot',
    serviceName: 'Slack',
    description: 'Send messages and interact with your Slack workspace',
    iconName: 'MessageSquare',
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

  notion_api: {
    credentialType: 'notion_api',
    serviceName: 'Notion',
    description: 'Read and write to your Notion workspace',
    iconName: 'BookOpen',
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
    description: 'Read and write to your Airtable bases',
    iconName: 'Table',
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

  google_calendar: {
    credentialType: 'google_calendar',
    serviceName: 'Google Calendar',
    description: 'Create and manage calendar events',
    iconName: 'Calendar',
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

  twilio_sms: {
    credentialType: 'twilio_sms',
    serviceName: 'Twilio (SMS)',
    description: 'Send and receive SMS messages',
    iconName: 'Phone',
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

  stripe_api: {
    credentialType: 'stripe_api',
    serviceName: 'Stripe',
    description: 'Process payments and manage subscriptions',
    iconName: 'CreditCard',
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

  quickbooks_oauth: {
    credentialType: 'quickbooks_oauth',
    serviceName: 'QuickBooks',
    description: 'Sync invoices and financial data',
    iconName: 'Receipt',
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

  custom_api: {
    credentialType: 'custom_api',
    serviceName: 'Custom API',
    description: 'Connect to any REST API',
    iconName: 'Code',
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

// Get schemas for a specific automation based on its systems array
export function getSchemasForAutomation(systems: string[]): CredentialSchema[] {
  const systemToSchemaMap: Record<string, string> = {
    'gmail': 'gmail_oauth',
    'google workspace': 'gmail_oauth',
    'slack': 'slack_bot',
    'notion': 'notion_api',
    'airtable': 'airtable_api',
    'google calendar': 'google_calendar',
    'calendar': 'google_calendar',
    'twilio': 'twilio_sms',
    'sms': 'twilio_sms',
    'stripe': 'stripe_api',
    'quickbooks': 'quickbooks_oauth',
  };

  const schemas: CredentialSchema[] = [];
  const addedTypes = new Set<string>();

  for (const system of systems) {
    const normalizedSystem = system.toLowerCase().trim();
    
    // Check direct match
    if (CREDENTIAL_SCHEMAS[normalizedSystem] && !addedTypes.has(normalizedSystem)) {
      schemas.push(CREDENTIAL_SCHEMAS[normalizedSystem]);
      addedTypes.add(normalizedSystem);
      continue;
    }

    // Check mapped match
    for (const [keyword, schemaType] of Object.entries(systemToSchemaMap)) {
      if (normalizedSystem.includes(keyword) && !addedTypes.has(schemaType)) {
        schemas.push(CREDENTIAL_SCHEMAS[schemaType]);
        addedTypes.add(schemaType);
        break;
      }
    }
  }

  // Always include custom API option
  if (!addedTypes.has('custom_api')) {
    schemas.push(CREDENTIAL_SCHEMAS['custom_api']);
  }

  return schemas;
}

// Automation-specific credential requirements
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

export function getRequiredSchemasForAutomation(automationSlug: string): CredentialSchema[] {
  const requiredTypes = AUTOMATION_CREDENTIAL_REQUIREMENTS[automationSlug] || [];
  return requiredTypes
    .filter(type => CREDENTIAL_SCHEMAS[type])
    .map(type => CREDENTIAL_SCHEMAS[type]);
}
