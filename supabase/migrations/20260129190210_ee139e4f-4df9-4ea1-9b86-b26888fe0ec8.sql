-- =====================================================
-- CONNECT ONCE. RUN MANY. - Database Schema Alignment
-- =====================================================
-- This migration ensures integration_connections follows
-- the account-level credential model where each user has
-- exactly one active connection per provider.
-- =====================================================

-- Step 1: Add user_id column to installation_requests for direct lookup
-- (Avoids the expensive auth.admin.listUsers() call in runtime-credentials)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'installation_requests' 
    AND column_name = 'user_id'
  ) THEN
    ALTER TABLE public.installation_requests 
    ADD COLUMN user_id uuid REFERENCES auth.users(id);
    
    COMMENT ON COLUMN public.installation_requests.user_id IS 
      'Direct user reference for efficient runtime credential lookup. Populated at activation creation.';
  END IF;
END $$;

-- Step 2: Create index for user_id lookup on installation_requests
CREATE INDEX IF NOT EXISTS idx_installation_requests_user_id 
ON public.installation_requests(user_id);

-- Step 3: Backfill existing installation_requests with user_id from auth.users by email
UPDATE public.installation_requests ir
SET user_id = au.id
FROM auth.users au
WHERE ir.user_id IS NULL
  AND ir.email = au.email;

-- Step 4: Add comment on legacy activation_request_id column
COMMENT ON COLUMN public.integration_connections.activation_request_id IS 
  'LEGACY FIELD - Should be NULL for new connections. Credentials are stored at user-level (user_id + provider), not per-activation.';

-- Step 5: Add supporting indexes for integration_connections
CREATE INDEX IF NOT EXISTS idx_integration_connections_user_id 
ON public.integration_connections(user_id);

CREATE INDEX IF NOT EXISTS idx_integration_connections_status 
ON public.integration_connections(status);

CREATE INDEX IF NOT EXISTS idx_integration_connections_user_provider 
ON public.integration_connections(user_id, provider);

-- Step 6: Backfill duplicates - keep newest 'connected' per (user_id, provider)
-- Archive all other rows to allow unique constraint creation
WITH ranked_connections AS (
  SELECT 
    id,
    user_id,
    provider,
    status,
    created_at,
    ROW_NUMBER() OVER (
      PARTITION BY user_id, provider 
      ORDER BY 
        CASE WHEN status = 'connected' THEN 0 ELSE 1 END,
        created_at DESC
    ) as rn
  FROM public.integration_connections
  WHERE status NOT IN ('archived', 'revoked')
),
duplicates AS (
  SELECT id FROM ranked_connections WHERE rn > 1
)
UPDATE public.integration_connections
SET status = 'archived',
    updated_at = now()
WHERE id IN (SELECT id FROM duplicates);

-- Step 7: Create partial unique index enforcing one active connection per user+provider
-- This allows archived/revoked connections to exist without violating uniqueness
CREATE UNIQUE INDEX IF NOT EXISTS idx_integration_connections_user_provider_active
ON public.integration_connections(user_id, provider)
WHERE status NOT IN ('archived', 'revoked');

-- Step 8: Ensure all new connections have activation_request_id set to NULL
-- (Existing connections may have legacy values; new ones must be NULL)
UPDATE public.integration_connections
SET activation_request_id = NULL
WHERE status = 'connected'
  AND activation_request_id IS NOT NULL;