-- Allow editors (not just admins) to update page_registry for design icons, flyout info, etc.
-- Drop the old admin-only policy and create separate policies for each operation

-- Drop the old combined policy
DROP POLICY IF EXISTS "Admins can manage page registry" ON public.page_registry;

-- Create new SELECT policy (unchanged - anyone can view)
-- (Already exists: "Anyone can view page registry")

-- Create INSERT policy for admins only (new pages should be admin-only)
CREATE POLICY "Admins can insert page registry"
ON public.page_registry
FOR INSERT
TO public
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create UPDATE policy for admins and editors
CREATE POLICY "Admins and editors can update page registry"
ON public.page_registry
FOR UPDATE
TO public
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'editor'::app_role)
);

-- Create DELETE policy for admins only
CREATE POLICY "Admins can delete page registry"
ON public.page_registry
FOR DELETE
TO public
USING (has_role(auth.uid(), 'admin'::app_role));