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
  fieldLabel?: string; // e.g., "Title H1", "Subtitle H1", "Description"
  renderAsHtml?: boolean; // If true, render value as HTML using dangerouslySetInnerHTML
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
  importStage = 1,
  fieldLabel,
  renderAsHtml = false
}) => {
  const editContext = useFrontendEditOptional();
  const segmentEdit = useSegmentEdit();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [isSaving, setIsSaving] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [lastSavedValue, setLastSavedValue] = useState(value);
  const inputRef = useRef<HTMLTextAreaElement | HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const saveInProgressRef = useRef(false);

  // Allow editing if segment is being edited OR if we're in general edit mode
  const isSegmentEditing = segmentEdit?.isSegmentEditing || (editContext?.isEditMode && editContext?.canEdit) || false;
  const needsApproval = contentStatus === 'draft' || contentStatus === 'pending';
  const isStage2Import = importStage >= 2;

  // Update editValue and lastSavedValue when value prop changes
  useEffect(() => {
    setEditValue(value);
    setLastSavedValue(value);
  }, [value]);

  // Focus input when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  // AUTO-SAVE: Trigger save every 10 seconds while editing if value changed
  useEffect(() => {
    if (!isEditing) {
      // Clear timer when not editing
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current);
        autoSaveTimerRef.current = null;
      }
      return;
    }

    // Start auto-save timer
    autoSaveTimerRef.current = setInterval(async () => {
      // Only save if value has changed since last save and not currently saving
      if (editValue !== lastSavedValue && !saveInProgressRef.current) {
        console.log('[EditableText] Auto-saving...');
        saveInProgressRef.current = true;
        
        try {
          await performSave(editValue, true);
          setLastSavedValue(editValue);
          toast.success('Auto-saved', { 
            duration: 2000,
            description: fieldLabel || sectionKey
          });
        } catch (error) {
          console.error('[EditableText] Auto-save error:', error);
        } finally {
          saveInProgressRef.current = false;
        }
      }
    }, 10000); // 10 seconds

    return () => {
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current);
        autoSaveTimerRef.current = null;
      }
    };
  }, [isEditing, editValue, lastSavedValue, sectionKey, fieldLabel]);

  // BEFOREUNLOAD: Save on page leave
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isEditing && editValue !== lastSavedValue) {
        // Try to save synchronously (may not complete)
        console.log('[EditableText] Attempting save on page leave');
        // Perform the save operation - can't await here but at least try
        performSave(editValue, true);
        e.preventDefault();
        e.returnValue = 'Unsaved changes will be lost';
        return e.returnValue;
      }
    };

    if (isEditing) {
      window.addEventListener('beforeunload', handleBeforeUnload);
    }

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isEditing, editValue, lastSavedValue]);

  // Handle click outside to save and close
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

  // Core save function - reusable for manual save and auto-save
  const performSave = useCallback(async (valueToSave: string, isAutoSave: boolean = false): Promise<boolean> => {
    if (valueToSave === value && !isAutoSave) {
      return true; // No changes
    }

    try {
      // Parse sectionKey to extract segmentKey (without field) and field name
      const lastDashIndex = sectionKey.lastIndexOf('-');
      if (lastDashIndex === -1) {
        console.error('[EditableText] Invalid sectionKey format:', sectionKey);
        return false;
      }
      
      const fieldName = sectionKey.substring(lastDashIndex + 1);
      const segmentKey = sectionKey.substring(0, lastDashIndex);
      const segmentKeyParts = segmentKey.split('-');
      const segmentId = segmentKeyParts[segmentKeyParts.length - 1];
      
      console.log('[EditableText]', isAutoSave ? 'Auto-saving' : 'Saving', 'field:', fieldName);

      // Try to find page_segments JSON (newer CMS format)
      let { data: pageSegmentsData, error: loadError } = await supabase
        .from('page_content')
        .select('id, content_value')
        .eq('page_slug', pageSlug)
        .eq('section_key', 'page_segments')
        .eq('language', language)
        .maybeSingle();

      if (loadError) {
        console.error('[EditableText] Error loading page_segments:', loadError);
        return false;
      }

      if (pageSegmentsData) {
        let segments: any[] = [];
        try {
          segments = JSON.parse(pageSegmentsData.content_value || '[]');
        } catch (e) {
          console.error('[EditableText] Error parsing page_segments:', e);
          return false;
        }

        const segmentIndex = segments.findIndex((seg: any) => {
          const segId = String(seg.id || seg.segmentId || seg.segment_id || '');
          return segId === segmentId || segmentKey === `${seg.type}-${segId}`;
        });

        if (segmentIndex === -1) {
          console.error('[EditableText] Segment not found:', segmentId);
          return false;
        }

        if (!segments[segmentIndex].data) {
          segments[segmentIndex].data = {};
        }
        segments[segmentIndex].data[fieldName] = valueToSave;

        const { error: updateError } = await supabase
          .from('page_content')
          .update({
            content_value: JSON.stringify(segments),
            updated_at: new Date().toISOString()
          })
          .eq('id', pageSegmentsData.id);

        if (updateError) {
          console.error('[EditableText] Error updating page_segments:', updateError);
          return false;
        }
      } else {
        // Fallback: Individual segment entry (older CMS format)
        let { data: segmentData } = await supabase
          .from('page_content')
          .select('id, content_value, content_type')
          .eq('page_slug', pageSlug)
          .eq('section_key', segmentKey)
          .eq('language', language)
          .maybeSingle();
        
        if (!segmentData && segmentKey !== segmentId) {
          const result = await supabase
            .from('page_content')
            .select('id, content_value, content_type')
            .eq('page_slug', pageSlug)
            .eq('section_key', segmentId)
            .eq('language', language)
            .maybeSingle();
          segmentData = result.data;
        }
        
        if (!segmentData) {
          console.error('[EditableText] Segment not found');
          return false;
        }
        
        let contentObj: any = {};
        try {
          contentObj = JSON.parse(segmentData.content_value || '{}');
        } catch (e) {
          return false;
        }
        
        contentObj[fieldName] = valueToSave;
        
        const { error: updateError } = await supabase
          .from('page_content')
          .update({
            content_value: JSON.stringify(contentObj),
            updated_at: new Date().toISOString()
          })
          .eq('id', segmentData.id);
        
        if (updateError) {
          console.error('[EditableText] Error updating segment:', updateError);
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('[EditableText] Save error:', error);
      return false;
    }
  }, [value, pageSlug, sectionKey, language]);

  // Manual save handler (triggered by user action)
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
        toast.error('Approval failed');
        return;
      }

      toast.success('Content approved!');
      onUpdate?.(value);
    } catch (error) {
      console.error('[EditableText] Approve error:', error);
      toast.error('Approval failed');
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
        indicator: { icon: Edit3, color: 'text-yellow-500', label: 'Draft' }
      };
    }
    if (contentStatus === 'pending') {
      return {
        border: 'border-l-4 border-l-orange-400 pl-3',
        bg: 'bg-orange-400/10',
        indicator: { icon: Clock, color: 'text-orange-500', label: 'Pending Approval' }
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
          {renderAsHtml ? (
            <Component className={className} dangerouslySetInnerHTML={{ __html: value }} />
          ) : (
            <Component className={className}>{value}</Component>
          )}
          
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
                className="flex items-center gap-1.5 px-3 py-1 rounded text-sm font-semibold bg-green-600 text-white hover:bg-green-500 transition-colors shadow-lg"
              >
                {isApproving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
                <span>Approve</span>
              </button>
            )}
          </div>
        </div>
      );
    }
    
    return renderAsHtml ? (
      <Component className={className} dangerouslySetInnerHTML={{ __html: value }} />
    ) : (
      <Component className={className}>{value}</Component>
    );
  }

  // In segment editing mode but not currently editing this element
  if (!isEditing) {
    const StatusIcon = statusStyles.indicator?.icon || Edit3;
    return (
      <div className={cn("relative inline", needsApproval && statusStyles.border, needsApproval && statusStyles.bg, "rounded-r")}>
        <div className="relative group">
          {renderAsHtml ? (
            <Component 
              className={cn(
                className,
                "cursor-text",
                editContext?.canEdit && "hover:bg-[#f9dc24]/20 rounded transition-colors duration-150"
              )}
              onClick={handleClick}
              dangerouslySetInnerHTML={{ __html: value }}
            />
          ) : (
            <Component 
              className={cn(
                className,
                "cursor-text",
                editContext?.canEdit && "hover:bg-[#f9dc24]/20 rounded transition-colors duration-150"
              )}
              onClick={handleClick}
            >
              {value}
            </Component>
          )}
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
        
        {/* Status badge and approval button */}
        {needsApproval && (
          <div className="flex items-center gap-3 mt-3">
            <div className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-semibold bg-black shadow-lg",
              statusStyles.indicator?.color
            )}>
              <StatusIcon className="h-4 w-4" />
              <span>{statusStyles.indicator?.label}</span>
            </div>
            
            {editContext?.canApprove && (
              <button
                onClick={handleApprove}
                disabled={isApproving}
                className="flex items-center gap-2 px-4 py-1.5 rounded text-sm font-semibold bg-green-600 text-white hover:bg-green-500 transition-colors shadow-lg"
              >
                {isApproving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
                <span>Approve</span>
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
            "w-full bg-black/90 border-2 border-[#f9dc24] rounded-lg p-4",
            "text-white placeholder-gray-400 text-base leading-relaxed",
            "focus:outline-none focus:ring-2 focus:ring-[#f9dc24]/50",
            "disabled:opacity-50 resize-y min-h-[200px]"
          )}
          rows={Math.min(15, Math.max(6, editValue.split('\n').length + 2))}
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
      <div className="absolute -bottom-14 right-0 flex items-center gap-3 bg-black rounded-lg px-3 py-2 shadow-xl border border-gray-800 z-50">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-4 py-2 bg-[#f9dc24] text-black rounded font-medium text-sm hover:bg-[#e6c820] disabled:opacity-50 transition-colors"
          style={{ letterSpacing: '0.05em' }}
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Check className="h-4 w-4" />
          )}
          <span>Save</span>
        </button>
        <button
          onClick={handleCancel}
          disabled={isSaving}
          className="flex items-center gap-2 px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded font-medium text-sm transition-colors"
          style={{ letterSpacing: '0.05em' }}
        >
          <X className="h-4 w-4" />
          <span>Cancel</span>
        </button>
        {multiline && (
          <span className="text-xs text-gray-400 ml-2" style={{ letterSpacing: '0.05em' }}>
            Ctrl+Enter to save
          </span>
        )}
      </div>
    </div>
  );
};
