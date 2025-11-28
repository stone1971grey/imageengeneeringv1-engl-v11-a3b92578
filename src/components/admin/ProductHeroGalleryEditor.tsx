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
import { GeminiIcon } from '@/components/GeminiIcon';
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
  language?: string;
}

const ProductHeroGalleryEditor = ({ data, onChange, onSave, pageSlug, segmentId, language = 'en' }: ProductHeroGalleryEditorProps) => {
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [localData, setLocalData] = useState<ProductHeroGalleryData>(data);

  useEffect(() => {
    loadContent();
  }, [pageSlug, segmentId, language]);


  const loadContent = async () => {
    if (!pageSlug) return;

    console.log('[PHG Editor] loadContent start', { pageSlug, segmentId, language });
    
    // 1) Try to load content for the current editor language
    const { data: currentLangRow, error } = await supabase
      .from("page_content")
      .select("*")
      .eq("page_slug", pageSlug)
      .eq("section_key", "page_segments")
      .eq("language", language)
      .maybeSingle();

    if (error) {
      console.error("[PHG Editor] Error loading page_segments:", error);
      return;
    }

    let segmentsJson: string | null = currentLangRow?.content_value || null;
    console.log('[PHG Editor] currentLangRow', { hasRow: !!currentLangRow, hasContent: !!segmentsJson });

    // 2) Fallback for legacy EN data without language field
    if (!segmentsJson && language === 'en') {
      const { data: legacyEnRow, error: legacyError } = await supabase
        .from("page_content")
        .select("*")
        .eq("page_slug", pageSlug)
        .eq("section_key", "page_segments")
        .is("language", null)
        .maybeSingle();

      if (legacyError) {
        console.error("[PHG Editor] Error loading legacy EN page_segments:", legacyError);
      }

      if (legacyEnRow?.content_value) {
        console.log('[PHG Editor] Using legacy EN fallback row');
        segmentsJson = legacyEnRow.content_value;
      }
    }

    if (segmentsJson) {
      try {
        const segments = JSON.parse(segmentsJson);
        console.log('[PHG Editor] Parsed segments count', segments.length);

        const gallerySegment = segments.find((seg: any) => 
          seg.type === "product-hero-gallery" && String(seg.id) === String(segmentId)
        );
        console.log('[PHG Editor] Found gallery segment?', { found: !!gallerySegment, ids: segments.map((s: any) => ({ id: s.id, type: s.type })) });

        if (gallerySegment?.data) {
          console.log('[PHG Editor] Applying data from DB for segment', segmentId);
          // Update both local state and parent state
          setLocalData(gallerySegment.data);
          onChange(gallerySegment.data);
        } else {
          // FALLBACK: If no data in current language, try loading from EN reference
          if (language !== 'en') {
            const { data: enRow } = await supabase
              .from("page_content")
              .select("*")
              .eq("page_slug", pageSlug)
              .eq("section_key", "page_segments")
              .eq("language", "en")
              .maybeSingle();

            let enSegmentsJson: string | null = enRow?.content_value || null;

            // Also consider legacy EN data without language for fallback
            if (!enSegmentsJson) {
              const { data: legacyEnRow } = await supabase
                .from("page_content")
                .select("*")
                .eq("page_slug", pageSlug)
                .eq("section_key", "page_segments")
                .is("language", null)
                .maybeSingle();

              if (legacyEnRow?.content_value) {
                enSegmentsJson = legacyEnRow.content_value;
              }
            }

            if (enSegmentsJson) {
              const enSegments = JSON.parse(enSegmentsJson);
              const enGallerySegment = enSegments.find((seg: any) => 
                seg.type === "product-hero-gallery" && String(seg.id) === String(segmentId)
              );

              if (enGallerySegment?.data) {
                console.log(`✅ Fallback: Loading layout from EN reference for segment ${segmentId}`);
                setLocalData(enGallerySegment.data);
                onChange(enGallerySegment.data);
              }
            }
          }
        }
      } catch (error) {
        console.error("Error parsing segments:", error);
      }
    }
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

      const updatedImages = [...localData.images];
      updatedImages[index] = { 
        ...updatedImages[index], 
        imageUrl: publicUrl,
        metadata: fullMetadata
      };
      
      const updatedData = { ...localData, images: updatedImages };
      
      // Update local and parent state
      setLocalData(updatedData);
      onChange(updatedData);

      // Auto-save after successful upload
      await autoSaveAfterUpload(updatedData);

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
    const updatedImages = [...localData.images];
    updatedImages[index] = { ...updatedImages[index], [field]: value };
    const updatedData = { ...localData, images: updatedImages };
    setLocalData(updatedData);
    onChange(updatedData);
  };

  const handleAddImage = () => {
    const updatedData = {
      ...localData,
      images: [...localData.images, { imageUrl: '', title: '', description: '' }]
    };
    setLocalData(updatedData);
    onChange(updatedData);
  };

  const handleDeleteImage = (index: number) => {
    const updatedImages = localData.images.filter((_, i) => i !== index);
    const updatedData = { ...localData, images: updatedImages };
    setLocalData(updatedData);
    onChange(updatedData);
    setDeleteIndex(null);
  };

  const handleTranslate = async () => {
    if (language === 'en') {
      toast.error("Cannot translate from English to English");
      return;
    }

    setIsTranslating(true);
    try {
      const { data: enData, error } = await supabase
        .from("page_content")
        .select("content_value")
        .eq("page_slug", pageSlug)
        .eq("section_key", "page_segments")
        .eq("language", "en")
        .maybeSingle();

      if (error) {
        console.error("Error loading EN reference for translation:", error);
        toast.error("Could not load English reference content");
        return;
      }

      if (!enData?.content_value) {
        toast.error("No English reference content found to translate");
        return;
      }

      const segments = JSON.parse(enData.content_value);
      const gallerySegment = segments.find((seg: any) => 
        seg.type === "product-hero-gallery" && String(seg.id) === String(segmentId)
      );

      if (!gallerySegment?.data) {
        toast.error("English segment data not found");
        return;
      }

      const sourceData = gallerySegment.data;
      const textsToTranslate = {
        "0": sourceData.title || '',
        "1": sourceData.subtitle || '',
        "2": sourceData.description || '',
        "3": sourceData.cta1Text || '',
        "4": sourceData.cta2Text || ''
      };

      const { data: translateData, error: translateError } = await supabase.functions.invoke('translate-content', {
        body: {
          texts: textsToTranslate,
          targetLanguage: language
        }
      });

      if (translateError) throw translateError;

      if (translateData?.translatedTexts) {
        const translated = translateData.translatedTexts;
        const updatedData = {
          ...localData,
          title: translated["0"] || sourceData.title,
          subtitle: translated["1"] || sourceData.subtitle,
          description: translated["2"] || sourceData.description,
          cta1Text: translated["3"] || sourceData.cta1Text,
          cta2Text: translated["4"] || sourceData.cta2Text
        };
        setLocalData(updatedData);
        onChange(updatedData);
        toast.success("Content translated successfully!");
      }
    } catch (error: any) {
      console.error('Translation error:', error);
      toast.error(error.message || "Translation failed");
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      const { data: existingContent } = await supabase
        .from("page_content")
        .select("content_value")
        .eq("page_slug", pageSlug)
        .eq("section_key", "page_segments")
        .eq("language", language)
        .maybeSingle();

      let segments = [];
      if (existingContent) {
        segments = JSON.parse(existingContent.content_value);
      }

      const segmentIndex = segments.findIndex((s: any) => s.id === segmentId);

      if (segmentIndex !== -1) {
        segments[segmentIndex].data = localData;
      } else {
        segments.push({
          id: segmentId,
          type: 'product-hero-gallery',
          data: localData
        });
      }

      const { error } = await supabase
        .from("page_content")
        .upsert({
          page_slug: pageSlug,
          section_key: "page_segments",
          content_type: "json",
          content_value: JSON.stringify(segments),
          language: language,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'page_slug,section_key,language'
        });

      if (error) throw error;

      // Also update tab_order if needed
      const { data: tabOrderData } = await supabase
        .from("page_content")
        .select("content_value")
        .eq("page_slug", pageSlug)
        .eq("section_key", "tab_order")
        .eq("language", language)
        .maybeSingle();

      if (tabOrderData) {
        const tabOrder = JSON.parse(tabOrderData.content_value);
        if (!tabOrder.includes(segmentId)) {
          tabOrder.push(segmentId);
          await supabase
            .from("page_content")
            .upsert({
              page_slug: pageSlug,
              section_key: "tab_order",
              content_type: "json",
              content_value: JSON.stringify(tabOrder),
              language: language,
              updated_at: new Date().toISOString()
            }, {
              onConflict: 'page_slug,section_key,language'
            });
        }
      }

      toast.success("Product Hero Gallery saved successfully!");
      onSave();
    } catch (error: any) {
      console.error('Save error:', error);
      toast.error("Save failed: " + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const LANGUAGES = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'de', name: 'German', flag: '🇩🇪' },
    { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
    { code: 'ko', name: 'Korean', flag: '🇰🇷' },
    { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
  ];

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
        {language !== 'en' && (
          <div className="p-4 bg-gradient-to-r from-blue-900/40 to-purple-900/40 border border-blue-500/30 rounded-lg">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">{LANGUAGES.find(l => l.code === language)?.flag}</span>
              <div>
                <div className="text-white font-semibold text-sm">Multi-Language Editor</div>
                <div className="text-blue-300 text-xs">Compare and edit Product Hero Gallery in multiple languages</div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <label className="text-white font-medium text-sm">Target Language:</label>
                <div className="px-3 py-1.5 bg-blue-950/70 border border-blue-600 rounded-md text-white text-sm">
                  <span className="flex items-center gap-2">
                    <span className="text-lg">{LANGUAGES.find(l => l.code === language)?.flag}</span>
                    <span>{LANGUAGES.find(l => l.code === language)?.name}</span>
                  </span>
                </div>
              </div>
              <Button
                onClick={handleTranslate}
                disabled={isTranslating}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
              >
                <GeminiIcon className="mr-2 h-4 w-4" />
                {isTranslating ? "Translating..." : "Translate Automatically"}
              </Button>
            </div>
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
                value={localData.title}
                onChange={(e) => {
                  const updatedData = { ...localData, title: e.target.value };
                  setLocalData(updatedData);
                  onChange(updatedData);
                }}
                placeholder="Product Name"
              />
            </div>

            <div className="space-y-2">
              <Label>Subtitle (H2)</Label>
              <Input
                value={localData.subtitle}
                onChange={(e) => {
                  const updatedData = { ...localData, subtitle: e.target.value };
                  setLocalData(updatedData);
                  onChange(updatedData);
                }}
                placeholder="Product Variants"
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={localData.description}
                onChange={(e) => {
                  const updatedData = { ...localData, description: e.target.value };
                  setLocalData(updatedData);
                  onChange(updatedData);
                }}
                placeholder="Product description"
                rows={3}
              />
            </div>
          </TabsContent>

          {/* Layout Tab */}
          <TabsContent value="layout" className="space-y-4">
            <div className="space-y-2">
              <Label>Image Position</Label>
              <Select value={localData.imagePosition} onValueChange={(value: any) => {
                const updatedData = { ...localData, imagePosition: value };
                setLocalData(updatedData);
                onChange(updatedData);
              }}>
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
              <Select value={localData.layoutRatio} onValueChange={(value: any) => {
                const updatedData = { ...localData, layoutRatio: value };
                setLocalData(updatedData);
                onChange(updatedData);
              }}>
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
              <Select value={localData.topSpacing} onValueChange={(value: any) => {
                const updatedData = { ...localData, topSpacing: value };
                setLocalData(updatedData);
                onChange(updatedData);
              }}>
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
                  value={localData.cta1Text}
                  onChange={(e) => {
                    const updatedData = { ...localData, cta1Text: e.target.value };
                    setLocalData(updatedData);
                    onChange(updatedData);
                  }}
                  placeholder="Contact Sales"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cta1Link">Link (use # for anchor)</Label>
                <Input
                  id="cta1Link"
                  value={localData.cta1Link}
                  onChange={(e) => {
                    const updatedData = { ...localData, cta1Link: e.target.value };
                    setLocalData(updatedData);
                    onChange(updatedData);
                  }}
                  placeholder="#contact or /path"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cta1Style">Color</Label>
                <Select value={localData.cta1Style} onValueChange={(value: any) => {
                  const updatedData = { ...localData, cta1Style: value };
                  setLocalData(updatedData);
                  onChange(updatedData);
                }}>
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
                  value={localData.cta2Text}
                  onChange={(e) => {
                    const updatedData = { ...localData, cta2Text: e.target.value };
                    setLocalData(updatedData);
                    onChange(updatedData);
                  }}
                  placeholder="Learn More"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cta2Link">Link (use # for anchor)</Label>
                <Input
                  id="cta2Link"
                  value={localData.cta2Link}
                  onChange={(e) => {
                    const updatedData = { ...localData, cta2Link: e.target.value };
                    setLocalData(updatedData);
                    onChange(updatedData);
                  }}
                  placeholder="#overview or /path"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cta2Style">Color</Label>
                <Select value={localData.cta2Style} onValueChange={(value: any) => {
                  const updatedData = { ...localData, cta2Style: value };
                  setLocalData(updatedData);
                  onChange(updatedData);
                }}>
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

            {localData.images.map((image, index) => (
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
                      const updatedImages = [...localData.images];
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
                      const updatedData = { ...localData, images: updatedImages };
                      setLocalData(updatedData);
                      onChange(updatedData);
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

        <Button 
          onClick={handleSaveChanges} 
          disabled={isSaving}
          className="w-full mt-6"
          style={{ backgroundColor: '#f9dc24', color: 'black' }}
        >
          {isSaving ? "Saving..." : `Save Product Hero Gallery (${LANGUAGES.find(l => l.code === language)?.name})`}
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
