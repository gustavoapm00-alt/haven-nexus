-- Create agent_files table for versioned file tracking
CREATE TABLE IF NOT EXISTS public.agent_files (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id uuid NOT NULL REFERENCES public.automation_agents(id) ON DELETE CASCADE,
  version text NOT NULL DEFAULT 'v1',
  file_type text NOT NULL CHECK (file_type IN ('workflow', 'deployment_guide', 'requirements', 'prompt_template')),
  storage_path text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(agent_id, version, file_type)
);

-- Enable RLS
ALTER TABLE public.agent_files ENABLE ROW LEVEL SECURITY;

-- Public can view files for published agents (needed for download verification)
CREATE POLICY "Public can view agent files for published agents"
ON public.agent_files
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.automation_agents
    WHERE automation_agents.id = agent_files.agent_id
    AND automation_agents.status = 'published'
  )
);

-- Admins can manage agent files
CREATE POLICY "Admins can manage agent files"
ON public.agent_files
FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

-- Add current_version column to automation_agents if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'automation_agents' 
    AND column_name = 'current_version'
  ) THEN
    ALTER TABLE public.automation_agents ADD COLUMN current_version text DEFAULT 'v1';
  END IF;
END $$;

-- Create updated_at trigger for agent_files
CREATE TRIGGER update_agent_files_updated_at
BEFORE UPDATE ON public.agent_files
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for efficient lookups
CREATE INDEX idx_agent_files_agent_version ON public.agent_files(agent_id, version);

-- Seed agent_files with placeholder rows for existing agents
-- (links existing workflow_file_path and guide_file_path to the agent_files table)
INSERT INTO public.agent_files (agent_id, version, file_type, storage_path)
SELECT id, COALESCE(current_version, 'v1'), 'workflow', workflow_file_path
FROM public.automation_agents
WHERE workflow_file_path IS NOT NULL
ON CONFLICT (agent_id, version, file_type) DO NOTHING;

INSERT INTO public.agent_files (agent_id, version, file_type, storage_path)
SELECT id, COALESCE(current_version, 'v1'), 'deployment_guide', guide_file_path
FROM public.automation_agents
WHERE guide_file_path IS NOT NULL
ON CONFLICT (agent_id, version, file_type) DO NOTHING;