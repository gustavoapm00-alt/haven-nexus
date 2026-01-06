import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Loader2,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Home,
  RefreshCw,
  Link as LinkIcon,
  Cpu,
  Rocket,
} from "lucide-react";
import type { TenantStatusResponse, SetupStep, ConnectorStatus } from "@/types/tenant";

export default function AgentSetup() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tenantId = searchParams.get("tenant_id");
  const auditId = searchParams.get("audit_id");

  const [step, setStep] = useState<SetupStep>("provisioning");
  const [status, setStatus] = useState<TenantStatusResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pollCount, setPollCount] = useState(0);

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

      // Determine step based on status
      const allConnected = result.connectors.every(
        (c: ConnectorStatus) => c.status === "connected"
      );
      const allAgentsActive = result.agents.every(
        (a: any) => a.status === "active"
      );

      if (allAgentsActive) {
        setStep("live");
      } else if (allConnected) {
        setStep("deploy");
      } else if (result.n8n_embed_url) {
        setStep("connect");
      } else {
        setStep("provisioning");
      }
    } catch (err: any) {
      console.error("Status fetch error:", err);
      setError(err.message);
    }
  }, [tenantId]);

  useEffect(() => {
    if (!tenantId) {
      navigate("/system-audit");
      return;
    }

    fetchStatus();
  }, [tenantId, navigate, fetchStatus]);

  // Poll during provisioning and deploy steps
  useEffect(() => {
    if (step === "provisioning" || step === "deploy") {
      const interval = setInterval(() => {
        setPollCount((c) => c + 1);
        fetchStatus();
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [step, fetchStatus]);

  const handleRefresh = () => {
    fetchStatus();
  };

  const progressValue = {
    provisioning: 25,
    connect: 50,
    deploy: 75,
    live: 100,
  };

  const stepLabels = [
    { key: "provisioning", label: "Provisioning" },
    { key: "connect", label: "Connect Tools" },
    { key: "deploy", label: "Deploy Agents" },
    { key: "live", label: "Live" },
  ];

  if (!tenantId) {
    return null;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <SEO title="Setup Error | AERELION" />
        <Navbar />
        <main className="pt-32 pb-24">
          <div className="container mx-auto px-6 max-w-2xl text-center">
            <AlertTriangle className="w-12 h-12 mx-auto text-destructive mb-4" />
            <h2 className="text-2xl font-semibold mb-4">Setup Error</h2>
            <p className="text-muted-foreground mb-8">{error}</p>
            <div className="flex gap-4 justify-center">
              <Button onClick={() => window.location.reload()} variant="outline">
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
      <SEO title="Agent Setup | AERELION" />
      <Navbar />

      <main className="pt-28 pb-24">
        <div className="container mx-auto px-6 max-w-4xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-4">
              Agent Engine Setup
            </h1>
            <p className="text-muted-foreground">
              Your private automation environment is being configured.
            </p>
          </motion.div>

          {/* Progress Steps */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-12"
          >
            <div className="flex justify-between mb-4">
              {stepLabels.map((s, idx) => (
                <div
                  key={s.key}
                  className={`text-sm font-medium ${
                    step === s.key
                      ? "text-primary"
                      : stepLabels.findIndex((x) => x.key === step) > idx
                      ? "text-green-400"
                      : "text-muted-foreground"
                  }`}
                >
                  {s.label}
                </div>
              ))}
            </div>
            <Progress value={progressValue[step]} className="h-2" />
          </motion.div>

          {/* Step Content */}
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {step === "provisioning" && (
              <div className="p-8 rounded-xl border border-border/50 bg-card/30 text-center">
                <Loader2 className="w-12 h-12 mx-auto animate-spin text-primary mb-6" />
                <h2 className="text-xl font-semibold mb-2">
                  Provisioning Your Agent Engine
                </h2>
                <p className="text-muted-foreground mb-4">
                  Setting up isolated infrastructure. This usually takes 30–60 seconds.
                </p>
                <p className="text-sm text-muted-foreground">
                  Poll #{pollCount}
                </p>
              </div>
            )}

            {step === "connect" && status && (
              <>
                <div className="p-6 rounded-xl border border-primary/30 bg-primary/5">
                  <div className="flex items-start gap-4">
                    <LinkIcon className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                    <div>
                      <h2 className="text-lg font-semibold mb-2">
                        Connect Your Tools
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        Connect tools inside your private engine. Credentials are
                        isolated to your workspace.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Connector Checklist */}
                <div className="p-6 rounded-xl border border-border/50 bg-card/30">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                    Required Connectors
                  </h3>
                  <div className="space-y-3">
                    {status.connectors.map((c) => (
                      <div
                        key={c.connector}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                      >
                        <span className="font-medium">{c.connector}</span>
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
                          {c.status === "connected"
                            ? "Connected"
                            : c.status === "error"
                            ? "Error"
                            : "Needs Auth"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                {/* n8n Embed */}
                <div className="rounded-xl border border-border/50 overflow-hidden">
                  <div className="p-4 bg-muted/30 border-b border-border/50">
                    <p className="text-sm text-muted-foreground">
                      Secure connection portal — your credentials never leave your workspace.
                    </p>
                  </div>
                  <div className="aspect-video bg-background">
                    <iframe
                      src={status.n8n_embed_url}
                      className="w-full h-full border-0"
                      title="Connect Tools"
                      sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                    />
                  </div>
                </div>

                <div className="flex justify-center">
                  <Button onClick={handleRefresh} variant="outline" size="lg">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    I've Connected My Tools
                  </Button>
                </div>
              </>
            )}

            {step === "deploy" && status && (
              <div className="p-8 rounded-xl border border-border/50 bg-card/30 text-center">
                <Cpu className="w-12 h-12 mx-auto text-primary mb-6" />
                <h2 className="text-xl font-semibold mb-2">
                  Deploying Agents
                </h2>
                <p className="text-muted-foreground mb-6">
                  Your agents are being deployed to your private engine.
                </p>
                <div className="space-y-3 max-w-md mx-auto text-left">
                  {status.agents.map((a) => (
                    <div
                      key={a.agent_slug}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                    >
                      <span className="font-medium">{a.agent_slug}</span>
                      <Badge
                        variant="outline"
                        className={
                          a.status === "active"
                            ? "border-green-500/50 text-green-400"
                            : a.status === "error"
                            ? "border-destructive/50 text-destructive"
                            : "border-primary/50 text-primary"
                        }
                      >
                        {a.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {step === "live" && (
              <div className="p-8 rounded-xl border border-green-500/30 bg-green-500/5 text-center">
                <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-6" />
                <h2 className="text-2xl font-semibold mb-2">
                  Your Agents Are Live
                </h2>
                <p className="text-muted-foreground mb-8">
                  All systems operational. Your agents are ready to run.
                </p>
                <Button
                  size="lg"
                  onClick={() =>
                    navigate(`/agents/dashboard?tenant_id=${tenantId}`)
                  }
                >
                  Go to Dashboard
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
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
