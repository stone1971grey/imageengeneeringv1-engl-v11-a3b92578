
-- Drop the old unique constraint that doesn't include focus_keyword
ALTER TABLE public.relaunch_url_mappings 
DROP CONSTRAINT IF EXISTS relaunch_url_mappings_domain_old_url_snapshot_date_key;

-- Keep the correct constraint that includes focus_keyword and country
-- (already exists from previous migration)
