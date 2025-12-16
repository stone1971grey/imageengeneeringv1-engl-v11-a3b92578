-- Add 'thesis' to allowed download types
ALTER TABLE downloads DROP CONSTRAINT downloads_download_type_check;
ALTER TABLE downloads ADD CONSTRAINT downloads_download_type_check 
  CHECK (download_type = ANY (ARRAY['whitepaper'::text, 'conference'::text, 'video'::text, 'thesis'::text]));