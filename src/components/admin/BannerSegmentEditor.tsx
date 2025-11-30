import { useState, useEffect } from "react";
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

interface BannerImage {
  id?: string; // Optional ID, we primarily work index-based in the editor now
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

export const BannerSegmentEditor = ({ 
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
  
  const ensureImageIds = (images: BannerImage[]): BannerImage[] => images;

  // Single source of truth: always derive images from props (data.images)
  const englishImages = data.images || [];

  // Legacy hook retained for possible future use (no-op for now)
  useEffect(() => {
    // no-op: we no longer mutate data.images here to avoid overwriting edits
  }, [data.images]);

  const [isTranslating, setIsTranslating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);

  const updateEnglishImages = (updater: (prev: BannerImage[]) => BannerImage[]) => {
    const next = updater(englishImages);
    onChange({ ...data, images: next });
  };

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
        console.log('[BannerSegmentEditor] Loaded target language data:', targetSegment.data);
        const englishImages = ensureImageIds(data.images || []);
        const targetImages = ensureImageIds(targetSegment.data.images || []);
        
        // Merge: English defines which images exist (url/metadata),
        // target keeps its alt texts where possible
        const mergedImages: BannerImage[] = englishImages.map((enImg, idx) => {
          const targetImg = targetImages[idx];
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
    console.log('[BannerSegmentEditor] No target language data found, creating empty structure from English');
    const englishImages = ensureImageIds(data.images || []);
    setTargetData({
      ...data,
      title: '',
      subtext: '',
      buttonText: '',
      images: englishImages.map(img => ({ 
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

  const handleImageUpload = async (index: number, file: File) => {
    try {
      setUploadingIndex(index);
      console.log('[BannerSegmentEditor] handleImageUpload start', { index, imagesBefore: englishImages });

      // Convert to base64
      const reader = new FileReader();
      const fileData = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const segmentIdNum = parseInt(segmentKey.replace('segment_', ''));

      // Call Edge Function with pageSlug for automatic folder creation
      const { data: result, error } = await supabase.functions.invoke('upload-image', {
        body: {
          fileName: file.name,
          fileData: fileData,
          bucket: 'page-images',
          folder: pageSlug,
          segmentId: segmentIdNum,
          pageSlug: pageSlug
        }
      });

      if (error) throw error;
      if (!result?.success) throw new Error(result?.error || 'Upload failed');

      const metadataWithoutAlt = await extractImageMetadata(file, result.url);

      updateEnglishImages(prev => {
        const currentImage = prev[index];
        const metadata: ImageMetadata = {
          ...metadataWithoutAlt,
          altText: currentImage?.alt || ''
        };

        const updated = [...prev];
        updated[index] = {
          ...(currentImage || { url: '', alt: '' }),
          url: result.url,
          metadata,
        };
        console.log('[BannerSegmentEditor] handleImageUpload updatedImages', { index, updated });
        return updated;
      });

      toast.success("Image uploaded successfully!");
    } catch (error: any) {
      toast.error("Error uploading image: " + error.message);
    } finally {
      setUploadingIndex(null);
    }
  };
 
  const handleMediaSelect = async (index: number, url: string, metadata?: any) => {
    updateEnglishImages(prev => {
      const currentImage = prev[index];

      const imageMetadata: ImageMetadata = metadata 
        ? { ...metadata, altText: currentImage?.alt || '' } 
        : { 
            ...(currentImage?.metadata as ImageMetadata | undefined),
            altText: currentImage?.alt || ''
          } as ImageMetadata;

      const updated = [...prev];
      updated[index] = {
        ...(currentImage || { url: '', alt: '' }),
        url,
        metadata: imageMetadata,
      };
      return updated;
    });
    toast.success("Image selected successfully!");
  };

  const handleAddImage = () => {
    const newImage: BannerImage = {
      url: '',
      alt: ''
    };
    updateEnglishImages(prev => [...prev, newImage]);
  };

  const handleDeleteImage = (index: number) => {
    updateEnglishImages(prev => prev.filter((_, i) => i !== index));
    setDeleteIndex(null);
  };

  const handleImageChange = (index: number, field: keyof BannerImage, value: string, isTarget: boolean = false) => {
    if (isTarget) {
      const updatedImages = [...targetData.images];
      updatedImages[index] = { ...updatedImages[index], [field]: value };
      setTargetData({ ...targetData, images: updatedImages });
    } else {
      updateEnglishImages(prev => {
        const updated = [...prev];
        updated[index] = { ...updated[index], [field]: value };
        return updated;
      });
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

      // Add all image alt texts from local englishImages state
      englishImages.forEach((img, index) => {
        textsToTranslate[`image_${index}_alt`] = img.alt || '';
      });

      console.log('Translating Banner Segment:', textsToTranslate);
      console.log('English images structure:', englishImages);

      const { data: translationResult, error } = await supabase.functions.invoke('translate-content', {
        body: {
          texts: textsToTranslate,
          targetLanguage
        }
      });

      if (error) throw error;

      console.log('Translation result:', translationResult);

      if (translationResult?.translatedTexts) {
        const translated = translationResult.translatedTexts;
        
        // Update translated images with new alt texts, keep all other properties (id, url, metadata)
        const translatedImages = englishImages.map((img, index) => ({
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

        console.log('Setting targetData after translation:', newTargetData);
        setTargetData(newTargetData);

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
      // Build current data with images derived from props (single source of truth)
      const dataToSave = { ...data, images: englishImages };
      
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
      
      // Update segment mappings for all banner images from local state
      const imageUrls = englishImages.map(img => img.url).filter(Boolean);
      if (imageUrls.length > 0) {
        await updateMultipleSegmentMappings(imageUrls, parseInt(segmentId));
      }
      
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
      console.log('handleSaveTarget called with targetData:', targetData);
      console.log('Target language:', targetLanguage);
      console.log('Page slug:', pageSlug);
      console.log('Segment key:', segmentKey);

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
        console.log('Target language page_segments exist, updating...');
        // Target language version exists, update or create banner segment
        const segments = JSON.parse(pageContentData.content_value || "[]");
        let segmentFound = false;

        // Always sync images from English props for target save (index-based)
        const englishImagesLocal: BannerImage[] = data.images || [];
        const mergedImages: BannerImage[] = englishImagesLocal.map((enImg, idx) => {
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
            console.log('Found existing banner segment, updating with finalTargetData');
            return { ...seg, data: finalTargetData };
          }
          return seg;
        });

        // If banner segment not found in target language, create it from English template
        if (!segmentFound) {
          console.log('Banner segment not found in target language, creating from English template');
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

        console.log('Updating page_segments for target language:', updatedSegments);
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
        console.log('No target language page_segments exist, creating from English structure');
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
              console.log('Replacing English banner data with targetData');
              return { ...seg, data: targetData };
            }
            return seg;
          });

          console.log('Inserting new page_segments for target language:', updatedSegments);
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
        console.log('No tab_order for target language, cloning from English');
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
            console.error('Error parsing EN tab_order while cloning for target language', e);
          }
          if (!clonedOrder.includes(segmentIdStr)) {
            clonedOrder.push(segmentIdStr);
          }

          console.log('Inserting tab_order for target language:', clonedOrder);
          await supabase.from("page_content").insert({
            page_slug: pageSlug,
            section_key: "tab_order",
            language: targetLanguage,
            content_type: "json",
            content_value: JSON.stringify(clonedOrder),
          });
        }
      } else {
        console.log('tab_order exists for target language, ensuring segment ID is present');
        // Tab_order exists for target language: ensure banner segment ID is present
        let currentOrder: string[] = [];
        try {
          currentOrder = JSON.parse(tabOrderRow.content_value || "[]");
        } catch (e) {
          console.error('Error parsing tab_order for target language', e);
        }
        if (!currentOrder.includes(segmentIdStr)) {
          currentOrder.push(segmentIdStr);
          console.log('Updating tab_order to include segment ID:', currentOrder);
          await supabase
            .from("page_content")
            .update({ content_value: JSON.stringify(currentOrder) })
            .eq("id", tabOrderRow.id);
        } else {
          console.log('Segment ID already in tab_order');
        }
      }

      // Update segment mappings for all banner images
      const imageUrls = targetData.images.map(img => img.url).filter(Boolean);
      if (imageUrls.length > 0) {
        await updateMultipleSegmentMappings(imageUrls, parseInt(segmentId));
      }

      console.log('Save completed successfully');
      toast.success(`Saved ${LANGUAGES.find(l => l.code === targetLanguage)?.name} version`);
    } catch (error) {
      console.error('Save error:', error);
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

          <div className="space-y-4">
            {(isTarget ? currentData.images : englishImages).map((image, index) => (
              <div key={index} className="p-4 border rounded-lg bg-muted/30 space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">Image {index + 1}</span>
                  {!isTarget && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => setDeleteIndex(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                {!isTarget && (
                  <MediaSelector
                    onFileSelect={(file) => handleImageUpload(index, file)}
                    onMediaSelect={(url, metadata) => handleMediaSelect(index, url, metadata)}
                    acceptedFileTypes="image/*"
                    label="Image File"
                    currentImageUrl={image.url}
                  />
                )}

                {image.url && (
                  <div className="mt-4 p-4 bg-background rounded relative">
                    <img
                      src={image.url}
                      alt={image.alt || `Banner image ${index + 1}`}
                      className="max-h-32 max-w-full object-contain mx-auto"
                    />
                  </div>
                )}

                {/* Alt Text */}
                <div>
                  <Label className="text-xs">Alt Text</Label>
                  <Input
                    value={image.alt || ''}
                    onChange={(e) => handleImageChange(index, 'alt', e.target.value, isTarget)}
                    placeholder="Descriptive alt text"
                    className="mt-1"
                  />
                </div>
              </div>
            ))}
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
