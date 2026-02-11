import SystemGrid from '@/components/nexus/SystemGrid';
import LiveProvenanceLog from '@/components/nexus/LiveProvenanceLog';

export default function NexusCommand() {
  return (
    <div className="min-h-screen w-full px-6 py-8" style={{ background: '#0F0F0F' }}>
      {/* Shadow Command Watermark */}
      <div
        className="text-center text-[10px] tracking-[0.4em] py-3 mb-8"
        style={{
          fontFamily: 'JetBrains Mono, monospace',
          color: '#FFBF00',
          borderBottom: '1px solid rgba(255,191,0,0.2)',
        }}
      >
        AERELION // SHADOW_COMMAND // SYS.OPS.V2.06 // DOCTRINE_STABILIZED
      </div>

      {/* Elite 7 Grid */}
      <div className="mb-10">
        <SystemGrid />
      </div>

      {/* Live Provenance Log */}
      <LiveProvenanceLog />
    </div>
  );
}
