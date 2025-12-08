-- Add alt_text_translations column (jsonb) to store multilingual alt-texts
ALTER TABLE public.file_segment_mappings 
ADD COLUMN alt_text_translations jsonb DEFAULT '{}'::jsonb;

-- Migrate existing alt_text values to the new jsonb structure as English
UPDATE public.file_segment_mappings 
SET alt_text_translations = jsonb_build_object('en', alt_text)
WHERE alt_text IS NOT NULL AND alt_text != '';

-- Create index for better query performance on jsonb
CREATE INDEX idx_file_segment_mappings_alt_text_translations 
ON public.file_segment_mappings USING GIN (alt_text_translations);