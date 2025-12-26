import { Link } from 'react-router-dom';
import { ArrowRight, Workflow, Eye, FileText, Layers, CircuitBoard, Compass, Search } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ScrollReveal from '@/components/ScrollReveal';
import SEO, { schemas } from '@/components/SEO';

// 5 Pillars aligned with SSOT
const capabilities = [
  {
    icon: Workflow,
    title: 'Automated Workflows',
    problem: 'Repetitive manual work',
    capability: 'Automated workflows replacing repetitive actions',
    outcome: 'Manual work removed from day-to-day operations'
  },
  {
    icon: CircuitBoard,
    title: 'AI-Assisted Routing',
    problem: 'Decision fatigue',
    capability: 'AI-assisted routing and classification for routine operational decisions',
    outcome: 'Routine decisions handled automatically; operator focuses on high-level work'
  },
  {
    icon: Layers,
    title: 'Tool Orchestration',
    problem: 'Tool overload and fragmentation',
    capability: 'Tool integration and orchestration',
    outcome: 'Tools work together instead of against each other'
  },
  {
    icon: Eye,
    title: 'Operational Visibility',
    problem: 'No visibility into operations',
    capability: 'Centralized operational dashboards',
    outcome: 'Operator can see what\'s happening at any moment'
  },
  {
    icon: FileText,
    title: 'Documented Processes',
    problem: 'Business runs on memory',
    capability: 'Systemized processes enforced by automation + documentation',
    outcome: 'Business operates on systems instead of memory'
  }
];

const entryModes = [
  {
    id: 'deployment',
    icon: Compass,
    title: 'Guided System Deployment',
    role: 'System Architect & Deployer',
    description: 'We take responsibility for designing and deploying your operational systems.',
    includes: [
      'Operational assessment',
      'System architecture and deployment',
      'Workflows and AI agents',
      'Dashboards for visibility',
      'Documentation and handoff'
    ],
    excludes: [
      'Running your business',
      'Strategic leadership decisions',
      'Indefinite custom work'
    ],
    whoFor: 'Operators who are overwhelmed and need systems designed and deployed for them.',
    cta: { label: 'Request Deployment', href: '/get-started?mode=deployment' },
    primary: true
  },
  {
    id: 'audit',
    icon: Search,
    title: 'System Audit & Diagnosis',
    role: 'System Analyst',
    description: 'We review your current state, identify friction, and deliver recommendations.',
    includes: [
      'Review of current workflows and tools',
      'Friction point identification',
      'System diagnosis',
      'Clear recommendations'
    ],
    excludes: [
      'Implementation',
      'Ongoing engagement (unless you choose to proceed)'
    ],
    whoFor: 'Operators who need clarity on what\'s broken before committing to deployment.',
    cta: { label: 'Request Audit', href: '/get-started?mode=audit' },
    primary: false
  },
  {
    id: 'platform',
    icon: Layers,
    title: 'Self-Serve Platform Access',
    role: 'Platform Provider',
    description: 'Access the AERELION platform and build your own systems.',
    includes: [
      'Platform access',
      'Prebuilt workflows and agents',
      'Dashboard tools'
    ],
    excludes: [
      'Custom design',
      'Hands-on deployment',
      'Ongoing human involvement'
    ],
    whoFor: 'Operators who prefer autonomy and want to explore or build on their own.',
    cta: { label: 'View Platform Plans', href: '/pricing' },
    primary: false
  }
];

const Capabilities = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Capabilities"
        description="AERELION builds automated workflows, AI routing, tool orchestration, operational dashboards, and documented processes. See how we reduce operational friction."
        keywords="automation capabilities, workflow automation, AI routing, operational dashboards, system deployment, tool orchestration"
        canonicalUrl="/capabilities"
        structuredData={schemas.breadcrumb([
          { name: 'Home', url: '/' },
          { name: 'Capabilities', url: '/capabilities' }
        ])}
      />
      <Navbar />
      
      <main className="pt-24">
        {/* Hero */}
        <section className="section-padding">
          <div className="container-main">
            <ScrollReveal>
              <div className="text-center max-w-3xl mx-auto">
                <span className="tag-chip mb-6">What We Build</span>
                <h1 className="font-display text-5xl md:text-6xl mb-6">
                  CAPABILITIES
                </h1>
                <p className="text-xl text-muted-foreground">
                  We build systems that run operations. Not tools. Not tasks. Systems.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* 5 Pillars - Capability Map */}
        <section className="section-padding pt-0">
          <div className="container-main">
            <ScrollReveal>
              <div className="mb-12">
                <h2 className="font-display text-3xl mb-4">The 5 Pillars: Problem → Capability → Outcome</h2>
                <p className="text-muted-foreground">
                  Every AERELION capability exists to reduce manual work, decision fatigue, and operational chaos.
                </p>
              </div>
            </ScrollReveal>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {capabilities.map((cap, index) => (
                <ScrollReveal key={index} delay={index * 0.05}>
                  <div className="card-glass p-6 rounded-lg h-full">
                    <div className="flex items-start gap-4">
                      <cap.icon className="h-8 w-8 text-primary shrink-0 mt-1" />
                      <div>
                        <h3 className="font-display text-xl mb-3">{cap.title}</h3>
                        <div className="space-y-2 text-sm">
                          <p>
                            <span className="text-destructive/80 font-medium">Problem:</span>{' '}
                            <span className="text-muted-foreground">{cap.problem}</span>
                          </p>
                          <p>
                            <span className="text-primary font-medium">Capability:</span>{' '}
                            <span className="text-muted-foreground">{cap.capability}</span>
                          </p>
                          <p>
                            <span className="text-green-500 font-medium">Outcome:</span>{' '}
                            <span className="text-muted-foreground">{cap.outcome}</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* Entry Modes Detail */}
        <section className="section-padding bg-card/30">
          <div className="container-main">
            <ScrollReveal>
              <div className="text-center mb-16">
                <span className="tag-chip mb-4">How to Engage</span>
                <h2 className="font-display text-4xl md:text-5xl mb-4">
                  ENTRY <span className="text-gradient">MODES</span>
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Entry Modes define how you work with AERELION—the scope, responsibility, and expectations.
                </p>
              </div>
            </ScrollReveal>

            <div className="space-y-8">
              {entryModes.map((mode, index) => (
                <ScrollReveal key={mode.id} delay={index * 0.1}>
                  <div className={`card-glass p-8 md:p-10 rounded-lg ${
                    mode.primary ? 'border-primary/50 ring-1 ring-primary/20' : ''
                  }`}>
                    <div className="grid md:grid-cols-3 gap-8">
                      {/* Left: Title & Description */}
                      <div>
                        {mode.primary && (
                          <span className="inline-block bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-4">
                            Primary Entry Mode
                          </span>
                        )}
                        <div className="flex items-center gap-3 mb-3">
                          <mode.icon className={`h-8 w-8 ${mode.primary ? 'text-primary' : 'text-muted-foreground'}`} />
                          <div>
                            <h3 className="font-display text-2xl">{mode.title}</h3>
                            <p className="text-sm text-muted-foreground">AERELION Role: {mode.role}</p>
                          </div>
                        </div>
                        <p className="text-muted-foreground mb-4">{mode.description}</p>
                        <p className="text-sm italic text-muted-foreground/80">
                          <span className="font-medium">For:</span> {mode.whoFor}
                        </p>
                      </div>

                      {/* Middle: Includes */}
                      <div>
                        <h4 className="font-medium text-sm uppercase tracking-wider text-primary mb-3">Includes</h4>
                        <ul className="space-y-2">
                          {mode.includes.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                              <span className="text-green-500 mt-0.5">✓</span>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Right: Excludes + CTA */}
                      <div className="flex flex-col">
                        <div className="flex-grow">
                          <h4 className="font-medium text-sm uppercase tracking-wider text-muted-foreground mb-3">Does Not Include</h4>
                          <ul className="space-y-2">
                            {mode.excludes.map((item, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground/70">
                                <span className="text-muted-foreground/50 mt-0.5">—</span>
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <Link 
                          to={mode.cta.href}
                          className={`mt-6 ${mode.primary ? 'btn-primary' : 'btn-secondary'} justify-center`}
                        >
                          {mode.cta.label}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* Boundaries */}
        <section className="section-padding">
          <div className="container-main max-w-4xl">
            <ScrollReveal>
              <div className="text-center mb-12">
                <h2 className="font-display text-3xl md:text-4xl mb-4">
                  CAPABILITY BOUNDARIES
                </h2>
                <p className="text-muted-foreground">
                  We solve operational friction, manual workload, and decision overload. That's it.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <div className="card-glass p-8 rounded-lg">
                <h3 className="font-display text-xl mb-4 text-center">What We Do NOT Solve</h3>
                <ul className="grid md:grid-cols-3 gap-4 text-center">
                  <li className="text-muted-foreground">Strategy decisions</li>
                  <li className="text-muted-foreground">Leadership problems</li>
                  <li className="text-muted-foreground">Revenue guarantees</li>
                </ul>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* CTA */}
        <section className="section-padding bg-card/30">
          <div className="container-main">
            <ScrollReveal>
              <div className="text-center">
                <h2 className="font-display text-4xl md:text-5xl mb-6">
                  READY TO <span className="text-gradient">ENGAGE</span>?
                </h2>
                <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
                  Tell us where you're feeling friction. We'll help route you to the right entry mode.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Link to="/get-started" className="btn-primary">
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Capabilities;