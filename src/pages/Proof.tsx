import { Link } from 'react-router-dom';
import { ArrowRight, Workflow, LayoutDashboard, Network, FileText } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ScrollReveal from '@/components/ScrollReveal';
import SEO, { schemas } from '@/components/SEO';

const proofTypes = [
  {
    icon: Workflow,
    title: 'Workflow Diagrams',
    description: 'Before and after workflow diagrams showing how operations changed from manual to automated.',
    status: 'Available upon request'
  },
  {
    icon: LayoutDashboard,
    title: 'Dashboard Screenshots',
    description: 'Redacted screenshots of operational dashboards showing the visibility and control clients gain.',
    status: 'Available upon request'
  },
  {
    icon: Network,
    title: 'System Tool Maps',
    description: 'Visual maps showing tool connections, triggers, and routing logic deployed for clients.',
    status: 'Available upon request'
  },
  {
    icon: FileText,
    title: 'Case Narratives',
    description: 'Short narratives describing the problem, system change, and operational difference achieved.',
    status: 'Coming soon'
  }
];

const placeholderCases = [
  {
    industry: 'Professional Services',
    problem: 'Lead intake was manual, follow-ups were inconsistent, and the founder was the bottleneck for every new opportunity.',
    systemChange: 'Deployed automated lead intake → CRM routing → follow-up sequences with visibility dashboard.',
    outcome: 'Leads no longer slip. Founder sees pipeline status without checking email. Follow-ups happen on schedule.'
  },
  {
    industry: 'E-Commerce Operations',
    problem: 'Order fulfillment relied on memory and spreadsheets. Customer status inquiries required manual lookup.',
    systemChange: 'Deployed order status automation → customer notification sequences → support dashboard.',
    outcome: 'Customer inquiries reduced. Team has real-time visibility into order status without digging through systems.'
  },
  {
    industry: 'Service Business',
    problem: 'Onboarding new clients required manual emails, document requests, and task creation across multiple tools.',
    systemChange: 'Deployed client onboarding workflow → automated document collection → task generation → progress tracking.',
    outcome: 'New clients receive consistent experience. Nothing falls through the cracks. Progress is visible to the team.'
  }
];

const Proof = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Proof"
        description="See how AERELION builds operational systems. Workflow diagrams, dashboard screenshots, system maps, and case narratives—no revenue claims."
        keywords="automation case studies, workflow automation examples, system deployment proof, operational systems"
        canonicalUrl="/proof"
        structuredData={schemas.breadcrumb([
          { name: 'Home', url: '/' },
          { name: 'Proof', url: '/proof' }
        ])}
      />
      <Navbar />
      
      <main className="pt-24">
        {/* Hero */}
        <section className="section-padding">
          <div className="container-main">
            <ScrollReveal>
              <div className="text-center max-w-3xl mx-auto">
                <span className="tag-chip mb-6">Our Work</span>
                <h1 className="font-display text-5xl md:text-6xl mb-6">
                  PROOF
                </h1>
                <p className="text-xl text-muted-foreground">
                  We show structure and observability—not revenue claims or hype. 
                  Here's what we actually build.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Proof Types */}
        <section className="section-padding pt-0">
          <div className="container-main">
            <ScrollReveal>
              <div className="mb-12">
                <h2 className="font-display text-3xl mb-4">What We Share</h2>
                <p className="text-muted-foreground">
                  Proof that matches what we promise: clarity, reliability, and operational control.
                </p>
              </div>
            </ScrollReveal>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {proofTypes.map((type, index) => (
                <ScrollReveal key={index} delay={index * 0.1}>
                  <div className="card-glass p-6 rounded-lg h-full text-center">
                    <type.icon className="h-10 w-10 text-primary mx-auto mb-4" />
                    <h3 className="font-display text-lg mb-2">{type.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{type.description}</p>
                    <span className="text-xs text-primary">{type.status}</span>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* Case Narratives */}
        <section className="section-padding bg-card/30">
          <div className="container-main">
            <ScrollReveal>
              <div className="mb-12">
                <h2 className="font-display text-3xl mb-4">Case Narratives</h2>
                <p className="text-muted-foreground">
                  Problem → System Change → Operational Difference. No revenue claims. Just operational truth.
                </p>
              </div>
            </ScrollReveal>

            <div className="space-y-8">
              {placeholderCases.map((caseItem, index) => (
                <ScrollReveal key={index} delay={index * 0.1}>
                  <div className="card-glass p-8 rounded-lg">
                    <span className="text-xs text-primary uppercase tracking-wider font-medium">
                      {caseItem.industry}
                    </span>
                    
                    <div className="grid md:grid-cols-3 gap-6 mt-4">
                      <div>
                        <h4 className="font-medium text-sm uppercase tracking-wider text-destructive/80 mb-2">Problem</h4>
                        <p className="text-muted-foreground text-sm">{caseItem.problem}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm uppercase tracking-wider text-primary mb-2">System Change</h4>
                        <p className="text-muted-foreground text-sm">{caseItem.systemChange}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm uppercase tracking-wider text-green-500 mb-2">Operational Difference</h4>
                        <p className="text-muted-foreground text-sm">{caseItem.outcome}</p>
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* What We Don't Show */}
        <section className="section-padding">
          <div className="container-main max-w-3xl">
            <ScrollReveal>
              <div className="text-center mb-12">
                <h2 className="font-display text-3xl md:text-4xl mb-4">
                  WHAT WE <span className="text-gradient">DON'T</span> SHOW
                </h2>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <div className="card-glass p-8 rounded-lg">
                <ul className="space-y-4 text-muted-foreground">
                  <li className="flex items-start gap-3">
                    <span className="text-muted-foreground/50">—</span>
                    Revenue screenshots or "10x ROI" claims
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-muted-foreground/50">—</span>
                    Vague testimonials without specifics
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-muted-foreground/50">—</span>
                    Flashy AI demos detached from real operations
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-muted-foreground/50">—</span>
                    Outcome guarantees or success promises
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-muted-foreground/50">—</span>
                    "Autopilot your business" messaging
                  </li>
                </ul>
                <p className="mt-6 text-sm text-muted-foreground/70 italic text-center">
                  We promise clarity, reliability, and control. Our proof reflects that.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* CTA */}
        <section className="section-padding bg-card/30">
          <div className="container-main">
            <ScrollReveal>
              <div className="text-center">
                <h2 className="font-display text-4xl md:text-5xl mb-6">
                  WANT TO SEE <span className="text-gradient">MORE</span>?
                </h2>
                <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
                  We can share relevant examples during a conversation about your operations.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Link to="/get-started" className="btn-primary">
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                  <Link to="/reliability" className="btn-secondary">
                    See Reliability Practices
                  </Link>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Proof;