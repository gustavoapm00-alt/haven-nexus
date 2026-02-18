import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface VpsInstance {
  id: string;
  user_id: string;
  virtual_machine_id: string | null;
  status: string;
  ip_address: string | null;
  hostname: string | null;
  plan: string | null;
  region: string | null;
  n8n_instance_url: string | null;
  agents_deployed: boolean;
  agents_deployed_at: string | null;
  agent_deploy_error: string | null;
  credentials_viewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export function useVpsInstance() {
  const { user } = useAuth();
  const [instance, setInstance] = useState<VpsInstance | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInstance = async () => {
    if (!user) return;
    setIsLoading(true);
    const { data, error: err } = await (supabase as any)
      .from('vps_instances')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (err) setError(err.message);
    else setInstance(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchInstance();
  }, [user]);

  // Realtime subscription for live status updates
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel('vps-instance-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'vps_instances', filter: `user_id=eq.${user.id}` },
        (payload) => {
          if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
            setInstance(payload.new as VpsInstance);
          }
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const provision = async (opts?: { plan?: string; region?: string; notes?: string }) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('NOT_AUTHENTICATED');

    setIsLoading(true);
    const res = await supabase.functions.invoke('hostinger-provision', {
      body: { plan: opts?.plan ?? 'starter', region: opts?.region ?? 'us-east-1', notes: opts?.notes },
    });

    if (res.error) throw new Error(res.error.message);
    await fetchInstance();
    return res.data;
  };

  return { instance, isLoading, error, provision, refetch: fetchInstance };
}
