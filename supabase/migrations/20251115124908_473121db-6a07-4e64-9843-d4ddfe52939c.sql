-- Fix event_registrations RLS policy to prevent enumeration attacks
-- Drop the existing permissive SELECT policy
DROP POLICY IF EXISTS "Users can view their own registrations or admins can view all" ON public.event_registrations;

-- Create a new policy that only allows admins to view event registrations
CREATE POLICY "Only admins can view event registrations"
ON public.event_registrations
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));