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
  AlertTriangle,
  RefreshCw,
  Home,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import type { TenantStatusResponse, AgentStatus } from "@/types/tenant";

interface RunRecord {
  run_id: string;
  status: "queued" | "running" | "success" | "failed";
  started_at: string;
  completed_at?: string;
}

export default function AgentActivity() {
  const [searchParams] = useSearchParams();
  const tenantId = searchParams.get("tenant_id");
  const agentSlug = searchParams.get("agent_slug");

  const [agent, setAgent] = useState<AgentStatus | null>(null);
  const [runs, setRuns] = useState<RunRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActivity = useCallback(async () => {
    if (!tenantId || !agentSlug) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/tenant-status?tenant_id=${tenantId}`,
        { headers: { "Content-Type": "application/json" } }
      );

      const result: TenantStatusResponse = await response.json();

      if (!response.ok) {
        throw new Error((result as any).error || "Failed to fetch activity");
      }

      const foundAgent = result.agents.find((a) => a.agent_slug === agentSlug);
      setAgent(foundAgent || null);

      // Mock run records from agent status - in production this would come from a dedicated endpoint
      if (foundAgent?.last_run_at) {
        setRuns([
          {
            run_id: crypto.randomUUID(),
            status: foundAgent.last_status as any || "success",
            started_at: foundAgent.last_run_at,
            completed_at: foundAgent.last_run_at,
          },
        ]);
      } else {
        setRuns([]);
      }

      setLoading(false);
    } catch (err: any) {
      console.error("Activity fetch error:", err);
      setError(err.message);
      setLoading(false);
    }
  }, [tenantId, agentSlug]);

  useEffect(() => {
    fetchActivity();
  }, [fetchActivity]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <SEO title="Loading Activity | AERELION" />
        <Navbar />
        <main className="pt-32 pb-24">
          <div className="container mx-auto px-6 max-w-4xl text-center">
            <Loader2 className="w-12 h-12 mx-auto animate-spin text-primary" />
            <p className="text-muted-foreground mt-4">Loading activity...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <SEO title="Activity Error | AERELION" />
        <Navbar />
        <main className="pt-32 pb-24">
          <div className="container mx-auto px-6 max-w-2xl text-center">
            <AlertTriangle className="w-12 h-12 mx-auto text-destructive mb-4" />
            <h2 className="text-2xl font-semibold mb-4">Activity Error</h2>
            <p className="text-muted-foreground mb-8">{error}</p>
            <div className="flex gap-4 justify-center">
              <Button onClick={fetchActivity} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </Button>
              <Link to={`/agents/dashboard?tenant_id=${tenantId}`}>
                <Button variant="ghost">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "failed":
        return <XCircle className="w-4 h-4 text-destructive" />;
      case "running":
        return <Loader2 className="w-4 h-4 text-primary animate-spin" />;
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO title={`${agentSlug} Activity | AERELION`} />
      <Navbar />

      <main className="pt-28 pb-24">
        <div className="container mx-auto px-6 max-w-4xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Link
              to={`/agents/dashboard?tenant_id=${tenantId}`}
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Dashboard
            </Link>

            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                  {agentSlug}
                </h1>
                {agent && (
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
                )}
              </div>
              <Button onClick={fetchActivity} variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </motion.div>

          {/* Run History */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
              Run History
            </h2>

            {runs.length > 0 ? (
              <div className="rounded-xl border border-border/50 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Run ID</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Started</TableHead>
                      <TableHead>Completed</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {runs.map((run) => (
                      <TableRow key={run.run_id}>
                        <TableCell className="font-mono text-sm">
                          {run.run_id.slice(0, 8)}...
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(run.status)}
                            <Badge
                              variant="outline"
                              className={
                                run.status === "success"
                                  ? "border-green-500/50 text-green-400"
                                  : run.status === "failed"
                                  ? "border-destructive/50 text-destructive"
                                  : "border-primary/50 text-primary"
                              }
                            >
                              {run.status}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(run.started_at).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {run.completed_at
                            ? new Date(run.completed_at).toLocaleString()
                            : "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="p-12 rounded-xl border border-border/50 bg-card/30 text-center">
                <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Runs Yet</h3>
                <p className="text-muted-foreground mb-6">
                  This agent hasn't been run yet. Go to the dashboard to trigger a run.
                </p>
                <Link to={`/agents/dashboard?tenant_id=${tenantId}`}>
                  <Button>Go to Dashboard</Button>
                </Link>
              </div>
            )}
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
