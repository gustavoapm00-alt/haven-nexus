import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { 
  Loader2, RefreshCw, Zap, ToggleLeft, ToggleRight, Pencil, 
  Plus, Trash2, ArrowLeft 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

interface Plan {
  id: string;
  category: string;
  name: string;
  price_display: string;
  monthly_run_limit: number;
  is_active: boolean;
  created_at: string;
}

const emptyPlan: Partial<Plan> = {
  category: 'ecom',
  name: '',
  price_display: '',
  monthly_run_limit: 50,
  is_active: true,
};

const StudioPlans = () => {
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  const [plans, setPlans] = useState<Plan[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [editingPlan, setEditingPlan] = useState<Partial<Plan> | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [saving, setSaving] = useState(false);

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
      fetchPlans();
    }
  }, [user, isAdmin]);

  const fetchPlans = async () => {
    setDataLoading(true);
    const { data, error } = await supabase
      .from('plans')
      .select('*')
      .order('category', { ascending: true })
      .order('monthly_run_limit', { ascending: true });

    if (data) setPlans(data);
    setDataLoading(false);
  };

  const toggleActive = async (plan: Plan) => {
    const { error } = await supabase
      .from('plans')
      .update({ is_active: !plan.is_active })
      .eq('id', plan.id);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      fetchPlans();
    }
  };

  const handleSave = async () => {
    if (!editingPlan) return;

    setSaving(true);
    
    if (isCreating) {
      const { error } = await supabase
        .from('plans')
        .insert({
          category: editingPlan.category,
          name: editingPlan.name,
          price_display: editingPlan.price_display,
          monthly_run_limit: editingPlan.monthly_run_limit,
          is_active: editingPlan.is_active ?? true,
        });

      if (error) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Created', description: 'Plan created.' });
        setEditingPlan(null);
        setIsCreating(false);
        fetchPlans();
      }
    } else {
      const { error } = await supabase
        .from('plans')
        .update({
          name: editingPlan.name,
          price_display: editingPlan.price_display,
          monthly_run_limit: editingPlan.monthly_run_limit,
        })
        .eq('id', editingPlan.id);

      if (error) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Updated', description: 'Plan updated.' });
        setEditingPlan(null);
        fetchPlans();
      }
    }
    setSaving(false);
  };

  const handleDelete = async (plan: Plan) => {
    if (!confirm(`Delete "${plan.name}"? This will also delete all entitlements. Cannot be undone.`)) return;

    const { error } = await supabase
      .from('plans')
      .delete()
      .eq('id', plan.id);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Deleted', description: 'Plan deleted.' });
      fetchPlans();
    }
  };

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
            <Link to="/studio/plans" className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-sm font-medium">
              Plans
            </Link>
            <Link to="/studio/entitlements" className="px-3 py-1.5 rounded-lg text-muted-foreground hover:text-foreground text-sm font-medium transition-colors">
              Entitlements
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="font-display text-3xl mb-2">Plans</h1>
          <p className="text-muted-foreground text-sm">
            Manage subscription tiers. Each plan defines pricing and run limits.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4 mb-6">
          <Button onClick={() => { setEditingPlan({ ...emptyPlan }); setIsCreating(true); }}>
            <Plus className="w-4 h-4 mr-2" />
            New Plan
          </Button>
          <Button variant="outline" onClick={fetchPlans} disabled={dataLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${dataLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Plans Table */}
        <div className="card-glass rounded-lg overflow-hidden">
          {dataLoading ? (
            <div className="p-12 text-center">
              <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />
            </div>
          ) : plans.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              No plans found. Create your first one!
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-secondary/50">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Plan</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Category</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Price</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Run Limit</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {plans.map((plan) => (
                  <tr key={plan.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Zap className="w-5 h-5 text-primary" />
                        <span className="font-medium">{plan.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                        {plan.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium">{plan.price_display}</td>
                    <td className="px-6 py-4 text-sm">{plan.monthly_run_limit} / month</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleActive(plan)}
                        className="flex items-center gap-2 text-sm"
                      >
                        {plan.is_active ? (
                          <>
                            <ToggleRight className="w-5 h-5 text-green-500" />
                            <span className="text-green-500">Active</span>
                          </>
                        ) : (
                          <>
                            <ToggleLeft className="w-5 h-5 text-muted-foreground" />
                            <span className="text-muted-foreground">Inactive</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => { setEditingPlan({ ...plan }); setIsCreating(false); }}
                          className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(plan)}
                          className="p-2 text-muted-foreground hover:text-red-500 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>

      {/* Edit/Create Dialog */}
      <Dialog open={!!editingPlan} onOpenChange={() => { setEditingPlan(null); setIsCreating(false); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{isCreating ? 'Create Plan' : 'Edit Plan'}</DialogTitle>
          </DialogHeader>
          {editingPlan && (
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={editingPlan.category || ''}
                  onChange={(e) => setEditingPlan({ ...editingPlan, category: e.target.value })}
                  placeholder="ecom"
                  className="mt-1"
                  disabled={!isCreating}
                />
              </div>
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={editingPlan.name || ''}
                  onChange={(e) => setEditingPlan({ ...editingPlan, name: e.target.value })}
                  placeholder="Tier 1 – Essentials"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="price_display">Price Display</Label>
                <Input
                  id="price_display"
                  value={editingPlan.price_display || ''}
                  onChange={(e) => setEditingPlan({ ...editingPlan, price_display: e.target.value })}
                  placeholder="$49.99/mo"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="monthly_run_limit">Monthly Run Limit</Label>
                <Input
                  id="monthly_run_limit"
                  type="number"
                  value={editingPlan.monthly_run_limit || 50}
                  onChange={(e) => setEditingPlan({ ...editingPlan, monthly_run_limit: parseInt(e.target.value) || 50 })}
                  className="mt-1"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => { setEditingPlan(null); setIsCreating(false); }}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isCreating ? 'Create Plan' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudioPlans;
