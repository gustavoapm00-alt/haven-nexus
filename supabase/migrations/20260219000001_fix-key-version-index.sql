-- Fix: idx_integration_connections_key_version had incorrect partial condition
-- WHERE key_version < 1 is never true for rows with DEFAULT 1.
-- Replaced with WHERE key_version = 1 so the index is used during key rotation queries.

DROP INDEX IF EXISTS public.idx_integration_connections_key_version;

CREATE INDEX idx_integration_connections_key_version
  ON public.integration_connections (key_version)
  WHERE key_version = 1;
