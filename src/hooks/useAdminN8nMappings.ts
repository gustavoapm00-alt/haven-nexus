import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface N8nMappingWithDetails {
  id: string;
  user_id: string;
  activation_request_id: string | null;
  automation_id: string | null;
  bundle_id: string | null;
  status: string;
  webhook_status: string | null;
  webhook_url: string | null;
  n8n_workflow_ids: string[];
  n8n_credential_ids: string[];
  credentials_reference_id: string | null;
  provisioned_at: string | null;
  last_sync_at: string | null;
  error_message: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
  // Enriched fields
  user_email?: string;
  automation_name?: string;
  automation_slug?: string;
  bundle_name?: string;
  activation_status?: string;
  customer_name?: string;
}

interface UseAdminN8nMappingsState {
  mappings: N8nMappingWithDetails[];
  loading: boolean;
  refreshing: boolean;
  actionLoading: string | null;
}

export function useAdminN8nMappings() {
  const [state, setState] = useState<UseAdminN8nMappingsState>({
    mappings: [],
    loading: true,
    refreshing: false,
    actionLoading: null,
  });

  const fetchMappings = useCallback(async () => {
    try {
      // Fetch all n8n_mappings
      const { data: mappingsData, error: mappingsError } = await supabase
        .from('n8n_mappings')
        .select('*')
        .order('created_at', { ascending: false });

      if (mappingsError) throw mappingsError;

      // Fetch related data for enrichment
      const [automationsRes, bundlesRes, activationsRes, profilesRes] = await Promise.all([
        supabase.from('automation_agents').select('id, name, slug'),
        supabase.from('automation_bundles').select('id, name, slug'),
        supabase.from('installation_requests').select('id, name, email, status'),
        supabase.from('profiles').select('id, display_name, full_name'),
      ]);

      const automationsMap = new Map(
        automationsRes.data?.map((a) => [a.id, a]) || []
      );
      const bundlesMap = new Map(
        bundlesRes.data?.map((b) => [b.id, b]) || []
      );
      const activationsMap = new Map(
        activationsRes.data?.map((a) => [a.id, a]) || []
      );
      const profilesMap = new Map(
        profilesRes.data?.map((p) => [p.id, p]) || []
      );

      // Enrich mappings
      const enrichedMappings: N8nMappingWithDetails[] = (mappingsData || []).map((mapping) => {
        const automation = mapping.automation_id ? automationsMap.get(mapping.automation_id) : null;
        const bundle = mapping.bundle_id ? bundlesMap.get(mapping.bundle_id) : null;
        const activation = mapping.activation_request_id ? activationsMap.get(mapping.activation_request_id) : null;
        const profile = profilesMap.get(mapping.user_id);

        return {
          ...mapping,
          metadata: mapping.metadata as Record<string, unknown> | null,
          automation_name: automation?.name,
          automation_slug: automation?.slug,
          bundle_name: bundle?.name,
          activation_status: activation?.status,
          customer_name: activation?.name || profile?.display_name || profile?.full_name,
          user_email: activation?.email,
        };
      });

      setState((prev) => ({
        ...prev,
        mappings: enrichedMappings,
        loading: false,
        refreshing: false,
      }));
    } catch (error) {
      console.error('Error fetching n8n mappings:', error);
      toast.error('Failed to load n8n mappings');
      setState((prev) => ({ ...prev, loading: false, refreshing: false }));
    }
  }, []);

  useEffect(() => {
    fetchMappings();
  }, [fetchMappings]);

  const refresh = useCallback(() => {
    setState((prev) => ({ ...prev, refreshing: true }));
    fetchMappings();
  }, [fetchMappings]);

  const performAction = useCallback(
    async (
      activationRequestId: string,
      action: 'activate' | 'pause' | 'resume' | 'revoke' | 'retrigger'
    ) => {
      setState((prev) => ({ ...prev, actionLoading: `${activationRequestId}-${action}` }));

      try {
        const { data, error } = await supabase.functions.invoke('n8n-provision', {
          body: { action, activationRequestId },
        });

        if (error) throw error;

        if (data?.success) {
          toast.success(`Action "${action}" completed successfully`);
          await fetchMappings();
        } else {
          throw new Error(data?.error || 'Action failed');
        }
      } catch (error) {
        console.error(`Error performing ${action}:`, error);
        toast.error(`Failed to ${action}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } finally {
        setState((prev) => ({ ...prev, actionLoading: null }));
      }
    },
    [fetchMappings]
  );

  return {
    ...state,
    refresh,
    performAction,
  };
}
