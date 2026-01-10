import { Link } from 'react-router-dom';
import { ArrowRight, Check, Download, Shield, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LibraryNavbar from '@/components/library/LibraryNavbar';
import LibraryFooter from '@/components/library/LibraryFooter';
import AgentCard from '@/components/library/AgentCard';
import BundleCard from '@/components/library/BundleCard';
import IntegrationIcons from '@/components/library/IntegrationIcons';
import EmailCaptureForm from '@/components/library/EmailCaptureForm';
import { useAgents } from '@/hooks/useAgents';
import { useBundles } from '@/hooks/useBundles';
import { SEO } from '@/components/SEO';
import { format } from 'date-fns';

const LibraryHome = () => {
  const { agents: featuredAgents, loading: agentsLoading } = useAgents({ featured: true, limit: 6 });
  const { bundles: featuredBundles, loading: bundlesLoading } = useBundles({ featured: true, limit: 3 });
  const { agents: recentAgents } = useAgents({ limit: 3 });

  const deploymentSteps = [
    { step: 1, title: 'Select a pre-engineered automation agent' },
    { step: 2, title: 'Download and connect approved systems' },
    { step: 3, title: 'Automation executes within your environment' },
  ];

  const dataOwnershipPoints = [
    'Customer-controlled execution',
    'No centralized data ingestion',
    'No forced subscriptions',
    'Full workflow transparency',
  ];

  return (
    <>
      <SEO
        title="Operational Automation Library"
        description="Deploy proven automation workflows to reduce manual load, increase reliability, and restore operator capacity. Pre-engineered for healthcare, construction, logistics, and professional services."
        keywords={['automation', 'n8n workflows', 'operational automation', 'business automation', 'workflow automation']}
      />
      
      <div className="min-h-screen bg-background">
        <LibraryNavbar />

        {/* Hero Section */}
        <section className="section-padding !pt-20 !pb-16">
          <div className="container-main text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-semibold text-foreground tracking-tight mb-6">
              Operational Automation, Pre-Engineered
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              Deploy proven automation workflows to reduce manual load, increase reliability, and restore operator capacity.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Button asChild size="lg">
                <Link to="/agents">
                  Browse Automation Agents
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/bundles">View System Bundles</Link>
              </Button>
            </div>

            {/* Credibility Line */}
            <p className="text-sm text-muted-foreground mb-6">
              Designed for operators across healthcare, construction, logistics, professional services, and regulated environments.
            </p>
            <IntegrationIcons />
          </div>
        </section>

        {/* Featured Agents Section */}
        <section className="section-padding bg-muted/30">
          <div className="container-main">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-semibold text-foreground mb-3">
                Featured Automation Agents
              </h2>
              <p className="text-muted-foreground">
                Modular workflows engineered to eliminate repeatable operational tasks.
              </p>
            </div>

            {agentsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="card-enterprise p-6 h-64 animate-pulse bg-muted" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredAgents.map((agent) => (
                  <AgentCard
                    key={agent.id}
                    slug={agent.slug}
                    name={agent.name}
                    shortOutcome={agent.short_outcome}
                    sectors={agent.sectors}
                    systems={agent.systems}
                    setupTimeMin={agent.setup_time_min}
                    setupTimeMax={agent.setup_time_max}
                    capacityRecoveredMin={agent.capacity_recovered_min}
                    capacityRecoveredMax={agent.capacity_recovered_max}
                    priceCents={agent.price_cents}
                  />
                ))}
              </div>
            )}

            <div className="text-center mt-10">
              <Button asChild variant="outline">
                <Link to="/agents">
                  View Full Agent Library
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Deployment Overview Strip */}
        <section className="section-padding">
          <div className="container-main">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-semibold text-foreground mb-3">
                How Deployment Works
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              {deploymentSteps.map((step) => (
                <div key={step.step} className="text-center">
                  <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-4 font-semibold">
                    {step.step}
                  </div>
                  <p className="text-foreground">{step.title}</p>
                </div>
              ))}
            </div>

            <p className="text-center text-sm text-muted-foreground">
              No centralized execution. No black-box logic.
            </p>
          </div>
        </section>

        {/* System Bundles Section */}
        <section className="section-padding bg-muted/30">
          <div className="container-main">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-semibold text-foreground mb-3">
                Automation System Bundles
              </h2>
              <p className="text-muted-foreground">
                Curated sets of automation agents designed to address common operational bottlenecks.
              </p>
            </div>

            {bundlesLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="card-enterprise p-6 h-72 animate-pulse bg-muted" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {featuredBundles.map((bundle) => (
                  <BundleCard
                    key={bundle.id}
                    slug={bundle.slug}
                    name={bundle.name}
                    objective={bundle.objective}
                    includedAgentNames={bundle.included_agents.map(a => a.name)}
                    sectors={bundle.sectors}
                    individualValueCents={bundle.individual_value_cents}
                    bundlePriceCents={bundle.bundle_price_cents}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Ongoing Additions Section */}
        <section className="section-padding">
          <div className="container-main">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-semibold text-foreground mb-3">
                Ongoing Additions
              </h2>
              <p className="text-muted-foreground">
                New automation agents are released regularly to address emerging operational needs.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              {recentAgents.map((agent) => (
                <div key={agent.id} className="card-enterprise p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <RefreshCw className="w-4 h-4 text-primary" />
                    <span className="text-xs text-muted-foreground">
                      Published {agent.published_at ? format(new Date(agent.published_at), 'MMM d, yyyy') : 'Recently'}
                    </span>
                  </div>
                  <h3 className="font-medium text-foreground mb-2">{agent.name}</h3>
                  <p className="text-sm text-muted-foreground">{agent.short_outcome}</p>
                </div>
              ))}
            </div>

            <div className="text-center">
              <h3 className="font-medium text-foreground mb-4">Receive Update Notifications</h3>
              <div className="flex justify-center">
                <EmailCaptureForm 
                  sourcePage="homepage-ongoing-additions" 
                  buttonText="Subscribe"
                  placeholder="Enter your email"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Data Ownership Section */}
        <section className="section-padding bg-muted/30">
          <div className="container-main max-w-3xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <Shield className="w-12 h-12 text-primary" />
            </div>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              Data Ownership & Execution Control
            </h2>
            <p className="text-muted-foreground mb-8">
              All automation agents execute entirely within the customer's own automation environment. AERELION does not store, process, or retain operational data.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left max-w-md mx-auto">
              {dataOwnershipPoints.map((point) => (
                <div key={point} className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="text-sm text-foreground">{point}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="section-padding">
          <div className="container-main text-center max-w-2xl mx-auto">
            <h2 className="text-2xl font-semibold text-foreground mb-6">
              Reduce manual operations without increasing complexity.
            </h2>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild size="lg">
                <Link to="/agents">
                  Browse Automation Agents
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/bundles">View System Bundles</Link>
              </Button>
            </div>
          </div>
        </section>

        <LibraryFooter />
      </div>
    </>
  );
};

export default LibraryHome;
