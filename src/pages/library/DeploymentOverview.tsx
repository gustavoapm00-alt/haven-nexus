import { CheckCircle, Shield, Clock, ArrowRight, Users, Eye, Wrench, HeartPulse } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import SEO, { schemas } from '@/components/SEO';

const DeploymentOverview = () => {
  const phases = [
    { number: 1, title: 'Diagnose', duration: 'Days 1–5', icon: Eye, description: 'We map your operations and identify where time leaks.',
      bullets: ['Review current tools, workflows, and handoff points', 'Identify repetitive tasks draining capacity', 'Prioritize high-impact automation targets', 'Define success criteria for the engagement'] },
    { number: 2, title: 'Install', duration: 'Days 6–20', icon: Wrench, description: 'We configure and deploy workflows on your infrastructure.',
      bullets: ['Connect your tools securely (CRM, email, scheduling, etc.)', 'Build and test automation logic end-to-end', 'Configure triggers, actions, and exception handling', 'Validate outputs match your operational standards'] },
    { number: 3, title: 'Stabilize', duration: 'Days 21–30', icon: HeartPulse, description: 'We monitor, adjust, and confirm everything runs reliably.',
      bullets: ['Monitor live workflows for errors or edge cases', 'Fine-tune logic based on real-world data', 'Document operational handoff and escalation paths', "Confirm you're seeing the expected outcomes"] },
  ];

  const clientRequirements = [
    { title: 'Tool access', description: "Admin credentials or OAuth authorization for the systems we'll connect." },
    { title: 'Operational context', description: 'A 30-minute call to walk us through your current process and pain points.' },
    { title: 'Decision availability', description: 'Respond to questions within 24–48 hours so we can keep the engagement on track.' },
  ];

  const outcomes = [
    'Hours recovered weekly from repetitive admin tasks',
    'Faster response times to leads, clients, or internal requests',
    'Consistent execution of workflows that used to depend on memory',
    "Clear visibility into what's running and what's not",
    'Confidence that operational gaps are closed',
  ];

  const faqs = [
    { question: 'How is pricing determined?', answer: 'Pricing is scoped per engagement, not per workflow. After our initial call, we provide a fixed quote based on operational complexity. No hourly billing, no surprise invoices.' },
    { question: 'Do I need technical experience?', answer: "No. You provide access and context—we handle all configuration, testing, and maintenance." },
    { question: 'How are my credentials handled?', answer: "Credentials are encrypted at rest and in transit. We use least privilege—only accessing what's required. You can revoke access at any time." },
    { question: 'What if something breaks after the 30 days?', answer: 'We build for resilience—error handling, logging, and alerts. After Day 30, you can continue with optional ongoing monitoring or receive handoff documentation.' },
    { question: 'Who owns the workflows?', answer: "You do. Everything runs on your infrastructure or accounts. We're operators, not landlords." },
    { question: 'What if my needs change mid-engagement?', answer: "Scope changes happen. Major expansions may require a revised quote, but we'll always discuss before proceeding." },
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
              We diagnose operational friction, install workflows that eliminate it, and stabilize everything before handoff. Fixed scope. Outcome-owned. No technical work required from you.
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
            <h2 className="font-mono text-2xl font-semibold text-[#E0E0E0] text-center mb-3">What We Need From You</h2>
            <p className="font-sans text-sm text-white/30 text-center mb-8">Access and context—not technical work.</p>
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
            <h2 className="font-mono text-2xl font-semibold text-[#E0E0E0] text-center mb-3">What You Get</h2>
            <p className="font-sans text-sm text-white/30 text-center mb-8">Operational outcomes, not just software.</p>
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
            <h2 className="font-mono text-2xl font-semibold text-[#E0E0E0] text-center mb-8">Frequently Asked Questions</h2>
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
            <h2 className="font-mono text-2xl font-semibold text-[#E0E0E0] mb-4">Ready to recover capacity?</h2>
            <p className="font-sans text-sm text-white/30 mb-6">Tell us where operational friction exists. We'll scope the engagement.</p>
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
