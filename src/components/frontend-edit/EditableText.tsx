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
  const inputRef = useRef<HTMLTextAreaElement | HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Allow editing if segment is being edited OR if we're in general edit mode
  const isSegmentEditing = segmentEdit?.isSegmentEditing || (editContext?.isEditMode && editContext?.canEdit) || false;
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
      // Parse sectionKey to extract segmentKey (without field) and field name
      // Format: "{segmentKey}-{fieldName}" e.g., "product-hero-gallery-549-title"
      // The fieldName is the last part, segmentKey is everything before it
      const lastDashIndex = sectionKey.lastIndexOf('-');
      if (lastDashIndex === -1) {
        console.error('[EditableText] Invalid sectionKey format:', sectionKey);
        toast.error('Error saving');
        setIsSaving(false);
        return;
      }
      
      const fieldName = sectionKey.substring(lastDashIndex + 1);
      const segmentKey = sectionKey.substring(0, lastDashIndex);
      
      // Extract segment ID from segmentKey - it's the last part after the last dash
      // e.g., "product-hero-gallery-549" -> "549"
      const segmentKeyParts = segmentKey.split('-');
      const segmentId = segmentKeyParts[segmentKeyParts.length - 1];
      
      console.log('[EditableText] Saving field:', fieldName, 'for segmentKey:', segmentKey, 'segmentId:', segmentId, 'pageSlug:', pageSlug, 'language:', language);

      // First, try to find page_segments JSON (newer CMS format)
      let { data: pageSegmentsData, error: loadError } = await supabase
        .from('page_content')
        .select('id, content_value')
        .eq('page_slug', pageSlug)
        .eq('section_key', 'page_segments')
        .eq('language', language)
        .maybeSingle();

      if (loadError) {
        console.error('[EditableText] Error loading page_segments:', loadError);
        toast.error('Error loading content');
        setIsSaving(false);
        return;
      }

      // If page_segments exists, use it
      if (pageSegmentsData) {
        console.log('[EditableText] Using page_segments format');
        
        // Parse and update the segments array
        let segments: any[] = [];
        try {
          segments = JSON.parse(pageSegmentsData.content_value || '[]');
        } catch (e) {
          console.error('[EditableText] Error parsing page_segments:', e);
          toast.error('Error parsing content');
          setIsSaving(false);
          return;
        }

        // Find the segment by matching id (trying multiple formats)
        const segmentIndex = segments.findIndex((seg: any) => {
          const segId = String(seg.id || seg.segmentId || seg.segment_id || '');
          // Match against segmentId directly, or the full segmentKey contains it
          return segId === segmentId || segmentKey === `${seg.type}-${segId}`;
        });

        if (segmentIndex === -1) {
          console.error('[EditableText] Segment not found. segmentId:', segmentId, 'segmentKey:', segmentKey, 'Available segments:', segments.map(s => ({ id: s.id, type: s.type })));
          toast.error('Segment not found');
          setIsSaving(false);
          return;
        }

        console.log('[EditableText] Found segment at index:', segmentIndex, 'type:', segments[segmentIndex].type, 'Updating field:', fieldName);

        // Update the specific field in the segment data
        if (!segments[segmentIndex].data) {
          segments[segmentIndex].data = {};
        }
        segments[segmentIndex].data[fieldName] = editValue;

        // Save the updated page_segments JSON
        const { error: updateError } = await supabase
          .from('page_content')
          .update({
            content_value: JSON.stringify(segments),
            updated_at: new Date().toISOString()
          })
          .eq('id', pageSegmentsData.id);

        if (updateError) {
          console.error('[EditableText] Error updating page_segments:', updateError);
          toast.error('Error saving');
          setIsSaving(false);
          return;
        }
      } else {
        // Fallback: Try to find individual segment entry (older CMS format)
        // Try multiple section_key formats:
        // 1. segmentKey directly (e.g., "news-config-394")
        // 2. segmentId only (e.g., "394")
        console.log('[EditableText] page_segments not found, trying individual section_keys:', segmentKey, 'or', segmentId);
        
        // First try segmentKey (without fieldName)
        let { data: segmentData, error: segmentError } = await supabase
          .from('page_content')
          .select('id, content_value, content_type')
          .eq('page_slug', pageSlug)
          .eq('section_key', segmentKey)
          .eq('language', language)
          .maybeSingle();
        
        if (segmentError) {
          console.error('[EditableText] Error loading segment by segmentKey:', segmentError);
        }
        
        // If not found with segmentKey, try with segmentId only
        if (!segmentData && segmentKey !== segmentId) {
          console.log('[EditableText] Not found with segmentKey, trying segmentId:', segmentId);
          const result = await supabase
            .from('page_content')
            .select('id, content_value, content_type')
            .eq('page_slug', pageSlug)
            .eq('section_key', segmentId)
            .eq('language', language)
            .maybeSingle();
          
          if (result.error) {
            console.error('[EditableText] Error loading segment by segmentId:', result.error);
          }
          segmentData = result.data;
        }
        
        if (!segmentData) {
          console.error('[EditableText] Segment not found with section_key:', segmentKey, 'or', segmentId);
          toast.error('Content not found');
          setIsSaving(false);
          return;
        }
        
        console.log('[EditableText] Found individual segment, updating field:', fieldName);
        
        // Parse the content_value JSON and update the field
        let contentObj: any = {};
        try {
          contentObj = JSON.parse(segmentData.content_value || '{}');
        } catch (e) {
          console.error('[EditableText] Error parsing segment content:', e);
          toast.error('Error parsing content');
          setIsSaving(false);
          return;
        }
        
        // Update the field
        contentObj[fieldName] = editValue;
        
        // Save back
        const { error: updateError } = await supabase
          .from('page_content')
          .update({
            content_value: JSON.stringify(contentObj),
            updated_at: new Date().toISOString()
          })
          .eq('id', segmentData.id);
        
        if (updateError) {
          console.error('[EditableText] Error updating segment:', updateError);
          toast.error('Error saving');
          setIsSaving(false);
          return;
        }
      }

      toast.success('Saved!');
      // Call onUpdate with new value to refresh the component
      onUpdate?.(editValue);
      setIsEditing(false);
    } catch (error) {
      console.error('[EditableText] Save error:', error);
      toast.error('Error saving');
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
          className="flex items-center gap-2 px-4 py-2 bg-[#f9dc24] text-black rounded font-semibold text-base hover:bg-[#e6c820] disabled:opacity-50 transition-colors"
        >
          {isSaving ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Check className="h-5 w-5" />
          )}
          <span>Save</span>
        </button>
        <button
          onClick={handleCancel}
          disabled={isSaving}
          className="flex items-center gap-2 px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded font-semibold text-base transition-colors"
        >
          <X className="h-5 w-5" />
          <span>Cancel</span>
        </button>
        {multiline && (
          <span className="text-sm text-gray-400 ml-2">
            Ctrl+Enter to save
          </span>
        )}
      </div>
    </div>
  );
};
