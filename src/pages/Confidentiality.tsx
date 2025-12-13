import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ScrollReveal from '@/components/ScrollReveal';
import SEO, { schemas } from '@/components/SEO';

const Confidentiality = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Confidentiality & Pre-Engagement Disclosure"
        description="How Aerlion Systems approaches early conversations and collaboration. We go deeper once aligned, enabling open and efficient partnerships."
        canonicalUrl="/confidentiality"
        structuredData={schemas.breadcrumb([
          { name: 'Home', url: '/' },
          { name: 'Confidentiality', url: '/confidentiality' }
        ])}
      />
      <Navbar />
      
      <main className="pt-24">
        <section className="section-padding">
          <div className="container-main max-w-4xl">
            <ScrollReveal>
              <h1 className="font-display text-5xl md:text-6xl mb-8">
                CONFIDENTIALITY & <span className="text-gradient">PRE-ENGAGEMENT</span>
              </h1>
              <p className="text-muted-foreground mb-8">
                Last updated: December 2024
              </p>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <div className="prose prose-invert max-w-none space-y-8">
                <section>
                  <h2 className="font-display text-2xl mb-4">How We Collaborate</h2>
                  <p className="text-muted-foreground">
                    We love working with ambitious people and organizations. Our approach to new relationships 
                    is designed to create clarity for everyone involved — so we can move forward with confidence 
                    and focus on what matters: building together.
                  </p>
                </section>

                <section>
                  <h2 className="font-display text-2xl mb-4">Early Conversations</h2>
                  <p className="text-muted-foreground">
                    Initial discussions are intentionally high-level. We explore fit, understand goals, and 
                    share how we might help — without diving into sensitive technical or strategic details. 
                    This keeps early conversations lightweight and exploratory for both sides.
                  </p>
                  <p className="text-muted-foreground mt-4">
                    Once we've established mutual interest, we move into deeper collaboration.
                  </p>
                </section>

                <section>
                  <h2 className="font-display text-2xl mb-4">Going Deeper</h2>
                  <p className="text-muted-foreground">
                    Detailed technical discussions, strategic sharing, and access to proprietary systems 
                    happen once both parties are aligned and expectations are clear. This typically involves 
                    a written agreement — whether a simple mutual NDA, a statement of work, or a formal engagement.
                  </p>
                  <p className="text-muted-foreground mt-4 font-medium text-foreground">
                    This structure allows us to collaborate openly and efficiently once expectations are clear.
                  </p>
                </section>

                <section>
                  <h2 className="font-display text-2xl mb-4">Why This Approach?</h2>
                  <p className="text-muted-foreground mb-4">
                    This process protects everyone involved:
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2">
                    <li>It ensures clarity before commitments are made</li>
                    <li>It protects your ideas as much as ours</li>
                    <li>It enables faster, more focused collaboration once aligned</li>
                    <li>It reflects how serious partners typically work together</li>
                  </ul>
                </section>

                <section>
                  <h2 className="font-display text-2xl mb-4">Ready to Explore?</h2>
                  <p className="text-muted-foreground">
                    We're always open to exploring new partnerships and projects. If you'd like to start 
                    a conversation, reach out at{' '}
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

export default Confidentiality;
