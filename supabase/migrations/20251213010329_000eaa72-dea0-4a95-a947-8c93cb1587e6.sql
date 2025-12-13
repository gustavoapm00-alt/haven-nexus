-- Add UPDATE deny policies to prevent data tampering on form tables

-- Deny UPDATE on contact_submissions
CREATE POLICY "Contact submissions cannot be updated"
ON public.contact_submissions
FOR UPDATE
USING (false);

-- Deny UPDATE on email_signups  
CREATE POLICY "Email signups cannot be updated"
ON public.email_signups
FOR UPDATE
USING (false);

-- Deny UPDATE on agent_runs (only edge functions with service role should update)
CREATE POLICY "Agent runs cannot be updated by users"
ON public.agent_runs
FOR UPDATE
USING (false);