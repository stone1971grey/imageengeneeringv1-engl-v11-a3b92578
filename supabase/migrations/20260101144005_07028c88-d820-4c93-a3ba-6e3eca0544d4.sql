-- Add frontend_editing_enabled field to page_registry
ALTER TABLE public.page_registry 
ADD COLUMN frontend_editing_enabled boolean NOT NULL DEFAULT false;