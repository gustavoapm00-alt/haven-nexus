import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Bot, Zap, BarChart3, ArrowRight, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ScrollReveal from '@/components/ScrollReveal';

interface Subscription {
  plan_id: string;
  status: string;
  runs_used_this_period: number;
  period_start: string;
  plan: {
    name: string;
    price_display: string;
    monthly_run_limit: number;
  };
}

interface Agent {
  agent_key: string;
  name: string;
  description: string;
}

const Dashboard = () => {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [orgId, setOrgId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth?redirect=/dashboard');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchSubscriptionAndAgents();
    }
  }, [user]);

  const fetchSubscriptionAndAgents = async () => {
    try {
      // Get user's org
      const { data: orgMembership } = await supabase
        .from('org_members')
        .select('org_id')
        .eq('user_id', user!.id)
        .single();

      if (!orgMembership) {
        setLoading(false);
        return;
      }

      setOrgId(orgMembership.org_id);

      // Get subscription with plan details
      const { data: subData } = await supabase
        .from('org_subscriptions')
        .select('*, plans(*)')
        .eq('org_id', orgMembership.org_id)
        .single();

      if (subData && subData.plans) {
        setSubscription({
          plan_id: subData.plan_id,
          status: subData.status,
          runs_used_this_period: subData.runs_used_this_period,
          period_start: subData.period_start,
          plan: subData.plans as any,
        });

        // Get entitled agents
        const { data: entitlements } = await supabase
          .from('plan_entitlements')
          .select('agent_key')
          .eq('plan_id', subData.plan_id)
          .eq('included', true);

        const agentKeys = (entitlements || []).map((e: any) => e.agent_key);

        if (agentKeys.length > 0) {
          const { data: agentsData } = await supabase
            .from('agent_catalog')
            .select('agent_key, name, description')
            .in('agent_key', agentKeys)
            .eq('is_active', true);

          setAgents(agentsData || []);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-16">
          <div className="container-main text-center">
            <AlertCircle className="w-16 h-16 text-muted-foreground mx-auto mb-6" />
            <h1 className="font-display text-4xl mb-4">No Active Plan</h1>
            <p className="text-muted-foreground mb-8">
              Choose a plan to unlock AI agents and start automating your business.
            </p>
            <Button onClick={() => navigate('/pricing/ecom')} className="btn-primary">
              View E-Commerce Plans
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const usagePercent = (subscription.runs_used_this_period / subscription.plan.monthly_run_limit) * 100;
  const runsRemaining = subscription.plan.monthly_run_limit - subscription.runs_used_this_period;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container-main">
          <ScrollReveal>
            <div className="mb-8">
              <h1 className="font-display text-4xl mb-2">Dashboard</h1>
              <p className="text-muted-foreground">Manage your AI agents and monitor usage.</p>
            </div>
          </ScrollReveal>

          {/* Plan & Usage */}
          <ScrollReveal delay={0.1}>
            <div className="grid md:grid-cols-2 gap-6 mb-12">
              <div className="card-glass p-6 rounded-xl">
                <div className="flex items-center gap-3 mb-4">
                  <Zap className="w-5 h-5 text-primary" />
                  <h2 className="font-display text-xl">Current Plan</h2>
                </div>
                <p className="text-2xl font-bold mb-1">{subscription.plan.name}</p>
                <p className="text-muted-foreground">{subscription.plan.price_display}</p>
                <div className="mt-4 flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    subscription.status === 'active' ? 'bg-green-500/20 text-green-400' :
                    subscription.status === 'trialing' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                  </span>
                </div>
              </div>

              <div className="card-glass p-6 rounded-xl">
                <div className="flex items-center gap-3 mb-4">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  <h2 className="font-display text-xl">Usage This Period</h2>
                </div>
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-3xl font-bold">{subscription.runs_used_this_period}</span>
                  <span className="text-muted-foreground">/ {subscription.plan.monthly_run_limit} runs</span>
                </div>
                <Progress value={usagePercent} className="h-2 mb-2" />
                <p className="text-sm text-muted-foreground">
                  {runsRemaining} runs remaining this month
                </p>
              </div>
            </div>
          </ScrollReveal>

          {/* Agents Grid */}
          <ScrollReveal delay={0.2}>
            <div className="mb-6">
              <h2 className="font-display text-2xl mb-2">Your AI Agents</h2>
              <p className="text-muted-foreground text-sm">Click an agent to run it</p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {agents.map((agent, index) => (
              <ScrollReveal key={agent.agent_key} delay={0.1 * (index + 3)}>
                <Link
                  to={`/agents/${agent.agent_key}`}
                  className="card-glass p-6 rounded-xl block hover:border-primary/50 transition-colors group"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <Bot className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-display text-lg mb-1 group-hover:text-primary transition-colors">
                        {agent.name}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {agent.description}
                      </p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </Link>
              </ScrollReveal>
            ))}
          </div>

          {agents.length === 0 && (
            <div className="card-glass p-12 rounded-xl text-center">
              <Bot className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No agents available for your plan.</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;
