import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

interface DebugEditorProps {
  data: {
    title?: string;
    imageUrl?: string;
  };
  onChange: (data: any) => void;
  onSave: () => void;
  pageSlug: string;
  segmentId: number;
}

const DebugEditor = ({ data, onChange, onSave, pageSlug, segmentId }: DebugEditorProps) => {
  const [imageUrl, setImageUrl] = useState(data.imageUrl || '');

  const handleImageUrlChange = (url: string) => {
    setImageUrl(url);
    onChange({ ...data, imageUrl: url });
  };

  const handleSave = () => {
    if (imageUrl && !imageUrl.startsWith('http')) {
      toast.error('Please enter a valid URL starting with http:// or https://');
      return;
    }
    onSave();
    toast.success('Debug segment saved!');
  };


  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Debug Segment
          <span className="text-xs font-normal text-muted-foreground">[Segment ID: {segmentId}]</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="debug-title">Title (Optional)</Label>
          <Input
            id="debug-title"
            value={data.title || ''}
            onChange={(e) => onChange({ ...data, title: e.target.value })}
            placeholder="Enter debug title"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="debug-image-url">Image URL</Label>
          <Input
            id="debug-image-url"
            type="url"
            value={imageUrl}
            onChange={(e) => handleImageUrlChange(e.target.value)}
            placeholder="https://example.com/image.jpg"
          />
          <p className="text-xs text-muted-foreground">
            Enter a direct image URL (e.g., from Supabase Storage, Unsplash, or any CDN)
          </p>
          
          {imageUrl && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
              <p className="text-xs text-gray-600 mb-2 font-semibold">Preview:</p>
              <img
                src={imageUrl}
                alt="Preview"
                className="max-h-64 mx-auto object-contain rounded"
                onError={(e) => {
                  e.currentTarget.src = '';
                  e.currentTarget.alt = 'Failed to load image';
                  toast.error('Failed to load image from URL');
                }}
              />
              <p className="text-xs text-center text-gray-500 mt-2 break-all">{imageUrl}</p>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button
            onClick={handleSave}
            className="bg-[#f9dc24] text-black hover:bg-[#f9dc24]/90"
          >
            Save Changes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DebugEditor;
