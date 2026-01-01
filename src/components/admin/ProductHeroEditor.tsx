import { useState, useEffect, memo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { X, Trash2, Loader2 } from "lucide-react";
import { GeminiIcon } from "@/components/GeminiIcon";
import { ImageMetadata, extractImageMetadata, formatFileSize, formatUploadDate } from '@/types/imageMetadata';
import { MediaSelector } from "@/components/admin/MediaSelector";
import { updateSegmentMapping } from "@/utils/updateSegmentMapping";
import { syncAltTextToMediaManagement } from "@/utils/syncAltTextToMediaManagement";
import { createContentBackup } from "@/utils/createContentBackup";
import { removeBackground, loadImageFromUrl, loadImageFromFile } from "@/utils/removeImageBackground";

interface ProductHeroEditorProps {
  pageSlug: string;
  segmentId: number;
  onSave: () => void;
  language?: string;
  /** If H1 is defined in another segment (e.g. Intro), pass the source info here */
  externalH1Source?: { type: string; key: string; label: string } | null;
}

const ProductHeroEditorComponent = ({ pageSlug, segmentId, onSave, language = 'en', externalH1Source }: ProductHeroEditorProps) => {
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
  const [imageMaxWidth, setImageMaxWidth] = useState<number | null>(null);
  const [imageMaxHeight, setImageMaxHeight] = useState<number | null>(null);
  const [isRemovingBackground, setIsRemovingBackground] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Track if H1 is defined elsewhere (e.g., in Intro segment)
  const [detectedH1Source, setDetectedH1Source] = useState<{ type: string; key: string; label: string } | null>(null);
  
  // Effective H1 source: external prop takes precedence, then detected
  const effectiveH1Source = externalH1Source || detectedH1Source;

  // Check if H1 is defined in an Intro segment
  const checkExternalH1 = async () => {
    try {
      const { data: registryData } = await supabase
        .from('segment_registry')
        .select('*')
        .eq('page_slug', pageSlug)
        .eq('segment_type', 'intro')
        .eq('deleted', false)
        .limit(1);
      
      if (registryData && registryData.length > 0) {
        const introRegistry = registryData[0];
        const { data: pageSegmentsRow } = await supabase
          .from('page_content')
          .select('content_value')
          .eq('page_slug', pageSlug)
          .eq('section_key', 'page_segments')
          .eq('language', language)
          .maybeSingle();
        
        if (pageSegmentsRow?.content_value) {
          try {
            const segments = JSON.parse(pageSegmentsRow.content_value);
            const introSegment = segments.find((seg: any) => 
              String(seg.id) === String(introRegistry.segment_id) && seg.type === 'intro'
            );
            
            if (introSegment?.data?.headline && introSegment.data.headingLevel === 'h1') {
              setDetectedH1Source({
                type: 'intro',
                key: introRegistry.segment_key,
                label: `Intro (ID: ${introRegistry.segment_id})`
              });
              return;
            }
          } catch (e) {
            console.error('[PHE] Failed to parse page_segments:', e);
          }
        }
      }
      setDetectedH1Source(null);
    } catch (e) {
      console.error('[PHE] Error checking external H1:', e);
    }
  };

  useEffect(() => {
    loadContent();
    checkExternalH1();

    const handleExternalTranslate = () => {
      handleTranslate();
    };

    // Listen for SplitScreen "hero-translate" events
    window.addEventListener('hero-translate', handleExternalTranslate);
    return () => window.removeEventListener('hero-translate', handleExternalTranslate);
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
        // Support both 'hero' and 'product-hero' (Content Automation) types
        const heroSegment = segments.find((seg: any) => 
          (seg.type === "hero" || seg.type === "product-hero") && String(seg.id) === String(segmentId)
        );

        if (heroSegment?.data) {
          // Support both field naming conventions:
          // - Content Automation uses: title, subtitle, description, imageUrl
          // - Legacy uses: hero_title, hero_subtitle, hero_description, hero_image_url
          setTitle(heroSegment.data.hero_title || heroSegment.data.title || '');
          setSubtitle(heroSegment.data.hero_subtitle || heroSegment.data.subtitle || '');
          setDescription(heroSegment.data.hero_description || heroSegment.data.description || '');
          setCtaText(heroSegment.data.hero_cta_text || heroSegment.data.ctaText || '');
          setCtaLink(heroSegment.data.hero_cta_link || heroSegment.data.ctaLink || '');
          setCtaStyle(heroSegment.data.hero_cta_style || heroSegment.data.ctaStyle || 'standard');
          
          // Load current language values
          let currentImageUrl = heroSegment.data.hero_image_url || heroSegment.data.imageUrl || '';
          let currentImageMetadata = heroSegment.data.hero_image_metadata || heroSegment.data.metadata || null;
          let currentImagePosition = heroSegment.data.hero_image_position || heroSegment.data.imagePosition || 'right';
          let currentLayoutRatio = heroSegment.data.hero_layout_ratio || heroSegment.data.layoutRatio || '2-5';
          let currentTopSpacing = heroSegment.data.hero_top_spacing || heroSegment.data.topSpacing || 'medium';
          let currentImageMaxWidth = heroSegment.data.hero_image_max_width || heroSegment.data.imageMaxWidth || null;
          let currentImageMaxHeight = heroSegment.data.hero_image_max_height || heroSegment.data.imageMaxHeight || null;

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
                (seg.type === "hero" || seg.type === "product-hero") && String(seg.id) === String(segmentId)
              );

              if (enHeroSegment?.data) {
                console.log(`✅ Fallback: Loading layout settings from EN reference for segment ${segmentId}`);
                
                // If no image in current language, use EN image
                if (!currentImageUrl) {
                  currentImageUrl = enHeroSegment.data.hero_image_url || enHeroSegment.data.imageUrl || '';
                  currentImageMetadata = enHeroSegment.data.hero_image_metadata || enHeroSegment.data.metadata || null;
                }
                
                // ALWAYS use EN layout settings to ensure consistency
                currentImagePosition = enHeroSegment.data.hero_image_position || enHeroSegment.data.imagePosition || 'right';
                currentLayoutRatio = enHeroSegment.data.hero_layout_ratio || enHeroSegment.data.layoutRatio || '2-5';
                currentTopSpacing = enHeroSegment.data.hero_top_spacing || enHeroSegment.data.topSpacing || 'medium';
                currentImageMaxWidth = enHeroSegment.data.hero_image_max_width || enHeroSegment.data.imageMaxWidth || null;
                currentImageMaxHeight = enHeroSegment.data.hero_image_max_height || enHeroSegment.data.imageMaxHeight || null;
              }
            }
          }

          setImageUrl(currentImageUrl);
          setImageMetadata(currentImageMetadata);
          setImagePosition(currentImagePosition);
          setLayoutRatio(currentLayoutRatio);
          setTopSpacing(currentTopSpacing);
          setImageMaxWidth(currentImageMaxWidth);
          setImageMaxHeight(currentImageMaxHeight);
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
          // Support both 'hero' and 'product-hero' segment types
          const segmentIndex = existingSegments.findIndex((s: any) => 
            String(s.id) === String(segmentId) && (s.type === 'hero' || s.type === 'product-hero')
          );
          
          if (segmentIndex !== -1) {
            // Normalize: always use hero_* fields for consistency when saving
            existingSegments[segmentIndex].data = {
              ...existingSegments[segmentIndex].data,
              hero_image_url: result.url,
              hero_image_metadata: metadata,
              // Also set Content Automation fields for bidirectional compat
              imageUrl: result.url,
              metadata: metadata
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
        // Support both 'hero' and 'product-hero' segment types
        const segmentIndex = existingSegments.findIndex((s: any) => 
          String(s.id) === String(segmentId) && (s.type === 'hero' || s.type === 'product-hero')
        );
        
        if (segmentIndex !== -1) {
          // Normalize: always use both field sets for bidirectional compat
          existingSegments[segmentIndex].data = {
            ...existingSegments[segmentIndex].data,
            hero_image_url: url,
            hero_image_metadata: imageMetadata,
            // Also set Content Automation fields
            imageUrl: url,
            metadata: imageMetadata
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
      // Support both 'hero' and 'product-hero' (Content Automation) types
      const heroSegment = segments.find((seg: any) => 
        (seg.type === "hero" || seg.type === "product-hero") && String(seg.id) === String(segmentId)
      );

      // Support both field naming conventions
      const sourceTitle = heroSegment?.data?.hero_title || heroSegment?.data?.title || '';
      const sourceSubtitle = heroSegment?.data?.hero_subtitle || heroSegment?.data?.subtitle || '';
      const sourceDescription = heroSegment?.data?.hero_description || heroSegment?.data?.description || '';
      const sourceCtaText = heroSegment?.data?.hero_cta_text || heroSegment?.data?.ctaText || '';

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
    } finally {
      // Small delay so the visual translation feedback bar is clearly visible
      setTimeout(() => setIsTranslating(false), 600);
    }
   };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Create backup before saving
      await createContentBackup(pageSlug, "page_segments", language);

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
      // Support both 'hero' and 'product-hero' segment types
      const segmentIndex = segments.findIndex((s: any) => 
        String(s.id) === segmentIdStr && (s.type === 'hero' || s.type === 'product-hero')
      );
      
      // Normalize: write BOTH field sets for bidirectional compatibility
      // - hero_* fields for legacy components
      // - simple fields for Content Automation and Frontend
      const updatedData = {
        // Legacy hero_* fields
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
        hero_top_spacing: topSpacing,
        hero_image_max_width: imageMaxWidth,
        hero_image_max_height: imageMaxHeight,
        // Content Automation / Frontend fields
        title: title,
        subtitle: subtitle,
        description: description,
        ctaText: ctaText,
        ctaLink: ctaLink,
        ctaStyle: ctaStyle,
        imageUrl: imageUrl,
        metadata: imageMetadata,
        imagePosition: imagePosition,
        layoutRatio: layoutRatio,
        topSpacing: topSpacing,
        imageMaxWidth: imageMaxWidth,
        imageMaxHeight: imageMaxHeight
      };

      if (segmentIndex !== -1) {
        // Ensure stored ID is always a string, preserve original type
        segments[segmentIndex].id = segmentIdStr;
        segments[segmentIndex].data = updatedData;
      } else {
        // New segment: use 'product-hero' type (modern convention)
        segments.push({
          id: segmentIdStr,
          type: 'product-hero',
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

      // Update segment mapping and sync alt text bidirectionally
      if (imageUrl) {
        if (imageMetadata?.altText) {
          await syncAltTextToMediaManagement(
            imageUrl,
            imageMetadata.altText,
            language,
            'page-images',
            false
          );
        }
        await updateSegmentMapping(imageUrl, segmentId, 'page-images', false, imageMetadata?.altText, language);
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
        // CRITICAL: Always use String() for tab_order entries
        const segmentIdStrForTab = String(segmentId);
        if (!tabOrder.includes(segmentIdStrForTab)) {
          tabOrder.push(segmentIdStrForTab);
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
      {isTranslating && (
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 border-2 border-purple-400 rounded-lg p-4 text-center text-white font-semibold animate-pulse shadow-lg shadow-purple-500/50">
          ⏳ Translating content...
        </div>
      )}

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
          <Label className="text-white flex items-center gap-2">
            {effectiveH1Source ? 'Title (H2 – Zeile 1)' : 'Title (H1 – Zeile 1)'}
            {effectiveH1Source && (
              <span className="text-xs text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                H1 → H2 (H1 in {effectiveH1Source.label})
              </span>
            )}
          </Label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border-2 border-gray-600 text-white bg-gray-800"
          />
        </div>
        
        <div>
          <Label className="text-white flex items-center gap-2">
            {effectiveH1Source ? 'Subtitle (H2 – Zeile 2)' : 'Subtitle (H1 – Zeile 2, Optional)'}
            {effectiveH1Source && (
              <span className="text-xs text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                H1 → H2
              </span>
            )}
          </Label>
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

            {/* Image Size Constraints */}
            <div>
              <Label className="text-white mb-3 block">Image Size Constraints (optional)</Label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-400 text-xs mb-1 block">Max Width (px)</Label>
                  <Input
                    type="number"
                    value={imageMaxWidth || ''}
                    onChange={(e) => setImageMaxWidth(e.target.value ? parseInt(e.target.value) : null)}
                    placeholder="e.g. 500"
                    className="border-2 border-gray-600 text-white bg-gray-800"
                  />
                </div>
                <div>
                  <Label className="text-gray-400 text-xs mb-1 block">Max Height (px)</Label>
                  <Input
                    type="number"
                    value={imageMaxHeight || ''}
                    onChange={(e) => setImageMaxHeight(e.target.value ? parseInt(e.target.value) : null)}
                    placeholder="e.g. 400"
                    className="border-2 border-gray-600 text-white bg-gray-800"
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">Leave empty for auto-sizing based on layout ratio.</p>
            </div>
          </div>

          <div className="mt-6">
            <MediaSelector
              onFileSelect={async (file) => await handleImageUpload(file)}
              onMediaSelect={handleMediaSelect}
              acceptedFileTypes="image/*"
              label="Hero Image"
              currentImageUrl={imageUrl}
            />
            
            {/* AI Background Removal Button - Only show when image exists and in EN */}
            {imageUrl && language === 'en' && (
              <Button
                type="button"
                onClick={async () => {
                  setIsRemovingBackground(true);
                  try {
                    toast.info("Loading AI model for background removal...");
                    const response = await fetch(imageUrl);
                    const blob = await response.blob();
                    const imgElement = await loadImageFromUrl(imageUrl);
                    const resultBlob = await removeBackground(imgElement, (msg) => toast.info(msg));
                    const newFileName = 'hero_image_nobg.png';
                    const newFile = new File([resultBlob], newFileName, { type: 'image/png' });
                    toast.success("Background removed successfully!");
                    await handleImageUpload(newFile);
                  } catch (error: any) {
                    console.error('Background removal failed:', error);
                    toast.error("Background removal failed: " + error.message);
                  } finally {
                    setIsRemovingBackground(false);
                  }
                }}
                disabled={isRemovingBackground}
                className="w-full mt-3 justify-center gap-3 h-auto py-3 px-5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg shadow-purple-500/30 text-base font-semibold"
              >
                {isRemovingBackground ? (
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
