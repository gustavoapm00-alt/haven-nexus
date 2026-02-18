import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type AgentStatusEnum = 'NOMINAL' | 'PROCESSING' | 'DRIFT' | 'ERROR' | 'OFFLINE';

export interface AgentState {
  status: AgentStatusEnum;
  message: string;
  lastSeen: string | null;
  metadata: Record<string, unknown>;
  /** Heartbeat provenance source — e.g. 'n8n_cron', 'nexus_hud', 'manual', etc. */
  source: string | null;
}

const AGENT_IDS = ['AG-01', 'AG-02', 'AG-03', 'AG-04', 'AG-05', 'AG-06', 'AG-07'] as const;
// Operational cadence: AG-01 Sentinel fires every 15min, other modules heartbeat
// at variable intervals. 4-hour window accommodates all operational cadences
// while still detecting genuine module failures.
const OFFLINE_THRESHOLD_MS = 4 * 60 * 60 * 1000; // 4 hours

const defaultState = (): AgentState => ({
  status: 'OFFLINE',
  message: '',
  lastSeen: null,
  metadata: {},
  source: null,
});

function deriveStatus(rawStatus: string): AgentStatusEnum {
  const s = rawStatus.toUpperCase();
  if (s === 'NOMINAL' || s === 'PROCESSING' || s === 'DRIFT' || s === 'ERROR') return s;
  return 'NOMINAL';
}

export function useAgentStatus() {
  const [agentStatuses, setAgentStatuses] = useState<Record<string, AgentState>>(() => {
    const init: Record<string, AgentState> = {};
    AGENT_IDS.forEach((id) => { init[id] = defaultState(); });
    return init;
  });

  const processingTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  // Pulse AG-06 to PROCESSING briefly
  const pulseAgent = useCallback((agentId: string) => {
    setAgentStatuses((prev) => ({
      ...prev,
      [agentId]: { ...prev[agentId], status: 'PROCESSING' },
    }));
    if (processingTimers.current[agentId]) clearTimeout(processingTimers.current[agentId]);
    processingTimers.current[agentId] = setTimeout(() => {
      setAgentStatuses((prev) => ({
        ...prev,
        [agentId]: { ...prev[agentId], status: prev[agentId].status === 'PROCESSING' ? 'NOMINAL' : prev[agentId].status },
      }));
    }, 2000);
  }, []);

  useEffect(() => {
    // Fetch latest heartbeat per agent
    const fetchLatest = async () => {
      const { data } = await supabase
        .from('agent_heartbeats')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (!data) return;

      const latest: Record<string, typeof data[0]> = {};
      data.forEach((row) => {
        if (!latest[row.agent_id]) latest[row.agent_id] = row;
      });

      setAgentStatuses((prev) => {
        const next = { ...prev };
        AGENT_IDS.forEach((id) => {
          const row = latest[id];
          if (row) {
            const age = Date.now() - new Date(row.created_at).getTime();
            const meta = (row.metadata as Record<string, unknown>) || {};
            next[id] = {
              status: age > OFFLINE_THRESHOLD_MS ? 'OFFLINE' : deriveStatus(row.status),
              message: row.message || '',
              lastSeen: row.created_at,
              metadata: meta,
              source: meta.source ? String(meta.source) : null,
            };
          }
        });
        return next;
      });
    };

    fetchLatest();

    // Realtime subscription on agent_heartbeats
    const heartbeatChannel = supabase
      .channel('agent-heartbeats-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'agent_heartbeats' },
        (payload) => {
          const row = payload.new as { agent_id: string; status: string; message: string; metadata: Record<string, unknown>; created_at: string };
          const meta = row.metadata || {};
          setAgentStatuses((prev) => ({
            ...prev,
            [row.agent_id]: {
              status: deriveStatus(row.status),
              message: row.message || '',
              lastSeen: row.created_at,
              metadata: meta,
              source: meta.source ? String(meta.source) : null,
            },
          }));
        }
      )
      .subscribe();

    // Secondary listener: edge_function_logs for AG-06/AG-07
    const logChannel = supabase
      .channel('agent-log-listener')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'edge_function_logs' },
        () => {
          pulseAgent('AG-06');
        }
      )
      .subscribe();

    // Offline check interval
    const offlineInterval = setInterval(() => {
      setAgentStatuses((prev) => {
        const next = { ...prev };
        let changed = false;
        AGENT_IDS.forEach((id) => {
          if (next[id].lastSeen) {
            const age = Date.now() - new Date(next[id].lastSeen!).getTime();
            if (age > OFFLINE_THRESHOLD_MS && next[id].status !== 'OFFLINE') {
              next[id] = { ...next[id], status: 'OFFLINE' };
              changed = true;
            }
          }
        });
        return changed ? next : prev;
      });
    }, 30_000);

    return () => {
      supabase.removeChannel(heartbeatChannel);
      supabase.removeChannel(logChannel);
      clearInterval(offlineInterval);
      Object.values(processingTimers.current).forEach(clearTimeout);
    };
  }, [pulseAgent]);

  // Force stabilization action
  const forceStabilize = useCallback(async (agentId: string) => {
    await supabase.from('agent_heartbeats').insert({
      agent_id: agentId,
      status: 'NOMINAL',
      message: 'MANUAL_STABILIZATION',
    });
  }, []);

  // Send real pulse signal via nexus-pulse edge function (admin-gated)
  const sendPulse = useCallback(async (agentId: string) => {
    pulseAgent(agentId);
    try {
      await supabase.functions.invoke('nexus-pulse', {
        body: {
          agent_id: agentId,
          status: 'NOMINAL',
          message: 'MANUAL_PULSE_SIGNAL',
          metadata: { source: 'nexus_hud', triggered_at: new Date().toISOString() },
        },
      });
    } catch {
      // Pulse UI already shown; edge function failure is non-blocking
    }
  }, [pulseAgent]);

  return { agentStatuses, forceStabilize, sendPulse };
}
