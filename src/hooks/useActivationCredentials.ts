import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface StoredCredential {
  id: string;
  request_id: string;
  credential_type: string;
  service_name: string;
  status: 'active' | 'revoked' | 'expired' | 'pending_verification';
  created_at: string;
  updated_at: string;
  last_verified_at: string | null;
  metadata: Record<string, unknown>;
}

interface UseActivationCredentialsState {
  credentials: StoredCredential[];
  isLoading: boolean;
  error: string | null;
  isSubmitting: boolean;
}

export function useActivationCredentials(requestId?: string) {
  const { user } = useAuth();
  const [state, setState] = useState<UseActivationCredentialsState>({
    credentials: [],
    isLoading: false,
    error: null,
    isSubmitting: false,
  });

  const fetchCredentials = useCallback(async () => {
    if (!requestId || !user) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const { data, error } = await supabase
        .from('activation_credentials')
        .select('id, request_id, credential_type, service_name, status, created_at, updated_at, last_verified_at, metadata')
        .eq('request_id', requestId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      setState({
        credentials: (data || []) as StoredCredential[],
        isLoading: false,
        error: null,
        isSubmitting: false,
      });
    } catch (err) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err.message : 'Failed to load credentials',
      }));
    }
  }, [requestId, user]);

  const storeCredential = useCallback(async (
    credentialType: string,
    serviceName: string,
    credentials: Record<string, string>,
    metadata?: Record<string, unknown>
  ) => {
    if (!requestId || !user) {
      return { error: 'Not authenticated or no request ID' };
    }

    setState(prev => ({ ...prev, isSubmitting: true, error: null }));

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;

      if (!accessToken) {
        throw new Error('No active session');
      }

      const response = await supabase.functions.invoke('store-activation-credentials', {
        body: {
          requestId,
          credentialType,
          serviceName,
          credentials,
          metadata,
        },
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to store credentials');
      }

      // Refresh the credentials list
      await fetchCredentials();

      setState(prev => ({ ...prev, isSubmitting: false }));
      return { error: null, data: response.data };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to store credentials';
      setState(prev => ({
        ...prev,
        isSubmitting: false,
        error: errorMessage,
      }));
      return { error: errorMessage };
    }
  }, [requestId, user, fetchCredentials]);

  const revokeCredential = useCallback(async (credentialId: string, reason?: string) => {
    if (!user) {
      return { error: 'Not authenticated' };
    }

    setState(prev => ({ ...prev, isSubmitting: true, error: null }));

    try {
      const response = await supabase.functions.invoke('revoke-activation-credentials', {
        body: {
          credentialId,
          reason,
        },
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to revoke credential');
      }

      // Refresh the credentials list
      await fetchCredentials();

      setState(prev => ({ ...prev, isSubmitting: false }));
      return { error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to revoke credential';
      setState(prev => ({
        ...prev,
        isSubmitting: false,
        error: errorMessage,
      }));
      return { error: errorMessage };
    }
  }, [user, fetchCredentials]);

  return {
    ...state,
    fetchCredentials,
    storeCredential,
    revokeCredential,
    hasActiveCredentials: state.credentials.some(c => c.status === 'active'),
    activeCredentialCount: state.credentials.filter(c => c.status === 'active').length,
  };
}
