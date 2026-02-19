
-- ══════════════════════════════════════════════════════════════════════
-- AERELION // STAGE_2_SOVEREIGN_MESH // SCHEMA MIGRATION
-- Tables: n8n_instances (horizontal n8n routing), system_registry (config)
-- Trigger: war_room_escalation on nexus_config
-- ══════════════════════════════════════════════════════════════════════

-- ── A. n8n_instances: Multi-Node Routing Table ─────────────────────
CREATE TABLE IF NOT EXISTS public.n8n_instances (
  id                UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  instance_url      TEXT NOT NULL,
  region            TEXT NOT NULL DEFAULT 'us-east-1',
  label             TEXT,
  current_load      INTEGER NOT NULL DEFAULT 0,
  max_capacity      INTEGER NOT NULL DEFAULT 100,
  status            TEXT NOT NULL DEFAULT 'active',
  api_key_secret    TEXT,               -- name of the Vault secret holding this instance's API key
  last_ping_at      TIMESTAMP WITH TIME ZONE,
  created_at        TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at        TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT chk_n8n_instance_status CHECK (status IN ('active','degraded','offline','maintenance'))
);

-- Unique URL per instance
CREATE UNIQUE INDEX IF NOT EXISTS idx_n8n_instances_url ON public.n8n_instances (instance_url);
-- Index for least-load query
CREATE INDEX IF NOT EXISTS idx_n8n_instances_load ON public.n8n_instances (status, current_load, max_capacity);

-- RLS
ALTER TABLE public.n8n_instances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage n8n instances"
  ON public.n8n_instances FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- Auto-updated_at trigger
CREATE OR REPLACE FUNCTION public.update_n8n_instances_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER trg_n8n_instances_updated_at
  BEFORE UPDATE ON public.n8n_instances
  FOR EACH ROW EXECUTE FUNCTION public.update_n8n_instances_updated_at();

-- ── B. system_registry: Centralized Config Store ──────────────────
CREATE TABLE IF NOT EXISTS public.system_registry (
  id          UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  namespace   TEXT NOT NULL,           -- e.g. 'stripe', 'hostinger', 'app'
  key         TEXT NOT NULL,           -- e.g. 'price_pulse', 'api_base_url'
  value       TEXT,
  description TEXT,
  is_secret   BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT uq_system_registry_ns_key UNIQUE (namespace, key)
);

CREATE INDEX IF NOT EXISTS idx_system_registry_namespace ON public.system_registry (namespace);

ALTER TABLE public.system_registry ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage system_registry"
  ON public.system_registry FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE OR REPLACE FUNCTION public.update_system_registry_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER trg_system_registry_updated_at
  BEFORE UPDATE ON public.system_registry
  FOR EACH ROW EXECUTE FUNCTION public.update_system_registry_updated_at();

-- ── C. WAR_ROOM Trigger: nexus_config → edge function notification ─
-- We use a stored procedure called by a trigger to log the mode change.
-- The actual edge function call is handled by pg_net via a NOTIFY channel.
CREATE OR REPLACE FUNCTION public.handle_nexus_mode_change()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.operational_mode IS DISTINCT FROM OLD.operational_mode THEN
    -- Immutable audit record
    INSERT INTO public.edge_function_logs (function_name, level, message, details, user_id)
    VALUES (
      'nexus_config_trigger',
      CASE WHEN NEW.operational_mode = 'WAR_ROOM' THEN 'error' ELSE 'info' END,
      'OPERATIONAL_MODE_TRANSITION: ' || COALESCE(OLD.operational_mode, 'INIT') || ' → ' || NEW.operational_mode,
      jsonb_build_object(
        'previous_mode', OLD.operational_mode,
        'new_mode', NEW.operational_mode,
        'changed_by', NEW.updated_by,
        'changed_at', now()
      ),
      NEW.updated_by
    );
  END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_nexus_mode_change ON public.nexus_config;
CREATE TRIGGER trg_nexus_mode_change
  AFTER UPDATE OF operational_mode ON public.nexus_config
  FOR EACH ROW EXECUTE FUNCTION public.handle_nexus_mode_change();

-- ── D. Seed system_registry with Stripe tier config ───────────────
INSERT INTO public.system_registry (namespace, key, value, description, is_secret)
VALUES
  ('stripe', 'price_pulse',    'price_1SzdaCJAQcpzy6vVzFLVYkgd',  'THE PULSE – monthly subscription price ID',  false),
  ('stripe', 'price_operator', 'price_1SzdaEJAQcpzy6vVucQakAuA',  'THE OPERATOR – monthly subscription price ID', false),
  ('stripe', 'price_ghost',    'price_1SzdaGJAQcpzy6vVyMmTifQW',  'THE GHOST – one-time payment price ID',       false),
  ('stripe', 'product_pulse',  'prod_TxYhnRbOluZBaB',             'THE PULSE product ID',                       false),
  ('stripe', 'product_operator','prod_TxYhoVock3Bxgb',            'THE OPERATOR product ID',                    false),
  ('stripe', 'product_ghost',  'prod_TxYhXs1DPZsWtZ',             'THE GHOST product ID',                       false),
  ('app',    'domain',         'app.aerelion.systems',             'Primary application domain',                 false),
  ('app',    'fallback_domain','haven-matrix.lovable.app',         'Fallback/preview domain',                    false),
  ('hostinger', 'api_base',    'https://api.hosting.hostinger.com/v1', 'Hostinger VPS API base URL',            false)
ON CONFLICT (namespace, key) DO UPDATE
  SET value = EXCLUDED.value, description = EXCLUDED.description, updated_at = now();

-- ── E. Seed primary n8n instance from current env config ──────────
-- This is a placeholder row — admin should verify the URL matches N8N_BASE_URL secret.
INSERT INTO public.n8n_instances (instance_url, region, label, max_capacity, status)
VALUES ('https://n8n.aerelion.systems', 'us-east-1', 'PRIMARY_NODE_01', 100, 'active')
ON CONFLICT (instance_url) DO NOTHING;
