import { useState, useEffect, memo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Upload, Image as ImageIcon, Trash2 } from 'lucide-react';
import { MediaSelector } from './MediaSelector';
import { updateSegmentMapping, updateMultipleSegmentMappings } from '@/utils/updateSegmentMapping';

interface DebugImage {
  id: string;
  url: string;
  alt_text?: string;
}

interface DebugEditorProps {
  data: {
    title?: string;
    imageUrl?: string;
    images?: DebugImage[];
  };
  onChange: (data: any) => void;
  onSave: () => void;
  pageSlug: string;
  segmentId: number;
}

const DebugEditorComponent = ({ data, onChange, onSave, pageSlug, segmentId }: DebugEditorProps) => {
  const [imageUrl, setImageUrl] = useState(data.imageUrl || '');
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState<DebugImage[]>(data.images || []);

  useEffect(() => {
    setImageUrl(data.imageUrl || '');
    setImages(data.images || []);
  }, [data.imageUrl, data.images]);

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
          // Use real pageSlug so Media Management folder hierarchy matches
          pageSlug,
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

  // Multi-image handlers with ID-based tracking
  const handleMultiImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, imageId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setUploading(true);
    toast.info('🚀 Starting upload...');

    try {
      const reader = new FileReader();
      const fileData = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No active session');

      const { data: result, error } = await supabase.functions.invoke('upload-image', {
        body: {
          fileName: file.name,
          fileData: fileData,
          bucket: 'page-images',
          pageSlug,
          segmentId: segmentId
        }
      });

      if (error) throw error;
      if (!result?.success) throw new Error(result?.error || 'Upload failed');

      // ID-based update to prevent race conditions
      const updatedImages = images.map(img => 
        img.id === imageId 
          ? { ...img, url: result.url }
          : img
      );
      
      setImages(updatedImages);
      onChange({ ...data, images: updatedImages });
      toast.success('✅ Upload successful! Click "Save Changes" to store.');

      e.target.value = '';
      
    } catch (error: any) {
      console.error('[Upload] Error:', error);
      toast.error('Upload failed: ' + (error.message || 'Unknown error'));
    } finally {
      setUploading(false);
    }
  };

  const handleMediaSelect = (imageId: string, selectedUrl: string) => {
    // ID-based update
    const updatedImages = images.map(img =>
      img.id === imageId
        ? { ...img, url: selectedUrl }
        : img
    );
    
    setImages(updatedImages);
    onChange({ ...data, images: updatedImages });
    toast.success('Image selected! Click "Save Changes" to store.');
  };

  const handleRemoveImage = (imageId: string) => {
    const updatedImages = images.map(img =>
      img.id === imageId
        ? { ...img, url: '' }
        : img
    );
    
    setImages(updatedImages);
    onChange({ ...data, images: updatedImages });
  };

  const handleAltTextChange = (imageId: string, altText: string) => {
    const updatedImages = images.map(img =>
      img.id === imageId
        ? { ...img, alt_text: altText }
        : img
    );
    
    setImages(updatedImages);
    onChange({ ...data, images: updatedImages });
  };

  const initializeImages = () => {
    if (images.length === 0) {
      const initialImages: DebugImage[] = [
        { id: crypto.randomUUID(), url: '', alt_text: '' },
        { id: crypto.randomUUID(), url: '', alt_text: '' },
        { id: crypto.randomUUID(), url: '', alt_text: '' }
      ];
      setImages(initialImages);
      onChange({ ...data, images: initialImages });
    }
  };

  useEffect(() => {
    initializeImages();
  }, []);

  const handleSave = async () => {
    if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('blob:')) {
      toast.error('Please enter a valid URL starting with http:// or https://');
      return;
    }

    toast.info('🔄 Starting Media Management sync...');

    // Sync with file_segment_mappings for Media Management
    try {
      let syncedCount = 0;

      // Handle legacy single image
      if (imageUrl) {
        toast.info(`📷 Syncing legacy image to segment ${segmentId}...`);
        const success = await updateSegmentMapping(imageUrl, segmentId, 'page-images', false);
        if (success) syncedCount++;
      }

      // Handle new multi-image array
      if (images && images.length > 0) {
        const validImageUrls = images
          .filter(img => img.url && img.url.trim() !== '')
          .map(img => img.url);
        
        toast.info(`📸 Found ${validImageUrls.length} multi-images to sync...`);
        
        if (validImageUrls.length > 0) {
          validImageUrls.forEach((url, idx) => {
            toast.info(`🔗 Image ${idx + 1}: ${url.substring(0, 60)}...`);
          });
          
          const count = await updateMultipleSegmentMappings(validImageUrls, segmentId, 'page-images', true);
          syncedCount += count;
        }
      }

      toast.success(`✅ Successfully synced ${syncedCount} image(s) to Media Management!`);
    } catch (error: any) {
      toast.error(`❌ Sync error: ${error.message || 'Unknown error'}`);
    }

    onSave();
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
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border relative">
              <p className="text-xs text-gray-600 mb-2 font-semibold">Preview:</p>
              <Button
                size="sm"
                variant="destructive"
                className="absolute top-2 right-2"
                onClick={() => handleImageUrlChange('')}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
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

        {/* Multi-Image Upload Section */}
        <div className="border-t pt-6 space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Multi-Image Upload Test</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Test section with 3 image slots to reproduce and test multi-image upload race conditions
            </p>
          </div>

          {images.map((image, index) => (
            <div key={image.id} className="border rounded-lg p-4 space-y-3 bg-gray-50">
              <div className="flex items-center justify-between">
                <Label className="font-semibold">Image Slot {index + 1}</Label>
                <span className="text-xs font-mono text-blue-600 bg-blue-50 px-2 py-1 rounded">
                  ID: {image.id.slice(0, 8)}...
                </span>
              </div>

              {image.url && (
                <div className="relative">
                  <img
                    src={image.url}
                    alt={image.alt_text || `Debug image ${index + 1}`}
                    className="w-full h-40 object-cover rounded"
                  />
                  <Button
                    size="sm"
                    variant="destructive"
                    className="absolute top-2 right-2"
                    onClick={() => handleRemoveImage(image.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              )}

              <div className="flex gap-2">
                <MediaSelector
                  onFileSelect={(file) => {
                    const fakeEvent = {
                      target: { 
                        files: [file],
                        value: ''
                      }
                    } as any;
                    handleMultiImageUpload(fakeEvent, image.id);
                  }}
                  onMediaSelect={(url) => handleMediaSelect(image.id, url)}
                  currentImageUrl={image.url}
                  label={`Image ${index + 1}`}
                />
              </div>

              <Input
                placeholder="Alt text (optional)"
                value={image.alt_text || ''}
                onChange={(e) => handleAltTextChange(image.id, e.target.value)}
                className="text-sm"
              />
            </div>
          ))}
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

const DebugEditor = memo(DebugEditorComponent);
export default DebugEditor;
