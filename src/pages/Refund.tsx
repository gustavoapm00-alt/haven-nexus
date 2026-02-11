import ScrollReveal from '@/components/ScrollReveal';
import SEO, { schemas } from '@/components/SEO';

const Refund = () => {
  return (
    <div className="min-h-screen bg-[#0F0F0F]">
      <SEO 
        title="Refund Policy – AERELION Systems"
        description="Refund Policy for AERELION managed automation services."
        canonicalUrl="/refund"
        structuredData={schemas.breadcrumb([
          { name: 'Home', url: '/' },
          { name: 'Refund Policy', url: '/refund' }
        ])}
      />
      
      <main className="pt-8">
        <section className="section-padding">
          <div className="container-main max-w-3xl">
            <ScrollReveal>
              <span className="font-mono text-[10px] text-[#39FF14]/50 uppercase tracking-[0.25em] mb-3 block">
                // FINANCIAL GOVERNANCE
              </span>
              <h1 className="font-mono text-3xl md:text-4xl font-semibold text-[#E0E0E0] mb-2">
                Refund Policy
              </h1>
              <p className="font-mono text-xs text-white/20 mb-10">
                Last updated: December 2024
              </p>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <div className="space-y-8">
                {[
                  { title: '1. Activated Protocols', content: 'Activated automation protocols are final once deployment begins. Due to the nature of managed infrastructure, refunds are not available once protocol configuration has been initiated.' },
                  { title: '2. Refund Eligibility', content: null, list: ['Infrastructure was unavailable for an extended period due to AERELION fault.', 'Billing errors resulting in overcharges.', 'Protocols were not delivered as specified in the engagement authorization.'] },
                  { title: '3. Process', content: 'To request a refund, contact contact@aerelion.systems with engagement details and reason. All requests reviewed within 5-7 operational days.' },
                  { title: '4. Processing', content: 'Approved refunds processed within 10 operational days. Additional time depends on payment provider.' },
                  { title: '5. Non-Refundable', content: null, list: ['Activated protocol systems once configuration has begun.', 'Activation and deployment services already rendered.', 'Third-party costs incurred on your behalf.'] },
                  { title: '6. Disputes', content: 'Contact contact@aerelion.systems before escalation to payment providers.' },
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

export default Refund;
