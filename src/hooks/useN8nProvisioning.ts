import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface N8nMapping {
  id: string;
  user_id: string;
  activation_request_id: string;
  automation_id?: string;
  bundle_id?: string;
  n8n_workflow_ids: string[];
  n8n_credential_ids: string[];
  status: 'pending' | 'provisioning' | 'active' | 'paused' | 'error' | 'deactivated';
  provisioned_at?: string;
  last_sync_at?: string;
  error_message?: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

interface UseN8nProvisioningState {
  isProvisioning: boolean;
  error: string | null;
}

export function useN8nProvisioning() {
  const { user } = useAuth();
  const [state, setState] = useState<UseN8nProvisioningState>({
    isProvisioning: false,
    error: null,
  });

  const provision = useCallback(async (activationRequestId: string) => {
    if (!user) {
      return { error: 'Not authenticated' };
    }

    setState({ isProvisioning: true, error: null });

    try {
      const response = await supabase.functions.invoke('n8n-provision', {
        body: {
          action: 'provision',
          activationRequestId,
        },
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to provision automation');
      }

      setState({ isProvisioning: false, error: null });
      return { error: null, data: response.data };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to provision';
      setState({ isProvisioning: false, error: errorMessage });
      return { error: errorMessage };
    }
  }, [user]);

  const pause = useCallback(async (activationRequestId: string) => {
    if (!user) {
      return { error: 'Not authenticated' };
    }

    setState({ isProvisioning: true, error: null });

    try {
      const response = await supabase.functions.invoke('n8n-provision', {
        body: {
          action: 'pause',
          activationRequestId,
        },
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to pause automation');
      }

      setState({ isProvisioning: false, error: null });
      return { error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to pause';
      setState({ isProvisioning: false, error: errorMessage });
      return { error: errorMessage };
    }
  }, [user]);

  const resume = useCallback(async (activationRequestId: string) => {
    if (!user) {
      return { error: 'Not authenticated' };
    }

    setState({ isProvisioning: true, error: null });

    try {
      const response = await supabase.functions.invoke('n8n-provision', {
        body: {
          action: 'resume',
          activationRequestId,
        },
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to resume automation');
      }

      setState({ isProvisioning: false, error: null });
      return { error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to resume';
      setState({ isProvisioning: false, error: errorMessage });
      return { error: errorMessage };
    }
  }, [user]);

  const revoke = useCallback(async (activationRequestId: string) => {
    if (!user) {
      return { error: 'Not authenticated' };
    }

    setState({ isProvisioning: true, error: null });

    try {
      const response = await supabase.functions.invoke('n8n-provision', {
        body: {
          action: 'revoke',
          activationRequestId,
        },
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to revoke automation');
      }

      setState({ isProvisioning: false, error: null });
      return { error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to revoke';
      setState({ isProvisioning: false, error: errorMessage });
      return { error: errorMessage };
    }
  }, [user]);

  const getMappings = useCallback(async (activationRequestId?: string) => {
    if (!user) return [];

    let query = supabase
      .from('n8n_mappings')
      .select('*')
      .eq('user_id', user.id);

    if (activationRequestId) {
      query = query.eq('activation_request_id', activationRequestId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch mappings:', error);
      return [];
    }

    return data as N8nMapping[];
  }, [user]);

  return {
    ...state,
    provision,
    pause,
    resume,
    revoke,
    getMappings,
  };
}
