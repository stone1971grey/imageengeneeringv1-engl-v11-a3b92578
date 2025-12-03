import { useState, useEffect, memo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface MetaNavigationLink {
  label: string;
  anchor: string;
}

interface AvailableSegment {
  id: string;
  title: string;
}

interface MetaNavigationEditorProps {
  pageSlug: string;
  segmentId: string | number;
  language: 'en' | 'de' | 'ja' | 'ko' | 'zh';
  availableSegments: AvailableSegment[];
  onSave?: () => void;
}

const MetaNavigationEditorComponent = ({
  pageSlug,
  segmentId,
  language,
  availableSegments,
  onSave,
}: MetaNavigationEditorProps) => {
  const [links, setLinks] = useState<MetaNavigationLink[]>([]);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isTranslating, setIsTranslating] = useState(false);

  // Load content for current language (with EN fallback for initial fill)
  useEffect(() => {
    const loadContent = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('page_content')
          .select('*')
          .eq('page_slug', pageSlug)
          .eq('section_key', 'page_segments')
          .eq('language', language)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') throw error;

        let loaded = false;

        if (data?.content_value) {
          const segments = JSON.parse(data.content_value);
          const metaSeg = segments.find(
            (seg: any) => seg.type === 'meta-navigation' && String(seg.id) === String(segmentId),
          );

          if (metaSeg?.data?.links) {
            setLinks(metaSeg.data.links as MetaNavigationLink[]);
            loaded = true;
          }
        }

        // Fallback: if no content for target language, prefill from English
        if (!loaded && language !== 'en') {
          const { data: enData } = await supabase
            .from('page_content')
            .select('*')
            .eq('page_slug', pageSlug)
            .eq('section_key', 'page_segments')
            .eq('language', 'en')
            .maybeSingle();

          if (enData?.content_value) {
            const enSegments = JSON.parse(enData.content_value);
            const enMetaSeg = enSegments.find(
              (seg: any) => seg.type === 'meta-navigation' && String(seg.id) === String(segmentId),
            );

            if (enMetaSeg?.data?.links) {
              setLinks(enMetaSeg.data.links as MetaNavigationLink[]);
              loaded = true;
            }
          }
        }

        if (!loaded) {
          setLinks([]);
        }
      } catch (err) {
        console.error('[MetaNavigationEditor] loadContent error', err);
        toast.error('Failed to load Meta Navigation content');
      } finally {
        setIsLoading(false);
      }
    };

    if (pageSlug && segmentId) {
      loadContent();
    }
  }, [pageSlug, segmentId, language]);

  // Listen for auto-translate events from SplitScreenSegmentEditor
  useEffect(() => {
    if (language === 'en') return;

    const handleTranslate = () => {
      handleAutoTranslate();
    };

    window.addEventListener('meta-navigation-translate', handleTranslate);
    return () => window.removeEventListener('meta-navigation-translate', handleTranslate);
  }, [language, pageSlug, segmentId, links]);

  const handleAutoTranslate = async () => {
    if (language === 'en') return;

    setIsTranslating(true);
    try {
      const { data: enData } = await supabase
        .from('page_content')
        .select('*')
        .eq('page_slug', pageSlug)
        .eq('section_key', 'page_segments')
        .eq('language', 'en')
        .maybeSingle();

      if (!enData?.content_value) {
        toast.error('No English reference content found');
        return;
      }

      const enSegments = JSON.parse(enData.content_value);
      const enMetaSeg = enSegments.find(
        (seg: any) => seg.type === 'meta-navigation' && String(seg.id) === String(segmentId),
      );

      if (!enMetaSeg?.data?.links) {
        toast.error('No English Meta Navigation data found');
        return;
      }

      const enLinks: MetaNavigationLink[] = enMetaSeg.data.links || [];

      const textsToTranslate: Record<string, string> = {};
      enLinks.forEach((link, index) => {
        textsToTranslate[`label_${index}`] = link.label || '';
      });

      const { data: translateData, error: translateError } = await supabase.functions.invoke('translate-content', {
        body: {
          texts: textsToTranslate,
          targetLanguage: language,
        },
      });

      if (translateError) throw translateError;

      if (translateData?.translatedTexts) {
        const translated = translateData.translatedTexts as Record<string, string>;
        const newLinks: MetaNavigationLink[] = enLinks.map((link, index) => ({
          ...link,
          label: translated[`label_${index}`] || link.label,
        }));
        setLinks(newLinks);
        toast.success('Meta Navigation translated successfully');
      }
    } catch (error: any) {
      console.error('[MetaNavigationEditor] translation error', error);
      toast.error(error.message || 'Translation failed');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleLinkChange = (index: number, field: keyof MetaNavigationLink, value: string) => {
    const updatedLinks = [...links];
    updatedLinks[index] = { ...updatedLinks[index], [field]: value };
    setLinks(updatedLinks);
  };

  const handleAddLink = () => {
    setLinks([...links, { label: 'New Link', anchor: '' }]);
  };

  const handleDeleteLink = (index: number) => {
    const updatedLinks = links.filter((_, i) => i !== index);
    setLinks(updatedLinks);
    setDeleteIndex(null);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error('User not authenticated');

      const { data: existingData } = await supabase
        .from('page_content')
        .select('*')
        .eq('page_slug', pageSlug)
        .eq('section_key', 'page_segments')
        .eq('language', language)
        .maybeSingle();

      let segments: any[] = [];
      if (existingData?.content_value) {
        segments = JSON.parse(existingData.content_value);
      }

      const segmentIndex = segments.findIndex(
        (seg: any) => seg.type === 'meta-navigation' && String(seg.id) === String(segmentId),
      );

      const updatedSegmentData = {
        links,
      };

      if (segmentIndex >= 0) {
        segments[segmentIndex].data = updatedSegmentData;
      } else {
        segments.push({
          id: segmentId,
          type: 'meta-navigation',
          data: updatedSegmentData,
        });
      }

      const { error } = await supabase
        .from('page_content')
        .upsert(
          {
            page_slug: pageSlug,
            section_key: 'page_segments',
            content_type: 'json',
            content_value: JSON.stringify(segments),
            language,
            updated_at: new Date().toISOString(),
            updated_by: user.id,
          },
          { onConflict: 'page_slug,section_key,language' },
        );

      if (error) throw error;

      toast.success(`Meta Navigation saved for ${language.toUpperCase()}!`);
      onSave?.();
    } catch (error: any) {
      console.error('[MetaNavigationEditor] save error', error);
      toast.error(error.message || 'Failed to save Meta Navigation');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {isTranslating && (
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 border-2 border-purple-400 rounded-lg p-4 text-center text-white font-semibold animate-pulse shadow-lg shadow-purple-500/50">
          ⏳ Translating meta navigation...
        </div>
      )}

      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Meta Navigation Settings</h3>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Label className="text-base font-medium">Navigation Links</Label>
          <Button onClick={handleAddLink} variant="outline" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Link
          </Button>
        </div>

        {isLoading && <p className="text-sm text-muted-foreground">Loading Meta Navigation…</p>}

        {!isLoading && links.map((link, index) => (
          <div key={index} className="border rounded-lg p-4 space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-medium">Link {index + 1}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDeleteIndex(index)}
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Link Text</Label>
                <Input
                  value={link.label}
                  onChange={(e) => handleLinkChange(index, 'label', e.target.value)}
                  placeholder="e.g., Overview"
                />
              </div>
              <div>
                <Label>Target Segment</Label>
                <Select
                  value={link.anchor}
                  onValueChange={(value) => handleLinkChange(index, 'anchor', value)}
                >
                  <SelectTrigger className="bg-gray-900 text-white border border-gray-700 focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
                    <SelectValue placeholder="Select target segment" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 text-white border border-gray-700 z-50">
                    {availableSegments.map((segment) => (
                      <SelectItem
                        key={segment.id}
                        value={segment.id}
                        className="text-white data-[highlighted]:bg-gray-800 data-[highlighted]:text-white cursor-pointer"
                      >
                        {segment.id} - {segment.title || 'Untitled segment'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Button
        onClick={handleSave}
        disabled={isSaving}
        className="w-full mt-4"
        style={{ backgroundColor: '#f9dc24', color: 'black' }}
      >
        {isSaving ? 'Saving…' : 'Save Changes'}
      </Button>

      <AlertDialog open={deleteIndex !== null} onOpenChange={() => setDeleteIndex(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Link</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this navigation link? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteIndex !== null && handleDeleteLink(deleteIndex)}
              className="bg-red-500 hover:bg-red-600"
           >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

const MetaNavigationEditor = memo(MetaNavigationEditorComponent);
export default MetaNavigationEditor;
