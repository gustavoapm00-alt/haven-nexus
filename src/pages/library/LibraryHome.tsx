import { Link } from 'react-router-dom';
import { ArrowRight, Check, Download, Shield, FileJson, BookOpen, Lock, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LibraryNavbar from '@/components/library/LibraryNavbar';
import LibraryFooter from '@/components/library/LibraryFooter';
import AgentCard from '@/components/library/AgentCard';
import BundleCard from '@/components/library/BundleCard';
import IntegrationIcons from '@/components/library/IntegrationIcons';
import EmailCaptureForm from '@/components/library/EmailCaptureForm';
import { useAgents } from '@/hooks/useAgents';
import { useBundles } from '@/hooks/useBundles';
import SEO from '@/components/SEO';

const LibraryHome = () => {
  const { agents: featuredAgents, loading: agentsLoading } = useAgents({ featured: true, limit: 6 });
  const { bundles: featuredBundles, loading: bundlesLoading } = useBundles({ featured: true, limit: 3 });

  const whatYouGet = [
    { icon: FileJson, title: 'Workflow File', description: 'Import-ready n8n JSON workflows built for practical use.' },
    { icon: BookOpen, title: 'Deployment Guide', description: 'Step-by-step setup with required credentials and configuration notes.' },
    { icon: Lock, title: 'Secure Delivery', description: 'Private downloads with time-limited links and account access.' },
  ];

  const howItWorks = [
    { step: 1, title: 'Choose an agent or bundle' },
    { step: 2, title: 'Purchase access' },
    { step: 3, title: 'Download workflow + guide' },
    { step: 4, title: 'Deploy and configure' },
  ];

  const faqItems = [
    { q: 'What tools are supported?', a: 'Designed for n8n and common tools; each guide lists requirements.' },
    { q: 'What technical level is required?', a: 'Checklist-style deployment with basic API key setup.' },
    { q: 'How do downloads work?', a: 'Signed links expire; purchases remain available via your account.' },
    { q: 'Is installation help available?', a: 'Available by request.' },
  ];

  return (
    <>
      <SEO
        title="AERELION Library - Automation Workflows"
        description="Automation workflows you can deploy in hours, not weeks. Browse proven n8n workflow packs and system bundles built for real operational outcomes."
        keywords="automation, n8n workflows, operational automation, business automation, workflow automation"
      />
      
      <div className="min-h-screen bg-background">
        <LibraryNavbar />

        {/* Hero Section */}
        <section className="section-padding !pt-20 !pb-16">
          <div className="container-main text-center max-w-3xl mx-auto">
            <p className="text-sm font-medium text-primary mb-4 tracking-wider uppercase">AERELION Library</p>
            <h1 className="text-4xl md:text-5xl font-semibold text-foreground tracking-tight mb-6">
              Automation workflows you can deploy in hours, not weeks.
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              Browse proven n8n workflow packs and system bundles built for real operational outcomes. Purchase, download, and follow a clear deployment guide.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Button asChild size="lg">
                <Link to="/agents">
                  Browse Agents
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/bundles">View Bundles</Link>
              </Button>
            </div>
            <IntegrationIcons />
          </div>
        </section>

        {/* What You Get Section */}
        <section className="section-padding bg-muted/30">
          <div className="container-main">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-semibold text-foreground mb-3">What You Get</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {whatYouGet.map((item) => (
                <div key={item.title} className="text-center">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <item.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-medium text-foreground mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Agents Section */}
        <section className="section-padding">
          <div className="container-main">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-semibold text-foreground mb-3">Featured Automation Agents</h2>
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

        {/* How It Works Section */}
        <section className="section-padding bg-muted/30">
          <div className="container-main">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-semibold text-foreground mb-3">How It Works</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {howItWorks.map((step) => (
                <div key={step.step} className="text-center">
                  <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-4 font-semibold">
                    {step.step}
                  </div>
                  <p className="text-sm text-foreground">{step.title}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* System Bundles Section */}
        <section className="section-padding">
          <div className="container-main">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-semibold text-foreground mb-3">System Bundles</h2>
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

        {/* Who It's For Section */}
        <section className="section-padding bg-muted/30">
          <div className="container-main max-w-3xl mx-auto text-center">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Who It's For</h2>
            <p className="text-muted-foreground">
              Operators, founders, and teams who want repeatable systems for lead intake, sales ops, customer support, ecommerce ops, reporting, KPI visibility, and creator workflows.
            </p>
          </div>
        </section>

        {/* Trust Section */}
        <section className="section-padding">
          <div className="container-main max-w-3xl mx-auto text-center">
            <Shield className="w-10 h-10 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-foreground mb-4">Built for Transparency</h2>
            <p className="text-muted-foreground mb-6">
              Built to be understandable, maintainable, and adjustable. If you need installation support, you can request assistance.
            </p>
            <Button asChild variant="outline">
              <Link to="/install">Request Installation Assistance</Link>
            </Button>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="section-padding bg-muted/30">
          <div className="container-main max-w-2xl mx-auto">
            <div className="text-center mb-10">
              <HelpCircle className="w-8 h-8 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-foreground">Frequently Asked Questions</h2>
            </div>
            <div className="space-y-6">
              {faqItems.map((item, i) => (
                <div key={i} className="card-enterprise p-5">
                  <h3 className="font-medium text-foreground mb-2">{item.q}</h3>
                  <p className="text-sm text-muted-foreground">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Email Capture Section */}
        <section className="section-padding">
          <div className="container-main text-center max-w-xl mx-auto">
            <h2 className="text-xl font-semibold text-foreground mb-4">Get Update Notifications</h2>
            <EmailCaptureForm 
              sourcePage="homepage" 
              buttonText="Subscribe"
              placeholder="Enter your email"
            />
          </div>
        </section>

        <LibraryFooter />
      </div>
    </>
  );
};

export default LibraryHome;
