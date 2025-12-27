import React, { useState, useRef, useCallback } from 'react';
import { useFrontendEditOptional } from '@/contexts/FrontendEditContext';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { ImagePlus, Loader2, X } from 'lucide-react';

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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Bitte wählen Sie eine Bilddatei aus');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Bild darf maximal 5MB groß sein');
      return;
    }

    setIsUploading(true);

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
        toast.error('Fehler beim Hochladen');
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

      toast.success('Bild aktualisiert!');
      onUpdate?.(newSrc);
      setPreviewSrc(null);
    } catch (error) {
      console.error('[EditableImage] Error:', error);
      toast.error('Fehler beim Hochladen');
      setPreviewSrc(null);
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [pageSlug, sectionKey, language, onUpdate]);

  const handleClick = useCallback(() => {
    if (editContext?.isEditMode && editContext?.canEdit && !isUploading) {
      fileInputRef.current?.click();
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
    <div 
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
      {editContext?.canEdit && isHovering && !isUploading && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center transition-opacity">
          <div className="bg-black rounded-lg px-4 py-3 flex items-center gap-2 text-[#f9dc24] border border-[#f9dc24]/30">
            <ImagePlus className="h-5 w-5" />
            <span className="font-medium">Bild ändern</span>
          </div>
        </div>
      )}

      {/* Uploading indicator */}
      {isUploading && (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
          <div className="bg-black rounded-lg px-4 py-3 flex items-center gap-2 text-[#f9dc24] border border-[#f9dc24]/30">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="font-medium">Wird hochgeladen...</span>
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

      {/* Edit hint */}
      {editContext?.canEdit && !isHovering && !isUploading && (
        <div className="absolute top-2 right-2 bg-black text-[#f9dc24] text-[10px] px-2 py-1 rounded font-medium opacity-0 group-hover:opacity-100 transition-opacity">
          Klicken zum Ändern
        </div>
      )}
    </div>
  );
};
