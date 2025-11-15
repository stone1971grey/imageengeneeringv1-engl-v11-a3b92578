-- Create storage bucket for OG images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'og-images',
  'og-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp']
);

-- Create RLS policies for og-images bucket
CREATE POLICY "Anyone can view OG images"
ON storage.objects FOR SELECT
USING (bucket_id = 'og-images');

CREATE POLICY "Authenticated users can upload OG images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'og-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can update their OG images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'og-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can delete OG images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'og-images' 
  AND auth.role() = 'authenticated'
);