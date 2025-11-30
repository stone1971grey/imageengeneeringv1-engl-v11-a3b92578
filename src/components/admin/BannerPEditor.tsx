import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import { MediaSelector } from "@/components/admin/MediaSelector";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { extractImageMetadata, ImageMetadata } from '@/types/imageMetadata';
import { updateMultipleSegmentMappings } from '@/utils/updateSegmentMapping';

interface BannerPImage {
  id: string;
  url: string;
  alt: string;
  metadata?: ImageMetadata;
}

interface BannerPData {
  title: string;
  subtext: string;
  images: BannerPImage[];
  buttonText: string;
  buttonLink: string;
  buttonStyle: string;
}

interface BannerPEditorProps {
  data: BannerPData;
  onChange: (data: BannerPData) => void;
  onSave?: () => void;
  pageSlug: string;
  segmentKey: string;
  language: string;
}

export const BannerPEditor = ({ 
  data, 
  onChange, 
  onSave, 
  pageSlug, 
  segmentKey,
  language 
}: BannerPEditorProps) => {
  const generateImageId = () => `banner-p-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

  const ensureImageIds = (images: BannerPImage[] = []): BannerPImage[] =>
    images.map((img) =>
      img.id ? img : { ...img, id: generateImageId() }
    );

  // Single source of truth - EXACTLY like DebugEditor
  const [images, setImages] = useState<BannerPImage[]>(() =>
    ensureImageIds((data.images || []) as BannerPImage[])
  );

  // Sync on external data change
  useEffect(() => {
    setImages(ensureImageIds((data.images || []) as BannerPImage[]));
  }, [segmentKey, data.images]);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  // Upload handler - EXACTLY like DebugEditor
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, imageId: string) => {
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

    setUploadingId(imageId);
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

      const segmentIdNum = parseInt(segmentKey.replace('segment_', ''));

      const { data: result, error } = await supabase.functions.invoke('upload-image', {
        body: {
          fileName: file.name,
          fileData: fileData,
          bucket: 'page-images',
          pageSlug,
          segmentId: segmentIdNum
        }
      });

      if (error) throw error;
      if (!result?.success) throw new Error(result?.error || 'Upload failed');

      const metadataWithoutAlt = await extractImageMetadata(file, result.url);

      // ID-based update - compute FIRST, then update BOTH
      const updatedImages = images.map(img => 
        img.id === imageId 
          ? { 
              ...img, 
              url: result.url, 
              metadata: { ...metadataWithoutAlt, altText: img.alt || '' }
            }
          : img
      );
      
      setImages(updatedImages);
      onChange({ ...data, images: updatedImages });
      
      const slotNumber = updatedImages.findIndex(img => img.id === imageId) + 1;
      toast.success(`✅ Slot ${slotNumber} uploaded! Click "Save Changes" to store.`);

      e.target.value = '';
      
    } catch (error: any) {
      console.error('[Upload] Error:', error);
      toast.error('Upload failed: ' + (error.message || 'Unknown error'));
    } finally {
      setUploadingId(null);
    }
  };
 
  const handleMediaSelect = (imageId: string, url: string, metadata?: any) => {
    // ID-based update
    const updatedImages = images.map(img =>
      img.id === imageId
        ? { 
            ...img, 
            url, 
            metadata: metadata ? { ...metadata, altText: img.alt || '' } : img.metadata 
          }
        : img
    );
    
    setImages(updatedImages);
    onChange({ ...data, images: updatedImages });
    
    const slotNumber = updatedImages.findIndex(img => img.id === imageId) + 1;
    toast.success(`✅ Slot ${slotNumber} selected! Click "Save Changes" to store.`);
  };

  const handleAddImage = () => {
    const newImage: BannerPImage = {
      id: generateImageId(),
      url: '',
      alt: ''
    };
    const updatedImages = [...images, newImage];
    setImages(updatedImages);
    onChange({ ...data, images: updatedImages });
  };

  const handleDeleteImage = (imageId: string) => {
    const updatedImages = images.filter(img => img.id !== imageId);
    setImages(updatedImages);
    onChange({ ...data, images: updatedImages });
    setDeleteId(null);
  };

  const handleImageChange = (imageId: string, field: keyof BannerPImage, value: string) => {
    const updatedImages = images.map(img =>
      img.id === imageId ? { ...img, [field]: value } : img
    );
    setImages(updatedImages);
    onChange({ ...data, images: updatedImages });
  };

  const handleSave = async () => {
    try {
      const dataToSave = { ...data, images: images };
      
      const { data: pageContentData, error: fetchError } = await supabase
        .from("page_content")
        .select("content_value")
        .eq("page_slug", pageSlug)
        .eq("section_key", "page_segments")
        .eq("language", language)
        .single();

      if (fetchError) throw fetchError;

      const segments = JSON.parse(pageContentData.content_value || "[]");
      const segmentId = segmentKey.replace('segment_', '');
      
      const updatedSegments = segments.map((seg: any) => {
        if (seg.type === "banner-p" && String(seg.id) === String(segmentId)) {
          return { ...seg, data: dataToSave };
        }
        return seg;
      });

      const { error: updateError } = await supabase
        .from("page_content")
        .update({
          content_value: JSON.stringify(updatedSegments),
          updated_by: (await supabase.auth.getUser()).data.user?.id,
        })
        .eq("page_slug", pageSlug)
        .eq("section_key", "page_segments")
        .eq("language", language);

      if (updateError) throw updateError;
      
      const imageUrls = images.map(img => img.url).filter(Boolean);
      if (imageUrls.length > 0) {
        await updateMultipleSegmentMappings(imageUrls, parseInt(segmentId));
      }
      
      toast.success('Banner-P saved successfully');
      if (onSave) onSave();
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Save failed');
    }
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white font-bold text-xl">
            P
          </div>
          <div>
            <h3 className="text-xl font-bold text-purple-900">Banner-P (Prototype)</h3>
            <p className="text-sm text-purple-600">Rebuilt with DebugEditor pattern</p>
          </div>
        </div>
      </div>

      <div className="space-y-6 bg-white p-6 rounded-lg border border-purple-200">
        {/* Title */}
        <div>
          <Label className="font-medium">Banner Title</Label>
          <Input
            value={data.title || ''}
            onChange={(e) => onChange({ ...data, title: e.target.value })}
            placeholder="Enter banner title"
            className="mt-2"
          />
        </div>

        {/* Subtext */}
        <div>
          <Label className="font-medium">Subtext (Optional)</Label>
          <Textarea
            value={data.subtext || ''}
            onChange={(e) => onChange({ ...data, subtext: e.target.value })}
            placeholder="Enter optional subtext"
            className="mt-2 min-h-[80px]"
          />
        </div>

        {/* Images */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <Label className="font-medium">Banner Images (Logos/Icons)</Label>
            <Button
              type="button"
              onClick={handleAddImage}
              size="sm"
              className="bg-purple-500 text-white hover:bg-purple-600"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Image
            </Button>
          </div>

          <div className="space-y-4">
            {images.map((image, index) => {
              const isUploading = uploadingId === image.id;
              const hasImage = !!image.url;
              
              return (
                <div 
                  key={image.id} 
                  className={`p-4 border-2 rounded-lg space-y-3 transition-all duration-300 ${
                    isUploading 
                      ? 'bg-purple-50 border-purple-400 animate-pulse' 
                      : hasImage
                      ? 'bg-green-50 border-green-400'
                      : 'bg-gray-50 border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">Image {index + 1}</span>
                      {isUploading && (
                        <span className="text-xs px-2 py-1 bg-purple-500 text-white rounded-full animate-pulse">
                          Uploading...
                        </span>
                      )}
                      {hasImage && !isUploading && (
                        <span className="text-xs px-2 py-1 bg-green-500 text-white rounded-full">
                          ✓ Ready
                        </span>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => setDeleteId(image.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Debug Info */}
                  <div className="mb-3 p-2 bg-purple-100 border border-purple-300 rounded text-xs font-mono space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-purple-700">Slot:</span>
                      <span className="text-purple-900">{index + 1}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-purple-700">ID:</span>
                      <span className="text-purple-900 break-all">{image.id.slice(0, 20)}...</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-purple-700">URL:</span>
                      <span className="text-purple-900 break-all truncate">
                        {image.url ? image.url.slice(0, 50) + '...' : '(empty)'}
                      </span>
                    </div>
                  </div>

                  <MediaSelector
                    onFileSelect={(file) => {
                      const fakeEvent = {
                        target: { 
                          files: [file],
                          value: ''
                        }
                      } as any;
                      handleImageUpload(fakeEvent, image.id);
                    }}
                    onMediaSelect={(url, metadata) => handleMediaSelect(image.id, url, metadata)}
                    acceptedFileTypes="image/*"
                    label="Image File"
                    currentImageUrl={image.url}
                  />

                  {image.url && (
                    <div className="mt-4 p-4 bg-white rounded relative border-2 border-purple-200">
                      <img
                        src={image.url}
                        alt={image.alt || `Banner-P image ${index + 1}`}
                        className="max-h-32 max-w-full object-contain mx-auto"
                      />
                    </div>
                  )}

                  <div>
                    <Label className="text-xs">Alt Text</Label>
                    <Input
                      value={image.alt || ''}
                      onChange={(e) => handleImageChange(image.id, 'alt', e.target.value)}
                      placeholder="Descriptive alt text"
                      className="mt-1"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Button Settings */}
        <div className="p-4 border-2 border-purple-200 rounded-lg bg-purple-50 space-y-4">
          <h3 className="font-semibold text-purple-900">Call-to-Action Button</h3>
          
          <div>
            <Label>Button Text</Label>
            <Input
              value={data.buttonText || ''}
              onChange={(e) => onChange({ ...data, buttonText: e.target.value })}
              placeholder="Button text"
              className="mt-2"
            />
          </div>

          <div>
            <Label>Button Link</Label>
            <Input
              value={data.buttonLink || ''}
              onChange={(e) => onChange({ ...data, buttonLink: e.target.value })}
              placeholder="/page or https://..."
              className="mt-2"
            />
          </div>

          <div>
            <Label>Button Style</Label>
            <Select value={data.buttonStyle} onValueChange={(value) => onChange({ ...data, buttonStyle: value })}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">Standard (Yellow)</SelectItem>
                <SelectItem value="technical">Technical (Dark)</SelectItem>
                <SelectItem value="outline-white">Outline White</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button 
          onClick={handleSave}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
        >
          Save Banner-P
        </Button>
      </div>

      <AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Image?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the image from this banner. You can add it again later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId && handleDeleteImage(deleteId)}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};
