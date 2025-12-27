import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useFrontendEditOptional } from '@/contexts/FrontendEditContext';
import { useSegmentEdit } from './EditableSegment';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Check, X, Loader2, CheckCircle, Clock, Edit3 } from 'lucide-react';

interface EditableTextProps {
  value: string;
  sectionKey: string;
  pageSlug: string;
  language: string;
  multiline?: boolean;
  className?: string;
  onUpdate?: (newValue: string) => void;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span' | 'div';
  contentStatus?: 'draft' | 'pending' | 'approved';
  importStage?: number;
}

export const EditableText: React.FC<EditableTextProps> = ({
  value,
  sectionKey,
  pageSlug,
  language,
  multiline = false,
  className,
  onUpdate,
  as: Component = 'div',
  contentStatus = 'approved',
  importStage = 1
}) => {
  const editContext = useFrontendEditOptional();
  const segmentEdit = useSegmentEdit();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [isSaving, setIsSaving] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement | HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const isSegmentEditing = segmentEdit?.isSegmentEditing || false;
  const needsApproval = contentStatus === 'draft' || contentStatus === 'pending';
  const isStage2Import = importStage >= 2;

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

  const handleApprove = useCallback(async () => {
    setIsApproving(true);
    try {
      const { error } = await supabase
        .from('page_content')
        .update({
          content_status: 'approved',
          approved_at: new Date().toISOString(),
          approved_by: editContext?.userId
        })
        .eq('page_slug', pageSlug)
        .eq('section_key', sectionKey)
        .eq('language', language);

      if (error) {
        console.error('[EditableText] Approve error:', error);
        toast.error('Freigabe fehlgeschlagen');
        return;
      }

      toast.success('Inhalt freigegeben!');
      onUpdate?.(value);
    } catch (error) {
      console.error('[EditableText] Approve error:', error);
      toast.error('Freigabe fehlgeschlagen');
    } finally {
      setIsApproving(false);
    }
  }, [pageSlug, sectionKey, language, editContext?.userId, onUpdate, value]);

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
    if (isSegmentEditing && editContext?.canEdit && !isEditing) {
      setIsEditing(true);
    }
  }, [isSegmentEditing, editContext?.canEdit, isEditing]);

  // Get status styling
  const getStatusStyles = () => {
    if (contentStatus === 'draft') {
      return {
        border: 'border-l-4 border-l-yellow-400 pl-3',
        bg: 'bg-yellow-400/10',
        indicator: { icon: Edit3, color: 'text-yellow-500', label: 'Entwurf' }
      };
    }
    if (contentStatus === 'pending') {
      return {
        border: 'border-l-4 border-l-orange-400 pl-3',
        bg: 'bg-orange-400/10',
        indicator: { icon: Clock, color: 'text-orange-500', label: 'Wartet auf Freigabe' }
      };
    }
    if (isStage2Import) {
      return {
        border: 'border-l-4 border-l-blue-400 pl-3',
        bg: 'bg-blue-400/10',
        indicator: { icon: CheckCircle, color: 'text-blue-500', label: `Import Stage ${importStage}` }
      };
    }
    return { border: '', bg: '', indicator: null };
  };

  const statusStyles = getStatusStyles();

  // If no edit context or not in segment editing mode, show with status indicator
  if (!isSegmentEditing) {
    // Show status indicator in edit mode for unapproved content
    if (editContext?.isEditMode && needsApproval) {
      const StatusIcon = statusStyles.indicator?.icon || Edit3;
      return (
        <div className={cn("relative group", statusStyles.border, statusStyles.bg, "rounded-r")}>
          <Component className={className}>{value}</Component>
          
          {/* Status indicator */}
          <div className="absolute -top-2 -left-1 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className={cn(
              "flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-black shadow-lg",
              statusStyles.indicator?.color
            )}>
              <StatusIcon className="h-3 w-3" />
              <span>{statusStyles.indicator?.label}</span>
            </div>
            
            {/* Approval button for admins */}
            {editContext?.canApprove && (
              <button
                onClick={handleApprove}
                disabled={isApproving}
                className="flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-green-600 text-white hover:bg-green-500 transition-colors shadow-lg"
              >
                {isApproving ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Check className="h-3 w-3" />
                )}
                <span>Freigeben</span>
              </button>
            )}
          </div>
        </div>
      );
    }
    
    return <Component className={className}>{value}</Component>;
  }

  // In segment editing mode but not currently editing this element
  if (!isEditing) {
    const StatusIcon = statusStyles.indicator?.icon || Edit3;
    return (
      <div className={cn("relative", needsApproval && statusStyles.border, needsApproval && statusStyles.bg, "rounded-r")}>
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
        
        {/* Status badge and approval button */}
        {needsApproval && (
          <div className="flex items-center gap-2 mt-2">
            <div className={cn(
              "flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-black shadow-lg",
              statusStyles.indicator?.color
            )}>
              <StatusIcon className="h-3 w-3" />
              <span>{statusStyles.indicator?.label}</span>
            </div>
            
            {editContext?.canApprove && (
              <button
                onClick={handleApprove}
                disabled={isApproving}
                className="flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium bg-green-600 text-white hover:bg-green-500 transition-colors shadow-lg"
              >
                {isApproving ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Check className="h-3 w-3" />
                )}
                <span>Freigeben</span>
              </button>
            )}
          </div>
        )}
      </div>
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
