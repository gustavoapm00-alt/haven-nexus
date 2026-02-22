import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import type { Variants } from 'framer-motion';

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.6 } })
};

const PHASES = [
{ number: '01', name: 'System Audit', timeline: 'Days 1–3', deliverable: 'Operational map identifying all manual friction points, current tools, and priority leverage zones.' },
{ number: '02', name: 'Architecture Design', timeline: 'Days 4–8', deliverable: 'Signed-off system blueprint with tool selection, integration logic, and performance benchmarks.' },
{ number: '03', name: 'Build & Integration', timeline: 'Days 9–22', deliverable: 'Full system build inside your existing stack — no rip-and-replace.' },
{ number: '04', name: 'Activation & Testing', timeline: 'Days 23–28', deliverable: 'Live system testing with real data. Operator walkthrough and handoff documentation.' },
{ number: '05', name: 'Benchmark Confirmation', timeline: 'Day 30', deliverable: 'Performance measurement against agreed benchmarks. Retainer offer extended if applicable.' }];


const STANDARDS = [
'Every system must run without the operator\'s daily intervention.',
'Every integration must be documented in plain English for the client.',
'Every benchmark must be measurable within 30 days of activation.'];


const TECH_STACK = [
{ category: 'Orchestration', tools: 'Make.com, n8n, Zapier — selected per client stack' },
{ category: 'AI Layer', tools: 'OpenAI GPT-4 / Claude API for conversational and generative components' },
{ category: 'CRM Integration', tools: 'HubSpot, GoHighLevel, Salesforce, Notion — per client environment' }];


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

      <section className="px-6 md:px-12 lg:px-20 pb-20">
        <div className="container-narrow">
          <div className="relative">
            <div className="absolute left-6 md:left-8 top-0 bottom-0 w-px bg-border" />
            <div className="space-y-12">
              {PHASES.map((phase, i) =>
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
                    <p className="text-muted-foreground leading-relaxed">{phase.deliverable}</p>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Technology Stack */}
      


















      <section className="section-padding bg-card border-b border-border">
        <div className="container-narrow">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0} variants={fadeUp}>
            <p className="text-xs font-mono uppercase tracking-[0.25em] text-primary mb-4">Non-Negotiable Standards</p>
            <h2 className="font-display text-3xl md:text-4xl mb-10">Quality constraints we never compromise.</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {STANDARDS.map((s, i) =>
            <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i} variants={fadeUp} className="card-premium p-8">
                <p className="font-display text-3xl text-primary/20 mb-4">{String(i + 1).padStart(2, '0')}</p>
                <p className="text-foreground leading-relaxed">{s}</p>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      <section className="section-padding text-center">
        <div className="container-narrow">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0} variants={fadeUp}>
            <h2 className="font-display text-3xl md:text-4xl mb-6">Start with a System Audit.</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-10">We'll map your operational friction points and show you exactly where time is leaking.</p>
            <Link to="/contact" className="btn-primary">Request a Briefing <ArrowRight className="w-4 h-4" /></Link>
          </motion.div>
        </div>
      </section>
    </main>);

};

export default HowItWorks;