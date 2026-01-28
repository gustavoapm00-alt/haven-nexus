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
import SEO, { schemas } from '@/components/SEO';

const LibraryHome = () => {
  const homeStructuredData = [
    schemas.organization,
    schemas.localBusiness,
    schemas.service(
      "Managed Automation Services",
      "We configure, host, operate, and maintain business automation systems for professional services firms. No code, no infrastructure, no technical work required.",
      "/"
    ),
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "AERELION Systems",
      "url": "https://aerelion.systems",
      "description": "Managed automation operator for professional services firms",
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://aerelion.systems/automations?q={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    }
  ];

  return (
    <>
      <SEO
        title="AERELION Systems – Managed Automation Operator for Professional Services"
        description="AERELION is a managed automation operator. We configure, host, operate, and maintain business automation systems for professional services firms and compliance-driven organizations. No code, no infrastructure—we handle everything."
        keywords="managed automation operator, hosted automation services, business process automation, professional services automation, compliance automation, government contractor automation, workflow automation, operational efficiency, automation as a service"
        canonicalUrl="/"
        structuredData={homeStructuredData}
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
