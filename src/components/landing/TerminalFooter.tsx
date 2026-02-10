import { useLocation } from 'react-router-dom';

const routeStatus: Record<string, string> = {
  '/': 'RENDER: COMPLETE // SECTOR: HOME',
  '/automations': 'RENDER: COMPLETE // SECTOR: PROTOCOLS',
  '/security': 'RENDER: COMPLETE // SECTOR: GOVERNANCE',
  '/contact': 'RENDER: COMPLETE // SECTOR: UPLINK',
  '/how-it-works': 'RENDER: COMPLETE // SECTOR: DEPLOYMENT',
};

const TerminalFooter = () => {
  const location = useLocation();
  const status = routeStatus[location.pathname] || `RENDER: COMPLETE // PATH: ${location.pathname.toUpperCase()}`;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t-[0.5px] border-white/10 bg-black/95 backdrop-blur-sm">
      <div className="max-w-[1600px] mx-auto px-4 md:px-6 h-7 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500/60" />
          <span className="font-mono text-[9px] text-white/25 tracking-[0.12em] uppercase">
            {status}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="font-mono text-[9px] text-white/15 tracking-[0.1em]">SECURITY: ENCRYPTED</span>
          <span className="font-mono text-[9px] text-white/10 tracking-[0.1em]">AERELION © 2026</span>
        </div>
      </div>
    </div>
  );
};

export default TerminalFooter;
