-- Add status field to page_registry for draft/publish workflow
ALTER TABLE public.page_registry 
ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'published';

-- Set existing pages to published (they are already live)
UPDATE public.page_registry SET status = 'published' WHERE status IS NULL OR status = '';

-- Add index for status queries
CREATE INDEX IF NOT EXISTS idx_page_registry_status ON public.page_registry(status);

-- Add comment for documentation
COMMENT ON COLUMN public.page_registry.status IS 'Page status: draft (not public) or published (live)';