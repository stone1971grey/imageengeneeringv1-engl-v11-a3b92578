import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Save } from "lucide-react";

interface IntroEditorProps {
  pageSlug: string;
  segmentKey: string;
  onSave?: () => void;
}

const IntroEditor = ({ pageSlug, segmentKey, onSave }: IntroEditorProps) => {
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [headingLevel, setHeadingLevel] = useState<'h1' | 'h2'>('h2');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadContent();
  }, [pageSlug, segmentKey]);

  const loadContent = async () => {
    try {
      // Load intro segment content
      const { data, error } = await supabase
        .from('page_content')
        .select('content_value')
        .eq('page_slug', pageSlug)
        .eq('section_key', segmentKey)
        .maybeSingle();

      if (error) throw error;

      // Load SEO meta description (HIGHEST PRIORITY)
      const { data: seoData, error: seoError } = await supabase
        .from('page_content')
        .select('content_value')
        .eq('page_slug', pageSlug)
        .eq('section_key', 'seo_meta')
        .maybeSingle();

      let introTitle = "";
      let introDescription = "";
      let introHeadingLevel: 'h1' | 'h2' = 'h2';

      // Load existing intro content if available
      if (data) {
        const content = JSON.parse(data.content_value);
        introTitle = content.title || "";
        introDescription = content.description || "";
        introHeadingLevel = content.headingLevel || 'h2';
      }

      // PRIORITY: Override description with SEO Meta Description
      if (!seoError && seoData) {
        try {
          const seoContent = JSON.parse(seoData.content_value);
          if (seoContent.metaDescription) {
            introDescription = seoContent.metaDescription;
            console.log('[IntroEditor] Using SEO Meta Description as primary source:', seoContent.metaDescription);
          }
        } catch (e) {
          console.error('Error parsing SEO data:', e);
        }
      }

      setTitle(introTitle);
      setDescription(introDescription);
      setHeadingLevel(introHeadingLevel);
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
        headingLevel
      };

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

  const handleHeadingLevelChange = (value: 'h1' | 'h2') => {
    setHeadingLevel(value);
  };

  if (isLoading) {
    return <div className="p-4">Lade...</div>;
  }

  return (
    <div className="space-y-4 p-4 bg-background border rounded-lg">
      <h3 className="text-lg font-semibold">Intro Segment bearbeiten</h3>
      
      <div className="space-y-2">
        <Label htmlFor="heading-level">Überschrift-Level</Label>
        <Select value={headingLevel} onValueChange={handleHeadingLevelChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="h1">H1 (Hauptüberschrift)</SelectItem>
            <SelectItem value="h2">H2 (Unterüberschrift)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="intro-title">Titel</Label>
        <Input
          id="intro-title"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="Your Partner for Objective Camera & Sensor Testing"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="intro-description">
          Beschreibung
          <span className="ml-2 text-xs text-muted-foreground font-normal">
            (automatisch aus SEO Meta Description)
          </span>
        </Label>
        <Textarea
          id="intro-description"
          value={description}
          onChange={(e) => handleDescriptionChange(e.target.value)}
          placeholder="Industry-leading solutions for comprehensive camera and sensor evaluation"
          rows={4}
        />
        <p className="text-xs text-muted-foreground">
          💡 Diese Beschreibung wird automatisch aus der SEO Meta Description übernommen und hat höchste Priorität.
        </p>
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
