import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  Loader2,
  AlertTriangle,
  ArrowRight,
  Mail,
  RefreshCw,
  Bot,
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
  const [error, setError] = useState<string | null>(null);

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
    if (!audit?.email || !auditId) return;

    setEmailSending(true);
    try {
      const { error } = await supabase.functions.invoke("audit-email", {
        body: { audit_id: auditId, email: audit.email },
      });

      if (error) throw error;
      toast.success("Plan sent to your email.");
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

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <SEO title="Generating Your Plan | AERELION" />
        <Navbar />
        <main className="pt-32 pb-24">
          <div className="container mx-auto px-6 max-w-xl text-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-8"
            >
              <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
              <div className="space-y-3">
                <h2 className="text-2xl font-semibold tracking-tight">
                  Building your system plan
                </h2>
                <p className="text-muted-foreground text-lg">
                  Analyzing patterns and designing your agent engine.
                </p>
              </div>
              <Progress value={polling ? 60 : 20} className="h-1 max-w-xs mx-auto" />
            </motion.div>
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
            <h2 className="text-2xl font-semibold mb-4">Something went wrong</h2>
            <p className="text-muted-foreground mb-8">{error}</p>
            <div className="flex gap-4 justify-center">
              <Button onClick={handleRetry} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </Button>
              <Button onClick={() => navigate("/system-audit")}>
                Start Over
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Not found state
  if (!diagnosis || !audit) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <SEO title="Not Found | AERELION" />
        <Navbar />
        <main className="pt-32 pb-24">
          <div className="container mx-auto px-6 max-w-xl text-center">
            <AlertTriangle className="w-12 h-12 mx-auto text-destructive mb-6" />
            <h2 className="text-2xl font-semibold mb-4">Plan Not Found</h2>
            <p className="text-muted-foreground mb-8">
              This link may be invalid or expired.
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

  const agents = diagnosis.recommended_agents || [];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO
        title="Your System Plan | AERELION"
        description="Your personalized automation plan based on your business operations."
      />
      <Navbar />

      <main className="pt-32 pb-24">
        <div className="container mx-auto px-6 max-w-3xl">
          
          {/* SECTION 1: Header */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-20"
          >
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Your System Plan
            </h1>
            <p className="text-lg text-muted-foreground">
              Based on your business and how you spend your time.
            </p>
          </motion.section>

          {/* SECTION 2: The Leak */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-20"
          >
            <div className="text-center">
              <p className="text-6xl md:text-7xl font-bold tracking-tight mb-6">
                <span className="text-destructive">
                  {diagnosis.leak_hours_low}–{diagnosis.leak_hours_high}
                </span>
                <span className="text-2xl md:text-3xl font-normal text-muted-foreground ml-3">
                  hrs/week
                </span>
              </p>
              <p className="text-lg text-muted-foreground max-w-lg mx-auto">
                This isn't because you're inefficient. It's because your system breaks under scale.
              </p>
            </div>
          </motion.section>

          {/* SECTION 3: Root Cause */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-20"
          >
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
              What's actually happening
            </h2>
            <p className="text-xl leading-relaxed text-foreground">
              {diagnosis.plain_language_cause}
            </p>
          </motion.section>

          {/* SECTION 4: Your Agent Engine */}
          {agents.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-24"
            >
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-6">
                Your Agent Engine
              </h2>
              <div className="grid gap-4">
                {agents.slice(0, 5).map((agent: AgentPack, index: number) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 + index * 0.05 }}
                    className="p-6 rounded-xl border border-border/50 bg-card/30 hover:bg-card/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Bot className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg mb-1">
                            {agent.agent_name}
                          </h3>
                          <p className="text-muted-foreground">
                            {agent.purpose}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full whitespace-nowrap">
                        Runs automatically
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          )}

          {/* SECTION 5: ONE CTA */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-center"
          >
            <Link
              to={`/agents/activate?audit=${auditId}&name=${encodeURIComponent(audit.name || "")}&email=${encodeURIComponent(audit.email || "")}`}
            >
              <Button size="lg" className="text-lg px-10 py-6 h-auto">
                Activate My Agent Engine
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            
            <div className="mt-6">
              <button
                onClick={handleEmailResults}
                disabled={emailSending}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-2"
              >
                {emailSending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Mail className="w-4 h-4" />
                )}
                Email me this plan
              </button>
            </div>
          </motion.section>

        </div>
      </main>

      <Footer />
    </div>
  );
}
