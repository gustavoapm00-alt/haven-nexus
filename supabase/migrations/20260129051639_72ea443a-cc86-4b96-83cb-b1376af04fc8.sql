-- Create admin_notifications table
CREATE TABLE public.admin_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  type text NOT NULL,
  title text NOT NULL,
  body text NOT NULL,
  severity text NOT NULL DEFAULT 'info',
  metadata jsonb DEFAULT '{}'::jsonb,
  read boolean NOT NULL DEFAULT false
);

-- Enable RLS
ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;

-- RLS policies: Only admins can SELECT
CREATE POLICY "Admins can view notifications"
  ON public.admin_notifications
  FOR SELECT
  USING (is_admin());

-- Only admins can UPDATE (mark as read)
CREATE POLICY "Admins can update notifications"
  ON public.admin_notifications
  FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

-- Service role can INSERT (edge functions)
CREATE POLICY "Service role can insert notifications"
  ON public.admin_notifications
  FOR INSERT
  WITH CHECK (true);

-- Enable realtime for instant updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.admin_notifications;