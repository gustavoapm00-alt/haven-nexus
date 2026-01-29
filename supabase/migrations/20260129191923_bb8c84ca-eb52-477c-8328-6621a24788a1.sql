-- ========================================
-- CONNECT ONCE: OAuth States + Workflow Templates
-- ========================================

-- Table for OAuth CSRF protection
CREATE TABLE IF NOT EXISTS public.oauth_states (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  provider TEXT NOT NULL,
  state_token TEXT NOT NULL UNIQUE,
  redirect_path TEXT,
  activation_request_id UUID REFERENCES public.installation_requests(id),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '15 minutes'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index for state lookup during callback
CREATE INDEX idx_oauth_states_token ON public.oauth_states(state_token);

-- Index for cleanup of expired states
CREATE INDEX idx_oauth_states_expires ON public.oauth_states(expires_at);

-- RLS for oauth_states (service role only - edge functions manage this)
ALTER TABLE public.oauth_states ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role manages OAuth states"
  ON public.oauth_states
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Table for n8n workflow templates (admin bulk import)
CREATE TABLE IF NOT EXISTS public.n8n_workflow_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  workflow_json JSONB NOT NULL,
  detected_providers TEXT[] DEFAULT '{}',
  node_count INTEGER DEFAULT 0,
  trigger_type TEXT,
  file_hash TEXT,
  original_filename TEXT,
  automation_agent_id UUID REFERENCES public.automation_agents(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  imported_by UUID
);

-- Index for slug lookup
CREATE INDEX idx_workflow_templates_slug ON public.n8n_workflow_templates(slug);

-- RLS for workflow templates (admin only)
ALTER TABLE public.n8n_workflow_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage workflow templates"
  ON public.n8n_workflow_templates
  FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- Function to clean expired OAuth states (can be called by cron)
CREATE OR REPLACE FUNCTION public.cleanup_expired_oauth_states()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.oauth_states WHERE expires_at < now();
END;
$$;

-- Add comment on legacy field
COMMENT ON COLUMN public.integration_connections.activation_request_id IS 
  'LEGACY: This field is deprecated. New connections set this to NULL for user-level CONNECT ONCE architecture.';