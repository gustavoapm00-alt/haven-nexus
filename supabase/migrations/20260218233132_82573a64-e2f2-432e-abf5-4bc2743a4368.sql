
-- ═══════════════════════════════════════════════════════
-- STAGE 1 HARDEN: Indexes + Status Constraints
-- AERELION // SYS.OPS.V2.06
-- ═══════════════════════════════════════════════════════

-- ── Missing indexes ───────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_agent_heartbeats_agent_id
  ON public.agent_heartbeats (agent_id);

CREATE INDEX IF NOT EXISTS idx_agent_heartbeats_created_at
  ON public.agent_heartbeats (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_n8n_mappings_user_id
  ON public.n8n_mappings (user_id);

CREATE INDEX IF NOT EXISTS idx_n8n_mappings_activation_request_id
  ON public.n8n_mappings (activation_request_id);

CREATE INDEX IF NOT EXISTS idx_integration_connections_user_provider
  ON public.integration_connections (user_id, provider);

CREATE INDEX IF NOT EXISTS idx_vps_instances_user_id
  ON public.vps_instances (user_id);

CREATE INDEX IF NOT EXISTS idx_edge_function_logs_function_name
  ON public.edge_function_logs (function_name, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_edge_function_logs_user_id
  ON public.edge_function_logs (user_id);

-- ── Heartbeat TTL cleanup (30d retention) ─────────────
-- Extend existing cleanup to 30 days (was 24h, too aggressive for drift detection)
CREATE OR REPLACE FUNCTION public.cleanup_old_heartbeats()
  RETURNS void
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
AS $$
BEGIN
  DELETE FROM public.agent_heartbeats
  WHERE created_at < now() - INTERVAL '30 days';
END;
$$;

-- ── Status allowlist validation (trigger-based, not CHECK) ───
CREATE OR REPLACE FUNCTION public.validate_installation_request_status()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
AS $$
DECLARE
  valid_statuses TEXT[] := ARRAY[
    'received','awaiting_credentials','awaiting_activation',
    'in_build','testing','live','active','needs_attention',
    'paused','cancelled','completed'
  ];
BEGIN
  IF NEW.status IS NOT NULL AND NOT (NEW.status = ANY(valid_statuses)) THEN
    RAISE EXCEPTION 'INVALID_STATUS: % is not a valid installation_request status', NEW.status;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validate_installation_request_status ON public.installation_requests;
CREATE TRIGGER trg_validate_installation_request_status
  BEFORE INSERT OR UPDATE ON public.installation_requests
  FOR EACH ROW EXECUTE FUNCTION public.validate_installation_request_status();

CREATE OR REPLACE FUNCTION public.validate_vps_instance_status()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
AS $$
DECLARE
  valid_statuses TEXT[] := ARRAY[
    'provisioning','active','rebooting','stopped','error','terminated'
  ];
BEGIN
  IF NOT (NEW.status = ANY(valid_statuses)) THEN
    RAISE EXCEPTION 'INVALID_VPS_STATUS: % is not a valid vps_instance status', NEW.status;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validate_vps_instance_status ON public.vps_instances;
CREATE TRIGGER trg_validate_vps_instance_status
  BEFORE INSERT OR UPDATE ON public.vps_instances
  FOR EACH ROW EXECUTE FUNCTION public.validate_vps_instance_status();
