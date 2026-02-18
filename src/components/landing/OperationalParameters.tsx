import { motion } from 'framer-motion';

const parameters = [
  {
    id: 'PARAM-001',
    code: 'SCOPE_LOCK',
    text: 'Engagement scope is fixed at inception. No mid-cycle feature additions without revised authorization.',
    severity: 'MANDATORY',
  },
  {
    id: 'PARAM-002',
    code: 'CRED_CHANNEL',
    text: 'All credential handoffs must pass through encrypted intake channels. Plaintext transmission is a protocol violation.',
    severity: 'MANDATORY',
  },
  {
    id: 'PARAM-003',
    code: 'DEPLOY_WINDOW',
    text: 'Maximum deployment window: 30 calendar days from authorization. Extensions require a formal amendment.',
    severity: 'OPERATIONAL',
  },
  {
    id: 'PARAM-004',
    code: 'REDUNDANCY_REQ',
    text: 'Redundancy protocols require a minimum of two integration points per workflow. Single-threaded pipelines are not supported.',
    severity: 'OPERATIONAL',
  },
];

const severityColor: Record<string, string> = {
  MANDATORY: 'text-[#FFBF00]/70 border-[#FFBF00]/20 bg-[#FFBF00]/[0.04]',
  OPERATIONAL: 'text-[#39FF14]/60 border-[#39FF14]/15 bg-[#39FF14]/[0.03]',
};

const OperationalParameters = () => {
  return (
    <section className="section-padding bg-[#060606] relative overflow-hidden">
      <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      <div className="container-main max-w-3xl">
        <span className="font-mono text-[10px] text-[#FFBF00]/50 uppercase tracking-[0.25em] mb-3 block">
          // CONSTRAINTS & BOUNDARIES
        </span>
        <h2 className="font-mono text-3xl md:text-4xl font-bold text-[#E0E0E0] mb-14 tracking-tight">
          Operational Parameters
        </h2>

        <div className="space-y-0">
          {parameters.map((param, i) => (
            <motion.div
              key={param.id}
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="flex gap-6 py-7 border-b border-white/[0.05] group hover:bg-white/[0.01] transition-colors -mx-4 px-4"
            >
              {/* Left column — ID + code */}
              <div className="flex flex-col gap-1 shrink-0 w-28">
                <span className="font-mono text-[9px] text-[#FFBF00]/50 tracking-[0.15em]">
                  [{param.id}]
                </span>
                <span className="font-mono text-[9px] text-white/20 tracking-[0.12em]">
                  {param.code}
                </span>
              </div>

              {/* Right column — content */}
              <div className="flex-1 min-w-0">
                <p className="font-sans text-sm text-white/45 leading-relaxed mb-3 group-hover:text-white/65 transition-colors">
                  {param.text}
                </p>
                <span className={`inline-flex items-center px-2 py-0.5 font-mono text-[8px] tracking-[0.18em] border ${severityColor[param.severity]}`}>
                  {param.severity}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default OperationalParameters;
