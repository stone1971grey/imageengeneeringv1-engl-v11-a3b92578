import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { Link } from "react-router-dom";
import { createPortal } from 'react-dom';
import { 
  Check, 
  X, 
  Loader2, 
  Plus, 
  Trash2, 
  ChevronDown,
  GripVertical,
  Image as ImageIcon,
  Upload,
  FolderOpen
} from "lucide-react";
import { DataHubDialog } from '@/components/admin/DataHubDialog';
import { useFrontendEditOptional } from '@/contexts/FrontendEditContext';
import { useSegmentEdit } from '@/components/frontend-edit/EditableSegment';
import { EditableText } from '@/components/frontend-edit/EditableText';
import { EditableRichText } from '@/components/frontend-edit/EditableRichText';
import { EditableButton } from '@/components/frontend-edit/EditableButton';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { transformHtmlWithLinkIcons } from '@/components/ui/RichTextRenderer';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface BannerImage {
  id: string;
  url: string;
  alt: string;
}

interface BannerSegmentProps {
  id?: string;
  title?: string;
  subtext?: string;
  images?: BannerImage[];
  buttonText?: string;
  buttonLink?: string;
  buttonStyle?: string;
  segmentKey?: string;
  pageSlug?: string;
  language?: string;
  onContentUpdate?: () => void;
}

// Sortable Image Item Component with Upload Options
const SortableImageItem = ({ 
  image, 
  index,
  isEditing,
  onRemove,
  onAltChange,
  onImageChange,
  pageSlug,
  segmentKey
}: { 
  image: BannerImage; 
  index: number;
  isEditing: boolean;
  onRemove: (index: number) => void;
  onAltChange: (index: number, alt: string) => void;
  onImageChange: (index: number, url: string) => void;
  pageSlug: string;
  segmentKey: string;
}) => {
  const [showOptions, setShowOptions] = useState(false);
  const [showMediaDialog, setShowMediaDialog] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [optionsPosition, setOptionsPosition] = useState({ top: 0, left: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: image.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleImageClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isEditing || isUploading) {
      console.log('[SortableImageItem] Click ignored - isEditing:', isEditing, 'isUploading:', isUploading);
      return;
    }
    
    // Calculate position for the options dialog
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const top = rect.top + rect.height / 2 + window.scrollY;
    const left = rect.left + rect.width / 2 + window.scrollX;
    
    console.log('[SortableImageItem] Opening options at:', { top, left });
    setOptionsPosition({ top, left });
    setShowOptions(true);
  }, [isEditing, isUploading]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be max 5MB');
      return;
    }

    setIsUploading(true);
    setShowOptions(false);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${pageSlug}/${segmentKey}-banner-${index}-${Date.now()}.${fileExt}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('cms-media')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('[BannerSegment] Upload error:', uploadError);
        toast.error('Upload failed');
        return;
      }

      const { data: urlData } = supabase.storage
        .from('cms-media')
        .getPublicUrl(uploadData.path);

      onImageChange(index, urlData.publicUrl);
      toast.success('Image uploaded!');
    } catch (error) {
      console.error('[BannerSegment] Upload error:', error);
      toast.error('Upload failed');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleMediaSelect = (url: string) => {
    setShowMediaDialog(false);
    setShowOptions(false);
    onImageChange(index, url);
    toast.success('Image selected!');
  };

  if (!image.url) return null;

  return (
    <>
      <div
        ref={(node) => {
          setNodeRef(node);
          (containerRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
        }}
      style={style}
      className={cn(
        "bg-light-muted rounded-lg p-6 w-48 h-32 flex items-center justify-center relative group",
        isEditing && "cursor-pointer hover:ring-2 hover:ring-yellow"
      )}
    >
        {isEditing && (
          <>
            {/* Drag handle - only this has dnd listeners */}
            <div 
              {...attributes} 
              {...listeners}
              className="absolute top-1 left-1 p-1 bg-black/70 rounded opacity-0 group-hover:opacity-100 transition-opacity cursor-grab z-10"
              onClick={(e) => e.stopPropagation()}
            >
              <GripVertical className="h-4 w-4 text-white" />
            </div>
            
            {/* Delete button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove(index);
              }}
              className="absolute top-1 right-1 p-1 bg-red-500 rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 z-10"
            >
              <Trash2 className="h-4 w-4 text-white" />
            </button>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </>
        )}
        
        {isUploading ? (
          <div className="flex items-center gap-2 text-light-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm">Uploading...</span>
          </div>
        ) : isEditing ? (
          /* Edit mode: show image with upload buttons overlay */
          <div className="relative flex flex-col items-center justify-center w-full h-full">
            <img
              src={image.url}
              alt={image.alt || 'Banner image'}
              className="max-h-12 max-w-full object-contain grayscale"
            />
            {/* Buttons always visible in edit mode - like Footer */}
            <div className="flex gap-1 mt-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="flex items-center gap-1 px-2 py-1 text-xs rounded bg-yellow text-light-dark font-medium hover:bg-yellow/90 transition-colors"
              >
                <Upload className="h-3 w-3" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMediaDialog(true);
                }}
                className="flex items-center gap-1 px-2 py-1 text-xs rounded bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
              >
                <FolderOpen className="h-3 w-3" />
              </button>
            </div>
          </div>
        ) : (
          <img
            src={image.url}
            alt={image.alt || 'Banner image'}
            className="max-h-20 max-w-full object-contain grayscale hover:grayscale-0 transition-all duration-300"
          />
        )}
        
        {/* Alt text editor - always visible in edit mode */}
        {isEditing && (
          <div className="absolute -bottom-8 left-0 right-0 z-10">
            <input
              type="text"
              value={image.alt || ''}
              onChange={(e) => onAltChange(index, e.target.value)}
              placeholder="Alt text..."
              className="w-full text-xs px-2 py-1 border border-light-border rounded bg-light-card focus:border-yellow outline-none"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}
      </div>

      {/* Media Management Dialog */}
      {showMediaDialog && (
        <DataHubDialog
          isOpen={showMediaDialog}
          onClose={() => setShowMediaDialog(false)}
          selectionMode={true}
          onSelect={(url) => handleMediaSelect(url)}
        />
      )}
    </>
  );
};

// Add Image Button Component with Upload Options
const AddImageButton = ({
  onImageAdd,
  pageSlug,
  segmentKey
}: {
  onImageAdd: (url: string) => void;
  pageSlug: string;
  segmentKey: string;
}) => {
  const [showOptions, setShowOptions] = useState(false);
  const [showMediaDialog, setShowMediaDialog] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [optionsPosition, setOptionsPosition] = useState({ top: 0, left: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLButtonElement>(null);

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isUploading) {
      console.log('[AddImageButton] Click ignored - isUploading:', isUploading);
      return;
    }
    
    // Calculate position for the options dialog
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const top = rect.top + rect.height / 2 + window.scrollY;
    const left = rect.left + rect.width / 2 + window.scrollX;
    
    console.log('[AddImageButton] Opening options at:', { top, left });
    setOptionsPosition({ top, left });
    setShowOptions(true);
  }, [isUploading]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be max 5MB');
      return;
    }

    setIsUploading(true);
    setShowOptions(false);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${pageSlug}/${segmentKey}-banner-new-${Date.now()}.${fileExt}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('cms-media')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('[BannerSegment] Upload error:', uploadError);
        toast.error('Upload failed');
        return;
      }

      const { data: urlData } = supabase.storage
        .from('cms-media')
        .getPublicUrl(uploadData.path);

      onImageAdd(urlData.publicUrl);
      toast.success('Image uploaded!');
    } catch (error) {
      console.error('[BannerSegment] Upload error:', error);
      toast.error('Upload failed');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleMediaSelect = (url: string) => {
    setShowMediaDialog(false);
    setShowOptions(false);
    onImageAdd(url);
    toast.success('Image selected!');
  };

  return (
    <>
      <div className="w-48 h-32 border-2 border-dashed border-light-border rounded-lg flex flex-col items-center justify-center text-light-muted-foreground hover:border-yellow transition-colors">
        {isUploading ? (
          <div className="flex flex-col items-center">
            <Loader2 className="h-6 w-6 mb-1 animate-spin" />
            <span className="text-xs">Uploading...</span>
          </div>
        ) : (
          /* Always show buttons - like Footer pattern */
          <div className="flex flex-col items-center">
            <Plus className="h-6 w-6 mb-2" />
            <div className="flex gap-1">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="flex items-center gap-1 px-2 py-1 text-xs rounded bg-yellow text-light-dark font-medium hover:bg-yellow/90 transition-colors"
              >
                <Upload className="h-3 w-3" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMediaDialog(true);
                }}
                className="flex items-center gap-1 px-2 py-1 text-xs rounded bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
              >
                <FolderOpen className="h-3 w-3" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Media Management Dialog */}
      {showMediaDialog && (
        <DataHubDialog
          isOpen={showMediaDialog}
          onClose={() => setShowMediaDialog(false)}
          selectionMode={true}
          onSelect={(url) => handleMediaSelect(url)}
        />
      )}
    </>
  );
};

const BannerSegment = ({
  id,
  title = "",
  subtext = "",
  images = [],
  buttonText = "",
  buttonLink = "",
  buttonStyle = "yellow",
  segmentKey = '',
  pageSlug = '',
  language = 'en',
  onContentUpdate
}: BannerSegmentProps) => {
  const editContext = useFrontendEditOptional();
  const segmentEdit = useSegmentEdit();
  const isEditing = segmentEdit?.isSegmentEditing || (editContext?.isEditMode && editContext?.canEdit) || false;


  // Local state for editing
  const [editImages, setEditImages] = useState<BannerImage[]>(images);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Refs for auto-save on navigation
  const editImagesRef = useRef(editImages);
  const hasChangesRef = useRef(hasChanges);
  const saveInProgressRef = useRef(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Keep refs in sync
  useEffect(() => { editImagesRef.current = editImages; }, [editImages]);
  useEffect(() => { hasChangesRef.current = hasChanges; }, [hasChanges]);

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Sync with props - BUT ONLY if there are no pending changes!
  useEffect(() => {
    if (!hasChangesRef.current) {
      const imagesWithIds = images.map((img, idx) => ({
        ...img,
        id: img.id || `banner-img-${idx}-${Date.now()}`
      }));
      setEditImages(imagesWithIds);
    }
  }, [images]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setEditImages((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
      setHasChanges(true);
    }
  };

  const handleRemoveImage = (index: number) => {
    setEditImages(prev => prev.filter((_, i) => i !== index));
    setHasChanges(true);
  };

  const handleAltChange = (index: number, alt: string) => {
    setEditImages(prev => prev.map((img, i) => 
      i === index ? { ...img, alt } : img
    ));
    setHasChanges(true);
  };

  const handleImageChange = (index: number, url: string) => {
    setEditImages(prev => prev.map((img, i) => 
      i === index ? { ...img, url } : img
    ));
    setHasChanges(true);
  };

  const handleAddImage = () => {
    // Open a simple prompt - could be replaced with proper upload dialog later
    const newImage: BannerImage = {
      id: `banner-img-${Date.now()}`,
      url: '',
      alt: ''
    };
    // Add empty placeholder that user can click to upload
    setEditImages(prev => [...prev, newImage]);
    setHasChanges(true);
  };

  const handleSave = useCallback(async () => {
    if (!hasChanges) return;

    setIsSaving(true);

    try {
      // Extract segment ID from segmentKey
      const segmentKeyParts = segmentKey.split('-');
      const segmentId = segmentKeyParts[segmentKeyParts.length - 1];

      // Load page_segments
      let { data: pageSegmentsData, error: loadError } = await supabase
        .from('page_content')
        .select('id, content_value')
        .eq('page_slug', pageSlug)
        .eq('section_key', 'page_segments')
        .eq('language', language)
        .maybeSingle();

      if (loadError) {
        console.error('[BannerSegment] Error loading:', loadError);
        toast.error('Error loading content');
        setIsSaving(false);
        return;
      }

      if (pageSegmentsData) {
        let segments: any[] = [];
        try {
          segments = JSON.parse(pageSegmentsData.content_value || '[]');
        } catch (e) {
          console.error('[BannerSegment] Error parsing:', e);
          toast.error('Error parsing content');
          setIsSaving(false);
          return;
        }

        const segmentIndex = segments.findIndex((seg: any) => {
          const segId = String(seg.id || seg.segmentId || seg.segment_id || '');
          return segId === segmentId;
        });

        if (segmentIndex === -1) {
          console.error('[BannerSegment] Segment not found');
          toast.error('Segment not found');
          setIsSaving(false);
          return;
        }

        // Update segment data - only images (title/subtext handled by EditableText)
        if (!segments[segmentIndex].data) {
          segments[segmentIndex].data = {};
        }
        segments[segmentIndex].data.images = editImages;

        // Include updated_by for proper tracking
        const { data: { user } } = await supabase.auth.getUser();
        const { error: updateError } = await supabase
          .from('page_content')
          .update({
            content_value: JSON.stringify(segments),
            updated_at: new Date().toISOString(),
            updated_by: user?.id
          })
          .eq('id', pageSegmentsData.id);

        if (updateError) {
          console.error('[BannerSegment] Error updating:', updateError);
          toast.error('Error saving');
          setIsSaving(false);
          return;
        }
      }

      toast.success('Banner saved!');
      setHasChanges(false);
      onContentUpdate?.();
    } catch (error) {
      console.error('[BannerSegment] Save error:', error);
      toast.error('Error saving');
    } finally {
      setIsSaving(false);
    }
  }, [hasChanges, segmentKey, pageSlug, language, editImages, onContentUpdate]);

  // AUTO-SAVE: Core save function
  const performAutoSave = useCallback(async (): Promise<boolean> => {
    if (!hasChangesRef.current || saveInProgressRef.current) return false;
    
    saveInProgressRef.current = true;
    console.log('[BannerSegment] Auto-saving...');
    
    try {
      const segmentKeyParts = segmentKey.split('-');
      const segmentId = segmentKeyParts[segmentKeyParts.length - 1];

      const { data: pageSegmentsData, error: loadError } = await supabase
        .from('page_content')
        .select('id, content_value')
        .eq('page_slug', pageSlug)
        .eq('section_key', 'page_segments')
        .eq('language', language)
        .maybeSingle();

      if (loadError || !pageSegmentsData) {
        return false;
      }

      let segments: any[] = [];
      try {
        segments = JSON.parse(pageSegmentsData.content_value || '[]');
      } catch (e) {
        return false;
      }

      const segmentIndex = segments.findIndex((seg: any) => {
        const segId = String(seg.id || seg.segmentId || seg.segment_id || '');
        return segId === segmentId;
      });

      if (segmentIndex === -1) {
        return false;
      }

      if (!segments[segmentIndex].data) {
        segments[segmentIndex].data = {};
      }
      segments[segmentIndex].data.images = editImagesRef.current;

      // Include updated_by for proper tracking
      const { data: { user } } = await supabase.auth.getUser();
      const { error: updateError } = await supabase
        .from('page_content')
        .update({
          content_value: JSON.stringify(segments),
          updated_at: new Date().toISOString(),
          updated_by: user?.id
        })
        .eq('id', pageSegmentsData.id);

      if (!updateError) {
        console.log('[BannerSegment] Auto-saved successfully');
        toast.success('Auto-saved', { duration: 2000, description: 'Banner' });
        hasChangesRef.current = false;
        setHasChanges(false);
        return true;
      }
      return false;
    } catch (e) {
      console.error('[BannerSegment] Auto-save error:', e);
      return false;
    } finally {
      saveInProgressRef.current = false;
    }
  }, [pageSlug, language, segmentKey]);

  // CRITICAL: Intercept link clicks and BLOCK navigation until save completes
  useEffect(() => {
    if (!isEditing) return;

    const handleLinkClick = async (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a');
      
      if (link && link.href && hasChangesRef.current && !saveInProgressRef.current) {
        // BLOCK the default navigation
        e.preventDefault();
        e.stopPropagation();
        
        console.log('[BannerSegment] Blocking navigation to save first...');
        
        // Save first, then navigate
        await performAutoSave();
        
        // Now navigate
        console.log('[BannerSegment] Save complete, navigating to:', link.href);
        window.location.href = link.href;
      }
    };

    document.addEventListener('click', handleLinkClick, true);

    return () => {
      document.removeEventListener('click', handleLinkClick, true);
    };
  }, [isEditing, performAutoSave]);

  // IMMEDIATE AUTO-SAVE: Save 1 second after any change (debounced)
  useEffect(() => {
    if (!isEditing || !hasChanges) return;

    // Clear any existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set new timeout for 1 second
    saveTimeoutRef.current = setTimeout(async () => {
      if (hasChangesRef.current && !saveInProgressRef.current) {
        console.log('[BannerSegment] Immediate auto-save triggered (1s after change)...');
        await performAutoSave();
      }
    }, 1000); // 1 second after change

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [isEditing, hasChanges, editImages, performAutoSave]);

  // CRITICAL: Save when tab loses focus (user switches tabs or minimizes)
  useEffect(() => {
    if (!isEditing) return;

    const handleVisibilityChange = () => {
      if (document.hidden && hasChangesRef.current && !saveInProgressRef.current) {
        console.log('[BannerSegment] Saving on tab hidden...');
        performAutoSave();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isEditing, performAutoSave]);

  // CRITICAL: Save when page is about to unload (close tab, refresh, navigate away)
  useEffect(() => {
    if (!isEditing) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasChangesRef.current && !saveInProgressRef.current) {
        console.log('[BannerSegment] Saving on beforeunload...');
        performAutoSave();
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isEditing, performAutoSave]);

  // Save on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      if (hasChangesRef.current && !saveInProgressRef.current) {
        console.log('[BannerSegment] Saving on unmount...');
        performAutoSave();
      }
    };
  }, [performAutoSave]);

  const handleCancel = () => {
    const imagesWithIds = images.map((img, idx) => ({
      ...img,
      id: img.id || `banner-img-${idx}-${Date.now()}`
    }));
    setEditImages(imagesWithIds);
    setHasChanges(false);
  };

  const displayImages = isEditing ? editImages : images;

  // Get button style classes
  const getButtonClasses = (style: string) => {
    switch (style) {
      case 'technical':
      case 'black':
        return 'inline-block px-8 py-3 rounded-lg font-semibold transition-all bg-light-dark text-light-dark-foreground hover:bg-light-dark/90';
      case 'outline-white':
      case 'white':
        return 'inline-block px-8 py-3 rounded-lg font-semibold transition-all bg-light-card text-light-dark border border-light-border hover:bg-light-dark hover:text-light-dark-foreground';
      default:
        return 'inline-block px-8 py-3 rounded-lg font-semibold transition-all bg-yellow text-light-dark hover:bg-yellow/90';
    }
  };

  return (
    <section
      id={id}
      className="pt-[50px] pb-16 bg-light-muted"
    >
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto text-center">
          {/* Title */}
          {isEditing ? (
            <EditableText
              value={title || ''}
              sectionKey={`${segmentKey}-title`}
              pageSlug={pageSlug}
              language={language}
              className="text-4xl font-bold text-light-foreground mb-4"
              as="h2"
              onUpdate={onContentUpdate}
              fieldLabel="Banner Title"
            />
          ) : (
            title && (
              <h2 className="text-4xl font-bold text-light-foreground mb-4">
                {title}
              </h2>
            )
          )}

          {/* Subtext */}
          {isEditing ? (
            <EditableRichText
              value={subtext || ''}
              sectionKey={`${segmentKey}-subtext`}
              pageSlug={pageSlug}
              language={language}
              className="text-lg text-light-muted-foreground mb-8"
              onUpdate={onContentUpdate}
              fieldLabel="Banner Description"
            />
          ) : (
            subtext && (
              <div 
                className="text-lg text-light-muted-foreground mb-8"
                dangerouslySetInnerHTML={{ __html: transformHtmlWithLinkIcons(subtext) }}
              />
            )
          )}

          {/* Images with Drag & Drop */}
          {(displayImages.length > 0 || isEditing) && (
            <div className="mb-8">
              {isEditing ? (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={editImages.map(img => img.id)}
                    strategy={horizontalListSortingStrategy}
                  >
                    <div className="flex flex-wrap justify-center items-center gap-8 pb-10">
                      {editImages.map((image, index) => (
                        <SortableImageItem
                          key={image.id}
                          image={image}
                          index={index}
                          isEditing={isEditing}
                          onRemove={handleRemoveImage}
                          onAltChange={handleAltChange}
                          onImageChange={handleImageChange}
                          pageSlug={pageSlug}
                          segmentKey={segmentKey}
                        />
                      ))}
                      
                      {/* Add Image Button */}
                      <AddImageButton 
                        onImageAdd={(url) => {
                          const newImage: BannerImage = {
                            id: `banner-img-${Date.now()}`,
                            url,
                            alt: ''
                          };
                          setEditImages(prev => [...prev, newImage]);
                          setHasChanges(true);
                        }}
                        pageSlug={pageSlug}
                        segmentKey={segmentKey}
                      />
                    </div>
                  </SortableContext>
                </DndContext>
              ) : (
                <div className="flex flex-wrap justify-center items-center gap-8">
                  {displayImages.map((image, index) => 
                    image.url ? (
                      <div key={image.id || index} className="bg-light-muted rounded-lg p-6 w-48 h-32 flex items-center justify-center">
                        <img
                          src={image.url}
                          alt={image.alt || 'Banner image'}
                          className="max-h-20 max-w-full object-contain grayscale hover:grayscale-0 transition-all duration-300"
                        />
                      </div>
                    ) : null
                  )}
                </div>
              )}
            </div>
          )}

          {/* Button */}
          {isEditing ? (
            <EditableButton
              text={buttonText || 'Button Text'}
              link={buttonLink || '#'}
              sectionKey={`${segmentKey}-button`}
              pageSlug={pageSlug}
              language={language}
              className={getButtonClasses(buttonStyle || 'yellow')}
              onUpdate={onContentUpdate}
              buttonStyle={buttonStyle || 'yellow'}
              textFieldName="buttonText"
              linkFieldName="buttonLink"
              styleFieldName="buttonStyle"
            />
          ) : (
            buttonText && buttonLink && (() => {
              const buttonClasses = getButtonClasses(buttonStyle || 'yellow');
              const isExternal = buttonLink.startsWith('http://') || buttonLink.startsWith('https://');

              if (isExternal) {
                return (
                  <a
                    href={buttonLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={buttonClasses}
                  >
                    {buttonText}
                  </a>
                );
              }

              return (
                <Link to={buttonLink} className={buttonClasses}>
                  {buttonText}
                </Link>
              );
            })()
          )}

          {/* Save/Cancel Bar */}
          {isEditing && hasChanges && (
            <div className="flex justify-center gap-3 mt-8">
              <Button
                onClick={handleCancel}
                variant="outline"
                disabled={isSaving}
                className="bg-light-card border-light-border text-light-muted-foreground hover:bg-light-muted"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-yellow text-light-dark hover:bg-yellow/90"
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Check className="h-4 w-4 mr-2" />
                )}
                Save Images
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default BannerSegment;
