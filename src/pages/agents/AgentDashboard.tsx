import { useState, useEffect, useCallback } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Loader2,
  Play,
  Activity,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Link as LinkIcon,
  Cpu,
  Bot,
  Clock,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import type { TenantStatusResponse, AgentStatus, ConnectorStatus, SetupStep } from "@/types/tenant";

export default function AgentDashboard() {
  const [searchParams] = useSearchParams();
  const tenantId = searchParams.get("tenant_id");

  const [status, setStatus] = useState<TenantStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [runningAgents, setRunningAgents] = useState<Set<string>>(new Set());
  const [setupStep, setSetupStep] = useState<SetupStep>("provisioning");

  const fetchStatus = useCallback(async () => {
    if (!tenantId) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/tenant-status?tenant_id=${tenantId}`,
        { headers: { "Content-Type": "application/json" } }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch status");
      }

      setStatus(result);
      setLoading(false);

      // Determine setup step
      const allConnected = result.connectors?.every(
        (c: ConnectorStatus) => c.status === "connected"
      ) ?? true;
      const allAgentsActive = result.agents?.every(
        (a: AgentStatus) => a.status === "active"
      ) ?? false;

      if (allAgentsActive && allConnected) {
        setSetupStep("live");
      } else if (allConnected) {
        setSetupStep("deploy");
      } else if (result.n8n_embed_url) {
        setSetupStep("connect");
      } else {
        setSetupStep("provisioning");
      }
    } catch (err: any) {
      console.error("Status fetch error:", err);
      setError(err.message);
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  // Poll during setup
  useEffect(() => {
    if (!tenantId || loading) return;
    if (setupStep === "live") return;

    const interval = setInterval(fetchStatus, 3000);
    return () => clearInterval(interval);
  }, [tenantId, loading, setupStep, fetchStatus]);

  // Poll for dashboard refresh when live
  useEffect(() => {
    if (!tenantId || loading || setupStep !== "live") return;

    const interval = setInterval(fetchStatus, 15000);
    return () => clearInterval(interval);
  }, [tenantId, loading, setupStep, fetchStatus]);

  const handleRunAgent = async (agentSlug: string) => {
    if (!tenantId) return;

    setRunningAgents((prev) => new Set(prev).add(agentSlug));

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/run-agent`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tenant_id: tenantId, agent_slug: agentSlug }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to run agent");
      }

      toast.success(`${agentSlug} queued successfully.`);
      setTimeout(fetchStatus, 2000);
    } catch (err: any) {
      console.error("Run agent error:", err);
      toast.error(err.message || "Failed to run agent");
    } finally {
      setRunningAgents((prev) => {
        const next = new Set(prev);
        next.delete(agentSlug);
        return next;
      });
    }
  };

  const progressSteps = [
    { key: "provisioning", label: "Provisioning" },
    { key: "connect", label: "Connect Tools" },
    { key: "live", label: "Agents Live" },
  ];

  const progressValue = {
    provisioning: 15,
    connect: 50,
    deploy: 75,
    live: 100,
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <SEO title="Loading | AERELION" />
        <Navbar />
        <main className="pt-32 pb-24">
          <div className="container mx-auto px-6 max-w-4xl text-center">
            <Loader2 className="w-10 h-10 mx-auto animate-spin text-primary" />
            <p className="text-muted-foreground mt-4">Loading your engine...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Error state
  if (error || !status) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <SEO title="Error | AERELION" />
        <Navbar />
        <main className="pt-32 pb-24">
          <div className="container mx-auto px-6 max-w-xl text-center">
            <AlertTriangle className="w-12 h-12 mx-auto text-destructive mb-6" />
            <h2 className="text-2xl font-semibold mb-4">Unable to load dashboard</h2>
            <p className="text-muted-foreground mb-8">{error || "Could not connect to your engine."}</p>
            <Button onClick={fetchStatus} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const isSetupComplete = setupStep === "live";
  const connectedCount = status.connectors?.filter(c => c.status === "connected").length || 0;
  const totalConnectors = status.connectors?.length || 0;
  const activeAgents = status.agents?.filter(a => a.status === "active").length || 0;
  const totalAgents = status.agents?.length || 0;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO title={isSetupComplete ? "Dashboard | AERELION" : "Setting Up | AERELION"} />
      <Navbar />

      <main className="pt-28 pb-24">
        <div className="container mx-auto px-6 max-w-5xl">
          
          {/* Setup Progress Bar (shows during setup) */}
          {!isSetupComplete && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-12"
            >
              <div className="flex justify-between mb-3">
                {progressSteps.map((s, idx) => {
                  const stepIndex = progressSteps.findIndex(x => x.key === setupStep);
                  const isActive = s.key === setupStep || (setupStep === "deploy" && s.key === "live");
                  const isComplete = idx < stepIndex || (setupStep === "deploy" && idx < 2);
                  
                  return (
                    <div
                      key={s.key}
                      className={`text-sm font-medium transition-colors ${
                        isActive ? "text-primary" : isComplete ? "text-green-400" : "text-muted-foreground"
                      }`}
                    >
                      {isComplete && <CheckCircle className="w-4 h-4 inline mr-1" />}
                      {s.label}
                    </div>
                  );
                })}
              </div>
              <Progress value={progressValue[setupStep]} className="h-1.5" />
            </motion.div>
          )}

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10"
          >
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">
                  {isSetupComplete ? "Your Agent Engine" : "Setting Up Your Engine"}
                </h1>
                <p className="text-muted-foreground">
                  {isSetupComplete 
                    ? "All systems operational."
                    : setupStep === "provisioning" 
                      ? "Provisioning isolated infrastructure..."
                      : setupStep === "connect"
                        ? "Connect your tools to continue."
                        : "Deploying your agents..."}
                </p>
              </div>
              {isSetupComplete && (
                <Button onClick={fetchStatus} variant="ghost" size="sm">
                  <RefreshCw className="w-4 h-4" />
                </Button>
              )}
            </div>
          </motion.div>

          {/* Engine Status Summary (when live) */}
          {isSetupComplete && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-3 gap-4 mb-10"
            >
              <div className="p-5 rounded-xl border border-green-500/30 bg-green-500/5 text-center">
                <p className="text-3xl font-bold text-green-400">Active</p>
                <p className="text-sm text-muted-foreground mt-1">Engine Status</p>
              </div>
              <div className="p-5 rounded-xl border border-border/50 bg-card/30 text-center">
                <p className="text-3xl font-bold">{connectedCount}/{totalConnectors}</p>
                <p className="text-sm text-muted-foreground mt-1">Tools Connected</p>
              </div>
              <div className="p-5 rounded-xl border border-border/50 bg-card/30 text-center">
                <p className="text-3xl font-bold">{activeAgents}</p>
                <p className="text-sm text-muted-foreground mt-1">Agents Live</p>
              </div>
            </motion.div>
          )}

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Provisioning Step */}
              <AnimatePresence mode="wait">
                {setupStep === "provisioning" && (
                  <motion.div
                    key="provisioning"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="p-10 rounded-xl border border-border/50 bg-card/30 text-center"
                  >
                    <Loader2 className="w-10 h-10 mx-auto animate-spin text-primary mb-6" />
                    <h2 className="text-xl font-semibold mb-2">Provisioning Your Engine</h2>
                    <p className="text-muted-foreground">
                      Setting up isolated infrastructure. This usually takes 30–60 seconds.
                    </p>
                  </motion.div>
                )}

                {/* Connect Tools Step */}
                {setupStep === "connect" && status.n8n_embed_url && (
                  <motion.div
                    key="connect"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="space-y-6"
                  >
                    <div className="p-5 rounded-xl border border-primary/30 bg-primary/5">
                      <div className="flex items-start gap-4">
                        <LinkIcon className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <div>
                          <h2 className="font-semibold mb-1">Connect Your Tools</h2>
                          <p className="text-sm text-muted-foreground">
                            Securely link your accounts. Credentials stay in your private workspace.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Connector Status */}
                    <div className="flex flex-wrap gap-2">
                      {status.connectors?.map((c) => (
                        <Badge
                          key={c.connector}
                          variant="outline"
                          className={
                            c.status === "connected"
                              ? "border-green-500/50 text-green-400"
                              : "border-yellow-500/50 text-yellow-400"
                          }
                        >
                          {c.connector}: {c.status === "connected" ? "✓" : "Needs auth"}
                        </Badge>
                      ))}
                    </div>

                    {/* Embed */}
                    <div className="rounded-xl border border-border/50 overflow-hidden">
                      <iframe
                        src={status.n8n_embed_url}
                        className="w-full h-[400px] border-0"
                        title="Connect Tools"
                        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                      />
                    </div>

                    <div className="text-center">
                      <Button onClick={fetchStatus} variant="outline">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        I've Connected My Tools
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* Deploy Step */}
                {setupStep === "deploy" && (
                  <motion.div
                    key="deploy"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="p-10 rounded-xl border border-border/50 bg-card/30 text-center"
                  >
                    <Cpu className="w-10 h-10 mx-auto text-primary mb-6" />
                    <h2 className="text-xl font-semibold mb-2">Deploying Agents</h2>
                    <p className="text-muted-foreground mb-6">
                      Your agents are being activated. This takes a few seconds.
                    </p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {status.agents?.map((a) => (
                        <Badge
                          key={a.agent_slug}
                          variant="outline"
                          className={
                            a.status === "active"
                              ? "border-green-500/50 text-green-400"
                              : "border-primary/50 text-primary"
                          }
                        >
                          {a.agent_slug}: {a.status}
                        </Badge>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Live - Agent Cards */}
                {isSetupComplete && (
                  <motion.div
                    key="agents"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                      Agents
                    </h2>
                    {status.agents?.map((agent) => {
                      const needsTool = agent.status !== "active";
                      const isRunning = runningAgents.has(agent.agent_slug);

                      return (
                        <div
                          key={agent.agent_slug}
                          className="p-5 rounded-xl border border-border/50 bg-card/30"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                <Bot className="w-5 h-5 text-primary" />
                              </div>
                              <div>
                                <h3 className="font-semibold">{agent.agent_slug}</h3>
                                <Badge
                                  variant="outline"
                                  className={
                                    agent.status === "active"
                                      ? "border-green-500/50 text-green-400 mt-1"
                                      : needsTool
                                        ? "border-yellow-500/50 text-yellow-400 mt-1"
                                        : "border-primary/50 text-primary mt-1"
                                  }
                                >
                                  {agent.status === "active" ? "Ready" : needsTool ? "Needs tool" : agent.status}
                                </Badge>
                              </div>
                            </div>
                            {agent.last_run_at && (
                              <div className="text-right text-sm">
                                <div className="flex items-center gap-1 text-muted-foreground">
                                  <Clock className="w-3 h-3" />
                                  {new Date(agent.last_run_at).toLocaleTimeString()}
                                </div>
                                <span className={agent.last_status === "success" ? "text-green-400" : "text-destructive"}>
                                  {agent.last_status}
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleRunAgent(agent.agent_slug)}
                              disabled={isRunning || agent.status !== "active"}
                            >
                              {isRunning ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              ) : (
                                <Play className="w-4 h-4 mr-2" />
                              )}
                              Run now
                            </Button>
                            <Link to={`/agents/activity?tenant_id=${tenantId}&agent_slug=${agent.agent_slug}`}>
                              <Button size="sm" variant="ghost">
                                <Activity className="w-4 h-4 mr-2" />
                                View activity
                              </Button>
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Activity Feed Sidebar (when live) */}
            {isSetupComplete && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="lg:col-span-1"
              >
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                  Activity
                </h2>
                <div className="rounded-xl border border-border/50 bg-card/30 p-4">
                  <div className="space-y-4">
                    {status.agents
                      ?.filter(a => a.last_run_at)
                      .sort((a, b) => new Date(b.last_run_at || 0).getTime() - new Date(a.last_run_at || 0).getTime())
                      .slice(0, 8)
                      .map((agent, idx) => (
                        <div key={`${agent.agent_slug}-${idx}`} className="flex items-start gap-3 text-sm">
                          <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                            agent.last_status === "success" ? "bg-green-400" : 
                            agent.last_status === "failed" ? "bg-destructive" : "bg-primary"
                          }`} />
                          <div className="min-w-0">
                            <p className="font-medium truncate">{agent.agent_slug}</p>
                            <p className="text-xs text-muted-foreground">
                              {agent.last_status} • {agent.last_run_at ? new Date(agent.last_run_at).toLocaleTimeString() : "—"}
                            </p>
                          </div>
                        </div>
                      ))}
                    
                    {(!status.agents || status.agents.filter(a => a.last_run_at).length === 0) && (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No activity yet. Run an agent to see results.
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
