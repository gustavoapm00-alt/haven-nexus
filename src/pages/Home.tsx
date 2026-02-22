import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Check, X as XIcon } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import type { Variants } from 'framer-motion';

const STATS = [
  { value: '$16.6B', label: 'Addressable Market' },
  { value: '1.2M+', label: 'Target Operators' },
  { value: '30 Days', label: 'Delivery Guarantee' },
  { value: '60%+', label: 'Capacity Recovered' },
];

const PROBLEMS = [
  { symptom: 'Owner answers the same 12 questions daily', cost: '3–5 hrs/week lost' },
  { symptom: 'Onboarding takes 2 weeks instead of 2 days', cost: 'Revenue delayed, churn' },
  { symptom: 'Follow-up falls through the cracks', cost: '10–30% pipeline lost' },
  { symptom: 'Reporting is done manually every month', cost: 'Low-leverage work' },
  { symptom: 'Proposals take 4 hours per prospect', cost: 'Sales velocity throttled' },
];

const TIERS = [
  { tier: '01', name: 'Intake & Qualification Engine', price: '$4,500 – $7,500', timeline: '30 days', benchmark: '90%+ inquiries handled without owner involvement', description: 'AI-powered front-of-funnel system that captures, qualifies, auto-routes, and logs — zero manual intervention.' },
  { tier: '02', name: 'Delivery Operations Stack', price: '$12,000 – $22,000', timeline: '45 days', benchmark: 'Proposal-to-contract time reduced by 50%+', description: 'Automates proposal generation, onboarding, milestone tracking, document assembly, and status communications.' },
  { tier: '03', name: 'Full Operating System Install', price: '$28,000 – $45,000', timeline: '60 days', benchmark: 'Owner admin time reduced by 60%+', description: 'End-to-end operational redesign covering intake, delivery, reporting, billing, and client communications.' },
];

const COMPETITORS = [
  {
    dimension: 'Pricing Model',
    aerelion: 'Fixed-scope, outcome-based',
    agencies: 'Hourly or retainer',
    saas: 'Subscription',
    freelancers: 'Hourly',
  },
  {
    dimension: 'Liability Model',
    aerelion: 'Outcome ownership',
    agencies: 'Effort only',
    saas: 'Tool access only',
    freelancers: 'Effort only',
  },
  {
    dimension: 'Speed to Live System',
    aerelion: '30 days guaranteed',
    agencies: '60–120 days',
    saas: 'DIY',
    freelancers: 'Variable',
  },
  {
    dimension: 'Technical Depth',
    aerelion: 'Full-stack AI integration',
    agencies: 'Variable',
    saas: 'Single product',
    freelancers: 'Variable',
  },
  {
    dimension: 'Post-Install Support',
    aerelion: 'Benchmark confirmation + retainer',
    agencies: 'Scope creep + extra billing',
    saas: 'Support tickets',
    freelancers: 'None standard',
  },
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
            className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.05] mb-8">
            We install the systems <span className="italic text-primary">that run</span> your business.
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.45 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed">
            AI-powered operational systems for professional service businesses. Fixed-scope. Outcome-guaranteed. You keep the system. We keep our reputation.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/contact" className="btn-primary">Request a Briefing <ArrowRight className="w-4 h-4" /></Link>
            <Link to="/how-it-works" className="btn-outline">See Our Process</Link>
          </motion.div>
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
              <p className="font-display text-2xl md:text-3xl text-foreground mb-1">{stat.value}</p>
              <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">{stat.label}</p>
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

      {/* Solution Tiers */}
      <section className="section-padding bg-card border-y border-border">
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
                <h3 className="font-display text-xl mb-3">{tier.name}</h3>
                <p className="text-sm text-muted-foreground mb-6 flex-1">{tier.description}</p>
                <div className="space-y-3 pt-6 border-t border-border">
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Investment</span><span className="text-foreground font-medium">{tier.price}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Timeline</span><span className="text-foreground font-medium">{tier.timeline}</span></div>
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

      {/* Competitive Matrix */}
      <section className="section-padding">
        <div className="container-narrow">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0} variants={fadeUp} className="mb-16">
            <p className="text-xs font-mono uppercase tracking-[0.25em] text-primary mb-4">Competitive Positioning</p>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl mb-6 max-w-3xl">Not an agency. Not a vendor. <span className="italic text-primary">A new category.</span></h2>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={1} variants={fadeUp} className="overflow-x-auto">
            <table className="w-full text-sm border-collapse min-w-[640px]">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-4 pr-4 text-xs font-mono uppercase tracking-widest text-muted-foreground"></th>
                  <th className="text-left py-4 px-4 text-xs font-mono uppercase tracking-widest text-primary">AERELION</th>
                  <th className="text-left py-4 px-4 text-xs font-mono uppercase tracking-widest text-muted-foreground">Agencies</th>
                  <th className="text-left py-4 px-4 text-xs font-mono uppercase tracking-widest text-muted-foreground">AI SaaS</th>
                  <th className="text-left py-4 px-4 text-xs font-mono uppercase tracking-widest text-muted-foreground">Freelancers</th>
                </tr>
              </thead>
              <tbody>
                {COMPETITORS.map((row, i) => (
                  <tr key={i} className="border-b border-border/50">
                    <td className="py-4 pr-4 text-muted-foreground font-medium">{row.dimension}</td>
                    <td className="py-4 px-4 text-foreground font-medium">{row.aerelion}</td>
                    <td className="py-4 px-4 text-muted-foreground">{row.agencies}</td>
                    <td className="py-4 px-4 text-muted-foreground">{row.saas}</td>
                    <td className="py-4 px-4 text-muted-foreground">{row.freelancers}</td>
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

      {/* CTA */}
      <section className="section-padding">
        <div className="container-narrow text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0} variants={fadeUp}>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl mb-6">Ready to remove the ceiling?</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-10 leading-relaxed">Book a confidential briefing. We'll map your operational friction and show you exactly what an installed system looks like.</p>
            <Link to="/contact" className="btn-primary">Request a Briefing <ArrowRight className="w-4 h-4" /></Link>
          </motion.div>
        </div>
      </section>
    </main>
  );
};

export default Home;
