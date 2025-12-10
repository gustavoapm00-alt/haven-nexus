-- Drop existing policies and recreate with complete coverage
DROP POLICY IF EXISTS "Allow public form submissions" ON public.contact_submissions;
DROP POLICY IF EXISTS "Allow public email signups" ON public.email_signups;

-- contact_submissions: Allow INSERT only
CREATE POLICY "Allow insert for contact submissions"
ON public.contact_submissions
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- contact_submissions: Explicitly deny SELECT
CREATE POLICY "Deny select for contact submissions"
ON public.contact_submissions
FOR SELECT
TO anon, authenticated
USING (false);

-- contact_submissions: Explicitly deny UPDATE
CREATE POLICY "Deny update for contact submissions"
ON public.contact_submissions
FOR UPDATE
TO anon, authenticated
USING (false);

-- contact_submissions: Explicitly deny DELETE
CREATE POLICY "Deny delete for contact submissions"
ON public.contact_submissions
FOR DELETE
TO anon, authenticated
USING (false);

-- email_signups: Allow INSERT only
CREATE POLICY "Allow insert for email signups"
ON public.email_signups
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- email_signups: Explicitly deny SELECT
CREATE POLICY "Deny select for email signups"
ON public.email_signups
FOR SELECT
TO anon, authenticated
USING (false);

-- email_signups: Explicitly deny UPDATE
CREATE POLICY "Deny update for email signups"
ON public.email_signups
FOR UPDATE
TO anon, authenticated
USING (false);

-- email_signups: Explicitly deny DELETE
CREATE POLICY "Deny delete for email signups"
ON public.email_signups
FOR DELETE
TO anon, authenticated
USING (false);