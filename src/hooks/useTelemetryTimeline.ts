import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface TelemetryPoint {
  timestamp: string;
  hour: string;
  nominal: number;
  drift: number;
  error: number;
  processing: number;
  offline: number;
  total: number;
}

export function useTelemetryTimeline(windowHours: number = 24) {
  const [data, setData] = useState<TelemetryPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const since = new Date(Date.now() - windowHours * 3600000).toISOString();

      const { data: heartbeats } = await supabase
        .from('agent_heartbeats')
        .select('status, created_at')
        .gte('created_at', since)
        .order('created_at', { ascending: true })
        .limit(1000);

      if (!heartbeats || heartbeats.length === 0) {
        setData([]);
        setLoading(false);
        return;
      }

      // Bucket by hour
      const buckets: Record<string, { nominal: number; drift: number; error: number; processing: number; offline: number }> = {};

      // Pre-fill buckets
      const bucketCount = Math.min(windowHours, 720);
      const bucketSize = windowHours <= 48 ? 1 : windowHours <= 168 ? 4 : 24; // hours per bucket
      for (let i = 0; i < bucketCount; i += bucketSize) {
        const t = new Date(Date.now() - (bucketCount - i) * 3600000);
        const key = t.toISOString().slice(0, 13);
        buckets[key] = { nominal: 0, drift: 0, error: 0, processing: 0, offline: 0 };
      }

      for (const hb of heartbeats) {
        const key = hb.created_at.slice(0, 13);
        if (!buckets[key]) buckets[key] = { nominal: 0, drift: 0, error: 0, processing: 0, offline: 0 };
        const s = hb.status.toUpperCase();
        if (s === 'NOMINAL') buckets[key].nominal++;
        else if (s === 'DRIFT') buckets[key].drift++;
        else if (s === 'ERROR') buckets[key].error++;
        else if (s === 'PROCESSING') buckets[key].processing++;
        else buckets[key].offline++;
      }

      const points: TelemetryPoint[] = Object.entries(buckets)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, vals]) => ({
          timestamp: key,
          hour: key.slice(5, 16).replace('T', ' '),
          ...vals,
          total: vals.nominal + vals.drift + vals.error + vals.processing + vals.offline,
        }));

      setData(points);
      setLoading(false);
    };

    fetch();
  }, [windowHours]);

  return { data, loading };
}
