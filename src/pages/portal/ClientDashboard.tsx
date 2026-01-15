import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useClientProfile, ClientIntegration } from '@/hooks/useClientProfile';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { 
  Loader2, LayoutDashboard, Package, Puzzle, CreditCard, HelpCircle,
  LogOut, User, ChevronRight, CheckCircle, AlertCircle, Download,
  ExternalLink, BookOpen, Upload, Menu, X, Settings, FileDown
} from 'lucide-react';
import PortalBackground from '@/components/portal/PortalBackground';
import { GlassCard } from '@/components/portal/GlassCard';
import { SubscriptionBadge } from '@/components/portal/SubscriptionBadge';
import { NotificationBell } from '@/components/portal/NotificationBell';

interface Purchase {
  id: string;
  item_id: string;
  item_type: string;
  amount_cents: number;
  status: string;
  created_at: string;
  item_name?: string;
}

const INTEGRATION_CONFIG: Record<string, { name: string; icon: string }> = {
  n8n: { name: 'n8n', icon: '⚡' },
  gmail: { name: 'Gmail', icon: '📧' },
  slack: { name: 'Slack', icon: '💬' },
  sheets: { name: 'Google Sheets', icon: '📊' },
  notion: { name: 'Notion', icon: '📝' },
  hubspot: { name: 'HubSpot', icon: '🎯' },
};

const NAV_ITEMS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'downloads', label: 'My Downloads', icon: Download },
  { id: 'integrations', label: 'Integrations', icon: Puzzle },
  { id: 'billing', label: 'Billing', icon: CreditCard, href: '/portal/billing' },
  { id: 'activity', label: 'Download Activity', icon: FileDown, href: '/portal/activity' },
  { id: 'support', label: 'Support', icon: HelpCircle },
];

const ClientDashboard = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [isLoadingPurchases, setIsLoadingPurchases] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { user, isLoading: authLoading, signOut } = useAuth();
  const { profile, integrations, isLoading: profileLoading } = useClientProfile();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/portal/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const fetchPurchases = async () => {
      if (!user) return;
      
      setIsLoadingPurchases(true);
      try {
        const { data } = await supabase
          .from('purchases')
          .select('*')
          .eq('user_id', user.id)
          .in('status', ['completed', 'paid'])
          .order('created_at', { ascending: false });

        if (data) {
          // Fetch item names
          const agentIds = data.filter(p => p.item_type === 'agent').map(p => p.item_id);
          const bundleIds = data.filter(p => p.item_type === 'bundle').map(p => p.item_id);

          let agentNames: Record<string, string> = {};
          let bundleNames: Record<string, string> = {};

          if (agentIds.length > 0) {
            const { data: agents } = await supabase
              .from('automation_agents')
              .select('id, name')
              .in('id', agentIds);
            agentNames = Object.fromEntries((agents || []).map(a => [a.id, a.name]));
          }

          if (bundleIds.length > 0) {
            const { data: bundles } = await supabase
              .from('automation_bundles')
              .select('id, name')
              .in('id', bundleIds);
            bundleNames = Object.fromEntries((bundles || []).map(b => [b.id, b.name]));
          }

          setPurchases(data.map(p => ({
            ...p,
            item_name: p.item_type === 'agent' 
              ? agentNames[p.item_id] 
              : bundleNames[p.item_id] || 'Unknown Item',
          })));
        }
      } catch (error) {
        console.error('Error fetching purchases:', error);
      } finally {
        setIsLoadingPurchases(false);
      }
    };

    fetchPurchases();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/portal/auth');
  };

  const handleDownload = async (purchase: Purchase) => {
    try {
      const { data, error } = await supabase.functions.invoke('get-download-links', {
        body: { 
          item_type: purchase.item_type, 
          item_id: purchase.item_id 
        },
      });

      if (error) throw error;

      if (data?.files?.length > 0) {
        // Open the first file (workflow)
        const workflowFile = data.files.find((f: { type: string }) => f.type === 'workflow');
        if (workflowFile?.url) {
          window.open(workflowFile.url, '_blank');
        }
        toast({ title: 'Download started' });
      } else {
        toast({ title: 'No files available', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Download failed', variant: 'destructive' });
    }
  };

  const getIntegrationStatus = (provider: string): ClientIntegration | undefined => {
    return integrations.find(i => i.provider === provider);
  };

  if (authLoading || profileLoading) {
    return (
      <PortalBackground>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </PortalBackground>
    );
  }

  const showOnboardingBanner = profile && !profile.onboarding_complete;

  return (
    <PortalBackground>
      <div className="min-h-screen flex">
        {/* Mobile sidebar toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-card/80 backdrop-blur rounded-lg border border-border/50"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        {/* Sidebar */}
        <aside 
          className={`fixed lg:static inset-y-0 left-0 z-40 w-64 transform transition-transform lg:translate-x-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <GlassCard variant="dark" hover={false} className="h-full rounded-none lg:rounded-r-xl flex flex-col">
            {/* Logo */}
            <div className="p-6 border-b border-border/20">
              <h1 className="text-xl font-semibold">AERELION</h1>
              <p className="text-xs text-muted-foreground mt-1">Client Portal</p>
            </div>

            {/* Nav Items */}
            <nav className="flex-1 p-4 space-y-1">
              {NAV_ITEMS.map(item => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => { setActiveSection(item.id); setSidebarOpen(false); }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      isActive 
                        ? 'bg-primary/20 text-primary' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/10'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </button>
                );
              })}
            </nav>

            {/* User Menu */}
            <div className="p-4 border-t border-border/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <User className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{profile?.full_name || 'User'}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-destructive rounded-lg hover:bg-destructive/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </GlassCard>
        </aside>

        {/* Main Content */}
        <main className="flex-1 lg:ml-0 p-4 lg:p-8 pt-16 lg:pt-8">
          {/* Top Status Bar */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-semibold">
                {activeSection === 'overview' && 'Dashboard'}
                {activeSection === 'downloads' && 'My Downloads'}
                {activeSection === 'integrations' && 'Integrations'}
                {activeSection === 'billing' && 'Billing'}
                {activeSection === 'support' && 'Support'}
              </h2>
            </div>
            <div className="flex items-center gap-3">
              {/* Notification Bell */}
              <NotificationBell />
              {/* Subscription Badge */}
              <SubscriptionBadge />
              
              {/* Setup Status */}
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
                profile?.onboarding_complete 
                  ? 'bg-primary/10 text-primary' 
                  : 'bg-yellow-500/10 text-yellow-600'
              }`}>
                {profile?.onboarding_complete ? (
                  <>
                    <CheckCircle className="w-3 h-3" />
                    Setup Complete
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-3 h-3" />
                    Setup Incomplete
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Onboarding Banner */}
          {showOnboardingBanner && (
            <GlassCard variant="accent" className="p-4 mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-primary" />
                <p className="text-sm">Complete your setup to unlock all features</p>
              </div>
              <Link
                to="/portal/onboarding"
                className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
              >
                Continue Setup
                <ChevronRight className="w-4 h-4" />
              </Link>
            </GlassCard>
          )}

          {/* Overview Section */}
          {activeSection === 'overview' && (
            <div className="space-y-6">
              {/* Welcome Panel */}
              <GlassCard className="p-6">
                <h3 className="text-lg font-semibold mb-1">
                  Welcome back, {profile?.full_name?.split(' ')[0] || 'there'}!
                </h3>
                {profile?.company_name && (
                  <p className="text-muted-foreground">{profile.company_name}</p>
                )}
              </GlassCard>

              {/* Integration Status Cards */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Your Setup</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {['n8n', 'slack', 'gmail'].map(provider => {
                    const config = INTEGRATION_CONFIG[provider];
                    const integration = getIntegrationStatus(provider);
                    const isConfigured = integration?.status === 'configured';
                    
                    return (
                      <GlassCard key={provider} className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{config.icon}</span>
                            <span className="font-medium">{config.name}</span>
                          </div>
                          <span className={`px-2 py-0.5 text-xs rounded-full ${
                            isConfigured 
                              ? 'bg-primary/10 text-primary' 
                              : 'bg-muted text-muted-foreground'
                          }`}>
                            {isConfigured ? 'Connected' : 'Not configured'}
                          </span>
                        </div>
                        <button
                          onClick={() => setActiveSection('integrations')}
                          className="text-xs text-primary hover:underline flex items-center gap-1"
                        >
                          {isConfigured ? 'View settings' : 'Configure'}
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </GlassCard>
                    );
                  })}
                </div>
              </div>

              {/* Purchased Items */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Purchased Items</h3>
                {isLoadingPurchases ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  </div>
                ) : purchases.length > 0 ? (
                  <div className="grid gap-3">
                    {purchases.slice(0, 5).map(purchase => (
                      <GlassCard key={purchase.id} className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Package className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{purchase.item_name}</p>
                            <p className="text-xs text-muted-foreground capitalize">{purchase.item_type}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDownload(purchase)}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors"
                        >
                          <Download className="w-3 h-3" />
                          Download
                        </button>
                      </GlassCard>
                    ))}
                  </div>
                ) : (
                  <GlassCard className="p-8 text-center">
                    <Package className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground mb-4">No purchases yet</p>
                    <Link
                      to="/packs"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                    >
                      Browse Workflow Packs
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </GlassCard>
                )}
              </div>

              {/* Quick Actions */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Link to="/packs">
                    <GlassCard className="p-4 flex items-center gap-3 group">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <Package className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Browse Packs</p>
                        <p className="text-xs text-muted-foreground">View workflow packs</p>
                      </div>
                    </GlassCard>
                  </Link>

                  <GlassCard className="p-4 flex items-center gap-3 opacity-60 cursor-not-allowed">
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                      <Upload className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">Import Workflow</p>
                      <p className="text-xs text-muted-foreground">Coming soon</p>
                    </div>
                  </GlassCard>

                  <Link to="/docs">
                    <GlassCard className="p-4 flex items-center gap-3 group">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <BookOpen className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Setup Guide</p>
                        <p className="text-xs text-muted-foreground">Documentation & help</p>
                      </div>
                    </GlassCard>
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* My Downloads Section */}
          {activeSection === 'downloads' && (
            <div className="space-y-6">
              {isLoadingPurchases ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
              ) : purchases.length > 0 ? (
                <div className="grid gap-4">
                  {purchases.map(purchase => (
                    <GlassCard key={purchase.id} className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                            <Package className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-semibold">{purchase.item_name}</h4>
                            <p className="text-sm text-muted-foreground capitalize">{purchase.item_type}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Purchased {new Date(purchase.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDownload(purchase)}
                          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                        >
                          <Download className="w-4 h-4" />
                          Download
                        </button>
                      </div>
                    </GlassCard>
                  ))}
                </div>
              ) : (
                <GlassCard className="p-12 text-center">
                  <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No workflow packs yet</h3>
                  <p className="text-muted-foreground mb-6">Browse our library to find workflow packs that fit your needs</p>
                  <Link
                    to="/packs"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                  >
                    Browse Workflow Packs
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </GlassCard>
              )}
            </div>
          )}

          {/* Integrations Section */}
          {activeSection === 'integrations' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(INTEGRATION_CONFIG).map(([provider, config]) => {
                  const integration = getIntegrationStatus(provider);
                  const isConfigured = integration?.status === 'configured';
                  
                  return (
                    <GlassCard key={provider} className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">{config.icon}</span>
                          <div>
                            <h4 className="font-semibold">{config.name}</h4>
                            <span className={`text-xs ${
                              isConfigured ? 'text-primary' : 'text-muted-foreground'
                            }`}>
                              {isConfigured ? 'Connected' : 'Not configured'}
                            </span>
                          </div>
                        </div>
                        <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                          <Settings className="w-4 h-4 text-muted-foreground" />
                        </button>
                      </div>
                      
                      {isConfigured && integration?.config && (
                        <div className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">
                          {Object.entries(integration.config as Record<string, unknown>).map(([key, value]) => (
                            <p key={key}><span className="font-medium">{key}:</span> {String(value)}</p>
                          ))}
                        </div>
                      )}
                      
                      {!isConfigured && (
                        <Link
                          to="/portal/onboarding"
                          className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                        >
                          Configure in setup wizard
                          <ChevronRight className="w-3 h-3" />
                        </Link>
                      )}
                    </GlassCard>
                  );
                })}
              </div>
            </div>
          )}

          {/* Billing Section */}
          {activeSection === 'billing' && (
            <GlassCard className="p-8 text-center">
              <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Billing & Invoices</h3>
              <p className="text-muted-foreground mb-6">View your purchase history and manage payment methods</p>
              <Link
                to="/purchases"
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                View Purchase History
                <ExternalLink className="w-4 h-4" />
              </Link>
            </GlassCard>
          )}

          {/* Support Section */}
          {activeSection === 'support' && (
            <div className="grid md:grid-cols-2 gap-6">
              <Link to="/docs">
                <GlassCard className="p-6 h-full group">
                  <BookOpen className="w-8 h-8 text-primary mb-4" />
                  <h4 className="font-semibold mb-2">Documentation</h4>
                  <p className="text-sm text-muted-foreground">Setup guides, FAQs, and technical references</p>
                </GlassCard>
              </Link>
              <Link to="/contact">
                <GlassCard className="p-6 h-full group">
                  <HelpCircle className="w-8 h-8 text-primary mb-4" />
                  <h4 className="font-semibold mb-2">Contact Support</h4>
                  <p className="text-sm text-muted-foreground">Get help from our support team</p>
                </GlassCard>
              </Link>
            </div>
          )}
        </main>
      </div>
    </PortalBackground>
  );
};

export default ClientDashboard;
