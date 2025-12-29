import { useFrontendEditOptional } from '@/contexts/FrontendEditContext';
import { useSegmentEdit } from '@/components/frontend-edit/EditableSegment';
import { EditableText } from '@/components/frontend-edit/EditableText';
import { Plus, Trash2, Save, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SpecificationRow {
  specification: string;
  value: string;
}

interface SpecificationProps {
  id: string;
  title?: string;
  rows?: SpecificationRow[];
  description?: string;
  segmentKey?: string;
  pageSlug?: string;
  language?: string;
  onContentUpdate?: () => void;
}

const Specification = ({ 
  id, 
  title = "", 
  rows = [], 
  description,
  segmentKey = '',
  pageSlug = '',
  language = 'en',
  onContentUpdate
}: SpecificationProps) => {
  const editContext = useFrontendEditOptional();
  const segmentEdit = useSegmentEdit();
  const isEditing = segmentEdit?.isSegmentEditing || (editContext?.isEditMode && editContext?.canEdit) || false;
  
  // Local state for rows editing
  const [localRows, setLocalRows] = useState<SpecificationRow[]>(rows);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Sync local rows with props and reset hasChanges
  useEffect(() => {
    setLocalRows(rows);
    setHasChanges(false);
  }, [rows]);
  
  // Show placeholder in edit mode, hide completely if no content and not editing
  const displayTitle = title || (isEditing ? '[Click to add title]' : '');
  
  if (!title && localRows.length === 0 && !description && !isEditing) {
    return null;
  }

  const handleRowChange = (index: number, field: 'specification' | 'value', newValue: string) => {
    const updatedRows = [...localRows];
    updatedRows[index] = { ...updatedRows[index], [field]: newValue };
    setLocalRows(updatedRows);
    setHasChanges(true);
  };

  const handleAddRow = () => {
    setLocalRows([...localRows, { specification: '', value: '' }]);
    setHasChanges(true);
  };

  const handleDeleteRow = (index: number) => {
    const updatedRows = localRows.filter((_, i) => i !== index);
    setLocalRows(updatedRows);
    setHasChanges(true);
  };

  const handleCancel = () => {
    setLocalRows(rows);
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
        console.error('[Specification] Error loading page_segments:', loadError);
        toast.error('Error loading content');
        setIsSaving(false);
        return;
      }

      if (!pageSegmentsData) {
        console.error('[Specification] page_segments not found');
        toast.error('Content not found');
        setIsSaving(false);
        return;
      }

      // Parse segments
      let segments: any[] = [];
      try {
        segments = JSON.parse(pageSegmentsData.content_value || '[]');
      } catch (e) {
        console.error('[Specification] Error parsing page_segments:', e);
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
        console.error('[Specification] Segment not found:', segmentKey);
        toast.error('Segment not found');
        setIsSaving(false);
        return;
      }

      // Update rows in segment data
      if (!segments[segmentIndex].data) {
        segments[segmentIndex].data = {};
      }
      segments[segmentIndex].data.rows = localRows;

      // Save
      const { error: updateError } = await supabase
        .from('page_content')
        .update({
          content_value: JSON.stringify(segments),
          updated_at: new Date().toISOString()
        })
        .eq('id', pageSegmentsData.id);

      if (updateError) {
        console.error('[Specification] Error saving:', updateError);
        toast.error('Error saving');
        setIsSaving(false);
        return;
      }

      toast.success('Specifications saved!');
      setHasChanges(false);
      onContentUpdate?.();
    } catch (error) {
      console.error('[Specification] Save error:', error);
      toast.error('Error saving');
    } finally {
      setIsSaving(false);
    }
  }, [hasChanges, localRows, pageSlug, language, segmentKey, onContentUpdate]);

  return (
    <section id={id} className="pt-[20px] pb-20 bg-gray-50">
      <div className="container mx-auto px-6">
        <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-lg border border-gray-100 p-10 hover:shadow-xl transition-shadow duration-300">
          {(displayTitle || isEditing) && (
            isEditing ? (
              <EditableText
                value={displayTitle}
                sectionKey={`${segmentKey}-title`}
                pageSlug={pageSlug}
                language={language}
                className="text-2xl font-semibold text-[#2D2D2D] mb-6"
                as="h2"
                onUpdate={onContentUpdate}
                fieldLabel="Specification Title"
              />
            ) : (
              title && <h2 className="text-2xl font-semibold text-[#2D2D2D] mb-6">{title}</h2>
            )
          )}
          
          {(localRows.length > 0 || isEditing) ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-[#2D2D2D]">Specification</th>
                    <th className="text-left py-3 px-4 font-semibold text-[#2D2D2D]">Value</th>
                    {isEditing && <th className="w-12"></th>}
                  </tr>
                </thead>
                <tbody>
                  {localRows.map((row, index) => (
                    <tr 
                      key={index} 
                      className={index !== localRows.length - 1 ? "border-b border-gray-100" : ""}
                    >
                      <td className="py-3 px-4 text-[#555] whitespace-pre-line">
                        {isEditing ? (
                          <input
                            type="text"
                            value={row.specification}
                            onChange={(e) => handleRowChange(index, 'specification', e.target.value)}
                            className="w-full bg-transparent border-b border-dashed border-gray-300 focus:border-[#f9dc24] outline-none py-1 hover:bg-[#f9dc24]/10 transition-colors"
                            placeholder="Specification name..."
                          />
                        ) : (
                          row.specification
                        )}
                      </td>
                      <td className="py-3 px-4 text-[#555] whitespace-pre-line">
                        {isEditing ? (
                          <input
                            type="text"
                            value={row.value}
                            onChange={(e) => handleRowChange(index, 'value', e.target.value)}
                            className="w-full bg-transparent border-b border-dashed border-gray-300 focus:border-[#f9dc24] outline-none py-1 hover:bg-[#f9dc24]/10 transition-colors"
                            placeholder="Value..."
                          />
                        ) : (
                          row.value
                        )}
                      </td>
                      {isEditing && (
                        <td className="py-3 px-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteRow(index)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 h-auto"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {isEditing && (
                <div className="mt-4 flex justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddRow}
                    className="text-gray-600 hover:text-gray-800 border-dashed"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Row
                  </Button>
                </div>
              )}
            </div>
          ) : (
            !isEditing && <p className="text-gray-500">No specifications available.</p>
          )}
          
          {/* Description/Links section - renders HTML content including internal links */}
          {(description || isEditing) && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              {isEditing ? (
                <EditableText
                  value={description || '[Click to add description/links]'}
                  sectionKey={`${segmentKey}-description`}
                  pageSlug={pageSlug}
                  language={language}
                  className="text-[#555] [&_a]:inline-block [&_a]:font-semibold [&_a]:text-[#2D2D2D] [&_a]:underline [&_a]:decoration-2 [&_a]:bg-[#f9dc24]/60 [&_a]:px-2 [&_a]:py-0.5 [&_a]:rounded [&_a]:hover:bg-[#f9dc24]/90 [&_a]:transition-colors"
                  as="div"
                  multiline
                  onUpdate={onContentUpdate}
                  fieldLabel="Specification Description"
                />
              ) : (
                <div 
                  className="text-[#555] [&_a]:inline-block [&_a]:font-semibold [&_a]:text-[#2D2D2D] [&_a]:underline [&_a]:decoration-2 [&_a]:bg-[#f9dc24]/60 [&_a]:px-2 [&_a]:py-0.5 [&_a]:rounded [&_a]:hover:bg-[#f9dc24]/90 [&_a]:transition-colors"
                  dangerouslySetInnerHTML={{ __html: description || '' }}
                />
              )}
            </div>
          )}

          {/* Save/Cancel buttons */}
          {isEditing && hasChanges && (
            <div className="mt-6 pt-4 border-t border-gray-200 flex justify-end gap-3">
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
      </div>
    </section>
  );
};

export default Specification;
