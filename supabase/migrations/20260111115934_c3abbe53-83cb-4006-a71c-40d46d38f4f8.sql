-- Fix purchases RLS policy to properly restrict access to user's own purchases
-- Drop the overly permissive SELECT policy
DROP POLICY IF EXISTS "Users can view own purchases" ON public.purchases;

-- Create a proper RLS policy that checks email OR user_id against the authenticated user
CREATE POLICY "Users can view own purchases" 
ON public.purchases 
FOR SELECT 
USING (
  email = (SELECT email FROM auth.users WHERE id = auth.uid())
  OR user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role = 'admin'
  )
);