import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useClientProfile } from '@/hooks/useClientProfile';
import { toast } from '@/hooks/use-toast';
import { 
  Loader2, CheckCircle, User, Target, ClipboardCheck,
  ChevronRight, ChevronLeft, Building2, Globe, Shield
} from 'lucide-react';
import PortalBackground from '@/components/portal/PortalBackground';
import { GlassCard } from '@/components/portal/GlassCard';

const TIMEZONES = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Anchorage',
  'Pacific/Honolulu',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Asia/Dubai',
  'Australia/Sydney',
];

const GOALS = [
  { id: 'lead_automation', label: 'Lead Automation', description: 'Automate lead capture and nurturing' },
  { id: 'internal_ops', label: 'Internal Operations', description: 'Streamline internal workflows' },
  { id: 'reporting', label: 'Reporting & Analytics', description: 'Automated reports and dashboards' },
  { id: 'client_comms', label: 'Client Communications', description: 'Automated appointment reminders and follow-ups' },
  { id: 'document_mgmt', label: 'Document Management', description: 'Automate document processing and organization' },
];

const steps = [
  { id: 1, title: 'Profile', icon: User },
  { id: 2, title: 'Goals', icon: Target },
  { id: 3, title: 'Review', icon: ClipboardCheck },
];

const ClientOnboarding = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [timezone, setTimezone] = useState('America/New_York');
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [primaryGoal, setPrimaryGoal] = useState('');

  const { user, isLoading: authLoading } = useAuth();
  const { profile, isLoading: profileLoading, updateProfile } = useClientProfile();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/portal/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (profile?.onboarding_complete) {
      navigate('/portal/dashboard');
    }
    // Pre-fill from profile
    if (profile) {
      if (profile.full_name) setFullName(profile.full_name);
      if (profile.company_name) setCompanyName(profile.company_name);
      if (profile.timezone) setTimezone(profile.timezone);
      if (profile.goals) setSelectedGoals(profile.goals);
      if (profile.primary_goal) setPrimaryGoal(profile.primary_goal);
    }
  }, [profile, navigate]);

  const toggleGoal = (goalId: string) => {
    setSelectedGoals(prev => 
      prev.includes(goalId) 
        ? prev.filter(g => g !== goalId)
        : [...prev, goalId]
    );
    // Auto-set primary goal if none selected
    if (!primaryGoal && !selectedGoals.includes(goalId)) {
      setPrimaryGoal(goalId);
    }
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (!fullName.trim()) {
        toast({ title: 'Please enter your name', variant: 'destructive' });
        return;
      }
    }
    if (currentStep === 2) {
      if (selectedGoals.length === 0) {
        toast({ title: 'Please select at least one goal', variant: 'destructive' });
        return;
      }
      if (!primaryGoal) {
        setPrimaryGoal(selectedGoals[0]);
      }
    }
    setCurrentStep(prev => Math.min(prev + 1, 3));
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSkip = async () => {
    // Save partial data and go to dashboard
    setIsSubmitting(true);
    try {
      await updateProfile({
        full_name: fullName || null,
        company_name: companyName || null,
        timezone,
        goals: selectedGoals,
        primary_goal: primaryGoal || null,
        onboarding_complete: false,
      });
      navigate('/portal/dashboard');
    } catch {
      toast({ title: 'Error saving data', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinish = async () => {
    setIsSubmitting(true);
    try {
      await updateProfile({
        full_name: fullName,
        company_name: companyName || null,
        timezone,
        goals: selectedGoals,
        primary_goal: primaryGoal || selectedGoals[0] || null,
        onboarding_complete: true,
      });

      toast({ title: 'Setup complete!', description: 'Welcome to AERELION.' });
      navigate('/portal/dashboard');
    } catch {
      toast({ title: 'Error completing setup', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || profileLoading) {
    return (
      <PortalBackground>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </PortalBackground>
    );
  }

  return (
    <PortalBackground>
      <div className="min-h-screen flex flex-col py-8 px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold">Welcome to AERELION</h1>
          <p className="text-muted-foreground mt-1">Let's set up your account</p>
        </div>

        {/* Progress Steps */}
        <div className="max-w-xl mx-auto w-full mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              const isActive = step.id === currentStep;
              const isComplete = step.id < currentStep;
              
              return (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div 
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                        isComplete 
                          ? 'bg-primary text-primary-foreground' 
                          : isActive 
                            ? 'bg-primary/20 text-primary border-2 border-primary' 
                            : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {isComplete ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <StepIcon className="w-5 h-5" />
                      )}
                    </div>
                    <span className={`text-xs mt-2 ${isActive ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                      {step.title}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-2 ${isComplete ? 'bg-primary' : 'bg-muted'}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        <div className="max-w-xl mx-auto w-full flex-1">
          <GlassCard className="p-6 md:p-8">
            {/* Step 1: Profile */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-1">Your Profile</h2>
                  <p className="text-muted-foreground text-sm">Tell us about yourself and your company</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      <User className="w-4 h-4 inline mr-2" />
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full px-4 py-3 bg-background/50 border border-border/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      <Building2 className="w-4 h-4 inline mr-2" />
                      Company Name
                    </label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Acme Inc."
                      className="w-full px-4 py-3 bg-background/50 border border-border/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      <Globe className="w-4 h-4 inline mr-2" />
                      Timezone
                    </label>
                    <select
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                      className="w-full px-4 py-3 bg-background/50 border border-border/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                      {TIMEZONES.map(tz => (
                        <option key={tz} value={tz}>{tz.replace('_', ' ')}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Goals */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-1">Your Goals</h2>
                  <p className="text-muted-foreground text-sm">What operational challenges can we help with?</p>
                </div>

                <div className="grid gap-3">
                  {GOALS.map(goal => (
                    <button
                      key={goal.id}
                      type="button"
                      onClick={() => toggleGoal(goal.id)}
                      className={`flex items-center p-4 rounded-lg border text-left transition-all ${
                        selectedGoals.includes(goal.id)
                          ? 'border-primary bg-primary/10'
                          : 'border-border/50 hover:border-border'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded border mr-3 flex items-center justify-center ${
                        selectedGoals.includes(goal.id) ? 'bg-primary border-primary' : 'border-muted-foreground'
                      }`}>
                        {selectedGoals.includes(goal.id) && (
                          <CheckCircle className="w-3 h-3 text-primary-foreground" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{goal.label}</p>
                        <p className="text-sm text-muted-foreground">{goal.description}</p>
                      </div>
                    </button>
                  ))}
                </div>

                {selectedGoals.length > 1 && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Primary Goal</label>
                    <select
                      value={primaryGoal}
                      onChange={(e) => setPrimaryGoal(e.target.value)}
                      className="w-full px-4 py-3 bg-background/50 border border-border/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                      {selectedGoals.map(goalId => {
                        const goal = GOALS.find(g => g.id === goalId);
                        return <option key={goalId} value={goalId}>{goal?.label}</option>;
                      })}
                    </select>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Review */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-1">Review & Confirm</h2>
                  <p className="text-muted-foreground text-sm">Confirm your information to complete setup</p>
                </div>

                <div className="space-y-4">
                  {/* Profile Summary */}
                  <div className="p-4 bg-muted/30 rounded-lg space-y-2">
                    <h3 className="font-medium text-sm flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Profile
                    </h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <span className="text-muted-foreground">Name:</span>
                      <span>{fullName}</span>
                      {companyName && (
                        <>
                          <span className="text-muted-foreground">Company:</span>
                          <span>{companyName}</span>
                        </>
                      )}
                      <span className="text-muted-foreground">Timezone:</span>
                      <span>{timezone.replace('_', ' ')}</span>
                    </div>
                  </div>

                  {/* Goals Summary */}
                  <div className="p-4 bg-muted/30 rounded-lg space-y-2">
                    <h3 className="font-medium text-sm flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      Goals
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedGoals.map(goalId => {
                        const goal = GOALS.find(g => g.id === goalId);
                        const isPrimary = goalId === primaryGoal;
                        return (
                          <span 
                            key={goalId}
                            className={`px-2 py-1 rounded text-xs ${
                              isPrimary 
                                ? 'bg-primary/20 text-primary font-medium' 
                                : 'bg-muted text-muted-foreground'
                            }`}
                          >
                            {goal?.label}
                            {isPrimary && ' (Primary)'}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {/* What happens next */}
                  <div className="p-4 border border-primary/30 bg-primary/5 rounded-lg">
                    <h3 className="font-medium text-sm flex items-center gap-2 mb-2">
                      <Shield className="w-4 h-4 text-primary" />
                      What happens next
                    </h3>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Browse our automation catalog and purchase what fits your needs</li>
                      <li>• When prompted, securely connect the required services</li>
                      <li>• AERELION will activate and maintain your automations</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-border/20">
              {currentStep > 1 ? (
                <button
                  onClick={handleBack}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </button>
              ) : (
                <button
                  onClick={handleSkip}
                  disabled={isSubmitting}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Skip for now
                </button>
              )}

              {currentStep < 3 ? (
                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  Continue
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleFinish}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      Complete Setup
                      <CheckCircle className="w-4 h-4" />
                    </>
                  )}
                </button>
              )}
            </div>
          </GlassCard>
        </div>
      </div>
    </PortalBackground>
  );
};

export default ClientOnboarding;
