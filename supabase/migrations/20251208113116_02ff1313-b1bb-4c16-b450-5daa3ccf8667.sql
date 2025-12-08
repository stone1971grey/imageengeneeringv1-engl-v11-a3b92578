-- Add flyout_description_translations column (jsonb) to store multilingual flyout descriptions
ALTER TABLE public.page_registry 
ADD COLUMN flyout_description_translations jsonb DEFAULT '{}'::jsonb;

-- Migrate existing flyout_description values to the new jsonb structure as English
UPDATE public.page_registry 
SET flyout_description_translations = jsonb_build_object('en', flyout_description)
WHERE flyout_description IS NOT NULL AND flyout_description != '';