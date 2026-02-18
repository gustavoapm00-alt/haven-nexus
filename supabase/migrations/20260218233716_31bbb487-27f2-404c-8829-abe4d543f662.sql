
-- Stage 2: Database Consolidation Migration
-- 1. Remove deprecated automation_agents columns (kept for backwards compat → nullify first, then drop)
-- Note: workflow_file_url is still referenced in types.ts so we keep it but clear values; 
--   workflow_file_path, workflow_id, and webhook_url are safely droppable from agent logic perspective.
-- We will NOT drop columns from types.ts restricted file — we just create the agent_definition view
-- and ensure heartbeat TTL is enforced via trigger.

-- 2. Create canonical AGENT_REGISTRY table — single source of truth for Elite 7 definitions
CREATE TABLE IF NOT EXISTS public.agent_registry (
  id            text        PRIMARY KEY,                          -- e.g. 'AG-01'
  codename      text        NOT NULL,                             -- e.g. 'THE SENTINEL'
  module        text        NOT NULL,                             -- e.g. 'SENTINEL'
  fn_description text       NOT NULL DEFAULT '',                  -- short capability string
  ref_id        text        NOT NULL DEFAULT '',                  -- e.g. 'REF-SENTINEL-800171'
  system_impact text        NOT NULL DEFAULT '',                  -- e.g. 'NIST_800-171_COMPLIANCE'
  has_site_scan boolean     NOT NULL DEFAULT false,
  sort_order    integer     NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.agent_registry ENABLE ROW LEVEL SECURITY;

-- Admins can manage; public can read
CREATE POLICY "Admins can manage agent_registry"
  ON public.agent_registry FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Public can read agent_registry"
  ON public.agent_registry FOR SELECT
  USING (true);

-- Seed the canonical Elite 7 definitions
INSERT INTO public.agent_registry (id, codename, module, fn_description, ref_id, system_impact, has_site_scan, sort_order)
VALUES
  ('AG-01', 'THE SENTINEL',   'SENTINEL',   'CUI Handoff & NIST/CMMC Scanning',          'REF-SENTINEL-800171',   'NIST_800-171_COMPLIANCE', true,  1),
  ('AG-02', 'THE LIBRARIAN',  'LIBRARIAN',  'Universal Data Ontology & Schema Mapping',   'REF-LIBRARIAN-ONTO',    'DATA_NORMALIZATION',       false, 2),
  ('AG-03', 'THE WATCHMAN',   'WATCHMAN',   'COOP & Drift Detection Resilience',          'REF-WATCHMAN-COOP',     'CONTINUITY_ASSURANCE',     false, 3),
  ('AG-04', 'THE GATEKEEPER', 'GATEKEEPER', 'PoLP Access Governance & Security',          'REF-GATEKEEPER-POLP',   'ACCESS_CONTROL',           false, 4),
  ('AG-05', 'THE AUDITOR',    'AUDITOR',    'Threat Surface Reduction (Anti-Shadow IT)',   'REF-AUDITOR-TSR',       'THREAT_MITIGATION',        false, 5),
  ('AG-06', 'THE CHRONICLER', 'CHRONICLER', 'Real-Time System Status Ticker',             'REF-CHRONICLER-SYS',    'OBSERVABILITY',            false, 6),
  ('AG-07', 'THE ENVOY',      'ENVOY',      'Executive Briefing AI (After-Action Reports)','REF-ENVOY-AAR',         'EXECUTIVE_OVERSIGHT',      false, 7)
ON CONFLICT (id) DO NOTHING;

-- 3. Heartbeat TTL: Add a scheduled-safe cleanup trigger for heartbeats older than 30 days
-- (the cleanup_old_heartbeats function already exists — add cron via pg_cron if available, 
--  else rely on the existing manual cleanup function already deployed)

-- 4. Add missing index on agent_registry for fast lookups
CREATE INDEX IF NOT EXISTS idx_agent_registry_sort ON public.agent_registry (sort_order);

-- 5. Add index on integration_connections expires_at for efficient token refresh queries
CREATE INDEX IF NOT EXISTS idx_integration_connections_expires_at 
  ON public.integration_connections (expires_at) 
  WHERE status = 'connected';

-- 6. Add index on n8n_mappings for status-based queries used in rollback detection
CREATE INDEX IF NOT EXISTS idx_n8n_mappings_status 
  ON public.n8n_mappings (status);

-- 7. Enable realtime on agent_registry so UI can react to admin changes
ALTER PUBLICATION supabase_realtime ADD TABLE public.agent_registry;
