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
        <SEO title="My Purchases" description="View your purchase history and access your activated automations." />
        <LibraryNavbar />
        <SectionBand variant="light">
          <div className="max-w-md mx-auto text-center py-20">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-8 h-8 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-semibold text-foreground mb-3">Sign In Required</h1>
            <p className="text-muted-foreground mb-6">
              Please sign in to view your purchases and automation status.
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
        <SEO title="My Purchases" description="View your purchase history and access your activated automations." />
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
        description="View your purchase history and access your activated automation systems."
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
                No governed protocols have been authorized yet. Review the Capability Matrix to identify protocols for your operational requirements.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button asChild>
                  <Link to="/automations">VIEW CAPABILITY MATRIX</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/bundles">VIEW SYSTEM BUNDLES</Link>
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
                            {purchase.item_type === 'bundle' ? 'SYSTEM_BUNDLE' : 'GOVERNED_PROTOCOL'}
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
                        asChild
                      >
                        <Link to="/activation-setup">
                          <ArrowRight className="w-4 h-4 mr-2" />
                          Start Activation
                        </Link>
                      </Button>
                    </div>
                  </div>
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
                If you need assistance with activation or have questions about your automations, we're here to help.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button asChild variant="outline">
                  <Link to="/activation-walkthrough">View Activation Guide</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/contact">Contact Support</Link>
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