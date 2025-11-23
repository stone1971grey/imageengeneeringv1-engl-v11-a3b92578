import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
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
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setUploading(true);
    console.log('[DebugEditor] Starting upload...', { file: file.name, size: file.size });

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `debug-${segmentId}-${Date.now()}.${fileExt}`;
      const filePath = `${pageSlug}/${fileName}`;

      console.log('[DebugEditor] Uploading to:', filePath);

      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('page-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('[DebugEditor] Upload error:', uploadError);
        throw uploadError;
      }

      console.log('[DebugEditor] Upload successful:', uploadData);

      const { data: { publicUrl } } = supabase.storage
        .from('page-images')
        .getPublicUrl(filePath);

      console.log('[DebugEditor] Public URL:', publicUrl);

      onChange({ ...data, imageUrl: publicUrl });
      toast.success('Image uploaded successfully!');

      // Reset file input
      e.target.value = '';
    } catch (error: any) {
      console.error('[DebugEditor] Upload failed:', error);
      toast.error('Failed to upload image: ' + error.message);
    } finally {
      setUploading(false);
    }
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
          <Label>Upload Image</Label>
          <p className="text-sm text-muted-foreground mb-2">
            Test the image upload pipeline
          </p>
          
          {data.imageUrl && (
            <div className="mb-4 p-4 bg-gray-50 rounded-lg border">
              <img
                src={data.imageUrl}
                alt="Debug preview"
                className="max-h-48 mx-auto object-contain"
              />
              <p className="text-xs text-center text-gray-600 mt-2 break-all">{data.imageUrl}</p>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            disabled={uploading}
            className="hidden"
          />
          
          <Button
            type="button"
            onClick={() => {
              console.log('[DebugEditor] Button clicked, triggering file input');
              fileInputRef.current?.click();
            }}
            disabled={uploading}
            variant="outline"
            className="w-full"
          >
            {uploading ? (
              <>
                <Upload className="h-4 w-4 mr-2 animate-pulse" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Choose Image
              </>
            )}
          </Button>
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button
            onClick={onSave}
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
