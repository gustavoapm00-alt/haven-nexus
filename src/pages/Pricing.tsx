import { Link } from 'react-router-dom';
import { ArrowRight, Check, Clock, Shield, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LibraryNavbar from '@/components/library/LibraryNavbar';
import LibraryFooter from '@/components/library/LibraryFooter';
import SEO, { schemas } from '@/components/SEO';

const Pricing = () => {
  const engagementFeatures = [
    'Scoped 30-day engagement',
    'Dedicated operator assigned',
    'Automations configured on AERELION infrastructure',
    'Ongoing monitoring included during engagement',
    'Email updates throughout the process',
    'No technical work required from you',
  ];

  const afterEngagement = [
    {
      title: 'Hand-Off',
      description: 'We complete the engagement and you take over. Revoke our access anytime.',
      included: true,
    },
    {
      title: 'Ongoing Monitoring',
      description: 'Optional retainer for continued operation, maintenance, and support.',
      included: false,
    },
  ];

  const values = [
    {
      icon: Clock,
      title: 'Fixed Scope',
      description: 'Every engagement is scoped upfront. No surprises, no scope creep.',
    },
    {
      icon: Shield,
      title: 'Outcome-Based',
      description: 'You pay for operational outcomes, not software licenses or API calls.',
    },
    {
      icon: Users,
      title: 'Operator-Led',
      description: 'A trained operator manages your automations—not an algorithm.',
    },
  ];

  const pricingFaqs = [
    { question: 'How is pricing determined?', answer: 'Pricing is based on the scope and complexity of your engagement. During our discovery call, we understand your operations and provide a fixed quote.' },
    { question: 'Are there per-task or per-run fees?', answer: 'No. Our engagements are fixed-scope. You pay for the outcome, not for individual automation runs or API calls.' },
    { question: 'What happens after the 30-day engagement?', answer: 'You can choose ongoing monitoring retainer, or we hand off and you manage independently. Either way, you maintain full control.' },
    { question: 'Do I need technical experience?', answer: 'No. AERELION handles all technical configuration and operation. You provide context about your business—we handle the rest.' }
  ];

  const pricingStructuredData = [
    schemas.faqPage(pricingFaqs),
    schemas.service(
      "30-Day Managed Automation Engagement",
      "Fixed-scope automation engagement with diagnosis, installation, and stabilization. Outcome-based pricing.",
      "/pricing"
    ),
    schemas.breadcrumb([
      { name: 'Home', url: '/' },
      { name: 'Pricing', url: '/pricing' }
    ])
  ];

  return (
    <>
      <SEO
        title="Pricing – Outcome-Based Managed Automation Engagements | AERELION"
        description="AERELION delivers managed automation through fixed-scope 30-day engagements. Pay for operational outcomes, not software licenses or per-task fees. No technical work required from you."
        keywords="automation pricing, managed automation cost, outcome-based pricing, fixed scope engagement, automation service pricing, professional services automation cost"
        canonicalUrl="/pricing"
        structuredData={pricingStructuredData}
      />

      <div className="min-h-screen bg-background">
        <LibraryNavbar />

        {/* Hero */}
        <section className="section-padding !pt-12">
          <div className="container-main max-w-3xl text-center">
            <span className="text-xs font-semibold text-primary uppercase tracking-wide mb-3 block">
              Pricing
            </span>
            <h1 className="text-4xl font-semibold text-foreground mb-4">
              Outcome-Based Engagements
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              AERELION delivers managed automation through fixed-scope engagements. 
              You pay for operational outcomes—not software licenses, not API calls, 
              not per-task fees.
            </p>
          </div>
        </section>

        {/* How Pricing Works */}
        <section className="section-padding !pt-0">
          <div className="container-main max-w-4xl">
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              {values.map((value) => (
                <div key={value.title} className="card-enterprise p-6">
                  <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center mb-4">
                    <value.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{value.title}</h3>
                  <p className="text-sm text-muted-foreground">{value.description}</p>
                </div>
              ))}
            </div>

            {/* Engagement Card */}
            <div className="card-enterprise p-8 md:p-10">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8">
                <div className="flex-1">
                  <span className="text-xs font-semibold text-primary uppercase tracking-wide mb-2 block">
                    Standard Engagement
                  </span>
                  <h2 className="text-2xl font-semibold text-foreground mb-3">
                    30-Day Managed Activation
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    We diagnose your operational needs, configure the right automations, 
                    and operate them on your behalf until they're stable and delivering value.
                  </p>

                  <ul className="space-y-3 mb-8">
                    {engagementFeatures.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="p-4 bg-muted/30 rounded-lg border border-border">
                    <h4 className="font-medium text-foreground mb-2">After Your Engagement</h4>
                    <div className="space-y-2">
                      {afterEngagement.map((option) => (
                        <div key={option.title} className="flex items-start gap-2">
                          <span className="text-sm text-muted-foreground">
                            <span className="font-medium text-foreground">{option.title}:</span>{' '}
                            {option.description}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="md:w-72 flex-shrink-0">
                  <div className="bg-muted/30 border border-border rounded-lg p-6 text-center">
                    <p className="text-sm text-muted-foreground mb-2">Pricing starts at</p>
                    <p className="text-3xl font-semibold text-foreground mb-1">Custom</p>
                    <p className="text-sm text-muted-foreground mb-6">
                      Based on scope and complexity
                    </p>
                    
                    <Button asChild className="w-full" size="lg">
                      <Link to="/contact">
                        Schedule Discovery Call
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Link>
                    </Button>
                    
                    <p className="text-xs text-muted-foreground mt-4">
                      No commitment required
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Browse Automations */}
        <section className="section-padding">
          <div className="container-main max-w-3xl text-center">
            <h2 className="text-2xl font-semibold text-foreground mb-3">
              See What We Operate
            </h2>
            <p className="text-muted-foreground mb-6">
              Browse the automations we configure, host, and operate for professional services 
              firms and compliance-driven organizations.
            </p>
            <Button asChild variant="outline" size="lg">
              <Link to="/automations">
                View Automation Catalog
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </section>

        {/* FAQ */}
        <section className="section-padding bg-muted/20">
          <div className="container-main max-w-3xl">
            <h2 className="text-2xl font-semibold text-foreground mb-8 text-center">
              Common Questions
            </h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-foreground mb-2">
                  How is pricing determined?
                </h3>
                <p className="text-muted-foreground">
                  Pricing is based on the scope and complexity of your engagement. During 
                  our discovery call, we'll understand your operations and provide a fixed 
                  quote for the engagement.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-foreground mb-2">
                  Are there per-task or per-run fees?
                </h3>
                <p className="text-muted-foreground">
                  No. Our engagements are fixed-scope. You pay for the outcome, not for 
                  individual automation runs or API calls.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-foreground mb-2">
                  What happens after the 30-day engagement?
                </h3>
                <p className="text-muted-foreground">
                  After stabilization, you can choose to continue with an ongoing monitoring 
                  retainer, or we hand off and you manage independently. Either way, you 
                  maintain full control of your accounts.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-foreground mb-2">
                  Do I need technical experience?
                </h3>
                <p className="text-muted-foreground">
                  No. AERELION handles all technical configuration and operation. You provide 
                  context about your business operations—we handle the rest.
                </p>
              </div>
            </div>
          </div>
        </section>

        <LibraryFooter />
      </div>
    </>
  );
};

export default Pricing;
