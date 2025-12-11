import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ScrollReveal from '@/components/ScrollReveal';

const Refund = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24">
        <section className="section-padding">
          <div className="container-main max-w-4xl">
            <ScrollReveal>
              <h1 className="font-display text-5xl md:text-6xl mb-8">
                REFUND <span className="text-gradient">POLICY</span>
              </h1>
              <p className="text-muted-foreground mb-8">
                Last updated: December 2024
              </p>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <div className="prose prose-invert max-w-none space-y-8">
                <section>
                  <h2 className="font-display text-2xl mb-4">1. Free Trial Period</h2>
                  <p className="text-muted-foreground">
                    We offer a 14-day free trial for our services. During this period, you have 
                    full access to evaluate our platform. No payment is required during the trial, 
                    and you may cancel at any time without obligation.
                  </p>
                </section>

                <section>
                  <h2 className="font-display text-2xl mb-4">2. Subscription Services</h2>
                  <p className="text-muted-foreground">
                    For subscription-based services, you may cancel your subscription at any time. 
                    Cancellations take effect at the end of the current billing period. We do not 
                    provide prorated refunds for partial months.
                  </p>
                </section>

                <section>
                  <h2 className="font-display text-2xl mb-4">3. Custom Development Projects</h2>
                  <p className="text-muted-foreground">
                    Custom development projects follow the payment terms outlined in individual 
                    service agreements. Generally:
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2 mt-4">
                    <li>Deposits are non-refundable once work has commenced</li>
                    <li>Milestone payments are due upon completion of each project phase</li>
                    <li>Final payments are due upon project delivery</li>
                  </ul>
                </section>

                <section>
                  <h2 className="font-display text-2xl mb-4">4. Refund Eligibility</h2>
                  <p className="text-muted-foreground mb-4">
                    Refunds may be considered in the following circumstances:
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2">
                    <li>Service was unavailable for an extended period due to our fault</li>
                    <li>Billing errors resulting in overcharges</li>
                    <li>Services were not delivered as specified in the agreement</li>
                  </ul>
                </section>

                <section>
                  <h2 className="font-display text-2xl mb-4">5. Refund Process</h2>
                  <p className="text-muted-foreground">
                    To request a refund, contact us at{' '}
                    <a href="mailto:contact@aerlion.systems" className="text-primary hover:underline">
                      contact@aerlion.systems
                    </a>{' '}
                    with your account details and reason for the request. We will review all 
                    requests within 5-7 business days and respond with our decision.
                  </p>
                </section>

                <section>
                  <h2 className="font-display text-2xl mb-4">6. Processing Time</h2>
                  <p className="text-muted-foreground">
                    Approved refunds are processed within 10 business days. The time for funds 
                    to appear in your account depends on your payment provider and may take an 
                    additional 5-10 business days.
                  </p>
                </section>

                <section>
                  <h2 className="font-display text-2xl mb-4">7. Non-Refundable Items</h2>
                  <p className="text-muted-foreground mb-4">The following are not eligible for refunds:</p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2">
                    <li>Services already rendered and accepted</li>
                    <li>Custom development work that has been completed</li>
                    <li>Third-party costs incurred on your behalf</li>
                    <li>Setup and onboarding fees</li>
                  </ul>
                </section>

                <section>
                  <h2 className="font-display text-2xl mb-4">8. Disputes</h2>
                  <p className="text-muted-foreground">
                    If you dispute a charge, please contact us first at{' '}
                    <a href="mailto:contact@aerlion.systems" className="text-primary hover:underline">
                      contact@aerlion.systems
                    </a>
                    . We commit to resolving disputes fairly and promptly before escalation to 
                    payment providers.
                  </p>
                </section>

                <section>
                  <h2 className="font-display text-2xl mb-4">9. Contact</h2>
                  <p className="text-muted-foreground">
                    For questions about this Refund Policy, contact us at{' '}
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

export default Refund;
