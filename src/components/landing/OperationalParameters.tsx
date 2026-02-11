import { motion } from 'framer-motion';

const parameters = [
  {
    id: 'PARAM-001',
    text: 'Engagement scope is fixed at inception. No mid-cycle feature additions without revised authorization.',
  },
  {
    id: 'PARAM-002',
    text: 'All credential handoffs must pass through encrypted intake channels.',
  },
  {
    id: 'PARAM-003',
    text: 'Maximum deployment window: 30 calendar days from authorization.',
  },
  {
    id: 'PARAM-004',
    text: 'Redundancy protocols require a minimum of two integration points per workflow.',
  },
];

const OperationalParameters = () => {
  return (
    <section className="section-padding bg-[#0a0a0a]">
      <div className="container-main max-w-3xl">
        <span className="font-mono text-[10px] text-[#FFBF00]/50 uppercase tracking-[0.25em] mb-3 block">
          // CONSTRAINTS & BOUNDARIES
        </span>
        <h2 className="font-mono text-2xl md:text-3xl font-semibold text-[#E0E0E0] mb-10">
          Operational Parameters
        </h2>

        <div className="space-y-0">
          {parameters.map((param, i) => (
            <motion.div
              key={param.id}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              className="flex gap-4 py-5 border-b border-white/5 group"
            >
              <span className="font-mono text-xs text-[#FFBF00]/60 tracking-wider whitespace-nowrap mt-0.5">
                [{param.id}]
              </span>
              <p className="font-sans text-sm text-white/50 leading-relaxed group-hover:text-white/70 transition-colors">
                {param.text}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default OperationalParameters;
