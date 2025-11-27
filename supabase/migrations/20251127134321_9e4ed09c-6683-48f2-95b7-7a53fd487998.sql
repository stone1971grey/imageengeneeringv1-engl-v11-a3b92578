-- Create navigation_links table for dynamic navigation management
CREATE TABLE IF NOT EXISTS public.navigation_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL,
  label_key TEXT NOT NULL,
  language TEXT NOT NULL CHECK (language IN ('en', 'de', 'ja', 'ko', 'zh')),
  category TEXT NOT NULL,
  parent_category TEXT,
  parent_label TEXT,
  position INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_navigation_links_language ON public.navigation_links(language);
CREATE INDEX idx_navigation_links_category ON public.navigation_links(category);
CREATE INDEX idx_navigation_links_slug ON public.navigation_links(slug);
CREATE INDEX idx_navigation_links_active ON public.navigation_links(active);

-- Enable RLS
ALTER TABLE public.navigation_links ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read navigation links
CREATE POLICY "Anyone can view navigation links"
  ON public.navigation_links
  FOR SELECT
  USING (true);

-- Policy: Admins and editors can manage navigation links
CREATE POLICY "Admins and editors can manage navigation links"
  ON public.navigation_links
  FOR ALL
  USING (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'editor'::app_role)
  );

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_navigation_links_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_navigation_links_updated_at
  BEFORE UPDATE ON public.navigation_links
  FOR EACH ROW
  EXECUTE FUNCTION public.update_navigation_links_updated_at();

COMMENT ON TABLE public.navigation_links IS 'Stores dynamic navigation links that can be updated when page slugs change';