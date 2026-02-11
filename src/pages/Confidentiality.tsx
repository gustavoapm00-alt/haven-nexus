import ScrollReveal from '@/components/ScrollReveal';
import SEO, { schemas } from '@/components/SEO';

const Confidentiality = () => {
  return (
    <div className="min-h-screen bg-[#0F0F0F]">
      <SEO 
        title="Confidentiality & Pre-Engagement Disclosure – AERELION"
        description="AERELION's approach to early conversations and collaboration. Structured disclosure protocols."
        canonicalUrl="/confidentiality"
        structuredData={schemas.breadcrumb([
          { name: 'Home', url: '/' },
          { name: 'Confidentiality', url: '/confidentiality' }
        ])}
      />
      
      <main className="pt-8">
        <section className="section-padding">
          <div className="container-main max-w-3xl">
            <ScrollReveal>
              <span className="font-mono text-[10px] text-[#39FF14]/50 uppercase tracking-[0.25em] mb-3 block">
                // DISCLOSURE PROTOCOL
              </span>
              <h1 className="font-mono text-3xl md:text-4xl font-semibold text-[#E0E0E0] mb-2">
                Confidentiality & Pre-Engagement
              </h1>
              <p className="font-mono text-xs text-white/20 mb-10">
                Last updated: December 2024
              </p>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <div className="space-y-8">
                {[
                  { title: 'Engagement Model', content: 'Initial discussions are intentionally high-level. We explore fit, understand operational requirements, and share capabilities—without divulging sensitive technical or strategic details.' },
                  { title: 'Escalation Protocol', content: 'Detailed technical discussions, strategic sharing, and access to proprietary systems occur once both parties are aligned and expectations are formalized through mutual NDA, statement of work, or formal engagement authorization.' },
                  { title: 'Rationale', content: null, list: ['Ensures clarity before commitments are made', 'Protects intellectual property symmetrically', 'Enables faster, focused collaboration once aligned', 'Reflects how serious institutional partners operate'] },
                  { title: 'Contact', content: 'To initiate a conversation: contact@aerelion.systems' },
                ].map((section, i) => (
                  <div key={i} className="border-b border-white/5 pb-6">
                    <h2 className="font-mono text-sm font-semibold text-[#E0E0E0] mb-3">{section.title}</h2>
                    {section.content && <p className="font-sans text-sm text-white/35 leading-relaxed">{section.content}</p>}
                    {section.list && (
                      <ul className="space-y-2">
                        {section.list.map((item, j) => (
                          <li key={j} className="flex items-start gap-2 text-sm text-white/35 font-sans">
                            <span className="font-mono text-[10px] text-[#39FF14]/30 mt-1">▸</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    )}
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

export default Confidentiality;
