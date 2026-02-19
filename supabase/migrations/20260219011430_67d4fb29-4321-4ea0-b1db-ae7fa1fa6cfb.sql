-- MIGRATION FIX: Use CREATE INDEX IF NOT EXISTS and remove WHERE key_version = 1
-- The partial index (WHERE key_version = 1) is only useful before the first rotation cycle
-- and becomes harmful after rotation. Remove the predicate to keep the index perpetually valid.

CREATE INDEX IF NOT EXISTS idx_integration_connections_key_version
  ON public.integration_connections (key_version);

CREATE INDEX IF NOT EXISTS idx_vps_instances_key_version_n8n
  ON public.vps_instances (n8n_key_version);

CREATE INDEX IF NOT EXISTS idx_vps_instances_key_version_ssh
  ON public.vps_instances (ssh_key_version);

CREATE INDEX IF NOT EXISTS idx_activation_credentials_key_version
  ON public.activation_credentials (key_version);

-- TTL enforcement: pg_cron job for agent_heartbeats cleanup (30-day retention)
-- The cleanup_old_heartbeats() function already exists; we schedule it here.
SELECT cron.schedule(
  'purge-agent-heartbeats-30d',
  '0 3 * * *',  -- daily at 03:00 UTC
  $$SELECT public.cleanup_old_heartbeats();$$
);

-- Also schedule edge_function_logs and provisioning_queue cleanup
SELECT cron.schedule(
  'purge-edge-logs-7d',
  '0 4 * * *',  -- daily at 04:00 UTC
  $$SELECT public.cleanup_old_edge_logs();$$
);

SELECT cron.schedule(
  'purge-provisioning-queue-7d',
  '0 5 * * *',  -- daily at 05:00 UTC
  $$SELECT public.cleanup_provisioning_queue();$$
);