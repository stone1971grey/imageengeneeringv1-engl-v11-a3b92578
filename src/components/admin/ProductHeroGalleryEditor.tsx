import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Upload } from 'lucide-react';
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

interface ProductImage {
  imageUrl: string;
  title: string;
  description: string;
}

interface ProductHeroGalleryData {
  title: string;
  subtitle: string;
  description: string;
  imagePosition: 'left' | 'right';
  layoutRatio: '1-1' | '2-3' | '2-5';
  topSpacing: 'small' | 'medium' | 'large' | 'extra-large';
  cta1Text: string;
  cta1Link: string;
  cta1Style: 'standard' | 'technical' | 'outline-white';
  cta2Text: string;
  cta2Link: string;
  cta2Style: 'standard' | 'technical' | 'outline-white';
  images: ProductImage[];
}

interface ProductHeroGalleryEditorProps {
  data: ProductHeroGalleryData;
  onChange: (data: ProductHeroGalleryData) => void;
  onSave: () => void;
  pageSlug: string;
  segmentId: number;
}

const ProductHeroGalleryEditor = ({ data, onChange, onSave, pageSlug, segmentId }: ProductHeroGalleryEditorProps) => {
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);

  const handleImageUpload = async (index: number, file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setUploadingIndex(index);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${pageSlug}/segment-${segmentId}/gallery-${index}-${Date.now()}.${fileExt}`;

      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('page-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('page-images')
        .getPublicUrl(fileName);

      const updatedImages = [...data.images];
      updatedImages[index] = { ...updatedImages[index], imageUrl: publicUrl };
      onChange({ ...data, images: updatedImages });

      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploadingIndex(null);
    }
  };

  const handleImageChange = (index: number, field: keyof ProductImage, value: string) => {
    const updatedImages = [...data.images];
    updatedImages[index] = { ...updatedImages[index], [field]: value };
    onChange({ ...data, images: updatedImages });
  };

  const handleAddImage = () => {
    onChange({
      ...data,
      images: [...data.images, { imageUrl: '', title: '', description: '' }]
    });
  };

  const handleDeleteImage = (index: number) => {
    const updatedImages = data.images.filter((_, i) => i !== index);
    onChange({ ...data, images: updatedImages });
    setDeleteIndex(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Product Hero Gallery Settings</h3>
        <Button onClick={onSave} style={{ backgroundColor: '#f9dc24', color: 'black' }}>
          Save Changes
        </Button>
      </div>

      {/* Text Content */}
      <div className="space-y-4">
        <div>
          <Label>Title (H1)</Label>
          <Input
            value={data.title}
            onChange={(e) => onChange({ ...data, title: e.target.value })}
            placeholder="Product Name"
          />
        </div>

        <div>
          <Label>Subtitle (H2)</Label>
          <Input
            value={data.subtitle}
            onChange={(e) => onChange({ ...data, subtitle: e.target.value })}
            placeholder="Product Variants"
          />
        </div>

        <div>
          <Label>Description</Label>
          <Textarea
            value={data.description}
            onChange={(e) => onChange({ ...data, description: e.target.value })}
            placeholder="Product description"
            rows={3}
          />
        </div>
      </div>

      {/* Layout Settings */}
      <div className="border-t pt-6 space-y-4">
        <h4 className="font-medium">Layout Settings</h4>
        
        <div>
          <Label>Image Position</Label>
          <Select value={data.imagePosition} onValueChange={(value: any) => onChange({ ...data, imagePosition: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="left">Left</SelectItem>
              <SelectItem value="right">Right</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Layout Ratio (Text:Image)</Label>
          <Select value={data.layoutRatio} onValueChange={(value: any) => onChange({ ...data, layoutRatio: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1-1">50:50</SelectItem>
              <SelectItem value="2-3">2/3:1/3</SelectItem>
              <SelectItem value="2-5">2/5:3/5</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Top Spacing</Label>
          <Select value={data.topSpacing} onValueChange={(value: any) => onChange({ ...data, topSpacing: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="small">Small (PT-16)</SelectItem>
              <SelectItem value="medium">Medium (PT-24)</SelectItem>
              <SelectItem value="large">Large (PT-32)</SelectItem>
              <SelectItem value="extra-large">Extra Large (PT-40)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* CTA Buttons */}
      <div className="border-t pt-6 space-y-4">
        <h4 className="font-medium">Call-to-Action Buttons</h4>
        
        {/* CTA 1 */}
        <div className="border rounded-lg p-4 space-y-4">
          <h5 className="font-medium text-sm">Primary Button (CTA 1)</h5>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Button Text</Label>
              <Input
                value={data.cta1Text}
                onChange={(e) => onChange({ ...data, cta1Text: e.target.value })}
                placeholder="Contact Sales"
              />
            </div>
            <div>
              <Label>Button Link</Label>
              <Input
                value={data.cta1Link}
                onChange={(e) => onChange({ ...data, cta1Link: e.target.value })}
                placeholder="#contact or /path"
              />
            </div>
          </div>
          <div>
            <Label>Button Style</Label>
            <Select value={data.cta1Style} onValueChange={(value: any) => onChange({ ...data, cta1Style: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">Standard (Yellow)</SelectItem>
                <SelectItem value="technical">Technical (Dark Gray)</SelectItem>
                <SelectItem value="outline-white">Outline White</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* CTA 2 */}
        <div className="border rounded-lg p-4 space-y-4">
          <h5 className="font-medium text-sm">Secondary Button (CTA 2)</h5>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Button Text</Label>
              <Input
                value={data.cta2Text}
                onChange={(e) => onChange({ ...data, cta2Text: e.target.value })}
                placeholder="Learn More"
              />
            </div>
            <div>
              <Label>Button Link</Label>
              <Input
                value={data.cta2Link}
                onChange={(e) => onChange({ ...data, cta2Link: e.target.value })}
                placeholder="#overview or /path"
              />
            </div>
          </div>
          <div>
            <Label>Button Style</Label>
            <Select value={data.cta2Style} onValueChange={(value: any) => onChange({ ...data, cta2Style: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">Standard (Yellow)</SelectItem>
                <SelectItem value="technical">Technical (Dark Gray)</SelectItem>
                <SelectItem value="outline-white">Outline White</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Gallery Images */}
      <div className="border-t pt-6 space-y-4">
        <div className="flex justify-between items-center">
          <h4 className="font-medium">Product Images</h4>
          <Button onClick={handleAddImage} variant="outline" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Image
          </Button>
        </div>

        {data.images.map((image, index) => (
          <div key={index} className="border rounded-lg p-4 space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-medium">Image {index + 1}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDeleteIndex(index)}
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </Button>
            </div>

            <div>
              <Label>Upload Image</Label>
              <div className="flex gap-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(index, file);
                  }}
                  disabled={uploadingIndex === index}
                />
                {uploadingIndex === index && <span className="text-sm text-gray-500">Uploading...</span>}
              </div>
              {image.imageUrl && (
                <img src={image.imageUrl} alt={`Gallery ${index + 1}`} className="mt-2 h-20 object-contain" />
              )}
            </div>

            <div>
              <Label>Image Title (optional)</Label>
              <Input
                value={image.title}
                onChange={(e) => handleImageChange(index, 'title', e.target.value)}
                placeholder="Image title"
              />
            </div>

            <div>
              <Label>Image Description (optional)</Label>
              <Input
                value={image.description}
                onChange={(e) => handleImageChange(index, 'description', e.target.value)}
                placeholder="Image description"
              />
            </div>
          </div>
        ))}
      </div>

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
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ProductHeroGalleryEditor;
