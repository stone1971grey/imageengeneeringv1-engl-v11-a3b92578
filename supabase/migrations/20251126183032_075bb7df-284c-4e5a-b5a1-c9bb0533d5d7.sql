-- Add language column to page_content table
ALTER TABLE public.page_content 
ADD COLUMN language text NOT NULL DEFAULT 'en';

-- Create index for faster language-based queries
CREATE INDEX idx_page_content_language ON public.page_content(page_slug, language);

-- Update the unique constraint to include language
-- First drop the old constraint
ALTER TABLE public.page_content 
DROP CONSTRAINT IF EXISTS page_content_page_slug_section_key_key;

-- Add new unique constraint that includes language
ALTER TABLE public.page_content 
ADD CONSTRAINT page_content_page_slug_section_key_language_key 
UNIQUE (page_slug, section_key, language);

-- Add check constraint to ensure language is one of the supported languages
ALTER TABLE public.page_content
ADD CONSTRAINT page_content_language_check 
CHECK (language IN ('en', 'de', 'ja', 'ko', 'zh'));

COMMENT ON COLUMN public.page_content.language IS 'ISO 639-1 language code: en (English), de (German), ja (Japanese), ko (Korean), zh (Chinese)';
