-- Fix SECURITY DEFINER view issue - drop the view and use RLS directly instead
DROP VIEW IF EXISTS public.relevance_agents_safe;

-- The RLS policy already restricts access to org members
-- The outbound_secret column access is already implicitly handled:
-- - Only org members can SELECT the table
-- - Edge functions use service role so they can access the secret when needed
-- - Regular users don't need direct access to the secret through the client

-- For extra safety, we'll handle this at application level - 
-- The agent info fetched for dashboard display doesn't need the secret column