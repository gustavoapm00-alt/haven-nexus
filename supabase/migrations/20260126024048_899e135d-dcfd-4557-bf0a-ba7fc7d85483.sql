-- Create activation_customer_updates table for secure credential submissions
CREATE TABLE public.activation_customer_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  request_id uuid NOT NULL REFERENCES public.installation_requests(id) ON DELETE CASCADE,
  customer_email text NOT NULL,
  update_type text NOT NULL CHECK (update_type IN ('credentials', 'notes', 'access_granted', 'access_issue')),
  tool_name text,
  credential_method text CHECK (credential_method IS NULL OR credential_method IN ('oauth', 'api_key', 'invite_user', 'other')),
  message text,
  secure_link text,
  credential_reference text,
  attachment_url text,
  status text NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'reviewed', 'needs_more_info')),
  reviewed_at timestamp with time zone,
  reviewed_by text
);

-- Add reminder tracking fields to installation_requests
ALTER TABLE public.installation_requests
ADD COLUMN IF NOT EXISTS awaiting_credentials_since timestamp with time zone,
ADD COLUMN IF NOT EXISTS last_reminder_sent_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS reminder_count integer NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS reminders_disabled boolean NOT NULL DEFAULT false;

-- Enable RLS on new table
ALTER TABLE public.activation_customer_updates ENABLE ROW LEVEL SECURITY;

-- RLS: Customers can INSERT only if request exists and email matches
CREATE POLICY "Customers can insert own updates"
ON public.activation_customer_updates
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.installation_requests ir
    WHERE ir.id = request_id
    AND ir.email = (SELECT email FROM auth.users WHERE id = auth.uid())
  )
);

-- RLS: Customers can SELECT only their own rows
CREATE POLICY "Customers can view own updates"
ON public.activation_customer_updates
FOR SELECT
USING (
  customer_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  OR is_admin()
);

-- RLS: Admins can update all
CREATE POLICY "Admins can update all customer updates"
ON public.activation_customer_updates
FOR UPDATE
USING (is_admin())
WITH CHECK (is_admin());

-- RLS: Admins can delete
CREATE POLICY "Admins can delete customer updates"
ON public.activation_customer_updates
FOR DELETE
USING (is_admin());

-- Create index for faster lookups
CREATE INDEX idx_customer_updates_request_id ON public.activation_customer_updates(request_id);
CREATE INDEX idx_customer_updates_customer_email ON public.activation_customer_updates(customer_email);
CREATE INDEX idx_installation_requests_reminder ON public.installation_requests(customer_visible_status, last_reminder_sent_at, reminder_count) WHERE reminders_disabled = false;