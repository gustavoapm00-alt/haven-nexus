import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { SUCCESS_STATUSES } from '@/lib/purchase-constants';

interface UsePurchaseOptions {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export const usePurchase = (options?: UsePurchaseOptions) => {
  const { user, isLoading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);

  const initiateCheckout = async (itemType: 'agent' | 'bundle', itemId: string) => {
    if (authLoading) {
      toast.error('Please wait...');
      return;
    }

    if (!user) {
      toast.error('Please sign in to purchase', {
        description: 'You need to be logged in to make a purchase.',
        action: {
          label: 'Sign In',
          onClick: () => {
            window.location.href = '/auth?redirect=' + encodeURIComponent(window.location.pathname);
          },
        },
      });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('create-library-checkout', {
        body: { item_type: itemType, item_id: itemId },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.error) {
        throw new Error(data.error);
      }

      if (data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
        options?.onSuccess?.();
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to initiate checkout';
      toast.error('Checkout Failed', { description: errorMessage });
      options?.onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const checkPurchaseStatus = async (itemType: 'agent' | 'bundle', itemId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { data, error } = await supabase
        .from('purchases')
        .select('id')
        .eq('email', user.email)
        .eq('item_id', itemId)
        .eq('item_type', itemType)
        .in('status', SUCCESS_STATUSES)
        .limit(1);

      return !!data && data.length > 0 && !error;
    } catch {
      return false;
    }
  };

  return {
    initiateCheckout,
    checkPurchaseStatus,
    loading,
    isAuthenticated: !!user,
    authLoading,
  };
};
