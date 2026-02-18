/**
 * useAgentRegistry — Single source of truth for Elite 7 agent definitions.
 * Reads from the agent_registry table seeded in the Stage 2 migration.
 * Falls back to a static constant if the DB is unreachable (e.g., public pages).
 */
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface AgentDefinition {
  id: string;           // 'AG-01' … 'AG-07'
  codename: string;     // 'THE SENTINEL'
  module: string;       // 'SENTINEL'
  fn_description: string;
  ref_id: string;
  system_impact: string;
  has_site_scan: boolean;
  sort_order: number;
}

// Static fallback — used before DB resolves and in edge functions
export const AGENT_DEFINITIONS: AgentDefinition[] = [
  { id: 'AG-01', codename: 'THE SENTINEL',   module: 'SENTINEL',   fn_description: 'CUI Handoff & NIST/CMMC Scanning',           ref_id: 'REF-SENTINEL-800171', system_impact: 'NIST_800-171_COMPLIANCE', has_site_scan: true,  sort_order: 1 },
  { id: 'AG-02', codename: 'THE LIBRARIAN',  module: 'LIBRARIAN',  fn_description: 'Universal Data Ontology & Schema Mapping',    ref_id: 'REF-LIBRARIAN-ONTO',  system_impact: 'DATA_NORMALIZATION',      has_site_scan: false, sort_order: 2 },
  { id: 'AG-03', codename: 'THE WATCHMAN',   module: 'WATCHMAN',   fn_description: 'COOP & Drift Detection Resilience',           ref_id: 'REF-WATCHMAN-COOP',   system_impact: 'CONTINUITY_ASSURANCE',    has_site_scan: false, sort_order: 3 },
  { id: 'AG-04', codename: 'THE GATEKEEPER', module: 'GATEKEEPER', fn_description: 'PoLP Access Governance & Security',           ref_id: 'REF-GATEKEEPER-POLP', system_impact: 'ACCESS_CONTROL',          has_site_scan: false, sort_order: 4 },
  { id: 'AG-05', codename: 'THE AUDITOR',    module: 'AUDITOR',    fn_description: 'Threat Surface Reduction (Anti-Shadow IT)',   ref_id: 'REF-AUDITOR-TSR',     system_impact: 'THREAT_MITIGATION',       has_site_scan: false, sort_order: 5 },
  { id: 'AG-06', codename: 'THE CHRONICLER', module: 'CHRONICLER', fn_description: 'Real-Time System Status Ticker',              ref_id: 'REF-CHRONICLER-SYS',  system_impact: 'OBSERVABILITY',           has_site_scan: false, sort_order: 6 },
  { id: 'AG-07', codename: 'THE ENVOY',      module: 'ENVOY',      fn_description: 'Executive Briefing AI (After-Action Reports)',ref_id: 'REF-ENVOY-AAR',       system_impact: 'EXECUTIVE_OVERSIGHT',     has_site_scan: false, sort_order: 7 },
];

export const useAgentRegistry = () => {
  const [agents, setAgents] = useState<AgentDefinition[]>(AGENT_DEFINITIONS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data, error } = await supabase
        .from('agent_registry' as never)
        .select('*')
        .order('sort_order', { ascending: true });

      if (!error && data && (data as AgentDefinition[]).length > 0) {
        setAgents(data as AgentDefinition[]);
      }
      // On error: keep static fallback (already set as default)
      setLoading(false);
    };
    fetch();
  }, []);

  return { agents, loading };
};
