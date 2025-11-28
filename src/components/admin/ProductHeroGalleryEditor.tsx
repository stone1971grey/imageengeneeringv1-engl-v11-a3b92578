import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2, Upload, Languages } from 'lucide-react';
import { GeminiIcon } from '@/components/GeminiIcon';
import { Switch } from '@/components/ui/switch';
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
  segmentId: number;
  language: string;
}

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
];

const ProductHeroGalleryEditor = ({ data, onChange, onSave, pageSlug, segmentId, language: editorLanguage }: ProductHeroGalleryEditorProps) => {
  const [targetLanguage, setTargetLanguage] = useState(() => {
    const saved = localStorage.getItem('cms-target-language');
    return saved || 'de';
  });
  const [isSplitScreenEnabled, setIsSplitScreenEnabled] = useState(() => {
    const saved = localStorage.getItem('cms-split-screen-mode');
    return saved !== null ? saved === 'true' : true;
  });
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
  const [isSaving, setIsSaving] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [targetDeleteIndex, setTargetDeleteIndex] = useState<number | null>(null);
  const [targetUploadingIndex, setTargetUploadingIndex] = useState<number | null>(null);

  const handleSplitScreenToggle = (checked: boolean) => {
    setIsSplitScreenEnabled(checked);
    localStorage.setItem('cms-split-screen-mode', String(checked));
  };

  const loadTargetLanguageData = async (lang: string) => {
    const { data: targetContent, error } = await supabase
      .from('page_content')
      .select('content_value')
      .eq('page_slug', pageSlug)
      .eq('section_key', 'page_segments')
      .eq('language', lang)
      .maybeSingle();

    if (!error && targetContent) {
      const targetSegments = JSON.parse(targetContent.content_value || "[]");
      const targetSegment = targetSegments.find((seg: any) => 
        seg.type === "product-hero-gallery" && String(seg.id) === String(segmentId)
      );
      
      if (targetSegment?.data) {
        console.log('[ProductHeroGalleryEditor] Loaded target language data:', targetSegment.data);
        setTargetData(targetSegment.data);
        return;
      }
    }

    console.log('[ProductHeroGalleryEditor] No target language data found, creating empty structure');
    setTargetData({
      ...data,
      title: '',
      subtitle: '',
      description: '',
      cta1Text: '',
      cta2Text: '',
      images: data.images.map(img => ({ ...img, title: '', description: '' }))
    });
  };

  useEffect(() => {
    if (isSplitScreenEnabled && editorLanguage === 'en') {
      loadTargetLanguageData(targetLanguage);
    }
  }, [targetLanguage, isSplitScreenEnabled, editorLanguage]);

  const handleTargetLanguageChange = (lang: string) => {
    setTargetLanguage(lang);
    localStorage.setItem('cms-target-language', lang);
  };

  const handleTranslate = async () => {
    setIsTranslating(true);
    try {
      const textToTranslate = {
        title: data.title,
        subtitle: data.subtitle,
        description: data.description,
        cta1Text: data.cta1Text,
        cta2Text: data.cta2Text,
        images: data.images.map(img => ({
          title: img.title,
          description: img.description
        }))
      };

      const { data: translationData, error } = await supabase.functions.invoke('translate-content', {
        body: {
          content: textToTranslate,
          targetLanguage,
          sourceLanguage: 'en',
          context: 'Product Hero Gallery segment with title, subtitle, description, CTA buttons, and product images'
        }
      });

      if (error) throw error;

      if (translationData?.translatedContent) {
        const translated = translationData.translatedContent;
        setTargetData({
          ...targetData,
          title: translated.title || '',
          subtitle: translated.subtitle || '',
          description: translated.description || '',
          cta1Text: translated.cta1Text || '',
          cta2Text: translated.cta2Text || '',
          images: targetData.images.map((img, idx) => ({
            ...img,
            title: translated.images?.[idx]?.title || '',
            description: translated.images?.[idx]?.description || ''
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

  const handleImageUpload = async (index: number, file: File, isTarget: boolean = false) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    if (isTarget) {
      setTargetUploadingIndex(index);
    } else {
      setUploadingIndex(index);
    }

    try {
      const fileExt = file.name.split('.').pop();
      const langSuffix = isTarget ? `_${targetLanguage}` : '';
      const fileName = `${pageSlug}/segment-${segmentId}/gallery-${index}${langSuffix}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('page-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('page-images')
        .getPublicUrl(fileName);

      const baseMetadata = await extractImageMetadata(file, publicUrl);
      const currentData = isTarget ? targetData : data;
      const currentImages = currentData.images;
      
      const fullMetadata: ImageMetadata = {
        ...baseMetadata,
        altText: currentImages[index]?.metadata?.altText || ''
      };

      const updatedImages = [...currentImages];
      updatedImages[index] = { 
        ...updatedImages[index], 
        imageUrl: publicUrl,
        metadata: fullMetadata
      };
      
      if (isTarget) {
        const updatedData = { ...targetData, images: updatedImages };
        setTargetData(updatedData);
        await autoSaveAfterUpload(updatedData, targetLanguage);
      } else {
        const updatedData = { ...data, images: updatedImages };
        onChange(updatedData);
        await autoSaveAfterUpload(updatedData, editorLanguage);
      }

      toast.success('Image uploaded and saved successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
    } finally {
      if (isTarget) {
        setTargetUploadingIndex(null);
      } else {
        setUploadingIndex(null);
      }
    }
  };

  const autoSaveAfterUpload = async (updatedData: ProductHeroGalleryData, lang: string) => {
    try {
      const { data: pageContentData, error: fetchError } = await supabase
        .from("page_content")
        .select("*")
        .eq("page_slug", pageSlug)
        .eq("section_key", "page_segments")
        .eq("language", lang)
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
        .eq("section_key", "page_segments")
        .eq("language", lang);

      if (updateError) {
        console.error("Auto-save error:", updateError);
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

  const handleTargetImageChange = (index: number, field: keyof ProductImage, value: string) => {
    const updatedImages = [...targetData.images];
    updatedImages[index] = { ...updatedImages[index], [field]: value };
    setTargetData({ ...targetData, images: updatedImages });
  };

  const handleAddImage = () => {
    onChange({
      ...data,
      images: [...data.images, { imageUrl: '', title: '', description: '' }]
    });
  };

  const handleTargetAddImage = () => {
    setTargetData({
      ...targetData,
      images: [...targetData.images, { imageUrl: '', title: '', description: '' }]
    });
  };

  const handleDeleteImage = (index: number) => {
    const updatedImages = data.images.filter((_, i) => i !== index);
    onChange({ ...data, images: updatedImages });
    setDeleteIndex(null);
  };

  const handleTargetDeleteImage = (index: number) => {
    const updatedImages = targetData.images.filter((_, i) => i !== index);
    setTargetData({ ...targetData, images: updatedImages });
    setTargetDeleteIndex(null);
  };

  const handleSaveTarget = async () => {
    setIsSaving(true);
    try {
      const { data: pageContentData, error: fetchError } = await supabase
        .from("page_content")
        .select("*")
        .eq("page_slug", pageSlug)
        .eq("section_key", "page_segments")
        .eq("language", targetLanguage)
        .maybeSingle();

      let segments = [];
      if (pageContentData) {
        segments = JSON.parse(pageContentData.content_value || "[]");
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
          data: targetData
        });
      }

      const { error: saveError } = await supabase
        .from("page_content")
        .upsert({
          page_slug: pageSlug,
          section_key: "page_segments",
          language: targetLanguage,
          content_type: "json",
          content_value: JSON.stringify(segments),
          updated_by: (await supabase.auth.getUser()).data.user?.id,
        });

      if (saveError) throw saveError;

      toast.success(`${LANGUAGES.find(l => l.code === targetLanguage)?.name} version saved successfully`);
      if (onSave) onSave();
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Failed to save target language version");
    } finally {
      setIsSaving(false);
    }
  };

  const renderGalleryImages = (images: ProductImage[], isTarget: boolean = false) => {
    const currentDeleteIndex = isTarget ? targetDeleteIndex : deleteIndex;
    const currentUploadingIndex = isTarget ? targetUploadingIndex : uploadingIndex;
    const handleChange = isTarget ? handleTargetImageChange : handleImageChange;
    const handleDelete = isTarget ? setTargetDeleteIndex : setDeleteIndex;
    const handleAdd = isTarget ? handleTargetAddImage : handleAddImage;
    const confirmDelete = isTarget ? handleTargetDeleteImage : handleDeleteImage;

    return (
      <>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold">Product Images</h3>
          <Button onClick={handleAdd} variant="outline" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Image
          </Button>
        </div>

        {images.map((image, index) => (
          <div key={index} className="border rounded-lg p-4 space-y-4 mb-4">
            <div className="flex justify-between items-center">
              <span className="font-medium">Image {index + 1}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(index)}
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </Button>
            </div>

            <div>
              <Label>Upload Image</Label>
              <div className="flex gap-2 items-center">
                <input
                  id={`image-upload-${index}-${isTarget ? 'target' : 'source'}`}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(index, file, isTarget);
                  }}
                  disabled={currentUploadingIndex === index}
                  className="hidden"
                />
                <Button
                  type="button"
                  onClick={() => document.getElementById(`image-upload-${index}-${isTarget ? 'target' : 'source'}`)?.click()}
                  disabled={currentUploadingIndex === index}
                  style={{ backgroundColor: '#f9dc24', color: 'black' }}
                  className="hover:opacity-90"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {currentUploadingIndex === index ? 'Uploading...' : 'Choose Image'}
                </Button>
              </div>
              {image.imageUrl && (
                <img src={image.imageUrl} alt={image.metadata?.altText || `Gallery ${index + 1}`} className="mt-2 h-20 object-contain" />
              )}
            </div>

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

            <div>
              <Label>Alt Text (for SEO & Accessibility) *</Label>
              <Input
                value={image.metadata?.altText || ''}
                onChange={(e) => {
                  const updatedImages = isTarget ? [...targetData.images] : [...data.images];
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
                  if (isTarget) {
                    setTargetData({ ...targetData, images: updatedImages });
                  } else {
                    onChange({ ...data, images: updatedImages });
                  }
                }}
                placeholder="Descriptive alt text for the image"
              />
            </div>

            <div>
              <Label>Title</Label>
              <Input
                value={image.title}
                onChange={(e) => handleChange(index, 'title', e.target.value)}
                placeholder="Image title"
              />
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={image.description}
                onChange={(e) => handleChange(index, 'description', e.target.value)}
                placeholder="Image description"
                rows={2}
              />
            </div>
          </div>
        ))}

        <AlertDialog open={currentDeleteIndex !== null} onOpenChange={() => isTarget ? setTargetDeleteIndex(null) : setDeleteIndex(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Image</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this image? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => currentDeleteIndex !== null && confirmDelete(currentDeleteIndex)}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );
  };

  const renderContentFields = (currentData: ProductHeroGalleryData, isTarget: boolean = false) => {
    const handleChange = (field: keyof ProductHeroGalleryData, value: any) => {
      if (isTarget) {
        setTargetData({ ...targetData, [field]: value });
      } else {
        onChange({ ...data, [field]: value });
      }
    };

    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Title (H1)</Label>
          <Input
            value={currentData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder="Product Name"
          />
        </div>

        <div className="space-y-2">
          <Label>Subtitle (H2)</Label>
          <Input
            value={currentData.subtitle}
            onChange={(e) => handleChange('subtitle', e.target.value)}
            placeholder="Product Variants"
          />
        </div>

        <div className="space-y-2">
          <Label>Description</Label>
          <Textarea
            value={currentData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Product description"
            rows={3}
          />
        </div>
      </div>
    );
  };

  const renderLayoutFields = (currentData: ProductHeroGalleryData, isTarget: boolean = false) => {
    const handleChange = (field: keyof ProductHeroGalleryData, value: any) => {
      if (isTarget) {
        setTargetData({ ...targetData, [field]: value });
      } else {
        onChange({ ...data, [field]: value });
      }
    };

    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Image Position</Label>
          <Select value={currentData.imagePosition} onValueChange={(value: any) => handleChange('imagePosition', value)}>
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
          <Select value={currentData.layoutRatio} onValueChange={(value: any) => handleChange('layoutRatio', value)}>
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
          <Select value={currentData.topSpacing} onValueChange={(value: any) => handleChange('topSpacing', value)}>
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
    );
  };

  const renderButtonFields = (currentData: ProductHeroGalleryData, isTarget: boolean = false) => {
    const handleChange = (field: keyof ProductHeroGalleryData, value: any) => {
      if (isTarget) {
        setTargetData({ ...targetData, [field]: value });
      } else {
        onChange({ ...data, [field]: value });
      }
    };

    return (
      <div className="space-y-6">
        <div className="space-y-4">
          <h3 className="font-semibold">Button 1</h3>
          <div className="space-y-2">
            <Label>Text</Label>
            <Input
              value={currentData.cta1Text}
              onChange={(e) => handleChange('cta1Text', e.target.value)}
              placeholder="Contact Sales"
            />
          </div>
          <div className="space-y-2">
            <Label>Link (use # for anchor)</Label>
            <Input
              value={currentData.cta1Link}
              onChange={(e) => handleChange('cta1Link', e.target.value)}
              placeholder="#contact or /path"
            />
          </div>
          <div className="space-y-2">
            <Label>Color</Label>
            <Select value={currentData.cta1Style} onValueChange={(value: any) => handleChange('cta1Style', value)}>
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
              onChange={(e) => handleChange('cta2Text', e.target.value)}
              placeholder="Learn More"
            />
          </div>
          <div className="space-y-2">
            <Label>Link (use # for anchor)</Label>
            <Input
              value={currentData.cta2Link}
              onChange={(e) => handleChange('cta2Link', e.target.value)}
              placeholder="#overview or /path"
            />
          </div>
          <div className="space-y-2">
            <Label>Color</Label>
            <Select value={currentData.cta2Style} onValueChange={(value: any) => handleChange('cta2Style', value)}>
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
      </div>
    );
  };

  if (editorLanguage !== 'en') {
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
          <Tabs defaultValue="content">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="layout">Layout</TabsTrigger>
              <TabsTrigger value="buttons">Buttons</TabsTrigger>
              <TabsTrigger value="gallery">Gallery</TabsTrigger>
            </TabsList>

            <TabsContent value="content" className="space-y-4">
              {renderContentFields(data, false)}
            </TabsContent>

            <TabsContent value="layout" className="space-y-4">
              {renderLayoutFields(data, false)}
            </TabsContent>

            <TabsContent value="buttons" className="space-y-4">
              {renderButtonFields(data, false)}
            </TabsContent>

            <TabsContent value="gallery" className="space-y-4">
              {renderGalleryImages(data.images, false)}
            </TabsContent>
          </Tabs>

          <Button onClick={onSave} className="w-full" style={{ backgroundColor: '#f9dc24', color: 'black' }}>
            Save Changes
          </Button>
        </CardContent>
      </Card>
    );
  }

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
        <div className="flex items-center justify-between gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            <Switch
              id="split-screen-mode"
              checked={isSplitScreenEnabled}
              onCheckedChange={handleSplitScreenToggle}
            />
            <Label htmlFor="split-screen-mode" className="cursor-pointer">
              Split-Screen Mode
            </Label>
          </div>
        </div>

        {!isSplitScreenEnabled ? (
          <>
            <Tabs defaultValue="content">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="content">Content</TabsTrigger>
                <TabsTrigger value="layout">Layout</TabsTrigger>
                <TabsTrigger value="buttons">Buttons</TabsTrigger>
                <TabsTrigger value="gallery">Gallery</TabsTrigger>
              </TabsList>

              <TabsContent value="content" className="space-y-4">
                {renderContentFields(data, false)}
              </TabsContent>

              <TabsContent value="layout" className="space-y-4">
                {renderLayoutFields(data, false)}
              </TabsContent>

              <TabsContent value="buttons" className="space-y-4">
                {renderButtonFields(data, false)}
              </TabsContent>

              <TabsContent value="gallery" className="space-y-4">
                {renderGalleryImages(data.images, false)}
              </TabsContent>
            </Tabs>

            <Button onClick={onSave} className="w-full" style={{ backgroundColor: '#f9dc24', color: 'black' }}>
              Save Changes
            </Button>
          </>
        ) : (
          <div className="grid grid-cols-2 gap-6">
            {/* English (Reference) Panel */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Languages className="w-5 h-5" />
                  English (Reference)
                </h3>
              </div>

              <Tabs defaultValue="content">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="content">Content</TabsTrigger>
                  <TabsTrigger value="layout">Layout</TabsTrigger>
                  <TabsTrigger value="buttons">Buttons</TabsTrigger>
                  <TabsTrigger value="gallery">Gallery</TabsTrigger>
                </TabsList>

                <TabsContent value="content" className="space-y-4">
                  {renderContentFields(data, false)}
                </TabsContent>

                <TabsContent value="layout" className="space-y-4">
                  {renderLayoutFields(data, false)}
                </TabsContent>

                <TabsContent value="buttons" className="space-y-4">
                  {renderButtonFields(data, false)}
                </TabsContent>

                <TabsContent value="gallery" className="space-y-4">
                  {renderGalleryImages(data.images, false)}
                </TabsContent>
              </Tabs>

              <Button onClick={onSave} className="w-full" style={{ backgroundColor: '#f9dc24', color: 'black' }}>
                Save English Version
              </Button>
            </div>

            {/* Target Language Panel */}
            <div className="space-y-4">
              <div className="space-y-3">
                <h3 className="font-semibold text-lg">Multi-Language Editor</h3>
                
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium">Target Language:</span>
                    <Select value={targetLanguage} onValueChange={handleTargetLanguageChange}>
                      <SelectTrigger className="w-[180px] h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {LANGUAGES.filter(lang => lang.code !== 'en').map(lang => (
                          <SelectItem key={lang.code} value={lang.code}>
                            {lang.flag} {lang.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    onClick={handleTranslate}
                    disabled={isTranslating}
                    className="h-8 text-sm"
                    style={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      border: 'none'
                    }}
                  >
                    <GeminiIcon className="w-4 h-4 mr-2 text-white" />
                    {isTranslating ? 'Translating...' : 'Translate automatically'}
                  </Button>
                </div>
              </div>

              <Tabs defaultValue="content">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="content">Content</TabsTrigger>
                  <TabsTrigger value="layout">Layout</TabsTrigger>
                  <TabsTrigger value="buttons">Buttons</TabsTrigger>
                  <TabsTrigger value="gallery">Gallery</TabsTrigger>
                </TabsList>

                <TabsContent value="content" className="space-y-4">
                  {renderContentFields(targetData, true)}
                </TabsContent>

                <TabsContent value="layout" className="space-y-4">
                  {renderLayoutFields(targetData, true)}
                </TabsContent>

                <TabsContent value="buttons" className="space-y-4">
                  {renderButtonFields(targetData, true)}
                </TabsContent>

                <TabsContent value="gallery" className="space-y-4">
                  {renderGalleryImages(targetData.images, true)}
                </TabsContent>
              </Tabs>

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
        )}
      </CardContent>
    </Card>
  );
};

export default ProductHeroGalleryEditor;