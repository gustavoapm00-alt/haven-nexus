import { Download, FileText, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import LibraryNavbar from '@/components/library/LibraryNavbar';
import LibraryFooter from '@/components/library/LibraryFooter';
import IntegrationIcons from '@/components/library/IntegrationIcons';
import { SEO } from '@/components/SEO';

const DeploymentOverview = () => {
  const deploymentSteps = [
    {
      step: 1,
      title: 'Select a pre-engineered automation agent',
      description: 'Browse the agent library and choose the workflow that matches your operational need.',
    },
    {
      step: 2,
      title: 'Download and connect approved systems',
      description: 'Import the workflow file into your n8n instance and configure credentials for required systems.',
    },
    {
      step: 3,
      title: 'Automation executes within your environment',
      description: 'The agent runs entirely on your infrastructure with full visibility into logic and data flow.',
    },
  ];

  return (
    <>
      <SEO
        title="Deployment Overview"
        description="Learn how AERELION automation agents are deployed. Customer-controlled execution with no centralized data processing."
        keywords={['deployment', 'n8n', 'automation deployment', 'workflow deployment']}
      />

      <div className="min-h-screen bg-background">
        <LibraryNavbar />

        <section className="section-padding !pt-12">
          <div className="container-main max-w-3xl">
            <h1 className="text-3xl font-semibold text-foreground mb-4">
              Deployment Overview
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed mb-12">
              AERELION agents are distributed as downloadable workflows designed to run inside customer-controlled automation infrastructure. Each deployment includes documentation, requirements, and recommended configuration.
            </p>

            {/* Deployment Steps */}
            <div className="space-y-8 mb-16">
              {deploymentSteps.map((step) => (
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

            {/* What You Receive */}
            <div className="card-enterprise p-8 mb-12">
              <h2 className="text-xl font-semibold text-foreground mb-6">
                What You Receive
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-start gap-3">
                  <Download className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">Workflow File</p>
                    <p className="text-sm text-muted-foreground">n8n-compatible JSON</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">Documentation</p>
                    <p className="text-sm text-muted-foreground">Step-by-step guide</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Settings className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">Configuration</p>
                    <p className="text-sm text-muted-foreground">Templates & checklists</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Setup Time */}
            <div className="mb-12">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                Typical Setup Time
              </h2>
              <p className="text-muted-foreground">
                Most agents can be deployed in 15–45 minutes depending on the number of system integrations required. Each agent page displays its estimated setup time.
              </p>
            </div>

            {/* Supported Systems */}
            <div className="mb-12">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                Supported Systems
              </h2>
              <p className="text-muted-foreground mb-6">
                Integrations depend on the selected agent. Common systems include:
              </p>
              <IntegrationIcons />
            </div>

            {/* CTA */}
            <div className="text-center">
              <Button asChild size="lg">
                <Link to="/agents">Browse Automation Agents</Link>
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
