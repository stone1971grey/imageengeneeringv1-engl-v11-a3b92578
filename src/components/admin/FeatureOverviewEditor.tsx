import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Trash2, Plus } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface FeatureItem {
  title: string;
  description: string;
}

interface FeatureOverviewEditorProps {
  segmentId: number;
  pageSlug: string;
}

const FeatureOverviewEditor = ({ segmentId, pageSlug }: FeatureOverviewEditorProps) => {
  const [title, setTitle] = useState('');
  const [subtext, setSubtext] = useState('');
  const [layout, setLayout] = useState<'1' | '2' | '3'>('3');
  const [items, setItems] = useState<FeatureItem[]>([
    { title: '', description: '' }
  ]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadContent();
  }, [segmentId, pageSlug]);

  const loadContent = async () => {
    try {
      const { data, error } = await supabase
        .from('page_content')
        .select('content_type, content_value')
        .eq('page_slug', pageSlug)
        .eq('section_key', `segment_${segmentId}`)
        .maybeSingle();

      if (error) throw error;

      if (data?.content_value) {
        const content = typeof data.content_value === 'string' 
          ? JSON.parse(data.content_value) 
          : data.content_value;
        
        setTitle(content.title || '');
        setSubtext(content.subtext || '');
        setLayout(content.layout || '3');
        setItems(content.items || [{ title: '', description: '' }]);
      }
    } catch (error) {
      console.error('Error loading feature overview content:', error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const content = {
        title,
        subtext,
        layout,
        items
      };

      const { error } = await supabase
        .from('page_content')
        .upsert({
          page_slug: pageSlug,
          section_key: `segment_${segmentId}`,
          content_type: 'json',
          content_value: JSON.stringify(content)
        });

      if (error) throw error;

      toast.success('Feature Overview saved successfully');
    } catch (error) {
      console.error('Error saving feature overview:', error);
      toast.error('Failed to save Feature Overview');
    } finally {
      setLoading(false);
    }
  };

  const addItem = () => {
    setItems([...items, { title: '', description: '' }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: 'title' | 'description', value: string) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Section Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">Section Title (H2)</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Key Benefits of LE7"
            />
          </div>

          <div>
            <Label htmlFor="subtext">Subtext (optional)</Label>
            <Textarea
              id="subtext"
              value={subtext}
              onChange={(e) => setSubtext(e.target.value)}
              placeholder="Optional description text below the title"
              rows={2}
            />
          </div>

          <div>
            <Label htmlFor="layout">Column Layout</Label>
            <Select value={layout} onValueChange={(value: '1' | '2' | '3') => setLayout(value)}>
              <SelectTrigger id="layout">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 Column</SelectItem>
                <SelectItem value="2">2 Columns</SelectItem>
                <SelectItem value="3">3 Columns</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Feature Items</CardTitle>
            <Button onClick={addItem} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {items.map((item, index) => (
            <Card key={index} className="border-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Item {index + 1}</CardTitle>
                  {items.length > 1 && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Item</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this item? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => removeItem(index)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor={`item-title-${index}`}>Title (H3)</Label>
                  <Input
                    id={`item-title-${index}`}
                    value={item.title}
                    onChange={(e) => updateItem(index, 'title', e.target.value)}
                    placeholder="Feature title"
                  />
                </div>
                <div>
                  <Label htmlFor={`item-description-${index}`}>Description</Label>
                  <Textarea
                    id={`item-description-${index}`}
                    value={item.description}
                    onChange={(e) => updateItem(index, 'description', e.target.value)}
                    placeholder="Feature description"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={loading} className="w-full">
        {loading ? 'Saving...' : 'Save Changes'}
      </Button>
    </div>
  );
};

export default FeatureOverviewEditor;
