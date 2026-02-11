import { useState, useEffect } from 'react';
import SystemGrid from '@/components/nexus/SystemGrid';
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

  return (
    <div className="relative min-h-screen w-full" style={{ background: '#000000' }}>
      {/* Centered non-repeating AERELION logo SVG watermark at 2% opacity */}
      <div className="fixed inset-0 pointer-events-none z-0 flex items-center justify-center">
        <svg
          width="480"
          height="480"
          viewBox="0 0 480 480"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ opacity: 0.02 }}
        >
          {/* Outer hexagon */}
          <polygon
            points="240,40 420,140 420,340 240,440 60,340 60,140"
            stroke="#39FF14"
            strokeWidth="1"
            fill="none"
          />
          {/* Inner hexagon */}
          <polygon
            points="240,100 370,170 370,310 240,380 110,310 110,170"
            stroke="#39FF14"
            strokeWidth="0.5"
            fill="none"
          />
          {/* Central triangle */}
          <polygon
            points="240,140 340,280 140,280"
            stroke="#39FF14"
            strokeWidth="0.5"
            fill="none"
          />
          {/* Vertical axis */}
          <line x1="240" y1="40" x2="240" y2="440" stroke="#39FF14" strokeWidth="0.3" />
          {/* Horizontal axis */}
          <line x1="60" y1="240" x2="420" y2="240" stroke="#39FF14" strokeWidth="0.3" />
          {/* Center text */}
          <text
            x="240"
            y="250"
            textAnchor="middle"
            fill="#39FF14"
            fontFamily="JetBrains Mono, monospace"
            fontSize="14"
            letterSpacing="8"
          >
            AERELION
          </text>
        </svg>
      </div>

      {/* Scanline overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-[1]"
        style={{
          background:
            'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(57,255,20,0.012) 2px, rgba(57,255,20,0.012) 4px)',
        }}
      />

      {/* HUD Header — fixed top bar */}
      <header
        className="sticky top-0 z-50 flex items-center justify-between px-6 py-2"
        style={{
          background: 'rgba(0,0,0,0.96)',
          borderBottom: '1px solid rgba(57,255,20,0.3)',
          fontFamily: 'JetBrains Mono, monospace',
          backdropFilter: 'blur(8px)',
        }}
      >
        <div
          className="text-[9px] tracking-[0.4em] uppercase"
          style={{ color: '#FFBF00' }}
        >
          AERELION // SYS.OPS.V2.06 // ADMIN_PROVENANCE
        </div>

        <div className="flex items-center gap-6">
          <span className="text-[9px] tracking-wider" style={{ color: '#39FF14', opacity: 0.7 }}>
            {clock}
          </span>
          <span className="text-[9px] tracking-wider" style={{ color: '#FFBF00', opacity: 0.7 }}>
            ENTROPY_LEVEL: {entropy}
          </span>
        </div>
      </header>

      {/* Main content — 12-column grid discipline */}
      <main className="relative z-10 px-6 py-6 pb-[280px]">
        <div className="max-w-[1440px] mx-auto">
          {/* Elite 7 Grid */}
          <div className="mb-8">
            <SystemGrid />
          </div>

          {/* Regulator Interface */}
          <div className="mb-8">
            <RegulatorDiagram />
          </div>
        </div>
      </main>

      {/* Docked Live Provenance Log — transparent bottom overlay */}
      <div
        className="fixed bottom-0 left-0 right-0 z-40"
        style={{
          background: 'rgba(0,0,0,0.92)',
          borderTop: '1px solid rgba(57,255,20,0.25)',
          backdropFilter: 'blur(6px)',
        }}
      >
        <LiveProvenanceLog />
        {/* Footer HUD — path and watermark in micro-font */}
        <div
          className="flex items-center justify-between px-4 pb-1"
          style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 6, letterSpacing: '0.2em' }}
        >
          <span style={{ color: 'rgba(57,255,20,0.3)' }}>/NEXUS/CMD</span>
          <span style={{ color: 'rgba(57,255,20,0.3)' }}>AERELION // 2026</span>
        </div>
      </div>
    </div>
  );
}
