-- =============================================
-- RLS HARDENING FOR CREDENTIALS & ACCESS SYSTEM
-- =============================================

-- Drop existing policies that may be too permissive
DROP POLICY IF EXISTS "Customers can view own activation requests" ON public.installation_requests;
DROP POLICY IF EXISTS "Customers can update own activation requests fields" ON public.installation_requests;
DROP POLICY IF EXISTS "Users can view own activation requests" ON public.installation_requests;
DROP POLICY IF EXISTS "Customers can insert own updates" ON public.activation_customer_updates;
DROP POLICY IF EXISTS "Customers can insert updates for own requests" ON public.activation_customer_updates;
DROP POLICY IF EXISTS "Customers can view own updates" ON public.activation_customer_updates;

-- =============================================
-- installation_requests policies
-- =============================================

-- Customers can SELECT only their own rows (email = auth.email())
CREATE POLICY "Customer can view own installation requests"
ON public.installation_requests
FOR SELECT
USING (
  email = (SELECT email FROM auth.users WHERE id = auth.uid())
  OR is_admin()
);

-- Customers can UPDATE only their own rows (limited fields enforced by app logic)
CREATE POLICY "Customer can update own installation requests"
ON public.installation_requests
FOR UPDATE
USING (
  email = (SELECT email FROM auth.users WHERE id = auth.uid())
  OR is_admin()
)
WITH CHECK (
  email = (SELECT email FROM auth.users WHERE id = auth.uid())
  OR is_admin()
);

-- =============================================
-- activation_customer_updates policies
-- =============================================

-- Customers can INSERT only when:
-- 1) customer_email = auth.email()
-- 2) request_id belongs to them (EXISTS join)
CREATE POLICY "Customer can insert own credential updates"
ON public.activation_customer_updates
FOR INSERT
WITH CHECK (
  customer_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  AND EXISTS (
    SELECT 1 FROM public.installation_requests ir
    WHERE ir.id = request_id
    AND ir.email = (SELECT email FROM auth.users WHERE id = auth.uid())
  )
);

-- Customers can SELECT only their own updates
CREATE POLICY "Customer can view own credential updates"
ON public.activation_customer_updates
FOR SELECT
USING (
  customer_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  OR is_admin()
);

-- =============================================
-- CRON JOB: Schedule reminders every 6 hours
-- =============================================

-- Enable pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;

-- Enable pg_net for HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Grant cron usage to postgres
GRANT USAGE ON SCHEMA cron TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA cron TO postgres;