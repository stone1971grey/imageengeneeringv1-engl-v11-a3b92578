import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { GeminiIcon } from "@/components/GeminiIcon";

interface NewsListSegmentEditorProps {
  segmentId: string;
  pageSlug: string;
  data?: {
    title?: string;
    description?: string;
  };
  onSave?: () => void;
  editorLanguage?: string;
}

const NewsListSegmentEditor = ({
  segmentId,
  pageSlug,
  data,
  onSave,
  editorLanguage = "en",
}: NewsListSegmentEditorProps) => {
  const [title, setTitle] = useState(data?.title || "All News");
  const [description, setDescription] = useState(
    data?.description || "Stay updated with the latest developments in image quality testing and measurement technology"
  );
  const [saving, setSaving] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);

  // Target language state for split-screen
  const [targetLanguage, setTargetLanguage] = useState("de");
  const [targetTitle, setTargetTitle] = useState("");
  const [targetDescription, setTargetDescription] = useState("");

  const normalizedEditorLang = editorLanguage?.split('-')[0] || 'en';
  const isEnglish = normalizedEditorLang === 'en';

  // Load target language data
  useEffect(() => {
    const loadTargetData = async () => {
      if (isEnglish || !targetLanguage) return;
      
      const { data: targetData } = await supabase
        .from("page_content")
        .select("content_value")
        .eq("page_slug", pageSlug)
        .eq("section_key", segmentId)
        .eq("language", targetLanguage)
        .maybeSingle();

      if (targetData?.content_value) {
        try {
          const parsed = JSON.parse(targetData.content_value);
          setTargetTitle(parsed.title || "");
          setTargetDescription(parsed.description || "");
        } catch (e) {
          console.error("Error parsing target language data:", e);
        }
      } else {
        setTargetTitle("");
        setTargetDescription("");
      }
    };

    loadTargetData();
  }, [targetLanguage, pageSlug, segmentId, isEnglish]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const contentData = {
        title,
        description,
      };

      // Save English version
      const { error } = await supabase
        .from("page_content")
        .upsert(
          {
            page_slug: pageSlug,
            section_key: segmentId,
            content_type: "news-list",
            content_value: JSON.stringify(contentData),
            language: "en",
            updated_at: new Date().toISOString(),
          },
          { onConflict: "page_slug,section_key,language" }
        );

      if (error) throw error;

      toast.success("News List segment saved successfully");
      onSave?.();
    } catch (error) {
      console.error("Error saving News List segment:", error);
      toast.error("Failed to save segment");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveTargetLanguage = async () => {
    setSaving(true);
    try {
      const contentData = {
        title: targetTitle,
        description: targetDescription,
      };

      const { error } = await supabase
        .from("page_content")
        .upsert(
          {
            page_slug: pageSlug,
            section_key: segmentId,
            content_type: "news-list",
            content_value: JSON.stringify(contentData),
            language: targetLanguage,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "page_slug,section_key,language" }
        );

      if (error) throw error;

      toast.success(`${targetLanguage.toUpperCase()} version saved successfully`);
      onSave?.();
    } catch (error) {
      console.error("Error saving target language:", error);
      toast.error("Failed to save translation");
    } finally {
      setSaving(false);
    }
  };

  const handleAutoTranslate = async () => {
    setIsTranslating(true);
    try {
      const { data: result, error } = await supabase.functions.invoke(
        "translate-content",
        {
          body: {
            content: { title, description },
            targetLanguage,
            glossaryTerms: [],
          },
        }
      );

      if (error) throw error;

      if (result?.translated) {
        setTargetTitle(result.translated.title || "");
        setTargetDescription(result.translated.description || "");
        toast.success(`Translated to ${targetLanguage.toUpperCase()}`);
      }
    } catch (error) {
      console.error("Translation error:", error);
      toast.error("Translation failed");
    } finally {
      setIsTranslating(false);
    }
  };

  const LANGUAGES = [
    { code: "de", name: "German", flag: "🇩🇪" },
    { code: "ja", name: "Japanese", flag: "🇯🇵" },
    { code: "ko", name: "Korean", flag: "🇰🇷" },
    { code: "zh", name: "Chinese", flag: "🇨🇳" },
  ];

  return (
    <div className="space-y-6">
      {/* English Editor */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          🇬🇧 English (Source)
        </h3>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Section Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="All News"
            />
          </div>

          <div>
            <Label htmlFor="description">Section Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Stay updated with the latest developments..."
              rows={3}
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button onClick={handleSave} disabled={saving} className="bg-green-600 hover:bg-green-700">
            <Save className="w-4 h-4 mr-2" />
            Save English Version
          </Button>
        </div>
      </div>

      {/* Target Language Editor */}
      <div className="bg-white border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            {LANGUAGES.find(l => l.code === targetLanguage)?.flag} {LANGUAGES.find(l => l.code === targetLanguage)?.name} (Target)
          </h3>
          
          <div className="flex items-center gap-2">
            <select
              value={targetLanguage}
              onChange={(e) => setTargetLanguage(e.target.value)}
              className="border rounded px-3 py-1.5 text-sm"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.flag} {lang.name}
                </option>
              ))}
            </select>
            
            <Button
              onClick={handleAutoTranslate}
              disabled={isTranslating}
              variant="outline"
              size="sm"
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-none hover:from-purple-600 hover:to-pink-600"
            >
              <GeminiIcon className="w-4 h-4 mr-2" />
              {isTranslating ? "Translating..." : "Auto-Translate"}
            </Button>
          </div>
        </div>

        {isTranslating && (
          <div className="mb-4 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 animate-pulse rounded-full" />
        )}

        <div className="space-y-4">
          <div>
            <Label htmlFor="targetTitle">Section Title</Label>
            <Input
              id="targetTitle"
              value={targetTitle}
              onChange={(e) => setTargetTitle(e.target.value)}
              placeholder="Translated title..."
            />
          </div>

          <div>
            <Label htmlFor="targetDescription">Section Description</Label>
            <Textarea
              id="targetDescription"
              value={targetDescription}
              onChange={(e) => setTargetDescription(e.target.value)}
              placeholder="Translated description..."
              rows={3}
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button
            onClick={handleSaveTargetLanguage}
            disabled={saving}
            className="bg-green-600 hover:bg-green-700"
          >
            <Save className="w-4 h-4 mr-2" />
            Save {LANGUAGES.find(l => l.code === targetLanguage)?.name} Version
          </Button>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
        <strong>Note:</strong> This segment displays all news articles with frontend category filtering.
        Users can filter articles by category using the filter buttons. The categories are automatically
        populated from existing news articles.
      </div>
    </div>
  );
};

export default NewsListSegmentEditor;
