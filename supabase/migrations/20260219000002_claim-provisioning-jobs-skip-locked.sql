-- TD-04 Fix: Add atomic job claiming with FOR UPDATE SKIP LOCKED
-- The queue-processor previously fetched and then updated jobs in two separate
-- statements, creating a race window where concurrent cron invocations could
-- claim the same job. This function claims up to p_limit jobs atomically.

CREATE OR REPLACE FUNCTION public.claim_provisioning_jobs(
  p_limit integer DEFAULT 5
)
RETURNS SETOF public.provisioning_queue
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_now timestamp with time zone := now();
BEGIN
  RETURN QUERY
  UPDATE public.provisioning_queue
  SET
    status       = 'processing',
    started_at   = v_now,
    attempt_count = attempt_count + 1,
    updated_at   = v_now
  WHERE id IN (
    SELECT id
    FROM public.provisioning_queue
    WHERE status IN ('queued', 'retrying')
      AND scheduled_at <= v_now
    ORDER BY scheduled_at ASC
    LIMIT p_limit
    FOR UPDATE SKIP LOCKED
  )
  RETURNING *;
END;
$$;

-- Grant execute to service role only (called from edge functions with service key)
REVOKE ALL ON FUNCTION public.claim_provisioning_jobs(integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.claim_provisioning_jobs(integer) TO service_role;
