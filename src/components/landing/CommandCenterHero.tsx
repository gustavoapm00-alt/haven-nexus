import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Rocket } from 'lucide-react';
import ConstellationCanvas from './ConstellationCanvas';

const CommandCenterHero = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-[#0a0a0a]">
      {/* Constellation background */}
      <ConstellationCanvas />

      {/* Radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_40%,hsl(180,50%,15%,0.12),transparent)]" />

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="font-mono text-xs tracking-[0.3em] uppercase text-[hsl(180,60%,50%)] mb-8"
        >
          Managed Automation Operator
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-[#e8e8e8] leading-[1.05] tracking-tight mb-8"
        >
          Infrastructure for
          <br />
          the Agent Era.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="font-mono text-sm md:text-base text-[hsl(0,0%,55%)] max-w-2xl mx-auto mb-12 leading-relaxed"
        >
          The operational backbone for firms that demand scale without the software bloat.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.9 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            to="/contact"
            className="group inline-flex items-center gap-3 px-8 py-4 bg-[hsl(180,60%,40%)] text-[#0a0a0a] font-mono text-sm font-semibold uppercase tracking-[0.15em] transition-all duration-300 hover:bg-[hsl(180,60%,50%)] hover:shadow-[0_0_30px_hsl(180,60%,40%,0.3)]"
          >
            <Rocket className="w-4 h-4" />
            Initialize System
          </Link>
          <Link
            to="/automations"
            className="inline-flex items-center gap-3 px-8 py-4 border border-[hsl(0,0%,25%)] text-[hsl(0,0%,60%)] font-mono text-sm uppercase tracking-[0.15em] transition-all duration-300 hover:border-[hsl(180,60%,40%,0.5)] hover:text-[hsl(180,60%,50%)]"
          >
            View Protocols
          </Link>
        </motion.div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0a0a0a] to-transparent" />
    </section>
  );
};

export default CommandCenterHero;
