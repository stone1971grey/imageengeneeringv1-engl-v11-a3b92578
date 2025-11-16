-- Storage RLS Policies für Admins und Editors

-- Public read access für alle Buckets (da sie public sind)
CREATE POLICY "Public can view images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id IN ('page-images', 'og-images'));

-- Admins und Editors können Bilder hochladen
CREATE POLICY "Admins and editors can upload images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id IN ('page-images', 'og-images') 
  AND (
    has_role(auth.uid(), 'admin'::app_role) 
    OR has_role(auth.uid(), 'editor'::app_role)
  )
);

-- Admins und Editors können Bilder aktualisieren
CREATE POLICY "Admins and editors can update images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id IN ('page-images', 'og-images') 
  AND (
    has_role(auth.uid(), 'admin'::app_role) 
    OR has_role(auth.uid(), 'editor'::app_role)
  )
);

-- Admins und Editors können Bilder löschen
CREATE POLICY "Admins and editors can delete images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id IN ('page-images', 'og-images') 
  AND (
    has_role(auth.uid(), 'admin'::app_role) 
    OR has_role(auth.uid(), 'editor'::app_role)
  )
);