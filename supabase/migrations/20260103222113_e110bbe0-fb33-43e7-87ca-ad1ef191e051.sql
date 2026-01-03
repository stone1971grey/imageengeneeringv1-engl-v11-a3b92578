-- Add AI Overview tracking column to relaunch_url_mappings
ALTER TABLE public.relaunch_url_mappings
ADD COLUMN has_ai_overview boolean DEFAULT NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.relaunch_url_mappings.has_ai_overview IS 'Indicates whether this keyword triggers an AI Overview in Google SERPs';