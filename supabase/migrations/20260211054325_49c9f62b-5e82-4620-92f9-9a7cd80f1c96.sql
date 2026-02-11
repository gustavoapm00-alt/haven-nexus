
-- Create agent_heartbeats table
CREATE TABLE public.agent_heartbeats (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id text NOT NULL,
  status text NOT NULL DEFAULT 'NOMINAL',
  message text NOT NULL DEFAULT '',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.agent_heartbeats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_heartbeats FORCE ROW LEVEL SECURITY;

-- Admin SELECT policy
CREATE POLICY "Admins can read heartbeats"
  ON public.agent_heartbeats FOR SELECT
  USING (is_admin());

-- Admin INSERT policy (for FORCE_STABILIZATION button)
CREATE POLICY "Admins can insert heartbeats"
  ON public.agent_heartbeats FOR INSERT
  WITH CHECK (is_admin());

-- Admin DELETE policy (for cleanup)
CREATE POLICY "Admins can delete heartbeats"
  ON public.agent_heartbeats FOR DELETE
  USING (is_admin());

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.agent_heartbeats;

-- Cleanup function
CREATE OR REPLACE FUNCTION public.cleanup_old_heartbeats()
  RETURNS void
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = public
AS $$
BEGIN
  DELETE FROM public.agent_heartbeats
  WHERE created_at < now() - INTERVAL '24 hours';
END;
$$;

-- Index for fast latest-per-agent queries
CREATE INDEX idx_agent_heartbeats_agent_created
  ON public.agent_heartbeats (agent_id, created_at DESC);
