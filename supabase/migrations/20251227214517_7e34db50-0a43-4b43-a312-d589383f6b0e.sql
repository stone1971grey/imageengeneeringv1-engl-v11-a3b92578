-- Add draft/approval fields to page_content for Frontend Approval System
ALTER TABLE public.page_content 
ADD COLUMN IF NOT EXISTS content_status text NOT NULL DEFAULT 'approved',
ADD COLUMN IF NOT EXISTS draft_value text,
ADD COLUMN IF NOT EXISTS import_stage integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS approved_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS approved_by uuid;

-- Add constraint for valid status values
ALTER TABLE public.page_content 
ADD CONSTRAINT page_content_status_check 
CHECK (content_status IN ('draft', 'pending', 'approved'));

-- Add index for faster status queries
CREATE INDEX IF NOT EXISTS idx_page_content_status ON public.page_content(content_status);
CREATE INDEX IF NOT EXISTS idx_page_content_import_stage ON public.page_content(import_stage);

-- Add column to editor_page_access to enable frontend editing per user
ALTER TABLE public.editor_page_access 
ADD COLUMN IF NOT EXISTS frontend_editing_enabled boolean DEFAULT false;

-- Comment for documentation
COMMENT ON COLUMN public.page_content.content_status IS 'Status: draft (Entwurf), pending (wartet auf Approval), approved (live)';
COMMENT ON COLUMN public.page_content.draft_value IS 'Entwurfs-Inhalt, wird bei Approval zu content_value';
COMMENT ON COLUMN public.page_content.import_stage IS 'Import-Stufe: 1 = Initial-Import, 2 = Fetched Content';
COMMENT ON COLUMN public.page_content.approved_at IS 'Zeitpunkt der Freigabe';
COMMENT ON COLUMN public.page_content.approved_by IS 'User der die Freigabe erteilt hat';