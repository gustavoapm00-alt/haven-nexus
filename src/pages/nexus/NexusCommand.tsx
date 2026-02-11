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
    <div className="relative min-h-screen w-full" style={{ background: '#010101' }}>
      {/* Persistent low-opacity watermark */}
      <div
        className="fixed inset-0 pointer-events-none z-0 flex items-center justify-center"
        style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 11,
          color: 'rgba(57,255,20,0.04)',
          letterSpacing: '0.3em',
          lineHeight: 3,
          whiteSpace: 'pre-wrap',
          textAlign: 'center',
          overflow: 'hidden',
        }}
      >
        {Array(20)
          .fill('PROPERTY_OF_AERELION_SYSTEMS_LLC // DOCTRINE_STABILIZED')
          .join('\n')}
      </div>

      {/* Scanline overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-[1]"
        style={{
          background:
            'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(57,255,20,0.015) 2px, rgba(57,255,20,0.015) 4px)',
        }}
      />

      {/* HUD Header — fixed top bar */}
      <header
        className="sticky top-0 z-50 flex items-center justify-between px-6 py-3"
        style={{
          background: 'rgba(1,1,1,0.95)',
          borderBottom: '1px solid #39FF14',
          fontFamily: 'JetBrains Mono, monospace',
          backdropFilter: 'blur(8px)',
        }}
      >
        <div
          className="text-[10px] tracking-[0.4em]"
          style={{ color: '#FFBF00' }}
        >
          AERELION // SYS.OPS.V2.06 // ADMIN_PROVENANCE
        </div>

        <div className="flex items-center gap-6">
          <span className="text-[10px] tracking-wider" style={{ color: '#39FF14' }}>
            {clock}
          </span>
          <span className="text-[10px] tracking-wider" style={{ color: '#FFBF00' }}>
            ENTROPY_LEVEL: {entropy}
          </span>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 px-6 py-8 pb-[400px]">
        {/* Elite 7 Grid */}
        <div className="mb-10">
          <SystemGrid />
        </div>

        {/* Regulator Interface */}
        <div className="mb-10">
          <RegulatorDiagram />
        </div>
      </main>

      {/* Docked Live Provenance Log — transparent bottom overlay */}
      <div
        className="fixed bottom-0 left-0 right-0 z-40"
        style={{
          background: 'rgba(1,1,1,0.88)',
          borderTop: '1px solid #39FF14',
          backdropFilter: 'blur(6px)',
        }}
      >
        <LiveProvenanceLog />
      </div>
    </div>
  );
}
