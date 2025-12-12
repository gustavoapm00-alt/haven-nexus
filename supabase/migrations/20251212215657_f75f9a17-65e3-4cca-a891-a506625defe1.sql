-- 1) Fix idempotency uniqueness with partial unique index
ALTER TABLE public.agent_runs
  DROP CONSTRAINT IF EXISTS agent_runs_org_id_idempotency_key_key;

CREATE UNIQUE INDEX IF NOT EXISTS agent_runs_org_id_idempotency_key_unique
ON public.agent_runs (org_id, idempotency_key)
WHERE idempotency_key IS NOT NULL;

-- 2) Remove unsafe UPDATE policy on agent_runs (service role bypasses RLS)
DROP POLICY IF EXISTS "Service role can update runs" ON public.agent_runs;

-- 3a) Harden relevance_agents update policy with WITH CHECK
DROP POLICY IF EXISTS "Org members can update agents" ON public.relevance_agents;

CREATE POLICY "Org members can update agents"
  ON public.relevance_agents FOR UPDATE
  USING (public.is_org_member(auth.uid(), org_id))
  WITH CHECK (public.is_org_member(auth.uid(), org_id));

-- 3b) Harden orgs update policy with WITH CHECK
DROP POLICY IF EXISTS "Owners can update their orgs" ON public.orgs;

CREATE POLICY "Owners can update their orgs"
  ON public.orgs FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.org_members
    WHERE org_id = orgs.id AND user_id = auth.uid() AND role = 'owner'
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.org_members
    WHERE org_id = orgs.id AND user_id = auth.uid() AND role = 'owner'
  ));