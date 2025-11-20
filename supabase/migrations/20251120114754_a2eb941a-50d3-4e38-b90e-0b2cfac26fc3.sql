-- Security Fix: Explicitly block anonymous access to backlog_tasks
-- Prevent anonymous users from attempting to query internal task data

-- Add explicit policy to deny anonymous SELECT access
CREATE POLICY "Block anonymous access to backlog tasks" 
ON public.backlog_tasks 
FOR SELECT 
USING (auth.uid() IS NOT NULL);