-- Create table to manage editor page access
CREATE TABLE IF NOT EXISTS public.editor_page_access (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  page_slug text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, page_slug)
);

-- Enable RLS
ALTER TABLE public.editor_page_access ENABLE ROW LEVEL SECURITY;

-- Policies for editor_page_access
CREATE POLICY "Admins can manage editor page access"
ON public.editor_page_access
FOR ALL
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Editors can view their own page access"
ON public.editor_page_access
FOR SELECT
USING (auth.uid() = user_id);

-- Update page_content policies to allow editors to edit their assigned pages
DROP POLICY IF EXISTS "Admins can update page content" ON public.page_content;
DROP POLICY IF EXISTS "Admins can delete page content" ON public.page_content;
DROP POLICY IF EXISTS "Admins can insert page content" ON public.page_content;

CREATE POLICY "Admins and editors can update page content"
ON public.page_content
FOR UPDATE
USING (
  has_role(auth.uid(), 'admin') OR 
  (has_role(auth.uid(), 'editor') AND page_slug IN (
    SELECT page_slug FROM public.editor_page_access WHERE user_id = auth.uid()
  ))
);

CREATE POLICY "Admins and editors can insert page content"
ON public.page_content
FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'admin') OR 
  (has_role(auth.uid(), 'editor') AND page_slug IN (
    SELECT page_slug FROM public.editor_page_access WHERE user_id = auth.uid()
  ))
);

CREATE POLICY "Admins and editors can delete page content"
ON public.page_content
FOR DELETE
USING (
  has_role(auth.uid(), 'admin') OR 
  (has_role(auth.uid(), 'editor') AND page_slug IN (
    SELECT page_slug FROM public.editor_page_access WHERE user_id = auth.uid()
  ))
);