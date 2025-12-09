import { useState, useEffect, memo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Upload, FolderOpen, Trash2 } from "lucide-react";
import { GeminiIcon } from "@/components/GeminiIcon";
import { DataHubDialog } from "@/components/admin/DataHubDialog";
import { updateSegmentMapping } from "@/utils/updateSegmentMapping";
import { loadAltTextFromMapping } from "@/utils/loadAltTextFromMapping";

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
  targetLanguage?: string;
}

const ActionHeroEditorComponent = ({
  segmentId,
  pageSlug,
  data,
  onSave,
  targetLanguage = 'en'
}: ActionHeroEditorProps) => {
  const [mediaDialogOpen, setMediaDialogOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [backgroundImage, setBackgroundImage] = useState("");
  const [altText, setAltText] = useState("");
  
  const [isSaving, setIsSaving] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Normalize language code
  const normalizedLang = targetLanguage?.split('-')[0] || 'en';

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
            } else {
              setAltText(segment.data.altText || "");
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
            content: {
              title: segment.data.title || "",
              description: segment.data.description || ""
            },
            targetLanguage: normalizedLang,
            sourceLanguage: 'en'
          }
        });

        if (error) throw error;

        setTitle(translated.title || "");
        setDescription(translated.description || "");
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

      const updatedSegment = {
        id: segmentId,
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

      // Sync image to Media Management with alt text
      if (backgroundImage) {
        await updateSegmentMapping(backgroundImage, parseInt(segmentId), 'page-images', false, altText || undefined);
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

  const handleMediaSelect = (url: string) => {
    setBackgroundImage(url);
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
      {/* Translation indicator */}
      {isTranslating && (
        <div className="h-1 w-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 animate-pulse rounded-full" />
      )}

      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">Title (H1)</Label>
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
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter description..."
          rows={3}
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
                  setBackgroundImage("");
                  setAltText("");
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <div className="mt-1 text-sm text-muted-foreground truncate">
              {backgroundImage}
            </div>
          </div>
        )}
      </div>

      {/* Alt-Text */}
      {backgroundImage && (
        <div className="space-y-2">
          <Label htmlFor="altText">Alt-Text (for SEO & Accessibility)</Label>
          <Input
            id="altText"
            value={altText}
            onChange={(e) => setAltText(e.target.value)}
            placeholder="Describe the image for screen readers..."
          />
          <p className="text-xs text-muted-foreground">
            This text is used by screen readers and search engines to understand the image content.
          </p>
        </div>
      )}


      {/* Auto-Translate Button (only for non-English) */}
      {normalizedLang !== 'en' && (
        <Button
          type="button"
          variant="outline"
          onClick={() => window.dispatchEvent(new CustomEvent('action-hero-translate'))}
          disabled={isTranslating}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white border-none hover:from-purple-600 hover:to-pink-600"
        >
          <GeminiIcon className="mr-2 h-4 w-4" />
          {isTranslating ? "Translating..." : "Auto-Translate from English"}
        </Button>
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
