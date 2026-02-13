import ScrollReveal from '@/components/ScrollReveal';
import SEO, { schemas } from '@/components/SEO';

const Terms = () => {
  return (
    <div className="min-h-screen bg-[#0F0F0F]">
      <SEO 
        title="Terms of Service – AERELION Systems"
        description="Terms of Service for AERELION Systems managed automation services."
        canonicalUrl="/terms"
        structuredData={schemas.breadcrumb([
          { name: 'Home', url: '/' },
          { name: 'Terms of Service', url: '/terms' }
        ])}
      />
      
      <main className="pt-8">
        <section className="section-padding">
          <div className="container-main max-w-3xl">
            <ScrollReveal>
              <span className="font-mono text-[10px] text-[#39FF14]/50 uppercase tracking-[0.25em] mb-3 block">
                // GOVERNANCE DOCUMENT
              </span>
              <h1 className="font-mono text-3xl md:text-4xl font-semibold text-[#E0E0E0] mb-2">
                Terms of Service
              </h1>
              <p className="font-mono text-xs text-white/20 mb-10">
                Last updated: January 2026
              </p>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <div className="space-y-8">
                {[
                  { title: 'Overview', content: 'AERELION Systems ("we," "us") provides operational infrastructure and automation governance services. We configure and operate automation protocols on behalf of authorized entities under scoped engagements.' },
                  { title: 'Services', content: null, list: ['Diagnose operational inefficiencies in business processes.', 'Configure and deploy stabilization protocols using authorized systems.', 'Monitor and maintain protocols during the engagement period.', 'Engagement scope is fixed at authorization. No variable billing.'] },
                  { title: 'Ownership & Access', content: null, list: ['You retain full ownership of your accounts, tools, and operational outcomes.', 'Credentials are used solely to deliver agreed services.', 'You may revoke authorization at any time.', 'Upon engagement completion, documentation and operational control are transferred.'] },
                  { title: 'Authorization Requirements', content: null, list: ['Provide accurate access credentials and operational context.', 'Respond to authorization requests within reasonable timeframes.', 'Maintain active subscriptions to third-party tools required for protocols.'] },
                  { title: 'Payment', content: 'Engagement fees are quoted upfront and scoped to agreed deliverables. Additional work beyond original scope is quoted separately under revised authorization.' },
                  { title: 'Limitation of Liability', content: 'Services are provided in good faith based on supplied information. We are not liable for indirect, incidental, or consequential damages. Total liability is limited to fees paid for the specific engagement.' },
                  { title: 'Changes to Terms', content: 'We may update these terms. Continued engagement constitutes acceptance. Material changes will be communicated directly to active entities.' },
                  { title: 'Contact', content: 'Questions about these terms? Contact us via the uplink terminal.', link: true },
                ].map((section, i) => (
                  <div key={i} className="border-b border-white/5 pb-6">
                    <h2 className="font-mono text-sm font-semibold text-[#E0E0E0] mb-3">{section.title}</h2>
                    {section.content && (
                      <p className="font-sans text-sm text-white/35 leading-relaxed">{section.content}
                        {section.link && (
                          <a href="/contact" className="text-[#39FF14]/60 hover:text-[#39FF14] ml-1 font-mono text-xs uppercase tracking-wider">
                            REQUEST_SCOPING →
                          </a>
                        )}
                      </p>
                    )}
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

export default Terms;
