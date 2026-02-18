import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronRight } from 'lucide-react';
import ConstellationCanvas from './ConstellationCanvas';

const BOOT_LINES = [
  '> INITIALIZING AERELION SUBSTRATE...',
  '> LOADING COMPLIANCE MATRIX...',
  '> MOUNTING GOVERNANCE LAYER...',
  '> SYSTEM NOMINAL // READY',
];

const CommandCenterHero = () => {
  return (
    <section className="relative min-h-[94vh] flex flex-col items-center justify-center overflow-hidden bg-[#060606]">
      <ConstellationCanvas />

      {/* Deep radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_35%,rgba(57,255,20,0.05),transparent_70%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_30%_at_80%_70%,rgba(255,191,0,0.03),transparent)]" />

      {/* Corner brackets */}
      <div className="absolute top-8 left-8 w-10 h-10 border-l border-t border-[#39FF14]/20" />
      <div className="absolute top-8 right-8 w-10 h-10 border-r border-t border-[#39FF14]/20" />
      <div className="absolute bottom-20 left-8 w-10 h-10 border-l border-b border-[#39FF14]/10" />
      <div className="absolute bottom-20 right-8 w-10 h-10 border-r border-b border-[#39FF14]/10" />

      {/* Boot sequence terminal */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 hidden lg:block">
        <div className="flex flex-col gap-0.5">
          {BOOT_LINES.map((line, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.18, duration: 0.35 }}
              className="font-mono text-[9px] tracking-[0.12em] text-[#39FF14]/20"
            >
              {line}
            </motion.div>
          ))}
        </div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        {/* Classification tag */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="inline-flex items-center gap-3 mb-10 px-4 py-2 border border-[#39FF14]/20 bg-[#39FF14]/[0.03]"
        >
          <div className="relative">
            <div className="w-1.5 h-1.5 bg-[#39FF14]" />
            <div className="absolute inset-0 w-1.5 h-1.5 bg-[#39FF14] animate-ping opacity-50" />
          </div>
          <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-[#39FF14]/70">
            // OPERATIONAL INFRASTRUCTURE // GOVCON_READY
          </span>
        </motion.div>

        {/* Main headline */}
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="font-display font-bold leading-[1.0] tracking-tight mb-8"
        >
          <span className="block text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-[#E0E0E0]">
            SYSTEM
          </span>
          <span className="block text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-transparent bg-clip-text"
            style={{
              backgroundImage: 'linear-gradient(135deg, #39FF14 0%, #7fff3a 40%, #39FF14 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            STABILIZATION
          </span>
          <span className="block text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-[#E0E0E0]/50">
            & OPERATIONAL
          </span>
          <span className="block text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-[#E0E0E0]">
            GOVERNANCE.
          </span>
        </motion.h1>

        {/* Sub-copy */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.65 }}
          className="font-sans text-base md:text-lg text-[#E0E0E0]/40 max-w-2xl mx-auto mb-4 leading-relaxed"
        >
          Engineering the foundational logic for enterprise-scale autonomous systems.
          <br />
          We configure, deploy, and maintain. You operate.
        </motion.p>

        {/* Reference line */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.4 }}
          className="font-mono text-[10px] text-white/20 tracking-[0.2em] mb-12"
        >
          [REF: NIST 800-171 // CMMC L2 // CUI PROVENANCE ENFORCEMENT]
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            to="/contact"
            className="group relative inline-flex items-center gap-3 px-8 py-4 bg-[#39FF14] text-black font-mono text-xs tracking-[0.18em] font-medium transition-all duration-200 hover:bg-[#4dff2e] hover:shadow-[0_0_40px_rgba(57,255,20,0.25)]"
          >
            REQUEST BRIEFING
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            to="/how-it-works"
            className="group inline-flex items-center gap-3 px-8 py-4 bg-transparent border border-[rgba(57,255,20,0.3)] text-[#39FF14] font-mono text-xs tracking-[0.18em] font-medium transition-all duration-200 hover:bg-[rgba(57,255,20,0.06)] hover:border-[#39FF14]"
          >
            VIEW DOCTRINE
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4 }}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="font-mono text-[9px] tracking-[0.3em] text-white/15">SCROLL</span>
        <div className="w-px h-8 bg-gradient-to-b from-white/15 to-transparent" />
      </motion.div>

      {/* Bottom gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#060606] to-transparent pointer-events-none" />
    </section>
  );
};

export default CommandCenterHero;
