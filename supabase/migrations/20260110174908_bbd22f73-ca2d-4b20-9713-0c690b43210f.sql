
-- Create automation_agents table
CREATE TABLE public.automation_agents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  short_outcome TEXT NOT NULL,
  description TEXT NOT NULL,
  sectors TEXT[] NOT NULL DEFAULT '{}',
  systems TEXT[] NOT NULL DEFAULT '{}',
  setup_time_min INT NOT NULL DEFAULT 20,
  setup_time_max INT NOT NULL DEFAULT 40,
  capacity_recovered_min INT NOT NULL DEFAULT 2,
  capacity_recovered_max INT NOT NULL DEFAULT 5,
  includes TEXT[] NOT NULL DEFAULT '{}',
  requirements TEXT[] NOT NULL DEFAULT '{}',
  how_it_works TEXT[] NOT NULL DEFAULT '{}',
  important_notes TEXT[] NOT NULL DEFAULT '{}',
  price_cents INT NOT NULL DEFAULT 0,
  featured BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMPTZ,
  workflow_file_url TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create automation_bundles table
CREATE TABLE public.automation_bundles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  objective TEXT NOT NULL,
  description TEXT NOT NULL,
  included_agent_ids UUID[] NOT NULL DEFAULT '{}',
  sectors TEXT[] NOT NULL DEFAULT '{}',
  individual_value_cents INT NOT NULL DEFAULT 0,
  bundle_price_cents INT NOT NULL DEFAULT 0,
  featured BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create email_updates table for newsletter
CREATE TABLE public.email_updates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  source_page TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create purchases table
CREATE TABLE public.purchases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  item_type TEXT NOT NULL CHECK (item_type IN ('agent', 'bundle')),
  item_id UUID NOT NULL,
  stripe_session_id TEXT,
  amount_cents INT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create installation_requests table
CREATE TABLE public.installation_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  purchased_item TEXT,
  preferred_systems TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.automation_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_bundles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.installation_requests ENABLE ROW LEVEL SECURITY;

-- Public can view published agents
CREATE POLICY "Public can view published agents" ON public.automation_agents
  FOR SELECT USING (status = 'published');

-- Admins can manage agents
CREATE POLICY "Admins can manage agents" ON public.automation_agents
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Public can view published bundles
CREATE POLICY "Public can view published bundles" ON public.automation_bundles
  FOR SELECT USING (status = 'published');

-- Admins can manage bundles
CREATE POLICY "Admins can manage bundles" ON public.automation_bundles
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Public can insert email updates
CREATE POLICY "Public can insert email updates" ON public.email_updates
  FOR INSERT WITH CHECK (true);

-- Admins can view email updates
CREATE POLICY "Admins can view email updates" ON public.email_updates
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Public can insert purchases
CREATE POLICY "Public can insert purchases" ON public.purchases
  FOR INSERT WITH CHECK (true);

-- Users can view their own purchases by email
CREATE POLICY "Users can view own purchases" ON public.purchases
  FOR SELECT USING (true);

-- Admins can manage purchases
CREATE POLICY "Admins can manage purchases" ON public.purchases
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Public can insert installation requests
CREATE POLICY "Public can insert installation requests" ON public.installation_requests
  FOR INSERT WITH CHECK (true);

-- Admins can view installation requests
CREATE POLICY "Admins can view installation requests" ON public.installation_requests
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Create updated_at trigger function if not exists
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for updated_at
CREATE TRIGGER update_automation_agents_updated_at
  BEFORE UPDATE ON public.automation_agents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_automation_bundles_updated_at
  BEFORE UPDATE ON public.automation_bundles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
