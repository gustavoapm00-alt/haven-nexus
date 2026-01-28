import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ScrollReveal from '@/components/ScrollReveal';
import SEO, { schemas } from '@/components/SEO';

const Terms = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Terms of Service – AERELION Systems"
        description="Terms of Service for AERELION Systems managed automation services. Learn about our scoped-engagement model, ownership, client responsibilities, and service terms."
        keywords="terms of service, automation service agreement, managed automation terms, service contract, professional services terms"
        canonicalUrl="/terms"
        structuredData={schemas.breadcrumb([
          { name: 'Home', url: '/' },
          { name: 'Terms of Service', url: '/terms' }
        ])}
      />
      <Navbar />
      
      <main className="pt-24">
        <section className="section-padding">
          <div className="container-main max-w-3xl">
            <ScrollReveal>
              <h1 className="font-display text-4xl md:text-5xl mb-6">
                Terms of Service
              </h1>
              <p className="text-muted-foreground mb-10">
                Last updated: January 2026
              </p>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <div className="prose prose-invert max-w-none space-y-10">
                
                <section>
                  <h2 className="font-display text-xl mb-3">Overview</h2>
                  <p className="text-muted-foreground">
                    AERELION Systems ("we," "us") provides AI operations integration services. 
                    We install, configure, and operate automation workflows on behalf of clients 
                    under scoped engagements. By engaging our services, you agree to these terms.
                  </p>
                </section>

                <section>
                  <h2 className="font-display text-xl mb-3">Services</h2>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2">
                    <li>We diagnose operational inefficiencies in your business processes.</li>
                    <li>We install and configure workflows using your existing tools and accounts.</li>
                    <li>We monitor and maintain workflows during the engagement period.</li>
                    <li>Pricing is determined per engagement, not per individual workflow.</li>
                  </ul>
                </section>

                <section>
                  <h2 className="font-display text-xl mb-3">Ownership & Access</h2>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2">
                    <li>You retain full ownership of your accounts, tools, and workflows.</li>
                    <li>Credentials you provide are used solely to deliver agreed services.</li>
                    <li>You may revoke our access at any time through your tool settings.</li>
                    <li>Upon engagement completion, we provide documentation and transfer operational control to you.</li>
                  </ul>
                </section>

                <section>
                  <h2 className="font-display text-xl mb-3">Client Responsibilities</h2>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2">
                    <li>Provide accurate access credentials and operational context.</li>
                    <li>Respond to requests for clarification within reasonable timeframes.</li>
                    <li>Maintain active subscriptions to third-party tools required for workflows.</li>
                  </ul>
                </section>

                <section>
                  <h2 className="font-display text-xl mb-3">Payment</h2>
                  <p className="text-muted-foreground">
                    Engagement fees are quoted upfront and scoped to the agreed deliverables. 
                    No recurring subscriptions are required to use our services. 
                    Additional work beyond the original scope is quoted separately.
                  </p>
                </section>

                <section>
                  <h2 className="font-display text-xl mb-3">Limitation of Liability</h2>
                  <p className="text-muted-foreground">
                    We provide services in good faith based on the information you supply. 
                    We are not liable for indirect, incidental, or consequential damages. 
                    Our total liability is limited to the fees paid for the specific engagement.
                  </p>
                </section>

                <section>
                  <h2 className="font-display text-xl mb-3">Changes to Terms</h2>
                  <p className="text-muted-foreground">
                    We may update these terms. Continued engagement constitutes acceptance of updated terms. 
                    Material changes will be communicated directly to active clients.
                  </p>
                </section>

                <section>
                  <h2 className="font-display text-xl mb-3">Contact</h2>
                  <p className="text-muted-foreground">
                    Questions about these terms? Contact us via our{' '}
                    <a href="/contact" className="text-primary hover:underline">
                      booking form
                    </a>.
                  </p>
                </section>

              </div>
            </ScrollReveal>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Terms;
