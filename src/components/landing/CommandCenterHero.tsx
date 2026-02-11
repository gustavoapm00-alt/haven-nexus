import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import ConstellationCanvas from './ConstellationCanvas';

const CommandCenterHero = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-[#0F0F0F]">
      <ConstellationCanvas />

      {/* Radial glow — green */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_40%,rgba(57,255,20,0.06),transparent)]" />

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="font-mono text-xs tracking-[0.3em] uppercase text-[#39FF14]/70 mb-8"
        >
          // OPERATIONAL INFRASTRUCTURE
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-[#E0E0E0] leading-[1.1] tracking-tight mb-8"
        >
          SYSTEM STABILIZATION
          <br />
          & OPERATIONAL
          <br />
          GOVERNANCE.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="font-sans text-base md:text-lg text-[#E0E0E0]/50 max-w-2xl mx-auto mb-12 leading-relaxed"
        >
          Engineering the foundational logic for enterprise-scale autonomous systems.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.9 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            to="/contact"
            className="btn-launch-primary gap-3 px-8 py-4"
          >
            REQUEST BRIEFING
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/how-it-works"
            className="btn-launch px-8 py-4"
          >
            VIEW DOCTRINE
          </Link>
        </motion.div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0F0F0F] to-transparent" />
    </section>
  );
};

export default CommandCenterHero;
