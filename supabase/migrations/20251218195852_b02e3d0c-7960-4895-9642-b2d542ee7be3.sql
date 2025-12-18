-- Add username field to profiles table for login
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS username text UNIQUE;

-- Create index for faster username lookups
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);

-- Add comment for clarity
COMMENT ON COLUMN public.profiles.username IS 'Login username for authentication (can be different from email)';