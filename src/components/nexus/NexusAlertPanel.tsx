import { useNexusAlerts } from '@/hooks/useNexusAlerts';
import type { AgentState } from '@/hooks/useAgentStatus';

const MONO = 'JetBrains Mono, monospace';

interface Props {
  agentStatuses: Record<string, AgentState>;
}

export default function NexusAlertPanel({ agentStatuses }: Props) {
  const {
    alerts,
    activeCount,
    escalatedCount,
    escalationEnabled,
    setEscalationEnabled,
    acknowledge,
    acknowledgeAll,
    clearResolved,
  } = useNexusAlerts(agentStatuses);

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <h2
            className="text-[9px] tracking-[0.3em] uppercase"
            style={{ fontFamily: MONO, color: activeCount > 0 ? '#FF4444' : '#39FF14', opacity: 0.6 }}
          >
            NEXUS_ALERTS // NOTIFICATION_ROUTING
          </h2>
          {activeCount > 0 && (
            <span
              className="text-[8px] px-2 py-0.5 animate-pulse"
              style={{
                fontFamily: MONO,
                color: '#FF4444',
                border: '1px solid rgba(255,68,68,0.4)',
                background: 'rgba(255,68,68,0.05)',
              }}
            >
              {activeCount} ACTIVE {escalatedCount > 0 && `/ ${escalatedCount} ESCALATED`}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setEscalationEnabled(!escalationEnabled)}
            className="text-[7px] tracking-wider uppercase px-2 py-0.5"
            style={{
              fontFamily: MONO,
              color: escalationEnabled ? '#FFBF00' : '#333',
              border: `1px solid ${escalationEnabled ? 'rgba(255,191,0,0.3)' : '#111'}`,
              cursor: 'pointer',
            }}
          >
            ESCALATION: {escalationEnabled ? 'ON' : 'OFF'}
          </button>
          {activeCount > 0 && (
            <button
              onClick={acknowledgeAll}
              className="text-[7px] tracking-wider uppercase px-2 py-0.5"
              style={{ fontFamily: MONO, color: '#444', border: '1px solid #1a1a1a', cursor: 'pointer' }}
            >
              ACK_ALL
            </button>
          )}
          {alerts.some((a) => a.acknowledged) && (
            <button
              onClick={clearResolved}
              className="text-[7px] tracking-wider uppercase px-2 py-0.5"
              style={{ fontFamily: MONO, color: '#333', border: '1px solid #111', cursor: 'pointer' }}
            >
              CLEAR
            </button>
          )}
        </div>
      </div>

      {alerts.length === 0 ? (
        <div className="px-4 py-4 text-center" style={{ border: '1px solid #111', background: '#030303' }}>
          <span className="text-[8px] uppercase tracking-wider" style={{ fontFamily: MONO, color: '#1a1a1a' }}>
            NO_ACTIVE_ALERTS — ALL_SYSTEMS_NOMINAL
          </span>
        </div>
      ) : (
        <div style={{ background: '#030303', border: '1px solid #1a1a1a' }}>
          <div className="max-h-[200px] overflow-auto">
            {alerts.map((alert) => {
              const isError = alert.status === 'ERROR';
              const color = isError ? '#FF4444' : '#FFBF00';
              const ts = alert.timestamp.replace('T', ' ').slice(0, 19);

              return (
                <div
                  key={alert.id}
                  className="flex items-center gap-3 px-3 py-1.5 transition-opacity"
                  style={{
                    borderBottom: '1px solid #0a0a0a',
                    opacity: alert.acknowledged ? 0.3 : 1,
                  }}
                >
                  {/* Severity indicator */}
                  <span
                    className={`flex-shrink-0 w-1.5 h-1.5 ${!alert.acknowledged ? 'animate-pulse' : ''}`}
                    style={{ background: alert.acknowledged ? '#222' : color, borderRadius: '50%' }}
                  />

                  {/* Timestamp */}
                  <span className="text-[7px] flex-shrink-0" style={{ fontFamily: MONO, color: '#333' }}>
                    {ts}
                  </span>

                  {/* Agent + status */}
                  <span className="text-[7px] flex-shrink-0" style={{ fontFamily: MONO, color }}>
                    [{alert.agent_id}]
                  </span>
                  <span className="text-[7px] flex-shrink-0 uppercase" style={{ fontFamily: MONO, color }}>
                    {alert.status}
                  </span>

                  {/* Escalation badge */}
                  {alert.escalated && !alert.acknowledged && (
                    <span
                      className="text-[6px] px-1 py-px uppercase animate-pulse"
                      style={{
                        fontFamily: MONO,
                        color: '#FF4444',
                        border: '1px solid rgba(255,68,68,0.4)',
                        background: 'rgba(255,68,68,0.1)',
                      }}
                    >
                      ESCALATED
                    </span>
                  )}

                  {/* Message */}
                  <span className="text-[7px] truncate flex-1" style={{ fontFamily: MONO, color: '#444' }}>
                    {alert.message}
                  </span>

                  {/* Acknowledge */}
                  {!alert.acknowledged && (
                    <button
                      onClick={() => acknowledge(alert.id)}
                      className="text-[6px] uppercase px-1.5 py-px flex-shrink-0"
                      style={{
                        fontFamily: MONO,
                        color: '#444',
                        border: '1px solid #222',
                        cursor: 'pointer',
                      }}
                    >
                      ACK
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
