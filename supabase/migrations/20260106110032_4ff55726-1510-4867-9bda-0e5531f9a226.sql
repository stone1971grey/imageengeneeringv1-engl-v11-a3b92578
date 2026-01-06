-- Add RLS policy for editors to manage segments for their assigned pages
CREATE POLICY "Editors can manage segments for their pages"
ON public.segment_registry
FOR ALL
TO authenticated
USING (
  has_role(auth.uid(), 'editor'::app_role) AND (
    -- Global access via __all__
    EXISTS (
      SELECT 1 FROM editor_page_access
      WHERE user_id = auth.uid()
      AND page_slug = '__all__'
    )
    OR
    -- Global language access via __global__
    EXISTS (
      SELECT 1 FROM editor_page_access
      WHERE user_id = auth.uid()
      AND page_slug = '__global__'
    )
    OR
    -- Specific page access
    page_slug IN (
      SELECT epa.page_slug
      FROM editor_page_access epa
      WHERE epa.user_id = auth.uid()
      AND epa.page_slug NOT IN ('__global__', '__all__')
    )
  )
)
WITH CHECK (
  has_role(auth.uid(), 'editor'::app_role) AND (
    EXISTS (
      SELECT 1 FROM editor_page_access
      WHERE user_id = auth.uid()
      AND page_slug = '__all__'
    )
    OR
    EXISTS (
      SELECT 1 FROM editor_page_access
      WHERE user_id = auth.uid()
      AND page_slug = '__global__'
    )
    OR
    page_slug IN (
      SELECT epa.page_slug
      FROM editor_page_access epa
      WHERE epa.user_id = auth.uid()
      AND epa.page_slug NOT IN ('__global__', '__all__')
    )
  )
);