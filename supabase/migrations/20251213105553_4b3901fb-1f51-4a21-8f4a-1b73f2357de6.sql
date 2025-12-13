-- Add visibility field to news_articles table
ALTER TABLE public.news_articles 
ADD COLUMN visibility text NOT NULL DEFAULT 'public' 
CHECK (visibility IN ('public', 'private'));

-- Create index for efficient filtering by visibility
CREATE INDEX idx_news_articles_visibility ON public.news_articles(visibility);