import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface UsageStats {
  downloads: number;
  installs: number;
  logins: number;
}

export interface DailyDataPoint {
  date: string;
  downloads: number;
  installs: number;
}

export interface RecentEvent {
  id: string;
  event_type: string;
  item_type: string | null;
  item_id: string | null;
  created_at: string;
  metadata: Record<string, unknown>;
}

export interface UsageAnalytics {
  lifetime: UsageStats;
  last30d: UsageStats;
  daily_series: DailyDataPoint[];
  last_activity_at: string | null;
  recent_events: RecentEvent[];
}

interface UseUsageAnalyticsState {
  data: UsageAnalytics | null;
  isLoading: boolean;
  error: string | null;
}

const CACHE_TTL_MS = 30000; // 30 seconds

let cachedData: UsageAnalytics | null = null;
let cacheTimestamp = 0;

export function useUsageAnalytics() {
  const { user, session } = useAuth();
  const [state, setState] = useState<UseUsageAnalyticsState>({
    data: null,
    isLoading: false,
    error: null,
  });
  const mountedRef = useRef(true);

  const fetchAnalytics = useCallback(async (forceRefresh = false) => {
    if (!session?.access_token || !user) {
      setState({ data: null, isLoading: false, error: null });
      return;
    }

    const now = Date.now();
    if (!forceRefresh && cachedData && (now - cacheTimestamp) < CACHE_TTL_MS) {
      setState({ data: cachedData, isLoading: false, error: null });
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const { data, error } = await supabase.functions.invoke<UsageAnalytics>('get-usage-analytics', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!mountedRef.current) return;

      if (error) {
        throw new Error(error.message);
      }

      if (data) {
        cachedData = data;
        cacheTimestamp = Date.now();
        setState({ data, isLoading: false, error: null });
      }
    } catch (err) {
      if (!mountedRef.current) return;
      setState({
        data: null,
        isLoading: false,
        error: err instanceof Error ? err.message : 'Failed to load analytics',
      });
    }
  }, [session?.access_token, user]);

  const refresh = useCallback(() => {
    fetchAnalytics(true);
  }, [fetchAnalytics]);

  // Track login event on mount
  const trackLogin = useCallback(async () => {
    if (!user) return;
    
    try {
      await supabase.from('client_usage_events').insert({
        user_id: user.id,
        event_type: 'login',
      });
    } catch (err) {
      console.error('Failed to track login:', err);
    }
  }, [user]);

  useEffect(() => {
    mountedRef.current = true;
    fetchAnalytics();
    trackLogin();
    
    return () => {
      mountedRef.current = false;
    };
  }, [fetchAnalytics, trackLogin]);

  return {
    ...state,
    refresh,
  };
}
