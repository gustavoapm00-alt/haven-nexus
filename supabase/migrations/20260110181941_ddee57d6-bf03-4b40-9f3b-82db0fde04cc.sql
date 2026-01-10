-- Create the agent-files storage bucket for workflow files and guides
INSERT INTO storage.buckets (id, name, public)
VALUES ('agent-files', 'agent-files', false)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for agent-files bucket
-- Admins can upload/manage files
CREATE POLICY "Admins can upload agent files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'agent-files' 
  AND EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

CREATE POLICY "Admins can update agent files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'agent-files' 
  AND EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

CREATE POLICY "Admins can delete agent files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'agent-files' 
  AND EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- Purchasers can download files (checked via purchases table)
CREATE POLICY "Purchasers can download agent files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'agent-files'
  AND (
    -- Admins can always access
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
    -- Or user has a paid purchase for an agent/bundle that includes this file
    OR EXISTS (
      SELECT 1 FROM public.purchases p
      WHERE p.email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND p.status = 'paid'
    )
  )
);

-- Add file path columns to automation_agents
ALTER TABLE public.automation_agents 
ADD COLUMN IF NOT EXISTS workflow_file_path TEXT,
ADD COLUMN IF NOT EXISTS guide_file_path TEXT;

-- Add bundle zip path column (optional - we'll derive from agents)
ALTER TABLE public.automation_bundles
ADD COLUMN IF NOT EXISTS bundle_zip_path TEXT;

-- Update purchases table to include more Stripe data
ALTER TABLE public.purchases
ADD COLUMN IF NOT EXISTS stripe_payment_intent TEXT,
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS download_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_download_at TIMESTAMP WITH TIME ZONE;

-- Create index for faster purchase lookups
CREATE INDEX IF NOT EXISTS idx_purchases_email_status ON public.purchases(email, status);
CREATE INDEX IF NOT EXISTS idx_purchases_user_id ON public.purchases(user_id);

-- Add rate limiting table for form submissions
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  identifier TEXT NOT NULL,
  action_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on rate_limits
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Allow inserts from anyone (checked in edge function)
CREATE POLICY "Allow rate limit inserts"
ON public.rate_limits
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Only admins can view/delete
CREATE POLICY "Admins can view rate limits"
ON public.rate_limits
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- Create function to check rate limit (returns true if allowed)
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_identifier TEXT,
  p_action_type TEXT,
  p_cooldown_seconds INTEGER DEFAULT 60
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_last_action TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Get the most recent action for this identifier/action combo
  SELECT created_at INTO v_last_action
  FROM public.rate_limits
  WHERE identifier = p_identifier
    AND action_type = p_action_type
  ORDER BY created_at DESC
  LIMIT 1;
  
  -- If no previous action or cooldown has passed, allow
  IF v_last_action IS NULL OR 
     (NOW() - v_last_action) > (p_cooldown_seconds || ' seconds')::INTERVAL THEN
    -- Record this action
    INSERT INTO public.rate_limits (identifier, action_type)
    VALUES (p_identifier, p_action_type);
    
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$;

-- Clean up old rate limit entries (run periodically)
CREATE OR REPLACE FUNCTION public.cleanup_rate_limits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.rate_limits
  WHERE created_at < NOW() - INTERVAL '1 hour';
END;
$$;