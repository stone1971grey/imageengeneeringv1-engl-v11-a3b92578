import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useFrontendEditOptional } from '@/contexts/FrontendEditContext';
import { useSegmentEdit } from '@/components/frontend-edit/EditableSegment';
import { EditableText } from '@/components/frontend-edit/EditableText';
import { EditableImage } from '@/components/frontend-edit/EditableImage';
import { FrontendRichTextEditor } from '@/components/frontend-edit/FrontendRichTextEditor';
import { Plus, Trash2, Loader2, Upload, FolderOpen, ImageIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { DataHubDialog } from '@/components/admin/DataHubDialog';

interface ImageTextItem {
  title: string;
  description: string;
  imageUrl?: string;
  metadata?: { altText?: string };
}

interface ImageTextSegmentProps {
  id?: string;
  title?: string;
  subtext?: string;
  layout?: '1-col' | '2-col' | '3-col';
  heroImageUrl?: string;
  heroImageMetadata?: { altText?: string };
  items?: ImageTextItem[];
  segmentKey?: string;
  pageSlug?: string;
  language?: string;
  onContentUpdate?: () => void;
}

const ImageTextSegment: React.FC<ImageTextSegmentProps> = ({
  id,
  title = '',
  subtext = '',
  layout = '2-col',
  heroImageUrl = '',
  heroImageMetadata,
  items = [],
  segmentKey = '',
  pageSlug = '',
  language = 'en',
  onContentUpdate
}) => {
  const editContext = useFrontendEditOptional();
  const segmentEdit = useSegmentEdit();
  const isEditing = segmentEdit?.isSegmentEditing || editContext?.isEditMode || false;

  // Local state for editing
  const [localItems, setLocalItems] = useState<ImageTextItem[]>(items);
  const [localLayout, setLocalLayout] = useState<'1-col' | '2-col' | '3-col'>(layout);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showMediaDialog, setShowMediaDialog] = useState(false);
  const [activeItemIndex, setActiveItemIndex] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState<number | null>(null);
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Refs for auto-save on navigation
  const localItemsRef = useRef(localItems);
  const localLayoutRef = useRef(localLayout);
  const hasChangesRef = useRef(hasChanges);
  const saveInProgressRef = useRef(false);

  // Keep refs in sync
  useEffect(() => { localItemsRef.current = localItems; }, [localItems]);
  useEffect(() => { localLayoutRef.current = localLayout; }, [localLayout]);
  useEffect(() => { hasChangesRef.current = hasChanges; }, [hasChanges]);

  // Sync local items with props
  useEffect(() => {
    setLocalItems(items);
  }, [items]);

  useEffect(() => {
    setLocalLayout(layout);
  }, [layout]);

  // Enable save button when entering edit mode
  useEffect(() => {
    if (isEditing) {
      setHasChanges(true);
    }
  }, [isEditing]);

  const displayTitle = title || (isEditing ? '[Click to add section title]' : '');
  const displaySubtext = subtext || (isEditing ? '[Click to add section description]' : '');

  // Hide if no content and not editing
  if (!title && !subtext && localItems.length === 0 && !isEditing) {
    return null;
  }

  const getLayoutClass = () => {
    switch (localLayout) {
      case '1-col':
        return 'grid-cols-1';
      case '3-col':
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
      default:
        return 'grid-cols-1 md:grid-cols-2';
    }
  };

  const getImageHeightClass = () => {
    return localLayout === '1-col' ? 'h-[512px]' : 'h-64';
  };

  const handleItemChange = (index: number, field: keyof ImageTextItem, newValue: any) => {
    const updatedItems = [...localItems];
    updatedItems[index] = { ...updatedItems[index], [field]: newValue };
    setLocalItems(updatedItems);
    setHasChanges(true);
  };

  const handleAddItem = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLocalItems([...localItems, { 
      title: '', 
      description: '', 
      imageUrl: ''
    }]);
    setHasChanges(true);
  };

  const handleDeleteItem = (index: number) => {
    const updatedItems = localItems.filter((_, i) => i !== index);
    setLocalItems(updatedItems);
    setHasChanges(true);
  };

  const handleLayoutChange = (newLayout: '1-col' | '2-col' | '3-col') => {
    setLocalLayout(newLayout);
    setHasChanges(true);
  };

  // Handle file upload for item image
  const handleFileUpload = async (index: number, file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be max 5MB');
      return;
    }

    setIsUploading(index);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${pageSlug}/image-text/${segmentKey}-item-${index}-${Date.now()}.${fileExt}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('page-images')
        .upload(fileName, file, { cacheControl: '3600', upsert: false });

      if (uploadError) {
        console.error('[ImageTextSegment] Upload error:', uploadError);
        toast.error('Upload failed');
        return;
      }

      const { data: urlData } = supabase.storage
        .from('page-images')
        .getPublicUrl(uploadData.path);

      const newUrl = urlData.publicUrl;
      handleItemChange(index, 'imageUrl', newUrl);
      toast.success('Image uploaded!');
    } catch (error) {
      console.error('[ImageTextSegment] Upload error:', error);
      toast.error('Upload failed');
    } finally {
      setIsUploading(null);
    }
  };

  // Handle media selection from DataHub
  const handleMediaSelect = (url: string, metadata?: any) => {
    if (activeItemIndex !== null) {
      handleItemChange(activeItemIndex, 'imageUrl', url);
      if (metadata?.altText) {
        const updatedItems = [...localItems];
        updatedItems[activeItemIndex] = { 
          ...updatedItems[activeItemIndex], 
          imageUrl: url,
          metadata: { ...updatedItems[activeItemIndex].metadata, altText: metadata.altText }
        };
        setLocalItems(updatedItems);
      }
      setHasChanges(true);
    }
    setShowMediaDialog(false);
    setActiveItemIndex(null);
  };

  const handleCancel = () => {
    setLocalItems(items);
    setLocalLayout(layout);
    setHasChanges(false);
  };

  const handleSave = useCallback(async () => {
    if (!hasChanges) return;
    
    setIsSaving(true);
    
    try {
      // Load page_segments
      const { data: pageSegmentsData, error: loadError } = await supabase
        .from('page_content')
        .select('id, content_value')
        .eq('page_slug', pageSlug)
        .eq('section_key', 'page_segments')
        .eq('language', language)
        .maybeSingle();

      if (loadError) {
        console.error('[ImageTextSegment] Error loading page_segments:', loadError);
        toast.error('Error loading content');
        setIsSaving(false);
        return;
      }

      if (!pageSegmentsData) {
        console.error('[ImageTextSegment] page_segments not found');
        toast.error('Content not found');
        setIsSaving(false);
        return;
      }

      // Parse segments
      let segments: any[] = [];
      try {
        segments = JSON.parse(pageSegmentsData.content_value || '[]');
      } catch (e) {
        console.error('[ImageTextSegment] Error parsing page_segments:', e);
        toast.error('Error parsing content');
        setIsSaving(false);
        return;
      }

      // Find the segment by ID
      const segmentIndex = segments.findIndex((seg: any) => {
        const segId = String(seg.id || seg.segmentId || seg.segment_id || '');
        return segId === segmentKey;
      });

      if (segmentIndex === -1) {
        console.error('[ImageTextSegment] Segment not found:', segmentKey);
        toast.error('Segment not found');
        setIsSaving(false);
        return;
      }

      // Update segment data
      if (!segments[segmentIndex].data) {
        segments[segmentIndex].data = {};
      }
      segments[segmentIndex].data.items = localItems;
      segments[segmentIndex].data.layout = localLayout;

      // Save
      const { error: updateError } = await supabase
        .from('page_content')
        .update({
          content_value: JSON.stringify(segments),
          updated_at: new Date().toISOString()
        })
        .eq('id', pageSegmentsData.id);

      if (updateError) {
        console.error('[ImageTextSegment] Error saving:', updateError);
        toast.error('Error saving');
        setIsSaving(false);
        return;
      }

      toast.success('Image & Text saved!');
      setHasChanges(false);
      onContentUpdate?.();
    } catch (error) {
      console.error('[ImageTextSegment] Save error:', error);
      toast.error('Error saving');
    } finally {
      setIsSaving(false);
    }
  }, [hasChanges, localItems, localLayout, pageSlug, language, segmentKey, onContentUpdate]);

  // AUTO-SAVE: Save when clicking on links (before navigation)
  useEffect(() => {
    const performAutoSave = async () => {
      if (!hasChangesRef.current || saveInProgressRef.current) return;
      
      saveInProgressRef.current = true;
      console.log('[ImageTextSegment] Auto-saving before navigation...');
      
      try {
        const { data: pageSegmentsData, error: loadError } = await supabase
          .from('page_content')
          .select('id, content_value')
          .eq('page_slug', pageSlug)
          .eq('section_key', 'page_segments')
          .eq('language', language)
          .maybeSingle();

        if (loadError || !pageSegmentsData) {
          saveInProgressRef.current = false;
          return;
        }

        let segments: any[] = [];
        try {
          segments = JSON.parse(pageSegmentsData.content_value || '[]');
        } catch (e) {
          saveInProgressRef.current = false;
          return;
        }

        const segmentIndex = segments.findIndex((seg: any) => {
          const segId = String(seg.id || seg.segmentId || seg.segment_id || '');
          return segId === segmentKey;
        });

        if (segmentIndex === -1) {
          saveInProgressRef.current = false;
          return;
        }

        if (!segments[segmentIndex].data) {
          segments[segmentIndex].data = {};
        }
        segments[segmentIndex].data.items = localItemsRef.current;
        segments[segmentIndex].data.layout = localLayoutRef.current;

        const { error: updateError } = await supabase
          .from('page_content')
          .update({
            content_value: JSON.stringify(segments),
            updated_at: new Date().toISOString()
          })
          .eq('id', pageSegmentsData.id);

        if (!updateError) {
          console.log('[ImageTextSegment] Auto-saved successfully');
          toast.success('Auto-saved', { duration: 2000, description: 'Image & Text' });
          hasChangesRef.current = false;
        }
      } catch (e) {
        console.error('[ImageTextSegment] Auto-save error:', e);
      } finally {
        saveInProgressRef.current = false;
      }
    };

    const handleLinkClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a');
      
      if (link && link.href && hasChangesRef.current && !saveInProgressRef.current) {
        performAutoSave();
      }
    };

    document.addEventListener('click', handleLinkClick, true);

    return () => {
      document.removeEventListener('click', handleLinkClick, true);
      if (hasChangesRef.current && !saveInProgressRef.current) {
        performAutoSave();
      }
    };
  }, [pageSlug, language, segmentKey]);

  return (
    <section id={id} className="pt-8 pb-16 bg-gray-50">
      <div className="container mx-auto px-6">
        {/* Section Title & Subtext */}
        {(displayTitle || isEditing) && (
          <div className="text-center mb-8">
            {isEditing ? (
              <EditableText
                value={displayTitle}
                sectionKey={`${segmentKey}-title`}
                pageSlug={pageSlug}
                language={language}
                className="text-4xl font-bold text-gray-900 mb-4"
                as="h2"
                onUpdate={onContentUpdate}
                fieldLabel="Section Title (H2)"
              />
            ) : (
              title && <h2 className="text-4xl font-bold text-gray-900 mb-4">{title}</h2>
            )}
            
            {(displaySubtext || isEditing) && (
              isEditing ? (
                <EditableText
                  value={displaySubtext}
                  sectionKey={`${segmentKey}-subtext`}
                  pageSlug={pageSlug}
                  language={language}
                  className="text-xl text-gray-600 max-w-3xl mx-auto whitespace-pre-line"
                  as="p"
                  multiline
                  onUpdate={onContentUpdate}
                  fieldLabel="Section Description"
                />
              ) : (
                subtext && (
                  <p className="text-xl text-gray-600 max-w-3xl mx-auto whitespace-pre-line">
                    {subtext}
                  </p>
                )
              )
            )}
          </div>
        )}

        {/* Layout Selector (Edit Mode Only) */}
        {isEditing && (
          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center gap-2 bg-white rounded-lg p-2 shadow-sm border border-gray-200">
              <span className="text-xs text-gray-500 font-medium px-2">Columns:</span>
              <button
                type="button"
                onClick={() => handleLayoutChange('1-col')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  localLayout === '1-col' 
                    ? 'bg-[#f9dc24] text-black' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                1 Column
              </button>
              <button
                type="button"
                onClick={() => handleLayoutChange('2-col')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  localLayout === '2-col' 
                    ? 'bg-[#f9dc24] text-black' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                2 Columns
              </button>
              <button
                type="button"
                onClick={() => handleLayoutChange('3-col')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  localLayout === '3-col' 
                    ? 'bg-[#f9dc24] text-black' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                3 Columns
              </button>
            </div>
          </div>
        )}

        {/* Grid with Items */}
        <div className={`grid gap-8 max-w-7xl mx-auto ${getLayoutClass()}`}>
          {localItems.map((item, idx) => {
            // Prefer item-level image, fallback to hero image for first item
            const imageSrc = item.imageUrl || (idx === 0 ? heroImageUrl : undefined);
            const imageAlt = item.metadata?.altText || item.title || heroImageMetadata?.altText || title;

            return (
              <div key={idx} className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow relative group">
                {isEditing && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteItem(idx)}
                    className="absolute top-2 right-2 text-red-500 hover:text-red-700 hover:bg-red-50 p-1 h-auto opacity-0 group-hover:opacity-100 transition-opacity z-10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
                
                {/* Image Section */}
                {isEditing ? (
                  <div className={`w-full ${getImageHeightClass()} bg-gray-100 flex flex-col items-center justify-center gap-4 border-2 border-dashed border-gray-300 relative overflow-hidden`}>
                    {/* Show existing image as background if available */}
                    {imageSrc && (
                      <img 
                        src={imageSrc} 
                        alt={imageAlt || 'Item image'} 
                        className="absolute inset-0 w-full h-full object-cover opacity-40"
                      />
                    )}
                    
                    {isUploading === idx ? (
                      <div className="flex items-center gap-2 text-gray-600 z-10">
                        <Loader2 className="h-6 w-6 animate-spin" />
                        <span>Uploading...</span>
                      </div>
                    ) : (
                      <div className="z-10 flex flex-col items-center gap-3">
                        <ImageIcon className="h-10 w-10 text-gray-500" />
                        <p className="text-sm text-gray-600 font-medium">
                          {imageSrc ? 'Replace Image' : 'Add Image'}
                        </p>
                        <div className="flex gap-2">
                          {/* Upload from Computer */}
                          <input
                            ref={(el) => { fileInputRefs.current[idx] = el; }}
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleFileUpload(idx, file);
                            }}
                            className="hidden"
                          />
                          <button
                            type="button"
                            onClick={() => fileInputRefs.current[idx]?.click()}
                            className="flex items-center gap-1 px-4 py-2 text-sm rounded-lg bg-[#f9dc24] text-black font-medium hover:bg-[#e5c820] transition-colors shadow-sm"
                          >
                            <Upload className="h-4 w-4" />
                            Upload
                          </button>
                          {/* Select from Media */}
                          <button
                            type="button"
                            onClick={() => {
                              setActiveItemIndex(idx);
                              setShowMediaDialog(true);
                            }}
                            className="flex items-center gap-1 px-4 py-2 text-sm rounded-lg bg-[#1e6bb8] text-white font-medium hover:bg-[#1a5d9e] transition-colors shadow-sm"
                          >
                            <FolderOpen className="h-4 w-4" />
                            Media
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  imageSrc && (
                    <div className={`w-full ${getImageHeightClass()} overflow-hidden`}>
                      <img
                        src={imageSrc}
                        alt={imageAlt || "Section image"}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )
                )}
                
                {/* Content Section */}
                <div className="p-8">
                  {isEditing ? (
                    <>
                      <div className="mb-4">
                        <label className="text-xs text-gray-500 mb-1 block">Item Title (H3)</label>
                        <input
                          type="text"
                          value={item.title}
                          onChange={(e) => handleItemChange(idx, 'title', e.target.value)}
                          className="text-2xl font-bold text-gray-900 w-full bg-transparent border-b border-dashed border-gray-300 focus:border-[#f9dc24] outline-none py-2 hover:bg-[#f9dc24]/10 transition-colors"
                          placeholder="Item title..."
                        />
                      </div>
                      <FrontendRichTextEditor
                        value={item.description || ''}
                        onChange={(newValue) => handleItemChange(idx, 'description', newValue)}
                        placeholder="Enter description..."
                        minHeight="180px"
                      />
                    </>
                  ) : (
                    <>
                      <h3 className="text-2xl font-bold text-gray-900 mb-4">{item.title}</h3>
                      <div 
                        className="text-gray-600 leading-relaxed [&_p]:mb-3 [&_p:last-child]:mb-0 [&_strong]:font-semibold [&_strong]:text-gray-900 [&_a]:text-blue-600 [&_a]:underline hover:[&_a]:text-blue-800 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-3 [&_ul]:space-y-1 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-3 [&_ol]:space-y-1"
                        dangerouslySetInnerHTML={{ __html: item.description || '' }}
                      />
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Add Item Button */}
        {isEditing && (
          <div className="flex justify-center mt-8">
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => handleAddItem(e)}
              className="bg-black text-white hover:bg-gray-900 hover:text-white border-black z-20"
            >
              <Plus className="h-4 w-4 mr-2 text-white" />
              Add Item
            </Button>
          </div>
        )}

        {/* Save/Cancel buttons */}
        {isEditing && (
          <div className="mt-8 flex justify-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancel}
              disabled={isSaving}
              className="bg-black text-[#f9dc24] hover:bg-gray-900 border-black"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={isSaving}
              className="bg-[#f9dc24] text-black hover:bg-[#f9dc24]/90"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              Save
            </Button>
          </div>
        )}
      </div>

      {/* Media Management Dialog */}
      {showMediaDialog && (
        <DataHubDialog
          isOpen={showMediaDialog}
          onClose={() => {
            setShowMediaDialog(false);
            setActiveItemIndex(null);
          }}
          selectionMode={true}
          onSelect={handleMediaSelect}
        />
      )}
    </section>
  );
};

export default ImageTextSegment;
