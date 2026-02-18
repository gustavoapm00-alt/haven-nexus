
-- vps_instances: multi-tenant VPS tracking with encrypted credentials
CREATE TABLE public.vps_instances (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  virtual_machine_id TEXT UNIQUE,
  status TEXT NOT NULL DEFAULT 'provisioning',
  ip_address TEXT,
  hostname TEXT,
  plan TEXT,
  region TEXT,
  -- Encrypted SSH credentials (AES-256-GCM, same key as credential vault)
  encrypted_ssh_private_key TEXT,
  encrypted_ssh_public_key TEXT,
  ssh_key_label TEXT,
  ssh_encryption_iv TEXT,
  ssh_encryption_tag TEXT,
  -- Encrypted n8n credentials
  encrypted_n8n_credentials TEXT,
  n8n_encryption_iv TEXT,
  n8n_encryption_tag TEXT,
  n8n_instance_url TEXT,
  -- One-time credential view gate
  credentials_viewed_at TIMESTAMP WITH TIME ZONE,
  -- Agent deployment tracking
  agents_deployed BOOLEAN NOT NULL DEFAULT FALSE,
  agents_deployed_at TIMESTAMP WITH TIME ZONE,
  agent_deploy_error TEXT,
  -- Admin trigger tracking
  triggered_by TEXT,
  activation_request_id UUID,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.vps_instances ENABLE ROW LEVEL SECURITY;

-- RLS: Users see only their own nodes
CREATE POLICY "Users can view own vps instances"
ON public.vps_instances FOR SELECT
USING (auth.uid() = user_id);

-- RLS: Admins manage all
CREATE POLICY "Admins can manage all vps instances"
ON public.vps_instances FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

-- Auto-update timestamp
CREATE TRIGGER update_vps_instances_updated_at
BEFORE UPDATE ON public.vps_instances
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for live status updates on client dashboard
ALTER PUBLICATION supabase_realtime ADD TABLE public.vps_instances;
