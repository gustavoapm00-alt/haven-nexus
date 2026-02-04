-- ============================================================================
-- n8n_workflow_templates Immutability Enforcement
-- ============================================================================
-- This migration adds strict immutability controls to prevent any modification
-- or deletion of workflow templates after they are inserted.
-- Templates are append-only and serve as trusted source definitions.
-- ============================================================================

-- 1. Create function to prevent UPDATE/DELETE on n8n_workflow_templates
CREATE OR REPLACE FUNCTION public.prevent_template_modification()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    RAISE EXCEPTION 'n8n_workflow_templates is immutable: UPDATE operations are not allowed. Create a new template version instead.';
  ELSIF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'n8n_workflow_templates is immutable: DELETE operations are not allowed. Templates are permanent records.';
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. Create trigger to enforce immutability (BEFORE prevents the operation)
DROP TRIGGER IF EXISTS enforce_template_immutability ON public.n8n_workflow_templates;
CREATE TRIGGER enforce_template_immutability
  BEFORE UPDATE OR DELETE ON public.n8n_workflow_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_template_modification();

-- 3. Ensure RLS is enabled
ALTER TABLE public.n8n_workflow_templates ENABLE ROW LEVEL SECURITY;

-- 4. Drop existing policies to recreate with strict rules
DROP POLICY IF EXISTS "Admins can insert templates" ON public.n8n_workflow_templates;
DROP POLICY IF EXISTS "Admins can select templates" ON public.n8n_workflow_templates;
DROP POLICY IF EXISTS "Admins can manage templates" ON public.n8n_workflow_templates;
DROP POLICY IF EXISTS "Templates are admin-only" ON public.n8n_workflow_templates;
DROP POLICY IF EXISTS "Service role full access" ON public.n8n_workflow_templates;

-- 5. Create admin-only INSERT policy
CREATE POLICY "Admins can insert templates"
ON public.n8n_workflow_templates
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());

-- 6. Create admin-only SELECT policy
CREATE POLICY "Admins can select templates"
ON public.n8n_workflow_templates
FOR SELECT
TO authenticated
USING (public.is_admin());

-- 7. No UPDATE or DELETE policies (operations blocked by trigger anyway)
-- This ensures even if someone bypasses RLS, the trigger blocks modifications

-- 8. Add unique constraint on file_hash if not exists (for deduplication)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'n8n_workflow_templates_file_hash_unique'
  ) THEN
    ALTER TABLE public.n8n_workflow_templates 
    ADD CONSTRAINT n8n_workflow_templates_file_hash_unique UNIQUE (file_hash);
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 9. Create index on file_hash for fast duplicate detection
CREATE INDEX IF NOT EXISTS idx_templates_file_hash ON public.n8n_workflow_templates(file_hash);

-- 10. Create index on slug for lookups
CREATE INDEX IF NOT EXISTS idx_templates_slug ON public.n8n_workflow_templates(slug);

-- 11. Create index on automation_agent_id for joins
CREATE INDEX IF NOT EXISTS idx_templates_agent_id ON public.n8n_workflow_templates(automation_agent_id);