import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Shield, CheckCircle2, AlertCircle, Loader2, ExternalLink, RefreshCw, Mail, Calendar, Users } from 'lucide-react';
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

interface ConfigurationField {
  name: string;
  label: string;
  type: string;
  placeholder?: string;
  required?: boolean;
}

interface RequiredIntegration {
  provider: string;
  displayName: string;
  description: string;
  authType: 'oauth' | 'api_key' | 'token';
  icon?: React.ElementType;
  scopes?: string[];
  fields?: { key: string; label: string; placeholder: string; type?: string }[];
}

// Integration configurations with OAuth scopes
const INTEGRATION_CONFIGS: Record<string, RequiredIntegration> = {
  gmail: {
    provider: 'gmail',
    displayName: 'Gmail',
    description: 'Send and read emails on your behalf',
    authType: 'oauth',
    icon: Mail,
    scopes: [
      'https://www.googleapis.com/auth/gmail.send',
      'https://www.googleapis.com/auth/gmail.readonly',
    ],
  },
  google_calendar: {
    provider: 'google_calendar',
    displayName: 'Google Calendar',
    description: 'Manage calendar events and scheduling',
    authType: 'oauth',
    icon: Calendar,
    scopes: [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events',
    ],
  },
  hubspot: {
    provider: 'hubspot',
    displayName: 'HubSpot',
    description: 'Sync contacts, deals, and CRM data',
    authType: 'oauth',
    icon: Users,
    scopes: ['contacts', 'deals', 'timeline'],
  },
  openai: {
    provider: 'openai',
    displayName: 'OpenAI',
    description: 'AI capabilities for intelligent automation',
    authType: 'api_key',
    fields: [
      { key: 'api_key', label: 'API Key', placeholder: 'sk-...', type: 'password' },
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
  stripe: {
    provider: 'stripe',
    displayName: 'Stripe',
    description: 'Process payments and manage subscriptions',
    authType: 'api_key',
    fields: [
      { key: 'secret_key', label: 'Secret Key', placeholder: 'sk_live_...', type: 'password' },
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
      { key: 'api_key', label: 'Personal Access Token', placeholder: 'pat...', type: 'password' },
    ],
  },
};

// Normalize integration key to match config
function normalizeProvider(provider: string): string {
  const map: Record<string, string> = {
    'gmail_oauth': 'gmail',
    'google_calendar_oauth': 'google_calendar',
    'hubspot_oauth': 'hubspot',
    'openai_api_key': 'openai',
    'calendar': 'google_calendar',
    'email': 'gmail',
  };
  return map[provider.toLowerCase()] || provider.toLowerCase();
}

export default function PortalConnectorScreen() {
  const { automationSlug } = useParams<{ automationSlug: string }>();
  const [searchParams] = useSearchParams();
  const requestId = searchParams.get('request_id');
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  
  const [activation, setActivation] = useState<any>(null);
  const [automation, setAutomation] = useState<any>(null);
  const [requiredIntegrations, setRequiredIntegrations] = useState<RequiredIntegration[]>([]);
  const [configFields, setConfigFields] = useState<ConfigurationField[]>([]);
  const [configValues, setConfigValues] = useState<Record<string, string>>({});
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
  } = useIntegrationConnections(activation?.id);

  const { activate, isProvisioning } = useN8nProvisioning();

  // Load automation by slug and find/create activation request
  useEffect(() => {
    async function loadData() {
      // Wait for auth to fully initialize before loading data
      if (authLoading || !user) return;

      setIsLoading(true);
      try {
        // First try to load automation by slug
        let automationData = null;
        
        if (automationSlug) {
          const { data } = await supabase
            .from('automation_agents')
            .select('*')
            .eq('slug', automationSlug)
            .maybeSingle();
          automationData = data;
        }

        if (!automationData && requestId) {
          // Fallback: load from request ID
          const { data: activationData } = await supabase
            .from('installation_requests')
            .select('*, automation_id')
            .eq('id', requestId)
            .maybeSingle();
          
          if (activationData?.automation_id) {
            const { data } = await supabase
              .from('automation_agents')
              .select('*')
              .eq('id', activationData.automation_id)
              .maybeSingle();
            automationData = data;
            setActivation(activationData);
          }
        }

        if (!automationData) {
          toast({
            title: 'Not Found',
            description: 'Automation not found',
            variant: 'destructive',
          });
          navigate('/portal/dashboard');
          return;
        }

        setAutomation(automationData);

        // Find or get activation request for this automation
        if (!activation) {
          const { data: existingActivation } = await supabase
            .from('installation_requests')
            .select('*')
            .eq('email', user.email)
            .eq('automation_id', automationData.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          if (existingActivation) {
            setActivation(existingActivation);
          }
        }

        // Build required integrations
        buildRequiredIntegrations(automationData);

        // Set configuration fields
        if (automationData.configuration_fields && Array.isArray(automationData.configuration_fields)) {
          setConfigFields(automationData.configuration_fields as unknown as ConfigurationField[]);
        }

      } catch (err) {
        console.error('Error loading data:', err);
        toast({
          title: 'Error',
          description: 'Failed to load automation details',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    }

    if (!authLoading) {
      loadData();
    }
  }, [automationSlug, requestId, user, authLoading, navigate]);

  const buildRequiredIntegrations = (automationData: any) => {
    let integrations: RequiredIntegration[] = [];
    
    // Use required_integrations if defined, otherwise fall back to systems
    const requiredList = automationData.required_integrations || automationData.systems || [];
    
    for (const item of requiredList) {
      const provider = typeof item === 'string' ? item : item.provider;
      const normalizedProvider = normalizeProvider(provider);
      const config = INTEGRATION_CONFIGS[normalizedProvider];
      
      if (config) {
        integrations.push({
          ...config,
          // Override with any custom config from the automation
          ...(typeof item === 'object' ? {
            displayName: item.label || config.displayName,
            description: item.description || config.description,
          } : {}),
        });
      } else {
        // Unknown integration - create generic API key config
        integrations.push({
          provider: normalizedProvider,
          displayName: provider.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
          description: `Connect your ${provider} account`,
          authType: 'api_key',
          fields: [
            { key: 'api_key', label: 'API Key', placeholder: '••••••••', type: 'password' },
          ],
        });
      }
    }
    
    setRequiredIntegrations(integrations);
  };

  const handleOAuthConnect = async (provider: string, config: RequiredIntegration) => {
    if (!activation?.id) {
      toast({
        title: 'Setup Required',
        description: 'Please complete your purchase first.',
        variant: 'destructive',
      });
      return;
    }

    // Normalize provider for the oauth-start edge function
    // Google services (gmail, google_calendar) all use "google" as the OAuth provider
    let oauthProvider = provider;
    if (provider === 'gmail' || provider === 'google_calendar' || provider === 'google_drive' || provider === 'google_sheets') {
      oauthProvider = 'google';
    }

    // Call the oauth-start edge function to get the authorization URL
    try {
      const { data, error } = await supabase.functions.invoke('oauth-start', {
        body: null, // Query params are passed via URL, not body
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // The oauth-start function expects query params, so we need to make a direct fetch call
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      
      if (!token) {
        toast({
          title: 'Authentication Required',
          description: 'Please log in to connect integrations.',
          variant: 'destructive',
        });
        return;
      }

      const baseUrl = import.meta.env.VITE_SUPABASE_URL;
      const redirectPath = `/portal/connect/${automation?.slug || activation.id}?request_id=${activation.id}`;
      
      const oauthStartUrl = `${baseUrl}/functions/v1/oauth-start?` +
        `provider=${encodeURIComponent(oauthProvider)}&` +
        `redirect_path=${encodeURIComponent(redirectPath)}&` +
        `activation_request_id=${encodeURIComponent(activation.id)}`;
      
      const response = await fetch(oauthStartUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (!response.ok || result.error) {
        throw new Error(result.error || 'Failed to start OAuth flow');
      }

      // Redirect to the authorization URL
      if (result.authorization_url) {
        window.location.href = result.authorization_url;
      } else {
        throw new Error('No authorization URL returned');
      }
    } catch (err) {
      console.error('OAuth start failed:', err);
      toast({
        title: 'OAuth Error',
        description: err instanceof Error ? err.message : 'Failed to start OAuth flow',
        variant: 'destructive',
      });
    }
  };

  const handleConnect = async (provider: string) => {
    const config = requiredIntegrations.find(i => i.provider === provider);
    if (!config) return;

    if (config.authType === 'oauth') {
      await handleOAuthConnect(provider, config);
      return;
    }

    // Show credential form for API key / token auth
    setActiveProvider(provider);
    setCredentials({});
  };

  const handleSubmitCredentials = async () => {
    if (!activeProvider || !activation?.id) return;

    const config = requiredIntegrations.find(i => i.provider === activeProvider);
    if (!config?.fields) return;

    // Validate all required fields
    const missingFields = config.fields.filter(f => !credentials[f.key]?.trim());
    if (missingFields.length > 0) {
      toast({
        title: 'Missing fields',
        description: `Please fill in: ${missingFields.map(f => f.label).join(', ')}`,
        variant: 'destructive',
      });
      return;
    }

    const result = await connectIntegration(activeProvider, credentials, {
      connectedEmail: user?.email || undefined,
    });

    if (result.error) {
      toast({
        title: 'Connection failed',
        description: result.error,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Connected',
        description: `${config.displayName} connected securely.`,
      });
      setActiveProvider(null);
      setCredentials({});
    }
  };

  const handleActivateAutomation = async () => {
    if (!activation?.id) {
      toast({
        title: 'Error',
        description: 'No activation request found',
        variant: 'destructive',
      });
      return;
    }

    // Validate config fields
    const missingConfig = configFields
      .filter(f => f.required)
      .filter(f => !configValues[f.name]?.trim());
    
    if (missingConfig.length > 0) {
      toast({
        title: 'Missing configuration',
        description: `Please fill in: ${missingConfig.map(f => f.label).join(', ')}`,
        variant: 'destructive',
      });
      return;
    }

    const result = await activate(activation.id, configValues);

    if (result.error) {
      toast({
        title: 'Activation failed',
        description: result.error,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Activated!',
        description: 'Your automation is now live.',
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
    // Use redirect parameter so user returns here after login
    const redirectPath = automationSlug 
      ? `/portal/connect/${automationSlug}${requestId ? `?request_id=${requestId}` : ''}`
      : `/portal/connect?request_id=${requestId}`;
    navigate(`/portal/auth?redirect=${encodeURIComponent(redirectPath)}`);
    return null;
  }

  const allConnected = requiredIntegrations.length > 0 && 
    allRequiredConnected(requiredIntegrations.map(i => i.provider));

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
              {automation?.name || 'Your automation'} requires access to the following services.
            </p>
          </div>

          {/* Security Notice */}
          <GlassCard className="p-4 border-primary/20">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div className="text-sm text-muted-foreground">
                <p className="font-medium text-foreground mb-1">Enterprise-Grade Security</p>
                <p>
                  Credentials are encrypted with AES-256-GCM and stored securely. 
                  AERELION operates your automation on our infrastructure—you can 
                  revoke access at any time.
                </p>
              </div>
            </div>
          </GlassCard>

          {/* Configuration Fields (if any) */}
          {configFields.length > 0 && (
            <GlassCard className="p-6">
              <h3 className="font-semibold mb-4">Configuration</h3>
              <div className="space-y-4">
                {configFields.map((field) => (
                  <div key={field.name} className="space-y-2">
                    <Label htmlFor={field.name}>
                      {field.label}
                      {field.required && <span className="text-destructive ml-1">*</span>}
                    </Label>
                    <Input
                      id={field.name}
                      type={field.type || 'text'}
                      placeholder={field.placeholder}
                      value={configValues[field.name] || ''}
                      onChange={(e) =>
                        setConfigValues((prev) => ({
                          ...prev,
                          [field.name]: e.target.value,
                        }))
                      }
                    />
                  </div>
                ))}
              </div>
            </GlassCard>
          )}

          {/* Integration Cards */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Required Connections</h3>
            
            {requiredIntegrations.map((integration) => {
              const status = getConnectionStatus(integration.provider);
              const isConnected = status === 'connected';
              const isActive = activeProvider === integration.provider;
              const IconComponent = integration.icon;

              return (
                <GlassCard key={integration.provider} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      {IconComponent && (
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <IconComponent className="h-5 w-5 text-primary" />
                        </div>
                      )}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-foreground">
                            {integration.displayName}
                          </h3>
                          {isConnected && (
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          )}
                          {status === 'error' && (
                            <AlertCircle className="h-4 w-4 text-destructive" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {integration.description}
                        </p>
                        {integration.authType === 'oauth' && (
                          <p className="text-xs text-muted-foreground">
                            OAuth • Secure authorization
                          </p>
                        )}
                      </div>
                    </div>

                    {!isActive && (
                      <Button
                        variant={isConnected ? 'outline' : 'default'}
                        size="sm"
                        onClick={() => handleConnect(integration.provider)}
                        disabled={isConnecting}
                      >
                        {isConnected ? 'Reconnect' : 'Connect'}
                        {integration.authType === 'oauth' && (
                          <ExternalLink className="ml-1.5 h-3 w-3" />
                        )}
                      </Button>
                    )}
                  </div>

                  {/* Credential Form for API/Token auth */}
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
          <div className="flex flex-col gap-4 pt-4">
            {allConnected && requiredIntegrations.length > 0 && (
              <Button
                size="lg"
                className="w-full"
                onClick={handleActivateAutomation}
                disabled={isProvisioning}
              >
                {isProvisioning ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Activating…
                  </>
                ) : (
                  'Activate Automation'
                )}
              </Button>
            )}

            {!allConnected && requiredIntegrations.length > 0 && (
              <p className="text-center text-sm text-muted-foreground">
                Connect all required services to activate your automation
              </p>
            )}

            <div className="flex justify-center gap-4">
              <Button variant="ghost" asChild>
                <Link to="/portal/dashboard">Back to Dashboard</Link>
              </Button>
              <Button variant="ghost" onClick={() => fetchConnections()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Status
              </Button>
            </div>
          </div>
        </div>
      </div>
    </PortalBackground>
  );
}
