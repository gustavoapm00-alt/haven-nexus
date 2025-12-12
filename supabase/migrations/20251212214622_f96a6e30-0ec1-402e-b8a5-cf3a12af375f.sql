-- Create orgs table
CREATE TABLE public.orgs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create org_members table
CREATE TABLE public.org_members (
  org_id UUID NOT NULL REFERENCES public.orgs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'member')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (org_id, user_id)
);

-- Create relevance_agents table
CREATE TABLE public.relevance_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.orgs(id) ON DELETE CASCADE,
  agent_key TEXT NOT NULL,
  name TEXT NOT NULL,
  trigger_url TEXT NOT NULL,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  outbound_secret TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(org_id, agent_key)
);

-- Create agent_runs table
CREATE TABLE public.agent_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.orgs(id) ON DELETE CASCADE,
  relevance_agent_id UUID NOT NULL REFERENCES public.relevance_agents(id) ON DELETE RESTRICT,
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'sent', 'running', 'succeeded', 'failed')),
  attempt_count INT NOT NULL DEFAULT 0,
  idempotency_key TEXT,
  input_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  output_json JSONB,
  error TEXT,
  relevance_trace_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(org_id, idempotency_key)
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Add triggers for updated_at
CREATE TRIGGER update_relevance_agents_updated_at
  BEFORE UPDATE ON public.relevance_agents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_agent_runs_updated_at
  BEFORE UPDATE ON public.agent_runs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Helper function to check org membership
CREATE OR REPLACE FUNCTION public.is_org_member(_user_id UUID, _org_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.org_members
    WHERE user_id = _user_id AND org_id = _org_id
  )
$$;

-- Enable RLS on all tables
ALTER TABLE public.orgs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.org_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.relevance_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_runs ENABLE ROW LEVEL SECURITY;

-- RLS policies for orgs
CREATE POLICY "Users can view orgs they are members of"
  ON public.orgs FOR SELECT
  USING (public.is_org_member(auth.uid(), id));

CREATE POLICY "Users can create orgs"
  ON public.orgs FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Owners can update their orgs"
  ON public.orgs FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.org_members
    WHERE org_id = id AND user_id = auth.uid() AND role = 'owner'
  ));

-- RLS policies for org_members
CREATE POLICY "Users can view members of their orgs"
  ON public.org_members FOR SELECT
  USING (public.is_org_member(auth.uid(), org_id));

CREATE POLICY "Owners/admins can add members"
  ON public.org_members FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.org_members
      WHERE org_id = org_members.org_id 
      AND user_id = auth.uid() 
      AND role IN ('owner', 'admin')
    )
    OR NOT EXISTS (SELECT 1 FROM public.org_members WHERE org_id = org_members.org_id)
  );

CREATE POLICY "Owners can update members"
  ON public.org_members FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.org_members om
    WHERE om.org_id = org_members.org_id AND om.user_id = auth.uid() AND om.role = 'owner'
  ));

CREATE POLICY "Owners can delete members"
  ON public.org_members FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.org_members om
    WHERE om.org_id = org_members.org_id AND om.user_id = auth.uid() AND om.role = 'owner'
  ));

-- RLS policies for relevance_agents
CREATE POLICY "Org members can view agents"
  ON public.relevance_agents FOR SELECT
  USING (public.is_org_member(auth.uid(), org_id));

CREATE POLICY "Org members can create agents"
  ON public.relevance_agents FOR INSERT
  WITH CHECK (public.is_org_member(auth.uid(), org_id));

CREATE POLICY "Org members can update agents"
  ON public.relevance_agents FOR UPDATE
  USING (public.is_org_member(auth.uid(), org_id));

CREATE POLICY "Org admins/owners can delete agents"
  ON public.relevance_agents FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.org_members
    WHERE org_id = relevance_agents.org_id 
    AND user_id = auth.uid() 
    AND role IN ('owner', 'admin')
  ));

-- RLS policies for agent_runs
CREATE POLICY "Org members can view runs"
  ON public.agent_runs FOR SELECT
  USING (public.is_org_member(auth.uid(), org_id));

CREATE POLICY "Org members can create runs"
  ON public.agent_runs FOR INSERT
  WITH CHECK (public.is_org_member(auth.uid(), org_id));

CREATE POLICY "Service role can update runs"
  ON public.agent_runs FOR UPDATE
  USING (true);