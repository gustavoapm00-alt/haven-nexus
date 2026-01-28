import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LibraryNavbar from '@/components/library/LibraryNavbar';
import LibraryFooter from '@/components/library/LibraryFooter';
import { useBundle } from '@/hooks/useBundles';
import SEO from '@/components/SEO';

const BundleDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { bundle, loading, error } = useBundle(slug || '');

  const engagementSteps = [
    'Schedule a discovery call to discuss your operations',
    'We scope the engagement based on your workflows and tools',
    'AERELION configures, operates, and maintains everything on your behalf',
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
            <h1 className="text-2xl font-semibold text-foreground mb-4">System Not Found</h1>
            <p className="text-muted-foreground mb-6">
              The system you're looking for doesn't exist or has been removed.
            </p>
            <Button asChild>
              <Link to="/automations">Browse Example Workflows</Link>
            </Button>
          </div>
        </div>
        <LibraryFooter />
      </div>
    );
  }

  return (
    <>
      <SEO
        title={`${bundle.name} - Managed System | AERELION Systems`}
        description={bundle.objective}
        keywords={[...bundle.sectors, 'managed automation', 'hosted automation', 'automation operator'].join(', ')}
      />

      <div className="min-h-screen bg-background">
        <LibraryNavbar />

        <section className="section-padding !pt-8">
          <div className="container-main max-w-4xl">
            {/* Back Link */}
            <Link
              to="/automations"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Automation Catalog
            </Link>

            {/* Header */}
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-primary/10 rounded-md">
                  <Package className="w-6 h-6 text-primary" />
                </div>
                <span className="text-xs font-semibold text-primary uppercase tracking-wide">
                  Managed System
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
                {/* What This System Delivers */}
                <section>
                  <h2 className="text-lg font-semibold text-foreground mb-4">
                    What This System Delivers
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    {bundle.description}
                  </p>
                </section>

                {/* Included Automations */}
                <section>
                  <h2 className="text-lg font-semibold text-foreground mb-4">
                    Automations in This System
                  </h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    These automations are configured and operated together by AERELION as a unified system.
                  </p>
                  <div className="space-y-3">
                    {bundle.included_agents.map((agent) => (
                      <Link
                        key={agent.id}
                        to={`/automations/${agent.slug}`}
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

                {/* Common Use Cases */}
                <section>
                  <h2 className="text-lg font-semibold text-foreground mb-4">
                    Common Use Cases
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {bundle.sectors.map((sector) => (
                      <span key={sector} className="tag-sector">
                        {sector}
                      </span>
                    ))}
                  </div>
                </section>

                {/* How Engagement Works */}
                <section>
                  <h2 className="text-lg font-semibold text-foreground mb-4">
                    How We Deliver This System
                  </h2>
                  <ol className="space-y-3">
                    {engagementSteps.map((step, index) => (
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
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Have This System Operated for You
                  </h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    This system is delivered as part of a managed engagement. 
                    AERELION configures, hosts, and operates everything on your behalf.
                  </p>

                  <Button 
                    asChild
                    className="w-full mb-3" 
                    size="lg"
                  >
                    <Link to="/contact">
                      Schedule Discovery Call
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>

                  <p className="text-center text-xs text-muted-foreground">
                    No technical experience required
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
