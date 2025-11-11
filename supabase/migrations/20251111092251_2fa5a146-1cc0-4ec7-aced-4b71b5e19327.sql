-- Create storage bucket for page images
INSERT INTO storage.buckets (id, name, public)
VALUES ('page-images', 'page-images', true);

-- Create RLS policies for page-images bucket
CREATE POLICY "Public can view page images"
ON storage.objects FOR SELECT
USING (bucket_id = 'page-images');

CREATE POLICY "Admins can upload page images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'page-images' 
  AND auth.uid() IN (
    SELECT user_id FROM public.user_roles WHERE role = 'admin'
  )
);

CREATE POLICY "Admins can update page images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'page-images'
  AND auth.uid() IN (
    SELECT user_id FROM public.user_roles WHERE role = 'admin'
  )
);

CREATE POLICY "Admins can delete page images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'page-images'
  AND auth.uid() IN (
    SELECT user_id FROM public.user_roles WHERE role = 'admin'
  )
);