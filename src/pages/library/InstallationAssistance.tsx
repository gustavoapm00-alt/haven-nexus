import { useState } from 'react';
import { Wrench, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import LibraryNavbar from '@/components/library/LibraryNavbar';
import LibraryFooter from '@/components/library/LibraryFooter';
import SEO from '@/components/SEO';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const InstallationAssistance = () => {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    purchased_item: '',
    preferred_systems: '',
    notes: '',
  });

  const services = [
    {
      title: 'Installation Assistance (per agent)',
      price: '$149',
      description: 'Hands-on help deploying a single automation agent to your n8n instance.',
    },
    {
      title: 'Bundle Installation',
      price: '$299',
      description: 'Complete deployment of an entire automation bundle with all included agents.',
    },
    {
      title: 'Customization Session (30 minutes)',
      price: '$99',
      description: 'One-on-one consultation to customize workflow logic, messages, or integrations.',
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email) {
      toast.error('Please fill in required fields');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('installation_requests')
        .insert({
          name: formData.name.trim(),
          email: formData.email.trim(),
          company: formData.company.trim() || null,
          purchased_item: formData.purchased_item.trim() || null,
          preferred_systems: formData.preferred_systems.trim() || null,
          notes: formData.notes.trim() || null,
        });

      if (error) throw error;
      
      setSubmitted(true);
      toast.success('Request submitted successfully');
    } catch (error) {
      console.error('Installation request error:', error);
      toast.error('Failed to submit request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <>
      <SEO
        title="Installation Assistance"
        description="Get hands-on help deploying automation agents. Installation, bundle setup, and customization services available."
        keywords="installation, deployment help, automation setup, n8n installation"
      />

      <div className="min-h-screen bg-background">
        <LibraryNavbar />

        <section className="section-padding !pt-12">
          <div className="container-main max-w-4xl">
            <div className="flex items-center gap-3 mb-6">
              <Wrench className="w-8 h-8 text-primary" />
              <h1 className="text-3xl font-semibold text-foreground">
                Installation Assistance
              </h1>
            </div>
            
            <p className="text-lg text-muted-foreground leading-relaxed mb-12">
              Need help deploying an automation agent? Our installation services provide hands-on assistance to get you up and running.
            </p>

            {/* Services */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
              {services.map((service) => (
                <div key={service.title} className="card-enterprise p-6">
                  <h3 className="font-semibold text-foreground mb-2">{service.title}</h3>
                  <p className="text-2xl font-semibold text-primary mb-3">{service.price}</p>
                  <p className="text-sm text-muted-foreground">{service.description}</p>
                </div>
              ))}
            </div>

            {/* Request Form */}
            <div className="card-enterprise p-8">
              <h2 className="text-xl font-semibold text-foreground mb-6">
                Request Installation Assistance
              </h2>

              {submitted ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Check className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Request Received</h3>
                  <p className="text-muted-foreground">
                    We'll be in touch within 1 business day to schedule your installation.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="name">Name *</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="mt-1.5"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="mt-1.5"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="company">Company</Label>
                    <Input
                      id="company"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      className="mt-1.5"
                    />
                  </div>

                  <div>
                    <Label htmlFor="purchased_item">What did you purchase?</Label>
                    <Input
                      id="purchased_item"
                      name="purchased_item"
                      value={formData.purchased_item}
                      onChange={handleChange}
                      placeholder="e.g., Form Submission Agent, Lead Capture Bundle"
                      className="mt-1.5"
                    />
                  </div>

                  <div>
                    <Label htmlFor="preferred_systems">Preferred systems / tools</Label>
                    <Input
                      id="preferred_systems"
                      name="preferred_systems"
                      value={formData.preferred_systems}
                      onChange={handleChange}
                      placeholder="e.g., Gmail, Slack, Google Sheets"
                      className="mt-1.5"
                    />
                  </div>

                  <div>
                    <Label htmlFor="notes">Additional notes</Label>
                    <Textarea
                      id="notes"
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      rows={4}
                      className="mt-1.5"
                    />
                  </div>

                  <Button type="submit" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      'Submit Request'
                    )}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </section>

        <LibraryFooter />
      </div>
    </>
  );
};

export default InstallationAssistance;
