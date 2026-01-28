import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface EngagementRequest {
  id: string;
  created_at: string;
  status: string;
  name: string;
  email: string;
  company_name: string | null;
  website: string | null;
  team_size: string | null;
  primary_goal: string | null;
  current_tools: string[] | null;
  operational_pain: string;
  calm_in_30_days: string | null;
  notes_internal: string | null;
  last_contacted_at: string | null;
  admin_seen: boolean | null;
}

interface UseEngagementRequestsState {
  requests: EngagementRequest[];
  newCount: number;
  isLoading: boolean;
  error: string | null;
}

export function useEngagementRequests() {
  const { isAdmin } = useAuth();
  const [state, setState] = useState<UseEngagementRequestsState>({
    requests: [],
    newCount: 0,
    isLoading: false,
    error: null,
  });

  const fetchRequests = useCallback(async () => {
    if (!isAdmin) {
      setState({ requests: [], newCount: 0, isLoading: false, error: null });
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const { data, error } = await supabase
        .from('engagement_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Cast the data since we know the new columns exist
      const requests = (data || []) as EngagementRequest[];
      const newCount = requests.filter(r => r.status === 'new' && !(r.admin_seen ?? false)).length;

      setState({
        requests,
        newCount,
        isLoading: false,
        error: null,
      });
    } catch (err) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err.message : 'Failed to load requests',
      }));
    }
  }, [isAdmin]);

  const updateRequest = useCallback(async (id: string, updates: Partial<EngagementRequest>) => {
    if (!isAdmin) return { error: 'Unauthorized' };

    try {
      const { error } = await supabase
        .from('engagement_requests')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      setState(prev => ({
        ...prev,
        requests: prev.requests.map(r => 
          r.id === id ? { ...r, ...updates } : r
        ),
        newCount: prev.requests.filter(r => 
          r.id === id 
            ? (updates.status ?? r.status) === 'new' && !((updates.admin_seen ?? r.admin_seen) ?? false)
            : r.status === 'new' && !(r.admin_seen ?? false)
        ).length,
      }));

      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Update failed' };
    }
  }, [isAdmin]);

  const markAsSeen = useCallback(async (id: string) => {
    return updateRequest(id, { admin_seen: true });
  }, [updateRequest]);

  const markContacted = useCallback(async (id: string) => {
    return updateRequest(id, { last_contacted_at: new Date().toISOString() });
  }, [updateRequest]);

  useEffect(() => {
    if (isAdmin) {
      fetchRequests();
    }
  }, [isAdmin, fetchRequests]);

  return {
    ...state,
    refresh: fetchRequests,
    updateRequest,
    markAsSeen,
    markContacted,
  };
}
