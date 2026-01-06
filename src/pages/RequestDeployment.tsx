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
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, CheckCircle } from "lucide-react";

const involvementOptions = [
  { value: "done_for_you", label: "Done for you", desc: "AERELION handles design and deployment" },
  { value: "collaborative", label: "Collaborative", desc: "Work together on implementation" },
  { value: "not_sure", label: "Not sure yet", desc: "Let's discuss what makes sense" },
];

const timelineOptions = [
  { value: "this_month", label: "This month", desc: "Ready to start immediately" },
  { value: "next_month", label: "Next month", desc: "Planning ahead" },
  { value: "exploring", label: "Exploring", desc: "No fixed timeline" },
];

const contactOptions = [
  { value: "email", label: "Email", desc: "Prefer written communication" },
  { value: "phone", label: "Phone", desc: "Let's talk directly" },
  { value: "schedule_link", label: "Schedule a call", desc: "Book a time that works" },
];

export default function RequestDeployment() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const auditId = searchParams.get("audit");
  const diagnosisId = searchParams.get("diagnosis");
  const prefillName = searchParams.get("name") || "";
  const prefillEmail = searchParams.get("email") || "";

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: prefillName,
    email: prefillEmail,
    preferred_involvement: "",
    timeline: "",
    tools_stack: "",
    contact_method: "",
    notes: "",
  });

  // Honeypot
  const [honeypot, setHoneypot] = useState("");

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      name: prefillName,
      email: prefillEmail,
    }));
  }, [prefillName, prefillEmail]);

  const handleSelectOption = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (honeypot) {
      toast.error("Submission blocked");
      return;
    }

    if (!formData.name || !formData.email) {
      toast.error("Please enter your name and email");
      return;
    }

    if (!formData.preferred_involvement) {
      toast.error("Please select your preferred involvement");
      return;
    }

    if (!formData.timeline) {
      toast.error("Please select a timeline");
      return;
    }

    if (!formData.contact_method) {
      toast.error("Please select a contact method");
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.functions.invoke("deployment-request", {
        body: {
          audit_id: auditId,
          diagnosis_id: diagnosisId,
          ...formData,
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

  if (submitted) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <SEO title="Request Received | AERELION Systems" />
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
                We'll review your audit and diagnosis, then confirm whether AERELION is the right fit for your operational needs.
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
        title="Request System Deployment | AERELION Systems"
        description="Confirm fit and request deployment of your recommended systems."
      />
      <Navbar />

      <main className="pt-32 pb-24">
        <div className="container mx-auto px-6 max-w-2xl">
          <ScrollReveal>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12"
            >
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
                REQUEST SYSTEM DEPLOYMENT
              </h1>
              <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                This is not checkout. This is fit confirmation.
              </p>
            </motion.div>
          </ScrollReveal>

          <form onSubmit={handleSubmit} className="space-y-8">
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

            {/* Preferred Involvement */}
            <ScrollReveal delay={0.15}>
              <div className="space-y-4 p-6 rounded-xl border border-border/50 bg-card/30">
                <h3 className="text-lg font-semibold">
                  How would you prefer to be involved?
                </h3>
                <div className="grid gap-3">
                  {involvementOptions.map((opt) => (
                    <OptionButton
                      key={opt.value}
                      selected={formData.preferred_involvement === opt.value}
                      label={opt.label}
                      desc={opt.desc}
                      onClick={() => handleSelectOption("preferred_involvement", opt.value)}
                    />
                  ))}
                </div>
              </div>
            </ScrollReveal>

            {/* Timeline */}
            <ScrollReveal delay={0.2}>
              <div className="space-y-4 p-6 rounded-xl border border-border/50 bg-card/30">
                <h3 className="text-lg font-semibold">
                  When are you looking to start?
                </h3>
                <div className="grid gap-3 md:grid-cols-3">
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

            {/* Tools Stack */}
            <ScrollReveal delay={0.25}>
              <div className="space-y-4 p-6 rounded-xl border border-border/50 bg-card/30">
                <h3 className="text-lg font-semibold">
                  What tools do you currently use? (optional)
                </h3>
                <Textarea
                  value={formData.tools_stack}
                  onChange={(e) => setFormData((prev) => ({ ...prev, tools_stack: e.target.value }))}
                  placeholder="e.g., Notion, Slack, HubSpot, Airtable..."
                  rows={3}
                />
              </div>
            </ScrollReveal>

            {/* Contact Method */}
            <ScrollReveal delay={0.3}>
              <div className="space-y-4 p-6 rounded-xl border border-border/50 bg-card/30">
                <h3 className="text-lg font-semibold">
                  How would you prefer we reach you?
                </h3>
                <div className="grid gap-3 md:grid-cols-3">
                  {contactOptions.map((opt) => (
                    <OptionButton
                      key={opt.value}
                      selected={formData.contact_method === opt.value}
                      label={opt.label}
                      desc={opt.desc}
                      onClick={() => handleSelectOption("contact_method", opt.value)}
                    />
                  ))}
                </div>
              </div>
            </ScrollReveal>

            {/* Notes */}
            <ScrollReveal delay={0.35}>
              <div className="space-y-4 p-6 rounded-xl border border-border/50 bg-card/30">
                <h3 className="text-lg font-semibold">
                  Anything else we should know? (optional)
                </h3>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                  placeholder="Constraints, context, questions..."
                  rows={4}
                />
              </div>
            </ScrollReveal>

            {/* Submit */}
            <ScrollReveal delay={0.4}>
              <div className="text-center space-y-4">
                <Button
                  type="submit"
                  size="lg"
                  disabled={isSubmitting}
                  className="min-w-[280px]"
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
                  If we're not the right fit, we'll tell you. If we are, we'll confirm constraints and map the first build.
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