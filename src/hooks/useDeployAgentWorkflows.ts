import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface DeployResult {
  agent_id: string;
  name?: string;
  workflow_id?: string;
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

interface UseDeployState {
  isLoading: boolean;
  error: string | null;
  summary: DeploySummary | null;
  results: DeployResult[];
  existingWorkflows: WorkflowStatus[];
  phase: 'idle' | 'deploying' | 'activating' | 'checking' | 'done';
}

export function useDeployAgentWorkflows() {
  const [state, setState] = useState<UseDeployState>({
    isLoading: false,
    error: null,
    summary: null,
    results: [],
    existingWorkflows: [],
    phase: 'idle',
  });

  const getSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token;
  };

  /**
   * Deploy all 7 heartbeat workflows to n8n via Zero-Touch API
   */
  const deployAll = useCallback(async () => {
    const token = await getSession();
    if (!token) {
      setState(s => ({ ...s, error: 'Not authenticated' }));
      return;
    }

    setState(s => ({ ...s, isLoading: true, error: null, phase: 'deploying', results: [] }));

    try {
      const { data, error } = await supabase.functions.invoke('deploy-agent-workflows', {
        body: { action: 'deploy' },
      });

      if (error) throw new Error(error.message || 'Deployment failed');

      setState(s => ({
        ...s,
        isLoading: false,
        phase: 'done',
        summary: data.summary,
        results: data.results,
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
      setState(s => ({ ...s, error: 'Not authenticated' }));
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
      setState(s => ({ ...s, error: 'Not authenticated' }));
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

  const reset = useCallback(() => {
    setState({
      isLoading: false,
      error: null,
      summary: null,
      results: [],
      existingWorkflows: [],
      phase: 'idle',
    });
  }, []);

  return { ...state, deployAll, checkStatus, activateAll, reset };
}
