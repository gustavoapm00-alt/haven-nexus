import { motion } from 'framer-motion';

const AerelionLayerDiagram = () => {
  return (
    <section className="section-padding bg-[#0a0a0a]">
      <div className="container-main max-w-4xl">
        <span className="font-mono text-[10px] text-[#39FF14]/50 uppercase tracking-[0.25em] mb-3 block">
          // STRUCTURAL SCHEMA: REGULATORY FLOW
        </span>
        <h2 className="font-mono text-2xl md:text-3xl font-semibold text-[#E0E0E0] mb-12">
          The AERELION Layer
        </h2>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="flex flex-col md:flex-row items-stretch gap-0"
        >
          {/* Input: Raw Data */}
          <div className="flex-1 border border-white/10 p-6 flex flex-col justify-center">
            <span className="font-mono text-[9px] text-white/20 tracking-wider mb-3">INPUT</span>
            <h3 className="font-mono text-sm text-white/50 mb-2">RAW DATA</h3>
            <div className="space-y-1">
              {['—— ——', '— ———', '——— —'].map((line, i) => (
                <div key={i} className="font-mono text-[10px] text-white/10 tracking-[0.3em]">{line}</div>
              ))}
            </div>
            <span className="font-mono text-[8px] text-white/15 mt-3 tracking-wider">FRAGMENTED // UNSTRUCTURED</span>
          </div>

          {/* Arrow */}
          <div className="flex items-center justify-center px-2 py-4 md:py-0">
            <span className="font-mono text-white/15 text-lg md:rotate-0 rotate-90">→</span>
          </div>

          {/* Center: AERELION Regulator */}
          <div className="flex-1 border border-[rgba(57,255,20,0.4)] p-6 flex flex-col justify-center relative shadow-[0_0_30px_rgba(57,255,20,0.06)]">
            <span className="font-mono text-[9px] text-[#39FF14]/40 tracking-wider mb-3">CORE</span>
            <h3 className="font-mono text-sm text-[#39FF14]/80 font-semibold mb-2">AERELION REGULATOR</h3>
            <p className="font-sans text-xs text-white/30 leading-relaxed mb-3">
              Standardization, redundancy, and governance logic applied to operational data streams.
            </p>
            <span className="font-mono text-[8px] text-[#39FF14]/30 tracking-wider">[FILTER_STATUS: ACTIVE]</span>
          </div>

          {/* Arrow */}
          <div className="flex items-center justify-center px-2 py-4 md:py-0">
            <span className="font-mono text-white/15 text-lg md:rotate-0 rotate-90">→</span>
          </div>

          {/* Output: Executive Oversight */}
          <div className="flex-1 border border-white/10 p-6 flex flex-col justify-center">
            <span className="font-mono text-[9px] text-white/20 tracking-wider mb-3">OUTPUT</span>
            <h3 className="font-mono text-sm text-white/50 mb-2">EXECUTIVE OVERSIGHT</h3>
            <div className="space-y-1">
              {['████████████', '████████████', '████████████'].map((line, i) => (
                <div key={i} className="font-mono text-[10px] text-white/15 tracking-wider">{line}</div>
              ))}
            </div>
            <span className="font-mono text-[8px] text-white/15 mt-3 tracking-wider">STABILIZED // GOVERNED</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default AerelionLayerDiagram;
