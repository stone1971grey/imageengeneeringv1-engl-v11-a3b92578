-- Create page_registry table for tracking page IDs
CREATE TABLE IF NOT EXISTS public.page_registry (
  id SERIAL PRIMARY KEY,
  page_id INTEGER NOT NULL UNIQUE,
  page_slug TEXT NOT NULL UNIQUE,
  page_title TEXT NOT NULL,
  parent_slug TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.page_registry ENABLE ROW LEVEL SECURITY;

-- Anyone can view pages
CREATE POLICY "Anyone can view page registry"
ON public.page_registry
FOR SELECT
USING (true);

-- Admins can manage pages
CREATE POLICY "Admins can manage page registry"
ON public.page_registry
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Insert existing pages with BE
INSERT INTO public.page_registry (page_id, page_slug, page_title, parent_slug) VALUES
(1, 'photography', 'Photo & Video', 'your-solution'),
(2, 'scanners-archiving', 'Scanners & Archiving', 'your-solution'),
(3, 'medical-endoscopy', 'Medical & Endoscopy', 'your-solution');