import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, Globe, Loader2, Sparkles } from "lucide-react";

const analysisMessages = [
  "Connecting to your business...",
  "Analyzing site structure...",
  "Understanding your operations...",
  "Identifying automation opportunities...",
  "Preparing intelligent questions...",
];

export default function Start() {
  const navigate = useNavigate();
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [noWebsite, setNoWebsite] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentMessage, setCurrentMessage] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!noWebsite && !websiteUrl.trim()) {
      setError("Please enter your website URL or select 'I don't have a website yet'");
      return;
    }

    // Start analysis animation
    setIsAnalyzing(true);
    setProgress(0);

    // Animate progress
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 2;
      });
    }, 60);

    // Cycle through messages
    const messageInterval = setInterval(() => {
      setCurrentMessage((prev) => (prev + 1) % analysisMessages.length);
    }, 800);

    // Store data and navigate after animation
    setTimeout(() => {
      clearInterval(progressInterval);
      clearInterval(messageInterval);
      
      const url = noWebsite ? "" : (websiteUrl.startsWith("http") ? websiteUrl : `https://${websiteUrl}`);
      sessionStorage.setItem("onboarding_website", url);
      sessionStorage.setItem("onboarding_no_website", String(noWebsite));
      
      navigate("/analysis/questions");
    }, 3500);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO
        title="Connect Your Business | AERELION"
        description="Let us analyze your business and design a custom agent system."
      />
      <Navbar />

      <main className="pt-32 pb-24">
        <div className="container mx-auto px-6 max-w-xl">
          <AnimatePresence mode="wait">
            {!isAnalyzing ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                {/* Header */}
                <div className="text-center mb-12">
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center mb-6"
                  >
                    <Globe className="w-8 h-8 text-primary" />
                  </motion.div>
                  <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
                    Connect Your Business
                  </h1>
                  <p className="text-lg text-muted-foreground max-w-md mx-auto">
                    We'll analyze your business and design a system that automates 
                    your most time-consuming work.
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <div className="relative">
                      <Input
                        value={websiteUrl}
                        onChange={(e) => setWebsiteUrl(e.target.value)}
                        placeholder="yourcompany.com"
                        className="h-14 text-lg pl-12"
                        disabled={noWebsite}
                      />
                      <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    </div>

                    <div className="flex items-center gap-3">
                      <Checkbox
                        id="no-website"
                        checked={noWebsite}
                        onCheckedChange={(checked) => setNoWebsite(checked === true)}
                      />
                      <label
                        htmlFor="no-website"
                        className="text-sm text-muted-foreground cursor-pointer"
                      >
                        I don't have a website yet
                      </label>
                    </div>
                  </div>

                  {error && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm text-destructive"
                    >
                      {error}
                    </motion.p>
                  )}

                  <Button type="submit" size="lg" className="w-full h-14 text-lg">
                    Analyze My Business
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>

                  <p className="text-center text-xs text-muted-foreground">
                    We use your website to understand your business context.
                    <br />
                    No login required. No credit card.
                  </p>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="analyzing"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12"
              >
                <div className="w-20 h-20 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center mb-8">
                  <Sparkles className="w-10 h-10 text-primary animate-pulse" />
                </div>
                
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-4">
                  Analyzing Your Business
                </h2>
                
                <motion.p
                  key={currentMessage}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-lg text-muted-foreground mb-8"
                >
                  {analysisMessages[currentMessage]}
                </motion.p>

                <div className="max-w-xs mx-auto">
                  <Progress value={progress} className="h-1" />
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
