-- CONNECT ONCE: Enforce one connection per user per provider
-- Step 1: Clean up duplicates - keep the most recent connected record per (user_id, provider)
WITH ranked_connections AS (
  SELECT 
    id,
    user_id,
    provider,
    status,
    updated_at,
    ROW_NUMBER() OVER (
      PARTITION BY user_id, provider 
      ORDER BY 
        CASE WHEN status = 'connected' THEN 0 ELSE 1 END,
        updated_at DESC
    ) as rn
  FROM integration_connections
)
UPDATE integration_connections
SET 
  status = 'archived',
  updated_at = now()
WHERE id IN (
  SELECT id FROM ranked_connections WHERE rn > 1
);

-- Step 2: Remove the activation_request_id dependency for new connections
-- (Existing column can stay, but we no longer use it for new connections)
COMMENT ON COLUMN integration_connections.activation_request_id IS 'Legacy field - new connections use NULL. Credentials are user-level, not activation-level.';

-- Step 3: Create unique index on (user_id, provider) for non-archived/revoked connections
-- This enforces CONNECT ONCE - only one active connection per provider per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_integration_connections_user_provider_active 
ON integration_connections (user_id, provider) 
WHERE status NOT IN ('archived', 'revoked');

-- Step 4: Add index for faster user-level lookups
CREATE INDEX IF NOT EXISTS idx_integration_connections_user_status 
ON integration_connections (user_id, status);

-- Step 5: Add index for runtime credential resolution
CREATE INDEX IF NOT EXISTS idx_integration_connections_user_connected 
ON integration_connections (user_id) 
WHERE status = 'connected';