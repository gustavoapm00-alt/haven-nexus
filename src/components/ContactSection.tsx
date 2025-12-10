import { useState } from 'react';
import { Instagram, Mail } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { contactFormSchema } from '@/lib/validations';
import ScrollReveal from './ScrollReveal';

type FormErrors = {
  name?: string;
  email?: string;
  message?: string;
};

const ContactSection = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate with Zod
    const result = contactFormSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: FormErrors = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as keyof FormErrors;
        if (!fieldErrors[field]) {
          fieldErrors[field] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { error: dbError } = await supabase
        .from('contact_submissions')
        .insert({
          name: result.data.name,
          email: result.data.email,
          message: result.data.message,
        });

      if (dbError) throw dbError;

      toast({
        title: "Thanks for reaching out!",
        description: "I'll get back to you soon.",
      });
      
      setFormData({ name: '', email: '', message: '' });
    } catch (err) {
      toast({
        title: "Something went wrong",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="section-padding bg-secondary/30">
      <div className="container-main max-w-4xl">
        <ScrollReveal>
          <div className="text-center mb-12">
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl mb-4">
              LET'S BUILD SOMETHING <span className="text-gradient">REAL</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              If anything here resonates—whether you're an entrepreneur, investor, creator, or 
              someone who just feels called to build—reach out. You don't have to have everything 
              figured out. You just need to be serious.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Instagram */}
            <a
              href="https://www.instagram.com/null.username__/"
              target="_blank"
              rel="noopener noreferrer"
              className="card-glow p-6 rounded-sm border border-border/50 flex items-center gap-4 hover:border-primary/30 transition-all duration-300 group"
            >
              <div className="p-3 bg-primary/10 rounded-sm group-hover:bg-primary/20 transition-colors">
                <Instagram className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">Instagram</p>
                <p className="text-sm text-muted-foreground">DM me on Instagram: @null.username__</p>
              </div>
            </a>

            {/* Email */}
            <a
              href="mailto:gustavoapm00@gmail.com"
              className="card-glow p-6 rounded-sm border border-border/50 flex items-center gap-4 hover:border-primary/30 transition-all duration-300 group"
            >
              <div className="p-3 bg-primary/10 rounded-sm group-hover:bg-primary/20 transition-colors">
                <Mail className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">Email</p>
                <p className="text-sm text-muted-foreground">Prefer email? gustavoapm00@gmail.com</p>
              </div>
            </a>
          </div>
        </ScrollReveal>

        {/* Contact Form */}
        <ScrollReveal delay={0.2}>
          <form onSubmit={handleSubmit} className="card-glow p-8 rounded-sm border border-border/50">
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  maxLength={100}
                  className={`w-full px-4 py-3 bg-background border rounded-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors ${
                    errors.name ? 'border-destructive' : 'border-border'
                  }`}
                />
                {errors.name && (
                  <p className="text-destructive text-xs mt-1">{errors.name}</p>
                )}
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  maxLength={255}
                  className={`w-full px-4 py-3 bg-background border rounded-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors ${
                    errors.email ? 'border-destructive' : 'border-border'
                  }`}
                />
                {errors.email && (
                  <p className="text-destructive text-xs mt-1">{errors.email}</p>
                )}
              </div>
            </div>

            <div className="mb-6">
              <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">
                What do you want to build?
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={4}
                maxLength={5000}
                className={`w-full px-4 py-3 bg-background border rounded-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors resize-none ${
                  errors.message ? 'border-destructive' : 'border-border'
                }`}
              />
              {errors.message && (
                <p className="text-destructive text-xs mt-1">{errors.message}</p>
              )}
              <p className="text-muted-foreground text-xs mt-1 text-right">
                {formData.message.length}/5000
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </ScrollReveal>

        <ScrollReveal delay={0.3}>
          <p className="text-center text-muted-foreground mt-8 text-sm italic">
            You're not too late. You're just early to the right thing.
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default ContactSection;
