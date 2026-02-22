import { Helmet } from 'react-helmet-async';

const SECTIONS = [
  { title: '1. Completed Engagements', content: 'Completed automation engagements are final once deployment begins. Due to the nature of managed infrastructure, refunds are not available once system configuration has been initiated.' },
  { title: '2. Refund Eligibility', list: ['Infrastructure was unavailable for an extended period due to AERELION fault.', 'Billing errors resulting in overcharges.', 'Systems were not delivered as specified in the engagement scope.'] },
  { title: '3. Process', content: 'To request a refund, contact contact@aerelion.com with engagement details and reason. All requests reviewed within 5–7 business days.' },
  { title: '4. Processing', content: 'Approved refunds processed within 10 business days. Additional time depends on payment provider.' },
  { title: '5. Non-Refundable', list: ['Activated systems once configuration has begun.', 'Deployment services already rendered.', 'Third-party costs incurred on your behalf.'] },
  { title: '6. Disputes', content: 'Contact contact@aerelion.com before escalation to payment providers.' },
];

const Refund = () => (
  <main className="pt-32 pb-20">
    <Helmet>
      <title>Refund Policy – AERELION</title>
      <meta name="description" content="Refund Policy for AERELION automation services." />
    </Helmet>
    <div className="max-w-3xl mx-auto px-6 md:px-12">
      <p className="text-xs font-mono uppercase tracking-[0.25em] text-primary mb-4">Legal</p>
      <h1 className="font-display text-3xl md:text-4xl mb-2">Refund Policy</h1>
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

export default Refund;
