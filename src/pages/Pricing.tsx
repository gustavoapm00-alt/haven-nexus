import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Loader2, Eye, Wrench, Compass } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ScrollReveal from '@/components/ScrollReveal';
import SEO, { schemas } from '@/components/SEO';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';

const entryModes = [
  {
    key: 'deployment',
    name: 'Guided System Deployment',
    icon: Wrench,
    description: 'AERELION designs and deploys your operational systems. Full architecture, workflows, dashboards, and documentation with handoff.',
    includes: [
      'Operational assessment',
      'System architecture & deployment',
      'Automated workflows & agents',
      'Dashboards for visibility',
      'Documentation & handoff'
    ],
    excludes: [
      'Running your business',
      'Strategic leadership decisions',
      'Indefinite custom work'
    ],
    role: 'System Architect & Deployer',
    cta: 'Start System Deployment',
    ctaLink: '/get-started?mode=deployment',
    highlight: true,
    badge: 'Primary Entry Mode'
  },
  {
    key: 'audit',
    name: 'System Audit & Diagnosis',
    icon: Eye,
    description: 'Not sure what\'s broken? We review your current workflows and tools, identify friction points, and provide a clear diagnosis with recommendations.',
    includes: [
      'Current workflow review',
      'Tool & process audit',
      'Friction identification',
      'System diagnosis',
      'Recommendations report'
    ],
    excludes: [
      'Implementation',
      'Ongoing engagement'
    ],
    role: 'System Analyst',
    cta: 'Request Audit',
    ctaLink: '/get-started?mode=audit',
    highlight: false
  },
  {
    key: 'platform',
    name: 'Self-Serve Platform Access',
    icon: Compass,
    description: 'For operators who prefer autonomy. Access prebuilt workflows, agents, and dashboards on your own terms.',
    includes: [
      'Platform access',
      'Prebuilt workflows & agents',
      'Operational dashboards'
    ],
    excludes: [
      'Custom design',
      'Hands-on deployment',
      'Ongoing human involvement'
    ],
    role: 'Platform Provider',
    cta: 'Explore Platform',
    ctaLink: '/get-started?mode=platform',
    highlight: false
  }
];

const faqs = [
  {
    q: 'How do I know which entry mode is right for me?',
    a: 'If you\'re overwhelmed and need operational relief, start with Guided System Deployment. If you\'re unsure what\'s broken, choose System Audit & Diagnosis. If you prefer self-directed exploration, Self-Serve Platform Access is available.'
  },
  {
    q: 'What is an Entry Mode?',
    a: 'Entry Modes define how you engage with AERELION — the level of involvement, scope of responsibility, and what to expect. They are not packages or hourly rates.'
  },
  {
    q: 'Do you guarantee outcomes or revenue growth?',
    a: 'No. AERELION builds operational systems that reduce friction and provide clarity. We do not promise revenue outcomes or business results — only well-designed systems.'
  },
  {
    q: 'Can I start with an audit and move to deployment later?',
    a: 'Absolutely. Many clients start with a System Audit to gain clarity, then progress to Guided System Deployment when ready.'
  },
  {
    q: 'What happens after deployment?',
    a: 'After handoff, you own and operate the system. Self-Serve Platform Access is available for ongoing visibility and prebuilt tools. Additional deployments can be scoped separately.'
  }
];

const Pricing = () => {
  const { user } = useAuth();
  const { subscribed } = useSubscription();
  const navigate = useNavigate();

  const faqSchema = schemas.faqPage(faqs.map(f => ({ question: f.q, answer: f.a })));

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Entry Modes"
        description="Choose how to engage with AERELION Systems. From guided system deployment to self-serve platform access, find the right path for your operational needs."
        keywords="automation engagement, system deployment, operational audit, workflow platform"
        canonicalUrl="/pricing"
        structuredData={[
          schemas.breadcrumb([{ name: 'Home', url: '/' }, { name: 'Entry Modes', url: '/pricing' }]),
          faqSchema
        ]}
      />
      <Navbar />
      
      <main className="pt-24">
        {/* Hero */}
        <section className="section-padding">
          <div className="container-main">
            <ScrollReveal>
              <div className="text-center max-w-3xl mx-auto">
                <span className="tag-chip mb-6">Entry Modes</span>
                <h1 className="font-display text-5xl md:text-6xl mb-6">
                  HOW TO <span className="text-gradient">ENGAGE</span>
                </h1>
                <p className="text-xl text-muted-foreground">
                  Entry Modes define your level of involvement and what to expect. 
                  Choose based on your current operational state.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Entry Modes Grid */}
        <section className="section-padding pt-0">
          <div className="container-main">
            <div className="grid lg:grid-cols-3 gap-8">
              {entryModes.map((mode, index) => (
                <ScrollReveal key={mode.key} delay={index * 0.1}>
                  <div className={`card-glass p-8 rounded-lg h-full flex flex-col relative ${
                    mode.highlight ? 'border-primary/50 ring-2 ring-primary/20' : ''
                  }`}>
                    {mode.badge && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="bg-primary text-primary-foreground text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider">
                          {mode.badge}
                        </span>
                      </div>
                    )}
                    
                    <mode.icon className={`h-10 w-10 mb-4 ${mode.highlight ? 'text-primary' : 'text-muted-foreground'}`} />
                    <h3 className="font-display text-2xl mb-2">{mode.name}</h3>
                    <p className="text-muted-foreground mb-6 text-sm">{mode.description}</p>
                    
                    <div className="mb-4">
                      <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">AERELION's Role</p>
                      <p className="text-sm font-medium text-primary">{mode.role}</p>
                    </div>

                    <div className="mb-4">
                      <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Includes</p>
                      <ul className="space-y-1">
                        {mode.includes.map((item, idx) => (
                          <li key={idx} className="text-sm text-foreground/80 flex items-start gap-2">
                            <span className="text-primary mt-1">•</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mb-6 flex-grow">
                      <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Does Not Include</p>
                      <ul className="space-y-1">
                        {mode.excludes.map((item, idx) => (
                          <li key={idx} className="text-sm text-muted-foreground/70 flex items-start gap-2">
                            <span className="text-muted-foreground/50 mt-1">–</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <Link
                      to={mode.ctaLink}
                      className={`${mode.highlight ? 'btn-primary' : 'btn-secondary'} w-full justify-center`}
                    >
                      {mode.cta}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* Not Sure Section */}
        <section className="section-padding">
          <div className="container-main">
            <ScrollReveal>
              <div className="card-glass p-8 md:p-12 rounded-lg text-center max-w-3xl mx-auto">
                <h2 className="font-display text-3xl mb-4">Not Sure Where to Start?</h2>
                <p className="text-muted-foreground mb-6">
                  Answer a few questions about your operational state and we'll route you 
                  to the right entry mode. No commitment, no pressure.
                </p>
                <Link to="/get-started" className="btn-primary">
                  Take the Intake Assessment
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Existing Subscribers */}
        {subscribed && (
          <section className="section-padding pt-0">
            <div className="container-main">
              <ScrollReveal>
                <div className="card-glass p-6 rounded-lg text-center max-w-xl mx-auto">
                  <p className="text-muted-foreground mb-4">
                    You have an active subscription.
                  </p>
                  <Link to="/dashboard" className="btn-secondary">
                    Go to Dashboard
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </div>
              </ScrollReveal>
            </div>
          </section>
        )}

        {/* FAQs */}
        <section className="section-padding">
          <div className="container-main max-w-3xl">
            <ScrollReveal>
              <h2 className="font-display text-3xl text-center mb-12">
                Common Questions
              </h2>
            </ScrollReveal>
            
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <ScrollReveal key={index} delay={index * 0.05}>
                  <details className="card-glass rounded-lg group">
                    <summary className="p-6 cursor-pointer list-none flex items-center justify-between">
                      <span className="font-medium pr-4">{faq.q}</span>
                      <span className="text-primary transition-transform group-open:rotate-45 text-xl">+</span>
                    </summary>
                    <div className="px-6 pb-6 pt-0 text-muted-foreground text-sm">
                      {faq.a}
                    </div>
                  </details>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* Boundaries */}
        <section className="section-padding bg-muted/5">
          <div className="container-main text-center max-w-2xl">
            <ScrollReveal>
              <h2 className="font-display text-2xl mb-4">What AERELION Does Not Do</h2>
              <p className="text-muted-foreground text-sm">
                We do not promise autonomous businesses, replace leadership or strategy, 
                sell generic tools, or guarantee revenue outcomes. We build systems that 
                reduce operational friction — nothing more, nothing less.
              </p>
            </ScrollReveal>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Pricing;
