import { Download, FileText, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import LibraryNavbar from '@/components/library/LibraryNavbar';
import LibraryFooter from '@/components/library/LibraryFooter';
import IntegrationIcons from '@/components/library/IntegrationIcons';
import SEO from '@/components/SEO';

const DeploymentOverview = () => {
  const setupSteps = [
    {
      step: 1,
      title: 'Browse and purchase a workflow pack',
      description: 'Explore the pack library and select the workflow that matches your operational need.',
    },
    {
      step: 2,
      title: 'Download your workflow files',
      description: 'After purchase, instantly download the n8n JSON file and documentation.',
    },
    {
      step: 3,
      title: 'Import and configure in your n8n instance',
      description: 'The workflow runs entirely on your infrastructure with full visibility into logic and data flow.',
    },
  ];

  return (
    <>
      <SEO
        title="How to Import Workflow Packs"
        description="Learn how to download and import AERELION workflow packs into your own n8n instance. Customer-controlled with no centralized processing."
        keywords="n8n import, workflow import, n8n setup, workflow setup"
      />

      <div className="min-h-screen bg-background">
        <LibraryNavbar />

        <section className="section-padding !pt-12">
          <div className="container-main max-w-3xl">
            <h1 className="text-3xl font-semibold text-foreground mb-4">
              How to Import Workflow Packs
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed mb-12">
              AERELION workflow packs are downloadable n8n files designed to run inside your own automation infrastructure. Each pack includes documentation, requirements, and configuration templates.
            </p>

            {/* Setup Steps */}
            <div className="space-y-8 mb-16">
              {setupSteps.map((step) => (
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
                Most workflow packs can be imported and configured in 15–45 minutes depending on the number of system integrations required. Each pack page displays its estimated setup time.
              </p>
            </div>

            {/* Supported Systems */}
            <div className="mb-12">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                Supported Systems
              </h2>
              <p className="text-muted-foreground mb-6">
                Integrations depend on the selected pack. Common systems include:
              </p>
              <IntegrationIcons />
            </div>

            {/* CTA */}
            <div className="text-center">
              <Button asChild size="lg">
                <Link to="/packs">Browse Workflow Packs</Link>
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
