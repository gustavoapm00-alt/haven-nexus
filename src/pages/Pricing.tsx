import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Check, ArrowRight, Zap, Crown, Rocket, Building, Loader2, Bot } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ScrollReveal from '@/components/ScrollReveal';
import SEO, { schemas } from '@/components/SEO';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { STRIPE_TIERS, TierKey } from '@/lib/stripe-config';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';

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
  },
  {
    q: 'What\'s the difference between Platform and AI Agent plans?',
    a: 'Platform plans give you access to our automation tools and infrastructure. AI Agent Bundles are add-ons that give you access to prebuilt AI agents for specific use cases like e-commerce.'
  }
];

interface AgentPlan {
  id: string;
  name: string;
  price_display: string;
  monthly_run_limit: number;
  agents: { agent_key: string; name: string; description: string }[];
}

const Pricing = () => {
  const { user } = useAuth();
  const { subscribed, tier: currentTier, createCheckout, openCustomerPortal } = useSubscription();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loadingTier, setLoadingTier] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('platform');
  
  // AI Agent plans state
  const [agentPlans, setAgentPlans] = useState<AgentPlan[]>([]);
  const [loadingAgentPlans, setLoadingAgentPlans] = useState(true);
  const [selectingPlan, setSelectingPlan] = useState<string | null>(null);

  // Show toast if checkout was cancelled
  useEffect(() => {
    if (searchParams.get('checkout') === 'cancelled') {
      toast.info('Checkout cancelled');
      navigate('/pricing', { replace: true });
    }
    if (searchParams.get('tab') === 'agents') {
      setActiveTab('agents');
    }
  }, [searchParams, navigate]);

  // Fetch AI agent plans
  useEffect(() => {
    const fetchAgentPlans = async () => {
      const { data: plansData } = await supabase
        .from('plans')
        .select('*')
        .eq('category', 'ecom')
        .eq('is_active', true)
        .order('monthly_run_limit', { ascending: true });

      if (!plansData) {
        setLoadingAgentPlans(false);
        return;
      }

      const plansWithAgents = await Promise.all(
        plansData.map(async (plan) => {
          const { data: entitlements } = await supabase
            .from('plan_entitlements')
            .select('agent_key')
            .eq('plan_id', plan.id)
            .eq('included', true);

          const agentKeys = (entitlements || []).map((e: any) => e.agent_key);
          
          const { data: agents } = await supabase
            .from('agent_catalog')
            .select('agent_key, name, description')
            .in('agent_key', agentKeys.length > 0 ? agentKeys : ['_none_']);

          return { ...plan, agents: agents || [] };
        })
      );

      setAgentPlans(plansWithAgents);
      setLoadingAgentPlans(false);
    };

    fetchAgentPlans();
  }, []);

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

  const handleSelectAgentPlan = async (planId: string) => {
    if (!user) {
      navigate(`/auth?redirect=/pricing?tab=agents&plan=${planId}`);
      return;
    }

    setSelectingPlan(planId);

    try {
      const { data: orgMembership } = await supabase
        .from('org_members')
        .select('org_id')
        .eq('user_id', user.id)
        .single();

      if (!orgMembership) {
        const { data: newOrg, error: createOrgError } = await supabase
          .from('orgs')
          .insert({ name: `${user.email}'s Organization` })
          .select()
          .single();

        if (createOrgError) throw createOrgError;

        await supabase
          .from('org_subscriptions')
          .insert({ org_id: newOrg.id, plan_id: planId, status: 'active' });
      } else {
        await supabase
          .from('org_subscriptions')
          .upsert({
            org_id: orgMembership.org_id,
            plan_id: planId,
            status: 'active',
            runs_used_this_period: 0,
            period_start: new Date().toISOString(),
          });
      }

      toast.success('Plan activated! Redirecting to dashboard...');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Failed to activate plan');
    } finally {
      setSelectingPlan(null);
    }
  };

  const getButtonText = (tierKey: TierKey) => {
    if (subscribed && currentTier === tierKey) return 'Current Plan';
    if (subscribed) return 'Switch Plan';
    return 'Start Free Trial';
  };

  const isCurrentPlan = (tierKey: TierKey) => subscribed && currentTier === tierKey;

  const faqSchema = schemas.faqPage(faqs.map(f => ({ question: f.q, answer: f.a })));

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Pricing"
        description="Simple, transparent pricing for AI automation. Platform plans from $19/mo. AI Agent bundles starting at $49.99/mo. No hidden fees."
        keywords="AI automation pricing, business automation cost, AI agent subscription, workflow automation plans"
        canonicalUrl="/pricing"
        structuredData={[
          schemas.breadcrumb([{ name: 'Home', url: '/' }, { name: 'Pricing', url: '/pricing' }]),
          faqSchema,
          schemas.product('Starter Plan', 'Basic AI agent tools for entrepreneurs', '19'),
          schemas.product('Pro Plan', 'Advanced AI tools for growing businesses', '49'),
          schemas.product('Elite Plan', 'Full AI suite with unlimited capabilities', '99')
        ]}
      />
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

        {/* Tabs for Plan Types */}
        <section className="section-padding pt-0">
          <div className="container-main">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-12">
                <TabsTrigger value="platform" className="text-sm">Platform Plans</TabsTrigger>
                <TabsTrigger value="agents" className="text-sm">AI Agent Bundles</TabsTrigger>
              </TabsList>

              {/* Platform Plans Tab */}
              <TabsContent value="platform">
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
              </TabsContent>

              {/* AI Agent Bundles Tab */}
              <TabsContent value="agents">
                <ScrollReveal>
                  <div className="text-center mb-12">
                    <h2 className="font-display text-3xl mb-4">E-Commerce AI Agents</h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                      Prebuilt AI agents that automate your Shopify store operations. 
                      Choose a tier based on how many agents you need.
                    </p>
                  </div>
                </ScrollReveal>

                {loadingAgentPlans ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : agentPlans.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    No AI agent bundles available yet. Check back soon!
                  </div>
                ) : (
                  <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {agentPlans.map((plan, index) => (
                      <ScrollReveal key={plan.id} delay={index * 0.1}>
                        <div className={`relative card-glass p-8 rounded-2xl h-full flex flex-col border-2 ${
                          index === 2 ? 'border-primary/50 ring-1 ring-primary/20' : 'border-border'
                        }`}>
                          {index === 1 && (
                            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-500 text-white text-xs px-3 py-1 rounded-full">
                              Popular
                            </span>
                          )}
                          {index === 2 && (
                            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs px-3 py-1 rounded-full">
                              Best Value
                            </span>
                          )}
                          
                          <div className="mb-6">
                            <h3 className="font-display text-2xl mb-2">{plan.name}</h3>
                            <div className="flex items-baseline gap-1">
                              <span className="text-4xl font-bold text-gradient">{plan.price_display.split('/')[0]}</span>
                              <span className="text-muted-foreground">/mo</span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-2">
                              {plan.monthly_run_limit} AI runs per month
                            </p>
                          </div>

                          <div className="flex-1">
                            <p className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wider">
                              Included Agents
                            </p>
                            <ul className="space-y-3">
                              {plan.agents.map((agent) => (
                                <li key={agent.agent_key} className="flex items-start gap-3">
                                  <Bot className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                                  <div>
                                    <p className="font-medium text-sm">{agent.name}</p>
                                    <p className="text-xs text-muted-foreground line-clamp-2">{agent.description}</p>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <button
                            onClick={() => handleSelectAgentPlan(plan.id)}
                            disabled={selectingPlan === plan.id}
                            className={`w-full mt-8 ${index === 2 ? 'btn-primary' : 'btn-secondary'} justify-center`}
                          >
                            {selectingPlan === plan.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                Get Started
                                <ArrowRight className="w-4 h-4 ml-2" />
                              </>
                            )}
                          </button>
                        </div>
                      </ScrollReveal>
                    ))}
                  </div>
                )}

                <ScrollReveal delay={0.4}>
                  <div className="text-center mt-12 text-muted-foreground">
                    <p className="flex items-center justify-center gap-2">
                      <Zap className="w-4 h-4 text-primary" />
                      All plans include a 7-day free trial. No credit card required.
                    </p>
                  </div>
                </ScrollReveal>
              </TabsContent>
            </Tabs>
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
