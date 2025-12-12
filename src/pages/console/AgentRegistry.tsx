import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Loader2, LogOut, Plus, Pencil, Trash2, RefreshCw, AlertTriangle, Bot, ToggleLeft, ToggleRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import ConsoleLayout from '@/components/console/ConsoleLayout';
import SecretsWarningBanner from '@/components/console/SecretsWarningBanner';

interface Agent {
  id: string;
  agent_key: string;
  name: string;
  trigger_url: string;
  is_enabled: boolean;
  outbound_secret: string | null;
  org_id: string;
  created_at: string;
  updated_at: string;
}

interface AgentFormData {
  agent_key: string;
  name: string;
  trigger_url: string;
  is_enabled: boolean;
  outbound_secret: string;
}

const emptyForm: AgentFormData = {
  agent_key: '',
  name: '',
  trigger_url: '',
  is_enabled: true,
  outbound_secret: '',
};

const AgentRegistry = () => {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  const [agents, setAgents] = useState<Agent[]>([]);
  const [orgs, setOrgs] = useState<{ id: string; name: string }[]>([]);
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [formData, setFormData] = useState<AgentFormData>(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchOrgs();
    }
  }, [user]);

  useEffect(() => {
    if (selectedOrgId) {
      fetchAgents();
    }
  }, [selectedOrgId]);

  const fetchOrgs = async () => {
    const { data, error } = await supabase
      .from('org_members')
      .select('org_id, orgs(id, name)')
      .eq('user_id', user!.id);

    if (data && data.length > 0) {
      const orgList = data.map((om: any) => ({
        id: om.orgs.id,
        name: om.orgs.name,
      }));
      setOrgs(orgList);
      setSelectedOrgId(orgList[0].id);
    } else {
      setOrgs([]);
      setDataLoading(false);
    }
  };

  const fetchAgents = async () => {
    setDataLoading(true);
    const { data, error } = await supabase
      .from('relevance_agents')
      .select('*')
      .eq('org_id', selectedOrgId)
      .order('created_at', { ascending: false });

    if (data) setAgents(data);
    setDataLoading(false);
  };

  const openCreateDialog = () => {
    setEditingAgent(null);
    setFormData(emptyForm);
    setDialogOpen(true);
  };

  const openEditDialog = (agent: Agent) => {
    setEditingAgent(agent);
    setFormData({
      agent_key: agent.agent_key,
      name: agent.name,
      trigger_url: agent.trigger_url,
      is_enabled: agent.is_enabled,
      outbound_secret: agent.outbound_secret || '',
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!selectedOrgId) return;

    if (!formData.agent_key.trim() || !formData.name.trim() || !formData.trigger_url.trim()) {
      toast({ title: 'Validation Error', description: 'Agent key, name, and trigger URL are required.', variant: 'destructive' });
      return;
    }

    setSaving(true);

    const payload = {
      agent_key: formData.agent_key.trim(),
      name: formData.name.trim(),
      trigger_url: formData.trigger_url.trim(),
      is_enabled: formData.is_enabled,
      outbound_secret: formData.outbound_secret.trim() || null,
      org_id: selectedOrgId,
    };

    if (editingAgent) {
      const { error } = await supabase
        .from('relevance_agents')
        .update(payload)
        .eq('id', editingAgent.id);

      if (error) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Updated', description: 'Agent updated successfully.' });
        setDialogOpen(false);
        fetchAgents();
      }
    } else {
      const { error } = await supabase
        .from('relevance_agents')
        .insert([payload]);

      if (error) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Created', description: 'Agent registered successfully.' });
        setDialogOpen(false);
        fetchAgents();
      }
    }

    setSaving(false);
  };

  const handleDelete = async (agent: Agent) => {
    if (!confirm(`Delete agent "${agent.name}"?`)) return;

    const { error } = await supabase
      .from('relevance_agents')
      .delete()
      .eq('id', agent.id);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Deleted', description: 'Agent removed.' });
      fetchAgents();
    }
  };

  const toggleEnabled = async (agent: Agent) => {
    const { error } = await supabase
      .from('relevance_agents')
      .update({ is_enabled: !agent.is_enabled })
      .eq('id', agent.id);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
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

  return (
    <ConsoleLayout>
      <SecretsWarningBanner />
      
      <div className="mb-6">
        <h1 className="font-display text-3xl mb-2">Agent Registry</h1>
        <p className="text-muted-foreground text-sm">
          Register and manage your Relevance AI agents. Each agent needs a webhook trigger URL from Relevance.
        </p>
      </div>

      {/* Security Note */}
      <div className="bg-secondary/50 border border-border rounded-lg p-4 mb-6 text-sm text-muted-foreground">
        <AlertTriangle className="w-4 h-4 inline mr-2 text-yellow-500" />
        <strong>Note:</strong> Relevance AI does not generate webhook secrets automatically. Security is handled by shared-secret headers configured in Relevance and stored in Lovable secrets. Ensure <code className="bg-background px-1 rounded">RELEVANCE_DEFAULT_OUTBOUND_SECRET</code> and <code className="bg-background px-1 rounded">RELEVANCE_CALLBACK_SECRET</code> are configured for production security.
      </div>

      {/* Org Selector */}
      {orgs.length > 1 && (
        <div className="mb-6">
          <Label>Organization</Label>
          <select
            value={selectedOrgId || ''}
            onChange={(e) => setSelectedOrgId(e.target.value)}
            className="mt-1 block w-full max-w-xs rounded-md border border-border bg-background px-3 py-2 text-sm"
          >
            {orgs.map((org) => (
              <option key={org.id} value={org.id}>{org.name}</option>
            ))}
          </select>
        </div>
      )}

      {orgs.length === 0 && !dataLoading && (
        <div className="card-glass p-8 text-center text-muted-foreground">
          You are not a member of any organization. Create one to register agents.
        </div>
      )}

      {orgs.length > 0 && (
        <>
          {/* Actions */}
          <div className="flex items-center gap-4 mb-6">
            <Button onClick={openCreateDialog}>
              <Plus className="w-4 h-4 mr-2" />
              Add Agent
            </Button>
            <Button variant="outline" onClick={fetchAgents} disabled={dataLoading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${dataLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {/* Agents List */}
          <div className="card-glass rounded-lg overflow-hidden">
            {dataLoading ? (
              <div className="p-12 text-center">
                <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />
              </div>
            ) : agents.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground">
                No agents registered yet. Click "Add Agent" to get started.
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-secondary/50">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Agent</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Key</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Secret</th>
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
                            <p className="text-xs text-muted-foreground truncate max-w-xs">{agent.trigger_url}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-mono">{agent.agent_key}</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => toggleEnabled(agent)}
                          className="flex items-center gap-2 text-sm"
                        >
                          {agent.is_enabled ? (
                            <>
                              <ToggleRight className="w-5 h-5 text-green-500" />
                              <span className="text-green-500">Enabled</span>
                            </>
                          ) : (
                            <>
                              <ToggleLeft className="w-5 h-5 text-muted-foreground" />
                              <span className="text-muted-foreground">Disabled</span>
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {agent.outbound_secret ? '••••••••' : 'Using default'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditDialog(agent)}
                            className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(agent)}
                            className="p-2 text-muted-foreground hover:text-destructive transition-colors"
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
        </>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingAgent ? 'Edit Agent' : 'Register New Agent'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="agent_key">Agent Key *</Label>
              <Input
                id="agent_key"
                value={formData.agent_key}
                onChange={(e) => setFormData({ ...formData, agent_key: e.target.value })}
                placeholder="e.g., lead_qualifier"
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">Unique identifier for this agent within your org</p>
            </div>
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Lead Qualifier Agent"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="trigger_url">Trigger URL *</Label>
              <Input
                id="trigger_url"
                value={formData.trigger_url}
                onChange={(e) => setFormData({ ...formData, trigger_url: e.target.value })}
                placeholder="https://api-xxx.stack.tryrelevance.com/..."
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">Paste the Relevance webhook trigger URL</p>
            </div>
            <div>
              <Label htmlFor="outbound_secret">Outbound Secret (optional)</Label>
              <Input
                id="outbound_secret"
                type="password"
                value={formData.outbound_secret}
                onChange={(e) => setFormData({ ...formData, outbound_secret: e.target.value })}
                placeholder="Leave empty to use default secret"
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">Per-agent secret. If empty, uses RELEVANCE_DEFAULT_OUTBOUND_SECRET</p>
            </div>
            <div className="flex items-center gap-3">
              <Switch
                id="is_enabled"
                checked={formData.is_enabled}
                onCheckedChange={(checked) => setFormData({ ...formData, is_enabled: checked })}
              />
              <Label htmlFor="is_enabled">Enabled</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editingAgent ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ConsoleLayout>
  );
};

export default AgentRegistry;
