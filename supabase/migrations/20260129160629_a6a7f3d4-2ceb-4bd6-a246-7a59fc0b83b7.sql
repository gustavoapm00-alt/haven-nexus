-- Add webhook-based activation fields to automation_agents
ALTER TABLE public.automation_agents
ADD COLUMN IF NOT EXISTS workflow_id text,
ADD COLUMN IF NOT EXISTS webhook_url text,
ADD COLUMN IF NOT EXISTS configuration_fields jsonb DEFAULT '[]'::jsonb;

-- Update n8n_mappings to track webhook-based activations
ALTER TABLE public.n8n_mappings
ADD COLUMN IF NOT EXISTS credentials_reference_id text,
ADD COLUMN IF NOT EXISTS last_webhook_response jsonb,
ADD COLUMN IF NOT EXISTS webhook_status text DEFAULT 'pending';

-- Add unique constraint for integration_connections to support upsert
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'integration_connections_user_activation_provider_unique'
  ) THEN
    ALTER TABLE public.integration_connections
    ADD CONSTRAINT integration_connections_user_activation_provider_unique 
    UNIQUE (user_id, activation_request_id, provider);
  END IF;
EXCEPTION WHEN others THEN
  -- Constraint might already exist with different name, ignore
  NULL;
END $$;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_integration_connections_activation 
ON public.integration_connections(activation_request_id, status);

CREATE INDEX IF NOT EXISTS idx_n8n_mappings_activation 
ON public.n8n_mappings(activation_request_id);

-- Comment on new fields for documentation
COMMENT ON COLUMN public.automation_agents.workflow_id IS 'n8n workflow ID (prebuilt template)';
COMMENT ON COLUMN public.automation_agents.webhook_url IS 'n8n webhook entry point for this automation';
COMMENT ON COLUMN public.automation_agents.configuration_fields IS 'Customer-configurable fields for this automation';
COMMENT ON COLUMN public.n8n_mappings.credentials_reference_id IS 'Reference ID passed to n8n for credential resolution';
COMMENT ON COLUMN public.n8n_mappings.webhook_status IS 'Status of last webhook trigger: pending, success, error';