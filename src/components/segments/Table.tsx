import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useFrontendEditOptional } from '@/contexts/FrontendEditContext';
import { useSegmentEdit } from '@/components/frontend-edit/EditableSegment';
import { EditableText } from '@/components/frontend-edit/EditableText';
import { EditableRichText } from '@/components/frontend-edit/EditableRichText';
import { Plus, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { transformHtmlWithLinkIcons } from '@/components/ui/RichTextRenderer';

interface TableProps {
  id: string;
  title?: string;
  subtext?: string;
  headers?: string[];
  columns?: string[]; // Alternative field name from Content Automation
  rows?: string[][];
  segmentKey?: string;
  pageSlug?: string;
  language?: string;
  onContentUpdate?: () => void;
}

const Table = ({ 
  id, 
  title = '', 
  subtext = '', 
  headers = [], 
  columns = [], // Alternative field name
  rows = [],
  segmentKey = '',
  pageSlug = '',
  language = 'en',
  onContentUpdate
}: TableProps) => {
  // Use headers if available, otherwise fall back to columns
  const effectiveHeaders = headers.length > 0 ? headers : columns;
  const editContext = useFrontendEditOptional();
  const segmentEdit = useSegmentEdit();
  const isEditing = segmentEdit?.isSegmentEditing || editContext?.isEditMode || false;

  // Local state for editing
  const [localHeaders, setLocalHeaders] = useState<string[]>(effectiveHeaders);
  const [localRows, setLocalRows] = useState<string[][]>(rows);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Ref to track changes for prop sync protection
  const hasChangesRef = useRef(hasChanges);
  useEffect(() => { hasChangesRef.current = hasChanges; }, [hasChanges]);

  // Sync local state with props - BUT ONLY if there are no pending changes!
  useEffect(() => {
    if (!hasChangesRef.current) {
      setLocalHeaders(effectiveHeaders);
    }
  }, [effectiveHeaders]);

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

  const displayTitle = title || (isEditing ? '[Click to add table title]' : '');
  const displaySubtext = subtext || (isEditing ? '[Click to add description]' : '');

  // Hide if no content and not editing
  if (!title && !subtext && localHeaders.length === 0 && localRows.length === 0 && !isEditing) {
    return null;
  }

  const columnCount = localHeaders.length || 1;

  // Header management
  const handleHeaderChange = (index: number, value: string) => {
    const updated = [...localHeaders];
    updated[index] = value;
    setLocalHeaders(updated);
    setHasChanges(true);
  };

  const handleAddColumn = () => {
    setLocalHeaders([...localHeaders, '']);
    // Add empty cell to each row
    setLocalRows(localRows.map(row => [...row, '']));
    setHasChanges(true);
  };

  const handleDeleteColumn = (colIndex: number) => {
    if (localHeaders.length <= 1) {
      toast.error('Table must have at least one column');
      return;
    }
    setLocalHeaders(localHeaders.filter((_, i) => i !== colIndex));
    setLocalRows(localRows.map(row => row.filter((_, i) => i !== colIndex)));
    setHasChanges(true);
  };

  // Row management
  const handleCellChange = (rowIndex: number, cellIndex: number, value: string) => {
    const updated = [...localRows];
    updated[rowIndex] = [...updated[rowIndex]];
    updated[rowIndex][cellIndex] = value;
    setLocalRows(updated);
    setHasChanges(true);
  };

  const handleAddRow = () => {
    const newRow = new Array(localHeaders.length).fill('');
    setLocalRows([...localRows, newRow]);
    setHasChanges(true);
  };

  const handleDeleteRow = (rowIndex: number) => {
    setLocalRows(localRows.filter((_, i) => i !== rowIndex));
    setHasChanges(true);
  };

  const handleCancel = () => {
    setLocalHeaders(headers);
    setLocalRows(rows);
    setHasChanges(false);
  };

  const handleSave = useCallback(async () => {
    if (!hasChanges) return;
    
    setIsSaving(true);
    
    try {
      const { data: pageSegmentsData, error: loadError } = await supabase
        .from('page_content')
        .select('id, content_value')
        .eq('page_slug', pageSlug)
        .eq('section_key', 'page_segments')
        .eq('language', language)
        .maybeSingle();

      if (loadError) {
        console.error('[Table] Error loading page_segments:', loadError);
        toast.error('Error loading content');
        setIsSaving(false);
        return;
      }

      if (!pageSegmentsData) {
        console.error('[Table] page_segments not found');
        toast.error('Content not found');
        setIsSaving(false);
        return;
      }

      let segments: any[] = [];
      try {
        segments = JSON.parse(pageSegmentsData.content_value || '[]');
      } catch (e) {
        console.error('[Table] Error parsing page_segments:', e);
        toast.error('Error parsing content');
        setIsSaving(false);
        return;
      }

      const segmentIndex = segments.findIndex((seg: any) => {
        const segId = String(seg.id || seg.segmentId || seg.segment_id || '');
        return segId === segmentKey;
      });

      if (segmentIndex === -1) {
        console.error('[Table] Segment not found:', segmentKey);
        toast.error('Segment not found');
        setIsSaving(false);
        return;
      }

      if (!segments[segmentIndex].data) {
        segments[segmentIndex].data = {};
      }
      segments[segmentIndex].data.headers = localHeaders;
      segments[segmentIndex].data.rows = localRows;

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
        console.error('[Table] Error saving:', updateError);
        toast.error('Error saving');
        setIsSaving(false);
        return;
      }

      toast.success('Table saved!');
      setHasChanges(false);
      onContentUpdate?.();
    } catch (error) {
      console.error('[Table] Save error:', error);
      toast.error('Error saving');
    } finally {
      setIsSaving(false);
    }
  }, [hasChanges, localHeaders, localRows, pageSlug, language, segmentKey, onContentUpdate]);

  return (
    <section id={id} className="pt-8 pb-16 bg-[#F7F9FB] scroll-mt-[200px]">
      <div className="container mx-auto px-6">
        {/* Title & Subtext */}
        {(displayTitle || isEditing) && (
          <div className="text-center mb-8">
            {isEditing ? (
              <EditableText
                value={displayTitle}
                sectionKey={`${segmentKey}-title`}
                pageSlug={pageSlug}
                language={language}
                className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
                as="h2"
                onUpdate={onContentUpdate}
                fieldLabel="Table Title"
              />
            ) : (
              title && (
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  {title}
                </h2>
              )
            )}
            
            {(displaySubtext || isEditing) && (
              isEditing ? (
                <EditableRichText
                  value={displaySubtext}
                  sectionKey={`${segmentKey}-subtext`}
                  pageSlug={pageSlug}
                  language={language}
                  className="text-xl text-gray-600 max-w-2xl mx-auto"
                  onUpdate={onContentUpdate}
                  fieldLabel="Table Description"
                />
              ) : (
                subtext && (
                  <div 
                    className="text-xl text-gray-600 max-w-2xl mx-auto"
                    dangerouslySetInnerHTML={{ __html: transformHtmlWithLinkIcons(subtext) }}
                  />
                )
              )
            )}
          </div>
        )}

        <div className="max-w-7xl mx-auto">
          <div className="bg-gray-50 rounded-xl overflow-hidden shadow-soft">
            <div className="overflow-x-auto">
              {/* Header Row */}
              <div 
                className="grid min-w-[800px] text-brand-primary-foreground bg-brand-primary" 
                style={{ 
                  gridTemplateColumns: `repeat(${columnCount}, 1fr)${isEditing ? ' auto' : ''}`
                }}
              >
                {localHeaders.map((header, index) => (
                  <div 
                    key={index}
                    className={`p-4 text-center font-semibold text-lg relative group ${
                      index > 0 ? 'border-l border-brand-primary-hover' : ''
                    }`}
                  >
                    {isEditing ? (
                      <>
                        <input
                          type="text"
                          value={header}
                          onChange={(e) => handleHeaderChange(index, e.target.value)}
                          className="w-full text-center bg-transparent border-b-2 border-dashed border-brand-primary-hover focus:border-black outline-none py-1 font-semibold placeholder:text-brand-primary-hover/60"
                          placeholder="Column header..."
                        />
                        {localHeaders.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleDeleteColumn(index)}
                            className="absolute -top-1 -right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        )}
                      </>
                    ) : (
                      header
                    )}
                  </div>
                ))}
                {isEditing && (
                  <button
                    type="button"
                    onClick={handleAddColumn}
                    className="p-4 flex items-center justify-center hover:bg-brand-primary-hover transition-colors border-l border-brand-primary-hover"
                    title="Add column"
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                )}
              </div>
              
              {/* Data Rows */}
              <div className="divide-y divide-gray-200">
                {localRows.map((row, rowIndex) => (
                  <div 
                    key={rowIndex}
                    className={`grid min-w-[800px] group ${
                      rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                    }`}
                    style={{ gridTemplateColumns: `repeat(${columnCount}, 1fr)${isEditing ? ' auto' : ''}` }}
                  >
                    {row.map((cell, cellIndex) => (
                      <div 
                        key={cellIndex}
                        className={`p-6 ${
                          cellIndex === 0 
                            ? 'font-medium text-gray-900' 
                            : 'text-gray-800 text-sm leading-relaxed'
                        } ${
                          cellIndex < columnCount - 1 ? 'border-r border-gray-200' : ''
                        }`}
                      >
                        {isEditing ? (
                          <textarea
                            value={cell}
                            onChange={(e) => handleCellChange(rowIndex, cellIndex, e.target.value)}
                            className={`w-full bg-transparent border border-dashed border-gray-300 focus:border-brand-primary outline-none p-2 hover:bg-brand-primary/10 transition-colors resize-none min-h-[60px] ${
                              cellIndex === 0 ? 'font-medium' : 'text-sm'
                            }`}
                            placeholder="Cell content..."
                          />
                        ) : (
                          cell
                        )}
                      </div>
                    ))}
                    {isEditing && (
                      <div className="p-6 flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => handleDeleteRow(rowIndex)}
                          className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Delete row"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Add Row Button */}
          {isEditing && (
            <div className="flex justify-center mt-4">
              <button
                type="button"
                onClick={handleAddRow}
                className="inline-flex items-center px-4 py-2 text-sm font-medium bg-black text-white hover:bg-gray-900 border border-black rounded-md"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Row
              </button>
            </div>
          )}

          {/* Save/Cancel Buttons */}
          {isEditing && (
            <div className="mt-6 flex justify-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
                disabled={isSaving}
                className="bg-black text-brand-primary hover:bg-gray-900 border-black"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={isSaving}
                className="bg-brand-primary text-brand-primary-foreground hover:bg-brand-primary-hover"
              >
                {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Save
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Table;
