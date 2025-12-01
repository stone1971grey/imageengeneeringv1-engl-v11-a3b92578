import { useState, memo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Trash2, Plus, Copy } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { CopySegmentDialog } from './CopySegmentDialog';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQEditorProps {
  data: any;
  onChange: (newData: any) => void;
  onSave: () => void;
  currentPageSlug: string;
  segmentId: string;
}

const FAQEditor = ({ data, onChange, onSave, currentPageSlug, segmentId }: FAQEditorProps) => {
  const [loading, setLoading] = useState(false);
  const [copyDialogOpen, setCopyDialogOpen] = useState(false);

  const title = data?.title || '';
  const subtext = data?.subtext || '';
  const items = data?.items || [{ question: '', answer: '' }];

  const handleSave = async () => {
    setLoading(true);
    try {
      await onSave();
      toast.success('FAQ saved successfully');
    } catch (error) {
      console.error('Error saving FAQ:', error);
      toast.error('Failed to save FAQ');
    } finally {
      setLoading(false);
    }
  };

  const addItem = () => {
    const newItems = [...items, { question: '', answer: '' }];
    onChange({ ...data, items: newItems });
  };

  const removeItem = (index: number) => {
    const newItems = items.filter((_: any, i: number) => i !== index);
    onChange({ ...data, items: newItems });
  };

  const updateItem = (index: number, field: 'question' | 'answer', value: string) => {
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
              placeholder="e.g., Frequently Asked Questions"
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>FAQ Items</CardTitle>
            <Button onClick={addItem} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add FAQ
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {items.map((item: FAQItem, index: number) => (
            <Card key={index} className="border-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">FAQ {index + 1}</CardTitle>
                  {items.length > 1 && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete FAQ</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this FAQ item? This action cannot be undone.
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
                  <Label htmlFor={`question-${index}`}>Question</Label>
                  <Input
                    id={`question-${index}`}
                    value={item.question}
                    onChange={(e) => updateItem(index, 'question', e.target.value)}
                    placeholder="Enter the question"
                  />
                </div>
                <div>
                  <Label htmlFor={`answer-${index}`}>Answer</Label>
                  <Textarea
                    id={`answer-${index}`}
                    value={item.answer}
                    onChange={(e) => updateItem(index, 'answer', e.target.value)}
                    placeholder="Enter the answer"
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-between items-center pt-4 border-t">
        <Button
          onClick={() => setCopyDialogOpen(true)}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Copy className="h-4 w-4" />
          Copy to Page...
        </Button>
        
        <Button onClick={handleSave} disabled={loading} className="bg-[#f9dc24] text-black hover:bg-[#f9dc24]/90">
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <CopySegmentDialog
        open={copyDialogOpen}
        onOpenChange={setCopyDialogOpen}
        currentPageSlug={currentPageSlug}
        segmentId={segmentId}
        segmentType="faq"
        segmentData={data}
      />
    </div>
  );
};

export default memo(FAQEditor);
