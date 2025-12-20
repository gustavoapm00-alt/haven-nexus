import { Link } from 'react-router-dom';
import { ArrowRight, Activity, AlertTriangle, RefreshCw, Eye, Users, FileText } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ScrollReveal from '@/components/ScrollReveal';
import SEO, { schemas } from '@/components/SEO';

const practices = [
  {
    icon: Activity,
    title: 'Comprehensive Logging',
    description: 'Every automated action is logged with timestamps, inputs, and outputs. When something happens—or doesn\'t—you can trace exactly what occurred.',
    detail: 'Logs are retained and searchable, giving you a clear audit trail for all system activity.'
  },
  {
    icon: AlertTriangle,
    title: 'Alerts & Monitoring',
    description: 'Systems are configured with alerts that notify you when something requires attention. No silent failures.',
    detail: 'Alerts are routed to appropriate channels (email, Slack, dashboard) based on severity and urgency.'
  },
  {
    icon: RefreshCw,
    title: 'Automatic Retries',
    description: 'Transient failures (API timeouts, temporary outages) are handled with intelligent retry logic before escalating.',
    detail: 'Retry policies are configured per-action based on the type of operation and acceptable delay.'
  },
  {
    icon: Users,
    title: 'Human-in-the-Loop',
    description: 'Critical decisions or edge cases can be routed to a human for review before proceeding. Automation doesn\'t mean blind automation.',
    detail: 'You define the thresholds and conditions that require human approval.'
  },
  {
    icon: Eye,
    title: 'Observable State',
    description: 'Dashboards show the current state of your systems at a glance—what\'s running, what\'s pending, what\'s failed.',
    detail: 'Visibility builds trust. You should always know what your automation is doing.'
  },
  {
    icon: FileText,
    title: 'Documentation & Runbooks',
    description: 'Every deployed system comes with documentation explaining how it works and what to do if something goes wrong.',
    detail: 'Runbooks provide step-by-step guidance for common issues, reducing dependency on AERELION for routine troubleshooting.'
  }
];

const Reliability = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Reliability Practices"
        description="How AERELION ensures automation reliability: logging, alerts, retries, human-in-loop, and observable systems. Trust comes from visibility."
        keywords="automation reliability, system monitoring, logging, alerts, human-in-loop automation"
        canonicalUrl="/reliability"
        structuredData={schemas.breadcrumb([
          { name: 'Home', url: '/' },
          { name: 'Reliability', url: '/reliability' }
        ])}
      />
      <Navbar />
      
      <main className="pt-24">
        {/* Hero */}
        <section className="section-padding">
          <div className="container-main">
            <ScrollReveal>
              <div className="text-center max-w-3xl mx-auto">
                <span className="tag-chip mb-6">How We Build</span>
                <h1 className="font-display text-5xl md:text-6xl mb-6">
                  RELIABILITY <span className="text-gradient">PRACTICES</span>
                </h1>
                <p className="text-xl text-muted-foreground">
                  Automation you can trust. Because trust comes from visibility, not promises.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Philosophy */}
        <section className="section-padding pt-0">
          <div className="container-main max-w-3xl">
            <ScrollReveal>
              <div className="card-glass p-8 rounded-lg text-center">
                <p className="text-lg text-muted-foreground">
                  We don't promise that nothing will ever break. We promise that when something does, 
                  you'll know about it, you'll understand what happened, and you'll know what to do next.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Practices Grid */}
        <section className="section-padding bg-card/30">
          <div className="container-main">
            <ScrollReveal>
              <div className="mb-12">
                <h2 className="font-display text-3xl mb-4">What We Build Into Every System</h2>
              </div>
            </ScrollReveal>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {practices.map((practice, index) => (
                <ScrollReveal key={index} delay={index * 0.1}>
                  <div className="card-glass p-6 rounded-lg h-full">
                    <practice.icon className="h-10 w-10 text-primary mb-4" />
                    <h3 className="font-display text-xl mb-3">{practice.title}</h3>
                    <p className="text-muted-foreground mb-3">{practice.description}</p>
                    <p className="text-sm text-muted-foreground/70 italic">{practice.detail}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* What Happens When... */}
        <section className="section-padding">
          <div className="container-main max-w-4xl">
            <ScrollReveal>
              <div className="text-center mb-12">
                <h2 className="font-display text-3xl md:text-4xl mb-4">
                  WHAT HAPPENS WHEN SOMETHING <span className="text-gradient">BREAKS</span>?
                </h2>
              </div>
            </ScrollReveal>

            <div className="space-y-6">
              <ScrollReveal delay={0.1}>
                <div className="card-glass p-6 rounded-lg">
                  <h3 className="font-display text-lg mb-2 text-primary">1. Detection</h3>
                  <p className="text-muted-foreground">
                    The system detects the failure immediately through built-in health checks and monitoring. 
                    An alert is generated and logged.
                  </p>
                </div>
              </ScrollReveal>

              <ScrollReveal delay={0.15}>
                <div className="card-glass p-6 rounded-lg">
                  <h3 className="font-display text-lg mb-2 text-primary">2. Retry (if applicable)</h3>
                  <p className="text-muted-foreground">
                    For transient failures, the system attempts automatic retries with exponential backoff. 
                    Many issues resolve themselves without human intervention.
                  </p>
                </div>
              </ScrollReveal>

              <ScrollReveal delay={0.2}>
                <div className="card-glass p-6 rounded-lg">
                  <h3 className="font-display text-lg mb-2 text-primary">3. Escalation</h3>
                  <p className="text-muted-foreground">
                    If retries fail, the issue is escalated via your configured alert channel. 
                    You receive context about what failed and why.
                  </p>
                </div>
              </ScrollReveal>

              <ScrollReveal delay={0.25}>
                <div className="card-glass p-6 rounded-lg">
                  <h3 className="font-display text-lg mb-2 text-primary">4. Diagnosis</h3>
                  <p className="text-muted-foreground">
                    Logs provide a complete trace of the failed operation. The runbook guides you through 
                    common resolution steps.
                  </p>
                </div>
              </ScrollReveal>

              <ScrollReveal delay={0.3}>
                <div className="card-glass p-6 rounded-lg">
                  <h3 className="font-display text-lg mb-2 text-primary">5. Resolution</h3>
                  <p className="text-muted-foreground">
                    You resolve the issue using the runbook, or escalate to AERELION support if needed. 
                    The system resumes normal operation.
                  </p>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="section-padding bg-card/30">
          <div className="container-main">
            <ScrollReveal>
              <div className="text-center">
                <h2 className="font-display text-4xl md:text-5xl mb-6">
                  READY FOR SYSTEMS YOU CAN <span className="text-gradient">TRUST</span>?
                </h2>
                <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
                  We build reliability into every system we deploy. Let's talk about your operations.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Link to="/get-started" className="btn-primary">
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                  <Link to="/proof" className="btn-secondary">
                    See Our Work
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

export default Reliability;
