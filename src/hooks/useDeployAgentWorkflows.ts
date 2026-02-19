import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface DeployResult {
  agent_id: string;
  name?: string;
  workflow_id?: string;
  activated?: boolean;
  latency_ms?: number;
  status: 'deployed_and_active' | 'deployed_inactive' | 'error' | 'already_active' | 'activated';
  message?: string;
}

export interface DeploySummary {
  total: number;
  deployed_active: number;
  errors: number;
}

export interface WorkflowStatus {
  id: string;
  name: string;
  active: boolean;
  tags?: { name: string }[];
  updatedAt?: string;
}

export interface ProbeResult {
  status: number;
  ok: boolean;
  n8n_base_url: string;
  key_length: number;
  key_prefix: string;
  response_preview: string;
}

/** An active n8n workflow with no corresponding Nexus HUD heartbeat signal */
export interface OrphanWorkflow {
  id: string;
  name: string;
  /** Parsed agent ID if the name follows AERELION_AG-XX_ convention */
  parsed_agent_id: string | null;
  risk: 'CRITICAL' | 'WARN';
}

export interface StabilizationReport {
  scanned_at: string;
  total_workflows: number;
  active_count: number;
  inactive_count: number;
  orphan_count: number;
  orphans: OrphanWorkflow[];
  high_latency_agents: string[];
  integrity_status: 'NOMINAL' | 'WARN' | 'CRITICAL';
}

const AERELION_AGENT_IDS = ['AG-01', 'AG-02', 'AG-03', 'AG-04', 'AG-05', 'AG-06', 'AG-07'];
const LATENCY_THRESHOLD_MS = 500;

interface UseDeployState {
  isLoading: boolean;
  error: string | null;
  summary: DeploySummary | null;
  results: DeployResult[];
  existingWorkflows: WorkflowStatus[];
  probeResult: ProbeResult | null;
  stabilizationReport: StabilizationReport | null;
  phase: 'idle' | 'deploying' | 'activating' | 'checking' | 'probing' | 'scanning' | 'done';
}

export function useDeployAgentWorkflows() {
  const [state, setState] = useState<UseDeployState>({
    isLoading: false,
    error: null,
    summary: null,
    results: [],
    existingWorkflows: [],
    probeResult: null,
    stabilizationReport: null,
    phase: 'idle',
  });

  const getSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token;
  };

  /**
   * Probe n8n connectivity — validates API key without deploying
   */
  const probeConnection = useCallback(async () => {
    const token = await getSession();
    if (!token) {
      setState(s => ({ ...s, error: 'CREDENTIAL_HANDSHAKE_REJECTED: No active session' }));
      return;
    }

    setState(s => ({ ...s, isLoading: true, error: null, phase: 'probing', probeResult: null }));

    try {
      const { data, error } = await supabase.functions.invoke('deploy-agent-workflows', {
        body: { action: 'probe' },
      });

      if (error) throw new Error(error.message || 'Probe failed');

      setState(s => ({
        ...s,
        isLoading: false,
        phase: 'done',
        probeResult: data,
        error: data.ok ? null : `N8N_HANDSHAKE_REJECTED: HTTP ${data.status}. Response: ${data.response_preview}`,
      }));
    } catch (err) {
      setState(s => ({
        ...s,
        isLoading: false,
        phase: 'idle',
        error: err instanceof Error ? err.message : 'Probe failed',
      }));
    }
  }, []);

  /**
   * Deploy all 7 heartbeat workflows to n8n via Zero-Touch API
   */
  const deployAll = useCallback(async () => {
    const token = await getSession();
    if (!token) {
      setState(s => ({ ...s, error: 'CREDENTIAL_HANDSHAKE_REJECTED: No active session' }));
      return;
    }

    setState(s => ({ ...s, isLoading: true, error: null, phase: 'deploying', results: [] }));

    try {
      const { data, error } = await supabase.functions.invoke('deploy-agent-workflows', {
        body: { action: 'deploy' },
      });

      if (error) throw new Error(error.message || 'Deployment failed');

      const results: DeployResult[] = data.results || [];
      const highLatencyAgents = results
        .filter(r => r.latency_ms != null && r.latency_ms > LATENCY_THRESHOLD_MS)
        .map(r => r.agent_id);

      setState(s => ({
        ...s,
        isLoading: false,
        phase: 'done',
        summary: data.summary,
        results,
        stabilizationReport: s.stabilizationReport
          ? { ...s.stabilizationReport, high_latency_agents: highLatencyAgents }
          : null,
      }));
    } catch (err) {
      setState(s => ({
        ...s,
        isLoading: false,
        phase: 'idle',
        error: err instanceof Error ? err.message : 'Deployment failed',
      }));
    }
  }, []);

  /**
   * Check the status of existing AERELION workflows in n8n
   */
  const checkStatus = useCallback(async () => {
    const token = await getSession();
    if (!token) {
      setState(s => ({ ...s, error: 'CREDENTIAL_HANDSHAKE_REJECTED: No active session' }));
      return;
    }

    setState(s => ({ ...s, isLoading: true, error: null, phase: 'checking' }));

    try {
      const { data, error } = await supabase.functions.invoke('deploy-agent-workflows', {
        body: { action: 'status' },
      });

      if (error) throw new Error(error.message || 'Status check failed');

      setState(s => ({
        ...s,
        isLoading: false,
        phase: 'done',
        existingWorkflows: data.workflows || [],
      }));
    } catch (err) {
      setState(s => ({
        ...s,
        isLoading: false,
        phase: 'idle',
        error: err instanceof Error ? err.message : 'Status check failed',
      }));
    }
  }, []);

  /**
   * Activate all existing AERELION workflows (without re-deploying)
   */
  const activateAll = useCallback(async () => {
    const token = await getSession();
    if (!token) {
      setState(s => ({ ...s, error: 'CREDENTIAL_HANDSHAKE_REJECTED: No active session' }));
      return;
    }

    setState(s => ({ ...s, isLoading: true, error: null, phase: 'activating' }));

    try {
      const { data, error } = await supabase.functions.invoke('deploy-agent-workflows', {
        body: { action: 'activate_all' },
      });

      if (error) throw new Error(error.message || 'Activation failed');

      setState(s => ({
        ...s,
        isLoading: false,
        phase: 'done',
        results: data.activated || [],
      }));
    } catch (err) {
      setState(s => ({
        ...s,
        isLoading: false,
        phase: 'idle',
        error: err instanceof Error ? err.message : 'Activation failed',
      }));
    }
  }, []);

  /**
   * ORPHAN_SCAN — Cross-reference active n8n workflows vs expected Nexus HUD agent IDs.
   * Flags any AERELION_ workflow that has no corresponding heartbeat signal as an orphan.
   * Also queries edge_function_logs to surface high-latency pipelines (>500ms).
   */
  const runStabilizationScan = useCallback(async () => {
    const token = await getSession();
    if (!token) {
      setState(s => ({ ...s, error: 'CREDENTIAL_HANDSHAKE_REJECTED: No active session' }));
      return;
    }

    setState(s => ({ ...s, isLoading: true, error: null, phase: 'scanning', stabilizationReport: null }));

    try {
      // Fetch n8n workflow inventory
      const { data: statusData, error: statusErr } = await supabase.functions.invoke('deploy-agent-workflows', {
        body: { action: 'status' },
      });
      if (statusErr) throw new Error(statusErr.message || 'Status fetch failed');

      const workflows: WorkflowStatus[] = statusData.workflows || [];

      // Fetch recent heartbeats to determine which agents are actively reporting
      const { data: heartbeats } = await supabase
        .from('agent_heartbeats')
        .select('agent_id, created_at')
        .order('created_at', { ascending: false })
        .limit(70);

      // Build set of agents that have a heartbeat within the last 4 hours
      const activeReportingAgents = new Set<string>();
      const FOUR_HOURS_MS = 4 * 60 * 60 * 1000;
      (heartbeats || []).forEach((hb) => {
        const age = Date.now() - new Date(hb.created_at).getTime();
        if (age < FOUR_HOURS_MS) activeReportingAgents.add(hb.agent_id);
      });

      // Detect orphans — active n8n workflows not reporting to Nexus HUD
      const orphans: OrphanWorkflow[] = workflows
        .filter(wf => wf.active)
        .map(wf => {
          // Try to parse AG-XX from name AERELION_AG-01_SENTINEL_HEARTBEAT_2H
          const match = wf.name.match(/AG-(\d{2})/);
          const parsedId = match ? `AG-${match[1]}` : null;
          return { wf, parsedId };
        })
        .filter(({ parsedId }) => {
          if (!parsedId) return true; // Unknown agent — flag as orphan
          return !activeReportingAgents.has(parsedId); // Active n8n but no Nexus heartbeat
        })
        .map(({ wf, parsedId }) => ({
          id: wf.id,
          name: wf.name,
          parsed_agent_id: parsedId,
          risk: (parsedId && AERELION_AGENT_IDS.includes(parsedId)
            ? 'CRITICAL'
            : 'WARN') as 'CRITICAL' | 'WARN',
        }));

      // Fetch latency data from edge_function_logs
      const { data: latencyLogs } = await supabase
        .from('edge_function_logs')
        .select('details, duration_ms')
        .eq('function_name', 'deploy-agent-workflows')
        .not('duration_ms', 'is', null)
        .order('created_at', { ascending: false })
        .limit(50);

      const highLatencyAgents: string[] = [];
      (latencyLogs || []).forEach((log) => {
        const d = log.details as Record<string, unknown> | null;
        const agentId = d?.agent_id as string | undefined;
        if (agentId && (log.duration_ms ?? 0) > LATENCY_THRESHOLD_MS && !highLatencyAgents.includes(agentId)) {
          highLatencyAgents.push(agentId);
        }
      });

      const activeCount = workflows.filter(w => w.active).length;
      const inactiveCount = workflows.length - activeCount;

      let integrityStatus: StabilizationReport['integrity_status'] = 'NOMINAL';
      if (orphans.some(o => o.risk === 'CRITICAL') || highLatencyAgents.length > 2) {
        integrityStatus = 'CRITICAL';
      } else if (orphans.length > 0 || highLatencyAgents.length > 0) {
        integrityStatus = 'WARN';
      }

      const report: StabilizationReport = {
        scanned_at: new Date().toISOString(),
        total_workflows: workflows.length,
        active_count: activeCount,
        inactive_count: inactiveCount,
        orphan_count: orphans.length,
        orphans,
        high_latency_agents: highLatencyAgents,
        integrity_status: integrityStatus,
      };

      setState(s => ({
        ...s,
        isLoading: false,
        phase: 'done',
        existingWorkflows: workflows,
        stabilizationReport: report,
      }));
    } catch (err) {
      setState(s => ({
        ...s,
        isLoading: false,
        phase: 'idle',
        error: err instanceof Error ? err.message : 'Stabilization scan failed',
      }));
    }
  }, []);

  const reset = useCallback(() => {
    setState({
      isLoading: false,
      error: null,
      summary: null,
      results: [],
      existingWorkflows: [],
      probeResult: null,
      stabilizationReport: null,
      phase: 'idle',
    });
  }, []);

  return { ...state, probeConnection, deployAll, checkStatus, activateAll, runStabilizationScan, reset };
}

