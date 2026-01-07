import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useFrontendEditOptional } from '@/contexts/FrontendEditContext';
import { useSegmentEdit } from './EditableSegment';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Button style options matching ProductHeroGallery
const buttonStyles = [
  { value: 'yellow', label: 'Yellow', color: '#f9dc24' },
  { value: 'black', label: 'Black', color: '#1f2937' },
  { value: 'outline-white', label: 'Transparent', color: '#ffffff' },
];

// Normalize style value - map different variations to canonical values
const normalizeStyle = (style: string): string => {
  if (style === 'technical' || style === 'black') return 'black';
  if (style === 'white' || style === 'outline-white') return 'outline-white';
  return style || 'yellow';
};

interface EditableButtonProps {
  text: string;
  link?: string;
  buttonStyle?: string; // 'yellow' | 'technical' | 'outline-white'
  sectionKey: string;
  pageSlug: string;
  language: string;
  textFieldName: string;
  linkFieldName: string;
  styleFieldName?: string; // e.g., 'button1Color' or 'cta1Style'
  className?: string;
  style?: React.CSSProperties;
  size?: 'default' | 'sm' | 'lg' | 'icon';
  onUpdate?: () => void;
  onClick?: () => void;
}

export const EditableButton: React.FC<EditableButtonProps> = ({
  text,
  link = '',
  buttonStyle: initialButtonStyle = 'yellow',
  sectionKey,
  pageSlug,
  language,
  textFieldName,
  linkFieldName,
  styleFieldName,
  className,
  style,
  size = 'lg',
  onUpdate,
  onClick
}) => {
  const editContext = useFrontendEditOptional();
  const segmentEdit = useSegmentEdit();
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(text);
  const [editLink, setEditLink] = useState(link);
  const [editStyle, setEditStyle] = useState(normalizeStyle(initialButtonStyle));
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedText, setLastSavedText] = useState(text);
  const [lastSavedLink, setLastSavedLink] = useState(link);
  const [lastSavedStyle, setLastSavedStyle] = useState(normalizeStyle(initialButtonStyle));
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const saveInProgressRef = useRef(false);

  // Track current values in refs for use in cleanup/unmount
  const editTextRef = useRef(editText);
  const editLinkRef = useRef(editLink);
  const editStyleRef = useRef(editStyle);
  const lastSavedTextRef = useRef(lastSavedText);
  const lastSavedLinkRef = useRef(lastSavedLink);
  const lastSavedStyleRef = useRef(lastSavedStyle);
  const isEditingRef = useRef(isEditing);

  // Keep refs in sync with state
  useEffect(() => { editTextRef.current = editText; }, [editText]);
  useEffect(() => { editLinkRef.current = editLink; }, [editLink]);
  useEffect(() => { editStyleRef.current = editStyle; }, [editStyle]);
  useEffect(() => { lastSavedTextRef.current = lastSavedText; }, [lastSavedText]);
  useEffect(() => { lastSavedLinkRef.current = lastSavedLink; }, [lastSavedLink]);
  useEffect(() => { lastSavedStyleRef.current = lastSavedStyle; }, [lastSavedStyle]);
  useEffect(() => { isEditingRef.current = isEditing; }, [isEditing]);

  const isSegmentEditing = segmentEdit?.isSegmentEditing || (editContext?.isEditMode && editContext?.canEdit) || false;

  // Core save function - defined early so it can be used in effects
  const performSave = useCallback(async (isAutoSave: boolean = false, textVal?: string, linkVal?: string, styleVal?: string): Promise<boolean> => {
    const currentText = textVal ?? editTextRef.current;
    const currentLink = linkVal ?? editLinkRef.current;
    const currentStyle = styleVal ?? editStyleRef.current;
    
    try {
      const segmentKey = sectionKey;
      const segmentKeyParts = segmentKey.split('-');
      const segmentId = segmentKeyParts[segmentKeyParts.length - 1];
      
      console.log('[EditableButton]', isAutoSave ? 'Auto-saving' : 'Saving', 'button for segmentKey:', segmentKey);

      let { data: pageSegmentsData, error: loadError } = await supabase
        .from('page_content')
        .select('id, content_value')
        .eq('page_slug', pageSlug)
        .eq('section_key', 'page_segments')
        .eq('language', language)
        .maybeSingle();

      if (loadError) {
        console.error('[EditableButton] Error loading page_segments:', loadError);
        return false;
      }

      if (pageSegmentsData) {
        let segments: any[] = [];
        try {
          segments = JSON.parse(pageSegmentsData.content_value || '[]');
        } catch (e) {
          console.error('[EditableButton] Error parsing page_segments:', e);
          return false;
        }

        const segmentIndex = segments.findIndex((seg: any) => {
          const segId = String(seg.id || seg.segmentId || seg.segment_id || '');
          return segId === segmentId || segmentKey === `${seg.type}-${segId}`;
        });

        if (segmentIndex === -1) {
          console.error('[EditableButton] Segment not found');
          return false;
        }

        if (!segments[segmentIndex].data) {
          segments[segmentIndex].data = {};
        }
        segments[segmentIndex].data[textFieldName] = currentText;
        segments[segmentIndex].data[linkFieldName] = currentLink;
        
        if (styleFieldName) {
          segments[segmentIndex].data[styleFieldName] = currentStyle;
        }

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
          console.error('[EditableButton] Error updating page_segments:', updateError);
          return false;
        }
        
        console.log('[EditableButton] Successfully saved to page_segments');
      } else {
        console.error('[EditableButton] page_segments not found');
        return false;
      }

      return true;
    } catch (error) {
      console.error('[EditableButton] Save error:', error);
      return false;
    }
  }, [pageSlug, sectionKey, language, textFieldName, linkFieldName, styleFieldName]);

  // Check if values changed since last save (using refs for reliability)
  const hasChangesRef = useCallback(() => {
    return editTextRef.current !== lastSavedTextRef.current || 
           editLinkRef.current !== lastSavedLinkRef.current || 
           editStyleRef.current !== lastSavedStyleRef.current;
  }, []);

  // Update values when props change
  useEffect(() => {
    setEditText(text);
    setEditLink(link);
    setEditStyle(normalizeStyle(initialButtonStyle));
    setLastSavedText(text);
    setLastSavedLink(link);
    setLastSavedStyle(normalizeStyle(initialButtonStyle));
    editTextRef.current = text;
    editLinkRef.current = link;
    editStyleRef.current = normalizeStyle(initialButtonStyle);
    lastSavedTextRef.current = text;
    lastSavedLinkRef.current = link;
    lastSavedStyleRef.current = normalizeStyle(initialButtonStyle);
  }, [text, link, initialButtonStyle]);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        handleCancel();
      }
    };

    if (isEditing) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isEditing]);

  // AUTO-SAVE: Trigger save every 5 seconds while editing if value changed
  useEffect(() => {
    if (!isEditing) {
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current);
        autoSaveTimerRef.current = null;
      }
      return;
    }

    autoSaveTimerRef.current = setInterval(async () => {
      if (hasChangesRef() && !saveInProgressRef.current) {
        console.log('[EditableButton] Auto-saving...');
        saveInProgressRef.current = true;
        
        try {
          const success = await performSave(true);
          if (success) {
            const currText = editTextRef.current;
            const currLink = editLinkRef.current;
            const currStyle = editStyleRef.current;
            setLastSavedText(currText);
            setLastSavedLink(currLink);
            setLastSavedStyle(currStyle);
            lastSavedTextRef.current = currText;
            lastSavedLinkRef.current = currLink;
            lastSavedStyleRef.current = currStyle;
            toast.success('Auto-saved', { 
              duration: 2000,
              description: 'Button'
            });
          }
        } catch (error) {
          console.error('[EditableButton] Auto-save error:', error);
        } finally {
          saveInProgressRef.current = false;
        }
      }
    }, 5000);

    return () => {
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current);
        autoSaveTimerRef.current = null;
      }
    };
  }, [isEditing, performSave, hasChangesRef]);

  // CRITICAL: Save on component unmount if there are unsaved changes
  useEffect(() => {
    return () => {
      if (isEditingRef.current && hasChangesRef() && !saveInProgressRef.current) {
        console.log('[EditableButton] Saving on unmount...');
        saveInProgressRef.current = true;
        performSave(true);
      }
    };
  }, [performSave, hasChangesRef]);

  // Save on editing mode exit
  const prevIsEditingRef = useRef(isEditing);
  useEffect(() => {
    if (prevIsEditingRef.current && !isEditing && hasChangesRef() && !saveInProgressRef.current) {
      console.log('[EditableButton] Saving on edit mode exit...');
      saveInProgressRef.current = true;
      performSave(true).then((success) => {
        if (success) {
          const currText = editTextRef.current;
          const currLink = editLinkRef.current;
          const currStyle = editStyleRef.current;
          setLastSavedText(currText);
          setLastSavedLink(currLink);
          setLastSavedStyle(currStyle);
          lastSavedTextRef.current = currText;
          lastSavedLinkRef.current = currLink;
          lastSavedStyleRef.current = currStyle;
          toast.success('Auto-saved', { duration: 2000, description: 'Button' });
        }
        saveInProgressRef.current = false;
      });
    }
    prevIsEditingRef.current = isEditing;
  }, [isEditing, performSave, hasChangesRef]);

  // BEFOREUNLOAD: Save on page leave
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isEditingRef.current && hasChangesRef()) {
        console.log('[EditableButton] Attempting save on page leave');
        performSave(true);
        e.preventDefault();
        e.returnValue = 'Unsaved changes will be lost';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [performSave, hasChangesRef]);

  // Get button style based on style value (matching ProductHeroGallery)
  const getComputedButtonStyle = (styleValue: string): React.CSSProperties => {
    const normalized = normalizeStyle(styleValue);
    switch (normalized) {
      case 'black':
        return { backgroundColor: '#1f2937', color: 'white' };
      case 'outline-white':
        return { backgroundColor: 'white', color: 'black', border: '1px solid #e5e5e5' };
      case 'yellow':
      default:
        return { backgroundColor: '#f9dc24', color: 'black' };
    }
  };

  // performSave is already defined above

  // Check if values changed (using state for UI)
  const hasChanges = useCallback(() => {
    return editText !== lastSavedText || editLink !== lastSavedLink || editStyle !== lastSavedStyle;
  }, [editText, editLink, editStyle, lastSavedText, lastSavedLink, lastSavedStyle]);

  // Manual save handler
  const handleSave = useCallback(async () => {
    if (editText === text && editLink === link && editStyle === normalizeStyle(initialButtonStyle)) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);

    try {
      const success = await performSave(false);
      if (success) {
        toast.success('Button saved!');
        setLastSavedText(editText);
        setLastSavedLink(editLink);
        setLastSavedStyle(editStyle);
        onUpdate?.();
        setIsEditing(false);
      } else {
        toast.error('Error saving');
      }
    } finally {
      setIsSaving(false);
    }
  }, [editText, editLink, editStyle, text, link, initialButtonStyle, performSave, onUpdate]);

  const handleCancel = useCallback(() => {
    setEditText(text);
    setEditLink(link);
    setEditStyle(normalizeStyle(initialButtonStyle));
    setIsEditing(false);
  }, [text, link, initialButtonStyle]);

  const handleClick = useCallback((e: React.MouseEvent) => {
    if (isSegmentEditing && editContext?.canEdit) {
      e.preventDefault();
      e.stopPropagation();
      setIsEditing(true);
    } else if (onClick) {
      onClick();
    }
  }, [isSegmentEditing, editContext?.canEdit, onClick]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleCancel();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      // Don't auto-save on Enter - user should click Save
    }
  }, [handleCancel]);

  // If not in edit mode, render normal button
  if (!isSegmentEditing) {
    return (
      <Button
        size={size}
        className={className}
        style={{ ...getComputedButtonStyle(initialButtonStyle), ...style }}
        onClick={onClick}
      >
        {text}
      </Button>
    );
  }

  // In edit mode but not currently editing - show button with hover effect
  if (!isEditing) {
    return (
      <div className="relative group inline-block">
        <div
          className={cn(
            className,
            "inline-flex items-center justify-center rounded-md cursor-pointer transition-all",
            "ring-2 ring-dashed ring-gray-400 hover:ring-[#f9dc24] hover:ring-solid",
            "px-8 py-4 text-lg font-medium"
          )}
          style={{ ...getComputedButtonStyle(initialButtonStyle), ...style }}
          onClick={handleClick}
          title="Click to edit"
        >
          {text || 'Button Text'}
        </div>
        {editContext?.canEdit && (
          <span 
            className="z-[200] opacity-0 group-hover:opacity-100 transition-opacity bg-black text-[#f9dc24] text-sm px-4 py-2 rounded-lg font-normal whitespace-nowrap pointer-events-none shadow-xl border border-[#f9dc24]"
            style={{
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%)',
              top: '-44px',
              letterSpacing: '0.05em',
              textAlign: 'center'
            }}
          >
            Click to edit button
          </span>
        )}
      </div>
    );
  }

  // Currently editing - inline text input + style/link editor below
  return (
    <div ref={containerRef} className="inline-block">
      {/* Inline editable button - type directly into it */}
      <input
        ref={inputRef}
        type="text"
        value={editText}
        onChange={(e) => setEditText(e.target.value)}
        onKeyDown={handleKeyDown}
        className={cn(
          className,
          "inline-flex items-center justify-center rounded-md",
          "ring-2 ring-[#f9dc24] bg-transparent border-none outline-none text-center",
          "px-8 py-4 text-lg font-medium"
        )}
        style={{ 
          ...getComputedButtonStyle(editStyle),
          ...style,
          minWidth: '140px'
        }}
        placeholder="Button text"
      />
      
      {/* Editor panel below - Style and Link only (text is edited inline above) */}
      <div 
        className="mt-3 bg-white p-4 rounded-lg border border-gray-300 shadow-2xl min-w-[280px] relative z-[100]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Style Selector - square buttons, active = larger */}
        <div className="flex gap-2 items-center mb-3">
          <span className="text-xs text-gray-600 w-10 font-medium">Style:</span>
          <div className="flex gap-2 items-end">
            {buttonStyles.map((s) => (
              <button
                key={s.value}
                type="button"
                onClick={() => setEditStyle(s.value)}
                className={cn(
                  "rounded transition-all border border-gray-400",
                  editStyle === s.value ? 'w-10 h-10 ring-2 ring-[#f9dc24]' : 'w-7 h-7 hover:w-8 hover:h-8'
                )}
                style={{ 
                  backgroundColor: s.color,
                  border: s.value === 'outline-white' ? '1px solid #ccc' : undefined
                }}
                title={s.label}
              />
            ))}
          </div>
        </div>
        
        {/* Link Editor */}
        <div className="flex gap-2 items-center mb-3">
          <span className="text-xs text-gray-600 w-10 font-medium">Link:</span>
          <input
            type="text"
            value={editLink}
            onChange={(e) => setEditLink(e.target.value)}
            onKeyDown={handleKeyDown}
            className="text-sm px-3 py-2 rounded flex-1 bg-gray-900 text-white border border-gray-600 placeholder:text-gray-400"
            placeholder="/page-url or https://..."
          />
        </div>
        
        {/* Save / Cancel Buttons */}
        <div className="flex gap-2">
          <Button
            type="button"
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 bg-[#f9dc24] hover:bg-[#e5c820] text-black font-medium"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Save'
            )}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={handleCancel}
            disabled={isSaving}
            className="flex-1"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};
