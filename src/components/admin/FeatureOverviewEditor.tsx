import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Trash2, Plus } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface FeatureItem {
  title: string;
  description: string;
}

interface FeatureOverviewEditorProps {
  data: any;
  onChange: (newData: any) => void;
  onSave: () => void;
}

const FeatureOverviewEditor = ({ data, onChange, onSave }: FeatureOverviewEditorProps) => {
  const [loading, setLoading] = useState(false);

  const title = data?.title || '';
  const subtext = data?.subtext || '';
  const layout = data?.layout || '3';
  const rows = data?.rows || '1';
  const items = data?.items || [{ title: '', description: '' }];

  const handleSave = async () => {
    setLoading(true);
    try {
      await onSave();
      toast.success('Feature Overview saved successfully');
    } catch (error) {
      console.error('Error saving feature overview:', error);
      toast.error('Failed to save Feature Overview');
    } finally {
      setLoading(false);
    }
  };

  const addItem = () => {
    const newItems = [...items, { title: '', description: '' }];
    onChange({ ...data, items: newItems });
  };

  const removeItem = (index: number) => {
    const newItems = items.filter((_: any, i: number) => i !== index);
    onChange({ ...data, items: newItems });
  };

  const updateItem = (index: number, field: 'title' | 'description', value: string) => {
    const newItems = [...items];
    newItems[index][field] = value;
    onChange({ ...data, items: newItems });
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
              onChange={(e) => onChange({ ...data, title: e.target.value })}
              placeholder="e.g., Key Benefits of LE7"
            />
          </div>

          <div>
            <Label htmlFor="subtext">Subtext (optional)</Label>
            <Textarea
              id="subtext"
              value={subtext}
              onChange={(e) => onChange({ ...data, subtext: e.target.value })}
              placeholder="Optional description text below the title"
              rows={2}
            />
          </div>

          <div>
            <Label htmlFor="layout">Columns per Row</Label>
            <Select value={layout} onValueChange={(value: '1' | '2' | '3') => onChange({ ...data, layout: value })}>
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

          <div>
            <Label htmlFor="rows">Number of Rows</Label>
            <Select value={rows} onValueChange={(value: '1' | '2' | '3') => onChange({ ...data, rows: value })}>
              <SelectTrigger id="rows">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 Row</SelectItem>
                <SelectItem value="2">2 Rows</SelectItem>
                <SelectItem value="3">3 Rows</SelectItem>
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

      <div className="flex justify-end pt-4 border-t">
        <Button onClick={handleSave} disabled={loading} className="bg-[#f9dc24] text-black hover:bg-[#f9dc24]/90">
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
};

export default FeatureOverviewEditor;
