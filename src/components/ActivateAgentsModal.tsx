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
import { Loader2, Cpu, ArrowRight, Zap, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiResponse, setApiResponse] = useState<any>(null);

  const callActivateApi = async () => {
    // Get current session for authentication
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      throw new Error("Please sign in to activate agents");
    }

    const payload = {
      audit_id: auditId,
      name: name.trim(),
    };

    console.log("[ActivateAgents] Request:", {
      url: `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/activate-agents`,
      payload,
    });

    // Call secure edge function instead of direct n8n webhook
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/activate-agents`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(payload),
      }
    );

    const result = await response.json();

    console.log("[ActivateAgents] Response:", {
      status: response.status,
      ok: response.ok,
      body: result,
    });

    return { response, result };
  };

  const handleTestConnection = async () => {
    setError(null);
    setApiResponse(null);
    setTesting(true);

    try {
      const { response, result } = await callActivateApi();
      setApiResponse(result);

      if (!response.ok) {
        setError(result.error || result.message || `Error ${response.status}`);
      } else {
        toast.success("Connection test successful!");
      }
    } catch (err: any) {
      console.error("[ActivateAgents] Test error:", err);
      setError(err.message || "Network error. Check console.");
    } finally {
      setTesting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setApiResponse(null);

    if (!name.trim()) {
      setError("Name is required.");
      return;
    }

    setSubmitting(true);

    try {
      const { response, result } = await callActivateApi();
      setApiResponse(result);

      if (!response.ok) {
        setError(result.error || result.message || `Error ${response.status}`);
        return;
      }

      // Store tenant_id in localStorage scoped to audit_id
      if (result.tenant_id) {
        localStorage.setItem(`tenant_${auditId}`, result.tenant_id);
      }

      toast.success("Agent engine provisioning started!");
      // Keep modal open to show response for debugging
    } catch (err: any) {
      console.error("[ActivateAgents] Submit error:", err);
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
            You must be signed in to activate.
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
              <Label htmlFor="email">Email (from your account)</Label>
              <Input
                id="email"
                type="email"
                value={email}
                placeholder="you@company.com"
                disabled
                className="bg-muted/50"
              />
              <p className="text-xs text-muted-foreground">
                Email is automatically set from your signed-in account.
              </p>
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

          <AnimatePresence>
            {apiResponse && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-3 rounded-lg bg-primary/10 border border-primary/30 text-xs font-mono overflow-auto max-h-40"
              >
                <div className="flex items-center gap-2 mb-2 text-primary text-sm font-sans">
                  <CheckCircle className="w-4 h-4" />
                  API Response
                </div>
                <pre className="text-muted-foreground whitespace-pre-wrap">
                  {JSON.stringify(apiResponse, null, 2)}
                </pre>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleTestConnection}
              disabled={testing || submitting}
              className="flex-shrink-0"
            >
              {testing ? (
                <>
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <Zap className="w-3 h-3 mr-1" />
                  Test Connection
                </>
              )}
            </Button>

            <Button
              type="submit"
              className="flex-1"
              size="lg"
              disabled={submitting || testing}
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
          </div>

          <p className="text-xs text-center text-muted-foreground">
            Your credentials are isolated to your workspace.
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}
