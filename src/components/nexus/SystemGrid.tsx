import { motion } from 'framer-motion';
import { useAgentStatus, type AgentStatusEnum } from '@/hooks/useAgentStatus';
import { SentinelGauge, AuditorLastCommit, EnvoyReportButton } from './AgentSpecializedWidgets';

const AGENTS = [
  { id: 'AG-01', codename: 'THE SENTINEL', fn: 'CUI Handoff & NIST/CMMC Scanning', refId: 'REF-SENTINEL-800171', impact: 'NIST_800-171_COMPLIANCE' },
  { id: 'AG-02', codename: 'THE LIBRARIAN', fn: 'Universal Data Ontology & Schema Mapping', refId: 'REF-LIBRARIAN-ONTO', impact: 'DATA_NORMALIZATION' },
  { id: 'AG-03', codename: 'THE WATCHMAN', fn: 'COOP & Drift Detection Resilience', refId: 'REF-WATCHMAN-COOP', impact: 'CONTINUITY_ASSURANCE' },
  { id: 'AG-04', codename: 'THE GATEKEEPER', fn: 'PoLP Access Governance & Security', refId: 'REF-GATEKEEPER-POLP', impact: 'ACCESS_CONTROL' },
  { id: 'AG-05', codename: 'THE AUDITOR', fn: 'Threat Surface Reduction (Anti-Shadow IT)', refId: 'REF-AUDITOR-TSR', impact: 'THREAT_MITIGATION' },
  { id: 'AG-06', codename: 'THE CHRONICLER', fn: 'Real-Time System Status Ticker', refId: 'REF-CHRONICLER-SYS', impact: 'OBSERVABILITY' },
  { id: 'AG-07', codename: 'THE ENVOY', fn: 'Executive Briefing AI (After-Action Reports)', refId: 'REF-ENVOY-AAR', impact: 'EXECUTIVE_OVERSIGHT' },
];

const STATUS_COLORS: Record<AgentStatusEnum, { border: string; pulse: string; text: string }> = {
  NOMINAL: { border: '#1a1a1a', pulse: '#39FF14', text: '#39FF14' },
  PROCESSING: { border: '#39FF14', pulse: '#39FF14', text: '#39FF14' },
  DRIFT: { border: '#FFBF00', pulse: '#FFBF00', text: '#FFBF00' },
  ERROR: { border: '#FF4444', pulse: '#FF4444', text: '#FF4444' },
  OFFLINE: { border: '#222', pulse: '#333', text: '#444' },
};

function relativeTime(iso: string | null): string {
  if (!iso) return 'NEVER';
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 60_000) return `${Math.floor(diff / 1000)}s AGO`;
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m AGO`;
  return `${Math.floor(diff / 3_600_000)}h AGO`;
}

export default function SystemGrid() {
  const { agentStatuses, forceStabilize } = useAgentStatus();

  return (
    <section>
      <h2
        className="text-[9px] tracking-[0.3em] mb-4 uppercase"
        style={{ fontFamily: 'JetBrains Mono, monospace', color: '#39FF14', opacity: 0.6 }}
      >
        ELITE_7 // AGENT_GRID
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-[1px]">
        {AGENTS.map((a) => {
          const state = agentStatuses[a.id];
          const colors = STATUS_COLORS[state?.status || 'OFFLINE'];
          const isDrift = state?.status === 'DRIFT';
          const isProcessing = state?.status === 'PROCESSING';
          const isOffline = state?.status === 'OFFLINE';

          return (
            <motion.div
              key={a.id}
              className="group relative p-3 overflow-hidden"
              style={{ background: '#050505', borderRadius: 0 }}
              animate={{ borderColor: colors.border }}
              transition={{ duration: 0.3 }}
              initial={false}
              // 1px border via box-shadow to allow animation
              // @ts-ignore
              css={{ border: `1px solid ${colors.border}` }}
            >
              {/* Animated border wrapper */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{ border: `1px solid ${colors.border}`, transition: 'border-color 0.3s' }}
              />

              {/* Scanline animation for PROCESSING */}
              {isProcessing && (
                <motion.div
                  className="absolute top-0 left-0 h-full pointer-events-none"
                  style={{ width: '1px', background: '#39FF14', opacity: 0.6 }}
                  animate={{ x: ['0px', '100%'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                />
              )}

              {/* Pulse indicator */}
              <span className="absolute top-3 right-3 flex h-2 w-2">
                {!isOffline && (
                  <span
                    className="animate-ping absolute inline-flex h-full w-full opacity-40"
                    style={{ background: colors.pulse, borderRadius: '50%' }}
                  />
                )}
                <span
                  className="relative inline-flex h-2 w-2"
                  style={{
                    background: colors.pulse,
                    borderRadius: '50%',
                    boxShadow: isOffline ? 'none' : `0 0 10px ${colors.pulse}33`,
                  }}
                />
              </span>

              {/* Protocol ID + live task */}
              <p
                className="text-[8px] tracking-[0.25em] mb-0.5 uppercase truncate"
                style={{ fontFamily: 'JetBrains Mono, monospace', color: colors.text, opacity: 0.4, maxWidth: '100%' }}
              >
                {state?.message ? `${a.id}: ${state.message}` : a.id}
              </p>

              {/* Codename */}
              <h3
                className="text-xs tracking-wide mb-1 uppercase"
                style={{ fontFamily: 'JetBrains Mono, monospace', color: '#FFFFFF', fontWeight: 500 }}
              >
                {a.codename}
              </h3>

              {/* Function */}
              <p
                className="text-[10px] leading-relaxed mb-2"
                style={{ color: '#666', fontFamily: 'JetBrains Mono, monospace' }}
              >
                {a.fn}
              </p>

              {/* Metadata */}
              <div className="space-y-px mb-1">
                <code
                  className="block text-[8px] px-2 py-0.5"
                  style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    color: '#39FF14',
                    background: 'rgba(57,255,20,0.03)',
                    border: '1px solid rgba(57,255,20,0.1)',
                    borderRadius: 0,
                  }}
                >
                  [REF-ID] {a.refId}
                </code>
                <code
                  className="block text-[8px] px-2 py-0.5"
                  style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    color: '#FFBF00',
                    background: 'rgba(255,191,0,0.03)',
                    border: '1px solid rgba(255,191,0,0.1)',
                    borderRadius: 0,
                  }}
                >
                  [SYSTEM_IMPACT] {a.impact}
                </code>
              </div>

              {/* Live state readout */}
              <div className="mb-1 space-y-px">
                <code
                  className="block text-[7px] px-2 py-0.5 uppercase"
                  style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    color: colors.text,
                    opacity: 0.5,
                  }}
                >
                  LAST_SIGNAL: {relativeTime(state?.lastSeen)}
                </code>
                {state?.message && (
                  <code
                    className="block text-[7px] px-2 py-0.5 truncate"
                    style={{
                      fontFamily: 'JetBrains Mono, monospace',
                      color: '#555',
                      maxWidth: '100%',
                    }}
                  >
                    &gt; {state.message}
                  </code>
                )}
              </div>

              {/* Specialized per-agent widgets */}
              {a.id === 'AG-01' && <SentinelGauge state={state} />}
              {a.id === 'AG-05' && <AuditorLastCommit state={state} />}
              {a.id === 'AG-07' && <EnvoyReportButton />}

              {/* FORCE_STABILIZATION — always visible on DRIFT, hover-only otherwise */}
              <div className={`transition-opacity duration-200 ${isDrift ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                <button
                  onClick={() => forceStabilize(a.id)}
                  className={`w-full text-[8px] tracking-[0.2em] py-1.5 uppercase transition-all ${isDrift ? 'animate-pulse' : ''}`}
                  style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    color: colors.text,
                    background: 'transparent',
                    border: `1px solid ${colors.text}`,
                    borderRadius: 0,
                    cursor: 'pointer',
                    fontWeight: 500,
                  }}
                  onMouseEnter={(e) => {
                    (e.target as HTMLButtonElement).style.boxShadow = `0 0 15px ${colors.text}66, inset 0 0 15px ${colors.text}1a`;
                    (e.target as HTMLButtonElement).style.background = `${colors.text}0f`;
                  }}
                  onMouseLeave={(e) => {
                    (e.target as HTMLButtonElement).style.boxShadow = 'none';
                    (e.target as HTMLButtonElement).style.background = 'transparent';
                  }}
                >
                  [FORCE_STABILIZATION]
                </button>
              </div>

              {/* Inactive wireframe placeholder */}
              {!isDrift && (
                <div className="transition-opacity duration-200 opacity-100 group-hover:opacity-0 absolute bottom-3 left-3 right-3">
                  <div className="w-full py-1.5" style={{ border: '1px solid #111', borderRadius: 0 }} />
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
