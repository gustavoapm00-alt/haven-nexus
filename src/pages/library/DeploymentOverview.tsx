import { CheckCircle, Shield, Clock, ArrowRight, Users, Eye, Wrench, HeartPulse } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import SEO, { schemas } from '@/components/SEO';

const DeploymentOverview = () => {
  const phases = [
    { number: 1, title: 'Diagnose', duration: 'Days 1–5', icon: Eye, description: 'Map operational topology and identify structural friction points.',
      bullets: ['Audit current systems, handoff points, and data flows', 'Identify redundant processes consuming operational capacity', 'Prioritize high-impact stabilization targets', 'Define success criteria and authorization boundaries'] },
    { number: 2, title: 'Activate', duration: 'Days 6–20', icon: Wrench, description: 'AERELION configures and deploys operational protocols on managed infrastructure.',
      bullets: ['Establish secure connections to authorized systems', 'Build and validate protocol logic end-to-end', 'Configure triggers, exception handlers, and redundancy layers', 'Verify outputs against operational standards'] },
    { number: 3, title: 'Stabilize', duration: 'Days 21–30', icon: HeartPulse, description: 'Monitor, adjust, and harden all protocols for sustained operation.',
      bullets: ['Monitor live protocols for anomalies or edge conditions', 'Refine logic based on operational data', 'Document handoff procedures and escalation paths', 'Confirm operational integrity across all nodes'] },
  ];

  const clientRequirements = [
    { title: 'System Authorization', description: "OAuth authorization or secure credential handoff for systems within engagement scope." },
    { title: 'Operational Context', description: 'A 30-minute briefing to map current process topology and friction vectors.' },
    { title: 'Decision Availability', description: 'Respond to authorization requests within 24–48 hours to maintain deployment cadence.' },
  ];

  const outcomes = [
    'Operational capacity recovered from redundant manual processes',
    'Reduced latency in system handoffs and response protocols',
    'Standardized execution of processes previously dependent on individual operators',
    "Full visibility into protocol status and operational integrity",
    'Structural closure of operational gaps and friction points',
  ];

  const faqs = [
    { question: 'How is engagement scope defined?', answer: 'Scope is fixed at authorization. Operational complexity determines the engagement parameters. No variable billing. No scope drift without revised authorization.' },
    { question: 'What operational context is required from us?', answer: "Access credentials and a 30-minute operational walkthrough. All configuration, testing, and stabilization is handled by AERELION." },
    { question: 'How are credentials handled?', answer: "All credentials are encrypted at rest (AES-256-GCM) and in transit (TLS 1.3). Least-privilege access only. Authorization is revocable at any point." },
    { question: 'What happens after the stabilization window?', answer: 'All protocols are live and hardened. From there: self-govern with full handoff documentation, or extend with ongoing monitoring under a maintenance retainer.' },
    { question: 'Who retains ownership of operational infrastructure?', answer: "Full ownership remains with the authorizing entity. AERELION operates on your behalf — nothing more." },
    { question: 'What if operational requirements shift mid-cycle?', answer: "Scope adjustments require revised authorization. No unilateral changes are made without formal approval from the authorizing entity." },
  ];

  const howItWorksStructuredData = [
    schemas.howTo("AERELION 30-Day Managed Automation Engagement", "How AERELION diagnoses, installs, and stabilizes automation workflows",
      ["Phase 1: Diagnose", "Phase 2: Install", "Phase 3: Stabilize"]),
    schemas.faqPage(faqs),
    schemas.breadcrumb([{ name: 'Home', url: '/' }, { name: 'Deployment', url: '/how-it-works' }])
  ];

  return (
    <>
      <SEO title="Deployment Doctrine – 30-Day Engagement | AERELION"
        description="AERELION's 30-day scoped engagement: diagnose operational friction, install automation workflows, stabilize for reliable operation."
        canonicalUrl="/how-it-works" structuredData={howItWorksStructuredData} />

      <div className="min-h-screen bg-[#0F0F0F]">
        {/* Hero */}
        <section className="section-padding !pt-12 !pb-8">
          <div className="container-main max-w-3xl text-center">
            <span className="font-mono text-[10px] text-[#39FF14]/50 uppercase tracking-[0.25em] mb-3 block">// DEPLOYMENT DOCTRINE</span>
            <h1 className="font-mono text-3xl md:text-4xl font-semibold text-[#E0E0E0] mb-4">
              A 30-Day Scoped Engagement
            </h1>
            <p className="font-sans text-base text-white/40 leading-relaxed max-w-2xl mx-auto">
              Diagnose operational friction. Activate stabilization protocols. Harden infrastructure before handoff. Fixed scope. Outcome-governed. No technical labor required from the authorizing entity.
            </p>
          </div>
        </section>

        {/* Phases */}
        <section className="section-padding !py-12">
          <div className="container-main max-w-4xl">
            <h2 className="font-mono text-2xl font-semibold text-[#E0E0E0] text-center mb-10">The Three Phases</h2>
            <div className="space-y-6">
              {phases.map((phase) => (
                <div key={phase.number} className="border border-white/10 p-6 md:p-8 hover:border-[rgba(57,255,20,0.2)] transition-colors">
                  <div className="flex flex-col md:flex-row md:items-start gap-6">
                    <div className="flex-shrink-0">
                      <div className="w-14 h-14 border border-[rgba(57,255,20,0.3)] flex items-center justify-center">
                        <span className="font-mono text-sm text-[#39FF14]/70">[PHASE_{String(phase.number).padStart(2, '0')}]</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-3">
                        <h3 className="font-mono text-lg font-semibold text-[#E0E0E0]">{phase.title}</h3>
                        <span className="font-mono text-xs text-white/20 border border-white/10 px-3 py-1 w-fit">{phase.duration}</span>
                      </div>
                      <p className="font-sans text-sm text-white/40 mb-4">{phase.description}</p>
                      <ul className="space-y-2">
                        {phase.bullets.map((bullet, i) => (
                          <li key={i} className="flex items-start gap-3 text-sm text-white/35 font-sans">
                            <CheckCircle className="w-4 h-4 text-[#39FF14]/40 flex-shrink-0 mt-0.5" />
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* What We Need */}
        <section className="section-padding !py-12 bg-[#0a0a0a]">
          <div className="container-main max-w-3xl">
            <h2 className="font-mono text-2xl font-semibold text-[#E0E0E0] text-center mb-3">Authorization Requirements</h2>
            <p className="font-sans text-sm text-white/30 text-center mb-8">Access and operational context. No technical labor required from the authorizing entity.</p>
            <div className="grid gap-6">
              {clientRequirements.map((req, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-8 h-8 border border-[rgba(57,255,20,0.2)] flex items-center justify-center flex-shrink-0">
                    <Users className="w-4 h-4 text-[#39FF14]/40" />
                  </div>
                  <div>
                    <h3 className="font-mono text-sm font-medium text-[#E0E0E0] mb-1">{req.title}</h3>
                    <p className="font-sans text-sm text-white/35">{req.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Outcomes */}
        <section className="section-padding !py-12">
          <div className="container-main max-w-3xl">
            <h2 className="font-mono text-2xl font-semibold text-[#E0E0E0] text-center mb-3">Operational Deliverables</h2>
            <p className="font-sans text-sm text-white/30 text-center mb-8">Infrastructure outcomes. Not software licenses.</p>
            <div className="border border-white/10 p-6 md:p-8">
              <ul className="space-y-4">
                {outcomes.map((outcome, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-[#39FF14]/40 flex-shrink-0 mt-0.5" />
                    <span className="font-sans text-sm text-white/50">{outcome}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* After Day 30 */}
        <section className="section-padding !py-12 bg-[#0a0a0a]">
          <div className="container-main max-w-3xl">
            <div className="border border-white/10 p-6 md:p-8">
              <div className="flex items-start gap-4">
                <Clock className="w-6 h-6 text-[#39FF14]/40 flex-shrink-0" />
                <div>
                  <h2 className="font-mono text-lg font-semibold text-[#E0E0E0] mb-3">What Happens After Day 30</h2>
                  <p className="font-sans text-sm text-white/35 mb-4">Your workflows are live and stable. From there:</p>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <span className="font-mono text-xs text-[#39FF14]/40">[01]</span>
                      <div>
                        <p className="font-mono text-sm text-[#E0E0E0]">Self-manage</p>
                        <p className="font-sans text-xs text-white/30">Documentation and escalation paths handed off.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="font-mono text-xs text-[#39FF14]/40">[02]</span>
                      <div>
                        <p className="font-mono text-sm text-[#E0E0E0]">Ongoing monitoring</p>
                        <p className="font-sans text-xs text-white/30">Continued operation on a retainer basis.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="section-padding !py-12">
          <div className="container-main max-w-3xl">
            <h2 className="font-mono text-2xl font-semibold text-[#E0E0E0] text-center mb-8">Operational Clarifications</h2>
            <Accordion type="single" collapsible className="space-y-3">
              {faqs.map((faq, i) => (
                <AccordionItem key={i} value={`faq-${i}`} className="border border-white/10 px-6">
                  <AccordionTrigger className="text-left hover:no-underline py-5">
                    <span className="font-mono text-sm text-[#E0E0E0]">{faq.question}</span>
                  </AccordionTrigger>
                  <AccordionContent className="font-sans text-sm text-white/35 pb-5">{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* Security */}
        <section className="section-padding !py-8">
          <div className="container-main max-w-3xl">
            <div className="border border-white/10 p-4 flex items-start gap-3">
              <Shield className="w-5 h-5 text-[#39FF14]/40 flex-shrink-0 mt-0.5" />
              <p className="font-sans text-sm text-white/30">
                Your credentials are encrypted and stored securely. You can revoke access at any time.
                <Link to="/security" className="text-[#39FF14]/60 hover:text-[#39FF14] ml-1 font-mono text-xs uppercase tracking-wider">
                  View governance practices
                </Link>.
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="section-padding !py-12">
          <div className="container-main max-w-3xl text-center">
            <h2 className="font-mono text-2xl font-semibold text-[#E0E0E0] mb-4">Initiate Operational Engagement</h2>
            <p className="font-sans text-sm text-white/30 mb-6">Submit a briefing request. Identify operational friction. Receive a scoped engagement authorization.</p>
            <Button asChild size="lg">
              <Link to="/contact">
                REQUEST OPERATIONAL BRIEFING
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </section>
      </div>
    </>
  );
};

export default DeploymentOverview;
