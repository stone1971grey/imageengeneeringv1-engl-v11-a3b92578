-- Create a segment_registry table to track all segment IDs globally
CREATE TABLE IF NOT EXISTS public.segment_registry (
  id SERIAL PRIMARY KEY,
  segment_id INTEGER NOT NULL UNIQUE,
  page_slug TEXT NOT NULL,
  segment_type TEXT NOT NULL, -- 'hero', 'tiles', 'banner', 'solutions', 'footer', or dynamic type
  segment_key TEXT NOT NULL, -- for static: 'hero', 'tiles', etc., for dynamic: segment ID from page_segments
  is_static BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(page_slug, segment_key)
);

-- Enable RLS
ALTER TABLE public.segment_registry ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read
CREATE POLICY "Anyone can view segment registry"
  ON public.segment_registry
  FOR SELECT
  USING (true);

-- Policy: Admins can manage
CREATE POLICY "Admins can manage segment registry"
  ON public.segment_registry
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Insert initial static segments for photography
INSERT INTO public.segment_registry (segment_id, page_slug, segment_type, segment_key, is_static) VALUES
  (1, 'photography', 'hero', 'hero', true),
  (2, 'photography', 'tiles', 'tiles', true),
  (3, 'photography', 'banner', 'banner', true),
  (4, 'photography', 'solutions', 'solutions', true),
  (5, 'photography', 'tiles', '5', false),
  (6, 'photography', 'image-text', '6', false),
  (7, 'photography', 'footer', 'footer', true),
  (8, 'scanners-archiving', 'hero', 'hero', true),
  (9, 'scanners-archiving', 'tiles', 'tiles', true),
  (10, 'scanners-archiving', 'banner', 'banner', true),
  (11, 'scanners-archiving', 'solutions', 'solutions', true),
  (12, 'scanners-archiving', 'footer', 'footer', true),
  (13, 'your-solution', 'hero', 'hero', true),
  (14, 'your-solution', 'tiles', 'tiles', true),
  (15, 'your-solution', 'banner', 'banner', true),
  (16, 'your-solution', 'solutions', 'solutions', true),
  (17, 'your-solution', 'footer', 'footer', true)
ON CONFLICT DO NOTHING;