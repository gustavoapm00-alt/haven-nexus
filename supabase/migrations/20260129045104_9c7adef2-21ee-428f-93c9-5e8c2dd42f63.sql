-- Create a helper function to get the current user's email securely
CREATE OR REPLACE FUNCTION public.auth_email()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT email FROM auth.users WHERE id = auth.uid()
$$;

-- Update RLS policies for installation_requests to use the new function
DROP POLICY IF EXISTS "Customer can view own installation requests" ON public.installation_requests;
CREATE POLICY "Customer can view own installation requests"
ON public.installation_requests
FOR SELECT
TO authenticated
USING (email = auth_email() OR is_admin());

DROP POLICY IF EXISTS "Customer can update own installation requests" ON public.installation_requests;
CREATE POLICY "Customer can update own installation requests"
ON public.installation_requests
FOR UPDATE
TO authenticated
USING (email = auth_email() OR is_admin())
WITH CHECK (email = auth_email() OR is_admin());

-- Update RLS policies for activation_customer_updates
DROP POLICY IF EXISTS "Customer can view own credential updates" ON public.activation_customer_updates;
CREATE POLICY "Customer can view own credential updates"
ON public.activation_customer_updates
FOR SELECT
TO authenticated
USING (customer_email = auth_email() OR is_admin());

DROP POLICY IF EXISTS "Customer can insert own credential updates" ON public.activation_customer_updates;
CREATE POLICY "Customer can insert own credential updates"
ON public.activation_customer_updates
FOR INSERT
TO authenticated
WITH CHECK (
  customer_email = auth_email() AND 
  EXISTS (
    SELECT 1 FROM installation_requests ir
    WHERE ir.id = activation_customer_updates.request_id
    AND ir.email = auth_email()
  )
);

-- Update RLS policies for activation_credentials
DROP POLICY IF EXISTS "Customer can view own credentials" ON public.activation_credentials;
CREATE POLICY "Customer can view own credentials"
ON public.activation_credentials
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM installation_requests ir
    WHERE ir.id = activation_credentials.request_id
    AND ir.email = auth_email()
  )
);

DROP POLICY IF EXISTS "Customer can insert own credentials" ON public.activation_credentials;
CREATE POLICY "Customer can insert own credentials"
ON public.activation_credentials
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM installation_requests ir
    WHERE ir.id = activation_credentials.request_id
    AND ir.email = auth_email()
  ) AND created_by = auth_email()
);

DROP POLICY IF EXISTS "Customer can update own credentials" ON public.activation_credentials;
CREATE POLICY "Customer can update own credentials"
ON public.activation_credentials
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM installation_requests ir
    WHERE ir.id = activation_credentials.request_id
    AND ir.email = auth_email()
  ) AND status = 'active'
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM installation_requests ir
    WHERE ir.id = activation_credentials.request_id
    AND ir.email = auth_email()
  )
);