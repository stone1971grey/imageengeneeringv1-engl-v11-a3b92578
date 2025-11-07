-- Add category_tag and title_tag columns to download_requests table
ALTER TABLE public.download_requests 
ADD COLUMN IF NOT EXISTS category_tag text,
ADD COLUMN IF NOT EXISTS title_tag text;