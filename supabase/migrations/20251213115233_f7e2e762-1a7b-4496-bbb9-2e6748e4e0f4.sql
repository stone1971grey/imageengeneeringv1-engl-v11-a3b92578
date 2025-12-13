-- Add gallery_images and documents columns to products table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS gallery_images jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS documents jsonb DEFAULT '[]'::jsonb;

-- Add comment for clarity
COMMENT ON COLUMN public.products.gallery_images IS 'Array of image URLs for product gallery';
COMMENT ON COLUMN public.products.documents IS 'Array of document objects with url, title, type fields';