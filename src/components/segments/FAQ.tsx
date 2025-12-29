import React, { useState, useEffect, useCallback } from 'react';
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
  const isEditing = segmentEdit?.isSegmentEditing || (editContext?.isEditMode && editContext?.canEdit) || false;

  // Local state for items editing
  const [localItems, setLocalItems] = useState<FAQItem[]>(items);
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

      // Save
      const { error: updateError } = await supabase
        .from('page_content')
        .update({
          content_value: JSON.stringify(segments),
          updated_at: new Date().toISOString()
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
                    className="text-gray-600 hover:text-gray-800 border-dashed"
                  >
                    <Plus className="h-4 w-4 mr-2" />
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

export default FAQ;
