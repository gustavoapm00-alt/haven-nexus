import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface AgentRecommendation {
  agent_id: string;
  agent_name: string;
  confidence: number;
  rationale: string;
  impact_statement: string;
}

export interface RecommendationResult {
  summary: string;
  recommendations: AgentRecommendation[];
}

export function useAgentRecommendations() {
  const [result, setResult] = useState<RecommendationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getRecommendations = useCallback(async (engagementRequestId: string) => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error('Not authenticated');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/recommend-agents`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({ engagement_request_id: engagementRequestId }),
        }
      );

      if (!response.ok) {
        const errBody = await response.json().catch(() => ({}));
        if (response.status === 429) throw new Error('Rate limit exceeded. Try again shortly.');
        if (response.status === 402) throw new Error('AI credits exhausted.');
        throw new Error(errBody.error || `Request failed (${response.status})`);
      }

      const data: RecommendationResult = await response.json();
      setResult(data);
      return data;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to get recommendations';
      setError(msg);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clear = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return { result, isLoading, error, getRecommendations, clear };
}
