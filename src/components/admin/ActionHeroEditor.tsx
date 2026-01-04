import { useState, useEffect, memo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SimpleRichTextEditor } from "@/components/admin/SimpleRichTextEditor";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Upload, FolderOpen, Trash2, AlertTriangle } from "lucide-react";
import { DataHubDialog } from "@/components/admin/DataHubDialog";
import { SegmentImageDeleteDialog } from "@/components/admin/ImageDeleteDialog";
import { updateSegmentMapping } from "@/utils/updateSegmentMapping";
import { loadAltTextFromMapping } from "@/utils/loadAltTextFromMapping";
import { syncAltTextToMediaManagement, getSegmentCountForImage } from "@/utils/syncAltTextToMediaManagement";

interface ActionHeroEditorProps {
  segmentId: string;
  pageSlug: string;
  data?: {
    title?: string;
    description?: string;
    backgroundImage?: string;
    flipImage?: boolean;
  };
  onSave?: () => void;
  language?: string; // For Rainbow split-screen mode
}

const ActionHeroEditorComponent = ({
  segmentId,
  pageSlug,
  data,
  onSave,
  language = 'en'
}: ActionHeroEditorProps) => {
  const [mediaDialogOpen, setMediaDialogOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [backgroundImage, setBackgroundImage] = useState("");
  const [altText, setAltText] = useState("");
  
  const [isSaving, setIsSaving] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [segmentCount, setSegmentCount] = useState<number>(0);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  // Track if H1 is defined elsewhere (e.g., in Intro segment)
  const [detectedH1Source, setDetectedH1Source] = useState<{ type: string; key: string; label: string } | null>(null);

  // Normalize language code
  const normalizedLang = language?.split('-')[0] || 'en';

  // Check if H1 is defined in an Intro segment
  const checkExternalH1 = async () => {
    try {
      // Check segment_registry for intro segments
      const { data: registryData } = await supabase
        .from('segment_registry')
        .select('*')
        .eq('page_slug', pageSlug)
        .eq('segment_type', 'intro')
        .eq('deleted', false)
        .limit(1);
      
      if (registryData && registryData.length > 0) {
        const introRegistry = registryData[0];
        
        // Intro content is stored inside page_segments
        const { data: pageSegmentsRow } = await supabase
          .from('page_content')
          .select('content_value')
          .eq('page_slug', pageSlug)
          .eq('section_key', 'page_segments')
          .eq('language', normalizedLang)
          .maybeSingle();
        
        if (pageSegmentsRow?.content_value) {
          try {
            const segments = JSON.parse(pageSegmentsRow.content_value);
            const introSegment = segments.find((seg: any) => 
              String(seg.id) === String(introRegistry.segment_id) && seg.type === 'intro'
            );
            
            // Check if intro has a title/headline with H1 heading level
            if (introSegment?.data?.title || introSegment?.data?.headline) {
              if (introSegment.data.headingLevel === 'h1') {
                setDetectedH1Source({
                  type: 'intro',
                  key: introRegistry.segment_key,
                  label: `Intro (ID: ${introRegistry.segment_id})`
                });
                return;
              }
            }
          } catch (e) {
            console.error('[ActionHero] Failed to parse page_segments:', e);
          }
        }
      }
      
      // No external H1 found
      setDetectedH1Source(null);
    } catch (error) {
      console.error('[ActionHero] Error checking external H1:', error);
    }
  };

  // Load content from database
  useEffect(() => {
    const loadContent = async () => {
      setIsLoading(true);
      try {
        // First try to load target language content
        const { data: targetContent } = await supabase
          .from("page_content")
          .select("content_value")
          .eq("page_slug", pageSlug)
          .eq("section_key", "page_segments")
          .eq("language", normalizedLang)
          .single();

        if (targetContent?.content_value) {
          const segments = JSON.parse(targetContent.content_value);
          const segment = segments.find((s: any) => String(s.id) === String(segmentId));
          if (segment?.data) {
            setTitle(segment.data.title || "");
            setDescription(segment.data.description || "");
            setBackgroundImage(segment.data.backgroundImage || "");
            
            // Load alt text from Media Management if available, otherwise from segment data
            if (segment.data.backgroundImage) {
              const altFromMapping = await loadAltTextFromMapping(segment.data.backgroundImage, 'page-images', normalizedLang);
              setAltText(altFromMapping || segment.data.altText || "");
              
              // Check how many segments use this image
              const { count } = await getSegmentCountForImage(segment.data.backgroundImage, 'page-images');
              setSegmentCount(count);
            } else {
              setAltText(segment.data.altText || "");
              setSegmentCount(0);
            }
            
            setIsLoading(false);
            return;
          }
        }

        // Fallback to English if target language has no content
        if (normalizedLang !== 'en') {
          const { data: enContent } = await supabase
            .from("page_content")
            .select("content_value")
            .eq("page_slug", pageSlug)
            .eq("section_key", "page_segments")
            .eq("language", "en")
            .single();

          if (enContent?.content_value) {
            const segments = JSON.parse(enContent.content_value);
            const segment = segments.find((s: any) => String(s.id) === String(segmentId));
            if (segment?.data) {
              // Only load image settings from English, keep text empty for translation
              setBackgroundImage(segment.data.backgroundImage || "");
              
              setTitle("");
              setDescription("");
            }
          }
        }
      } catch (error) {
        console.error("Error loading action hero content:", error);
      }
      setIsLoading(false);
    };

    loadContent();
    checkExternalH1();
  }, [pageSlug, segmentId, normalizedLang]);

  // Listen for translate event
  useEffect(() => {
    const handleTranslate = async (event: CustomEvent) => {
      if (normalizedLang === 'en') return;
      
      setIsTranslating(true);
      try {
        // Load English content
        const { data: enContent } = await supabase
          .from("page_content")
          .select("content_value")
          .eq("page_slug", pageSlug)
          .eq("section_key", "page_segments")
          .eq("language", "en")
          .single();

        if (!enContent?.content_value) {
          toast.error("No English content found to translate");
          setIsTranslating(false);
          return;
        }

        const segments = JSON.parse(enContent.content_value);
        const segment = segments.find((s: any) => String(s.id) === String(segmentId));
        
        if (!segment?.data) {
          toast.error("No segment data found");
          setIsTranslating(false);
          return;
        }

        // Translate text fields
        const { data: translated, error } = await supabase.functions.invoke('translate-content', {
          body: {
            texts: {
              title: segment.data.title || "",
              description: segment.data.description || ""
            },
            targetLanguage: normalizedLang
          }
        });

        if (error) throw error;

        const translatedTexts = translated.translatedTexts || translated;
        setTitle(translatedTexts.title || "");
        setDescription(translatedTexts.description || "");
        
        // Copy image from English if target language doesn't have one
        const imageToUse = backgroundImage || segment.data.backgroundImage;
        if (!backgroundImage && segment.data.backgroundImage) {
          setBackgroundImage(segment.data.backgroundImage);
        }
        
        // Always load language-specific alt-text from Media Management for the image
        if (imageToUse) {
          const altFromMapping = await loadAltTextFromMapping(
            imageToUse, 
            'page-images', 
            normalizedLang
          );
          if (altFromMapping) {
            setAltText(altFromMapping);
          }
        }
        
        toast.success(`Translated to ${normalizedLang.toUpperCase()}`);
      } catch (error: any) {
        console.error("Translation error:", error);
        toast.error("Translation failed: " + error.message);
      }
      setIsTranslating(false);
    };

    window.addEventListener('action-hero-translate', handleTranslate as EventListener);
    return () => {
      window.removeEventListener('action-hero-translate', handleTranslate as EventListener);
    };
  }, [pageSlug, segmentId, normalizedLang]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Load existing segments for this language
      const { data: existingContent } = await supabase
        .from("page_content")
        .select("content_value")
        .eq("page_slug", pageSlug)
        .eq("section_key", "page_segments")
        .eq("language", normalizedLang)
        .single();

      const existingSegments = existingContent?.content_value
        ? JSON.parse(existingContent.content_value)
        : [];

      // Update or add this segment
      const segmentIndex = existingSegments.findIndex(
        (s: any) => String(s.id) === String(segmentId)
      );

      // CRITICAL: Always use String() for IDs to prevent duplicates
      const segmentIdStr = String(segmentId);
      const updatedSegment = {
        id: segmentIdStr,
        type: "action-hero",
        data: {
          title,
          description,
          backgroundImage,
          altText
        }
      };

      if (segmentIndex >= 0) {
        existingSegments[segmentIndex] = updatedSegment;
      } else {
        existingSegments.push(updatedSegment);
      }

      // Save to database
      const { error } = await supabase
        .from("page_content")
        .upsert({
          page_slug: pageSlug,
          section_key: "page_segments",
          content_type: "json",
          content_value: JSON.stringify(existingSegments),
          language: normalizedLang,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'page_slug,section_key,language'
        });

      if (error) throw error;

      // Sync image to Media Management with alt text (bidirectional sync)
      if (backgroundImage && altText) {
        await syncAltTextToMediaManagement(backgroundImage, altText, normalizedLang, 'page-images', false);
        await updateSegmentMapping(backgroundImage, parseInt(segmentId), 'page-images', false);
      } else if (backgroundImage) {
        await updateSegmentMapping(backgroundImage, parseInt(segmentId), 'page-images', false);
      }

      toast.success(`Action Hero saved (${normalizedLang.toUpperCase()})`);
      onSave?.();
    } catch (error: any) {
      console.error("Error saving action hero:", error);
      toast.error("Error saving: " + error.message);
    }
    setIsSaving(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = reader.result as string;
        
        const { data, error } = await supabase.functions.invoke('upload-image', {
          body: {
            fileName: file.name,
            fileData: base64Data,
            bucket: 'page-images',
            pageSlug: pageSlug,
            segmentId: parseInt(segmentId)
          }
        });

        if (error) throw error;
        
        const imageUrl = data.url;
        setBackgroundImage(imageUrl);
        
        // Create/update file_segment_mapping for segment badge
        const filePath = data.path;
        if (filePath) {
          const { error: mappingError } = await supabase
            .from('file_segment_mappings')
            .upsert({
              file_path: filePath,
              bucket_id: 'page-images',
              segment_ids: [segmentId],
              alt_text: altText || null
            }, {
              onConflict: 'file_path,bucket_id'
            });
          
          if (mappingError) {
            console.error("Failed to create segment mapping:", mappingError);
          }
        }
        
        toast.success("Image uploaded");
      };
      reader.readAsDataURL(file);
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error("Upload failed: " + error.message);
    }
  };

  const handleMediaSelect = async (url: string) => {
    setBackgroundImage(url);
    
    // Load alt text from Media Management for the selected image
    const altFromMapping = await loadAltTextFromMapping(url, 'page-images', normalizedLang);
    if (altFromMapping) {
      setAltText(altFromMapping);
    }
    
    // Check how many segments use this image
    const { count } = await getSegmentCountForImage(url, 'page-images');
    setSegmentCount(count);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Translation indicator - prominent feedback bar */}
      {isTranslating && (
        <div className="p-4 bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 rounded-lg animate-pulse">
          <div className="flex items-center justify-center gap-3 text-white font-medium">
            <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Translating to {normalizedLang.toUpperCase()}...</span>
          </div>
        </div>
      )}

      {/* H1 Warning Banner - shown when H1 is defined elsewhere */}
      {detectedH1Source && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center">
              <span className="text-amber-400 text-sm">⚠️</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-400">
                H1 ist extern definiert
              </p>
              <p className="text-xs text-amber-400/80 mt-1">
                Die H1-Überschrift dieser Seite wird im <strong>{detectedH1Source.label}</strong>-Segment definiert.
                Title hier wird als <strong>H2</strong> angezeigt.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title" className="flex items-center gap-2">
          {detectedH1Source ? 'Title (H2)' : 'Title (H1)'}
          {detectedH1Source && (
            <span className="text-xs text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
              H1 → H2 (H1 in {detectedH1Source.label})
            </span>
          )}
        </Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter page title..."
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <SimpleRichTextEditor
          value={description}
          onChange={setDescription}
          placeholder="Enter description..."
        />
      </div>

      {/* Background Image */}
      <div className="space-y-2">
        <Label>Background Image</Label>
        <div className="flex gap-2">
          <div className="flex-1">
            <input
              type="file"
              id={`action-hero-upload-${segmentId}`}
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <Button 
              type="button" 
              variant="outline" 
              className="w-full bg-[hsl(var(--orange))] hover:bg-[hsl(var(--orange))]/90 text-[hsl(var(--orange-foreground))]"
              onClick={() => document.getElementById(`action-hero-upload-${segmentId}`)?.click()}
            >
              <Upload className="mr-2 h-4 w-4" />Upload from Computer
            </Button>
          </div>
          <Button 
            type="button" 
            variant="outline" 
            className="flex-1 bg-blue-900 hover:bg-blue-800 text-white"
            onClick={() => setMediaDialogOpen(true)}
          >
            <FolderOpen className="mr-2 h-4 w-4" />
            Select from Media
          </Button>
          <DataHubDialog
            isOpen={mediaDialogOpen}
            onClose={() => setMediaDialogOpen(false)}
            selectionMode={true}
            onSelect={(url) => {
              handleMediaSelect(url);
              setMediaDialogOpen(false);
            }}
          />
        </div>
        {backgroundImage && (
          <div className="mt-2 relative">
            <div className="relative h-32 rounded-lg overflow-hidden">
              <img
                src={backgroundImage}
                alt={altText || "Background preview"}
                className="w-full h-full object-cover"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-8 w-8"
                onClick={() => {
                  // In English: Show dialog asking if delete in all languages
                  if (normalizedLang === "en") {
                    setShowDeleteDialog(true);
                  } else {
                    // Non-English: just remove locally
                    setBackgroundImage("");
                    setAltText("");
                    toast.info("Image removed for this language.");
                  }
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <div className="mt-1 text-sm text-muted-foreground truncate">
              {backgroundImage}
            </div>
            
            {/* Delete Image Dialog */}
            <SegmentImageDeleteDialog
              isOpen={showDeleteDialog}
              onOpenChange={setShowDeleteDialog}
              pageSlug={pageSlug}
              segmentId={segmentId}
              imageField="backgroundImage"
              language={normalizedLang}
              imageLabel="Background Image"
              onDeleteComplete={() => {
                setBackgroundImage("");
                setAltText("");
              }}
            />
          </div>
        )}
      </div>

      {/* Alt-Text */}
      {backgroundImage && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="altText">Alt-Text (for SEO & Accessibility)</Label>
            {segmentCount > 1 && (
              <div className="flex items-center gap-1 text-amber-600 bg-amber-100 dark:bg-amber-900/30 px-2 py-0.5 rounded-full text-xs">
                <AlertTriangle className="h-3 w-3" />
                <span>In {segmentCount} Segmenten verwendet</span>
              </div>
            )}
          </div>
          <Input
            id="altText"
            value={altText}
            onChange={(e) => setAltText(e.target.value)}
            placeholder="Describe the image for screen readers..."
          />
          {segmentCount > 1 ? (
            <p className="text-xs text-amber-600 dark:text-amber-400">
              ⚠️ Änderungen am Alt-Text werden im Media Management und allen verknüpften Segmenten synchronisiert.
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">
              This text is used by screen readers and search engines to understand the image content.
            </p>
          )}
        </div>
      )}

      {/* Save Button */}
      <Button
        onClick={handleSave}
        disabled={isSaving}
        className="w-full"
      >
        {isSaving ? "Saving..." : "Save Changes"}
      </Button>
    </div>
  );
};

export const ActionHeroEditor = memo(ActionHeroEditorComponent);
