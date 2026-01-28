import { CheckCircle, Shield, Clock, ArrowRight, Users, Eye, Wrench, HeartPulse } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import LibraryNavbar from '@/components/library/LibraryNavbar';
import LibraryFooter from '@/components/library/LibraryFooter';
import SEO, { schemas } from '@/components/SEO';

const DeploymentOverview = () => {
  const phases = [
    {
      number: 1,
      title: 'Diagnose',
      duration: 'Days 1–5',
      icon: Eye,
      description: 'We map your operations and identify where time leaks.',
      bullets: [
        'Review current tools, workflows, and handoff points',
        'Identify repetitive tasks draining capacity',
        'Prioritize high-impact automation targets',
        'Define success criteria for the engagement',
      ],
    },
    {
      number: 2,
      title: 'Install',
      duration: 'Days 6–20',
      icon: Wrench,
      description: 'We configure and deploy workflows on your infrastructure.',
      bullets: [
        'Connect your tools securely (CRM, email, scheduling, etc.)',
        'Build and test automation logic end-to-end',
        'Configure triggers, actions, and exception handling',
        'Validate outputs match your operational standards',
      ],
    },
    {
      number: 3,
      title: 'Stabilize',
      duration: 'Days 21–30',
      icon: HeartPulse,
      description: 'We monitor, adjust, and confirm everything runs reliably.',
      bullets: [
        'Monitor live workflows for errors or edge cases',
        'Fine-tune logic based on real-world data',
        'Document operational handoff and escalation paths',
        "Confirm you're seeing the expected outcomes",
      ],
    },
  ];

  const clientRequirements = [
    {
      title: 'Tool access',
      description: "Admin credentials or OAuth authorization for the systems we'll connect (e.g., CRM, email, scheduling).",
    },
    {
      title: 'Operational context',
      description: 'A 30-minute call to walk us through your current process and pain points.',
    },
    {
      title: 'Decision availability',
      description: 'Respond to questions within 24–48 hours so we can keep the engagement on track.',
    },
  ];

  const outcomes = [
    'Hours recovered weekly from repetitive admin tasks',
    'Faster response times to leads, clients, or internal requests',
    'Consistent execution of workflows that used to depend on memory',
    "Clear visibility into what's running and what's not",
    'Confidence that operational gaps are closed',
  ];

  const faqs = [
    {
      question: 'How is pricing determined?',
      answer: 'Pricing is scoped per engagement, not per workflow. After our initial call, we provide a fixed quote based on the complexity of your operations and the number of systems involved. No hourly billing, no surprise invoices.',
    },
    {
      question: 'Do I need technical experience?',
      answer: "No. You provide access and context—we handle all configuration, testing, and maintenance. You don't need to understand how the workflows work, only what outcomes you expect.",
    },
    {
      question: 'How are my credentials handled?',
      answer: "Your credentials are encrypted at rest and in transit. We use the principle of least privilege—only accessing what's required. You can revoke access at any time, and we never share your data with third parties.",
    },
    {
      question: 'What if something breaks after the 30 days?',
      answer: 'During the engagement, we build for resilience—error handling, logging, and alerts. After Day 30, you can continue with optional ongoing monitoring, or we hand off documentation so your team understands how to escalate issues.',
    },
    {
      question: 'Who owns the workflows?',
      answer: "You do. Everything we build runs on your infrastructure or accounts. We're operators, not landlords. If you choose to end the relationship, you retain full control.",
    },
    {
      question: 'What if my needs change mid-engagement?',
      answer: "Scope changes happen. If new priorities emerge, we adjust the plan together. Major scope expansions may require a revised quote, but we'll always discuss before proceeding.",
    },
  ];

  const howItWorksStructuredData = [
    schemas.howTo(
      "AERELION 30-Day Managed Automation Engagement",
      "How AERELION diagnoses, installs, and stabilizes automation workflows",
      [
        "Phase 1: Diagnose - Map operations and identify time leaks",
        "Phase 2: Install - Configure and deploy workflows on your infrastructure",
        "Phase 3: Stabilize - Monitor, adjust, and confirm reliable operation"
      ]
    ),
    schemas.faqPage(faqs),
    schemas.breadcrumb([
      { name: 'Home', url: '/' },
      { name: 'How It Works', url: '/how-it-works' }
    ])
  ];

  return (
    <>
      <SEO
        title="How AERELION Works – 30-Day Managed Automation Engagement"
        description="AERELION's 30-day scoped engagement: diagnose operational friction, install automation workflows, and stabilize for reliable operation. Fixed scope, outcome-owned, no technical work required."
        keywords="how managed automation works, automation engagement process, 30-day automation, workflow installation, business process automation, fixed scope automation"
        canonicalUrl="/how-it-works"
        structuredData={howItWorksStructuredData}
      />

      <div className="min-h-screen bg-background">
        <LibraryNavbar />

        {/* Hero / Overview */}
        <section className="section-padding !pt-12 !pb-8">
          <div className="container-main max-w-3xl text-center">
            <p className="text-sm text-primary font-medium mb-3">How We Work</p>
            <h1 className="text-3xl md:text-4xl font-semibold text-foreground mb-4">
              A 30-day scoped engagement
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              We diagnose operational friction, install workflows that eliminate it, and stabilize everything before handoff. Fixed scope. Outcome-owned. No technical work required from you.
            </p>
          </div>
        </section>

        {/* The 3 Phases */}
        <section className="section-padding !py-12">
          <div className="container-main max-w-4xl">
            <h2 className="text-2xl font-semibold text-foreground text-center mb-10">
              The Three Phases
            </h2>
            
            <div className="space-y-8">
              {phases.map((phase) => (
                <div key={phase.number} className="card-enterprise p-6 md:p-8">
                  <div className="flex flex-col md:flex-row md:items-start gap-6">
                    <div className="flex-shrink-0">
                      <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                        <phase.icon className="w-7 h-7 text-primary" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-3">
                        <h3 className="text-xl font-semibold text-foreground">
                          Phase {phase.number}: {phase.title}
                        </h3>
                        <span className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full w-fit">
                          {phase.duration}
                        </span>
                      </div>
                      <p className="text-muted-foreground mb-4">{phase.description}</p>
                      <ul className="space-y-2">
                        {phase.bullets.map((bullet, i) => (
                          <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                            <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* What We Need From You */}
        <section className="section-padding !py-12 bg-muted/30">
          <div className="container-main max-w-3xl">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-3">
                What We Need From You
              </h2>
              <p className="text-muted-foreground">
                Access and context—not technical work.
              </p>
            </div>

            <div className="grid gap-6">
              {clientRequirements.map((req, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Users className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground mb-1">{req.title}</h3>
                    <p className="text-sm text-muted-foreground">{req.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* What You Get */}
        <section className="section-padding !py-12">
          <div className="container-main max-w-3xl">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-3">
                What You Get
              </h2>
              <p className="text-muted-foreground">
                Operational outcomes, not just software.
              </p>
            </div>

            <div className="card-enterprise p-6 md:p-8">
              <ul className="space-y-4">
                {outcomes.map((outcome, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-foreground">{outcome}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* What Happens After */}
        <section className="section-padding !py-12 bg-muted/30">
          <div className="container-main max-w-3xl">
            <div className="card-enterprise p-6 md:p-8">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-lg flex-shrink-0">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-3">
                    What Happens After Day 30
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    At the end of the engagement, your workflows are live and stable. From there, you have two options:
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-medium text-muted-foreground">1</span>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Self-manage</p>
                        <p className="text-sm text-muted-foreground">
                          We hand off documentation and escalation paths. Your team takes over.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-medium text-muted-foreground">2</span>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Ongoing monitoring</p>
                        <p className="text-sm text-muted-foreground">
                          We continue to monitor, maintain, and optimize your workflows on a retainer basis.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="section-padding !py-12">
          <div className="container-main max-w-3xl">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-3">
                Frequently Asked Questions
              </h2>
              <p className="text-muted-foreground">
                Trust, credentials, pricing, and responsibility.
              </p>
            </div>

            <Accordion type="single" collapsible className="space-y-3">
              {faqs.map((faq, i) => (
                <AccordionItem 
                  key={i} 
                  value={`faq-${i}`}
                  className="card-enterprise border-border px-6 rounded-lg"
                >
                  <AccordionTrigger className="text-left hover:no-underline py-5">
                    <span className="font-medium text-foreground">{faq.question}</span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-5">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* Security Note */}
        <section className="section-padding !py-8">
          <div className="container-main max-w-3xl">
            <div className="bg-muted/50 rounded-lg p-4 flex items-start gap-3">
              <Shield className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground">
                Your credentials are encrypted and stored securely. You can revoke access at any time. 
                <Link to="/security" className="text-primary hover:underline ml-1">
                  Learn more about our security practices
                </Link>.
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="section-padding !py-12">
          <div className="container-main max-w-3xl text-center">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              Ready to recover capacity?
            </h2>
            <p className="text-muted-foreground mb-6">
              Tell us where time is leaking. We'll scope the engagement.
            </p>
            <Button asChild size="lg">
              <Link to="/contact">
                Book an AI Ops Installation
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </section>

        <LibraryFooter />
      </div>
    </>
  );
};

export default DeploymentOverview;
