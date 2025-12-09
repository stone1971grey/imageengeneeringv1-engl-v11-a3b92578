import { useState, useEffect, memo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface NewsListSegmentEditorProps {
  segmentId: string;
  pageSlug: string;
  data?: {
    title?: string;
    description?: string;
  };
  onSave?: () => void;
  language?: string;
}

const NewsListSegmentEditorComponent = ({
  segmentId,
  pageSlug,
  data,
  onSave,
  language,
}: NewsListSegmentEditorProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isTranslating, setIsTranslating] = useState(false);

  const normalizedLang = (language || 'en')?.split('-')[0] || 'en';

  // Load content for the current language - initialize empty, then load
  useEffect(() => {
    const loadContent = async () => {
      setIsLoading(true);
      // Reset state before loading
      setTitle("");
      setDescription("");
      
      try {
        const { data: contentData } = await supabase
          .from("page_content")
          .select("content_value")
          .eq("page_slug", pageSlug)
          .eq("section_key", segmentId)
          .eq("language", normalizedLang)
          .maybeSingle();

        if (contentData?.content_value) {
          try {
            const parsed = JSON.parse(contentData.content_value);
            setTitle(parsed.title || "");
            setDescription(parsed.description || "");
          } catch (e) {
            console.error("Error parsing content:", e);
          }
        } else if (normalizedLang === 'en') {
          // Only set defaults for English
          setTitle(data?.title || "All News");
          setDescription(data?.description || "Stay updated with the latest developments in image quality testing and measurement technology");
        }
        // For non-English, leave empty if no content exists (no English fallback)
      } catch (error) {
        console.error("Error loading content:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadContent();
  }, [pageSlug, segmentId, normalizedLang]);

  // Listen for external translate events from Rainbow SplitScreen
  useEffect(() => {
    if (normalizedLang === 'en') return;

    const handleExternalTranslate = async () => {
      setIsTranslating(true);
      try {
        // Load English version
        const { data: enData, error: enError } = await supabase
          .from("page_content")
          .select("content_value")
          .eq("page_slug", pageSlug)
          .eq("section_key", segmentId)
          .eq("language", "en")
          .maybeSingle();

        if (enError) throw enError;

        if (!enData?.content_value) {
          toast.error('No English version found to translate from');
          setIsTranslating(false);
          return;
        }

        const enContent = JSON.parse(enData.content_value);

        const { data: translateData, error: translateError } = await supabase.functions.invoke('translate-content', {
          body: {
            texts: {
              title: enContent.title || '',
              description: enContent.description || ''
            },
            targetLanguage: normalizedLang,
          },
        });

        if (translateError) throw translateError;

        if (translateData?.translatedTexts) {
          setTitle(translateData.translatedTexts.title || enContent.title || '');
          setDescription(translateData.translatedTexts.description || enContent.description || '');
          toast.success(`Translated to ${normalizedLang.toUpperCase()}`);
        }
      } catch (error) {
        console.error('Translation error:', error);
        toast.error(error instanceof Error ? error.message : 'Failed to translate content');
      } finally {
        setTimeout(() => setIsTranslating(false), 600);
      }
    };

    window.addEventListener('news-list-translate', handleExternalTranslate);
    return () => window.removeEventListener('news-list-translate', handleExternalTranslate);
  }, [normalizedLang, pageSlug, segmentId]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const contentData = {
        title,
        description,
      };

      const { error } = await supabase
        .from("page_content")
        .upsert(
          {
            page_slug: pageSlug,
            section_key: segmentId,
            content_type: "news-list",
            content_value: JSON.stringify(contentData),
            language: normalizedLang,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "page_slug,section_key,language" }
        );

      if (error) throw error;

      toast.success("Changes saved successfully");
      onSave?.();
    } catch (error) {
      console.error("Error saving News List segment:", error);
      toast.error("Failed to save segment");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="space-y-4 p-4 bg-background border rounded-lg">
      {isTranslating && (
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 border-2 border-purple-400 rounded-lg p-4 text-center text-white font-semibold animate-pulse shadow-lg shadow-purple-500/50">
          ⏳ Translating content...
        </div>
      )}

      <h3 className="text-lg font-semibold flex items-center gap-2">
        Edit News List Segment
        <span className="text-sm font-normal text-muted-foreground">
          ({normalizedLang.toUpperCase()})
        </span>
      </h3>

      <div className="space-y-2">
        <Label htmlFor="title">Section Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={normalizedLang === 'en' ? "All News" : "Enter translated title..."}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Section Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={normalizedLang === 'en' ? "Stay updated with the latest developments..." : "Enter translated description..."}
          rows={4}
        />
      </div>

      <Button 
        onClick={handleSave} 
        disabled={isSaving}
        className="w-full bg-[#f9dc24] hover:bg-[#f9dc24]/90 text-black"
      >
        {isSaving ? "Saving..." : "Save Changes"}
      </Button>
    </div>
  );
};

const NewsListSegmentEditor = memo(NewsListSegmentEditorComponent);
export default NewsListSegmentEditor;