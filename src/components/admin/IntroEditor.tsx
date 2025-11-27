import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Heading1, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface IntroEditorProps {
  pageSlug: string;
  segmentKey: string;
  language: string;
  onSave?: () => void;
}

const IntroEditor = ({ pageSlug, segmentKey, language, onSave }: IntroEditorProps) => {
  const { toast: hookToast } = useToast();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isH1Segment, setIsH1Segment] = useState(false);

  useEffect(() => {
    loadContent();
    checkIfH1Segment();
  }, [pageSlug, segmentKey, language]);

  const checkIfH1Segment = async () => {
    const { data: segments } = await supabase
      .from("segment_registry")
      .select("*")
      .eq("page_slug", pageSlug)
      .eq("deleted", false)
      .order("position", { ascending: true });

    if (!segments) return;

    const firstContentSegment = segments[0];
    const isThisSegmentH1 = firstContentSegment?.segment_key === segmentKey && firstContentSegment?.segment_type === "Intro";
    setIsH1Segment(isThisSegmentH1);
  };

  const loadContent = async () => {
    try {
      // 1) Primär: Legacy-Row pro Intro-Segment mit language
      const { data: legacyRow, error: legacyError } = await supabase
        .from('page_content')
        .select('content_value')
        .eq('page_slug', pageSlug)
        .eq('section_key', segmentKey)
        .eq('language', language)
        .maybeSingle();

      if (!legacyError && legacyRow?.content_value) {
        try {
          const content = JSON.parse(legacyRow.content_value);
          setTitle(content.title || "");
          setDescription(content.description || "");
          setIsLoading(false);
          return;
        } catch (parseError) {
          console.error('Error parsing legacy Intro content:', parseError);
        }
      }

      // 2) Fallback: unified page_segments Struktur
      const { data: segmentsRow, error: segmentsError } = await supabase
        .from('page_content')
        .select('content_value')
        .eq('page_slug', pageSlug)
        .eq('section_key', 'page_segments')
        .eq('language', language)
        .maybeSingle();

      if (!segmentsError && segmentsRow?.content_value) {
        try {
          const segments = JSON.parse(segmentsRow.content_value);
          let introSegment: any = null;

          if (Array.isArray(segments)) {
            // 1. Versuche Match über segmentKey/id
            introSegment = segments.find((seg: any) => {
              const key = seg.segment_key ?? seg.id;
              if (!key) return false;
              return String(key) === String(segmentKey) && String(seg.type || '').toLowerCase() === 'intro';
            });

            // 2. Fallback: erstes Intro-Segment auf der Seite
            if (!introSegment) {
              introSegment = segments.find((seg: any) => String(seg.type || '').toLowerCase() === 'intro');
            }
          }

          if (introSegment?.data) {
            setTitle(introSegment.data.title || "");
            setDescription(introSegment.data.description || "");
            setIsLoading(false);
            return;
          }
        } catch (parseError) {
          console.error('Error parsing page_segments for Intro:', parseError);
        }
      }

      // 3) Fallback: nichts gefunden -> leer lassen
      setTitle("");
      setDescription("");
    } catch (error) {
      console.error('Error loading content:', error);
      hookToast({
        title: "Fehler beim Laden",
        description: "Der Inhalt konnte nicht geladen werden.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTranslate = async () => {
    if (language === 'en') {
      toast.error('Translation not needed - English is the source language');
      return;
    }

    setIsTranslating(true);

    try {
      // STEP 1: Load English version
      const { data: enData, error: enError } = await supabase
        .from('page_content')
        .select('content_value')
        .eq('page_slug', pageSlug)
        .eq('section_key', segmentKey)
        .eq('language', 'en')
        .maybeSingle();

      if (enError) throw enError;

      if (!enData?.content_value) {
        toast.error('No English version found to translate from');
        return;
      }

      const enContent = JSON.parse(enData.content_value);

      // STEP 2: Collect text fields to translate
      const textsToTranslate = {
        title: enContent.title || '',
        description: enContent.description || ''
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
        setTitle(translateData.translatedTexts.title || enContent.title || '');
        setDescription(translateData.translatedTexts.description || enContent.description || '');

        toast.success('Content translated successfully');
      }
    } catch (error) {
      console.error('Translation error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to translate content');
    } finally {
      setIsTranslating(false);
    }
  };

  const saveContent = async () => {
    try {
      setIsSaving(true);
      
      console.log('[IntroEditor] Starting save with:', {
        pageSlug,
        segmentKey,
        language,
        title,
        description
      });
      
      const content = {
        title,
        description,
        headingLevel: 'h1'
      };

      // Legacy: keep per-segment content row in sync WITH LANGUAGE
      const { error } = await supabase
        .from('page_content')
        .upsert({
          page_slug: pageSlug,
          section_key: segmentKey,
          language: language,
          content_type: 'json',
          content_value: JSON.stringify(content),
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'page_slug,section_key,language'
        });

      if (error) {
        console.error('[IntroEditor] Error saving legacy row:', error);
        throw error;
      }
      console.log('[IntroEditor] Legacy row saved successfully');

      // Primary: sync into unified page_segments structure
      const { data: segmentsRow, error: segmentsError } = await supabase
        .from('page_content')
        .select('id, content_value')
        .eq('page_slug', pageSlug)
        .eq('section_key', 'page_segments')
        .eq('language', language)
        .maybeSingle();

      console.log('[IntroEditor] Loaded page_segments:', { segmentsRow, segmentsError });

      if (!segmentsError && segmentsRow?.content_value) {
        try {
          const segments = JSON.parse(segmentsRow.content_value);
          console.log('[IntroEditor] Current segments:', segments);
          
          const updatedSegments = Array.isArray(segments)
            ? segments.map((seg: any) => {
                // Match by segment ID, not just by type
                const segId = String(seg.id || seg.segment_key || '');
                const targetSegId = String(segmentKey);
                
                console.log('[IntroEditor] Checking segment:', { segId, targetSegId, match: segId === targetSegId });
                
                if (segId === targetSegId) {
                  const updated = {
                    ...seg,
                    data: {
                      ...(seg.data || {}),
                      title,
                      description,
                      headingLevel: 'h1'
                    },
                  };
                  console.log('[IntroEditor] Updating segment:', updated);
                  return updated;
                }
                return seg;
              })
            : segments;

          console.log('[IntroEditor] Updated segments array:', updatedSegments);

          const updateResult = await supabase
            .from('page_content')
            .update({
              content_value: JSON.stringify(updatedSegments),
              updated_at: new Date().toISOString(),
            })
            .eq('id', segmentsRow.id);
            
          console.log('[IntroEditor] Update result:', updateResult);
          
          if (updateResult.error) {
            console.error('[IntroEditor] Error updating page_segments:', updateResult.error);
          }
        } catch (syncError) {
          console.error('Error syncing Intro to page_segments:', syncError);
        }
      }
      
      toast.success('Changes saved successfully');
      
      if (onSave) onSave();
    } catch (error) {
      console.error('Error saving content:', error);
      toast.error('Content could not be saved.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTitleChange = (value: string) => {
    setTitle(value);
  };

  const handleDescriptionChange = (value: string) => {
    setDescription(value);
  };

  if (isLoading) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="space-y-4 p-4 bg-background border rounded-lg">
      <h3 className="text-lg font-semibold">Edit Intro Segment</h3>
      
      {isH1Segment && (
        <Alert className="border-primary/50 bg-primary/5">
          <Heading1 className="h-4 w-4" />
          <AlertDescription>
            The title of this Intro carries the H1 heading for SEO optimization
          </AlertDescription>
        </Alert>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="intro-title">Title (H1)</Label>
        <Input
          id="intro-title"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="Your Partner for Objective Camera & Sensor Testing"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="intro-description">Description</Label>
        <Textarea
          id="intro-description"
          value={description}
          onChange={(e) => handleDescriptionChange(e.target.value)}
          placeholder="Industry-leading solutions for comprehensive camera and sensor evaluation"
          rows={4}
        />
      </div>

      <Button 
        onClick={saveContent}
        disabled={isSaving}
        className="w-full bg-[#f9dc24] hover:bg-[#f9dc24]/90 text-black"
      >
        {isSaving ? "Saving..." : "Save Changes"}
      </Button>

      {language !== 'en' && (
        <Button 
          onClick={handleTranslate}
          disabled={isTranslating}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
        >
          <Sparkles className="h-4 w-4 mr-2" />
          {isTranslating ? "Translating..." : "Translate Automatically"}
        </Button>
      )}
    </div>
  );
};

export default IntroEditor;
