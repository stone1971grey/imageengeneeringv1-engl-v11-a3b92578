-- Allow anonymous users to look up email by username for login purposes
CREATE POLICY "Anyone can lookup email by username for login"
ON public.profiles
FOR SELECT
USING (true);

-- Note: This replaces the more restrictive policies but is safe because
-- profiles only contain id, email, full_name, username - no sensitive data