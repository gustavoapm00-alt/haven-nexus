import { Cloud, Link2, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import LibraryNavbar from '@/components/library/LibraryNavbar';
import LibraryFooter from '@/components/library/LibraryFooter';
import IntegrationIcons from '@/components/library/IntegrationIcons';
import SEO from '@/components/SEO';

const DeploymentOverview = () => {
  const activationSteps = [
    {
      step: 1,
      title: 'Choose an automation or system bundle',
      description: 'Browse our library and select the automation that matches your operational need.',
    },
    {
      step: 2,
      title: 'Connect your tools securely',
      description: 'We guide you through securely connecting your tools. Your credentials are encrypted.',
    },
    {
      step: 3,
      title: 'We activate and maintain it for you',
      description: 'The automation runs on our infrastructure. We monitor and maintain everything.',
    },
  ];

  return (
    <>
      <SEO
        title="How It Works"
        description="Learn how AERELION hosted automations work. We configure, run, and maintain everything—no code, no infrastructure required."
        keywords="hosted automation, managed automation, how it works, automation service"
      />

      <div className="min-h-screen bg-background">
        <LibraryNavbar />

        <section className="section-padding !pt-12">
          <div className="container-main max-w-3xl">
            <h1 className="text-3xl font-semibold text-foreground mb-4">
              How It Works
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed mb-12">
              AERELION Systems hosts and maintains business automations on our infrastructure. You connect your tools, and we handle the rest—no downloads, no code, no infrastructure to manage.
            </p>

            {/* Activation Steps */}
            <div className="space-y-8 mb-16">
              {activationSteps.map((step) => (
                <div key={step.step} className="flex gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                      {step.step}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">{step.title}</h3>
                    <p className="text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* What's Included */}
            <div className="card-enterprise p-8 mb-12">
              <h2 className="text-xl font-semibold text-foreground mb-6">
                What's Included
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-start gap-3">
                  <Cloud className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">Hosted Automation</p>
                    <p className="text-sm text-muted-foreground">Runs on our infrastructure</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Link2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">Tool Connections</p>
                    <p className="text-sm text-muted-foreground">Secure integrations</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Settings className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">Ongoing Maintenance</p>
                    <p className="text-sm text-muted-foreground">We monitor & update</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Activation Time */}
            <div className="mb-12">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                Typical Activation Time
              </h2>
              <p className="text-muted-foreground">
                Most automations can be activated within 1–4 hours depending on the number of tool integrations required. Each automation page displays its estimated activation time.
              </p>
            </div>

            {/* Supported Systems */}
            <div className="mb-12">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                Tools We Connect
              </h2>
              <p className="text-muted-foreground mb-6">
                The specific tools depend on the selected automation. Common integrations include:
              </p>
              <IntegrationIcons />
            </div>

            {/* Security Note */}
            <div className="card-enterprise p-6 mb-12 bg-muted/30">
              <h3 className="font-semibold text-foreground mb-2">How Credentials Are Handled</h3>
              <p className="text-muted-foreground text-sm">
                Your credentials are encrypted and stored securely. You maintain full control and can revoke access at any time. We never share your data with third parties.
              </p>
            </div>

            {/* CTA */}
            <div className="text-center">
              <Button asChild size="lg">
                <Link to="/automations">Browse Automations</Link>
              </Button>
            </div>
          </div>
        </section>

        <LibraryFooter />
      </div>
    </>
  );
};

export default DeploymentOverview;
