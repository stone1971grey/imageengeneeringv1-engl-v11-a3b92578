import { useState, useId, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Upload, FolderOpen, Trash2 } from "lucide-react";
import { DataHubDialog } from "./DataHubDialog";
import { SegmentImageDeleteDialog } from "./ImageDeleteDialog";
import { toast } from "sonner";

interface MediaSelectorProps {
  onFileSelect: (file: File) => void;
  onMediaSelect: (url: string, metadata?: any) => void;
  /** Optional callback when image is cleared via trash icon. If not provided, onMediaSelect('', undefined) is called */
  onClear?: () => void;
  acceptedFileTypes?: string;
  label?: string;
  currentImageUrl?: string;
  /** Preview size: 'small' = 200x200px, 'large' = full width */
  previewSize?: 'small' | 'large';
  /** Show only the blue "Select from Media" button */
  buttonOnly?: boolean;
  /** Custom label for the button when buttonOnly is true */
  buttonLabel?: string;
  /** Button color variant: 'yellow' or 'blue' */
  buttonVariant?: 'yellow' | 'blue';
  /** Make button full width */
  fullWidth?: boolean;
  /** Enable multi-language delete dialog (requires pageSlug, segmentId, imageField, language) */
  enableDeleteDialog?: boolean;
  pageSlug?: string;
  segmentId?: string;
  imageField?: string;
  language?: string;
  imageLabel?: string;
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
  onClear,
  acceptedFileTypes = "image/*",
  label = "Image",
  currentImageUrl,
  previewSize = 'large',
  buttonOnly = false,
  buttonLabel,
  buttonVariant = 'blue',
  fullWidth = false,
  enableDeleteDialog = false,
  pageSlug,
  segmentId,
  imageField,
  language = 'en',
  imageLabel
}: MediaSelectorProps) => {
  const [mediaDialogOpen, setMediaDialogOpen] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const inputId = useId();
  
  // Store callback in ref to prevent closure issues
  const onMediaSelectRef = useRef(onMediaSelect);
  onMediaSelectRef.current = onMediaSelect;
  
  const handleMediaSelected = useCallback((url: string, metadata?: any) => {
    toast.info('Verarbeite Bildauswahl...');
    setMediaDialogOpen(false);
    
    // Use ref to get the latest callback
    if (onMediaSelectRef.current) {
      onMediaSelectRef.current(url, metadata);
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  // Determine if current media is a video
  const isVideo = acceptedFileTypes?.includes('video') || isVideoUrl(currentImageUrl || '');

  // buttonOnly mode - just show the media select button
  if (buttonOnly) {
    return (
      <>
        <Button
          type="button"
          style={buttonVariant === 'blue' ? { backgroundColor: '#1e3a8a', color: 'white' } : undefined}
          className={`${fullWidth ? 'w-full' : ''} ${buttonVariant === 'yellow' 
            ? "bg-[#f9dc24] text-black hover:bg-[#f9dc24]/90 transition-opacity"
            : "hover:opacity-90 transition-opacity"
          }`}
          onClick={() => setMediaDialogOpen(true)}
        >
          <FolderOpen className="h-4 w-4 mr-2" />
          {buttonLabel || "Select from Media"}
        </Button>

        {mediaDialogOpen && (
          <DataHubDialog
            isOpen={mediaDialogOpen}
            onClose={() => setMediaDialogOpen(false)}
            selectionMode={true}
            onSelect={handleMediaSelected}
          />
        )}
      </>
    );
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      
      {currentImageUrl && (
        <div className={`relative rounded-lg overflow-hidden border border-border bg-black ${
          previewSize === 'small' ? 'w-[200px] h-[200px]' : 'w-full h-48'
        }`}>
          {isVideo ? (
            <>
              <video 
                src={currentImageUrl} 
                className="w-full h-full object-contain bg-black"
                controls
                controlsList="nodownload"
                playsInline
                preload="metadata"
              />
              {/* Video badge */}
              <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded font-medium pointer-events-none">
                VIDEO
              </div>
            </>
          ) : (
            <img 
              src={currentImageUrl} 
              alt="Current image" 
              className="w-full h-full object-contain"
            />
          )}
          <button
            type="button"
            onClick={() => {
              // If delete dialog is enabled and we're in English, show dialog
              if (enableDeleteDialog && language === 'en' && pageSlug && segmentId && imageField) {
                setShowDeleteDialog(true);
              } else if (onClear) {
                onClear();
              } else {
                onMediaSelect('', undefined);
              }
            }}
            className="absolute top-2 right-2 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded transition-colors z-10"
            title={isVideo ? "Delete Video" : "Delete Image"}
          >
            <Trash2 className="h-4 w-4" />
          </button>
          
          {/* Multi-language delete dialog */}
          {enableDeleteDialog && pageSlug && segmentId && imageField && (
            <SegmentImageDeleteDialog
              isOpen={showDeleteDialog}
              onOpenChange={setShowDeleteDialog}
              pageSlug={pageSlug}
              segmentId={segmentId}
              imageField={imageField}
              language={language}
              imageLabel={imageLabel || label}
              onDeleteComplete={() => {
                if (onClear) {
                  onClear();
                } else {
                  onMediaSelect('', undefined);
                }
              }}
            />
          )}
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
          onSelect={handleMediaSelected}
        />
      )}
    </div>
  );
};
