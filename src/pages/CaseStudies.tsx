import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ScrollReveal from '@/components/ScrollReveal';
import SEO from '@/components/SEO';

const caseStudies = [
  {
    id: 'real-estate-agency',
    title: 'Real Estate Agency',
    industry: 'Real Estate',
    summary: 'Unified lead intake from 5 sources, automated follow-ups, and zero dropped leads.',
    problem: 'This growing real estate agency was receiving leads from Zillow, Realtor.com, their website, social media, and referrals. Each source landed in a different place—some in email, some in spreadsheets, some in texts. The team was spending over 8 hours per week just organizing and following up with leads, and many were falling through the cracks due to inconsistent processes.',
    solution: [
      'Created a unified intake form that captures leads from all 5 sources into a single CRM pipeline',
      'Built automated routing rules that assign leads to agents based on territory and specialty',
      'Implemented a 7-touch email/SMS nurture sequence for new leads',
      'Set up Slack notifications for hot leads requiring immediate follow-up',
      'Created a live dashboard showing pipeline status and response time metrics',
    ],
    outcome: 'Average response time dropped from 4+ hours to under 5 minutes. The team reports zero leads lost to manual error since launch. Weekly admin time on lead management reduced from 8+ hours to under 30 minutes of review.',
    timeline: '14 days',
    tools: ['n8n', 'HubSpot', 'Twilio', 'Slack', 'Google Sheets'],
  },
  {
    id: 'ecommerce-brand',
    title: 'E-Commerce Brand',
    industry: 'E-Commerce / DTC',
    summary: 'Automated order updates, returns processing, and support ticket routing.',
    problem: 'A direct-to-consumer brand selling home goods was managing order status updates, returns, and customer inquiries manually across Shopify, email, and a basic helpdesk. The founder was personally handling customer support, which consumed a significant portion of each day. Customers frequently complained about slow response times and lack of order visibility.',
    solution: [
      'Integrated Shopify order events with automated customer notification flows',
      'Built a self-service return request form that routes to fulfillment with approval logic',
      'Created automatic ticket creation in the helpdesk when customers reply to order emails',
      'Set up priority routing for VIP customers based on order history',
      'Implemented a simple dashboard showing open tickets, pending returns, and fulfillment status',
    ],
    outcome: 'Customer support workload reduced by approximately 60%. Customers now receive instant order updates without needing to reach out. Return processing time cut from days to hours. Customer satisfaction scores improved with proactive communication.',
    timeline: '12 days',
    tools: ['n8n', 'Shopify', 'Freshdesk', 'Twilio', 'Airtable'],
  },
];

const CaseStudies = () => {
  const scrollToContact = () => {
    window.location.href = '/#contact';
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Case Studies"
        description="See how AERELION Systems has helped businesses automate their operations. Real results from workflow automation projects."
        keywords="automation case studies, workflow automation results, business automation examples"
        canonicalUrl="/case-studies"
      />
      <Navbar />
      
      <main className="pt-24">
        {/* Hero */}
        <section className="section-padding">
          <div className="container-main">
            <ScrollReveal>
              <div className="text-center max-w-3xl mx-auto">
                <span className="tag-chip mb-6">Case Studies</span>
                <h1 className="font-display text-5xl md:text-6xl mb-6">
                  REAL <span className="text-gradient">RESULTS</span>
                </h1>
                <p className="text-xl text-muted-foreground">
                  See how we've helped businesses eliminate manual work and focus on growth.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Case Studies */}
        <section className="section-padding pt-0">
          <div className="container-main max-w-4xl space-y-16">
            {caseStudies.map((study, index) => (
              <ScrollReveal key={study.id} delay={index * 0.1}>
                <article className="card-glass p-8 md:p-12 rounded-lg">
                  <div className="flex flex-wrap items-center gap-3 mb-6">
                    <h2 className="font-display text-3xl md:text-4xl">{study.title}</h2>
                    <span className="tag-chip">{study.industry}</span>
                  </div>
                  
                  <p className="text-xl text-muted-foreground mb-8 border-l-2 border-primary pl-4">
                    {study.summary}
                  </p>

                  <div className="space-y-8">
                    <div>
                      <h3 className="font-display text-xl text-primary mb-3">THE PROBLEM</h3>
                      <p className="text-muted-foreground">{study.problem}</p>
                    </div>

                    <div>
                      <h3 className="font-display text-xl text-primary mb-3">WHAT WE BUILT</h3>
                      <ul className="space-y-2">
                        {study.solution.map((item, i) => (
                          <li key={i} className="flex items-start gap-3 text-muted-foreground">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h3 className="font-display text-xl text-primary mb-3">THE OUTCOME</h3>
                      <p className="text-foreground">{study.outcome}</p>
                    </div>

                    <div className="flex flex-wrap gap-6 pt-4 border-t border-border/50">
                      <div>
                        <p className="text-muted-foreground text-sm">Timeline</p>
                        <p className="font-medium">{study.timeline}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-sm">Tools Used</p>
                        <p className="font-medium">{study.tools.join(', ')}</p>
                      </div>
                    </div>
                  </div>
                </article>
              </ScrollReveal>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="section-padding bg-card/30">
          <div className="container-main">
            <ScrollReveal>
              <div className="card-glass p-12 md:p-16 rounded-lg text-center">
                <h2 className="font-display text-4xl md:text-5xl mb-6">
                  READY FOR <span className="text-gradient">YOUR RESULTS</span>?
                </h2>
                <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
                  Book a free automation audit and see what we can build for you in 14 days.
                </p>
                <button onClick={scrollToContact} className="btn-primary">
                  Book a Free Automation Audit
                  <ArrowRight className="ml-2 h-4 w-4" />
                </button>
              </div>
            </ScrollReveal>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default CaseStudies;
