import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Cpu, ArrowRight } from "lucide-react";
import { toast } from "sonner";

interface ActivateAgentsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  auditId: string;
  defaultName?: string;
  defaultEmail?: string;
}

export function ActivateAgentsModal({
  open,
  onOpenChange,
  auditId,
  defaultName = "",
  defaultEmail = "",
}: ActivateAgentsModalProps) {
  const navigate = useNavigate();
  const [name, setName] = useState(defaultName);
  const [email, setEmail] = useState(defaultEmail);
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
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/activate-agents`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ audit_id: auditId, email, name }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to activate agents");
      }

      // Store tenant_id in localStorage scoped to audit_id
      localStorage.setItem(`tenant_${auditId}`, result.tenant_id);

      toast.success("Agent engine provisioning started!");
      onOpenChange(false);
      navigate(`/agents/setup?tenant_id=${result.tenant_id}&audit_id=${auditId}`);
    } catch (err: any) {
      console.error("Activation error:", err);
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <Cpu className="w-5 h-5 text-primary" />
            </div>
            Activate Your Agents
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <p className="text-sm text-muted-foreground">
            We'll provision your private agent engine and guide tool connections.
          </p>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                disabled={submitting}
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
                disabled={submitting}
              />
            </div>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Provisioning...
              </>
            ) : (
              <>
                Provision My Agent Engine
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            Your credentials are isolated to your workspace.
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}
