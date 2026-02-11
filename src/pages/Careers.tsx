import { ExternalLink } from 'lucide-react';
import SEO, { schemas } from '@/components/SEO';

const BREEZY_CAREERS_URL = 'https://aerelion-systems-llc.breezy.hr/p/69e13036d878-automation-operations-specialist';

const Careers = () => {
  const careersStructuredData = [
    schemas.webPage("Careers at AERELION", "Join our team of automation operators", "/careers"),
    schemas.breadcrumb([
      { name: 'Home', url: '/' },
      { name: 'Careers', url: '/careers' }
    ]),
    {
      "@context": "https://schema.org",
      "@type": "JobPosting",
      "title": "Automation Operations Specialist",
      "description": "Operate and maintain automation systems for professional services firms",
      "hiringOrganization": {
        "@type": "Organization",
        "name": "AERELION Systems",
        "sameAs": "https://aerelion.systems"
      },
      "employmentType": "FULL_TIME",
      "jobLocation": {
        "@type": "Place",
        "address": { "@type": "PostalAddress", "addressCountry": "US" }
      }
    }
  ];

  return (
    <>
      <SEO
        title="Careers at AERELION – Operational Infrastructure Team"
        description="AERELION is building a team of operators who value reliability, accountability, and clear scope. View open positions."
        keywords="automation jobs, operations careers, automation operator jobs"
        canonicalUrl="/careers"
        structuredData={careersStructuredData}
      />
      
      <div className="min-h-screen bg-[#0F0F0F]">
        <main className="pt-8">
          <section className="section-padding">
            <div className="container-main max-w-3xl">
              <span className="font-mono text-[10px] text-[#39FF14]/50 uppercase tracking-[0.25em] mb-3 block">
                // PERSONNEL REGISTRY
              </span>
              <h1 className="font-mono text-3xl md:text-4xl font-semibold text-[#E0E0E0] mb-4">
                Operational Infrastructure Team
              </h1>
              <p className="font-sans text-base text-white/40 leading-relaxed mb-12">
                AERELION is building a team of operators who value reliability, accountability, and clear scope. We hire operators, not hobbyists.
              </p>

              <div className="border border-white/10 p-8 md:p-12 text-center">
                <span className="font-mono text-[9px] text-[#39FF14]/40 uppercase tracking-[0.2em] mb-4 block">
                  ACTIVE_REQUISITIONS
                </span>
                <h2 className="font-mono text-xl font-semibold text-[#E0E0E0] mb-4">
                  Open Positions
                </h2>
                <p className="font-sans text-sm text-white/30 mb-8">
                  All open positions are managed through our hiring platform.
                </p>
                
                <a 
                  href={BREEZY_CAREERS_URL} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn-launch inline-flex items-center gap-2"
                >
                  VIEW_POSITIONS
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </section>
        </main>
      </div>
    </>
  );
};

export default Careers;
