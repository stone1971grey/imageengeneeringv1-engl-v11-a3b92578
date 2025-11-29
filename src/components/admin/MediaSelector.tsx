import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, FolderOpen } from "lucide-react";
import { DataHubDialog } from "./DataHubDialog";

interface MediaSelectorProps {
  onFileSelect: (file: File) => void;
  onMediaSelect: (url: string, metadata?: any) => void;
  acceptedFileTypes?: string;
  label?: string;
  currentImageUrl?: string;
}

export const MediaSelector = ({
  onFileSelect,
  onMediaSelect,
  acceptedFileTypes = "image/*",
  label = "Image",
  currentImageUrl
}: MediaSelectorProps) => {
  const [mediaDialogOpen, setMediaDialogOpen] = useState(false);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      
      {currentImageUrl && (
        <div className="relative w-full h-48 rounded-lg overflow-hidden border border-border">
          <img 
            src={currentImageUrl} 
            alt="Current image" 
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      <div className="flex gap-2">
        <div className="flex-1">
          <input
            type="file"
            accept={acceptedFileTypes}
            onChange={handleFileInput}
            className="hidden"
            id={`file-upload-${label}`}
          />
          <label htmlFor={`file-upload-${label}`}>
            <Button
              type="button"
              style={{ backgroundColor: '#60a5fa', color: 'white' }}
              className="w-full hover:opacity-90 transition-opacity"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(`file-upload-${label}`)?.click();
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
