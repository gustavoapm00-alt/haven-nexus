-- Update status constraint to allow both 'completed' and 'paid' for backwards compatibility
ALTER TABLE public.purchases DROP CONSTRAINT IF EXISTS purchases_status_check;
ALTER TABLE public.purchases ADD CONSTRAINT purchases_status_check 
  CHECK (status IN ('pending', 'completed', 'paid', 'failed'));