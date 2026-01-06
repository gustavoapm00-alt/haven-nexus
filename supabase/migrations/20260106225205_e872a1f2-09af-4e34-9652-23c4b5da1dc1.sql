-- Fix the security definer view issue by recreating with SECURITY INVOKER
DROP VIEW IF EXISTS public.relevance_agents_safe;

-- Recreate view with SECURITY INVOKER (default, but explicit for clarity)
-- This ensures the view respects the querying user's permissions
CREATE VIEW public.relevance_agents_safe 
WITH (security_invoker = true)
AS
SELECT 
  id,
  org_id,
  agent_key,
  name,
  trigger_url,
  is_enabled,
  created_at,
  updated_at,
  -- Only show secret to org admins/owners
  CASE 
    WHEN is_org_admin_or_owner(auth.uid(), org_id) THEN outbound_secret
    ELSE NULL
  END as outbound_secret
FROM public.relevance_agents;

-- Grant access to the view
GRANT SELECT ON public.relevance_agents_safe TO authenticated;
GRANT SELECT ON public.relevance_agents_safe TO anon;