
-- ============================================================
-- SECURITY CLEANUP MIGRATION - Fixed with CASCADE
-- ============================================================

-- 1. Drop unused Relevance AI related tables (dead feature)
-- Drop the view first (depends on relevance_agents)
DROP VIEW IF EXISTS public.relevance_agents_safe CASCADE;

-- Drop agent_runs table (has FK to relevance_agents)
DROP TABLE IF EXISTS public.agent_runs CASCADE;

-- Drop relevance_agents table
DROP TABLE IF EXISTS public.relevance_agents CASCADE;

-- 2. Clean up related org infrastructure that was only for Relevance AI
-- Drop org_subscriptions table (has FK to orgs and plans)
DROP TABLE IF EXISTS public.org_subscriptions CASCADE;

-- Drop org_members table (has FK to orgs)
DROP TABLE IF EXISTS public.org_members CASCADE;

-- Drop orgs table (CASCADE will handle trigger)
DROP TABLE IF EXISTS public.orgs CASCADE;

-- 3. Clean up plan_entitlements and plans (only used for Relevance AI)
-- Drop plan_entitlements (has FK to plans)
DROP TABLE IF EXISTS public.plan_entitlements CASCADE;

-- Drop plans table
DROP TABLE IF EXISTS public.plans CASCADE;

-- 4. Clean up agent_catalog (only used for Relevance AI)
DROP TABLE IF EXISTS public.agent_catalog CASCADE;

-- 5. Clean up helper functions only used for Relevance AI
DROP FUNCTION IF EXISTS public.is_org_member(uuid, uuid) CASCADE;
DROP FUNCTION IF EXISTS public.is_org_admin_or_owner(uuid, uuid) CASCADE;
DROP FUNCTION IF EXISTS public.add_org_creator_as_owner() CASCADE;

-- 6. Re-state RLS policies to ensure they're using authenticated role
-- This is idempotent and ensures scanner sees correct policies

-- Re-create the audits SELECT policy to be explicit with 'authenticated' role
DROP POLICY IF EXISTS "Admins can view all audits" ON public.audits;
CREATE POLICY "Admins can view all audits"
ON public.audits
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Re-create the email_signups SELECT policy to be explicit  
DROP POLICY IF EXISTS "Only admins can view email signups" ON public.email_signups;
CREATE POLICY "Only admins can view email signups"
ON public.email_signups
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));
