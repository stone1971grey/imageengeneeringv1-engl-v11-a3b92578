import { useState, useEffect, memo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { X, Heading1 } from "lucide-react";
import { GeminiIcon } from "@/components/GeminiIcon";
import { ImageMetadata, extractImageMetadata, formatFileSize, formatUploadDate } from '@/types/imageMetadata';
import { MediaSelector } from "@/components/admin/MediaSelector";
import { updateSegmentMapping } from "@/utils/updateSegmentMapping";

interface FullHeroEditorProps {
  pageSlug: string;
  segmentId: number;
  onSave: () => void;
  language?: string; // For split-screen mode
}

const FullHeroEditorComponent = ({ pageSlug, segmentId, onSave, language = 'en' }: FullHeroEditorProps) => {
  const [titleLine1, setTitleLine1] = useState("");
  const [titleLine2, setTitleLine2] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [button1Text, setButton1Text] = useState("");
  const [button1Link, setButton1Link] = useState("");
  const [button1Color, setButton1Color] = useState<'yellow' | 'black' | 'white'>('yellow');
  const [button2Text, setButton2Text] = useState("");
  const [button2Link, setButton2Link] = useState("");
  const [button2Color, setButton2Color] = useState<'yellow' | 'black' | 'white'>('black');
  const [backgroundType, setBackgroundType] = useState<'image' | 'video'>('image');
  const [imageUrl, setImageUrl] = useState("");
  const [imageAlt, setImageAlt] = useState("");
  const [imageMetadata, setImageMetadata] = useState<Omit<ImageMetadata, 'altText'> | null>(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [imagePosition, setImagePosition] = useState<'left' | 'right'>('right');
  const [layoutRatio, setLayoutRatio] = useState<'1-1' | '2-3' | '2-5'>('1-1');
  const [topSpacing, setTopSpacing] = useState<'small' | 'medium' | 'large' | 'extra-large'>('medium');
  const [kenBurnsEffect, setKenBurnsEffect] = useState<string>('standard');
  const [overlayOpacity, setOverlayOpacity] = useState(15);
  const [isUploading, setIsUploading] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isH1Segment, setIsH1Segment] = useState(false);

  useEffect(() => {
    loadContent();
    checkIfH1Segment();
  }, [pageSlug, segmentId, language]); // Add language dependency

  // Sync imageUrl state when content is loaded from backend
  useEffect(() => {
    // This ensures the local state reflects the saved backend value after reload
  }, [imageUrl]);

  const checkIfH1Segment = async () => {
    if (!pageSlug) return;
    const { data: segments } = await supabase
      .from("segment_registry")
      .select("*")
      .eq("page_slug", pageSlug)
      .eq("deleted", false)
      .order("position", { ascending: true });

    if (!segments) return;

    const hasIntroSegment = segments.some(s => s.segment_type === "Intro");
    const currentSegmentKey = `full_hero_${segmentId}`;
    const firstContentSegment = segments[0];
    
    const isThisSegmentH1 = !hasIntroSegment && 
                            firstContentSegment?.segment_key === currentSegmentKey && 
                            firstContentSegment?.segment_type === "FullHero";
    setIsH1Segment(isThisSegmentH1);
  };

  const loadContent = async () => {
    if (!pageSlug) return;
    const { data, error } = await supabase
      .from("page_content")
      .select("*")
      .eq("page_slug", pageSlug)
      .eq("section_key", "page_segments")
      .eq("language", language); // Filter by language

    if (error) {
      console.error("Error loading page_segments:", error);
      return;
    }

    if (data && data.length > 0) {
      try {
        const segments = JSON.parse(data[0].content_value);
        const fullHeroSegment = segments.find((seg: any) => 
          seg.type === "full-hero" && String(seg.id) === String(segmentId)
        );

        if (fullHeroSegment?.data) {
          const content = fullHeroSegment.data;
          setTitleLine1(content.titleLine1 || "");
          setTitleLine2(content.titleLine2 || "");
          setSubtitle(content.subtitle || "");
          setButton1Text(content.button1Text || "");
          setButton1Link(content.button1Link || "");
          setButton1Color(content.button1Color || 'yellow');
          setButton2Text(content.button2Text || "");
          setButton2Link(content.button2Link || "");
          setButton2Color(content.button2Color || 'black');
          setBackgroundType(content.backgroundType || 'image');
          setImageUrl(content.imageUrl || "");
          setImageAlt(content.imageAlt || "");
          setImageMetadata(content.imageMetadata || null);
          setVideoUrl(content.videoUrl || "");
          setImagePosition(content.imagePosition || 'right');
          setLayoutRatio(content.layoutRatio || '1-1');
          setTopSpacing(content.topSpacing || 'medium');
          setKenBurnsEffect(content.kenBurnsEffect || 'standard');
          setOverlayOpacity(content.overlayOpacity || 15);
        }
      } catch (e) {
        console.error("Error parsing page_segments:", e);
      }
    }
  };

  const handleImageUpload = async (file: File) => {
    console.log('[FullHero Upload] FILE INPUT ONCHANGE FIRED');
    toast.success('✅ onChange event detected!', { duration: 2000 });
    
    console.log('[FullHero Upload] File details:', { name: file.name, size: file.size, type: file.type });
    
    // Validate
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setIsUploading(true);
    toast.info('🚀 Starting upload...', { duration: 2000 });

    try {
      // Convert to base64
      const reader = new FileReader();
      const fileData = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      console.log('[FullHero Upload] File converted to base64');
      toast.info('Converting file...', { duration: 1000 });

      // Get session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session');
      }

      console.log('[FullHero Upload] Calling Edge Function...');
      toast.info('Uploading to server...', { duration: 2000 });

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

      console.log('[FullHero Upload] Response:', { result, error });

      if (error) throw error;
      if (!result?.success) throw new Error(result?.error || 'Upload failed');

      console.log('[FullHero Upload] Success! URL:', result.url);
      
      // Extract image metadata
      const metadata = await extractImageMetadata(file, result.url);
      setImageMetadata(metadata);
      
      // Update with permanent URL in local state
      setImageUrl(result.url);
      
      // Auto-save after successful upload
      await autoSaveAfterUpload(result.url, metadata);
      
      toast.success('✅ Image uploaded and saved successfully!', { duration: 3000 });
      
    } catch (error: any) {
      console.error('[FullHero Upload] Error:', error);
      toast.error('Upload failed: ' + (error.message || 'Unknown error'));
    } finally {
      setIsUploading(false);
    }
  };

  const handleMediaSelect = async (url: string, metadata?: any) => {
    setImageUrl(url);
    setImageMetadata(metadata || null);
    await autoSaveAfterUpload(url, metadata || null);
    toast.success('✅ Image selected and saved successfully!', { duration: 3000 });
  };

  const syncToOtherLanguages = async (updatedSegments: any[], contentType?: string | null) => {
    // Only sync when editing the master language (English)
    if (language !== 'en') return;
    if (!pageSlug) return;

    const targetLanguages: Array<'de' | 'ja' | 'ko' | 'zh'> = ['de', 'ja', 'ko', 'zh'];
    const languageNames: Record<string, string> = {
      de: 'German',
      ja: 'Japanese',
      ko: 'Korean',
      zh: 'Chinese',
    };

    // Helper: build a version of the segment data that clearly marks it for translation
    const buildTranslatableContent = (baseData: any, targetLang: 'de' | 'ja' | 'ko' | 'zh') => {
      const langName = languageNames[targetLang] || targetLang.toUpperCase();
      const prefix = `Translate to ${langName}: `;

      const withPrefix = (value?: string) =>
        value && value.trim().length > 0 ? `${prefix}${value}` : '';

      return {
        ...baseData,
        titleLine1: withPrefix(baseData?.titleLine1),
        titleLine2: withPrefix(baseData?.titleLine2),
        subtitle: withPrefix(baseData?.subtitle),
        button1Text: withPrefix(baseData?.button1Text),
        button2Text: withPrefix(baseData?.button2Text),
        // Keep non-text fields (image, layout, links, etc.) 1:1 so the visual setup is identical
      };
    };

    // Find the just-saved source segment in the EN array once
    const sourceSegment = updatedSegments.find((seg: any) =>
      seg.type === 'full-hero' && String(seg.id) === String(segmentId)
    );
    if (!sourceSegment) return;

    for (const targetLang of targetLanguages) {
      try {
        const { data: targetRow, error: targetError } = await supabase
          .from('page_content')
          .select('*')
          .eq('page_slug', pageSlug)
          .eq('section_key', 'page_segments')
          .eq('language', targetLang)
          .maybeSingle();

        if (targetError) {
          console.error(`Error loading page_segments for language ${targetLang}:`, targetError);
          continue;
        }

        const translatedSegment = {
          ...sourceSegment,
          data: buildTranslatableContent(sourceSegment.data, targetLang),
        };

        if (!targetRow) {
          // No row yet for this language -> create full copy of segments array
          // but with the Full Hero segment prepared for translation
          const segmentsForTarget = updatedSegments.map((seg: any) =>
            seg.type === 'full-hero' && String(seg.id) === String(segmentId)
              ? translatedSegment
              : seg
          );

          const { error: insertError } = await supabase
            .from('page_content')
            .insert({
              page_slug: pageSlug,
              section_key: 'page_segments',
              content_type: contentType || 'json',
              content_value: JSON.stringify(segmentsForTarget),
              language: targetLang,
            });

          if (insertError) {
            console.error(`Error inserting page_segments for language ${targetLang}:`, insertError);
          } else {
            console.log(`✅ Created page_segments copy for ${targetLang}`);
          }

          continue;
        }

        let targetSegments: any[] = [];
        try {
          targetSegments = JSON.parse(targetRow.content_value || '[]');
        } catch (e) {
          console.error(`Error parsing page_segments for language ${targetLang}:`, e);
          continue;
        }

        const heroIndex = targetSegments.findIndex((seg: any) =>
          seg.type === 'full-hero' && String(seg.id) === String(segmentId)
        );

        if (heroIndex === -1) {
          // No Full Hero yet in this language -> just append prepared copy
          const newSegments = [...targetSegments, translatedSegment];

          const { error: updateError } = await supabase
            .from('page_content')
            .update({
              content_value: JSON.stringify(newSegments),
              updated_by: (await supabase.auth.getUser()).data.user?.id,
            })
            .eq('id', targetRow.id);

          if (updateError) {
            console.error(`Error updating page_segments for language ${targetLang}:`, updateError);
          } else {
            console.log(`✅ Synced Full Hero segment ${segmentId} to language ${targetLang}`);
          }

          continue;
        }

        const existingHero = targetSegments[heroIndex];
        const existingData = existingHero?.data || {};
        const hasAnyTranslatedText = ['titleLine1', 'titleLine2', 'subtitle', 'button1Text', 'button2Text'].some(
          (key) => {
            const val = (existingData as any)[key];
            return typeof val === 'string' && val.trim().length > 0;
          }
        );

        if (hasAnyTranslatedText) {
          // Respect existing translation – never overwrite manual work
          continue;
        }

        const newSegments = [...targetSegments];
        newSegments[heroIndex] = translatedSegment;

        const { error: updateError } = await supabase
          .from('page_content')
          .update({
            content_value: JSON.stringify(newSegments),
            updated_by: (await supabase.auth.getUser()).data.user?.id,
          })
          .eq('id', targetRow.id);

        if (updateError) {
          console.error(`Error updating page_segments for language ${targetLang}:`, updateError);
        } else {
          console.log(`✅ Updated Full Hero placeholder for language ${targetLang}`);
        }
      } catch (e) {
        console.error(`Unexpected error syncing language ${targetLang}:`, e);
      }
    }
  };

  const autoSaveAfterUpload = async (uploadedImageUrl: string, metadata: Omit<ImageMetadata, 'altText'>) => {
    // Auto-save immediately after successful image upload
    const content = {
      titleLine1,
      titleLine2,
      subtitle,
      button1Text,
      button1Link,
      button1Color,
      button2Text,
      button2Link,
      button2Color,
      backgroundType,
      imageUrl: uploadedImageUrl, // Use the freshly uploaded URL
      imageAlt,
      imageMetadata: metadata,
      videoUrl,
      imagePosition,
      layoutRatio,
      topSpacing,
      kenBurnsEffect,
      overlayOpacity,
      useH1: isH1Segment,
    };

    try {
      if (!pageSlug) return;
      const { data: pageContentData, error: fetchError } = await supabase
        .from("page_content")
        .select("*")
        .eq("page_slug", pageSlug)
        .eq("section_key", "page_segments")
        .eq("language", language) // Filter by language
        .single();

      if (fetchError || !pageContentData) {
        console.error("Error loading page_segments:", fetchError);
        return;
      }

      const segments = JSON.parse(pageContentData.content_value);
      const updatedSegments = segments.map((seg: any) => {
        if (seg.type === "full-hero" && String(seg.id) === String(segmentId)) {
          return { ...seg, data: content };
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
        .eq("language", language); // Filter by language

      if (updateError) {
        console.error("Auto-save error:", updateError);
      } else {
        console.log(`✅ Image URL auto-saved to database (${language})`);
        // After successful EN save, sync to other languages
        await syncToOtherLanguages(updatedSegments, pageContentData.content_type);
        onSave?.();
      }
    } catch (e) {
      console.error("Auto-save failed:", e);
    }
  };

  const handleTranslate = async () => {
    if (language === 'en') {
      toast.error('Translation not needed - English is the source language');
      return;
    }

    setIsTranslating(true);

    try {
      // STEP 1: Load complete segment data from English version
      const { data: enData, error: enError } = await supabase
        .from("page_content")
        .select("*")
        .eq("page_slug", pageSlug)
        .eq("section_key", "page_segments")
        .eq("language", "en")
        .maybeSingle();

      if (enError) throw enError;

      if (!enData?.content_value) {
        toast.error('No English version found to translate from');
        return;
      }

      const enSegments = JSON.parse(enData.content_value);
      const enFullHeroSegment = enSegments.find((seg: any) => 
        seg.type === "full-hero" && String(seg.id) === String(segmentId)
      );

      if (!enFullHeroSegment?.data) {
        toast.error('English segment data not found');
        return;
      }

      const enContent = enFullHeroSegment.data;

      // STEP 2: Collect text fields to translate
      const textsToTranslate = {
        titleLine1: enContent.titleLine1 || '',
        titleLine2: enContent.titleLine2 || '',
        subtitle: enContent.subtitle || '',
        button1Text: enContent.button1Text || '',
        button2Text: enContent.button2Text || '',
      };

      // STEP 3: Translate text fields
      const { data: translateData, error: translateError } = await supabase.functions.invoke('translate-content', {
        body: {
          texts: textsToTranslate,
          targetLanguage: language,
        },
      });

      if (translateError) throw translateError;

      if (translateData?.translatedTexts) {
        // STEP 4: Apply translated texts to state
        setTitleLine1(translateData.translatedTexts.titleLine1 || enContent.titleLine1 || '');
        setTitleLine2(translateData.translatedTexts.titleLine2 || enContent.titleLine2 || '');
        setSubtitle(translateData.translatedTexts.subtitle || enContent.subtitle || '');
        setButton1Text(translateData.translatedTexts.button1Text || enContent.button1Text || '');
        setButton2Text(translateData.translatedTexts.button2Text || enContent.button2Text || '');

        // STEP 5: Copy all non-text fields directly from English version
        setButton1Link(enContent.button1Link || '');
        setButton1Color(enContent.button1Color || 'yellow');
        setButton2Link(enContent.button2Link || '');
        setButton2Color(enContent.button2Color || 'black');
        setBackgroundType(enContent.backgroundType || 'image');
        setImageUrl(enContent.imageUrl || '');
        setImageAlt(enContent.imageAlt || '');
        setImageMetadata(enContent.imageMetadata || null);
        setVideoUrl(enContent.videoUrl || '');
        setImagePosition(enContent.imagePosition || 'right');
        setLayoutRatio(enContent.layoutRatio || '1-1');
        setTopSpacing(enContent.topSpacing || 'medium');
        setKenBurnsEffect(enContent.kenBurnsEffect || 'standard');
        setOverlayOpacity(enContent.overlayOpacity || 15);

        toast.success('Content translated and synced with English configuration');
      }
    } catch (error) {
      console.error('Translation error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to translate content');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSave = async () => {
    // VALIDATION: Image-type background requires imageUrl
    if (backgroundType === 'image' && !imageUrl?.trim()) {
      toast.error('⚠️ Background Image is required when Background Type is "Image"', {
        description: 'Please upload an image or switch Background Type to "Video"',
        duration: 5000
      });
      return;
    }

    // VALIDATION: Video-type background requires videoUrl
    if (backgroundType === 'video' && !videoUrl?.trim()) {
      toast.error('⚠️ Video URL is required when Background Type is "Video"', {
        description: 'Please enter a video URL or switch Background Type to "Image"',
        duration: 5000
      });
      return;
    }

    const content = {
      titleLine1,
      titleLine2,
      subtitle,
      button1Text,
      button1Link,
      button1Color,
      button2Text,
      button2Link,
      button2Color,
      backgroundType,
      imageUrl,
      imageAlt,
      imageMetadata,
      videoUrl,
      imagePosition,
      layoutRatio,
      topSpacing,
      kenBurnsEffect,
      overlayOpacity,
      useH1: isH1Segment,
    };

    // Lade page_segments
    const { data: pageContentData, error: fetchError } = await supabase
      .from("page_content")
      .select("*")
      .eq("page_slug", pageSlug)
      .eq("section_key", "page_segments")
      .eq("language", language) // Filter by language
      .single();

    if (fetchError || !pageContentData) {
      console.error("Error loading page_segments:", fetchError);
      toast.error("Failed to load page segments");
      return;
    }

    try {
      const segments = JSON.parse(pageContentData.content_value);
      const updatedSegments = segments.map((seg: any) => {
        if (seg.type === "full-hero" && String(seg.id) === String(segmentId)) {
          return { ...seg, data: content };
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
        .eq("language", language); // Filter by language

      if (updateError) {
        console.error("Error updating page_segments:", updateError);
        toast.error("Failed to save Full Hero");
        return;
      }

      // Update segment mapping if image is present
      if (backgroundType === 'image' && imageUrl) {
        await updateSegmentMapping(imageUrl, segmentId);
      }

      // After successful EN save, sync to other languages
      await syncToOtherLanguages(updatedSegments, pageContentData.content_type);

      toast.success(`Full Hero saved successfully (${language.toUpperCase()})`);
      onSave?.();
    } catch (e) {
      console.error("Error parsing/updating page_segments:", e);
      toast.error("Failed to save Full Hero");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Full Hero
          <span className="text-xs font-normal text-muted-foreground">[Segment ID: {segmentId}]</span>
        </CardTitle>
        <CardDescription>
          Fullscreen Hero with two-line title, subtitle, buttons and background image/video
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {isH1Segment && (
          <Alert className="border-primary/50 bg-primary/5">
            <Heading1 className="h-4 w-4" />
            <AlertDescription>
              The title lines (Title Line 1 + Title Line 2) carry the H1 heading for SEO optimization
            </AlertDescription>
          </Alert>
        )}
        
        {!isH1Segment && (
          <Alert className="border-muted bg-muted/20">
            <Heading1 className="h-4 w-4" />
            <AlertDescription>
              The title lines (Title Line 1 + Title Line 2) are displayed as H2, as an Intro segment carries the H1
            </AlertDescription>
          </Alert>
        )}
        
        <Tabs defaultValue="content">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="buttons">Buttons</TabsTrigger>
            <TabsTrigger value="background">Background</TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="titleLine1">
                Title Line 1 (Light) {isH1Segment ? '- H1' : '- H2'}
              </Label>
              <Input
                id="titleLine1"
                value={titleLine1}
                onChange={(e) => setTitleLine1(e.target.value)}
                placeholder="Precision Engineering for"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="titleLine2">
                Title Line 2 (Bold) {isH1Segment ? '- H1' : '- H2'}
              </Label>
              <Input
                id="titleLine2"
                value={titleLine2}
                onChange={(e) => setTitleLine2(e.target.value)}
                placeholder="Image Quality Testing"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subtitle">Subtitle</Label>
              <Textarea
                id="subtitle"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="Professional solutions for testing and calibrating camera systems..."
                rows={3}
              />
            </div>
          </TabsContent>

          <TabsContent value="buttons" className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-semibold">Button 1</h3>
              <div className="space-y-2">
                <Label htmlFor="button1Text">Text</Label>
                <Input
                  id="button1Text"
                  value={button1Text}
                  onChange={(e) => setButton1Text(e.target.value)}
                  placeholder="Find Your Solution"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="button1Link">Link (use # for anchor)</Label>
                <Input
                  id="button1Link"
                  value={button1Link}
                  onChange={(e) => setButton1Link(e.target.value)}
                  placeholder="#section-id or /path"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="button1Color">Color</Label>
                <Select value={button1Color} onValueChange={(val: any) => setButton1Color(val)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yellow">Yellow Standard</SelectItem>
                    <SelectItem value="black">Black (Technical)</SelectItem>
                    <SelectItem value="white">Transparent (White Border)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">Button 2 (Optional)</h3>
              <div className="space-y-2">
                <Label htmlFor="button2Text">Text</Label>
                <Input
                  id="button2Text"
                  value={button2Text}
                  onChange={(e) => setButton2Text(e.target.value)}
                  placeholder="Learn More"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="button2Link">Link (use # for anchor)</Label>
                <Input
                  id="button2Link"
                  value={button2Link}
                  onChange={(e) => setButton2Link(e.target.value)}
                  placeholder="#section-id or /path"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="button2Color">Color</Label>
                <Select value={button2Color} onValueChange={(val: any) => setButton2Color(val)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yellow">Yellow Standard</SelectItem>
                    <SelectItem value="black">Black (Technical)</SelectItem>
                    <SelectItem value="white">Transparent (White Border)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="background" className="space-y-4">
            {/* Validation Alert für fehlende Image URL */}
            {backgroundType === 'image' && !imageUrl?.trim() && (
              <Alert className="border-destructive/50 bg-destructive/5">
                <AlertDescription className="text-destructive font-medium">
                  ⚠️ Background Image is required. Please upload an image before saving.
                </AlertDescription>
              </Alert>
            )}

            {/* Validation Alert für fehlende Video URL */}
            {backgroundType === 'video' && !videoUrl?.trim() && (
              <Alert className="border-destructive/50 bg-destructive/5">
                <AlertDescription className="text-destructive font-medium">
                  ⚠️ Video URL is required. Please enter a video URL before saving.
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label>Background Type</Label>
              <Select value={backgroundType} onValueChange={(val: any) => setBackgroundType(val)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="image">Image</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {backgroundType === 'image' ? (
              <>
                <MediaSelector
                  onFileSelect={handleImageUpload}
                  onMediaSelect={handleMediaSelect}
                  acceptedFileTypes="image/*"
                  label="Background Image *"
                  currentImageUrl={imageUrl}
                />

                <div className="space-y-2">
                  <Label htmlFor="imageAlt">Alt Text (Alternative Text)</Label>
                  <Input
                    id="imageAlt"
                    value={imageAlt}
                    onChange={(e) => setImageAlt(e.target.value)}
                    placeholder="Describe the image for accessibility"
                  />
                </div>

                {imageMetadata && (
                  <div className="space-y-2">
                    <Label>Image Information</Label>
                    <div className="bg-muted/30 border rounded-md p-3 space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Format:</span>
                        <span className="font-medium">{imageMetadata.format}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Resolution:</span>
                        <span className="font-medium">{imageMetadata.width} × {imageMetadata.height} px</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">File Size:</span>
                        <span className="font-medium">{formatFileSize(imageMetadata.fileSizeKB)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Uploaded:</span>
                        <span className="font-medium">{formatUploadDate(imageMetadata.uploadDate)}</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Ken Burns Effect</Label>
                  <Select value={kenBurnsEffect} onValueChange={setKenBurnsEffect}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="slow">Slow</SelectItem>
                      <SelectItem value="fast">Fast</SelectItem>
                      <SelectItem value="zoom-out">Zoom Out</SelectItem>
                      <SelectItem value="pan-left">Pan Left</SelectItem>
                      <SelectItem value="pan-right">Pan Right</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="videoUrl" className="text-destructive">
                  Video URL <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="videoUrl"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://example.com/video.mp4"
                  className={!videoUrl?.trim() ? 'border-destructive' : ''}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>Overlay Opacity: {overlayOpacity}%</Label>
              <Slider
                value={[overlayOpacity]}
                onValueChange={(val) => setOverlayOpacity(val[0])}
                min={0}
                max={80}
                step={5}
              />
            </div>
          </TabsContent>
        </Tabs>

        {/* Validation Status Summary */}
        {((backgroundType === 'image' && !imageUrl?.trim()) || (backgroundType === 'video' && !videoUrl?.trim())) && (
          <Alert className="border-destructive/50 bg-destructive/5">
            <AlertDescription className="text-destructive font-medium">
              ⚠️ Cannot save: Please complete all required fields in the Background tab
            </AlertDescription>
          </Alert>
        )}

        <div className="flex gap-2">
          {language !== 'en' && (
            <Button 
              onClick={handleTranslate}
              disabled={isTranslating}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
            >
              <GeminiIcon className="h-4 w-4 mr-2" />
              {isTranslating ? "Translating..." : "Translate Automatically"}
            </Button>
          )}
          <Button 
            onClick={handleSave} 
            className="flex-1"
            disabled={(backgroundType === 'image' && !imageUrl?.trim()) || (backgroundType === 'video' && !videoUrl?.trim())}
          >
            Save Full Hero
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export const FullHeroEditor = memo(FullHeroEditorComponent);