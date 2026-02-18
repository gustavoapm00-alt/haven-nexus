import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
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

const MONO = 'JetBrains Mono, monospace';
const CRON_CYCLE_MS = 2 * 60 * 60 * 1000;    // 2h — expected n8n cadence
const OFFLINE_THRESHOLD_MS = 4 * 60 * 60 * 1000; // 4h — hard offline

/** Live VERACITY_TTL countdown — amber flicker once signal age > 2h cron window */
function VeracityTTL({ lastSeen }: { lastSeen: string | null }) {
  const [display, setDisplay] = useState('--:--:--');
  const [isAmber, setIsAmber] = useState(false);

  useEffect(() => {
    if (!lastSeen) {
      setDisplay('NO_SIGNAL');
      setIsAmber(true);
      return;
    }
    const tick = () => {
      const age = Date.now() - new Date(lastSeen).getTime();
      setIsAmber(age > CRON_CYCLE_MS);
      if (age > OFFLINE_THRESHOLD_MS) { setDisplay('SIGNAL_EXPIRED'); return; }
      const totalSec = Math.floor(age / 1000);
      const h = Math.floor(totalSec / 3600);
      const m = Math.floor((totalSec % 3600) / 60);
      const s = totalSec % 60;
      setDisplay(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [lastSeen]);

  const color = isAmber ? '#FFBF00' : '#39FF14';
  const border = isAmber ? 'rgba(255,191,0,0.18)' : 'rgba(57,255,20,0.08)';
  const bg = isAmber ? 'rgba(255,191,0,0.04)' : 'rgba(57,255,20,0.02)';

  return (
    <div
      className="flex items-center justify-between px-1.5 py-0.5 mt-1"
      style={{ background: bg, border: `1px solid ${border}`, borderRadius: 0 }}
    >
      <span className="text-[5px] uppercase tracking-[0.2em]" style={{ fontFamily: MONO, color: '#383838' }}>
        VERACITY_TTL
      </span>
      <motion.code
        className="text-[7px] tabular-nums"
        style={{ fontFamily: MONO, color }}
        animate={isAmber ? { opacity: [1, 0.45, 1] } : { opacity: 1 }}
        transition={isAmber ? { duration: 1.2, repeat: Infinity } : {}}
      >
        {display}
      </motion.code>
    </div>
  );
}

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
        style={{ fontFamily: MONO, color: '#39FF14', opacity: 0.5 }}
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

              {/* Last signal + VERACITY_TTL */}
              <p className="text-[6px] uppercase mb-0.5" style={{ fontFamily: MONO, color: '#2a2a2a' }}>
                LAST_SIGNAL: {relativeTime(state?.lastSeen)} AGO
              </p>
              <VeracityTTL lastSeen={state?.lastSeen ?? null} />

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
