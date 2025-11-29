-- Add alt_text column to file_segment_mappings table for centralized alt text storage
ALTER TABLE public.file_segment_mappings 
ADD COLUMN IF NOT EXISTS alt_text TEXT;

-- Add comment explaining the alt_text column
COMMENT ON COLUMN public.file_segment_mappings.alt_text IS 'Centralized alt text for the image, synchronized bidirectionally between Media Management and all segments using this image';