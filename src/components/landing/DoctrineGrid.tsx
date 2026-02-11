import { motion } from 'framer-motion';

const protocols = [
  {
    id: 'PRTCL-001',
    title: 'PROTOCOL HARDENING',
    description: 'Identifying and neutralizing operational friction.',
    status: 'ACTIVE',
    complexity: 'HIGH',
  },
  {
    id: 'PRTCL-002',
    title: 'DATA ONTOLOGY',
    description: 'Establishing a universal schema for fragmented information environments.',
    status: 'ACTIVE',
    complexity: 'CRITICAL',
  },
  {
    id: 'PRTCL-003',
    title: 'GOVERNANCE LOGIC',
    description: 'Installing automated oversight layers to maintain system integrity.',
    status: 'ACTIVE',
    complexity: 'HIGH',
  },
];

const DoctrineGrid = () => {
  return (
    <section className="section-padding bg-[#0F0F0F]">
      <div className="container-main">
        <span className="font-mono text-[10px] text-[#39FF14]/50 uppercase tracking-[0.25em] mb-3 block">
          // METHODOLOGY
        </span>
        <h2 className="font-mono text-2xl md:text-3xl font-semibold text-[#E0E0E0] mb-10">
          The Doctrine Grid
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          {protocols.map((protocol, i) => (
            <motion.div
              key={protocol.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="border border-[rgba(57,255,20,0.15)] bg-[#0F0F0F] p-6 transition-all duration-300 hover:border-[rgba(57,255,20,0.4)] hover:shadow-[0_0_20px_rgba(57,255,20,0.06)] group"
            >
              {/* Metadata row */}
              <div className="flex items-center gap-3 mb-4">
                <span className="font-mono text-[9px] text-[#39FF14]/40 tracking-wider">{protocol.id}</span>
                <span className="font-mono text-[9px] text-[#39FF14]/30 tracking-wider">STATUS: {protocol.status}</span>
              </div>

              <h3 className="font-mono text-sm font-semibold text-[#E0E0E0] mb-3 tracking-wide">
                {protocol.title}
              </h3>

              <p className="font-sans text-sm text-white/40 leading-relaxed mb-4">
                {protocol.description}
              </p>

              <div className="pt-3 border-t border-white/5">
                <span className="font-mono text-[9px] text-white/20 tracking-wider">
                  COMPLEXITY_LVL: {protocol.complexity}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DoctrineGrid;
