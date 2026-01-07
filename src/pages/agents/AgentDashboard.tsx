import { useState, useEffect, useCallback } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Loader2,
  Play,
  Activity,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Home,
  Link as LinkIcon,
} from "lucide-react";
import { toast } from "sonner";
import type { TenantStatusResponse, AgentStatus, ConnectorStatus } from "@/types/tenant";

export default function AgentDashboard() {
  const [searchParams] = useSearchParams();
  const tenantId = searchParams.get("tenant_id");

  const [status, setStatus] = useState<TenantStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [runningAgents, setRunningAgents] = useState<Set<string>>(new Set());

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
    } catch (err: any) {
      console.error("Status fetch error:", err);
      setError(err.message);
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  // Poll for updates
  useEffect(() => {
    if (!tenantId || loading) return;

    const interval = setInterval(fetchStatus, 10000);
    return () => clearInterval(interval);
  }, [tenantId, loading, fetchStatus]);

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

      toast.success(`Agent "${agentSlug}" queued successfully.`);

      // Poll for updated status
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <SEO title="Loading Dashboard | AERELION" />
        <Navbar />
        <main className="pt-32 pb-24">
          <div className="container mx-auto px-6 max-w-4xl text-center">
            <Loader2 className="w-12 h-12 mx-auto animate-spin text-primary" />
            <p className="text-muted-foreground mt-4">Loading dashboard...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !status) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <SEO title="Dashboard Error | AERELION" />
        <Navbar />
        <main className="pt-32 pb-24">
          <div className="container mx-auto px-6 max-w-2xl text-center">
            <AlertTriangle className="w-12 h-12 mx-auto text-destructive mb-4" />
            <h2 className="text-2xl font-semibold mb-4">Dashboard Error</h2>
            <p className="text-muted-foreground mb-8">
              {error || "Could not load dashboard"}
            </p>
            <div className="flex gap-4 justify-center">
              <Button onClick={fetchStatus} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </Button>
              <Link to="/">
                <Button variant="ghost">
                  <Home className="w-4 h-4 mr-2" />
                  Return Home
                </Button>
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO title="Agent Dashboard | AERELION" />
      <Navbar />

      <main className="pt-28 pb-24">
        <div className="container mx-auto px-6 max-w-5xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-8"
          >
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                Agent Dashboard
              </h1>
              <p className="text-muted-foreground mt-1">
                Manage and monitor your deployed agents.
              </p>
            </div>
            <Button onClick={fetchStatus} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </motion.div>

          {/* Connector Status Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
              Connectors
            </h2>
            <div className="flex flex-wrap gap-3">
              {status.connectors.map((c) => (
                <div
                  key={c.connector}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border/50 bg-card/30"
                >
                  <LinkIcon className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{c.connector}</span>
                  <Badge
                    variant="outline"
                    className={
                      c.status === "connected"
                        ? "border-green-500/50 text-green-400"
                        : c.status === "error"
                        ? "border-destructive/50 text-destructive"
                        : "border-yellow-500/50 text-yellow-400"
                    }
                  >
                    {c.status}
                  </Badge>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Agent Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
              Agents
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {status.agents.map((agent) => (
                <div
                  key={agent.agent_slug}
                  className="p-6 rounded-xl border border-border/50 bg-card/30"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">{agent.agent_slug}</h3>
                      <Badge
                        variant="outline"
                        className={
                          agent.status === "active"
                            ? "border-green-500/50 text-green-400 mt-2"
                            : agent.status === "error"
                            ? "border-destructive/50 text-destructive mt-2"
                            : "border-primary/50 text-primary mt-2"
                        }
                      >
                        {agent.status}
                      </Badge>
                    </div>
                    {agent.last_status && (
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Last Run</p>
                        <div className="flex items-center gap-1 mt-1">
                          {agent.last_status === "success" ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : agent.last_status === "failed" ? (
                            <AlertTriangle className="w-4 h-4 text-destructive" />
                          ) : (
                            <Loader2 className="w-4 h-4 text-primary animate-spin" />
                          )}
                          <span
                            className={`text-sm ${
                              agent.last_status === "success"
                                ? "text-green-400"
                                : agent.last_status === "failed"
                                ? "text-destructive"
                                : "text-primary"
                            }`}
                          >
                            {agent.last_status}
                          </span>
                        </div>
                        {agent.last_run_at && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(agent.last_run_at).toLocaleString()}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleRunAgent(agent.agent_slug)}
                      disabled={
                        runningAgents.has(agent.agent_slug) ||
                        agent.status !== "active"
                      }
                    >
                      {runningAgents.has(agent.agent_slug) ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Play className="w-4 h-4 mr-2" />
                      )}
                      Run Now
                    </Button>
                    <Link
                      to={`/agents/activity?tenant_id=${tenantId}&agent_slug=${agent.agent_slug}`}
                    >
                      <Button size="sm" variant="outline">
                        <Activity className="w-4 h-4 mr-2" />
                        View Activity
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Recent Runs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
              Recent Runs
            </h2>
            <div className="rounded-xl border border-border/50 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Agent</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Timestamp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {status.agents
                    .filter((a) => a.last_run_at)
                    .sort(
                      (a, b) =>
                        new Date(b.last_run_at || 0).getTime() -
                        new Date(a.last_run_at || 0).getTime()
                    )
                    .slice(0, 10)
                    .map((agent, idx) => (
                      <TableRow key={`${agent.agent_slug}-${idx}`}>
                        <TableCell className="font-medium">
                          {agent.agent_slug}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              agent.last_status === "success"
                                ? "border-green-500/50 text-green-400"
                                : agent.last_status === "failed"
                                ? "border-destructive/50 text-destructive"
                                : "border-primary/50 text-primary"
                            }
                          >
                            {agent.last_status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {agent.last_run_at
                            ? new Date(agent.last_run_at).toLocaleString()
                            : "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  {status.agents.filter((a) => a.last_run_at).length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        className="text-center text-muted-foreground py-8"
                      >
                        No runs yet. Click "Run Now" to trigger an agent.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </motion.div>

          {/* Footer Links */}
          <div className="mt-12 text-center">
            <Link
              to="/"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Home className="w-4 h-4 inline mr-1" />
              Return Home
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
