import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import { useFrontendEditOptional } from '@/contexts/FrontendEditContext';
import { useSegmentEdit } from './EditableSegment';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Check, X, Loader2, Bold, Italic, Underline as UnderlineIcon, List, ListOrdered, Link as LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LinkEditorDialog } from './LinkEditorDialog';
import { transformHtmlWithLinkIcons } from '@/components/ui/RichTextRenderer';

interface EditableRichTextProps {
  value: string;
  sectionKey: string;
  pageSlug: string;
  language: string;
  className?: string;
  onUpdate?: (newValue: string) => void;
  fieldLabel?: string;
}

export const EditableRichText: React.FC<EditableRichTextProps> = ({
  value,
  sectionKey,
  pageSlug,
  language,
  className,
  onUpdate,
  fieldLabel
}) => {
  const editContext = useFrontendEditOptional();
  const segmentEdit = useSegmentEdit();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedValue, setLastSavedValue] = useState(value);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [currentLinkUrl, setCurrentLinkUrl] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const saveInProgressRef = useRef(false);
  // Track current values in refs for use in cleanup/unmount
  const editValueRef = useRef(editValue);
  const lastSavedValueRef = useRef(lastSavedValue);
  const isEditingRef = useRef(isEditing);

  // Keep refs in sync with state
  useEffect(() => { editValueRef.current = editValue; }, [editValue]);
  useEffect(() => { lastSavedValueRef.current = lastSavedValue; }, [lastSavedValue]);
  useEffect(() => { isEditingRef.current = isEditing; }, [isEditing]);

  const isSegmentEditing = segmentEdit?.isSegmentEditing || (editContext?.isEditMode && editContext?.canEdit) || false;

  // Core save function - defined early so it can be used in effects
  const performSave = useCallback(async (valueToSave: string, isAutoSave: boolean = false): Promise<boolean> => {
    try {
      const lastDashIndex = sectionKey.lastIndexOf('-');
      if (lastDashIndex === -1) {
        console.error('[EditableRichText] Invalid sectionKey format:', sectionKey);
        return false;
      }
      
      const fieldName = sectionKey.substring(lastDashIndex + 1);
      const segmentKey = sectionKey.substring(0, lastDashIndex);
      const segmentKeyParts = segmentKey.split('-');
      const segmentId = segmentKeyParts[segmentKeyParts.length - 1];
      
      console.log('[EditableRichText]', isAutoSave ? 'Auto-saving' : 'Saving', 'field:', fieldName, 'value length:', valueToSave.length);

      // Try to find page_segments JSON
      let { data: pageSegmentsData, error: loadError } = await supabase
        .from('page_content')
        .select('id, content_value')
        .eq('page_slug', pageSlug)
        .eq('section_key', 'page_segments')
        .eq('language', language)
        .maybeSingle();

      if (loadError) {
        console.error('[EditableRichText] Error loading page_segments:', loadError);
        return false;
      }

      if (pageSegmentsData) {
        let segments: any[] = [];
        try {
          segments = JSON.parse(pageSegmentsData.content_value || '[]');
        } catch (e) {
          console.error('[EditableRichText] Error parsing page_segments:', e);
          return false;
        }

        const segmentIndex = segments.findIndex((seg: any) => {
          const segId = String(seg.id || seg.segmentId || seg.segment_id || '');
          return segId === segmentId || segmentKey === `${seg.type}-${segId}`;
        });

        if (segmentIndex === -1) {
          console.error('[EditableRichText] Segment not found for segmentId:', segmentId);
          return false;
        }

        if (!segments[segmentIndex].data) {
          segments[segmentIndex].data = {};
        }
        segments[segmentIndex].data[fieldName] = valueToSave;

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
          console.error('[EditableRichText] Error updating page_segments:', updateError);
          return false;
        }
        
        console.log('[EditableRichText] Successfully saved to page_segments');
      } else {
        // Fallback to individual segment
        let { data: segmentData } = await supabase
          .from('page_content')
          .select('id, content_value')
          .eq('page_slug', pageSlug)
          .eq('section_key', segmentKey)
          .eq('language', language)
          .maybeSingle();
        
        if (!segmentData && segmentKey !== segmentId) {
          const result = await supabase
            .from('page_content')
            .select('id, content_value')
            .eq('page_slug', pageSlug)
            .eq('section_key', segmentId)
            .eq('language', language)
            .maybeSingle();
          segmentData = result.data;
        }
        
        if (!segmentData) {
          console.error('[EditableRichText] Content not found');
          return false;
        }
        
        let contentObj: any = {};
        try {
          contentObj = JSON.parse(segmentData.content_value || '{}');
        } catch (e) {
          return false;
        }
        
        contentObj[fieldName] = valueToSave;
        
        const { data: { user: userFallback } } = await supabase.auth.getUser();
        const { error: updateError } = await supabase
          .from('page_content')
          .update({
            content_value: JSON.stringify(contentObj),
            updated_at: new Date().toISOString(),
            updated_by: userFallback?.id
          })
          .eq('id', segmentData.id);
        
        if (updateError) {
          console.error('[EditableRichText] Error updating segment:', updateError);
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('[EditableRichText] Save error:', error);
      return false;
    }
  }, [pageSlug, sectionKey, language]);

  // Tiptap editor - full formatting: bold, italic, underline, lists, links
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        codeBlock: false,
        blockquote: false,
        horizontalRule: false,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-[#2563eb] underline hover:text-[#1d4ed8]',
        },
      }),
      Underline,
    ],
    content: value || '',
    onUpdate: ({ editor }) => {
      const newValue = editor.getHTML();
      setEditValue(newValue);
      editValueRef.current = newValue;
    },
    // CRITICAL: Save on blur (when user clicks away or navigates)
    onBlur: () => {
      const currentValue = editValueRef.current;
      const lastSaved = lastSavedValueRef.current;
      
      if (currentValue !== lastSaved && !saveInProgressRef.current) {
        console.log('[EditableRichText] Saving on blur...');
        saveInProgressRef.current = true;
        performSave(currentValue, true).then((success) => {
          if (success) {
            setLastSavedValue(currentValue);
            lastSavedValueRef.current = currentValue;
            toast.success('Auto-saved', { duration: 2000, description: fieldLabel || 'Rich Text' });
          }
          saveInProgressRef.current = false;
        });
      }
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none p-3 text-black',
      },
    },
    editable: isEditing,
  });

  // Update editor content when value changes externally
  useEffect(() => {
    if (editor && value !== editor.getHTML() && !isEditing) {
      editor.commands.setContent(value || '');
      setEditValue(value);
      setLastSavedValue(value);
      editValueRef.current = value;
      lastSavedValueRef.current = value;
    }
  }, [value, editor, isEditing]);

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
      const currentValue = editValueRef.current;
      const lastSaved = lastSavedValueRef.current;
      
      if (currentValue !== lastSaved && !saveInProgressRef.current) {
        console.log('[EditableRichText] Auto-saving...', { currentValue: currentValue.substring(0, 50), lastSaved: lastSaved.substring(0, 50) });
        saveInProgressRef.current = true;
        
        try {
          const success = await performSave(currentValue, true);
          if (success) {
            setLastSavedValue(currentValue);
            lastSavedValueRef.current = currentValue;
            toast.success('Auto-saved', { 
              duration: 2000,
              description: fieldLabel || 'Rich Text'
            });
          }
        } catch (error) {
          console.error('[EditableRichText] Auto-save error:', error);
        } finally {
          saveInProgressRef.current = false;
        }
      }
    }, 5000); // 5 seconds

    return () => {
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current);
        autoSaveTimerRef.current = null;
      }
    };
  }, [isEditing, performSave, fieldLabel]);

  // CRITICAL: Save on component unmount if there are unsaved changes
  useEffect(() => {
    return () => {
      const currentValue = editValueRef.current;
      const lastSaved = lastSavedValueRef.current;
      const wasEditing = isEditingRef.current;
      
      if (wasEditing && currentValue !== lastSaved && !saveInProgressRef.current) {
        console.log('[EditableRichText] Saving on unmount...');
        saveInProgressRef.current = true;
        // Fire and forget - component is unmounting
        performSave(currentValue, true).then((success) => {
          if (success) {
            console.log('[EditableRichText] Successfully saved on unmount');
          }
        });
      }
    };
  }, [performSave]);

  // Save on editing mode exit (cleanup effect)
  const prevIsEditingRef = useRef(isEditing);
  useEffect(() => {
    // When transitioning from editing to not editing, save if there are unsaved changes
    if (prevIsEditingRef.current && !isEditing) {
      const currentValue = editValueRef.current;
      const lastSaved = lastSavedValueRef.current;
      
      if (currentValue !== lastSaved && !saveInProgressRef.current) {
        console.log('[EditableRichText] Saving on edit mode exit...');
        saveInProgressRef.current = true;
        performSave(currentValue, true).then((success) => {
          if (success) {
            setLastSavedValue(currentValue);
            lastSavedValueRef.current = currentValue;
            toast.success('Auto-saved', { duration: 2000, description: fieldLabel || 'Rich Text' });
          }
          saveInProgressRef.current = false;
        });
      }
    }
    prevIsEditingRef.current = isEditing;
  }, [isEditing, performSave, fieldLabel]);

  // BEFOREUNLOAD: Warn on page leave and attempt save
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      const currentValue = editValueRef.current;
      const lastSaved = lastSavedValueRef.current;
      
      if (isEditingRef.current && currentValue !== lastSaved) {
        console.log('[EditableRichText] Attempting save on page leave');
        // Try the save
        performSave(currentValue, true);
        e.preventDefault();
        e.returnValue = 'Unsaved changes will be lost';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [performSave]);

  // CRITICAL: Intercept link clicks and BLOCK navigation until save completes
  useEffect(() => {
    const handleLinkClick = async (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a');
      
      // If clicking on a navigation link while editing with unsaved changes
      if (link && link.href && isEditingRef.current) {
        const currentValue = editValueRef.current;
        const lastSaved = lastSavedValueRef.current;
        
        if (currentValue !== lastSaved && !saveInProgressRef.current) {
          // BLOCK the default navigation
          e.preventDefault();
          e.stopPropagation();
          
          console.log('[EditableRichText] Blocking navigation to save first...');
          saveInProgressRef.current = true;
          
          // Save first, then navigate
          const success = await performSave(currentValue, true);
          if (success) {
            console.log('[EditableRichText] Saved before navigation');
            lastSavedValueRef.current = currentValue;
            setLastSavedValue(currentValue);
          }
          saveInProgressRef.current = false;
          
          // Now navigate
          console.log('[EditableRichText] Save complete, navigating to:', link.href);
          window.location.href = link.href;
        }
      }
    };

    // Use capture phase to intercept before navigation
    document.addEventListener('click', handleLinkClick, true);

    return () => {
      document.removeEventListener('click', handleLinkClick, true);
    };
  }, [performSave]);

  // Update editor editable state
  useEffect(() => {
    if (editor) {
      editor.setEditable(isEditing);
    }
  }, [isEditing, editor]);

  // Handle click outside to save
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        if (isEditing && editValue !== value) {
          handleSave();
        } else {
          setIsEditing(false);
        }
      }
    };

    if (isEditing) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isEditing, editValue, value]);

  const openLinkDialog = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes('link').href || '';
    setCurrentLinkUrl(previousUrl);
    setLinkDialogOpen(true);
  }, [editor]);

  const handleLinkSubmit = useCallback((url: string) => {
    if (!editor) return;
    
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    const isExternal = url.startsWith('http://') || url.startsWith('https://');
    editor.chain().focus().extendMarkRange('link').setLink({ 
      href: url,
      target: isExternal ? '_blank' : null,
      rel: isExternal ? 'noopener noreferrer' : null
    }).run();
  }, [editor]);

  const handleLinkRemove = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().extendMarkRange('link').unsetLink().run();
  }, [editor]);

  // performSave is already defined above - using that definition

  // Manual save handler
  const handleSave = useCallback(async () => {
    if (editValue === value) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);

    try {
      const success = await performSave(editValue, false);
      if (success) {
        toast.success('Saved!');
        setLastSavedValue(editValue);
        onUpdate?.(editValue);
        setIsEditing(false);
      } else {
        toast.error('Error saving');
      }
    } finally {
      setIsSaving(false);
    }
  }, [editValue, value, performSave, onUpdate]);

  const handleCancel = useCallback(() => {
    if (editor) {
      editor.commands.setContent(value || '');
    }
    setEditValue(value);
    setIsEditing(false);
  }, [value, editor]);

  const handleClick = useCallback(() => {
    if (isSegmentEditing && editContext?.canEdit && !isEditing) {
      setIsEditing(true);
    }
  }, [isSegmentEditing, editContext?.canEdit, isEditing]);

  if (!editor) {
    return null;
  }

  // Not in editing mode - show read-only
  if (!isSegmentEditing) {
    return (
      <div 
        className={cn(className, "whitespace-pre-line")}
        dangerouslySetInnerHTML={{ __html: transformHtmlWithLinkIcons(value) }}
      />
    );
  }

  // In segment editing mode but not currently editing this element
  if (!isEditing) {
    return (
      <div className="relative group">
        <div 
          className={cn(
            className,
            "cursor-text whitespace-pre-line",
            editContext?.canEdit && "hover:bg-[#f9dc24]/20 rounded transition-colors duration-150"
          )}
          onClick={handleClick}
          dangerouslySetInnerHTML={{ __html: value }}
        />
        {editContext?.canEdit && (
          <span 
            className="z-[9999] opacity-0 group-hover:opacity-100 transition-opacity bg-black text-[#f9dc24] text-sm px-4 py-2 rounded-lg font-normal whitespace-nowrap pointer-events-none shadow-xl border border-[#f9dc24]"
            style={{
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%)',
              top: '-44px',
              letterSpacing: '0.05em',
              textAlign: 'center'
            }}
          >
            {fieldLabel ? `Edit: ${fieldLabel}` : 'Click to edit'}
          </span>
        )}
      </div>
    );
  }

  // Currently editing
  return (
    <div ref={containerRef} className="relative">
      {/* Rich Text Editor */}
      <div className="border-2 border-[#f9dc24] rounded-lg bg-white overflow-hidden shadow-lg">
        {/* Toolbar - Full Rich Text: Bold, Italic, Underline, Lists, Links */}
        <div className="flex items-center gap-1 p-2 border-b border-gray-200 bg-gray-50">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={cn(
              "h-8 w-8 p-0",
              editor.isActive('bold') 
                ? "bg-[#f9dc24] text-black" 
                : "text-gray-600 hover:text-black hover:bg-gray-200"
            )}
            title="Fett (Ctrl+B)"
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={cn(
              "h-8 w-8 p-0",
              editor.isActive('italic') 
                ? "bg-[#f9dc24] text-black" 
                : "text-gray-600 hover:text-black hover:bg-gray-200"
            )}
            title="Kursiv (Ctrl+I)"
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={cn(
              "h-8 w-8 p-0",
              editor.isActive('underline') 
                ? "bg-[#f9dc24] text-black" 
                : "text-gray-600 hover:text-black hover:bg-gray-200"
            )}
            title="Unterstrichen (Ctrl+U)"
          >
            <UnderlineIcon className="h-4 w-4" />
          </Button>
          <div className="w-px h-6 bg-gray-300 mx-1" />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={cn(
              "h-8 w-8 p-0",
              editor.isActive('bulletList') 
                ? "bg-[#f9dc24] text-black" 
                : "text-gray-600 hover:text-black hover:bg-gray-200"
            )}
            title="Aufzählungsliste"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={cn(
              "h-8 w-8 p-0",
              editor.isActive('orderedList') 
                ? "bg-[#f9dc24] text-black" 
                : "text-gray-600 hover:text-black hover:bg-gray-200"
            )}
            title="Nummerierte Liste"
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
          <div className="w-px h-6 bg-gray-300 mx-1" />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={openLinkDialog}
            className={cn(
              "h-8 w-8 p-0",
              editor.isActive('link') 
                ? "bg-[#f9dc24] text-black" 
                : "text-gray-600 hover:text-black hover:bg-gray-200"
            )}
            title="Link einfügen"
          >
            <LinkIcon className="h-4 w-4" />
          </Button>
          
          <LinkEditorDialog
            open={linkDialogOpen}
            onOpenChange={setLinkDialogOpen}
            currentUrl={currentLinkUrl}
            onSubmit={handleLinkSubmit}
            onRemove={handleLinkRemove}
          />
          
          <div className="flex-1" />
          
          {/* Field label */}
          {fieldLabel && (
            <span className="text-xs text-gray-500 mr-2">{fieldLabel}</span>
          )}
        </div>
        
        {/* Editor content */}
        <div className="min-h-[80px]">
          <EditorContent editor={editor} />
        </div>
      </div>

      {/* Save/Cancel buttons */}
      <div className="flex items-center gap-2 mt-2 justify-end">
        <button
          onClick={handleCancel}
          disabled={isSaving}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
        >
          <X className="h-4 w-4" />
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium bg-[#f9dc24] text-black hover:bg-[#e5c91f] transition-colors"
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Check className="h-4 w-4" />
          )}
          Save
        </button>
      </div>
    </div>
  );
};

export default EditableRichText;
