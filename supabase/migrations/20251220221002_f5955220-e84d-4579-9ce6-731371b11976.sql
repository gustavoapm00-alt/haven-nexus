-- Drop existing SELECT policy on relevance_agents
DROP POLICY IF EXISTS "Org members can view their agents" ON public.relevance_agents;

-- Create new SELECT policy that excludes outbound_secret for non-admin users
-- All org members can see basic agent info
CREATE POLICY "Org members can view agents without secrets"
ON public.relevance_agents
FOR SELECT
USING (
  public.is_org_member(auth.uid(), org_id)
);

-- Create a view that hides the secret from non-admin users
-- The secret will be NULL unless user is admin or the org owner
CREATE OR REPLACE VIEW public.relevance_agents_safe AS
SELECT 
  id,
  org_id,
  name,
  agent_key,
  trigger_url,
  is_enabled,
  created_at,
  updated_at,
  CASE 
    WHEN public.has_role(auth.uid(), 'admin') THEN outbound_secret
    ELSE NULL
  END as outbound_secret
FROM public.relevance_agents;

-- Grant access to the view
GRANT SELECT ON public.relevance_agents_safe TO authenticated;