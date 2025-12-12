import { useState, useCallback, useRef } from "react";
import { Upload, FileImage, FileVideo, File } from "lucide-react";
import { cn } from "@/lib/utils";

interface DropZoneProps {
  onFilesDropped: (files: File[]) => void;
  disabled?: boolean;
  accept?: string;
  multiple?: boolean;
  className?: string;
}

export function DropZone({
  onFilesDropped,
  disabled = false,
  accept = "image/*,video/*",
  multiple = true,
  className
}: DropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [dragCount, setDragCount] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCount(prev => prev + 1);
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragOver(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCount(prev => {
      const newCount = prev - 1;
      if (newCount === 0) {
        setIsDragOver(false);
      }
      return newCount;
    });
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    setDragCount(0);

    if (disabled) return;

    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length > 0) {
      onFilesDropped(multiple ? droppedFiles : [droppedFiles[0]]);
    }
  }, [disabled, multiple, onFilesDropped]);

  const handleClick = useCallback(() => {
    if (!disabled && inputRef.current) {
      inputRef.current.click();
    }
  }, [disabled]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFilesDropped(Array.from(files));
      // Reset input to allow same file selection
      e.target.value = '';
    }
  }, [onFilesDropped]);

  return (
    <div
      onClick={handleClick}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={cn(
        "relative border-2 border-dashed rounded-xl p-8 transition-all duration-300 cursor-pointer",
        "flex flex-col items-center justify-center gap-4 text-center min-h-[180px]",
        isDragOver
          ? "border-[#f9dc24] bg-[#f9dc24]/10 scale-[1.02]"
          : "border-gray-600 bg-gray-800/30 hover:border-gray-500 hover:bg-gray-800/50",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled}
      />

      {/* Animated Icon Container */}
      <div className={cn(
        "relative transition-transform duration-300",
        isDragOver && "scale-125"
      )}>
        <div className={cn(
          "w-16 h-16 rounded-full flex items-center justify-center",
          isDragOver 
            ? "bg-[#f9dc24] text-black" 
            : "bg-gray-700 text-gray-400"
        )}>
          <Upload className={cn(
            "h-8 w-8 transition-transform duration-300",
            isDragOver && "animate-bounce"
          )} />
        </div>

        {/* Floating file type icons */}
        <div className={cn(
          "absolute -top-1 -left-3 transition-all duration-300",
          isDragOver ? "opacity-100 -translate-y-1" : "opacity-0"
        )}>
          <FileImage className="h-5 w-5 text-[#f9dc24]" />
        </div>
        <div className={cn(
          "absolute -top-2 -right-3 transition-all duration-300 delay-75",
          isDragOver ? "opacity-100 -translate-y-1" : "opacity-0"
        )}>
          <FileVideo className="h-5 w-5 text-[#f9dc24]" />
        </div>
        <div className={cn(
          "absolute -bottom-1 -right-4 transition-all duration-300 delay-100",
          isDragOver ? "opacity-100 translate-y-1" : "opacity-0"
        )}>
          <File className="h-4 w-4 text-[#f9dc24]" />
        </div>
      </div>

      {/* Text */}
      <div className="space-y-2">
        <p className={cn(
          "font-semibold text-lg transition-colors duration-300",
          isDragOver ? "text-[#f9dc24]" : "text-white"
        )}>
          {isDragOver ? "Drop files here" : "Drag & Drop files here"}
        </p>
        <p className="text-sm text-gray-400">
          or <span className="text-[#f9dc24] underline">click to browse</span>
        </p>
        <p className="text-xs text-gray-500">
          Supports images (JPG, PNG, WebP, GIF) and videos (MP4, WebM)
        </p>
      </div>

      {/* Pulsing border effect when dragging */}
      {isDragOver && (
        <div className="absolute inset-0 rounded-xl border-2 border-[#f9dc24] animate-pulse pointer-events-none" />
      )}
    </div>
  );
}
