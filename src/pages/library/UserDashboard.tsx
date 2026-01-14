import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Download, Loader2, Package, FileText, RefreshCw, 
  ShoppingBag, Calendar, ArrowRight, ExternalLink,
  User, Mail, Clock, Settings, LogOut, Bot
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import LibraryNavbar from '@/components/library/LibraryNavbar';
import LibraryFooter from '@/components/library/LibraryFooter';
import SectionBand from '@/components/library/SectionBand';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import SEO from '@/components/SEO';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface Purchase {
  id: string;
  item_type: 'agent' | 'bundle';
  item_id: string;
  amount_cents: number;
  status: string;
  created_at: string;
  download_count: number | null;
  last_download_at: string | null;
}

interface PurchaseWithDetails extends Purchase {
  item_name: string;
  item_slug: string;
}

interface DownloadLink {
  name: string;
  type: 'workflow' | 'guide';
  url: string;
  expires_in: number;
}

const UserDashboard = () => {
  const { user, isLoading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [purchases, setPurchases] = useState<PurchaseWithDetails[]>([]);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloads, setDownloads] = useState<Record<string, DownloadLink[]>>({});

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/auth?redirect=/dashboard');
      return;
    }
    fetchPurchases();
  }, [user, authLoading, navigate]);

  const fetchPurchases = async () => {
    if (!user?.email) return;

    setLoading(true);
    try {
      const { data: purchaseData, error: purchaseError } = await supabase
        .from('purchases')
        .select('*')
        .eq('email', user.email)
        .eq('status', 'paid')
        .order('created_at', { ascending: false });

      if (purchaseError) throw purchaseError;

      if (!purchaseData || purchaseData.length === 0) {
        setPurchases([]);
        setLoading(false);
        return;
      }

      const agentIds = purchaseData.filter(p => p.item_type === 'agent').map(p => p.item_id);
      const bundleIds = purchaseData.filter(p => p.item_type === 'bundle').map(p => p.item_id);

      const [agentsRes, bundlesRes] = await Promise.all([
        agentIds.length > 0 
          ? supabase.from('automation_agents').select('id, name, slug').in('id', agentIds)
          : { data: [], error: null },
        bundleIds.length > 0 
          ? supabase.from('automation_bundles').select('id, name, slug').in('id', bundleIds)
          : { data: [], error: null },
      ]);

      const agentMap = new Map((agentsRes.data || []).map(a => [a.id, a]));
      const bundleMap = new Map((bundlesRes.data || []).map(b => [b.id, b]));

      const enrichedPurchases: PurchaseWithDetails[] = purchaseData.map(purchase => {
        const item = purchase.item_type === 'agent' 
          ? agentMap.get(purchase.item_id)
          : bundleMap.get(purchase.item_id);

        return {
          ...purchase,
          item_type: purchase.item_type as 'agent' | 'bundle',
          item_name: item?.name || 'Unknown Item',
          item_slug: item?.slug || '',
        };
      });

      setPurchases(enrichedPurchases);
    } catch (err) {
      console.error('Error fetching purchases:', err);
      toast.error('Failed to load purchases');
    } finally {
      setLoading(false);
    }
  };

  const fetchDownloads = async (purchase: PurchaseWithDetails) => {
    setDownloadingId(purchase.id);
    try {
      const { data, error } = await supabase.functions.invoke('get-download-links', {
        body: { item_type: purchase.item_type, item_id: purchase.item_id },
      });

      if (error) throw new Error(error.message);
      if (data.error) throw new Error(data.error);

      setDownloads(prev => ({
        ...prev,
        [purchase.id]: data.downloads || [],
      }));

      toast.success('Download links ready');
    } catch (err) {
      console.error('Error fetching downloads:', err);
      toast.error('Failed to generate download links');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const formatPrice = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  const totalSpent = purchases.reduce((sum, p) => sum + p.amount_cents, 0);
  const agentCount = purchases.filter(p => p.item_type === 'agent').length;
  const bundleCount = purchases.filter(p => p.item_type === 'bundle').length;

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <SEO title="Dashboard" description="Manage your account and access your purchased automation workflows." />
        <LibraryNavbar />
        <div className="section-padding flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading your dashboard...</p>
          </div>
        </div>
        <LibraryFooter />
      </div>
    );
  }

  return (
    <>
      <SEO
        title="Dashboard - AERELION"
        description="Manage your account and access your purchased automation workflows."
      />

      <div className="min-h-screen bg-background">
        <LibraryNavbar />

        {/* Header */}
        <SectionBand variant="muted">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
              <p className="text-muted-foreground">
                Welcome back, {user?.email?.split('@')[0] || 'Operator'}
              </p>
            </motion.div>
            <motion.div 
              className="flex flex-wrap gap-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Button asChild variant="outline">
                <Link to="/agents">
                  <Bot className="w-4 h-4 mr-2" />
                  Browse Agents
                </Link>
              </Button>
              <Button variant="ghost" onClick={handleSignOut}>
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </motion.div>
          </div>
        </SectionBand>

        {/* Stats Cards */}
        <SectionBand variant="light">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
            {[
              { label: 'Total Purchases', value: purchases.length, icon: ShoppingBag },
              { label: 'Agents Owned', value: agentCount, icon: FileText },
              { label: 'Bundles Owned', value: bundleCount, icon: Package },
              { label: 'Total Invested', value: formatPrice(totalSpent), icon: Clock },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="card-panel">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                        <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                      </div>
                      <div className="p-3 bg-primary/10 rounded-lg">
                        <stat.icon className="w-5 h-5 text-primary" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Account Info */}
          <div className="grid lg:grid-cols-3 gap-6 mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="card-panel h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <User className="w-5 h-5 text-primary" />
                    Account
                  </CardTitle>
                  <CardDescription>Your account details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-foreground truncate">{user?.email}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Member since {user?.created_at ? format(new Date(user.created_at), 'MMM yyyy') : 'N/A'}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              className="lg:col-span-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <Card className="card-panel h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Settings className="w-5 h-5 text-primary" />
                    Quick Actions
                  </CardTitle>
                  <CardDescription>Common tasks and resources</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <Button asChild variant="outline" className="justify-start h-auto py-3">
                      <Link to="/docs">
                        <FileText className="w-4 h-4 mr-2" />
                        <div className="text-left">
                          <div className="font-medium">Documentation</div>
                          <div className="text-xs text-muted-foreground">Setup guides & tutorials</div>
                        </div>
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="justify-start h-auto py-3">
                      <Link to="/install">
                        <Settings className="w-4 h-4 mr-2" />
                        <div className="text-left">
                          <div className="font-medium">Installation Help</div>
                          <div className="text-xs text-muted-foreground">Get assistance setting up</div>
                        </div>
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="justify-start h-auto py-3">
                      <Link to="/security">
                        <Package className="w-4 h-4 mr-2" />
                        <div className="text-left">
                          <div className="font-medium">Security Practices</div>
                          <div className="text-xs text-muted-foreground">Data ownership & privacy</div>
                        </div>
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="justify-start h-auto py-3">
                      <Link to="/contact">
                        <Mail className="w-4 h-4 mr-2" />
                        <div className="text-left">
                          <div className="font-medium">Contact Support</div>
                          <div className="text-xs text-muted-foreground">Get in touch with us</div>
                        </div>
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Purchases Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-foreground">Your Purchases</h2>
                <p className="text-sm text-muted-foreground">Access and download your automation files</p>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link to="/agents">
                  Browse More
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>

            {purchases.length === 0 ? (
              <Card className="card-panel">
                <CardContent className="py-16 text-center">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <ShoppingBag className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">No purchases yet</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    Browse our library to find automation workflows that fit your operational needs.
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <Button asChild>
                      <Link to="/agents">Browse Agents</Link>
                    </Button>
                    <Button asChild variant="outline">
                      <Link to="/bundles">View Bundles</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {purchases.map((purchase, index) => (
                  <motion.div
                    key={purchase.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 + index * 0.05 }}
                  >
                    <Card className="card-panel">
                      <CardContent className="p-6">
                        <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                          {/* Item Info */}
                          <div className="flex items-start gap-4 flex-1">
                            <div className="p-3 bg-primary/10 rounded-lg shrink-0">
                              {purchase.item_type === 'bundle' ? (
                                <Package className="w-6 h-6 text-primary" />
                              ) : (
                                <FileText className="w-6 h-6 text-primary" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                {purchase.item_type === 'bundle' ? 'System Bundle' : 'Automation Agent'}
                              </span>
                              <h3 className="text-lg font-semibold text-foreground mb-1 truncate">
                                {purchase.item_name}
                              </h3>
                              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4" />
                                  {format(new Date(purchase.created_at), 'MMM d, yyyy')}
                                </span>
                                <span className="font-medium text-foreground">
                                  {formatPrice(purchase.amount_cents)}
                                </span>
                                {purchase.download_count && purchase.download_count > 0 && (
                                  <span className="text-xs">
                                    Downloaded {purchase.download_count}×
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex flex-col sm:flex-row gap-2 lg:shrink-0">
                            <Button variant="outline" size="sm" asChild>
                              <Link to={`/${purchase.item_type === 'bundle' ? 'bundles' : 'agents'}/${purchase.item_slug}`}>
                                <ExternalLink className="w-4 h-4 mr-2" />
                                View Details
                              </Link>
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => fetchDownloads(purchase)}
                              disabled={downloadingId === purchase.id}
                            >
                              {downloadingId === purchase.id ? (
                                <>
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  Loading...
                                </>
                              ) : (
                                <>
                                  <Download className="w-4 h-4 mr-2" />
                                  Get Downloads
                                </>
                              )}
                            </Button>
                          </div>
                        </div>

                        {/* Download Links */}
                        {downloads[purchase.id] && downloads[purchase.id].length > 0 && (
                          <motion.div 
                            className="mt-4 pt-4 border-t border-border"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                          >
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="text-sm font-medium text-foreground">Download Files</h4>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => fetchDownloads(purchase)}
                                disabled={downloadingId === purchase.id}
                              >
                                <RefreshCw className={`w-3 h-3 mr-1 ${downloadingId === purchase.id ? 'animate-spin' : ''}`} />
                                Refresh
                              </Button>
                            </div>
                            <div className="grid gap-2 sm:grid-cols-2">
                              {downloads[purchase.id].map((download, i) => (
                                <a
                                  key={i}
                                  href={download.url}
                                  download
                                  className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors group"
                                >
                                  <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                                  <span className="text-sm font-medium text-foreground truncate flex-1">
                                    {download.name}
                                  </span>
                                  <Download className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                                </a>
                              ))}
                            </div>
                            <p className="text-xs text-muted-foreground mt-3">
                              Links expire in 1 hour. Click "Refresh" to generate new links.
                            </p>
                          </motion.div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </SectionBand>

        <LibraryFooter />
      </div>
    </>
  );
};

export default UserDashboard;
