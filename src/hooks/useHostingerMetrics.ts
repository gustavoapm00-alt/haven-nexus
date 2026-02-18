import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface VitalityMetrics {
  cpu_percent: number;
  ram_percent: number;
  ram_used_mb: number;
  ram_total_mb: number;
  disk_percent: number;
  disk_used_gb: number;
  disk_total_gb: number;
  network_in_mbps: number;
  network_out_mbps: number;
  uptime_seconds: number;
  status: string;
  sampled_at: string;
}

export function useHostingerMetrics(instanceId: string | null, pollIntervalMs = 30_000) {
  const [metrics, setMetrics] = useState<VitalityMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!instanceId) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await supabase.functions.invoke('hostinger-metrics', {
        body: { instance_id: instanceId },
      });
      if (res.error) throw new Error(res.error.message);
      if (res.data?.vitality) {
        setMetrics(res.data.vitality);
        setLastFetched(new Date().toISOString());
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'METRICS_FETCH_ERROR');
    } finally {
      setIsLoading(false);
    }
  }, [instanceId]);

  useEffect(() => {
    fetch();
    const id = setInterval(fetch, pollIntervalMs);
    return () => clearInterval(id);
  }, [fetch, pollIntervalMs]);

  return { metrics, isLoading, error, lastFetched, refetch: fetch };
}
