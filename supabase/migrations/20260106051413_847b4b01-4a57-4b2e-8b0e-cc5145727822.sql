-- Add navigation-specific columns to page_registry for DB-first navigation
-- This enables fully dynamic navigation without hardcoded translation files

-- 1. Add title_translations for multilingual navigation labels
ALTER TABLE public.page_registry 
ADD COLUMN IF NOT EXISTS title_translations jsonb DEFAULT '{}'::jsonb;

-- 2. Add nav_category to define which navigation menu the page appears in
-- Values: 'main' (header), 'footer', 'utility', 'none' (not in nav)
ALTER TABLE public.page_registry 
ADD COLUMN IF NOT EXISTS nav_category text DEFAULT 'main';

-- 3. Add nav_visible to control visibility in navigation menus
ALTER TABLE public.page_registry 
ADD COLUMN IF NOT EXISTS nav_visible boolean DEFAULT true;

-- 4. Add nav_position for ordering within navigation (separate from page position)
ALTER TABLE public.page_registry 
ADD COLUMN IF NOT EXISTS nav_position integer;

-- Create index for efficient navigation queries
CREATE INDEX IF NOT EXISTS idx_page_registry_nav_category 
ON public.page_registry(nav_category) 
WHERE nav_visible = true;

CREATE INDEX IF NOT EXISTS idx_page_registry_parent_slug 
ON public.page_registry(parent_slug);

-- Comment explaining the navigation system
COMMENT ON COLUMN public.page_registry.title_translations IS 'Multilingual titles for navigation: {"de": "Industrien", "ja": "産業", "ko": "산업"}';
COMMENT ON COLUMN public.page_registry.nav_category IS 'Navigation category: main, footer, utility, none';
COMMENT ON COLUMN public.page_registry.nav_visible IS 'Whether page appears in navigation menus';
COMMENT ON COLUMN public.page_registry.nav_position IS 'Order position within navigation menu';