import { motion } from 'framer-motion';

const AerelionLayerDiagram = () => {
  const layers = [
    {
      label: 'INPUT',
      title: 'RAW DATA STREAM',
      sub: 'FRAGMENTED // UNSTRUCTURED // HIGH ENTROPY',
      color: 'border-white/10',
      textColor: 'text-white/40',
      lines: ['— ———', '——— —', '— ——'],
      linesColor: 'text-white/10',
    },
    {
      label: 'CORE',
      title: 'AERELION REGULATOR',
      sub: '[FILTER_STATUS: ACTIVE] // ENTROPY: REDUCING',
      color: 'border-[#39FF14]/40',
      textColor: 'text-[#39FF14]/80',
      isCore: true,
      desc: 'Standardization, redundancy, and governance logic applied to operational data streams in real-time.',
    },
    {
      label: 'OUTPUT',
      title: 'EXECUTIVE OVERSIGHT',
      sub: 'STABILIZED // GOVERNED // AUDITABLE',
      color: 'border-white/10',
      textColor: 'text-white/40',
      lines: ['████████', '████████', '████████'],
      linesColor: 'text-white/15',
    },
  ];

  return (
    <section className="section-padding bg-[#040404] relative overflow-hidden">
      <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-[#39FF14]/10 to-transparent" />

      <div className="container-main max-w-5xl">
        <span className="font-mono text-[10px] text-[#39FF14]/50 uppercase tracking-[0.25em] mb-3 block">
          // STRUCTURAL SCHEMA: REGULATORY FLOW
        </span>
        <h2 className="font-mono text-3xl md:text-4xl font-bold text-[#E0E0E0] mb-16 tracking-tight">
          The AERELION Layer
        </h2>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="flex flex-col md:flex-row items-stretch gap-0"
        >
          {layers.map((layer, i) => (
            <div key={i} className="flex flex-row md:flex-col items-center flex-1">
              {/* Node box */}
              <div className={`flex-1 w-full border ${layer.color} p-6 flex flex-col justify-between min-h-[200px] transition-all duration-300 ${layer.isCore ? 'shadow-[0_0_40px_rgba(57,255,20,0.08),inset_0_0_30px_rgba(57,255,20,0.02)]' : ''}`}>
                <span className={`font-mono text-[9px] tracking-[0.2em] mb-3 ${layer.isCore ? 'text-[#39FF14]/40' : 'text-white/20'}`}>
                  {layer.label}
                </span>

                <div className="flex-1">
                  <h3 className={`font-mono text-sm font-bold mb-3 tracking-wide ${layer.textColor}`}>
                    {layer.title}
                  </h3>

                  {layer.isCore ? (
                    <p className="font-sans text-xs text-white/30 leading-relaxed mb-4">
                      {layer.desc}
                    </p>
                  ) : (
                    <div className="space-y-1.5 mb-4">
                      {layer.lines?.map((line, j) => (
                        <div key={j} className={`font-mono text-[10px] tracking-[0.3em] ${layer.linesColor}`}>
                          {line}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <span className={`font-mono text-[8px] tracking-[0.15em] ${layer.isCore ? 'text-[#39FF14]/30' : 'text-white/15'}`}>
                  {layer.sub}
                </span>
              </div>

              {/* Arrow (between nodes only) */}
              {i < layers.length - 1 && (
                <div className="flex md:flex-col items-center justify-center md:py-0 px-3 md:px-0 md:h-10 md:w-full">
                  <div className="hidden md:flex flex-col items-center gap-1">
                    <div className="w-px h-4 bg-white/10" />
                    <div className="font-mono text-white/20 text-lg">↓</div>
                  </div>
                  <div className="flex md:hidden items-center gap-1">
                    <div className="h-px w-4 bg-white/10" />
                    <div className="font-mono text-white/20">→</div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </motion.div>

        {/* Process labels below */}
        <div className="flex justify-between mt-8 px-6">
          {['DATA INGESTION', 'GOVERNANCE LOGIC', 'EXECUTIVE OUTPUT'].map((label, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className="font-mono text-[9px] text-white/15 tracking-[0.15em] uppercase"
            >
              {label}
            </motion.span>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AerelionLayerDiagram;
