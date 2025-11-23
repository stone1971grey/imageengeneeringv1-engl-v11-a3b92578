import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { ImageMetadata, extractImageMetadata, formatFileSize, formatUploadDate } from '@/types/imageMetadata';

interface ProductImage {
  imageUrl: string;
  title: string;
  description: string;
  metadata?: ImageMetadata;
  cropPosition?: 'top' | 'center' | 'bottom';
}

interface ProductHeroGalleryData {
  title: string;
  subtitle: string;
  description: string;
  imagePosition: 'left' | 'right';
  layoutRatio: '1-1' | '2-3' | '2-5';
  topSpacing: 'small' | 'medium' | 'large' | 'extra-large';
  imageDimensions?: '600x600' | '800x600' | '1200x800' | '1920x1080';
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

  const cropImage = async (file: File, dimensions: string, position: 'top' | 'center' | 'bottom'): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const [targetWidth, targetHeight] = dimensions.split('x').map(Number);
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      img.onload = () => {
        canvas.width = targetWidth;
        canvas.height = targetHeight;

        const scale = Math.max(targetWidth / img.width, targetHeight / img.height);
        const scaledWidth = img.width * scale;
        const scaledHeight = img.height * scale;
        const x = (targetWidth - scaledWidth) / 2;
        
        let y: number;
        switch (position) {
          case 'top':
            y = 0;
            break;
          case 'bottom':
            y = targetHeight - scaledHeight;
            break;
          case 'center':
          default:
            y = (targetHeight - scaledHeight) / 2;
            break;
        }

        ctx.drawImage(img, x, y, scaledWidth, scaledHeight);

        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create blob'));
          }
        }, 'image/jpeg', 0.92);
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  };

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
      const dimensions = data.imageDimensions || '600x600';
      const position = data.images[index]?.cropPosition || 'center';
      
      // Crop the image first
      const croppedBlob = await cropImage(file, dimensions, position);
      const croppedFile = new File([croppedBlob], file.name, { type: 'image/jpeg' });

      const fileExt = 'jpg';
      const fileName = `${pageSlug}/segment-${segmentId}/gallery-${index}-${Date.now()}.${fileExt}`;

      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('page-images')
        .upload(fileName, croppedFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('page-images')
        .getPublicUrl(fileName);

      // Extract image metadata from cropped file
      const baseMetadata = await extractImageMetadata(croppedFile, publicUrl);
      const fullMetadata: ImageMetadata = {
        ...baseMetadata,
        altText: data.images[index]?.metadata?.altText || ''
      };

      const updatedImages = [...data.images];
      updatedImages[index] = { 
        ...updatedImages[index], 
        imageUrl: publicUrl,
        metadata: fullMetadata
      };
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
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              Product Hero Gallery
              <span className="text-xs font-normal text-muted-foreground">[Segment ID: {segmentId}]</span>
            </CardTitle>
            <CardDescription>
              Hero mit Produktgalerie, Thumbnails, zwei CTA-Buttons und erweiterten Layout-Optionen
            </CardDescription>
          </div>
          <Button onClick={onSave} style={{ backgroundColor: '#f9dc24', color: 'black' }}>
            Save Changes
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <Tabs defaultValue="content">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="layout">Layout</TabsTrigger>
            <TabsTrigger value="buttons">Buttons</TabsTrigger>
            <TabsTrigger value="gallery">Gallery</TabsTrigger>
          </TabsList>

          {/* Content Tab */}
          <TabsContent value="content" className="space-y-4">
            <div className="space-y-2">
              <Label>Title (H1)</Label>
              <Input
                value={data.title}
                onChange={(e) => onChange({ ...data, title: e.target.value })}
                placeholder="Product Name"
              />
            </div>

            <div className="space-y-2">
              <Label>Subtitle (H2)</Label>
              <Input
                value={data.subtitle}
                onChange={(e) => onChange({ ...data, subtitle: e.target.value })}
                placeholder="Product Variants"
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={data.description}
                onChange={(e) => onChange({ ...data, description: e.target.value })}
                placeholder="Product description"
                rows={3}
              />
            </div>
          </TabsContent>

          {/* Layout Tab */}
          <TabsContent value="layout" className="space-y-4">
            <div className="space-y-2">
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

            <div className="space-y-2">
              <Label>Layout Ratio (Text : Image)</Label>
              <Select value={data.layoutRatio} onValueChange={(value: any) => onChange({ ...data, layoutRatio: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1-1">1:1 (50% : 50%)</SelectItem>
                  <SelectItem value="2-3">2:3 (40% : 60%)</SelectItem>
                  <SelectItem value="2-5">2:5 (30% : 70%)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
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

            <div className="space-y-2">
              <Label>Image Dimensions</Label>
              <Select 
                value={data.imageDimensions || '600x600'} 
                onValueChange={(value: any) => onChange({ ...data, imageDimensions: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="600x600">600 × 600px (Square - Default)</SelectItem>
                  <SelectItem value="800x600">800 × 600px (4:3)</SelectItem>
                  <SelectItem value="1200x800">1200 × 800px (3:2)</SelectItem>
                  <SelectItem value="1920x1080">1920 × 1080px (16:9)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Uploaded images will be automatically cropped to this size
              </p>
            </div>
          </TabsContent>

          {/* Buttons Tab */}
          <TabsContent value="buttons" className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-semibold">Button 1</h3>
              <div className="space-y-2">
                <Label htmlFor="cta1Text">Text</Label>
                <Input
                  id="cta1Text"
                  value={data.cta1Text}
                  onChange={(e) => onChange({ ...data, cta1Text: e.target.value })}
                  placeholder="Contact Sales"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cta1Link">Link (use # for anchor)</Label>
                <Input
                  id="cta1Link"
                  value={data.cta1Link}
                  onChange={(e) => onChange({ ...data, cta1Link: e.target.value })}
                  placeholder="#contact or /path"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cta1Style">Color</Label>
                <Select value={data.cta1Style} onValueChange={(value: any) => onChange({ ...data, cta1Style: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Yellow</SelectItem>
                    <SelectItem value="technical">Black</SelectItem>
                    <SelectItem value="outline-white">White</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">Button 2 (Optional)</h3>
              <div className="space-y-2">
                <Label htmlFor="cta2Text">Text</Label>
                <Input
                  id="cta2Text"
                  value={data.cta2Text}
                  onChange={(e) => onChange({ ...data, cta2Text: e.target.value })}
                  placeholder="Learn More"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cta2Link">Link (use # for anchor)</Label>
                <Input
                  id="cta2Link"
                  value={data.cta2Link}
                  onChange={(e) => onChange({ ...data, cta2Link: e.target.value })}
                  placeholder="#overview or /path"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cta2Style">Color</Label>
                <Select value={data.cta2Style} onValueChange={(value: any) => onChange({ ...data, cta2Style: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Yellow</SelectItem>
                    <SelectItem value="technical">Black</SelectItem>
                    <SelectItem value="outline-white">White</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>

          {/* Gallery Tab */}
          <TabsContent value="gallery" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">Product Images</h3>
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
                    <img src={image.imageUrl} alt={image.metadata?.altText || `Gallery ${index + 1}`} className="mt-2 h-20 object-contain" />
                  )}
                </div>

                {/* Image Metadata Display */}
                {image.metadata && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 space-y-2">
                    <h5 className="font-medium text-sm text-gray-700">Image Information</h5>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="font-medium text-gray-600">Original Name:</span>
                        <p className="text-gray-800 truncate" title={image.metadata.originalFileName}>
                          {image.metadata.originalFileName}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Dimensions:</span>
                        <p className="text-gray-800">{image.metadata.width} × {image.metadata.height} px</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">File Size:</span>
                        <p className="text-gray-800">{formatFileSize(image.metadata.fileSizeKB)}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Format:</span>
                        <p className="text-gray-800">{image.metadata.format}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Uploaded:</span>
                        <p className="text-gray-800">{formatUploadDate(image.metadata.uploadDate)}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Storage URL:</span>
                        <p className="text-gray-800 text-xs truncate" title={image.metadata.url}>
                          {image.metadata.url.split('/').pop()}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Alt Text Field */}
                <div>
                  <Label>Alt Text (for SEO & Accessibility) *</Label>
                  <Input
                    value={image.metadata?.altText || ''}
                    onChange={(e) => {
                      const updatedImages = [...data.images];
                      if (updatedImages[index].metadata) {
                        updatedImages[index].metadata!.altText = e.target.value;
                      } else {
                        updatedImages[index].metadata = {
                          url: image.imageUrl,
                          originalFileName: '',
                          width: 0,
                          height: 0,
                          fileSizeKB: 0,
                          format: '',
                          uploadDate: new Date().toISOString(),
                          altText: e.target.value
                        };
                      }
                      onChange({ ...data, images: updatedImages });
                    }}
                    placeholder="Describe this image for accessibility and SEO"
                  />
                </div>

                {/* Crop Position */}
                <div className="space-y-2">
                  <Label>Crop Position (for next upload)</Label>
                  <Select 
                    value={image.cropPosition || 'center'} 
                    onValueChange={(value: any) => {
                      const updatedImages = [...data.images];
                      updatedImages[index] = { ...updatedImages[index], cropPosition: value };
                      onChange({ ...data, images: updatedImages });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="top">Top (Crop from bottom)</SelectItem>
                      <SelectItem value="center">Center (Crop equally)</SelectItem>
                      <SelectItem value="bottom">Bottom (Crop from top)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Choose which part of the image to keep when cropping to fit dimensions
                  </p>
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
          </TabsContent>
        </Tabs>

        <Button onClick={onSave} className="w-full mt-6">
          Save Product Hero Gallery
        </Button>
      </CardContent>

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
    </Card>
  );
};

export default ProductHeroGalleryEditor;
