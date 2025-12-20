import { Link } from 'react-router-dom';
import { Zap, Settings, Layers, ArrowRight, Check, Clock, Calendar } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ScrollReveal from '@/components/ScrollReveal';
import SEO, { schemas } from '@/components/SEO';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface Offer {
  icon: React.ElementType;
  badge: 'LIVE' | 'COMING SOON';
  title: string;
  oneLiner: string;
  bullets: string[];
  included?: string[];
  timeline?: string;
  pricing?: string;
  primaryCta?: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
}

const offers: Offer[] = [
  {
    icon: Zap,
    badge: 'LIVE',
    title: 'AI Workflow Automation (14-Day Build)',
    oneLiner: 'We replace repetitive manual work with automated workflows in 14 days.',
    bullets: [
      'Lead intake → CRM → follow-up automation',
      'Fewer dropped leads and missed tasks',
      'Faster response time and cleaner pipeline visibility',
      'Dashboards + documented handoff'
    ],
    included: [
      'Intake forms + routing',
      'CRM setup or integration',
      'Email/SMS follow-ups (provider-agnostic)',
      'Task routing (ClickUp/Trello/Asana where applicable)',
      'Lightweight reporting dashboard',
      'SOP + handoff documentation'
    ],
    timeline: 'Day 1–2 Audit • Day 3–10 Build • Day 11–14 Launch',
    pricing: 'Starting at $1,500 • Optional monthly support',
    primaryCta: { label: 'Book a Free Automation Audit', href: '/contact' },
    secondaryCta: { label: 'See What We Automate', href: '#what-we-automate' }
  },
  {
    icon: Settings,
    badge: 'COMING SOON',
    title: 'Internal Ops Systems Buildout',
    oneLiner: 'We design your internal operating system—processes, SOPs, and reporting.',
    bullets: [
      'SOPs + process design',
      'Tool consolidation + dashboards',
      'Automation roadmap for teams'
    ],
    primaryCta: { label: 'Join the Waitlist', href: '/contact' }
  },
  {
    icon: Layers,
    badge: 'COMING SOON',
    title: 'AERELION OS / Agent Platform',
    oneLiner: 'A unified dashboard for reusable workflows and agent modules.',
    bullets: [
      'Unified automation dashboard',
      'Reusable workflow/agent modules',
      'Client portal + monitoring'
    ],
    primaryCta: { label: 'Join the Waitlist', href: '/contact' }
  }
];

const Services = () => {
  const servicesSchema = offers.map(o => schemas.service(o.title, o.oneLiner));

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Services"
        description="AI workflow automation services. We replace repetitive manual work with automated workflows in 14 days. Lead intake, CRM automation, follow-ups, and dashboards."
        keywords="AI workflow automation, CRM automation, lead automation, business automation, workflow buildout, automation audit"
        canonicalUrl="/services"
        structuredData={[
          schemas.breadcrumb([{ name: 'Home', url: '/' }, { name: 'Services', url: '/services' }]),
          ...servicesSchema
        ]}
      />
      <Navbar />
      
      <main className="pt-24">
        {/* Hero */}
        <section className="section-padding">
          <div className="container-main">
            <ScrollReveal>
              <div className="text-center max-w-3xl mx-auto">
                <span className="tag-chip mb-6">Our Services</span>
                <h1 className="font-display text-5xl md:text-6xl mb-6">
                  AUTOMATION <span className="text-gradient">SOLUTIONS</span>
                </h1>
                <p className="text-xl text-muted-foreground">
                  From workflow automation to complete operating systems, we build the 
                  technology that powers modern businesses.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Offers Grid */}
        <section className="section-padding pt-0">
          <div className="container-main">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {offers.map((offer, index) => (
                <ScrollReveal key={index} delay={index * 0.1}>
                  <div 
                    className={`card-glass p-8 rounded-lg h-full flex flex-col ${
                      offer.badge === 'LIVE' 
                        ? 'border-primary/50 ring-1 ring-primary/20' 
                        : 'opacity-90'
                    }`}
                  >
                    {/* Badge */}
                    <div className="flex items-center justify-between mb-4">
                      <offer.icon className="h-10 w-10 text-primary" />
                      <Badge 
                        variant={offer.badge === 'LIVE' ? 'default' : 'secondary'}
                        className={offer.badge === 'LIVE' ? 'bg-primary text-primary-foreground' : ''}
                      >
                        {offer.badge}
                      </Badge>
                    </div>

                    {/* Title & One-liner */}
                    <h3 className="font-display text-2xl mb-3">{offer.title}</h3>
                    <p className="text-muted-foreground mb-6">{offer.oneLiner}</p>

                    {/* Bullets */}
                    <ul className="space-y-2 mb-6">
                      {offer.bullets.map((bullet, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                          {bullet}
                        </li>
                      ))}
                    </ul>

                    {/* Included (only for LIVE offer) */}
                    {offer.included && (
                      <div className="mb-6">
                        <p className="text-sm font-medium text-foreground mb-2">What's Included:</p>
                        <ul className="space-y-1.5">
                          {offer.included.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-xs text-muted-foreground">
                              <span className="text-primary">•</span>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Timeline */}
                    {offer.timeline && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                        <Calendar className="h-4 w-4 text-primary shrink-0" />
                        <span>{offer.timeline}</span>
                      </div>
                    )}

                    {/* Pricing */}
                    {offer.pricing && (
                      <div className="flex items-center gap-2 text-sm font-medium text-foreground mb-6">
                        <Clock className="h-4 w-4 text-primary shrink-0" />
                        <span>{offer.pricing}</span>
                      </div>
                    )}

                    {/* CTAs */}
                    <div className="mt-auto space-y-3">
                      {offer.primaryCta && (
                        <Button asChild className="w-full" variant={offer.badge === 'LIVE' ? 'default' : 'secondary'}>
                          <Link to={offer.primaryCta.href}>
                            {offer.primaryCta.label}
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                      )}
                      {offer.secondaryCta && (
                        <Button asChild variant="ghost" className="w-full">
                          <a href={offer.secondaryCta.href}>
                            {offer.secondaryCta.label}
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* What We Automate Section */}
        <section id="what-we-automate" className="section-padding bg-card/20">
          <div className="container-main">
            <ScrollReveal>
              <div className="text-center mb-12">
                <span className="tag-chip mb-4">What We Automate</span>
                <h2 className="font-display text-4xl md:text-5xl mb-4">
                  COMMON <span className="text-gradient">WORKFLOWS</span>
                </h2>
              </div>
            </ScrollReveal>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { title: 'Lead Intake', desc: 'Forms → CRM → instant routing to the right person' },
                { title: 'Follow-Up Sequences', desc: 'Email/SMS drips that run on autopilot' },
                { title: 'Task Assignment', desc: 'Auto-create tasks in ClickUp, Trello, Asana' },
                { title: 'Data Sync', desc: 'Keep your tools in sync without copy-paste' },
                { title: 'Reporting Dashboards', desc: 'Real-time visibility into your pipeline' },
                { title: 'Client Onboarding', desc: 'Automated welcome flows and checklist delivery' }
              ].map((item, idx) => (
                <ScrollReveal key={idx} delay={idx * 0.05}>
                  <div className="card-glass p-6 rounded-lg">
                    <h3 className="font-display text-lg mb-2 text-primary">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="section-padding bg-card/30">
          <div className="container-main">
            <ScrollReveal>
              <div className="text-center">
                <h2 className="font-display text-4xl md:text-5xl mb-6">
                  READY TO <span className="text-gradient">AUTOMATE</span>?
                </h2>
                <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
                  Book a free automation audit and see how we can streamline your operations in 14 days.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Link to="/contact" className="btn-primary">
                    Book Free Audit
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

export default Services;
