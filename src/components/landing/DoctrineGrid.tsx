import { motion } from 'framer-motion';

const protocols = [
  {
    id: 'PRTCL-001',
    title: 'FEDERATED DATA GOVERNANCE',
    description:
      'The Genesis Mission demands a Universal Truth across 17 National Labs and private consortia. AERELION\'s schema-governed substrate enforces CUI handoff integrity between all nodes — from Argonne\'s Solstice to the American Science and Security Platform.',
    status: 'ACTIVE',
    complexity: 'CRITICAL',
    designation: 'NIST 800-171',
    metric: '100%',
    metricLabel: 'PROVENANCE',
  },
  {
    id: 'PRTCL-002',
    title: 'AUTONOMOUS LABORATORY LOGIC',
    description:
      'Supporting the "26 Challenges" directive — AERELION deploys hardened logic gates for AI agents that run 24/7 autonomous experiments. Human-in-the-loop workflow governance ensures auditability for Project Prometheus nuclear design cycles.',
    status: 'ACTIVE',
    complexity: 'HIGH',
    designation: 'DOE/GENESIS-26',
    metric: '24/7',
    metricLabel: 'UPTIME',
  },
  {
    id: 'PRTCL-003',
    title: 'GRID & SUPPLY CHAIN INTEGRITY',
    description:
      'Genesis Mission mandates AI-driven grid decisions 20–100× faster. AERELION\'s COOP logic stabilization and supply chain monitoring provide the operational backbone for energy dominance and critical infrastructure resilience.',
    status: 'ACTIVE',
    complexity: 'HIGH',
    designation: 'CMMC L2',
    metric: '100×',
    metricLabel: 'SPEED_DELTA',
  },
];

const complexityColor: Record<string, string> = {
  HIGH: 'text-[#FFBF00]/60',
  CRITICAL: 'text-[#ff4444]/70',
  MEDIUM: 'text-[#39FF14]/50',
};

const DoctrineGrid = () => {
  return (
    <section className="section-padding bg-[#060606] relative overflow-hidden">
      {/* Faint horizontal rule across full width */}
      <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      <div className="container-main">
        <div className="flex items-end justify-between mb-12">
          <div>
            <span className="font-mono text-[10px] text-[#39FF14]/50 uppercase tracking-[0.25em] mb-3 block">
              // GENESIS MISSION ALIGNMENT
            </span>
            <h2 className="font-mono text-3xl md:text-4xl font-bold text-[#E0E0E0] tracking-tight">
              The Governance Doctrine
            </h2>
          </div>
          <span className="hidden md:block font-mono text-[9px] text-white/15 tracking-[0.2em]">
            [DOE/GENESIS-2026 // PROTOCOLS: 3 // STATUS: ALL_ACTIVE]
          </span>
        </div>

        <div className="grid md:grid-cols-3 gap-0">
          {protocols.map((protocol, i) => (
            <motion.div
              key={protocol.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="relative border border-[rgba(57,255,20,0.1)] p-8 transition-all duration-500 hover:border-[rgba(57,255,20,0.35)] hover:bg-[#39FF14]/[0.02] group"
            >
              {/* Top highlight on hover */}
              <div className="absolute top-0 left-0 right-0 h-px bg-[#39FF14]/0 group-hover:bg-[#39FF14]/40 transition-all duration-500" />

              {/* Protocol ID + Status row */}
              <div className="flex items-center justify-between mb-6">
                <span className="font-mono text-[9px] text-[#39FF14]/40 tracking-[0.2em]">
                  {protocol.id}
                </span>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-[#39FF14]/60 relative">
                    <div className="absolute inset-0 bg-[#39FF14]/40 animate-ping" />
                  </div>
                  <span className="font-mono text-[9px] text-[#39FF14]/40 tracking-wider">
                    {protocol.status}
                  </span>
                </div>
              </div>

              <h3 className="font-mono text-sm font-bold text-[#E0E0E0] mb-4 tracking-wide leading-snug">
                {protocol.title}
              </h3>

              <p className="font-sans text-sm text-white/35 leading-relaxed mb-8">
                {protocol.description}
              </p>

              {/* Metric spotlight */}
              <div className="mb-6 p-3 border border-white/[0.06] bg-white/[0.015]">
                <div className="font-mono text-2xl font-bold text-[#39FF14]/70 mb-0.5">
                  {protocol.metric}
                </div>
                <div className="font-mono text-[9px] text-white/20 tracking-[0.2em]">
                  {protocol.metricLabel}
                </div>
              </div>

              <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between">
                <span className={`font-mono text-[9px] tracking-wider ${complexityColor[protocol.complexity] || 'text-white/30'}`}>
                  COMPLEXITY: {protocol.complexity}
                </span>
                <span className="font-mono text-[9px] text-[#FFBF00]/40 tracking-wider">
                  {protocol.designation}
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
