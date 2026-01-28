import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface ActivationRequest {
  id: string;
  automation_id: string | null;
  bundle_id: string | null;
  status: string;
  customer_visible_status: string | null;
  purchased_item: string | null;
  created_at: string;
  credentials_count: number | null;
  credentials_submitted_at: string | null;
  activation_eta: string | null;
  activation_notes_customer: string | null;
}

export interface ActiveAutomation {
  id: string;
  name: string;
  short_outcome: string;
  status: 'active' | 'in_review' | 'pending_credentials' | 'paused' | 'needs_attention';
  activation_request_id: string | null;
  purchase_id: string;
  purchased_at: string;
  activation_eta?: string | null;
  notes?: string | null;
  requires_credentials: boolean;
  credentials_submitted: boolean;
  systems: string[];
}

export interface RequiredConnection {
  service_name: string;
  automation_name: string;
  activation_request_id: string;
  status: 'connected' | 'required';
}

// Map internal status to client-friendly status
function mapStatus(status: string | null): ActiveAutomation['status'] {
  if (!status) return 'in_review';
  
  const statusLower = status.toLowerCase();
  
  if (['live', 'completed', 'active'].includes(statusLower)) return 'active';
  if (['awaiting_credentials', 'pending_credentials'].includes(statusLower)) return 'pending_credentials';
  if (['paused', 'on_hold'].includes(statusLower)) return 'paused';
  if (['needs_attention', 'blocked', 'error'].includes(statusLower)) return 'needs_attention';
  
  // Default for received, in_review, in_build, testing
  return 'in_review';
}

export function useActivationStatus() {
  const { user, isLoading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeAutomations, setActiveAutomations] = useState<ActiveAutomation[]>([]);
  const [requiredConnections, setRequiredConnections] = useState<RequiredConnection[]>([]);
  const [hasIncompleteSetup, setHasIncompleteSetup] = useState(false);

  const fetchActivationStatus = useCallback(async () => {
    if (!user?.email) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Fetch completed purchases
      const { data: purchases } = await supabase
        .from('purchases')
        .select('*')
        .eq('user_id', user.id)
        .in('status', ['completed', 'paid'])
        .order('created_at', { ascending: false });

      if (!purchases || purchases.length === 0) {
        setActiveAutomations([]);
        setRequiredConnections([]);
        setHasIncompleteSetup(false);
        setLoading(false);
        return;
      }

      // Fetch activation requests for this user's email
      const { data: activationRequests } = await supabase
        .from('installation_requests')
        .select('*')
        .eq('email', user.email)
        .order('created_at', { ascending: false });

      // Fetch automation details
      const agentIds = purchases.filter(p => p.item_type === 'agent').map(p => p.item_id);
      const bundleIds = purchases.filter(p => p.item_type === 'bundle').map(p => p.item_id);

      const [agentsRes, bundlesRes] = await Promise.all([
        agentIds.length > 0
          ? supabase.from('automation_agents').select('id, name, short_outcome, systems').in('id', agentIds)
          : { data: [] },
        bundleIds.length > 0
          ? supabase.from('automation_bundles').select('id, name, objective, included_agent_ids').in('id', bundleIds)
          : { data: [] },
      ]);

      const agentMap = new Map((agentsRes.data || []).map(a => [a.id, a]));
      const bundleMap = new Map((bundlesRes.data || []).map(b => [b.id, b]));

      // Build active automations list
      const automations: ActiveAutomation[] = [];
      const connections: RequiredConnection[] = [];
      let hasIncomplete = false;

      for (const purchase of purchases) {
        // Find matching activation request
        const activationRequest = activationRequests?.find(ar => 
          ar.purchase_id === purchase.id ||
          ar.automation_id === purchase.item_id ||
          ar.bundle_id === purchase.item_id
        );

        if (purchase.item_type === 'agent') {
          const agent = agentMap.get(purchase.item_id);
          if (agent) {
            const status = mapStatus(activationRequest?.customer_visible_status || activationRequest?.status);
            const needsCredentials = status === 'pending_credentials' || 
              (!activationRequest?.credentials_submitted_at && status === 'in_review');
            
            if (needsCredentials) hasIncomplete = true;

            automations.push({
              id: agent.id,
              name: agent.name,
              short_outcome: agent.short_outcome,
              status,
              activation_request_id: activationRequest?.id || null,
              purchase_id: purchase.id,
              purchased_at: purchase.created_at,
              activation_eta: activationRequest?.activation_eta,
              notes: activationRequest?.activation_notes_customer,
              requires_credentials: (agent.systems?.length || 0) > 0,
              credentials_submitted: !!activationRequest?.credentials_submitted_at,
              systems: agent.systems || [],
            });

            // Add required connections for this automation
            if (needsCredentials && activationRequest?.id) {
              for (const system of (agent.systems || [])) {
                connections.push({
                  service_name: system,
                  automation_name: agent.name,
                  activation_request_id: activationRequest.id,
                  status: activationRequest?.credentials_submitted_at ? 'connected' : 'required',
                });
              }
            }
          }
        } else if (purchase.item_type === 'bundle') {
          const bundle = bundleMap.get(purchase.item_id);
          if (bundle) {
            const status = mapStatus(activationRequest?.customer_visible_status || activationRequest?.status);
            const needsCredentials = status === 'pending_credentials' ||
              (!activationRequest?.credentials_submitted_at && status === 'in_review');
            
            if (needsCredentials) hasIncomplete = true;

            automations.push({
              id: bundle.id,
              name: bundle.name,
              short_outcome: bundle.objective,
              status,
              activation_request_id: activationRequest?.id || null,
              purchase_id: purchase.id,
              purchased_at: purchase.created_at,
              activation_eta: activationRequest?.activation_eta,
              notes: activationRequest?.activation_notes_customer,
              requires_credentials: true,
              credentials_submitted: !!activationRequest?.credentials_submitted_at,
              systems: [],
            });
          }
        }
      }

      // Deduplicate connections by service name
      const uniqueConnections = Array.from(
        new Map(connections.map(c => [c.service_name, c])).values()
      );

      setActiveAutomations(automations);
      setRequiredConnections(uniqueConnections.filter(c => c.status === 'required'));
      setHasIncompleteSetup(hasIncomplete);
    } catch (error) {
      console.error('Error fetching activation status:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id, user?.email]);

  useEffect(() => {
    if (authLoading) return;
    fetchActivationStatus();
  }, [authLoading, fetchActivationStatus]);

  return {
    loading: loading || authLoading,
    activeAutomations,
    requiredConnections,
    hasIncompleteSetup,
    refetch: fetchActivationStatus,
  };
}
