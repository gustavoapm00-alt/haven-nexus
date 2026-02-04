-- Add unique partial index to prevent duplicate activation requests
-- Only allows one active request per user+automation combination
CREATE UNIQUE INDEX IF NOT EXISTS idx_installation_requests_user_automation_active
ON public.installation_requests (user_id, automation_id)
WHERE user_id IS NOT NULL 
  AND automation_id IS NOT NULL 
  AND status NOT IN ('completed', 'cancelled');

-- Also add index for bundle purchases
CREATE UNIQUE INDEX IF NOT EXISTS idx_installation_requests_user_bundle_active
ON public.installation_requests (user_id, bundle_id)
WHERE user_id IS NOT NULL 
  AND bundle_id IS NOT NULL 
  AND status NOT IN ('completed', 'cancelled');

-- Add unique index on purchase_id for webhook idempotency
CREATE UNIQUE INDEX IF NOT EXISTS idx_installation_requests_purchase_id
ON public.installation_requests (purchase_id)
WHERE purchase_id IS NOT NULL;