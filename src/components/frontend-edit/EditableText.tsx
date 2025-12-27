import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useFrontendEditOptional } from '@/contexts/FrontendEditContext';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Check, X, Loader2 } from 'lucide-react';

interface EditableTextProps {
  value: string;
  sectionKey: string;
  pageSlug: string;
  language: string;
  multiline?: boolean;
  className?: string;
  onUpdate?: (newValue: string) => void;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span' | 'div';
}

export const EditableText: React.FC<EditableTextProps> = ({
  value,
  sectionKey,
  pageSlug,
  language,
  multiline = false,
  className,
  onUpdate,
  as: Component = 'div'
}) => {
  const editContext = useFrontendEditOptional();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement | HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Update editValue when value prop changes
  useEffect(() => {
    setEditValue(value);
  }, [value]);

  // Focus input when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  // Handle click outside to cancel
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        if (isEditing && editValue !== value) {
          // If there are unsaved changes, save them
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

  const handleSave = useCallback(async () => {
    if (editValue === value) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);

    try {
      // Save to database
      const { data: existing, error: fetchError } = await supabase
        .from('page_content')
        .select('id, content_value')
        .eq('page_slug', pageSlug)
        .eq('section_key', sectionKey)
        .eq('language', language)
        .maybeSingle();

      if (fetchError) {
        console.error('[EditableText] Fetch error:', fetchError);
        toast.error('Fehler beim Laden');
        return;
      }

      if (existing) {
        // Update existing content
        const { error: updateError } = await supabase
          .from('page_content')
          .update({
            content_value: editValue,
            draft_value: null,
            content_status: 'approved',
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id);

        if (updateError) {
          console.error('[EditableText] Update error:', updateError);
          toast.error('Fehler beim Speichern');
          return;
        }
      } else {
        // Create new content
        const { error: insertError } = await supabase
          .from('page_content')
          .insert({
            page_slug: pageSlug,
            section_key: sectionKey,
            language: language,
            content_type: 'text',
            content_value: editValue,
            content_status: 'approved'
          });

        if (insertError) {
          console.error('[EditableText] Insert error:', insertError);
          toast.error('Fehler beim Speichern');
          return;
        }
      }

      toast.success('Gespeichert!');
      onUpdate?.(editValue);
      setIsEditing(false);
    } catch (error) {
      console.error('[EditableText] Save error:', error);
      toast.error('Fehler beim Speichern');
    } finally {
      setIsSaving(false);
    }
  }, [editValue, value, pageSlug, sectionKey, language, onUpdate]);

  const handleCancel = useCallback(() => {
    setEditValue(value);
    setIsEditing(false);
  }, [value]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleCancel();
    } else if (e.key === 'Enter' && !multiline) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSave();
    }
  }, [handleCancel, handleSave, multiline]);

  const handleClick = useCallback(() => {
    if (editContext?.isEditMode && editContext?.canEdit && !isEditing) {
      setIsEditing(true);
    }
  }, [editContext?.isEditMode, editContext?.canEdit, isEditing]);

  // If no edit context or not in edit mode, just render the text
  if (!editContext?.isEditMode) {
    return <Component className={className}>{value}</Component>;
  }

  // In edit mode but not currently editing this element
  if (!isEditing) {
    return (
      <Component 
        className={cn(
          className,
          "cursor-text relative group transition-all duration-200",
          editContext?.canEdit && "hover:outline hover:outline-2 hover:outline-[#f9dc24] hover:outline-offset-2 rounded"
        )}
        onClick={handleClick}
      >
        {value}
        {editContext?.canEdit && (
          <span className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black text-[#f9dc24] text-[10px] px-1.5 py-0.5 rounded font-medium">
            Klicken zum Bearbeiten
          </span>
        )}
      </Component>
    );
  }

  // Currently editing this element
  return (
    <div ref={containerRef} className="relative">
      {multiline ? (
        <textarea
          ref={inputRef as React.RefObject<HTMLTextAreaElement>}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isSaving}
          className={cn(
            className,
            "w-full bg-black/90 border-2 border-[#f9dc24] rounded-lg p-3",
            "text-white placeholder-gray-400",
            "focus:outline-none focus:ring-2 focus:ring-[#f9dc24]/50",
            "disabled:opacity-50 resize-y min-h-[100px]"
          )}
          rows={Math.min(10, Math.max(3, editValue.split('\n').length + 1))}
        />
      ) : (
        <input
          ref={inputRef as React.RefObject<HTMLInputElement>}
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isSaving}
          className={cn(
            className,
            "w-full bg-black/90 border-2 border-[#f9dc24] rounded-lg px-3 py-2",
            "text-white placeholder-gray-400",
            "focus:outline-none focus:ring-2 focus:ring-[#f9dc24]/50",
            "disabled:opacity-50"
          )}
        />
      )}

      {/* Action Buttons */}
      <div className="absolute -bottom-12 right-0 flex items-center gap-2 bg-black rounded-lg px-2 py-1.5 shadow-xl border border-gray-800 z-50">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#f9dc24] text-black rounded font-medium text-sm hover:bg-[#e6c820] disabled:opacity-50 transition-colors"
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Check className="h-4 w-4" />
          )}
          <span>Speichern</span>
        </button>
        <button
          onClick={handleCancel}
          disabled={isSaving}
          className="flex items-center gap-1.5 px-3 py-1.5 text-gray-300 hover:text-white hover:bg-gray-800 rounded font-medium text-sm transition-colors"
        >
          <X className="h-4 w-4" />
          <span>Abbrechen</span>
        </button>
        {multiline && (
          <span className="text-xs text-gray-500 ml-2">
            Ctrl+Enter speichern
          </span>
        )}
      </div>
    </div>
  );
};
