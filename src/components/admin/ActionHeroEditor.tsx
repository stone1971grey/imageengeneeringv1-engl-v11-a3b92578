import { useState, useEffect, memo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Save, Upload, FolderOpen } from "lucide-react";
import { GeminiIcon } from "@/components/GeminiIcon";
import { DataHubDialog } from "@/components/admin/DataHubDialog";

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
  const [flipImage, setFlipImage] = useState(false);
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
            setFlipImage(segment.data.flipImage || false);
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
              setFlipImage(segment.data.flipImage || false);
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
          flipImage
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

    const formData = new FormData();
    formData.append('file', file);
    formData.append('pageSlug', pageSlug);
    formData.append('segmentId', segmentId);

    try {
      const { data, error } = await supabase.functions.invoke('upload-image', {
        body: formData
      });

      if (error) throw error;
      setBackgroundImage(data.publicUrl);
      toast.success("Image uploaded");
    } catch (error: any) {
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
          <Input
            value={backgroundImage}
            onChange={(e) => setBackgroundImage(e.target.value)}
            placeholder="Image URL..."
            className="flex-1"
          />
          <label className="cursor-pointer">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <Button type="button" variant="outline" size="icon" asChild>
              <span><Upload className="h-4 w-4" /></span>
            </Button>
          </label>
          <Button 
            type="button" 
            variant="outline" 
            size="icon"
            onClick={() => setMediaDialogOpen(true)}
          >
            <FolderOpen className="h-4 w-4" />
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
          <div className="mt-2 relative h-32 rounded-lg overflow-hidden">
            <img
              src={backgroundImage}
              alt="Background preview"
              className="w-full h-full object-cover"
              style={{ transform: flipImage ? 'scaleX(-1)' : 'none' }}
            />
          </div>
        )}
      </div>

      {/* Flip Image Toggle */}
      <div className="flex items-center space-x-2">
        <Switch
          id="flipImage"
          checked={flipImage}
          onCheckedChange={setFlipImage}
        />
        <Label htmlFor="flipImage">Flip image horizontally</Label>
      </div>

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
        <Save className="mr-2 h-4 w-4" />
        {isSaving ? "Saving..." : "Save Changes"}
      </Button>
    </div>
  );
};

export const ActionHeroEditor = memo(ActionHeroEditorComponent);
