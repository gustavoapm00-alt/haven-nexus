import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Send, ArrowRight, Phone, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { contactFormSchema } from '@/lib/validations';
import LibraryNavbar from '@/components/library/LibraryNavbar';
import LibraryFooter from '@/components/library/LibraryFooter';
import ScrollReveal from '@/components/ScrollReveal';
import SEO, { schemas } from '@/components/SEO';
import { Button } from '@/components/ui/button';

interface FormErrors {
  name?: string;
  email?: string;
  message?: string;
}

const Contact = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
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
        if (err.path[0]) {
          fieldErrors[err.path[0] as keyof FormErrors] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('contact_submissions')
        .insert([{
          name: result.data.name,
          email: result.data.email,
          message: result.data.message
        }]);

      if (error) throw error;

      toast({
        title: "Message received",
        description: "We'll review your inquiry and respond within 24-48 hours.",
      });

      setFormData({ name: '', email: '', message: '' });
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Contact AERELION – Schedule a Discovery Call"
        description="Schedule a discovery call with AERELION Systems. Discuss your operational challenges and learn how managed automation can recover hours weekly. We respond within 24-48 hours."
        keywords="contact AERELION, automation consultation, discovery call, managed automation inquiry, schedule call, business automation help"
        canonicalUrl="/contact"
        structuredData={[
          schemas.breadcrumb([
            { name: 'Home', url: '/' },
            { name: 'Contact', url: '/contact' }
          ]),
          schemas.webPage("Contact AERELION Systems", "Schedule a discovery call for managed automation services", "/contact")
        ]}
      />
      <LibraryNavbar />
      
      <main className="pt-12">
        {/* Hero */}
        <section className="section-padding">
          <div className="container-main">
            <ScrollReveal>
              <div className="text-center max-w-3xl mx-auto">
                <span className="text-xs font-semibold text-primary uppercase tracking-wide mb-4 block">
                  Get in Touch
                </span>
                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                  Schedule a Discovery Call
                </h1>
                <p className="text-lg text-muted-foreground">
                  Discuss your operational challenges and learn how AERELION can help. 
                  We respond within 24-48 hours.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Contact Grid */}
        <section className="section-padding pt-0">
          <div className="container-main max-w-5xl">
            <div className="grid md:grid-cols-2 gap-12">
              {/* Contact Info */}
              <ScrollReveal>
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-6">What to Expect</h2>
                  
                  <div className="space-y-4 mb-8">
                    <div className="flex items-start gap-4 p-4 card-panel rounded-lg">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Calendar className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Discovery Call</p>
                        <p className="text-sm text-muted-foreground">30-minute conversation to understand your operations</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4 p-4 card-panel rounded-lg">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Phone className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Scoped Proposal</p>
                        <p className="text-sm text-muted-foreground">Clear scope, timeline, and fixed pricing</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4 p-4 card-panel rounded-lg">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Mail className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Email</p>
                        <p className="text-sm text-muted-foreground">contact@aerlion.systems</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 card-panel rounded-lg">
                    <h3 className="font-semibold text-foreground mb-2">Response Time</h3>
                    <p className="text-sm text-muted-foreground">
                      We typically respond within 24-48 business hours. 
                      For urgent matters, email us directly.
                    </p>
                  </div>
                </div>
              </ScrollReveal>

              {/* Contact Form */}
              <ScrollReveal delay={0.1}>
                <div className="card-panel p-8 rounded-lg">
                  <h2 className="text-xl font-semibold text-foreground mb-6">Send a Message</h2>
                  
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium mb-2">
                        Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 bg-background border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors ${
                          errors.name ? 'border-destructive' : 'border-border'
                        }`}
                        placeholder="Your name"
                      />
                      {errors.name && (
                        <p className="text-destructive text-sm mt-1">{errors.name}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 bg-background border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors ${
                          errors.email ? 'border-destructive' : 'border-border'
                        }`}
                        placeholder="your@email.com"
                      />
                      {errors.email && (
                        <p className="text-destructive text-sm mt-1">{errors.email}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="message" className="block text-sm font-medium mb-2">
                        Message
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        rows={5}
                        className={`w-full px-4 py-3 bg-background border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors resize-none ${
                          errors.message ? 'border-destructive' : 'border-border'
                        }`}
                        placeholder="Tell us about your operational challenges..."
                      />
                      {errors.message && (
                        <p className="text-destructive text-sm mt-1">{errors.message}</p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full"
                      size="lg"
                    >
                      {isSubmitting ? (
                        'Sending...'
                      ) : (
                        <>
                          Send Message
                          <Send className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </form>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>
      </main>

      <LibraryFooter />
    </div>
  );
};

export default Contact;
