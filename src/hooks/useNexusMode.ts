import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type OperationalMode = 'STEALTH' | 'SENTINEL' | 'WAR_ROOM';

export const MODE_CONFIG: Record<OperationalMode, {
  label: string;
  description: string;
  border: string;
  bg: string;
  pulse: string;
  scanlineOpacity: number;
  headerBorder: string;
}> = {
  STEALTH: {
    label: 'STEALTH',
    description: 'Passive monitoring — minimal footprint',
    border: 'rgba(57,255,20,0.15)',
    bg: 'rgba(0,0,0,0.96)',
    pulse: '#39FF14',
    scanlineOpacity: 0.012,
    headerBorder: 'rgba(57,255,20,0.3)',
  },
  SENTINEL: {
    label: 'SENTINEL',
    description: 'Active drift detection + auto-remediation',
    border: 'rgba(255,191,0,0.4)',
    bg: 'rgba(10,8,0,0.96)',
    pulse: '#FFBF00',
    scanlineOpacity: 0.025,
    headerBorder: 'rgba(255,191,0,0.5)',
  },
  WAR_ROOM: {
    label: 'WAR_ROOM',
    description: 'Maximum guardrails — real-time logic refactoring',
    border: 'rgba(255,68,68,0.5)',
    bg: 'rgba(10,0,0,0.96)',
    pulse: '#FF4444',
    scanlineOpacity: 0.04,
    headerBorder: 'rgba(255,68,68,0.6)',
  },
};

export function useNexusMode() {
  const [mode, setMode] = useState<OperationalMode>('STEALTH');
  const [loading, setLoading] = useState(true);

  // Fetch initial mode
  useEffect(() => {
    const fetch = async () => {
      const { data, error } = await supabase
        .from('nexus_config' as any)
        .select('operational_mode')
        .eq('id', 'singleton')
        .maybeSingle();
      if (!error && data) {
        setMode((data as any).operational_mode as OperationalMode);
      }
      setLoading(false);
    };
    fetch();
  }, []);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('nexus-mode')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'nexus_config', filter: 'id=eq.singleton' },
        (payload) => {
          const newMode = (payload.new as any).operational_mode as OperationalMode;
          setMode(newMode);
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const setOperationalMode = useCallback(async (newMode: OperationalMode) => {
    const prev = mode;
    setMode(newMode); // optimistic

    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase
      .from('nexus_config' as any)
      .update({
        operational_mode: newMode,
        updated_at: new Date().toISOString(),
        updated_by: user?.id || null,
      } as any)
      .eq('id', 'singleton');

    if (error) {
      setMode(prev);
      toast.error(`MODE_TRANSITION_FAILED: ${error.message}`);
      return false;
    }

    toast.success(`OPERATIONAL_MODE → ${newMode}`);
    return true;
  }, [mode]);

  return { mode, setOperationalMode, loading, config: MODE_CONFIG[mode] };
}
