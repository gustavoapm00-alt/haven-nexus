import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
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
import { Loader2, CheckCircle } from "lucide-react";

const toolOptions = [
  { value: "notion", label: "Notion" },
  { value: "slack", label: "Slack" },
  { value: "hubspot", label: "HubSpot" },
  { value: "airtable", label: "Airtable" },
  { value: "google_sheets", label: "Google Sheets" },
  { value: "zapier", label: "Zapier" },
  { value: "make", label: "Make (Integromat)" },
  { value: "salesforce", label: "Salesforce" },
  { value: "stripe", label: "Stripe" },
  { value: "other", label: "Other" },
];

const timelineOptions = [
  { value: "this_week", label: "This week", desc: "Ready to start immediately" },
  { value: "this_month", label: "This month", desc: "Ready to begin soon" },
  { value: "next_quarter", label: "Next quarter", desc: "Planning ahead" },
  { value: "exploring", label: "Exploring", desc: "No fixed timeline" },
];

const budgetOptions = [
  { value: "under_5k", label: "Under $5,000", desc: "Starter project scope" },
  { value: "5k_15k", label: "$5,000 – $15,000", desc: "Standard system build" },
  { value: "15k_plus", label: "$15,000+", desc: "Complex or multi-system" },
  { value: "not_sure", label: "Not sure yet", desc: "Let's discuss" },
];

export default function RequestDeployment() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const auditId = searchParams.get("audit") || "";
  const diagnosisId = searchParams.get("diagnosis") || "";
  const prefillName = searchParams.get("name") || "";
  const prefillEmail = searchParams.get("email") || "";

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: prefillName,
    email: prefillEmail,
    preferred_tools: [] as string[],
    timeline: "",
    budget_comfort: "",
    notes: "",
  });
  const [honeypot, setHoneypot] = useState("");

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      name: prefillName,
      email: prefillEmail,
    }));
  }, [prefillName, prefillEmail]);

  const toggleTool = (tool: string) => {
    setFormData((prev) => ({
      ...prev,
      preferred_tools: prev.preferred_tools.includes(tool)
        ? prev.preferred_tools.filter((t) => t !== tool)
        : [...prev.preferred_tools, tool],
    }));
  };

  const handleSelectOption = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (honeypot) {
      toast.error("Submission blocked");
      return;
    }

    if (!formData.email) {
      toast.error("Please enter your email");
      return;
    }

    if (!formData.timeline) {
      toast.error("Please select a timeline");
      return;
    }

    if (!formData.budget_comfort) {
      toast.error("Please select a budget range");
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.functions.invoke("deployment-request", {
        body: {
          audit_id: auditId || null,
          diagnosis_id: diagnosisId || null,
          name: formData.name,
          email: formData.email,
          preferred_involvement: "done_for_you",
          preferred_tools: formData.preferred_tools,
          timeline: formData.timeline,
          budget_comfort: formData.budget_comfort,
          contact_method: "email",
          notes: formData.notes,
        },
      });

      if (error) throw error;

      setSubmitted(true);
      toast.success("Deployment request submitted");
    } catch (error: any) {
      console.error("Submission error:", error);
      toast.error("Failed to submit request. Please try again.");
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
    desc?: string;
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
      {desc && <div className="text-sm opacity-70 mt-1">{desc}</div>}
    </button>
  );

  if (submitted) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <SEO title="Request Received | AERELION Labs" />
        <Navbar />
        <main className="pt-32 pb-24">
          <div className="container mx-auto px-6 max-w-2xl text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <h1 className="text-3xl font-bold">Deployment Request Received</h1>
              <p className="text-muted-foreground max-w-md mx-auto">
                We'll review your diagnosis and confirm whether AERELION is the right fit for your operational needs.
              </p>
              <p className="text-muted-foreground text-sm">
                If we're not the right fit, we'll tell you. If we are, we'll confirm constraints and map the first build.
              </p>
              <div className="pt-6">
                <Button variant="outline" onClick={() => navigate("/")}>
                  Return Home
                </Button>
              </div>
            </motion.div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO
        title="Request Deployment | AERELION Labs"
        description="Submit your deployment request and we'll confirm fit."
      />
      <Navbar />

      <main className="pt-28 pb-24">
        <div className="container mx-auto px-6 max-w-2xl">
          <ScrollReveal>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-10"
            >
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
                Request Deployment
              </h1>
              <p className="text-muted-foreground text-lg">
                This is not checkout. This is fit confirmation.
              </p>
            </motion.div>
          </ScrollReveal>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Honeypot */}
            <input
              type="text"
              name="website"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              className="hidden"
              tabIndex={-1}
              autoComplete="off"
            />

            {/* Audit ID (read-only) */}
            {auditId && (
              <ScrollReveal delay={0.05}>
                <div className="p-4 rounded-lg border border-border/50 bg-muted/30">
                  <p className="text-xs text-muted-foreground">
                    Audit ID: <span className="font-mono">{auditId}</span>
                  </p>
                </div>
              </ScrollReveal>
            )}

            {/* Contact Info */}
            <ScrollReveal delay={0.1}>
              <div className="p-6 rounded-xl border border-border/50 bg-card/30 space-y-4">
                <h3 className="text-lg font-semibold">Contact Information</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium mb-2">Name</label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Email <span className="text-destructive">*</span>
                    </label>
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

            {/* Preferred Tools */}
            <ScrollReveal delay={0.15}>
              <div className="p-6 rounded-xl border border-border/50 bg-card/30 space-y-4">
                <h3 className="text-lg font-semibold">Tools to Connect (select all that apply)</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {toolOptions.map((tool) => (
                    <label
                      key={tool.value}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                        formData.preferred_tools.includes(tool.value)
                          ? "border-primary bg-primary/10"
                          : "border-border/50 bg-card/50 hover:border-primary/50"
                      }`}
                    >
                      <Checkbox
                        checked={formData.preferred_tools.includes(tool.value)}
                        onCheckedChange={() => toggleTool(tool.value)}
                      />
                      <span className="text-sm">{tool.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </ScrollReveal>

            {/* Timeline */}
            <ScrollReveal delay={0.2}>
              <div className="p-6 rounded-xl border border-border/50 bg-card/30 space-y-4">
                <h3 className="text-lg font-semibold">
                  Desired Timeline <span className="text-destructive">*</span>
                </h3>
                <div className="grid gap-3 md:grid-cols-2">
                  {timelineOptions.map((opt) => (
                    <OptionButton
                      key={opt.value}
                      selected={formData.timeline === opt.value}
                      label={opt.label}
                      desc={opt.desc}
                      onClick={() => handleSelectOption("timeline", opt.value)}
                    />
                  ))}
                </div>
              </div>
            </ScrollReveal>

            {/* Budget */}
            <ScrollReveal delay={0.25}>
              <div className="p-6 rounded-xl border border-border/50 bg-card/30 space-y-4">
                <h3 className="text-lg font-semibold">
                  Budget Comfort <span className="text-destructive">*</span>
                </h3>
                <div className="grid gap-3 md:grid-cols-2">
                  {budgetOptions.map((opt) => (
                    <OptionButton
                      key={opt.value}
                      selected={formData.budget_comfort === opt.value}
                      label={opt.label}
                      desc={opt.desc}
                      onClick={() => handleSelectOption("budget_comfort", opt.value)}
                    />
                  ))}
                </div>
              </div>
            </ScrollReveal>

            {/* Notes */}
            <ScrollReveal delay={0.3}>
              <div className="p-6 rounded-xl border border-border/50 bg-card/30 space-y-4">
                <h3 className="text-lg font-semibold">Additional Context (optional)</h3>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                  placeholder="Constraints, questions, or anything else..."
                  rows={4}
                />
              </div>
            </ScrollReveal>

            {/* Submit */}
            <ScrollReveal delay={0.35}>
              <div className="text-center space-y-4">
                <Button
                  type="submit"
                  size="lg"
                  disabled={isSubmitting}
                  className="min-w-[260px]"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Deployment Request"
                  )}
                </Button>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  We'll review your request and respond within 1–2 business days.
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
