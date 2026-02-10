import SEO, { schemas } from '@/components/SEO';
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
      "We configure, host, operate, and maintain business automation systems for professional services firms.",
      "/"
    ),
  ];

  return (
    <>
      <SEO
        title="AERELION Systems – Infrastructure for the Agent Era"
        description="AERELION is a managed automation operator. We configure, host, operate, and maintain business automation systems for professional services firms."
        keywords="managed automation operator, hosted automation services, business process automation"
        canonicalUrl="/"
        structuredData={homeStructuredData}
      />

      <main>
        <CommandCenterHero />
        <ManifestoSection />
        <ProtocolGrid />
        <BlueprintsFeed />
        <LandingFooter />
      </main>
    </>
  );
};

export default LibraryHome;
