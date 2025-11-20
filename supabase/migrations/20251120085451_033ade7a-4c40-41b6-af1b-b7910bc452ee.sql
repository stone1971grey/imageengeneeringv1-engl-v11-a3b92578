-- Security Fix: Ensure contact_submissions table has RLS properly enabled
-- The table contains sensitive customer data that must be protected

-- Ensure RLS is enabled on contact_submissions
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate them cleanly
DROP POLICY IF EXISTS "Anyone can insert contact submissions" ON public.contact_submissions;
DROP POLICY IF EXISTS "Only admins can view contact submissions" ON public.contact_submissions;

-- Recreate policies with strict access control
CREATE POLICY "Anyone can insert contact submissions" 
ON public.contact_submissions 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Only admins can view contact submissions" 
ON public.contact_submissions 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));