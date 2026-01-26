import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { 
  Loader2, ArrowLeft, Shield, Mail, CheckCircle, Clock, 
  AlertCircle, Key, UserPlus, Link as LinkIcon, MessageSquare 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const TOOLS_OPTIONS = [
  'Gmail / Google Workspace',
  'Slack',
  'HubSpot',
  'Shopify',
  'WooCommerce',
  'Twilio',
  'Discord',
  'Telegram',
  'Notion',
  'ClickUp',
  'Airtable',
  'Zapier',
  'Make',
  'Other',
];

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  received: { label: 'Request Received', color: 'bg-blue-500/20 text-blue-400', icon: <Clock className="w-4 h-4" /> },
  in_review: { label: 'In Review', color: 'bg-blue-500/20 text-blue-400', icon: <Clock className="w-4 h-4" /> },
  awaiting_credentials: { label: 'Awaiting Access Info', color: 'bg-yellow-500/20 text-yellow-400', icon: <Key className="w-4 h-4" /> },
  in_build: { label: 'Building', color: 'bg-purple-500/20 text-purple-400', icon: <Loader2 className="w-4 h-4 animate-spin" /> },
  testing: { label: 'Testing', color: 'bg-orange-500/20 text-orange-400', icon: <Clock className="w-4 h-4" /> },
  live: { label: 'Live', color: 'bg-green-500/20 text-green-400', icon: <CheckCircle className="w-4 h-4" /> },
  paused: { label: 'Paused', color: 'bg-gray-500/20 text-gray-400', icon: <Clock className="w-4 h-4" /> },
  needs_attention: { label: 'Action Needed', color: 'bg-red-500/20 text-red-400', icon: <AlertCircle className="w-4 h-4" /> },
  completed: { label: 'Completed', color: 'bg-emerald-500/20 text-emerald-400', icon: <CheckCircle className="w-4 h-4" /> },
};

const TIMELINE_STEPS = [
  { status: 'received', label: 'Received' },
  { status: 'in_review', label: 'In Review' },
  { status: 'awaiting_credentials', label: 'Awaiting Access' },
  { status: 'in_build', label: 'Building' },
  { status: 'testing', label: 'Testing' },
  { status: 'live', label: 'Live' },
];

// Pattern to detect potential API keys/secrets
const SECRET_PATTERNS = [
  /^sk[-_]/i,
  /^pk[-_]/i,
  /^api[-_]?key/i,
  /^bearer\s+/i,
  /^[a-zA-Z0-9]{32,}$/,
  /^xox[baprs]-/i,
  /^ghp_/i,
  /^gho_/i,
  /^github_pat_/i,
];

function looksLikeSecret(value: string): boolean {
  const trimmed = value.trim();
  if (trimmed.length < 20) return false;
  return SECRET_PATTERNS.some(pattern => pattern.test(trimmed));
}

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
}

export default function ActivationRequestDetail() {
  const { id } = useParams<{ id: string }>();
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  const [request, setRequest] = useState<ActivationRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [selectedTool, setSelectedTool] = useState('');
  const [credentialMethod, setCredentialMethod] = useState<string>('');
  const [message, setMessage] = useState('');
  const [secureLink, setSecureLink] = useState('');
  const [credentialReference, setCredentialReference] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

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
    
    const { data, error: fetchError } = await supabase
      .from('installation_requests')
      .select('id, name, email, purchased_item, preferred_systems, customer_visible_status, status_updated_at, activation_eta, activation_notes_customer')
      .eq('id', id)
      .maybeSingle();

    if (fetchError) {
      setError('Failed to load activation request.');
      setLoading(false);
      return;
    }

    if (!data) {
      setError('Activation request not found.');
      setLoading(false);
      return;
    }

    // Verify email matches
    if (data.email.toLowerCase() !== user.email.toLowerCase()) {
      setError('You do not have permission to view this request.');
      setLoading(false);
      return;
    }

    setRequest(data as ActivationRequest);
    
    // Pre-populate tool from preferred_systems if available
    if (data.preferred_systems) {
      const tools = data.preferred_systems.split(',').map((t: string) => t.trim());
      if (tools.length > 0) {
        const matchedTool = TOOLS_OPTIONS.find(opt => 
          tools.some((t: string) => opt.toLowerCase().includes(t.toLowerCase()))
        );
        if (matchedTool) setSelectedTool(matchedTool);
      }
    }
    
    setLoading(false);
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!selectedTool) {
      errors.tool = 'Please select a tool to connect';
    }
    
    if (!credentialMethod) {
      errors.method = 'Please select a connection method';
    }

    // Check for secrets in text fields
    const fieldsToCheck = [message, secureLink, credentialReference];
    for (const field of fieldsToCheck) {
      if (field && looksLikeSecret(field)) {
        errors.secret = 'For security, do not paste API keys or secrets directly. Use the reference method to indicate where the key is stored (e.g., "1Password vault: AERELION/ClientName/Tool").';
        break;
      }
    }

    if (credentialMethod === 'api_key' && !credentialReference) {
      errors.reference = 'Please specify where the API key is stored';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm() || !request || !user?.email) return;

    setSubmitting(true);

    try {
      // Insert the customer update
      const { error: insertError } = await supabase
        .from('activation_customer_updates')
        .insert({
          request_id: request.id,
          customer_email: user.email,
          update_type: 'credentials',
          tool_name: selectedTool,
          credential_method: credentialMethod,
          message: message || null,
          secure_link: secureLink || null,
          credential_reference: credentialReference || null,
          status: 'submitted',
        });

      if (insertError) throw insertError;

      // Update the parent request status
      const { error: updateError } = await supabase
        .from('installation_requests')
        .update({
          customer_visible_status: 'in_review',
          status: 'in_review',
          status_updated_at: new Date().toISOString(),
        })
        .eq('id', request.id);

      if (updateError) throw updateError;

      // Trigger notification
      try {
        await supabase.functions.invoke('notify-activation-customer-update', {
          body: {
            request_id: request.id,
            customer_email: user.email,
            business_name: request.name,
            purchased_item: request.purchased_item,
            tool_name: selectedTool,
            credential_method: credentialMethod,
            message: message,
          },
        });
      } catch (notifyError) {
        console.error('Notification error:', notifyError);
        // Don't fail the submission if notification fails
      }

      toast({
        title: 'Access information submitted',
        description: 'We received your connection details and will proceed with activation.',
      });

      // Reset form
      setSelectedTool('');
      setCredentialMethod('');
      setMessage('');
      setSecureLink('');
      setCredentialReference('');
      
      // Refresh request
      fetchRequest();
    } catch (err) {
      console.error('Submission error:', err);
      toast({
        title: 'Submission failed',
        description: 'Please try again or contact support.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
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
              <h1 className="text-3xl font-display mb-2">Activation Request</h1>
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
                <span className="text-muted-foreground">Item</span>
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
            <h3 className="font-semibold mb-3">Tools to Connect</h3>
            {request.preferred_systems ? (
              <div className="flex flex-wrap gap-2">
                {request.preferred_systems.split(',').map((tool, i) => (
                  <Badge key={i} variant="secondary">{tool.trim()}</Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No specific tools selected</p>
            )}
          </div>
        </div>

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

        {/* Credential Submission Form */}
        <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Key className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Connect Your Tools</h2>
              <p className="text-sm text-muted-foreground">
                Provide access information securely. We never store plaintext credentials.
              </p>
            </div>
          </div>

          {formErrors.secret && (
            <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-destructive mt-0.5" />
                <p className="text-sm text-destructive">{formErrors.secret}</p>
              </div>
            </div>
          )}

          <div className="space-y-6">
            {/* Tool Selection */}
            <div>
              <Label className="mb-2 block">
                Which tool are you connecting? <span className="text-destructive">*</span>
              </Label>
              <Select value={selectedTool} onValueChange={setSelectedTool}>
                <SelectTrigger className={formErrors.tool ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Select a tool..." />
                </SelectTrigger>
                <SelectContent>
                  {TOOLS_OPTIONS.map(tool => (
                    <SelectItem key={tool} value={tool}>{tool}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formErrors.tool && (
                <p className="text-sm text-destructive mt-1">{formErrors.tool}</p>
              )}
            </div>

            {/* Connection Method */}
            <div>
              <Label className="mb-3 block">
                How would you like to connect? <span className="text-destructive">*</span>
              </Label>
              <RadioGroup value={credentialMethod} onValueChange={setCredentialMethod}>
                <div className="grid gap-3">
                  <label className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                    credentialMethod === 'oauth' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                  }`}>
                    <RadioGroupItem value="oauth" id="oauth" className="mt-0.5" />
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        <LinkIcon className="w-4 h-4" />
                        OAuth / Secure Link
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Provide a secure authorization link or OAuth flow URL
                      </p>
                    </div>
                  </label>
                  
                  <label className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                    credentialMethod === 'invite_user' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                  }`}>
                    <RadioGroupItem value="invite_user" id="invite_user" className="mt-0.5" />
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        <UserPlus className="w-4 h-4" />
                        Invite AERELION User
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Add our service account to your workspace
                      </p>
                    </div>
                  </label>
                  
                  <label className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                    credentialMethod === 'api_key' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                  }`}>
                    <RadioGroupItem value="api_key" id="api_key" className="mt-0.5" />
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        <Key className="w-4 h-4" />
                        API Key Reference
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Tell us where you've stored the key (e.g., 1Password vault)
                      </p>
                    </div>
                  </label>
                  
                  <label className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                    credentialMethod === 'other' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                  }`}>
                    <RadioGroupItem value="other" id="other" className="mt-0.5" />
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" />
                        Other Method
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Describe your preferred connection approach
                      </p>
                    </div>
                  </label>
                </div>
              </RadioGroup>
              {formErrors.method && (
                <p className="text-sm text-destructive mt-2">{formErrors.method}</p>
              )}
            </div>

            {/* Conditional Fields Based on Method */}
            {credentialMethod === 'oauth' && (
              <div>
                <Label htmlFor="secureLink" className="mb-2 block">
                  Authorization Link or OAuth URL
                </Label>
                <Input
                  id="secureLink"
                  value={secureLink}
                  onChange={(e) => setSecureLink(e.target.value)}
                  placeholder="https://..."
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Provide the link we should use to authorize access
                </p>
              </div>
            )}

            {credentialMethod === 'invite_user' && (
              <div className="bg-secondary/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Mail className="w-4 h-4 text-primary" />
                  <span className="font-medium">Invite this email:</span>
                </div>
                <code className="text-sm bg-background px-3 py-1.5 rounded border block">
                  contact@aerelion.systems
                </code>
                <p className="text-xs text-muted-foreground mt-2">
                  Add this email as an admin or team member in your tool, then let us know below.
                </p>
              </div>
            )}

            {credentialMethod === 'api_key' && (
              <div>
                <Label htmlFor="credentialReference" className="mb-2 block">
                  Where is the API key stored? <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="credentialReference"
                  value={credentialReference}
                  onChange={(e) => setCredentialReference(e.target.value)}
                  placeholder="e.g., 1Password vault: AERELION/YourCompany/HubSpot"
                  className={formErrors.reference ? 'border-destructive' : ''}
                />
                {formErrors.reference && (
                  <p className="text-sm text-destructive mt-1">{formErrors.reference}</p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  Do NOT paste the actual key. Describe where it's stored.
                </p>
              </div>
            )}

            {/* Message */}
            <div>
              <Label htmlFor="message" className="mb-2 block">
                Additional Notes
              </Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Any specific instructions, workspace names, or details we should know..."
                rows={3}
              />
            </div>

            {/* Security Notice */}
            <div className="flex items-start gap-3 p-4 bg-secondary/30 rounded-lg">
              <Shield className="w-5 h-5 text-primary mt-0.5" />
              <div className="text-sm">
                <p className="font-medium mb-1">Your data is secure</p>
                <p className="text-muted-foreground">
                  We encrypt all access information at rest. You can{' '}
                  <Link to="/security" className="text-primary hover:underline">
                    revoke access at any time
                  </Link>.
                </p>
              </div>
            </div>

            {/* Submit */}
            <div className="flex gap-4 pt-4">
              <Button 
                onClick={handleSubmit} 
                disabled={submitting}
                className="flex-1"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Access Information'
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
