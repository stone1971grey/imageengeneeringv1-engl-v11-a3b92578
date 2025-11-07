-- Add custom fields for Mautic to download_requests table
ALTER TABLE download_requests
ADD COLUMN IF NOT EXISTS dl_type TEXT,
ADD COLUMN IF NOT EXISTS dl_title TEXT,
ADD COLUMN IF NOT EXISTS dl_url TEXT;