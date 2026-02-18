
-- Stage 3: Async Provisioning Queue
-- Creates a decoupled provisioning_queue table that breaks the synchronous HTTP chain

CREATE TABLE IF NOT EXISTS public.provisioning_queue (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  activation_request_id uuid REFERENCES public.installation_requests(id),
  action text NOT NULL, -- 'provision_vps', 'deploy_agents', 'activate_workflows'
  payload jsonb NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'queued', -- 'queued', 'processing', 'completed', 'failed', 'retrying'
  attempt_count integer NOT NULL DEFAULT 0,
  max_attempts integer NOT NULL DEFAULT 3,
  last_error text,
  scheduled_at timestamp with time zone NOT NULL DEFAULT now(),
  started_at timestamp with time zone,
  completed_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Indexes for queue polling efficiency
CREATE INDEX IF NOT EXISTS idx_provisioning_queue_status_scheduled
  ON public.provisioning_queue (status, scheduled_at)
  WHERE status IN ('queued', 'retrying');

CREATE INDEX IF NOT EXISTS idx_provisioning_queue_user_id
  ON public.provisioning_queue (user_id);

-- Enable RLS
ALTER TABLE public.provisioning_queue ENABLE ROW LEVEL SECURITY;

-- Only admins and service role can manage the queue
CREATE POLICY "Admins can manage provisioning queue"
  ON public.provisioning_queue FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- Users can view their own queue entries
CREATE POLICY "Users can view own queue entries"
  ON public.provisioning_queue FOR SELECT
  USING (auth.uid() = user_id);

-- Auto-update updated_at
CREATE TRIGGER update_provisioning_queue_updated_at
  BEFORE UPDATE ON public.provisioning_queue
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Stage 3: Envelope Encryption key_version tracking
-- Add key_version to integration_connections to support key rotation
ALTER TABLE public.integration_connections
  ADD COLUMN IF NOT EXISTS key_version integer NOT NULL DEFAULT 1;

-- Add key_version to vps_instances for SSH + n8n credential rotation tracking
ALTER TABLE public.vps_instances
  ADD COLUMN IF NOT EXISTS n8n_key_version integer NOT NULL DEFAULT 1;

ALTER TABLE public.vps_instances
  ADD COLUMN IF NOT EXISTS ssh_key_version integer NOT NULL DEFAULT 1;

-- Stage 3: activation_credentials key versioning
ALTER TABLE public.activation_credentials
  ADD COLUMN IF NOT EXISTS key_version integer NOT NULL DEFAULT 1;

-- Index for key rotation queries (find all records using old key version)
CREATE INDEX IF NOT EXISTS idx_integration_connections_key_version
  ON public.integration_connections (key_version)
  WHERE key_version < 1;

-- Cleanup function for completed/failed queue entries older than 7 days
CREATE OR REPLACE FUNCTION public.cleanup_provisioning_queue()
  RETURNS void
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
AS $function$
BEGIN
  DELETE FROM public.provisioning_queue
  WHERE status IN ('completed', 'failed')
    AND updated_at < now() - INTERVAL '7 days';
END;
$function$;
