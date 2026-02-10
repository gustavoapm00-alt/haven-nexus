import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

const ManifestoSection = () => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const y = useTransform(scrollYProgress, [0, 1], [60, -60]);

  return (
    <section
      ref={ref}
      className="relative py-32 md:py-44 bg-[#0a0a0a] overflow-hidden"
    >
      {/* Scanline texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, transparent, transparent 2px, hsla(0,0%,100%,0.05) 2px, hsla(0,0%,100%,0.05) 4px)',
        }}
      />

      <motion.div style={{ y }} className="relative z-10 max-w-4xl mx-auto px-6">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="font-mono text-xs tracking-[0.3em] uppercase text-[hsl(25,90%,55%)] mb-10"
        >
          // The Manifesto
        </motion.p>

        <motion.blockquote
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-[#e8e8e8] leading-[1.2] tracking-tight"
        >
          We are the engineers of a calmer future.
        </motion.blockquote>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-10 font-mono text-sm md:text-base text-[hsl(0,0%,50%)] max-w-2xl leading-relaxed"
        >
          The old way of work is broken. We don't just patch software;
          we architect the intelligence that lets you scale.
        </motion.p>

        {/* Accent rule */}
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.7 }}
          className="mt-12 h-px w-32 bg-gradient-to-r from-[hsl(180,60%,40%)] to-transparent origin-left"
        />
      </motion.div>
    </section>
  );
};

export default ManifestoSection;
