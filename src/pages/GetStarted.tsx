import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowRight, AlertCircle, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ScrollReveal from '@/components/ScrollReveal';
import SEO from '@/components/SEO';

type EntryMode = 'deployment' | 'audit' | 'self-serve' | 'disqualified' | null;

interface FormData {
  name: string;
  email: string;
  friction: string;
  currentState: string;
  toolCount: string;
  fortyEightHours: string;
  responsibility: string;
  decisionMaker: string;
  acknowledgement: boolean;
  additionalContext: string;
}

const frictionOptions = [
  { value: 'leads-followup', label: 'Leads / Follow-up' },
  { value: 'fulfillment', label: 'Fulfillment' },
  { value: 'customer-support', label: 'Customer Support' },
  { value: 'internal-tasks', label: 'Internal Tasks' },
  { value: 'reporting-visibility', label: 'Reporting / Visibility' },
  { value: 'tool-chaos', label: 'Tool Chaos' },
  { value: 'other', label: 'Other' }
];

const currentStateOptions = [
  { value: 'overwhelmed', label: "I'm overwhelmed and need this designed and deployed" },
  { value: 'need-clarity', label: "I'm not sure what's broken and need clarity" },
  { value: 'prefer-self-serve', label: "I'm exploring and prefer self-serve" }
];

const toolCountOptions = [
  { value: '1-2', label: '1–2 tools' },
  { value: '3-5', label: '3–5 tools' },
  { value: '6+', label: '6+ tools' }
];

const fortyEightHoursOptions = [
  { value: 'things-slip', label: 'Things slip' },
  { value: 'someone-fills-gaps', label: 'Someone fills gaps manually' },
  { value: 'systems-hold', label: 'Systems mostly hold' },
  { value: 'not-sure', label: 'Not sure' }
];

const responsibilityOptions = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
  { value: 'not-sure', label: 'Not sure' }
];

const decisionMakerOptions = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' }
];

const GetStarted = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<EntryMode>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    friction: '',
    currentState: '',
    toolCount: '',
    fortyEightHours: '',
    responsibility: '',
    decisionMaker: '',
    acknowledgement: false,
    additionalContext: ''
  });

  // Pre-select based on URL param
  useEffect(() => {
    const mode = searchParams.get('mode');
    if (mode === 'deployment') {
      setFormData(prev => ({ ...prev, currentState: 'overwhelmed' }));
    } else if (mode === 'audit') {
      setFormData(prev => ({ ...prev, currentState: 'need-clarity' }));
    }
  }, [searchParams]);

  const handleChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const calculateRouting = (): EntryMode => {
    const { currentState, responsibility, fortyEightHours, friction, decisionMaker } = formData;

    // Disqualify if not decision-maker
    if (decisionMaker === 'no') {
      return 'disqualified';
    }

    // Route to Deployment
    if (currentState === 'overwhelmed') {
      return 'deployment';
    }
    if (responsibility === 'yes' && (fortyEightHours === 'things-slip' || fortyEightHours === 'someone-fills-gaps')) {
      return 'deployment';
    }

    // Route to Audit
    if (currentState === 'need-clarity') {
      return 'audit';
    }
    if (responsibility === 'not-sure' && (friction === 'tool-chaos' || friction === 'reporting-visibility')) {
      return 'audit';
    }

    // Route to Self-Serve
    if (currentState === 'prefer-self-serve') {
      return 'self-serve';
    }
    if (responsibility === 'no') {
      return 'self-serve';
    }

    // Default to audit if unclear
    return 'audit';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.acknowledgement) {
      toast({
        title: "Acknowledgement Required",
        description: "Please confirm that you understand AERELION builds operational systems (not quick hacks, not outcome guarantees).",
        variant: "destructive"
      });
      return;
    }

    if (!formData.name || !formData.email || !formData.decisionMaker) {
      toast({
        title: "Required Fields",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    const routedMode = calculateRouting();
    setResult(routedMode);

    try {
      // Store the intake submission
      const { error } = await supabase
        .from('contact_submissions')
        .insert([{
          name: formData.name,
          email: formData.email,
          message: `[INTAKE FORM - Routed to: ${routedMode?.toUpperCase()}]
          
Friction Area: ${formData.friction}
Current State: ${formData.currentState}
Tool Count: ${formData.toolCount}
48-Hour Test: ${formData.fortyEightHours}
Wants AERELION Responsibility: ${formData.responsibility}
Decision Maker: ${formData.decisionMaker}

Additional Context:
${formData.additionalContext || 'None provided'}`
        }]);

      if (error) throw error;

      toast({
        title: "Submission Received",
        description: "We'll be in touch within 24-48 hours."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderResult = () => {
    if (!result) return null;

    if (result === 'disqualified') {
      return (
        <div className="card-glass p-8 rounded-lg text-center max-w-2xl mx-auto">
          <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="font-display text-2xl mb-4">Bring the Decision-Maker</h3>
          <p className="text-muted-foreground mb-6">
            AERELION works directly with decision-makers to ensure alignment from the start. 
            Please share this page with the person who can authorize system changes.
          </p>
          <button 
            onClick={() => setResult(null)}
            className="btn-secondary"
          >
            Back to Form
          </button>
        </div>
      );
    }

    const resultContent: Record<string, { title: string; description: string; next: string; cta?: { label: string; href: string } }> = {
      deployment: {
        title: 'Guided System Deployment',
        description: 'Based on your responses, you\'re a great fit for Guided System Deployment. We\'ll design and deploy operational systems for you.',
        next: 'We\'ll reach out within 24-48 hours to schedule a discovery call and understand your operations in depth.'
      },
      audit: {
        title: 'System Audit & Diagnosis',
        description: 'Based on your responses, starting with a System Audit makes sense. We\'ll review your current state and deliver clear recommendations.',
        next: 'We\'ll reach out within 24-48 hours to schedule your audit session.'
      },
      'self-serve': {
        title: 'Self-Serve Platform Access',
        description: 'Based on your responses, you prefer to explore independently. The AERELION platform gives you access to prebuilt workflows and tools.',
        next: 'You can explore platform plans now, or we\'ll follow up with more information.',
        cta: { label: 'View Platform Plans', href: '/pricing' }
      }
    };

    const content = resultContent[result];

    return (
      <div className="card-glass p-8 rounded-lg text-center max-w-2xl mx-auto">
        <Check className="h-12 w-12 text-green-500 mx-auto mb-4" />
        <h3 className="font-display text-2xl mb-4">{content.title}</h3>
        <p className="text-muted-foreground mb-4">{content.description}</p>
        <p className="text-sm text-muted-foreground/80 mb-6">{content.next}</p>
        {content.cta && (
          <button 
            onClick={() => navigate(content.cta!.href)}
            className="btn-primary"
          >
            {content.cta.label}
            <ArrowRight className="ml-2 h-4 w-4" />
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Get Started"
        description="Tell us about your operational friction. We'll help route you to the right engagement path with AERELION Systems."
        canonicalUrl="/get-started"
      />
      <Navbar />
      
      <main className="pt-24">
        <section className="section-padding">
          <div className="container-main max-w-3xl">
            <ScrollReveal>
              <div className="text-center mb-12">
                <span className="tag-chip mb-6">Qualification Intake</span>
                <h1 className="font-display text-4xl md:text-5xl mb-6">
                  LET'S FIND YOUR <span className="text-gradient">PATH</span>
                </h1>
                <p className="text-muted-foreground">
                  Answer a few questions about your operations. We'll route you to the right entry mode.
                </p>
              </div>
            </ScrollReveal>

            {result ? (
              <ScrollReveal>{renderResult()}</ScrollReveal>
            ) : (
              <ScrollReveal delay={0.1}>
                <form onSubmit={handleSubmit} className="card-glass p-8 rounded-lg space-y-8">
                  {/* Contact Info */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">Name *</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        className="w-full px-4 py-3 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Email *</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        className="w-full px-4 py-3 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                        required
                      />
                    </div>
                  </div>

                  {/* Q1: Friction */}
                  <div>
                    <label className="block text-sm font-medium mb-3">
                      Where are you feeling the most operational friction?
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {frictionOptions.map(opt => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => handleChange('friction', opt.value)}
                          className={`px-4 py-2 rounded-md text-sm border transition-colors ${
                            formData.friction === opt.value
                              ? 'bg-primary text-primary-foreground border-primary'
                              : 'bg-background border-border hover:border-primary/50'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Q2: Current State */}
                  <div>
                    <label className="block text-sm font-medium mb-3">
                      What best describes your current state?
                    </label>
                    <div className="space-y-3">
                      {currentStateOptions.map(opt => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => handleChange('currentState', opt.value)}
                          className={`w-full px-4 py-3 rounded-md text-sm border text-left transition-colors ${
                            formData.currentState === opt.value
                              ? 'bg-primary text-primary-foreground border-primary'
                              : 'bg-background border-border hover:border-primary/50'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Q3: Tool Count */}
                  <div>
                    <label className="block text-sm font-medium mb-3">
                      How many tools are involved in your operations today?
                    </label>
                    <div className="flex gap-3">
                      {toolCountOptions.map(opt => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => handleChange('toolCount', opt.value)}
                          className={`flex-1 px-4 py-2 rounded-md text-sm border transition-colors ${
                            formData.toolCount === opt.value
                              ? 'bg-primary text-primary-foreground border-primary'
                              : 'bg-background border-border hover:border-primary/50'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Q4: 48 Hours */}
                  <div>
                    <label className="block text-sm font-medium mb-3">
                      What happens when you step away for 48 hours?
                    </label>
                    <div className="grid md:grid-cols-2 gap-3">
                      {fortyEightHoursOptions.map(opt => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => handleChange('fortyEightHours', opt.value)}
                          className={`px-4 py-2 rounded-md text-sm border transition-colors ${
                            formData.fortyEightHours === opt.value
                              ? 'bg-primary text-primary-foreground border-primary'
                              : 'bg-background border-border hover:border-primary/50'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Q5: Responsibility */}
                  <div>
                    <label className="block text-sm font-medium mb-3">
                      Do you want AERELION to take responsibility for system design and deployment?
                    </label>
                    <div className="flex gap-3">
                      {responsibilityOptions.map(opt => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => handleChange('responsibility', opt.value)}
                          className={`flex-1 px-4 py-2 rounded-md text-sm border transition-colors ${
                            formData.responsibility === opt.value
                              ? 'bg-primary text-primary-foreground border-primary'
                              : 'bg-background border-border hover:border-primary/50'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Q6: Decision Maker */}
                  <div>
                    <label className="block text-sm font-medium mb-3">
                      Are you the decision-maker? *
                    </label>
                    <div className="flex gap-3">
                      {decisionMakerOptions.map(opt => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => handleChange('decisionMaker', opt.value)}
                          className={`flex-1 px-4 py-2 rounded-md text-sm border transition-colors ${
                            formData.decisionMaker === opt.value
                              ? 'bg-primary text-primary-foreground border-primary'
                              : 'bg-background border-border hover:border-primary/50'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Additional Context */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Anything else we should know? (Optional)
                    </label>
                    <textarea
                      value={formData.additionalContext}
                      onChange={(e) => handleChange('additionalContext', e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                      placeholder="Describe your situation briefly..."
                    />
                  </div>

                  {/* Acknowledgement Gate */}
                  <div className="border-t border-border pt-6">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.acknowledgement}
                        onChange={(e) => handleChange('acknowledgement', e.target.checked)}
                        className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary"
                      />
                      <span className="text-sm text-muted-foreground">
                        I understand AERELION builds operational systems (not quick hacks, not outcome guarantees). *
                      </span>
                    </label>
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-primary w-full justify-center"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit & Find My Path'}
                    {!isSubmitting && <ArrowRight className="ml-2 h-4 w-4" />}
                  </button>
                </form>
              </ScrollReveal>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default GetStarted;
