import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Clock, AlertTriangle, CheckCircle, ArrowRight, Mail, RefreshCw } from "lucide-react";

type DiagnosisData = {
  id: string;
  leak_hours_low: number;
  leak_hours_high: number;
  recovered_hours_low: number;
  recovered_hours_high: number;
  primary_failure_mode: string;
  plain_language_cause: string;
  what_is_happening: string;
  recommended_systems: Array<{ name: string; description: string }>;
  readiness_level: string;
  next_step: string;
  confidence: number;
  disclaimer: string;
};

type AuditData = {
  id: string;
  name: string;
  email: string;
  primary_friction: string;
  created_at: string;
};

export default function SystemAuditResult() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const auditId = searchParams.get("audit");

  const [loading, setLoading] = useState(true);
  const [polling, setPolling] = useState(false);
  const [audit, setAudit] = useState<AuditData | null>(null);
  const [diagnosis, setDiagnosis] = useState<DiagnosisData | null>(null);
  const [emailSending, setEmailSending] = useState(false);

  useEffect(() => {
    if (!auditId) {
      navigate("/system-audit");
      return;
    }

    let pollCount = 0;
    const maxPolls = 8; // 15 seconds max polling

    const fetchResult = async () => {
      try {
        const { data, error } = await supabase.functions.invoke("audit-result", {
          body: {},
          method: "GET",
          headers: {},
        });

        // Use URL params since we're doing GET
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/audit-result?audit=${auditId}`,
          {
            headers: {
              "Content-Type": "application/json",
            },
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
            toast.error("Diagnosis is taking longer than expected. Please refresh.");
            setLoading(false);
          }
          return;
        }

        setAudit(result.audit);
        setDiagnosis(result.diagnosis);
        setLoading(false);
        setPolling(false);
      } catch (error: any) {
        console.error("Error fetching result:", error);
        toast.error("Failed to load diagnosis");
        setLoading(false);
      }
    };

    fetchResult();
  }, [auditId, navigate]);

  const handleEmailResults = async () => {
    if (!auditId) return;

    setEmailSending(true);
    try {
      const { data, error } = await supabase.functions.invoke("audit-email", {
        body: { audit_id: auditId },
      });

      if (error) throw error;

      toast.success("Your diagnosis link has been saved. Bookmark this page to return anytime.");
    } catch (error: any) {
      console.error("Email error:", error);
      toast.error("Failed to process request");
    } finally {
      setEmailSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <SEO title="Loading Diagnosis | AERELION Systems" />
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
                Analyzing your operational signals and mapping system recommendations.
              </p>
            </motion.div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!diagnosis || !audit) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <SEO title="Diagnosis Not Found | AERELION Systems" />
        <Navbar />
        <main className="pt-32 pb-24">
          <div className="container mx-auto px-6 max-w-2xl text-center">
            <AlertTriangle className="w-12 h-12 mx-auto text-destructive mb-4" />
            <h2 className="text-2xl font-semibold mb-4">Diagnosis Not Found</h2>
            <p className="text-muted-foreground mb-8">
              We couldn't find this audit result. It may have expired or the link is invalid.
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

  const readinessColors = {
    low: "text-yellow-500",
    medium: "text-blue-500",
    high: "text-green-500",
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO
        title="System Diagnosis | AERELION Systems"
        description="Your operational diagnosis and recommended system path."
      />
      <Navbar />

      <main className="pt-32 pb-24">
        <div className="container mx-auto px-6 max-w-3xl">
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
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              We've identified exactly where your operations are stuck.
            </h1>
            <p className="text-muted-foreground">
              For {audit.name} • Submitted {new Date(audit.created_at).toLocaleDateString()}
            </p>
          </motion.div>

          {/* Time Leak Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-8 rounded-2xl border border-destructive/30 bg-destructive/5 mb-8"
          >
            <div className="flex items-start gap-4">
              <Clock className="w-8 h-8 text-destructive flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-xl font-semibold mb-2">Estimated Time Leaking</h2>
                <p className="text-4xl font-bold text-destructive mb-2">
                  {diagnosis.leak_hours_low}–{diagnosis.leak_hours_high} hours/week
                </p>
                <p className="text-muted-foreground">
                  Based on your tool count, absence test, and operational volume.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Primary Failure Mode */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-8 rounded-2xl border border-border/50 bg-card/30 mb-8"
          >
            <h2 className="text-xl font-semibold mb-4">Primary Failure Mode</h2>
            <p className="text-2xl font-medium text-foreground mb-6">
              "{diagnosis.primary_failure_mode}"
            </p>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">
                  What's Happening
                </h3>
                <p className="text-foreground">{diagnosis.what_is_happening}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">
                  Root Cause
                </h3>
                <p className="text-foreground">{diagnosis.plain_language_cause}</p>
              </div>
            </div>
          </motion.div>

          {/* Recommended Systems */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-8 rounded-2xl border border-primary/30 bg-primary/5 mb-8"
          >
            <h2 className="text-xl font-semibold mb-6">Recommended System Path</h2>
            <div className="space-y-4">
              {diagnosis.recommended_systems.map((system, index) => (
                <div
                  key={index}
                  className="p-4 rounded-lg bg-background/50 border border-border/50"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center flex-shrink-0 text-sm font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="font-semibold">{system.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {system.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Recovered Hours */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="p-8 rounded-2xl border border-green-500/30 bg-green-500/5 mb-8"
          >
            <div className="flex items-start gap-4">
              <CheckCircle className="w-8 h-8 text-green-500 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-xl font-semibold mb-2">Estimated Time Recovered</h2>
                <p className="text-4xl font-bold text-green-500 mb-2">
                  {diagnosis.recovered_hours_low}–{diagnosis.recovered_hours_high} hours/week
                </p>
                <p className="text-muted-foreground text-sm">
                  Estimated based on system implementation. Individual results vary.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Readiness Level */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="p-6 rounded-xl border border-border/50 bg-card/30 mb-8"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  Deployment Readiness
                </h3>
                <p className={`text-lg font-semibold capitalize ${readinessColors[diagnosis.readiness_level as keyof typeof readinessColors] || "text-muted-foreground"}`}>
                  {diagnosis.readiness_level}
                </p>
              </div>
              <div className="text-right">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  Confidence
                </h3>
                <p className="text-lg font-semibold">{diagnosis.confidence}%</p>
              </div>
            </div>
          </motion.div>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-4"
          >
            {/* Primary CTA */}
            <div className="p-8 rounded-2xl border border-border/50 bg-card/30 text-center">
              <h2 className="text-xl font-semibold mb-3">Ready to move forward?</h2>
              <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
                We review your audit and confirm fit before any build begins.
              </p>
              <Link
                to={`/request-deployment?audit=${audit.id}&diagnosis=${diagnosis.id}&name=${encodeURIComponent(audit.name)}&email=${encodeURIComponent(audit.email)}`}
              >
                <Button size="lg" className="min-w-[280px]">
                  Request System Deployment
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>

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
                Email me this diagnosis
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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-12 p-4 rounded-lg bg-muted/30 text-center"
          >
            <p className="text-xs text-muted-foreground">
              {diagnosis.disclaimer}
            </p>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}