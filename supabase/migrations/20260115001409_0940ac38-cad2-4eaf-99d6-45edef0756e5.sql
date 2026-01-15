-- ============================================
-- CLIENT PORTAL EXPANSION: Database Schema
-- ============================================

-- 1. Client Billing table (maps user to Stripe customer + tracks subscription state)
CREATE TABLE public.client_billing (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT,
  current_price_id TEXT,
  current_product_id TEXT,
  status TEXT DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'past_due', 'canceled', 'trialing')),
  subscription_id TEXT,
  subscription_end TIMESTAMP WITH TIME ZONE,
  email_notifications_enabled BOOLEAN DEFAULT true,
  renewal_reminders_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- RLS: Users can read their own row
ALTER TABLE public.client_billing ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own billing" 
  ON public.client_billing FOR SELECT 
  USING (auth.uid() = user_id);

-- No INSERT/UPDATE from client - only edge functions with service role

-- 2. Client Usage Events table (tracks downloads, logins, etc.)
CREATE TABLE public.client_usage_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('download', 'install', 'login', 'run', 'view', 'other')),
  item_type TEXT CHECK (item_type IN ('agent', 'bundle', 'workflow', NULL)),
  item_id UUID,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Index for efficient querying
CREATE INDEX idx_usage_events_user_date ON public.client_usage_events(user_id, created_at DESC);
CREATE INDEX idx_usage_events_type ON public.client_usage_events(event_type);

-- RLS: Users can read their own events
ALTER TABLE public.client_usage_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own usage events" 
  ON public.client_usage_events FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own login events" 
  ON public.client_usage_events FOR INSERT 
  WITH CHECK (auth.uid() = user_id AND event_type = 'login');

-- 3. Client Notifications table
CREATE TABLE public.client_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('sub_active', 'payment_failed', 'canceled', 'renewal_soon', 'welcome', 'generic')),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  severity TEXT DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'critical', 'success')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Index for efficient querying
CREATE INDEX idx_notifications_user_unread ON public.client_notifications(user_id, read, created_at DESC);

-- RLS: Users can read and update their own notifications
ALTER TABLE public.client_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications" 
  ON public.client_notifications FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can mark their notifications as read" 
  ON public.client_notifications FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 4. Trigger to update updated_at on client_billing
CREATE OR REPLACE FUNCTION public.update_client_billing_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_client_billing_timestamp
  BEFORE UPDATE ON public.client_billing
  FOR EACH ROW
  EXECUTE FUNCTION public.update_client_billing_updated_at();

-- 5. Function to get usage analytics rollup
CREATE OR REPLACE FUNCTION public.get_usage_analytics(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
  lifetime_stats JSONB;
  last_30d_stats JSONB;
  daily_series JSONB;
  last_activity TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Lifetime totals
  SELECT jsonb_build_object(
    'downloads', COALESCE(SUM(CASE WHEN event_type = 'download' THEN 1 ELSE 0 END), 0),
    'installs', COALESCE(SUM(CASE WHEN event_type = 'install' THEN 1 ELSE 0 END), 0),
    'runs', COALESCE(SUM(CASE WHEN event_type = 'run' THEN 1 ELSE 0 END), 0),
    'logins', COALESCE(SUM(CASE WHEN event_type = 'login' THEN 1 ELSE 0 END), 0)
  )
  INTO lifetime_stats
  FROM public.client_usage_events
  WHERE user_id = p_user_id;

  -- Last 30 days totals
  SELECT jsonb_build_object(
    'downloads', COALESCE(SUM(CASE WHEN event_type = 'download' THEN 1 ELSE 0 END), 0),
    'installs', COALESCE(SUM(CASE WHEN event_type = 'install' THEN 1 ELSE 0 END), 0),
    'runs', COALESCE(SUM(CASE WHEN event_type = 'run' THEN 1 ELSE 0 END), 0),
    'logins', COALESCE(SUM(CASE WHEN event_type = 'login' THEN 1 ELSE 0 END), 0)
  )
  INTO last_30d_stats
  FROM public.client_usage_events
  WHERE user_id = p_user_id
    AND created_at >= (now() - interval '30 days');

  -- Daily series for last 30 days
  SELECT COALESCE(jsonb_agg(daily_data ORDER BY date), '[]'::jsonb)
  INTO daily_series
  FROM (
    SELECT 
      d::date as date,
      COALESCE(SUM(CASE WHEN e.event_type = 'download' THEN 1 ELSE 0 END), 0) as downloads,
      COALESCE(SUM(CASE WHEN e.event_type = 'install' THEN 1 ELSE 0 END), 0) as installs,
      COALESCE(SUM(CASE WHEN e.event_type = 'run' THEN 1 ELSE 0 END), 0) as runs
    FROM generate_series(
      (now() - interval '29 days')::date, 
      now()::date, 
      '1 day'::interval
    ) d
    LEFT JOIN public.client_usage_events e 
      ON e.user_id = p_user_id 
      AND e.created_at::date = d::date
    GROUP BY d::date
  ) daily_data;

  -- Last activity
  SELECT MAX(created_at) INTO last_activity
  FROM public.client_usage_events
  WHERE user_id = p_user_id;

  result := jsonb_build_object(
    'lifetime', lifetime_stats,
    'last30d', last_30d_stats,
    'daily_series', daily_series,
    'last_activity_at', last_activity
  );

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;