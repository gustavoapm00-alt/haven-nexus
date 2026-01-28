-- Secure activation credentials storage
-- Credentials are AES-256-GCM encrypted client-side before storage

-- Create activation_credentials table for encrypted credential storage
CREATE TABLE public.activation_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES public.installation_requests(id) ON DELETE CASCADE,
  
  -- Credential metadata (not sensitive)
  credential_type TEXT NOT NULL, -- 'gmail_oauth', 'slack_api', 'notion_api', etc.
  service_name TEXT NOT NULL, -- Human-readable service name
  
  -- Encrypted credential blob (AES-256-GCM encrypted JSON)
  encrypted_data TEXT NOT NULL,
  encryption_iv TEXT NOT NULL, -- Initialization vector for AES-GCM
  encryption_tag TEXT NOT NULL, -- Authentication tag for AES-GCM
  
  -- Lifecycle tracking
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'revoked', 'expired', 'pending_verification')),
  last_verified_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  
  -- Audit trail
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by TEXT NOT NULL, -- Email of the person who submitted
  revoked_at TIMESTAMP WITH TIME ZONE,
  revoked_by TEXT,
  revocation_reason TEXT,
  
  -- Extra metadata for hybrid approach (NOT encrypted - non-sensitive only)
  metadata JSONB DEFAULT '{}'::jsonb,
  
  UNIQUE(request_id, credential_type)
);

-- Enable RLS
ALTER TABLE public.activation_credentials ENABLE ROW LEVEL SECURITY;

-- Customers can view their own credentials (metadata only, encrypted data visible but unusable without key)
CREATE POLICY "Customer can view own credentials"
  ON public.activation_credentials FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.installation_requests ir
      WHERE ir.id = activation_credentials.request_id
        AND ir.email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

-- Customers can insert credentials for their own requests
CREATE POLICY "Customer can insert own credentials"
  ON public.activation_credentials FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.installation_requests ir
      WHERE ir.id = activation_credentials.request_id
        AND ir.email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
    AND created_by = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- Customers can update (rotate) their own active credentials
CREATE POLICY "Customer can update own credentials"
  ON public.activation_credentials FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.installation_requests ir
      WHERE ir.id = activation_credentials.request_id
        AND ir.email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
    AND status = 'active'
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.installation_requests ir
      WHERE ir.id = activation_credentials.request_id
        AND ir.email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

-- Admins have full access
CREATE POLICY "Admins can manage all credentials"
  ON public.activation_credentials FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- Trigger to update updated_at
CREATE TRIGGER update_activation_credentials_updated_at
  BEFORE UPDATE ON public.activation_credentials
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add index for faster lookups
CREATE INDEX idx_activation_credentials_request_id ON public.activation_credentials(request_id);
CREATE INDEX idx_activation_credentials_status ON public.activation_credentials(status);

-- Add credential submission tracking to installation_requests
ALTER TABLE public.installation_requests 
  ADD COLUMN IF NOT EXISTS credentials_submitted_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS credentials_verified_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS credentials_count INTEGER DEFAULT 0;

-- Comment for documentation
COMMENT ON TABLE public.activation_credentials IS 'Stores AES-256-GCM encrypted credentials for automation activation. Encryption happens client-side before transmission. Only the encrypted blob is stored; decryption requires the server-side CREDENTIAL_ENCRYPTION_KEY.';
COMMENT ON COLUMN public.activation_credentials.encrypted_data IS 'Base64-encoded AES-256-GCM encrypted JSON containing actual credentials. Never logged or exposed in plaintext.';
COMMENT ON COLUMN public.activation_credentials.encryption_iv IS 'Base64-encoded 12-byte initialization vector for AES-GCM. Unique per encryption operation.';
COMMENT ON COLUMN public.activation_credentials.encryption_tag IS 'Base64-encoded 16-byte authentication tag from AES-GCM. Ensures data integrity.';