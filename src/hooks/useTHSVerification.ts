import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface THSState {
  isVerified: boolean;
  isLoading: boolean;
  lastVerifiedAt: string | null;
}

/**
 * THS verification with 6-hour localStorage persistence.
 *
 * CRITICAL: initial state is resolved SYNCHRONOUSLY from localStorage so
 * NexusGuard never flickers to "not verified" after a fresh navigate().
 */
export const THS_STORAGE_KEY = 'ths_verified_until';
// DOCTRINE: 24-hour hard TTL — aligned with HMAC token expiry issued by verify-human-signature.
// This window is NOT negotiable. If elapsed, Nexus access is severed regardless of DB state.
export const THS_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours — hard enforced

export function getStoredExpiry(userId: string): number | null {
  try {
    const raw = localStorage.getItem(`${THS_STORAGE_KEY}:${userId}`);
    return raw ? parseInt(raw, 10) : null;
  } catch {
    return null;
  }
}

export function setStoredExpiry(userId: string): void {
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

/** Synchronous check — safe to call outside hooks */
export function isTHSValid(userId: string): boolean {
  const expiry = getStoredExpiry(userId);
  if (!expiry) return false;
  if (Date.now() < expiry) return true;
  clearTHSVerification(userId);
  return false;
}

export function useTHSVerification(userId: string | undefined): THSState {
  // Resolve initial state SYNCHRONOUSLY to avoid a flash of isLoading on
  // routes that navigate() to /nexus/cmd right after setting the token.
  const [state, setState] = useState<THSState>(() => {
    if (!userId) return { isVerified: false, isLoading: false, lastVerifiedAt: null };
    const valid = isTHSValid(userId);
    const expiry = valid ? getStoredExpiry(userId) : null;
    return {
      isVerified: valid,
      isLoading: false,
      lastVerifiedAt: expiry ? new Date(expiry - THS_TTL_MS).toISOString() : null,
    };
  });

  useEffect(() => {
    if (!userId) {
      setState({ isVerified: false, isLoading: false, lastVerifiedAt: null });
      return;
    }

    // Re-check on userId change (e.g. sign-in)
    if (isTHSValid(userId)) {
      const expiry = getStoredExpiry(userId);
      setState({
        isVerified: true,
        isLoading: false,
        lastVerifiedAt: expiry ? new Date(expiry - THS_TTL_MS).toISOString() : null,
      });
      return;
    }

    setState({ isVerified: false, isLoading: false, lastVerifiedAt: null });

    let cancelled = false;

    // Subscribe to realtime so verification from this tab propagates instantly
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
  }, [userId]);

  return state;
}

