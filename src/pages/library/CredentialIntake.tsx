import { useState, useEffect, ComponentType } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Shield, 
  ChevronRight, 
  CheckCircle, 
  Lock, 
  ArrowLeft,
  Loader2,
  AlertCircle,
  Plus,
  Key,
  Mail,
  MessageSquare,
  BookOpen,
  Table,
  Calendar,
  Phone,
  CreditCard,
  Receipt,
  Code,
  LucideIcon,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useActivationCredentials, StoredCredential } from '@/hooks/useActivationCredentials';
import LibraryNavbar from '@/components/library/LibraryNavbar';
import LibraryFooter from '@/components/library/LibraryFooter';
import { SecureCredentialForm } from '@/components/library/SecureCredentialForm';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CREDENTIAL_SCHEMAS, 
  CredentialSchema,
  getRequiredSchemasForAutomation,
} from '@/lib/credential-schemas';

// Icon mapping for credential schemas
const ICON_MAP: Record<string, LucideIcon> = {
  Mail,
  MessageSquare,
  BookOpen,
  Table,
  Calendar,
  Phone,
  CreditCard,
  Receipt,
  Code,
  Key,
};

interface ActivationRequest {
  id: string;
  name: string;
  email: string;
  purchased_item: string | null;
  customer_visible_status: string;
  automation_id: string | null;
  credentials_count: number;
  credentials_submitted_at: string | null;
}

interface AutomationInfo {
  id: string;
  slug: string;
  name: string;
  systems: string[];
}

const DynamicIcon = ({ name, className }: { name: string; className?: string }) => {
  const IconComponent = ICON_MAP[name] || Key;
  return <IconComponent className={className} />;
};

export default function CredentialIntake() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  
  const [request, setRequest] = useState<ActivationRequest | null>(null);
  const [automation, setAutomation] = useState<AutomationInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('');
  
  const { 
    credentials, 
    fetchCredentials, 
    isLoading: credentialsLoading,
  } = useActivationCredentials(id);

  // Required schemas for this automation
  const [requiredSchemas, setRequiredSchemas] = useState<CredentialSchema[]>([]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth?redirect=' + encodeURIComponent(`/credentials/${id}`));
    }
  }, [user, authLoading, navigate, id]);

  useEffect(() => {
    if (id && user) {
      fetchRequest();
      fetchCredentials();
    }
  }, [id, user]);

  const fetchRequest = async () => {
    if (!id) return;
    
    setIsLoading(true);
    setError(null);

    try {
      // Fetch the installation request
      const { data: requestData, error: requestError } = await supabase
        .from('installation_requests')
        .select('id, name, email, purchased_item, customer_visible_status, automation_id, credentials_count, credentials_submitted_at')
        .eq('id', id)
        .single();

      if (requestError) throw new Error('Request not found');
      
      // Verify ownership
      if (requestData.email !== user?.email) {
        throw new Error('You do not have permission to access this request');
      }

      setRequest(requestData as ActivationRequest);

      // Fetch automation details if available
      if (requestData.automation_id) {
        const { data: automationData } = await supabase
          .from('automation_agents')
          .select('id, slug, name, systems')
          .eq('id', requestData.automation_id)
          .single();

        if (automationData) {
          setAutomation(automationData as AutomationInfo);
          const schemas = getRequiredSchemasForAutomation(automationData.slug);
          setRequiredSchemas(schemas.length > 0 ? schemas : Object.values(CREDENTIAL_SCHEMAS).slice(0, 4));
          if (schemas.length > 0) {
            setActiveTab(schemas[0].credentialType);
          }
        }
      } else {
        // Default to common schemas
        const defaultSchemas = Object.values(CREDENTIAL_SCHEMAS).slice(0, 4);
        setRequiredSchemas(defaultSchemas);
        if (defaultSchemas.length > 0) {
          setActiveTab(defaultSchemas[0].credentialType);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load request');
    } finally {
      setIsLoading(false);
    }
  };

  const getCredentialStatus = (credentialType: string): StoredCredential | undefined => {
    return credentials.find(c => c.credential_type === credentialType);
  };

  const completedCount = requiredSchemas.filter(schema => {
    const cred = getCredentialStatus(schema.credentialType);
    return cred && cred.status === 'active';
  }).length;

  const allComplete = completedCount === requiredSchemas.length && requiredSchemas.length > 0;

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="min-h-screen bg-background">
        <LibraryNavbar />
        <main className="pt-24 pb-16 px-4">
          <div className="max-w-2xl mx-auto">
            <Alert variant="destructive">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>{error || 'Request not found'}</AlertDescription>
            </Alert>
            <Link to="/dashboard" className="mt-4 inline-block">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </main>
        <LibraryFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <LibraryNavbar />
      
      <main className="pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link to={`/activation-request/${id}`} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Activation Request
            </Link>
            
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-3">
                  <Shield className="w-6 h-6 text-primary" />
                  Secure Credential Setup
                </h1>
                <p className="text-muted-foreground">
                  {request.purchased_item || automation?.name || 'Automation Setup'}
                </p>
              </div>
              
              <Badge 
                variant="outline" 
                className={allComplete ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border-amber-500/30'}
              >
                {completedCount} / {requiredSchemas.length} Connected
              </Badge>
            </div>
          </div>

          {/* Security Notice */}
          <div className="mb-8 p-4 bg-primary/5 border border-primary/30 rounded-lg">
            <div className="flex items-start gap-3">
              <Lock className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium text-foreground mb-1">Your credentials are protected</p>
                <p className="text-sm text-muted-foreground">
                  All credentials are encrypted with AES-256-GCM before transmission and stored securely. 
                  They are never logged, exposed in plaintext, or accessible to unauthorized parties. 
                  You can revoke access at any time.
                </p>
              </div>
            </div>
          </div>

          {/* Progress indicator */}
          {allComplete && (
            <Alert className="mb-8 bg-emerald-500/10 border-emerald-500/30">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <AlertDescription className="text-emerald-400">
                All credentials connected! Your activation is now in review.
              </AlertDescription>
            </Alert>
          )}

          {/* Credential Forms */}
          {requiredSchemas.length > 0 && (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="w-full justify-start flex-wrap h-auto gap-2 bg-transparent p-0">
                {requiredSchemas.map((schema) => {
                  const cred = getCredentialStatus(schema.credentialType);
                  const isConnected = cred && cred.status === 'active';
                  
                  return (
                    <TabsTrigger
                      key={schema.credentialType}
                      value={schema.credentialType}
                      className={`
                        flex items-center gap-2 px-4 py-2 rounded-lg border
                        data-[state=active]:bg-primary/20 data-[state=active]:border-primary/50
                        data-[state=inactive]:bg-card/50 data-[state=inactive]:border-border/50
                      `}
                    >
                      <DynamicIcon name={schema.iconName} className="w-4 h-4" />
                      {schema.serviceName}
                      {isConnected && <CheckCircle className="w-3 h-3 text-emerald-500 ml-1" />}
                    </TabsTrigger>
                  );
                })}
              </TabsList>

              {requiredSchemas.map((schema) => {
                const existingCred = getCredentialStatus(schema.credentialType);
                
                return (
                  <TabsContent
                    key={schema.credentialType}
                    value={schema.credentialType}
                    className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-6"
                  >
                    <div className="mb-6">
                      <div className="flex items-center gap-3 mb-2">
                        <DynamicIcon name={schema.iconName} className="w-5 h-5 text-primary" />
                        <h3 className="text-lg font-semibold text-foreground">{schema.serviceName}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">{schema.description}</p>
                    </div>
                    
                    <SecureCredentialForm
                      requestId={id!}
                      schema={schema}
                      existingCredential={existingCred ? { id: existingCred.id, status: existingCred.status } : undefined}
                      onSuccess={() => fetchCredentials()}
                    />
                  </TabsContent>
                );
              })}
            </Tabs>
          )}

          {/* Add Custom Credential */}
          <div className="mt-8 p-4 bg-card/30 border border-border/30 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Need to connect a different service?</p>
                <p className="text-sm text-muted-foreground">
                  Use our custom API connector or contact support
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveTab('custom_api')}
              >
                <Plus className="w-4 h-4 mr-2" />
                Custom API
              </Button>
            </div>
          </div>

          {/* Next Steps */}
          <div className="mt-8 flex justify-end">
            <Link to={`/activation-request/${id}`}>
              <Button>
                View Activation Status
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <LibraryFooter />
    </div>
  );
}
