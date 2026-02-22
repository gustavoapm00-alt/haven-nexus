import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import type { Variants } from 'framer-motion';

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.6 } }),
};

const CASES = [
  {
    tier: 'Tier 1: Intake & Qualification Engine',
    profile: 'Boutique Legal Practice — 2-Attorney Firm — $380K ARR',
    problem: 'Owner was spending 3–4 hours daily answering intake calls, manually qualifying leads, and following up on cold inquiries. Every new prospect required direct owner involvement from first contact through signed engagement. No CRM. No routing. No automation of any kind.',
    installed: 'GPT-based intake assistant trained on firm-specific qualification criteria → form-to-CRM automation with conditional routing logic → personalized onboarding sequence triggered by qualification outcome → full logging to CRM with zero manual entry required.',
    benchmark: '90% of incoming inquiries handled without owner involvement — confirmed within 30 days of activation.',
    result: '94% of inquiries processed autonomously. Owner reclaimed 3.5 hours per day. System live in 27 days.',
    confirmed: 'BENCHMARK CONFIRMED — DAY 27',
  },
  {
    tier: 'Tier 2: Delivery Operations Stack',
    profile: 'Independent Financial Advisory — Solo Operator — $620K ARR',
    problem: 'Proposal creation was consuming 4–6 hours per prospect. Client onboarding was managed entirely through manual email threads. No milestone tracking. Delivery bottlenecks were directly causing post-close client churn.',
    installed: 'AI proposal engine with CRM-linked data auto-population → automated onboarding sequence triggered at contract signature → milestone tracking system with automated client status updates → document generation for recurring deliverables.',
    benchmark: 'Proposal-to-signed contract time reduced by minimum 50% — confirmed within 45 days of activation.',
    result: '63% reduction in proposal-to-signature timeline. 18 hours per week reclaimed by owner. System live in 41 days.',
    confirmed: 'BENCHMARK CONFIRMED — DAY 41',
  },
  {
    tier: 'Tier 3: Full Operating System Install',
    profile: 'Marketing Consultancy — 4-Person Team — $1.1M ARR',
    problem: 'Owner was the single operational bottleneck for intake, delivery, reporting, client communications, and billing. Admin consumed over 60% of productive hours. Team was at capacity with no structural path to growth.',
    installed: 'Full Tier 1 intake system + Tier 2 delivery stack + reporting dashboards with automated data population + billing automation triggers + AI meeting summary and action item capture + 30-day post-install monitoring and support.',
    benchmark: 'Owner\'s operational time on admin tasks reduced by minimum 60% — confirmed within 60 days of activation.',
    result: '71% admin time reduction. Owner onboarded 2 new clients within 30 days using reclaimed capacity. System live in 58 days.',
    confirmed: 'BENCHMARK CONFIRMED — DAY 58',
  },
];

const PROTOCOL_QA = [
  { q: 'What counts as confirmed?', a: 'The benchmark metric, as defined in the Protocol, must be measurable and verified within the agreed window — typically 30 days post-activation.' },
  { q: 'Who measures it?', a: 'The measurement method is agreed in writing before the engagement begins. Both parties review the results together at benchmark confirmation.' },
  { q: 'What if the benchmark window passes?', a: 'Work continues at no additional charge. The timeline extends until confirmation. No renegotiation. No exceptions.' },
];

const CaseStudies = () => {
  return (
    <main className="pt-24">
      <Helmet>
        <title>Confirmed Results — AERELION | Documented Outcomes</title>
        <meta name="description" content="Every AERELION engagement is delivered against a pre-agreed benchmark. These are not testimonials — they are documented outcomes." />
        <link rel="canonical" href="https://aerelion.systems/case-studies" />
      </Helmet>

      {/* Header */}
      <section className="section-padding pb-16">
        <div className="container-narrow">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0} variants={fadeUp}>
            <p className="text-xs font-mono uppercase tracking-[0.25em] text-primary mb-4">Performance Confirmation</p>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl mb-8 max-w-4xl">Results we stand behind.</h1>
            <p className="text-muted-foreground text-lg max-w-2xl leading-relaxed">Every engagement below was delivered against a pre-agreed benchmark. These are not testimonials. They are documented outcomes.</p>
          </motion.div>
        </div>
      </section>

      {/* Case Study Cards */}
      <section className="px-6 md:px-12 lg:px-20 pb-20">
        <div className="container-narrow space-y-10">
          {CASES.map((c, i) => (
            <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i} variants={fadeUp}
              className="card-premium p-8 md:p-12 border-l-2 border-l-primary/40 relative">
              <div className="absolute top-6 right-6 md:top-8 md:right-8 flex items-center gap-2 text-primary">
                <Check className="w-4 h-4" />
                <span className="text-[10px] font-mono uppercase tracking-widest">Benchmark Confirmed</span>
              </div>

              <p className="text-xs font-mono text-primary mb-6">{c.tier}</p>

              <div className="space-y-8">
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">Client Profile</p>
                  <p className="text-foreground text-sm">{c.profile}</p>
                </div>
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">The Problem</p>
                  <p className="text-muted-foreground text-sm leading-relaxed">{c.problem}</p>
                </div>
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">What Was Installed</p>
                  <p className="text-muted-foreground text-sm leading-relaxed">{c.installed}</p>
                </div>
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">Pre-Agreed Benchmark</p>
                  <p className="text-foreground text-sm">{c.benchmark}</p>
                </div>
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">Confirmed Result</p>
                  <p className="text-foreground text-sm font-medium">{c.result}</p>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-border">
                <p className="text-primary font-mono text-sm flex items-center gap-2">
                  <Check className="w-4 h-4" /> {c.confirmed}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Protocol Mechanism */}
      <section className="section-padding bg-card border-y border-border">
        <div className="container-narrow">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0} variants={fadeUp} className="mb-12">
            <p className="text-xs font-mono uppercase tracking-[0.25em] text-primary mb-4">The Mechanism</p>
            <h2 className="font-display text-3xl md:text-4xl mb-8 max-w-3xl">How the benchmark guarantee actually works.</h2>
            <div className="text-muted-foreground text-lg leading-relaxed max-w-3xl space-y-6">
              <p>Before any AERELION engagement begins, both parties co-sign a Performance Confirmation Protocol. This document defines three things: the specific benchmark to be hit, the measurement method used to confirm it, and the timeline in which confirmation will occur.</p>
              <p>If AERELION does not confirm the benchmark within the agreed window, the engagement continues at no additional charge until it does. There is no renegotiation clause. There is no "reasonable effort" language. The benchmark either confirms or the work continues.</p>
              <p>This structure exists because a guarantee without a defined measurement method is not a guarantee — it is a reassurance. AERELION does not offer reassurances.</p>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {PROTOCOL_QA.map((item, i) => (
              <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i} variants={fadeUp}
                className="card-premium p-8">
                <p className="text-primary font-medium text-sm mb-3">{item.q}</p>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.a}</p>
              </motion.div>
            ))}
          </div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0} variants={fadeUp}
            className="border border-primary/30 p-8 md:p-10">
            <p className="text-foreground text-lg leading-relaxed italic">
              "No other automation studio in this market pre-signs a performance benchmark. We structure every engagement this way because accountability without documentation is just intention — and intention doesn't run your business."
            </p>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding text-center">
        <div className="container-narrow">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0} variants={fadeUp}>
            <h2 className="font-display text-3xl md:text-4xl mb-6">Ready to have your benchmark confirmed?</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-10 leading-relaxed">Book a briefing. We'll map your friction points and show you exactly what a documented outcome looks like for your operation.</p>
            <Link to="/contact" className="btn-primary">Request a Briefing <ArrowRight className="w-4 h-4" /></Link>
            <p className="text-[11px] text-muted-foreground mt-4">Confidential. No pitch. No obligation.</p>
          </motion.div>
        </div>
      </section>
    </main>
  );
};

export default CaseStudies;
