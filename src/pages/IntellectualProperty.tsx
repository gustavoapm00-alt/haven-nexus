import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ScrollReveal from '@/components/ScrollReveal';
import SEO, { schemas } from '@/components/SEO';

const IntellectualProperty = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Intellectual Property & Acceptable Use"
        description="Aerlion Systems' approach to intellectual property. We build openly, collaborate professionally, and protect execution to enable long-term innovation."
        canonicalUrl="/intellectual-property"
        structuredData={schemas.breadcrumb([
          { name: 'Home', url: '/' },
          { name: 'Intellectual Property', url: '/intellectual-property' }
        ])}
      />
      <Navbar />
      
      <main className="pt-24">
        <section className="section-padding">
          <div className="container-main max-w-4xl">
            <ScrollReveal>
              <h1 className="font-display text-5xl md:text-6xl mb-8">
                INTELLECTUAL PROPERTY & <span className="text-gradient">ACCEPTABLE USE</span>
              </h1>
              <p className="text-muted-foreground mb-8">
                Last updated: December 2024
              </p>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <div className="prose prose-invert max-w-none space-y-8">
                <section>
                  <h2 className="font-display text-2xl mb-4">Our Approach</h2>
                  <p className="text-muted-foreground">
                    AERELION SYSTEMS is built on a foundation of innovation, transparency, and collaboration. 
                    We openly share our vision, capabilities, and the outcomes we create with our partners 
                    and clients. This openness is central to how we work and how we build trust.
                  </p>
                  <p className="text-muted-foreground mt-4">
                    At the same time, we protect the execution — the specific systems, workflows, architectures, 
                    and methodologies that make our work distinct. This balance allows us to collaborate freely 
                    while maintaining the integrity of our craft.
                  </p>
                </section>

                <section>
                  <h2 className="font-display text-2xl mb-4">What We Protect</h2>
                  <p className="text-muted-foreground mb-4">
                    The following elements are proprietary to AERELION SYSTEMS:
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2">
                    <li>Internal systems, architectures, and technical implementations</li>
                    <li>Workflow designs, automation logic, and process methodologies</li>
                    <li>Prompts, agent configurations, and AI system designs</li>
                    <li>Source code, algorithms, and proprietary tools</li>
                    <li>Documentation and training materials not publicly released</li>
                  </ul>
                  <p className="text-muted-foreground mt-4">
                    Viewing our website does not grant rights to replicate, reverse-engineer, or redistribute 
                    these internal systems. This clarity supports fair collaboration and protects the work 
                    we do together with clients.
                  </p>
                </section>

                <section>
                  <h2 className="font-display text-2xl mb-4">AI Training & Automated Access</h2>
                  <p className="text-muted-foreground">
                    Training AI models or automated systems on content from this website requires written 
                    permission from AERELION SYSTEMS. We're happy to discuss appropriate use cases — simply 
                    reach out to explore how we might work together.
                  </p>
                </section>

                <section>
                  <h2 className="font-display text-2xl mb-4">Why This Matters</h2>
                  <p className="text-muted-foreground">
                    These guidelines exist to support long-term innovation and enable meaningful partnerships. 
                    When execution is protected, we can share ideas more freely, explore collaborations openly, 
                    and build with confidence alongside our clients and partners.
                  </p>
                </section>

                <section>
                  <h2 className="font-display text-2xl mb-4">Questions?</h2>
                  <p className="text-muted-foreground">
                    If you have questions about acceptable use or would like to discuss a collaboration, 
                    contact us at{' '}
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

export default IntellectualProperty;
