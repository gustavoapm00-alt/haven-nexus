import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Workflow, Eye, FileText, Layers, CircuitBoard, Search, Compass } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ScrollReveal from '@/components/ScrollReveal';
import SEO from '@/components/SEO';

const capabilities = [
  {
    icon: Workflow,
    title: 'Automated Workflows',
    description: 'Replace manual operations with automated workflows that handle repetitive tasks consistently.'
  },
  {
    icon: CircuitBoard,
    title: 'AI-Assisted Routing',
    description: 'Offload routine decisions with AI classification and routing for operational tasks.'
  },
  {
    icon: Layers,
    title: 'Tool Orchestration',
    description: 'Connect your existing tools into one coherent system instead of fragmented chaos.'
  },
  {
    icon: Eye,
    title: 'Operational Visibility',
    description: 'Dashboards that show what\'s happening across your operations in real time.'
  },
  {
    icon: FileText,
    title: 'Documented Processes',
    description: 'Systems that run on documentation, not memory. Remove dependency on tribal knowledge.'
  }
];

const entryModes = [
  {
    icon: Compass,
    title: 'Guided System Deployment',
    subtitle: 'Primary Engagement',
    description: 'We design and deploy operational systems for you. Assessment, architecture, implementation, and handoff—all handled.',
    whoFor: 'Operators overwhelmed by manual work who want relief and systems that run without them.',
    cta: { label: 'Request Deployment', href: '/get-started?mode=deployment' },
    highlight: true
  },
  {
    icon: Search,
    title: 'System Audit & Diagnosis',
    subtitle: 'Clarity First',
    description: 'Not sure what\'s broken? We review your current workflows, identify friction points, and deliver a clear diagnosis with recommendations.',
    whoFor: 'Operators who need clarity before committing to a full deployment.',
    cta: { label: 'Request Audit', href: '/get-started?mode=audit' },
    highlight: false
  },
  {
    icon: Layers,
    title: 'Self-Serve Platform Access',
    subtitle: 'Autonomous Entry',
    description: 'Access prebuilt workflows, agent modules, and dashboards. Build and manage your own systems on the AERELION platform.',
    whoFor: 'Operators who prefer autonomy and want to explore at their own pace.',
    cta: { label: 'Explore Platform', href: '/pricing' },
    highlight: false
  }
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO 
        canonicalUrl="/" 
        description="AERELION Systems builds automation platforms that replace repetitive work and give business owners clarity and control." 
        keywords="automation systems, operational automation, workflow automation, AI routing, business systems, operational clarity"
      />
      <Navbar />
      
      <main>
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center section-padding pt-32">
          {/* Background Effects */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-accent/10 rounded-full blur-3xl" />
          </div>

          <div className="container-main relative z-10">
            <div className="max-w-4xl">
              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.6 }}
              >
                <span className="tag-chip mb-6">Automation Platform</span>
              </motion.div>

              <motion.h1 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.6, delay: 0.1 }} 
                className="font-display text-5xl md:text-6xl lg:text-7xl mb-6"
              >
                SYSTEMS THAT RUN.{' '}
                <span className="text-gradient">CLARITY YOU FEEL.</span>
              </motion.h1>

              <motion.p 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.6, delay: 0.2 }} 
                className="text-xl text-muted-foreground mb-10 max-w-2xl"
              >
                AERELION Systems builds automation platforms that replace repetitive work and give business owners clarity and control.
              </motion.p>

              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.6, delay: 0.3 }} 
                className="flex flex-wrap gap-4"
              >
                <Link to="/get-started?mode=deployment" className="btn-primary">
                  Request System Deployment
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                <Link to="/get-started?mode=audit" className="btn-secondary">
                  Request Audit
                </Link>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.6, delay: 0.4 }} 
                className="mt-6"
              >
                <Link 
                  to="/pricing" 
                  className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1"
                >
                  Or explore the platform →
                </Link>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Problem Recognition Section */}
        <section className="section-padding bg-card/30">
          <div className="container-main">
            <ScrollReveal>
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <h2 className="font-display text-3xl md:text-4xl mb-6">
                    OPERATIONS SHOULDN'T RUN ON MEMORY
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    You're competent—but you're overwhelmed. The business works because you hold it together. 
                    Leads slip. Tasks pile up. You're always reacting.
                  </p>
                  <ul className="space-y-3 text-muted-foreground">
                    <li className="flex items-start gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-destructive mt-2" />
                      Jumping between tools with no single source of truth
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-destructive mt-2" />
                      Manual follow-ups and decision fatigue draining your focus
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-destructive mt-2" />
                      Fear that growth will only create more chaos
                    </li>
                  </ul>
                </div>
                <div className="card-glass p-8 rounded-lg">
                  <h3 className="font-display text-2xl mb-4 text-gradient">SYSTEMS OVER HUSTLE</h3>
                  <p className="text-muted-foreground mb-4">
                    We design and deploy automation systems that remove repetitive work, 
                    offload routine decisions, and give you operational clarity.
                  </p>
                  <ul className="space-y-3 text-muted-foreground">
                    <li className="flex items-start gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                      Workflows that run operations without your constant input
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                      AI routing that handles routine classification and decisions
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                      Dashboards that show you what's happening, when it matters
                    </li>
                  </ul>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Capabilities Section */}
        <section className="section-padding">
          <div className="container-main">
            <ScrollReveal>
              <div className="text-center mb-16">
                <h2 className="font-display text-4xl md:text-5xl mb-4">
                  WHAT WE <span className="text-gradient">BUILD</span>
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Capabilities designed to reduce operational friction—not add complexity.
                </p>
              </div>
            </ScrollReveal>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {capabilities.map((capability, index) => (
                <ScrollReveal key={index} delay={index * 0.1}>
                  <div className="card-glass p-8 rounded-lg h-full">
                    <capability.icon className="h-12 w-12 text-primary mb-6" />
                    <h3 className="font-display text-2xl mb-4">{capability.title}</h3>
                    <p className="text-muted-foreground">{capability.description}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>

            <ScrollReveal delay={0.3}>
              <div className="text-center mt-12">
                <Link to="/capabilities" className="btn-secondary">
                  View All Capabilities
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Entry Modes Section */}
        <section className="section-padding bg-card/30">
          <div className="container-main">
            <ScrollReveal>
              <div className="text-center mb-16">
                <span className="tag-chip mb-4">How to Engage</span>
                <h2 className="font-display text-4xl md:text-5xl mb-4">
                  ENTRY <span className="text-gradient">MODES</span>
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Three clear ways to work with AERELION—based on your needs and level of involvement.
                </p>
              </div>
            </ScrollReveal>

            <div className="grid md:grid-cols-3 gap-8">
              {entryModes.map((mode, index) => (
                <ScrollReveal key={index} delay={index * 0.1}>
                  <div className={`card-glass p-8 rounded-lg h-full flex flex-col ${
                    mode.highlight ? 'border-primary/50 ring-2 ring-primary/20' : ''
                  }`}>
                    {mode.highlight && (
                      <div className="mb-4">
                        <span className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                          Recommended
                        </span>
                      </div>
                    )}
                    <mode.icon className={`h-10 w-10 mb-4 ${mode.highlight ? 'text-primary' : 'text-muted-foreground'}`} />
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{mode.subtitle}</p>
                    <h3 className="font-display text-2xl mb-3">{mode.title}</h3>
                    <p className="text-muted-foreground mb-4 flex-grow">{mode.description}</p>
                    <p className="text-sm text-muted-foreground/80 mb-6 italic">
                      For: {mode.whoFor}
                    </p>
                    <Link 
                      to={mode.cta.href} 
                      className={mode.highlight ? 'btn-primary w-full justify-center' : 'btn-secondary w-full justify-center'}
                    >
                      {mode.cta.label}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* Boundaries Section */}
        <section className="section-padding">
          <div className="container-main max-w-4xl">
            <ScrollReveal>
              <div className="text-center mb-12">
                <h2 className="font-display text-3xl md:text-4xl mb-4">
                  WHAT WE <span className="text-gradient">DON'T</span> DO
                </h2>
                <p className="text-muted-foreground">
                  Clear boundaries make for better partnerships.
                </p>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="card-glass p-6 rounded-lg">
                  <p className="text-muted-foreground">
                    <span className="text-foreground font-medium">We don't promise autonomous businesses.</span>{' '}
                    Systems reduce work—they don't replace leadership.
                  </p>
                </div>
                <div className="card-glass p-6 rounded-lg">
                  <p className="text-muted-foreground">
                    <span className="text-foreground font-medium">We don't replace strategy.</span>{' '}
                    We solve operational friction, not business direction.
                  </p>
                </div>
                <div className="card-glass p-6 rounded-lg">
                  <p className="text-muted-foreground">
                    <span className="text-foreground font-medium">We don't chase trends.</span>{' '}
                    Every capability exists to serve a real operational need.
                  </p>
                </div>
                <div className="card-glass p-6 rounded-lg">
                  <p className="text-muted-foreground">
                    <span className="text-foreground font-medium">We don't guarantee outcomes.</span>{' '}
                    We build reliable systems—results depend on how they're used.
                  </p>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* CTA Section */}
        <section className="section-padding bg-card/30">
          <div className="container-main">
            <ScrollReveal>
              <div className="card-glass p-12 md:p-16 rounded-lg text-center">
                <h2 className="font-display text-4xl md:text-5xl mb-6">
                  READY FOR <span className="text-gradient">CLARITY</span>?
                </h2>
                <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
                  Tell us where operations feel stuck. We'll help you find the right path forward.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Link to="/get-started?mode=deployment" className="btn-primary">
                    Request System Deployment
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                  <Link to="/get-started?mode=audit" className="btn-secondary">
                    Request Audit
                  </Link>
                </div>
                <p className="mt-6 text-sm text-muted-foreground">
                  Prefer to explore on your own?{' '}
                  <Link to="/pricing" className="text-primary hover:underline">
                    View platform access →
                  </Link>
                </p>
              </div>
            </ScrollReveal>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
