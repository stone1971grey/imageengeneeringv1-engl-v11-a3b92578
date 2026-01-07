-- Remove the insecure public policy that exposes email addresses
DROP POLICY IF EXISTS "Anyone can lookup email by username for login" ON public.profiles;

-- Add a policy that only allows users to read their own profile
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);