
-- =====================================================
-- SECURITY HARDENING MIGRATION
-- Haven Systems - Public Marketing Site
-- =====================================================

-- =====================================================
-- 1. FIX contact_submissions TABLE POLICIES
-- Remove conflicting policies and create clean ones
-- =====================================================

-- Drop all existing policies on contact_submissions
DROP POLICY IF EXISTS "Admins can delete contact submissions" ON public.contact_submissions;
DROP POLICY IF EXISTS "Admins can view contact submissions" ON public.contact_submissions;
DROP POLICY IF EXISTS "Allow insert for contact submissions" ON public.contact_submissions;
DROP POLICY IF EXISTS "Deny delete for contact submissions" ON public.contact_submissions;
DROP POLICY IF EXISTS "Deny select for contact submissions" ON public.contact_submissions;
DROP POLICY IF EXISTS "Deny update for contact submissions" ON public.contact_submissions;

-- Create clean policies for contact_submissions
-- Anonymous users can INSERT only (for public contact form)
CREATE POLICY "Public can submit contact forms"
ON public.contact_submissions
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Only admins can SELECT (view submissions)
CREATE POLICY "Only admins can view contact submissions"
ON public.contact_submissions
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Only admins can DELETE
CREATE POLICY "Only admins can delete contact submissions"
ON public.contact_submissions
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- No UPDATE allowed for anyone (submissions are immutable)
-- No policy = no access for UPDATE

-- =====================================================
-- 2. FIX email_signups TABLE POLICIES
-- Remove conflicting policies and create clean ones
-- =====================================================

-- Drop all existing policies on email_signups
DROP POLICY IF EXISTS "Admins can delete email signups" ON public.email_signups;
DROP POLICY IF EXISTS "Admins can view email signups" ON public.email_signups;
DROP POLICY IF EXISTS "Allow insert for email signups" ON public.email_signups;
DROP POLICY IF EXISTS "Deny delete for email signups" ON public.email_signups;
DROP POLICY IF EXISTS "Deny select for email signups" ON public.email_signups;
DROP POLICY IF EXISTS "Deny update for email signups" ON public.email_signups;

-- Create clean policies for email_signups
-- Anonymous users can INSERT only (for newsletter signup)
CREATE POLICY "Public can signup for emails"
ON public.email_signups
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Only admins can SELECT (view signups)
CREATE POLICY "Only admins can view email signups"
ON public.email_signups
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Only admins can DELETE
CREATE POLICY "Only admins can delete email signups"
ON public.email_signups
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- No UPDATE allowed for anyone (signups are immutable)
-- No policy = no access for UPDATE

-- =====================================================
-- 3. LOCK DOWN user_roles TABLE
-- Prevent unauthorized role assignments
-- =====================================================

-- Drop existing policy
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;

-- Users can view their own roles (needed for admin check in app)
CREATE POLICY "Users can view own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Only existing admins can insert new roles
CREATE POLICY "Only admins can assign roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Only existing admins can update roles
CREATE POLICY "Only admins can update roles"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Only existing admins can delete roles
CREATE POLICY "Only admins can delete roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- =====================================================
-- 4. HARDEN profiles TABLE
-- Ensure no anonymous access
-- =====================================================

-- Drop and recreate profile policies to ensure no anon access
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

-- Only authenticated users can view their own profile
CREATE POLICY "Authenticated users can view own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Only authenticated users can insert their own profile
CREATE POLICY "Authenticated users can insert own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Only authenticated users can update their own profile
CREATE POLICY "Authenticated users can update own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id);

-- No DELETE allowed for profiles
-- No policy = no access for DELETE
