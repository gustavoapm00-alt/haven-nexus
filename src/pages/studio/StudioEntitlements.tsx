import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Loader2, RefreshCw, ArrowLeft, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Agent {
  agent_key: string;
  name: string;
  category: string;
}

interface Plan {
  id: string;
  name: string;
  category: string;
}

interface Entitlement {
  plan_id: string;
  agent_key: string;
  included: boolean;
}

const StudioEntitlements = () => {
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  const [agents, setAgents] = useState<Agent[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [entitlements, setEntitlements] = useState<Map<string, boolean>>(new Map());
  const [dataLoading, setDataLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('ecom');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      navigate('/dashboard');
    }
  }, [isAdmin, authLoading, navigate]);

  useEffect(() => {
    if (user && isAdmin) {
      fetchData();
    }
  }, [user, isAdmin]);

  const fetchData = async () => {
    setDataLoading(true);
    
    const [agentsRes, plansRes, entitlementsRes] = await Promise.all([
      supabase.from('agent_catalog').select('agent_key, name, category').order('name'),
      supabase.from('plans').select('id, name, category').order('monthly_run_limit'),
      supabase.from('plan_entitlements').select('*'),
    ]);

    if (agentsRes.data) setAgents(agentsRes.data);
    if (plansRes.data) setPlans(plansRes.data);
    
    // Build entitlement map
    const entMap = new Map<string, boolean>();
    (entitlementsRes.data || []).forEach((e: Entitlement) => {
      entMap.set(`${e.plan_id}:${e.agent_key}`, e.included);
    });
    setEntitlements(entMap);
    
    setDataLoading(false);
  };

  const toggleEntitlement = async (planId: string, agentKey: string) => {
    const key = `${planId}:${agentKey}`;
    const currentValue = entitlements.get(key) ?? false;
    const newValue = !currentValue;

    setSaving(key);

    // Upsert the entitlement
    const { error } = await supabase
      .from('plan_entitlements')
      .upsert({
        plan_id: planId,
        agent_key: agentKey,
        included: newValue,
      }, { onConflict: 'plan_id,agent_key' });

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      const newEntitlements = new Map(entitlements);
      newEntitlements.set(key, newValue);
      setEntitlements(newEntitlements);
    }

    setSaving(null);
  };

  const categories = [...new Set([...agents.map(a => a.category), ...plans.map(p => p.category)])];
  const filteredAgents = agents.filter(a => a.category === selectedCategory);
  const filteredPlans = plans.filter(p => p.category === selectedCategory);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/admin" className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <span className="font-display text-xl">
              AERELION <span className="text-primary">STUDIO</span>
            </span>
          </div>
          <nav className="flex items-center gap-2">
            <Link to="/studio/agents" className="px-3 py-1.5 rounded-lg text-muted-foreground hover:text-foreground text-sm font-medium transition-colors">
              Agents
            </Link>
            <Link to="/studio/plans" className="px-3 py-1.5 rounded-lg text-muted-foreground hover:text-foreground text-sm font-medium transition-colors">
              Plans
            </Link>
            <Link to="/studio/entitlements" className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-sm font-medium">
              Entitlements
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="font-display text-3xl mb-2">Plan Entitlements</h1>
          <p className="text-muted-foreground text-sm">
            Configure which agents are included in each plan. Click cells to toggle.
          </p>
        </div>

        {/* Category Filter & Actions */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === cat
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <Button variant="outline" onClick={fetchData} disabled={dataLoading} className="ml-auto">
            <RefreshCw className={`w-4 h-4 mr-2 ${dataLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Entitlements Matrix */}
        <div className="card-glass rounded-lg overflow-hidden">
          {dataLoading ? (
            <div className="p-12 text-center">
              <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />
            </div>
          ) : filteredAgents.length === 0 || filteredPlans.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              No agents or plans found for category "{selectedCategory}".
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-secondary/50">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider sticky left-0 bg-secondary/50 z-10">
                      Agent
                    </th>
                    {filteredPlans.map((plan) => (
                      <th key={plan.id} className="text-center px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider min-w-[120px]">
                        {plan.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredAgents.map((agent) => (
                    <tr key={agent.agent_key} className="hover:bg-secondary/30 transition-colors">
                      <td className="px-6 py-4 sticky left-0 bg-background">
                        <div>
                          <p className="font-medium text-sm">{agent.name}</p>
                          <p className="text-xs text-muted-foreground font-mono">{agent.agent_key}</p>
                        </div>
                      </td>
                      {filteredPlans.map((plan) => {
                        const key = `${plan.id}:${agent.agent_key}`;
                        const isIncluded = entitlements.get(key) ?? false;
                        const isSaving = saving === key;

                        return (
                          <td key={plan.id} className="px-6 py-4 text-center">
                            <button
                              onClick={() => toggleEntitlement(plan.id, agent.agent_key)}
                              disabled={isSaving}
                              className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                                isSaving
                                  ? 'bg-secondary'
                                  : isIncluded
                                  ? 'bg-green-500/20 text-green-500 hover:bg-green-500/30'
                                  : 'bg-secondary/50 text-muted-foreground hover:bg-secondary'
                              }`}
                            >
                              {isSaving ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : isIncluded ? (
                                <Check className="w-5 h-5" />
                              ) : (
                                <X className="w-4 h-4" />
                              )}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <p className="text-xs text-muted-foreground mt-4">
          <Check className="w-4 h-4 inline text-green-500 mr-1" /> = Agent included in plan.
          Click to toggle.
        </p>
      </main>
    </div>
  );
};

export default StudioEntitlements;
