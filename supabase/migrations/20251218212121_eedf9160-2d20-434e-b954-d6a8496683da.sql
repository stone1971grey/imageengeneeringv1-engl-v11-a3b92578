-- Drop existing restrictive policies for page_content
DROP POLICY IF EXISTS "Admins and editors can insert page content" ON public.page_content;
DROP POLICY IF EXISTS "Admins and editors can update page content" ON public.page_content;
DROP POLICY IF EXISTS "Admins and editors can delete page content" ON public.page_content;

-- Create new policies that support global language permissions
-- Editors can insert if:
-- 1. They are admin, OR
-- 2. They have __global__ access for the content's language, OR
-- 3. They have specific page_slug access
CREATE POLICY "Admins and editors can insert page content" 
ON public.page_content 
FOR INSERT 
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) 
  OR (
    has_role(auth.uid(), 'editor'::app_role) 
    AND (
      -- Has global language access for this language
      EXISTS (
        SELECT 1 FROM editor_page_access 
        WHERE user_id = auth.uid() 
        AND page_slug = '__global__' 
        AND language_code = page_content.language
      )
      -- OR has specific page access
      OR page_slug IN (
        SELECT epa.page_slug FROM editor_page_access epa
        WHERE epa.user_id = auth.uid() AND epa.page_slug != '__global__'
      )
      -- OR has __all__ access (legacy full access)
      OR EXISTS (
        SELECT 1 FROM editor_page_access 
        WHERE user_id = auth.uid() AND page_slug = '__all__'
      )
    )
  )
);

-- Editors can update if same conditions
CREATE POLICY "Admins and editors can update page content" 
ON public.page_content 
FOR UPDATE 
USING (
  has_role(auth.uid(), 'admin'::app_role) 
  OR (
    has_role(auth.uid(), 'editor'::app_role) 
    AND (
      EXISTS (
        SELECT 1 FROM editor_page_access 
        WHERE user_id = auth.uid() 
        AND page_slug = '__global__' 
        AND language_code = page_content.language
      )
      OR page_slug IN (
        SELECT epa.page_slug FROM editor_page_access epa
        WHERE epa.user_id = auth.uid() AND epa.page_slug != '__global__'
      )
      OR EXISTS (
        SELECT 1 FROM editor_page_access 
        WHERE user_id = auth.uid() AND page_slug = '__all__'
      )
    )
  )
);

-- Editors can delete if same conditions
CREATE POLICY "Admins and editors can delete page content" 
ON public.page_content 
FOR DELETE 
USING (
  has_role(auth.uid(), 'admin'::app_role) 
  OR (
    has_role(auth.uid(), 'editor'::app_role) 
    AND (
      EXISTS (
        SELECT 1 FROM editor_page_access 
        WHERE user_id = auth.uid() 
        AND page_slug = '__global__' 
        AND language_code = page_content.language
      )
      OR page_slug IN (
        SELECT epa.page_slug FROM editor_page_access epa
        WHERE epa.user_id = auth.uid() AND epa.page_slug != '__global__'
      )
      OR EXISTS (
        SELECT 1 FROM editor_page_access 
        WHERE user_id = auth.uid() AND page_slug = '__all__'
      )
    )
  )
);