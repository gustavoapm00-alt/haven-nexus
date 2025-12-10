-- Drop existing policies and recreate properly
DROP POLICY IF EXISTS "Anyone can submit contact form" ON public.contact_submissions;
DROP POLICY IF EXISTS "Anyone can submit email signup" ON public.email_signups;

-- Recreate INSERT policies as PERMISSIVE (allowing public form submissions)
CREATE POLICY "Allow public form submissions"
ON public.contact_submissions
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Allow public email signups"
ON public.email_signups
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- No SELECT, UPDATE, or DELETE policies = denied by default with RLS enabled