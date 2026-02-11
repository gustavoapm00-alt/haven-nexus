import { useState } from 'react';
import { Check, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import SEO from '@/components/SEO';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const InstallationAssistance = () => {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '', email: '', company: '', purchased_item: '', preferred_systems: '', notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      toast.error('Required fields missing');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.from('installation_requests').insert({
        name: formData.name.trim(), email: formData.email.trim(),
        company: formData.company.trim() || null, purchased_item: formData.purchased_item.trim() || null,
        preferred_systems: formData.preferred_systems.trim() || null, notes: formData.notes.trim() || null,
      });
      if (error) throw error;
      setSubmitted(true);
      toast.success('Authorization request submitted');
    } catch (error) {
      console.error('Request error:', error);
      toast.error('Submission failed. Retry.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <>
      <SEO
        title="Activation Authorization – AERELION Systems"
        description="Submit an activation authorization request for protocol deployment assistance."
      />

      <div className="min-h-screen bg-[#0F0F0F]">
        <section className="section-padding !pt-12">
          <div className="container-main max-w-4xl">
            <span className="font-mono text-[10px] text-[#39FF14]/50 uppercase tracking-[0.25em] mb-3 block">
              // ACTIVATION AUTHORIZATION
            </span>
            <h1 className="font-mono text-3xl font-semibold text-[#E0E0E0] mb-3">
              Protocol Deployment Authorization
            </h1>
            <p className="font-sans text-base text-white/40 leading-relaxed mb-12">
              Submit an authorization request for protocol activation and deployment support.
            </p>

            {/* Request Form */}
            <div className="border border-white/10 p-8">
              <span className="font-mono text-[9px] text-[#39FF14]/40 uppercase tracking-[0.2em] mb-6 block">
                AUTHORIZATION_FORM
              </span>

              {submitted ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 border border-[rgba(57,255,20,0.3)] flex items-center justify-center mx-auto mb-4">
                    <Check className="w-6 h-6 text-[#39FF14]" />
                  </div>
                  <h3 className="font-mono text-sm text-[#E0E0E0] mb-2">AUTHORIZATION_RECEIVED</h3>
                  <p className="font-sans text-sm text-white/35">
                    Your request has been logged. Expect operational response within 24 hours.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="name" className="font-mono text-[10px] text-white/30 uppercase tracking-wider">ENTITY_NAME *</Label>
                      <Input id="name" name="name" value={formData.name} onChange={handleChange} required className="mt-1.5" />
                    </div>
                    <div>
                      <Label htmlFor="email" className="font-mono text-[10px] text-white/30 uppercase tracking-wider">FREQUENCY *</Label>
                      <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required className="mt-1.5" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="company" className="font-mono text-[10px] text-white/30 uppercase tracking-wider">ORGANIZATION</Label>
                    <Input id="company" name="company" value={formData.company} onChange={handleChange} className="mt-1.5" />
                  </div>
                  <div>
                    <Label htmlFor="purchased_item" className="font-mono text-[10px] text-white/30 uppercase tracking-wider">PROTOCOL_REFERENCE</Label>
                    <Input id="purchased_item" name="purchased_item" value={formData.purchased_item} onChange={handleChange} placeholder="e.g., Form Submission Protocol, Lead Capture System" className="mt-1.5" />
                  </div>
                  <div>
                    <Label htmlFor="preferred_systems" className="font-mono text-[10px] text-white/30 uppercase tracking-wider">SYSTEM_DEPENDENCIES</Label>
                    <Input id="preferred_systems" name="preferred_systems" value={formData.preferred_systems} onChange={handleChange} placeholder="e.g., Gmail, Slack, Google Sheets" className="mt-1.5" />
                  </div>
                  <div>
                    <Label htmlFor="notes" className="font-mono text-[10px] text-white/30 uppercase tracking-wider">OPERATIONAL_NOTES</Label>
                    <Textarea id="notes" name="notes" value={formData.notes} onChange={handleChange} rows={4} className="mt-1.5" />
                  </div>
                  <button type="submit" disabled={loading} className="btn-launch-primary w-full">
                    {loading ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" />TRANSMITTING...</>
                    ) : 'SUBMIT AUTHORIZATION REQUEST'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default InstallationAssistance;
