import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Bot, Zap, Clock, CheckCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Agent {
  name: string;
  automates: string;
  replaces: string;
}

// Agent recommendations based on failure modes
const agentsByFailureMode: Record<string, Agent[]> = {
  approvals_stall_decisions: [
    { name: "Approval Router", automates: "Routes requests to the right approver automatically", replaces: "Chasing people for sign-off" },
    { name: "Decision Tracker", automates: "Tracks pending decisions and escalates when stuck", replaces: "Manual follow-up reminders" },
    { name: "Status Notifier", automates: "Keeps stakeholders informed without you", replaces: "Sending update emails" },
  ],
  creates_customer_confusion: [
    { name: "Customer Journey Agent", automates: "Guides customers through your process", replaces: "Manual onboarding steps" },
    { name: "Response Coordinator", automates: "Ensures timely, consistent customer responses", replaces: "Scattered communication" },
    { name: "Status Updater", automates: "Proactively updates customers on progress", replaces: "Fielding 'where's my order?' calls" },
  ],
  someone_patches_manually: [
    { name: "Exception Handler", automates: "Catches and routes edge cases automatically", replaces: "Firefighting mode" },
    { name: "Workflow Enforcer", automates: "Ensures processes are followed correctly", replaces: "Manual quality checks" },
    { name: "Escalation Agent", automates: "Alerts you only when truly needed", replaces: "Constant monitoring" },
  ],
  things_slip_quietly: [
    { name: "Task Monitor", automates: "Tracks work and surfaces what's stuck", replaces: "Things falling through cracks" },
    { name: "Deadline Guardian", automates: "Ensures nothing misses its deadline", replaces: "Manual deadline tracking" },
    { name: "Completion Verifier", automates: "Confirms tasks are actually done", replaces: "Hoping things got completed" },
  ],
};

const defaultAgents: Agent[] = [
  { name: "Intake Router", automates: "Routes incoming requests to the right place", replaces: "Manual triage and assignment" },
  { name: "Follow-up Agent", automates: "Sends timely follow-ups automatically", replaces: "Remembering to check back" },
  { name: "Report Generator", automates: "Creates status reports on demand", replaces: "Building reports manually" },
];

export default function Architecture() {
  const navigate = useNavigate();
  const [auditId, setAuditId] = useState("");
  const [hourLoss, setHourLoss] = useState({ low: 15, high: 25 });
  const [agents, setAgents] = useState<Agent[]>(defaultAgents);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedAuditId = sessionStorage.getItem("diagnosis_audit_id");
    const storedHourLoss = sessionStorage.getItem("diagnosis_hour_loss");
    const storedFailureMode = sessionStorage.getItem("diagnosis_failure_mode");

    if (!storedAuditId) {
      navigate("/start");
      return;
    }

    setAuditId(storedAuditId);
    
    if (storedHourLoss) {
      setHourLoss(JSON.parse(storedHourLoss));
    }

    if (storedFailureMode && agentsByFailureMode[storedFailureMode]) {
      setAgents(agentsByFailureMode[storedFailureMode]);
    }

    // Brief loading for polish
    setTimeout(() => setLoading(false), 800);
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <SEO title="Designing Your System | AERELION" />
        <Navbar />
        <main className="pt-32 pb-24">
          <div className="container mx-auto px-6 max-w-xl text-center">
            <Loader2 className="w-12 h-12 mx-auto animate-spin text-primary mb-6" />
            <h2 className="text-xl font-semibold">Designing Your Agent Architecture</h2>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO
        title="Your Agent Architecture | AERELION"
        description="A custom agent system designed for your business."
      />
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
              <Zap className="w-7 h-7 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
              Your Agent Architecture
            </h1>
            <p className="text-lg text-muted-foreground max-w-lg mx-auto">
              Here's the system we designed to recover your {hourLoss.low}–{hourLoss.high} weekly hours.
            </p>
          </motion.div>

          {/* Agents Grid */}
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="mb-16"
          >
            <div className="space-y-4">
              {agents.map((agent, index) => (
                <motion.div
                  key={agent.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + index * 0.1 }}
                  className="p-6 rounded-xl border border-border/50 bg-card/30 hover:bg-card/50 hover:border-primary/30 transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold">{agent.name}</h3>
                        <Badge variant="outline" className="text-xs border-green-500/50 text-green-400">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Ready to deploy
                        </Badge>
                      </div>
                      <p className="text-muted-foreground mb-3">{agent.automates}</p>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-destructive" />
                        <span className="text-muted-foreground">Replaces:</span>
                        <span className="text-destructive">{agent.replaces}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Summary */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-12 p-6 rounded-xl border border-primary/30 bg-primary/5 text-center"
          >
            <p className="text-lg">
              <span className="font-semibold text-primary">{agents.length} agents</span>
              {" "}working together to give you back{" "}
              <span className="font-semibold text-primary">{hourLoss.low}–{hourLoss.high} hours</span>
              {" "}every week.
            </p>
          </motion.section>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-center"
          >
            <Link to={`/activate?audit=${auditId}`}>
              <Button size="lg" className="text-lg px-10 py-6 h-auto">
                Activate My Agent Engine
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </motion.div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
