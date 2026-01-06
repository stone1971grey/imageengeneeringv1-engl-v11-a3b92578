import { useState, useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Check, 
  X, 
  Loader2, 
  Plus, 
  Trash2, 
  ChevronDown,
  GripVertical,
  Image as ImageIcon
} from "lucide-react";
import { useFrontendEditOptional } from '@/contexts/FrontendEditContext';
import { useSegmentEdit } from '@/components/frontend-edit/EditableSegment';
import { EditableText } from '@/components/frontend-edit/EditableText';
import { EditableButton } from '@/components/frontend-edit/EditableButton';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
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

// Sortable Image Item Component
const SortableImageItem = ({ 
  image, 
  index,
  isEditing,
  onRemove,
  onAltChange
}: { 
  image: BannerImage; 
  index: number;
  isEditing: boolean;
  onRemove: (index: number) => void;
  onAltChange: (index: number, alt: string) => void;
}) => {
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

  if (!image.url) return null;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "bg-gray-200 rounded-lg p-6 w-48 h-32 flex items-center justify-center relative group",
        isEditing && "cursor-grab active:cursor-grabbing"
      )}
    >
      {isEditing && (
        <>
          {/* Drag handle */}
          <div 
            {...attributes} 
            {...listeners}
            className="absolute top-1 left-1 p-1 bg-black/70 rounded opacity-0 group-hover:opacity-100 transition-opacity cursor-grab"
          >
            <GripVertical className="h-4 w-4 text-white" />
          </div>
          
          {/* Delete button */}
          <button
            onClick={() => onRemove(index)}
            className="absolute top-1 right-1 p-1 bg-red-500 rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
          >
            <Trash2 className="h-4 w-4 text-white" />
          </button>
        </>
      )}
      
      <img
        src={image.url}
        alt={image.alt || 'Banner image'}
        className="max-h-20 max-w-full object-contain grayscale hover:grayscale-0 transition-all duration-300"
      />
      
      {/* Alt text editor on hover */}
      {isEditing && (
        <div className="absolute -bottom-8 left-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <input
            type="text"
            value={image.alt || ''}
            onChange={(e) => onAltChange(index, e.target.value)}
            placeholder="Alt text..."
            className="w-full text-xs px-2 py-1 border border-gray-300 rounded bg-white focus:border-[#f9dc24] outline-none"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
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

  // Sync with props
  useEffect(() => {
    const imagesWithIds = images.map((img, idx) => ({
      ...img,
      id: img.id || `banner-img-${idx}-${Date.now()}`
    }));
    setEditImages(imagesWithIds);
    setHasChanges(false);
  }, [images]);

  // Enable save button when entering edit mode
  useEffect(() => {
    if (isEditing) {
      setHasChanges(true);
    }
  }, [isEditing]);

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

  const handleAddImage = () => {
    const url = window.prompt('Image URL:');
    if (url) {
      const newImage: BannerImage = {
        id: `banner-img-${Date.now()}`,
        url,
        alt: ''
      };
      setEditImages(prev => [...prev, newImage]);
      setHasChanges(true);
    }
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

        const { error: updateError } = await supabase
          .from('page_content')
          .update({
            content_value: JSON.stringify(segments),
            updated_at: new Date().toISOString()
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
        return 'inline-block px-8 py-3 rounded-lg font-semibold transition-all bg-gray-800 text-white hover:bg-gray-900';
      case 'outline-white':
      case 'white':
        return 'inline-block px-8 py-3 rounded-lg font-semibold transition-all bg-white text-black border border-gray-300 hover:bg-black hover:text-white';
      default:
        return 'inline-block px-8 py-3 rounded-lg font-semibold transition-all bg-[#f9dc24] text-black hover:bg-[#f9dc24]/90';
    }
  };

  return (
    <section
      id={id}
      className="pt-[50px] pb-16 bg-gray-100"
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
              className="text-4xl font-bold text-gray-900 mb-4"
              as="h2"
              onUpdate={onContentUpdate}
              fieldLabel="Banner Title"
            />
          ) : (
            title && (
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                {title}
              </h2>
            )
          )}

          {/* Subtext */}
          {isEditing ? (
            <EditableText
              value={subtext || ''}
              sectionKey={`${segmentKey}-subtext`}
              pageSlug={pageSlug}
              language={language}
              className="text-lg text-gray-700 mb-8"
              as="p"
              multiline
              onUpdate={onContentUpdate}
              fieldLabel="Banner Description"
            />
          ) : (
            subtext && (
              <p className="text-lg text-gray-700 mb-8 whitespace-pre-line">
                {subtext}
              </p>
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
                        />
                      ))}
                      
                      {/* Add Image Button */}
                      <button
                        onClick={handleAddImage}
                        className="w-48 h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:border-[#f9dc24] hover:text-gray-600 transition-colors"
                      >
                        <Plus className="h-8 w-8 mb-1" />
                        <span className="text-sm">Add Image</span>
                      </button>
                    </div>
                  </SortableContext>
                </DndContext>
              ) : (
                <div className="flex flex-wrap justify-center items-center gap-8">
                  {displayImages.map((image, index) => 
                    image.url ? (
                      <div key={image.id || index} className="bg-gray-200 rounded-lg p-6 w-48 h-32 flex items-center justify-center">
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
                className="bg-white border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-[#f9dc24] text-black hover:bg-[#e5c91f]"
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
