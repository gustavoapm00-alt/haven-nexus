import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface THSState {
  isVerified: boolean;
  isLoading: boolean;
  lastVerifiedAt: string | null;
}

/**
 * Queries the sovereign_bridge table for the current user's
 * THS (The Human Signature) verification state.
 * 
 * Returns verified=true only if:
 *  - is_human_verified === true
 *  - updated_at is within the last 24 hours
 */
export function useTHSVerification(userId: string | undefined): THSState {
  const [state, setState] = useState<THSState>({
    isVerified: false,
    isLoading: true,
    lastVerifiedAt: null,
  });

  useEffect(() => {
    if (!userId) {
      setState({ isVerified: false, isLoading: false, lastVerifiedAt: null });
      return;
    }

    let cancelled = false;

    const check = async () => {
      const { data, error } = await supabase
        .from('sovereign_bridge')
        .select('is_human_verified, updated_at')
        .eq('user_id', userId)
        .maybeSingle();

      if (cancelled) return;

      if (error || !data) {
        setState({ isVerified: false, isLoading: false, lastVerifiedAt: null });
        return;
      }

      const updatedAt = new Date(data.updated_at);
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const isWithinWindow = updatedAt > twentyFourHoursAgo;
      const verified = data.is_human_verified === true && isWithinWindow;

      setState({
        isVerified: verified,
        isLoading: false,
        lastVerifiedAt: data.updated_at,
      });
    };

    check();

    // Subscribe to realtime changes so verification propagates instantly
    const channel = supabase
      .channel(`ths-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sovereign_bridge',
          filter: `user_id=eq.${userId}`,
        },
        () => { check(); }
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return state;
}
