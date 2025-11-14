import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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

  useEffect(() => {
    loadContent();
  }, [pageSlug, segmentKey]);

  const loadContent = async () => {
    try {
      const { data, error } = await supabase
        .from('page_content')
        .select('content_value, content_type')
        .eq('page_slug', pageSlug)
        .eq('section_key', segmentKey);

      if (error) throw error;

      if (data && data.length > 0) {
        data.forEach((item) => {
          if (item.content_type === 'intro_title') {
            setTitle(item.content_value);
          } else if (item.content_type === 'intro_description') {
            setDescription(item.content_value);
          } else if (item.content_type === 'intro_heading_level') {
            setHeadingLevel(item.content_value as 'h1' | 'h2');
          }
        });
      }
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

  const saveContent = async (type: string, value: string) => {
    try {
      const { error } = await supabase
        .from('page_content')
        .upsert({
          page_slug: pageSlug,
          section_key: segmentKey,
          content_type: type,
          content_value: value,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'page_slug,section_key,content_type'
        });

      if (error) throw error;
      
      if (onSave) onSave();
    } catch (error) {
      console.error('Error saving content:', error);
      toast({
        title: "Fehler beim Speichern",
        description: "Der Inhalt konnte nicht gespeichert werden.",
        variant: "destructive",
      });
    }
  };

  const handleTitleChange = (value: string) => {
    setTitle(value);
    saveContent('intro_title', value);
  };

  const handleDescriptionChange = (value: string) => {
    setDescription(value);
    saveContent('intro_description', value);
  };

  const handleHeadingLevelChange = (value: 'h1' | 'h2') => {
    setHeadingLevel(value);
    saveContent('intro_heading_level', value);
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
        <Label htmlFor="intro-description">Beschreibung</Label>
        <Textarea
          id="intro-description"
          value={description}
          onChange={(e) => handleDescriptionChange(e.target.value)}
          placeholder="Industry-leading solutions for comprehensive camera and sensor evaluation"
          rows={4}
        />
      </div>
    </div>
  );
};

export default IntroEditor;
