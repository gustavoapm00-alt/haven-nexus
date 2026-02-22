import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import type { Variants } from 'framer-motion';

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.6 } }),
};

const CaseStudies = () => {
  return (
    <main className="pt-24">
      <section className="section-padding">
        <div className="container-narrow">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0} variants={fadeUp}>
            <p className="text-xs font-mono uppercase tracking-[0.25em] text-primary mb-4">Proof of Work</p>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl mb-8 max-w-4xl">Results speak. We listen.</h1>
            <p className="text-muted-foreground text-lg max-w-2xl leading-relaxed mb-16">Every engagement produces measurable transformation. Case studies are published within 90 days of completion.</p>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={1} variants={fadeUp} className="card-premium p-12 md:p-16 text-center">
            <p className="font-display text-5xl text-primary/10 mb-6">01</p>
            <h3 className="font-display text-2xl mb-4">First case studies publishing Q2 2026.</h3>
            <p className="text-muted-foreground max-w-lg mx-auto mb-8">Our first cohort of engagements are currently in progress. Documented transformation stories with measurable benchmarks will be published here upon completion.</p>
            <Link to="/contact" className="btn-outline">Be Among the First <ArrowRight className="w-4 h-4" /></Link>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={2} variants={fadeUp} className="mt-16">
            <h2 className="font-display text-2xl mb-8">What each case study will include:</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { title: 'Before State', desc: 'Documented operational friction points, time losses, and process gaps before engagement.' },
                { title: 'Installation Scope', desc: 'Systems installed, integrations configured, and benchmarks agreed upon.' },
                { title: 'Measured Outcomes', desc: 'Quantified results — time recovered, capacity freed, revenue impact documented.' },
              ].map((item, i) => (
                <div key={i} className="card-premium p-8">
                  <p className="font-display text-lg mb-3 text-foreground">{item.title}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
};

export default CaseStudies;
