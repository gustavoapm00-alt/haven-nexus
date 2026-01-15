import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface EdgeFunctionLog {
  id: string;
  function_name: string;
  level: LogLevel;
  message: string;
  details: Record<string, unknown> | null;
  user_id: string | null;
  ip_address: string | null;
  duration_ms: number | null;
  status_code: number | null;
  created_at: string;
}

interface LogFilters {
  functionName?: string;
  level?: LogLevel;
  search?: string;
  limit?: number;
}

interface LogStats {
  total: number;
  errors: number;
  warnings: number;
  avgDuration: number;
  errorRate: number;
}

export function useEdgeFunctionLogs(filters: LogFilters = {}) {
  const { isAdmin } = useAuth();
  const [logs, setLogs] = useState<EdgeFunctionLog[]>([]);
  const [stats, setStats] = useState<LogStats>({
    total: 0,
    errors: 0,
    warnings: 0,
    avgDuration: 0,
    errorRate: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const fetchLogs = useCallback(async () => {
    if (!isAdmin) {
      setLogs([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('edge_function_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(filters.limit || 100);

      if (filters.functionName) {
        query = query.eq('function_name', filters.functionName);
      }

      if (filters.level) {
        query = query.eq('level', filters.level);
      }

      if (filters.search) {
        query = query.ilike('message', `%${filters.search}%`);
      }

      const { data, error: queryError } = await query;

      if (queryError) {
        throw queryError;
      }

      const typedLogs = (data || []) as EdgeFunctionLog[];
      setLogs(typedLogs);

      // Calculate stats
      const errors = typedLogs.filter(l => l.level === 'error').length;
      const warnings = typedLogs.filter(l => l.level === 'warn').length;
      const durations = typedLogs.filter(l => l.duration_ms != null).map(l => l.duration_ms!);
      const avgDuration = durations.length > 0 
        ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
        : 0;

      setStats({
        total: typedLogs.length,
        errors,
        warnings,
        avgDuration,
        errorRate: typedLogs.length > 0 ? Math.round((errors / typedLogs.length) * 100) : 0,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch logs');
    } finally {
      setIsLoading(false);
    }
  }, [isAdmin, filters.functionName, filters.level, filters.search, filters.limit]);

  // Subscribe to realtime updates
  useEffect(() => {
    if (!isAdmin) return;

    // Clean up previous channel
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    const channel = supabase
      .channel('edge-function-logs-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'edge_function_logs',
        },
        (payload) => {
          const newLog = payload.new as EdgeFunctionLog;
          
          // Check if it matches filters
          if (filters.functionName && newLog.function_name !== filters.functionName) return;
          if (filters.level && newLog.level !== filters.level) return;
          if (filters.search && !newLog.message.toLowerCase().includes(filters.search.toLowerCase())) return;

          setLogs(prev => {
            const updated = [newLog, ...prev].slice(0, filters.limit || 100);
            
            // Update stats
            const errors = updated.filter(l => l.level === 'error').length;
            const warnings = updated.filter(l => l.level === 'warn').length;
            const durations = updated.filter(l => l.duration_ms != null).map(l => l.duration_ms!);
            const avgDuration = durations.length > 0 
              ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
              : 0;

            setStats({
              total: updated.length,
              errors,
              warnings,
              avgDuration,
              errorRate: updated.length > 0 ? Math.round((errors / updated.length) * 100) : 0,
            });

            return updated;
          });
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [isAdmin, filters.functionName, filters.level, filters.search, filters.limit]);

  // Initial fetch
  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const clearLogs = useCallback(async () => {
    if (!isAdmin) return;

    try {
      // Delete logs older than 1 hour (for manual cleanup)
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      await supabase
        .from('edge_function_logs')
        .delete()
        .lt('created_at', oneHourAgo);
      
      await fetchLogs();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clear logs');
    }
  }, [isAdmin, fetchLogs]);

  return {
    logs,
    stats,
    isLoading,
    error,
    refresh: fetchLogs,
    clearLogs,
  };
}
