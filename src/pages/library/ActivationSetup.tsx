import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, CheckCircle, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import LibraryNavbar from '@/components/library/LibraryNavbar';
import LibraryFooter from '@/components/library/LibraryFooter';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import SEO from '@/components/SEO';
import { toast } from 'sonner';

const TOOLS_OPTIONS = [
  'Gmail / Google Workspace',
  'Slack',
  'HubSpot',
  'Shopify',
  'WooCommerce',
  'Twilio',
  'Discord',
  'Telegram',
  'Notion',
  'ClickUp',
  'Other',
];

const SETUP_WINDOWS = [
  'ASAP',
  'Within 24 hours',
  'This week',
];

const ActivationSetup = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    businessName: '',
    contactEmail: user?.email || '',
    phone: '',
    purchaseType: 'automation',
    itemName: '',
    selectedTools: [] as string[],
    setupWindow: 'ASAP',
    notes: '',
  });

  const handleToolToggle = (tool: string) => {
    setFormData(prev => ({
      ...prev,
      selectedTools: prev.selectedTools.includes(tool)
        ? prev.selectedTools.filter(t => t !== tool)
        : [...prev.selectedTools, tool],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.businessName || !formData.contactEmail) {
      toast.error('Please fill in required fields');
      return;
    }

    setLoading(true);

    try {
      // Save to installation_requests table
      const { error } = await supabase
        .from('installation_requests')
        .insert({
          name: formData.businessName,
          email: formData.contactEmail,
          company: formData.businessName,
          purchased_item: formData.itemName || `${formData.purchaseType} (unspecified)`,
          preferred_systems: formData.selectedTools.join(', '),
          notes: `Phone: ${formData.phone || 'Not provided'}\nSetup Window: ${formData.setupWindow}\n\n${formData.notes}`,
        });

      if (error) throw error;

      setSubmitted(true);
      toast.success('Setup request received!');
    } catch (err) {
      console.error('Error submitting activation setup:', err);
      toast.error('Failed to submit. Please try again or contact us directly.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <>
        <SEO
          title="Setup Request Received"
          description="Your activation setup request has been received. We'll be in touch shortly."
        />
        <div className="min-h-screen bg-background">
          <LibraryNavbar />
          <section className="section-padding">
            <div className="container-main max-w-xl text-center">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-primary" />
              </div>
              <h1 className="text-3xl font-semibold text-foreground mb-4">
                Setup Request Received
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                Thank you for submitting your activation setup request. Our team will reach out shortly to guide you through the connection process.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button onClick={() => navigate('/dashboard')}>
                  Go to Dashboard
                </Button>
                <Button variant="outline" onClick={() => navigate('/automations')}>
                  Browse More Automations
                </Button>
              </div>
            </div>
          </section>
          <LibraryFooter />
        </div>
      </>
    );
  }

  return (
    <>
      <SEO
        title="Activation Setup"
        description="Tell us what to connect. We'll activate your automation quickly."
        keywords="activation, setup, hosted automation, connect tools"
      />

      <div className="min-h-screen bg-background">
        <LibraryNavbar />

        <section className="section-padding !pt-12">
          <div className="container-main max-w-2xl">
            <div className="text-center mb-10">
              <h1 className="text-3xl font-semibold text-foreground mb-3">
                Activation Setup
              </h1>
              <p className="text-lg text-muted-foreground">
                Tell us what to connect. We'll activate your automation quickly.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Business Name */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Business Name <span className="text-destructive">*</span>
                </label>
                <Input
                  type="text"
                  value={formData.businessName}
                  onChange={(e) => setFormData(prev => ({ ...prev, businessName: e.target.value }))}
                  placeholder="Your company or business name"
                  required
                />
              </div>

              {/* Contact Email */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Contact Email <span className="text-destructive">*</span>
                </label>
                <Input
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
                  placeholder="your@email.com"
                  required
                />
              </div>

              {/* Phone (Optional) */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Phone <span className="text-muted-foreground">(optional)</span>
                </label>
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              {/* Purchase Type */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  What did you purchase?
                </label>
                <select
                  value={formData.purchaseType}
                  onChange={(e) => setFormData(prev => ({ ...prev, purchaseType: e.target.value }))}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm"
                >
                  <option value="automation">Hosted Automation</option>
                  <option value="bundle">System Bundle</option>
                </select>
              </div>

              {/* Item Name */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Automation/Bundle Name
                </label>
                <Input
                  type="text"
                  value={formData.itemName}
                  onChange={(e) => setFormData(prev => ({ ...prev, itemName: e.target.value }))}
                  placeholder="e.g., Lead Intake Router, Sales Operations Bundle"
                />
              </div>

              {/* Tools to Connect */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-3">
                  Tools to Connect
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {TOOLS_OPTIONS.map((tool) => (
                    <label
                      key={tool}
                      className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                        formData.selectedTools.includes(tool)
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <Checkbox
                        checked={formData.selectedTools.includes(tool)}
                        onCheckedChange={() => handleToolToggle(tool)}
                      />
                      <span className="text-sm">{tool}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Setup Window */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Preferred Setup Window
                </label>
                <select
                  value={formData.setupWindow}
                  onChange={(e) => setFormData(prev => ({ ...prev, setupWindow: e.target.value }))}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm"
                >
                  {SETUP_WINDOWS.map((window) => (
                    <option key={window} value={window}>{window}</option>
                  ))}
                </select>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Additional Notes
                </label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Any specific requirements or questions..."
                  rows={4}
                />
              </div>

              {/* Submit */}
              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Submit Setup Request
                  </>
                )}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Questions? Contact us at{' '}
                <a href="mailto:contact@aerelion.systems" className="text-primary hover:underline">
                  contact@aerelion.systems
                </a>
              </p>
            </form>
          </div>
        </section>

        <LibraryFooter />
      </div>
    </>
  );
};

export default ActivationSetup;
