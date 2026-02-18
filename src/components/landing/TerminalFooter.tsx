import { useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const routeStatus: Record<string, string> = {
  '/': 'SECTOR: HOME // SUBSTRATE: NOMINAL',
  '/automations': 'SECTOR: PROTOCOLS // CAPABILITY_MATRIX: LOADED',
  '/security': 'SECTOR: GOVERNANCE // COMPLIANCE_LAYER: ACTIVE',
  '/contact': 'SECTOR: UPLINK // COMM_CHANNEL: OPEN',
  '/how-it-works': 'SECTOR: DEPLOYMENT // DOCTRINE: PARSED',
  '/docs': 'SECTOR: DOCUMENTATION // ARCHIVE: INDEXED',
};

const telemetryStreams = [
  'INTEGRITY: VERIFIED // CHAIN: 0xA4F2',
  'NODE_SYNC: 100% // DRIFT: 0.0ms',
  'REDUNDANCY: ACTIVE // FAILOVER: STANDBY',
  'AES-256-GCM: ENFORCED // IV: ROTATED',
  'HEARTBEAT: NOMINAL // UPTIME: 99.97%',
  'COOP_LOGIC: STABLE // ENTROPY: LOW',
];

const TerminalFooter = () => {
  const location = useLocation();
  const status =
    routeStatus[location.pathname] ||
    `SECTOR: ${location.pathname.split('/').filter(Boolean).pop()?.toUpperCase() || 'UNKNOWN'} // RENDER: COMPLETE`;
  const [streamIdx, setStreamIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setStreamIdx((p) => (p + 1) % telemetryStreams.length);
    }, 3200);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/[0.06] bg-[#060606]/97 backdrop-blur-xl">
      <div className="max-w-[1680px] mx-auto px-4 md:px-8 h-7 flex items-center justify-between gap-4">

        {/* Left — route status */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="relative shrink-0">
            <div className="w-1.5 h-1.5 bg-[#39FF14]" />
            <div className="absolute inset-0 w-1.5 h-1.5 bg-[#39FF14] animate-ping opacity-40" />
          </div>
          <AnimatePresence mode="wait">
            <motion.span
              key={location.pathname}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 6 }}
              transition={{ duration: 0.18 }}
              className="font-mono text-[9px] text-white/25 tracking-[0.12em] uppercase truncate"
            >
              {status}
            </motion.span>
          </AnimatePresence>
        </div>

        {/* Right — telemetry stream + copyright */}
        <div className="flex items-center gap-4 shrink-0">
          <AnimatePresence mode="wait">
            <motion.span
              key={streamIdx}
              initial={{ opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -3 }}
              transition={{ duration: 0.25 }}
              className="font-mono text-[9px] text-[#39FF14]/20 tracking-[0.1em] hidden md:inline"
            >
              {telemetryStreams[streamIdx]}
            </motion.span>
          </AnimatePresence>
          <span className="font-mono text-[9px] text-white/10 tracking-[0.1em] hidden sm:inline">
            AERELION © 2026
          </span>
        </div>
      </div>
    </div>
  );
};

export default TerminalFooter;
