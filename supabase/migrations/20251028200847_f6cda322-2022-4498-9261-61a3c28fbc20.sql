-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Only admins can insert roles (we'll add initial admin manually)
CREATE POLICY "Admins can manage roles"
ON public.user_roles
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Update download_requests SELECT policy to allow admins to see all records
DROP POLICY IF EXISTS "Users can view their own download requests" ON public.download_requests;

CREATE POLICY "Users can view their own download requests or admins can view all"
ON public.download_requests
FOR SELECT
USING (
  email = (auth.jwt() ->> 'email'::text) 
  OR public.has_role(auth.uid(), 'admin')
);

-- Update contact_submissions SELECT policy to allow admins to see all records
DROP POLICY IF EXISTS "Users can view their own contact submissions" ON public.contact_submissions;

CREATE POLICY "Users can view their own contact submissions or admins can view all"
ON public.contact_submissions
FOR SELECT
USING (
  email = (auth.jwt() ->> 'email'::text)
  OR public.has_role(auth.uid(), 'admin')
);

-- Update event_registrations SELECT policy to allow admins to see all records
DROP POLICY IF EXISTS "Users can view their own registrations" ON public.event_registrations;

CREATE POLICY "Users can view their own registrations or admins can view all"
ON public.event_registrations
FOR SELECT
USING (
  email = (auth.jwt() ->> 'email'::text)
  OR public.has_role(auth.uid(), 'admin')
);