-- Drop the existing unique constraint on slug only
DROP INDEX IF EXISTS events_slug_unique;

-- Create new unique constraint on slug + language_code combination
CREATE UNIQUE INDEX events_slug_language_unique ON public.events (slug, language_code);