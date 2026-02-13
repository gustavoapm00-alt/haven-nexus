import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface THSState {
  isVerified: boolean;
  isLoading: boolean;
  lastVerifiedAt: string | null;
}

/**
 * Session-scoped THS verification.
 * 
 * Every browser session requires a fresh Human Signature challenge.
 * The sovereign_bridge table stores the latest verification state,
 * but the hook only trusts it if the sessionStorage flag confirms
 * verification happened in THIS browser session.
 */
const THS_SESSION_KEY = 'ths_verified_session';

export function useTHSVerification(userId: string | undefined): THSState {
  const [state, setState] = useState<THSState>({
    isVerified: false,
    isLoading: true,
    lastVerifiedAt: null,
  });

  const checkSession = useCallback(() => {
    if (!userId) return false;
    return sessionStorage.getItem(THS_SESSION_KEY) === userId;
  }, [userId]);

  useEffect(() => {
    if (!userId) {
      setState({ isVerified: false, isLoading: false, lastVerifiedAt: null });
      return;
    }

    // If session flag exists, trust it immediately
    if (checkSession()) {
      setState({ isVerified: true, isLoading: false, lastVerifiedAt: new Date().toISOString() });
      return;
    }

    // No session flag — not verified this session
    setState({ isVerified: false, isLoading: false, lastVerifiedAt: null });

    let cancelled = false;

    // Subscribe to realtime changes so verification propagates instantly
    // when the user completes THS in this tab
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
        async () => {
          if (cancelled) return;
          const { data } = await supabase
            .from('sovereign_bridge')
            .select('is_human_verified, updated_at')
            .eq('user_id', userId)
            .maybeSingle();

          if (cancelled || !data) return;

          if (data.is_human_verified === true) {
            sessionStorage.setItem(THS_SESSION_KEY, userId);
            setState({
              isVerified: true,
              isLoading: false,
              lastVerifiedAt: data.updated_at,
            });
          }
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [userId, checkSession]);

  return state;
}
