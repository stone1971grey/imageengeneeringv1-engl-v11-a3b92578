-- Add new date column
ALTER TABLE news_articles ADD COLUMN date_new date;

-- Convert existing text dates to date format
-- Handle YYYY-MM-DD format
UPDATE news_articles 
SET date_new = date::date 
WHERE date ~ '^\d{4}-\d{2}-\d{2}$';

-- Handle "Month DD, YYYY" format (e.g., "July 21, 2025")
UPDATE news_articles 
SET date_new = TO_DATE(date, 'Month DD, YYYY')
WHERE date ~ '^[A-Za-z]+ \d{1,2}, \d{4}$' AND date_new IS NULL;

-- Drop old column and rename new one
ALTER TABLE news_articles DROP COLUMN date;
ALTER TABLE news_articles RENAME COLUMN date_new TO date;

-- Make date column not null with a default
ALTER TABLE news_articles ALTER COLUMN date SET NOT NULL;
ALTER TABLE news_articles ALTER COLUMN date SET DEFAULT CURRENT_DATE;