-- Fix critical RLS security issue on diagnoses table
-- The current policy "Public can view their own diagnosis by audit_id" uses USING(true) which exposes ALL diagnoses

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Public can view their own diagnosis by audit_id" ON public.diagnoses;

-- Since audit results are fetched via edge function (service role), we don't need public SELECT access
-- Admins can still manage diagnoses via the existing "Admins can manage diagnoses" policy

-- Add explicit INSERT policy for edge functions (service role bypasses RLS, but good for clarity)
-- Edge functions already use service role key which bypasses RLS, so no additional policy needed