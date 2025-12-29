import React, { useState, useEffect, useCallback } from 'react';
import { useFrontendEditOptional } from '@/contexts/FrontendEditContext';
import { useSegmentEdit } from '@/components/frontend-edit/EditableSegment';
import { EditableText } from '@/components/frontend-edit/EditableText';
import { Plus, Trash2, Save, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface FeatureItem {
  title: string;
  description: string;
}

interface FeatureOverviewProps {
  id?: string;
  title?: string;
  subtext?: string;
  layout?: '1' | '2' | '3';
  rows?: '1' | '2' | '3';
  items?: FeatureItem[];
  segmentKey?: string;
  pageSlug?: string;
  language?: string;
  onContentUpdate?: () => void;
}

const FeatureOverview: React.FC<FeatureOverviewProps> = ({
  id,
  title = '',
  subtext = '',
  layout = '3',
  rows = '1',
  items = [],
  segmentKey = '',
  pageSlug = '',
  language = 'en',
  onContentUpdate
}) => {
  const editContext = useFrontendEditOptional();
  const segmentEdit = useSegmentEdit();
  const isEditing = segmentEdit?.isSegmentEditing || (editContext?.isEditMode && editContext?.canEdit) || false;

  // Local state for items editing
  const [localItems, setLocalItems] = useState<FeatureItem[]>(items);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Sync local items with props and reset hasChanges
  useEffect(() => {
    setLocalItems(items);
    setHasChanges(false);
  }, [items]);

  const displayTitle = title || (isEditing ? '[Click to add title]' : '');
  const displaySubtext = subtext || (isEditing ? '[Click to add subtext]' : '');

  // Hide if no content and not editing
  if (!title && !subtext && localItems.length === 0 && !isEditing) {
    return null;
  }

  const getGridColumns = () => {
    switch (layout) {
      case '1':
        return 'grid-cols-1';
      case '2':
        return 'md:grid-cols-2';
      case '3':
        return 'md:grid-cols-2 lg:grid-cols-3';
      default:
        return 'md:grid-cols-2 lg:grid-cols-3';
    }
  };

  const columnsPerRow = parseInt(layout);
  const numberOfRows = parseInt(rows);
  const itemsPerRow = columnsPerRow;

  // Group items into rows
  const groupedItems: FeatureItem[][] = [];
  for (let i = 0; i < numberOfRows; i++) {
    const startIndex = i * itemsPerRow;
    const endIndex = startIndex + itemsPerRow;
    const rowItems = localItems.slice(startIndex, endIndex);
    if (rowItems.length > 0) {
      groupedItems.push(rowItems);
    }
  }

  const handleItemChange = (globalIndex: number, field: 'title' | 'description', newValue: string) => {
    const updatedItems = [...localItems];
    updatedItems[globalIndex] = { ...updatedItems[globalIndex], [field]: newValue };
    setLocalItems(updatedItems);
    setHasChanges(true);
  };

  const handleAddItem = () => {
    setLocalItems([...localItems, { title: '', description: '' }]);
    setHasChanges(true);
  };

  const handleDeleteItem = (globalIndex: number) => {
    const updatedItems = localItems.filter((_, i) => i !== globalIndex);
    setLocalItems(updatedItems);
    setHasChanges(true);
  };

  // Calculate global index from row and item index
  const getGlobalIndex = (rowIndex: number, itemIndex: number) => {
    return rowIndex * itemsPerRow + itemIndex;
  };

  const handleCancel = () => {
    setLocalItems(items);
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
        console.error('[FeatureOverview] Error loading page_segments:', loadError);
        toast.error('Error loading content');
        setIsSaving(false);
        return;
      }

      if (!pageSegmentsData) {
        console.error('[FeatureOverview] page_segments not found');
        toast.error('Content not found');
        setIsSaving(false);
        return;
      }

      // Parse segments
      let segments: any[] = [];
      try {
        segments = JSON.parse(pageSegmentsData.content_value || '[]');
      } catch (e) {
        console.error('[FeatureOverview] Error parsing page_segments:', e);
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
        console.error('[FeatureOverview] Segment not found:', segmentKey);
        toast.error('Segment not found');
        setIsSaving(false);
        return;
      }

      // Update items in segment data
      if (!segments[segmentIndex].data) {
        segments[segmentIndex].data = {};
      }
      segments[segmentIndex].data.items = localItems;

      // Save
      const { error: updateError } = await supabase
        .from('page_content')
        .update({
          content_value: JSON.stringify(segments),
          updated_at: new Date().toISOString()
        })
        .eq('id', pageSegmentsData.id);

      if (updateError) {
        console.error('[FeatureOverview] Error saving:', updateError);
        toast.error('Error saving');
        setIsSaving(false);
        return;
      }

      toast.success('Feature items saved!');
      setHasChanges(false);
      onContentUpdate?.();
    } catch (error) {
      console.error('[FeatureOverview] Save error:', error);
      toast.error('Error saving');
    } finally {
      setIsSaving(false);
    }
  }, [hasChanges, localItems, pageSlug, language, segmentKey, onContentUpdate]);

  return (
    <section id={id} className="bg-gradient-to-br from-gray-50 to-blue-50 pt-[40px] pb-16">
      <div className="container mx-auto px-4">
        {(displayTitle || isEditing) && (
          isEditing ? (
            <EditableText
              value={displayTitle}
              sectionKey={`${segmentKey}-title`}
              pageSlug={pageSlug}
              language={language}
              className={`text-3xl font-bold text-gray-800 text-center ${displaySubtext || isEditing ? 'mb-4' : 'mb-12'}`}
              as="h2"
              onUpdate={onContentUpdate}
              fieldLabel="Feature Overview Title"
            />
          ) : (
            title && (
              <h2 className={`text-3xl font-bold text-gray-800 text-center ${subtext ? 'mb-4' : 'mb-12'}`}>
                {title}
              </h2>
            )
          )
        )}
        
        {(displaySubtext || isEditing) && (
          isEditing ? (
            <EditableText
              value={displaySubtext}
              sectionKey={`${segmentKey}-subtext`}
              pageSlug={pageSlug}
              language={language}
              className="text-xl text-gray-600 mb-12 max-w-3xl text-center mx-auto whitespace-pre-line"
              as="p"
              multiline
              onUpdate={onContentUpdate}
              fieldLabel="Feature Overview Subtext"
            />
          ) : (
            subtext && (
              <p className="text-xl text-gray-600 mb-12 max-w-3xl text-center mx-auto whitespace-pre-line">
                {subtext}
              </p>
            )
          )
        )}
        
        <div className="space-y-12">
          {groupedItems.map((rowItems, rowIndex) => (
            <div key={rowIndex} className={`grid ${getGridColumns()} gap-8`}>
              {rowItems.map((item, itemIndex) => {
                const globalIndex = getGlobalIndex(rowIndex, itemIndex);
                return (
                  <div key={itemIndex} className="text-center relative group">
                    {isEditing && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteItem(globalIndex)}
                        className="absolute -top-2 -right-2 text-red-500 hover:text-red-700 hover:bg-red-50 p-1 h-auto opacity-0 group-hover:opacity-100 transition-opacity z-10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                    
                    {isEditing ? (
                      <>
                        <input
                          type="text"
                          value={item.title}
                          onChange={(e) => handleItemChange(globalIndex, 'title', e.target.value)}
                          className="text-xl font-bold text-gray-800 mb-4 w-full text-center bg-transparent border-b border-dashed border-gray-300 focus:border-[#f9dc24] outline-none py-1 hover:bg-[#f9dc24]/10 transition-colors"
                          placeholder="Feature title..."
                        />
                        <textarea
                          value={item.description}
                          onChange={(e) => handleItemChange(globalIndex, 'description', e.target.value)}
                          className="text-gray-600 leading-relaxed w-full text-center bg-transparent border border-dashed border-gray-300 focus:border-[#f9dc24] outline-none p-2 hover:bg-[#f9dc24]/10 transition-colors resize-none min-h-[80px]"
                          placeholder="Feature description..."
                        />
                      </>
                    ) : (
                      <>
                        {item.title && (
                          <h3 className="text-xl font-bold text-gray-800 mb-4">
                            {item.title}
                          </h3>
                        )}
                        {item.description && (
                          <div 
                            className="text-gray-600 leading-relaxed whitespace-pre-line [&_a]:inline-block [&_a]:font-semibold [&_a]:text-[#2D2D2D] [&_a]:underline [&_a]:decoration-2 [&_a]:bg-[#f9dc24]/60 [&_a]:px-2 [&_a]:py-0.5 [&_a]:rounded [&_a]:hover:bg-[#f9dc24]/90 [&_a]:transition-colors"
                            dangerouslySetInnerHTML={{ __html: item.description }}
                          />
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
          
          {isEditing && (
            <div className="flex justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddItem}
                className="text-gray-600 hover:text-gray-800 border-dashed"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Feature Item
              </Button>
            </div>
          )}
        </div>

        {/* Save/Cancel buttons */}
        {isEditing && hasChanges && (
          <div className="mt-8 flex justify-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancel}
              disabled={isSaving}
              className="text-gray-600"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={isSaving}
              className="bg-[#f9dc24] hover:bg-[#f9dc24]/90 text-black"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};

export default FeatureOverview;
