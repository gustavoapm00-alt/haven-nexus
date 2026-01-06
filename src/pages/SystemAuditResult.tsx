import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ActivateAgentsModal } from "@/components/ActivateAgentsModal";
import {
  Loader2,
  Clock,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Mail,
  RefreshCw,
  Shield,
  Zap,
  Settings,
  TrendingUp,
  Cpu,
} from "lucide-react";
import type { DiagnosisData, AuditData, AgentPack } from "@/types/audit";

export default function SystemAuditResult() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const auditId = searchParams.get("audit");

  const [loading, setLoading] = useState(true);
  const [polling, setPolling] = useState(false);
  const [audit, setAudit] = useState<AuditData | null>(null);
  const [diagnosis, setDiagnosis] = useState<DiagnosisData | null>(null);
  const [emailSending, setEmailSending] = useState(false);
  const [emailPrompt, setEmailPrompt] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [activateModalOpen, setActivateModalOpen] = useState(false);

  useEffect(() => {
    if (!auditId) {
      navigate("/system-audit");
      return;
    }

    let pollCount = 0;
    const maxPolls = 12;

    const fetchResult = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/audit-result?audit=${auditId}`,
          {
            headers: { "Content-Type": "application/json" },
          }
        );

        const result = await response.json();

        if (result.error) {
          throw new Error(result.error);
        }

        if (result.status === "processing") {
          setPolling(true);
          pollCount++;
          if (pollCount < maxPolls) {
            setTimeout(fetchResult, 2000);
          } else {
            setError("Diagnosis is taking longer than expected. Please refresh the page.");
            setLoading(false);
          }
          return;
        }

        setAudit(result.audit);
        setDiagnosis(result.diagnosis);
        setLoading(false);
        setPolling(false);
      } catch (err: any) {
        console.error("Error fetching result:", err);
        setError(err.message || "Failed to load diagnosis");
        setLoading(false);
      }
    };

    fetchResult();
  }, [auditId, navigate]);

  const handleEmailResults = async () => {
    const emailToUse = audit?.email || emailInput;
    
    if (!emailToUse) {
      setEmailPrompt(true);
      return;
    }

    if (!auditId) return;

    setEmailSending(true);
    try {
      const { error } = await supabase.functions.invoke("audit-email", {
        body: { audit_id: auditId, email: emailToUse },
      });

      if (error) throw error;

      toast.success("Diagnosis link sent to your email.");
      setEmailPrompt(false);
    } catch (err: any) {
      console.error("Email error:", err);
      toast.error("Failed to send email. Please try again.");
    } finally {
      setEmailSending(false);
    }
  };

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <SEO title="Generating Diagnosis | AERELION Labs" />
        <Navbar />
        <main className="pt-32 pb-24">
          <div className="container mx-auto px-6 max-w-2xl text-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <Loader2 className="w-12 h-12 mx-auto animate-spin text-primary" />
              <h2 className="text-2xl font-semibold">
                {polling ? "Generating your diagnosis..." : "Loading..."}
              </h2>
              <p className="text-muted-foreground">
                Analyzing operational signals and mapping system recommendations.
              </p>
              <div className="max-w-xs mx-auto">
                <Progress value={polling ? 60 : 20} className="h-1" />
              </div>
            </motion.div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <SEO title="Error | AERELION Labs" />
        <Navbar />
        <main className="pt-32 pb-24">
          <div className="container mx-auto px-6 max-w-2xl text-center">
            <AlertTriangle className="w-12 h-12 mx-auto text-destructive mb-4" />
            <h2 className="text-2xl font-semibold mb-4">Something went wrong</h2>
            <p className="text-muted-foreground mb-8">{error}</p>
            <div className="flex gap-4 justify-center">
              <Button onClick={handleRetry} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </Button>
              <Button onClick={() => navigate("/system-audit")}>
                Run New Audit
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!diagnosis || !audit) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <SEO title="Not Found | AERELION Labs" />
        <Navbar />
        <main className="pt-32 pb-24">
          <div className="container mx-auto px-6 max-w-2xl text-center">
            <AlertTriangle className="w-12 h-12 mx-auto text-destructive mb-4" />
            <h2 className="text-2xl font-semibold mb-4">Diagnosis Not Found</h2>
            <p className="text-muted-foreground mb-8">
              We couldn't find this audit result. The link may be invalid or expired.
            </p>
            <Button onClick={() => navigate("/system-audit")}>
              Run a New Audit
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const readinessBadge = {
    low: { color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30", label: "Low Readiness" },
    medium: { color: "bg-blue-500/20 text-blue-400 border-blue-500/30", label: "Medium Readiness" },
    high: { color: "bg-green-500/20 text-green-400 border-green-500/30", label: "High Readiness" },
  };

  const badge = readinessBadge[diagnosis.readiness_level] || readinessBadge.medium;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO
        title="Your System Diagnosis | AERELION Labs"
        description="Your operational diagnosis and recommended system path."
      />
      <Navbar />

      <main className="pt-28 pb-24">
        <div className="container mx-auto px-6 max-w-4xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <CheckCircle className="w-4 h-4" />
              Diagnosis Complete
            </div>
            
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-4">
              {diagnosis.primary_failure_mode}
            </h1>
            
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${badge.color}`}>
              {badge.label}
            </div>
            
            {audit.name && (
              <p className="text-muted-foreground mt-4">
                For {audit.name} • {new Date(audit.created_at).toLocaleDateString()}
              </p>
            )}
          </motion.div>

          {/* Stats Row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid md:grid-cols-2 gap-6 mb-8"
          >
            {/* Leak Hours */}
            <div className="p-6 rounded-xl border border-destructive/30 bg-destructive/5">
              <div className="flex items-start gap-4">
                <Clock className="w-6 h-6 text-destructive flex-shrink-0 mt-1" />
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Estimated Time Leaking</p>
                  <p className="text-3xl font-bold text-destructive">
                    {diagnosis.leak_hours_low}–{diagnosis.leak_hours_high} <span className="text-lg font-normal">hrs/week</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Recovered Hours */}
            <div className="p-6 rounded-xl border border-green-500/30 bg-green-500/5">
              <div className="flex items-start gap-4">
                <TrendingUp className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Estimated Time Recovered</p>
                  <p className="text-3xl font-bold text-green-500">
                    {diagnosis.recovered_hours_low}–{diagnosis.recovered_hours_high} <span className="text-lg font-normal">hrs/week</span>
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Plain Language Cause */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="p-6 rounded-xl border border-border/50 bg-card/30 mb-8"
          >
            <h2 className="text-lg font-semibold mb-3">Plain-Language Cause</h2>
            <p className="text-foreground leading-relaxed">{diagnosis.plain_language_cause}</p>
          </motion.div>

          {/* What Is Happening */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-6 rounded-xl border border-border/50 bg-card/30 mb-8"
          >
            <h2 className="text-lg font-semibold mb-3">What Is Happening</h2>
            <p className="text-foreground leading-relaxed">{diagnosis.what_is_happening}</p>
          </motion.div>

          {/* Recommended Systems */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="mb-8"
          >
            <h2 className="text-lg font-semibold mb-4">Recommended Systems</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {diagnosis.recommended_systems.map((system, index) => {
                const isReliability = system.name.toLowerCase().includes("reliability");
                return (
                  <div
                    key={index}
                    className={`p-5 rounded-xl border ${
                      isReliability
                        ? "border-primary/50 bg-primary/5"
                        : "border-border/50 bg-card/30"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        isReliability ? "bg-primary/20" : "bg-muted"
                      }`}>
                        {isReliability ? (
                          <Shield className="w-5 h-5 text-primary" />
                        ) : index === 0 ? (
                          <Zap className="w-5 h-5 text-muted-foreground" />
                        ) : (
                          <Settings className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">{system.name}</h3>
                        <p className="text-sm text-muted-foreground">{system.description}</p>
                      </div>
                    </div>
                    {isReliability && (
                      <Badge variant="outline" className="mt-3 text-xs">
                        Core Infrastructure
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Recommended Agent Pack */}
          {diagnosis.recommended_agents && diagnosis.recommended_agents.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-8"
            >
              <h2 className="text-lg font-semibold mb-4">Recommended Agent Pack</h2>
              <div className="grid gap-4">
                {diagnosis.recommended_agents.map((agent: AgentPack, index: number) => (
                  <div
                    key={index}
                    className="p-5 rounded-xl border border-border/50 bg-card/30"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-semibold">{agent.agent_name}</h3>
                      <Badge
                        variant="outline"
                        className={
                          agent.deployment_complexity === "low"
                            ? "border-green-500/50 text-green-400"
                            : agent.deployment_complexity === "medium"
                            ? "border-yellow-500/50 text-yellow-400"
                            : "border-red-500/50 text-red-400"
                        }
                      >
                        {agent.deployment_complexity} complexity
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">{agent.purpose}</p>
                    <div className="grid md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="font-medium mb-1">Inputs</p>
                        <ul className="text-muted-foreground space-y-0.5">
                          {agent.inputs.map((input, i) => (
                            <li key={i}>• {input}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="font-medium mb-1">Automations</p>
                        <ul className="text-muted-foreground space-y-0.5">
                          {agent.automations.map((auto, i) => (
                            <li key={i}>• {auto}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="font-medium mb-1">Success Metric</p>
                        <p className="text-muted-foreground">{agent.success_metric}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Equation */}
          {diagnosis.equation && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="p-6 rounded-xl border border-border/50 bg-muted/30 mb-8"
            >
              <h2 className="text-lg font-semibold mb-3">Equation</h2>
              <pre className="font-mono text-sm bg-background/50 p-4 rounded-lg overflow-x-auto whitespace-pre-wrap">
                {diagnosis.equation}
              </pre>
            </motion.div>
          )}

          {/* Confidence Meter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="p-6 rounded-xl border border-border/50 bg-card/30 mb-8"
          >
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-semibold">Confidence</h2>
              <span className="text-2xl font-bold">{diagnosis.confidence}%</span>
            </div>
            <Progress value={diagnosis.confidence} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2">
              Confidence is based on signal clarity. Higher values indicate stronger pattern match.
            </p>
          </motion.div>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="space-y-6"
          >
            {/* Primary CTA: Activate Agents */}
            {diagnosis.recommended_agents && diagnosis.recommended_agents.length > 0 && (
              <div className="p-8 rounded-xl border border-primary/50 bg-gradient-to-br from-primary/10 to-primary/5 text-center">
                <Cpu className="w-10 h-10 mx-auto text-primary mb-4" />
                <h2 className="text-xl font-semibold mb-3">Activate Your Agents</h2>
                <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
                  Provision your private agent engine and start automating today.
                </p>
                <Button 
                  size="lg" 
                  className="min-w-[240px]"
                  onClick={() => setActivateModalOpen(true)}
                >
                  <Cpu className="w-4 h-4 mr-2" />
                  Activate Agents
                </Button>
              </div>
            )}

            {/* Secondary CTA: Request Deployment */}
            <div className="p-8 rounded-xl border border-border/50 bg-card/30 text-center">
              <h2 className="text-lg font-semibold mb-3">Prefer a managed deployment?</h2>
              <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
                We review your diagnosis and confirm fit before any build begins.
              </p>
              <Link
                to={`/request-deployment?audit=${audit.id}&diagnosis=${diagnosis.id}&name=${encodeURIComponent(audit.name || "")}&email=${encodeURIComponent(audit.email || "")}`}
              >
                <Button size="lg" variant="outline" className="min-w-[240px]">
                  Request Deployment
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>

            {/* Email Prompt */}
            {emailPrompt && !audit.email && (
              <div className="p-6 rounded-xl border border-border/50 bg-card/30">
                <p className="text-sm text-muted-foreground mb-3">
                  Enter your email to receive this diagnosis:
                </p>
                <div className="flex gap-3">
                  <Input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="you@company.com"
                    className="flex-1"
                  />
                  <Button onClick={handleEmailResults} disabled={emailSending || !emailInput}>
                    {emailSending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send"}
                  </Button>
                </div>
              </div>
            )}

            {/* Secondary CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="outline"
                onClick={handleEmailResults}
                disabled={emailSending}
              >
                {emailSending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Mail className="w-4 h-4 mr-2" />
                )}
                Email me this
              </Button>
              <Link to="/system-audit">
                <Button variant="ghost">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Run another audit
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Disclaimer */}
          {diagnosis.disclaimer && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-12 p-4 rounded-lg bg-muted/30 text-center"
            >
              <p className="text-xs text-muted-foreground">{diagnosis.disclaimer}</p>
            </motion.div>
          )}
        </div>
      </main>

      <Footer />

      {/* Activate Agents Modal */}
      <ActivateAgentsModal
        open={activateModalOpen}
        onOpenChange={setActivateModalOpen}
        auditId={auditId || ""}
        defaultName={audit?.name}
        defaultEmail={audit?.email}
      />
    </div>
  );
}
