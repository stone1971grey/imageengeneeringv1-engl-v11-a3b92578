-- Drop the restrictive admin policy
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;

-- Create new policy: Allow insert if no admin exists yet OR if user is already admin
CREATE POLICY "Allow creating first admin or admins can manage"
ON public.user_roles
FOR INSERT
WITH CHECK (
  NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin')
  OR public.has_role(auth.uid(), 'admin')
);

-- Allow admins to update and delete roles
CREATE POLICY "Admins can update roles"
ON public.user_roles
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete roles"
ON public.user_roles
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));