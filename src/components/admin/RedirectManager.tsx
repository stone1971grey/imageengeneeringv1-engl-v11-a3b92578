import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Save, 
  X, 
  ExternalLink,
  ArrowRight,
  Loader2,
  Link2,
  RefreshCw
} from 'lucide-react';

interface Redirect {
  id: string;
  source_url: string;
  target_url: string;
  redirect_type: number;
  is_active: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface RedirectManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RedirectManager = ({ isOpen, onClose }: RedirectManagerProps) => {
  const [redirects, setRedirects] = useState<Redirect[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    source_url: '',
    target_url: '',
    redirect_type: 301,
    notes: ''
  });

  const fetchRedirects = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('redirects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRedirects(data || []);
    } catch (error) {
      console.error('Error fetching redirects:', error);
      toast.error('Failed to load redirects');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchRedirects();
    }
  }, [isOpen]);

  const handleAdd = async () => {
    if (!formData.source_url || !formData.target_url) {
      toast.error('Source URL and Target URL are required');
      return;
    }

    try {
      const { error } = await supabase
        .from('redirects')
        .insert({
          source_url: formData.source_url,
          target_url: formData.target_url,
          redirect_type: formData.redirect_type,
          notes: formData.notes || null
        });

      if (error) throw error;

      toast.success('Redirect created successfully');
      setFormData({ source_url: '', target_url: '', redirect_type: 301, notes: '' });
      setIsAdding(false);
      fetchRedirects();
    } catch (error: any) {
      console.error('Error creating redirect:', error);
      if (error.code === '23505') {
        toast.error('A redirect for this source URL already exists');
      } else {
        toast.error('Failed to create redirect');
      }
    }
  };

  const handleUpdate = async (id: string) => {
    try {
      const { error } = await supabase
        .from('redirects')
        .update({
          source_url: formData.source_url,
          target_url: formData.target_url,
          redirect_type: formData.redirect_type,
          notes: formData.notes || null
        })
        .eq('id', id);

      if (error) throw error;

      toast.success('Redirect updated successfully');
      setEditingId(null);
      fetchRedirects();
    } catch (error) {
      console.error('Error updating redirect:', error);
      toast.error('Failed to update redirect');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this redirect?')) return;

    try {
      const { error } = await supabase
        .from('redirects')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Redirect deleted');
      fetchRedirects();
    } catch (error) {
      console.error('Error deleting redirect:', error);
      toast.error('Failed to delete redirect');
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('redirects')
        .update({ is_active: !isActive })
        .eq('id', id);

      if (error) throw error;

      toast.success(`Redirect ${!isActive ? 'activated' : 'deactivated'}`);
      fetchRedirects();
    } catch (error) {
      console.error('Error toggling redirect:', error);
      toast.error('Failed to toggle redirect');
    }
  };

  const startEdit = (redirect: Redirect) => {
    setEditingId(redirect.id);
    setFormData({
      source_url: redirect.source_url,
      target_url: redirect.target_url,
      redirect_type: redirect.redirect_type,
      notes: redirect.notes || ''
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setIsAdding(false);
    setFormData({ source_url: '', target_url: '', redirect_type: 301, notes: '' });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-[900px] max-h-[85vh] overflow-hidden bg-zinc-900 border-zinc-700">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl text-white">
            <div className="p-2 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg border border-white/10">
              <Link2 className="h-5 w-5 text-blue-400" />
            </div>
            Redirect Manager
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Manage 301/302 URL redirects for SEO and site migrations
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-between py-3 border-b border-zinc-700">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-green-400 border-green-500/30">
              {redirects.filter(r => r.is_active).length} Active
            </Badge>
            <Badge variant="outline" className="text-gray-400 border-gray-500/30">
              {redirects.length} Total
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchRedirects}
              className="text-gray-400 hover:text-white"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button
              onClick={() => {
                setIsAdding(true);
                setEditingId(null);
                setFormData({ source_url: '', target_url: '', redirect_type: 301, notes: '' });
              }}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              disabled={isAdding}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Redirect
            </Button>
          </div>
        </div>

        {/* Add New Form */}
        {isAdding && (
          <div className="p-4 bg-zinc-800/50 border border-zinc-700 rounded-lg space-y-4">
            <h4 className="font-semibold text-white flex items-center gap-2">
              <Plus className="h-4 w-4 text-blue-400" />
              New Redirect
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-white">Source URL</Label>
                <Input
                  value={formData.source_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, source_url: e.target.value }))}
                  placeholder="https://old-site.com/old-page"
                  className="bg-zinc-700 border-zinc-600 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white">Target URL</Label>
                <Input
                  value={formData.target_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, target_url: e.target.value }))}
                  placeholder="/new-page or https://..."
                  className="bg-zinc-700 border-zinc-600 text-white"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-white">Redirect Type</Label>
                <Select
                  value={String(formData.redirect_type)}
                  onValueChange={(val) => setFormData(prev => ({ ...prev, redirect_type: Number(val) }))}
                >
                  <SelectTrigger className="bg-zinc-700 border-zinc-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    <SelectItem value="301">301 - Permanent</SelectItem>
                    <SelectItem value="302">302 - Temporary</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-white">Notes (optional)</Label>
                <Input
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Migration from old site..."
                  className="bg-zinc-700 border-zinc-600 text-white"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={cancelEdit} className="text-gray-400">
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleAdd} className="bg-green-600 hover:bg-green-700 text-white">
                <Save className="h-4 w-4 mr-2" />
                Save Redirect
              </Button>
            </div>
          </div>
        )}

        {/* Redirects List */}
        <ScrollArea className="h-[400px] pr-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : redirects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <Link2 className="h-12 w-12 mb-4 opacity-50" />
              <p className="text-lg font-medium">No redirects configured</p>
              <p className="text-sm">Add your first redirect to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {redirects.map((redirect) => (
                <div
                  key={redirect.id}
                  className={`p-4 rounded-lg border transition-colors ${
                    redirect.is_active 
                      ? 'bg-zinc-800/50 border-zinc-700 hover:border-zinc-600' 
                      : 'bg-zinc-800/30 border-zinc-800 opacity-60'
                  }`}
                >
                  {editingId === redirect.id ? (
                    // Edit Mode
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-white text-sm">Source URL</Label>
                          <Input
                            value={formData.source_url}
                            onChange={(e) => setFormData(prev => ({ ...prev, source_url: e.target.value }))}
                            className="bg-zinc-700 border-zinc-600 text-white h-9"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-white text-sm">Target URL</Label>
                          <Input
                            value={formData.target_url}
                            onChange={(e) => setFormData(prev => ({ ...prev, target_url: e.target.value }))}
                            className="bg-zinc-700 border-zinc-600 text-white h-9"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <Select
                          value={String(formData.redirect_type)}
                          onValueChange={(val) => setFormData(prev => ({ ...prev, redirect_type: Number(val) }))}
                        >
                          <SelectTrigger className="bg-zinc-700 border-zinc-600 text-white h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-zinc-800 border-zinc-700">
                            <SelectItem value="301">301 - Permanent</SelectItem>
                            <SelectItem value="302">302 - Temporary</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input
                          value={formData.notes}
                          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                          placeholder="Notes..."
                          className="bg-zinc-700 border-zinc-600 text-white h-9"
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={cancelEdit} className="text-gray-400">
                          Cancel
                        </Button>
                        <Button size="sm" onClick={() => handleUpdate(redirect.id)} className="bg-green-600 hover:bg-green-700">
                          <Save className="h-3 w-3 mr-1" />
                          Save
                        </Button>
                      </div>
                    </div>
                  ) : (
                    // View Mode
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge 
                            className={redirect.redirect_type === 301 
                              ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                              : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                            }
                          >
                            {redirect.redirect_type}
                          </Badge>
                          <Switch
                            checked={redirect.is_active}
                            onCheckedChange={() => handleToggleActive(redirect.id, redirect.is_active)}
                            className="data-[state=checked]:bg-green-500"
                          />
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-gray-300 truncate max-w-[280px]" title={redirect.source_url}>
                            {redirect.source_url}
                          </span>
                          <ArrowRight className="h-4 w-4 text-gray-500 flex-shrink-0" />
                          <span className="text-blue-400 truncate max-w-[280px]" title={redirect.target_url}>
                            {redirect.target_url}
                          </span>
                        </div>
                        {redirect.notes && (
                          <p className="text-xs text-gray-500 mt-1">{redirect.notes}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => startEdit(redirect)}
                          className="h-8 w-8 text-gray-400 hover:text-white"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(redirect.id)}
                          className="h-8 w-8 text-gray-400 hover:text-red-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
