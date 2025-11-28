import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
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
}

const ProductHeroGalleryEditor = ({ data, onChange, onSave, pageSlug, segmentId }: ProductHeroGalleryEditorProps) => {
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  
  // Multi-language state
  const [isSplitScreenEnabled, setIsSplitScreenEnabled] = useState(() => {
    const saved = localStorage.getItem('cms-split-screen-mode');
    return saved !== null ? saved === 'true' : true;
  });
  const [targetLanguage, setTargetLanguage] = useState<'de' | 'ja' | 'ko' | 'zh'>('de');
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

      // Extract image metadata
      const baseMetadata = await extractImageMetadata(file, publicUrl);
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
      
      // Update local state
      onChange({ ...data, images: updatedImages });

      // Auto-save after successful upload
      await autoSaveAfterUpload({ ...data, images: updatedImages });

      toast.success('Image uploaded and saved successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploadingIndex(null);
    }
  };

  const autoSaveAfterUpload = async (updatedData: ProductHeroGalleryData) => {
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

  // Load target language data
  const loadTargetLanguageData = async (lang: string) => {
    try {
      const { data: pageContentData, error } = await supabase
        .from("page_content")
        .select("content_value")
        .eq("page_slug", pageSlug)
        .eq("section_key", "page_segments")
        .eq("language", lang)
        .single();

      if (error) throw error;

      if (pageContentData) {
        const segments = JSON.parse(pageContentData.content_value);
        const segment = segments.find((seg: any) => 
          seg.type === "product-hero-gallery" && String(seg.id) === String(segmentId)
        );

        if (segment && segment.data) {
          setTargetData(segment.data);
        } else {
          // Initialize with empty structure
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
            images: data.images.map(img => ({
              ...img,
              title: '',
              description: ''
            }))
          });
        }
      }
    } catch (error) {
      console.error("Error loading target language data:", error);
      toast.error(`Failed to load ${lang} version`);
    }
  };

  useEffect(() => {
    if (isSplitScreenEnabled) {
      loadTargetLanguageData(targetLanguage);
    }
  }, [targetLanguage, isSplitScreenEnabled, pageSlug, segmentId]);

  // Save both English and target language
  const saveBothLanguages = async () => {
    try {
      // Save English version
      const { data: enPageContent, error: enFetchError } = await supabase
        .from("page_content")
        .select("*")
        .eq("page_slug", pageSlug)
        .eq("section_key", "page_segments")
        .eq("language", "en")
        .single();

      if (enFetchError) throw enFetchError;

      const enSegments = JSON.parse(enPageContent.content_value);
      const enUpdatedSegments = enSegments.map((seg: any) => {
        if (seg.type === "product-hero-gallery" && String(seg.id) === String(segmentId)) {
          return { ...seg, data };
        }
        return seg;
      });

      const { error: enUpdateError } = await supabase
        .from("page_content")
        .update({
          content_value: JSON.stringify(enUpdatedSegments),
          updated_by: (await supabase.auth.getUser()).data.user?.id,
        })
        .eq("page_slug", pageSlug)
        .eq("section_key", "page_segments")
        .eq("language", "en");

      if (enUpdateError) throw enUpdateError;

      // Save target language version
      const { data: targetPageContent, error: targetFetchError } = await supabase
        .from("page_content")
        .select("*")
        .eq("page_slug", pageSlug)
        .eq("section_key", "page_segments")
        .eq("language", targetLanguage)
        .single();

      if (targetFetchError) throw targetFetchError;

      const targetSegments = JSON.parse(targetPageContent.content_value);
      const targetUpdatedSegments = targetSegments.map((seg: any) => {
        if (seg.type === "product-hero-gallery" && String(seg.id) === String(segmentId)) {
          return { ...seg, data: targetData };
        }
        return seg;
      });

      const { error: targetUpdateError } = await supabase
        .from("page_content")
        .update({
          content_value: JSON.stringify(targetUpdatedSegments),
          updated_by: (await supabase.auth.getUser()).data.user?.id,
        })
        .eq("page_slug", pageSlug)
        .eq("section_key", "page_segments")
        .eq("language", targetLanguage);

      if (targetUpdateError) throw targetUpdateError;

      toast.success("Both language versions saved successfully");
      onSave?.();
    } catch (error) {
      console.error("Error saving both languages:", error);
      toast.error("Failed to save changes");
    }
  };

  // Automatic translation
  const translateAutomatically = async () => {
    setIsTranslating(true);
    try {
      const { data: translationData, error } = await supabase.functions.invoke('translate-content', {
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
          targetLanguage,
          context: 'product-hero-gallery'
        }
      });

      if (error) throw error;

      if (translationData?.translation) {
        const translated = translationData.translation;
        setTargetData({
          ...targetData,
          title: translated.title || '',
          subtitle: translated.subtitle || '',
          description: translated.description || '',
          cta1Text: translated.cta1Text || '',
          cta2Text: translated.cta2Text || '',
          images: targetData.images.map((img, index) => ({
            ...img,
            title: translated.images?.[index]?.title || img.title,
            description: translated.images?.[index]?.description || img.description
          }))
        });
        toast.success(`Content translated to ${targetLanguage.toUpperCase()}`);
      }
    } catch (error) {
      console.error('Translation error:', error);
      toast.error('Failed to translate content');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSplitScreenToggle = (checked: boolean) => {
    setIsSplitScreenEnabled(checked);
    localStorage.setItem('cms-split-screen-mode', checked.toString());
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Product Hero Gallery
          <span className="text-xs font-normal text-muted-foreground">[Segment ID: {segmentId}]</span>
        </CardTitle>
        <CardDescription>
          Hero mit Produktgalerie, Thumbnails, zwei CTA-Buttons und erweiterten Layout-Optionen
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Multi-Language Editor Block */}
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-sm font-semibold">Multi-Language Editor</Label>
              <p className="text-xs text-muted-foreground">
                Edit English and target language side by side
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="split-screen-toggle" className="text-sm">Split Screen</Label>
              <Switch
                id="split-screen-toggle"
                checked={isSplitScreenEnabled}
                onCheckedChange={handleSplitScreenToggle}
              />
            </div>
          </div>

          {isSplitScreenEnabled && (
            <div className="flex items-center gap-4 pt-2 border-t">
              <div className="flex-1">
                <Label className="text-xs text-muted-foreground mb-1 block">Target Language</Label>
                <Select value={targetLanguage} onValueChange={(value: any) => setTargetLanguage(value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="de">🇩🇪 German</SelectItem>
                    <SelectItem value="ja">🇯🇵 Japanese</SelectItem>
                    <SelectItem value="ko">🇰🇷 Korean</SelectItem>
                    <SelectItem value="zh">🇨🇳 Chinese</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={translateAutomatically}
                disabled={isTranslating}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
              >
                <GeminiIcon className="w-4 h-4 mr-2" />
                {isTranslating ? 'Translating...' : 'Translate Automatically'}
              </Button>
            </div>
          )}
        </div>
        {/* Split Screen Layout */}
        <div className={isSplitScreenEnabled ? "grid grid-cols-2 gap-6" : ""}>
          {/* English (Reference) Column */}
          <div className={isSplitScreenEnabled ? "border-r pr-6" : ""}>
            {isSplitScreenEnabled && (
              <div className="mb-4 pb-2 border-b">
                <Label className="text-sm font-semibold text-blue-600">English (Reference)</Label>
              </div>
            )}
            
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
                  <div className="flex gap-2 items-center">
                    <input
                      id={`image-upload-${index}`}
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(index, file);
                      }}
                      disabled={uploadingIndex === index}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      onClick={() => document.getElementById(`image-upload-${index}`)?.click()}
                      disabled={uploadingIndex === index}
                      style={{ backgroundColor: '#f9dc24', color: 'black' }}
                      className="hover:opacity-90"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {uploadingIndex === index ? 'Uploading...' : 'Choose Image'}
                    </Button>
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
              Save English Version
            </Button>
          </div>

          {/* Target Language Column */}
          {isSplitScreenEnabled && (
            <div>
              <div className="mb-4 pb-2 border-b">
                <Label className="text-sm font-semibold text-green-600">
                  {targetLanguage.toUpperCase()} (Target)
                </Label>
              </div>

              <Tabs defaultValue="content">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="content">Content</TabsTrigger>
                  <TabsTrigger value="layout">Layout</TabsTrigger>
                  <TabsTrigger value="buttons">Buttons</TabsTrigger>
                  <TabsTrigger value="gallery">Gallery</TabsTrigger>
                </TabsList>

                {/* Target Content Tab */}
                <TabsContent value="content" className="space-y-4">
                  <div className="space-y-2">
                    <Label>Title (H1)</Label>
                    <Input
                      value={targetData.title}
                      onChange={(e) => setTargetData({ ...targetData, title: e.target.value })}
                      placeholder="Product Name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Subtitle (H2)</Label>
                    <Input
                      value={targetData.subtitle}
                      onChange={(e) => setTargetData({ ...targetData, subtitle: e.target.value })}
                      placeholder="Product Variants"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      value={targetData.description}
                      onChange={(e) => setTargetData({ ...targetData, description: e.target.value })}
                      placeholder="Product description"
                      rows={3}
                    />
                  </div>
                </TabsContent>

                {/* Target Layout Tab */}
                <TabsContent value="layout" className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Layout settings are inherited from English version
                  </p>
                </TabsContent>

                {/* Target Buttons Tab */}
                <TabsContent value="buttons" className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold">Button 1</h3>
                    <div className="space-y-2">
                      <Label>Text</Label>
                      <Input
                        value={targetData.cta1Text}
                        onChange={(e) => setTargetData({ ...targetData, cta1Text: e.target.value })}
                        placeholder="Contact Sales"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold">Button 2 (Optional)</h3>
                    <div className="space-y-2">
                      <Label>Text</Label>
                      <Input
                        value={targetData.cta2Text}
                        onChange={(e) => setTargetData({ ...targetData, cta2Text: e.target.value })}
                        placeholder="Learn More"
                      />
                    </div>
                  </div>
                </TabsContent>

                {/* Target Gallery Tab */}
                <TabsContent value="gallery" className="space-y-4">
                  {targetData.images.map((image, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Image {index + 1}</span>
                      </div>

                      <div>
                        <Label>Image Title (optional)</Label>
                        <Input
                          value={image.title}
                          onChange={(e) => {
                            const updatedImages = [...targetData.images];
                            updatedImages[index] = { ...updatedImages[index], title: e.target.value };
                            setTargetData({ ...targetData, images: updatedImages });
                          }}
                          placeholder="Image title"
                        />
                      </div>

                      <div>
                        <Label>Image Description (optional)</Label>
                        <Input
                          value={image.description}
                          onChange={(e) => {
                            const updatedImages = [...targetData.images];
                            updatedImages[index] = { ...updatedImages[index], description: e.target.value };
                            setTargetData({ ...targetData, images: updatedImages });
                          }}
                          placeholder="Image description"
                        />
                      </div>
                    </div>
                  ))}
                </TabsContent>
              </Tabs>

              <Button onClick={saveBothLanguages} className="w-full mt-6">
                Save Both Languages
              </Button>
            </div>
          )}
        </div>
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
