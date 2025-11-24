import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save, Plus, Trash2, Upload, Image as ImageIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
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

interface BannerImage {
  url: string;
  alt: string;
  metadata?: ImageMetadata;
}

interface BannerData {
  title: string;
  subtext: string;
  images: BannerImage[];
  buttonText: string;
  buttonLink: string;
  buttonStyle: string;
}

interface BannerEditorProps {
  data: BannerData;
  onChange: (data: BannerData) => void;
  onSave: () => void;
  pageSlug: string;
  segmentId: string;
}

const BannerEditor = ({ data, onChange, onSave, pageSlug, segmentId }: BannerEditorProps) => {
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);

  const handleImageUpload = async (index: number, file: File) => {
    setUploadingIndex(index);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${pageSlug}_banner_${segmentId}_${index}_${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('page-images')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('page-images')
        .getPublicUrl(filePath);

      const metadataWithoutAlt = await extractImageMetadata(file, urlData.publicUrl);
      const metadata: ImageMetadata = {
        ...metadataWithoutAlt,
        altText: data.images[index]?.alt || ''
      };

      const updatedImages = [...data.images];
      updatedImages[index] = {
        ...updatedImages[index],
        url: urlData.publicUrl,
        metadata
      };
      
      // Update local state
      onChange({ ...data, images: updatedImages });
      
      // Auto-save after successful upload
      await autoSaveAfterUpload({ ...data, images: updatedImages });
      
      toast.success("Image uploaded and saved successfully!");
    } catch (error: any) {
      toast.error("Error uploading image: " + error.message);
    } finally {
      setUploadingIndex(null);
    }
  };

  const autoSaveAfterUpload = async (updatedData: BannerData) => {
    try {
      const { data: pageContentData, error: fetchError } = await supabase
        .from("page_content")
        .select("*")
        .eq("page_slug", pageSlug)
        .eq("section_key", "page_segments")
        .single();

      if (fetchError || !pageContentData) {
        console.error("Error loading page_segments:", fetchError);
        return;
      }

      const segments = JSON.parse(pageContentData.content_value);
      const updatedSegments = segments.map((seg: any) => {
        if (seg.type === "banner" && String(seg.id) === String(segmentId)) {
          return { ...seg, data: updatedData };
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
        .eq("section_key", "page_segments");

      if (updateError) {
        console.error("Auto-save error:", updateError);
      } else {
        console.log("✅ Image auto-saved to database");
        onSave?.();
      }
    } catch (e) {
      console.error("Auto-save failed:", e);
    }
  };

  const handleAddImage = () => {
    onChange({
      ...data,
      images: [...data.images, { url: '', alt: '' }]
    });
  };

  const handleDeleteImage = (index: number) => {
    const updatedImages = data.images.filter((_, i) => i !== index);
    onChange({ ...data, images: updatedImages });
    setDeleteIndex(null);
  };

  const handleImageChange = (index: number, field: keyof BannerImage, value: string) => {
    const updatedImages = [...data.images];
    updatedImages[index] = { ...updatedImages[index], [field]: value };
    onChange({ ...data, images: updatedImages });
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <Label className="text-white text-lg font-semibold mb-2 block">Banner Title</Label>
        <Input
          value={data.title || ''}
          onChange={(e) => onChange({ ...data, title: e.target.value })}
          placeholder="Enter banner title"
          className="bg-white border-2 border-gray-300 focus:border-[#f9dc24] text-xl text-black placeholder:text-gray-400 h-12"
        />
      </div>

      {/* Subtext */}
      <div>
        <Label className="text-white text-lg font-semibold mb-2 block">Subtext (Optional)</Label>
        <Textarea
          value={data.subtext || ''}
          onChange={(e) => onChange({ ...data, subtext: e.target.value })}
          placeholder="Enter optional subtext"
          className="bg-white border-2 border-gray-300 focus:border-[#f9dc24] text-black placeholder:text-gray-400 min-h-[80px]"
        />
      </div>

      {/* Images */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <Label className="text-white text-lg font-semibold">Banner Images (Logos/Icons)</Label>
          <Button
            type="button"
            onClick={handleAddImage}
            className="bg-[#f9dc24] text-black hover:bg-[#f9dc24]/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Image
          </Button>
        </div>

        <div className="space-y-4">
          {data.images.map((image, index) => (
            <div key={index} className="bg-gray-700 rounded-lg p-6 border border-gray-600">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-white font-semibold">Image {index + 1}</h4>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => setDeleteIndex(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-4">
                {/* Image Upload */}
                <div>
                  <Label className="text-white mb-2 block">Image File</Label>
                  <div className="flex items-center gap-4">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(index, file);
                      }}
                      className="bg-white border-2 border-gray-300 text-black"
                      disabled={uploadingIndex === index}
                    />
                    {uploadingIndex === index && (
                      <span className="text-[#f9dc24]">Uploading...</span>
                    )}
                  </div>
                  {image.url && (
                    <div className="mt-4 p-4 bg-gray-800 rounded">
                      <img
                        src={image.url}
                        alt={image.alt || `Banner image ${index + 1}`}
                        className="max-h-32 max-w-full object-contain mx-auto"
                      />
                    </div>
                  )}
                </div>

                {/* Alt Text */}
                <div>
                  <Label className="text-white mb-2 block">Alt Text</Label>
                  <Input
                    value={image.alt || ''}
                    onChange={(e) => handleImageChange(index, 'alt', e.target.value)}
                    placeholder="Descriptive alt text"
                    className="bg-white border-2 border-gray-300 focus:border-[#f9dc24] text-black placeholder:text-gray-400"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Button Settings */}
      <div className="bg-gray-700 rounded-lg p-6 border border-gray-600">
        <h3 className="text-white font-semibold mb-4 text-lg">Call-to-Action Button (Optional)</h3>
        
        <div className="space-y-4">
          <div>
            <Label className="text-white mb-2 block">Button Text</Label>
            <Input
              value={data.buttonText || ''}
              onChange={(e) => onChange({ ...data, buttonText: e.target.value })}
              placeholder="e.g. Learn More"
              className="bg-white border-2 border-gray-300 focus:border-[#f9dc24] text-black placeholder:text-gray-400"
            />
          </div>

          <div>
            <Label className="text-white mb-2 block">Button Link</Label>
            <Input
              value={data.buttonLink || ''}
              onChange={(e) => onChange({ ...data, buttonLink: e.target.value })}
              placeholder="https://example.com or /path"
              className="bg-white border-2 border-gray-300 focus:border-[#f9dc24] text-black placeholder:text-gray-400"
            />
          </div>

          <div>
            <Label className="text-white mb-2 block">Button Style</Label>
            <Select
              value={data.buttonStyle || 'standard'}
              onValueChange={(value) => onChange({ ...data, buttonStyle: value })}
            >
              <SelectTrigger className="bg-white border-2 border-gray-300 text-black">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">Standard (Yellow)</SelectItem>
                <SelectItem value="technical">Technical (Dark)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-4 border-t border-gray-600">
        <Button
          onClick={onSave}
          className="bg-[#f9dc24] text-black hover:bg-[#f9dc24]/90 flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          Save Changes
        </Button>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteIndex !== null} onOpenChange={() => setDeleteIndex(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Image</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this image? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteIndex !== null && handleDeleteImage(deleteIndex)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default BannerEditor;
