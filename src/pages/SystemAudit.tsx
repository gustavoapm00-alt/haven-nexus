import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import type { AuditFormData } from "@/types/audit";

const breakdownOptions = [
  { value: "approvals_stall_decisions", label: "Approvals stall decisions", desc: "Waiting on someone blocks progress" },
  { value: "creates_customer_confusion", label: "Creates customer confusion", desc: "Customers notice delays or inconsistencies" },
  { value: "someone_patches_manually", label: "Someone patches manually", desc: "A team member steps in to fix things" },
  { value: "things_slip_quietly", label: "Things slip quietly", desc: "Work falls through cracks unnoticed" },
  { value: "not_sure", label: "Not sure", desc: "I haven't thought about it this way" },
];

const toolEntropyOptions = [
  { value: "tools_1_2", label: "1–2 tools", desc: "Simple, minimal stack" },
  { value: "tools_3_5", label: "3–5 tools", desc: "Growing complexity" },
  { value: "tools_6_plus", label: "6+ tools", desc: "Significant fragmentation" },
];

const absenceOptions = [
  { value: "things_slip", label: "Things slip", desc: "Work gets delayed or lost" },
  { value: "someone_fills_gaps_manually", label: "Someone fills gaps", desc: "Another person covers" },
  { value: "systems_mostly_hold", label: "Systems mostly hold", desc: "Operations continue reasonably" },
  { value: "not_sure", label: "Not sure", desc: "I haven't tested this" },
];

const volumeOptions = [
  { value: "low_volume_chaotic", label: "Low volume, chaotic", desc: "Few transactions, lots of friction" },
  { value: "steady_weekly", label: "Steady weekly flow", desc: "Predictable recurring workload" },
  { value: "high_throughput", label: "High throughput", desc: "Significant daily volume" },
];

const decisionMakerOptions = [
  { value: true, label: "Yes", desc: "I can approve operational changes" },
  { value: false, label: "No", desc: "I need to involve others" },
];

const TOTAL_STEPS = 3;

export default function SystemAudit() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<AuditFormData>({
    website_url: "",
    name: "",
    email: "",
    decision_maker: null,
    primary_friction: "",
    breakdown_first: "",
    tool_entropy: "",
    absence_test_48h: "",
    operational_volume: "",
    notes: "",
    consent_ack: false,
  });
  const [honeypot, setHoneypot] = useState("");

  const handleSelectOption = (field: keyof AuditFormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateStep = (stepNumber: number): boolean => {
    if (stepNumber === 1) {
      if (!formData.website_url) {
        toast.error("Please enter your website URL");
        return false;
      }
      // Basic URL validation
      try {
        new URL(formData.website_url.startsWith("http") ? formData.website_url : `https://${formData.website_url}`);
      } catch {
        toast.error("Please enter a valid URL");
        return false;
      }
    }
    if (stepNumber === 2) {
      if (!formData.primary_friction) {
        toast.error("Please describe your primary operational friction");
        return false;
      }
      if (!formData.breakdown_first) {
        toast.error("Please select what breaks down first");
        return false;
      }
      if (!formData.tool_entropy) {
        toast.error("Please select your tool count");
        return false;
      }
      if (!formData.absence_test_48h) {
        toast.error("Please answer the 48-hour absence test");
        return false;
      }
      if (!formData.operational_volume) {
        toast.error("Please select your operational volume");
        return false;
      }
    }
    if (stepNumber === 3) {
      if (!formData.consent_ack) {
        toast.error("Please acknowledge to continue");
        return false;
      }
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep((s) => Math.min(s + 1, TOTAL_STEPS));
    }
  };

  const prevStep = () => {
    setStep((s) => Math.max(s - 1, 1));
  };

  const handleSubmit = async () => {
    if (honeypot) {
      toast.error("Submission blocked");
      return;
    }

    if (!validateStep(3)) return;

    setIsSubmitting(true);

    try {
      const auditId = crypto.randomUUID();
      const payload = {
        audit_id: auditId,
        created_at: new Date().toISOString(),
        website_url: formData.website_url.startsWith("http") 
          ? formData.website_url 
          : `https://${formData.website_url}`,
        name: formData.name || undefined,
        email: formData.email || undefined,
        primary_friction: formData.primary_friction,
        breakdown_first: formData.breakdown_first,
        tool_entropy: formData.tool_entropy,
        absence_test_48h: formData.absence_test_48h,
        operational_volume: formData.operational_volume,
        decision_maker: formData.decision_maker ?? false,
        notes: formData.notes || undefined,
        consent_ack: formData.consent_ack,
        context: { source: "lovable", app: "aerelion-auditor", version: "v1" },
      };

      const { data, error } = await supabase.functions.invoke("audit-submit", {
        body: payload,
      });

      if (error) throw error;

      if (data?.audit_id) {
        toast.success("Audit submitted. Generating diagnosis...");
        navigate(`/system-audit/result?audit=${data.audit_id}`);
      } else {
        throw new Error("No audit ID returned");
      }
    } catch (error: any) {
      console.error("Submission error:", error);
      toast.error("Failed to submit audit. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const OptionButton = ({
    selected,
    label,
    desc,
    onClick,
  }: {
    selected: boolean;
    label: string;
    desc: string;
    onClick: () => void;
  }) => (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left p-4 rounded-lg border transition-all duration-200 ${
        selected
          ? "border-primary bg-primary/10 text-foreground"
          : "border-border/50 bg-card/50 hover:border-primary/50 text-muted-foreground hover:text-foreground"
      }`}
    >
      <div className="font-medium">{label}</div>
      <div className="text-sm opacity-70 mt-1">{desc}</div>
    </button>
  );

  const progressPercent = ((step - 1) / (TOTAL_STEPS - 1)) * 100;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO
        title="Run a System Audit | AERELION Labs"
        description="Clarity, control, visibility, reliability. Run a system audit to receive your operational diagnosis."
      />
      <Navbar />

      <main className="pt-28 pb-24">
        <div className="container mx-auto px-6 max-w-2xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10"
          >
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
              Run a System Audit
            </h1>
            <p className="text-muted-foreground text-lg">
              Clarity, control, visibility, reliability.
            </p>
          </motion.div>

          {/* Progress */}
          <div className="mb-8">
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>Step {step} of {TOTAL_STEPS}</span>
              <span>
                {step === 1 && "Business"}
                {step === 2 && "Operational Reality"}
                {step === 3 && "Context + Consent"}
              </span>
            </div>
            <Progress value={progressPercent} className="h-2" />
            <div className="flex justify-between mt-2">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                    s < step
                      ? "bg-primary text-primary-foreground"
                      : s === step
                      ? "bg-primary/20 text-primary border-2 border-primary"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {s < step ? <CheckCircle2 className="w-4 h-4" /> : s}
                </div>
              ))}
            </div>
          </div>

          {/* Honeypot */}
          <input
            type="text"
            name="website_check"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
            className="hidden"
            tabIndex={-1}
            autoComplete="off"
          />

          <AnimatePresence mode="wait">
            {/* Step 1: Business */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="p-6 rounded-xl border border-border/50 bg-card/30 space-y-5">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Website URL <span className="text-destructive">*</span>
                    </label>
                    <Input
                      value={formData.website_url}
                      onChange={(e) => setFormData((prev) => ({ ...prev, website_url: e.target.value }))}
                      placeholder="yourcompany.com"
                    />
                    <p className="text-xs text-muted-foreground mt-1.5">
                      We use this to understand your context.
                    </p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium mb-2">Name (optional)</label>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Email (optional)</label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                        placeholder="you@company.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-3">
                      Are you a decision maker for operational changes?
                    </label>
                    <div className="grid gap-3 md:grid-cols-2">
                      {decisionMakerOptions.map((opt) => (
                        <OptionButton
                          key={String(opt.value)}
                          selected={formData.decision_maker === opt.value}
                          label={opt.label}
                          desc={opt.desc}
                          onClick={() => handleSelectOption("decision_maker", opt.value)}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={nextStep} size="lg">
                    Continue
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 2: Operational Reality */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Primary Friction */}
                <div className="p-6 rounded-xl border border-border/50 bg-card/30 space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Where do you feel the most operational friction? <span className="text-destructive">*</span>
                    </label>
                    <Textarea
                      value={formData.primary_friction}
                      onChange={(e) => setFormData((prev) => ({ ...prev, primary_friction: e.target.value }))}
                      placeholder="Describe the area causing the most friction in your operations..."
                      rows={3}
                    />
                  </div>
                </div>

                {/* Breakdown First */}
                <div className="p-6 rounded-xl border border-border/50 bg-card/30 space-y-4">
                  <label className="block text-sm font-medium">
                    When something goes wrong, what breaks down first? <span className="text-destructive">*</span>
                  </label>
                  <div className="grid gap-3">
                    {breakdownOptions.map((opt) => (
                      <OptionButton
                        key={opt.value}
                        selected={formData.breakdown_first === opt.value}
                        label={opt.label}
                        desc={opt.desc}
                        onClick={() => handleSelectOption("breakdown_first", opt.value)}
                      />
                    ))}
                  </div>
                </div>

                {/* Tool Entropy */}
                <div className="p-6 rounded-xl border border-border/50 bg-card/30 space-y-4">
                  <label className="block text-sm font-medium">
                    How many tools do you use daily? <span className="text-destructive">*</span>
                  </label>
                  <div className="grid gap-3 md:grid-cols-3">
                    {toolEntropyOptions.map((opt) => (
                      <OptionButton
                        key={opt.value}
                        selected={formData.tool_entropy === opt.value}
                        label={opt.label}
                        desc={opt.desc}
                        onClick={() => handleSelectOption("tool_entropy", opt.value)}
                      />
                    ))}
                  </div>
                </div>

                {/* Absence Test */}
                <div className="p-6 rounded-xl border border-border/50 bg-card/30 space-y-4">
                  <label className="block text-sm font-medium">
                    If you disappeared for 48 hours, what happens? <span className="text-destructive">*</span>
                  </label>
                  <div className="grid gap-3 md:grid-cols-2">
                    {absenceOptions.map((opt) => (
                      <OptionButton
                        key={opt.value}
                        selected={formData.absence_test_48h === opt.value}
                        label={opt.label}
                        desc={opt.desc}
                        onClick={() => handleSelectOption("absence_test_48h", opt.value)}
                      />
                    ))}
                  </div>
                </div>

                {/* Operational Volume */}
                <div className="p-6 rounded-xl border border-border/50 bg-card/30 space-y-4">
                  <label className="block text-sm font-medium">
                    How would you describe your operational volume? <span className="text-destructive">*</span>
                  </label>
                  <div className="grid gap-3 md:grid-cols-3">
                    {volumeOptions.map((opt) => (
                      <OptionButton
                        key={opt.value}
                        selected={formData.operational_volume === opt.value}
                        label={opt.label}
                        desc={opt.desc}
                        onClick={() => handleSelectOption("operational_volume", opt.value)}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button variant="ghost" onClick={prevStep}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button onClick={nextStep} size="lg">
                    Continue
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Context + Consent */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Notes */}
                <div className="p-6 rounded-xl border border-border/50 bg-card/30 space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Additional context (optional)
                    </label>
                    <Textarea
                      value={formData.notes}
                      onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                      placeholder="Anything else we should know about your operations..."
                      rows={4}
                    />
                  </div>
                </div>

                {/* Consent */}
                <div className="p-6 rounded-xl border border-primary/30 bg-primary/5">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="consent"
                      checked={formData.consent_ack}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({ ...prev, consent_ack: checked === true }))
                      }
                      className="mt-0.5"
                    />
                    <label htmlFor="consent" className="text-sm cursor-pointer leading-relaxed">
                      I acknowledge and consent to receiving an automated operational diagnosis based on the information provided.
                    </label>
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button variant="ghost" onClick={prevStep}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    size="lg"
                    disabled={isSubmitting}
                    className="min-w-[200px]"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Generate Diagnosis"
                    )}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <Footer />
    </div>
  );
}
