import ScrollReveal from '@/components/ScrollReveal';
import SEO, { schemas } from '@/components/SEO';

const IntellectualProperty = () => {
  return (
    <div className="min-h-screen bg-[#0F0F0F]">
      <SEO 
        title="Intellectual Property & Acceptable Use – AERELION"
        description="AERELION Systems' approach to intellectual property protection and acceptable use."
        canonicalUrl="/intellectual-property"
        structuredData={schemas.breadcrumb([
          { name: 'Home', url: '/' },
          { name: 'Intellectual Property', url: '/intellectual-property' }
        ])}
      />
      
      <main className="pt-8">
        <section className="section-padding">
          <div className="container-main max-w-3xl">
            <ScrollReveal>
              <span className="font-mono text-[10px] text-[#39FF14]/50 uppercase tracking-[0.25em] mb-3 block">
                // IP GOVERNANCE
              </span>
              <h1 className="font-mono text-3xl md:text-4xl font-semibold text-[#E0E0E0] mb-2">
                Intellectual Property & Acceptable Use
              </h1>
              <p className="font-mono text-xs text-white/20 mb-10">
                Last updated: December 2024
              </p>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <div className="space-y-8">
                {[
                  { title: 'Protected Assets', content: null, list: ['Internal systems, architectures, and technical implementations', 'Protocol designs, automation logic, and process methodologies', 'Prompts, agent configurations, and AI system designs', 'Source code, algorithms, and proprietary tools', 'Documentation and training materials not publicly released'] },
                  { title: 'AI Training & Automated Access', content: 'Training AI models or automated systems on content from this website requires written permission from AERELION Systems.' },
                  { title: 'Rationale', content: 'These guidelines exist to support long-term innovation and enable meaningful partnerships. When execution is protected, collaboration can proceed with confidence and transparency.' },
                  { title: 'Contact', content: 'contact@aerelion.systems' },
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

export default IntellectualProperty;
