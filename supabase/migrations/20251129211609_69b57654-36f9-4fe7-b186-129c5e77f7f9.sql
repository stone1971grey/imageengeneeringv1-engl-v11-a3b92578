-- Create table to store file-to-segment mappings
CREATE TABLE IF NOT EXISTS public.file_segment_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_path TEXT NOT NULL,
  bucket_id TEXT NOT NULL DEFAULT 'page-images',
  segment_ids TEXT[] NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(file_path, bucket_id)
);

-- Enable RLS
ALTER TABLE public.file_segment_mappings ENABLE ROW LEVEL SECURITY;

-- Allow admins and editors to manage mappings
CREATE POLICY "Admins and editors can manage file mappings"
  ON public.file_segment_mappings
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role));

-- Anyone can view mappings
CREATE POLICY "Anyone can view file mappings"
  ON public.file_segment_mappings
  FOR SELECT
  USING (true);

-- Create index for faster lookups
CREATE INDEX idx_file_segment_path ON public.file_segment_mappings(file_path);