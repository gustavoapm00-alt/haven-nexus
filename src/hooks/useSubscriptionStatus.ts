import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export type SubscriptionStatusType = 'active' | 'inactive' | 'unknown' | 'checking' | 'error';

interface SubscriptionStatusResponse {
  subscribed: boolean;
  status: 'active' | 'inactive' | 'unknown';
  product_id: string | null;
  price_id: string | null;
  subscription_end: string | null;
  checked_at: string;
  error?: string;
}

interface SubscriptionStatusState {
  status: SubscriptionStatusType;
  subscribed: boolean;
  productId: string | null;
  priceId: string | null;
  subscriptionEnd: string | null;
  checkedAt: string | null;
  error: string | null;
}

const CACHE_TTL_MS = 60000; // 60 seconds
const CLIENT_RETRY_DELAYS = [500, 1000]; // Light client-side retry

// Simple in-memory cache
let cachedResult: SubscriptionStatusState | null = null;
let cacheTimestamp = 0;

export function useSubscriptionStatus() {
  const { user, session } = useAuth();
  const [state, setState] = useState<SubscriptionStatusState>({
    status: 'checking',
    subscribed: false,
    productId: null,
    priceId: null,
    subscriptionEnd: null,
    checkedAt: null,
    error: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const mountedRef = useRef(true);

  const checkSubscription = useCallback(async (forceRefresh = false) => {
    if (!session?.access_token || !user) {
      setState({
        status: 'inactive',
        subscribed: false,
        productId: null,
        priceId: null,
        subscriptionEnd: null,
        checkedAt: null,
        error: null,
      });
      return;
    }

    // Check cache unless force refresh
    const now = Date.now();
    if (!forceRefresh && cachedResult && (now - cacheTimestamp) < CACHE_TTL_MS) {
      setState(cachedResult);
      return;
    }

    setIsLoading(true);
    setState(prev => ({ ...prev, status: 'checking', error: null }));

    let lastError: string | null = null;
    let response: SubscriptionStatusResponse | null = null;

    // Try with client-side retries
    for (let attempt = 0; attempt <= CLIENT_RETRY_DELAYS.length; attempt++) {
      try {
        const { data, error } = await supabase.functions.invoke<SubscriptionStatusResponse>('check-subscription', {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        if (error) {
          lastError = error.message;
          throw new Error(error.message);
        }

        if (data) {
          response = data;
          
          // If status is unknown, treat as retryable
          if (data.status === 'unknown' && attempt < CLIENT_RETRY_DELAYS.length) {
            await new Promise(resolve => setTimeout(resolve, CLIENT_RETRY_DELAYS[attempt]));
            continue;
          }
          
          break;
        }
      } catch (err) {
        lastError = err instanceof Error ? err.message : 'Unknown error';
        
        // Retry if not last attempt
        if (attempt < CLIENT_RETRY_DELAYS.length) {
          await new Promise(resolve => setTimeout(resolve, CLIENT_RETRY_DELAYS[attempt]));
          continue;
        }
      }
    }

    if (!mountedRef.current) return;

    if (response && response.status !== 'unknown') {
      const newState: SubscriptionStatusState = {
        status: response.status,
        subscribed: response.subscribed,
        productId: response.product_id,
        priceId: response.price_id,
        subscriptionEnd: response.subscription_end,
        checkedAt: response.checked_at,
        error: null,
      };
      
      // Update cache
      cachedResult = newState;
      cacheTimestamp = Date.now();
      
      setState(newState);
    } else {
      setState({
        status: 'error',
        subscribed: false,
        productId: null,
        priceId: null,
        subscriptionEnd: null,
        checkedAt: new Date().toISOString(),
        error: lastError || 'Unable to verify subscription',
      });
    }

    setIsLoading(false);
  }, [session?.access_token, user]);

  const refresh = useCallback(() => {
    checkSubscription(true);
  }, [checkSubscription]);

  // Check on mount and when user changes
  useEffect(() => {
    mountedRef.current = true;
    checkSubscription();
    
    return () => {
      mountedRef.current = false;
    };
  }, [checkSubscription]);

  return {
    ...state,
    isLoading,
    refresh,
  };
}
