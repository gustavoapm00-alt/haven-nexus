import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { 
  Loader2, ArrowLeft, Shield, CheckCircle, Clock, 
  AlertCircle, Key, MessageSquare, Pause, Construction, 
  FlaskConical, PlayCircle, ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  received: { label: 'Request Received', color: 'bg-blue-500/20 text-blue-400', icon: <Clock className="w-4 h-4" /> },
  in_review: { label: 'In Review', color: 'bg-blue-500/20 text-blue-400', icon: <Clock className="w-4 h-4" /> },
  awaiting_credentials: { label: 'Awaiting Access', color: 'bg-yellow-500/20 text-yellow-400', icon: <Key className="w-4 h-4" /> },
  in_build: { label: 'Activating', color: 'bg-purple-500/20 text-purple-400', icon: <Construction className="w-4 h-4" /> },
  testing: { label: 'Testing', color: 'bg-orange-500/20 text-orange-400', icon: <FlaskConical className="w-4 h-4" /> },
  live: { label: 'Active', color: 'bg-green-500/20 text-green-400', icon: <PlayCircle className="w-4 h-4" /> },
  paused: { label: 'Paused', color: 'bg-gray-500/20 text-gray-400', icon: <Pause className="w-4 h-4" /> },
  needs_attention: { label: 'Action Needed', color: 'bg-red-500/20 text-red-400', icon: <AlertCircle className="w-4 h-4" /> },
  completed: { label: 'Completed', color: 'bg-emerald-500/20 text-emerald-400', icon: <CheckCircle className="w-4 h-4" /> },
};

const TIMELINE_STEPS = [
  { status: 'received', label: 'Received' },
  { status: 'in_review', label: 'In Review' },
  { status: 'awaiting_credentials', label: 'Awaiting Access' },
  { status: 'in_build', label: 'Activating' },
  { status: 'testing', label: 'Testing' },
  { status: 'live', label: 'Active' },
];

interface ActivationRequest {
  id: string;
  name: string;
  email: string;
  purchased_item: string | null;
  preferred_systems: string | null;
  customer_visible_status: string;
  status_updated_at: string;
  activation_eta: string | null;
  activation_notes_customer: string | null;
  credentials_submitted_at: string | null;
}

export default function ActivationRequestDetail() {
  const { id } = useParams<{ id: string }>();
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  const [request, setRequest] = useState<ActivationRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/portal/auth?redirect=' + encodeURIComponent(`/activation-request/${id}`));
    }
  }, [user, authLoading, navigate, id]);

  useEffect(() => {
    if (user?.email && id) {
      fetchRequest();
    }
  }, [user?.email, id]);

  const fetchRequest = async () => {
    if (!id || !user?.email) return;
    
    setLoading(true);
    setError(null);
    
    // Query with BOTH id AND email for server-side enforcement
    const { data, error: fetchError } = await supabase
      .from('installation_requests')
      .select('id, name, email, purchased_item, preferred_systems, customer_visible_status, status_updated_at, activation_eta, activation_notes_customer, credentials_submitted_at')
      .eq('id', id)
      .eq('email', user.email)
      .maybeSingle();

    if (fetchError) {
      console.error('Fetch error:', fetchError);
      setError('Failed to load activation request.');
      setLoading(false);
      return;
    }

    if (!data) {
      setError('Activation request not found or you do not have permission to view it.');
      setLoading(false);
      return;
    }

    setRequest(data as ActivationRequest);
    setLoading(false);
  };

  const getCurrentStepIndex = () => {
    if (!request) return 0;
    const index = TIMELINE_STEPS.findIndex(s => s.status === request.customer_visible_status);
    return index >= 0 ? index : 0;
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-3xl mx-auto px-6 py-16">
          <Link to="/portal/dashboard" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <div className="text-center py-16">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h1 className="text-2xl font-display mb-2">Access Denied</h1>
            <p className="text-muted-foreground">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!request) return null;

  const statusConfig = STATUS_CONFIG[request.customer_visible_status] || STATUS_CONFIG.received;
  const currentStepIndex = getCurrentStepIndex();
  const needsCredentials = ['awaiting_credentials', 'needs_attention'].includes(request.customer_visible_status);
  const hasSubmittedCredentials = !!request.credentials_submitted_at;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <Link to="/portal/dashboard" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-3xl font-display mb-2">Activation Status</h1>
              <p className="text-muted-foreground">
                {request.purchased_item || 'Hosted Automation'}
              </p>
            </div>
            <Badge className={`flex items-center gap-1.5 ${statusConfig.color}`}>
              {statusConfig.icon}
              {statusConfig.label}
            </Badge>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">Activation Progress</h2>
          <div className="flex items-center justify-between relative">
            {/* Progress line */}
            <div className="absolute top-4 left-0 right-0 h-0.5 bg-border" />
            <div 
              className="absolute top-4 left-0 h-0.5 bg-primary transition-all duration-500"
              style={{ width: `${(currentStepIndex / (TIMELINE_STEPS.length - 1)) * 100}%` }}
            />
            
            {TIMELINE_STEPS.map((step, index) => {
              const isComplete = index < currentStepIndex;
              const isCurrent = index === currentStepIndex;
              
              return (
                <div key={step.status} className="flex flex-col items-center relative z-10">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                    isComplete 
                      ? 'bg-primary border-primary text-primary-foreground' 
                      : isCurrent 
                        ? 'bg-background border-primary text-primary' 
                        : 'bg-background border-border text-muted-foreground'
                  }`}>
                    {isComplete ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <span className="text-xs font-medium">{index + 1}</span>
                    )}
                  </div>
                  <span className={`text-xs mt-2 ${isCurrent ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-6">
            <h3 className="font-semibold mb-3">Request Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Business</span>
                <span>{request.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Automation</span>
                <span>{request.purchased_item || 'Automation'}</span>
              </div>
              {request.activation_eta && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ETA</span>
                  <span>{request.activation_eta}</span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-6">
            <h3 className="font-semibold mb-3">Required Connections</h3>
            {request.preferred_systems ? (
              <div className="flex flex-wrap gap-2">
                {request.preferred_systems.split(',').map((tool, i) => (
                  <Badge 
                    key={i} 
                    variant="secondary"
                    className={hasSubmittedCredentials ? 'bg-emerald-500/10 text-emerald-400' : ''}
                  >
                    {hasSubmittedCredentials && <CheckCircle className="w-3 h-3 mr-1" />}
                    {tool.trim()}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No specific tools selected</p>
            )}
            {hasSubmittedCredentials && (
              <p className="text-xs text-emerald-400 mt-2">Access authorized</p>
            )}
          </div>
        </div>

        {/* Connect Securely CTA - Only shown when credentials needed */}
        {needsCredentials && !hasSubmittedCredentials && (
          <div className="bg-primary/10 border border-primary/30 rounded-xl p-6 mb-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1">Authorize Access</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  To activate your automation, we need secure access to your connected services. 
                  Your credentials are encrypted with AES-256-GCM and can be revoked anytime.
                </p>
                <Link to={`/credentials/${request.id}`}>
                  <Button className="gap-2">
                    <Key className="w-4 h-4" />
                    Connect Securely
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Access Authorized - Status when credentials submitted */}
        {hasSubmittedCredentials && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-6 mb-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-6 h-6 text-emerald-500" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1 text-emerald-400">Access Authorized</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Your credentials have been securely stored. AERELION is now activating your automation.
                </p>
                <div className="flex gap-3">
                  <Link to={`/credentials/${request.id}`}>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Shield className="w-3.5 h-3.5" />
                      Manage Access
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Customer Notes from AERELION */}
        {request.activation_notes_customer && (
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 mb-8">
            <div className="flex items-start gap-3">
              <MessageSquare className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <h3 className="font-semibold mb-2">Message from AERELION</h3>
                <p className="text-sm text-muted-foreground">{request.activation_notes_customer}</p>
              </div>
            </div>
          </div>
        )}

        {/* System Status Footer */}
        <div className="bg-card/30 border border-border/30 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5 text-emerald-500" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-sm mb-1">Hosted & Maintained by AERELION</h3>
              <p className="text-sm text-muted-foreground">
                Your automation is hosted on AERELION's secure infrastructure. 
                We handle all configuration, monitoring, and maintenance. 
                You can revoke access at any time.
              </p>
              
              <div className="flex flex-wrap gap-4 mt-4">
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                >
                  Contact Support
                </Link>
                <Link
                  to="/security"
                  className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                >
                  Security Practices
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
