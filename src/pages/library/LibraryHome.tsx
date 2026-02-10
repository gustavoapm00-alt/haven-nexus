import SEO, { schemas } from '@/components/SEO';
import LibraryNavbar from '@/components/library/LibraryNavbar';
import SystemStatusTicker from '@/components/landing/SystemStatusTicker';
import CommandCenterHero from '@/components/landing/CommandCenterHero';
import ManifestoSection from '@/components/landing/ManifestoSection';
import ProtocolGrid from '@/components/landing/ProtocolGrid';
import BlueprintsFeed from '@/components/landing/BlueprintsFeed';
import LandingFooter from '@/components/landing/LandingFooter';

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
        title="AERELION Systems – Infrastructure for the Agent Era"
        description="AERELION is a managed automation operator. We configure, host, operate, and maintain business automation systems for professional services firms and compliance-driven organizations."
        keywords="managed automation operator, hosted automation services, business process automation, professional services automation, compliance automation, agent deployment, workflow automation"
        canonicalUrl="/"
        structuredData={homeStructuredData}
      />

      <div className="min-h-screen bg-[#0a0a0a]">
        <LibraryNavbar />
        <SystemStatusTicker />
        <CommandCenterHero />
        <ManifestoSection />
        <ProtocolGrid />
        <BlueprintsFeed />
        <LandingFooter />
      </div>
    </>
  );
};

export default LibraryHome;
