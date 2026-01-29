import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface N8nMapping {
  id: string;
  user_id: string;
  activation_request_id: string;
  automation_id?: string;
  bundle_id?: string;
  status: 'pending' | 'provisioning' | 'active' | 'paused' | 'error' | 'deactivated';
  credentials_reference_id?: string;
  webhook_status?: 'pending' | 'success' | 'error';
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

interface ProvisioningResult {
  error: string | null;
  data?: {
    success: boolean;
    mappingId?: string;
    message?: string;
  };
}

export function useN8nProvisioning() {
  const { user } = useAuth();
  const [state, setState] = useState<UseN8nProvisioningState>({
    isProvisioning: false,
    error: null,
  });

  /**
   * Activate an automation by triggering its webhook
   */
  const activate = useCallback(async (
    activationRequestId: string, 
    config?: Record<string, unknown>
  ): Promise<ProvisioningResult> => {
    if (!user) {
      return { error: 'Not authenticated' };
    }

    setState({ isProvisioning: true, error: null });

    try {
      const { data, error } = await supabase.functions.invoke('n8n-provision', {
        body: {
          action: 'activate',
          activationRequestId,
          config,
        },
      });

      if (error) {
        throw new Error(error.message || 'Failed to activate automation');
      }

      setState({ isProvisioning: false, error: null });
      return { error: null, data };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to activate';
      setState({ isProvisioning: false, error: errorMessage });
      return { error: errorMessage };
    }
  }, [user]);

  /**
   * Pause an automation
   */
  const pause = useCallback(async (activationRequestId: string): Promise<ProvisioningResult> => {
    if (!user) {
      return { error: 'Not authenticated' };
    }

    setState({ isProvisioning: true, error: null });

    try {
      const { data, error } = await supabase.functions.invoke('n8n-provision', {
        body: {
          action: 'pause',
          activationRequestId,
        },
      });

      if (error) {
        throw new Error(error.message || 'Failed to pause automation');
      }

      setState({ isProvisioning: false, error: null });
      return { error: null, data };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to pause';
      setState({ isProvisioning: false, error: errorMessage });
      return { error: errorMessage };
    }
  }, [user]);

  /**
   * Resume a paused automation
   */
  const resume = useCallback(async (activationRequestId: string): Promise<ProvisioningResult> => {
    if (!user) {
      return { error: 'Not authenticated' };
    }

    setState({ isProvisioning: true, error: null });

    try {
      const { data, error } = await supabase.functions.invoke('n8n-provision', {
        body: {
          action: 'resume',
          activationRequestId,
        },
      });

      if (error) {
        throw new Error(error.message || 'Failed to resume automation');
      }

      setState({ isProvisioning: false, error: null });
      return { error: null, data };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to resume';
      setState({ isProvisioning: false, error: errorMessage });
      return { error: errorMessage };
    }
  }, [user]);

  /**
   * Revoke an automation and all its credentials
   */
  const revoke = useCallback(async (activationRequestId: string): Promise<ProvisioningResult> => {
    if (!user) {
      return { error: 'Not authenticated' };
    }

    setState({ isProvisioning: true, error: null });

    try {
      const { data, error } = await supabase.functions.invoke('n8n-provision', {
        body: {
          action: 'revoke',
          activationRequestId,
        },
      });

      if (error) {
        throw new Error(error.message || 'Failed to revoke automation');
      }

      setState({ isProvisioning: false, error: null });
      return { error: null, data };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to revoke';
      setState({ isProvisioning: false, error: errorMessage });
      return { error: errorMessage };
    }
  }, [user]);

  /**
   * Re-trigger the webhook for an automation
   */
  const retrigger = useCallback(async (
    activationRequestId: string,
    config?: Record<string, unknown>
  ): Promise<ProvisioningResult> => {
    if (!user) {
      return { error: 'Not authenticated' };
    }

    setState({ isProvisioning: true, error: null });

    try {
      const { data, error } = await supabase.functions.invoke('n8n-provision', {
        body: {
          action: 'retrigger',
          activationRequestId,
          config,
        },
      });

      if (error) {
        throw new Error(error.message || 'Failed to retrigger automation');
      }

      setState({ isProvisioning: false, error: null });
      return { error: null, data };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to retrigger';
      setState({ isProvisioning: false, error: errorMessage });
      return { error: errorMessage };
    }
  }, [user]);

  /**
   * Get all mappings for a user, optionally filtered by activation request
   */
  const getMappings = useCallback(async (activationRequestId?: string): Promise<N8nMapping[]> => {
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
    activate,
    pause,
    resume,
    revoke,
    retrigger,
    getMappings,
    // Legacy alias for backward compatibility
    provision: activate,
  };
}
