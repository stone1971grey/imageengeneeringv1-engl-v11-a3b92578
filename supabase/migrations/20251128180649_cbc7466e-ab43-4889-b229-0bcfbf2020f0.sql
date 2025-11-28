-- Add position column to page_registry for drag & drop ordering
ALTER TABLE public.page_registry 
ADD COLUMN position INTEGER;

-- Initialize position with page_id values for existing pages
UPDATE public.page_registry 
SET position = page_id 
WHERE position IS NULL;

-- Create index for faster sorting queries
CREATE INDEX idx_page_registry_position ON public.page_registry(position);

-- Add comment
COMMENT ON COLUMN public.page_registry.position IS 'Controls display order in navigation and CMS Pages Overview. Independent from page_id for flexible reordering via Drag & Drop.';