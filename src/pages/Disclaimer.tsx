import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ScrollReveal from '@/components/ScrollReveal';
import SEO, { schemas } from '@/components/SEO';

const Disclaimer = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Disclaimer"
        description="Standard disclaimer for Aerlion Systems. Website content is informational. Formal agreements enable stronger collaboration."
        canonicalUrl="/disclaimer"
        structuredData={schemas.breadcrumb([
          { name: 'Home', url: '/' },
          { name: 'Disclaimer', url: '/disclaimer' }
        ])}
      />
      <Navbar />
      
      <main className="pt-24">
        <section className="section-padding">
          <div className="container-main max-w-4xl">
            <ScrollReveal>
              <h1 className="font-display text-5xl md:text-6xl mb-8">
                <span className="text-gradient">DISCLAIMER</span>
              </h1>
              <p className="text-muted-foreground mb-8">
                Last updated: December 2024
              </p>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <div className="prose prose-invert max-w-none space-y-8">
                <section>
                  <h2 className="font-display text-2xl mb-4">Informational Content</h2>
                  <p className="text-muted-foreground">
                    The content on this website is provided for informational purposes. It describes 
                    our capabilities, approach, and the types of work we do. While we strive to keep 
                    information current and accurate, it should not be relied upon as the basis for 
                    business decisions without direct consultation.
                  </p>
                </section>

                <section>
                  <h2 className="font-display text-2xl mb-4">No Partnership or Obligation</h2>
                  <p className="text-muted-foreground">
                    Browsing this website, exchanging messages, or engaging in preliminary discussions 
                    does not create a partnership, joint venture, or any binding obligation between you 
                    and AERELION SYSTEMS.
                  </p>
                  <p className="text-muted-foreground mt-4">
                    Formal relationships are established through written agreements. This clarity 
                    benefits everyone — it ensures that when we do work together, expectations are 
                    well-defined and collaboration can proceed smoothly.
                  </p>
                </section>

                <section>
                  <h2 className="font-display text-2xl mb-4">Professional Relationships</h2>
                  <p className="text-muted-foreground">
                    We welcome inquiries, partnerships, and client engagements. Written agreements 
                    — whether service contracts, NDAs, or partnership terms — are the foundation for 
                    productive, long-term collaboration. They protect all parties and enable us to 
                    work together with full transparency.
                  </p>
                </section>

                <section>
                  <h2 className="font-display text-2xl mb-4">Get in Touch</h2>
                  <p className="text-muted-foreground">
                    If you're interested in working together or have questions, we'd love to hear from you. 
                    Contact us at{' '}
                    <a href="mailto:contact@aerlion.systems" className="text-primary hover:underline">
                      contact@aerlion.systems
                    </a>
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

export default Disclaimer;
