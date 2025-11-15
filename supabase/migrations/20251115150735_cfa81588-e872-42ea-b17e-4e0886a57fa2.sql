-- Add position column to segment_registry table
ALTER TABLE public.segment_registry 
ADD COLUMN IF NOT EXISTS position INTEGER;

-- Set default positions based on current segment_id order
UPDATE public.segment_registry 
SET position = segment_id 
WHERE position IS NULL;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_segment_registry_position 
ON public.segment_registry(page_slug, position);