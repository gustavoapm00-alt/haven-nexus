/**
 * AGENT HEALTH PANEL — Customer-Facing Dashboard
 * AERELION // SYS.OPS.V2.06 // STAGE_3_ARCHITECT
 *
 * Exposes live Elite 7 agent status to portal clients.
 * Consumes useAgentStatus (Realtime subscription) and renders
 * a compact, client-safe version of the Nexus health grid.
 */

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useAgentStatus, type AgentStatusEnum } from '@/hooks/useAgentStatus';
import { useAgentRegistry } from '@/hooks/useAgentRegistry';

const MONO = 'JetBrains Mono, monospace';

const STATUS_MAP: Record<AgentStatusEnum, { color: string; label: string; bg: string; border: string }> = {
  NOMINAL:    { color: '#39FF14', label: 'NOMINAL',    bg: 'rgba(57,255,20,0.04)',  border: 'rgba(57,255,20,0.15)'  },
  PROCESSING: { color: '#39FF14', label: 'PROCESSING', bg: 'rgba(57,255,20,0.08)',  border: 'rgba(57,255,20,0.3)'   },
  DRIFT:      { color: '#FFBF00', label: 'DRIFT',      bg: 'rgba(255,191,0,0.05)',  border: 'rgba(255,191,0,0.3)'   },
  ERROR:      { color: '#FF4444', label: 'ERROR',      bg: 'rgba(255,68,68,0.06)',  border: 'rgba(255,68,68,0.3)'   },
  OFFLINE:    { color: '#333',    label: 'OFFLINE',    bg: 'rgba(255,255,255,0.01)', border: '#1a1a1a'              },
};

function relativeTime(iso: string | null): string {
  if (!iso) return 'NO_SIGNAL';
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 60_000) return `${Math.floor(diff / 1000)}s AGO`;
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m AGO`;
  return `${Math.floor(diff / 3_600_000)}h AGO`;
}

function SystemHealthBar({ statuses }: { statuses: Record<string, { status: AgentStatusEnum }> }) {
  const values = Object.values(statuses);
  const nominal = values.filter(v => v.status === 'NOMINAL' || v.status === 'PROCESSING').length;
  const drift = values.filter(v => v.status === 'DRIFT').length;
  const critical = values.filter(v => v.status === 'ERROR' || v.status === 'OFFLINE').length;
  const total = values.length || 7;

  const systemColor = critical > 0 ? '#FF4444' : drift > 0 ? '#FFBF00' : '#39FF14';
  const systemLabel = critical > 0 ? 'DEGRADED' : drift > 0 ? 'PARTIAL_DRIFT' : 'FULLY_OPERATIONAL';

  return (
    <div
      className="p-3 mb-4"
      style={{ background: 'rgba(57,255,20,0.02)', border: `1px solid ${systemColor}33` }}
    >
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="text-[6px] tracking-[0.3em] uppercase mb-0.5" style={{ fontFamily: MONO, color: '#444' }}>
            ELITE_7 // SYSTEM_HEALTH_INDEX
          </p>
          <div className="flex items-center gap-1.5">
            <motion.div
              className="w-1.5 h-1.5"
              style={{ background: systemColor, borderRadius: '50%' }}
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <code className="text-[9px] uppercase tracking-wider" style={{ fontFamily: MONO, color: systemColor }}>
              {systemLabel}
            </code>
          </div>
        </div>
        <div className="text-right">
          <code className="text-xl" style={{ fontFamily: MONO, color: systemColor, fontWeight: 900 }}>
            {nominal}/{total}
          </code>
          <p className="text-[6px] tracking-wider uppercase" style={{ fontFamily: MONO, color: '#333' }}>
            MODULES ONLINE
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-[2px] w-full" style={{ background: '#0d0d0d' }}>
        <motion.div
          className="h-full"
          style={{ background: systemColor }}
          animate={{ width: `${(nominal / total) * 100}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>

      {/* Mini module strip */}
      <div className="flex gap-[1px] mt-1.5">
        {Object.entries(statuses).map(([id, state]) => {
          const sc = STATUS_MAP[state.status as AgentStatusEnum] || STATUS_MAP.OFFLINE;
          return (
            <div
              key={id}
              className="flex-1 h-[4px]"
              style={{ background: sc.color, opacity: state.status === 'OFFLINE' ? 0.15 : 0.7 }}
              title={`${id}: ${state.status}`}
            />
          );
        })}
      </div>
    </div>
  );
}

function AgentCard({ agent, status, lastSeen, message }: {
  agent: { id: string; codename: string; fn_description: string; system_impact: string };
  status: AgentStatusEnum;
  lastSeen: string | null;
  message: string;
}) {
  const sc = STATUS_MAP[status] || STATUS_MAP.OFFLINE;
  const isProcessing = status === 'PROCESSING';
  const isDrift = status === 'DRIFT';

  return (
    <motion.div
      className="relative overflow-hidden p-3"
      style={{
        background: '#040404',
        border: `1px solid ${sc.border}`,
        transition: 'border-color 0.3s',
      }}
      animate={{ borderColor: sc.border }}
    >
      {/* Processing scanline */}
      {isProcessing && (
        <motion.div
          className="absolute top-0 left-0 h-full pointer-events-none"
          style={{ width: '1px', background: '#39FF14', opacity: 0.5 }}
          animate={{ x: ['0px', '100%'] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        />
      )}

      {/* DRIFT amber flash border */}
      {isDrift && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{ border: '1px solid #FFBF00', opacity: 0 }}
          animate={{ opacity: [0, 0.6, 0] }}
          transition={{ duration: 0.5, repeat: Infinity }}
        />
      )}

      {/* Header row */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <code className="text-[6px] uppercase tracking-[0.2em] block" style={{ fontFamily: MONO, color: '#2a2a2a' }}>
            {agent.id}
          </code>
          <p className="text-[9px] uppercase tracking-wide truncate mt-0.5" style={{ fontFamily: MONO, color: '#ddd', fontWeight: 600 }}>
            {agent.codename}
          </p>
        </div>
        <div className="flex items-center gap-1 shrink-0 ml-2">
          <span className="relative flex h-1.5 w-1.5">
            {status !== 'OFFLINE' && (
              <span
                className="animate-ping absolute inline-flex h-full w-full opacity-40"
                style={{ background: sc.color, borderRadius: '50%' }}
              />
            )}
            <span className="relative inline-flex h-1.5 w-1.5" style={{ background: sc.color, borderRadius: '50%' }} />
          </span>
          <code
            className="text-[7px] uppercase tracking-wide px-1 py-px"
            style={{ fontFamily: MONO, color: sc.color, background: sc.bg, border: `1px solid ${sc.border}` }}
          >
            {sc.label}
          </code>
        </div>
      </div>

      {/* Function description */}
      <p className="text-[7px] leading-relaxed mb-2 line-clamp-2" style={{ fontFamily: MONO, color: '#3a3a3a' }}>
        {agent.fn_description}
      </p>

      {/* System impact tag */}
      <div className="mb-2">
        <span
          className="text-[5px] uppercase tracking-[0.2em] px-1.5 py-0.5"
          style={{ fontFamily: MONO, color: '#2a4a2a', background: 'rgba(57,255,20,0.03)', border: '1px solid rgba(57,255,20,0.08)' }}
        >
          {agent.system_impact}
        </span>
      </div>

      {/* Last signal */}
      <div className="flex items-center justify-between">
        <code className="text-[6px] uppercase tracking-wider" style={{ fontFamily: MONO, color: '#222' }}>
          LAST_SIGNAL: {relativeTime(lastSeen)}
        </code>
        {message && (
          <code className="text-[6px] truncate ml-2 max-w-[120px]" style={{ fontFamily: MONO, color: '#333' }} title={message}>
            &gt; {message}
          </code>
        )}
      </div>
    </motion.div>
  );
}

// Live "time since last system heartbeat" clock
function LastSystemHeartbeat({ agentStatuses }: { agentStatuses: Record<string, { lastSeen: string | null }> }) {
  const [display, setDisplay] = useState('--:--:--');

  useEffect(() => {
    const latestSignal = Object.values(agentStatuses)
      .map(v => v.lastSeen ? new Date(v.lastSeen).getTime() : 0)
      .reduce((max, t) => Math.max(max, t), 0);

    if (!latestSignal) { setDisplay('NO_SIGNAL'); return; }

    const tick = () => {
      const age = Date.now() - latestSignal;
      const s = Math.floor(age / 1000) % 60;
      const m = Math.floor(age / 60_000) % 60;
      const h = Math.floor(age / 3_600_000);
      setDisplay(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [agentStatuses]);

  return (
    <code className="text-[8px] tabular-nums" style={{ fontFamily: MONO, color: '#39FF14' }}>
      {display}
    </code>
  );
}

export default function AgentHealthPanel() {
  const { agentStatuses } = useAgentStatus();
  const { agents, loading } = useAgentRegistry();

  return (
    <div className="space-y-3">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[6px] tracking-[0.3em] uppercase mb-0.5" style={{ fontFamily: MONO, color: '#39FF14', opacity: 0.4 }}>
            REALTIME // SUPABASE_SUBSCRIBED
          </p>
          <h3 className="text-[10px] tracking-widest uppercase" style={{ fontFamily: MONO, color: '#aaa' }}>
            ELITE_7 // AGENT_TELEMETRY
          </h3>
        </div>
        <div className="text-right">
          <p className="text-[5px] tracking-[0.2em] uppercase mb-0.5" style={{ fontFamily: MONO, color: '#333' }}>LAST_SYSTEM_HEARTBEAT</p>
          <LastSystemHeartbeat agentStatuses={agentStatuses} />
        </div>
      </div>

      {/* Global health bar */}
      <SystemHealthBar statuses={agentStatuses} />

      {/* Agent grid */}
      {loading ? (
        <div className="flex items-center justify-center h-24">
          <motion.p
            className="text-[8px] tracking-widest uppercase"
            style={{ fontFamily: MONO, color: '#333' }}
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            SYNCING_AGENT_REGISTRY...
          </motion.p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-[1px]">
          {agents.map(agent => {
            const state = agentStatuses[agent.id];
            return (
              <AgentCard
                key={agent.id}
                agent={agent}
                status={(state?.status ?? 'OFFLINE') as AgentStatusEnum}
                lastSeen={state?.lastSeen ?? null}
                message={state?.message ?? ''}
              />
            );
          })}
        </div>
      )}

      {/* Watermark */}
      <p className="text-[5px] tracking-[0.3em] uppercase text-center" style={{ fontFamily: MONO, color: '#111' }}>
        AERELION // SYS.OPS.V2.06 // PROVENANCE_VERIFIED
      </p>
    </div>
  );
}
