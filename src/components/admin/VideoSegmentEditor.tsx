import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Save } from "lucide-react";

interface VideoSegmentEditorProps {
  data: {
    title?: string;
    videoUrl?: string;
    caption?: string;
  };
  onChange: (data: any) => void;
  onSave: () => void;
}

export const VideoSegmentEditor = ({ data, onChange, onSave }: VideoSegmentEditorProps) => {
  const handleChange = (field: string, value: string) => {
    onChange({
      ...data,
      [field]: value
    });
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

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="video-title">Section Title</Label>
        <Input
          id="video-title"
          value={data.title || ''}
          onChange={(e) => handleChange('title', e.target.value)}
          placeholder="e.g., Arcturus in Action"
          className="mt-2"
        />
      </div>

      <div>
        <Label htmlFor="video-url">YouTube Video URL</Label>
        <Input
          id="video-url"
          value={data.videoUrl || ''}
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
          value={data.caption || ''}
          onChange={(e) => handleChange('caption', e.target.value)}
          placeholder="e.g., See how Arcturus delivers maximum illuminance..."
          className="mt-2"
          rows={3}
        />
      </div>

      {/* Preview */}
      {data.videoUrl && (
        <div className="border-t pt-6">
          <Label className="mb-4 block">Preview</Label>
          <div className="w-full max-w-2xl mx-auto">
            <div className="relative aspect-video rounded-lg overflow-hidden shadow-lg bg-gray-100">
              <iframe
                src={getEmbedUrl(data.videoUrl)}
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
      <div className="flex justify-end pt-6 border-t">
        <Button
          onClick={onSave}
          className="bg-[#f9dc24] text-black hover:bg-[#f9dc24]/90 flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          Save Changes
        </Button>
      </div>
    </div>
  );
};
