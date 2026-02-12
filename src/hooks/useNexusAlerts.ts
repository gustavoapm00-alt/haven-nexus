import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { AgentState } from '@/hooks/useAgentStatus';

interface NexusAlert {
  id: string;
  agent_id: string;
  status: string;
  message: string;
  timestamp: string;
  escalated: boolean;
  acknowledged: boolean;
}

const ESCALATION_THRESHOLD_MS = 10 * 60 * 1000; // 10 minutes

export function useNexusAlerts(agentStatuses: Record<string, AgentState>) {
  const [alerts, setAlerts] = useState<NexusAlert[]>([]);
  const [escalationEnabled, setEscalationEnabled] = useState(true);

  // Monitor agent statuses for DRIFT/ERROR and create alerts
  useEffect(() => {
    const newAlerts: NexusAlert[] = [];

    Object.entries(agentStatuses).forEach(([agentId, state]) => {
      if (state.status === 'DRIFT' || state.status === 'ERROR') {
        // Check if we already have an unacknowledged alert for this agent
        const existing = alerts.find((a) => a.agent_id === agentId && !a.acknowledged);
        if (!existing) {
          newAlerts.push({
            id: `${agentId}-${Date.now()}`,
            agent_id: agentId,
            status: state.status,
            message: state.message || `${state.status} detected`,
            timestamp: new Date().toISOString(),
            escalated: false,
            acknowledged: false,
          });
        }
      }
    });

    if (newAlerts.length > 0) {
      setAlerts((prev) => [...newAlerts, ...prev].slice(0, 50));

      // Push to admin_notifications
      newAlerts.forEach(async (alert) => {
        await supabase.from('admin_notifications').insert({
          type: 'nexus_alert',
          title: `[${alert.agent_id}] ${alert.status} DETECTED`,
          body: alert.message,
          severity: alert.status === 'ERROR' ? 'critical' : 'warning',
          metadata: { agent_id: alert.agent_id, status: alert.status },
        }).then(() => {});
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(Object.entries(agentStatuses).map(([k, v]) => [k, v.status]))]);

  // Escalation timer — check every 30s for unresolved alerts
  useEffect(() => {
    if (!escalationEnabled) return;

    const interval = setInterval(() => {
      setAlerts((prev) =>
        prev.map((alert) => {
          if (alert.acknowledged || alert.escalated) return alert;
          const age = Date.now() - new Date(alert.timestamp).getTime();
          if (age > ESCALATION_THRESHOLD_MS) {
            // Escalate
            supabase.from('admin_notifications').insert({
              type: 'nexus_escalation',
              title: `⚠ ESCALATION: ${alert.agent_id} unresolved for 10+ min`,
              body: `${alert.agent_id} has been in ${alert.status} state for over 10 minutes. Immediate intervention recommended.`,
              severity: 'critical',
              metadata: { agent_id: alert.agent_id, original_alert: alert.id, escalation: true },
            }).then(() => {});
            return { ...alert, escalated: true };
          }
          return alert;
        })
      );
    }, 30_000);

    return () => clearInterval(interval);
  }, [escalationEnabled]);

  const acknowledge = useCallback((alertId: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, acknowledged: true } : a))
    );
  }, []);

  const acknowledgeAll = useCallback(() => {
    setAlerts((prev) => prev.map((a) => ({ ...a, acknowledged: true })));
  }, []);

  const clearResolved = useCallback(() => {
    setAlerts((prev) => prev.filter((a) => !a.acknowledged));
  }, []);

  const activeCount = alerts.filter((a) => !a.acknowledged).length;
  const escalatedCount = alerts.filter((a) => a.escalated && !a.acknowledged).length;

  return {
    alerts,
    activeCount,
    escalatedCount,
    escalationEnabled,
    setEscalationEnabled,
    acknowledge,
    acknowledgeAll,
    clearResolved,
  };
}
