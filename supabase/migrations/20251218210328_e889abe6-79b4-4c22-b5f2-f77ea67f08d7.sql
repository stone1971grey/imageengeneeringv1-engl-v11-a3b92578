-- Drop the old unique constraint that only considers user_id and page_slug
ALTER TABLE public.editor_page_access 
DROP CONSTRAINT IF EXISTS editor_page_access_user_id_page_slug_key;

-- Add a new unique constraint that includes language_code
-- This allows multiple language entries per user/page combination
ALTER TABLE public.editor_page_access 
ADD CONSTRAINT editor_page_access_user_page_language_key 
UNIQUE (user_id, page_slug, language_code);