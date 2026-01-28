-- Create engagement_requests table for AI Ops Installation bookings
CREATE TABLE public.engagement_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company_name TEXT,
  website TEXT,
  team_size TEXT NOT NULL,
  primary_goal TEXT NOT NULL,
  current_tools TEXT[] DEFAULT '{}'::text[],
  operational_pain TEXT NOT NULL,
  calm_in_30_days TEXT,
  status TEXT NOT NULL DEFAULT 'received'
);

-- Enable RLS
ALTER TABLE public.engagement_requests ENABLE ROW LEVEL SECURITY;

-- Public can submit engagement requests
CREATE POLICY "Public can submit engagement requests"
ON public.engagement_requests
FOR INSERT
WITH CHECK (true);

-- Only admins can view engagement requests
CREATE POLICY "Admins can view engagement requests"
ON public.engagement_requests
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can update engagement requests
CREATE POLICY "Admins can update engagement requests"
ON public.engagement_requests
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Engagement requests cannot be deleted
CREATE POLICY "Engagement requests cannot be deleted"
ON public.engagement_requests
FOR DELETE
USING (false);