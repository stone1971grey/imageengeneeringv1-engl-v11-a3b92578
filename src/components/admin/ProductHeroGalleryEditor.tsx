import { useState, useEffect } from 'react';
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
import { SplitScreenSegmentEditor } from './SplitScreenSegmentEditor';
import { GeminiIcon } from '@/components/GeminiIcon';

interface ProductImage {
  imageUrl: string;
  title: string;
  description: string;
  metadata?: ImageMetadata;
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
  segmentKey: string;
  language: string;
}

const ProductHeroGalleryEditorContent = ({ 
  currentData,
  onDataChange,
  onSaveClick,
  pageSlug,
  segmentId,
  currentLanguage,
  showTranslateButton = false,
  onTranslate
}: {
  currentData: ProductHeroGalleryData;
  onDataChange: (data: ProductHeroGalleryData) => void;
  onSaveClick: () => void;
  pageSlug: string;
  segmentId: number;
  currentLanguage: string;
  showTranslateButton?: boolean;
  onTranslate?: () => void;
}) => {
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

      const baseMetadata = await extractImageMetadata(file, publicUrl);
      const fullMetadata: ImageMetadata = {
        ...baseMetadata,
        altText: currentData.images[index]?.metadata?.altText || ''
      };

      const updatedImages = [...currentData.images];
      updatedImages[index] = { 
        ...updatedImages[index], 
        imageUrl: publicUrl,
        metadata: fullMetadata
      };
      
      onDataChange({ ...currentData, images: updatedImages });
      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploadingIndex(null);
    }
  };

  const handleImageChange = (index: number, field: keyof ProductImage, value: string) => {
    const updatedImages = [...currentData.images];
    updatedImages[index] = { ...updatedImages[index], [field]: value };
    onDataChange({ ...currentData, images: updatedImages });
  };

  const handleAddImage = () => {
    onDataChange({
      ...currentData,
      images: [...currentData.images, { imageUrl: '', title: '', description: '' }]
    });
  };

  const handleDeleteImage = (index: number) => {
    const updatedImages = currentData.images.filter((_, i) => i !== index);
    onDataChange({ ...currentData, images: updatedImages });
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
          <div className="flex gap-2">
            {showTranslateButton && onTranslate && (
              <Button 
                onClick={onTranslate}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
              >
                <GeminiIcon className="w-4 h-4 mr-2" />
                Translate Automatically
              </Button>
            )}
            <Button onClick={onSaveClick} className="w-full" style={{ backgroundColor: '#f9dc24', color: 'black' }}>
              Save Changes
            </Button>
          </div>
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
                value={currentData.title}
                onChange={(e) => onDataChange({ ...currentData, title: e.target.value })}
                placeholder="Product Name"
              />
            </div>

            <div className="space-y-2">
              <Label>Subtitle (H2)</Label>
              <Input
                value={currentData.subtitle}
                onChange={(e) => onDataChange({ ...currentData, subtitle: e.target.value })}
                placeholder="Product Variants"
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={currentData.description}
                onChange={(e) => onDataChange({ ...currentData, description: e.target.value })}
                placeholder="Product description"
                rows={3}
              />
            </div>
          </TabsContent>

          {/* Layout Tab */}
          <TabsContent value="layout" className="space-y-4">
            <div className="space-y-2">
              <Label>Image Position</Label>
              <Select value={currentData.imagePosition} onValueChange={(value: any) => onDataChange({ ...currentData, imagePosition: value })}>
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
              <Select value={currentData.layoutRatio} onValueChange={(value: any) => onDataChange({ ...currentData, layoutRatio: value })}>
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
              <Select value={currentData.topSpacing} onValueChange={(value: any) => onDataChange({ ...currentData, topSpacing: value })}>
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
          </TabsContent>

          {/* Buttons Tab */}
          <TabsContent value="buttons" className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-semibold">Button 1</h3>
              <div className="space-y-2">
                <Label htmlFor="cta1Text">Text</Label>
                <Input
                  id="cta1Text"
                  value={currentData.cta1Text}
                  onChange={(e) => onDataChange({ ...currentData, cta1Text: e.target.value })}
                  placeholder="Contact Sales"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cta1Link">Link (use # for anchor)</Label>
                <Input
                  id="cta1Link"
                  value={currentData.cta1Link}
                  onChange={(e) => onDataChange({ ...currentData, cta1Link: e.target.value })}
                  placeholder="#contact or /path"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cta1Style">Color</Label>
                <Select value={currentData.cta1Style} onValueChange={(value: any) => onDataChange({ ...currentData, cta1Style: value })}>
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
                  value={currentData.cta2Text}
                  onChange={(e) => onDataChange({ ...currentData, cta2Text: e.target.value })}
                  placeholder="Learn More"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cta2Link">Link (use # for anchor)</Label>
                <Input
                  id="cta2Link"
                  value={currentData.cta2Link}
                  onChange={(e) => onDataChange({ ...currentData, cta2Link: e.target.value })}
                  placeholder="#overview or /path"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cta2Style">Color</Label>
                <Select value={currentData.cta2Style} onValueChange={(value: any) => onDataChange({ ...currentData, cta2Style: value })}>
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

            {currentData.images.map((image, index) => (
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
                      const updatedImages = [...currentData.images];
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
                      onDataChange({ ...currentData, images: updatedImages });
                    }}
                    placeholder="Describe the image for accessibility"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Image Title</Label>
                  <Input
                    value={image.title}
                    onChange={(e) => handleImageChange(index, 'title', e.target.value)}
                    placeholder="Image title"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Image Description</Label>
                  <Textarea
                    value={image.description}
                    onChange={(e) => handleImageChange(index, 'description', e.target.value)}
                    placeholder="Image description"
                    rows={2}
                  />
                </div>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </CardContent>

      <AlertDialog open={deleteIndex !== null} onOpenChange={(open) => !open && setDeleteIndex(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Image?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this image? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteIndex !== null && handleDeleteImage(deleteIndex)}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

const ProductHeroGalleryEditor = ({ 
  data, 
  onChange, 
  onSave, 
  pageSlug, 
  segmentId,
  segmentKey,
  language 
}: ProductHeroGalleryEditorProps) => {
  const [targetData, setTargetData] = useState<ProductHeroGalleryData>({
    title: '',
    subtitle: '',
    description: '',
    imagePosition: 'left',
    layoutRatio: '1-1',
    topSpacing: 'medium',
    cta1Text: '',
    cta1Link: '',
    cta1Style: 'standard',
    cta2Text: '',
    cta2Link: '',
    cta2Style: 'standard',
    images: []
  });
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    if (language !== 'en') {
      loadTargetLanguageData();
    }
  }, [language, pageSlug, segmentKey]);

  const loadTargetLanguageData = async () => {
    try {
      const { data: pageContentData, error } = await supabase
        .from("page_content")
        .select("content_value")
        .eq("page_slug", pageSlug)
        .eq("section_key", "page_segments")
        .eq("language", language)
        .maybeSingle();

      if (error) {
        console.error("Error loading target language data:", error);
        return;
      }

      if (pageContentData?.content_value) {
        const segments = JSON.parse(pageContentData.content_value);
        const segment = segments.find((seg: any) => 
          seg.type === "product-hero-gallery" && String(seg.id) === String(segmentId)
        );

        if (segment?.data) {
          setTargetData(segment.data);
        }
      }
    } catch (e) {
      console.error("Failed to load target language data:", e);
    }
  };

  const handleTranslate = async () => {
    if (language === 'en') {
      toast.error('Translation not needed - English is the source language');
      return;
    }

    setIsTranslating(true);

    try {
      const { data: functionData, error: functionError } = await supabase.functions.invoke('translate-content', {
        body: {
          content: {
            title: data.title,
            subtitle: data.subtitle,
            description: data.description,
            cta1Text: data.cta1Text,
            cta2Text: data.cta2Text,
            images: data.images.map(img => ({
              title: img.title,
              description: img.description
            }))
          },
          targetLanguage: language,
          contentType: 'product-hero-gallery'
        }
      });

      if (functionError) throw functionError;

      if (functionData?.translated) {
        const translated = functionData.translated;
        setTargetData({
          ...data,
          title: translated.title || data.title,
          subtitle: translated.subtitle || data.subtitle,
          description: translated.description || data.description,
          cta1Text: translated.cta1Text || data.cta1Text,
          cta2Text: translated.cta2Text || data.cta2Text,
          images: data.images.map((img, idx) => ({
            ...img,
            title: translated.images?.[idx]?.title || img.title,
            description: translated.images?.[idx]?.description || img.description
          }))
        });
        toast.success('Content translated successfully');
      }
    } catch (error) {
      console.error('Translation error:', error);
      toast.error('Failed to translate content');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSaveTargetLanguage = async () => {
    try {
      const { data: pageContentData, error: fetchError } = await supabase
        .from("page_content")
        .select("*")
        .eq("page_slug", pageSlug)
        .eq("section_key", "page_segments")
        .eq("language", language)
        .maybeSingle();

      if (fetchError) throw fetchError;

      let segments = [];
      if (pageContentData?.content_value) {
        segments = JSON.parse(pageContentData.content_value);
      }

      const segmentIndex = segments.findIndex((seg: any) => 
        seg.type === "product-hero-gallery" && String(seg.id) === String(segmentId)
      );

      if (segmentIndex >= 0) {
        segments[segmentIndex] = {
          ...segments[segmentIndex],
          data: targetData
        };
      } else {
        segments.push({
          id: segmentId,
          type: "product-hero-gallery",
          segment_key: segmentKey,
          data: targetData
        });
      }

      const { error: updateError } = await supabase
        .from("page_content")
        .upsert({
          page_slug: pageSlug,
          section_key: "page_segments",
          content_type: "json",
          content_value: JSON.stringify(segments),
          language: language,
          updated_by: (await supabase.auth.getUser()).data.user?.id,
        }, {
          onConflict: 'page_slug,section_key,language'
        });

      if (updateError) throw updateError;

      toast.success(`${language.toUpperCase()} version saved successfully`);
      onSave();
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save changes');
    }
  };

  return (
    <SplitScreenSegmentEditor
      segmentTitle="Product Hero Gallery"
      segmentType="product-hero-gallery"
    >
      {(editorLanguage) => (
        <ProductHeroGalleryEditorContent
          currentData={editorLanguage === 'en' ? data : targetData}
          onDataChange={editorLanguage === 'en' ? onChange : setTargetData}
          onSaveClick={editorLanguage === 'en' ? onSave : handleSaveTargetLanguage}
          pageSlug={pageSlug}
          segmentId={segmentId}
          currentLanguage={editorLanguage}
          showTranslateButton={editorLanguage !== 'en'}
          onTranslate={editorLanguage !== 'en' ? handleTranslate : undefined}
        />
      )}
    </SplitScreenSegmentEditor>
  );
};

export default ProductHeroGalleryEditor;
