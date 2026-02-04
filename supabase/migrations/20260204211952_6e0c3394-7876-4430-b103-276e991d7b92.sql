-- Add 'revoked' to the valid_n8n_status check constraint
ALTER TABLE n8n_mappings DROP CONSTRAINT valid_n8n_status;

ALTER TABLE n8n_mappings ADD CONSTRAINT valid_n8n_status 
  CHECK (status IN ('pending', 'provisioning', 'active', 'paused', 'error', 'deactivated', 'revoked'));