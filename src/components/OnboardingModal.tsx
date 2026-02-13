import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Package, FileJson, ArrowRight, Sparkles, CheckCircle } from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName?: string;
}

const steps = [
  {
    id: 'welcome',
    icon: Sparkles,
    title: 'Welcome to AERELION',
    description: 'Your platform for hosted automation systems. Browse, activate, and let us handle the rest.',
    highlight: 'We configure and maintain everything for you.',
  },
  {
    id: 'browse',
    icon: Package,
    title: 'Browse Hosted Automations',
    description: 'Explore our library of automation systems. Each one is hosted and maintained on our infrastructure.',
    highlight: 'Find the right automation for your stack.',
  },
  {
    id: 'activate',
    icon: CheckCircle,
    title: 'Activate Your Automation',
    description: 'After purchase, connect your tools securely and we activate the automation for you.',
    highlight: 'We handle setup and configuration.',
  },
  {
    id: 'maintain',
    icon: FileJson,
    title: 'We Monitor and Maintain',
    description: 'Your automation runs on our infrastructure. We handle updates, monitoring, and support.',
    highlight: 'Stay focused on your business.',
  },
];

export const OnboardingModal = ({ isOpen, onClose, userName }: OnboardingModalProps) => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    localStorage.setItem('aerelion_onboarding_complete', 'true');
    onClose();
  };

  const currentStepData = steps[currentStep];
  const Icon = currentStepData.icon;
  const isLastStep = currentStep === steps.length - 1;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={handleSkip}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Close button */}
            <button
              onClick={handleSkip}
              className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground transition-colors z-10"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Progress indicators */}
            <div className="absolute top-4 left-4 flex gap-1.5 z-10">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    index === currentStep
                      ? 'w-6 bg-primary'
                      : index < currentStep
                      ? 'w-3 bg-primary/50'
                      : 'w-3 bg-border'
                  }`}
                />
              ))}
            </div>

            {/* Content */}
            <div className="pt-14 pb-6 px-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="text-center"
                >
                  {/* Icon */}
                  <div className="mx-auto mb-6 w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <Icon className="w-10 h-10 text-primary" />
                  </div>

                  {/* Title */}
                  <h2 className="font-display text-2xl mb-3">
                    {currentStep === 0 && userName
                      ? `Welcome, ${userName.split(' ')[0]}!`
                      : currentStepData.title}
                  </h2>

                  {/* Description */}
                  <p className="text-muted-foreground mb-4 leading-relaxed">
                    {currentStepData.description}
                  </p>

                  {/* Highlight */}
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/5 border border-primary/20 rounded-full text-sm text-primary">
                    <CheckCircle className="w-4 h-4" />
                    {currentStepData.highlight}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="px-8 pb-6 flex items-center justify-between">
              <button
                onClick={handleSkip}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Skip tour
              </button>

              <button
                onClick={handleNext}
                className="btn-primary inline-flex items-center gap-2"
              >
                {isLastStep ? (
                  <>
                    VIEW CAPABILITY MATRIX
                    <Sparkles className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const useOnboarding = () => {
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const hasCompleted = localStorage.getItem('aerelion_onboarding_complete');
    if (!hasCompleted) {
      // Small delay to let the page load first
      const timer = setTimeout(() => setShowOnboarding(true), 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const closeOnboarding = () => setShowOnboarding(false);

  const resetOnboarding = () => {
    localStorage.removeItem('aerelion_onboarding_complete');
    setShowOnboarding(true);
  };

  return { showOnboarding, closeOnboarding, resetOnboarding };
};
