
-- sovereign_bridge: THS Human Signature verification state
CREATE TABLE public.sovereign_bridge (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  is_human_verified boolean NOT NULL DEFAULT false,
  verification_source text DEFAULT 'THS_LAYER',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.sovereign_bridge ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sovereign_bridge FORCE ROW LEVEL SECURITY;

-- Users can read their own verification state
CREATE POLICY "Users can view own verification"
  ON public.sovereign_bridge FOR SELECT
  USING (user_id = auth.uid());

-- Admins can manage all records
CREATE POLICY "Admins can manage sovereign_bridge"
  ON public.sovereign_bridge FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- Users can insert their own row (for initial creation)
CREATE POLICY "Users can insert own verification"
  ON public.sovereign_bridge FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can update their own row
CREATE POLICY "Users can update own verification"
  ON public.sovereign_bridge FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Auto-update updated_at
CREATE TRIGGER update_sovereign_bridge_updated_at
  BEFORE UPDATE ON public.sovereign_bridge
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
