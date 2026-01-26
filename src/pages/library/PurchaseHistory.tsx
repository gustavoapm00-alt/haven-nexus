import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Download, Loader2, Package, FileText, RefreshCw, 
  ShoppingBag, Calendar, ArrowRight, ExternalLink 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import LibraryNavbar from '@/components/library/LibraryNavbar';
import LibraryFooter from '@/components/library/LibraryFooter';
import SectionBand from '@/components/library/SectionBand';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import SEO from '@/components/SEO';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { SUCCESS_STATUSES } from '@/lib/purchase-constants';

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

const PurchaseHistory = () => {
  const { user, isLoading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [purchases, setPurchases] = useState<PurchaseWithDetails[]>([]);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloads, setDownloads] = useState<Record<string, DownloadLink[]>>({});

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }
    fetchPurchases();
  }, [user, authLoading]);

  const fetchPurchases = async () => {
    if (!user?.email) return;

    setLoading(true);
    try {
      // Fetch purchases for current user
      const { data: purchaseData, error: purchaseError } = await supabase
        .from('purchases')
        .select('*')
        .eq('email', user.email)
        .in('status', SUCCESS_STATUSES)
        .order('created_at', { ascending: false });

      if (purchaseError) throw purchaseError;

      if (!purchaseData || purchaseData.length === 0) {
        setPurchases([]);
        setLoading(false);
        return;
      }

      // Fetch agent and bundle details
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

      // Merge purchase data with item details
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

  const formatPrice = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  // Not logged in state
  if (!authLoading && !user) {
    return (
      <div className="min-h-screen bg-background">
        <SEO title="My Purchases" description="View your purchase history and download your automation files." />
        <LibraryNavbar />
        <SectionBand variant="light">
          <div className="max-w-md mx-auto text-center py-20">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-8 h-8 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-semibold text-foreground mb-3">Sign In Required</h1>
            <p className="text-muted-foreground mb-6">
              Please sign in to view your purchases and access download links.
            </p>
            <Button asChild>
              <Link to={`/auth?redirect=${encodeURIComponent('/purchases')}`}>
                Sign In
              </Link>
            </Button>
          </div>
        </SectionBand>
        <LibraryFooter />
      </div>
    );
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <SEO title="My Purchases" description="View your purchase history and download your automation files." />
        <LibraryNavbar />
        <div className="section-padding flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading your purchases...</p>
          </div>
        </div>
        <LibraryFooter />
      </div>
    );
  }

  return (
    <>
      <SEO
        title="My Purchases - AERELION Library"
        description="View your purchase history and download your automation workflow files."
      />

      <div className="min-h-screen bg-background">
        <LibraryNavbar />

        {/* Header */}
        <SectionBand variant="muted">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">My Purchases</h1>
              <p className="text-muted-foreground">
                Access your activated automations and bundles
              </p>
            </div>
            <Button asChild variant="outline">
              <Link to="/automations">
                Browse More Automations
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </SectionBand>

        {/* Purchases List */}
        <SectionBand variant="light">
          {purchases.length === 0 ? (
            <motion.div 
              className="max-w-md mx-auto text-center py-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingBag className="w-10 h-10 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-3">No Purchases Yet</h2>
              <p className="text-muted-foreground mb-6">
                You haven't purchased any automations or bundles yet. Browse our library to find automations that fit your needs.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button asChild>
                  <Link to="/automations">Browse Automations</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/bundles">View Bundles</Link>
                </Button>
              </div>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {purchases.map((purchase, index) => (
                <motion.div
                  key={purchase.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="card-panel p-6"
                >
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
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            {purchase.item_type === 'bundle' ? 'System Bundle' : 'Hosted Automation'}
                          </span>
                        </div>
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
                              Downloaded {purchase.download_count} time{purchase.download_count > 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-2 lg:shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                      >
                        <Link to={`/${purchase.item_type === 'bundle' ? 'bundles' : 'automations'}/${purchase.item_slug}`}>
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
                </motion.div>
              ))}
            </div>
          )}
        </SectionBand>

        {/* Help Section */}
        {purchases.length > 0 && (
          <SectionBand variant="muted">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-lg font-semibold text-foreground mb-2">Need Help?</h2>
              <p className="text-muted-foreground mb-4">
                If you're having trouble with downloads or need installation assistance, we're here to help.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button asChild variant="outline">
                  <Link to="/docs">View Documentation</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/install">Request Installation Help</Link>
                </Button>
              </div>
            </div>
          </SectionBand>
        )}

        <LibraryFooter />
      </div>
    </>
  );
};

export default PurchaseHistory;