import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Loader2,
  ArrowRight,
  CheckCircle,
  Shield,
  Link as LinkIcon,
  Cpu,
} from "lucide-react";
import { toast } from "sonner";

const N8N_WEBHOOK_URL = "https://aerelionlabs.app.n8n.cloud/webhook/api/activate-agents";

export default function AgentActivate() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const auditId = searchParams.get("audit") || "";
  const defaultName = searchParams.get("name") || "";
  const defaultEmail = searchParams.get("email") || "";

  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState(defaultName);
  const [email, setEmail] = useState(defaultEmail);
  const [businessName, setBusinessName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !email.trim()) {
      setError("Name and email are required.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setStep(2);
  };

  const handleActivate = async () => {
    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        audit_id: auditId,
        name: name.trim(),
        email: email.trim(),
        business_name: businessName.trim() || undefined,
      };

      console.log("[AgentActivate] Request:", { url: N8N_WEBHOOK_URL, payload });

      const response = await fetch(N8N_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      console.log("[AgentActivate] Response:", { status: response.status, body: result });

      if (!response.ok) {
        throw new Error(result.error || result.message || `Error ${response.status}`);
      }

      // Store tenant_id
      if (result.tenant_id) {
        localStorage.setItem(`tenant_${auditId}`, result.tenant_id);
      }

      toast.success("Agent engine activation started.");
      
      // Navigate to dashboard with tenant_id
      const tenantId = result.tenant_id || auditId;
      navigate(`/agents/dashboard?tenant_id=${tenantId}`);
      
    } catch (err: any) {
      console.error("[AgentActivate] Error:", err);
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO title="Activate Your Agent Engine | AERELION" />
      <Navbar />

      <main className="pt-32 pb-24">
        <div className="container mx-auto px-6 max-w-lg">
          
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                {/* Step 1: Confirm Identity */}
                <div className="text-center mb-12">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                    <Shield className="w-7 h-7 text-primary" />
                  </div>
                  <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-3">
                    Confirm Your Identity
                  </h1>
                  <p className="text-muted-foreground">
                    This creates your private agent engine. No shared credentials.
                  </p>
                </div>

                <form onSubmit={handleContinue} className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your name"
                        className="h-12"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@company.com"
                        className="h-12"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="business" className="text-muted-foreground">
                        Business name <span className="text-xs">(optional)</span>
                      </Label>
                      <Input
                        id="business"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        placeholder="Your company"
                        className="h-12"
                      />
                    </div>
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm"
                    >
                      {error}
                    </motion.div>
                  )}

                  <Button type="submit" size="lg" className="w-full h-12">
                    Continue
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </form>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                {/* Step 2: What happens next */}
                <div className="text-center mb-12">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                    <Cpu className="w-7 h-7 text-primary" />
                  </div>
                  <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-3">
                    What Happens Next
                  </h1>
                  <p className="text-muted-foreground">
                    Your private engine will be ready in under a minute.
                  </p>
                </div>

                {/* Checklist */}
                <div className="space-y-4 mb-10">
                  <div className="flex items-start gap-4 p-4 rounded-xl border border-border/50 bg-card/30">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Engine is provisioned</p>
                      <p className="text-sm text-muted-foreground">
                        Isolated infrastructure, just for you.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 rounded-xl border border-border/50 bg-card/30">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <LinkIcon className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Required tools will be connected</p>
                      <p className="text-sm text-muted-foreground">
                        You'll securely link your accounts.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 rounded-xl border border-border/50 bg-card/30">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Cpu className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Agents go live automatically</p>
                      <p className="text-sm text-muted-foreground">
                        Once connected, everything runs on its own.
                      </p>
                    </div>
                  </div>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm mb-6"
                  >
                    {error}
                  </motion.div>
                )}

                <div className="space-y-3">
                  <Button
                    size="lg"
                    className="w-full h-12"
                    onClick={handleActivate}
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Activating...
                      </>
                    ) : (
                      <>
                        Activate Engine
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                  
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
                    disabled={submitting}
                  >
                    Go back
                  </button>
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
