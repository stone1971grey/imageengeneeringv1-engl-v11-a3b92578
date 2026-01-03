-- Add clicks and intent columns to relaunch_url_mappings
ALTER TABLE public.relaunch_url_mappings 
ADD COLUMN IF NOT EXISTS clicks integer,
ADD COLUMN IF NOT EXISTS intent text;