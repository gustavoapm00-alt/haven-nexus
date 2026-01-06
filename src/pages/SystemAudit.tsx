import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import ScrollReveal from "@/components/ScrollReveal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

type FormData = {
  name: string;
  email: string;
  primary_friction: string;
  breakdown_first: string;
  tool_entropy: string;
  absence_test_48h: string;
  operational_volume: string;
  decision_maker: boolean | null;
  notes: string;
  consent_ack: boolean;
};

const frictionOptions = [
  { value: "leads_followup", label: "Leads & Follow-up", desc: "Inbound leads, outreach, or follow-up sequences" },
  { value: "fulfillment", label: "Fulfillment & Delivery", desc: "Orders, projects, or service delivery" },
  { value: "customer_support", label: "Customer Support", desc: "Tickets, requests, or status updates" },
  { value: "internal_ops", label: "Internal Operations", desc: "Task management, approvals, or coordination" },
  { value: "reporting_visibility", label: "Reporting & Visibility", desc: "Dashboards, metrics, or decision support" },
  { value: "tool_chaos", label: "Tool Chaos", desc: "Too many disconnected tools creating friction" },
  { value: "other", label: "Other", desc: "Something else entirely" },
];

const breakdownOptions = [
  { value: "things_slip_quietly", label: "Things slip quietly", desc: "Work falls through cracks without anyone noticing" },
  { value: "someone_patches_manually", label: "Someone patches manually", desc: "A team member has to step in and fix things" },
  { value: "approvals_stall_decisions", label: "Approvals stall decisions", desc: "Waiting on someone blocks progress" },
  { value: "creates_customer_confusion", label: "Creates customer confusion", desc: "Customers notice delays or inconsistencies" },
  { value: "not_sure", label: "Not sure", desc: "I haven't thought about it this way" },
];

const toolEntropyOptions = [
  { value: "tools_1_2", label: "1-2 tools", desc: "Simple, minimal stack" },
  { value: "tools_3_5", label: "3-5 tools", desc: "Growing complexity" },
  { value: "tools_6_plus", label: "6+ tools", desc: "Significant fragmentation" },
];

const absenceOptions = [
  { value: "things_slip", label: "Things slip", desc: "Work gets delayed or lost" },
  { value: "someone_fills_gaps_manually", label: "Someone fills gaps manually", desc: "Another person has to cover" },
  { value: "systems_mostly_hold", label: "Systems mostly hold", desc: "Operations continue reasonably well" },
  { value: "not_sure", label: "Not sure", desc: "I haven't tested this" },
];

const volumeOptions = [
  { value: "low_volume_chaotic", label: "Low volume but chaotic", desc: "Few transactions, lots of friction" },
  { value: "steady_weekly", label: "Steady weekly flow", desc: "Predictable recurring workload" },
  { value: "high_throughput", label: "High throughput", desc: "Significant daily transaction volume" },
];

const decisionMakerOptions = [
  { value: true, label: "Yes", desc: "I can approve operational changes" },
  { value: false, label: "No", desc: "I need to involve others" },
];

export default function SystemAudit() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    primary_friction: "",
    breakdown_first: "",
    tool_entropy: "",
    absence_test_48h: "",
    operational_volume: "",
    decision_maker: null,
    notes: "",
    consent_ack: false,
  });

  // Honeypot field
  const [honeypot, setHoneypot] = useState("");

  const handleSelectOption = (field: keyof FormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Anti-spam: honeypot check
    if (honeypot) {
      toast.error("Submission blocked");
      return;
    }

    // Validate required fields
    if (!formData.name || !formData.email) {
      toast.error("Please enter your name and email");
      return;
    }

    if (!formData.primary_friction) {
      toast.error("Please select your primary friction area");
      return;
    }

    if (!formData.breakdown_first) {
      toast.error("Please select what breaks down first");
      return;
    }

    if (!formData.tool_entropy) {
      toast.error("Please select your tool count");
      return;
    }

    if (!formData.absence_test_48h) {
      toast.error("Please answer the 48-hour absence test");
      return;
    }

    if (!formData.operational_volume) {
      toast.error("Please select your operational volume");
      return;
    }

    if (formData.decision_maker === null) {
      toast.error("Please indicate if you're a decision maker");
      return;
    }

    if (!formData.consent_ack) {
      toast.error("Please acknowledge the trust gate to continue");
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.functions.invoke("audit-submit", {
        body: formData,
      });

      if (error) throw error;

      if (data?.audit_id) {
        toast.success("Audit submitted. Generating your diagnosis...");
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
          : "border-border/50 bg-background/50 hover:border-primary/50 text-muted-foreground hover:text-foreground"
      }`}
    >
      <div className="font-medium">{label}</div>
      <div className="text-sm opacity-70 mt-1">{desc}</div>
    </button>
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO
        title="System Audit | AERELION Systems"
        description="Run a system audit to identify operational friction and receive a clear diagnosis with recommended systems."
      />
      <Navbar />

      <main className="pt-32 pb-24">
        <div className="container mx-auto px-6 max-w-2xl">
          <ScrollReveal>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                SYSTEM AUDIT
              </h1>
              <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                Answer six questions. We'll return a diagnosis and system path.
                No hype. No promises. Just operational truth.
              </p>
            </motion.div>
          </ScrollReveal>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Honeypot - hidden from users */}
            <input
              type="text"
              name="website"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              className="hidden"
              tabIndex={-1}
              autoComplete="off"
            />

            {/* Name & Email */}
            <ScrollReveal delay={0.1}>
              <div className="space-y-4 p-6 rounded-xl border border-border/50 bg-card/30">
                <h3 className="text-lg font-semibold">Contact Information</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium mb-2">Name *</label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="Your name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Email *</label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                      placeholder="you@company.com"
                      required
                    />
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* Question 1: Primary Friction */}
            <ScrollReveal delay={0.15}>
              <div className="space-y-4 p-6 rounded-xl border border-border/50 bg-card/30">
                <h3 className="text-lg font-semibold">
                  1. Where do you feel the most operational friction?
                </h3>
                <div className="grid gap-3">
                  {frictionOptions.map((opt) => (
                    <OptionButton
                      key={opt.value}
                      selected={formData.primary_friction === opt.value}
                      label={opt.label}
                      desc={opt.desc}
                      onClick={() => handleSelectOption("primary_friction", opt.value)}
                    />
                  ))}
                </div>
              </div>
            </ScrollReveal>

            {/* Question 2: Breakdown First */}
            <ScrollReveal delay={0.2}>
              <div className="space-y-4 p-6 rounded-xl border border-border/50 bg-card/30">
                <h3 className="text-lg font-semibold">
                  2. When something goes wrong, what breaks down first?
                </h3>
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
            </ScrollReveal>

            {/* Question 3: Tool Entropy */}
            <ScrollReveal delay={0.25}>
              <div className="space-y-4 p-6 rounded-xl border border-border/50 bg-card/30">
                <h3 className="text-lg font-semibold">
                  3. How many tools do you use daily to run operations?
                </h3>
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
            </ScrollReveal>

            {/* Question 4: 48-Hour Absence */}
            <ScrollReveal delay={0.3}>
              <div className="space-y-4 p-6 rounded-xl border border-border/50 bg-card/30">
                <h3 className="text-lg font-semibold">
                  4. If you disappeared for 48 hours, what happens?
                </h3>
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
            </ScrollReveal>

            {/* Question 5: Operational Volume */}
            <ScrollReveal delay={0.35}>
              <div className="space-y-4 p-6 rounded-xl border border-border/50 bg-card/30">
                <h3 className="text-lg font-semibold">
                  5. How would you describe your operational volume?
                </h3>
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
            </ScrollReveal>

            {/* Question 6: Decision Maker */}
            <ScrollReveal delay={0.4}>
              <div className="space-y-4 p-6 rounded-xl border border-border/50 bg-card/30">
                <h3 className="text-lg font-semibold">
                  6. Are you the decision maker for operational changes?
                </h3>
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
            </ScrollReveal>

            {/* Optional Notes */}
            <ScrollReveal delay={0.45}>
              <div className="space-y-4 p-6 rounded-xl border border-border/50 bg-card/30">
                <h3 className="text-lg font-semibold">Additional context (optional)</h3>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                  placeholder="Anything else we should know about your operations..."
                  rows={4}
                />
              </div>
            </ScrollReveal>

            {/* Trust Gate */}
            <ScrollReveal delay={0.5}>
              <div className="p-6 rounded-xl border border-primary/30 bg-primary/5">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="consent"
                    checked={formData.consent_ack}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, consent_ack: checked === true }))
                    }
                    className="mt-1"
                  />
                  <label htmlFor="consent" className="text-sm cursor-pointer">
                    <span className="font-medium">I understand AERELION builds operational systems</span>
                    <span className="text-muted-foreground"> (not quick hacks, not outcome guarantees).</span>
                  </label>
                </div>
              </div>
            </ScrollReveal>

            {/* Submit */}
            <ScrollReveal delay={0.55}>
              <div className="text-center space-y-4">
                <Button
                  type="submit"
                  size="lg"
                  disabled={isSubmitting}
                  className="min-w-[240px]"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "SUBMIT + FIND MY PATH"
                  )}
                </Button>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  We'll return a diagnosis and system path. No hype. No promises. Just operational truth.
                </p>
              </div>
            </ScrollReveal>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}