import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Bundle {
  id: string;
  slug: string;
  name: string;
  objective: string;
  description: string;
  included_agent_ids: string[];
  sectors: string[];
  individual_value_cents: number;
  bundle_price_cents: number;
  featured: boolean;
  published_at: string | null;
  status: string;
}

export interface BundleWithAgents extends Bundle {
  included_agents: Array<{
    id: string;
    slug: string;
    name: string;
    short_outcome: string;
  }>;
}

export const useBundles = (options?: { featured?: boolean; limit?: number }) => {
  const [bundles, setBundles] = useState<BundleWithAgents[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchBundles = async () => {
      try {
        let query = supabase
          .from('automation_bundles')
          .select('*')
          .eq('status', 'published')
          .order('published_at', { ascending: false });

        if (options?.featured) {
          query = query.eq('featured', true);
        }

        if (options?.limit) {
          query = query.limit(options.limit);
        }

        const { data: bundlesData, error: bundlesError } = await query;

        if (bundlesError) throw bundlesError;

        // Fetch agent names for each bundle
        const bundlesWithAgents = await Promise.all(
          (bundlesData || []).map(async (bundle) => {
            if (bundle.included_agent_ids?.length > 0) {
              const { data: agentsData } = await supabase
                .from('automation_agents')
                .select('id, slug, name, short_outcome')
                .in('id', bundle.included_agent_ids);
              
              return {
                ...bundle,
                included_agents: agentsData || [],
              };
            }
            return { ...bundle, included_agents: [] };
          })
        );

        setBundles(bundlesWithAgents);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch bundles'));
      } finally {
        setLoading(false);
      }
    };

    fetchBundles();
  }, [options?.featured, options?.limit]);

  return { bundles, loading, error };
};

export const useBundle = (slug: string) => {
  const [bundle, setBundle] = useState<BundleWithAgents | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchBundle = async () => {
      if (!slug) return;

      try {
        const { data: bundleData, error: bundleError } = await supabase
          .from('automation_bundles')
          .select('*')
          .eq('slug', slug)
          .eq('status', 'published')
          .single();

        if (bundleError) throw bundleError;

        // Fetch included agents
        if (bundleData.included_agent_ids?.length > 0) {
          const { data: agentsData } = await supabase
            .from('automation_agents')
            .select('id, slug, name, short_outcome')
            .in('id', bundleData.included_agent_ids);
          
          setBundle({
            ...bundleData,
            included_agents: agentsData || [],
          });
        } else {
          setBundle({ ...bundleData, included_agents: [] });
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch bundle'));
      } finally {
        setLoading(false);
      }
    };

    fetchBundle();
  }, [slug]);

  return { bundle, loading, error };
};
