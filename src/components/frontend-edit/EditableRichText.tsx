import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import { useFrontendEditOptional } from '@/contexts/FrontendEditContext';
import { useSegmentEdit } from './EditableSegment';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Check, X, Loader2, Bold, Link as LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
  const containerRef = useRef<HTMLDivElement>(null);

  const isSegmentEditing = segmentEdit?.isSegmentEditing || (editContext?.isEditMode && editContext?.canEdit) || false;

  // Tiptap editor - only bold and link, no lists
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        codeBlock: false,
        blockquote: false,
        horizontalRule: false,
        bulletList: false,
        orderedList: false,
        listItem: false,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline hover:text-blue-800',
        },
      }),
    ],
    content: value || '',
    onUpdate: ({ editor }) => {
      setEditValue(editor.getHTML());
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
    }
  }, [value, editor, isEditing]);

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

  const setLink = useCallback(() => {
    if (!editor) return;
    
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL eingeben:', previousUrl);

    if (url === null) return;

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  const handleSave = useCallback(async () => {
    if (editValue === value) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);

    try {
      const lastDashIndex = sectionKey.lastIndexOf('-');
      if (lastDashIndex === -1) {
        console.error('[EditableRichText] Invalid sectionKey format:', sectionKey);
        toast.error('Error saving');
        setIsSaving(false);
        return;
      }
      
      const fieldName = sectionKey.substring(lastDashIndex + 1);
      const segmentKey = sectionKey.substring(0, lastDashIndex);
      const segmentKeyParts = segmentKey.split('-');
      const segmentId = segmentKeyParts[segmentKeyParts.length - 1];
      
      console.log('[EditableRichText] Saving field:', fieldName, 'for segmentKey:', segmentKey, 'segmentId:', segmentId);

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
        toast.error('Error loading content');
        setIsSaving(false);
        return;
      }

      if (pageSegmentsData) {
        let segments: any[] = [];
        try {
          segments = JSON.parse(pageSegmentsData.content_value || '[]');
        } catch (e) {
          console.error('[EditableRichText] Error parsing page_segments:', e);
          toast.error('Error parsing content');
          setIsSaving(false);
          return;
        }

        const segmentIndex = segments.findIndex((seg: any) => {
          const segId = String(seg.id || seg.segmentId || seg.segment_id || '');
          return segId === segmentId || segmentKey === `${seg.type}-${segId}`;
        });

        if (segmentIndex === -1) {
          console.error('[EditableRichText] Segment not found');
          toast.error('Segment not found');
          setIsSaving(false);
          return;
        }

        if (!segments[segmentIndex].data) {
          segments[segmentIndex].data = {};
        }
        segments[segmentIndex].data[fieldName] = editValue;

        const { error: updateError } = await supabase
          .from('page_content')
          .update({
            content_value: JSON.stringify(segments),
            updated_at: new Date().toISOString()
          })
          .eq('id', pageSegmentsData.id);

        if (updateError) {
          console.error('[EditableRichText] Error updating page_segments:', updateError);
          toast.error('Error saving');
          setIsSaving(false);
          return;
        }
      } else {
        // Fallback to individual segment
        let { data: segmentData, error: segmentError } = await supabase
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
          toast.error('Content not found');
          setIsSaving(false);
          return;
        }
        
        let contentObj: any = {};
        try {
          contentObj = JSON.parse(segmentData.content_value || '{}');
        } catch (e) {
          toast.error('Error parsing content');
          setIsSaving(false);
          return;
        }
        
        contentObj[fieldName] = editValue;
        
        const { error: updateError } = await supabase
          .from('page_content')
          .update({
            content_value: JSON.stringify(contentObj),
            updated_at: new Date().toISOString()
          })
          .eq('id', segmentData.id);
        
        if (updateError) {
          toast.error('Error saving');
          setIsSaving(false);
          return;
        }
      }

      toast.success('Saved!');
      onUpdate?.(editValue);
      setIsEditing(false);
    } catch (error) {
      console.error('[EditableRichText] Save error:', error);
      toast.error('Error saving');
    } finally {
      setIsSaving(false);
    }
  }, [editValue, value, pageSlug, sectionKey, language, onUpdate]);

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
        dangerouslySetInnerHTML={{ __html: value }}
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
        {/* Toolbar - only Bold and Link */}
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
          <div className="w-px h-6 bg-gray-300 mx-1" />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={setLink}
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
