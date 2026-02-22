import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Loader2, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import type { Variants } from 'framer-motion';

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.6 } }),
};

const ContactPage = () => {
  const [form, setForm] = useState({ name: '', email: '', company: '', team_size: '', goal: '', pain: '' });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error: dbError } = await supabase.from('engagement_requests').insert({
      name: form.name, email: form.email, company_name: form.company || null,
      team_size: form.team_size || '1', primary_goal: form.goal, operational_pain: form.pain, status: 'new',
    });
    setLoading(false);
    if (dbError) { setError('Something went wrong. Please try again or email us directly.'); }
    else { setSubmitted(true); }
  };

  if (submitted) {
    return (
      <main className="pt-24">
        <section className="section-padding min-h-[60vh] flex items-center justify-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-lg">
            <CheckCircle className="w-12 h-12 text-primary mx-auto mb-6" />
            <h1 className="font-display text-3xl md:text-4xl mb-4">Briefing request received.</h1>
            <p className="text-muted-foreground text-lg">We'll review your submission and respond within 48 hours.</p>
          </motion.div>
        </section>
      </main>
    );
  }

  return (
    <main className="pt-24">
      <section className="section-padding">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0} variants={fadeUp}>
              <p className="text-xs font-mono uppercase tracking-[0.25em] text-primary mb-4">Request a Briefing</p>
              <h1 className="font-display text-4xl md:text-5xl mb-6">Let's map your operational ceiling.</h1>
              <p className="text-muted-foreground text-lg leading-relaxed mb-8">Tell us about your business and the friction you're experiencing. We'll respond within 48 hours with a confidential assessment.</p>
              <div className="space-y-6 text-sm text-muted-foreground">
                <div><p className="text-foreground font-medium mb-1">What happens next?</p><p>We review your submission, identify your operational pressure points, and schedule a 30-minute discovery call if there's mutual fit.</p></div>
                <div><p className="text-foreground font-medium mb-1">No obligation.</p><p>This is not a sales call. It's a diagnostic conversation. If AERELION isn't the right fit, we'll tell you.</p></div>
              </div>
            </motion.div>

            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={1} variants={fadeUp}>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2 block">Name *</label>
                  <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full bg-muted border border-border px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors rounded-sm" placeholder="Your full name" />
                </div>
                <div>
                  <label className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2 block">Email *</label>
                  <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full bg-muted border border-border px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors rounded-sm" placeholder="you@company.com" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2 block">Company</label>
                    <input type="text" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })}
                      className="w-full bg-muted border border-border px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors rounded-sm" placeholder="Company name" />
                  </div>
                  <div>
                    <label className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2 block">Team Size</label>
                    <select value={form.team_size} onChange={(e) => setForm({ ...form, team_size: e.target.value })}
                      className="w-full bg-muted border border-border px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary transition-colors rounded-sm">
                      <option value="">Select</option>
                      <option value="1">Solo operator</option>
                      <option value="2-5">2–5 people</option>
                      <option value="6-10">6–10 people</option>
                      <option value="10+">10+ people</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2 block">Primary Goal *</label>
                  <input type="text" required value={form.goal} onChange={(e) => setForm({ ...form, goal: e.target.value })}
                    className="w-full bg-muted border border-border px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors rounded-sm" placeholder="e.g., Eliminate manual onboarding process" />
                </div>
                <div>
                  <label className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2 block">Biggest Operational Pain *</label>
                  <textarea required rows={4} value={form.pain} onChange={(e) => setForm({ ...form, pain: e.target.value })}
                    className="w-full bg-muted border border-border px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors resize-none rounded-sm" placeholder="Describe the operational friction you're experiencing..." />
                </div>
                {error && <p className="text-destructive text-sm">{error}</p>}
                <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Submit Briefing Request <ArrowRight className="w-4 h-4" /></>}
                </button>
              </form>
            </motion.div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default ContactPage;
