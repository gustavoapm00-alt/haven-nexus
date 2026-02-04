-- ============================================
-- FIX REMAINING CRITICAL RLS ISSUES
-- Ensure no public/anon SELECT access on PII tables
-- ============================================

-- Force RLS on all sensitive tables (ensures even table owners are subject to RLS)
ALTER TABLE public.audits FORCE ROW LEVEL SECURITY;
ALTER TABLE public.deployment_requests FORCE ROW LEVEL SECURITY;
ALTER TABLE public.installation_requests FORCE ROW LEVEL SECURITY;
ALTER TABLE public.activation_customer_updates FORCE ROW LEVEL SECURITY;
ALTER TABLE public.engagement_requests FORCE ROW LEVEL SECURITY;
ALTER TABLE public.purchases FORCE ROW LEVEL SECURITY;
ALTER TABLE public.client_billing FORCE ROW LEVEL SECURITY;
ALTER TABLE public.activation_credentials FORCE ROW LEVEL SECURITY;
ALTER TABLE public.integration_connections FORCE ROW LEVEL SECURITY;
ALTER TABLE public.n8n_mappings FORCE ROW LEVEL SECURITY;
ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;
ALTER TABLE public.client_integrations FORCE ROW LEVEL SECURITY;
ALTER TABLE public.client_notifications FORCE ROW LEVEL SECURITY;
ALTER TABLE public.client_usage_events FORCE ROW LEVEL SECURITY;
ALTER TABLE public.oauth_states FORCE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limits FORCE ROW LEVEL SECURITY;
ALTER TABLE public.contact_submissions FORCE ROW LEVEL SECURITY;
ALTER TABLE public.email_signups FORCE ROW LEVEL SECURITY;
ALTER TABLE public.email_updates FORCE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles FORCE ROW LEVEL SECURITY;
ALTER TABLE public.edge_function_logs FORCE ROW LEVEL SECURITY;
ALTER TABLE public.admin_notifications FORCE ROW LEVEL SECURITY;

-- Ensure the installation_requests policies are properly scoped
-- Drop any potentially permissive SELECT policies and recreate strict ones
DROP POLICY IF EXISTS "Customer can view own installation requests" ON public.installation_requests;
DROP POLICY IF EXISTS "Admins can view installation requests" ON public.installation_requests;

-- Recreate with proper role specification
CREATE POLICY "Customers view own requests" ON public.installation_requests
  FOR SELECT TO authenticated
  USING (email = auth_email());

CREATE POLICY "Admins view all requests" ON public.installation_requests
  FOR SELECT TO authenticated
  USING (is_admin());

-- Fix activation_customer_updates SELECT policy
DROP POLICY IF EXISTS "Customer can view own credential updates" ON public.activation_customer_updates;

CREATE POLICY "Customers view own updates" ON public.activation_customer_updates
  FOR SELECT TO authenticated
  USING (customer_email = auth_email());

CREATE POLICY "Admins view all updates" ON public.activation_customer_updates
  FOR SELECT TO authenticated
  USING (is_admin());

-- Ensure audits has no anon SELECT
-- Already has admin-only SELECT, but ensure role is specified
DROP POLICY IF EXISTS "Admins can view all audits" ON public.audits;
CREATE POLICY "Admins view audits" ON public.audits
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- Ensure deployment_requests has no anon SELECT  
DROP POLICY IF EXISTS "Admins can view all deployment requests" ON public.deployment_requests;
CREATE POLICY "Admins view deployment requests" ON public.deployment_requests
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- Ensure engagement_requests has no anon SELECT
DROP POLICY IF EXISTS "Admins can view engagement requests" ON public.engagement_requests;
CREATE POLICY "Admins view engagement requests" ON public.engagement_requests
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- Add explicit DENY for anon on all sensitive tables (belt and suspenders)
-- This explicitly blocks any attempt by anon to SELECT

-- For tables that need authenticated-only access, we don't need explicit deny
-- because policies only grant access - if no policy matches, access is denied
-- But we can make it explicit by ensuring TO authenticated is on all policies

-- Fix purchases - ensure only authenticated users with matching email/user_id can view
DROP POLICY IF EXISTS "Users can view own purchases" ON public.purchases;
CREATE POLICY "Users view own purchases" ON public.purchases
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid() OR
    email = auth_email() OR
    is_admin()
  );