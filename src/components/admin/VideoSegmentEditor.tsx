import { useState, useEffect, memo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { GeminiIcon } from "@/components/GeminiIcon";

interface VideoData {
  title?: string;
  videoUrl?: string;
  caption?: string;
}

interface VideoSegmentEditorProps {
  data: VideoData;
  onChange: (data: VideoData) => void;
  onSave: () => void;
  currentPageSlug: string;
  segmentId: string;
  editorLanguage?: string;
}

const SUPPORTED_LANGUAGES = [
  { code: 'de', label: 'Deutsch' },
  { code: 'ja', label: '日本語' },
  { code: 'ko', label: '한국어' },
  { code: 'zh', label: '中文' },
];

// Single language editor panel
const VideoEditorPanel = memo(({ 
  data, 
  onChange, 
  language, 
  isEnglish,
  segmentId 
}: { 
  data: VideoData; 
  onChange: (data: VideoData) => void; 
  language: string;
  isEnglish: boolean;
  segmentId: string;
}) => {
  const handleChange = (field: keyof VideoData, value: string) => {
    onChange({
      ...data,
      [field]: value
    });
  };

  const getEmbedUrl = (url: string) => {
    if (!url) return '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      return `https://www.youtube.com/embed/${match[2]}`;
    }
    return url;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <span className={`px-2 py-1 rounded text-xs font-bold ${isEnglish ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>
          {language.toUpperCase()}
        </span>
        <span className="text-sm text-gray-500">
          {isEnglish ? 'Source Language' : 'Target Language'}
        </span>
      </div>

      <div>
        <Label htmlFor={`video-title-${language}`}>Section Title</Label>
        <Input
          id={`video-title-${language}`}
          value={data.title || ''}
          onChange={(e) => handleChange('title', e.target.value)}
          placeholder="e.g., Arcturus in Action"
          className="mt-2"
        />
      </div>

      <div>
        <Label htmlFor={`video-url-${language}`}>YouTube Video URL</Label>
        <Input
          id={`video-url-${language}`}
          value={data.videoUrl || ''}
          onChange={(e) => handleChange('videoUrl', e.target.value)}
          placeholder="e.g., https://www.youtube.com/watch?v=..."
          className="mt-2"
        />
        <p className="text-sm text-gray-500 mt-1">
          {isEnglish ? 'Enter the full YouTube URL' : 'Use same URL or localized version'}
        </p>
      </div>

      <div>
        <Label htmlFor={`video-caption-${language}`}>Video Caption</Label>
        <Textarea
          id={`video-caption-${language}`}
          value={data.caption || ''}
          onChange={(e) => handleChange('caption', e.target.value)}
          placeholder="Video description..."
          className="mt-2"
          rows={3}
        />
      </div>

      {/* Preview */}
      {data.videoUrl && (
        <div className="border-t pt-4 mt-4">
          <Label className="mb-2 block text-sm">Preview</Label>
          <div className="relative aspect-video rounded-lg overflow-hidden shadow-md bg-gray-100 max-w-md">
            <iframe
              src={getEmbedUrl(data.videoUrl)}
              title={`Video Preview ${language}`}
              className="w-full h-full"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      )}
    </div>
  );
});

VideoEditorPanel.displayName = 'VideoEditorPanel';

const VideoSegmentEditorComponent = ({ 
  data, 
  onChange, 
  onSave, 
  currentPageSlug, 
  segmentId,
  editorLanguage = 'en'
}: VideoSegmentEditorProps) => {
  const [targetLanguage, setTargetLanguage] = useState<string>('de');
  const [targetData, setTargetData] = useState<VideoData>({});
  const [isTranslating, setIsTranslating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load target language data on mount and when target language changes
  useEffect(() => {
    loadTargetLanguageData();
  }, [targetLanguage, currentPageSlug, segmentId]);

  const loadTargetLanguageData = async () => {
    try {
      // Try legacy row first
      const { data: legacyRow } = await supabase
        .from('page_content')
        .select('content_value')
        .eq('page_slug', currentPageSlug)
        .eq('section_key', `video-${segmentId}`)
        .eq('language', targetLanguage)
        .maybeSingle();

      if (legacyRow?.content_value) {
        try {
          const content = JSON.parse(legacyRow.content_value);
          setTargetData(content);
          return;
        } catch (e) {
          console.error('Error parsing legacy video content:', e);
        }
      }

      // Try page_segments
      const { data: segmentsRow } = await supabase
        .from('page_content')
        .select('content_value')
        .eq('page_slug', currentPageSlug)
        .eq('section_key', 'page_segments')
        .eq('language', targetLanguage)
        .maybeSingle();

      if (segmentsRow?.content_value) {
        try {
          const segments = JSON.parse(segmentsRow.content_value);
          if (Array.isArray(segments)) {
            const videoSegment = segments.find((seg: any) => 
              String(seg.segment_key ?? seg.id) === String(segmentId) &&
              String(seg.type || '').toLowerCase() === 'video'
            );
            if (videoSegment?.data) {
              setTargetData(videoSegment.data);
              return;
            }
          }
        } catch (e) {
          console.error('Error parsing page_segments:', e);
        }
      }

      // No data found - start empty (don't use English as fallback to avoid state contamination)
      setTargetData({});
    } catch (error) {
      console.error('Error loading target language data:', error);
      setTargetData({});
    }
  };

  const handleTranslate = async () => {
    if (!data.title && !data.caption) {
      toast.error('No English content to translate');
      return;
    }

    setIsTranslating(true);

    try {
      const textsToTranslate: string[] = [];
      if (data.title) textsToTranslate.push(data.title);
      if (data.caption) textsToTranslate.push(data.caption);

      const { data: result, error } = await supabase.functions.invoke('translate-content', {
        body: {
          texts: textsToTranslate,
          targetLanguage,
          pageSlug: currentPageSlug
        }
      });

      if (error) throw error;

      const translations = result?.translations || [];
      let idx = 0;

      const translatedData: VideoData = {
        ...targetData,
        videoUrl: data.videoUrl // Keep same video URL
      };

      if (data.title && translations[idx]) {
        translatedData.title = translations[idx];
        idx++;
      }
      if (data.caption && translations[idx]) {
        translatedData.caption = translations[idx];
        idx++;
      }

      setTargetData(translatedData);
      toast.success(`Translated to ${SUPPORTED_LANGUAGES.find(l => l.code === targetLanguage)?.label || targetLanguage}`);
    } catch (error) {
      console.error('Translation error:', error);
      toast.error('Translation failed');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSaveAll = async () => {
    setIsSaving(true);

    try {
      // Save English version
      onSave();

      // Save target language version
      const contentValue = JSON.stringify(targetData);

      await supabase
        .from('page_content')
        .upsert({
          page_slug: currentPageSlug,
          section_key: `video-${segmentId}`,
          language: targetLanguage,
          content_type: 'json',
          content_value: contentValue
        }, {
          onConflict: 'page_slug,section_key,language'
        });

      // Also update page_segments array for target language
      const { data: existingSegments } = await supabase
        .from('page_content')
        .select('content_value')
        .eq('page_slug', currentPageSlug)
        .eq('section_key', 'page_segments')
        .eq('language', targetLanguage)
        .maybeSingle();

      let segments: any[] = [];
      if (existingSegments?.content_value) {
        try {
          segments = JSON.parse(existingSegments.content_value);
        } catch (e) {
          segments = [];
        }
      }

      const existingIndex = segments.findIndex((s: any) => 
        String(s.segment_key ?? s.id) === String(segmentId)
      );

      const segmentEntry = {
        id: segmentId,
        segment_key: segmentId,
        type: 'video',
        data: targetData
      };

      if (existingIndex >= 0) {
        segments[existingIndex] = segmentEntry;
      } else {
        segments.push(segmentEntry);
      }

      await supabase
        .from('page_content')
        .upsert({
          page_slug: currentPageSlug,
          section_key: 'page_segments',
          language: targetLanguage,
          content_type: 'json',
          content_value: JSON.stringify(segments)
        }, {
          onConflict: 'page_slug,section_key,language'
        });

      toast.success('Saved all language versions');
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Translating Feedback Banner */}
      {isTranslating && (
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-3 rounded-lg animate-pulse shadow-lg">
          <span className="font-bold">⏳ Translating content...</span>
        </div>
      )}

      {/* Target Language Selector + Auto-Translate Button */}
      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border">
        <div className="flex items-center gap-2">
          <Label className="text-sm font-medium whitespace-nowrap">Target Language:</Label>
          <Select value={targetLanguage} onValueChange={setTargetLanguage}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SUPPORTED_LANGUAGES.map(lang => (
                <SelectItem key={lang.code} value={lang.code}>
                  {lang.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={handleTranslate}
          disabled={isTranslating}
          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-md hover:shadow-lg transition-all flex items-center gap-2"
        >
          <GeminiIcon className="w-4 h-4" />
          {isTranslating ? 'Translating...' : 'Auto-Translate'}
        </Button>
      </div>

      {/* Split Screen Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* English Panel (Left) */}
        <div className="bg-blue-50/50 border border-blue-200 rounded-lg p-4">
          <VideoEditorPanel
            key={`video-${segmentId}-en`}
            data={data}
            onChange={onChange}
            language="en"
            isEnglish={true}
            segmentId={segmentId}
          />
        </div>

        {/* Target Language Panel (Right) */}
        <div className="bg-purple-50/50 border border-purple-200 rounded-lg p-4">
          <VideoEditorPanel
            key={`video-${segmentId}-${targetLanguage}`}
            data={targetData}
            onChange={setTargetData}
            language={targetLanguage}
            isEnglish={false}
            segmentId={segmentId}
          />
        </div>
      </div>

      {/* Save Button */}
      <div className="pt-4 border-t">
        <Button
          onClick={handleSaveAll}
          disabled={isSaving}
          className="w-full bg-[#f9dc24] text-black hover:bg-[#f9dc24]/90 font-semibold"
        >
          {isSaving ? 'Saving...' : 'Save All Languages'}
        </Button>
      </div>
    </div>
  );
};

export const VideoSegmentEditor = memo(VideoSegmentEditorComponent);
