-- Fix function search path for security
DROP FUNCTION IF EXISTS public.update_media_folders_updated_at() CASCADE;

CREATE OR REPLACE FUNCTION public.update_media_folders_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_media_folders_updated_at
  BEFORE UPDATE ON public.media_folders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_media_folders_updated_at();