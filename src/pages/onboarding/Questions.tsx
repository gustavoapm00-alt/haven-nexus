import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, ArrowLeft, HelpCircle } from "lucide-react";
import { toast } from "sonner";

interface Question {
  id: string;
  question: string;
  why: string;
  type: "select" | "text";
  options?: { value: string; label: string; desc: string }[];
}

const questions: Question[] = [
  {
    id: "primary_friction",
    question: "Where do you feel the most operational friction?",
    why: "This helps us understand where your time disappears.",
    type: "text",
  },
  {
    id: "breakdown_first",
    question: "When something goes wrong, what breaks down first?",
    why: "Understanding your failure patterns reveals the root cause.",
    type: "select",
    options: [
      { value: "approvals_stall_decisions", label: "Approvals stall decisions", desc: "Waiting on someone blocks progress" },
      { value: "creates_customer_confusion", label: "Customer confusion", desc: "Customers notice delays or inconsistencies" },
      { value: "someone_patches_manually", label: "Manual patching", desc: "Someone steps in to fix things" },
      { value: "things_slip_quietly", label: "Things slip quietly", desc: "Work falls through cracks unnoticed" },
    ],
  },
  {
    id: "tool_entropy",
    question: "How many tools do you use daily?",
    why: "Tool fragmentation creates invisible overhead.",
    type: "select",
    options: [
      { value: "tools_1_2", label: "1–2 tools", desc: "Minimal complexity" },
      { value: "tools_3_5", label: "3–5 tools", desc: "Growing complexity" },
      { value: "tools_6_plus", label: "6+ tools", desc: "Significant fragmentation" },
    ],
  },
  {
    id: "absence_test_48h",
    question: "If you disappeared for 48 hours, what happens?",
    why: "This reveals how much depends on you personally.",
    type: "select",
    options: [
      { value: "things_slip", label: "Things slip", desc: "Work gets delayed or lost" },
      { value: "someone_fills_gaps_manually", label: "Someone fills gaps", desc: "Another person covers" },
      { value: "systems_mostly_hold", label: "Systems mostly hold", desc: "Operations continue reasonably" },
    ],
  },
  {
    id: "operational_volume",
    question: "How would you describe your operational volume?",
    why: "Volume impacts which systems will give you the biggest return.",
    type: "select",
    options: [
      { value: "low_volume_chaotic", label: "Low volume, chaotic", desc: "Few transactions, lots of friction" },
      { value: "steady_weekly", label: "Steady weekly flow", desc: "Predictable recurring workload" },
      { value: "high_throughput", label: "High throughput", desc: "Significant daily volume" },
    ],
  },
  {
    id: "decision_maker",
    question: "Are you the decision maker for operational changes?",
    why: "We want to ensure the right person is involved.",
    type: "select",
    options: [
      { value: "yes", label: "Yes", desc: "I can approve operational changes" },
      { value: "no", label: "No", desc: "I need to involve others" },
    ],
  },
];

export default function Questions() {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [textInput, setTextInput] = useState("");

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;
  const isLastQuestion = currentIndex === questions.length - 1;

  // Restore text input when going back
  useEffect(() => {
    if (currentQuestion.type === "text") {
      setTextInput(answers[currentQuestion.id] || "");
    }
  }, [currentIndex, currentQuestion, answers]);

  const handleSelectOption = (value: string) => {
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: value }));
    
    if (!isLastQuestion) {
      setTimeout(() => setCurrentIndex((i) => i + 1), 200);
    }
  };

  const handleTextSubmit = () => {
    if (!textInput.trim()) {
      toast.error("Please provide an answer");
      return;
    }
    
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: textInput.trim() }));
    
    if (!isLastQuestion) {
      setCurrentIndex((i) => i + 1);
      setTextInput("");
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
    }
  };

  const handleComplete = () => {
    // Ensure current answer is saved
    const finalAnswers = { ...answers };
    if (currentQuestion.type === "text" && textInput.trim()) {
      finalAnswers[currentQuestion.id] = textInput.trim();
    }

    // Validate all answers
    const unanswered = questions.filter((q) => !finalAnswers[q.id]);
    if (unanswered.length > 0) {
      toast.error("Please answer all questions");
      return;
    }

    // Store answers and navigate
    sessionStorage.setItem("onboarding_answers", JSON.stringify(finalAnswers));
    navigate("/analysis/diagnosis");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO title="Understanding Your Business | AERELION" />
      <Navbar />

      <main className="pt-28 pb-24">
        <div className="container mx-auto px-6 max-w-2xl">
          {/* Progress */}
          <div className="mb-12">
            <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
              <span>Question {currentIndex + 1} of {questions.length}</span>
              <span className="text-primary font-medium">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-1" />
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Question */}
              <div className="mb-10">
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-4">
                  {currentQuestion.question}
                </h1>
                <div className="flex items-start gap-2 text-muted-foreground">
                  <HelpCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <p className="text-sm">{currentQuestion.why}</p>
                </div>
              </div>

              {/* Answer Options */}
              {currentQuestion.type === "select" && currentQuestion.options && (
                <div className="space-y-3 mb-10">
                  {currentQuestion.options.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleSelectOption(option.value)}
                      className={`w-full text-left p-5 rounded-xl border transition-all duration-200 ${
                        answers[currentQuestion.id] === option.value
                          ? "border-primary bg-primary/10"
                          : "border-border/50 bg-card/30 hover:border-primary/50 hover:bg-card/50"
                      }`}
                    >
                      <div className="font-medium text-lg">{option.label}</div>
                      <div className="text-sm text-muted-foreground mt-1">{option.desc}</div>
                    </button>
                  ))}
                </div>
              )}

              {currentQuestion.type === "text" && (
                <div className="space-y-4 mb-10">
                  <Textarea
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder="Describe your situation..."
                    rows={4}
                    className="text-lg"
                  />
                  <Button onClick={handleTextSubmit} className="w-full h-12">
                    Continue
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              )}

              {/* Navigation */}
              <div className="flex items-center justify-between">
                <button
                  onClick={handleBack}
                  disabled={currentIndex === 0}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>

                {isLastQuestion && answers[currentQuestion.id] && (
                  <Button onClick={handleComplete} size="lg">
                    See My Diagnosis
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <Footer />
    </div>
  );
}
