import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import type { Variants } from 'framer-motion';

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.6 } }),
};

const TIERS = [
  { tier: '01', name: 'Intake & Qualification Engine', price: '$4,500 – $7,500', timeline: '30-day delivery guarantee', benchmark: '90%+ of incoming inquiries handled without owner involvement', description: 'An AI-powered front-of-funnel system that captures lead data, qualifies against custom criteria, auto-routes to the appropriate workflow, sends personalized intake materials, and logs everything into the operator\'s CRM with zero manual intervention.', includes: ['GPT-based intake assistant', 'Form-to-CRM automation', 'Conditional routing logic', 'Onboarding sequence'] },
  { tier: '02', name: 'Delivery Operations Stack', price: '$12,000 – $22,000', timeline: '45-day delivery guarantee', benchmark: 'Proposal-to-signed contract time reduced by minimum 50%', description: 'A mid-engagement intelligence layer that automates proposal generation, client onboarding, project milestone tracking, document assembly, and status communications — reducing delivery overhead by 40–60%.', includes: ['AI proposal engine', 'Automated onboarding sequences', 'Milestone tracking automations', 'Document generation'], featured: true },
  { tier: '03', name: 'Full Operating System Install', price: '$28,000 – $45,000', timeline: '60-day delivery guarantee', benchmark: 'Owner\'s operational time on admin tasks reduced by minimum 60%', description: 'End-to-end operational redesign. AERELION architects and installs a complete AI-native workflow infrastructure covering intake, delivery, reporting, billing triggers, and client communications.', includes: ['All Tier 1 and Tier 2 components', 'Reporting dashboards', 'Billing automation', 'AI meeting summaries', '30-day post-install support'] },
];

const TRIGGERS = [
  'A client left because your delivery process failed. You know nothing structural has changed.',
  'You hired to absorb the load. The load returned to you. The hire didn\'t fix the system.',
  'You\'re at capacity. Revenue isn\'t reflecting it. Process is consuming what growth should keep.',
  'A freelancer built automation. It broke. Nobody knows why. You rebuilt manually and absorbed the loss.',
  'You are the operational ceiling of your own business. Nothing scales past you until a system exists that doesn\'t need you.',
];

const ICP = [
  { attribute: 'Annual Revenue', value: '$300K – $3M' },
  { attribute: 'Team Size', value: '1–8 people' },
  { attribute: 'Industry', value: 'Consulting, coaching, legal, financial advisory, marketing agencies, real estate' },
  { attribute: 'Mindset', value: 'Performance-obsessed; views operational friction as a solved problem they haven\'t solved yet' },
  { attribute: 'Decision Driver', value: 'Speed and certainty — not cost. Wants the outcome guaranteed, not the work quoted' },
  { attribute: 'Engagement Trigger', value: 'Recent bottleneck — hiring failure, delivery breakdown, or client churn due to process gaps' },
];

const Services = () => {
  return (
    <main className="pt-24">
      <Helmet>
        <title>Services — AERELION | AI Automation Installation Tiers</title>
        <meta name="description" content="Three tiers of operational intelligence: Intake Engine ($4,500–$7,500), Delivery Stack ($12,000–$22,000), Full OS Install ($28,000–$45,000). Fixed-scope with performance benchmarks." />
        <link rel="canonical" href="https://aerelion.systems/services" />
      </Helmet>

      <section className="section-padding pb-16">
        <div className="container-narrow">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0} variants={fadeUp}>
            <p className="text-xs font-mono uppercase tracking-[0.25em] text-primary mb-4">Service Architecture</p>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl mb-6 max-w-4xl">Three tiers of operational intelligence.</h1>
            <p className="text-muted-foreground text-lg max-w-2xl leading-relaxed">Fixed-scope engagements with defined performance benchmarks. If we don't hit them, we keep working at no additional charge.</p>
          </motion.div>
        </div>
      </section>

      {/* Tier Cards */}
      <section className="px-6 md:px-12 lg:px-20 pb-20">
        <div className="container-narrow space-y-8">
          {TIERS.map((tier, i) => (
            <motion.div key={tier.tier} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i} variants={fadeUp}
              className={`card-premium p-8 md:p-12 ${tier.featured ? 'border-primary/30' : ''}`}>
              <div className="flex flex-col lg:flex-row gap-8">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-xs font-mono text-primary">Tier {tier.tier}</span>
                    {tier.featured && <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 bg-primary/10 text-primary border border-primary/20">Most Popular</span>}
                  </div>
                  <h2 className="font-display text-2xl md:text-3xl mb-4">{tier.name}</h2>
                  <p className="text-muted-foreground leading-relaxed mb-6">{tier.description}</p>
                  <div className="space-y-2">
                    {tier.includes.map((item) => (
                      <div key={item} className="flex items-center gap-3 text-sm text-secondary-foreground">
                        <Check className="w-4 h-4 text-primary shrink-0" />{item}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="lg:w-64 shrink-0 lg:border-l lg:border-border lg:pl-8 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div><p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-1">Investment</p><p className="font-display text-xl text-foreground">{tier.price}</p></div>
                    <div>
                      <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-1">Timeline</p>
                      <p className="text-sm font-mono font-medium text-primary bg-primary/10 px-3 py-1 border border-primary/20 inline-block">{tier.timeline}</p>
                    </div>
                    <div><p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-1">Benchmark</p><p className="text-sm text-primary">{tier.benchmark}</p></div>
                    <p className="text-[11px] text-muted-foreground italic">If we don't hit the benchmark, we keep working. No additional charge.</p>
                  </div>
                  <Link to="/contact" className="btn-primary mt-8 text-center text-xs">Discuss This Tier <ArrowRight className="w-4 h-4" /></Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Retainer */}
      <section className="section-padding bg-card border-y border-border">
        <div className="container-narrow">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0} variants={fadeUp}
            className="card-premium p-8 md:p-12 border-primary/20">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
              <div>
                <p className="text-xs font-mono uppercase tracking-[0.25em] text-primary mb-4">Post-Install</p>
                <h2 className="font-display text-2xl md:text-3xl mb-3">Maintenance & Optimization Retainer</h2>
              </div>
              <p className="font-display text-2xl text-foreground shrink-0">$1,200 – $3,500/mo</p>
            </div>
            <div className="space-y-6 text-muted-foreground leading-relaxed mb-8">
              <p>Every installed system is a living infrastructure. As your business evolves, your automation architecture should too. The retainer keeps your system monitored, calibrated, and expanding — without requiring you to manage it.</p>
              <p>Coverage includes monthly system performance review, automation failure monitoring and repair, workflow expansion as your operation grows, and priority access for new tier engagements.</p>
            </div>
            <div className="border border-primary/30 p-6 mb-6">
              <p className="text-foreground text-sm leading-relaxed">The retainer is not a support ticket system. Monitoring is continuous. Failures are flagged and repaired without requiring client initiation. This is operational stewardship, not reactive maintenance.</p>
            </div>
            <p className="text-foreground italic text-sm mb-6">Unlike subscription-based studios that require ongoing payment to keep your system functional — AERELION installs systems you own. The retainer is an expansion service. It is never a dependency.</p>
            <p className="text-[11px] text-muted-foreground">Available exclusively to post-install clients. Not offered as a standalone service.</p>
          </motion.div>
        </div>
      </section>

      {/* Activation Signal */}
      <section className="section-padding">
        <div className="container-narrow">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0} variants={fadeUp} className="mb-12">
            <p className="text-xs font-mono uppercase tracking-[0.25em] text-primary mb-4">Activation Signal</p>
            <h2 className="font-display text-3xl md:text-4xl mb-6 max-w-4xl">You're ready for AERELION when the cost of waiting exceeds the cost of acting.</h2>
          </motion.div>
          <div className="space-y-4">
            {TRIGGERS.map((t, i) => (
              <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i} variants={fadeUp}
                className="p-6 border border-border flex gap-4 md:gap-6 items-start">
                <span className="font-display text-2xl text-primary/40 shrink-0">{String(i + 1).padStart(2, '0')}</span>
                <p className="text-foreground text-sm leading-relaxed">{t}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ICP */}
      <section className="section-padding bg-card border-y border-border">
        <div className="container-narrow">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0} variants={fadeUp} className="mb-12">
            <p className="text-xs font-mono uppercase tracking-[0.25em] text-primary mb-4">Ideal Client Profile</p>
            <h2 className="font-display text-3xl md:text-4xl mb-6">Is this you?</h2>
            <p className="text-muted-foreground text-lg max-w-2xl leading-relaxed">AERELION serves a specific type of operator. Here's how we identify mutual fit.</p>
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

      {/* Pricing Philosophy */}
      <section className="section-padding">
        <div className="container-narrow">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0} variants={fadeUp} className="max-w-3xl">
            <p className="text-xs font-mono uppercase tracking-[0.25em] text-primary mb-4">Pricing Philosophy</p>
            <h2 className="font-display text-3xl md:text-4xl mb-8">Priced on transferred liability, not hours.</h2>
            <div className="space-y-6 text-muted-foreground text-lg leading-relaxed">
              <p>When an operator closes a Tier 2 engagement at $18,000, they are not purchasing 60 hours of automation work. They are purchasing the elimination of a 12-hour-per-week operational drag — a problem costing them $75,000 in lost capacity annually.</p>
              <p>The price is not high. The ROI is compressive. The client does not buy a product. They transfer a burden.</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-card border-t border-border text-center">
        <div className="container-narrow">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0} variants={fadeUp}>
            <h2 className="font-display text-3xl md:text-4xl mb-6">Find the right tier for your operation.</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-10">Book a briefing and we'll identify which installation tier matches your operational pressure.</p>
            <Link to="/contact" className="btn-primary">Request a Briefing <ArrowRight className="w-4 h-4" /></Link>
            <p className="text-[11px] text-muted-foreground mt-4">Confidential. No pitch. No obligation.</p>
          </motion.div>
        </div>
      </section>
    </main>
  );
};

export default Services;
