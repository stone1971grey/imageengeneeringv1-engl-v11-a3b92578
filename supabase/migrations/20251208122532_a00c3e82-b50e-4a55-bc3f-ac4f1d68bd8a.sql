-- Add target_page_slug column to page_registry for page-level shortcuts
ALTER TABLE public.page_registry 
ADD COLUMN target_page_slug text DEFAULT NULL;

-- Add comment explaining the column purpose
COMMENT ON COLUMN public.page_registry.target_page_slug IS 'If set, this page is a shortcut that redirects to the page with this slug. The page itself has no content.';