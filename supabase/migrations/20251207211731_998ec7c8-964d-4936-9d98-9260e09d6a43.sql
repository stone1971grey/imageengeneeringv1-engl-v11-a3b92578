-- Add language column to news_articles
ALTER TABLE public.news_articles 
ADD COLUMN IF NOT EXISTS language text NOT NULL DEFAULT 'en';

-- Add CHECK constraint for valid languages
ALTER TABLE public.news_articles 
ADD CONSTRAINT news_articles_language_check 
CHECK (language IN ('en', 'de', 'ja', 'ko', 'zh'));

-- Drop the existing unique constraint on slug (if exists)
ALTER TABLE public.news_articles DROP CONSTRAINT IF EXISTS news_articles_slug_key;

-- Create new unique constraint on (slug, language)
ALTER TABLE public.news_articles 
ADD CONSTRAINT news_articles_slug_language_unique UNIQUE (slug, language);

-- Create index for faster language-based queries
CREATE INDEX IF NOT EXISTS idx_news_articles_language ON public.news_articles(language);

-- Create index for slug + language lookups
CREATE INDEX IF NOT EXISTS idx_news_articles_slug_language ON public.news_articles(slug, language);