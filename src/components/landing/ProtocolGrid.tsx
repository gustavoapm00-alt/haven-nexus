import { motion } from 'framer-motion';
import { Shield, Network, FileCheck } from 'lucide-react';

const protocols = [
  {
    icon: Shield,
    title: 'Audit & Hardening',
    description: 'Security protocols and infrastructure stress-testing.',
    tag: 'PROTOCOL_01',
  },
  {
    icon: Network,
    title: 'Agent Deployment',
    description: 'Autonomous workflows that execute without supervision.',
    tag: 'PROTOCOL_02',
  },
  {
    icon: FileCheck,
    title: 'Governance',
    description: 'Encryption, compliance, and operational rule-sets.',
    tag: 'PROTOCOL_03',
  },
];

const ProtocolGrid = () => {
  return (
    <section className="py-24 md:py-32 bg-[#0a0a0a]">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <p className="font-mono text-xs tracking-[0.3em] uppercase text-[hsl(180,60%,50%)] mb-4">
            // Active Protocols
          </p>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl text-[#e8e8e8] tracking-tight">
            The Protocol Grid
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[hsl(0,0%,15%)]">
          {protocols.map((protocol, index) => (
            <motion.div
              key={protocol.tag}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className="group relative bg-[#0a0a0a] p-8 md:p-10 transition-all duration-500 hover:bg-[hsl(180,30%,5%)]"
            >
              {/* Hover border glow */}
              <div className="absolute inset-0 border border-transparent group-hover:border-[hsl(180,60%,40%,0.3)] transition-colors duration-500 pointer-events-none" />

              <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-[hsl(0,0%,35%)] mb-6">
                {protocol.tag}
              </p>

              <protocol.icon
                className="w-8 h-8 text-[hsl(180,50%,50%)] mb-6 transition-colors duration-300 group-hover:text-[hsl(180,60%,60%)]"
                strokeWidth={1.5}
              />

              <h3 className="font-display text-xl md:text-2xl text-[#e8e8e8] mb-3 tracking-tight">
                {protocol.title}
              </h3>

              <p className="font-mono text-sm text-[hsl(0,0%,45%)] leading-relaxed">
                {protocol.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProtocolGrid;
