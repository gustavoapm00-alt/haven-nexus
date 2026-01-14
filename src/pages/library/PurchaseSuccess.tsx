import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  CheckCircle, Download, Loader2, AlertCircle, ArrowLeft, 
  FileText, Package, RefreshCw, ChevronDown, ChevronUp, Copy, Check,
  Bug
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import LibraryNavbar from '@/components/library/LibraryNavbar';
import LibraryFooter from '@/components/library/LibraryFooter';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import SEO from '@/components/SEO';
import { toast } from 'sonner';

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

interface DiagnosticsState {
  sessionId: string | null;
  sessionVerified: boolean;
  purchaseFound: boolean;
  purchaseStatus: 'paid' | 'unpaid' | 'unknown';
  downloadsGenerated: boolean;
  downloadCount: number;
  error: string | null;
  webhookReceived: boolean;
  lastPurchase: {
    id: string;
    item_type: string;
    item_id: string;
    created_at: string;
    status: string;
  } | null;
  retryCount: number;
}

const PurchaseSuccess = () => {
  const [searchParams] = useSearchParams();
  const { user, isLoading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [purchase, setPurchase] = useState<PurchaseDetails | null>(null);
  const [downloads, setDownloads] = useState<DownloadLink[]>([]);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [diagnosticsOpen, setDiagnosticsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [noFilesMessage, setNoFilesMessage] = useState<string | null>(null);
  const [diagnostics, setDiagnostics] = useState<DiagnosticsState>({
    sessionId: null,
    sessionVerified: false,
    purchaseFound: false,
    purchaseStatus: 'unknown',
    downloadsGenerated: false,
    downloadCount: 0,
    error: null,
    webhookReceived: false,
    lastPurchase: null,
    retryCount: 0,
  });

  const sessionId = searchParams.get('session_id');
  const debugMode = searchParams.get('debug') === '1' || import.meta.env.DEV;

  useEffect(() => {
    setDiagnostics(prev => ({ ...prev, sessionId }));
    
    if (authLoading) return;
    
    if (!user) {
      setError('Please sign in to access your purchase.');
      setLoading(false);
      return;
    }

    if (!sessionId) {
      setError('No session ID provided. Please check your email for the purchase confirmation link.');
      setLoading(false);
      return;
    }

    verifyPurchase();
  }, [sessionId, user, authLoading]);

  // Check for webhook receipt by querying purchase directly
  const checkWebhookReceipt = useCallback(async () => {
    if (!user?.email || !sessionId) return false;
    
    const { data } = await supabase
      .from('purchases')
      .select('id, item_type, item_id, created_at, status')
      .eq('stripe_session_id', sessionId)
      .single();
    
    if (data) {
      setDiagnostics(prev => ({
        ...prev,
        webhookReceived: true,
        lastPurchase: data,
      }));
      return true;
    }
    return false;
  }, [user?.email, sessionId]);

  const verifyPurchase = async (retryCount = 0) => {
    setLoading(true);
    setDiagnostics(prev => ({ ...prev, error: null, retryCount }));
    
    try {
      const { data, error: verifyError } = await supabase.functions.invoke('verify-purchase', {
        body: { session_id: sessionId },
      });

      if (verifyError) {
        throw new Error(verifyError.message);
      }

      if (data.error) {
        // If webhook hasn't fired yet, retry up to 3 times with backoff
        if (data.error.includes('not found') && retryCount < 3) {
          setDiagnostics(prev => ({ ...prev, retryCount: retryCount + 1 }));
          await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
          return verifyPurchase(retryCount + 1);
        }
        throw new Error(data.error);
      }

      // Check webhook receipt status
      await checkWebhookReceipt();

      setDiagnostics(prev => ({
        ...prev,
        sessionVerified: true,
        purchaseFound: true,
        purchaseStatus: 'paid',
      }));

      setPurchase(data);
      setError(null);
      
      // Automatically fetch download links
      await fetchDownloads(data.item_type, data.item_id);
    } catch (err) {
      console.error('Verify purchase error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to verify purchase';
      setError(errorMessage);
      setDiagnostics(prev => ({
        ...prev,
        sessionVerified: false,
        error: errorMessage,
      }));
    } finally {
      setLoading(false);
    }
  };

  const fetchDownloads = async (itemType: string, itemId: string) => {
    setDownloadLoading(true);
    setNoFilesMessage(null);
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
      
      // Check if no files are available yet
      if (!data.files_available && data.message) {
        setNoFilesMessage(data.message);
      }
      
      setDiagnostics(prev => ({
        ...prev,
        downloadsGenerated: (data.downloads?.length || 0) > 0,
        downloadCount: prev.downloadCount + 1,
      }));
      
      if (data.downloads?.length > 0) {
        toast.success('Download links ready');
      }
    } catch (err) {
      console.error('Fetch downloads error:', err);
      toast.error('Failed to generate download links');
      setDiagnostics(prev => ({
        ...prev,
        downloadsGenerated: false,
      }));
    } finally {
      setDownloadLoading(false);
    }
  };

  const handleRefreshDownloads = () => {
    if (purchase) {
      fetchDownloads(purchase.item_type, purchase.item_id);
    }
  };

  const handleCopySessionId = () => {
    if (sessionId) {
      navigator.clipboard.writeText(sessionId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatPrice = (cents: number) => `$${(cents / 100).toFixed(2)}`;
  
  const maskSessionId = (id: string | null) => {
    if (!id) return 'N/A';
    if (id.length <= 8) return id;
    return `${id.slice(0, 4)}...${id.slice(-4)}`;
  };

  // Not logged in state
  if (!authLoading && !user) {
    const returnUrl = `/purchase-success?session_id=${sessionId}`;
    return (
      <div className="min-h-screen bg-background">
        <LibraryNavbar />
        <div className="section-padding">
          <div className="container-main max-w-2xl text-center">
            <div className="card-enterprise p-10">
              <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-6" />
              <h1 className="text-2xl font-semibold text-foreground mb-4">
                Sign In Required
              </h1>
              <p className="text-muted-foreground mb-6">
                Please sign in to access your purchase and download your files.
              </p>
              <Button asChild>
                <Link to={`/auth?redirect=${encodeURIComponent(returnUrl)}`}>
                  Sign In to Continue
                </Link>
              </Button>
            </div>
          </div>
        </div>
        <LibraryFooter />
      </div>
    );
  }

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
          <div className="container-main max-w-2xl">
            <div className="card-enterprise p-10 text-center mb-6">
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

            {/* Diagnostics Panel */}
            <Collapsible open={diagnosticsOpen} onOpenChange={setDiagnosticsOpen}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between text-muted-foreground">
                  Technical Details
                  {diagnosticsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="mt-4 p-4 bg-muted/50 rounded-lg font-mono text-xs space-y-2">
                  <div className="flex justify-between">
                    <span>Session ID:</span>
                    <div className="flex items-center gap-2">
                      <span>{maskSessionId(diagnostics.sessionId)}</span>
                      {diagnostics.sessionId && (
                        <button onClick={handleCopySessionId} className="text-primary hover:text-primary/80">
                          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span>Session Verified:</span>
                    <span className={diagnostics.sessionVerified ? 'text-green-500' : 'text-red-500'}>
                      {diagnostics.sessionVerified ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Purchase Found:</span>
                    <span className={diagnostics.purchaseFound ? 'text-green-500' : 'text-red-500'}>
                      {diagnostics.purchaseFound ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Purchase Status:</span>
                    <span>{diagnostics.purchaseStatus}</span>
                  </div>
                  {diagnostics.error && (
                    <div className="pt-2 border-t border-border">
                      <span className="text-red-500">Error: {diagnostics.error}</span>
                    </div>
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>
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
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <Download className="w-5 h-5" />
                  Your Downloads
                </h3>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleRefreshDownloads}
                  disabled={downloadLoading}
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${downloadLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>

              {downloadLoading && downloads.length === 0 ? (
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
                    Download links expire in 1 hour. Click "Refresh" to generate new links.
                  </p>
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground mb-4">
                    {noFilesMessage || 'Files are being prepared. They will be available shortly.'}
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={handleRefreshDownloads}
                    disabled={downloadLoading}
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${downloadLoading ? 'animate-spin' : ''}`} />
                    Refresh Downloads
                  </Button>
                </div>
              )}
            </div>

            {/* Debug Diagnostics Panel - shows in debug mode or dev */}
            {debugMode && (
              <Collapsible open={diagnosticsOpen} onOpenChange={setDiagnosticsOpen} className="mb-8">
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full justify-between text-muted-foreground">
                    <span className="flex items-center gap-2">
                      <Bug className="w-4 h-4" />
                      Debug Diagnostics
                    </span>
                    {diagnosticsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="mt-4 p-4 bg-muted/50 rounded-lg font-mono text-xs space-y-2 border border-primary/20">
                    <div className="text-primary text-[10px] uppercase tracking-wide mb-3">Purchase Flow Diagnostics</div>
                    
                    <div className="flex justify-between">
                      <span>Session ID:</span>
                      <div className="flex items-center gap-2">
                        <span className="text-foreground">{diagnostics.sessionId || 'N/A'}</span>
                        {diagnostics.sessionId && (
                          <button onClick={handleCopySessionId} className="text-primary hover:text-primary/80">
                            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex justify-between">
                      <span>Session Verified:</span>
                      <span className={diagnostics.sessionVerified ? 'text-green-500' : 'text-red-500'}>
                        {diagnostics.sessionVerified ? 'Yes' : 'No'}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span>Webhook Received:</span>
                      <span className={diagnostics.webhookReceived ? 'text-green-500' : 'text-yellow-500'}>
                        {diagnostics.webhookReceived ? 'Yes' : 'Pending/Unknown'}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span>Purchase Found:</span>
                      <span className={diagnostics.purchaseFound ? 'text-green-500' : 'text-red-500'}>
                        {diagnostics.purchaseFound ? 'Yes' : 'No'}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span>Purchase Status:</span>
                      <span className={diagnostics.purchaseStatus === 'paid' ? 'text-green-500' : 'text-yellow-500'}>
                        {diagnostics.purchaseStatus}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span>Downloads Available:</span>
                      <span className={diagnostics.downloadsGenerated ? 'text-green-500' : 'text-yellow-500'}>
                        {diagnostics.downloadsGenerated ? `Yes (${downloads.length} files)` : 'No files yet'}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span>Retry Count:</span>
                      <span>{diagnostics.retryCount}</span>
                    </div>
                    
                    {diagnostics.lastPurchase && (
                      <div className="pt-2 mt-2 border-t border-border">
                        <div className="text-primary text-[10px] uppercase tracking-wide mb-2">Last Purchase Record</div>
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span>ID:</span>
                            <span className="text-foreground truncate max-w-[200px]">{diagnostics.lastPurchase.id}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Type:</span>
                            <span className="text-foreground">{diagnostics.lastPurchase.item_type}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Item ID:</span>
                            <span className="text-foreground truncate max-w-[200px]">{diagnostics.lastPurchase.item_id}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Created:</span>
                            <span className="text-foreground">{diagnostics.lastPurchase.created_at}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Status:</span>
                            <span className={diagnostics.lastPurchase.status === 'paid' ? 'text-green-500' : 'text-yellow-500'}>
                              {diagnostics.lastPurchase.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {diagnostics.error && (
                      <div className="pt-2 mt-2 border-t border-destructive/30">
                        <span className="text-red-500">Error: {diagnostics.error}</span>
                      </div>
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )}

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
