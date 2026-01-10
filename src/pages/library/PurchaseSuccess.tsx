import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, Download, Loader2, AlertCircle, ArrowLeft, FileText, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LibraryNavbar from '@/components/library/LibraryNavbar';
import LibraryFooter from '@/components/library/LibraryFooter';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import SEO from '@/components/SEO';

interface DownloadLink {
  name: string;
  type: 'workflow' | 'guide';
  url: string;
  expires_in: number;
}

interface PurchaseDetails {
  item_type: 'agent' | 'bundle';
  item_id: string;
  item_name: string;
  item_slug: string;
  amount_cents: number;
  email: string;
}

const PurchaseSuccess = () => {
  const [searchParams] = useSearchParams();
  const { user, isLoading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [purchase, setPurchase] = useState<PurchaseDetails | null>(null);
  const [downloads, setDownloads] = useState<DownloadLink[]>([]);
  const [downloadLoading, setDownloadLoading] = useState(false);

  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      setError('Please sign in to access your purchase.');
      setLoading(false);
      return;
    }

    if (!sessionId) {
      setError('No session ID provided.');
      setLoading(false);
      return;
    }

    verifyPurchase();
  }, [sessionId, user, authLoading]);

  const verifyPurchase = async () => {
    try {
      const { data, error: verifyError } = await supabase.functions.invoke('verify-purchase', {
        body: { session_id: sessionId },
      });

      if (verifyError) {
        throw new Error(verifyError.message);
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setPurchase(data);
      
      // Automatically fetch download links
      fetchDownloads(data.item_type, data.item_id);
    } catch (err) {
      console.error('Verify purchase error:', err);
      setError(err instanceof Error ? err.message : 'Failed to verify purchase');
    } finally {
      setLoading(false);
    }
  };

  const fetchDownloads = async (itemType: string, itemId: string) => {
    setDownloadLoading(true);
    try {
      const { data, error: downloadError } = await supabase.functions.invoke('get-download-links', {
        body: { item_type: itemType, item_id: itemId },
      });

      if (downloadError) {
        throw new Error(downloadError.message);
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setDownloads(data.downloads || []);
    } catch (err) {
      console.error('Fetch downloads error:', err);
      // Don't set main error - downloads might just not be ready yet
    } finally {
      setDownloadLoading(false);
    }
  };

  const formatPrice = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <LibraryNavbar />
        <div className="section-padding flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Verifying your purchase...</p>
          </div>
        </div>
        <LibraryFooter />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <LibraryNavbar />
        <div className="section-padding">
          <div className="container-main max-w-2xl text-center">
            <div className="card-enterprise p-10">
              <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-6" />
              <h1 className="text-2xl font-semibold text-foreground mb-4">
                Something Went Wrong
              </h1>
              <p className="text-muted-foreground mb-6">{error}</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button asChild variant="outline">
                  <Link to="/agents">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Browse Agents
                  </Link>
                </Button>
                <Button asChild>
                  <Link to="/contact">Contact Support</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
        <LibraryFooter />
      </div>
    );
  }

  return (
    <>
      <SEO
        title="Purchase Complete"
        description="Thank you for your purchase. Download your automation files below."
      />

      <div className="min-h-screen bg-background">
        <LibraryNavbar />

        <section className="section-padding">
          <div className="container-main max-w-2xl">
            {/* Success Header */}
            <div className="text-center mb-10">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-primary" />
              </div>
              <h1 className="text-3xl font-semibold text-foreground mb-3">
                Purchase Complete
              </h1>
              <p className="text-muted-foreground">
                Thank you for your purchase. A confirmation email has been sent to{' '}
                <span className="text-foreground font-medium">{purchase?.email}</span>.
              </p>
            </div>

            {/* Purchase Details */}
            <div className="card-enterprise p-6 mb-8">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  {purchase?.item_type === 'bundle' ? (
                    <Package className="w-6 h-6 text-primary" />
                  ) : (
                    <FileText className="w-6 h-6 text-primary" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-1">
                    {purchase?.item_type === 'bundle' ? 'System Bundle' : 'Automation Agent'}
                  </p>
                  <h2 className="text-xl font-semibold text-foreground mb-2">
                    {purchase?.item_name}
                  </h2>
                  <p className="text-lg font-medium text-primary">
                    {formatPrice(purchase?.amount_cents || 0)}
                  </p>
                </div>
              </div>
            </div>

            {/* Download Section */}
            <div className="card-enterprise p-6 mb-8">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Download className="w-5 h-5" />
                Your Downloads
              </h3>

              {downloadLoading ? (
                <div className="flex items-center gap-3 text-muted-foreground py-4">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Preparing your download links...</span>
                </div>
              ) : downloads.length > 0 ? (
                <div className="space-y-3">
                  {downloads.map((download, index) => (
                    <a
                      key={index}
                      href={download.url}
                      download
                      className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-muted-foreground" />
                        <span className="font-medium text-foreground">{download.name}</span>
                      </div>
                      <Button size="sm" variant="ghost" className="group-hover:bg-primary group-hover:text-primary-foreground">
                        <Download className="w-4 h-4" />
                      </Button>
                    </a>
                  ))}
                  <p className="text-sm text-muted-foreground mt-4">
                    Download links expire in 1 hour. You can always access your purchases from your account.
                  </p>
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground mb-4">
                    Files are being prepared. They will be available shortly.
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => purchase && fetchDownloads(purchase.item_type, purchase.item_id)}
                  >
                    <Loader2 className="w-4 h-4 mr-2" />
                    Refresh Downloads
                  </Button>
                </div>
              )}
            </div>

            {/* Next Steps */}
            <div className="card-enterprise p-6 bg-muted/30">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Next Steps
              </h3>
              <ol className="space-y-3 text-muted-foreground">
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center">1</span>
                  <span>Download the workflow file and deployment guide above</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center">2</span>
                  <span>Follow the deployment guide to import the workflow into n8n</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center">3</span>
                  <span>Configure your system credentials as specified in the guide</span>
                </li>
              </ol>
              
              <div className="mt-6 pt-6 border-t border-border">
                <p className="text-sm text-muted-foreground mb-3">
                  Need help with installation?
                </p>
                <Button asChild variant="outline" size="sm">
                  <Link to="/install">Request Installation Assistance</Link>
                </Button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
              <Button asChild variant="outline">
                <Link to={purchase?.item_type === 'bundle' ? `/bundles/${purchase?.item_slug}` : `/agents/${purchase?.item_slug}`}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  View {purchase?.item_type === 'bundle' ? 'Bundle' : 'Agent'} Details
                </Link>
              </Button>
              <Button asChild>
                <Link to="/agents">Browse More Agents</Link>
              </Button>
            </div>
          </div>
        </section>

        <LibraryFooter />
      </div>
    </>
  );
};

export default PurchaseSuccess;
