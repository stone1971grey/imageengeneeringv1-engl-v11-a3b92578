import { useState, useEffect, memo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { X, Trash2 } from "lucide-react";
import { GeminiIcon } from "@/components/GeminiIcon";
import { ImageMetadata, extractImageMetadata, formatFileSize, formatUploadDate } from '@/types/imageMetadata';
import { MediaSelector } from "@/components/admin/MediaSelector";
import { updateSegmentMapping } from "@/utils/updateSegmentMapping";

interface ProductHeroEditorProps {
  pageSlug: string;
  segmentId: number;
  onSave: () => void;
  language?: string;
}

const ProductHeroEditorComponent = ({ pageSlug, segmentId, onSave, language = 'en' }: ProductHeroEditorProps) => {
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [description, setDescription] = useState("");
  const [ctaText, setCtaText] = useState("");
  const [ctaLink, setCtaLink] = useState("");
  const [ctaStyle, setCtaStyle] = useState<'standard' | 'technical'>('standard');
  const [imageUrl, setImageUrl] = useState("");
  const [imageMetadata, setImageMetadata] = useState<ImageMetadata | null>(null);
  const [imagePosition, setImagePosition] = useState<'left' | 'right'>('right');
  const [layoutRatio, setLayoutRatio] = useState<'1-1' | '2-3' | '2-5'>('2-5');
  const [topSpacing, setTopSpacing] = useState<'small' | 'medium' | 'large' | 'xlarge'>('medium');
  const [isUploading, setIsUploading] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadContent();

    const handleExternalTranslate = () => {
      handleTranslate();
    };

    window.addEventListener('ph-translate', handleExternalTranslate);
    return () => window.removeEventListener('ph-translate', handleExternalTranslate);
  }, [pageSlug, segmentId, language]);

  const loadContent = async () => {
    if (!pageSlug) return;
    
    const { data, error } = await supabase
      .from("page_content")
      .select("*")
      .eq("page_slug", pageSlug)
      .eq("section_key", "page_segments")
      .eq("language", language);

    if (error) {
      console.error("Error loading page_segments:", error);
      return;
    }

    if (data && data.length > 0) {
      try {
        const segments = JSON.parse(data[0].content_value);
        const heroSegment = segments.find((seg: any) => 
          seg.type === "hero" && String(seg.id) === String(segmentId)
        );

        if (heroSegment?.data) {
          setTitle(heroSegment.data.hero_title || '');
          setSubtitle(heroSegment.data.hero_subtitle || '');
          setDescription(heroSegment.data.hero_description || '');
          setCtaText(heroSegment.data.hero_cta_text || '');
          setCtaLink(heroSegment.data.hero_cta_link || '');
          setCtaStyle(heroSegment.data.hero_cta_style || 'standard');
          
          // Load current language values
          let currentImageUrl = heroSegment.data.hero_image_url || '';
          let currentImageMetadata = heroSegment.data.hero_image_metadata || null;
          let currentImagePosition = heroSegment.data.hero_image_position || 'right';
          let currentLayoutRatio = heroSegment.data.hero_layout_ratio || '2-5';
          let currentTopSpacing = heroSegment.data.hero_top_spacing || 'medium';

          // FALLBACK: For non-EN languages, ALWAYS load layout settings from EN reference
          if (language !== 'en') {
            const { data: enData } = await supabase
              .from("page_content")
              .select("content_value")
              .eq("page_slug", pageSlug)
              .eq("section_key", "page_segments")
              .eq("language", "en")
              .maybeSingle();

            if (enData?.content_value) {
              const enSegments = JSON.parse(enData.content_value);
              const enHeroSegment = enSegments.find((seg: any) => 
                seg.type === "hero" && String(seg.id) === String(segmentId)
              );

              if (enHeroSegment?.data) {
                console.log(`✅ Fallback: Loading layout settings from EN reference for segment ${segmentId}`);
                
                // If no image in current language, use EN image
                if (!currentImageUrl && enHeroSegment.data.hero_image_url) {
                  currentImageUrl = enHeroSegment.data.hero_image_url;
                  currentImageMetadata = enHeroSegment.data.hero_image_metadata;
                }
                
                // ALWAYS use EN layout settings to ensure consistency
                currentImagePosition = enHeroSegment.data.hero_image_position || 'right';
                currentLayoutRatio = enHeroSegment.data.hero_layout_ratio || '2-5';
                currentTopSpacing = enHeroSegment.data.hero_top_spacing || 'medium';
              }
            }
          }

          setImageUrl(currentImageUrl);
          setImageMetadata(currentImageMetadata);
          setImagePosition(currentImagePosition);
          setLayoutRatio(currentLayoutRatio);
          setTopSpacing(currentTopSpacing);
        }
      } catch (error) {
        console.error("Error parsing segments:", error);
      }
    }
  };

  const handleImageUpload = async (file: File) => {
    setIsUploading(true);
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

      const metadataWithoutAlt = await extractImageMetadata(file, result.url);
      const metadata: ImageMetadata = {
        ...metadataWithoutAlt,
        altText: ''
      };

      setImageUrl(result.url);
      setImageMetadata(metadata);

      // Auto-sync to all languages
      const allLanguages: Array<'en' | 'de' | 'ja' | 'ko' | 'zh'> = ['en', 'de', 'ja', 'ko', 'zh'];
      
      for (const lang of allLanguages) {
        const { data: existingContent } = await supabase
          .from("page_content")
          .select("content_value")
          .eq("page_slug", pageSlug)
          .eq("section_key", "page_segments")
          .eq("language", lang)
          .maybeSingle();
        
        if (existingContent) {
          const existingSegments = JSON.parse(existingContent.content_value);
          const segmentIndex = existingSegments.findIndex((s: any) => s.id === segmentId);
          
          if (segmentIndex !== -1) {
            existingSegments[segmentIndex].data = {
              ...existingSegments[segmentIndex].data,
              hero_image_url: result.url,
              hero_image_metadata: metadata
            };
            
            await supabase
              .from("page_content")
              .update({
                content_value: JSON.stringify(existingSegments),
                updated_at: new Date().toISOString()
              })
              .eq("page_slug", pageSlug)
              .eq("section_key", "page_segments")
              .eq("language", lang);
          }
        }
      }
      
      toast.success("Image uploaded and synced to all languages!");
    } catch (error) {
      console.error('Image upload error:', error);
      toast.error("Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const handleMediaSelect = async (url: string, metadata?: any) => {
    const imageMetadata: ImageMetadata = metadata ? { ...metadata, altText: '' } : { altText: '' };
    setImageUrl(url);
    setImageMetadata(imageMetadata);
    
    // Auto-sync to all languages
    const allLanguages: Array<'en' | 'de' | 'ja' | 'ko' | 'zh'> = ['en', 'de', 'ja', 'ko', 'zh'];
    
    for (const lang of allLanguages) {
      const { data: existingContent } = await supabase
        .from("page_content")
        .select("content_value")
        .eq("page_slug", pageSlug)
        .eq("section_key", "page_segments")
        .eq("language", lang)
        .maybeSingle();
      
      if (existingContent) {
        const existingSegments = JSON.parse(existingContent.content_value);
        const segmentIndex = existingSegments.findIndex((s: any) => s.id === segmentId);
        
        if (segmentIndex !== -1) {
          existingSegments[segmentIndex].data = {
            ...existingSegments[segmentIndex].data,
            hero_image_url: url,
            hero_image_metadata: imageMetadata
          };
          
          await supabase
            .from("page_content")
            .update({
              content_value: JSON.stringify(existingSegments),
              updated_at: new Date().toISOString()
            })
            .eq("page_slug", pageSlug)
            .eq("section_key", "page_segments")
            .eq("language", lang);
        }
      }
    }
    
    toast.success("Image selected and synced to all languages!");
  };

  const handleImageDelete = async () => {
    if (!imageUrl) return;

    try {
      const filePath = imageUrl.split('/page-images/')[1];
      if (filePath) {
        await supabase.storage
          .from('page-images')
          .remove([filePath]);
      }

      setImageUrl('');
      setImageMetadata(null);
      
      toast.success("Image deleted successfully");
    } catch (error) {
      console.error('Image delete error:', error);
      toast.error("Delete failed");
    }
  };

  const handleTranslate = async () => {
    // Silently skip translation for English (no toast)
    if (language === 'en') {
      return;
    }

    setIsTranslating(true);
    try {
      // Load EN reference content for this segment
      const { data, error } = await supabase
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

      if (!data?.content_value) {
        toast.error("No English reference content found to translate");
        return;
      }

      const segments = JSON.parse(data.content_value);
      const heroSegment = segments.find((seg: any) => 
        seg.type === "hero" && String(seg.id) === String(segmentId)
      );

      const sourceTitle = heroSegment?.data?.hero_title || '';
      const sourceSubtitle = heroSegment?.data?.hero_subtitle || '';
      const sourceDescription = heroSegment?.data?.hero_description || '';
      const sourceCtaText = heroSegment?.data?.hero_cta_text || '';

      if (!sourceTitle && !sourceSubtitle && !sourceDescription && !sourceCtaText) {
        toast.error("No English content available to translate");
        return;
      }

      // Edge function expects an object with string keys, not an array
      const textsToTranslate = {
        "0": sourceTitle,
        "1": sourceSubtitle,
        "2": sourceDescription,
        "3": sourceCtaText
      };

      const { data: translateData, error: translateError } = await supabase.functions.invoke('translate-content', {
        body: {
          texts: textsToTranslate,
          targetLanguage: language
        }
      });

      if (translateError) throw translateError;

      // Edge function returns an object with string keys
      if (translateData?.translatedTexts) {
        const translated = translateData.translatedTexts;
        setTitle(translated["0"] || sourceTitle);
        setSubtitle(translated["1"] || sourceSubtitle);
        setDescription(translated["2"] || sourceDescription);
        setCtaText(translated["3"] || sourceCtaText);
        toast.success("Content translated successfully!");
      }
    } catch (error: any) {
      console.error('Translation error:', error);
      toast.error(error.message || "Translation failed");
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSave = async () => {
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
      const updatedData = {
        hero_title: title,
        hero_subtitle: subtitle,
        hero_description: description,
        hero_cta_text: ctaText,
        hero_cta_link: ctaLink,
        hero_cta_style: ctaStyle,
        hero_image_url: imageUrl,
        hero_image_metadata: imageMetadata,
        hero_image_position: imagePosition,
        hero_layout_ratio: layoutRatio,
        hero_top_spacing: topSpacing
      };

      if (segmentIndex !== -1) {
        segments[segmentIndex].data = updatedData;
      } else {
        segments.push({
          id: segmentId,
          type: 'hero',
          data: updatedData
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

      // Update segment mapping if image is present
      if (imageUrl) {
        await updateSegmentMapping(imageUrl, segmentId);
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

      toast.success("Product Hero saved successfully!");
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
    <div className="space-y-6">
      {language !== 'en' && (
        <div className="p-4 bg-gradient-to-r from-blue-900/40 to-purple-900/40 border border-blue-500/30 rounded-lg">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">{LANGUAGES.find(l => l.code === language)?.flag}</span>
            <div>
              <div className="text-white font-semibold text-sm">Multi-Language Editor</div>
              <div className="text-blue-300 text-xs">Compare and edit Product Hero in multiple languages</div>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <Label className="text-white">Title</Label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border-2 border-gray-600 text-white bg-gray-800"
          />
        </div>
        
        <div>
          <Label className="text-white">Subtitle (Optional)</Label>
          <Input
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            className="border-2 border-gray-600 text-white bg-gray-800"
          />
        </div>
        
        <div>
          <Label className="text-white">Description</Label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="border-2 border-gray-600 text-white bg-gray-800 min-h-[100px]"
          />
        </div>

        <div>
          <Label className="text-white">CTA Button Text</Label>
          <Input
            value={ctaText}
            onChange={(e) => setCtaText(e.target.value)}
            className="border-2 border-gray-600 text-white bg-gray-800"
          />
        </div>

        <div>
          <Label className="text-white">CTA Button Link</Label>
          <Input
            value={ctaLink}
            onChange={(e) => setCtaLink(e.target.value)}
            className="border-2 border-gray-600 text-white bg-gray-800"
            placeholder="#section-id or /path"
          />
        </div>

        <div>
          <Label className="text-white">CTA Button Style</Label>
          <Select value={ctaStyle} onValueChange={(value: any) => setCtaStyle(value)}>
            <SelectTrigger className="border-2 border-gray-600 text-white bg-gray-800">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="standard">Standard (Yellow)</SelectItem>
              <SelectItem value="technical">Technical (Dark)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="pt-4 border-t border-gray-600">
          <h4 className="text-white font-semibold mb-4">Layout Settings</h4>
          
          <div className="space-y-6">
            {/* Image Position */}
            <div>
              <Label className="text-white mb-3 block">Image Position</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setImagePosition('left')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    imagePosition === 'left'
                      ? 'border-[#f9dc24] bg-[#f9dc24]/10'
                      : 'border-gray-600 hover:border-gray-500'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-12 h-8 bg-gray-700 rounded"></div>
                    <div className="w-20 h-8 bg-gray-600 rounded"></div>
                  </div>
                  <span className="text-xs text-white">Image Left</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => setImagePosition('right')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    imagePosition === 'right'
                      ? 'border-[#f9dc24] bg-[#f9dc24]/10'
                      : 'border-gray-600 hover:border-gray-500'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-20 h-8 bg-gray-600 rounded"></div>
                    <div className="w-12 h-8 bg-gray-700 rounded"></div>
                  </div>
                  <span className="text-xs text-white">Image Right</span>
                </button>
              </div>
            </div>

            {/* Layout Ratio */}
            <div>
              <Label className="text-white mb-3 block">Layout Ratio (Text : Image)</Label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setLayoutRatio('1-1')}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    layoutRatio === '1-1'
                      ? 'border-[#f9dc24] bg-[#f9dc24]/10'
                      : 'border-gray-600 hover:border-gray-500'
                  }`}
                >
                  <div className="flex gap-1 mb-2">
                    <div className="flex-1 h-6 bg-gray-600 rounded"></div>
                    <div className="flex-1 h-6 bg-gray-700 rounded"></div>
                  </div>
                  <span className="text-xs text-white block">50 : 50</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => setLayoutRatio('2-3')}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    layoutRatio === '2-3'
                      ? 'border-[#f9dc24] bg-[#f9dc24]/10'
                      : 'border-gray-600 hover:border-gray-500'
                  }`}
                >
                  <div className="flex gap-1 mb-2">
                    <div className="w-8 h-6 bg-gray-600 rounded"></div>
                    <div className="flex-1 h-6 bg-gray-700 rounded"></div>
                  </div>
                  <span className="text-xs text-white block">40 : 60</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => setLayoutRatio('2-5')}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    layoutRatio === '2-5'
                      ? 'border-[#f9dc24] bg-[#f9dc24]/10'
                      : 'border-gray-600 hover:border-gray-500'
                  }`}
                >
                  <div className="flex gap-1 mb-2">
                    <div className="w-6 h-6 bg-gray-600 rounded"></div>
                    <div className="flex-1 h-6 bg-gray-700 rounded"></div>
                  </div>
                  <span className="text-xs text-white block">30 : 70</span>
                </button>
              </div>
            </div>

            {/* Top Spacing */}
            <div>
              <Label className="text-white mb-3 block">Top Spacing</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setTopSpacing('small')}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    topSpacing === 'small'
                      ? 'border-[#f9dc24] bg-[#f9dc24]/10'
                      : 'border-gray-600 hover:border-gray-500'
                  }`}
                >
                  <div className="h-2 bg-gray-700 rounded mb-2"></div>
                  <div className="h-6 bg-gray-600 rounded"></div>
                  <span className="text-xs text-white block mt-2">Small (30px)</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => setTopSpacing('medium')}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    topSpacing === 'medium'
                      ? 'border-[#f9dc24] bg-[#f9dc24]/10'
                      : 'border-gray-600 hover:border-gray-500'
                  }`}
                >
                  <div className="h-4 bg-gray-700 rounded mb-2"></div>
                  <div className="h-6 bg-gray-600 rounded"></div>
                  <span className="text-xs text-white block mt-2">Medium (50px)</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => setTopSpacing('large')}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    topSpacing === 'large'
                      ? 'border-[#f9dc24] bg-[#f9dc24]/10'
                      : 'border-gray-600 hover:border-gray-500'
                  }`}
                >
                  <div className="h-6 bg-gray-700 rounded mb-2"></div>
                  <div className="h-6 bg-gray-600 rounded"></div>
                  <span className="text-xs text-white block mt-2">Large (70px)</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => setTopSpacing('xlarge')}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    topSpacing === 'xlarge'
                      ? 'border-[#f9dc24] bg-[#f9dc24]/10'
                      : 'border-gray-600 hover:border-gray-500'
                  }`}
                >
                  <div className="h-8 bg-gray-700 rounded mb-2"></div>
                  <div className="h-6 bg-gray-600 rounded"></div>
                  <span className="text-xs text-white block mt-2">XL (90px)</span>
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <MediaSelector
              onFileSelect={handleImageUpload}
              onMediaSelect={handleMediaSelect}
              acceptedFileTypes="image/*"
              label="Hero Image"
              currentImageUrl={imageUrl}
            />
            
            {imageMetadata && (
              <div className="mt-3 text-xs text-gray-400 space-y-1 bg-gray-900/50 p-3 rounded">
                <p><strong>Filename:</strong> {imageMetadata.originalFileName}</p>
                <p><strong>Size:</strong> {imageMetadata.width} × {imageMetadata.height} px</p>
                <p><strong>File Size:</strong> {formatFileSize(imageMetadata.fileSizeKB)}</p>
                <p><strong>Format:</strong> {imageMetadata.format}</p>
                <p><strong>Uploaded:</strong> {formatUploadDate(imageMetadata.uploadDate)}</p>
              </div>
            )}
            
            {imageUrl && (
              <div className="mt-3">
                <Label className="text-white">Alt Text (SEO)</Label>
                <Input
                  value={imageMetadata?.altText || ''}
                  onChange={(e) => {
                    if (imageMetadata) {
                      setImageMetadata({
                        ...imageMetadata,
                        altText: e.target.value
                      });
                    }
                  }}
                  placeholder="Describe the image for SEO..."
                  className="border-2 border-gray-600 text-white bg-gray-800"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <Button
        onClick={handleSave}
        disabled={isSaving}
        className="w-full bg-[#f9dc24] text-black hover:bg-[#f9dc24]/90"
      >
        {isSaving ? "Saving..." : "Save Changes"}
      </Button>
    </div>
  );
};

export const ProductHeroEditor = memo(ProductHeroEditorComponent);
