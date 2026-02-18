import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useCallback } from 'react';
import { useAgentStatus, type AgentStatusEnum } from '@/hooks/useAgentStatus';
import { SentinelGauge, AuditorLastCommit, EnvoyReportButton } from './AgentSpecializedWidgets';
import { supabase } from '@/integrations/supabase/client';

const MONO = 'JetBrains Mono, monospace';
const CRON_CYCLE_MS = 2 * 60 * 60 * 1000;   // 2h — expected n8n cadence
const OFFLINE_THRESHOLD_MS = 4 * 60 * 60 * 1000; // 4h — hard offline

// ─── CRON_PROVENANCE badge ────────────────────────────────────────────────────
function CronProvenanceBadge({ source }: { source: string | null }) {
  const isCron = source === 'n8n_cron';
  const isUnknown = source === null;
  const label = isUnknown ? 'NO_SIGNAL' : source.toUpperCase();
  const color = isCron ? '#39FF14' : isUnknown ? '#333' : '#FFBF00';
  const bg = isCron ? 'rgba(57,255,20,0.04)' : isUnknown ? 'rgba(255,255,255,0.01)' : 'rgba(255,191,0,0.06)';
  const borderColor = isCron ? 'rgba(57,255,20,0.15)' : isUnknown ? '#1a1a1a' : 'rgba(255,191,0,0.25)';

  return (
    <div className="mb-1.5 flex items-center gap-1.5">
      <div
        className="flex items-center gap-1 px-1.5 py-0.5 flex-1"
        style={{ background: bg, border: `1px solid ${borderColor}`, borderRadius: 0 }}
      >
        <span className="text-[6px] uppercase tracking-[0.2em] shrink-0" style={{ fontFamily: MONO, color: '#444' }}>
          CRON_PROVENANCE
        </span>
        <span className="flex-1" />
        <span
          className="inline-block h-1.5 w-1.5 shrink-0"
          style={{ background: color, borderRadius: '50%', boxShadow: isCron ? `0 0 6px ${color}88` : 'none' }}
        />
        <code className="text-[7px] uppercase tracking-wider shrink-0" style={{ fontFamily: MONO, color }}>
          {label}
        </code>
      </div>
      {!isCron && !isUnknown && (
        <motion.div
          className="px-1.5 py-0.5"
          style={{ background: 'rgba(255,191,0,0.06)', border: '1px solid rgba(255,191,0,0.3)', borderRadius: 0 }}
          animate={{ opacity: [1, 0.4, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <span className="text-[6px] uppercase tracking-wider" style={{ fontFamily: MONO, color: '#FFBF00' }}>
            ⚠ MANUAL
          </span>
        </motion.div>
      )}
    </div>
  );
}

// ─── VERACITY_TTL live countdown ─────────────────────────────────────────────
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
      const amber = age > CRON_CYCLE_MS;
      setIsAmber(amber);

      if (age > OFFLINE_THRESHOLD_MS) {
        setDisplay('EXPIRED');
        return;
      }
      // Show time SINCE last heartbeat as HH:MM:SS
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
  const bg = isAmber ? 'rgba(255,191,0,0.05)' : 'rgba(57,255,20,0.03)';
  const border = isAmber ? 'rgba(255,191,0,0.2)' : 'rgba(57,255,20,0.1)';

  return (
    <div
      className="flex items-center justify-between px-1.5 py-0.5 mb-1.5"
      style={{ background: bg, border: `1px solid ${border}`, borderRadius: 0 }}
    >
      <span className="text-[6px] uppercase tracking-[0.2em]" style={{ fontFamily: MONO, color: '#444' }}>
        VERACITY_TTL
      </span>
      <motion.code
        className="text-[8px] tabular-nums"
        style={{ fontFamily: MONO, color }}
        animate={isAmber ? { opacity: [1, 0.5, 1] } : { opacity: 1 }}
        transition={isAmber ? { duration: 1.2, repeat: Infinity } : {}}
      >
        {display}
      </motion.code>
    </div>
  );
}

// ─── HEARTBEAT_HISTORY drawer ─────────────────────────────────────────────────
interface HeartbeatRow {
  id: string;
  created_at: string;
  status: string;
  message: string;
  metadata: Record<string, unknown>;
}

function HeartbeatHistoryDrawer({
  agentId,
  codename,
  onClose,
}: {
  agentId: string;
  codename: string;
  onClose: () => void;
}) {
  const [rows, setRows] = useState<HeartbeatRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('agent_heartbeats')
      .select('id, created_at, status, message, metadata')
      .eq('agent_id', agentId)
      .order('created_at', { ascending: false })
      .limit(20);
    setRows((data as HeartbeatRow[]) || []);
    setLoading(false);
  }, [agentId]);

  useEffect(() => { load(); }, [load]);

  const statusColor = (s: string) => {
    const u = s.toUpperCase();
    if (u === 'NOMINAL') return '#39FF14';
    if (u === 'DRIFT') return '#FFBF00';
    if (u === 'ERROR') return '#FF4444';
    if (u === 'PROCESSING') return '#39FF14';
    return '#444';
  };

  const formatTs = (iso: string) => {
    const d = new Date(iso);
    return d.toISOString().replace('T', ' ').slice(0, 19) + ' UTC';
  };

  const getSource = (meta: Record<string, unknown>): string =>
    meta?.source ? String(meta.source).toUpperCase() : 'UNKNOWN';

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        className="fixed inset-0 z-40"
        style={{ background: 'rgba(0,0,0,0.7)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      {/* Drawer panel */}
      <motion.div
        className="fixed top-0 right-0 h-full z-50 flex flex-col overflow-hidden"
        style={{
          width: 'min(480px, 100vw)',
          background: '#030303',
          borderLeft: '1px solid #1a1a1a',
        }}
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'tween', duration: 0.25 }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3 shrink-0"
          style={{ borderBottom: '1px solid #111' }}
        >
          <div>
            <p className="text-[8px] tracking-[0.25em] uppercase" style={{ fontFamily: MONO, color: '#39FF14', opacity: 0.5 }}>
              HEARTBEAT_HISTORY // {agentId}
            </p>
            <h3 className="text-xs tracking-wide uppercase mt-0.5" style={{ fontFamily: MONO, color: '#FFF', fontWeight: 500 }}>
              {codename}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-[10px] tracking-widest px-2 py-1 uppercase"
            style={{ fontFamily: MONO, color: '#444', border: '1px solid #1a1a1a', background: 'transparent', cursor: 'pointer' }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#39FF14'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(57,255,20,0.3)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = '#444'; (e.currentTarget as HTMLButtonElement).style.borderColor = '#1a1a1a'; }}
          >
            [ CLOSE ]
          </button>
        </div>

        {/* Watermark */}
        <div className="px-4 py-1.5 shrink-0" style={{ borderBottom: '1px solid #0a0a0a' }}>
          <p className="text-[6px] tracking-[0.3em] uppercase" style={{ fontFamily: MONO, color: '#222' }}>
            AERELION // SYS.OPS.V2.06 // LAST 20 SIGNALS
          </p>
        </div>

        {/* Log table */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <motion.p
                className="text-[8px] tracking-widest uppercase"
                style={{ fontFamily: MONO, color: '#333' }}
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                LOADING_PROVENANCE_LOG...
              </motion.p>
            </div>
          ) : rows.length === 0 ? (
            <div className="flex items-center justify-center h-32">
              <p className="text-[8px] tracking-widest uppercase" style={{ fontFamily: MONO, color: '#333' }}>
                NO_SIGNALS_RECORDED
              </p>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: '#0d0d0d' }}>
              {rows.map((row, i) => {
                const src = getSource(row.metadata as Record<string, unknown>);
                const isCron = src === 'N8N_CRON';
                const srcColor = isCron ? '#39FF14' : '#FFBF00';
                return (
                  <div
                    key={row.id}
                    className="px-4 py-2.5"
                    style={{ background: i % 2 === 0 ? '#040404' : '#030303' }}
                  >
                    {/* Row index + timestamp */}
                    <div className="flex items-center gap-2 mb-1">
                      <code className="text-[6px]" style={{ fontFamily: MONO, color: '#333' }}>
                        {String(i + 1).padStart(2, '0')}
                      </code>
                      <code className="text-[7px]" style={{ fontFamily: MONO, color: '#444' }}>
                        {formatTs(row.created_at)}
                      </code>
                    </div>

                    {/* Status + Source */}
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="text-[7px] px-1.5 py-px uppercase tracking-wider"
                        style={{
                          fontFamily: MONO,
                          color: statusColor(row.status),
                          background: `${statusColor(row.status)}11`,
                          border: `1px solid ${statusColor(row.status)}33`,
                        }}
                      >
                        {row.status.toUpperCase()}
                      </span>
                      <span
                        className="text-[6px] px-1 py-px uppercase tracking-wider"
                        style={{
                          fontFamily: MONO,
                          color: srcColor,
                          background: `${srcColor}0a`,
                          border: `1px solid ${srcColor}22`,
                        }}
                      >
                        {src}
                      </span>
                    </div>

                    {/* Message */}
                    {row.message && (
                      <code className="block text-[7px] truncate" style={{ fontFamily: MONO, color: '#555' }}>
                        &gt; {row.message}
                      </code>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="px-4 py-2 shrink-0 flex items-center justify-between"
          style={{ borderTop: '1px solid #0d0d0d' }}
        >
          <p className="text-[6px] tracking-[0.3em] uppercase" style={{ fontFamily: MONO, color: '#1e1e1e' }}>
            IMMUTABLE_PROVENANCE // READ_ONLY
          </p>
          <button
            onClick={load}
            className="text-[7px] tracking-widest uppercase px-2 py-1"
            style={{ fontFamily: MONO, color: '#333', border: '1px solid #111', background: 'transparent', cursor: 'pointer' }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#39FF14'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = '#333'; }}
          >
            [ REFRESH ]
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Agent data ───────────────────────────────────────────────────────────────
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
  NOMINAL:    { border: '#1a1a1a', pulse: '#39FF14', text: '#39FF14' },
  PROCESSING: { border: '#39FF14', pulse: '#39FF14', text: '#39FF14' },
  DRIFT:      { border: '#FFBF00', pulse: '#FFBF00', text: '#FFBF00' },
  ERROR:      { border: '#FF4444', pulse: '#FF4444', text: '#FF4444' },
  OFFLINE:    { border: '#222',    pulse: '#333',    text: '#444'    },
};

function relativeTime(iso: string | null): string {
  if (!iso) return 'NEVER';
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 60_000) return `${Math.floor(diff / 1000)}s AGO`;
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m AGO`;
  return `${Math.floor(diff / 3_600_000)}h AGO`;
}

// ─── Main SystemGrid ──────────────────────────────────────────────────────────
export default function SystemGrid() {
  const { agentStatuses, forceStabilize, sendPulse } = useAgentStatus();
  const [openDrawer, setOpenDrawer] = useState<{ id: string; codename: string } | null>(null);

  return (
    <section>
      <h2
        className="text-[9px] tracking-[0.3em] mb-4 uppercase"
        style={{ fontFamily: MONO, color: '#39FF14', opacity: 0.6 }}
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
            >
              {/* Border overlay */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{ border: `1px solid ${colors.border}`, transition: 'border-color 0.3s' }}
              />

              {/* Scanline for PROCESSING */}
              {isProcessing && (
                <motion.div
                  className="absolute top-0 left-0 h-full pointer-events-none"
                  style={{ width: '1px', background: '#39FF14', opacity: 0.6 }}
                  animate={{ x: ['0px', '100%'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                />
              )}

              {/* Pulse dot */}
              <span className="absolute top-3 right-3 flex h-2 w-2">
                {!isOffline && (
                  <span
                    className="animate-ping absolute inline-flex h-full w-full opacity-40"
                    style={{ background: colors.pulse, borderRadius: '50%' }}
                  />
                )}
                <span
                  className="relative inline-flex h-2 w-2"
                  style={{ background: colors.pulse, borderRadius: '50%', boxShadow: isOffline ? 'none' : `0 0 10px ${colors.pulse}33` }}
                />
              </span>

              {/* Protocol ID */}
              <p
                className="text-[8px] tracking-[0.25em] mb-0.5 uppercase truncate pr-6"
                style={{ fontFamily: MONO, color: colors.text, opacity: 0.4 }}
              >
                {state?.message ? `${a.id}: ${state.message}` : a.id}
              </p>

              {/* Codename — click to open history */}
              <button
                className="text-left w-full mb-1"
                onClick={() => setOpenDrawer({ id: a.id, codename: a.codename })}
                style={{ background: 'transparent', border: 'none', padding: 0, cursor: 'pointer' }}
              >
                <h3
                  className="text-xs tracking-wide uppercase underline-offset-2"
                  style={{ fontFamily: MONO, color: '#FFFFFF', fontWeight: 500, textDecoration: 'none' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#39FF14'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#FFFFFF'; }}
                >
                  {a.codename}
                </h3>
              </button>

              {/* Function */}
              <p className="text-[10px] leading-relaxed mb-2" style={{ color: '#666', fontFamily: MONO }}>
                {a.fn}
              </p>

              {/* Metadata tags */}
              <div className="space-y-px mb-1">
                <code
                  className="block text-[8px] px-2 py-0.5"
                  style={{ fontFamily: MONO, color: '#39FF14', background: 'rgba(57,255,20,0.03)', border: '1px solid rgba(57,255,20,0.1)', borderRadius: 0 }}
                >
                  [REF-ID] {a.refId}
                </code>
                <code
                  className="block text-[8px] px-2 py-0.5"
                  style={{ fontFamily: MONO, color: '#FFBF00', background: 'rgba(255,191,0,0.03)', border: '1px solid rgba(255,191,0,0.1)', borderRadius: 0 }}
                >
                  [SYSTEM_IMPACT] {a.impact}
                </code>
              </div>

              {/* Live state */}
              <div className="mb-1 space-y-px">
                <code
                  className="block text-[7px] px-2 py-0.5 uppercase"
                  style={{ fontFamily: MONO, color: colors.text, opacity: 0.5 }}
                >
                  LAST_SIGNAL: {relativeTime(state?.lastSeen)}
                </code>
                {state?.message && (
                  <code
                    className="block text-[7px] px-2 py-0.5 truncate"
                    style={{ fontFamily: MONO, color: '#555' }}
                  >
                    &gt; {state.message}
                  </code>
                )}
              </div>

              {/* CRON_PROVENANCE */}
              <CronProvenanceBadge source={state?.source ?? null} />

              {/* VERACITY_TTL */}
              <VeracityTTL lastSeen={state?.lastSeen ?? null} />

              {/* Specialized widgets */}
              {a.id === 'AG-01' && <SentinelGauge state={state} />}
              {a.id === 'AG-05' && <AuditorLastCommit state={state} />}
              {a.id === 'AG-07' && <EnvoyReportButton />}

              {/* History hint */}
              <button
                onClick={() => setOpenDrawer({ id: a.id, codename: a.codename })}
                className="w-full text-[7px] tracking-[0.2em] py-1 uppercase mb-1"
                style={{
                  fontFamily: MONO,
                  color: '#2a2a2a',
                  background: 'transparent',
                  border: '1px solid #111',
                  borderRadius: 0,
                  cursor: 'pointer',
                  transition: 'color 0.2s, border-color 0.2s',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.color = '#39FF14';
                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(57,255,20,0.2)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.color = '#2a2a2a';
                  (e.currentTarget as HTMLButtonElement).style.borderColor = '#111';
                }}
              >
                [ VIEW_HEARTBEAT_HISTORY ]
              </button>

              {/* Actions */}
              <div className={`transition-opacity duration-200 space-y-[1px] ${isDrift ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                <button
                  onClick={() => sendPulse(a.id)}
                  className="w-full text-[8px] tracking-[0.2em] py-1.5 uppercase transition-all"
                  style={{ fontFamily: MONO, color: '#39FF14', background: 'transparent', border: '1px solid rgba(57,255,20,0.4)', borderRadius: 0, cursor: 'pointer', fontWeight: 500 }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 15px rgba(57,255,20,0.25), inset 0 0 15px rgba(57,255,20,0.08)'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(57,255,20,0.06)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none'; (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
                >
                  [ SEND_PULSE ]
                </button>
                <button
                  onClick={() => forceStabilize(a.id)}
                  className={`w-full text-[8px] tracking-[0.2em] py-1.5 uppercase transition-all ${isDrift ? 'animate-pulse' : ''}`}
                  style={{ fontFamily: MONO, color: colors.text, background: 'transparent', border: `1px solid ${colors.text}`, borderRadius: 0, cursor: 'pointer', fontWeight: 500 }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 0 15px ${colors.text}66, inset 0 0 15px ${colors.text}1a`; (e.currentTarget as HTMLButtonElement).style.background = `${colors.text}0f`; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none'; (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
                >
                  [FORCE_STABILIZATION]
                </button>
              </div>

              {/* Wireframe rest state */}
              {!isDrift && (
                <div className="transition-opacity duration-200 opacity-100 group-hover:opacity-0 absolute bottom-3 left-3 right-3">
                  <div className="w-full py-1.5" style={{ border: '1px solid #111', borderRadius: 0 }} />
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* HEARTBEAT_HISTORY drawer */}
      {openDrawer && (
        <HeartbeatHistoryDrawer
          agentId={openDrawer.id}
          codename={openDrawer.codename}
          onClose={() => setOpenDrawer(null)}
        />
      )}
    </section>
  );
}
