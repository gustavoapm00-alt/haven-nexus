import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
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
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Link as LinkIcon,
  Bot,
  Clock,
  Activity,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import type { TenantStatusResponse, AgentStatus, ConnectorStatus, SetupStep } from "@/types/tenant";

// Mock activity for initial state
const mockActivity = [
  { id: 1, message: "System initialized", time: "Just now", type: "info" },
  { id: 2, message: "Awaiting tool connections", time: "Just now", type: "pending" },
];

export default function Dashboard() {
  const [searchParams] = useSearchParams();
  const tenantId = searchParams.get("tenant_id");

  const [status, setStatus] = useState<TenantStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [runningAgents, setRunningAgents] = useState<Set<string>>(new Set());
  const [setupStep, setSetupStep] = useState<"provisioning" | "connect" | "deploy" | "live">("provisioning");
  const [activity, setActivity] = useState(mockActivity);

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

      toast.success(`${agentSlug} started successfully.`);
      setActivity((prev) => [
        { id: Date.now(), message: `${agentSlug} running`, time: "Just now", type: "success" },
        ...prev.slice(0, 4),
      ]);
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

  const progressValue = {
    provisioning: 20,
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
          <div className="container mx-auto px-6 max-w-xl text-center">
            <Loader2 className="w-12 h-12 mx-auto animate-spin text-primary mb-6" />
            <h2 className="text-xl font-semibold mb-2">Loading Your Dashboard</h2>
            <p className="text-muted-foreground">Connecting to your agent engine...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <SEO title="Error | AERELION" />
        <Navbar />
        <main className="pt-32 pb-24">
          <div className="container mx-auto px-6 max-w-xl text-center">
            <AlertTriangle className="w-12 h-12 mx-auto text-destructive mb-6" />
            <h2 className="text-2xl font-semibold mb-4">Connection Issue</h2>
            <p className="text-muted-foreground mb-8">{error}</p>
            <Button onClick={fetchStatus} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const isSetupComplete = setupStep === "live";
  const connectedCount = status?.connectors?.filter(c => c.status === "connected").length || 0;
  const totalConnectors = status?.connectors?.length || 0;
  const activeAgents = status?.agents?.filter(a => a.status === "active").length || 0;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO title={isSetupComplete ? "Dashboard | AERELION" : "Setup | AERELION"} />
      <Navbar />

      <main className="pt-28 pb-24">
        <div className="container mx-auto px-6 max-w-5xl">
          
          {/* Progress Bar (during setup) */}
          {!isSetupComplete && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-10"
            >
              <div className="flex justify-between text-sm mb-3">
                <span className={setupStep === "provisioning" ? "text-primary font-medium" : "text-muted-foreground"}>
                  Provisioning
                </span>
                <span className={setupStep === "connect" ? "text-primary font-medium" : "text-muted-foreground"}>
                  Connect Tools
                </span>
                <span className={setupStep === "live" || setupStep === "deploy" ? "text-primary font-medium" : "text-muted-foreground"}>
                  Agents Live
                </span>
              </div>
              <Progress value={progressValue[setupStep]} className="h-1.5" />
            </motion.div>
          )}

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start justify-between mb-10"
          >
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">
                {isSetupComplete ? "Your Agent Engine" : "Setting Up"}
              </h1>
              <p className="text-muted-foreground">
                {isSetupComplete 
                  ? "All systems operational. Your agents are ready."
                  : setupStep === "provisioning" 
                    ? "Provisioning your private infrastructure..."
                    : setupStep === "connect"
                      ? "Connect your tools to activate agents."
                      : "Deploying your agents..."}
              </p>
            </div>
            {isSetupComplete && (
              <Button onClick={fetchStatus} variant="ghost" size="icon">
                <RefreshCw className="w-4 h-4" />
              </Button>
            )}
          </motion.div>

          {/* Status Cards (when live) */}
          {isSetupComplete && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-3 gap-4 mb-10"
            >
              <div className="p-6 rounded-xl border border-green-500/30 bg-green-500/5 text-center">
                <Zap className="w-6 h-6 mx-auto text-green-400 mb-2" />
                <p className="text-2xl font-bold text-green-400">Active</p>
                <p className="text-sm text-muted-foreground">Engine Status</p>
              </div>
              <div className="p-6 rounded-xl border border-border/50 bg-card/30 text-center">
                <LinkIcon className="w-6 h-6 mx-auto text-primary mb-2" />
                <p className="text-2xl font-bold">{connectedCount}/{totalConnectors}</p>
                <p className="text-sm text-muted-foreground">Tools Connected</p>
              </div>
              <div className="p-6 rounded-xl border border-border/50 bg-card/30 text-center">
                <Bot className="w-6 h-6 mx-auto text-primary mb-2" />
                <p className="text-2xl font-bold">{activeAgents}</p>
                <p className="text-sm text-muted-foreground">Agents Live</p>
              </div>
            </motion.div>
          )}

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              <AnimatePresence mode="wait">
                {/* Provisioning */}
                {setupStep === "provisioning" && (
                  <motion.div
                    key="provisioning"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="p-12 rounded-xl border border-border/50 bg-card/30 text-center"
                  >
                    <Loader2 className="w-12 h-12 mx-auto animate-spin text-primary mb-6" />
                    <h2 className="text-xl font-semibold mb-2">Provisioning Infrastructure</h2>
                    <p className="text-muted-foreground">
                      Setting up your private workspace. This takes about 30 seconds.
                    </p>
                  </motion.div>
                )}

                {/* Connect Tools */}
                {setupStep === "connect" && status?.n8n_embed_url && (
                  <motion.div
                    key="connect"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4"
                  >
                    <div className="p-4 rounded-xl border border-primary/30 bg-primary/5">
                      <div className="flex items-start gap-3">
                        <LinkIcon className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <div>
                          <h3 className="font-semibold mb-1">Connect Your Tools</h3>
                          <p className="text-sm text-muted-foreground">
                            Securely link your accounts. Credentials stay in your private workspace.
                          </p>
                        </div>
                      </div>
                    </div>

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
                        Check Connection Status
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* Deploying */}
                {setupStep === "deploy" && (
                  <motion.div
                    key="deploy"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="p-12 rounded-xl border border-border/50 bg-card/30 text-center"
                  >
                    <Bot className="w-12 h-12 mx-auto text-primary mb-6" />
                    <h2 className="text-xl font-semibold mb-2">Deploying Agents</h2>
                    <p className="text-muted-foreground">Your agents are being activated...</p>
                  </motion.div>
                )}

                {/* Live - Agent Cards */}
                {isSetupComplete && status?.agents && (
                  <motion.div
                    key="agents"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                      Your Agents
                    </h2>
                    {status.agents.map((agent) => {
                      const isRunning = runningAgents.has(agent.agent_slug);

                      return (
                        <div
                          key={agent.agent_slug}
                          className="p-5 rounded-xl border border-border/50 bg-card/30 hover:bg-card/50 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                <Bot className="w-5 h-5 text-primary" />
                              </div>
                              <div>
                                <h3 className="font-semibold">{agent.agent_slug}</h3>
                                <Badge
                                  variant="outline"
                                  className={
                                    agent.status === "active"
                                      ? "border-green-500/50 text-green-400 mt-1"
                                      : "border-yellow-500/50 text-yellow-400 mt-1"
                                  }
                                >
                                  {agent.status === "active" ? "Ready" : agent.status}
                                </Badge>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {agent.last_run_at && (
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {new Date(agent.last_run_at).toLocaleTimeString()}
                                </span>
                              )}
                              <Button
                                size="sm"
                                onClick={() => handleRunAgent(agent.agent_slug)}
                                disabled={isRunning || agent.status !== "active"}
                              >
                                {isRunning ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <>
                                    <Play className="w-4 h-4 mr-1" />
                                    Run
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Activity Feed */}
            <div className="lg:col-span-1">
              <div className="sticky top-28">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Activity
                </h2>
                <div className="space-y-3">
                  {activity.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="p-3 rounded-lg border border-border/50 bg-card/30"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                          item.type === "success" ? "bg-green-400" :
                          item.type === "pending" ? "bg-yellow-400" : "bg-primary"
                        }`} />
                        <div>
                          <p className="text-sm">{item.message}</p>
                          <p className="text-xs text-muted-foreground">{item.time}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  {activity.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No activity yet
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
