import { Link } from 'react-router-dom';
import { ArrowRight, Shield, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import LibraryNavbar from '@/components/library/LibraryNavbar';
import LibraryFooter from '@/components/library/LibraryFooter';
import LibraryHero from '@/components/library/LibraryHero';
import SegmentedNav from '@/components/library/SegmentedNav';
import TrustStrip from '@/components/library/TrustStrip';
import SectionBand from '@/components/library/SectionBand';
import WhatYouGet from '@/components/library/WhatYouGet';
import HowItWorks from '@/components/library/HowItWorks';
import AgentCard from '@/components/library/AgentCard';
import BundleCard from '@/components/library/BundleCard';
import EmailCaptureForm from '@/components/library/EmailCaptureForm';
import { useAgents } from '@/hooks/useAgents';
import { useBundles } from '@/hooks/useBundles';
import SEO from '@/components/SEO';
import { motion } from 'framer-motion';

const LibraryHome = () => {
  const { agents: featuredAgents, loading: agentsLoading } = useAgents({ featured: true, limit: 6 });
  const { bundles: featuredBundles, loading: bundlesLoading } = useBundles({ featured: true, limit: 3 });

  const faqItems = [
    { q: 'Do I need to install anything?', a: 'No. AERELION hosts and maintains all automations for you.' },
    { q: 'How does activation work?', a: 'After purchase, you connect your tools and we activate the automation.' },
    { q: 'Who runs the automations?', a: 'AERELION Systems operates and monitors all automations on its infrastructure.' },
    { q: 'How are credentials handled?', a: 'Credentials are encrypted and securely stored. You can revoke access at any time.' },
    { q: 'Is technical experience required?', a: 'No. These systems are built for non-technical operators.' },
  ];

  return (
    <>
      <SEO
        title="AERELION Systems - Hosted Automations"
        description="Automation systems activated for you in hours, not weeks. We configure, run, and maintain everything—no code, no infrastructure."
        keywords="hosted automation, business automation, managed automation, automation service, operational systems"
      />
      
      <div className="min-h-screen bg-background">
        <LibraryNavbar />
        <SegmentedNav />

        {/* Hero */}
        <LibraryHero />

        {/* Trust Strip */}
        <TrustStrip />

        {/* What You Get */}
        <SectionBand variant="light">
          <WhatYouGet />
        </SectionBand>

        {/* Featured Automations - Dark Band with Parallax */}
        <SectionBand variant="ink" id="featured-automations" enableParallax>
          <motion.div 
            className="text-center mb-10"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <motion.span 
              className="inline-block text-xs font-semibold tracking-widest text-primary/80 uppercase mb-3"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              Automation Library
            </motion.span>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">Featured Automations</h2>
            <p className="text-white/60">Hosted systems designed to eliminate repeatable operational work</p>
          </motion.div>
          {agentsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="card-panel-dark p-6 h-64 animate-pulse bg-white/5" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredAgents.map((agent, index) => (
                <motion.div
                  key={agent.id}
                  initial={{ opacity: 0, y: 40, scale: 0.95 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ 
                    delay: index * 0.08,
                    duration: 0.5,
                    ease: [0.25, 0.46, 0.45, 0.94]
                  }}
                  whileHover={{ 
                    y: -4,
                    transition: { duration: 0.2 }
                  }}
                >
                  <AgentCard
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
                    variant="dark"
                  />
                </motion.div>
              ))}
            </div>
          )}
          <motion.div 
            className="text-center mt-10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            <Button asChild size="lg" className="bg-white text-foreground hover:bg-white/90 glow-accent">
              <Link to="/packs">
                View All Automations
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </motion.div>
        </SectionBand>

        {/* How It Works */}
        <SectionBand variant="muted">
          <HowItWorks />
        </SectionBand>

        {/* System Bundles */}
        <SectionBand variant="light" id="bundles-section">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">System Bundles</h2>
            <p className="text-muted-foreground">Fully managed automation systems with bundle savings</p>
          </div>
          {bundlesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="card-panel p-6 h-72 animate-pulse bg-muted" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredBundles.map((bundle, index) => (
                <motion.div
                  key={bundle.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <BundleCard
                    slug={bundle.slug}
                    name={bundle.name}
                    objective={bundle.objective}
                    includedAgentNames={bundle.included_agents.map(a => a.name)}
                    sectors={bundle.sectors}
                    individualValueCents={bundle.individual_value_cents}
                    bundlePriceCents={bundle.bundle_price_cents}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </SectionBand>

        {/* Who It's For */}
        <SectionBand variant="muted">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-foreground mb-4">Who It's For</h2>
            <p className="text-muted-foreground text-lg">
              Operators, founders, and teams who want repeatable systems for lead intake, sales ops, customer support, ecommerce ops, reporting, KPI visibility, and creator workflows.
            </p>
          </div>
        </SectionBand>

        {/* Trust Section */}
        <SectionBand variant="light">
          <div className="max-w-3xl mx-auto text-center">
            <div className="relative w-14 h-14 mx-auto mb-6">
              <div className="absolute inset-0 border border-primary/10 rounded-full" />
              <div className="absolute -inset-2 border border-dashed border-primary/5 rounded-full" />
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                <Shield className="w-6 h-6 text-primary" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-4">Built for Reliability</h2>
            <p className="text-muted-foreground mb-6">
              We monitor and maintain every automation we host. If something needs attention, we handle it—you stay focused on your business.
            </p>
            <Button asChild variant="outline">
              <Link to="/contact">Contact Us</Link>
            </Button>
          </div>
        </SectionBand>

        {/* FAQ Section */}
        <SectionBand variant="muted">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-10">
              <HelpCircle className="w-8 h-8 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-foreground">Frequently Asked Questions</h2>
            </div>
            <Accordion type="single" collapsible className="space-y-3">
              {faqItems.map((item, i) => (
                <AccordionItem key={i} value={`item-${i}`} className="card-panel px-5 border-none">
                  <AccordionTrigger className="text-left font-medium hover:no-underline">
                    {item.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {item.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </SectionBand>

        {/* Email Capture */}
        <SectionBand variant="light">
          <div className="text-center max-w-xl mx-auto">
            <h2 className="text-xl font-bold text-foreground mb-4">Get Update Notifications</h2>
            <EmailCaptureForm 
              sourcePage="homepage" 
              buttonText="Subscribe"
              placeholder="Enter your email"
            />
          </div>
        </SectionBand>

        <LibraryFooter />
      </div>
    </>
  );
};

export default LibraryHome;
