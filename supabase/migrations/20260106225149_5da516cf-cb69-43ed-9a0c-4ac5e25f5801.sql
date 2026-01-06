-- Fix remaining security issues

-- 1. AUDITS TABLE: The existing policies are RESTRICTIVE with admin-only SELECT
-- But the linter shows there may be missing SELECT restriction for anonymous users
-- Add explicit denial for anonymous/public SELECT if not already covered
-- Check current state - the "Admins can view all audits" uses has_role which returns false for anon
-- This should already block anonymous SELECT, but let's verify the table is secure

-- 2. RELEVANCE_AGENTS TABLE: Create a view that excludes secrets for non-owners
-- First, create a security definer function to check if user is org owner/admin
CREATE OR REPLACE FUNCTION public.is_org_admin_or_owner(_user_id uuid, _org_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.org_members
    WHERE user_id = _user_id
      AND org_id = _org_id
      AND role IN ('owner', 'admin')
  )
$$;

-- Drop the duplicate/confusing SELECT policy on relevance_agents
DROP POLICY IF EXISTS "Org members can view agents without secrets" ON public.relevance_agents;

-- The existing "Org members can view agents" policy is fine, but we need to mask secrets
-- Create a view for safe agent access (excludes outbound_secret)
CREATE OR REPLACE VIEW public.relevance_agents_safe AS
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