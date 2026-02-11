import { motion } from 'framer-motion';
import { type AgentState, type AgentStatusEnum } from '@/hooks/useAgentStatus';
import { type OperationalMode, MODE_CONFIG } from '@/hooks/useNexusMode';

type SystemState = 'OPERATIONAL' | 'WARNING' | 'CRITICAL';

interface GlobalHealthStatusProps {
  agentStatuses: Record<string, AgentState>;
  mode?: OperationalMode;
}

function deriveSystemState(statuses: Record<string, AgentState>): SystemState {
  const values = Object.values(statuses);
  if (values.some(a => a.status === 'ERROR' || a.status === 'OFFLINE')) return 'CRITICAL';
  if (values.some(a => a.status === 'DRIFT')) return 'WARNING';
  return 'OPERATIONAL';
}

const STATE_CONFIG: Record<SystemState, { border: string; bg: string; pulse: string; label: string }> = {
  OPERATIONAL: { border: '#39FF14', bg: 'rgba(57,255,20,0.04)', pulse: '#39FF14', label: 'OPERATIONAL' },
  WARNING: { border: '#FFBF00', bg: 'rgba(255,191,0,0.04)', pulse: '#FFBF00', label: 'WARNING // DRIFT_DETECTED' },
  CRITICAL: { border: '#FF4444', bg: 'rgba(255,68,68,0.06)', pulse: '#FF4444', label: 'CRITICAL // MODULE_FAILURE' },
};

export default function GlobalHealthStatus({ agentStatuses, mode = 'STEALTH' }: GlobalHealthStatusProps) {
  const systemState = deriveSystemState(agentStatuses);
  const sc = STATE_CONFIG[systemState];
  const mc = MODE_CONFIG[mode];
  const values = Object.values(agentStatuses);
  const nominalCount = values.filter(a => a.status === 'NOMINAL' || a.status === 'PROCESSING').length;
  const driftCount = values.filter(a => a.status === 'DRIFT').length;
  const criticalCount = values.filter(a => a.status === 'ERROR' || a.status === 'OFFLINE').length;

  return (
    <motion.section
      className="relative overflow-hidden"
      style={{
        background: sc.bg,
        borderBottom: `1px solid ${sc.border}`,
        fontFamily: 'JetBrains Mono, monospace',
      }}
      animate={{ borderColor: sc.border }}
      transition={{ duration: 0.6 }}
    >
      {/* Pulse glow line */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-[1px]"
        style={{ background: sc.pulse }}
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="px-6 py-5">
        <div className="flex items-end justify-between max-w-[1440px] mx-auto">
          {/* Left: System State */}
          <div>
            <p
              className="text-[8px] tracking-[0.4em] uppercase mb-1"
              style={{ color: sc.pulse, opacity: 0.5 }}
            >
              NEXUS_CORE // GLOBAL_HEALTH_INDEX // MODE:{mc.label}
            </p>
            <h1
              className="text-2xl md:text-3xl tracking-tight uppercase mb-1"
              style={{ color: '#FFFFFF', fontWeight: 900, letterSpacing: '-0.02em' }}
            >
              NEXUS STATE:{' '}
              <span style={{ color: sc.pulse }}>{sc.label}</span>
            </h1>
            <p
              className="text-[9px] tracking-[0.2em] uppercase"
              style={{ color: sc.pulse, opacity: 0.4 }}
            >
              AERELION // SYS.OPS.V3.00 // PROVENANCE_SYNC_ACTIVE
            </p>
          </div>

          {/* Right: Module sync count */}
          <div className="text-right">
            <div
              className="text-3xl md:text-4xl"
              style={{ color: sc.pulse, fontWeight: 900, lineHeight: 1 }}
            >
              {nominalCount}/7
            </div>
            <p
              className="text-[8px] tracking-[0.2em] uppercase mt-1"
              style={{ color: '#666' }}
            >
              MODULES SYNCHRONIZED
            </p>

            {/* Breakdown badges */}
            <div className="flex items-center gap-3 mt-2 justify-end">
              {driftCount > 0 && (
                <span
                  className="text-[7px] tracking-wider uppercase px-2 py-0.5"
                  style={{ color: '#FFBF00', border: '1px solid rgba(255,191,0,0.3)' }}
                >
                  {driftCount} DRIFT
                </span>
              )}
              {criticalCount > 0 && (
                <span
                  className="text-[7px] tracking-wider uppercase px-2 py-0.5"
                  style={{ color: '#FF4444', border: '1px solid rgba(255,68,68,0.3)' }}
                >
                  {criticalCount} OFFLINE
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Mini sparkline: 7 module status indicators */}
        <div className="flex items-center gap-1 mt-4 max-w-[1440px] mx-auto">
          {Object.entries(agentStatuses).map(([id, state]) => {
            const color =
              state.status === 'NOMINAL' || state.status === 'PROCESSING'
                ? '#39FF14'
                : state.status === 'DRIFT'
                ? '#FFBF00'
                : state.status === 'ERROR'
                ? '#FF4444'
                : '#333';
            return (
              <div key={id} className="flex-1 flex flex-col items-center gap-1">
                <motion.div
                  className="w-full h-[3px]"
                  style={{ background: color }}
                  animate={
                    state.status === 'DRIFT'
                      ? { opacity: [0.4, 1, 0.4] }
                      : state.status === 'ERROR'
                      ? { opacity: [0.3, 1, 0.3] }
                      : { opacity: 1 }
                  }
                  transition={
                    state.status === 'DRIFT' || state.status === 'ERROR'
                      ? { duration: 1.5, repeat: Infinity }
                      : {}
                  }
                />
                <span
                  className="text-[6px] tracking-[0.15em] uppercase"
                  style={{ color, opacity: 0.6 }}
                >
                  {id}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </motion.section>
  );
}
