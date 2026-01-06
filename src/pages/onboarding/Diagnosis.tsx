import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, AlertTriangle, Loader2, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Failure mode descriptions
const failureModeDescriptions: Record<string, string> = {
  approvals_stall_decisions: "Decisions pile up waiting for approval, creating bottlenecks that ripple through your entire operation.",
  creates_customer_confusion: "Your customers experience inconsistency because there's no reliable system handling their journey.",
  someone_patches_manually: "You or someone on your team is constantly firefighting—manually fixing what should run automatically.",
  things_slip_quietly: "Important tasks fall through the cracks without anyone noticing until it's too late.",
};

// Hour loss calculations
const calculateHourLoss = (answers: Record<string, string>) => {
  let base = 10;
  
  if (answers.tool_entropy === "tools_6_plus") base += 8;
  else if (answers.tool_entropy === "tools_3_5") base += 4;
  
  if (answers.absence_test_48h === "things_slip") base += 6;
  else if (answers.absence_test_48h === "someone_fills_gaps_manually") base += 3;
  
  if (answers.operational_volume === "high_throughput") base += 5;
  else if (answers.operational_volume === "steady_weekly") base += 2;

  const low = Math.max(8, base - 3);
  const high = base + 5;
  
  return { low, high };
};

export default function Diagnosis() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [websiteUrl, setWebsiteUrl] = useState("");

  useEffect(() => {
    const storedAnswers = sessionStorage.getItem("onboarding_answers");
    const storedWebsite = sessionStorage.getItem("onboarding_website");

    if (!storedAnswers) {
      navigate("/start");
      return;
    }

    setAnswers(JSON.parse(storedAnswers));
    setWebsiteUrl(storedWebsite || "");
    
    // Simulate brief analysis delay
    setTimeout(() => setLoading(false), 1500);
  }, [navigate]);

  const handleContinue = async () => {
    setSubmitting(true);

    try {
      const auditId = crypto.randomUUID();
      const hourLoss = calculateHourLoss(answers);

      const payload = {
        audit_id: auditId,
        created_at: new Date().toISOString(),
        website_url: websiteUrl || undefined,
        primary_friction: answers.primary_friction,
        breakdown_first: answers.breakdown_first,
        tool_entropy: answers.tool_entropy,
        absence_test_48h: answers.absence_test_48h,
        operational_volume: answers.operational_volume,
        decision_maker: answers.decision_maker === "yes",
        consent_ack: true,
        context: { source: "onboarding-v2", app: "aerelion", version: "v2" },
      };

      const { data, error } = await supabase.functions.invoke("audit-submit", {
        body: payload,
      });

      if (error) throw error;

      // Store diagnosis context for next page
      sessionStorage.setItem("diagnosis_audit_id", data.audit_id || auditId);
      sessionStorage.setItem("diagnosis_hour_loss", JSON.stringify(hourLoss));
      sessionStorage.setItem("diagnosis_failure_mode", answers.breakdown_first);
      
      navigate("/analysis/architecture");
    } catch (err: any) {
      console.error("Submission error:", err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <SEO title="Analyzing | AERELION" />
        <Navbar />
        <main className="pt-32 pb-24">
          <div className="container mx-auto px-6 max-w-xl text-center">
            <Loader2 className="w-12 h-12 mx-auto animate-spin text-primary mb-6" />
            <h2 className="text-xl font-semibold mb-2">Generating Your Diagnosis</h2>
            <p className="text-muted-foreground">Analyzing patterns in your responses...</p>
            <Progress value={60} className="h-1 max-w-xs mx-auto mt-6" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const hourLoss = calculateHourLoss(answers);
  const failureMode = answers.breakdown_first;
  const failureDescription = failureModeDescriptions[failureMode] || 
    "Your operations lack the systems needed to run without constant intervention.";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO title="Your Diagnosis | AERELION" />
      <Navbar />

      <main className="pt-28 pb-24">
        <div className="container mx-auto px-6 max-w-3xl">
          
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <div className="w-14 h-14 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
              <Eye className="w-7 h-7 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
              System Diagnosis
            </h1>
            <p className="text-lg text-muted-foreground">
              Here's what we observed about your operations.
            </p>
          </motion.div>

          {/* What We Observed */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-12"
          >
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
              What We Observed
            </h2>
            <p className="text-xl leading-relaxed">
              Based on your inputs, your business runs on <span className="text-primary font-medium">
              {answers.tool_entropy === "tools_6_plus" ? "6+ disconnected tools" : 
               answers.tool_entropy === "tools_3_5" ? "3–5 tools with growing complexity" : "a simple toolset"}
              </span>. When you're absent, <span className="text-primary font-medium">
              {answers.absence_test_48h === "things_slip" ? "work slips through the cracks" :
               answers.absence_test_48h === "someone_fills_gaps_manually" ? "someone has to manually fill gaps" :
               "systems mostly hold"}</span>.
            </p>
          </motion.section>

          {/* Primary Constraint */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-12 p-6 rounded-xl border border-destructive/30 bg-destructive/5"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-wider text-destructive mb-2">
                  Primary Constraint
                </h2>
                <p className="text-lg leading-relaxed">
                  {failureDescription}
                </p>
              </div>
            </div>
          </motion.section>

          {/* Impact */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-16"
          >
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
              Impact
            </h2>
            <div className="text-center py-8">
              <p className="text-6xl md:text-7xl font-bold tracking-tight">
                <span className="text-destructive">{hourLoss.low}–{hourLoss.high}</span>
                <span className="text-2xl md:text-3xl font-normal text-muted-foreground ml-3">
                  hrs/week
                </span>
              </p>
              <p className="text-muted-foreground mt-4 max-w-md mx-auto">
                This is time you're losing to manual work, coordination overhead, and system gaps.
              </p>
            </div>
          </motion.section>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-center"
          >
            <Button
              onClick={handleContinue}
              size="lg"
              className="text-lg px-10 py-6 h-auto"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  See Your Agent Architecture
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
          </motion.div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
