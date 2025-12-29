import React, { useState, useRef, useCallback } from 'react';
import { useFrontendEditOptional } from '@/contexts/FrontendEditContext';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Upload, FolderOpen, Loader2, X } from 'lucide-react';
import { createPortal } from 'react-dom';
import { DataHubDialog } from '@/components/admin/DataHubDialog';

interface EditableImageProps {
  src: string;
  alt?: string;
  sectionKey: string;
  pageSlug: string;
  language: string;
  className?: string;
  onUpdate?: (newSrc: string) => void;
  imgClassName?: string;
}

export const EditableImage: React.FC<EditableImageProps> = ({
  src,
  alt = '',
  sectionKey,
  pageSlug,
  language,
  className,
  onUpdate,
  imgClassName
}) => {
  const editContext = useFrontendEditOptional();
  const [isHovering, setIsHovering] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const [showOptions, setShowOptions] = useState(false);
  const [showMediaDialog, setShowMediaDialog] = useState(false);
  const [optionsPosition, setOptionsPosition] = useState({ top: 0, left: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be max 5MB');
      return;
    }

    setIsUploading(true);
    setShowOptions(false);

    try {
      // Create a preview immediately
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewSrc(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${pageSlug}/${sectionKey}-${Date.now()}.${fileExt}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('cms-media')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('[EditableImage] Upload error:', uploadError);
        toast.error('Upload failed');
        setPreviewSrc(null);
        return;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('cms-media')
        .getPublicUrl(uploadData.path);

      const newSrc = urlData.publicUrl;

      // Save to page_content
      const { data: existing } = await supabase
        .from('page_content')
        .select('id')
        .eq('page_slug', pageSlug)
        .eq('section_key', sectionKey)
        .eq('language', language)
        .maybeSingle();

      if (existing) {
        await supabase
          .from('page_content')
          .update({
            content_value: newSrc,
            content_status: 'approved',
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id);
      } else {
        await supabase
          .from('page_content')
          .insert({
            page_slug: pageSlug,
            section_key: sectionKey,
            language: language,
            content_type: 'image',
            content_value: newSrc,
            content_status: 'approved'
          });
      }

      toast.success('Image updated!');
      onUpdate?.(newSrc);
      setPreviewSrc(null);
    } catch (error) {
      console.error('[EditableImage] Error:', error);
      toast.error('Upload failed');
      setPreviewSrc(null);
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [pageSlug, sectionKey, language, onUpdate]);

  const handleMediaSelect = useCallback(async (url: string, metadata?: any) => {
    setShowMediaDialog(false);
    setShowOptions(false);
    
    try {
      // Save to page_content
      const { data: existing } = await supabase
        .from('page_content')
        .select('id')
        .eq('page_slug', pageSlug)
        .eq('section_key', sectionKey)
        .eq('language', language)
        .maybeSingle();

      if (existing) {
        await supabase
          .from('page_content')
          .update({
            content_value: url,
            content_status: 'approved',
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id);
      } else {
        await supabase
          .from('page_content')
          .insert({
            page_slug: pageSlug,
            section_key: sectionKey,
            language: language,
            content_type: 'image',
            content_value: url,
            content_status: 'approved'
          });
      }

      toast.success('Image updated!');
      onUpdate?.(url);
    } catch (error) {
      console.error('[EditableImage] Media select error:', error);
      toast.error('Failed to update image');
    }
  }, [pageSlug, sectionKey, language, onUpdate]);

  const handleClick = useCallback(() => {
    if (editContext?.isEditMode && editContext?.canEdit && !isUploading && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setOptionsPosition({
        top: rect.top + rect.height / 2 + window.scrollY,
        left: rect.left + rect.width / 2 + window.scrollX
      });
      setShowOptions(true);
    }
  }, [editContext?.isEditMode, editContext?.canEdit, isUploading]);

  const cancelPreview = useCallback(() => {
    setPreviewSrc(null);
    setIsUploading(false);
  }, []);

  // If no edit context or not in edit mode, just render the image
  if (!editContext?.isEditMode) {
    return (
      <div className={className}>
        <img src={src} alt={alt} className={imgClassName} />
      </div>
    );
  }

  const displaySrc = previewSrc || src;

  return (
    <>
      <div 
        ref={containerRef}
        className={cn(
          className,
          "relative group cursor-pointer transition-all duration-200",
          editContext?.canEdit && "hover:ring-2 hover:ring-[#f9dc24] hover:ring-offset-2 rounded-lg overflow-hidden"
        )}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        onClick={handleClick}
      >
        <img 
          src={displaySrc} 
          alt={alt} 
          className={cn(
            imgClassName,
            isUploading && "opacity-50"
          )} 
        />

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Overlay */}
        {editContext?.canEdit && isHovering && !isUploading && !showOptions && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center transition-opacity">
            <div className="bg-black rounded-lg px-4 py-3 flex items-center gap-2 text-[#f9dc24] border border-[#f9dc24]/30">
              <Upload className="h-5 w-5" />
              <span className="font-medium">Change Image</span>
            </div>
          </div>
        )}

        {/* Uploading indicator */}
        {isUploading && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
            <div className="bg-black rounded-lg px-4 py-3 flex items-center gap-2 text-[#f9dc24] border border-[#f9dc24]/30">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="font-medium">Uploading...</span>
            </div>
          </div>
        )}

        {/* Preview cancel button */}
        {previewSrc && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              cancelPreview();
            }}
            className="absolute top-2 right-2 bg-black/80 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Options Portal - Two buttons for upload options */}
      {showOptions && createPortal(
        <div 
          className="fixed inset-0 z-[99998]" 
          onClick={() => setShowOptions(false)}
        >
          <div 
            className="absolute bg-white rounded-xl shadow-2xl p-4 border border-gray-200"
            style={{
              top: optionsPosition.top,
              left: optionsPosition.left,
              transform: 'translate(-50%, -50%)',
              zIndex: 99999
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col gap-3 min-w-[280px]">
              <p className="text-sm text-gray-600 font-medium text-center mb-1">Select image source</p>
              
              {/* Upload from Computer - Yellow */}
              <button
                onClick={() => {
                  fileInputRef.current?.click();
                }}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-[#f9dc24] text-black font-medium hover:bg-[#e5c820] transition-colors"
              >
                <Upload className="h-5 w-5" />
                Upload from Computer
              </button>
              
              {/* Select from Media Management - Blue (uses primary from design system) */}
              <button
                onClick={() => {
                  setShowOptions(false);
                  setShowMediaDialog(true);
                }}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
              >
                <FolderOpen className="h-5 w-5" />
                Select from Media
              </button>
              
              {/* Cancel */}
              <button
                onClick={() => setShowOptions(false)}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors mt-1"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Media Management Dialog */}
      {showMediaDialog && (
        <DataHubDialog
          isOpen={showMediaDialog}
          onClose={() => setShowMediaDialog(false)}
          selectionMode={true}
          onSelect={(url, metadata) => {
            handleMediaSelect(url, metadata);
          }}
        />
      )}
    </>
  );
};
