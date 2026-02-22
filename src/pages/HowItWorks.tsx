import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import type { Variants } from 'framer-motion';

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.6 } }),
};

const PHASES = [
  { number: '01', name: 'System Audit', timeline: 'Days 1–3', deliverable: 'Operational map identifying all manual friction points, current tools, and priority leverage zones.', output: 'A signed operational map both parties use as the foundation for Phase 2.' },
  { number: '02', name: 'Architecture Design', timeline: 'Days 4–8', deliverable: 'Signed-off system blueprint with tool selection, integration logic, and performance benchmarks.', output: 'A signed system blueprint. No build begins until both parties approve this document.' },
  { number: '03', name: 'Build & Integration', timeline: 'Days 9–22', deliverable: 'Full system build inside your existing stack — no rip-and-replace.', output: 'A fully built system running inside your existing stack, ready for live testing.' },
  { number: '04', name: 'Activation & Testing', timeline: 'Days 23–28', deliverable: 'Live system testing with real data. Operator walkthrough and handoff documentation.', output: 'Live system confirmed functional with real data. Full handoff documentation delivered.' },
  { number: '05', name: 'Benchmark Confirmation', timeline: 'Day 30', deliverable: 'Performance measurement against agreed benchmarks. Retainer offer extended if applicable.', output: 'Benchmark measured against the pre-agreed Protocol. Engagement closes on confirmation. Work continues if confirmation is not yet achieved.' },
];

const STANDARDS = [
  'Every system must run without the operator\'s daily intervention.',
  'Every integration must be documented in plain English for the client.',
  'Every benchmark must be measurable within 30 days of activation.',
];

const SCOPE_CLARITY = [
  'We never begin a build without a signed system blueprint. Ambiguity before the build creates failure during it.',
  'We never recommend replacing your existing tools. We build inside your stack. Rip-and-replace is a vendor problem, not a systems problem.',
  'We never deliver a system without plain-English documentation. If you can\'t understand what was built, you can\'t own it.',
  'We never close an engagement without benchmark confirmation. Delivery means the system works — not that the build is done.',
];

const FAQ = [
  { q: 'Do I need to replace my current tools?', a: 'No. AERELION builds inside your existing stack. We do not sell software licenses, platform subscriptions, or preferred vendor integrations. We architect the logic that connects what you already have and makes it function as a unified system.' },
  { q: 'What exactly does the Performance Confirmation Protocol say?', a: 'It defines three things in plain English: (1) the specific benchmark to be confirmed — a measurable outcome, not a subjective assessment; (2) the measurement method — how the benchmark will be verified, and by whom; (3) the timeline — when confirmation will be evaluated. Both parties sign this document before the engagement invoice is issued. It is not a guarantee clause buried in a service agreement. It is a standalone document that defines what success means for your specific engagement.' },
  { q: 'What happens if the benchmark isn\'t confirmed on time?', a: 'Work continues at no additional charge. The engagement does not close until the benchmark is confirmed. There is no renegotiation conversation, no scope expansion discussion, and no additional invoice. The Protocol defines this in writing before the engagement begins.' },
  { q: 'How much of my time is required during the build?', a: 'Phase 1 (System Audit) requires 2–3 hours of your time across Days 1–3. After that, you are in review and approval mode — not execution mode. Phase 2 requires your sign-off on the system blueprint before Phase 3 begins. Phase 4 requires a walkthrough session. Total time investment outside of Phase 1: approximately 2–4 hours across the full engagement.' },
  { q: 'What do I own when the engagement ends?', a: 'The system, fully. It is documented in plain English. It runs without AERELION\'s involvement. You are not dependent on us to maintain it, update it, or operate it. If you want ongoing monitoring and expansion, the optional Maintenance Retainer is available — but the system functions independently regardless of whether you take it.' },
  { q: 'What tools does AERELION use?', a: 'Tool selection is determined during Phase 2 based on your existing stack. Common orchestration tools include Make.com, n8n, and Zapier. Common AI components include GPT-4 and Claude. Common CRM integrations include HubSpot, GoHighLevel, Salesforce, and Notion. Common document automation tools include PandaDoc and DocuSign. We do not have preferred vendor relationships that would bias tool selection. We select what works for your architecture.' },
  { q: 'How is this different from hiring a freelancer or automation agency?', a: 'Three structural differences. First: AERELION sets a pre-signed performance benchmark before any payment — most studios do not set benchmarks at all. Second: if the benchmark is not confirmed, work continues at no additional charge — most studios have no accountability mechanism for underperformance. Third: the system you receive is fully documented and independently operational — not a dependency on the builder\'s ongoing involvement or a monthly subscription to a platform.' },
  { q: 'What if my situation is more complex than your standard tiers?', a: 'Tier 3 (Full Operating System Install) covers end-to-end operational infrastructure. If your situation requires something outside that scope, the briefing call is the right place to assess it. AERELION does not take engagements where a benchmark cannot be defined — if we can\'t agree on what success looks like, we are not the right fit.' },
  { q: 'Can I start with Tier 1 and upgrade later?', a: 'Yes. Many operators begin with the Intake & Qualification Engine as a scoped entry engagement. After benchmark confirmation, the majority expand to Tier 2 within 60 days. Each tier is a standalone engagement with its own Performance Confirmation Protocol.' },
  { q: 'How do I know AERELION will still exist and support me 6 months from now?', a: 'The system you receive does not depend on AERELION\'s continued existence to function. It is built inside your stack, documented in plain English, and operational without us. The optional Maintenance Retainer exists if you want ongoing monitoring and expansion — but it is never a dependency for the core system.' },
];

const HowItWorks = () => {
  return (
    <main className="pt-24">
      <Helmet>
        <title>How It Works — AERELION | Five-Phase Installation Protocol</title>
        <meta name="description" content="Every AERELION engagement follows a disciplined five-phase installation protocol: System Audit, Architecture Design, Build, Activation, and Benchmark Confirmation." />
        <link rel="canonical" href="https://aerelion.systems/how-it-works" />
      </Helmet>

      <section className="section-padding pb-16">
        <div className="container-narrow">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0} variants={fadeUp}>
            <p className="text-xs font-mono uppercase tracking-[0.25em] text-primary mb-4">Installation Protocol</p>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl mb-6 max-w-4xl">Five phases. One outcome.</h1>
            <p className="text-muted-foreground text-lg max-w-2xl leading-relaxed">Every AERELION engagement follows a disciplined five-phase installation protocol. No ambiguity. No scope creep. Just systematic execution.</p>
          </motion.div>
        </div>
      </section>

      {/* Phases */}
      <section className="px-6 md:px-12 lg:px-20 pb-20">
        <div className="container-narrow">
          <div className="relative">
            <div className="absolute left-6 md:left-8 top-0 bottom-0 w-px bg-border" />
            <div className="space-y-12">
              {PHASES.map((phase, i) => (
                <motion.div key={phase.number} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i} variants={fadeUp} className="relative pl-16 md:pl-20">
                  <div className="absolute left-3 md:left-5 top-1 w-6 h-6 rounded-full border-2 border-primary bg-background flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                  </div>
                  <div className="card-premium p-8">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                      <div>
                        <p className="text-xs font-mono text-primary mb-2">Phase {phase.number}</p>
                        <h3 className="font-display text-xl md:text-2xl">{phase.name}</h3>
                      </div>
                      <span className="text-xs font-mono text-muted-foreground shrink-0 bg-muted px-3 py-1.5">{phase.timeline}</span>
                    </div>
                    <p className="text-muted-foreground leading-relaxed mb-4">{phase.deliverable}</p>
                    <p className="text-sm text-primary"><span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mr-2">Output:</span>{phase.output}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Standards */}
      <section className="section-padding bg-card border-y border-border">
        <div className="container-narrow">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0} variants={fadeUp}>
            <p className="text-xs font-mono uppercase tracking-[0.25em] text-primary mb-4">Non-Negotiable Standards</p>
            <h2 className="font-display text-3xl md:text-4xl mb-10">Quality constraints we never compromise.</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {STANDARDS.map((s, i) => (
              <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i} variants={fadeUp} className="card-premium p-8">
                <p className="font-display text-3xl text-primary/20 mb-4">{String(i + 1).padStart(2, '0')}</p>
                <p className="text-foreground leading-relaxed">{s}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Scope Clarity */}
      <section className="section-padding">
        <div className="container-narrow">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0} variants={fadeUp} className="mb-12">
            <p className="text-xs font-mono uppercase tracking-[0.25em] text-primary mb-4">Scope Clarity</p>
            <h2 className="font-display text-3xl md:text-4xl mb-6">What AERELION never does.</h2>
          </motion.div>
          <div className="space-y-4">
            {SCOPE_CLARITY.map((s, i) => (
              <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i} variants={fadeUp}
                className="p-6 border border-border flex gap-4 md:gap-6 items-start">
                <span className="font-display text-2xl text-primary/40 shrink-0">{String(i + 1).padStart(2, '0')}</span>
                <p className="text-foreground text-sm leading-relaxed">{s}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section-padding bg-card border-y border-border">
        <div className="container-narrow">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0} variants={fadeUp} className="mb-12">
            <p className="text-xs font-mono uppercase tracking-[0.25em] text-primary mb-4">Common Questions</p>
            <h2 className="font-display text-3xl md:text-4xl">What operators ask before they commit.</h2>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={1} variants={fadeUp}>
            <Accordion type="single" collapsible className="space-y-2">
              {FAQ.map((item, i) => (
                <AccordionItem key={i} value={`faq-${i}`} className="border border-border bg-background px-6">
                  <AccordionTrigger className="text-sm text-foreground font-medium text-left py-5 hover:text-primary">
                    {item.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-5">
                    {item.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding text-center">
        <div className="container-narrow">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0} variants={fadeUp}>
            <h2 className="font-display text-3xl md:text-4xl mb-6">Start with a System Audit.</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-10">We'll map your operational friction points and show you exactly where time is leaking.</p>
            <Link to="/contact" className="btn-primary">Request a Briefing <ArrowRight className="w-4 h-4" /></Link>
            <p className="text-[11px] text-muted-foreground mt-4">Confidential. No pitch. No obligation.</p>
          </motion.div>
        </div>
      </section>
    </main>
  );
};

export default HowItWorks;
