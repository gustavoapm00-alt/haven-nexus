import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock, TrendingUp, Check, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import LibraryNavbar from '@/components/library/LibraryNavbar';
import LibraryFooter from '@/components/library/LibraryFooter';
import SystemIcon from '@/components/library/SystemIcon';
import { useAgent } from '@/hooks/useAgents';
import SEO from '@/components/SEO';

const AgentDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { agent, loading, error } = useAgent(slug || '');

  const faqs = [
    {
      question: 'Is this something I install myself?',
      answer: 'No. AERELION installs, configures, and maintains all workflows as part of a scoped engagement. You provide tool access—we handle the technical work.',
    },
    {
      question: 'How does pricing work?',
      answer: 'Pricing is scoped per engagement, not per workflow. This example is included as part of an AI Ops Installation. Book a call to get a quote.',
    },
    {
      question: 'Who runs and maintains this workflow?',
      answer: 'AERELION operates and monitors all installed workflows. If something breaks, we fix it.',
    },
    {
      question: 'How are my credentials handled?',
      answer: 'Credentials are encrypted and securely stored. You retain full control and can revoke access at any time.',
    },
    {
      question: 'Do I need technical experience?',
      answer: 'No. These workflows are installed and maintained by our team. No code or technical knowledge required.',
    },
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

  if (error || !agent) {
    return (
      <div className="min-h-screen bg-background">
        <LibraryNavbar />
        <div className="section-padding">
          <div className="container-main max-w-4xl text-center">
            <h1 className="text-2xl font-semibold text-foreground mb-4">Workflow Not Found</h1>
            <p className="text-muted-foreground mb-6">
              The workflow you're looking for doesn't exist or has been removed.
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
        title={`${agent.name} - Example Workflow`}
        description={agent.short_outcome}
        keywords={[...agent.sectors, ...agent.systems, 'AI operations', 'workflow integration'].join(', ')}
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
              Back to Example Workflows
            </Link>

            {/* Header */}
            <div className="mb-10">
              <span className="text-xs font-semibold text-primary uppercase tracking-wide mb-2 block">
                Example Workflow We Install
              </span>
              <h1 className="text-3xl font-semibold text-foreground mb-3">
                {agent.name}
              </h1>
              <p className="text-lg text-muted-foreground">
                {agent.short_outcome}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-10">
                {/* What This Workflow Solves */}
                <section>
                  <h2 className="text-lg font-semibold text-foreground mb-4">
                    What This Workflow Solves
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    {agent.description}
                  </p>
                </section>

                {/* Common Use Cases */}
                <section>
                  <h2 className="text-lg font-semibold text-foreground mb-4">
                    Common Use Cases
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {agent.sectors.map((sector) => (
                      <span key={sector} className="tag-sector">
                        {sector}
                      </span>
                    ))}
                  </div>
                </section>

                {/* Tools Commonly Used */}
                <section>
                  <h2 className="text-lg font-semibold text-foreground mb-4">
                    Tools Commonly Used
                  </h2>
                  <p className="text-sm text-muted-foreground mb-3">
                    Actual tools vary based on your existing stack and requirements.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {agent.systems.map((system) => (
                      <SystemIcon key={system} name={system} size="md" />
                    ))}
                  </div>
                </section>

                {/* Typical Engagement Profile */}
                <section>
                  <h2 className="text-lg font-semibold text-foreground mb-4">
                    Typical Engagement Profile
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="card-enterprise p-4">
                      <div className="flex items-center gap-2 text-muted-foreground mb-2">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">Installation Time</span>
                      </div>
                      <p className="font-semibold text-foreground">
                        {agent.setup_time_min}–{agent.setup_time_max} hours typical
                      </p>
                    </div>
                    <div className="card-enterprise p-4">
                      <div className="flex items-center gap-2 text-muted-foreground mb-2">
                        <TrendingUp className="w-4 h-4" />
                        <span className="text-sm">Capacity Recovered</span>
                      </div>
                      <p className="font-semibold text-foreground">
                        {agent.capacity_recovered_min}–{agent.capacity_recovered_max} hrs/week
                      </p>
                    </div>
                  </div>
                </section>

                {/* How It Works */}
                <section>
                  <h2 className="text-lg font-semibold text-foreground mb-4">
                    How This Workflow Operates
                  </h2>
                  <ol className="space-y-3">
                    {agent.how_it_works.map((step, index) => (
                      <li key={index} className="flex gap-4">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center">
                          {index + 1}
                        </span>
                        <span className="text-muted-foreground">{step}</span>
                      </li>
                    ))}
                  </ol>
                </section>

                {/* What's Delivered */}
                <section>
                  <h2 className="text-lg font-semibold text-foreground mb-4">
                    What's Delivered
                  </h2>
                  <ul className="space-y-2">
                    {agent.includes.map((item, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                </section>

                {/* Prerequisites */}
                <section>
                  <h2 className="text-lg font-semibold text-foreground mb-4">
                    What We'll Need From You
                  </h2>
                  <ul className="space-y-2">
                    {agent.requirements.map((req, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground flex-shrink-0 mt-2" />
                        <span className="text-muted-foreground">{req}</span>
                      </li>
                    ))}
                  </ul>
                </section>

                {/* Important Notes */}
                {agent.important_notes.length > 0 && (
                  <section>
                    <h2 className="text-lg font-semibold text-foreground mb-4">
                      Important Notes
                    </h2>
                    <ul className="space-y-2">
                      {agent.important_notes.map((note, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground flex-shrink-0 mt-2" />
                          <span className="text-muted-foreground">{note}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                {/* FAQ */}
                <section>
                  <h2 className="text-lg font-semibold text-foreground mb-4">
                    Frequently Asked Questions
                  </h2>
                  <Accordion type="single" collapsible className="w-full">
                    {faqs.map((faq, index) => (
                      <AccordionItem key={index} value={`faq-${index}`}>
                        <AccordionTrigger className="text-left">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </section>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1">
                <div className="card-enterprise p-6 sticky top-24">
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    How This Fits Your Operations
                  </h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    This workflow is installed as part of a scoped AI Ops engagement. Pricing and scope are customized based on your operational needs.
                  </p>

                  <Button 
                    asChild
                    className="w-full mb-3" 
                    size="lg"
                  >
                    <Link to="/contact">
                      Book an AI Ops Installation
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

export default AgentDetail;
