import SEO, { schemas } from '@/components/SEO';
import CommandCenterHero from '@/components/landing/CommandCenterHero';
import DoctrineGrid from '@/components/landing/DoctrineGrid';
import DualScopeRevenue from '@/components/landing/DualScopeRevenue';
import OperationalParameters from '@/components/landing/OperationalParameters';
import BriefingArchives from '@/components/landing/BriefingArchives';
import AerelionLayerDiagram from '@/components/landing/AerelionLayerDiagram';
import BriefingRequestCTA from '@/components/landing/BriefingRequestCTA';
import LandingFooter from '@/components/landing/LandingFooter';

const LibraryHome = () => {
  const homeStructuredData = [
    schemas.organization,
    schemas.localBusiness,
    schemas.service(
      "System Stabilization & Operational Governance",
      "Engineering the foundational logic for enterprise-scale autonomous systems. We configure, host, operate, and maintain operational infrastructure.",
      "/"
    ),
  ];

  return (
    <>
      <SEO
        title="AERELION Systems – System Stabilization & Operational Governance"
        description="AERELION is a managed automation operator engineering foundational logic for enterprise-scale autonomous systems. Standardized infrastructure for operational governance."
        keywords="operational governance, system stabilization, managed automation operator, enterprise automation"
        canonicalUrl="/"
        structuredData={homeStructuredData}
      />

      <main>
        <CommandCenterHero />
        <DoctrineGrid />
        <DualScopeRevenue />
        <OperationalParameters />
        <AerelionLayerDiagram />
        <BriefingArchives />
        <BriefingRequestCTA />
        <LandingFooter />
      </main>
    </>
  );
};

export default LibraryHome;
