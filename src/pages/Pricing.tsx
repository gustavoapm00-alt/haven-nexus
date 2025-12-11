import { Link } from 'react-router-dom';
import { Check, ArrowRight, Zap, Crown, Building } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ScrollReveal from '@/components/ScrollReveal';

const tiers = [
  {
    name: 'Starter',
    icon: Zap,
    description: 'Essential automation tools for small businesses getting started.',
    highlight: false,
    features: [
      'Basic AI chatbot',
      '3 automated workflows',
      'Email support',
      'Standard integrations',
      'Basic analytics dashboard',
      '1,000 AI interactions/month'
    ],
    cta: 'Start Free Trial'
  },
  {
    name: 'Professional',
    icon: Crown,
    description: 'Complete automation suite with advanced AI capabilities.',
    highlight: true,
    badge: 'Most Popular',
    features: [
      'Advanced AI agents',
      'Unlimited workflows',
      'Priority support',
      'Custom integrations',
      'Advanced analytics & reporting',
      '25,000 AI interactions/month',
      'E-commerce automation',
      'Team collaboration tools',
      'API access'
    ],
    cta: 'Start Free Trial'
  },
  {
    name: 'Enterprise',
    icon: Building,
    description: 'Custom solutions for organizations with complex needs.',
    highlight: false,
    features: [
      'Everything in Professional',
      'Unlimited AI interactions',
      'Dedicated account manager',
      'Custom AI model training',
      'SLA guarantees',
      'On-premise deployment option',
      'Advanced security features',
      'White-label solutions',
      'Custom development'
    ],
    cta: 'Contact Sales'
  }
];

const faqs = [
  {
    q: 'How does the free trial work?',
    a: 'Start with a 14-day free trial of our Professional tier. No credit card required. You\'ll have full access to all features during the trial period.'
  },
  {
    q: 'Can I change plans later?',
    a: 'Absolutely. You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we\'ll prorate any billing adjustments.'
  },
  {
    q: 'What happens if I exceed my AI interaction limit?',
    a: 'We\'ll notify you when you\'re approaching your limit. You can upgrade your plan or purchase additional interactions as needed.'
  },
  {
    q: 'Do you offer custom pricing for large teams?',
    a: 'Yes. Contact our sales team for custom pricing on Enterprise plans tailored to your organization\'s specific needs.'
  }
];

const Pricing = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24">
        {/* Hero */}
        <section className="section-padding">
          <div className="container-main">
            <ScrollReveal>
              <div className="text-center max-w-3xl mx-auto">
                <span className="tag-chip mb-6">Pricing</span>
                <h1 className="font-display text-5xl md:text-6xl mb-6">
                  SIMPLE, <span className="text-gradient">TRANSPARENT</span> PRICING
                </h1>
                <p className="text-xl text-muted-foreground">
                  Start free. Scale as you grow. Contact us for custom enterprise solutions.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Pricing Tiers */}
        <section className="section-padding pt-0">
          <div className="container-main">
            <div className="grid md:grid-cols-3 gap-8 items-stretch">
              {tiers.map((tier, index) => (
                <ScrollReveal key={index} delay={index * 0.1}>
                  <div className={`card-glass p-8 rounded-lg h-full flex flex-col relative ${
                    tier.highlight ? 'border-primary/50' : ''
                  }`}>
                    {tier.badge && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="bg-primary text-primary-foreground text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider">
                          {tier.badge}
                        </span>
                      </div>
                    )}
                    
                    <tier.icon className={`h-10 w-10 mb-4 ${tier.highlight ? 'text-primary' : 'text-muted-foreground'}`} />
                    <h3 className="font-display text-3xl mb-2">{tier.name}</h3>
                    <p className="text-muted-foreground mb-6">{tier.description}</p>
                    
                    <div className="mb-6">
                      <span className="font-display text-4xl">Contact for Pricing</span>
                    </div>

                    <ul className="space-y-3 mb-8 flex-grow">
                      {tier.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    <Link 
                      to={tier.name === 'Enterprise' ? '/contact' : '/contact'} 
                      className={tier.highlight ? 'btn-primary w-full justify-center' : 'btn-secondary w-full justify-center'}
                    >
                      {tier.cta}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="section-padding bg-card/30">
          <div className="container-main max-w-3xl">
            <ScrollReveal>
              <h2 className="font-display text-4xl text-center mb-12">
                FREQUENTLY ASKED <span className="text-gradient">QUESTIONS</span>
              </h2>
            </ScrollReveal>

            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <ScrollReveal key={index} delay={index * 0.1}>
                  <div className="card-glass p-6 rounded-lg">
                    <h3 className="font-semibold text-lg mb-2">{faq.q}</h3>
                    <p className="text-muted-foreground">{faq.a}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="section-padding">
          <div className="container-main">
            <ScrollReveal>
              <div className="text-center">
                <h2 className="font-display text-4xl md:text-5xl mb-6">
                  STILL HAVE <span className="text-gradient">QUESTIONS</span>?
                </h2>
                <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
                  Our team is ready to help you find the perfect automation solution for your business.
                </p>
                <Link to="/contact" className="btn-primary">
                  Talk to Sales
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Pricing;
