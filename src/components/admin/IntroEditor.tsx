import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Save, Heading1 } from "lucide-react";

interface IntroEditorProps {
  pageSlug: string;
  segmentKey: string;
  onSave?: () => void;
}

const IntroEditor = ({ pageSlug, segmentKey, onSave }: IntroEditorProps) => {
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isH1Segment, setIsH1Segment] = useState(false);

  useEffect(() => {
    loadContent();
    checkIfH1Segment();
  }, [pageSlug, segmentKey]);

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
      // 1) Primär: Legacy-Row pro Intro-Segment (aktuell zuverlässigste Quelle)
      const { data: legacyRow, error: legacyError } = await supabase
        .from('page_content')
        .select('content_value')
        .eq('page_slug', pageSlug)
        .eq('section_key', segmentKey)
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
      toast({
        title: "Fehler beim Laden",
        description: "Der Inhalt konnte nicht geladen werden.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveContent = async () => {
    try {
      setIsSaving(true);
      
      const content = {
        title,
        description,
        headingLevel: 'h1'
      };

      // Legacy: keep per-segment content row in sync
      const { error } = await supabase
        .from('page_content')
        .upsert({
          page_slug: pageSlug,
          section_key: segmentKey,
          content_type: 'json',
          content_value: JSON.stringify(content),
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'page_slug,section_key'
        });

      if (error) throw error;

      // Primary: sync into unified page_segments structure
      const { data: segmentsRow, error: segmentsError } = await supabase
        .from('page_content')
        .select('id, content_value')
        .eq('page_slug', pageSlug)
        .eq('section_key', 'page_segments')
        .maybeSingle();

      if (!segmentsError && segmentsRow?.content_value) {
        try {
          const segments = JSON.parse(segmentsRow.content_value);
          const updatedSegments = Array.isArray(segments)
            ? segments.map((seg: any) => {
                const isIntroType = String(seg.type || '').toLowerCase() === 'intro';

                // Für maximale Robustheit: immer das erste Intro-Segment updaten
                if (isIntroType) {
                  return {
                    ...seg,
                    data: {
                      ...(seg.data || {}),
                      title,
                      description,
                    },
                  };
                }
                return seg;
              })
            : segments;

          await supabase
            .from('page_content')
            .update({
              content_value: JSON.stringify(updatedSegments),
              updated_at: new Date().toISOString(),
            })
            .eq('id', segmentsRow.id);
        } catch (syncError) {
          console.error('Error syncing Intro to page_segments:', syncError);
        }
      }
      
      toast({
        title: "Gespeichert",
        description: "Die Änderungen wurden erfolgreich gespeichert.",
      });
      
      if (onSave) onSave();
    } catch (error) {
      console.error('Error saving content:', error);
      toast({
        title: "Fehler beim Speichern",
        description: "Der Inhalt konnte nicht gespeichert werden.",
        variant: "destructive",
      });
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
    return <div className="p-4">Lade...</div>;
  }

  return (
    <div className="space-y-4 p-4 bg-background border rounded-lg">
      <h3 className="text-lg font-semibold">Intro Segment bearbeiten</h3>
      
      {isH1Segment && (
        <Alert className="border-primary/50 bg-primary/5">
          <Heading1 className="h-4 w-4" />
          <AlertDescription>
            Der Titel dieses Intro trägt die H1-Überschrift für SEO-Optimierung
          </AlertDescription>
        </Alert>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="intro-title">Titel (H1)</Label>
        <Input
          id="intro-title"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="Your Partner for Objective Camera & Sensor Testing"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="intro-description">Beschreibung</Label>
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
        <Save className="h-4 w-4 mr-2" />
        {isSaving ? "Speichere..." : "Änderungen speichern"}
      </Button>
    </div>
  );
};

export default IntroEditor;
