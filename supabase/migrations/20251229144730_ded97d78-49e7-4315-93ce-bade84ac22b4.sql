-- Create table to track the highest ever used page_id
-- This prevents reuse of deleted page IDs
CREATE TABLE IF NOT EXISTS public.page_id_sequence (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  last_used_page_id INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert initial value based on current max page_id
INSERT INTO public.page_id_sequence (id, last_used_page_id)
SELECT 1, COALESCE(MAX(page_id), 0)
FROM public.page_registry
ON CONFLICT (id) DO UPDATE SET last_used_page_id = GREATEST(
  public.page_id_sequence.last_used_page_id,
  (SELECT COALESCE(MAX(page_id), 0) FROM public.page_registry)
);

-- Enable RLS but allow all authenticated users to read/update
ALTER TABLE public.page_id_sequence ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read page_id_sequence"
ON public.page_id_sequence FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated users to update page_id_sequence"
ON public.page_id_sequence FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Create function to get and increment next page_id atomically
CREATE OR REPLACE FUNCTION public.get_next_page_id()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  next_id INTEGER;
BEGIN
  UPDATE public.page_id_sequence
  SET last_used_page_id = last_used_page_id + 1,
      updated_at = now()
  WHERE id = 1
  RETURNING last_used_page_id INTO next_id;
  
  -- If no row exists, initialize it
  IF next_id IS NULL THEN
    INSERT INTO public.page_id_sequence (id, last_used_page_id)
    VALUES (1, 1)
    ON CONFLICT (id) DO UPDATE SET last_used_page_id = page_id_sequence.last_used_page_id + 1
    RETURNING last_used_page_id INTO next_id;
  END IF;
  
  RETURN next_id;
END;
$$;