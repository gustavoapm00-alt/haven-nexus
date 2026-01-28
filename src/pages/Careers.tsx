import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import LibraryNavbar from '@/components/library/LibraryNavbar';
import LibraryFooter from '@/components/library/LibraryFooter';
import SEO from '@/components/SEO';
import { Button } from '@/components/ui/button';

// Breezy careers page URL
const BREEZY_CAREERS_URL = 'https://aerelion-systems-llc.breezy.hr/p/69e13036d878-automation-operations-specialist';

const Careers = () => {
  return (
    <>
      <SEO
        title="Careers at AERELION | Join Our Team"
        description="We're building a team that operates and maintains automation systems for professional services firms and compliance-driven organizations. View open positions."
        keywords="careers, jobs, automation operator, professional services, hiring"
      />
      
      <div className="min-h-screen bg-background flex flex-col">
        <LibraryNavbar />

        <main className="flex-1">
          {/* Hero Section */}
          <section className="section-padding bg-background">
            <div className="container-main max-w-3xl">
              <h1 className="text-4xl md:text-5xl font-semibold text-foreground tracking-tight mb-6">
                Careers at AERELION
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                We're building a team that operates and maintains automation systems for professional services firms and compliance-driven organizations.
              </p>
            </div>
          </section>

          {/* Body Section */}
          <section className="section-padding !pt-0">
            <div className="container-main max-w-3xl">
              <div className="prose prose-lg max-w-none">
                <p className="text-muted-foreground leading-relaxed mb-6">
                  AERELION is a managed automation operator. We configure, run, and maintain automation systems on our infrastructure so our clients don't have to.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  We hire operators, not hobbyists. People who value reliability, accountability, and clear scope.
                </p>
              </div>
            </div>
          </section>

          {/* Open Roles Section */}
          <section className="section-padding !pt-8">
            <div className="container-main max-w-3xl">
              <div className="bg-muted/30 border border-border rounded-lg p-8 md:p-12 text-center">
                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  Open Roles
                </h2>
                <p className="text-muted-foreground mb-8">
                  All open positions are managed through our hiring platform.
                </p>
                
                <Button asChild size="lg" className="gap-2">
                  <a 
                    href={BREEZY_CAREERS_URL} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    View Open Positions
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </Button>

                <p className="text-sm text-muted-foreground/70 mt-6">
                  Hiring powered by Breezy
                </p>
              </div>
            </div>
          </section>
        </main>

        <LibraryFooter />
      </div>
    </>
  );
};

export default Careers;
