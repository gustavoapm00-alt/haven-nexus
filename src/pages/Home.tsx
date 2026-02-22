import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import type { Variants } from 'framer-motion';

const STATS = [
  { value: '$16.6B', label: 'Lost annually to manual process overhead in U.S. professional services' },
  { value: '1.2M+', label: 'Target operators in the United States' },
  { value: '30 Days', label: 'Standard system delivery guarantee' },
  { value: '60%+', label: 'Minimum admin reduction benchmark' },
];

const PROBLEMS = [
  { symptom: 'Owner answers the same 12 questions daily', cost: '3–5 hrs/week lost' },
  { symptom: 'Onboarding takes 2 weeks instead of 2 days', cost: 'Revenue delayed, churn' },
  { symptom: 'Follow-up falls through the cracks', cost: '10–30% pipeline lost' },
  { symptom: 'Reporting is done manually every month', cost: 'Low-leverage work' },
  { symptom: 'Proposals take 4 hours per prospect', cost: 'Sales velocity throttled' },
];

const ACCOUNTABILITY_STATS = [
  { value: '100%', label: 'of engagements delivered to pre-agreed benchmark' },
  { value: '0', label: 'additional charges when extended work was required' },
  { value: '30 Days', label: 'maximum window to confirm benchmark post-activation' },
];

const TIERS = [
  { tier: '01', name: 'Intake & Qualification Engine', price: '$4,500 – $7,500', timeline: '30 days', benchmark: '90%+ inquiries handled without owner involvement', description: 'AI-powered front-of-funnel system that captures, qualifies, auto-routes, and logs — zero manual intervention.' },
  { tier: '02', name: 'Delivery Operations Stack', price: '$12,000 – $22,000', timeline: '45 days', benchmark: 'Proposal-to-contract time reduced by 50%+', description: 'Automates proposal generation, onboarding, milestone tracking, document assembly, and status communications.' },
  { tier: '03', name: 'Full Operating System Install', price: '$28,000 – $45,000', timeline: '60 days', benchmark: 'Owner admin time reduced by 60%+', description: 'End-to-end operational redesign covering intake, delivery, reporting, billing, and client communications.' },
];

const TRIGGERS = [
  'You are answering the same operational questions every day. The same ones. Every day. Nothing has changed because nothing has been built.',
  'You hired someone to absorb the load. The load came back to you. The system was never fixed — the headcount just moved.',
  'Your revenue is growing. Your freedom is not. You are the ceiling of your own business and you know it.',
  'You\'ve tried to automate before. A freelancer built something. It broke. Nobody knows why. You absorbed the loss.',
  'You\'re spending your best hours on work a system should handle. You\'ve known this for months. The problem is the system doesn\'t exist yet.',
];

const COMPETITORS = [
  { dimension: 'Pricing Model', aerelion: 'Fixed-scope, outcome-based', agencies: 'Hourly or subscription', saas: 'Monthly subscription', freelancers: 'Hourly rate', consultancies: 'Retainer or project' },
  { dimension: 'Performance Benchmark', aerelion: 'Pre-signed before payment', agencies: 'None', saas: 'None', freelancers: 'None', consultancies: 'None', highlight: true },
  { dimension: 'Delivery Timeline', aerelion: '30–60 days, guaranteed', agencies: 'Variable, no commitment', saas: 'Immediate (tool only)', freelancers: 'Variable, no commitment', consultancies: 'Months, no guarantee' },
  { dimension: 'What You Own After', aerelion: 'A fully operational system', agencies: 'Dependency on the builder', saas: 'A subscription to manage', freelancers: 'A build requiring upkeep', consultancies: 'A strategy document' },
  { dimension: 'If It Doesn\'t Work', aerelion: 'We keep working, no charge', agencies: 'You renegotiate or leave', saas: 'You cancel and restart', freelancers: 'You re-hire or rebuild', consultancies: 'You commission phase 2' },
  { dimension: 'Client Selectivity', aerelion: 'Yes — mutual fit required', agencies: 'None', saas: 'None', freelancers: 'None', consultancies: 'Varies' },
  { dimension: 'Post-Engagement', aerelion: 'Benchmark confirmed + optional retainer', agencies: 'Ongoing billing', saas: 'Ongoing subscription', freelancers: 'Additional hourly', consultancies: 'New engagement' },
];

const ARTICLES = [
  { tag: 'INTAKE SYSTEMS', title: 'How a Solo Attorney Eliminated 94% of Manual Intake in 27 Days', desc: 'A walkthrough of the GPT intake architecture, CRM routing logic, and benchmark confirmation process.' },
  { tag: 'DELIVERY OPS', title: 'The Proposal System That Reduced a Financial Advisor\'s Close Cycle by 63%', desc: 'How document automation and milestone tracking removed the advisor from the delivery bottleneck entirely.' },
  { tag: 'CASE TEARDOWN', title: 'Full Operating System: How a 4-Person Consultancy Reclaimed 18 Hours Per Week', desc: 'The complete architecture of a Tier 3 install — intake through reporting, billing through client communications.' },
];

const ICP = [
  { attribute: 'Annual Revenue', value: '$300K – $3M' },
  { attribute: 'Team Size', value: '1–8 people' },
  { attribute: 'Industry', value: 'Consulting, coaching, legal, financial advisory, marketing agencies' },
  { attribute: 'Mindset', value: 'Performance-obsessed; views operational friction as a solved problem they haven\'t solved yet' },
  { attribute: 'Decision Driver', value: 'Speed and certainty — not cost' },
  { attribute: 'Engagement Trigger', value: 'Recent bottleneck — hiring failure, delivery breakdown, or client churn' },
];

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.6 } }),
};

const Home = () => {
  return (
    <main>
      <Helmet>
        <title>AERELION — Managed Automation Operator for Professional Services</title>
        <meta name="description" content="AERELION installs AI-powered operational systems inside professional service businesses. Fixed-scope. Outcome-guaranteed. 30-day delivery." />
        <meta property="og:title" content="AERELION — We Install the Systems That Run Your Business" />
        <meta property="og:description" content="AI-powered operational systems for professional service businesses. Fixed-scope engagements with defined performance benchmarks." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://aerelion.systems" />
      </Helmet>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_40%,hsl(37_45%_50%_/_0.04),transparent_70%)]" />
        <div className="relative z-10 max-w-4xl mx-auto px-6 md:px-12 text-center pt-24">
          <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.5 }}
            className="text-xs font-mono uppercase tracking-[0.25em] text-primary mb-8">Managed Automation Operator</motion.p>
          <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
            className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.05] mb-6">
            We install the systems <span className="italic text-primary">that run</span> your business.
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }}
            className="text-lg md:text-xl text-primary/80 italic max-w-2xl mx-auto mb-12">
            The only automation studio that signs your performance benchmark before you sign our invoice.
          </motion.p>

          {/* Trust Bar */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.55 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 max-w-3xl mx-auto mb-12">
            <div className="text-center">
              <p className="text-xs font-mono uppercase tracking-[0.2em] text-primary mb-2">Benchmark Signed First</p>
              <p className="text-sm text-muted-foreground leading-relaxed">Pre-agreed in writing before any payment changes hands.</p>
            </div>
            <div className="text-center">
              <p className="text-xs font-mono uppercase tracking-[0.2em] text-primary mb-2">Keep Working If We Miss It</p>
              <p className="text-sm text-muted-foreground leading-relaxed">No renegotiation. No added charge. We continue until the benchmark is confirmed.</p>
            </div>
            <div className="text-center">
              <p className="text-xs font-mono uppercase tracking-[0.2em] text-primary mb-2">You Own the System Forever</p>
              <p className="text-sm text-muted-foreground leading-relaxed">The system runs without us. No subscription. No dependency.</p>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.7 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/contact" className="btn-primary">Request a Briefing <ArrowRight className="w-4 h-4" /></Link>
            <Link to="/how-it-works" className="btn-outline">See Our Process</Link>
          </motion.div>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}
            className="text-[11px] text-muted-foreground mt-4">Confidential. No pitch. No obligation.</motion.p>
        </div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-muted-foreground">Scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-muted-foreground/30 to-transparent" />
        </motion.div>
      </section>

      {/* Stats */}
      <section className="border-y border-border bg-card">
        <div className="max-w-6xl mx-auto px-6 md:px-12 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map((stat, i) => (
            <motion.div key={stat.label} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i} variants={fadeUp} className="text-center">
              <p className="font-display text-2xl md:text-3xl text-foreground mb-2">{stat.value}</p>
              <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground leading-relaxed">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Problem */}
      <section className="section-padding">
        <div className="container-narrow">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0} variants={fadeUp} className="mb-16">
            <p className="text-xs font-mono uppercase tracking-[0.25em] text-primary mb-4">The Problem</p>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl mb-6 max-w-3xl">Your operations are leaking time, revenue, and capacity.</h2>
            <p className="text-muted-foreground text-lg max-w-2xl leading-relaxed">Across law firms, consulting agencies, coaching businesses, and advisory practices — the same patterns repeat.</p>
          </motion.div>
          <div className="space-y-4">
            {PROBLEMS.map((p, i) => (
              <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i} variants={fadeUp}
                className="card-premium p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <p className="text-foreground text-sm font-medium">{p.symptom}</p>
                <p className="text-primary text-sm font-mono shrink-0">{p.cost}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Accountability Standard */}
      <section className="section-padding bg-card border-y border-border">
        <div className="container-narrow">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0} variants={fadeUp} className="mb-12">
            <p className="text-xs font-mono uppercase tracking-[0.25em] text-primary mb-4">The Accountability Standard</p>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl mb-8 max-w-3xl">Every other studio promises results. <span className="italic text-primary">We sign them.</span></h2>
            <div className="text-muted-foreground text-lg leading-relaxed max-w-3xl space-y-6">
              <p>Before a single dollar changes hands, AERELION and the client co-sign a Performance Confirmation Protocol — a plain-English document that defines exactly what success looks like, the timeline in which it will be measured, and what happens if we fall short.</p>
              <p>If we miss the benchmark, we keep working. No renegotiation. No additional charge. No scope expansion conversation. We continue until the system performs as agreed. This is not a clause buried in a contract. It is the engagement model.</p>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {ACCOUNTABILITY_STATS.map((s, i) => (
              <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i} variants={fadeUp} className="text-center">
                <p className="font-display text-4xl md:text-5xl text-foreground mb-2">{s.value}</p>
                <p className="text-sm text-muted-foreground">{s.label}</p>
              </motion.div>
            ))}
          </div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0} variants={fadeUp}
            className="border border-primary/30 p-8 md:p-10">
            <p className="text-foreground text-lg leading-relaxed italic">
              "Other studios automate your tasks. AERELION installs your infrastructure. When the engagement ends, you keep a fully operational system — not a subscription, not a dependency. A system you own outright."
            </p>
          </motion.div>
        </div>
      </section>

      {/* Solution Tiers */}
      <section className="section-padding">
        <div className="container-narrow">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0} variants={fadeUp} className="mb-16">
            <p className="text-xs font-mono uppercase tracking-[0.25em] text-primary mb-4">What We Install</p>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl mb-6 max-w-3xl">Three tiers of operational intelligence.</h2>
            <p className="text-muted-foreground text-lg max-w-2xl leading-relaxed">Every engagement is fixed-scope with defined performance benchmarks. If we don't hit them, we keep working — no additional charge.</p>
          </motion.div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {TIERS.map((tier, i) => (
              <motion.div key={tier.tier} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i} variants={fadeUp}
                className="card-premium p-8 flex flex-col">
                <p className="text-xs font-mono text-primary mb-3">Tier {tier.tier}</p>
                <div className="inline-flex items-center gap-2 mb-4">
                  <span className="text-sm font-mono font-medium text-primary bg-primary/10 px-3 py-1 border border-primary/20">{tier.timeline}-day delivery guarantee</span>
                </div>
                <h3 className="font-display text-xl mb-3">{tier.name}</h3>
                <p className="text-sm text-muted-foreground mb-4 flex-1">{tier.description}</p>
                <p className="text-[11px] text-muted-foreground italic mb-6">If we don't hit the benchmark, we keep working. No additional charge.</p>
                <div className="space-y-3 pt-6 border-t border-border">
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Investment</span><span className="text-foreground font-medium">{tier.price}</span></div>
                  <div className="pt-3"><p className="text-xs text-muted-foreground mb-1">Performance Benchmark</p><p className="text-sm text-primary">{tier.benchmark}</p></div>
                </div>
              </motion.div>
            ))}
          </div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0} variants={fadeUp} className="mt-12 text-center">
            <Link to="/services" className="btn-outline">View Full Service Details <ArrowUpRight className="w-4 h-4" /></Link>
          </motion.div>
        </div>
      </section>

      {/* ICP Triggers */}
      <section className="section-padding bg-card border-y border-border">
        <div className="container-narrow">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0} variants={fadeUp} className="mb-16">
            <p className="text-xs font-mono uppercase tracking-[0.25em] text-primary mb-4">The Right Client</p>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl mb-6 max-w-4xl">You're ready for AERELION when the cost of doing nothing finally exceeds the cost of changing.</h2>
          </motion.div>
          <div className="space-y-4 mb-10">
            {TRIGGERS.map((t, i) => (
              <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i} variants={fadeUp}
                className="p-6 border border-border flex gap-4 md:gap-6 items-start">
                <span className="font-display text-2xl text-primary/40 shrink-0">{String(i + 1).padStart(2, '0')}</span>
                <p className="text-foreground text-sm leading-relaxed">{t}</p>
              </motion.div>
            ))}
          </div>
          <motion.p initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0} variants={fadeUp}
            className="text-primary italic text-lg mb-12">If you recognized yourself in more than one of these — the briefing call is the next step.</motion.p>

          {/* Demographics */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0} variants={fadeUp} className="mb-6">
            <p className="text-xs font-mono uppercase tracking-[0.25em] text-muted-foreground mb-6">Client Profile</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ICP.map((item, i) => (
              <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i} variants={fadeUp}
                className="card-premium p-6">
                <p className="text-xs font-mono uppercase tracking-widest text-primary mb-2">{item.attribute}</p>
                <p className="text-foreground text-sm leading-relaxed">{item.value}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Competitive Matrix */}
      <section className="section-padding">
        <div className="container-narrow">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0} variants={fadeUp} className="mb-16">
            <p className="text-xs font-mono uppercase tracking-[0.25em] text-primary mb-4">Competitive Positioning</p>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl mb-6 max-w-3xl">Not an agency. Not a vendor. <span className="italic text-primary">A new category.</span></h2>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={1} variants={fadeUp} className="overflow-x-auto">
            <table className="w-full text-sm border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-4 pr-4 text-xs font-mono uppercase tracking-widest text-muted-foreground"></th>
                  <th className="text-left py-4 px-4 text-xs font-mono uppercase tracking-widest text-primary">AERELION</th>
                  <th className="text-left py-4 px-4 text-xs font-mono uppercase tracking-widest text-muted-foreground">Agencies</th>
                  <th className="text-left py-4 px-4 text-xs font-mono uppercase tracking-widest text-muted-foreground">AI SaaS</th>
                  <th className="text-left py-4 px-4 text-xs font-mono uppercase tracking-widest text-muted-foreground">Freelancers</th>
                  <th className="text-left py-4 px-4 text-xs font-mono uppercase tracking-widest text-muted-foreground">Consultancies</th>
                </tr>
              </thead>
              <tbody>
                {COMPETITORS.map((row, i) => (
                  <tr key={i} className={`border-b border-border/50 ${row.highlight ? 'bg-primary/5' : ''}`}>
                    <td className={`py-4 pr-4 text-muted-foreground font-medium ${row.highlight ? 'text-base' : ''}`}>{row.dimension}</td>
                    <td className={`py-4 px-4 font-medium ${row.highlight ? 'text-primary bg-primary/10 text-base' : 'text-foreground'}`}>{row.aerelion}</td>
                    <td className="py-4 px-4 text-muted-foreground">{row.agencies}</td>
                    <td className="py-4 px-4 text-muted-foreground">{row.saas}</td>
                    <td className="py-4 px-4 text-muted-foreground">{row.freelancers}</td>
                    <td className="py-4 px-4 text-muted-foreground">{row.consultancies}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        </div>
      </section>

      {/* Differentiation */}
      <section className="section-padding bg-card border-y border-border">
        <div className="container-narrow">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0} variants={fadeUp} className="max-w-3xl">
            <p className="text-xs font-mono uppercase tracking-[0.25em] text-primary mb-4">The Difference</p>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl mb-8">We don't sell tools. <span className="italic text-primary">We install outcomes.</span></h2>
            <div className="space-y-6 text-muted-foreground text-lg leading-relaxed">
              <p>AERELION is not an agency, not a SaaS vendor, not a freelancer. We are a Managed Automation Operator — a new class of strategic infrastructure partner priced to reflect transferred liability, not time spent.</p>
              <p>Every engagement comes with a Performance Confirmation Protocol — measurable outcomes agreed upon before a single dollar changes hands. If we don't hit the benchmarks, we keep working at no additional charge.</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Content Signal */}
      <section className="section-padding">
        <div className="container-narrow">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0} variants={fadeUp} className="mb-12">
            <p className="text-xs font-mono uppercase tracking-[0.25em] text-primary mb-4">Operator Intelligence</p>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl mb-4">System teardowns. Real operators. Documented results.</h2>
            <p className="text-muted-foreground text-lg max-w-2xl">AERELION publishes breakdowns of real automation architectures — what was built, why, and what it changed. No theory. No tool promotion.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {ARTICLES.map((a, i) => (
              <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i} variants={fadeUp}
                className="card-premium p-8 flex flex-col">
                <span className="text-[10px] font-mono uppercase tracking-widest text-primary mb-4">{a.tag}</span>
                <h3 className="font-display text-lg mb-3 text-foreground">{a.title}</h3>
                <p className="text-sm text-muted-foreground mb-6 flex-1 leading-relaxed">{a.desc}</p>
                <Link to="/case-studies" className="text-sm text-primary font-medium inline-flex items-center gap-1 hover:underline">
                  Read Teardown <ArrowRight className="w-3 h-3" />
                </Link>
              </motion.div>
            ))}
          </div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0} variants={fadeUp}>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-2">
              → Follow on LinkedIn for weekly system teardowns
            </a>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-card border-t border-border">
        <div className="container-narrow text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0} variants={fadeUp}>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl mb-6">Ready to remove the ceiling?</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-10 leading-relaxed">Book a confidential briefing. We'll map your operational friction and show you exactly what an installed system looks like.</p>
            <Link to="/contact" className="btn-primary">Request a Briefing <ArrowRight className="w-4 h-4" /></Link>
            <p className="text-[11px] text-muted-foreground mt-4">Confidential. No pitch. No obligation.</p>
          </motion.div>
        </div>
      </section>
    </main>
  );
};

export default Home;
