
-- Nexus operational mode persistence
CREATE TABLE public.nexus_config (
  id TEXT PRIMARY KEY DEFAULT 'singleton',
  operational_mode TEXT NOT NULL DEFAULT 'STEALTH' CHECK (operational_mode IN ('STEALTH', 'SENTINEL', 'WAR_ROOM')),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Seed singleton row
INSERT INTO public.nexus_config (id, operational_mode) VALUES ('singleton', 'STEALTH');

-- Enable RLS
ALTER TABLE public.nexus_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nexus_config FORCE ROW LEVEL SECURITY;

-- Only admins can read/update
CREATE POLICY "Admins can read nexus config"
  ON public.nexus_config FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins can update nexus config"
  ON public.nexus_config FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Enable realtime for live sync across admin sessions
ALTER PUBLICATION supabase_realtime ADD TABLE public.nexus_config;
