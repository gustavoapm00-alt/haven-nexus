-- Add activation tracking columns to installation_requests table
ALTER TABLE public.installation_requests 
ADD COLUMN IF NOT EXISTS status text DEFAULT 'received',
ADD COLUMN IF NOT EXISTS customer_visible_status text DEFAULT 'received',
ADD COLUMN IF NOT EXISTS status_updated_at timestamp with time zone DEFAULT now(),
ADD COLUMN IF NOT EXISTS internal_owner text,
ADD COLUMN IF NOT EXISTS activation_eta text,
ADD COLUMN IF NOT EXISTS activation_notes_internal text,
ADD COLUMN IF NOT EXISTS activation_notes_customer text,
ADD COLUMN IF NOT EXISTS last_notified_status text,
ADD COLUMN IF NOT EXISTS purchase_id text,
ADD COLUMN IF NOT EXISTS automation_id uuid,
ADD COLUMN IF NOT EXISTS bundle_id uuid,
ADD COLUMN IF NOT EXISTS setup_window text;

-- Create index for status queries
CREATE INDEX IF NOT EXISTS idx_installation_requests_status ON public.installation_requests(status);
CREATE INDEX IF NOT EXISTS idx_installation_requests_email ON public.installation_requests(email);

-- Update RLS policies for user access
DROP POLICY IF EXISTS "Users can view own activation requests" ON public.installation_requests;
CREATE POLICY "Users can view own activation requests"
ON public.installation_requests
FOR SELECT
USING (
  email = (SELECT email FROM auth.users WHERE id = auth.uid())
  OR is_admin()
);

-- Allow admins to update activation requests
DROP POLICY IF EXISTS "Admins can update activation requests" ON public.installation_requests;
CREATE POLICY "Admins can update activation requests"
ON public.installation_requests
FOR UPDATE
USING (is_admin())
WITH CHECK (is_admin());