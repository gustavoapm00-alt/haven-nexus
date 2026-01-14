import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface Purchase {
  id: string;
  item_type: 'agent' | 'bundle';
  item_id: string;
  amount_cents: number;
  status: string;
  created_at: string;
  download_count: number | null;
  last_download_at: string | null;
}

interface PurchaseWithDetails extends Purchase {
  item_name: string;
  item_slug: string;
}

interface EntitledAgent {
  id: string;
  slug: string;
  name: string;
  short_outcome: string;
  source: 'direct' | 'bundle';
  source_name?: string;
}

interface EntitlementStats {
  totalPurchases: number;
  agentPurchases: number;
  bundlePurchases: number;
  totalSpentCents: number;
  uniqueAgentsOwned: number;
}

export const useEntitlements = () => {
  const { user, isLoading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [purchases, setPurchases] = useState<PurchaseWithDetails[]>([]);
  const [entitledAgents, setEntitledAgents] = useState<EntitledAgent[]>([]);
  const [stats, setStats] = useState<EntitlementStats>({
    totalPurchases: 0,
    agentPurchases: 0,
    bundlePurchases: 0,
    totalSpentCents: 0,
    uniqueAgentsOwned: 0,
  });

  const fetchEntitlements = useCallback(async () => {
    if (!user?.id && !user?.email) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Fetch all purchases - prioritize user_id, fallback to email
      type RawPurchase = {
        id: string;
        item_type: string;
        item_id: string;
        amount_cents: number;
        status: string;
        created_at: string;
        download_count: number | null;
        last_download_at: string | null;
        email: string;
        user_id: string | null;
        stripe_session_id: string | null;
        stripe_payment_intent: string | null;
      };
      
      let purchaseData: RawPurchase[] | null = null;

      // First try by user_id (most reliable)
      if (user?.id) {
        const { data, error } = await supabase
          .from('purchases')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'paid')
          .order('created_at', { ascending: false });
        
        if (!error && data && data.length > 0) {
          purchaseData = data as RawPurchase[];
        }
      }

      // Fallback to email if user_id query returned nothing
      if ((!purchaseData || purchaseData.length === 0) && user?.email) {
        const { data, error } = await supabase
          .from('purchases')
          .select('*')
          .eq('email', user.email)
          .eq('status', 'paid')
          .order('created_at', { ascending: false });
        
        if (!error && data) {
          purchaseData = data as RawPurchase[];
        }
      }

      if (!purchaseData || purchaseData.length === 0) {
        setPurchases([]);
        setEntitledAgents([]);
        setStats({
          totalPurchases: 0,
          agentPurchases: 0,
          bundlePurchases: 0,
          totalSpentCents: 0,
          uniqueAgentsOwned: 0,
        });
        setLoading(false);
        return;
      }

      const agentPurchaseIds = purchaseData.filter(p => p.item_type === 'agent').map(p => p.item_id);
      const bundlePurchaseIds = purchaseData.filter(p => p.item_type === 'bundle').map(p => p.item_id);

      // Fetch agent and bundle details
      const [agentsRes, bundlesRes] = await Promise.all([
        agentPurchaseIds.length > 0
          ? supabase.from('automation_agents').select('id, name, slug, short_outcome').in('id', agentPurchaseIds)
          : { data: [], error: null },
        bundlePurchaseIds.length > 0
          ? supabase.from('automation_bundles').select('id, name, slug, included_agent_ids').in('id', bundlePurchaseIds)
          : { data: [], error: null },
      ]);

      const agentMap = new Map((agentsRes.data || []).map(a => [a.id, a]));
      const bundleMap = new Map((bundlesRes.data || []).map(b => [b.id, b]));

      // Enrich purchases with details
      const enrichedPurchases: PurchaseWithDetails[] = purchaseData.map(purchase => {
        const item = purchase.item_type === 'agent'
          ? agentMap.get(purchase.item_id)
          : bundleMap.get(purchase.item_id);

        return {
          ...purchase,
          item_type: purchase.item_type as 'agent' | 'bundle',
          item_name: item?.name || 'Unknown Item',
          item_slug: item?.slug || '',
        };
      });

      // Calculate unique entitled agents
      const entitledAgentMap = new Map<string, EntitledAgent>();

      // Direct agent purchases
      for (const purchase of purchaseData.filter(p => p.item_type === 'agent')) {
        const agent = agentMap.get(purchase.item_id);
        if (agent && !entitledAgentMap.has(agent.id)) {
          entitledAgentMap.set(agent.id, {
            id: agent.id,
            slug: agent.slug,
            name: agent.name,
            short_outcome: agent.short_outcome,
            source: 'direct',
          });
        }
      }

      // Agents from bundles
      const bundleAgentIds: string[] = [];
      const bundleAgentSources = new Map<string, string>();
      
      for (const purchase of purchaseData.filter(p => p.item_type === 'bundle')) {
        const bundle = bundleMap.get(purchase.item_id);
        if (bundle?.included_agent_ids) {
          for (const agentId of bundle.included_agent_ids) {
            if (!bundleAgentIds.includes(agentId)) {
              bundleAgentIds.push(agentId);
              bundleAgentSources.set(agentId, bundle.name);
            }
          }
        }
      }

      // Fetch bundle agents that weren't in direct purchases
      const missingAgentIds = bundleAgentIds.filter(id => !agentMap.has(id));
      if (missingAgentIds.length > 0) {
        const { data: bundleAgents } = await supabase
          .from('automation_agents')
          .select('id, name, slug, short_outcome')
          .in('id', missingAgentIds);

        if (bundleAgents) {
          for (const agent of bundleAgents) {
            agentMap.set(agent.id, agent);
          }
        }
      }

      // Add bundle agents to entitled map
      for (const agentId of bundleAgentIds) {
        if (!entitledAgentMap.has(agentId)) {
          const agent = agentMap.get(agentId);
          if (agent) {
            entitledAgentMap.set(agentId, {
              id: agent.id,
              slug: agent.slug,
              name: agent.name,
              short_outcome: agent.short_outcome,
              source: 'bundle',
              source_name: bundleAgentSources.get(agentId),
            });
          }
        }
      }

      const entitledAgentsList = Array.from(entitledAgentMap.values());

      // Calculate stats
      const agentPurchaseCount = purchaseData.filter(p => p.item_type === 'agent').length;
      const bundlePurchaseCount = purchaseData.filter(p => p.item_type === 'bundle').length;
      const totalSpent = purchaseData.reduce((sum, p) => sum + p.amount_cents, 0);

      setPurchases(enrichedPurchases);
      setEntitledAgents(entitledAgentsList);
      setStats({
        totalPurchases: purchaseData.length,
        agentPurchases: agentPurchaseCount,
        bundlePurchases: bundlePurchaseCount,
        totalSpentCents: totalSpent,
        uniqueAgentsOwned: entitledAgentsList.length,
      });
    } catch (err) {
      console.error('Error fetching entitlements:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id, user?.email]);

  useEffect(() => {
    if (authLoading) return;
    fetchEntitlements();
  }, [authLoading, fetchEntitlements]);

  const checkAgentAccess = useCallback((agentId: string): boolean => {
    return entitledAgents.some(a => a.id === agentId);
  }, [entitledAgents]);

  const checkBundleAccess = useCallback((bundleId: string): boolean => {
    return purchases.some(p => p.item_type === 'bundle' && p.item_id === bundleId);
  }, [purchases]);

  return {
    loading: loading || authLoading,
    purchases,
    entitledAgents,
    stats,
    checkAgentAccess,
    checkBundleAccess,
    refetch: fetchEntitlements,
  };
};
