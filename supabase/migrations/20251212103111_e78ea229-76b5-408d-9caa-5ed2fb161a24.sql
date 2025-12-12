-- Create page_content_backups table for automatic versioning
CREATE TABLE public.page_content_backups (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_slug text NOT NULL,
  section_key text NOT NULL,
  language text NOT NULL DEFAULT 'en',
  content_type text NOT NULL,
  content_value text NOT NULL,
  backup_created_at timestamp with time zone NOT NULL DEFAULT now(),
  original_updated_at timestamp with time zone,
  original_updated_by uuid
);

-- Create index for efficient queries
CREATE INDEX idx_page_content_backups_lookup 
ON public.page_content_backups (page_slug, section_key, language, backup_created_at DESC);

-- Enable RLS
ALTER TABLE public.page_content_backups ENABLE ROW LEVEL SECURITY;

-- RLS policies - admins and editors can view/manage backups
CREATE POLICY "Admins and editors can view backups"
ON public.page_content_backups
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role));

CREATE POLICY "Admins and editors can create backups"
ON public.page_content_backups
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role));

CREATE POLICY "Admins can delete old backups"
ON public.page_content_backups
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Function to cleanup old backups (keep only last 10 per page/section/language)
CREATE OR REPLACE FUNCTION public.cleanup_old_backups()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Delete backups beyond the 10 most recent for this page/section/language
  DELETE FROM public.page_content_backups
  WHERE id IN (
    SELECT id FROM public.page_content_backups
    WHERE page_slug = NEW.page_slug
      AND section_key = NEW.section_key
      AND language = NEW.language
    ORDER BY backup_created_at DESC
    OFFSET 10
  );
  RETURN NEW;
END;
$$;

-- Trigger to auto-cleanup after each backup insert
CREATE TRIGGER cleanup_backups_after_insert
AFTER INSERT ON public.page_content_backups
FOR EACH ROW
EXECUTE FUNCTION public.cleanup_old_backups();