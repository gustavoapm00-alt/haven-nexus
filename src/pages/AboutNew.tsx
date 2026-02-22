import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import type { Variants } from 'framer-motion';

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.6 },
  }),
};

const AboutPage = () => {
  return (
    <main className="pt-24">
      <section className="section-padding pb-16">
        <div className="container-narrow">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0} variants={fadeUp}>
            <p className="text-xs font-mono uppercase tracking-[0.25em] text-primary mb-4">About AERELION</p>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl mb-8 max-w-4xl">
              Founded on a single thesis.
            </h1>
          </motion.div>
        </div>
      </section>

      <section className="px-6 md:px-12 lg:px-20 pb-20">
        <div className="container-narrow">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0} variants={fadeUp}
            className="card-premium p-8 md:p-12 border-primary/20"
          >
            <p className="text-xs font-mono uppercase tracking-[0.25em] text-primary mb-6">Mission</p>
            <blockquote className="font-display text-2xl md:text-3xl text-foreground leading-snug italic">
              "We remove the operational ceiling from ambitious operators by installing AI systems
              that think, route, and execute — so the human can focus on the work only they can do."
            </blockquote>
          </motion.div>
        </div>
      </section>

      <section className="section-padding bg-card border-y border-border">
        <div className="container-narrow">
          <div className="max-w-3xl">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0} variants={fadeUp}>
              <p className="text-xs font-mono uppercase tracking-[0.25em] text-primary mb-4">Founder & Principal Operator</p>
              <h2 className="font-display text-3xl md:text-4xl mb-8">Gustavo</h2>
            </motion.div>
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={1} variants={fadeUp} className="space-y-6 text-muted-foreground text-lg leading-relaxed">
              <p>AERELION was founded by Gustavo, a systems architect and AI integration specialist with a deep background in operational design for lean professional service businesses.</p>
              <p>He founded AERELION on a single thesis: that the compounding operational cost of manual workflows in small service businesses represents one of the most underaddressed infrastructure crises in modern commerce — and that AI has finally crossed the accessibility threshold required to solve it at scale.</p>
              <p>His operating philosophy is rooted in precision over volume. He selects clients who are ready to move, builds systems that outlast the engagement, and measures success exclusively by outcomes.</p>
              <p className="text-foreground font-medium">AERELION reflects his belief that premium positioning is not a pricing strategy — it is an integrity standard.</p>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-narrow">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0} variants={fadeUp} className="max-w-3xl">
            <p className="text-xs font-mono uppercase tracking-[0.25em] text-primary mb-4">Closing Thesis</p>
            <h2 className="font-display text-3xl md:text-4xl mb-8">We compete on certainty.</h2>
            <div className="space-y-6 text-muted-foreground text-lg leading-relaxed">
              <p>In a market flooded with tools that promise transformation and deliver complexity, AERELION offers something rare: a defined outcome, delivered on a fixed timeline, with the operator's existing infrastructure.</p>
              <p>No rip-and-replace. No long onboarding. No scope ambiguity.</p>
              <p>The operators we serve are not buying automation. They are buying back their time, their attention, and their ability to grow. That is not a feature. It is a transfer of liability.</p>
              <p className="font-display text-xl text-foreground italic">The ceiling has been removed. The system is ready.</p>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="section-padding bg-card border-y border-border text-center">
        <div className="container-narrow">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0} variants={fadeUp}>
            <h2 className="font-display text-3xl md:text-4xl mb-6">Ready to meet?</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-10">Book a confidential briefing to discuss your operational challenges.</p>
            <Link to="/contact" className="btn-primary">Request a Briefing <ArrowRight className="w-4 h-4" /></Link>
          </motion.div>
        </div>
      </section>
    </main>
  );
};

export default AboutPage;
