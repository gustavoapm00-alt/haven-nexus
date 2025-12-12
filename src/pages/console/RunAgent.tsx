import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Loader2, Play, AlertTriangle, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import ConsoleLayout from '@/components/console/ConsoleLayout';
import SecretsWarningBanner from '@/components/console/SecretsWarningBanner';

interface Agent {
  id: string;
  agent_key: string;
  name: string;
  org_id: string;
}

interface AgentRun {
  id: string;
  status: string;
  output_json: any;
  error: string | null;
  relevance_trace_id: string | null;
}

const RunAgent = () => {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [agents, setAgents] = useState<Agent[]>([]);
  const [orgs, setOrgs] = useState<{ id: string; name: string }[]>([]);
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const [selectedAgentId, setSelectedAgentId] = useState<string>('');
  const [inputJson, setInputJson] = useState('{}');
  const [idempotencyKey, setIdempotencyKey] = useState('');
  const [running, setRunning] = useState(false);
  const [currentRun, setCurrentRun] = useState<AgentRun | null>(null);
  const [resultDialogOpen, setResultDialogOpen] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

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

  useEffect(() => {
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, []);

  const fetchOrgs = async () => {
    const { data } = await supabase
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
    const { data } = await supabase
      .from('relevance_agents')
      .select('id, agent_key, name, org_id')
      .eq('org_id', selectedOrgId)
      .eq('is_enabled', true)
      .order('name');

    if (data) {
      setAgents(data);
      if (data.length > 0 && !selectedAgentId) {
        setSelectedAgentId(data[0].id);
      }
    }
    setDataLoading(false);
  };

  const pollRunStatus = (runId: string) => {
    pollingRef.current = setInterval(async () => {
      const { data } = await supabase
        .from('agent_runs')
        .select('id, status, output_json, error, relevance_trace_id')
        .eq('id', runId)
        .maybeSingle();

      if (data) {
        setCurrentRun(data);
        if (data.status === 'succeeded' || data.status === 'failed') {
          if (pollingRef.current) {
            clearInterval(pollingRef.current);
            pollingRef.current = null;
          }
          setRunning(false);
        }
      }
    }, 2000);
  };

  const handleRun = async () => {
    if (!selectedAgentId || !selectedOrgId) {
      toast({ title: 'Error', description: 'Select an agent first.', variant: 'destructive' });
      return;
    }

    const agent = agents.find(a => a.id === selectedAgentId);
    if (!agent) return;

    let parsedInput: any;
    try {
      parsedInput = JSON.parse(inputJson);
    } catch {
      toast({ title: 'Invalid JSON', description: 'Input must be valid JSON.', variant: 'destructive' });
      return;
    }

    setRunning(true);
    setCurrentRun(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/agents-run`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          orgId: selectedOrgId,
          agentKey: agent.agent_key,
          input: parsedInput,
          idempotencyKey: idempotencyKey.trim() || undefined,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        toast({ title: 'Error', description: result.error || 'Failed to trigger agent.', variant: 'destructive' });
        setRunning(false);
        return;
      }

      toast({ title: 'Agent Triggered', description: `Run ID: ${result.runId}` });
      setCurrentRun({ id: result.runId, status: result.status, output_json: null, error: null, relevance_trace_id: null });
      setResultDialogOpen(true);

      if (result.status !== 'succeeded' && result.status !== 'failed') {
        pollRunStatus(result.runId);
      } else {
        setRunning(false);
      }
    } catch (err: any) {
      toast({ title: 'Network Error', description: err.message, variant: 'destructive' });
      setRunning(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'succeeded':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-destructive" />;
      case 'running':
      case 'sent':
      case 'queued':
        return <Clock className="w-5 h-5 text-yellow-500 animate-pulse" />;
      default:
        return <Clock className="w-5 h-5 text-muted-foreground" />;
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
        <h1 className="font-display text-3xl mb-2">Run Agent</h1>
        <p className="text-muted-foreground text-sm">
          Trigger a Relevance AI agent and view the results.
        </p>
      </div>

      {/* Security Note */}
      <div className="bg-secondary/50 border border-border rounded-lg p-4 mb-6 text-sm text-muted-foreground">
        <AlertTriangle className="w-4 h-4 inline mr-2 text-yellow-500" />
        <strong>Note:</strong> Relevance AI does not generate webhook secrets automatically. Security is handled by shared-secret headers configured in Relevance and stored in Lovable secrets. Ensure <code className="bg-background px-1 rounded">RELEVANCE_DEFAULT_OUTBOUND_SECRET</code> and <code className="bg-background px-1 rounded">RELEVANCE_CALLBACK_SECRET</code> are configured for production security.
      </div>

      {orgs.length === 0 && !dataLoading ? (
        <div className="card-glass p-8 text-center text-muted-foreground">
          You are not a member of any organization.
        </div>
      ) : (
        <div className="max-w-2xl space-y-6">
          {/* Org Selector */}
          {orgs.length > 1 && (
            <div>
              <Label>Organization</Label>
              <select
                value={selectedOrgId || ''}
                onChange={(e) => {
                  setSelectedOrgId(e.target.value);
                  setSelectedAgentId('');
                }}
                className="mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              >
                {orgs.map((org) => (
                  <option key={org.id} value={org.id}>{org.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Agent Selector */}
          <div>
            <Label>Agent</Label>
            {dataLoading ? (
              <div className="mt-1 flex items-center gap-2 text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading agents...
              </div>
            ) : agents.length === 0 ? (
              <p className="mt-1 text-sm text-muted-foreground">
                No enabled agents found. <a href="/console/agents" className="text-primary underline">Register one first</a>.
              </p>
            ) : (
              <select
                value={selectedAgentId}
                onChange={(e) => setSelectedAgentId(e.target.value)}
                className="mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              >
                {agents.map((agent) => (
                  <option key={agent.id} value={agent.id}>
                    {agent.name} ({agent.agent_key})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Input JSON */}
          <div>
            <Label htmlFor="input">Input JSON</Label>
            <Textarea
              id="input"
              value={inputJson}
              onChange={(e) => setInputJson(e.target.value)}
              rows={8}
              className="mt-1 font-mono text-sm"
              placeholder='{"key": "value"}'
            />
          </div>

          {/* Idempotency Key */}
          <div>
            <Label htmlFor="idempotency">Idempotency Key (optional)</Label>
            <Input
              id="idempotency"
              value={idempotencyKey}
              onChange={(e) => setIdempotencyKey(e.target.value)}
              placeholder="Optional unique key to prevent duplicate runs"
              className="mt-1"
            />
          </div>

          {/* Run Button */}
          <Button onClick={handleRun} disabled={running || agents.length === 0} className="w-full">
            {running ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Run Agent
              </>
            )}
          </Button>
        </div>
      )}

      {/* Result Dialog */}
      <Dialog open={resultDialogOpen} onOpenChange={setResultDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Agent Run Result
              {currentRun && getStatusIcon(currentRun.status)}
            </DialogTitle>
          </DialogHeader>
          
          {currentRun && (
            <div className="space-y-4">
              <div>
                <Label className="text-muted-foreground">Run ID</Label>
                <p className="font-mono text-sm">{currentRun.id}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Status</Label>
                <p className="font-medium capitalize">{currentRun.status}</p>
              </div>
              {currentRun.relevance_trace_id && (
                <div>
                  <Label className="text-muted-foreground">Trace ID</Label>
                  <p className="font-mono text-sm">{currentRun.relevance_trace_id}</p>
                </div>
              )}
              {currentRun.error && (
                <div>
                  <Label className="text-destructive">Error</Label>
                  <pre className="mt-1 p-3 bg-destructive/10 border border-destructive/20 rounded text-sm overflow-auto max-h-40">
                    {currentRun.error}
                  </pre>
                </div>
              )}
              {currentRun.output_json && (
                <div>
                  <Label className="text-muted-foreground">Output</Label>
                  <pre className="mt-1 p-3 bg-secondary rounded text-sm overflow-auto max-h-60 font-mono">
                    {JSON.stringify(currentRun.output_json, null, 2)}
                  </pre>
                </div>
              )}
              {(currentRun.status === 'queued' || currentRun.status === 'sent' || currentRun.status === 'running') && (
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Polling for results every 2 seconds...
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </ConsoleLayout>
  );
};

export default RunAgent;
