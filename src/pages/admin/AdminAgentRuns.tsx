import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import AdminGate from '@/components/AdminGate';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  ArrowLeft,
  Search,
  RefreshCw,
  Play,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  Sparkles,
  Zap,
  Activity,
  Terminal,
  Copy,
  ChevronDown,
  ChevronUp,
  Bot,
  User,
  Calendar,
  Filter,
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface AgentRun {
  id: string;
  org_id: string;
  agent_key: string | null;
  status: string;
  input_json: any;
  output_json: any;
  output_text: string | null;
  error: string | null;
  created_at: string;
  updated_at: string;
}

interface Agent {
  agent_key: string;
  name: string;
  description: string | null;
  user_prompt_template: string;
  is_active: boolean | null;
}

interface OrgInfo {
  id: string;
  name: string;
}

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'succeeded', label: 'Succeeded' },
  { value: 'failed', label: 'Failed' },
  { value: 'running', label: 'Running' },
  { value: 'queued', label: 'Queued' },
];

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'succeeded':
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    case 'failed':
      return <XCircle className="w-4 h-4 text-red-500" />;
    case 'running':
      return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />;
    default:
      return <Clock className="w-4 h-4 text-muted-foreground" />;
  }
};

const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case 'succeeded':
      return 'border-green-500/50 text-green-400 bg-green-500/10';
    case 'failed':
      return 'border-red-500/50 text-red-400 bg-red-500/10';
    case 'running':
      return 'border-blue-500/50 text-blue-400 bg-blue-500/10';
    default:
      return 'border-muted-foreground/50 text-muted-foreground bg-muted/10';
  }
};

// Expandable row component
function RunRow({ run, orgs }: { run: AgentRun; orgs: Map<string, string> }) {
  const [expanded, setExpanded] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  return (
    <>
      <TableRow
        className="cursor-pointer hover:bg-primary/5 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <TableCell>
          <div className="flex items-center gap-2">
            {expanded ? (
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            )}
            <code className="text-xs font-mono text-muted-foreground">
              {run.id.slice(0, 8)}...
            </code>
          </div>
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-2">
            <Bot className="w-4 h-4 text-primary" />
            <span className="font-medium">{run.agent_key || 'Unknown'}</span>
          </div>
        </TableCell>
        <TableCell>
          <Badge variant="outline" className={getStatusBadgeClass(run.status)}>
            <span className="flex items-center gap-1.5">
              {getStatusIcon(run.status)}
              {run.status}
            </span>
          </Badge>
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-2 text-muted-foreground">
            <User className="w-3 h-3" />
            <span className="text-xs">{orgs.get(run.org_id) || run.org_id.slice(0, 8)}</span>
          </div>
        </TableCell>
        <TableCell>
          <span className="text-sm text-muted-foreground">
            {format(new Date(run.created_at), 'MMM d, HH:mm:ss')}
          </span>
        </TableCell>
      </TableRow>
      <AnimatePresence>
        {expanded && (
          <TableRow>
            <TableCell colSpan={5} className="p-0 border-0">
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="p-4 bg-secondary/30 border-b border-border space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Input */}
                    <div className="relative">
                      <Label className="text-xs text-muted-foreground mb-2 block">Input JSON</Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute top-0 right-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          copyToClipboard(JSON.stringify(run.input_json, null, 2));
                        }}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                      <pre className="text-xs font-mono bg-background/50 p-3 rounded-lg overflow-x-auto max-h-32">
                        {JSON.stringify(run.input_json, null, 2)}
                      </pre>
                    </div>

                    {/* Output */}
                    <div className="relative">
                      <Label className="text-xs text-muted-foreground mb-2 block">
                        {run.error ? 'Error' : 'Output'}
                      </Label>
                      {(run.output_text || run.output_json || run.error) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute top-0 right-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            copyToClipboard(
                              run.error ||
                                run.output_text ||
                                JSON.stringify(run.output_json, null, 2)
                            );
                          }}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      )}
                      {run.error ? (
                        <pre className="text-xs font-mono bg-red-500/10 text-red-400 p-3 rounded-lg overflow-x-auto max-h-32">
                          {run.error}
                        </pre>
                      ) : run.output_text ? (
                        <pre className="text-xs font-mono bg-background/50 p-3 rounded-lg overflow-x-auto max-h-32 whitespace-pre-wrap">
                          {run.output_text}
                        </pre>
                      ) : run.output_json ? (
                        <pre className="text-xs font-mono bg-background/50 p-3 rounded-lg overflow-x-auto max-h-32">
                          {JSON.stringify(run.output_json, null, 2)}
                        </pre>
                      ) : (
                        <p className="text-xs text-muted-foreground italic">No output yet</p>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            </TableCell>
          </TableRow>
        )}
      </AnimatePresence>
    </>
  );
}

export default function AdminAgentRuns() {
  const { user } = useAuth();
  const [runs, setRuns] = useState<AgentRun[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [orgs, setOrgs] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [agentFilter, setAgentFilter] = useState('all');

  // Agent Test Panel
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [testInput, setTestInput] = useState('{}');
  const [testRunning, setTestRunning] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  const fetchData = async () => {
    try {
      // Fetch all runs (admin has access to all)
      const { data: runsData, error: runsError } = await supabase
        .from('agent_runs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500);

      if (runsError) throw runsError;
      setRuns(runsData || []);

      // Fetch all agents
      const { data: agentsData } = await supabase
        .from('agent_catalog')
        .select('agent_key, name, description, user_prompt_template, is_active')
        .order('name');

      setAgents(agentsData || []);

      // Fetch org names
      const { data: orgsData } = await supabase.from('orgs').select('id, name');
      const orgMap = new Map<string, string>();
      orgsData?.forEach((org: OrgInfo) => orgMap.set(org.id, org.name));
      setOrgs(orgMap);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  // Filter runs
  const filteredRuns = useMemo(() => {
    return runs.filter((run) => {
      const matchesSearch =
        !search ||
        run.id.toLowerCase().includes(search.toLowerCase()) ||
        run.agent_key?.toLowerCase().includes(search.toLowerCase()) ||
        JSON.stringify(run.input_json).toLowerCase().includes(search.toLowerCase());

      const matchesStatus = statusFilter === 'all' || run.status === statusFilter;
      const matchesAgent = agentFilter === 'all' || run.agent_key === agentFilter;

      return matchesSearch && matchesStatus && matchesAgent;
    });
  }, [runs, search, statusFilter, agentFilter]);

  // Stats
  const stats = useMemo(() => {
    const total = runs.length;
    const succeeded = runs.filter((r) => r.status === 'succeeded').length;
    const failed = runs.filter((r) => r.status === 'failed').length;
    const running = runs.filter((r) => r.status === 'running').length;
    const successRate = total > 0 ? Math.round((succeeded / total) * 100) : 0;

    return { total, succeeded, failed, running, successRate };
  }, [runs]);

  // Agent selection for test panel
  const handleAgentSelect = (agentKey: string) => {
    const agent = agents.find((a) => a.agent_key === agentKey);
    setSelectedAgent(agent || null);
    setTestResult(null);

    if (agent) {
      // Parse template for input hints
      const placeholders = agent.user_prompt_template.match(/\{\{(\w+)\}\}/g) || [];
      const inputHint: Record<string, string> = {};
      placeholders.forEach((p) => {
        const key = p.replace(/\{\{|\}\}/g, '');
        inputHint[key] = '';
      });
      setTestInput(JSON.stringify(inputHint, null, 2));
    }
  };

  const handleTestRun = async () => {
    if (!selectedAgent) return;

    let parsedInput: any;
    try {
      parsedInput = JSON.parse(testInput);
    } catch {
      toast.error('Invalid JSON input');
      return;
    }

    setTestRunning(true);
    setTestResult(null);

    try {
      const response = await supabase.functions.invoke('agents-run', {
        body: { agent_key: selectedAgent.agent_key, input_json: parsedInput },
      });

      if (response.error) {
        setTestResult({ error: response.error.message });
        toast.error('Agent run failed');
      } else {
        setTestResult(response.data);
        if (response.data.status === 'succeeded') {
          toast.success('Agent run completed!');
        } else if (response.data.status === 'failed') {
          toast.error('Agent failed: ' + (response.data.error || 'Unknown error'));
        }
        // Refresh runs list
        fetchData();
      }
    } catch (error: any) {
      setTestResult({ error: error.message });
      toast.error('Failed to run agent');
    } finally {
      setTestRunning(false);
    }
  };

  return (
    <AdminGate>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Link to="/admin">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-display flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl">
                    <Activity className="w-6 h-6 text-primary" />
                  </div>
                  Agent Command Center
                </h1>
                <p className="text-muted-foreground mt-1">
                  Monitor all agent runs and test agents with superpowers
                </p>
              </div>
            </div>
            <Button onClick={handleRefresh} variant="outline" disabled={refreshing}>
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0 }}
            >
              <Card className="border-border/50 bg-card/50 backdrop-blur">
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-2">
                    <Terminal className="w-4 h-4" />
                    Total Runs
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-display">{stats.total}</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
            >
              <Card className="border-green-500/30 bg-green-500/5 backdrop-blur">
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-2 text-green-400">
                    <CheckCircle className="w-4 h-4" />
                    Succeeded
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-display text-green-400">{stats.succeeded}</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="border-red-500/30 bg-red-500/5 backdrop-blur">
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-2 text-red-400">
                    <XCircle className="w-4 h-4" />
                    Failed
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-display text-red-400">{stats.failed}</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <Card className="border-blue-500/30 bg-blue-500/5 backdrop-blur">
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-2 text-blue-400">
                    <Loader2 className="w-4 h-4" />
                    Running
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-display text-blue-400">{stats.running}</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="border-primary/30 bg-primary/5 backdrop-blur">
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    Success Rate
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-display">{stats.successRate}%</p>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Agent Test Panel */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 }}
              className="lg:col-span-1"
            >
              <Card className="border-primary/30 bg-gradient-to-b from-primary/10 to-transparent backdrop-blur sticky top-4">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="p-1.5 bg-primary/20 rounded-lg">
                      <Zap className="w-5 h-5 text-primary" />
                    </div>
                    Agent Test Lab
                    <Badge variant="outline" className="ml-auto text-xs">
                      <Sparkles className="w-3 h-3 mr-1" />
                      Admin Only
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    Run any agent instantly with custom inputs
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Agent Selector */}
                  <div>
                    <Label className="text-sm mb-2 block">Select Agent</Label>
                    <Select
                      value={selectedAgent?.agent_key || ''}
                      onValueChange={handleAgentSelect}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose an agent..." />
                      </SelectTrigger>
                      <SelectContent>
                        {agents
                          .filter((a) => a.is_active)
                          .map((agent) => (
                            <SelectItem key={agent.agent_key} value={agent.agent_key}>
                              <div className="flex items-center gap-2">
                                <Bot className="w-4 h-4 text-primary" />
                                {agent.name}
                              </div>
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedAgent && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-4"
                    >
                      <p className="text-xs text-muted-foreground">
                        {selectedAgent.description}
                      </p>

                      {/* Input JSON */}
                      <div>
                        <Label className="text-sm mb-2 block">Input JSON</Label>
                        <Textarea
                          value={testInput}
                          onChange={(e) => setTestInput(e.target.value)}
                          className="font-mono text-sm min-h-[150px] bg-background/50"
                          placeholder="{}"
                        />
                      </div>

                      {/* Run Button */}
                      <Button
                        onClick={handleTestRun}
                        disabled={testRunning}
                        className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90"
                      >
                        {testRunning ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Running...
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4 mr-2" />
                            Execute Agent
                          </>
                        )}
                      </Button>

                      {/* Test Result */}
                      {testResult && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="mt-4"
                        >
                          <Label className="text-sm mb-2 block flex items-center gap-2">
                            {testResult.error || testResult.status === 'failed' ? (
                              <XCircle className="w-4 h-4 text-red-500" />
                            ) : (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            )}
                            Result
                          </Label>
                          <div
                            className={`p-3 rounded-lg text-xs font-mono overflow-x-auto max-h-48 ${
                              testResult.error || testResult.status === 'failed'
                                ? 'bg-red-500/10 border border-red-500/30'
                                : 'bg-green-500/10 border border-green-500/30'
                            }`}
                          >
                            <pre className="whitespace-pre-wrap">
                              {testResult.error ||
                                testResult.output_text ||
                                JSON.stringify(testResult.output_json || testResult, null, 2)}
                            </pre>
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Runs Table */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="lg:col-span-2"
            >
              <Card className="border-border/50 bg-card/50 backdrop-blur">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Terminal className="w-5 h-5" />
                    All Agent Runs
                  </CardTitle>
                  <CardDescription>
                    Showing {filteredRuns.length} of {runs.length} runs
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Filters */}
                  <div className="flex flex-col md:flex-row gap-3 mb-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Search by ID, agent, or input..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-[150px]">
                        <Filter className="w-4 h-4 mr-2" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={agentFilter} onValueChange={setAgentFilter}>
                      <SelectTrigger className="w-[180px]">
                        <Bot className="w-4 h-4 mr-2" />
                        <SelectValue placeholder="All Agents" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Agents</SelectItem>
                        {agents.map((agent) => (
                          <SelectItem key={agent.agent_key} value={agent.agent_key}>
                            {agent.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Table */}
                  {loading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                  ) : filteredRuns.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Terminal className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No agent runs found</p>
                      <p className="text-sm">Try adjusting your filters or run an agent from the test panel</p>
                    </div>
                  ) : (
                    <div className="rounded-lg border border-border/50 overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-secondary/30">
                            <TableHead className="w-[120px]">Run ID</TableHead>
                            <TableHead>Agent</TableHead>
                            <TableHead className="w-[120px]">Status</TableHead>
                            <TableHead className="w-[140px]">Organization</TableHead>
                            <TableHead className="w-[140px]">Created</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredRuns.map((run) => (
                            <RunRow key={run.id} run={run} orgs={orgs} />
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </AdminGate>
  );
}
