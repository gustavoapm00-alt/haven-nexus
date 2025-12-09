import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import ScrollReveal from './ScrollReveal';

const benefits = [
  'A one-page view of the Haven Systems ecosystem',
  'My daily routine for staying focused while working nights',
  'The exact tools I use for AI, Shopify, and content',
  'A mental model for turning chaos into strategy',
];

const EmailCaptureSection = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('email_signups')
        .insert({ email, source: 'blueprint' });

      if (error) {
        if (error.code === '23505') {
          // Unique constraint violation - email already exists
          toast({
            title: "You're already on the list!",
            description: "We'll keep you updated.",
          });
        } else {
          throw error;
        }
      } else {
        toast({
          title: "You're in!",
          description: "Check your inbox soon.",
        });
      }
      
      setEmail('');
    } catch (error) {
      console.error('Error submitting email:', error);
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
    <section id="email-capture" className="section-padding bg-background">
      <div className="container-main max-w-3xl">
        <ScrollReveal>
          <div className="card-glow p-8 md:p-12 rounded-sm border border-primary/30 text-center">
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl mb-4">
              GET THE <span className="text-gradient">HAVEN SYSTEMS</span> BLUEPRINT
            </h2>

            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              I'm putting everything I've learned—from addiction to rebuilding my mind to launching 
              multiple brands—into a simple systems framework you can actually use.
            </p>

            <div className="text-left max-w-md mx-auto mb-8">
              <p className="font-medium text-foreground mb-3 text-sm">You'll get:</p>
              <ul className="space-y-2">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-2 text-muted-foreground text-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="flex-grow px-4 py-3 bg-background border border-border rounded-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Joining...' : 'Get the Blueprint'}
              </button>
            </form>

            <p className="text-xs text-muted-foreground mt-4">
              No spam. Just real systems and real progress.
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default EmailCaptureSection;
