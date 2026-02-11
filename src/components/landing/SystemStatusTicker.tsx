import { motion } from 'framer-motion';

const messages = [
  'STANDARDIZATION: ACTIVE',
  'FRAMEWORK: DEPLOYED',
  'INTEGRITY CHECK: PASSED',
  'ENCRYPTION: AES-256-GCM',
  'UPTIME: 99.97%',
  'REDUNDANCY: NOMINAL',
  'GOVERNANCE: ENFORCED',
];

const SystemStatusTicker = () => {
  const tickerText = messages.join('  //  ');
  const doubled = `${tickerText}  //  ${tickerText}`;

  return (
    <div className="w-full overflow-hidden border-b border-white/10 bg-[#0a0a0a]">
      <motion.div
        className="flex whitespace-nowrap py-2"
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
      >
        <span className="font-mono text-xs tracking-[0.2em] text-[#39FF14]/50 uppercase">
          {doubled}
        </span>
      </motion.div>
    </div>
  );
};

export default SystemStatusTicker;
