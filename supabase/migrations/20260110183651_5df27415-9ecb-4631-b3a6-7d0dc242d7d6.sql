-- =================================================================
-- Step 2: Database Migration for Admin CRUD, RLS, and Seed Data
-- =================================================================

-- A) Helper function: public.is_admin()
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role = 'admin'
  );
$$;

-- B) Uniqueness constraints (add if not exists)
DO $$
BEGIN
  -- automation_agents.slug unique
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'automation_agents_slug_key'
  ) THEN
    ALTER TABLE public.automation_agents 
    ADD CONSTRAINT automation_agents_slug_key UNIQUE (slug);
  END IF;

  -- automation_bundles.slug unique
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'automation_bundles_slug_key'
  ) THEN
    ALTER TABLE public.automation_bundles 
    ADD CONSTRAINT automation_bundles_slug_key UNIQUE (slug);
  END IF;

  -- purchases.stripe_session_id unique
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'purchases_stripe_session_id_key'
  ) THEN
    ALTER TABLE public.purchases 
    ADD CONSTRAINT purchases_stripe_session_id_key UNIQUE (stripe_session_id);
  END IF;
END $$;

-- C) RLS Policies for automation_agents
-- Enable RLS if not already enabled
ALTER TABLE public.automation_agents ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any (to recreate cleanly)
DROP POLICY IF EXISTS "Public can view published agents" ON public.automation_agents;
DROP POLICY IF EXISTS "Admin full access agents" ON public.automation_agents;

-- Public SELECT: only published agents
CREATE POLICY "Public can view published agents"
ON public.automation_agents
FOR SELECT
USING (status = 'published');

-- Admin full access
CREATE POLICY "Admin full access agents"
ON public.automation_agents
FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- RLS Policies for automation_bundles
ALTER TABLE public.automation_bundles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view published bundles" ON public.automation_bundles;
DROP POLICY IF EXISTS "Admin full access bundles" ON public.automation_bundles;

-- Public SELECT: only published bundles
CREATE POLICY "Public can view published bundles"
ON public.automation_bundles
FOR SELECT
USING (status = 'published');

-- Admin full access
CREATE POLICY "Admin full access bundles"
ON public.automation_bundles
FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- D) Storage policies for bucket agent-files (private)
-- Remove any public read policies if they exist
DROP POLICY IF EXISTS "Public read access" ON storage.objects;
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Admin select agent-files" ON storage.objects;
DROP POLICY IF EXISTS "Admin insert agent-files" ON storage.objects;
DROP POLICY IF EXISTS "Admin update agent-files" ON storage.objects;
DROP POLICY IF EXISTS "Admin delete agent-files" ON storage.objects;

-- Admin-only policies for agent-files bucket
CREATE POLICY "Admin select agent-files"
ON storage.objects
FOR SELECT
USING (bucket_id = 'agent-files' AND public.is_admin());

CREATE POLICY "Admin insert agent-files"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'agent-files' AND public.is_admin());

CREATE POLICY "Admin update agent-files"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'agent-files' AND public.is_admin())
WITH CHECK (bucket_id = 'agent-files' AND public.is_admin());

CREATE POLICY "Admin delete agent-files"
ON storage.objects
FOR DELETE
USING (bucket_id = 'agent-files' AND public.is_admin());