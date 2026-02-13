import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Target, Zap, Building2, Handshake } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SEO, { schemas } from '@/components/SEO';
import { motion } from 'framer-motion';

const About = () => {
  const principles = [
    {
      icon: Target,
      title: 'Outcome Accountability',
      description: 'Every engagement delivers measurable stabilization. Metrics are structural, not aspirational.',
    },
    {
      icon: Shield,
      title: 'Operator Liability',
      description: 'Execution failures are absorbed internally. The authorizing entity is shielded from operational variance.',
    },
    {
      icon: Handshake,
      title: 'Governance Transparency',
      description: 'All protocol parameters, execution timelines, and system dependencies are documented and accessible.',
    },
  ];

  const capabilities = [
    {
      icon: Building2,
      title: 'Infrastructure Under Governance',
      points: [
        'TLS 1.3 enforced — HTTPS-only transmission',
        'AES-256-GCM credential vaulting via Edge Functions',
        'Zero-Trust access: RLS + Behavioral Biometrics (THS)',
        'Global token revocation in <60 seconds',
      ],
    },
    {
      icon: Zap,
      title: 'Operational Execution',
      points: [
        'System configuration and deployment',
        'Ongoing stabilization and maintenance',
        'Anomaly detection and resolution',
        'Performance optimization cycles',
      ],
    },
    {
      icon: Shield,
      title: 'Governance Provisions',
      points: [
        'Dedicated operator per engagement',
        'Periodic status reporting',
        'Escalation and intervention protocols',
        'Knowledge transfer on handoff',
      ],
    },
  ];

  const aboutStructuredData = [
    schemas.organization,
    schemas.breadcrumb([
      { name: 'Home', url: '/' },
      { name: 'About', url: '/about' }
    ]),
    schemas.webPage(
      "About AERELION Systems",
      "Operational doctrine and provenance of AERELION's regulator model",
      "/about"
    )
  ];

  return (
    <>
      <SEO
        title="Operational Doctrine & Provenance – AERELION Systems"
        description="AERELION Systems operates as a governed infrastructure layer for institutional operations. The Regulator Model: configuration, deployment, and stabilization under permanent oversight."
        keywords="AERELION, operational doctrine, regulator model, managed infrastructure, governance protocols"
        canonicalUrl="/about"
        structuredData={aboutStructuredData}
      />

      <div className="min-h-screen bg-[#0F0F0F]">
        {/* Hero */}
        <section className="section-padding !pt-12">
          <div className="container-main max-w-3xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="font-mono text-[9px] text-[#39FF14]/50 uppercase tracking-[0.25em] mb-3 block">
                // PROVENANCE
              </span>
              <h1 className="font-mono text-3xl md:text-4xl font-semibold text-[#E0E0E0] mb-4">
                OPERATIONAL DOCTRINE & PROVENANCE
              </h1>
              <p className="text-white/40 text-sm leading-relaxed max-w-xl mx-auto">
                AERELION Systems operates as a governed infrastructure layer—configuring, 
                deploying, and stabilizing operational protocols under permanent oversight. 
                Complexity is managed, not delegated.
              </p>
            </motion.div>
          </div>
        </section>

        {/* The Regulator Model */}
        <section className="section-padding !pt-0">
          <div className="container-main max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="border border-white/10 bg-[#0F0F0F] p-8 md:p-10"
            >
              <h2 className="font-mono text-sm text-[#E0E0E0] uppercase tracking-[0.2em] mb-4">
                THE REGULATOR MODEL
              </h2>
              <p className="text-white/40 text-sm mb-6 leading-relaxed">
                Standard automation tooling requires the authorizing entity to assume 
                operational burden—learning platforms, building logic, maintaining connections, 
                and troubleshooting failure states. AERELION inverts this architecture.
              </p>
              <p className="text-white/40 text-sm mb-6 leading-relaxed">
                We operate protocol infrastructure on behalf of the authorizing entity. 
                Operational outcomes are defined during the briefing phase—AERELION configures, 
                deploys, and maintains the systems that deliver those outcomes under governed oversight.
              </p>
              <p className="font-mono text-xs text-[#E0E0E0]/80">
                Authorization provisions outcomes. AERELION governs execution.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Principles */}
        <section className="section-padding border-t border-white/5">
          <div className="container-main max-w-4xl">
            <div className="text-center mb-10">
              <span className="font-mono text-[9px] text-[#39FF14]/50 uppercase tracking-[0.25em] mb-2 block">
                // OPERATING_PRINCIPLES
              </span>
              <h2 className="font-mono text-xl text-[#E0E0E0] mb-3">
                Governance Framework
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {principles.map((principle, index) => (
                <motion.div
                  key={principle.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="border border-white/10 bg-[#0F0F0F] p-6"
                >
                  <div className="w-10 h-10 border border-[rgba(57,255,20,0.15)] flex items-center justify-center mb-4">
                    <principle.icon className="w-5 h-5 text-[#39FF14]/50" />
                  </div>
                  <h3 className="font-mono text-xs text-[#E0E0E0] mb-2 uppercase tracking-wider">{principle.title}</h3>
                  <p className="text-[10px] text-white/30 leading-relaxed">{principle.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* SYSTEM_SCHEMATICS */}
        <section className="section-padding border-t border-white/5">
          <div className="container-main max-w-5xl">
            <div className="text-center mb-10">
              <span className="font-mono text-[9px] text-[#39FF14]/50 uppercase tracking-[0.25em] mb-2 block">
                // CAPABILITIES
              </span>
              <h2 className="font-mono text-xl text-[#E0E0E0] mb-3">
                SYSTEM_SCHEMATICS
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {capabilities.map((capability, index) => (
                <motion.div
                  key={capability.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="border border-white/10 bg-[#0F0F0F] p-6"
                >
                  <div className="w-10 h-10 border border-[rgba(57,255,20,0.15)] flex items-center justify-center mb-4">
                    <capability.icon className="w-5 h-5 text-[#39FF14]/50" />
                  </div>
                  <h3 className="font-mono text-xs text-[#E0E0E0] mb-4 uppercase tracking-wider">{capability.title}</h3>
                  <ul className="space-y-2">
                    {capability.points.map((point) => (
                      <li key={point} className="text-[10px] text-white/30 flex items-start gap-2">
                        <span className="w-1 h-1 bg-[#39FF14]/30 mt-1.5 flex-shrink-0" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Who We Serve */}
        <section className="section-padding border-t border-white/5">
          <div className="container-main max-w-3xl text-center">
            <span className="font-mono text-[9px] text-[#39FF14]/50 uppercase tracking-[0.25em] mb-2 block">
              // SECTOR_ALIGNMENT
            </span>
            <h2 className="font-mono text-xl text-[#E0E0E0] mb-4">
              Institutional Infrastructure
            </h2>
            <p className="text-white/40 text-sm mb-6 leading-relaxed">
              AERELION is architected for professional services firms, government contractors, 
              and compliance-governed organizations—entities characterized by high operational 
              complexity, strict data governance, and constrained technical resources.
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="section-padding border-t border-white/5">
          <div className="container-main max-w-3xl">
            <div className="border border-white/10 bg-[#0F0F0F] p-8 md:p-10 text-center">
              <h2 className="font-mono text-sm text-[#E0E0E0] uppercase tracking-[0.2em] mb-3">
                REQUEST_SCOPING
              </h2>
              <p className="font-mono text-[10px] text-white/30 mb-6 max-w-xl mx-auto">
                Submit an authorization request to scope operational parameters and determine system alignment.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button asChild size="lg" className="bg-[#39FF14]/10 text-[#39FF14] border border-[rgba(57,255,20,0.3)] hover:bg-[#39FF14]/20 font-mono text-[10px] uppercase tracking-wider">
                  <Link to="/contact">
                    REQUEST OPERATIONAL BRIEFING
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="border-white/10 font-mono text-[10px] uppercase tracking-wider text-white/40 hover:text-white/60">
                  <Link to="/how-it-works">
                    VIEW DEPLOYMENT DOCTRINE
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default About;
