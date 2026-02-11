import { motion } from 'framer-motion';
import { type AgentState, type AgentStatusEnum } from '@/hooks/useAgentStatus';

const MODULES = [
  { id: 'AG-01', codename: 'SENTINEL', protocol: 'CUI Handoff & NIST/CMMC Scanning', refId: 'REF-SENTINEL-800171' },
  { id: 'AG-02', codename: 'LIBRARIAN', protocol: 'Universal Data Ontology & Schema Mapping', refId: 'REF-LIBRARIAN-ONTO' },
  { id: 'AG-03', codename: 'WATCHMAN', protocol: 'COOP & Drift Detection Resilience', refId: 'REF-WATCHMAN-COOP' },
  { id: 'AG-04', codename: 'GATEKEEPER', protocol: 'PoLP Access Governance & Security', refId: 'REF-GATEKEEPER-POLP' },
  { id: 'AG-05', codename: 'AUDITOR', protocol: 'Threat Surface Reduction (Anti-Shadow IT)', refId: 'REF-AUDITOR-TSR' },
  { id: 'AG-06', codename: 'CHRONICLER', protocol: 'Real-Time System Status & Provenance', refId: 'REF-CHRONICLER-SYS' },
  { id: 'AG-07', codename: 'ENVOY', protocol: 'Executive Briefing & After-Action Reports', refId: 'REF-ENVOY-AAR' },
];

const STATUS_COLORS: Record<AgentStatusEnum, string> = {
  NOMINAL: '#39FF14',
  PROCESSING: '#39FF14',
  DRIFT: '#FFBF00',
  ERROR: '#FF4444',
  OFFLINE: '#333',
};

function relativeTime(iso: string | null): string {
  if (!iso) return 'NEVER';
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 60_000) return `${Math.floor(diff / 1000)}s`;
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m`;
  return `${Math.floor(diff / 3_600_000)}h`;
}

interface NexusModuleGridProps {
  agentStatuses: Record<string, AgentState>;
  forceStabilize: (id: string) => void;
}

export default function NexusModuleGrid({ agentStatuses, forceStabilize }: NexusModuleGridProps) {
  return (
    <section>
      <h2
        className="text-[8px] tracking-[0.3em] mb-3 uppercase"
        style={{ fontFamily: 'JetBrains Mono, monospace', color: '#39FF14', opacity: 0.5 }}
      >
        NEXUS_MODULES // SYNCHRONIZED_GRID
      </h2>

      {/* Compact 7-column status grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-7 gap-[1px]">
        {MODULES.map((m) => {
          const state = agentStatuses[m.id];
          const color = STATUS_COLORS[state?.status || 'OFFLINE'];
          const isDrift = state?.status === 'DRIFT';
          const isProcessing = state?.status === 'PROCESSING';

          return (
            <motion.div
              key={m.id}
              className="group relative p-3 cursor-default"
              style={{
                background: '#050505',
                border: `1px solid ${isDrift ? color : 'rgba(57,255,20,0.08)'}`,
                fontFamily: 'JetBrains Mono, monospace',
                transition: 'border-color 0.3s',
              }}
              whileHover={{ borderColor: color }}
            >
              {/* Processing scanline */}
              {isProcessing && (
                <motion.div
                  className="absolute top-0 left-0 w-full h-[1px] pointer-events-none"
                  style={{ background: '#39FF14', opacity: 0.6 }}
                  animate={{ y: ['0px', '100%'] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                />
              )}

              {/* Status dot */}
              <div className="flex items-center gap-1.5 mb-2">
                <span className="relative flex h-1.5 w-1.5">
                  {state?.status !== 'OFFLINE' && (
                    <span
                      className="animate-ping absolute inline-flex h-full w-full opacity-40"
                      style={{ background: color, borderRadius: '50%' }}
                    />
                  )}
                  <span
                    className="relative inline-flex h-1.5 w-1.5"
                    style={{ background: color, borderRadius: '50%' }}
                  />
                </span>
                <span className="text-[7px] tracking-[0.2em] uppercase" style={{ color, opacity: 0.7 }}>
                  {state?.status || 'OFFLINE'}
                </span>
              </div>

              {/* Module ID */}
              <p className="text-[7px] tracking-[0.15em] uppercase mb-0.5" style={{ color: '#555' }}>
                {m.id}
              </p>

              {/* Codename */}
              <h3
                className="text-[10px] tracking-wide uppercase mb-1"
                style={{ color: '#FFF', fontWeight: 600 }}
              >
                {m.codename}
              </h3>

              {/* Protocol */}
              <p className="text-[8px] leading-relaxed mb-2" style={{ color: '#444' }}>
                {m.protocol}
              </p>

              {/* Last signal */}
              <p className="text-[7px] uppercase" style={{ color: '#333' }}>
                SIGNAL: {relativeTime(state?.lastSeen)} AGO
              </p>

              {/* Live message on hover */}
              {state?.message && (
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 mt-1">
                  <p className="text-[7px] truncate" style={{ color: '#555' }}>
                    &gt; {state.message}
                  </p>
                </div>
              )}

              {/* Stabilize on drift */}
              {isDrift && (
                <button
                  onClick={() => forceStabilize(m.id)}
                  className="w-full text-[7px] tracking-[0.15em] py-1 uppercase mt-2 animate-pulse"
                  style={{
                    color: '#FFBF00',
                    background: 'transparent',
                    border: '1px solid rgba(255,191,0,0.4)',
                    cursor: 'pointer',
                  }}
                >
                  [STABILIZE]
                </button>
              )}
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
