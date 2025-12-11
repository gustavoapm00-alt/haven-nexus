import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Check, ArrowRight, Zap, Crown, Rocket, Building, Loader2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ScrollReveal from '@/components/ScrollReveal';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { STRIPE_TIERS, TierKey } from '@/lib/stripe-config';
import { toast } from 'sonner';

const tiers = [
  {
    key: 'starter' as TierKey,
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
  },
  {
    key: 'pro' as TierKey,
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
  },
  {
    key: 'elite' as TierKey,
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
  const { user } = useAuth();
  const { subscribed, tier: currentTier, createCheckout, openCustomerPortal } = useSubscription();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loadingTier, setLoadingTier] = useState<string | null>(null);

  // Show toast if checkout was cancelled
  if (searchParams.get('checkout') === 'cancelled') {
    toast.info('Checkout cancelled');
    navigate('/pricing', { replace: true });
  }

  const handleSubscribe = async (tierKey: TierKey) => {
    if (!user) {
      navigate(`/auth?plan=${tierKey}`);
      return;
    }

    setLoadingTier(tierKey);
    const priceId = STRIPE_TIERS[tierKey].priceId;
    const url = await createCheckout(priceId);
    
    if (url) {
      window.location.href = url;
    } else {
      toast.error('Failed to create checkout session');
    }
    setLoadingTier(null);
  };

  const getButtonText = (tierKey: TierKey) => {
    if (subscribed && currentTier === tierKey) {
      return 'Current Plan';
    }
    if (subscribed) {
      return 'Switch Plan';
    }
    return 'Start Free Trial';
  };

  const isCurrentPlan = (tierKey: TierKey) => subscribed && currentTier === tierKey;

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
                  } ${isCurrentPlan(tier.key) ? 'ring-2 ring-green-500/50 border-green-500/50' : ''}`}>
                    {tier.badge && !isCurrentPlan(tier.key) && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="bg-primary text-primary-foreground text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider">
                          {tier.badge}
                        </span>
                      </div>
                    )}
                    {isCurrentPlan(tier.key) && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="bg-green-500 text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider">
                          Your Plan
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

                    <button
                      onClick={() => isCurrentPlan(tier.key) ? openCustomerPortal() : handleSubscribe(tier.key)}
                      disabled={loadingTier === tier.key}
                      className={`${tier.highlight ? 'btn-primary' : 'btn-secondary'} w-full justify-center ${
                        isCurrentPlan(tier.key) ? 'bg-green-500/20 border-green-500/50 hover:bg-green-500/30' : ''
                      }`}
                    >
                      {loadingTier === tier.key ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          {getButtonText(tier.key)}
                          {!isCurrentPlan(tier.key) && <ArrowRight className="ml-2 h-4 w-4" />}
                        </>
                      )}
                    </button>
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

        {/* Manage Subscription */}
        {subscribed && (
          <section className="section-padding pt-0">
            <div className="container-main">
              <ScrollReveal>
                <div className="card-glass p-8 rounded-lg text-center">
                  <h3 className="font-display text-2xl mb-4">Manage Your Subscription</h3>
                  <p className="text-muted-foreground mb-6">
                    Update payment method, change plan, or cancel your subscription.
                  </p>
                  <button onClick={openCustomerPortal} className="btn-secondary">
                    Open Billing Portal
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </button>
                </div>
              </ScrollReveal>
            </div>
          </section>
        )}

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
                <button 
                  onClick={() => user ? handleSubscribe('pro') : navigate('/auth?plan=pro')}
                  className="btn-primary"
                >
                  Start Free Trial
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

export default Pricing;
