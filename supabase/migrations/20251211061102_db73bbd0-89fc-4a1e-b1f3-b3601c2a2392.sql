-- Prevent any deletion of profiles (profiles should not be deleted)
CREATE POLICY "Profiles cannot be deleted"
ON public.profiles
FOR DELETE
USING (false);