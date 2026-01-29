import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

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

  const fetchConnections = useCallback(async () => {
    if (!activationRequestId || !user) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const { data, error } = await supabase
        .from('integration_connections')
        .select('*')
        .eq('activation_request_id', activationRequestId)
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
  }, [activationRequestId, user]);

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
    if (!activationRequestId || !user) {
      return { error: 'Not authenticated or no activation request' };
    }

    setState(prev => ({ ...prev, isConnecting: true, error: null }));

    try {
      const response = await supabase.functions.invoke('connect-integration', {
        body: {
          action: 'connect',
          activationRequestId,
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
  }, [activationRequestId, user, fetchConnections]);

  const revokeConnection = useCallback(async (provider: string) => {
    if (!activationRequestId || !user) {
      return { error: 'Not authenticated' };
    }

    setState(prev => ({ ...prev, isConnecting: true, error: null }));

    try {
      const response = await supabase.functions.invoke('connect-integration', {
        body: {
          action: 'revoke',
          activationRequestId,
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
  }, [activationRequestId, user, fetchConnections]);

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
    getConnectionStatus,
    isProviderConnected,
    allRequiredConnected,
  };
}
