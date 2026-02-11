import { useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';

const routeStatus: Record<string, string> = {
  '/': 'RENDER: COMPLETE // SECTOR: HOME',
  '/automations': 'RENDER: COMPLETE // SECTOR: PROTOCOLS',
  '/security': 'RENDER: COMPLETE // SECTOR: GOVERNANCE',
  '/contact': 'RENDER: COMPLETE // SECTOR: UPLINK',
  '/how-it-works': 'RENDER: COMPLETE // SECTOR: DEPLOYMENT',
};

const heartbeats = [
  '[HB-001] HEARTBEAT: NOMINAL',
  '[HB-002] LATENCY: 11ms',
  '[HB-003] FRAMEWORK: STABLE',
  '[HB-004] INTEGRITY: VERIFIED',
  '[HB-005] REDUNDANCY: ACTIVE',
];

const TerminalFooter = () => {
  const location = useLocation();
  const status = routeStatus[location.pathname] || `RENDER: COMPLETE // PATH: ${location.pathname.toUpperCase()}`;
  const [hbIndex, setHbIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setHbIndex((prev) => (prev + 1) % heartbeats.length);
    }, 3000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-[#0F0F0F]/95 backdrop-blur-sm">
      <div className="max-w-[1600px] mx-auto px-4 md:px-6 h-7 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="w-1.5 h-1.5 bg-[#39FF14]/60" />
          <span className="font-mono text-[9px] text-white/25 tracking-[0.12em] uppercase">
            {status}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="font-mono text-[9px] text-[#39FF14]/20 tracking-[0.1em] hidden sm:inline">{heartbeats[hbIndex]}</span>
          <span className="font-mono text-[9px] text-white/15 tracking-[0.1em]">SECURITY: ENCRYPTED</span>
          <span className="font-mono text-[9px] text-white/10 tracking-[0.1em]">AERELION © 2026</span>
        </div>
      </div>
    </div>
  );
};

export default TerminalFooter;
