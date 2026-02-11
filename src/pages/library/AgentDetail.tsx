import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Check, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import SystemIcon from '@/components/library/SystemIcon';
import { useAgent } from '@/hooks/useAgents';
import { usePurchase } from '@/hooks/usePurchase';
import SEO, { schemas } from '@/components/SEO';

const AgentDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { agent, loading, error } = useAgent(slug || '');
  const { initiateCheckout, loading: checkoutLoading } = usePurchase();

  const isPublished = agent?.status === 'published';
  const cents = agent?.price_cents ?? 0;
  const priceDisplay = cents > 0 ? `$${(cents / 100).toFixed(2)}` : 'Free';

  const handleActivateNow = () => {
    if (agent) {
      initiateCheckout('agent', agent.id);
    }
  };

  const faqs = [
    {
      question: 'Who operates this protocol?',
      answer: 'AERELION configures, operates, and maintains all protocols on governed infrastructure. Authorization entities receive outcomes, not tasks.',
    },
    {
      question: 'How is scope determined?',
      answer: 'Scope is defined during the initial briefing. Submit an authorization request to initiate parameter assessment.',
    },
    {
      question: 'Who monitors ongoing execution?',
      answer: 'AERELION maintains continuous operational oversight. If intervention is required, it is handled internally without disruption to the authorizing entity.',
    },
    {
      question: 'How are credentials governed?',
      answer: 'Credentials are encrypted at rest and in transit via AES-256-GCM, stored on governed infrastructure. Full revocation control is retained by the authorizing entity.',
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F0F0F]">
        <div className="section-padding">
          <div className="container-main max-w-4xl">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-white/5 w-3/4" />
              <div className="h-4 bg-white/5 w-1/2" />
              <div className="h-32 bg-white/5" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !agent) {
    return (
      <div className="min-h-screen bg-[#0F0F0F]">
        <div className="section-padding">
          <div className="container-main max-w-4xl text-center">
            <h1 className="font-mono text-xl text-[#E0E0E0] mb-4">PROTOCOL_NOT_FOUND</h1>
            <p className="font-mono text-sm text-white/40 mb-6">
              The specified protocol does not exist or has been decommissioned.
            </p>
            <Button asChild variant="outline" className="border-white/10 font-mono text-xs uppercase tracking-wider">
              <Link to="/automations">RETURN_TO_REGISTRY</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const agentStructuredData = [
    schemas.product(agent.name, agent.short_outcome),
    schemas.service(agent.name, agent.description, `/automations/${agent.slug}`),
    schemas.faqPage(faqs),
    schemas.breadcrumb([
      { name: 'Home', url: '/' },
      { name: 'Protocols', url: '/automations' },
      { name: agent.name, url: `/automations/${agent.slug}` }
    ])
  ];

  return (
    <>
      <SEO
        title={`${agent.name} – AERELION Protocol`}
        description={`${agent.short_outcome}. Governed protocol under AERELION infrastructure.`}
        keywords={[...agent.sectors, ...agent.systems, 'managed protocol', 'operational infrastructure', agent.name.toLowerCase()].join(', ')}
        canonicalUrl={`/automations/${agent.slug}`}
        structuredData={agentStructuredData}
      />

      <div className="min-h-screen bg-[#0F0F0F]">
        <section className="section-padding !pt-8">
          <div className="container-main max-w-4xl">
            {/* Back Link */}
            <Link
              to="/automations"
              className="inline-flex items-center gap-2 font-mono text-[10px] text-white/30 hover:text-[#39FF14]/60 uppercase tracking-[0.2em] mb-8 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              RETURN_TO_REGISTRY
            </Link>

            {/* Header */}
            <div className="mb-10">
              <span className="font-mono text-[9px] text-[#39FF14]/50 uppercase tracking-[0.25em] mb-2 block">
                // ACTIVE_PROTOCOL
              </span>
              <h1 className="font-mono text-2xl md:text-3xl font-semibold text-[#E0E0E0] mb-3">
                {agent.name}
              </h1>
              <p className="text-white/40 text-sm leading-relaxed">
                {agent.short_outcome}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-10">
                {/* PROTOCOL SPECIFICATION */}
                <section>
                  <h2 className="font-mono text-xs text-[#E0E0E0] uppercase tracking-[0.2em] mb-4">
                    PROTOCOL SPECIFICATION
                  </h2>
                  <p className="text-white/40 text-sm leading-relaxed">
                    {agent.description}
                  </p>
                </section>

                {/* SECTOR_CLASSIFICATION */}
                <section>
                  <h2 className="font-mono text-xs text-[#E0E0E0] uppercase tracking-[0.2em] mb-4">
                    SECTOR_CLASSIFICATION
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {agent.sectors.map((sector) => (
                      <span key={sector} className="font-mono text-[10px] text-white/40 border border-white/10 px-2 py-1 uppercase tracking-wider">
                        {sector}
                      </span>
                    ))}
                  </div>
                </section>

                {/* SYSTEM_DEPENDENCIES */}
                <section>
                  <h2 className="font-mono text-xs text-[#E0E0E0] uppercase tracking-[0.2em] mb-4">
                    SYSTEM_DEPENDENCIES
                  </h2>
                  <p className="font-mono text-[10px] text-white/20 mb-3 uppercase tracking-wider">
                    Configuration varies by operational stack.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {agent.systems.map((system) => (
                      <SystemIcon key={system} name={system} size="md" />
                    ))}
                  </div>
                </section>

                {/* EXECUTION_SEQUENCE */}
                <section>
                  <h2 className="font-mono text-xs text-[#E0E0E0] uppercase tracking-[0.2em] mb-4">
                    EXECUTION_SEQUENCE
                  </h2>
                  <ol className="space-y-3">
                    {agent.how_it_works.map((step, index) => (
                      <li key={index} className="flex gap-4">
                        <span className="flex-shrink-0 w-6 h-6 border border-[rgba(57,255,20,0.2)] text-[#39FF14]/60 font-mono text-[10px] flex items-center justify-center">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <span className="text-white/40 text-sm">{step}</span>
                      </li>
                    ))}
                  </ol>
                </section>

                {/* PROTOCOL_DELIVERABLES */}
                <section>
                  <h2 className="font-mono text-xs text-[#E0E0E0] uppercase tracking-[0.2em] mb-4">
                    PROTOCOL_DELIVERABLES
                  </h2>
                  <ul className="space-y-2">
                    {agent.includes.map((item, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <Check className="w-3.5 h-3.5 text-[#39FF14]/50 flex-shrink-0 mt-0.5" />
                        <span className="text-white/40 text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                </section>

                {/* AUTHORIZATION_REQUIREMENTS */}
                <section>
                  <h2 className="font-mono text-xs text-[#E0E0E0] uppercase tracking-[0.2em] mb-4">
                    AUTHORIZATION_REQUIREMENTS
                  </h2>
                  <ul className="space-y-2">
                    {agent.requirements.map((req, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="w-1.5 h-1.5 bg-white/20 flex-shrink-0 mt-2" />
                        <span className="text-white/40 text-sm">{req}</span>
                      </li>
                    ))}
                  </ul>
                </section>

                {/* OPERATIONAL_CONSTRAINTS */}
                {agent.important_notes.length > 0 && (
                  <section>
                    <h2 className="font-mono text-xs text-[#E0E0E0] uppercase tracking-[0.2em] mb-4">
                      OPERATIONAL_CONSTRAINTS
                    </h2>
                    <ul className="space-y-2">
                      {agent.important_notes.map((note, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <div className="w-1.5 h-1.5 bg-[#FFBF00]/40 flex-shrink-0 mt-2" />
                          <span className="text-white/40 text-sm">{note}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                {/* OPERATIONAL CLARIFICATIONS */}
                <section>
                  <h2 className="font-mono text-xs text-[#E0E0E0] uppercase tracking-[0.2em] mb-4">
                    OPERATIONAL CLARIFICATIONS
                  </h2>
                  <Accordion type="single" collapsible className="w-full">
                    {faqs.map((faq, index) => (
                      <AccordionItem key={index} value={`faq-${index}`} className="border-white/5">
                        <AccordionTrigger className="text-left font-mono text-xs text-white/50 hover:text-white/70">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-white/30 text-sm">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </section>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1">
                <div className="border border-white/10 bg-[#0F0F0F] p-6 sticky top-24">
                  <h3 className="font-mono text-xs text-[#E0E0E0] uppercase tracking-[0.2em] mb-2">
                    PROTOCOL_AUTHORIZATION
                  </h3>
                  <p className="font-mono text-[10px] text-white/30 mb-4 leading-relaxed">
                    AERELION governs all configuration, hosting, and operational oversight for this protocol.
                  </p>

                  {isPublished ? (
                    <>
                      <div className="text-center mb-4 border border-white/5 py-3">
                        <span className="font-mono text-xl text-[#39FF14]/80">{priceDisplay}</span>
                      </div>
                      <Button 
                        onClick={handleActivateNow}
                        disabled={checkoutLoading}
                        className="w-full mb-3 bg-[#39FF14]/10 text-[#39FF14] border border-[rgba(57,255,20,0.3)] hover:bg-[#39FF14]/20 font-mono text-[10px] uppercase tracking-wider" 
                        size="lg"
                      >
                        {checkoutLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            PROCESSING...
                          </>
                        ) : (
                          <>
                            INITIATE_HANDOFF
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </>
                        )}
                      </Button>
                    </>
                  ) : (
                    <>
                      <p className="font-mono text-[10px] text-white/20 mb-4">
                        Submit authorization request to initiate parameter scoping.
                      </p>
                      <Button 
                        asChild
                        className="w-full mb-3 bg-[#39FF14]/10 text-[#39FF14] border border-[rgba(57,255,20,0.3)] hover:bg-[#39FF14]/20 font-mono text-[10px] uppercase tracking-wider" 
                        size="lg"
                      >
                        <Link to="/contact">
                          INITIATE_HANDOFF
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Link>
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default AgentDetail;
