import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, Languages } from 'lucide-react';
import { GeminiIcon } from "@/components/GeminiIcon";
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
  resolvedPageSlug?: string;
  segmentId: number;
}

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
];

const ProductHeroGalleryEditor = ({ 
  data, 
  onChange, 
  onSave, 
  pageSlug,
  resolvedPageSlug,
  segmentId 
}: ProductHeroGalleryEditorProps) => {
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [targetLanguage, setTargetLanguage] = useState('de');
  const [isSplitScreenEnabled, setIsSplitScreenEnabled] = useState(true);
  const [targetData, setTargetData] = useState<ProductHeroGalleryData>({
    title: '',
    subtitle: '',
    description: '',
    imagePosition: 'right',
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
  const [isSaving, setIsSaving] = useState(false);

  // Load target language data on mount and when target language changes
  useEffect(() => {
    loadTargetLanguageData();
  }, [targetLanguage]);

  const loadTargetLanguageData = async () => {
    const slug = resolvedPageSlug || pageSlug;
    const { data: pageContentData, error } = await supabase
      .from("page_content")
      .select("*")
      .eq("page_slug", slug)
      .eq("section_key", "page_segments")
      .eq("language", targetLanguage)
      .maybeSingle();

    if (!error && pageContentData) {
      try {
        const segments = JSON.parse(pageContentData.content_value);
        const segment = segments.find((seg: any) => 
          seg.type === "product-hero-gallery" && String(seg.id) === String(segmentId)
        );
        
        if (segment?.data) {
          setTargetData(segment.data);
        } else {
          // No translation exists yet - initialize empty
          setTargetData({
            title: '',
            subtitle: '',
            description: '',
            imagePosition: data.imagePosition,
            layoutRatio: data.layoutRatio,
            topSpacing: data.topSpacing,
            cta1Text: '',
            cta1Link: data.cta1Link,
            cta1Style: data.cta1Style,
            cta2Text: '',
            cta2Link: data.cta2Link,
            cta2Style: data.cta2Style,
            images: data.images.map(img => ({ ...img, title: '', description: '' }))
          });
        }
      } catch (e) {
        console.error("Error parsing target language segments:", e);
      }
    } else {
      // No content for this language yet - initialize empty
      setTargetData({
        title: '',
        subtitle: '',
        description: '',
        imagePosition: data.imagePosition,
        layoutRatio: data.layoutRatio,
        topSpacing: data.topSpacing,
        cta1Text: '',
        cta1Link: data.cta1Link,
        cta1Style: data.cta1Style,
        cta2Text: '',
        cta2Link: data.cta2Link,
        cta2Style: data.cta2Style,
        images: data.images.map(img => ({ ...img, title: '', description: '' }))
      });
    }
  };

  const handleImageUpload = async (index: number, file: File, isTarget: boolean = false) => {
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
      const slug = resolvedPageSlug || pageSlug;
      const fileExt = file.name.split('.').pop();
      const fileName = `${slug}/segment-${segmentId}/gallery-${index}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('page-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('page-images')
        .getPublicUrl(fileName);

      // Extract image metadata
      const baseMetadata = await extractImageMetadata(file, publicUrl);
      const fullMetadata: ImageMetadata = {
        ...baseMetadata,
        altText: (isTarget ? targetData : data).images[index]?.metadata?.altText || ''
      };

      if (isTarget) {
        const updatedImages = [...targetData.images];
        updatedImages[index] = { 
          ...updatedImages[index], 
          imageUrl: publicUrl,
          metadata: fullMetadata
        };
        setTargetData({ ...targetData, images: updatedImages });
      } else {
        const updatedImages = [...data.images];
        updatedImages[index] = { 
          ...updatedImages[index], 
          imageUrl: publicUrl,
          metadata: fullMetadata
        };
        onChange({ ...data, images: updatedImages });
        
        // Auto-save after successful upload
        await autoSaveAfterUpload({ ...data, images: updatedImages });
      }

      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploadingIndex(null);
    }
  };

  const autoSaveAfterUpload = async (updatedData: ProductHeroGalleryData) => {
    try {
      const slug = resolvedPageSlug || pageSlug;
      const { data: pageContentData, error: fetchError } = await supabase
        .from("page_content")
        .select("*")
        .eq("page_slug", slug)
        .eq("section_key", "page_segments")
        .eq("language", "en")
        .single();

      if (fetchError || !pageContentData) {
        console.error("Error loading page_segments:", fetchError);
        return;
      }

      const segments = JSON.parse(pageContentData.content_value);
      const updatedSegments = segments.map((seg: any) => {
        if (seg.type === "product-hero-gallery" && String(seg.id) === String(segmentId)) {
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
        .eq("page_slug", slug)
        .eq("section_key", "page_segments")
        .eq("language", "en");

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

  const handleImageChange = (index: number, field: keyof ProductImage, value: string, isTarget: boolean = false) => {
    if (isTarget) {
      const updatedImages = [...targetData.images];
      updatedImages[index] = { ...updatedImages[index], [field]: value };
      setTargetData({ ...targetData, images: updatedImages });
    } else {
      const updatedImages = [...data.images];
      updatedImages[index] = { ...updatedImages[index], [field]: value };
      onChange({ ...data, images: updatedImages });
    }
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

  const handleTranslate = async () => {
    setIsTranslating(true);
    try {
      const textsToTranslate: Record<string, string> = {
        title: data.title || '',
        subtitle: data.subtitle || '',
        description: data.description || '',
        cta1Text: data.cta1Text || '',
        cta2Text: data.cta2Text || ''
      };

      // Add all image titles and descriptions
      data.images.forEach((image, index) => {
        textsToTranslate[`image_${index}_title`] = image.title || '';
        textsToTranslate[`image_${index}_description`] = image.description || '';
      });

      const { data: translationResult, error } = await supabase.functions.invoke('translate-content', {
        body: {
          texts: textsToTranslate,
          targetLanguage
        }
      });

      if (error) throw error;

      if (translationResult?.translatedTexts) {
        const translated = translationResult.translatedTexts;
        
        // Update translated images
        const translatedImages = data.images.map((image, index) => ({
          ...image,
          title: translated[`image_${index}_title`] || image.title,
          description: translated[`image_${index}_description`] || image.description
        }));

        setTargetData({
          ...targetData,
          title: translated.title || data.title,
          subtitle: translated.subtitle || data.subtitle,
          description: translated.description || data.description,
          cta1Text: translated.cta1Text || data.cta1Text,
          cta2Text: translated.cta2Text || data.cta2Text,
          images: translatedImages
        });

        toast.success(`Translated to ${LANGUAGES.find(l => l.code === targetLanguage)?.name}`);
      }
    } catch (error) {
      console.error('Translation error:', error);
      toast.error('Translation failed');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSaveEnglish = async () => {
    setIsSaving(true);
    try {
      const slug = resolvedPageSlug || pageSlug;
      const { data: pageContentData, error: fetchError } = await supabase
        .from("page_content")
        .select("*")
        .eq("page_slug", slug)
        .eq("section_key", "page_segments")
        .eq("language", "en")
        .single();

      if (fetchError || !pageContentData) {
        toast.error("Error loading page segments");
        return;
      }

      const segments = JSON.parse(pageContentData.content_value);
      const updatedSegments = segments.map((seg: any) => {
        if (seg.type === "product-hero-gallery" && String(seg.id) === String(segmentId)) {
          return { ...seg, data };
        }
        return seg;
      });

      const { error: updateError } = await supabase
        .from("page_content")
        .update({
          content_value: JSON.stringify(updatedSegments),
          updated_by: (await supabase.auth.getUser()).data.user?.id,
        })
        .eq("page_slug", slug)
        .eq("section_key", "page_segments")
        .eq("language", "en");

      if (updateError) throw updateError;
      
      toast.success('Saved English version');
      if (onSave) onSave();
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Save failed');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveTarget = async () => {
    setIsSaving(true);
    try {
      const slug = resolvedPageSlug || pageSlug;
      
      // Load or create target language page_segments
      const { data: pageContentData, error: fetchError } = await supabase
        .from("page_content")
        .select("*")
        .eq("page_slug", slug)
        .eq("section_key", "page_segments")
        .eq("language", targetLanguage)
        .maybeSingle();

      let segments = [];
      
      if (pageContentData) {
        segments = JSON.parse(pageContentData.content_value);
      } else {
        // Initialize from English structure
        const { data: enContent } = await supabase
          .from("page_content")
          .select("content_value")
          .eq("page_slug", slug)
          .eq("section_key", "page_segments")
          .eq("language", "en")
          .single();
        
        if (enContent) {
          segments = JSON.parse(enContent.content_value);
        }
      }

      // Update or add the segment
      const segmentIndex = segments.findIndex((seg: any) => 
        seg.type === "product-hero-gallery" && String(seg.id) === String(segmentId)
      );

      if (segmentIndex >= 0) {
        segments[segmentIndex] = { ...segments[segmentIndex], data: targetData };
      } else {
        segments.push({ 
          type: "product-hero-gallery", 
          id: segmentId, 
          data: targetData 
        });
      }

      const { error: upsertError } = await supabase
        .from("page_content")
        .upsert({
          page_slug: slug,
          section_key: "page_segments",
          language: targetLanguage,
          content_type: "segment",
          content_value: JSON.stringify(segments),
          updated_by: (await supabase.auth.getUser()).data.user?.id,
        }, {
          onConflict: 'page_slug,section_key,language'
        });

      if (upsertError) throw upsertError;
      
      toast.success(`Saved ${LANGUAGES.find(l => l.code === targetLanguage)?.name} version`);
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Save failed');
    } finally {
      setIsSaving(false);
    }
  };

  const renderEditor = (currentData: ProductHeroGalleryData, isTarget: boolean = false) => {
    const handleChange = isTarget 
      ? (newData: ProductHeroGalleryData) => setTargetData(newData)
      : onChange;

    return (
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2">
                Product Hero Gallery
                <span className="text-xs font-normal text-muted-foreground">[Segment ID: {segmentId}]</span>
              </CardTitle>
              <CardDescription>
                Hero mit Produktgalerie, Thumbnails, zwei CTA-Buttons und erweiterten Layout-Optionen
              </CardDescription>
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
                  onChange={(e) => handleChange({ ...currentData, title: e.target.value })}
                  placeholder="Product Name"
                />
              </div>

              <div className="space-y-2">
                <Label>Subtitle (H2)</Label>
                <Input
                  value={currentData.subtitle}
                  onChange={(e) => handleChange({ ...currentData, subtitle: e.target.value })}
                  placeholder="Product Variants"
                />
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={currentData.description}
                  onChange={(e) => handleChange({ ...currentData, description: e.target.value })}
                  placeholder="Product description"
                  rows={3}
                />
              </div>
            </TabsContent>

            {/* Layout Tab */}
            <TabsContent value="layout" className="space-y-4">
              <div className="space-y-2">
                <Label>Image Position</Label>
                <Select 
                  value={currentData.imagePosition} 
                  onValueChange={(value: any) => handleChange({ ...currentData, imagePosition: value })}
                >
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
                <Select 
                  value={currentData.layoutRatio} 
                  onValueChange={(value: any) => handleChange({ ...currentData, layoutRatio: value })}
                >
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
                <Select 
                  value={currentData.topSpacing} 
                  onValueChange={(value: any) => handleChange({ ...currentData, topSpacing: value })}
                >
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
                  <Label>Text</Label>
                  <Input
                    value={currentData.cta1Text}
                    onChange={(e) => handleChange({ ...currentData, cta1Text: e.target.value })}
                    placeholder="Contact Sales"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Link (use # for anchor)</Label>
                  <Input
                    value={currentData.cta1Link}
                    onChange={(e) => handleChange({ ...currentData, cta1Link: e.target.value })}
                    placeholder="#contact or /path"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Color</Label>
                  <Select 
                    value={currentData.cta1Style} 
                    onValueChange={(value: any) => handleChange({ ...currentData, cta1Style: value })}
                  >
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
                  <Label>Text</Label>
                  <Input
                    value={currentData.cta2Text}
                    onChange={(e) => handleChange({ ...currentData, cta2Text: e.target.value })}
                    placeholder="Learn More"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Link (use # for anchor)</Label>
                  <Input
                    value={currentData.cta2Link}
                    onChange={(e) => handleChange({ ...currentData, cta2Link: e.target.value })}
                    placeholder="#overview or /path"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Color</Label>
                  <Select 
                    value={currentData.cta2Style} 
                    onValueChange={(value: any) => handleChange({ ...currentData, cta2Style: value })}
                  >
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
              {!isTarget && (
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold">Product Images</h3>
                  <Button onClick={handleAddImage} variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Image
                  </Button>
                </div>
              )}

              {currentData.images.map((image, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Image {index + 1}</span>
                    {!isTarget && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteIndex(index)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    )}
                  </div>

                  <div>
                    <Label>Upload Image</Label>
                    <div className="flex gap-2">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(index, file, isTarget);
                        }}
                        disabled={uploadingIndex === index}
                      />
                      {uploadingIndex === index && <span className="text-sm text-gray-500">Uploading...</span>}
                    </div>
                    {image.imageUrl && (
                      <img 
                        src={image.imageUrl} 
                        alt={image.metadata?.altText || `Gallery ${index + 1}`} 
                        className="mt-2 h-20 object-contain" 
                      />
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
                        handleChange({ ...currentData, images: updatedImages });
                      }}
                      placeholder="Describe image for screen readers and SEO"
                    />
                  </div>

                  <div>
                    <Label>Image Title</Label>
                    <Input
                      value={image.title}
                      onChange={(e) => handleImageChange(index, 'title', e.target.value, isTarget)}
                      placeholder="Image title"
                    />
                  </div>

                  <div>
                    <Label>Image Description</Label>
                    <Textarea
                      value={image.description}
                      onChange={(e) => handleImageChange(index, 'description', e.target.value, isTarget)}
                      placeholder="Image description"
                      rows={2}
                    />
                  </div>
                </div>
              ))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      {/* Language Selector */}
      <Card className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 border-blue-700">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Languages className="h-5 w-5 text-blue-300" />
              <div>
                <CardTitle className="text-white text-lg">Multi-Language Editor</CardTitle>
                <CardDescription className="text-blue-200 text-sm mt-1">
                  Compare and edit Product Hero Gallery in multiple languages side-by-side
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch 
                  id="split-screen-toggle"
                  checked={isSplitScreenEnabled}
                  onCheckedChange={setIsSplitScreenEnabled}
                  className="data-[state=checked]:bg-blue-600"
                />
                <Label htmlFor="split-screen-toggle" className="text-white text-sm cursor-pointer">
                  Split-Screen Mode
                </Label>
              </div>
              {isSplitScreenEnabled && (
                <Badge variant="outline" className="bg-blue-950/50 text-blue-200 border-blue-600">
                  Active
                </Badge>
              )}
            </div>
          </div>
          
          {/* Target Language Selector */}
          {isSplitScreenEnabled && (
            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-blue-700/50">
              <label className="text-white font-medium text-sm">Target Language:</label>
              <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                <SelectTrigger className="w-[220px] bg-blue-950/70 border-blue-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-blue-700 z-50">
                  {LANGUAGES.filter(lang => lang.code !== 'en').map(lang => (
                    <SelectItem 
                      key={lang.code} 
                      value={lang.code}
                      className="text-white hover:bg-blue-900/50 cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-lg">{lang.flag}</span>
                        <span>{lang.name}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </CardHeader>
      </Card>

      {/* Split Screen Layout or Single View */}
      <div className={isSplitScreenEnabled ? "grid grid-cols-2 gap-6" : ""}>
        {isSplitScreenEnabled ? (
          <>
            {/* Left Panel - English (Reference) */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-green-900/30 to-green-800/30 border-2 border-green-600/50 rounded-lg">
                <span className="text-2xl">🇺🇸</span>
                <div>
                  <p className="text-white font-semibold text-sm">English (Reference)</p>
                  <p className="text-green-200 text-xs">Master language - all translations reference this</p>
                </div>
              </div>
              <div className="border-2 border-green-600/30 rounded-lg p-1 bg-green-950/20">
                {renderEditor(data, false)}
              </div>
              <Button 
                onClick={handleSaveEnglish} 
                disabled={isSaving}
                className="w-full"
                style={{ backgroundColor: '#f9dc24', color: 'black' }}
              >
                {isSaving ? 'Saving...' : 'Save English Version'}
              </Button>
            </div>

            {/* Right Panel - Target Language */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-900/30 to-purple-800/30 border-2 border-purple-600/50 rounded-lg">
                <span className="text-2xl">
                  {LANGUAGES.find(l => l.code === targetLanguage)?.flag}
                </span>
                <div>
                  <p className="text-white font-semibold text-sm">
                    {LANGUAGES.find(l => l.code === targetLanguage)?.name}
                  </p>
                  <p className="text-purple-200 text-xs">Edit translation for this language</p>
                </div>
              </div>
              <div className="border-2 border-purple-600/30 rounded-lg p-1 bg-purple-950/20">
                {renderEditor(targetData, true)}
              </div>
              
              {/* Translate & Save Buttons */}
              <div className="space-y-2">
                <Button
                  onClick={handleTranslate}
                  disabled={isTranslating}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium"
                >
                  <GeminiIcon className="w-4 h-4 mr-2" />
                  {isTranslating ? 'Translating...' : 'Translate Automatically'}
                </Button>
                
                <Button 
                  onClick={handleSaveTarget} 
                  disabled={isSaving}
                  className="w-full"
                  style={{ backgroundColor: '#f9dc24', color: 'black' }}
                >
                  {isSaving ? 'Saving...' : `Save ${LANGUAGES.find(l => l.code === targetLanguage)?.name} Version`}
                </Button>
              </div>
            </div>
          </>
        ) : (
          /* Single View - English Only */
          <div className="space-y-3">
            <div className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-green-900/30 to-green-800/30 border-2 border-green-600/50 rounded-lg">
              <span className="text-2xl">🇺🇸</span>
              <div>
                <p className="text-white font-semibold text-sm">English (Single View)</p>
                <p className="text-green-200 text-xs">Editing in single-language mode</p>
              </div>
            </div>
            <div className="border-2 border-green-600/30 rounded-lg p-1 bg-green-950/20">
              {renderEditor(data, false)}
            </div>
            <Button 
              onClick={handleSaveEnglish} 
              disabled={isSaving}
              className="w-full"
              style={{ backgroundColor: '#f9dc24', color: 'black' }}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        )}
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
            <AlertDialogAction onClick={() => deleteIndex !== null && handleDeleteImage(deleteIndex)}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ProductHeroGalleryEditor;