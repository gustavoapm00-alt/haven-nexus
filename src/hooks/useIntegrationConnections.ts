import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

/**
 * CONNECT ONCE. RUN MANY.
 * 
 * This hook manages user-level integration connections.
 * Credentials are stored at the user level, not per-activation.
 * Users connect HubSpot once and reuse it across all automations.
 */

export interface IntegrationConnection {
  id: string;
  provider: string;
  status: 'required' | 'connected' | 'revoked' | 'error' | 'expired';
  connected_email?: string | null;
  granted_scopes?: string[];
  created_at: string;
  updated_at: string;
}

interface UseIntegrationConnectionsState {
  connections: IntegrationConnection[];
  isLoading: boolean;
  error: string | null;
  isConnecting: boolean;
}

export function useIntegrationConnections(activationRequestId?: string) {
  const { user } = useAuth();
  const [state, setState] = useState<UseIntegrationConnectionsState>({
    connections: [],
    isLoading: false,
    error: null,
    isConnecting: false,
  });

  // Fetch user's connections (user-level, not activation-specific)
  const fetchConnections = useCallback(async () => {
    if (!user) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // CONNECT ONCE: Fetch by user_id only, not activation_request_id
      const { data, error } = await supabase
        .from('integration_connections')
        .select('*')
        .eq('user_id', user.id)
        .neq('status', 'revoked')
        .order('created_at', { ascending: true });

      if (error) throw error;

      setState({
        connections: (data || []) as IntegrationConnection[],
        isLoading: false,
        error: null,
        isConnecting: false,
      });
    } catch (err) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err.message : 'Failed to load connections',
      }));
    }
  }, [user]);

  useEffect(() => {
    fetchConnections();
  }, [fetchConnections]);

  const connectIntegration = useCallback(async (
    provider: string,
    credentials: Record<string, string>,
    options?: {
      grantedScopes?: string[];
      connectedEmail?: string;
    }
  ) => {
    if (!user) {
      return { error: 'Not authenticated' };
    }

    setState(prev => ({ ...prev, isConnecting: true, error: null }));

    try {
      const response = await supabase.functions.invoke('connect-integration', {
        body: {
          action: 'connect',
          activationRequestId, // Optional - for checking readiness
          provider,
          credentials,
          grantedScopes: options?.grantedScopes,
          connectedEmail: options?.connectedEmail,
        },
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to connect integration');
      }

      // Refresh connections
      await fetchConnections();

      setState(prev => ({ ...prev, isConnecting: false }));
      return { error: null, data: response.data };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect integration';
      setState(prev => ({
        ...prev,
        isConnecting: false,
        error: errorMessage,
      }));
      return { error: errorMessage };
    }
  }, [user, activationRequestId, fetchConnections]);

  const revokeConnection = useCallback(async (provider: string) => {
    if (!user) {
      return { error: 'Not authenticated' };
    }

    setState(prev => ({ ...prev, isConnecting: true, error: null }));

    try {
      const response = await supabase.functions.invoke('connect-integration', {
        body: {
          action: 'revoke',
          provider,
        },
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to revoke connection');
      }

      // Refresh connections
      await fetchConnections();

      setState(prev => ({ ...prev, isConnecting: false }));
      return { error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to revoke connection';
      setState(prev => ({
        ...prev,
        isConnecting: false,
        error: errorMessage,
      }));
      return { error: errorMessage };
    }
  }, [user, fetchConnections]);

  // Check if activation is ready (all required integrations connected)
  const checkActivationReady = useCallback(async (): Promise<{
    allConnected: boolean;
    required: string[];
    connected: string[];
    missing: string[];
  }> => {
    if (!user || !activationRequestId) {
      return { allConnected: false, required: [], connected: [], missing: [] };
    }

    try {
      const response = await supabase.functions.invoke('connect-integration', {
        body: {
          action: 'check_ready',
          activationRequestId,
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      return response.data;
    } catch (err) {
      console.error('Failed to check activation readiness:', err);
      return { allConnected: false, required: [], connected: [], missing: [] };
    }
  }, [user, activationRequestId]);

  const getConnectionStatus = useCallback((provider: string): IntegrationConnection['status'] => {
    const connection = state.connections.find(
      c => c.provider.toLowerCase() === provider.toLowerCase()
    );
    return connection?.status || 'required';
  }, [state.connections]);

  const isProviderConnected = useCallback((provider: string): boolean => {
    return getConnectionStatus(provider) === 'connected';
  }, [getConnectionStatus]);

  const allRequiredConnected = useCallback((requiredProviders: string[]): boolean => {
    return requiredProviders.every(p => isProviderConnected(p));
  }, [isProviderConnected]);

  return {
    ...state,
    fetchConnections,
    connectIntegration,
    revokeConnection,
    checkActivationReady,
    getConnectionStatus,
    isProviderConnected,
    allRequiredConnected,
  };
}
