import { useState, useEffect, memo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { GeminiIcon } from "@/components/GeminiIcon";
import { toast } from "sonner";

interface VideoSegmentEditorProps {
  onSave: () => void;
  currentPageSlug: string;
  segmentId: string;
  language: string;
}

const VideoSegmentEditorComponent = ({ 
  onSave, 
  currentPageSlug, 
  segmentId,
  language 
}: VideoSegmentEditorProps) => {
  const [isTranslating, setIsTranslating] = useState(false);
  const [localData, setLocalData] = useState({
    title: '',
    videoUrl: '',
    caption: ''
  });

  useEffect(() => {
    loadContent();
  }, [currentPageSlug, segmentId, language]);

  // Listen for translate event from SplitScreenSegmentEditor
  useEffect(() => {
    if (language === 'en') return; // Don't translate English

    const handleTranslateEvent = () => {
      handleTranslate();
    };

    window.addEventListener('video-translate', handleTranslateEvent);
    return () => window.removeEventListener('video-translate', handleTranslateEvent);
  }, [language, currentPageSlug, segmentId]);

  const loadContent = async () => {
    try {
      // Load from page_segments for current language
      const { data: segmentsRow, error } = await supabase
        .from('page_content')
        .select('content_value')
        .eq('page_slug', currentPageSlug)
        .eq('section_key', 'page_segments')
        .eq('language', language)
        .maybeSingle();

      if (!error && segmentsRow?.content_value) {
        const segments = JSON.parse(segmentsRow.content_value);
        if (Array.isArray(segments)) {
          const videoSegment = segments.find((seg: any) => 
            String(seg.id || seg.segment_key || '') === String(segmentId)
          );
          if (videoSegment?.data) {
            const loadedData = {
              title: videoSegment.data.title || '',
              videoUrl: videoSegment.data.videoUrl || '',
              caption: videoSegment.data.caption || ''
            };
            setLocalData(loadedData);
            return;
          }
        }
      }

      // Fallback to English if no content for target language
      if (language !== 'en') {
        const { data: enSegmentsRow } = await supabase
          .from('page_content')
          .select('content_value')
          .eq('page_slug', currentPageSlug)
          .eq('section_key', 'page_segments')
          .eq('language', 'en')
          .maybeSingle();

        if (enSegmentsRow?.content_value) {
          const enSegments = JSON.parse(enSegmentsRow.content_value);
          if (Array.isArray(enSegments)) {
            const enVideoSegment = enSegments.find((seg: any) => 
              String(seg.id || seg.segment_key || '') === String(segmentId)
            );
            if (enVideoSegment?.data) {
              const loadedData = {
                title: enVideoSegment.data.title || '',
                videoUrl: enVideoSegment.data.videoUrl || '',
                caption: enVideoSegment.data.caption || ''
              };
              setLocalData(loadedData);
              return;
            }
          }
        }
      }

      // Fallback: use empty data when nothing exists yet
      setLocalData({
        title: '',
        videoUrl: '',
        caption: ''
      });
    } catch (error) {
      console.error('Error loading video content:', error);
    }
  };

  const handleChange = (field: string, value: string) => {
    const newData = {
      ...localData,
      [field]: value
    };
    setLocalData(newData);
  };

  const handleTranslate = async () => {
    if (language === 'en') {
      toast.error('Translation not needed - English is the source language');
      return;
    }

    setIsTranslating(true);

    try {
      // Load English version
      const { data: enSegmentsRow, error: enError } = await supabase
        .from('page_content')
        .select('content_value')
        .eq('page_slug', currentPageSlug)
        .eq('section_key', 'page_segments')
        .eq('language', 'en')
        .maybeSingle();

      if (enError) throw enError;

      if (!enSegmentsRow?.content_value) {
        toast.error('No English version found to translate from');
        return;
      }

      const enSegments = JSON.parse(enSegmentsRow.content_value);
      const enVideoSegment = Array.isArray(enSegments) 
        ? enSegments.find((seg: any) => String(seg.id || seg.segment_key || '') === String(segmentId))
        : null;

      if (!enVideoSegment?.data) {
        toast.error('English video segment not found');
        return;
      }

      const enData = enVideoSegment.data;

      // Collect text fields to translate (not videoUrl)
      const textsToTranslate = {
        title: enData.title || '',
        caption: enData.caption || ''
      };

      // Translate
      const { data: translateData, error: translateError } = await supabase.functions.invoke('translate-content', {
        body: {
          texts: textsToTranslate,
          targetLanguage: language,
        },
      });

      if (translateError) throw translateError;

      if (translateData?.translatedTexts) {
        const newData = {
          ...localData,
          title: translateData.translatedTexts.title || enData.title || '',
          caption: translateData.translatedTexts.caption || enData.caption || '',
          videoUrl: enData.videoUrl || localData.videoUrl || '' // Keep videoUrl from English
        };
        setLocalData(newData);
        toast.success('Content translated successfully');
      }
    } catch (error) {
      console.error('Translation error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to translate content');
    } finally {
      setIsTranslating(false);
    }
  };

  // Convert YouTube URL to embed format
  const getEmbedUrl = (url: string) => {
    if (!url) return '';
    
    // Handle various YouTube URL formats
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    
    if (match && match[2].length === 11) {
      return `https://www.youtube.com/embed/${match[2]}`;
    }
    
    return url;
  };

  const handleSave = async () => {
    try {
      const { data: userResult } = await supabase.auth.getUser();
      const user = userResult?.user;
      if (!user) {
        toast.error('User not authenticated');
        return;
      }

      // Load existing page_segments for this language
      const { data: existingRow, error: loadError } = await supabase
        .from('page_content')
        .select('*')
        .eq('page_slug', currentPageSlug)
        .eq('section_key', 'page_segments')
        .eq('language', language)
        .single();

      if (loadError && loadError.code !== 'PGRST116') {
        console.error('Error loading existing video segments:', loadError);
        toast.error('Failed to load existing video segments');
        return;
      }

      let segments: any[] = [];
      if (existingRow?.content_value) {
        segments = JSON.parse(existingRow.content_value);
      }

      const updatedData = {
        title: localData.title || '',
        videoUrl: localData.videoUrl || '',
        caption: localData.caption || ''
      };

      const index = segments.findIndex((seg: any) =>
        String(seg.id || seg.segment_key || '') === String(segmentId)
      );

      if (index >= 0) {
        segments[index] = {
          ...segments[index],
          type: segments[index].type || 'video',
          data: updatedData,
        };
      } else {
        segments.push({
          id: segmentId,
          type: 'video',
          data: updatedData,
        });
      }

      const { error: saveError } = await supabase
        .from('page_content')
        .upsert(
          {
            page_slug: currentPageSlug,
            section_key: 'page_segments',
            content_type: 'json',
            content_value: JSON.stringify(segments),
            language,
            updated_at: new Date().toISOString(),
            updated_by: user.id,
          },
          { onConflict: 'page_slug,section_key,language' }
        );

      if (saveError) {
        console.error('Error saving video segment:', saveError);
        toast.error('Failed to save video segment');
        return;
      }

      toast.success(`Video segment saved for ${language.toUpperCase()}`);
      onSave();
    } catch (error) {
      console.error('Error in video segment save:', error);
      toast.error('Failed to save video segment');
    }
  };

  return (
    <div className="space-y-6">
      {isTranslating && (
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 border-2 border-purple-400 rounded-lg p-4 text-center text-white font-semibold animate-pulse shadow-lg shadow-purple-500/50">
          ⏳ Translating content...
        </div>
      )}

      <div>
        <Label htmlFor="video-title">Section Title</Label>
        <Input
          id="video-title"
          value={localData.title || ''}
          onChange={(e) => handleChange('title', e.target.value)}
          placeholder="e.g., Arcturus in Action"
          className="mt-2"
        />
      </div>

      <div>
        <Label htmlFor="video-url">YouTube Video URL</Label>
        <Input
          id="video-url"
          value={localData.videoUrl || ''}
          onChange={(e) => handleChange('videoUrl', e.target.value)}
          placeholder="e.g., https://www.youtube.com/watch?v=DIqRMU7gGNw"
          className="mt-2"
        />
        <p className="text-sm text-gray-500 mt-1">
          Enter the full YouTube URL (e.g., https://www.youtube.com/watch?v=VIDEO_ID)
        </p>
      </div>

      <div>
        <Label htmlFor="video-caption">Video Caption (Optional)</Label>
        <Textarea
          id="video-caption"
          value={localData.caption || ''}
          onChange={(e) => handleChange('caption', e.target.value)}
          placeholder="e.g., See how Arcturus delivers maximum illuminance..."
          className="mt-2"
          rows={3}
        />
      </div>

      {/* Preview */}
      {localData.videoUrl && (
        <div className="border-t pt-6">
          <Label className="mb-4 block">Preview</Label>
          <div className="w-full max-w-2xl mx-auto">
            <div className="relative aspect-video rounded-lg overflow-hidden shadow-lg bg-gray-100">
              <iframe
                src={getEmbedUrl(localData.videoUrl)}
                title="Video Preview"
                className="w-full h-full"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      )}

      {/* Save Button */}
      <div className="pt-6 border-t">
        <Button
          onClick={handleSave}
          className="w-full bg-[#f9dc24] text-black hover:bg-[#f9dc24]/90"
        >
          Save Changes
        </Button>
      </div>
    </div>
  );
};

export const VideoSegmentEditor = memo(VideoSegmentEditorComponent);
