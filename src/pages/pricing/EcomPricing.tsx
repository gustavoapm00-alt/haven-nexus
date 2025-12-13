import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Loader2, Check, Zap, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ScrollReveal from '@/components/ScrollReveal';
import SEO, { schemas } from '@/components/SEO';

interface Plan {
  id: string;
  name: string;
  price_display: string;
  monthly_run_limit: number;
  agents: { agent_key: string; name: string; description: string }[];
}

const EcomPricing = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selecting, setSelecting] = useState<string | null>(null);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    // Fetch plans with their entitlements and agent details
    const { data: plansData, error: plansError } = await supabase
      .from('plans')
      .select('*')
      .eq('category', 'ecom')
      .eq('is_active', true)
      .order('monthly_run_limit', { ascending: true });

    if (plansError) {
      console.error('Error fetching plans:', plansError);
      setLoading(false);
      return;
    }

    // For each plan, get entitlements and agent details
    const plansWithAgents = await Promise.all(
      (plansData || []).map(async (plan) => {
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

        return {
          ...plan,
          agents: agents || [],
        };
      })
    );

    setPlans(plansWithAgents);
    setLoading(false);
  };

  const handleSelectPlan = async (planId: string) => {
    if (!user) {
      navigate(`/auth?redirect=/pricing/ecom&plan=${planId}`);
      return;
    }

    setSelecting(planId);

    try {
      // Get user's org
      const { data: orgMembership, error: orgError } = await supabase
        .from('org_members')
        .select('org_id')
        .eq('user_id', user.id)
        .single();

      if (orgError || !orgMembership) {
        // Create an org for the user
        const { data: newOrg, error: createOrgError } = await supabase
          .from('orgs')
          .insert({ name: `${user.email}'s Organization` })
          .select()
          .single();

        if (createOrgError) throw createOrgError;

        // Create subscription
        const { error: subError } = await supabase
          .from('org_subscriptions')
          .insert({
            org_id: newOrg.id,
            plan_id: planId,
            status: 'active',
          });

        if (subError) throw subError;
      } else {
        // Update or create subscription
        const { error: upsertError } = await supabase
          .from('org_subscriptions')
          .upsert({
            org_id: orgMembership.org_id,
            plan_id: planId,
            status: 'active',
            runs_used_this_period: 0,
            period_start: new Date().toISOString(),
          });

        if (upsertError) throw upsertError;
      }

      toast({ title: 'Success', description: 'Plan activated! Redirecting to dashboard...' });
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Error selecting plan:', error);
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setSelecting(null);
    }
  };

  const getTierColor = (index: number) => {
    switch (index) {
      case 0: return 'border-blue-500/50 bg-blue-500/5';
      case 1: return 'border-purple-500/50 bg-purple-500/5';
      case 2: return 'border-primary/50 bg-primary/5';
      default: return 'border-border';
    }
  };

  const getTierBadge = (index: number) => {
    switch (index) {
      case 0: return null;
      case 1: return <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-500 text-white text-xs px-3 py-1 rounded-full">Popular</span>;
      case 2: return <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs px-3 py-1 rounded-full">Best Value</span>;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="E-Commerce AI Agents Pricing"
        description="Choose the right plan for your e-commerce business. AI-powered agents for Shopify stores, SEO optimization, product pages, and more."
        keywords="ecommerce AI pricing, Shopify AI tools, product page generator, SEO optimizer pricing"
        canonicalUrl="/pricing/ecom"
        structuredData={[
          schemas.breadcrumb([
            { name: 'Home', url: '/' },
            { name: 'Pricing', url: '/pricing' },
            { name: 'E-Commerce', url: '/pricing/ecom' }
          ])
        ]}
      />
      <Navbar />

      <main className="pt-24 pb-16">
        <section className="section-padding">
          <div className="container-main">
            <ScrollReveal>
              <div className="text-center max-w-3xl mx-auto mb-16">
                <span className="tag-chip mb-6">E-Commerce AI Agents</span>
                <h1 className="font-display text-5xl md:text-6xl mb-6">
                  CHOOSE YOUR <span className="text-gradient">TIER</span>
                </h1>
                <p className="text-xl text-muted-foreground">
                  Unlock powerful AI agents that automate your Shopify store operations.
                  Start with essentials or scale to full automation.
                </p>
              </div>
            </ScrollReveal>

            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {plans.map((plan, index) => (
                  <ScrollReveal key={plan.id} delay={index * 0.1}>
                    <div className={`relative card-glass p-8 rounded-2xl h-full flex flex-col border-2 ${getTierColor(index)}`}>
                      {getTierBadge(index)}
                      
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
                              <Check className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                              <div>
                                <p className="font-medium text-sm">{agent.name}</p>
                                <p className="text-xs text-muted-foreground">{agent.description}</p>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <Button
                        onClick={() => handleSelectPlan(plan.id)}
                        disabled={selecting === plan.id}
                        className={`w-full mt-8 ${index === 2 ? 'btn-primary' : ''}`}
                        variant={index === 2 ? 'default' : 'outline'}
                      >
                        {selecting === plan.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            Get Started
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </>
                        )}
                      </Button>
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
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default EcomPricing;
