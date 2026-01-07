import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useFrontendEditOptional } from '@/contexts/FrontendEditContext';
import { useSegmentEdit } from '@/components/frontend-edit/EditableSegment';
import { EditableText } from '@/components/frontend-edit/EditableText';
import { Plus, Trash2, Save, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQProps {
  id?: string;
  title?: string;
  subtext?: string;
  items?: FAQItem[];
  segmentKey?: string;
  pageSlug?: string;
  language?: string;
  onContentUpdate?: () => void;
}

const FAQ: React.FC<FAQProps> = ({
  id,
  title = '',
  subtext = '',
  items = [],
  segmentKey = '',
  pageSlug = '',
  language = 'en',
  onContentUpdate
}) => {
  const editContext = useFrontendEditOptional();
  const segmentEdit = useSegmentEdit();
  // isEditing is true if segment editing is active OR if global edit mode is enabled
  const isEditing = segmentEdit?.isSegmentEditing || editContext?.isEditMode || false;
  const canEdit = editContext?.canEdit || false;

  // Local state for items editing
  const [localItems, setLocalItems] = useState<FAQItem[]>(items);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Refs for auto-save on navigation
  const localItemsRef = useRef(localItems);
  const hasChangesRef = useRef(hasChanges);
  const saveInProgressRef = useRef(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Keep refs in sync
  useEffect(() => { localItemsRef.current = localItems; }, [localItems]);
  useEffect(() => { hasChangesRef.current = hasChanges; }, [hasChanges]);

  // Sync local items with props - BUT ONLY if there are no pending changes!
  useEffect(() => {
    if (!hasChangesRef.current) {
      setLocalItems(items);
    }
  }, [items]);

  // Auto-save when leaving edit mode
  useEffect(() => {
    if (!isEditing && hasChanges && localItems.length > 0) {
      // Save when edit mode is deactivated
      const autoSave = async () => {
        try {
          const { data: pageSegmentsData, error: loadError } = await supabase
            .from('page_content')
            .select('id, content_value')
            .eq('page_slug', pageSlug)
            .eq('section_key', 'page_segments')
            .eq('language', language)
            .maybeSingle();

          if (loadError || !pageSegmentsData) return;

          let segments: any[] = [];
          try {
            segments = JSON.parse(pageSegmentsData.content_value || '[]');
          } catch (e) {
            return;
          }

          const segmentIndex = segments.findIndex((seg: any) => {
            const segId = String(seg.id || seg.segmentId || seg.segment_id || '');
            return segId === segmentKey;
          });

          if (segmentIndex === -1) return;

          if (!segments[segmentIndex].data) {
            segments[segmentIndex].data = {};
          }
          segments[segmentIndex].data.items = localItems;

          const { data: { user } } = await supabase.auth.getUser();
          await supabase
            .from('page_content')
            .update({
              content_value: JSON.stringify(segments),
              updated_at: new Date().toISOString(),
              updated_by: user?.id
            })
            .eq('id', pageSegmentsData.id);

          setHasChanges(false);
          onContentUpdate?.();
        } catch (error) {
          console.error('[FAQ] Auto-save error:', error);
        }
      };
      autoSave();
    }
  }, [isEditing, hasChanges, localItems, pageSlug, language, segmentKey, onContentUpdate]);

  const displayTitle = title || (isEditing ? '[Click to add title]' : '');
  const displaySubtext = subtext || (isEditing ? '[Click to add subtext]' : '');

  // Hide if no content and not editing
  if (!title && !subtext && localItems.length === 0 && !isEditing) {
    return null;
  }

  // Generate Schema.org FAQPage JSON-LD
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": localItems
      .filter(item => item.question && item.answer)
      .map(item => ({
        "@type": "Question",
        "name": item.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": item.answer
        }
      }))
  };

  const handleItemChange = (index: number, field: 'question' | 'answer', newValue: string) => {
    const updatedItems = [...localItems];
    updatedItems[index] = { ...updatedItems[index], [field]: newValue };
    setLocalItems(updatedItems);
    setHasChanges(true);
  };

  const handleAddItem = () => {
    setLocalItems([...localItems, { question: '', answer: '' }]);
    setHasChanges(true);
  };

  const handleDeleteItem = (index: number) => {
    const updatedItems = localItems.filter((_, i) => i !== index);
    setLocalItems(updatedItems);
    setHasChanges(true);
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
        console.error('[FAQ] Error loading page_segments:', loadError);
        toast.error('Error loading content');
        setIsSaving(false);
        return;
      }

      if (!pageSegmentsData) {
        console.error('[FAQ] page_segments not found');
        toast.error('Content not found');
        setIsSaving(false);
        return;
      }

      // Parse segments
      let segments: any[] = [];
      try {
        segments = JSON.parse(pageSegmentsData.content_value || '[]');
      } catch (e) {
        console.error('[FAQ] Error parsing page_segments:', e);
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
        console.error('[FAQ] Segment not found:', segmentKey);
        toast.error('Segment not found');
        setIsSaving(false);
        return;
      }

      // Update items in segment data
      if (!segments[segmentIndex].data) {
        segments[segmentIndex].data = {};
      }
      segments[segmentIndex].data.items = localItems;

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
        console.error('[FAQ] Error saving:', updateError);
        toast.error('Error saving');
        setIsSaving(false);
        return;
      }

      toast.success('FAQ items saved!');
      setHasChanges(false);
      onContentUpdate?.();
    } catch (error) {
      console.error('[FAQ] Save error:', error);
      toast.error('Error saving');
    } finally {
      setIsSaving(false);
    }
  }, [hasChanges, localItems, pageSlug, language, segmentKey, onContentUpdate]);

  // AUTO-SAVE: Core save function
  const performAutoSave = useCallback(async (): Promise<boolean> => {
    if (!hasChangesRef.current || saveInProgressRef.current) return false;
    
    saveInProgressRef.current = true;
    console.log('[FAQ] Auto-saving...');
    
    try {
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
        return segId === segmentKey;
      });

      if (segmentIndex === -1) {
        return false;
      }

      if (!segments[segmentIndex].data) {
        segments[segmentIndex].data = {};
      }
      segments[segmentIndex].data.items = localItemsRef.current;

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
        console.log('[FAQ] Auto-saved successfully');
        toast.success('Auto-saved', { duration: 2000, description: 'FAQ' });
        hasChangesRef.current = false;
        setHasChanges(false);
        return true;
      }
      return false;
    } catch (e) {
      console.error('[FAQ] Auto-save error:', e);
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
        
        console.log('[FAQ] Blocking navigation to save first...');
        
        // Save first, then navigate
        await performAutoSave();
        
        // Now navigate
        console.log('[FAQ] Save complete, navigating to:', link.href);
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
        console.log('[FAQ] Immediate auto-save triggered (1s after change)...');
        await performAutoSave();
      }
    }, 1000); // 1 second after change

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [isEditing, hasChanges, localItems, performAutoSave]);

  // CRITICAL: Save when tab loses focus (user switches tabs or minimizes)
  useEffect(() => {
    if (!isEditing) return;

    const handleVisibilityChange = () => {
      if (document.hidden && hasChangesRef.current && !saveInProgressRef.current) {
        console.log('[FAQ] Saving on tab hidden...');
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
        console.log('[FAQ] Saving on beforeunload...');
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
        console.log('[FAQ] Saving on unmount...');
        performAutoSave();
      }
    };
  }, [performAutoSave]);

  return (
    <section id={id} className="pt-[50px] pb-16 bg-background">
      {localItems.length > 0 && !isEditing && (
        <script 
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
        />
      )}
      <div className="container mx-auto px-4">
        {(displayTitle || isEditing) && (
          isEditing ? (
            <EditableText
              value={displayTitle}
              sectionKey={`${segmentKey}-title`}
              pageSlug={pageSlug}
              language={language}
              className={`text-3xl font-bold text-foreground text-center ${displaySubtext || isEditing ? 'mb-4' : 'mb-12'}`}
              as="h2"
              onUpdate={onContentUpdate}
              fieldLabel="FAQ Title"
            />
          ) : (
            title && (
              <h2 className={`text-3xl font-bold text-foreground text-center ${subtext ? 'mb-4' : 'mb-12'}`}>
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
              className="text-xl text-muted-foreground mb-12 max-w-3xl text-center mx-auto whitespace-pre-line"
              as="p"
              multiline
              onUpdate={onContentUpdate}
              fieldLabel="FAQ Subtext"
            />
          ) : (
            subtext && (
              <p className="text-xl text-muted-foreground mb-12 max-w-3xl text-center mx-auto whitespace-pre-line">
                {subtext}
              </p>
            )
          )
        )}
        
        {(localItems.length > 0 || isEditing) && (
          <div className="max-w-3xl mx-auto">
            {isEditing ? (
              // Edit mode: Show editable list
              <div className="space-y-4">
                {localItems.map((item, index) => (
                  <div 
                    key={index} 
                    className="border border-border rounded-lg p-4 bg-card relative group"
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteItem(index)}
                      className="absolute top-2 right-2 text-red-500 hover:text-red-700 hover:bg-red-50 p-1 h-auto opacity-0 group-hover:opacity-100 transition-opacity z-10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    
                    <div className="space-y-3 pr-8">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground mb-1 block">Question</label>
                        <input
                          type="text"
                          value={item.question}
                          onChange={(e) => handleItemChange(index, 'question', e.target.value)}
                          className="w-full bg-transparent border-b border-dashed border-gray-300 focus:border-[#f9dc24] outline-none py-2 text-lg font-semibold hover:bg-[#f9dc24]/10 transition-colors"
                          placeholder="Enter question..."
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground mb-1 block">Answer</label>
                        <textarea
                          value={item.answer}
                          onChange={(e) => handleItemChange(index, 'answer', e.target.value)}
                          className="w-full bg-transparent border border-dashed border-gray-300 focus:border-[#f9dc24] outline-none p-2 text-base hover:bg-[#f9dc24]/10 transition-colors resize-none min-h-[100px] rounded"
                          placeholder="Enter answer..."
                        />
                      </div>
                    </div>
                  </div>
                ))}
                
                <div className="flex justify-center pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddItem}
                    className="bg-[#000000] text-white hover:bg-[#1a1a1a] hover:text-white border-[#000000]"
                  >
                    <Plus className="h-4 w-4 mr-2 text-white" />
                    Add FAQ Item
                  </Button>
                </div>
              </div>
            ) : (
              // View mode: Show accordion
              <Accordion type="single" collapsible className="space-y-4">
                {localItems.map((item, index) => (
                  item.question && item.answer && (
                    <AccordionItem 
                      key={index} 
                      value={`item-${index}`}
                      className="border border-border rounded-lg px-6 bg-card"
                    >
                      <AccordionTrigger className="text-left font-semibold text-foreground hover:no-underline py-4 text-lg">
                        {item.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-foreground pb-4 pt-2 text-lg font-light whitespace-pre-line">
                        {item.answer}
                      </AccordionContent>
                    </AccordionItem>
                  )
                ))}
              </Accordion>
            )}
          </div>
        )}

        {/* Save/Cancel buttons - always visible in edit mode */}
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
    </section>
  );
};

export default FAQ;
