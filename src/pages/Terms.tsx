import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ScrollReveal from '@/components/ScrollReveal';

const Terms = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24">
        <section className="section-padding">
          <div className="container-main max-w-4xl">
            <ScrollReveal>
              <h1 className="font-display text-5xl md:text-6xl mb-8">
                TERMS OF <span className="text-gradient">SERVICE</span>
              </h1>
              <p className="text-muted-foreground mb-8">
                Last updated: December 2024
              </p>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <div className="prose prose-invert max-w-none space-y-8">
                <section>
                  <h2 className="font-display text-2xl mb-4">1. Acceptance of Terms</h2>
                  <p className="text-muted-foreground">
                    By accessing or using Aerlion Systems' services, you agree to be bound by these 
                    Terms of Service. If you do not agree to these terms, please do not use our services.
                  </p>
                </section>

                <section>
                  <h2 className="font-display text-2xl mb-4">2. Services Description</h2>
                  <p className="text-muted-foreground">
                    Aerlion Systems provides AI automation, workflow optimization, e-commerce solutions, 
                    and related technology services. We reserve the right to modify, suspend, or discontinue 
                    any service at any time.
                  </p>
                </section>

                <section>
                  <h2 className="font-display text-2xl mb-4">3. User Responsibilities</h2>
                  <p className="text-muted-foreground mb-4">You agree to:</p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2">
                    <li>Provide accurate and complete information</li>
                    <li>Maintain the security of your account credentials</li>
                    <li>Use services in compliance with applicable laws</li>
                    <li>Not misuse or attempt to gain unauthorized access to our systems</li>
                  </ul>
                </section>

                <section>
                  <h2 className="font-display text-2xl mb-4">4. Intellectual Property</h2>
                  <p className="text-muted-foreground">
                    All content, features, and functionality of our services are owned by Aerlion Systems 
                    and protected by intellectual property laws. Custom solutions developed for clients 
                    are subject to individual service agreements.
                  </p>
                </section>

                <section>
                  <h2 className="font-display text-2xl mb-4">5. Payment Terms</h2>
                  <p className="text-muted-foreground">
                    Payment terms are established in individual service agreements. All fees are 
                    non-refundable unless otherwise specified. We reserve the right to modify pricing 
                    with reasonable notice.
                  </p>
                </section>

                <section>
                  <h2 className="font-display text-2xl mb-4">6. Limitation of Liability</h2>
                  <p className="text-muted-foreground">
                    Aerlion Systems shall not be liable for any indirect, incidental, special, or 
                    consequential damages arising from the use of our services. Our total liability 
                    is limited to the amount paid for services in the preceding 12 months.
                  </p>
                </section>

                <section>
                  <h2 className="font-display text-2xl mb-4">7. Termination</h2>
                  <p className="text-muted-foreground">
                    Either party may terminate services with reasonable notice. Upon termination, 
                    your right to use services ceases immediately. We may terminate immediately 
                    for violations of these terms.
                  </p>
                </section>

                <section>
                  <h2 className="font-display text-2xl mb-4">8. Changes to Terms</h2>
                  <p className="text-muted-foreground">
                    We may update these terms periodically. Continued use of our services after 
                    changes constitutes acceptance of the updated terms.
                  </p>
                </section>

                <section>
                  <h2 className="font-display text-2xl mb-4">9. Contact</h2>
                  <p className="text-muted-foreground">
                    For questions about these Terms of Service, contact us at{' '}
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

export default Terms;
