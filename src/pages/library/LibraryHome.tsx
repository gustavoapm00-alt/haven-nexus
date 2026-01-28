import { Link } from 'react-router-dom';
import { ArrowRight, Shield, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import LibraryNavbar from '@/components/library/LibraryNavbar';
import LibraryFooter from '@/components/library/LibraryFooter';
import LibraryHero from '@/components/library/LibraryHero';
import SectionBand from '@/components/library/SectionBand';
import WhatYouGet from '@/components/library/WhatYouGet';
import HowItWorks from '@/components/library/HowItWorks';
import WorkflowExampleCard from '@/components/library/WorkflowExampleCard';
import EmailCaptureForm from '@/components/library/EmailCaptureForm';
import { useAgents } from '@/hooks/useAgents';
import SEO from '@/components/SEO';
import { motion } from 'framer-motion';

const LibraryHome = () => {
  const { agents: featuredAgents, loading: agentsLoading } = useAgents({ featured: true, limit: 6 });

  const faqItems = [
    { q: 'Do I need technical experience?', a: 'No. AERELION handles all technical configuration, installation, and maintenance. You provide access to your tools—we do the rest.' },
    { q: 'How does pricing work?', a: 'Pricing is scoped per engagement, not per automation. We assess your operations and provide a fixed quote for the work involved.' },
    { q: 'Who runs and maintains the workflows?', a: 'AERELION operates and monitors all installed workflows. If something breaks, we fix it.' },
    { q: 'How are my credentials handled?', a: 'Credentials are encrypted and securely stored. You retain full control and can revoke access at any time.' },
    { q: 'What happens after installation?', a: 'We provide ongoing maintenance and monitoring. You have direct access to our team for support and optimization.' },
  ];

  return (
    <>
      <SEO
        title="AERELION - AI Operations Integration"
        description="We install, configure, and maintain your operational workflows. An AI operations integration firm that takes responsibility for outcomes."
        keywords="AI operations, workflow integration, automation installation, managed automation, operational systems"
      />
      
      <div className="min-h-screen bg-background">
        <LibraryNavbar />

        {/* Hero */}
        <LibraryHero />

        {/* What You Get */}
        <SectionBand variant="light">
          <WhatYouGet />
        </SectionBand>

        {/* Example Workflows - Dark Band */}
        <SectionBand variant="ink" id="example-workflows" enableParallax>
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
              Example Workflows
            </motion.span>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">Workflows We Install</h2>
            <p className="text-white/60 max-w-xl mx-auto">
              These are examples of operational workflows we configure as part of a scoped engagement.
            </p>
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
                  <WorkflowExampleCard
                    slug={agent.slug}
                    name={agent.name}
                    shortOutcome={agent.short_outcome}
                    sectors={agent.sectors}
                    systems={agent.systems}
                    setupTimeMin={agent.setup_time_min}
                    setupTimeMax={agent.setup_time_max}
                    capacityRecoveredMin={agent.capacity_recovered_min}
                    capacityRecoveredMax={agent.capacity_recovered_max}
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
              <Link to="/automations">
                See All Example Workflows
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </motion.div>
        </SectionBand>

        {/* How It Works */}
        <SectionBand variant="muted">
          <HowItWorks />
        </SectionBand>

        {/* Who It's For */}
        <SectionBand variant="light">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-foreground mb-4">Who We Work With</h2>
            <p className="text-muted-foreground text-lg mb-8">
              Operators, founders, and teams who want reliable automation systems without the technical overhead. We work with businesses that value outcomes over tooling.
            </p>
            <Button asChild size="lg">
              <Link to="/contact">
                Book an AI Ops Installation
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </div>
        </SectionBand>

        {/* Trust Section */}
        <SectionBand variant="muted">
          <div className="max-w-3xl mx-auto text-center">
            <div className="relative w-14 h-14 mx-auto mb-6">
              <div className="absolute inset-0 border border-primary/10 rounded-full" />
              <div className="absolute -inset-2 border border-dashed border-primary/5 rounded-full" />
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                <Shield className="w-6 h-6 text-primary" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-4">We Take Responsibility</h2>
            <p className="text-muted-foreground mb-6">
              AERELION operates and monitors every workflow we install. If something needs attention, we handle it—you stay focused on your business.
            </p>
          </div>
        </SectionBand>

        {/* FAQ Section */}
        <SectionBand variant="light">
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

        {/* CTA Section */}
        <SectionBand variant="muted">
          <div className="text-center max-w-xl mx-auto">
            <h2 className="text-2xl font-bold text-foreground mb-4">Ready to get started?</h2>
            <p className="text-muted-foreground mb-6">
              Book a discovery call and we'll assess your operations to identify high-impact workflows.
            </p>
            <Button asChild size="lg" className="glow-accent">
              <Link to="/contact">
                Book an AI Ops Installation
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </div>
        </SectionBand>

        {/* Email Capture */}
        <SectionBand variant="light">
          <div className="text-center max-w-xl mx-auto">
            <h2 className="text-xl font-bold text-foreground mb-4">Get Updates</h2>
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
