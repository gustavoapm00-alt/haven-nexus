-- Fix 1: Remove email column from profiles table (emails should only be in auth.users)
-- First, ensure no active queries depend on profiles.email

-- Drop the email column from profiles to prevent enumeration attacks
-- The email is already available from auth.users when needed
ALTER TABLE public.profiles DROP COLUMN IF EXISTS email;

-- Fix 2: Strengthen purchases RLS to rely solely on user_id instead of email
-- This prevents attacks where knowing an email could expose purchase history

-- Drop the existing overly permissive policy
DROP POLICY IF EXISTS "Users can view own purchases" ON public.purchases;

-- Create a more secure policy that only uses user_id
CREATE POLICY "Users can view own purchases"
ON public.purchases
FOR SELECT
USING (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'::app_role
  )
);

-- Add a policy to allow users to update their own purchases (for download tracking)
DROP POLICY IF EXISTS "Users can update own purchases" ON public.purchases;

CREATE POLICY "Users can update own purchases"
ON public.purchases
FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());