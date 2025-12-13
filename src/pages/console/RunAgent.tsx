import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { 
  Loader2, Play, AlertTriangle, CheckCircle, XCircle, Clock, 
  ChevronDown, Copy, Filter, RefreshCw, ExternalLink, Calendar,
  Hash, FileJson
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  input_json: any;
  created_at: string;
  updated_at: string;
  relevance_agent_id: string;
}

const STATUS_OPTIONS = ['all', 'queued', 'sent', 'running', 'succeeded', 'failed'] as const;

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
  const [dataLoading, setDataLoading] = useState(true);
  
  // Runs History state
  const [runsHistory, setRunsHistory] = useState<AgentRun[]>([]);
  const [runsLoading, setRunsLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [agentFilter, setAgentFilter] = useState<string>('all');
  const [selectedHistoryRun, setSelectedHistoryRun] = useState<AgentRun | null>(null);
  
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
      fetchRunsHistory();
    }
  }, [selectedOrgId]);

  useEffect(() => {
    if (selectedOrgId) {
      fetchRunsHistory();
    }
  }, [statusFilter, agentFilter]);

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

  const fetchRunsHistory = async () => {
    if (!selectedOrgId) return;
    
    setRunsLoading(true);
    let query = supabase
      .from('agent_runs')
      .select('id, status, output_json, error, relevance_trace_id, input_json, created_at, updated_at, relevance_agent_id')
      .eq('org_id', selectedOrgId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (statusFilter !== 'all') {
      query = query.eq('status', statusFilter);
    }
    
    if (agentFilter !== 'all') {
      query = query.eq('relevance_agent_id', agentFilter);
    }

    const { data, error } = await query;
    if (data) {
      setRunsHistory(data);
    }
    setRunsLoading(false);
  };

  const pollRunStatus = (runId: string) => {
    pollingRef.current = setInterval(async () => {
      const { data } = await supabase
        .from('agent_runs')
        .select('id, status, output_json, error, relevance_trace_id, input_json, created_at, updated_at, relevance_agent_id')
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
          fetchRunsHistory();
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
        const errorMsg = result.error || result.message || 'Failed to trigger agent.';
        toast({ title: 'Error', description: errorMsg, variant: 'destructive' });
        
        // If we have a runId, still show the run detail
        if (result.runId) {
          const { data: runData } = await supabase
            .from('agent_runs')
            .select('id, status, output_json, error, relevance_trace_id, input_json, created_at, updated_at, relevance_agent_id')
            .eq('id', result.runId)
            .maybeSingle();
          
          if (runData) {
            setCurrentRun(runData);
          }
        }
        setRunning(false);
        return;
      }

      toast({ title: 'Agent Triggered', description: `Run ID: ${result.runId}` });
      
      // Fetch full run data
      const { data: fullRun } = await supabase
        .from('agent_runs')
        .select('id, status, output_json, error, relevance_trace_id, input_json, created_at, updated_at, relevance_agent_id')
        .eq('id', result.runId)
        .maybeSingle();
      
      if (fullRun) {
        setCurrentRun(fullRun);
      }

      if (result.status !== 'succeeded' && result.status !== 'failed') {
        pollRunStatus(result.runId);
      } else {
        setRunning(false);
        fetchRunsHistory();
      }
    } catch (err: any) {
      toast({ title: 'Network Error', description: err.message, variant: 'destructive' });
      setRunning(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline', className: string }> = {
      succeeded: { variant: 'default', className: 'bg-green-500/10 text-green-500 border-green-500/20' },
      failed: { variant: 'destructive', className: '' },
      running: { variant: 'secondary', className: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' },
      sent: { variant: 'secondary', className: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
      queued: { variant: 'outline', className: 'text-muted-foreground' },
    };
    const { variant, className } = variants[status] || variants.queued;
    return <Badge variant={variant} className={className}>{status}</Badge>;
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

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'Copied', description: `${label} copied to clipboard.` });
  };

  const getAgentName = (agentId: string) => {
    const agent = agents.find(a => a.id === agentId);
    return agent?.name || 'Unknown Agent';
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString();
  };

  // Run Detail Panel component
  const RunDetailPanel = ({ run }: { run: AgentRun }) => {
    const errorTooLong = run.error && run.error.length > 10000;
    
    return (
      <div className="card-glass p-6 rounded-lg space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-xl flex items-center gap-2">
            Run Detail {getStatusIcon(run.status)}
          </h3>
          {getStatusBadge(run.status)}
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <Label className="text-muted-foreground text-xs">Run ID</Label>
            <div className="flex items-center gap-2 font-mono text-xs mt-1">
              <Hash className="w-3 h-3 text-muted-foreground" />
              <span className="truncate">{run.id}</span>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(run.id, 'Run ID')}>
                <Copy className="w-3 h-3" />
              </Button>
            </div>
          </div>
          <div>
            <Label className="text-muted-foreground text-xs">Agent</Label>
            <p className="mt-1">{getAgentName(run.relevance_agent_id)}</p>
          </div>
          <div>
            <Label className="text-muted-foreground text-xs">Created</Label>
            <div className="flex items-center gap-2 text-xs mt-1">
              <Calendar className="w-3 h-3 text-muted-foreground" />
              {formatDate(run.created_at)}
            </div>
          </div>
          <div>
            <Label className="text-muted-foreground text-xs">Updated</Label>
            <div className="flex items-center gap-2 text-xs mt-1">
              <Calendar className="w-3 h-3 text-muted-foreground" />
              {formatDate(run.updated_at)}
            </div>
          </div>
        </div>

        {run.relevance_trace_id && (
          <div>
            <Label className="text-muted-foreground text-xs">Trace ID</Label>
            <div className="flex items-center gap-2 font-mono text-xs mt-1">
              <ExternalLink className="w-3 h-3 text-muted-foreground" />
              <span>{run.relevance_trace_id}</span>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(run.relevance_trace_id!, 'Trace ID')}>
                <Copy className="w-3 h-3" />
              </Button>
            </div>
          </div>
        )}

        {/* Input JSON */}
        <Collapsible defaultOpen={true}>
          <CollapsibleTrigger className="flex items-center gap-2 w-full text-left group">
            <ChevronDown className="w-4 h-4 text-primary transition-transform group-data-[state=closed]:-rotate-90" />
            <Label className="cursor-pointer flex items-center gap-2">
              <FileJson className="w-4 h-4" /> Input JSON
            </Label>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <pre className="mt-2 p-3 bg-secondary/50 border border-border rounded text-xs overflow-auto max-h-40 font-mono">
              {JSON.stringify(run.input_json, null, 2)}
            </pre>
          </CollapsibleContent>
        </Collapsible>

        {/* Output JSON */}
        {run.output_json && (
          <Collapsible defaultOpen={true}>
            <CollapsibleTrigger className="flex items-center gap-2 w-full text-left group">
              <ChevronDown className="w-4 h-4 text-green-500 transition-transform group-data-[state=closed]:-rotate-90" />
              <Label className="cursor-pointer text-green-500 flex items-center gap-2">
                <FileJson className="w-4 h-4" /> Output JSON
              </Label>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <pre className="mt-2 p-3 bg-green-500/5 border border-green-500/20 rounded text-xs overflow-auto max-h-60 font-mono">
                {JSON.stringify(run.output_json, null, 2)}
              </pre>
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Error */}
        {run.error && (
          <Collapsible defaultOpen={true}>
            <CollapsibleTrigger className="flex items-center gap-2 w-full text-left group">
              <ChevronDown className="w-4 h-4 text-destructive transition-transform group-data-[state=closed]:-rotate-90" />
              <Label className="cursor-pointer text-destructive">Error Details</Label>
            </CollapsibleTrigger>
            <CollapsibleContent>
              {errorTooLong ? (
                <div className="mt-2">
                  <pre className="p-3 bg-destructive/10 border border-destructive/20 rounded text-xs overflow-auto max-h-60 whitespace-pre-wrap break-words font-mono">
                    {run.error.substring(0, 10000)}...
                  </pre>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                    onClick={() => copyToClipboard(run.error!, 'Full error')}
                  >
                    <Copy className="w-3 h-3 mr-2" />
                    Copy full error ({Math.round(run.error.length / 1000)}k chars)
                  </Button>
                </div>
              ) : (
                <pre className="mt-2 p-3 bg-destructive/10 border border-destructive/20 rounded text-xs overflow-auto max-h-60 whitespace-pre-wrap break-words font-mono">
                  {run.error}
                </pre>
              )}
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Polling indicator */}
        {(run.status === 'queued' || run.status === 'sent' || run.status === 'running') && (
          <div className="flex items-center gap-2 text-muted-foreground text-sm border-t border-border pt-4">
            <Loader2 className="w-4 h-4 animate-spin" />
            Polling for results every 2 seconds...
          </div>
        )}
      </div>
    );
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
        <h1 className="font-display text-3xl mb-2">Run Console</h1>
        <p className="text-muted-foreground text-sm">
          Trigger Relevance AI agents, monitor execution, and inspect run history.
        </p>
      </div>

      {orgs.length === 0 && !dataLoading ? (
        <div className="card-glass p-8 text-center text-muted-foreground">
          You are not a member of any organization.
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column: Trigger Agent */}
          <div className="space-y-6">
            <div className="card-glass p-6 rounded-lg">
              <h2 className="font-display text-xl mb-4 flex items-center gap-2">
                <Play className="w-5 h-5 text-primary" />
                Trigger Agent
              </h2>

              {/* Org Selector */}
              {orgs.length > 1 && (
                <div className="mb-4">
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
              <div className="mb-4">
                <Label>Agent</Label>
                {dataLoading ? (
                  <div className="mt-1 flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading agents...
                  </div>
                ) : agents.length === 0 ? (
                  <p className="mt-1 text-sm text-muted-foreground">
                    No enabled agents found. <Link to="/console/agents" className="text-primary underline">Register one first</Link>.
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
              <div className="mb-4">
                <Label htmlFor="input">Input JSON</Label>
                <Textarea
                  id="input"
                  value={inputJson}
                  onChange={(e) => setInputJson(e.target.value)}
                  rows={6}
                  className="mt-1 font-mono text-sm"
                  placeholder='{"key": "value"}'
                />
              </div>

              {/* Idempotency Key */}
              <div className="mb-4">
                <Label htmlFor="idempotency">Idempotency Key (optional)</Label>
                <Input
                  id="idempotency"
                  value={idempotencyKey}
                  onChange={(e) => setIdempotencyKey(e.target.value)}
                  placeholder="Unique key to prevent duplicate runs"
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

            {/* Current Run Detail */}
            {currentRun && <RunDetailPanel run={currentRun} />}
          </div>

          {/* Right Column: Runs History */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Runs History
              </h2>
              <Button variant="outline" size="sm" onClick={fetchRunsHistory} disabled={runsLoading}>
                <RefreshCw className={`w-4 h-4 mr-2 ${runsLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>

            {/* Filters */}
            <div className="flex gap-3">
              <div className="flex-1">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full">
                    <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map(status => (
                      <SelectItem key={status} value={status}>
                        {status === 'all' ? 'All Statuses' : status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <Select value={agentFilter} onValueChange={setAgentFilter}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Filter by agent" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Agents</SelectItem>
                    {agents.map(agent => (
                      <SelectItem key={agent.id} value={agent.id}>
                        {agent.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Runs List */}
            <div className="card-glass rounded-lg overflow-hidden">
              {runsLoading ? (
                <div className="p-8 text-center">
                  <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />
                </div>
              ) : runsHistory.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  No runs found.
                </div>
              ) : (
                <div className="divide-y divide-border max-h-[600px] overflow-auto">
                  {runsHistory.map((run) => (
                    <button
                      key={run.id}
                      onClick={() => setSelectedHistoryRun(selectedHistoryRun?.id === run.id ? null : run)}
                      className={`w-full text-left p-4 hover:bg-secondary/30 transition-colors ${
                        selectedHistoryRun?.id === run.id ? 'bg-secondary/50' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(run.status)}
                          <span className="font-mono text-xs truncate max-w-[150px]">{run.id.slice(0, 8)}...</span>
                        </div>
                        {getStatusBadge(run.status)}
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{getAgentName(run.relevance_agent_id)}</span>
                        <span>{formatDate(run.created_at)}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Selected History Run Detail */}
            {selectedHistoryRun && <RunDetailPanel run={selectedHistoryRun} />}
          </div>
        </div>
      )}
    </ConsoleLayout>
  );
};

export default RunAgent;