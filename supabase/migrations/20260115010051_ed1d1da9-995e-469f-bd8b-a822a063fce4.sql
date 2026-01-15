
-- Make relevance_agent_id nullable since we're using agent_key now
ALTER TABLE public.agent_runs 
ALTER COLUMN relevance_agent_id DROP NOT NULL;
