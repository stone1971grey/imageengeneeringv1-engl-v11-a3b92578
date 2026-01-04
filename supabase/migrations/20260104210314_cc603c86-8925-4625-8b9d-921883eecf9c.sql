-- Create table for SISTRIX Visibility Index history
CREATE TABLE public.sistrix_visibility_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  domain TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'de',
  visibility_index DECIMAL(10, 4) NOT NULL,
  recorded_at DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Unique constraint to prevent duplicate entries per day
  CONSTRAINT sistrix_visibility_unique_day UNIQUE (domain, country, recorded_at)
);

-- Enable RLS
ALTER TABLE public.sistrix_visibility_history ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read
CREATE POLICY "Authenticated users can read visibility history"
ON public.sistrix_visibility_history
FOR SELECT
TO authenticated
USING (true);

-- Allow service role to insert (for edge functions/cron)
CREATE POLICY "Service role can insert visibility history"
ON public.sistrix_visibility_history
FOR INSERT
TO service_role
WITH CHECK (true);

-- Create index for efficient querying
CREATE INDEX idx_visibility_domain_date ON public.sistrix_visibility_history (domain, country, recorded_at DESC);