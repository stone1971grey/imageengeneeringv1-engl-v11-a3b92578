import { useState, useEffect, memo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Plus, Trash2, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { GeminiIcon } from '@/components/GeminiIcon';
import { MediaSelector } from '@/components/admin/MediaSelector';
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
import { updateMultipleSegmentMappings } from '@/utils/updateSegmentMapping';
import { loadAltTextFromMapping } from '@/utils/loadAltTextFromMapping';
import { syncAltTextToMediaManagement } from '@/utils/syncAltTextToMediaManagement';
import { removeBackground, loadImageFromFile, loadImageFromUrl } from "@/utils/removeImageBackground";

interface ProductImage {
  imageUrl: string;
  title: string;
  description: string;
  metadata?: ImageMetadata;
  maxWidth?: number | null;
  maxHeight?: number | null;
}

interface ProductHeroGalleryData {
  title: string;
  subtitle: string;
  description: string;
  imagePosition: 'left' | 'right';
  layoutRatio: '1-1' | '2-3' | '2-5';
  topSpacing: 'small' | 'medium' | 'large' | 'extra-large';
  imageMaxWidth: number | null;
  imageMaxHeight: number | null;
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
  const [removingBackgroundIndex, setRemovingBackgroundIndex] = useState<number | null>(null);
  
  // Initialize with default data structure - do NOT use data prop to avoid shared state
  const [localData, setLocalData] = useState<ProductHeroGalleryData>({
    title: '',
    subtitle: '',
    description: '',
    images: [],
    cta1Text: '',
    cta1Link: '',
    cta1Style: 'standard',
    cta2Text: '',
    cta2Link: '',
    cta2Style: 'standard',
    imagePosition: 'right',
    layoutRatio: '1-1',
    topSpacing: 'medium',
    imageMaxWidth: null,
    imageMaxHeight: null
  });

  useEffect(() => {
    loadContent();

    const handleExternalTranslate = () => {
      handleTranslate();
    };

    // Listen for SplitScreen "product-hero-gallery-translate" events
    window.addEventListener('product-hero-gallery-translate', handleExternalTranslate);
    return () => window.removeEventListener('product-hero-gallery-translate', handleExternalTranslate);
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
          // Update ONLY local state - do NOT call onChange to avoid parent state contamination
          const loadedData = gallerySegment.data;
          
          // Load alt text from file_segment_mappings for each image
          if (loadedData.images && loadedData.images.length > 0) {
            const imagesWithAltText = await Promise.all(
              loadedData.images.map(async (img: ProductImage) => {
                if (img.imageUrl) {
                  const altText = await loadAltTextFromMapping(img.imageUrl, 'page-images');
                  return {
                    ...img,
                    metadata: {
                      ...img.metadata,
                      altText: altText || img.metadata?.altText || ''
                    }
                  };
                }
                return img;
              })
            );
            loadedData.images = imagesWithAltText;
          }
          
          setLocalData(loadedData);
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
                // Update ONLY local state - do NOT call onChange
                const fallbackData = enGallerySegment.data;
                
                // Load alt text from file_segment_mappings for each image
                if (fallbackData.images && fallbackData.images.length > 0) {
                  const imagesWithAltText = await Promise.all(
                    fallbackData.images.map(async (img: ProductImage) => {
                      if (img.imageUrl) {
                        const altText = await loadAltTextFromMapping(img.imageUrl, 'page-images');
                        return {
                          ...img,
                          metadata: {
                            ...img.metadata,
                            altText: altText || img.metadata?.altText || ''
                          }
                        };
                      }
                      return img;
                    })
                  );
                  fallbackData.images = imagesWithAltText;
                }
                
                setLocalData(fallbackData);
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
      // Convert to base64
      const reader = new FileReader();
      const fileData = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // Call Edge Function with pageSlug for automatic folder creation
      const { data: result, error } = await supabase.functions.invoke('upload-image', {
        body: {
          fileName: file.name,
          fileData: fileData,
          bucket: 'page-images',
          folder: pageSlug,
          segmentId: segmentId,
          pageSlug: pageSlug // NEW: Automatic folder structure creation
        }
      });

      if (error) throw error;
      if (!result?.success) throw new Error(result?.error || 'Upload failed');

      // Extract image metadata
      const baseMetadata = await extractImageMetadata(file, result.url);
      const fullMetadata: ImageMetadata = {
        ...baseMetadata,
        altText: data.images[index]?.metadata?.altText || ''
      };

      const updatedImages = [...localData.images];
      updatedImages[index] = { 
        ...updatedImages[index], 
        imageUrl: result.url,
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

  const handleMediaSelect = async (index: number, url: string, metadata?: any) => {
    const fullMetadata: ImageMetadata = metadata ? { ...metadata, altText: data.images[index]?.metadata?.altText || '' } : { altText: '' };
    
    const updatedImages = [...localData.images];
    updatedImages[index] = { 
      ...updatedImages[index], 
      imageUrl: url,
      metadata: fullMetadata
    };
    
    const updatedData = { ...localData, images: updatedImages };
    
    // Update local and parent state
    setLocalData(updatedData);
    onChange(updatedData);

    // Auto-save after selection
    await autoSaveAfterUpload(updatedData);

    toast.success('Image selected and saved successfully');
  };

  const autoSaveAfterUpload = async (updatedData: ProductHeroGalleryData) => {
    try {
      // CRITICAL: Always include language filter to prevent cross-language contamination
      const { data: pageContentData, error: fetchError } = await supabase
        .from("page_content")
        .select("*")
        .eq("page_slug", pageSlug)
        .eq("section_key", "page_segments")
        .eq("language", language)
        .maybeSingle();

      if (fetchError) {
        console.error("Error loading page_segments:", fetchError);
        return;
      }

      let segments = [];
      if (pageContentData?.content_value) {
        segments = JSON.parse(pageContentData.content_value);
      }

      const updatedSegments = segments.map((seg: any) => {
        if (seg.type === "product-hero-gallery" && String(seg.id) === String(segmentId)) {
          return { ...seg, data: updatedData };
        }
        return seg;
      });

      // Use upsert with proper language constraint
      const { error: updateError } = await supabase
        .from("page_content")
        .upsert({
          page_slug: pageSlug,
          section_key: "page_segments",
          content_type: "json",
          content_value: JSON.stringify(updatedSegments),
          language: language,
          updated_at: new Date().toISOString(),
          updated_by: (await supabase.auth.getUser()).data.user?.id,
        }, {
          onConflict: 'page_slug,section_key,language'
        });

      if (updateError) {
        console.error("Auto-save error:", updateError);
      } else {
        console.log(`✅ Image auto-saved to database for language: ${language}`);
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
    // Silently skip translation for English (no toast)
    if (language === 'en') {
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

      let enSegmentsJson: string | null = enData?.content_value || null;

      // Fallback: legacy EN data without language field
      if (!enSegmentsJson) {
        const { data: legacyEnRow, error: legacyError } = await supabase
          .from("page_content")
          .select("content_value")
          .eq("page_slug", pageSlug)
          .eq("section_key", "page_segments")
          .is("language", null)
          .maybeSingle();

        if (legacyError) {
          console.error("Error loading legacy EN reference for translation:", legacyError);
        }

        if (legacyEnRow?.content_value) {
          enSegmentsJson = legacyEnRow.content_value;
        }
      }

      if (!enSegmentsJson) {
        toast.error("No English reference content found to translate");
        return;
      }

      const segments = JSON.parse(enSegmentsJson);
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
          ...sourceData, // Copy all language-independent fields (images, layout, links, styles) from EN
          title: translated["0"] || sourceData.title,
          subtitle: translated["1"] || sourceData.subtitle,
          description: translated["2"] || sourceData.description,
          cta1Text: translated["3"] || sourceData.cta1Text,
          cta2Text: translated["4"] || sourceData.cta2Text
        };
        setLocalData(updatedData);
        // DO NOT call onChange here - it would contaminate the English editor's display
        // The user must click Save to persist the translation
        toast.success("Content translated successfully! Click 'Save' to persist changes.");
       }
     } catch (error: any) {
       console.error('Translation error:', error);
       toast.error(error.message || "Translation failed");
     } finally {
       // Small delay so the visual translation feedback bar is clearly visible
       setTimeout(() => setIsTranslating(false), 600);
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

      // CRITICAL: Always use String() for ID comparisons and storage to prevent duplicates
      const segmentIdStr = String(segmentId);
      const segmentIndex = segments.findIndex((s: any) => String(s.id) === segmentIdStr);

      if (segmentIndex !== -1) {
        // Ensure stored ID is always a string
        segments[segmentIndex].id = segmentIdStr;
        segments[segmentIndex].data = localData;
      } else {
        segments.push({
          id: segmentIdStr,
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

      // Sync alt texts bidirectionally to Media Management
      for (const img of localData.images) {
        if (img.imageUrl && img.metadata?.altText) {
          await syncAltTextToMediaManagement(
            img.imageUrl,
            img.metadata.altText,
            language,
            'page-images',
            false
          );
        }
      }
      
      // Update segment mappings for all gallery images with alt text
      const imageUrls = localData.images.map(img => img.imageUrl).filter(Boolean);
      const altTexts = localData.images.map(img => img.metadata?.altText || '');
      if (imageUrls.length > 0) {
        await updateMultipleSegmentMappings(imageUrls, segmentId, 'page-images', false, altTexts);
      }

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
          Hero with product gallery, thumbnails, two CTA buttons and extended layout options
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {isTranslating && (
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 border-2 border-purple-400 rounded-lg p-4 text-center text-white font-semibold animate-pulse shadow-lg shadow-purple-500/50">
            ⏳ Translating content...
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
              <Label>Title (H1 – Zeile 1)</Label>
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
              <Label>Subtitle (H1 – Zeile 2)</Label>
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

            {/* Image Size Constraints */}
            <div className="space-y-2">
              <Label>Image Size Constraints (optional)</Label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-500 text-xs mb-1 block">Max Width (px)</Label>
                  <Input
                    type="number"
                    value={localData.imageMaxWidth || ''}
                    onChange={(e) => {
                      const updatedData = { ...localData, imageMaxWidth: e.target.value ? parseInt(e.target.value) : null };
                      setLocalData(updatedData);
                      onChange(updatedData);
                    }}
                    placeholder="e.g. 500"
                  />
                </div>
                <div>
                  <Label className="text-gray-500 text-xs mb-1 block">Max Height (px)</Label>
                  <Input
                    type="number"
                    value={localData.imageMaxHeight || ''}
                    onChange={(e) => {
                      const updatedData = { ...localData, imageMaxHeight: e.target.value ? parseInt(e.target.value) : null };
                      setLocalData(updatedData);
                      onChange(updatedData);
                    }}
                    placeholder="e.g. 400"
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500">Leave empty for auto-sizing. Applies to all gallery images.</p>
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
                </div>

                <MediaSelector
                  onFileSelect={async (file) => await handleImageUpload(index, file)}
                  onMediaSelect={(url, metadata) => handleMediaSelect(index, url, metadata)}
                  acceptedFileTypes="image/*"
                  label={`Gallery Image ${index + 1}`}
                  currentImageUrl={image.imageUrl}
                />

                {/* AI Background Removal Button - Individual per image, only in EN */}
                {image.imageUrl && language === 'en' && (
                  <Button
                    type="button"
                    onClick={async () => {
                      setRemovingBackgroundIndex(index);
                      try {
                        toast.info("Loading AI model for background removal...");
                        const imgElement = await loadImageFromUrl(image.imageUrl);
                        const resultBlob = await removeBackground(imgElement, (msg) => toast.info(msg));
                        const newFileName = `gallery_image_${index + 1}_nobg.png`;
                        const newFile = new File([resultBlob], newFileName, { type: 'image/png' });
                        toast.success("Background removed successfully!");
                        await handleImageUpload(index, newFile);
                      } catch (error: any) {
                        console.error('Background removal failed:', error);
                        toast.error("Background removal failed: " + error.message);
                      } finally {
                        setRemovingBackgroundIndex(null);
                      }
                    }}
                    disabled={removingBackgroundIndex !== null}
                    className={`w-full justify-center gap-3 h-auto py-3 px-5 text-white text-base font-semibold ${
                      removingBackgroundIndex !== null && removingBackgroundIndex !== index
                        ? 'bg-gradient-to-r from-purple-600/50 to-pink-600/50 cursor-not-allowed'
                        : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg shadow-purple-500/30'
                    }`}
                  >
                    {removingBackgroundIndex === index ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Removing Background...
                      </>
                    ) : (
                      <>
                        <GeminiIcon className="w-5 h-5" />
                        Remove Background (AI)
                      </>
                    )}
                  </Button>
                )}

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
                        <p className="text-gray-800">
                          {typeof image.metadata.width === 'number' && typeof image.metadata.height === 'number'
                            ? `${image.metadata.width} × ${image.metadata.height} px`
                            : '—'}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">File Size:</span>
                        <p className="text-gray-800">
                          {typeof image.metadata.fileSizeKB === 'number'
                            ? formatFileSize(image.metadata.fileSizeKB)
                            : '—'}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Format:</span>
                        <p className="text-gray-800">{image.metadata.format || '—'}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Uploaded:</span>
                        <p className="text-gray-800">
                          {image.metadata.uploadDate
                            ? formatUploadDate(image.metadata.uploadDate)
                            : '—'}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Storage URL:</span>
                        {(() => {
                          const storageUrl = image.metadata.url || image.imageUrl;
                          if (!storageUrl) {
                            return <p className="text-gray-800 text-xs">—</p>;
                          }
                          const fileName = storageUrl.split('/').pop() || storageUrl;
                          return (
                            <p className="text-gray-800 text-xs truncate" title={storageUrl}>
                              {fileName}
                            </p>
                          );
                        })()}
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

                {/* Individual Image Size Settings */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-3">
                  <Label className="font-medium text-blue-800">Image Size (individual)</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs text-blue-600">Max Width (px)</Label>
                      <Input
                        type="number"
                        value={image.maxWidth || ''}
                        onChange={(e) => {
                          const updatedImages = [...localData.images];
                          updatedImages[index] = {
                            ...updatedImages[index],
                            maxWidth: e.target.value ? parseInt(e.target.value) : null
                          };
                          const updatedData = { ...localData, images: updatedImages };
                          setLocalData(updatedData);
                          onChange(updatedData);
                        }}
                        placeholder="e.g. 450"
                        className="h-8"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-blue-600">Max Height (px)</Label>
                      <Input
                        type="number"
                        value={image.maxHeight || ''}
                        onChange={(e) => {
                          const updatedImages = [...localData.images];
                          updatedImages[index] = {
                            ...updatedImages[index],
                            maxHeight: e.target.value ? parseInt(e.target.value) : null
                          };
                          const updatedData = { ...localData, images: updatedImages };
                          setLocalData(updatedData);
                          onChange(updatedData);
                        }}
                        placeholder="e.g. 400"
                        className="h-8"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-blue-500">Leave empty to use global settings or auto-sizing.</p>
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

export default memo(ProductHeroGalleryEditor);
