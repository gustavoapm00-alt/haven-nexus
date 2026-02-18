import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { VitalityMetrics } from '@/hooks/useHostingerMetrics';

export function useVpsOrchestrator() {
  const [isRebooting, setIsRebooting] = useState(false);
  const [rebootError, setRebootError] = useState<string | null>(null);
  const [isRequestingScale, setIsRequestingScale] = useState(false);
  const [scaleRequested, setScaleRequested] = useState(false);

  const reboot = useCallback(async (instanceId: string) => {
    setIsRebooting(true);
    setRebootError(null);
    try {
      const res = await supabase.functions.invoke('vps-orchestrator', {
        body: { action: 'reboot', instance_id: instanceId },
      });
      if (res.error) throw new Error(res.error.message);
      if (res.data?.error) throw new Error(res.data.error);
      return res.data;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'REBOOT_FAILED';
      setRebootError(msg);
      throw err;
    } finally {
      setIsRebooting(false);
    }
  }, []);

  const requestScale = useCallback(async (instanceId: string, metrics: VitalityMetrics | null) => {
    setIsRequestingScale(true);
    try {
      const message = metrics
        ? `Client requesting scale. Current: CPU ${metrics.cpu_percent.toFixed(1)}%, RAM ${metrics.ram_percent.toFixed(1)}%, DISK ${metrics.disk_percent.toFixed(1)}%`
        : `Client requesting scale — metrics unavailable.`;

      const res = await supabase.functions.invoke('vps-orchestrator', {
        body: { action: 'scale_request', instance_id: instanceId, message },
      });
      if (res.error) throw new Error(res.error.message);
      setScaleRequested(true);
      return res.data;
    } finally {
      setIsRequestingScale(false);
    }
  }, []);

  return { reboot, isRebooting, rebootError, requestScale, isRequestingScale, scaleRequested };
}
