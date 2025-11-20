-- Security Fix: Ensure backlog_tasks table has RLS properly enabled
-- Only authenticated users who created or are assigned to tasks should view them

-- Ensure RLS is enabled on backlog_tasks
ALTER TABLE public.backlog_tasks ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate them cleanly
DROP POLICY IF EXISTS "Admins can manage all backlog tasks" ON public.backlog_tasks;
DROP POLICY IF EXISTS "Users can create backlog tasks" ON public.backlog_tasks;
DROP POLICY IF EXISTS "Users can update their own or assigned tasks" ON public.backlog_tasks;
DROP POLICY IF EXISTS "Admins can view all backlog tasks" ON public.backlog_tasks;
DROP POLICY IF EXISTS "Users can view their own or assigned tasks" ON public.backlog_tasks;

-- Recreate policies with strict access control
CREATE POLICY "Admins can manage all backlog tasks" 
ON public.backlog_tasks 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can create backlog tasks" 
ON public.backlog_tasks 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own or assigned tasks" 
ON public.backlog_tasks 
FOR UPDATE 
USING ((auth.uid() = created_by) OR (auth.uid() = assigned_to));

CREATE POLICY "Admins can view all backlog tasks" 
ON public.backlog_tasks 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view their own or assigned tasks" 
ON public.backlog_tasks 
FOR SELECT 
USING ((auth.uid() = created_by) OR (auth.uid() = assigned_to));