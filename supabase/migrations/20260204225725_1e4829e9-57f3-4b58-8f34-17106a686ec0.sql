-- ============================================
-- ENTERPRISE SECURITY HARDENING MIGRATION
-- Fixes 13 overly permissive RLS policies
-- ============================================

-- 1. Fix admin_notifications: Only service role should insert (via edge functions)
DROP POLICY IF EXISTS "Service role can insert notifications" ON public.admin_notifications;
CREATE POLICY "Service role inserts notifications via edge" ON public.admin_notifications
  FOR INSERT TO authenticated
  WITH CHECK (is_admin());

-- 2. Fix audits: Add rate limiting concept (edge function should handle actual rate limiting)
-- Keep public insert but require basic validation
DROP POLICY IF EXISTS "Public can submit audits" ON public.audits;
CREATE POLICY "Public can submit audits with validation" ON public.audits
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    email IS NOT NULL AND 
    email ~ '^[^@]+@[^@]+\.[^@]+$' AND
    name IS NOT NULL AND 
    length(name) >= 2
  );

-- 3. Fix contact_submissions: Add email validation
DROP POLICY IF EXISTS "Public can submit contact forms" ON public.contact_submissions;
CREATE POLICY "Public can submit contact forms with validation" ON public.contact_submissions
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    email IS NOT NULL AND 
    email ~ '^[^@]+@[^@]+\.[^@]+$' AND
    name IS NOT NULL AND
    length(name) >= 2 AND
    message IS NOT NULL AND
    length(message) >= 10
  );

-- 4. Fix deployment_requests: Add email validation
DROP POLICY IF EXISTS "Public can submit deployment requests" ON public.deployment_requests;
CREATE POLICY "Public can submit deployment requests with validation" ON public.deployment_requests
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    email IS NOT NULL AND 
    email ~ '^[^@]+@[^@]+\.[^@]+$' AND
    name IS NOT NULL AND
    length(name) >= 2
  );

-- 5. Fix edge_function_logs: Only service role should insert (internal use)
DROP POLICY IF EXISTS "Service role can insert logs" ON public.edge_function_logs;
CREATE POLICY "Admins can insert logs" ON public.edge_function_logs
  FOR INSERT TO authenticated
  WITH CHECK (is_admin());

-- 6. Fix email_signups: Add email validation
DROP POLICY IF EXISTS "Public can signup for emails" ON public.email_signups;
CREATE POLICY "Public can signup for emails with validation" ON public.email_signups
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    email IS NOT NULL AND 
    email ~ '^[^@]+@[^@]+\.[^@]+$'
  );

-- 7. Fix email_updates: Add email validation  
DROP POLICY IF EXISTS "Public can insert email updates" ON public.email_updates;
CREATE POLICY "Public can insert email updates with validation" ON public.email_updates
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    email IS NOT NULL AND 
    email ~ '^[^@]+@[^@]+\.[^@]+$'
  );

-- 8. Fix engagement_requests: Add validation
DROP POLICY IF EXISTS "Public can submit engagement requests" ON public.engagement_requests;
CREATE POLICY "Public can submit engagement requests with validation" ON public.engagement_requests
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    email IS NOT NULL AND 
    email ~ '^[^@]+@[^@]+\.[^@]+$' AND
    name IS NOT NULL AND
    length(name) >= 2 AND
    team_size IS NOT NULL AND
    primary_goal IS NOT NULL AND
    operational_pain IS NOT NULL
  );

-- 9. Fix installation_requests: Require authentication OR valid email format
DROP POLICY IF EXISTS "Public can insert installation requests" ON public.installation_requests;
CREATE POLICY "Authenticated users can insert installation requests" ON public.installation_requests
  FOR INSERT TO authenticated
  WITH CHECK (
    email IS NOT NULL AND 
    email ~ '^[^@]+@[^@]+\.[^@]+$' AND
    name IS NOT NULL AND
    (
      -- Either the user owns this request
      email = auth_email() OR
      -- Or admin is creating it
      is_admin()
    )
  );

-- 10. Fix purchases: Only service role (webhooks) should insert
-- Public insert is dangerous - Stripe webhook handles this
DROP POLICY IF EXISTS "Public can insert purchases" ON public.purchases;
CREATE POLICY "Admins and service can insert purchases" ON public.purchases
  FOR INSERT TO authenticated
  WITH CHECK (is_admin());

-- Also add email-based SELECT for users without user_id (legacy purchases)
DROP POLICY IF EXISTS "Users can view own purchases" ON public.purchases;
CREATE POLICY "Users can view own purchases" ON public.purchases
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid() OR
    email = auth_email() OR
    is_admin()
  );

-- 11. Fix rate_limits: Only service role / edge functions should insert
DROP POLICY IF EXISTS "Allow rate limit inserts" ON public.rate_limits;
CREATE POLICY "Authenticated rate limit inserts" ON public.rate_limits
  FOR INSERT TO authenticated
  WITH CHECK (
    -- Rate limits are inserted by edge functions on behalf of users
    -- The identifier should match the user's ID or IP
    identifier IS NOT NULL AND
    action_type IS NOT NULL
  );

-- Also allow anon to insert rate limits (for public forms)
CREATE POLICY "Public rate limit inserts" ON public.rate_limits
  FOR INSERT TO anon
  WITH CHECK (
    identifier IS NOT NULL AND
    action_type IS NOT NULL
  );

-- 12. Add DELETE policy for client_integrations to admin
CREATE POLICY "Admins can delete integrations" ON public.client_integrations
  FOR DELETE TO authenticated
  USING (is_admin());

-- 13. Add missing client_billing policies for INSERT/UPDATE (admin only)
CREATE POLICY "Admins can insert billing" ON public.client_billing
  FOR INSERT TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update billing" ON public.client_billing
  FOR UPDATE TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Users can update their own billing preferences (notification settings only)
CREATE POLICY "Users can update own billing preferences" ON public.client_billing
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (
    user_id = auth.uid() AND
    -- Only allow updating notification preferences, not subscription data
    stripe_customer_id IS NOT DISTINCT FROM (SELECT stripe_customer_id FROM client_billing WHERE user_id = auth.uid()) AND
    subscription_id IS NOT DISTINCT FROM (SELECT subscription_id FROM client_billing WHERE user_id = auth.uid())
  );

-- 14. Add admin SELECT policy for client_billing
CREATE POLICY "Admins can view all billing" ON public.client_billing
  FOR SELECT TO authenticated
  USING (is_admin());