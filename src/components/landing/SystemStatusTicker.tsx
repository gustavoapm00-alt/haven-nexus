import { motion } from 'framer-motion';

const messages = [
  'SYSTEM STATUS: OPERATIONAL',
  'AGENT ERA: INITIALIZED',
  'PROTOCOL: ACTIVE',
  'ENCRYPTION: AES-256-GCM',
  'UPTIME: 99.97%',
  'NODES ONLINE: 12',
];

const SystemStatusTicker = () => {
  const tickerText = messages.join('  //  ');
  // Duplicate for seamless loop
  const doubled = `${tickerText}  //  ${tickerText}`;

  return (
    <div className="w-full overflow-hidden border-b border-[hsl(180,60%,40%,0.15)] bg-[#0a0a0a]">
      <motion.div
        className="flex whitespace-nowrap py-2"
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
      >
        <span className="font-mono text-xs tracking-[0.2em] text-[hsl(180,60%,50%,0.6)] uppercase">
          {doubled}
        </span>
      </motion.div>
    </div>
  );
};

export default SystemStatusTicker;
