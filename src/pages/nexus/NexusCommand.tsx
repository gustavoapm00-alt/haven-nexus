import { useState, useEffect } from 'react';
import { useAgentStatus } from '@/hooks/useAgentStatus';
import GlobalHealthStatus from '@/components/nexus/GlobalHealthStatus';
import NexusModuleGrid from '@/components/nexus/NexusModuleGrid';
import LiveProvenanceLog from '@/components/nexus/LiveProvenanceLog';
import RegulatorDiagram from '@/components/nexus/RegulatorDiagram';

function useSystemClock() {
  const [time, setTime] = useState('');
  useEffect(() => {
    const tick = () => setTime(new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC');
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return time;
}

function useEntropy() {
  const [entropy, setEntropy] = useState('0.02%');
  useEffect(() => {
    const tick = () => {
      const v = (Math.random() * 0.03 + 0.01).toFixed(2);
      setEntropy(`${v}%`);
    };
    tick();
    const id = setInterval(tick, 5000);
    return () => clearInterval(id);
  }, []);
  return entropy;
}

export default function NexusCommand() {
  const clock = useSystemClock();
  const entropy = useEntropy();
  const { agentStatuses, forceStabilize } = useAgentStatus();

  return (
    <div className="relative min-h-screen w-full" style={{ background: '#000000' }}>
      {/* Centered watermark */}
      <div className="fixed inset-0 pointer-events-none z-0 flex items-center justify-center">
        <svg
          width="480" height="480" viewBox="0 0 480 480" fill="none"
          xmlns="http://www.w3.org/2000/svg" style={{ opacity: 0.02 }}
        >
          <polygon points="240,40 420,140 420,340 240,440 60,340 60,140" stroke="#39FF14" strokeWidth="1" fill="none" />
          <polygon points="240,100 370,170 370,310 240,380 110,310 110,170" stroke="#39FF14" strokeWidth="0.5" fill="none" />
          <polygon points="240,140 340,280 140,280" stroke="#39FF14" strokeWidth="0.5" fill="none" />
          <line x1="240" y1="40" x2="240" y2="440" stroke="#39FF14" strokeWidth="0.3" />
          <line x1="60" y1="240" x2="420" y2="240" stroke="#39FF14" strokeWidth="0.3" />
          <text x="240" y="250" textAnchor="middle" fill="#39FF14" fontFamily="JetBrains Mono, monospace" fontSize="14" letterSpacing="8">AERELION</text>
        </svg>
      </div>

      {/* Scanline overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-[1]"
        style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(57,255,20,0.012) 2px, rgba(57,255,20,0.012) 4px)',
        }}
      />

      {/* HUD Header */}
      <header
        className="sticky top-0 z-50 flex items-center justify-between px-6 py-2"
        style={{
          background: 'rgba(0,0,0,0.96)',
          borderBottom: '1px solid rgba(57,255,20,0.3)',
          fontFamily: 'JetBrains Mono, monospace',
          backdropFilter: 'blur(8px)',
        }}
      >
        <div className="text-[9px] tracking-[0.4em] uppercase" style={{ color: '#FFBF00' }}>
          AERELION // SYS.OPS.V2.06 // NEXUS_GOVERNANCE
        </div>
        <div className="flex items-center gap-6">
          <span className="text-[9px] tracking-wider" style={{ color: '#39FF14', opacity: 0.7 }}>{clock}</span>
          <span className="text-[9px] tracking-wider" style={{ color: '#FFBF00', opacity: 0.7 }}>ENTROPY_LEVEL: {entropy}</span>
        </div>
      </header>

      {/* GLOBAL HEALTH INDEX — Primary system state */}
      <div className="relative z-10">
        <GlobalHealthStatus agentStatuses={agentStatuses} />
      </div>

      {/* Main content */}
      <main className="relative z-10 px-6 py-6 pb-[280px]">
        <div className="max-w-[1440px] mx-auto">
          {/* Nexus Module Grid — compact synchronized view */}
          <div className="mb-8">
            <NexusModuleGrid agentStatuses={agentStatuses} forceStabilize={forceStabilize} />
          </div>

          {/* Regulator Interface */}
          <div className="mb-8">
            <RegulatorDiagram />
          </div>
        </div>
      </main>

      {/* Docked Global Provenance Trail */}
      <div
        className="fixed bottom-0 left-0 right-0 z-40"
        style={{
          background: 'rgba(0,0,0,0.92)',
          borderTop: '1px solid rgba(57,255,20,0.25)',
          backdropFilter: 'blur(6px)',
        }}
      >
        <LiveProvenanceLog />
        <div
          className="flex items-center justify-between px-4 pb-1"
          style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 6, letterSpacing: '0.2em' }}
        >
          <span style={{ color: 'rgba(57,255,20,0.3)' }}>/NEXUS/CMD // GLOBAL_PROVENANCE_TRAIL</span>
          <span style={{ color: 'rgba(57,255,20,0.3)' }}>AERELION // 2026</span>
        </div>
      </div>
    </div>
  );
}
