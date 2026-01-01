-- Add draft/publish permission columns to editor_page_access table
ALTER TABLE public.editor_page_access 
ADD COLUMN IF NOT EXISTS can_draft boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS can_publish boolean DEFAULT false;

-- Comment for documentation
COMMENT ON COLUMN public.editor_page_access.can_draft IS 'Whether the editor can save drafts on this page';
COMMENT ON COLUMN public.editor_page_access.can_publish IS 'Whether the editor can publish content on this page';