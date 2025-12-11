import { Link } from 'react-router-dom';
import { Check, ArrowRight, Zap, Crown, Rocket, Building } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ScrollReveal from '@/components/ScrollReveal';

const tiers = [
  {
    name: 'Starter',
    icon: Zap,
    price: '$19',
    period: '/mo',
    description: 'Perfect for entrepreneurs getting started with AI automation.',
    highlight: false,
    features: [
      '1 project',
      'Basic AI Agent Tools',
      'Email support',
      '1,000 AI interactions/month',
      'Standard integrations',
      'Basic analytics dashboard'
    ],
    cta: 'Start Free Trial',
    ctaLink: '/auth?plan=starter'
  },
  {
    name: 'Pro',
    icon: Crown,
    price: '$49',
    period: '/mo',
    description: 'Advanced tools for growing businesses ready to scale.',
    highlight: true,
    badge: 'Most Popular',
    features: [
      '5 projects',
      'Advanced AI Agent Tools',
      'Priority support',
      '10,000 AI interactions/month',
      'Custom integrations',
      'Advanced analytics & reporting',
      'Workflow automation',
      'Team collaboration (3 seats)'
    ],
    cta: 'Start Free Trial',
    ctaLink: '/auth?plan=pro'
  },
  {
    name: 'AERELION Elite',
    icon: Rocket,
    price: '$99',
    period: '/mo',
    description: 'Full power for teams demanding unlimited capabilities.',
    highlight: false,
    features: [
      'Unlimited projects',
      'Full AI Agent Suite',
      'API Access',
      'Unlimited AI interactions',
      'Team Collaboration Tools',
      'White-label options',
      'Advanced security features',
      'Dedicated Slack channel'
    ],
    cta: 'Start Free Trial',
    ctaLink: '/auth?plan=elite'
  }
];

const enterpriseTier = {
  name: 'Enterprise',
  icon: Building,
  description: 'Custom solutions for organizations with complex requirements and dedicated support needs.',
  features: [
    'Unlimited seats',
    'Custom onboarding & integrations',
    'Dedicated engineer',
    'SLA guarantees',
    'On-premise deployment option',
    'Custom AI model training',
    'Priority 24/7 support',
    'Custom contract terms'
  ]
};

const faqs = [
  {
    q: 'How does the free trial work?',
    a: 'Start with a 14-day free trial on any plan. No credit card required. You\'ll have full access to all features during the trial period.'
  },
  {
    q: 'Can I change plans later?',
    a: 'Absolutely. You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we\'ll prorate any billing adjustments.'
  },
  {
    q: 'What happens after the free trial?',
    a: 'After your trial ends, you can continue with a paid subscription or downgrade. Your data and configurations will be preserved.'
  },
  {
    q: 'Do you offer refunds?',
    a: 'Yes, we offer a 30-day money-back guarantee on all plans. If you\'re not satisfied, contact us for a full refund.'
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
                  Start free. Scale as you grow. No hidden fees.
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
                    tier.highlight ? 'border-primary/50 ring-2 ring-primary/20' : ''
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
                      <span className="font-display text-5xl">{tier.price}</span>
                      <span className="text-muted-foreground">{tier.period}</span>
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
                      to={tier.ctaLink}
                      className={tier.highlight ? 'btn-primary w-full justify-center' : 'btn-secondary w-full justify-center'}
                    >
                      {tier.cta}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </div>
                </ScrollReveal>
              ))}
            </div>

            {/* Enterprise Tier */}
            <ScrollReveal delay={0.3}>
              <div className="mt-12 card-glass p-8 md:p-12 rounded-lg">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div>
                    <div className="flex items-center gap-4 mb-4">
                      <enterpriseTier.icon className="h-10 w-10 text-primary" />
                      <h3 className="font-display text-3xl">{enterpriseTier.name}</h3>
                    </div>
                    <p className="text-muted-foreground mb-6">{enterpriseTier.description}</p>
                    <div className="mb-6">
                      <span className="font-display text-4xl">Custom Pricing</span>
                    </div>
                    <Link to="/contact" className="btn-primary">
                      Contact Sales
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </div>
                  <div>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {enterpriseTier.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </ScrollReveal>
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
                  READY TO <span className="text-gradient">GET STARTED</span>?
                </h2>
                <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
                  Start your 14-day free trial today. No credit card required.
                </p>
                <Link to="/auth?plan=free-trial" className="btn-primary">
                  Start Free Trial
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
