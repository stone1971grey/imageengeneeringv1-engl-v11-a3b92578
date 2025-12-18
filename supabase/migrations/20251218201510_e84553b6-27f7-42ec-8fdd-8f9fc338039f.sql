-- Add language_code column to editor_page_access for language-specific permissions
ALTER TABLE public.editor_page_access 
ADD COLUMN language_code text DEFAULT NULL;

-- Add comment for clarity
COMMENT ON COLUMN public.editor_page_access.language_code IS 'If set, editor can only edit this language version. NULL means all languages (for admins/full editors).';

-- Create index for faster lookups
CREATE INDEX idx_editor_page_access_language ON public.editor_page_access(user_id, page_slug, language_code);