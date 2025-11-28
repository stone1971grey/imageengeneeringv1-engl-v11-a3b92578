import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Upload, Languages, Sparkles } from "lucide-react";
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

interface BannerImage {
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
  const [isSplitScreenEnabled, setIsSplitScreenEnabled] = useState(true);
  const [targetData, setTargetData] = useState<BannerData>(data);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);

  // Load target language data
  const loadTargetLanguageData = async (lang: string) => {
    // Load target language page_segments
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
        setTargetData(targetSegment.data);
      } else {
        // Copy structure from English but with empty text fields
        setTargetData({
          ...data,
          title: '',
          subtext: '',
          buttonText: '',
          images: data.images.map(img => ({ ...img, alt: '' }))
        });
      }
    } else {
      // If no target language version exists, copy structure from English but with empty text fields
      setTargetData({
        ...data,
        title: '',
        subtext: '',
        buttonText: '',
        images: data.images.map(img => ({ ...img, alt: '' }))
      });
    }
  };

  const handleTargetLanguageChange = async (lang: string) => {
    setTargetLanguage(lang);
    await loadTargetLanguageData(lang);
  };

  const handleImageUpload = async (index: number, file: File) => {
    setUploadingIndex(index);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${pageSlug}_banner_${segmentKey}_${index}_${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('page-images')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('page-images')
        .getPublicUrl(filePath);

      const metadataWithoutAlt = await extractImageMetadata(file, urlData.publicUrl);
      const metadata: ImageMetadata = {
        ...metadataWithoutAlt,
        altText: data.images[index]?.alt || ''
      };

      const updatedImages = [...data.images];
      updatedImages[index] = {
        ...updatedImages[index],
        url: urlData.publicUrl,
        metadata
      };
      
      onChange({ ...data, images: updatedImages });
      
      toast.success("Image uploaded successfully!");
    } catch (error: any) {
      toast.error("Error uploading image: " + error.message);
    } finally {
      setUploadingIndex(null);
    }
  };

  const handleAddImage = () => {
    onChange({
      ...data,
      images: [...data.images, { url: '', alt: '' }]
    });
  };

  const handleDeleteImage = (index: number) => {
    const updatedImages = data.images.filter((_, i) => i !== index);
    onChange({ ...data, images: updatedImages });
    setDeleteIndex(null);
  };

  const handleImageChange = (index: number, field: keyof BannerImage, value: string, isTarget: boolean = false) => {
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

  const handleTranslate = async () => {
    setIsTranslating(true);
    try {
      const textsToTranslate: Record<string, string> = {
        title: data.title || '',
        subtext: data.subtext || '',
        buttonText: data.buttonText || ''
      };

      // Add all image alt texts
      data.images.forEach((img, index) => {
        textsToTranslate[`image_${index}_alt`] = img.alt || '';
      });

      console.log('Translating Banner Segment:', textsToTranslate);

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
        
        // Update translated images with new alt texts
        const translatedImages = data.images.map((img, index) => ({
          ...img,
          alt: translated[`image_${index}_alt`] || img.alt
        }));

        setTargetData({
          ...targetData,
          title: translated.title || data.title || '',
          subtext: translated.subtext || data.subtext || '',
          buttonText: translated.buttonText || data.buttonText || '',
          images: translatedImages,
          buttonLink: data.buttonLink,  // Don't translate links
          buttonStyle: data.buttonStyle  // Don't translate button style
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
          return { ...seg, data };
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

        updatedSegments = segments.map((seg: any) => {
          if (seg.type === "banner" && String(seg.id) === String(segmentId)) {
            segmentFound = true;
            return { ...seg, data: targetData };
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

      if (!tabOrderRow) {
        const { data: englishTab } = await supabase
          .from("page_content")
          .select("content_value")
          .eq("page_slug", pageSlug)
          .eq("section_key", "tab_order")
          .eq("language", "en")
          .maybeSingle();

        if (englishTab?.content_value) {
          await supabase.from("page_content").insert({
            page_slug: pageSlug,
            section_key: "tab_order",
            language: targetLanguage,
            content_type: "json",
            content_value: englishTab.content_value,
          });
        }
      }

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
            {currentData.images.map((image, index) => (
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
                  <div>
                    <Label className="text-xs">Image File</Label>
                    <div className="flex items-center gap-4 mt-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(index, file);
                        }}
                        className="hidden"
                        id={`image-upload-${index}`}
                        disabled={uploadingIndex === index}
                      />
                      <Button
                        type="button"
                        onClick={() => document.getElementById(`image-upload-${index}`)?.click()}
                        className="bg-[#f9dc24] text-black hover:bg-[#f9dc24]/90 flex items-center gap-2"
                        disabled={uploadingIndex === index}
                      >
                        <Upload className="h-4 w-4" />
                        {uploadingIndex === index ? 'Uploading...' : 'Upload Image'}
                      </Button>
                    </div>
                    {image.url && (
                      <div className="mt-4 p-4 bg-background rounded">
                        <img
                          src={image.url}
                          alt={image.alt || `Banner image ${index + 1}`}
                          className="max-h-32 max-w-full object-contain mx-auto"
                        />
                      </div>
                    )}
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
                <Sparkles className="h-4 w-4 mr-2" />
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
