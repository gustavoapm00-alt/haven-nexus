import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowRight, Shield, Lock } from "lucide-react";
import { toast } from "sonner";

const N8N_WEBHOOK_URL = "https://aerelionlabs.app.n8n.cloud/webhook/api/activate-agents";

export default function Activate() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const auditId = searchParams.get("audit") || "";
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
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

    setSubmitting(true);

    try {
      const payload = {
        audit_id: auditId,
        name: name.trim(),
        email: email.trim(),
      };

      const response = await fetch(N8N_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || result.message || `Error ${response.status}`);
      }

      // Store tenant info
      if (result.tenant_id) {
        localStorage.setItem(`tenant_${auditId}`, result.tenant_id);
      }

      toast.success("Your agent engine is being activated.");
      
      const tenantId = result.tenant_id || auditId;
      navigate(`/dashboard?tenant_id=${tenantId}`);
      
    } catch (err: any) {
      console.error("Activation error:", err);
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO title="Activate Your System | AERELION" />
      <Navbar />

      <main className="pt-32 pb-24">
        <div className="container mx-auto px-6 max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Header */}
            <div className="text-center mb-10">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                <Shield className="w-7 h-7 text-primary" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-3">
                Activate Your System
              </h1>
              <p className="text-muted-foreground">
                Your private agent engine will be deployed in under a minute.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Your Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Full name"
                    className="h-12"
                    disabled={submitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="h-12"
                    disabled={submitting}
                  />
                </div>
              </div>

              {/* Security note */}
              <div className="flex items-start gap-3 p-4 rounded-lg bg-card/50 border border-border/50">
                <Lock className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <p className="text-xs text-muted-foreground">
                  Your credentials are encrypted and stored in your private workspace. 
                  We never share or access your connected accounts.
                </p>
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

              <Button
                type="submit"
                size="lg"
                className="w-full h-14 text-lg"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Activating...
                  </>
                ) : (
                  <>
                    Activate My Agent Engine
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </form>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
