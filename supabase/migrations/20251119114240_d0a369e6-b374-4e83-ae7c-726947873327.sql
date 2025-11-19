-- Security Fix: Restrict access to sensitive tables to admin-only
-- This migration addresses 3 critical security findings from the security scan

-- 1. FIX: Backlog Tasks - Restrict SELECT to admins and task participants only
-- Previous policy allowed ALL authenticated users to see all tasks
DROP POLICY IF EXISTS "Users can view all backlog tasks" ON public.backlog_tasks;

CREATE POLICY "Admins can view all backlog tasks" 
ON public.backlog_tasks 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view their own or assigned tasks" 
ON public.backlog_tasks 
FOR SELECT 
USING (
  auth.uid() = created_by OR 
  auth.uid() = assigned_to
);

-- 2. FIX: Contact Submissions - Restrict SELECT to admins only
-- Previous policy allowed users to read submissions if they knew the email address
DROP POLICY IF EXISTS "Users can view their own contact submissions or admins can view" ON public.contact_submissions;

CREATE POLICY "Only admins can view contact submissions" 
ON public.contact_submissions 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- 3. FIX: Download Requests - Restrict SELECT to admins only
-- Previous policy allowed users to read download requests if they knew the email address
DROP POLICY IF EXISTS "Users can view their own download requests or admins can view a" ON public.download_requests;

CREATE POLICY "Only admins can view download requests" 
ON public.download_requests 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));