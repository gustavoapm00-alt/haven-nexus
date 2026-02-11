import ScrollReveal from '@/components/ScrollReveal';
import SEO, { schemas } from '@/components/SEO';

const Disclaimer = () => {
  return (
    <div className="min-h-screen bg-[#0F0F0F]">
      <SEO 
        title="Disclaimer – AERELION Systems"
        description="Standard disclaimer for AERELION Systems. Website content is informational."
        canonicalUrl="/disclaimer"
        structuredData={schemas.breadcrumb([
          { name: 'Home', url: '/' },
          { name: 'Disclaimer', url: '/disclaimer' }
        ])}
      />
      
      <main className="pt-8">
        <section className="section-padding">
          <div className="container-main max-w-3xl">
            <ScrollReveal>
              <span className="font-mono text-[10px] text-[#39FF14]/50 uppercase tracking-[0.25em] mb-3 block">
                // LEGAL PROTOCOL
              </span>
              <h1 className="font-mono text-3xl md:text-4xl font-semibold text-[#E0E0E0] mb-2">
                Disclaimer
              </h1>
              <p className="font-mono text-xs text-white/20 mb-10">
                Last updated: December 2024
              </p>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <div className="space-y-8">
                {[
                  { title: 'Informational Content', content: 'Content on this website is provided for informational purposes. It describes capabilities, approach, and work types. It should not be relied upon as the basis for decisions without direct consultation.' },
                  { title: 'No Partnership or Obligation', content: 'Browsing this website, exchanging messages, or engaging in preliminary discussions does not create a partnership, joint venture, or any binding obligation. Formal relationships are established through written agreements.' },
                  { title: 'Professional Relationships', content: 'Written agreements — service contracts, NDAs, or partnership terms — are the foundation for productive, long-term collaboration. They protect all parties and enable operations with full transparency.' },
                  { title: 'Contact', content: 'contact@aerelion.systems' },
                ].map((section, i) => (
                  <div key={i} className="border-b border-white/5 pb-6">
                    <h2 className="font-mono text-sm font-semibold text-[#E0E0E0] mb-3">{section.title}</h2>
                    <p className="font-sans text-sm text-white/35 leading-relaxed">{section.content}</p>
                  </div>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Disclaimer;
