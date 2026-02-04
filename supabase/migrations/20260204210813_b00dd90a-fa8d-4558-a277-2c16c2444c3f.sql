-- Add dedicated webhook_url column to n8n_mappings for per-activation runtime URLs
-- This replaces the deprecated automation_agents.webhook_url for runtime execution

ALTER TABLE public.n8n_mappings 
ADD COLUMN IF NOT EXISTS webhook_url TEXT;

-- Add comment explaining the column purpose
COMMENT ON COLUMN public.n8n_mappings.webhook_url IS 
  'Per-activation runtime webhook URL derived from n8n workflow. Format: {N8N_BASE_URL}/webhook/aerelion/{activation_request_id}. NOT to be confused with automation_agents.webhook_url which is deprecated for runtime use.';

-- Add comment to automation_agents.webhook_url marking it as deprecated
COMMENT ON COLUMN public.automation_agents.webhook_url IS 
  'DEPRECATED for runtime execution. Only used as legacy fallback. Runtime webhooks are stored per-activation in n8n_mappings.webhook_url.';