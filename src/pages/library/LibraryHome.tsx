import LibraryNavbar from '@/components/library/LibraryNavbar';
import LibraryFooter from '@/components/library/LibraryFooter';
import LibraryHero from '@/components/library/LibraryHero';
import SectionBand from '@/components/library/SectionBand';
import WhatWeAre from '@/components/library/WhatWeAre';
import HowItWorks from '@/components/library/HowItWorks';
import Differentiation from '@/components/library/Differentiation';
import WhoThisIsFor from '@/components/library/WhoThisIsFor';
import SecurityControl from '@/components/library/SecurityControl';
import FinalCTA from '@/components/library/FinalCTA';
import SEO from '@/components/SEO';

const LibraryHome = () => {
  return (
    <>
      <SEO
        title="AERELION Systems - Managed Automation Operator"
        description="AERELION is a managed automation operator for professional services firms and compliance-driven organizations. We configure, host, operate, and maintain automation systems on our infrastructure."
        keywords="managed automation, automation operator, hosted automation, professional services automation, compliance automation, government contractor automation"
      />
      
      <div className="min-h-screen bg-background">
        <LibraryNavbar />

        {/* Hero */}
        <LibraryHero />

        {/* What AERELION Is */}
        <SectionBand variant="light">
          <WhatWeAre />
        </SectionBand>

        {/* How It Works */}
        <SectionBand variant="muted">
          <HowItWorks />
        </SectionBand>

        {/* Differentiation */}
        <SectionBand variant="light">
          <Differentiation />
        </SectionBand>

        {/* Who This Is For */}
        <SectionBand variant="muted">
          <WhoThisIsFor />
        </SectionBand>

        {/* Security & Control */}
        <SectionBand variant="light">
          <SecurityControl />
        </SectionBand>

        {/* Final CTA */}
        <SectionBand variant="muted">
          <FinalCTA />
        </SectionBand>

        <LibraryFooter />
      </div>
    </>
  );
};

export default LibraryHome;
