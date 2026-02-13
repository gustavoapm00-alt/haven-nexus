import { Link } from 'react-router-dom';
import { 
  CheckCircle, ArrowRight, Clock, Shield, Settings, 
  Headphones, Zap, Key, MonitorCheck 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import LibraryNavbar from '@/components/library/LibraryNavbar';
import LibraryFooter from '@/components/library/LibraryFooter';
import SEO from '@/components/SEO';

const ActivationWalkthrough = () => {
  const steps = [
    {
      number: 1,
      title: 'Connect Your Tools',
      description: 'Using secure OAuth or API credentials, you authorize AERELION to connect to the tools your automation needs (e.g., Gmail, Slack, HubSpot).',
      icon: Key,
    },
    {
      number: 2,
      title: 'We Configure Everything',
      description: 'Our team sets up the automation on our infrastructure. We configure triggers, actions, and any custom logic specific to your workflow.',
      icon: Settings,
    },
    {
      number: 3,
      title: 'Test & Verify',
      description: 'We run test scenarios to ensure everything works correctly. You\'ll receive a confirmation once your automation is live.',
      icon: MonitorCheck,
    },
    {
      number: 4,
      title: 'Go Live',
      description: 'Your automation is now running. We monitor it continuously and handle any maintenance or updates required.',
      icon: Zap,
    },
  ];

  const requirements = [
    'Admin access to the tools being connected',
    'API keys or OAuth authorization for each tool',
    '10–15 minutes for the initial setup call (optional)',
    'A clear understanding of what you want automated',
  ];

  return (
    <>
      <SEO
        title="Activation Walkthrough"
        description="Learn how AERELION activates governed protocols. Authorize your systems, we configure, stabilize, and maintain everything."
        keywords="activation, protocol deployment, governed protocol, walkthrough, operational governance"
      />

      <div className="min-h-screen bg-background">
        <LibraryNavbar />

        <section className="section-padding !pt-12">
          <div className="container-main max-w-3xl">
            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="text-3xl md:text-4xl font-semibold text-foreground mb-4">
                Activation Walkthrough
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Here's exactly what happens after you authorize a governed protocol. We handle the technical stabilization—you stay focused on your operations.
              </p>
            </div>

            {/* What Activation Means */}
            <div className="card-enterprise p-6 mb-10">
              <h2 className="text-xl font-semibold text-foreground mb-3 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-primary" />
                What Activation Means
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                When you authorize a governed protocol from AERELION, you're not receiving files to configure yourself. 
                Instead, we deploy and operate the protocol on our infrastructure. You authorize your systems, and we take care 
                of everything else—configuration, stabilization, governance, and maintenance.
              </p>
            </div>

            {/* What You'll Need */}
            <div className="mb-10">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                What You'll Need
              </h2>
              <ul className="space-y-3">
                {requirements.map((req, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{req}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Step by Step */}
            <div className="mb-10">
              <h2 className="text-xl font-semibold text-foreground mb-6">
                Step-by-Step Process
              </h2>
              <div className="space-y-6">
                {steps.map((step) => (
                  <div key={step.number} className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                        {step.number}
                      </div>
                    </div>
                    <div className="pt-1">
                      <h3 className="font-semibold text-foreground mb-1 flex items-center gap-2">
                        {step.title}
                        <step.icon className="w-4 h-4 text-muted-foreground" />
                      </h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Typical Activation Time */}
            <div className="card-enterprise p-6 mb-10">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground mb-2">
                    Typical Activation Time
                  </h2>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Most automations are activated within <strong>1–4 hours</strong> of receiving your credentials. 
                    Complex integrations or custom configurations may take longer. We'll keep you updated throughout the process.
                  </p>
                </div>
              </div>
            </div>

            {/* After Activation */}
            <div className="card-enterprise p-6 mb-10">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Headphones className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground mb-2">
                    After Activation
                  </h2>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-3">
                    Once your automation is live, we continuously monitor it for issues. If something needs attention, 
                    we handle it—you don't need to do anything. For questions or changes, reach out anytime:
                  </p>
                  <a 
                    href="mailto:contact@aerelion.systems" 
                    className="text-primary hover:underline font-medium"
                  >
                    contact@aerelion.systems
                  </a>
                </div>
              </div>
            </div>

            {/* Security Note */}
            <div className="bg-muted/50 rounded-lg p-4 mb-10 flex items-start gap-3">
              <Shield className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground">
                Your credentials are encrypted and stored securely. You can revoke access at any time. 
                <Link to="/security" className="text-primary hover:underline ml-1">Learn more about our security practices</Link>.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild size="lg">
                <Link to="/activation-setup">
                  Start Activation Setup
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/automations">
                  VIEW CAPABILITY MATRIX
                </Link>
              </Button>
            </div>
          </div>
        </section>

        <LibraryFooter />
      </div>
    </>
  );
};

export default ActivationWalkthrough;
