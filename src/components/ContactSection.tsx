import { useState } from 'react';
import { Instagram, Mail } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const ContactSection = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    toast({
      title: "Thanks for reaching out!",
      description: "I'll get back to you soon.",
    });
    
    setFormData({ name: '', email: '', message: '' });
    setIsSubmitting(false);
  };

  return (
    <section id="contact" className="section-padding bg-secondary/30">
      <div className="container-main max-w-4xl">
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

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Instagram */}
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="card-glow p-6 rounded-sm border border-border/50 flex items-center gap-4 hover:border-primary/30 transition-all duration-300 group"
          >
            <div className="p-3 bg-primary/10 rounded-sm group-hover:bg-primary/20 transition-colors">
              <Instagram className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="font-medium text-foreground">Instagram</p>
              <p className="text-sm text-muted-foreground">DM me on Instagram: @your_handle</p>
            </div>
          </a>

          {/* Email */}
          <a
            href="mailto:hello@havensystems.co"
            className="card-glow p-6 rounded-sm border border-border/50 flex items-center gap-4 hover:border-primary/30 transition-all duration-300 group"
          >
            <div className="p-3 bg-primary/10 rounded-sm group-hover:bg-primary/20 transition-colors">
              <Mail className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="font-medium text-foreground">Email</p>
              <p className="text-sm text-muted-foreground">Prefer email? hello@havensystems.co</p>
            </div>
          </a>
        </div>

        {/* Contact Form */}
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
                required
                className="w-full px-4 py-3 bg-background border border-border rounded-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
              />
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
                required
                className="w-full px-4 py-3 bg-background border border-border rounded-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
              />
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
              required
              rows={4}
              className="w-full px-4 py-3 bg-background border border-border rounded-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Sending...' : 'Send Message'}
          </button>
        </form>

        <p className="text-center text-muted-foreground mt-8 text-sm italic">
          You're not too late. You're just early to the right thing.
        </p>
      </div>
    </section>
  );
};

export default ContactSection;
