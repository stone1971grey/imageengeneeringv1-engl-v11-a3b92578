-- Create table for download requests (whitepapers, videos, conference papers)
CREATE TABLE public.download_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT NOT NULL,
  position TEXT NOT NULL,
  download_type TEXT NOT NULL, -- 'whitepaper', 'video', 'conference'
  item_id TEXT NOT NULL,
  item_title TEXT NOT NULL,
  consent BOOLEAN NOT NULL DEFAULT false
);

-- Enable Row Level Security
ALTER TABLE public.download_requests ENABLE ROW LEVEL SECURITY;

-- Create policy: Anyone can insert download requests
CREATE POLICY "Anyone can insert download requests"
ON public.download_requests
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Create policy: Users can view their own requests
CREATE POLICY "Users can view their own download requests"
ON public.download_requests
FOR SELECT
TO authenticated
USING (email = (auth.jwt() ->> 'email'::text));

-- Create table for contact form submissions
CREATE TABLE public.contact_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

-- Create policy: Anyone can insert contact submissions
CREATE POLICY "Anyone can insert contact submissions"
ON public.contact_submissions
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Create policy: Users can view their own submissions
CREATE POLICY "Users can view their own contact submissions"
ON public.contact_submissions
FOR SELECT
TO authenticated
USING (email = (auth.jwt() ->> 'email'::text));