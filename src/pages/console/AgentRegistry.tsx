import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Loader2, RefreshCw, Bot, ToggleLeft, ToggleRight, Eye, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import ConsoleLayout from '@/components/console/ConsoleLayout';

interface AgentTemplate {
  id: string;
  category: string;
  agent_key: string;
  name: string;
  description: string;
  system_prompt: string;
  user_prompt_template: string;
  model: string | null;
  is_active: boolean;
  created_at: string;
}

const AgentRegistry = () => {
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  const [agents, setAgents] = useState<AgentTemplate[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [viewingAgent, setViewingAgent] = useState<AgentTemplate | null>(null);
  const [editingAgent, setEditingAgent] = useState<AgentTemplate | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchAgents();
    }
  }, [user]);

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
    if (!isAdmin) {
      toast({ title: 'Permission Denied', description: 'Only admins can modify agents.', variant: 'destructive' });
      return;
    }

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
    if (!editingAgent || !isAdmin) return;

    setSaving(true);
    const { error } = await supabase
      .from('agent_catalog')
      .update({
        name: editingAgent.name,
        description: editingAgent.description,
        system_prompt: editingAgent.system_prompt,
        user_prompt_template: editingAgent.user_prompt_template,
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
    setSaving(false);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <ConsoleLayout>
        <div className="card-glass p-12 text-center">
          <h2 className="font-display text-2xl mb-4">Admin Access Required</h2>
          <p className="text-muted-foreground">Only administrators can manage agent templates.</p>
        </div>
      </ConsoleLayout>
    );
  }

  return (
    <ConsoleLayout>
      <div className="mb-6">
        <h1 className="font-display text-3xl mb-2">Agent Templates</h1>
        <p className="text-muted-foreground text-sm">
          Manage prepackaged AI agent templates. These are the agents available to customers based on their plan.
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4 mb-6">
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
            No agent templates found.
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
                        onClick={() => setEditingAgent({ ...agent })}
                        className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

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
                <pre className="mt-1 p-3 bg-secondary/50 rounded text-sm whitespace-pre-wrap">
                  {viewingAgent.system_prompt}
                </pre>
              </div>
              <div>
                <Label className="text-muted-foreground">User Prompt Template</Label>
                <pre className="mt-1 p-3 bg-secondary/50 rounded text-sm whitespace-pre-wrap">
                  {viewingAgent.user_prompt_template}
                </pre>
              </div>
              <div>
                <Label className="text-muted-foreground">Model</Label>
                <p className="mt-1 font-mono text-sm">{viewingAgent.model || 'Default (gemini-2.5-flash)'}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingAgent} onOpenChange={() => setEditingAgent(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Agent Template</DialogTitle>
          </DialogHeader>
          {editingAgent && (
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={editingAgent.name}
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
                  value={editingAgent.system_prompt}
                  onChange={(e) => setEditingAgent({ ...editingAgent, system_prompt: e.target.value })}
                  className="mt-1 min-h-[150px] font-mono text-sm"
                />
              </div>
              <div>
                <Label htmlFor="user_prompt_template">User Prompt Template</Label>
                <Textarea
                  id="user_prompt_template"
                  value={editingAgent.user_prompt_template}
                  onChange={(e) => setEditingAgent({ ...editingAgent, user_prompt_template: e.target.value })}
                  className="mt-1 min-h-[200px] font-mono text-sm"
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
            <Button variant="outline" onClick={() => setEditingAgent(null)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ConsoleLayout>
  );
};

export default AgentRegistry;
