-- A) Add WITH CHECK to org_members UPDATE policy
DROP POLICY IF EXISTS "Owners can update members" ON public.org_members;

CREATE POLICY "Owners can update members"
  ON public.org_members FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.org_members om
    WHERE om.org_id = org_members.org_id AND om.user_id = auth.uid() AND om.role = 'owner'
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.org_members om
    WHERE om.org_id = org_members.org_id AND om.user_id = auth.uid() AND om.role = 'owner'
  ));

-- B) Auto-add org creator as owner (prevents ghost orgs)
CREATE OR REPLACE FUNCTION public.add_org_creator_as_owner()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.org_members (org_id, user_id, role)
  VALUES (NEW.id, auth.uid(), 'owner')
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_add_org_creator ON public.orgs;

CREATE TRIGGER trg_add_org_creator
AFTER INSERT ON public.orgs
FOR EACH ROW
EXECUTE FUNCTION public.add_org_creator_as_owner();