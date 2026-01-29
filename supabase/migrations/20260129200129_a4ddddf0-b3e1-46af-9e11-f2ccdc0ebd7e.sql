-- ============================================================
-- CONNECT ONCE HARDENING: RLS + POLICIES FOR OAUTH & ADMIN
-- ============================================================

-- 1) OAUTH_STATES: Strict RLS - service role only
-- Drop existing policy if any
DROP POLICY IF EXISTS "Service role manages OAuth states" ON public.oauth_states;

-- Enable RLS
ALTER TABLE public.oauth_states ENABLE ROW LEVEL SECURITY;

-- No policies for authenticated users = deny all by default
-- Only service role (edge functions) can access this table
-- We add a restrictive policy that denies all normal users
CREATE POLICY "Service role manages OAuth states"
ON public.oauth_states
FOR ALL
USING (false)  -- Deny all regular users
WITH CHECK (false);

-- Add helpful indexes
CREATE INDEX IF NOT EXISTS idx_oauth_states_state_token ON public.oauth_states(state_token);
CREATE INDEX IF NOT EXISTS idx_oauth_states_expires_at ON public.oauth_states(expires_at);

-- Ensure expires_at has a default
ALTER TABLE public.oauth_states 
ALTER COLUMN expires_at SET DEFAULT (now() + interval '15 minutes');

-- Add comment on activation_request_id explaining it's legacy
COMMENT ON COLUMN public.oauth_states.activation_request_id IS 
'Legacy field for activation-specific OAuth flows. For CONNECT ONCE model, this may store the activation context for redirect purposes only.';


-- 2) N8N_WORKFLOW_TEMPLATES: Admin-only RLS
-- Drop existing policy if any
DROP POLICY IF EXISTS "Admins can manage workflow templates" ON public.n8n_workflow_templates;

-- Enable RLS
ALTER TABLE public.n8n_workflow_templates ENABLE ROW LEVEL SECURITY;

-- Only admins can read/write
CREATE POLICY "Admins can manage workflow templates"
ON public.n8n_workflow_templates
FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

-- Add UNIQUE constraint on slug if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'n8n_workflow_templates_slug_key'
  ) THEN
    ALTER TABLE public.n8n_workflow_templates 
    ADD CONSTRAINT n8n_workflow_templates_slug_key UNIQUE (slug);
  END IF;
END $$;

-- Add indexes for common lookups
CREATE INDEX IF NOT EXISTS idx_n8n_workflow_templates_automation_agent 
ON public.n8n_workflow_templates(automation_agent_id);


-- 3) INTEGRATION_CONNECTIONS: Add comment on activation_request_id
COMMENT ON COLUMN public.integration_connections.activation_request_id IS 
'LEGACY FIELD - For CONNECT ONCE model, this must be NULL for account-level connections. Credentials are scoped to (user_id, provider) and reused across all activations.';