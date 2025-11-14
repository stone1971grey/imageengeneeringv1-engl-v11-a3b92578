-- Create backlog_tasks table for task management
CREATE TABLE IF NOT EXISTS public.backlog_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'done')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  category TEXT,
  assigned_to UUID REFERENCES auth.users(id),
  created_by UUID NOT NULL DEFAULT auth.uid(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  due_date TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security
ALTER TABLE public.backlog_tasks ENABLE ROW LEVEL SECURITY;

-- Admins can do everything
CREATE POLICY "Admins can manage all backlog tasks"
ON public.backlog_tasks
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Users can view all tasks
CREATE POLICY "Users can view all backlog tasks"
ON public.backlog_tasks
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Users can create tasks
CREATE POLICY "Users can create backlog tasks"
ON public.backlog_tasks
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Users can update their own tasks or tasks assigned to them
CREATE POLICY "Users can update their own or assigned tasks"
ON public.backlog_tasks
FOR UPDATE
USING (auth.uid() = created_by OR auth.uid() = assigned_to);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_backlog_tasks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  IF NEW.status = 'done' AND OLD.status != 'done' THEN
    NEW.completed_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_backlog_tasks_updated_at
BEFORE UPDATE ON public.backlog_tasks
FOR EACH ROW
EXECUTE FUNCTION public.update_backlog_tasks_updated_at();

-- Create index for better performance
CREATE INDEX idx_backlog_tasks_status ON public.backlog_tasks(status);
CREATE INDEX idx_backlog_tasks_priority ON public.backlog_tasks(priority);
CREATE INDEX idx_backlog_tasks_created_by ON public.backlog_tasks(created_by);
CREATE INDEX idx_backlog_tasks_assigned_to ON public.backlog_tasks(assigned_to);