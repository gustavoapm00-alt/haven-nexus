import { useEffect, useState, useCallback } from 'react';
import { useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useClientProfile } from '@/hooks/useClientProfile';
import { useActivationStatus, ActiveAutomation } from '@/hooks/useActivationStatus';
import { useN8nProvisioning } from '@/hooks/useN8nProvisioning';
import { useIntegrationConnections } from '@/hooks/useIntegrationConnections';
import { 
  Loader2, Package, Shield, CheckCircle, Clock, AlertTriangle, 
  PauseCircle, ChevronRight, ExternalLink, LogOut, User, Link2,
  HelpCircle, FileText, Lock, Bell, Play, Pause, RotateCcw, XCircle, 
  Settings
} from 'lucide-react';
import PortalBackground from '@/components/portal/PortalBackground';
import { GlassCard } from '@/components/portal/GlassCard';
import { NotificationBell } from '@/components/portal/NotificationBell';
import { Button } from '@/components/ui/button';
import { IntegrationConnectWizard } from '@/components/portal/IntegrationConnectWizard';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { toast } from '@/hooks/use-toast';

// Status display configuration
const STATUS_CONFIG: Record<ActiveAutomation['status'], { 
  label: string; 
  icon: React.ElementType; 
  color: string;
  bgColor: string;
}> = {
  active: { 
    label: 'Active', 
    icon: CheckCircle, 
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10'
  },
  in_review: { 
    label: 'In Review', 
    icon: Clock, 
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10'
  },
  pending_credentials: { 
    label: 'Awaiting Connection', 
    icon: Lock, 
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10'
  },
  paused: { 
    label: 'Paused', 
    icon: PauseCircle, 
    color: 'text-muted-foreground',
    bgColor: 'bg-muted/50'
  },
  needs_attention: { 
    label: 'Needs Attention', 
    icon: AlertTriangle, 
    color: 'text-red-500',
    bgColor: 'bg-red-500/10'
  },
};

const ClientDashboard = () => {
  const { user, isLoading: authLoading, signOut } = useAuth();
  const { profile, isLoading: profileLoading } = useClientProfile();
  const { 
    activeAutomations, 
    requiredConnections, 
    hasIncompleteSetup,
    loading: activationLoading,
    refetch
  } = useActivationStatus();
  const { pause, resume, revoke, isProvisioning } = useN8nProvisioning();
  const { connections, isLoading: connectionsLoading } = useIntegrationConnections();
  const navigate = useNavigate();
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showConnectWizard, setShowConnectWizard] = useState(false);

  // Check if user should see the connect wizard prompt
  const shouldShowWizardPrompt = useMemo(() => {
    if (connectionsLoading) return false;
    const connectedProviders = connections.filter(c => c.status === 'connected');
    return connectedProviders.length === 0;
  }, [connections, connectionsLoading]);

  // Count of connected integrations
  const connectedCount = useMemo(() => {
    return connections.filter(c => c.status === 'connected').length;
  }, [connections]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/portal/auth');
    }
  }, [user, authLoading, navigate]);

  // Check for OAuth success redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const connected = params.get('connected');
    if (connected) {
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate('/portal/auth');
  };

  const handlePause = useCallback(async (activationRequestId: string, automationName: string) => {
    setActionLoading(activationRequestId);
    try {
      const result = await pause(activationRequestId);
      if (result.error) {
        toast({
          title: 'Failed to pause',
          description: result.error,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Paused',
          description: `${automationName} has been paused.`,
        });
        refetch();
      }
    } finally {
      setActionLoading(null);
    }
  }, [pause, refetch]);

  const handleResume = useCallback(async (activationRequestId: string, automationName: string) => {
    setActionLoading(activationRequestId);
    try {
      const result = await resume(activationRequestId);
      if (result.error) {
        toast({
          title: 'Failed to resume',
          description: result.error,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Resumed',
          description: `${automationName} is now active.`,
        });
        refetch();
      }
    } finally {
      setActionLoading(null);
    }
  }, [resume, refetch]);

  const handleRevoke = useCallback(async (activationRequestId: string, automationName: string) => {
    if (!confirm(`Are you sure you want to revoke access for ${automationName}? This will disconnect all integrations.`)) {
      return;
    }
    
    setActionLoading(activationRequestId);
    try {
      const result = await revoke(activationRequestId);
      if (result.error) {
        toast({
          title: 'Failed to revoke',
          description: result.error,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Revoked',
          description: `${automationName} access has been revoked.`,
        });
        refetch();
      }
    } finally {
      setActionLoading(null);
    }
  }, [revoke, refetch]);

  if (authLoading || profileLoading || activationLoading || connectionsLoading) {
    return (
      <PortalBackground>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </PortalBackground>
    );
  }

  return (
    <PortalBackground>
      <div className="min-h-screen">
        {/* Integration Connect Wizard */}
        <IntegrationConnectWizard
          open={showConnectWizard}
          onClose={() => setShowConnectWizard(false)}
        />

        {/* Header */}
        <header className="border-b border-border/20 bg-background/50 backdrop-blur-sm sticky top-0 z-40">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link to="/" className="text-xl font-semibold tracking-wide">
                  AERELION
                </Link>
                <span className="text-xs text-muted-foreground px-2 py-1 bg-muted/50 rounded">
                  Client Portal
                </span>
              </div>
              
              <div className="flex items-center gap-3">
                {/* Connected Integrations Badge */}
                <button
                  onClick={() => setShowConnectWizard(true)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-sm"
                  title="Manage integrations"
                >
                  <Link2 className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground hidden sm:inline">Integrations</span>
                  <Badge 
                    variant={connectedCount > 0 ? "default" : "secondary"}
                    className="h-5 min-w-5 flex items-center justify-center px-1.5"
                  >
                    {connectedCount}
                  </Badge>
                </button>

                <NotificationBell />
                
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                  <span className="hidden sm:inline text-muted-foreground">
                    {profile?.full_name || user?.email}
                  </span>
                </div>
                
                <button
                  onClick={handleSignOut}
                  className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted/50 transition-colors"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          {/* Connect Tools Prompt - Shows when user has no connections */}
          {shouldShowWizardPrompt && (
            <section>
              <div 
                onClick={() => setShowConnectWizard(true)}
                className="cursor-pointer group p-5 rounded-xl border border-primary/30 bg-primary/5 hover:bg-primary/10 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Shield className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Connect Your Tools</h3>
                      <p className="text-sm text-muted-foreground">
                        Link Google, HubSpot, Slack & Notion in one click
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </div>
            </section>
          )}

          {/* Welcome Message */}
          <div>
            <h1 className="text-2xl font-semibold">
              Welcome back{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}
            </h1>
            <p className="text-muted-foreground mt-1">
              Your automation systems at a glance
            </p>
          </div>

          {/* Section 1: Active Automations (Primary) */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Active Automations</h2>
              {activeAutomations.length > 0 && (
                <Link 
                  to="/automations" 
                  className="text-sm text-primary hover:underline flex items-center gap-1"
                >
                  Browse More
                  <ExternalLink className="w-3 h-3" />
                </Link>
              )}
            </div>

            {activeAutomations.length > 0 ? (
              <div className="space-y-3">
                {activeAutomations.map((automation) => {
                  const statusConfig = STATUS_CONFIG[automation.status];
                  const StatusIcon = statusConfig.icon;
                  const isLoading = actionLoading === automation.activation_request_id;
                  
                  return (
                    <GlassCard key={automation.purchase_id} className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Package className="w-6 h-6 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold">{automation.name}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {automation.short_outcome}
                            </p>
                            
                            {/* Status Badge */}
                            <div className="flex items-center gap-2 mt-2">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig.bgColor} ${statusConfig.color}`}>
                                <StatusIcon className="w-3 h-3" />
                                {statusConfig.label}
                              </span>
                              
                              {automation.activation_eta && automation.status === 'in_review' && (
                                <span className="text-xs text-muted-foreground">
                                  ETA: {automation.activation_eta}
                                </span>
                              )}
                            </div>
                            
                            {automation.notes && (
                              <p className="text-xs text-muted-foreground mt-2 italic">
                                "{automation.notes}"
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {/* Automation Controls Dropdown */}
                          {automation.activation_request_id && automation.status !== 'in_review' && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  disabled={isLoading}
                                  className="px-2"
                                >
                                  {isLoading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <Settings className="w-4 h-4" />
                                  )}
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                {automation.status === 'active' && (
                                  <DropdownMenuItem
                                    onClick={() => handlePause(automation.activation_request_id!, automation.name)}
                                  >
                                    <Pause className="w-4 h-4 mr-2" />
                                    Pause Automation
                                  </DropdownMenuItem>
                                )}
                                
                                {automation.status === 'paused' && (
                                  <DropdownMenuItem
                                    onClick={() => handleResume(automation.activation_request_id!, automation.name)}
                                  >
                                    <Play className="w-4 h-4 mr-2" />
                                    Resume Automation
                                  </DropdownMenuItem>
                                )}
                                
                                {automation.status === 'pending_credentials' && (
                                  <DropdownMenuItem asChild>
                                    <Link to={`/portal/connect/${automation.id}?request_id=${automation.activation_request_id}`}>
                                      <Lock className="w-4 h-4 mr-2" />
                                      Connect Tools
                                    </Link>
                                  </DropdownMenuItem>
                                )}

                                {automation.status === 'needs_attention' && (
                                  <DropdownMenuItem asChild>
                                    <Link to={`/portal/connect/${automation.id}?request_id=${automation.activation_request_id}`}>
                                      <RotateCcw className="w-4 h-4 mr-2" />
                                      Reconnect Tools
                                    </Link>
                                  </DropdownMenuItem>
                                )}
                                
                                <DropdownMenuItem asChild>
                                  <Link to={`/portal/connect/${automation.id}?request_id=${automation.activation_request_id}`}>
                                    <Settings className="w-4 h-4 mr-2" />
                                    Manage Connections
                                  </Link>
                                </DropdownMenuItem>
                                
                                <DropdownMenuSeparator />
                                
                                <DropdownMenuItem
                                  className="text-destructive focus:text-destructive"
                                  onClick={() => handleRevoke(automation.activation_request_id!, automation.name)}
                                >
                                  <XCircle className="w-4 h-4 mr-2" />
                                  Revoke Access
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}

                          <Link
                            to={automation.activation_request_id 
                              ? `/activation-request/${automation.activation_request_id}` 
                              : `/automations/${automation.id}`
                            }
                            className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors"
                          >
                            View Details
                            <ChevronRight className="w-4 h-4" />
                          </Link>
                        </div>
                      </div>
                    </GlassCard>
                  );
                })}
              </div>
            ) : (
              <GlassCard className="p-10 text-center">
                <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No active automations</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Browse our catalog to find hosted automations that AERELION will 
                  configure, operate, and maintain for you.
                </p>
                <Link
                  to="/automations"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                >
                  Browse Automations
                  <ExternalLink className="w-4 h-4" />
                </Link>
              </GlassCard>
            )}
          </section>

          {/* Section 2: Required Connections (Conditional - Only shows when incomplete) */}
          {hasIncompleteSetup && requiredConnections.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Lock className="w-5 h-5 text-amber-500" />
                <h2 className="text-lg font-semibold">Required Connections</h2>
              </div>
              
              <GlassCard variant="accent" className="p-5 border-amber-500/30">
                <p className="text-sm text-muted-foreground mb-4">
                  To activate your automation, we need secure access to the following services:
                </p>
                
                <div className="space-y-3">
                  {requiredConnections.map((connection, idx) => {
                    const isConnected = connection.status === 'connected';
                    
                    return (
                      <div 
                        key={`${connection.service_name}-${idx}`}
                        className="flex items-center justify-between p-3 bg-background/50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            isConnected ? 'bg-emerald-500/10' : 'bg-amber-500/10'
                          }`}>
                            {isConnected ? (
                              <CheckCircle className="w-4 h-4 text-emerald-500" />
                            ) : (
                              <Lock className="w-4 h-4 text-amber-500" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{connection.service_name}</p>
                            <p className="text-xs text-muted-foreground">
                              For {connection.automation_name}
                            </p>
                          </div>
                        </div>
                        
                        {!isConnected && (
                          <Link
                            to={`/credentials/${connection.activation_request_id}`}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
                          >
                            <Shield className="w-3.5 h-3.5" />
                            Connect Securely
                          </Link>
                        )}
                        
                        {isConnected && (
                          <span className="text-xs text-emerald-500 font-medium">
                            Connected
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
                
                <p className="text-xs text-muted-foreground mt-4 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5" />
                  Credentials are encrypted with AES-256-GCM and can be revoked anytime.
                </p>
              </GlassCard>
            </section>
          )}

          {/* Section 3: System Status (Passive Footer) */}
          <section className="pt-4 border-t border-border/20">
            <GlassCard className="p-6 bg-muted/30">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5 text-emerald-500" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-sm mb-1">System Status</h3>
                  <p className="text-sm text-muted-foreground">
                    All systems are hosted, monitored, and maintained by AERELION. 
                    Your credentials are encrypted and revocable at any time.
                  </p>
                  
                  <div className="flex flex-wrap gap-4 mt-4">
                    <Link
                      to="/integrations"
                      className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                    >
                      <Settings className="w-4 h-4" />
                      Manage Integrations
                    </Link>
                    <Link
                      to="/contact"
                      className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                    >
                      <HelpCircle className="w-4 h-4" />
                      Contact Support
                    </Link>
                    <Link
                      to="/docs"
                      className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                    >
                      <FileText className="w-4 h-4" />
                      Documentation
                    </Link>
                    <Link
                      to="/purchases"
                      className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                    >
                      <Bell className="w-4 h-4" />
                      Purchase History
                    </Link>
                  </div>
                </div>
              </div>
            </GlassCard>
          </section>
        </main>
      </div>
    </PortalBackground>
  );
};

export default ClientDashboard;
