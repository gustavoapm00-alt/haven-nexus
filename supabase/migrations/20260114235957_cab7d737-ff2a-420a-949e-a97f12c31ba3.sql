-- Add missing columns to profiles table for client portal
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS company_name text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS timezone text DEFAULT 'America/New_York';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS goals text[] DEFAULT '{}';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS primary_goal text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS onboarding_complete boolean DEFAULT false;

-- Add unique constraint on client_integrations (user_id, provider) if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'client_integrations_user_provider_unique'
  ) THEN
    ALTER TABLE public.client_integrations 
    ADD CONSTRAINT client_integrations_user_provider_unique UNIQUE (user_id, provider);
  END IF;
END $$;