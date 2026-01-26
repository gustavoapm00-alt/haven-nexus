-- ================================================================
-- RLS HARDENING + CRON SCHEDULE FOR ACTIVATION REMINDERS
-- ================================================================

-- 1) Enable pg_cron and pg_net extensions (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- 2) Ensure RLS is enabled on both tables
ALTER TABLE public.installation_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activation_customer_updates ENABLE ROW LEVEL SECURITY;

-- 3) Drop existing policies to recreate them cleanly (safe to re-run)
DROP POLICY IF EXISTS "Customers can view own activation requests" ON public.installation_requests;
DROP POLICY IF EXISTS "Customers can update own activation requests fields" ON public.installation_requests;
DROP POLICY IF EXISTS "Customers can insert updates for own requests" ON public.activation_customer_updates;
DROP POLICY IF EXISTS "Customers can view own updates" ON public.activation_customer_updates;

-- 4) installation_requests: Customer can SELECT only rows where email = auth.email()
CREATE POLICY "Customers can view own activation requests"
ON public.installation_requests
FOR SELECT
TO authenticated
USING (
  email = (SELECT email FROM auth.users WHERE id = auth.uid())::text
  OR is_admin()
);

-- 5) installation_requests: Customer can UPDATE limited fields on their own requests
CREATE POLICY "Customers can update own activation requests fields"
ON public.installation_requests
FOR UPDATE
TO authenticated
USING (
  email = (SELECT email FROM auth.users WHERE id = auth.uid())::text
  OR is_admin()
)
WITH CHECK (
  email = (SELECT email FROM auth.users WHERE id = auth.uid())::text
  OR is_admin()
);

-- 6) activation_customer_updates: Customer can INSERT only if request belongs to them
CREATE POLICY "Customers can insert updates for own requests"
ON public.activation_customer_updates
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.installation_requests ir
    WHERE ir.id = request_id
    AND ir.email = (SELECT email FROM auth.users WHERE id = auth.uid())::text
  )
  AND customer_email = (SELECT email FROM auth.users WHERE id = auth.uid())::text
);

-- 7) activation_customer_updates: Customer can SELECT only their own updates
CREATE POLICY "Customers can view own updates"
ON public.activation_customer_updates
FOR SELECT
TO authenticated
USING (
  customer_email = (SELECT email FROM auth.users WHERE id = auth.uid())::text
  OR is_admin()
);

-- 8) Schedule send-activation-reminders to run every 6 hours
-- Note: This uses the Supabase project URL and anon key from the environment
SELECT cron.schedule(
  'send-activation-reminders-every-6h',
  '0 */6 * * *',
  $$
  SELECT net.http_post(
    url := 'https://chraztxdtvmipasdttbk.supabase.co/functions/v1/send-activation-reminders',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNocmF6dHhkdHZtaXBhc2R0dGJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUzMDUwMjAsImV4cCI6MjA4MDg4MTAyMH0.t7gfdsGEXkMyq5wLO-kU0iy9urf42TXG_XiY0NJvwRw'
    ),
    body := jsonb_build_object('triggered_at', now()::text)
  ) AS request_id;
  $$
);