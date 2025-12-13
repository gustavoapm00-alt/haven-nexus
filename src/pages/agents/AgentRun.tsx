import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft, Play, Clock, CheckCircle, XCircle, Copy, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ScrollReveal from '@/components/ScrollReveal';

interface Agent {
  agent_key: string;
  name: string;
  description: string;
  user_prompt_template: string;
}

interface Run {
  id: string;
  status: string;
  input_json: any;
  output_json: any;
  output_text: string | null;
  error: string | null;
  created_at: string;
}

const AgentRun = () => {
  const { agentKey } = useParams<{ agentKey: string }>();
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [agent, setAgent] = useState<Agent | null>(null);
  const [inputJson, setInputJson] = useState('{}');
  const [running, setRunning] = useState(false);
  const [currentRun, setCurrentRun] = useState<Run | null>(null);
  const [runHistory, setRunHistory] = useState<Run[]>([]);
  const [loading, setLoading] = useState(true);
  const [orgId, setOrgId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth?redirect=/dashboard');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user && agentKey) {
      fetchAgentAndHistory();
    }
  }, [user, agentKey]);

  const fetchAgentAndHistory = async () => {
    try {
      // Get agent details
      const { data: agentData, error: agentError } = await supabase
        .from('agent_catalog')
        .select('agent_key, name, description, user_prompt_template')
        .eq('agent_key', agentKey)
        .single();

      if (agentError || !agentData) {
        toast({ title: 'Error', description: 'Agent not found', variant: 'destructive' });
        navigate('/dashboard');
        return;
      }

      setAgent(agentData);

      // Parse template for input hints
      const placeholders = agentData.user_prompt_template.match(/\{\{(\w+)\}\}/g) || [];
      const inputHint: Record<string, string> = {};
      placeholders.forEach((p: string) => {
        const key = p.replace(/\{\{|\}\}/g, '');
        inputHint[key] = '';
      });
      setInputJson(JSON.stringify(inputHint, null, 2));

      // Get user's org
      const { data: orgMembership } = await supabase
        .from('org_members')
        .select('org_id')
        .eq('user_id', user!.id)
        .single();

      if (orgMembership) {
        setOrgId(orgMembership.org_id);

        // Fetch run history
        const { data: runs } = await supabase
          .from('agent_runs')
          .select('id, status, input_json, output_json, output_text, error, created_at')
          .eq('org_id', orgMembership.org_id)
          .eq('agent_key', agentKey)
          .order('created_at', { ascending: false })
          .limit(10);

        setRunHistory((runs as Run[]) || []);
      }
    } catch (error) {
      console.error('Error fetching agent:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRun = async () => {
    if (!orgId || !agentKey) return;

    let parsedInput: any;
    try {
      parsedInput = JSON.parse(inputJson);
    } catch {
      toast({ title: 'Invalid JSON', description: 'Please enter valid JSON input', variant: 'destructive' });
      return;
    }

    setRunning(true);
    setCurrentRun(null);

    try {
      const response = await supabase.functions.invoke('agents-run', {
        body: { agent_key: agentKey, input_json: parsedInput },
      });

      if (response.error) {
        toast({ title: 'Error', description: response.error.message, variant: 'destructive' });
        return;
      }

      const { runId, status, error: runError, output_text, output_json } = response.data;

      if (status === 'failed') {
        setCurrentRun({
          id: runId,
          status: 'failed',
          input_json: parsedInput,
          output_json: null,
          output_text: null,
          error: runError || 'Unknown error',
          created_at: new Date().toISOString(),
        });
        toast({ title: 'Agent Failed', description: runError, variant: 'destructive' });
      } else {
        setCurrentRun({
          id: runId,
          status,
          input_json: parsedInput,
          output_json,
          output_text,
          error: null,
          created_at: new Date().toISOString(),
        });
        toast({ title: 'Success', description: 'Agent run completed' });
        fetchAgentAndHistory(); // Refresh history
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setRunning(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'Copied', description: 'Content copied to clipboard' });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'succeeded': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'running': return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />;
      default: return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!agent) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container-main max-w-4xl">
          <ScrollReveal>
            <Link to="/dashboard" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>

            <div className="mb-8">
              <h1 className="font-display text-4xl mb-2">{agent.name}</h1>
              <p className="text-muted-foreground">{agent.description}</p>
            </div>
          </ScrollReveal>

          {/* Input Section */}
          <ScrollReveal delay={0.1}>
            <div className="card-glass p-6 rounded-xl mb-6">
              <Label className="text-lg font-medium mb-4 block">Input Parameters (JSON)</Label>
              <p className="text-sm text-muted-foreground mb-4">
                Fill in the values for the template placeholders. The agent uses these to generate output.
              </p>
              <Textarea
                value={inputJson}
                onChange={(e) => setInputJson(e.target.value)}
                className="font-mono text-sm min-h-[200px] bg-background"
                placeholder="{}"
              />
              <Button
                onClick={handleRun}
                disabled={running}
                className="mt-4 btn-primary"
              >
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
          </ScrollReveal>

          {/* Current Run Result */}
          {currentRun && (
            <ScrollReveal delay={0.2}>
              <div className="card-glass p-6 rounded-xl mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-display text-xl flex items-center gap-2">
                    {getStatusIcon(currentRun.status)}
                    Run Result
                  </h2>
                  <span className="text-xs text-muted-foreground font-mono">{currentRun.id}</span>
                </div>

                {currentRun.error && (
                  <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 mb-4">
                    <p className="text-sm text-destructive font-mono whitespace-pre-wrap">
                      {currentRun.error}
                    </p>
                  </div>
                )}

                {currentRun.output_text && (
                  <div className="relative">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => copyToClipboard(currentRun.output_text!)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <div className="bg-secondary/50 rounded-lg p-4 prose prose-invert max-w-none">
                      <pre className="whitespace-pre-wrap text-sm">{currentRun.output_text}</pre>
                    </div>
                  </div>
                )}

                {currentRun.output_json && (
                  <div className="relative mt-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => copyToClipboard(JSON.stringify(currentRun.output_json, null, 2))}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <div className="bg-secondary/50 rounded-lg p-4">
                      <pre className="text-sm font-mono overflow-x-auto">
                        {JSON.stringify(currentRun.output_json, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </ScrollReveal>
          )}

          {/* Run History */}
          <ScrollReveal delay={0.3}>
            <div className="card-glass p-6 rounded-xl">
              <h2 className="font-display text-xl flex items-center gap-2 mb-4">
                <History className="w-5 h-5" />
                Recent Runs
              </h2>

              {runHistory.length === 0 ? (
                <p className="text-muted-foreground text-sm">No runs yet. Try running the agent above.</p>
              ) : (
                <div className="space-y-3">
                  {runHistory.map((run) => (
                    <div
                      key={run.id}
                      className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg cursor-pointer hover:bg-secondary/50 transition-colors"
                      onClick={() => setCurrentRun(run)}
                    >
                      <div className="flex items-center gap-3">
                        {getStatusIcon(run.status)}
                        <span className="font-mono text-xs">{run.id.slice(0, 8)}...</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(run.created_at).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </ScrollReveal>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AgentRun;
