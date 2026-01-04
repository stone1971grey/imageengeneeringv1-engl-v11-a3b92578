-- Set frontend_editing_enabled to default TRUE for new pages
ALTER TABLE public.page_registry 
ALTER COLUMN frontend_editing_enabled SET DEFAULT true;

-- Also update all existing pages that have it set to false to true
UPDATE public.page_registry 
SET frontend_editing_enabled = true 
WHERE frontend_editing_enabled = false;