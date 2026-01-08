import { useFrontendEditOptional } from '@/contexts/FrontendEditContext';
import { useSegmentEdit } from '@/components/frontend-edit/EditableSegment';
import { EditableText } from '@/components/frontend-edit/EditableText';
import { EditableRichText } from '@/components/frontend-edit/EditableRichText';
import { Plus, Trash2, Save, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { transformHtmlWithLinkIcons } from '@/components/ui/RichTextRenderer';

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
  // isEditing is true if segment editing is active OR if global edit mode is enabled
  const isEditing = segmentEdit?.isSegmentEditing || editContext?.isEditMode || false;
  const canEdit = editContext?.canEdit || false;
  
  // Local state for rows editing
  const [localRows, setLocalRows] = useState<SpecificationRow[]>(rows);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Ref to track changes for prop sync protection
  const hasChangesRef = useRef(hasChanges);
  useEffect(() => { hasChangesRef.current = hasChanges; }, [hasChanges]);
  
  // Sync local rows with props - BUT ONLY if there are no pending changes!
  useEffect(() => {
    if (!hasChangesRef.current) {
      setLocalRows(rows);
    }
  }, [rows]);
  
  // Enable save button when entering edit mode
  useEffect(() => {
    if (isEditing) {
      setHasChanges(true);
    }
  }, [isEditing]);
  
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

      // Save with updated_by
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
    <section id={id} className="pt-[20px] pb-20 bg-light-muted">
      <div className="container mx-auto px-6">
        <div className="max-w-7xl mx-auto bg-light-card rounded-xl shadow-lg border border-light-border p-10 hover:shadow-xl transition-shadow duration-300">
          {(displayTitle || isEditing) && (
            isEditing ? (
              <EditableText
                value={displayTitle}
                sectionKey={`${segmentKey}-title`}
                pageSlug={pageSlug}
                language={language}
                className="text-2xl font-semibold text-light-foreground mb-6"
                as="h2"
                onUpdate={onContentUpdate}
                fieldLabel="Specification Title"
              />
            ) : (
              title && <h2 className="text-2xl font-semibold text-light-foreground mb-6">{title}</h2>
            )
          )}
          
          {(localRows.length > 0 || isEditing) ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-light-border">
                    <th className="text-left py-3 px-4 font-semibold text-light-foreground">Specification</th>
                    <th className="text-left py-3 px-4 font-semibold text-light-foreground">Value</th>
                    {isEditing && <th className="w-12"></th>}
                  </tr>
                </thead>
                <tbody>
                  {localRows.map((row, index) => (
                    <tr 
                      key={index} 
                      className={index !== localRows.length - 1 ? "border-b border-light-border/50" : ""}
                    >
                      <td className="py-3 px-4 text-light-muted-foreground whitespace-pre-line">
                        {isEditing ? (
                          <input
                            type="text"
                            value={row.specification}
                            onChange={(e) => handleRowChange(index, 'specification', e.target.value)}
                            className="w-full bg-transparent border-b border-dashed border-light-border focus:border-yellow outline-none py-1 hover:bg-yellow/10 transition-colors"
                            placeholder="Specification name..."
                          />
                        ) : (
                          row.specification
                        )}
                      </td>
                      <td className="py-3 px-4 text-light-muted-foreground whitespace-pre-line">
                        {isEditing ? (
                          <input
                            type="text"
                            value={row.value}
                            onChange={(e) => handleRowChange(index, 'value', e.target.value)}
                            className="w-full bg-transparent border-b border-dashed border-light-border focus:border-yellow outline-none py-1 hover:bg-yellow/10 transition-colors"
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
                            className="text-destructive hover:text-destructive hover:bg-destructive/10 p-1 h-auto"
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
                    className="bg-light-dark text-light-dark-foreground hover:bg-light-dark/90 hover:text-light-dark-foreground border-light-dark"
                  >
                    <Plus className="h-4 w-4 mr-2 text-light-dark-foreground" />
                    Add Row
                  </Button>
                </div>
              )}
            </div>
          ) : (
            !isEditing && <p className="text-light-muted-foreground">No specifications available.</p>
          )}
          
          {/* Description/Links section - renders HTML content including internal links */}
          {(description || isEditing) && (
            <div className="mt-6 pt-6 border-t border-light-border">
              {isEditing ? (
                <EditableRichText
                  value={description || ''}
                  sectionKey={`${segmentKey}-description`}
                  pageSlug={pageSlug}
                  language={language}
                  className="text-light-muted-foreground [&_a]:inline-block [&_a]:font-semibold [&_a]:text-light-foreground [&_a]:underline [&_a]:decoration-2 [&_a]:bg-yellow/60 [&_a]:px-2 [&_a]:py-0.5 [&_a]:rounded [&_a]:hover:bg-yellow/90 [&_a]:transition-colors"
                  onUpdate={onContentUpdate}
                  fieldLabel="Specification Description"
                />
              ) : (
                <div 
                  className="text-light-muted-foreground [&_a]:text-primary [&_a]:underline hover:[&_a]:text-primary/80"
                  dangerouslySetInnerHTML={{ __html: transformHtmlWithLinkIcons(description || '') }}
                />
              )}
            </div>
          )}

          {/* Save/Cancel buttons - always visible in edit mode */}
          {isEditing && (
            <div className="mt-6 pt-4 border-t border-light-border flex justify-end gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
                disabled={isSaving}
                className="bg-light-dark text-yellow hover:bg-light-dark/90 border-light-dark"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={isSaving}
                className="bg-yellow text-light-dark hover:bg-yellow/90"
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : null}
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
