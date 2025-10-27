-- Create event_registrations table
CREATE TABLE public.event_registrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT NOT NULL,
  position TEXT NOT NULL,
  phone TEXT,
  current_test_systems TEXT,
  industry TEXT,
  automotive_interests TEXT[],
  event_title TEXT NOT NULL,
  event_date TEXT NOT NULL,
  event_location TEXT NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to insert registrations (public form)
CREATE POLICY "Anyone can insert event registrations"
ON public.event_registrations
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Create policy to allow users to view their own registrations
CREATE POLICY "Users can view their own registrations"
ON public.event_registrations
FOR SELECT
TO authenticated
USING (email = auth.jwt()->>'email');

-- Create index for faster queries
CREATE INDEX idx_event_registrations_email ON public.event_registrations(email);
CREATE INDEX idx_event_registrations_created_at ON public.event_registrations(created_at DESC);