import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface BillingPortalResponse {
  url?: string;
  error?: string;
  inactive?: boolean;
  message?: string;
}

export function useBillingPortal() {
  const { session } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const openBillingPortal = useCallback(async () => {
    if (!session?.access_token) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to access billing settings.',
        variant: 'destructive',
      });
      return null;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke<BillingPortalResponse>(
        'billing-portal-session',
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (error) {
        throw new Error(error.message);
      }

      if (data?.inactive) {
        toast({
          title: 'No active subscription',
          description: data.message || 'Please subscribe to access billing management.',
        });
        return { inactive: true };
      }

      if (data?.url) {
        window.open(data.url, '_blank');
        return { success: true, url: data.url };
      }

      throw new Error('No billing portal URL returned');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to open billing portal';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
      return { error: message };
    } finally {
      setIsLoading(false);
    }
  }, [session?.access_token]);

  return {
    openBillingPortal,
    isLoading,
  };
}
