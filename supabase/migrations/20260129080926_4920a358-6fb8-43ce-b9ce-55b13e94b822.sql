-- Integration connections table (tracks tool connections per user)
CREATE TABLE public.integration_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  activation_request_id UUID REFERENCES public.installation_requests(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'required',
  encrypted_payload TEXT,
  encryption_iv TEXT,
  encryption_tag TEXT,
  granted_scopes TEXT[],
  connected_email TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT valid_status CHECK (status IN ('required', 'connected', 'revoked', 'error', 'expired'))
);

-- n8n workflow mappings table (tracks provisioned workflows)
CREATE TABLE public.n8n_mappings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  activation_request_id UUID REFERENCES public.installation_requests(id) ON DELETE CASCADE,
  automation_id UUID REFERENCES public.automation_agents(id),
  bundle_id UUID REFERENCES public.automation_bundles(id),
  n8n_workflow_ids TEXT[] NOT NULL DEFAULT '{}',
  n8n_credential_ids TEXT[] NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending',
  provisioned_at TIMESTAMP WITH TIME ZONE,
  last_sync_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT valid_n8n_status CHECK (status IN ('pending', 'provisioning', 'active', 'paused', 'error', 'deactivated'))
);

-- Enable RLS on both tables
ALTER TABLE public.integration_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.n8n_mappings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for integration_connections
CREATE POLICY "Users can view own connections"
  ON public.integration_connections FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own connections"
  ON public.integration_connections FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own connections"
  ON public.integration_connections FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can manage all connections"
  ON public.integration_connections FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- RLS Policies for n8n_mappings
CREATE POLICY "Users can view own mappings"
  ON public.n8n_mappings FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all mappings"
  ON public.n8n_mappings FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- Add n8n_template_ids column to automation_agents if not exists
ALTER TABLE public.automation_agents 
ADD COLUMN IF NOT EXISTS n8n_template_ids TEXT[] DEFAULT '{}';

-- Add required_integrations column to automation_agents if not exists
ALTER TABLE public.automation_agents 
ADD COLUMN IF NOT EXISTS required_integrations JSONB DEFAULT '[]'::jsonb;

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_integration_connections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_integration_connections_updated_at
  BEFORE UPDATE ON public.integration_connections
  FOR EACH ROW
  EXECUTE FUNCTION public.update_integration_connections_updated_at();

CREATE TRIGGER update_n8n_mappings_updated_at
  BEFORE UPDATE ON public.n8n_mappings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_integration_connections_updated_at();