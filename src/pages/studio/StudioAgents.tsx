import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { 
  Loader2, RefreshCw, Bot, ToggleLeft, ToggleRight, Eye, Pencil, 
  Plus, Trash2, ArrowLeft 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Link } from 'react-router-dom';

interface AgentTemplate {
  id: string;
  category: string;
  agent_key: string;
  name: string;
  description: string | null;
  system_prompt: string;
  user_prompt_template: string;
  output_schema: any;
  model: string | null;
  is_active: boolean;
  created_at: string;
}

const emptyAgent: Partial<AgentTemplate> = {
  category: 'ecom',
  agent_key: '',
  name: '',
  description: '',
  system_prompt: '',
  user_prompt_template: '',
  output_schema: null,
  model: null,
  is_active: true,
};

const StudioAgents = () => {
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  const [agents, setAgents] = useState<AgentTemplate[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [viewingAgent, setViewingAgent] = useState<AgentTemplate | null>(null);
  const [editingAgent, setEditingAgent] = useState<Partial<AgentTemplate> | null>(null);
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
      fetchAgents();
    }
  }, [user, isAdmin]);

  const fetchAgents = async () => {
    setDataLoading(true);
    const { data, error } = await supabase
      .from('agent_catalog')
      .select('*')
      .order('category', { ascending: true })
      .order('name', { ascending: true });

    if (data) setAgents(data);
    setDataLoading(false);
  };

  const toggleActive = async (agent: AgentTemplate) => {
    const { error } = await supabase
      .from('agent_catalog')
      .update({ is_active: !agent.is_active })
      .eq('id', agent.id);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      fetchAgents();
    }
  };

  const handleSave = async () => {
    if (!editingAgent) return;

    setSaving(true);
    
    if (isCreating) {
      const { error } = await supabase
        .from('agent_catalog')
        .insert({
          category: editingAgent.category,
          agent_key: editingAgent.agent_key,
          name: editingAgent.name,
          description: editingAgent.description,
          system_prompt: editingAgent.system_prompt,
          user_prompt_template: editingAgent.user_prompt_template,
          output_schema: editingAgent.output_schema,
          model: editingAgent.model,
          is_active: editingAgent.is_active ?? true,
        });

      if (error) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Created', description: 'Agent template created.' });
        setEditingAgent(null);
        setIsCreating(false);
        fetchAgents();
      }
    } else {
      const { error } = await supabase
        .from('agent_catalog')
        .update({
          name: editingAgent.name,
          description: editingAgent.description,
          system_prompt: editingAgent.system_prompt,
          user_prompt_template: editingAgent.user_prompt_template,
          output_schema: editingAgent.output_schema,
          model: editingAgent.model,
        })
        .eq('id', editingAgent.id);

      if (error) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Updated', description: 'Agent template updated.' });
        setEditingAgent(null);
        fetchAgents();
      }
    }
    setSaving(false);
  };

  const handleDelete = async (agent: AgentTemplate) => {
    if (!confirm(`Delete "${agent.name}"? This cannot be undone.`)) return;

    const { error } = await supabase
      .from('agent_catalog')
      .delete()
      .eq('id', agent.id);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Deleted', description: 'Agent template deleted.' });
      fetchAgents();
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
            <Link to="/studio/agents" className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-sm font-medium">
              Agents
            </Link>
            <Link to="/studio/plans" className="px-3 py-1.5 rounded-lg text-muted-foreground hover:text-foreground text-sm font-medium transition-colors">
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
          <h1 className="font-display text-3xl mb-2">Agent Templates</h1>
          <p className="text-muted-foreground text-sm">
            Create and manage prepackaged AI agent templates. These are available to customers based on their plan.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4 mb-6">
          <Button onClick={() => { setEditingAgent({ ...emptyAgent }); setIsCreating(true); }}>
            <Plus className="w-4 h-4 mr-2" />
            New Agent
          </Button>
          <Button variant="outline" onClick={fetchAgents} disabled={dataLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${dataLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Agents Table */}
        <div className="card-glass rounded-lg overflow-hidden">
          {dataLoading ? (
            <div className="p-12 text-center">
              <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />
            </div>
          ) : agents.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              No agent templates found. Create your first one!
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-secondary/50">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Agent</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Category</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Key</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {agents.map((agent) => (
                  <tr key={agent.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Bot className="w-5 h-5 text-primary" />
                        <div>
                          <p className="font-medium">{agent.name}</p>
                          <p className="text-xs text-muted-foreground line-clamp-1">{agent.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                        {agent.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-mono">{agent.agent_key}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleActive(agent)}
                        className="flex items-center gap-2 text-sm"
                      >
                        {agent.is_active ? (
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
                          onClick={() => setViewingAgent(agent)}
                          className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                          title="View prompts"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => { setEditingAgent({ ...agent }); setIsCreating(false); }}
                          className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(agent)}
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

      {/* View Dialog */}
      <Dialog open={!!viewingAgent} onOpenChange={() => setViewingAgent(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{viewingAgent?.name}</DialogTitle>
          </DialogHeader>
          {viewingAgent && (
            <div className="space-y-4 py-4">
              <div>
                <Label className="text-muted-foreground">System Prompt</Label>
                <pre className="mt-1 p-3 bg-secondary/50 rounded text-sm whitespace-pre-wrap max-h-48 overflow-y-auto">
                  {viewingAgent.system_prompt}
                </pre>
              </div>
              <div>
                <Label className="text-muted-foreground">User Prompt Template</Label>
                <pre className="mt-1 p-3 bg-secondary/50 rounded text-sm whitespace-pre-wrap max-h-48 overflow-y-auto">
                  {viewingAgent.user_prompt_template}
                </pre>
              </div>
              {viewingAgent.output_schema && (
                <div>
                  <Label className="text-muted-foreground">Output Schema</Label>
                  <pre className="mt-1 p-3 bg-secondary/50 rounded text-sm whitespace-pre-wrap">
                    {JSON.stringify(viewingAgent.output_schema, null, 2)}
                  </pre>
                </div>
              )}
              <div>
                <Label className="text-muted-foreground">Model</Label>
                <p className="mt-1 font-mono text-sm">{viewingAgent.model || 'Default (gemini-2.5-flash)'}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit/Create Dialog */}
      <Dialog open={!!editingAgent} onOpenChange={() => { setEditingAgent(null); setIsCreating(false); }}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isCreating ? 'Create Agent Template' : 'Edit Agent Template'}</DialogTitle>
          </DialogHeader>
          {editingAgent && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={editingAgent.category || ''}
                    onChange={(e) => setEditingAgent({ ...editingAgent, category: e.target.value })}
                    placeholder="ecom"
                    className="mt-1"
                    disabled={!isCreating}
                  />
                </div>
                <div>
                  <Label htmlFor="agent_key">Agent Key</Label>
                  <Input
                    id="agent_key"
                    value={editingAgent.agent_key || ''}
                    onChange={(e) => setEditingAgent({ ...editingAgent, agent_key: e.target.value })}
                    placeholder="ecom_my_agent"
                    className="mt-1 font-mono"
                    disabled={!isCreating}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={editingAgent.name || ''}
                  onChange={(e) => setEditingAgent({ ...editingAgent, name: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={editingAgent.description || ''}
                  onChange={(e) => setEditingAgent({ ...editingAgent, description: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="system_prompt">System Prompt</Label>
                <Textarea
                  id="system_prompt"
                  value={editingAgent.system_prompt || ''}
                  onChange={(e) => setEditingAgent({ ...editingAgent, system_prompt: e.target.value })}
                  className="mt-1 min-h-[120px] font-mono text-sm"
                />
              </div>
              <div>
                <Label htmlFor="user_prompt_template">User Prompt Template</Label>
                <Textarea
                  id="user_prompt_template"
                  value={editingAgent.user_prompt_template || ''}
                  onChange={(e) => setEditingAgent({ ...editingAgent, user_prompt_template: e.target.value })}
                  className="mt-1 min-h-[150px] font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground mt-1">Use {'{{placeholder}}'} syntax for input variables.</p>
              </div>
              <div>
                <Label htmlFor="model">Model (optional)</Label>
                <Input
                  id="model"
                  value={editingAgent.model || ''}
                  onChange={(e) => setEditingAgent({ ...editingAgent, model: e.target.value || null })}
                  placeholder="google/gemini-2.5-flash"
                  className="mt-1"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => { setEditingAgent(null); setIsCreating(false); }}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isCreating ? 'Create Agent' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudioAgents;
