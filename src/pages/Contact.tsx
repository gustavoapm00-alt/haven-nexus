import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Instagram, Send, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { contactFormSchema } from '@/lib/validations';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ScrollReveal from '@/components/ScrollReveal';
import SEO, { schemas } from '@/components/SEO';

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
        title="Contact"
        description="Get in touch with AERELION Systems. For operational questions, system inquiries, or to start a conversation about your automation needs."
        keywords="contact AERELION Systems, automation inquiry, operational systems contact"
        canonicalUrl="/contact"
        structuredData={schemas.breadcrumb([
          { name: 'Home', url: '/' },
          { name: 'Contact', url: '/contact' }
        ])}
      />
      <Navbar />
      
      <main className="pt-24">
        {/* Hero */}
        <section className="section-padding">
          <div className="container-main">
            <ScrollReveal>
              <div className="text-center max-w-3xl mx-auto">
                <span className="tag-chip mb-6">Contact</span>
                <h1 className="font-display text-5xl md:text-6xl mb-6">
                  START A <span className="text-gradient">CONVERSATION</span>
                </h1>
                <p className="text-xl text-muted-foreground">
                  Have a question or want to discuss your operational challenges? 
                  We respond within 24-48 hours.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Intake Prompt */}
        <section className="section-padding pt-0">
          <div className="container-main max-w-2xl">
            <ScrollReveal>
              <div className="card-glass p-6 rounded-lg text-center mb-12">
                <h2 className="font-display text-xl mb-2">Looking to Engage?</h2>
                <p className="text-muted-foreground text-sm mb-4">
                  If you're ready to explore working with AERELION, the qualification intake 
                  will route you to the right entry mode faster than a general message.
                </p>
                <Link to="/get-started" className="btn-primary inline-flex">
                  Take the Intake Assessment
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
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
                  <h2 className="font-display text-3xl mb-6">GET IN TOUCH</h2>
                  <p className="text-muted-foreground mb-8">
                    For general inquiries, questions about our capabilities, 
                    or anything else — reach out below.
                  </p>

                  <div className="space-y-6">
                    <a 
                      href="mailto:contact@aerlion.systems" 
                      className="flex items-center gap-4 p-4 card-glass rounded-lg hover:border-primary/50 transition-colors"
                    >
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Mail className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Email</p>
                        <p className="text-muted-foreground text-sm">contact@aerlion.systems</p>
                      </div>
                    </a>

                    <a 
                      href="https://instagram.com/aerlion.systems" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 p-4 card-glass rounded-lg hover:border-primary/50 transition-colors"
                    >
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Instagram className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Instagram</p>
                        <p className="text-muted-foreground text-sm">@aerlion.systems</p>
                      </div>
                    </a>
                  </div>

                  <div className="mt-8 p-6 card-glass rounded-lg">
                    <h3 className="font-display text-xl mb-2">Response Time</h3>
                    <p className="text-muted-foreground text-sm">
                      We typically respond within 24-48 business hours. For faster routing, 
                      use the intake assessment above.
                    </p>
                  </div>
                </div>
              </ScrollReveal>

              {/* Contact Form */}
              <ScrollReveal delay={0.1}>
                <div className="card-glass p-8 rounded-lg">
                  <h2 className="font-display text-2xl mb-6">SEND A MESSAGE</h2>
                  
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

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="btn-secondary w-full justify-center"
                    >
                      {isSubmitting ? (
                        'Sending...'
                      ) : (
                        <>
                          Send Message
                          <Send className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;