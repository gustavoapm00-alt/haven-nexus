import { useState } from 'react';
import { Send, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { contactFormSchema } from '@/lib/validations';
import SEO, { schemas } from '@/components/SEO';

interface FormErrors {
  name?: string;
  email?: string;
  message?: string;
}

const Contact = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = contactFormSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: FormErrors = {};
      result.error.errors.forEach(err => {
        if (err.path[0]) fieldErrors[err.path[0] as keyof FormErrors] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('contact_submissions').insert([{
        name: result.data.name,
        email: result.data.email,
        message: result.data.message
      }]);
      if (error) throw error;
      toast({ title: "Transmission received", description: "Your briefing request has been logged. Expect response within 24-48 hours." });
      setFormData({ name: '', email: '', message: '' });
    } catch {
      toast({ title: "Transmission failed", description: "System error. Retry or contact contact@aerelion.systems.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F0F0F]">
      <SEO 
        title="Uplink Terminal – AERELION Systems"
        description="Initiate operational briefing with AERELION Systems. Submit a transmission to discuss system stabilization and governance requirements."
        canonicalUrl="/contact"
        structuredData={[
          schemas.breadcrumb([{ name: 'Home', url: '/' }, { name: 'Uplink', url: '/contact' }]),
          schemas.webPage("AERELION Uplink Terminal", "Initiate operational briefing", "/contact")
        ]}
      />
      
      <main className="pt-8">
        <section className="section-padding">
          <div className="container-main max-w-4xl">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <span className="font-mono text-[10px] text-[#39FF14]/50 uppercase tracking-[0.25em] mb-3 block">
                // UPLINK TERMINAL
              </span>
              <h1 className="font-mono text-3xl md:text-4xl font-semibold text-[#E0E0E0] mb-4">
                Initiate System Handoff
              </h1>
              <p className="font-sans text-base text-white/40">
                Submit a transmission to discuss operational requirements. Response within 24-48 hours.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-12">
              {/* Protocol Info */}
              <div>
                <span className="font-mono text-[9px] text-white/20 uppercase tracking-[0.2em] mb-4 block">
                  ENGAGEMENT_PROTOCOL
                </span>
                
                <div className="space-y-4">
                  {[
                    { id: '01', title: 'Operational Briefing', desc: '30-minute assessment of system topology and friction vectors' },
                    { id: '02', title: 'Scoped Authorization', desc: 'Fixed scope, fixed parameters, outcome-governed' },
                    { id: '03', title: 'Direct Channel', desc: 'contact@aerelion.systems' },
                  ].map((item) => (
                    <div key={item.id} className="flex items-start gap-4 p-4 border border-white/10">
                      <div className="w-10 h-10 border border-[rgba(57,255,20,0.2)] flex items-center justify-center flex-shrink-0">
                        <span className="font-mono text-xs text-[#39FF14]/50">[{item.id}]</span>
                      </div>
                      <div>
                        <p className="font-mono text-sm text-[#E0E0E0]">{item.title}</p>
                        <p className="font-sans text-xs text-white/30">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 border border-white/10">
                  <span className="font-mono text-[9px] text-white/20 uppercase tracking-[0.2em] mb-2 block">RESPONSE_SLA</span>
                  <p className="font-sans text-sm text-white/35">
                    Transmissions are processed within 24-48 operational hours.
                  </p>
                </div>
              </div>

              {/* Transmission Form */}
              <div className="border border-white/10 p-8">
                <span className="font-mono text-[9px] text-[#39FF14]/40 uppercase tracking-[0.2em] mb-6 block">
                  TRANSMISSION_FORM
                </span>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="font-mono text-[10px] text-white/30 uppercase tracking-wider block mb-2">
                      TRANSMISSION_SOURCE
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`input-terminal w-full ${errors.name ? 'border-red-500' : ''}`}
                      placeholder="Entity identifier"
                    />
                    {errors.name && <p className="text-red-400 text-xs mt-1 font-mono">{errors.name}</p>}
                  </div>

                  <div>
                    <label htmlFor="email" className="font-mono text-[10px] text-white/30 uppercase tracking-wider block mb-2">
                      FREQUENCY
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`input-terminal w-full ${errors.email ? 'border-red-500' : ''}`}
                      placeholder="contact@entity.com"
                    />
                    {errors.email && <p className="text-red-400 text-xs mt-1 font-mono">{errors.email}</p>}
                  </div>

                  <div>
                    <label htmlFor="message" className="font-mono text-[10px] text-white/30 uppercase tracking-wider block mb-2">
                      PAYLOAD
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows={5}
                      className={`input-terminal w-full resize-none ${errors.message ? 'border-red-500' : ''}`}
                      placeholder="Describe operational requirements..."
                    />
                    {errors.message && <p className="text-red-400 text-xs mt-1 font-mono">{errors.message}</p>}
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-launch-primary w-full"
                  >
                    {isSubmitting ? 'TRANSMITTING...' : (
                      <>
                        INITIATE SYSTEM HANDOFF
                        <Send className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Contact;
