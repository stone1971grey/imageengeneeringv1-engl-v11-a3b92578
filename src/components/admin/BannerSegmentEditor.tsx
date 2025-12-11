import { useState, useEffect, useRef, memo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Languages } from "lucide-react";
import { GeminiIcon } from "@/components/GeminiIcon";
import { MediaSelector } from "@/components/admin/MediaSelector";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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
import { loadAltTextFromMapping } from '@/utils/loadAltTextFromMapping';

interface BannerImage {
  id: string; // Stable unique ID for reliable image updates
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

interface BannerSegmentEditorProps {
  data: BannerData;
  onChange: (data: BannerData) => void;
  onSave?: () => void;
  pageSlug: string;
  segmentKey: string;
  language: string;
}

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
];

const BannerSegmentEditorComponent = ({ 
  data, 
  onChange, 
  onSave, 
  pageSlug, 
  segmentKey,
  language: editorLanguage 
}: BannerSegmentEditorProps) => {
  const [targetLanguage, setTargetLanguage] = useState('de');
  const [isSplitScreenEnabled, setIsSplitScreenEnabled] = useState(() => {
    const saved = localStorage.getItem('cms-split-screen-mode');
    return saved !== null ? saved === 'true' : true;
  });
  const [targetData, setTargetData] = useState<BannerData>({
    title: '',
    subtext: '',
    buttonText: '',
    buttonLink: '',
    buttonStyle: 'standard',
    images: []
  });
  
  const generateImageId = () => `banner-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

  const ensureImageIds = (images: BannerImage[] = []): BannerImage[] =>
    images.map((img) =>
      img.id
        ? img
        : {
            ...img,
            id: generateImageId(),
          }
    );

  // Simple state management EXACTLY like DebugEditor
  const [images, setImages] = useState<BannerImage[]>(() =>
    ensureImageIds((data.images || []) as BannerImage[])
  );

  // Sync with parent data on segment change and load alt text
  useEffect(() => {
    const loadImagesWithAltText = async () => {
      const ensuredImages = ensureImageIds((data.images || []) as BannerImage[]);
      
      // Load alt text from file_segment_mappings for each image
      const imagesWithAltText = await Promise.all(
        ensuredImages.map(async (img) => {
          if (img.url) {
            const altText = await loadAltTextFromMapping(img.url, 'page-images');
            return {
              ...img,
              alt: altText || img.alt || ''
            };
          }
          return img;
        })
      );
      
      setImages(imagesWithAltText);
    };
    
    loadImagesWithAltText();
  }, [segmentKey, data.images]);

  const [isTranslating, setIsTranslating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  const handleSplitScreenToggle = (checked: boolean) => {
    setIsSplitScreenEnabled(checked);
    localStorage.setItem('cms-split-screen-mode', String(checked));
  };

  // Load target language data from backend
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
      const segmentId = segmentKey.replace('segment_', '');
      
      // Find the banner segment in target language
      const targetSegment = targetSegments.find((seg: any) => 
        seg.type === "banner" && String(seg.id) === String(segmentId)
      );
      
      if (targetSegment?.data) {
        const englishImagesCurrent = ensureImageIds(images || []);
        const targetImages = ensureImageIds(targetSegment.data.images || []);
        
        // Load alt text from file_segment_mappings for target language images
        const targetImagesWithAltText = await Promise.all(
          targetImages.map(async (img) => {
            if (img.url) {
              const altText = await loadAltTextFromMapping(img.url, 'page-images');
              return {
                ...img,
                alt: altText || img.alt || ''
              };
            }
            return img;
          })
        );
        
        // Merge: English defines which images exist (url/metadata),
        // target keeps its alt texts where possible
        const mergedImages: BannerImage[] = englishImagesCurrent.map((enImg, idx) => {
          const targetImg = targetImagesWithAltText[idx];
          return {
            ...enImg,
            alt: targetImg?.alt || ''
          };
        });
        
        setTargetData({
          ...targetSegment.data,
          images: mergedImages
        });
        return;
      }
    }
 
    // If no target language version exists, copy structure from English but with empty text fields
    const englishImagesCurrent = ensureImageIds(images || []);
    setTargetData({
      ...data,
      title: '',
      subtext: '',
      buttonText: '',
      images: englishImagesCurrent.map(img => ({ 
        ...img, 
        alt: '' 
      }))
    });
  };
 
  // Load target language data when editor opens OR when target language changes
  useEffect(() => {
    if (isSplitScreenEnabled) {
      loadTargetLanguageData(targetLanguage);
    }
  }, [targetLanguage, isSplitScreenEnabled]);
 
  const handleTargetLanguageChange = async (lang: string) => {
    setTargetLanguage(lang);
    // loadTargetLanguageData is now called by useEffect
  };

  // ID-based image upload handler (matching DebugEditor pattern)
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
      // Convert to base64
      const reader = new FileReader();
      const fileData = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No active session');

      const segmentIdNum = parseInt(segmentKey.replace('segment_', ''));

      // Call Edge Function
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

      // Use functional updater based on latest images state
      setImages(prev => {
        const updated = prev.map(img => {
          if (img.id !== imageId) return img;
          
          const metadata: ImageMetadata = {
            ...metadataWithoutAlt,
            altText: img.alt || ''
          };

          return {
            ...img,
            url: result.url,
            metadata,
          };
        });

        onChange({ ...data, images: updated });
        
        // Feedback for the slot that triggered upload, based on updated list
        const slotNumber = updated.findIndex(img => img.id === imageId) + 1;
        toast.success(`✅ Slot ${slotNumber} upload successful! Click "Save Changes" to store.`);

        return updated;
      });

      e.target.value = '';
      
    } catch (error: any) {
      toast.error('Upload failed: ' + (error.message || 'Unknown error'));
    } finally {
      setUploadingId(null);
    }
  };
 
  const handleMediaSelect = (imageId: string, url: string, metadata?: any) => {
    // Functional update based on latest state
    setImages(prev => {
      const updated = prev.map(img => {
        if (img.id !== imageId) return img;

        const imageMetadata: ImageMetadata = metadata 
          ? { ...metadata, altText: img.alt || '' } 
          : { 
              ...(img.metadata as ImageMetadata | undefined),
              altText: img.alt || ''
            } as ImageMetadata;

        return {
          ...img,
          url,
          metadata: imageMetadata,
        };
      });

      onChange({ ...data, images: updated });
      
      const slotNumber = updated.findIndex(img => img.id === imageId) + 1;
      toast.success(`✅ Slot ${slotNumber} image selected! Click "Save Changes" to store.`);

      return updated;
    });
  };

  const handleAddImage = () => {
    ensureImageIds(images);
    const newImage: BannerImage = {
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

  const handleImageChange = (imageId: string, field: keyof BannerImage, value: string, isTarget: boolean = false, index?: number) => {
    if (isTarget) {
      if (index === undefined) return;
      const updatedImages = [...targetData.images];
      updatedImages[index] = { ...updatedImages[index], [field]: value };
      setTargetData({ ...targetData, images: updatedImages });
    } else {
      const updatedImages = images.map(img =>
        img.id === imageId ? { ...img, [field]: value } : img
      );
      setImages(updatedImages);
      onChange({ ...data, images: updatedImages });
    }
  };

  const handleTranslate = async () => {
    setIsTranslating(true);
    try {
      const textsToTranslate: Record<string, string> = {
        title: data.title || '',
        subtext: data.subtext || '',
        buttonText: data.buttonText || ''
      };

      // Add all image alt texts from local images state
      images.forEach((img, index) => {
        textsToTranslate[`image_${index}_alt`] = img.alt || '';
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
        
        // Update translated images with new alt texts, keep all other properties (id, url, metadata)
        const translatedImages = images.map((img, index) => ({
          id: img.id || `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          url: img.url,
          alt: translated[`image_${index}_alt`] || img.alt,
          metadata: img.metadata
        }));

        const newTargetData = {
          title: translated.title || data.title || '',
          subtext: translated.subtext || data.subtext || '',
          buttonText: translated.buttonText || data.buttonText || '',
          images: translatedImages,
          buttonLink: data.buttonLink,  // Don't translate links
          buttonStyle: data.buttonStyle  // Don't translate button style
        };

        setTargetData(newTargetData);

        toast.success(`Translated to ${LANGUAGES.find(l => l.code === targetLanguage)?.name}`);
      }
    } catch (error) {
      toast.error('Translation failed');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSaveEnglish = async () => {
    setIsSaving(true);
    try {
      // Build current data with images derived from local state
      const dataToSave = { ...data, images: images };
      
      // Load current page_segments for English
      const { data: pageContentData, error: fetchError } = await supabase
        .from("page_content")
        .select("content_value")
        .eq("page_slug", pageSlug)
        .eq("section_key", "page_segments")
        .eq("language", "en")
        .single();

      if (fetchError) throw fetchError;

      const segments = JSON.parse(pageContentData.content_value || "[]");
      const segmentId = segmentKey.replace('segment_', '');
      
      // Update the banner segment in the array
      const updatedSegments = segments.map((seg: any) => {
        if (seg.type === "banner" && String(seg.id) === String(segmentId)) {
          return { ...seg, data: dataToSave };
        }
        return seg;
      });

      // Save back to page_segments
      const { error: updateError } = await supabase
        .from("page_content")
        .update({
          content_value: JSON.stringify(updatedSegments),
          updated_by: (await supabase.auth.getUser()).data.user?.id,
        })
        .eq("page_slug", pageSlug)
        .eq("section_key", "page_segments")
        .eq("language", "en");

      if (updateError) throw updateError;
      
        // Update segment mappings for all banner images from local state with alt text
        const imageUrls = images.map(img => img.url).filter(Boolean);
        const altTexts = images.map(img => img.alt || '');
      if (imageUrls.length > 0) {
        await updateMultipleSegmentMappings(imageUrls, parseInt(segmentId), 'page-images', true, altTexts);
      }
      
      toast.success('Saved English version');
      if (onSave) onSave();
    } catch (error) {
      toast.error('Save failed');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveTarget = async () => {
    setIsSaving(true);
    try {
      // Load current page_segments for target language
      const { data: pageContentData, error: fetchError } = await supabase
        .from("page_content")
        .select("content_value")
        .eq("page_slug", pageSlug)
        .eq("section_key", "page_segments")
        .eq("language", targetLanguage)
        .maybeSingle();

      const segmentId = segmentKey.replace('segment_', '');
      let updatedSegments: any[] = [];

      if (fetchError && fetchError.code !== 'PGRST116') {
        // PGRST116 = No rows found, which is fine for maybeSingle
        throw fetchError;
      }

      if (pageContentData) {
        // Target language version exists, update or create banner segment
        const segments = JSON.parse(pageContentData.content_value || "[]");
        let segmentFound = false;

        // Always sync images from local images state for target save (index-based)
        const mergedImages: BannerImage[] = images.map((enImg, idx) => {
          const targetImg = targetData.images[idx];
          return {
            ...enImg,
            alt: targetImg?.alt || ''
          };
        });
        const finalTargetData: BannerData = {
          ...targetData,
          images: mergedImages
        };

        updatedSegments = segments.map((seg: any) => {
          if (seg.type === "banner" && String(seg.id) === String(segmentId)) {
            segmentFound = true;
            return { ...seg, data: finalTargetData };
          }
          return seg;
        });

        // If banner segment not found in target language, create it from English template
        if (!segmentFound) {
          const { data: englishData } = await supabase
            .from("page_content")
            .select("content_value")
            .eq("page_slug", pageSlug)
            .eq("section_key", "page_segments")
            .eq("language", "en")
            .single();

          if (englishData) {
            const englishSegments = JSON.parse(englishData.content_value || "[]");
            const englishBanner = englishSegments.find((seg: any) => 
              seg.type === "banner" && String(seg.id) === String(segmentId)
            );

            if (englishBanner) {
              updatedSegments.push({ ...englishBanner, data: targetData });
            } else {
              // Fallback: create minimal banner segment
              updatedSegments.push({
                id: segmentId,
                type: "banner",
                data: targetData,
              });
            }
          }
        }

        const { error: updateError } = await supabase
          .from("page_content")
          .update({
            content_value: JSON.stringify(updatedSegments),
            updated_by: (await supabase.auth.getUser()).data.user?.id,
          })
          .eq("page_slug", pageSlug)
          .eq("section_key", "page_segments")
          .eq("language", targetLanguage);

        if (updateError) throw updateError;
      } else {
        // No target language version exists, create from English structure
        const { data: englishData } = await supabase
          .from("page_content")
          .select("content_value")
          .eq("page_slug", pageSlug)
          .eq("section_key", "page_segments")
          .eq("language", "en")
          .single();

        if (englishData) {
          const englishSegments = JSON.parse(englishData.content_value || "[]");

          updatedSegments = englishSegments.map((seg: any) => {
            if (seg.type === "banner" && String(seg.id) === String(segmentId)) {
              return { ...seg, data: targetData };
            }
            return seg;
          });

          const { error: insertError } = await supabase
            .from("page_content")
            .insert({
              page_slug: pageSlug,
              section_key: "page_segments",
              language: targetLanguage,
              content_type: "json",
              content_value: JSON.stringify(updatedSegments),
            });

          if (insertError) throw insertError;
        }
      }

      // Ensure tab_order exists for target language so segments are actually rendered
      const { data: tabOrderRow } = await supabase
        .from("page_content")
        .select("id, content_value")
        .eq("page_slug", pageSlug)
        .eq("section_key", "tab_order")
        .eq("language", targetLanguage)
        .maybeSingle();

      const segmentIdStr = String(segmentId);

      if (!tabOrderRow) {
        // No tab_order for target language: clone from English
        const { data: englishTab } = await supabase
          .from("page_content")
          .select("content_value")
          .eq("page_slug", pageSlug)
          .eq("section_key", "tab_order")
          .eq("language", "en")
          .maybeSingle();

        if (englishTab?.content_value) {
          let clonedOrder: string[] = [];
          try {
            clonedOrder = JSON.parse(englishTab.content_value || "[]");
          } catch (e) {
            // Silent fail on parse error
          }
          if (!clonedOrder.includes(segmentIdStr)) {
            clonedOrder.push(segmentIdStr);
          }

          await supabase.from("page_content").insert({
            page_slug: pageSlug,
            section_key: "tab_order",
            language: targetLanguage,
            content_type: "json",
            content_value: JSON.stringify(clonedOrder),
          });
        }
      } else {
        // Tab_order exists for target language: ensure banner segment ID is present
        let currentOrder: string[] = [];
        try {
          currentOrder = JSON.parse(tabOrderRow.content_value || "[]");
        } catch (e) {
          // Silent fail on parse error
        }
        if (!currentOrder.includes(segmentIdStr)) {
          currentOrder.push(segmentIdStr);
          await supabase
            .from("page_content")
            .update({ content_value: JSON.stringify(currentOrder) })
            .eq("id", tabOrderRow.id);
        }
      }

      // Update segment mappings for all banner images
      const imageUrls = targetData.images.map(img => img.url).filter(Boolean);
      if (imageUrls.length > 0) {
        await updateMultipleSegmentMappings(imageUrls, parseInt(segmentId));
      }

      toast.success(`Saved ${LANGUAGES.find(l => l.code === targetLanguage)?.name} version`);
    } catch (error) {
      toast.error('Save failed');
    } finally {
      setIsSaving(false);
    }
  };

  const renderEditor = (lang: string, isTarget: boolean = false) => {
    const currentData = isTarget ? targetData : data;
    const handleChange = isTarget 
      ? (newData: BannerData) => setTargetData(newData)
      : onChange;

    return (
      <div className="space-y-6 p-4 bg-background border rounded-lg">
        {/* Title */}
        <div>
          <Label className="font-medium">Banner Title</Label>
          <Input
            value={currentData.title || ''}
            onChange={(e) => handleChange({ ...currentData, title: e.target.value })}
            placeholder="Enter banner title"
            className="mt-2"
          />
        </div>

        {/* Subtext */}
        <div>
          <Label className="font-medium">Subtext (Optional)</Label>
          <Textarea
            value={currentData.subtext || ''}
            onChange={(e) => handleChange({ ...currentData, subtext: e.target.value })}
            placeholder="Enter optional subtext"
            className="mt-2 min-h-[80px]"
          />
        </div>

        {/* Images */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <Label className="font-medium">Banner Images (Logos/Icons)</Label>
            {!isTarget && (
              <Button
                type="button"
                onClick={handleAddImage}
                size="sm"
                className="bg-[#f9dc24] text-black hover:bg-[#f9dc24]/90"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Image
              </Button>
            )}
          </div>

          <div className="space-y-3">
            {(isTarget ? currentData.images : images).map((image, index) => {
              const isUploading = uploadingId === image.id;
              const hasImage = !!image.url;
              
              return (
              <div 
                key={image.id} 
                className="p-4 border-2 border-gray-600 rounded-lg bg-gray-900 space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white">Image {index + 1}</span>
                    {isUploading && (
                      <span className="text-xs px-2 py-0.5 bg-blue-500 text-white rounded-full animate-pulse">
                        Uploading...
                      </span>
                    )}
                    {hasImage && !isUploading && !isTarget && (
                      <span className="text-xs px-2 py-0.5 bg-green-500 text-white rounded-full">
                        ✓
                      </span>
                    )}
                  </div>
                  {!isTarget && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteId(image.id)}
                      className="h-8 w-8 p-0 hover:bg-red-900 hover:text-red-400 text-gray-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                {!isTarget && (
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
                    previewSize="small"
                  />
                )}

                <div>
                  <Label className="text-xs text-gray-400">Alt Text (SEO)</Label>
                  <Input
                    value={image.alt || ''}
                    onChange={(e) => handleImageChange(image.id, 'alt', e.target.value, isTarget, index)}
                    placeholder="Descriptive alt text"
                    className="mt-1 bg-gray-800 border-2 border-gray-600 text-white placeholder:text-gray-500 focus:border-[#f9dc24]"
                  />
                </div>
              </div>
            );
            })}
          </div>

        </div>

        {/* Button Settings */}
        <div className="p-4 border rounded-lg bg-muted/30 space-y-4">
          <h3 className="font-semibold">Call-to-Action Button (Optional)</h3>
          
          <div>
            <Label className="text-xs">Button Text</Label>
            <Input
              value={currentData.buttonText || ''}
              onChange={(e) => handleChange({ ...currentData, buttonText: e.target.value })}
              placeholder="e.g. Learn More"
              className="mt-1"
            />
          </div>

          {!isTarget && (
            <>
              <div>
                <Label className="text-xs">Button Link</Label>
                <Input
                  value={currentData.buttonLink || ''}
                  onChange={(e) => handleChange({ ...currentData, buttonLink: e.target.value.trim() })}
                  placeholder="https://example.com or /path"
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-xs">Button Style</Label>
                <Select
                  value={currentData.buttonStyle || 'standard'}
                  onValueChange={(value) => handleChange({ ...currentData, buttonStyle: value })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white z-50 text-black">
                    <SelectItem value="standard" className="text-black">Standard (Yellow)</SelectItem>
                    <SelectItem value="technical" className="text-black">Technical (Dark)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
        </div>

        {/* Save Button */}
        <Button
          onClick={isTarget ? handleSaveTarget : handleSaveEnglish}
          disabled={isSaving}
          className="w-full bg-[#f9dc24] text-black hover:bg-[#f9dc24]/90"
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {isTranslating && (
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 border-2 border-purple-400 rounded-lg p-4 text-center text-white font-semibold animate-pulse shadow-lg shadow-purple-500/50">
          ⏳ Translating content...
        </div>
      )}

      {/* Language Selector Card */}
      <Card className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 border-blue-700">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Languages className="h-5 w-5 text-blue-300" />
              <div>
                <CardTitle className="text-white text-lg">Multi-Language Editor</CardTitle>
                <CardDescription className="text-blue-200 text-sm mt-1">
                  Compare and edit Banner Segment in multiple languages side-by-side
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch 
                  id="split-screen-toggle"
                  checked={isSplitScreenEnabled}
                  onCheckedChange={handleSplitScreenToggle}
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
          
          {isSplitScreenEnabled && (
            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-blue-700/50">
              <label className="text-white font-medium text-sm">Target Language:</label>
              <Select value={targetLanguage} onValueChange={handleTargetLanguageChange}>
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
              
              <Button
                onClick={handleTranslate}
                disabled={isTranslating}
                className="ml-auto bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
              >
                <GeminiIcon className="h-4 w-4 mr-2" />
                {isTranslating ? "Translating..." : "Translate Automatically"}
              </Button>
            </div>
          )}
        </CardHeader>
      </Card>

      {/* Split Screen or Single View */}
      <div className={isSplitScreenEnabled ? "grid grid-cols-2 gap-6" : ""}>
        {isSplitScreenEnabled ? (
          <>
            {/* Left Panel - English */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-green-900/30 to-green-800/30 border-2 border-green-600/50 rounded-lg">
                <span className="text-2xl">🇺🇸</span>
                <div>
                  <div className="text-white font-semibold">English (Reference)</div>
                  <div className="text-green-300 text-xs">Source Language</div>
                </div>
              </div>
              {renderEditor('en', false)}
            </div>

            {/* Right Panel - Target Language */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-900/30 to-blue-800/30 border-2 border-blue-600/50 rounded-lg">
                <span className="text-2xl">{LANGUAGES.find(l => l.code === targetLanguage)?.flag}</span>
                <div>
                  <div className="text-white font-semibold">{LANGUAGES.find(l => l.code === targetLanguage)?.name}</div>
                  <div className="text-blue-300 text-xs">Target Language</div>
                </div>
              </div>
              {renderEditor(targetLanguage, true)}
            </div>
          </>
        ) : (
          renderEditor('en', false)
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
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
              onClick={() => deleteId !== null && handleDeleteImage(deleteId)}
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

export const BannerSegmentEditor = memo(BannerSegmentEditorComponent);
