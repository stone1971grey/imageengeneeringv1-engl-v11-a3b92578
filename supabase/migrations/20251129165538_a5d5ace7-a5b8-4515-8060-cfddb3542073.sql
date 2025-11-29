-- Create table for hierarchical folder structure in Media Management
CREATE TABLE public.media_folders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  parent_id UUID REFERENCES public.media_folders(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.media_folders ENABLE ROW LEVEL SECURITY;

-- Allow admins and editors to manage folders
CREATE POLICY "Admins and editors can manage media folders"
  ON public.media_folders
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role));

-- Allow anyone to view folders (for file browsing)
CREATE POLICY "Anyone can view media folders"
  ON public.media_folders
  FOR SELECT
  USING (true);

-- Create index for parent_id lookups
CREATE INDEX idx_media_folders_parent_id ON public.media_folders(parent_id);

-- Create index for storage_path lookups
CREATE INDEX idx_media_folders_storage_path ON public.media_folders(storage_path);

-- Insert root "Media" folder
INSERT INTO public.media_folders (id, name, parent_id, storage_path, created_by)
VALUES ('00000000-0000-0000-0000-000000000001', 'Media', NULL, 'media', NULL);

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION public.update_media_folders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_media_folders_updated_at
  BEFORE UPDATE ON public.media_folders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_media_folders_updated_at();