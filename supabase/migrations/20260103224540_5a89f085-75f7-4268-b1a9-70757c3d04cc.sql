-- Add country column to relaunch_url_mappings for multi-country tracking
ALTER TABLE public.relaunch_url_mappings 
ADD COLUMN country TEXT NOT NULL DEFAULT 'de';

-- Update existing records to be German data
UPDATE public.relaunch_url_mappings SET country = 'de' WHERE country = 'de';

-- Create index for faster country-based queries
CREATE INDEX idx_relaunch_url_mappings_country ON public.relaunch_url_mappings(country);

-- Create composite unique constraint to allow same URL+keyword per country
DROP INDEX IF EXISTS relaunch_url_mappings_domain_old_url_focus_keyword_idx;
CREATE UNIQUE INDEX relaunch_url_mappings_domain_url_keyword_country_idx 
ON public.relaunch_url_mappings(domain, old_url, focus_keyword, country);