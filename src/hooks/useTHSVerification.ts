import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface THSState {
  isVerified: boolean;
  isLoading: boolean;
  lastVerifiedAt: string | null;
}

/**
 * THS verification with 6-hour persistence.
 *
 * After a successful Human Signature challenge, the admin is considered
 * verified for 6 hours. The expiry timestamp is stored in localStorage
 * keyed by userId so it survives page reloads and tab reopens within
 * the same browser, but is invalidated after 6 hours.
 */
const THS_STORAGE_KEY = 'ths_verified_until';
const THS_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours

function getStoredExpiry(userId: string): number | null {
  try {
    const raw = localStorage.getItem(`${THS_STORAGE_KEY}:${userId}`);
    return raw ? parseInt(raw, 10) : null;
  } catch {
    return null;
  }
}

function setStoredExpiry(userId: string): void {
  try {
    const expiresAt = Date.now() + THS_TTL_MS;
    localStorage.setItem(`${THS_STORAGE_KEY}:${userId}`, String(expiresAt));
  } catch {
    // ignore storage errors
  }
}

export function clearTHSVerification(userId: string): void {
  try {
    localStorage.removeItem(`${THS_STORAGE_KEY}:${userId}`);
  } catch {
    // ignore
  }
}

export function useTHSVerification(userId: string | undefined): THSState {
  const [state, setState] = useState<THSState>({
    isVerified: false,
    isLoading: true,
    lastVerifiedAt: null,
  });

  const checkStored = useCallback((): boolean => {
    if (!userId) return false;
    const expiry = getStoredExpiry(userId);
    if (!expiry) return false;
    if (Date.now() < expiry) return true;
    // Expired — clean up
    clearTHSVerification(userId);
    return false;
  }, [userId]);

  useEffect(() => {
    if (!userId) {
      setState({ isVerified: false, isLoading: false, lastVerifiedAt: null });
      return;
    }

    // If a valid unexpired token exists, trust it immediately
    if (checkStored()) {
      const expiry = getStoredExpiry(userId);
      setState({
        isVerified: true,
        isLoading: false,
        lastVerifiedAt: expiry ? new Date(expiry - THS_TTL_MS).toISOString() : new Date().toISOString(),
      });
      return;
    }

    // No valid stored token — not verified
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
            setStoredExpiry(userId);
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
  }, [userId, checkStored]);

  return state;
}
