import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  const [imageUrl, setImageUrl] = useState(data.imageUrl || '');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setImageUrl(data.imageUrl || '');
  }, [data.imageUrl]);

  const handleImageUrlChange = (url: string) => {
    setImageUrl(url);
    onChange({ ...data, imageUrl: url });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('=== FILE INPUT ONCHANGE FIRED ===');
    toast.success('✅ onChange event detected!', { duration: 2000 });
    
    const file = e.target.files?.[0];
    if (!file) {
      console.log('No file selected');
      toast.error('No file selected');
      return;
    }
    
    console.log('File details:', { name: file.name, size: file.size, type: file.type });
    
    // Validate
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setUploading(true);
    toast.info('🚀 Starting upload...', { duration: 2000 });

    try {
      // Convert to base64
      const reader = new FileReader();
      const fileData = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      console.log('[Upload] File converted to base64');
      toast.info('Converting file...', { duration: 1000 });

      // Get session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session');
      }

      console.log('[Upload] Calling Edge Function...');
      toast.info('Uploading to server...', { duration: 2000 });

      // Call Edge Function
      const { data: result, error } = await supabase.functions.invoke('upload-image', {
        body: {
          fileName: file.name,
          fileData: fileData,
          bucket: 'page-images',
          folder: pageSlug,
          segmentId: segmentId
        }
      });

      console.log('[Upload] Response:', { result, error });

      if (error) throw error;
      if (!result?.success) throw new Error(result?.error || 'Upload failed');

      console.log('[Upload] Success! URL:', result.url);
      
      // Update with permanent URL in local + parent state
      handleImageUrlChange(result.url);
      toast.success('✅ Upload successful! Please click "Save Changes" to store it permanently.', { duration: 4000 });

      // Reset input
      e.target.value = '';
      
    } catch (error: any) {
      console.error('[Upload] Error:', error);
      toast.error('Upload failed: ' + (error.message || 'Unknown error'));
    } finally {
      setUploading(false);
    }
  };

  const handleSave = () => {
    if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('blob:')) {
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

        <div className="border-t pt-4 space-y-2">
          <Label htmlFor="debug-upload">File Upload (Working Method)</Label>
          <p className="text-xs text-muted-foreground mb-2">
            Upload directly to Supabase Storage via Edge Function
          </p>
          
          <Input
            id="debug-upload"
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            disabled={uploading}
            className="cursor-pointer"
          />
          
          {uploading && (
            <p className="text-sm text-blue-600 flex items-center gap-2">
              <span className="animate-spin">⏳</span>
              Uploading to server...
            </p>
          )}
          
          <p className="text-xs text-green-600 bg-green-50 p-2 rounded">
            ✅ This visible file input triggers onChange reliably. After upload completes, 
            the permanent URL will be saved above.
          </p>
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
