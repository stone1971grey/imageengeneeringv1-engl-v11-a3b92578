import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Plus, CheckCircle2, Circle, Clock, AlertCircle, Trash2, Edit } from "lucide-react";

interface BacklogTask {
  id: string;
  title: string;
  description: string | null;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string | null;
  created_at: string;
  updated_at: string;
  due_date: string | null;
  completed_at: string | null;
}

const Backlog = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<BacklogTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<BacklogTask | null>(null);
  const [user, setUser] = useState<any>(null);
  
  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<'todo' | 'in_progress' | 'done'>('todo');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [category, setCategory] = useState("");

  useEffect(() => {
    checkUser();
    loadTasks();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/auth');
      return;
    }
    setUser(user);
  };

  const loadTasks = async () => {
    const { data, error } = await supabase
      .from('backlog_tasks')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to load tasks');
      console.error(error);
    } else {
      setTasks((data || []) as BacklogTask[]);
    }
    setLoading(false);
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setStatus('todo');
    setPriority('medium');
    setCategory("");
    setEditingTask(null);
  };

  const handleSaveTask = async () => {
    if (!title.trim()) {
      toast.error('Title is required');
      return;
    }

    const taskData = {
      title,
      description: description || null,
      status,
      priority,
      category: category || null,
    };

    if (editingTask) {
      const { error } = await supabase
        .from('backlog_tasks')
        .update(taskData)
        .eq('id', editingTask.id);

      if (error) {
        toast.error('Failed to update task');
        console.error(error);
      } else {
        toast.success('Task updated successfully');
        loadTasks();
        setIsDialogOpen(false);
        resetForm();
      }
    } else {
      const { error } = await supabase
        .from('backlog_tasks')
        .insert([taskData]);

      if (error) {
        toast.error('Failed to create task');
        console.error(error);
      } else {
        toast.success('Task created successfully');
        loadTasks();
        setIsDialogOpen(false);
        resetForm();
      }
    }
  };

  const handleEditTask = (task: BacklogTask) => {
    setEditingTask(task);
    setTitle(task.title);
    setDescription(task.description || "");
    setStatus(task.status);
    setPriority(task.priority);
    setCategory(task.category || "");
    setIsDialogOpen(true);
  };

  const handleDeleteTask = async (id: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    const { error } = await supabase
      .from('backlog_tasks')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Failed to delete task');
      console.error(error);
    } else {
      toast.success('Task deleted');
      loadTasks();
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: 'todo' | 'in_progress' | 'done') => {
    const { error } = await supabase
      .from('backlog_tasks')
      .update({ status: newStatus })
      .eq('id', taskId);

    if (error) {
      toast.error('Failed to update status');
      console.error(error);
    } else {
      toast.success('Status updated');
      loadTasks();
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const tasksByStatus = {
    todo: tasks.filter(t => t.status === 'todo'),
    in_progress: tasks.filter(t => t.status === 'in_progress'),
    done: tasks.filter(t => t.status === 'done'),
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-xl">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div aria-hidden="true" className="block h-[80px]" />
      
      <div className="container mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Development Backlog</h1>
            <p className="text-muted-foreground">Track features, improvements, and technical tasks</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="bg-[#f9dc24] hover:bg-yellow-400 text-black">
                <Plus className="mr-2 h-4 w-4" />
                New Task
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingTask ? 'Edit Task' : 'Create New Task'}</DialogTitle>
                <DialogDescription>
                  {editingTask ? 'Update the task details below' : 'Add a new task to the backlog'}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Task title"
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Task description"
                    rows={4}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select value={status} onValueChange={(val: any) => setStatus(val)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todo">To Do</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="done">Done</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Select value={priority} onValueChange={(val: any) => setPriority(val)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g., Feature, Bug, Enhancement, Technical"
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <Button variant="outline" onClick={() => {
                  setIsDialogOpen(false);
                  resetForm();
                }}>
                  Cancel
                </Button>
                <Button onClick={handleSaveTask} className="bg-[#f9dc24] hover:bg-yellow-400 text-black">
                  {editingTask ? 'Update' : 'Create'} Task
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Kanban Board */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* To Do */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Circle className="h-5 w-5 text-gray-400" />
              <h2 className="text-xl font-semibold">To Do</h2>
              <Badge variant="secondary">{tasksByStatus.todo.length}</Badge>
            </div>
            
            {tasksByStatus.todo.map((task) => (
              <Card key={task.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{task.title}</CardTitle>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => handleEditTask(task)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteTask(task.id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                  {task.description && <CardDescription className="line-clamp-2">{task.description}</CardDescription>}
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex gap-2">
                    <Badge className={`${getPriorityColor(task.priority)} text-white`}>{task.priority}</Badge>
                    {task.category && <Badge variant="outline">{task.category}</Badge>}
                  </div>
                  <Button size="sm" variant="outline" className="w-full" onClick={() => handleStatusChange(task.id, 'in_progress')}>
                    Start
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* In Progress */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-5 w-5 text-blue-600" />
              <h2 className="text-xl font-semibold">In Progress</h2>
              <Badge variant="secondary">{tasksByStatus.in_progress.length}</Badge>
            </div>
            
            {tasksByStatus.in_progress.map((task) => (
              <Card key={task.id} className="border-blue-200">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{task.title}</CardTitle>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => handleEditTask(task)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteTask(task.id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                  {task.description && <CardDescription className="line-clamp-2">{task.description}</CardDescription>}
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex gap-2">
                    <Badge className={`${getPriorityColor(task.priority)} text-white`}>{task.priority}</Badge>
                    {task.category && <Badge variant="outline">{task.category}</Badge>}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1" onClick={() => handleStatusChange(task.id, 'todo')}>Back</Button>
                    <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700" onClick={() => handleStatusChange(task.id, 'done')}>Done</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Done */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <h2 className="text-xl font-semibold">Done</h2>
              <Badge variant="secondary">{tasksByStatus.done.length}</Badge>
            </div>
            
            {tasksByStatus.done.map((task) => (
              <Card key={task.id} className="border-green-200 opacity-75">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg line-through">{task.title}</CardTitle>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => handleEditTask(task)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteTask(task.id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                  {task.description && <CardDescription className="line-clamp-2">{task.description}</CardDescription>}
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex gap-2">
                    <Badge className={`${getPriorityColor(task.priority)} text-white`}>{task.priority}</Badge>
                    {task.category && <Badge variant="outline">{task.category}</Badge>}
                  </div>
                  <Button size="sm" variant="outline" className="w-full" onClick={() => handleStatusChange(task.id, 'in_progress')}>Reopen</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {tasks.length === 0 && (
          <div className="text-center py-20">
            <AlertCircle className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-2xl font-semibold mb-2">No tasks yet</h3>
            <p className="text-muted-foreground mb-6">Create your first task to get started</p>
            <Button onClick={() => setIsDialogOpen(true)} className="bg-[#f9dc24] hover:bg-yellow-400 text-black">
              <Plus className="mr-2 h-4 w-4" />
              Create First Task
            </Button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Backlog;
