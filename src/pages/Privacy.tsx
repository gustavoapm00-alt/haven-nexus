import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ScrollReveal from '@/components/ScrollReveal';

const Privacy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24">
        <section className="section-padding">
          <div className="container-main max-w-4xl">
            <ScrollReveal>
              <h1 className="font-display text-5xl md:text-6xl mb-8">
                PRIVACY <span className="text-gradient">POLICY</span>
              </h1>
              <p className="text-muted-foreground mb-8">
                Last updated: December 2024
              </p>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <div className="prose prose-invert max-w-none space-y-8">
                <section>
                  <h2 className="font-display text-2xl mb-4">1. Information We Collect</h2>
                  <p className="text-muted-foreground mb-4">We collect information you provide directly:</p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2">
                    <li>Name and contact information</li>
                    <li>Email address</li>
                    <li>Business information relevant to our services</li>
                    <li>Communications you send to us</li>
                  </ul>
                </section>

                <section>
                  <h2 className="font-display text-2xl mb-4">2. How We Use Your Information</h2>
                  <p className="text-muted-foreground mb-4">We use collected information to:</p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2">
                    <li>Provide and improve our services</li>
                    <li>Communicate with you about our services</li>
                    <li>Send relevant updates and marketing communications</li>
                    <li>Comply with legal obligations</li>
                  </ul>
                </section>

                <section>
                  <h2 className="font-display text-2xl mb-4">3. Information Sharing</h2>
                  <p className="text-muted-foreground">
                    We do not sell your personal information. We may share information with 
                    service providers who assist in our operations, subject to confidentiality 
                    obligations. We may also share information when required by law.
                  </p>
                </section>

                <section>
                  <h2 className="font-display text-2xl mb-4">4. Data Security</h2>
                  <p className="text-muted-foreground">
                    We implement appropriate technical and organizational measures to protect 
                    your personal information against unauthorized access, alteration, disclosure, 
                    or destruction.
                  </p>
                </section>

                <section>
                  <h2 className="font-display text-2xl mb-4">5. Your Rights</h2>
                  <p className="text-muted-foreground mb-4">You have the right to:</p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2">
                    <li>Access your personal information</li>
                    <li>Correct inaccurate information</li>
                    <li>Request deletion of your information</li>
                    <li>Opt out of marketing communications</li>
                  </ul>
                </section>

                <section>
                  <h2 className="font-display text-2xl mb-4">6. Cookies and Tracking</h2>
                  <p className="text-muted-foreground">
                    We use cookies and similar technologies to improve your experience, 
                    analyze site usage, and assist in our marketing efforts. You can control 
                    cookie preferences through your browser settings.
                  </p>
                </section>

                <section>
                  <h2 className="font-display text-2xl mb-4">7. Third-Party Services</h2>
                  <p className="text-muted-foreground">
                    Our services may contain links to third-party websites. We are not responsible 
                    for the privacy practices of these external sites. We encourage you to review 
                    their privacy policies.
                  </p>
                </section>

                <section>
                  <h2 className="font-display text-2xl mb-4">8. Changes to This Policy</h2>
                  <p className="text-muted-foreground">
                    We may update this Privacy Policy periodically. We will notify you of 
                    significant changes by posting the new policy on this page and updating 
                    the "Last updated" date.
                  </p>
                </section>

                <section>
                  <h2 className="font-display text-2xl mb-4">9. Contact Us</h2>
                  <p className="text-muted-foreground">
                    For questions about this Privacy Policy or our data practices, contact us at{' '}
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

export default Privacy;
