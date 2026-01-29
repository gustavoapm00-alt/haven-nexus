import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Shield, CheckCircle2, AlertCircle, Loader2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GlassCard } from '@/components/portal/GlassCard';
import PortalBackground from '@/components/portal/PortalBackground';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useIntegrationConnections } from '@/hooks/useIntegrationConnections';
import { useN8nProvisioning } from '@/hooks/useN8nProvisioning';
import { toast } from '@/hooks/use-toast';

interface RequiredIntegration {
  provider: string;
  displayName: string;
  description: string;
  authType: 'oauth' | 'api_key' | 'token';
  fields?: { key: string; label: string; placeholder: string; type?: string }[];
}

// Map system names to integration configs
const INTEGRATION_CONFIGS: Record<string, RequiredIntegration> = {
  gmail: {
    provider: 'gmail',
    displayName: 'Gmail',
    description: 'Send and read emails on your behalf',
    authType: 'oauth',
  },
  email: {
    provider: 'email',
    displayName: 'Email (SMTP)',
    description: 'Connect your email provider',
    authType: 'api_key',
    fields: [
      { key: 'smtp_host', label: 'SMTP Host', placeholder: 'smtp.example.com' },
      { key: 'smtp_port', label: 'SMTP Port', placeholder: '587' },
      { key: 'smtp_user', label: 'Username', placeholder: 'your@email.com' },
      { key: 'smtp_password', label: 'Password', placeholder: '••••••••', type: 'password' },
    ],
  },
  slack: {
    provider: 'slack',
    displayName: 'Slack',
    description: 'Send messages and notifications',
    authType: 'token',
    fields: [
      { key: 'bot_token', label: 'Bot Token', placeholder: 'xoxb-...', type: 'password' },
    ],
  },
  calendar: {
    provider: 'calendar',
    displayName: 'Google Calendar',
    description: 'Manage calendar events',
    authType: 'oauth',
  },
  sheets: {
    provider: 'sheets',
    displayName: 'Google Sheets',
    description: 'Read and write spreadsheet data',
    authType: 'oauth',
  },
  notion: {
    provider: 'notion',
    displayName: 'Notion',
    description: 'Access your Notion workspace',
    authType: 'token',
    fields: [
      { key: 'integration_token', label: 'Integration Token', placeholder: 'secret_...', type: 'password' },
    ],
  },
  airtable: {
    provider: 'airtable',
    displayName: 'Airtable',
    description: 'Connect to your Airtable bases',
    authType: 'token',
    fields: [
      { key: 'api_key', label: 'API Key', placeholder: 'pat...', type: 'password' },
      { key: 'base_id', label: 'Base ID', placeholder: 'app...' },
    ],
  },
  hubspot: {
    provider: 'hubspot',
    displayName: 'HubSpot',
    description: 'Sync contacts and deals',
    authType: 'oauth',
  },
  stripe: {
    provider: 'stripe',
    displayName: 'Stripe',
    description: 'Process payments and manage subscriptions',
    authType: 'api_key',
    fields: [
      { key: 'secret_key', label: 'Secret Key', placeholder: 'sk_...', type: 'password' },
    ],
  },
  twilio: {
    provider: 'twilio',
    displayName: 'Twilio',
    description: 'Send SMS and make calls',
    authType: 'api_key',
    fields: [
      { key: 'account_sid', label: 'Account SID', placeholder: 'AC...' },
      { key: 'auth_token', label: 'Auth Token', placeholder: '••••••••', type: 'password' },
    ],
  },
  quickbooks: {
    provider: 'quickbooks',
    displayName: 'QuickBooks',
    description: 'Sync invoices and accounting',
    authType: 'oauth',
  },
  crm: {
    provider: 'crm',
    displayName: 'CRM',
    description: 'Connect your CRM system',
    authType: 'api_key',
    fields: [
      { key: 'api_url', label: 'API URL', placeholder: 'https://api.yourcrm.com' },
      { key: 'api_key', label: 'API Key', placeholder: '••••••••', type: 'password' },
    ],
  },
};

export default function ConnectorScreen() {
  const { requestId } = useParams<{ requestId: string }>();
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  
  const [activation, setActivation] = useState<any>(null);
  const [automation, setAutomation] = useState<any>(null);
  const [requiredIntegrations, setRequiredIntegrations] = useState<RequiredIntegration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeProvider, setActiveProvider] = useState<string | null>(null);
  const [credentials, setCredentials] = useState<Record<string, string>>({});

  const {
    connections,
    isConnecting,
    connectIntegration,
    getConnectionStatus,
    allRequiredConnected,
    fetchConnections,
  } = useIntegrationConnections(requestId);

  const { provision, isProvisioning } = useN8nProvisioning();

  // Load activation request and automation details
  useEffect(() => {
    async function loadData() {
      if (!requestId || !user) return;

      setIsLoading(true);
      try {
        // Fetch activation request
        const { data: activationData, error: activationError } = await supabase
          .from('installation_requests')
          .select('*')
          .eq('id', requestId)
          .maybeSingle();

        if (activationError || !activationData) {
          toast({
            title: 'Error',
            description: 'Activation request not found',
            variant: 'destructive',
          });
          navigate('/portal/dashboard');
          return;
        }

        setActivation(activationData);

        // Fetch automation details
        if (activationData.automation_id) {
          const { data: automationData } = await supabase
            .from('automation_agents')
            .select('*')
            .eq('id', activationData.automation_id)
            .maybeSingle();

          if (automationData) {
            setAutomation(automationData);
            
            // Build required integrations from systems array
            const systems = automationData.systems || [];
            const integrations = systems
              .map((system: string) => {
                const config = INTEGRATION_CONFIGS[system.toLowerCase()];
                return config || {
                  provider: system.toLowerCase(),
                  displayName: system,
                  description: `Connect your ${system} account`,
                  authType: 'api_key' as const,
                  fields: [
                    { key: 'api_key', label: 'API Key', placeholder: '••••••••', type: 'password' },
                  ],
                };
              });
            
            setRequiredIntegrations(integrations);
          }
        }
      } catch (err) {
        console.error('Error loading activation data:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [requestId, user, navigate]);

  const handleConnect = async (provider: string) => {
    const config = requiredIntegrations.find(i => i.provider === provider);
    if (!config) return;

    if (config.authType === 'oauth') {
      // For OAuth, we'd redirect to the OAuth flow
      // For now, show a placeholder
      toast({
        title: 'OAuth Coming Soon',
        description: 'OAuth connections will be available shortly. Please use API key authentication if available.',
      });
      return;
    }

    // Show credential form
    setActiveProvider(provider);
    setCredentials({});
  };

  const handleSubmitCredentials = async () => {
    if (!activeProvider || !requestId) return;

    const config = requiredIntegrations.find(i => i.provider === activeProvider);
    if (!config?.fields) return;

    // Validate all fields are filled
    const missingFields = config.fields.filter(f => !credentials[f.key]?.trim());
    if (missingFields.length > 0) {
      toast({
        title: 'Missing fields',
        description: `Please fill in: ${missingFields.map(f => f.label).join(', ')}`,
        variant: 'destructive',
      });
      return;
    }

    const result = await connectIntegration(activeProvider, credentials);

    if (result.error) {
      toast({
        title: 'Connection failed',
        description: result.error,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Connected successfully',
        description: `${config.displayName} has been connected securely.`,
      });
      setActiveProvider(null);
      setCredentials({});
    }
  };

  const handleProvisionAutomation = async () => {
    if (!requestId) return;

    const result = await provision(requestId);

    if (result.error) {
      toast({
        title: 'Provisioning failed',
        description: result.error,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Automation activated!',
        description: 'Your automation is now live and running.',
      });
      navigate('/portal/dashboard');
    }
  };

  if (authLoading || isLoading) {
    return (
      <PortalBackground>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </PortalBackground>
    );
  }

  if (!user) {
    navigate('/portal/auth');
    return null;
  }

  const allConnected = allRequiredConnected(requiredIntegrations.map(i => i.provider));

  return (
    <PortalBackground>
      <div className="min-h-screen py-12 px-4">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-foreground">
              Connect Your Tools
            </h1>
            <p className="text-muted-foreground">
              {automation?.name || 'Your automation'} requires access to the following tools.
            </p>
          </div>

          {/* Security Notice */}
          <GlassCard className="p-4 border-primary/20">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div className="text-sm text-muted-foreground">
                <p className="font-medium text-foreground mb-1">Secure Connection</p>
                <p>
                  Sent securely via HTTPS and encrypted at rest with AES-256-GCM.
                  Never logged, emailed, or shown again after submission.
                  Revocable at any time.
                </p>
              </div>
            </div>
          </GlassCard>

          {/* Integration Cards */}
          <div className="space-y-4">
            {requiredIntegrations.map((integration) => {
              const status = getConnectionStatus(integration.provider);
              const isConnected = status === 'connected';
              const isActive = activeProvider === integration.provider;

              return (
                <GlassCard key={integration.provider} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground">
                          {integration.displayName}
                        </h3>
                      {isConnected && (
                          <CheckCircle2 className="h-4 w-4 text-primary" />
                        )}
                        {status === 'error' && (
                          <AlertCircle className="h-4 w-4 text-destructive" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {integration.description}
                      </p>
                    </div>

                    {!isActive && (
                      <Button
                        variant={isConnected ? 'outline' : 'default'}
                        size="sm"
                        onClick={() => handleConnect(integration.provider)}
                        disabled={isConnecting}
                      >
                        {isConnected ? 'Reconnect' : 'Connect Securely'}
                      </Button>
                    )}
                  </div>

                  {/* Credential Form */}
                  {isActive && integration.fields && (
                    <div className="mt-6 space-y-4 border-t border-border pt-4">
                      {integration.fields.map((field) => (
                        <div key={field.key} className="space-y-2">
                          <Label htmlFor={field.key}>{field.label}</Label>
                          <Input
                            id={field.key}
                            type={field.type || 'text'}
                            placeholder={field.placeholder}
                            value={credentials[field.key] || ''}
                            onChange={(e) =>
                              setCredentials((prev) => ({
                                ...prev,
                                [field.key]: e.target.value,
                              }))
                            }
                          />
                        </div>
                      ))}

                      <div className="flex gap-2 pt-2">
                        <Button
                          onClick={handleSubmitCredentials}
                          disabled={isConnecting}
                        >
                          {isConnecting ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Connecting…
                            </>
                          ) : (
                            'Connect Securely'
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => {
                            setActiveProvider(null);
                            setCredentials({});
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </GlassCard>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-4">
            {allConnected && requiredIntegrations.length > 0 && (
              <Button
                size="lg"
                className="w-full"
                onClick={handleProvisionAutomation}
                disabled={isProvisioning}
              >
                {isProvisioning ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Activating Automation…
                  </>
                ) : (
                  'Activate Automation'
                )}
              </Button>
            )}

            <Button
              variant="ghost"
              onClick={() => navigate('/portal/dashboard')}
            >
              Return to Dashboard
            </Button>
          </div>
        </div>
      </div>
    </PortalBackground>
  );
}
