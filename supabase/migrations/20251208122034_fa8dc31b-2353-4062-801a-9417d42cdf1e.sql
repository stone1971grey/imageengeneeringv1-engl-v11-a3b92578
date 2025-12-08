-- Add target_page_slug column to navigation_links for shortcuts
ALTER TABLE public.navigation_links 
ADD COLUMN target_page_slug text DEFAULT NULL;

-- Add comment explaining the column purpose
COMMENT ON COLUMN public.navigation_links.target_page_slug IS 'If set, this navigation entry is a shortcut pointing to the page with this slug. If NULL, it is a regular page link.';