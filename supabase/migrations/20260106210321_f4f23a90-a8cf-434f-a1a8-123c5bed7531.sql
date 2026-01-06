-- Create cms-media bucket for CMS uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('cms-media', 'cms-media', true)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for cms-media bucket
CREATE POLICY "Public read access for cms-media"
ON storage.objects FOR SELECT
USING (bucket_id = 'cms-media');

CREATE POLICY "Authenticated users can upload to cms-media"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'cms-media' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update in cms-media"
ON storage.objects FOR UPDATE
USING (bucket_id = 'cms-media' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete from cms-media"
ON storage.objects FOR DELETE
USING (bucket_id = 'cms-media' AND auth.role() = 'authenticated');