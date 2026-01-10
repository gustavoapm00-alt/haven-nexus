import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Agent {
  id: string;
  slug: string;
  name: string;
  short_outcome: string;
  description: string;
  sectors: string[];
  systems: string[];
  setup_time_min: number;
  setup_time_max: number;
  capacity_recovered_min: number;
  capacity_recovered_max: number;
  includes: string[];
  requirements: string[];
  how_it_works: string[];
  important_notes: string[];
  price_cents: number;
  featured: boolean;
  published_at: string | null;
  workflow_file_url: string | null;
  status: string;
}

export const useAgents = (options?: { featured?: boolean; limit?: number }) => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        let query = supabase
          .from('automation_agents')
          .select('*')
          .eq('status', 'published')
          .order('published_at', { ascending: false });

        if (options?.featured) {
          query = query.eq('featured', true);
        }

        if (options?.limit) {
          query = query.limit(options.limit);
        }

        const { data, error: fetchError } = await query;

        if (fetchError) throw fetchError;
        setAgents(data || []);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch agents'));
      } finally {
        setLoading(false);
      }
    };

    fetchAgents();
  }, [options?.featured, options?.limit]);

  return { agents, loading, error };
};

export const useAgent = (slug: string) => {
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchAgent = async () => {
      if (!slug) return;

      try {
        const { data, error: fetchError } = await supabase
          .from('automation_agents')
          .select('*')
          .eq('slug', slug)
          .eq('status', 'published')
          .single();

        if (fetchError) throw fetchError;
        setAgent(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch agent'));
      } finally {
        setLoading(false);
      }
    };

    fetchAgent();
  }, [slug]);

  return { agent, loading, error };
};
