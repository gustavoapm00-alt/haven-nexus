import { Download, FileText, Settings, Clock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import LibraryNavbar from '@/components/library/LibraryNavbar';
import LibraryFooter from '@/components/library/LibraryFooter';
import IntegrationIcons from '@/components/library/IntegrationIcons';
import N8nImportGuide from '@/components/library/N8nImportGuide';
import HowItWorks from '@/components/library/HowItWorks';
import SEO from '@/components/SEO';

const DeploymentOverview = () => {
  return (
    <>
      <SEO
        title="How to Import Workflow Packs"
        description="Learn how to download and import AERELION workflow packs into your own n8n instance. Customer-controlled with no centralized processing."
        keywords="n8n import, workflow import, n8n setup, workflow setup"
      />

      <div className="min-h-screen bg-background">
        <LibraryNavbar />

        {/* Hero Section */}
        <section className="section-padding !pt-12 !pb-8">
          <div className="container-main max-w-4xl text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              How to Import Workflow Packs
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              AERELION workflow packs are downloadable n8n files designed to run inside your own automation infrastructure. Each pack includes documentation, requirements, and configuration templates.
            </p>
          </div>
        </section>

        {/* Quick Overview */}
        <section className="section-padding !py-8 bg-muted/30">
          <div className="container-main max-w-4xl">
            <HowItWorks />
          </div>
        </section>

        {/* What You Receive */}
        <section className="section-padding">
          <div className="container-main max-w-4xl">
            <div className="card-enterprise p-8 mb-12">
              <h2 className="text-xl font-semibold text-foreground mb-6 text-center">
                What You Receive
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-start gap-3 p-4 rounded-lg bg-background/50">
                  <Download className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">Workflow File</p>
                    <p className="text-sm text-muted-foreground">n8n-compatible JSON</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-lg bg-background/50">
                  <FileText className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">Documentation</p>
                    <p className="text-sm text-muted-foreground">Step-by-step guide</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-lg bg-background/50">
                  <Settings className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">Configuration</p>
                    <p className="text-sm text-muted-foreground">Templates & checklists</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Setup Time */}
            <div className="flex items-start gap-4 p-6 rounded-xl border border-border bg-card mb-12">
              <Clock className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-foreground mb-1">Typical Setup Time</h3>
                <p className="text-muted-foreground">
                  Most workflow packs can be imported and configured in 15–45 minutes depending on the number of system integrations required. Each pack page displays its estimated setup time.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Visual Import Guide */}
        <section className="section-padding bg-muted/30">
          <div className="container-main max-w-5xl">
            <N8nImportGuide />
          </div>
        </section>

        {/* Supported Systems */}
        <section className="section-padding">
          <div className="container-main max-w-4xl">
            <h2 className="text-xl font-semibold text-foreground mb-4 text-center">
              Supported Systems
            </h2>
            <p className="text-muted-foreground mb-8 text-center max-w-xl mx-auto">
              Integrations depend on the selected pack. Common systems include:
            </p>
            <IntegrationIcons />

            {/* CTA */}
            <div className="text-center mt-12">
              <Button asChild size="lg" className="gap-2">
                <Link to="/packs">
                  Browse Workflow Packs
                  <ArrowRight className="w-4 h-4" />
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

export default DeploymentOverview;
