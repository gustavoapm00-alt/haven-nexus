import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAgentStatus, type AgentStatusEnum } from '@/hooks/useAgentStatus';

const MONO = 'JetBrains Mono, monospace';

const AGENTS = [
  { id: 'AG-01', codename: 'SENTINEL' },
  { id: 'AG-02', codename: 'LIBRARIAN' },
  { id: 'AG-03', codename: 'WATCHMAN' },
  { id: 'AG-04', codename: 'GATEKEEPER' },
  { id: 'AG-05', codename: 'AUDITOR' },
  { id: 'AG-06', codename: 'CHRONICLER' },
  { id: 'AG-07', codename: 'ENVOY' },
];

const STATUS_COLORS: Record<AgentStatusEnum, string> = {
  NOMINAL: '#39FF14',
  PROCESSING: '#39FF14',
  DRIFT: '#FFBF00',
  ERROR: '#FF4444',
  OFFLINE: '#333',
};

interface HealLog {
  agent_id: string;
  action: string;
  previous_status: string;
  timestamp: string;
  success: boolean;
}

export default function AutoHealPanel() {
  const { agentStatuses } = useAgentStatus();
  const [healLogs, setHealLogs] = useState<HealLog[]>([]);
  const [healing, setHealing] = useState<string | null>(null);
  const [autoHealEnabled, setAutoHealEnabled] = useState(false);

  const triggerHeal = async (agentId: string, action: 'stabilize' | 'restart' = 'stabilize') => {
    setHealing(agentId);
    try {
      const { data, error } = await supabase.functions.invoke('agent-auto-heal', {
        body: { agent_id: agentId, action },
      });

      setHealLogs((prev) => [
        {
          agent_id: agentId,
          action,
          previous_status: data?.previous_status || 'UNKNOWN',
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
          success: !error && data?.success,
        },
        ...prev.slice(0, 19),
      ]);
    } catch {
      setHealLogs((prev) => [
        {
          agent_id: agentId,
          action,
          previous_status: 'UNKNOWN',
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
          success: false,
        },
        ...prev.slice(0, 19),
      ]);
    }
    setHealing(null);
  };

  // Auto-heal: trigger stabilization for any agent in DRIFT or ERROR
  const runAutoHealSweep = async () => {
    for (const agent of AGENTS) {
      const status = agentStatuses[agent.id]?.status;
      if (status === 'DRIFT' || status === 'ERROR') {
        await triggerHeal(agent.id, status === 'ERROR' ? 'restart' : 'stabilize');
      }
    }
  };

  const degradedCount = AGENTS.filter((a) => {
    const s = agentStatuses[a.id]?.status;
    return s === 'DRIFT' || s === 'ERROR' || s === 'OFFLINE';
  }).length;

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2
          className="text-[9px] tracking-[0.3em] uppercase"
          style={{ fontFamily: MONO, color: '#39FF14', opacity: 0.6 }}
        >
          AUTO-HEALING_PIPELINE // REMEDIATION_ENGINE
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAutoHealEnabled(!autoHealEnabled)}
            className="text-[7px] tracking-wider uppercase px-2 py-0.5"
            style={{
              fontFamily: MONO,
              color: autoHealEnabled ? '#39FF14' : '#444',
              border: `1px solid ${autoHealEnabled ? 'rgba(57,255,20,0.4)' : '#1a1a1a'}`,
              background: autoHealEnabled ? 'rgba(57,255,20,0.05)' : 'transparent',
              cursor: 'pointer',
            }}
          >
            AUTO: {autoHealEnabled ? 'ON' : 'OFF'}
          </button>
          <button
            onClick={runAutoHealSweep}
            disabled={degradedCount === 0 || healing !== null}
            className="text-[7px] tracking-wider uppercase px-2 py-0.5"
            style={{
              fontFamily: MONO,
              color: degradedCount > 0 ? '#FFBF00' : '#222',
              border: `1px solid ${degradedCount > 0 ? 'rgba(255,191,0,0.3)' : '#111'}`,
              cursor: degradedCount > 0 ? 'pointer' : 'not-allowed',
            }}
          >
            HEAL_ALL ({degradedCount})
          </button>
        </div>
      </div>

      {/* Agent status strip with heal buttons */}
      <div className="grid grid-cols-7 gap-[1px] mb-3">
        {AGENTS.map((a) => {
          const status = agentStatuses[a.id]?.status || 'OFFLINE';
          const color = STATUS_COLORS[status];
          const isDegraded = status === 'DRIFT' || status === 'ERROR' || status === 'OFFLINE';
          const isHealing = healing === a.id;

          return (
            <div
              key={a.id}
              className="px-2 py-2 text-center"
              style={{ background: '#030303', border: `1px solid ${isDegraded ? color : '#111'}` }}
            >
              <span className="block text-[7px] uppercase" style={{ fontFamily: MONO, color }}>
                {a.id}
              </span>
              <span className="block text-[6px] uppercase mt-0.5" style={{ fontFamily: MONO, color: '#444' }}>
                {status}
              </span>
              {isDegraded && (
                <button
                  onClick={() => triggerHeal(a.id, status === 'ERROR' ? 'restart' : 'stabilize')}
                  disabled={isHealing}
                  className="mt-1 w-full text-[6px] uppercase tracking-wider py-0.5"
                  style={{
                    fontFamily: MONO,
                    color: isHealing ? '#222' : color,
                    border: `1px solid ${isHealing ? '#111' : color}`,
                    background: 'transparent',
                    cursor: isHealing ? 'not-allowed' : 'pointer',
                  }}
                >
                  {isHealing ? '...' : 'HEAL'}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Heal log */}
      {healLogs.length > 0 && (
        <div style={{ background: '#030303', border: '1px solid #1a1a1a' }}>
          <div className="px-3 py-1" style={{ borderBottom: '1px solid #111' }}>
            <span className="text-[7px] uppercase tracking-wider" style={{ fontFamily: MONO, color: '#333' }}>
              REMEDIATION_LOG
            </span>
          </div>
          <div className="max-h-[120px] overflow-auto px-3 py-1 space-y-0.5">
            {healLogs.map((log, i) => (
              <div key={i} className="flex items-center gap-2 text-[7px]" style={{ fontFamily: MONO }}>
                <span style={{ color: '#333' }}>{log.timestamp}</span>
                <span style={{ color: log.success ? '#39FF14' : '#FF4444' }}>
                  {log.success ? '✓' : '✗'}
                </span>
                <span style={{ color: '#666' }}>
                  [{log.agent_id}] {log.action.toUpperCase()} ({log.previous_status} → NOMINAL)
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
