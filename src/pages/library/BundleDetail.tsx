import { useParams, Link, useSearchParams } from 'react-router-dom';
import { useEffect } from 'react';
import { ArrowLeft, ArrowRight, Zap, Package, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LibraryNavbar from '@/components/library/LibraryNavbar';
import LibraryFooter from '@/components/library/LibraryFooter';
import { useBundle } from '@/hooks/useBundles';
import { usePurchase } from '@/hooks/usePurchase';
import { useAuth } from '@/hooks/useAuth';
import SEO from '@/components/SEO';
import { toast } from 'sonner';

const BundleDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const { bundle, loading, error } = useBundle(slug || '');
  const { initiateCheckout, loading: checkoutLoading, isAuthenticated } = usePurchase();
  const { isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (searchParams.get('canceled') === 'true') {
      toast.info('Purchase canceled', { description: 'You can complete your purchase anytime.' });
    }
  }, [searchParams]);

  const formatPrice = (cents: number) => `$${(cents / 100).toFixed(0)}`;

  const activationSteps = [
    'Purchase the bundle to unlock all included automations',
    'Connect your tools securely through our guided process',
    'We activate and maintain each automation for you',
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <LibraryNavbar />
        <div className="section-padding">
          <div className="container-main max-w-4xl">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-muted rounded w-3/4" />
              <div className="h-4 bg-muted rounded w-1/2" />
              <div className="h-32 bg-muted rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !bundle) {
    return (
      <div className="min-h-screen bg-background">
        <LibraryNavbar />
        <div className="section-padding">
          <div className="container-main max-w-4xl text-center">
            <h1 className="text-2xl font-semibold text-foreground mb-4">Bundle Not Found</h1>
            <p className="text-muted-foreground mb-6">
              The bundle you're looking for doesn't exist or has been removed.
            </p>
            <Button asChild>
              <Link to="/bundles">Browse All Bundles</Link>
            </Button>
          </div>
        </div>
        <LibraryFooter />
      </div>
    );
  }

  const savingsPercent = Math.round(
    ((bundle.individual_value_cents - bundle.bundle_price_cents) / bundle.individual_value_cents) * 100
  );

  return (
    <>
      <SEO
        title={bundle.name}
        description={bundle.objective}
        keywords={[...bundle.sectors, 'automation bundle', 'hosted automation', 'managed systems'].join(', ')}
      />

      <div className="min-h-screen bg-background">
        <LibraryNavbar />

        <section className="section-padding !pt-8">
          <div className="container-main max-w-4xl">
            {/* Back Link */}
            <Link
              to="/bundles"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Bundles
            </Link>

            {/* Header */}
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-primary/10 rounded-md">
                  <Package className="w-6 h-6 text-primary" />
                </div>
                <span className="text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded">
                  Save {savingsPercent}%
                </span>
              </div>
              <h1 className="text-3xl font-semibold text-foreground mb-3">
                {bundle.name}
              </h1>
              <p className="text-lg text-muted-foreground">
                {bundle.objective}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-10">
                {/* What This Bundle Stabilizes */}
                <section>
                  <h2 className="text-lg font-semibold text-foreground mb-4">
                    What This Bundle Stabilizes
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    {bundle.description}
                  </p>
                </section>

                {/* Included Automations */}
                <section>
                  <h2 className="text-lg font-semibold text-foreground mb-4">
                    Included Hosted Automations
                  </h2>
                  <div className="space-y-3">
                    {bundle.included_agents.map((agent) => (
                      <Link
                        key={agent.id}
                        to={`/packs/${agent.slug}`}
                        className="block card-enterprise p-4 hover:border-primary/30"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium text-foreground mb-1">
                              {agent.name}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {agent.short_outcome}
                            </p>
                          </div>
                          <ArrowRight className="w-4 h-4 text-muted-foreground" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>

                {/* Best For */}
                <section>
                  <h2 className="text-lg font-semibold text-foreground mb-4">
                    Best For
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {bundle.sectors.map((sector) => (
                      <span key={sector} className="tag-sector">
                        {sector}
                      </span>
                    ))}
                  </div>
                </section>

                {/* How Activation Works */}
                <section>
                  <h2 className="text-lg font-semibold text-foreground mb-4">
                    How Activation Works
                  </h2>
                  <ol className="space-y-3">
                    {activationSteps.map((step, index) => (
                      <li key={index} className="flex gap-4">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center">
                          {index + 1}
                        </span>
                        <span className="text-muted-foreground">{step}</span>
                      </li>
                    ))}
                  </ol>
                </section>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1">
                <div className="card-enterprise p-6 sticky top-24">
                  <h3 className="text-lg font-semibold text-foreground mb-4">
                    Pricing
                  </h3>
                  
                  <div className="mb-4">
                    <p className="text-sm text-muted-foreground mb-1">Individual value</p>
                    <p className="text-lg text-muted-foreground line-through">
                      {formatPrice(bundle.individual_value_cents)}
                    </p>
                  </div>

                  <div className="mb-6">
                    <p className="text-sm text-muted-foreground mb-1">Bundle rate</p>
                    <p className="text-3xl font-semibold text-foreground">
                      {formatPrice(bundle.bundle_price_cents)}
                    </p>
                  </div>

                  <Button 
                    className="w-full mb-3" 
                    size="lg"
                    onClick={() => initiateCheckout('bundle', bundle.id)}
                    disabled={checkoutLoading || authLoading}
                  >
                    {checkoutLoading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Zap className="w-4 h-4 mr-2" />
                    )}
                    {!isAuthenticated ? 'Sign In to Activate' : 'Activate Bundle'}
                  </Button>

                  <p className="text-center text-sm text-muted-foreground">
                    We configure and maintain everything for you
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <LibraryFooter />
      </div>
    </>
  );
};

export default BundleDetail;
