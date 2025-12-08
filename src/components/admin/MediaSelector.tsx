import { useState, useId } from "react";
import { Button } from "@/components/ui/button";
import { Upload, FolderOpen, Trash2 } from "lucide-react";
import { DataHubDialog } from "./DataHubDialog";

interface MediaSelectorProps {
  onFileSelect: (file: File) => void;
  onMediaSelect: (url: string, metadata?: any) => void;
  acceptedFileTypes?: string;
  label?: string;
  currentImageUrl?: string;
}

// Helper to detect if URL is a video
const isVideoUrl = (url: string): boolean => {
  if (!url) return false;
  const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv'];
  const lowerUrl = url.toLowerCase();
  return videoExtensions.some(ext => lowerUrl.includes(ext));
};

export const MediaSelector = ({
  onFileSelect,
  onMediaSelect,
  acceptedFileTypes = "image/*",
  label = "Image",
  currentImageUrl
}: MediaSelectorProps) => {
  const [mediaDialogOpen, setMediaDialogOpen] = useState(false);
  const inputId = useId();

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  // Determine if current media is a video
  const isVideo = acceptedFileTypes?.includes('video') || isVideoUrl(currentImageUrl || '');

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      
      {currentImageUrl && (
        <div className="relative w-full h-48 rounded-lg overflow-hidden border border-border bg-black">
          {isVideo ? (
            <>
              <video 
                src={currentImageUrl} 
                className="w-full h-full object-cover"
                muted
                preload="metadata"
                onLoadedData={(e) => {
                  const video = e.currentTarget;
                  video.currentTime = 0.1; // Show first frame
                }}
              />
              {/* Play icon overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-12 h-12 rounded-full bg-white/80 flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-gray-900 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </div>
              </div>
              {/* Video badge */}
              <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded font-medium">
                VIDEO
              </div>
            </>
          ) : (
            <img 
              src={currentImageUrl} 
              alt="Current image" 
              className="w-full h-full object-cover"
            />
          )}
          <button
            type="button"
            onClick={() => onMediaSelect('', undefined)}
            className="absolute top-2 right-2 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded transition-colors z-10"
            title={isVideo ? "Delete Video" : "Delete Image"}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      )}
      
      <div className="flex gap-2">
        <div className="flex-1">
          <input
            type="file"
            accept={acceptedFileTypes}
            onChange={handleFileInput}
            className="hidden"
            id={inputId}
          />
          <label htmlFor={inputId}>
            <Button
              type="button"
              className="w-full bg-[#f9dc24] text-black hover:bg-[#f9dc24]/90 transition-opacity"
              onClick={(e) => {
                e.preventDefault();
                const input = document.getElementById(inputId) as HTMLInputElement | null;
                input?.click();
              }}
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload from Computer
            </Button>
          </label>
        </div>

        <Button
          type="button"
          style={{ backgroundColor: '#1e3a8a', color: 'white' }}
          className="flex-1 hover:opacity-90 transition-opacity"
          onClick={() => setMediaDialogOpen(true)}
        >
          <FolderOpen className="h-4 w-4 mr-2" />
          Select from Media
        </Button>
      </div>

      {mediaDialogOpen && (
        <DataHubDialog
          isOpen={mediaDialogOpen}
          onClose={() => setMediaDialogOpen(false)}
          selectionMode={true}
          onSelect={(url, metadata) => {
            onMediaSelect(url, metadata);
            setMediaDialogOpen(false);
          }}
        />
      )}
    </div>
  );
};
