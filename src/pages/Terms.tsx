import { Helmet } from 'react-helmet-async';

const SECTIONS = [
  { title: 'Overview', content: 'AERELION ("we," "us") provides operational infrastructure and automation services. We configure and operate automation systems on behalf of authorized entities under fixed-scope engagements.' },
  { title: 'Services', list: ['Diagnose operational inefficiencies in business processes.', 'Configure and deploy automation systems using authorized platforms.', 'Monitor and maintain systems during the engagement period.', 'Engagement scope is fixed at authorization. No variable billing.'] },
  { title: 'Ownership & Access', list: ['You retain full ownership of your accounts, tools, and operational outcomes.', 'Credentials are used solely to deliver agreed services.', 'You may revoke authorization at any time.', 'Upon engagement completion, documentation and operational control are transferred.'] },
  { title: 'Authorization Requirements', list: ['Provide accurate access credentials and operational context.', 'Respond to authorization requests within reasonable timeframes.', 'Maintain active subscriptions to third-party tools required for your systems.'] },
  { title: 'Payment', content: 'Engagement fees are quoted upfront and scoped to agreed deliverables. Additional work beyond original scope is quoted separately under revised authorization.' },
  { title: 'Limitation of Liability', content: 'Services are provided in good faith based on supplied information. We are not liable for indirect, incidental, or consequential damages. Total liability is limited to fees paid for the specific engagement.' },
  { title: 'Changes to Terms', content: 'We may update these terms. Continued engagement constitutes acceptance. Material changes will be communicated directly to active clients.' },
  { title: 'Contact', content: 'Questions about these terms? Reach out at contact@aerelion.com' },
];

const Terms = () => (
  <main className="pt-32 pb-20">
    <Helmet>
      <title>Terms of Service – AERELION</title>
      <meta name="description" content="Terms of Service for AERELION automation services." />
    </Helmet>
    <div className="max-w-3xl mx-auto px-6 md:px-12">
      <p className="text-xs font-mono uppercase tracking-[0.25em] text-primary mb-4">Legal</p>
      <h1 className="font-display text-3xl md:text-4xl mb-2">Terms of Service</h1>
      <p className="text-sm text-muted-foreground mb-12">Last updated: February 2026</p>
      <div className="space-y-8">
        {SECTIONS.map((s, i) => (
          <div key={i} className="border-b border-border pb-6">
            <h2 className="text-sm font-semibold text-foreground mb-3">{s.title}</h2>
            {s.content && <p className="text-sm text-muted-foreground leading-relaxed">{s.content}</p>}
            {s.list && (
              <ul className="space-y-2">
                {s.list.map((item, j) => (
                  <li key={j} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="text-primary mt-0.5">—</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  </main>
);

export default Terms;
