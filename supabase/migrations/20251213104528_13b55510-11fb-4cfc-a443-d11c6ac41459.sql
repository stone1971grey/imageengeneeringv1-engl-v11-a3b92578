-- Add visibility field to file_segment_mappings table
ALTER TABLE public.file_segment_mappings 
ADD COLUMN visibility text NOT NULL DEFAULT 'public' 
CHECK (visibility IN ('public', 'private'));

-- Create index for efficient filtering by visibility
CREATE INDEX idx_file_segment_mappings_visibility ON public.file_segment_mappings(visibility);

-- Set styleguide assets to private by default
UPDATE public.file_segment_mappings 
SET visibility = 'private' 
WHERE file_path LIKE '%styleguide%';