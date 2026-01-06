import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useFrontendEditOptional } from '@/contexts/FrontendEditContext';
import { useSegmentEdit } from './EditableSegment';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Check, X, Loader2, Link as LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EditableButtonProps {
  text: string;
  link?: string;
  sectionKey: string;
  pageSlug: string;
  language: string;
  textFieldName: string;
  linkFieldName: string;
  className?: string;
  style?: React.CSSProperties;
  size?: 'default' | 'sm' | 'lg' | 'icon';
  onUpdate?: () => void;
  onClick?: () => void;
}

export const EditableButton: React.FC<EditableButtonProps> = ({
  text,
  link = '',
  sectionKey,
  pageSlug,
  language,
  textFieldName,
  linkFieldName,
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
  const [isSaving, setIsSaving] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const isSegmentEditing = segmentEdit?.isSegmentEditing || (editContext?.isEditMode && editContext?.canEdit) || false;

  // Update values when props change
  useEffect(() => {
    setEditText(text);
    setEditLink(link);
  }, [text, link]);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        if (isEditing && (editText !== text || editLink !== link)) {
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
  }, [isEditing, editText, editLink, text, link]);

  const handleSave = useCallback(async () => {
    if (editText === text && editLink === link) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);

    try {
      // Parse sectionKey to extract segmentKey and find segment ID
      const lastDashIndex = sectionKey.lastIndexOf('-');
      if (lastDashIndex === -1) {
        console.error('[EditableButton] Invalid sectionKey format:', sectionKey);
        toast.error('Error saving');
        setIsSaving(false);
        return;
      }
      
      const segmentKey = sectionKey;
      const segmentKeyParts = segmentKey.split('-');
      const segmentId = segmentKeyParts[segmentKeyParts.length - 1];
      
      console.log('[EditableButton] Saving button for segmentKey:', segmentKey, 'segmentId:', segmentId, 'textField:', textFieldName, 'linkField:', linkFieldName);

      // Load page_segments JSON
      let { data: pageSegmentsData, error: loadError } = await supabase
        .from('page_content')
        .select('id, content_value')
        .eq('page_slug', pageSlug)
        .eq('section_key', 'page_segments')
        .eq('language', language)
        .maybeSingle();

      if (loadError) {
        console.error('[EditableButton] Error loading page_segments:', loadError);
        toast.error('Error loading content');
        setIsSaving(false);
        return;
      }

      if (pageSegmentsData) {
        let segments: any[] = [];
        try {
          segments = JSON.parse(pageSegmentsData.content_value || '[]');
        } catch (e) {
          console.error('[EditableButton] Error parsing page_segments:', e);
          toast.error('Error parsing content');
          setIsSaving(false);
          return;
        }

        // Find the segment by matching id
        const segmentIndex = segments.findIndex((seg: any) => {
          const segId = String(seg.id || seg.segmentId || seg.segment_id || '');
          return segId === segmentId || segmentKey === `${seg.type}-${segId}`;
        });

        if (segmentIndex === -1) {
          console.error('[EditableButton] Segment not found. segmentId:', segmentId, 'segmentKey:', segmentKey);
          toast.error('Segment not found');
          setIsSaving(false);
          return;
        }

        console.log('[EditableButton] Found segment at index:', segmentIndex, 'type:', segments[segmentIndex].type);

        // Update both text and link fields
        if (!segments[segmentIndex].data) {
          segments[segmentIndex].data = {};
        }
        segments[segmentIndex].data[textFieldName] = editText;
        segments[segmentIndex].data[linkFieldName] = editLink;

        // Save the updated page_segments JSON
        const { error: updateError } = await supabase
          .from('page_content')
          .update({
            content_value: JSON.stringify(segments),
            updated_at: new Date().toISOString()
          })
          .eq('id', pageSegmentsData.id);

        if (updateError) {
          console.error('[EditableButton] Error updating page_segments:', updateError);
          toast.error('Error saving');
          setIsSaving(false);
          return;
        }
      } else {
        console.error('[EditableButton] page_segments not found');
        toast.error('Content not found');
        setIsSaving(false);
        return;
      }

      toast.success('Button saved!');
      onUpdate?.();
      setIsEditing(false);
    } catch (error) {
      console.error('[EditableButton] Save error:', error);
      toast.error('Error saving');
    } finally {
      setIsSaving(false);
    }
  }, [editText, editLink, text, link, pageSlug, sectionKey, language, textFieldName, linkFieldName, onUpdate]);

  const handleCancel = useCallback(() => {
    setEditText(text);
    setEditLink(link);
    setIsEditing(false);
  }, [text, link]);

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
    } else if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSave();
    }
  }, [handleCancel, handleSave]);

  // If not in edit mode, render normal button
  if (!isSegmentEditing) {
    return (
      <Button
        size={size}
        className={className}
        style={style}
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
        <Button
          size={size}
          className={cn(
            className,
            "relative cursor-pointer",
            editContext?.canEdit && "hover:ring-2 hover:ring-[#f9dc24] hover:ring-offset-2 transition-all"
          )}
          style={style}
          onClick={handleClick}
        >
          {text}
        </Button>
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

  // Currently editing - show inline editor directly below button
  return (
    <div ref={containerRef} className="inline-block">
      {/* The button itself */}
      <Button
        size={size}
        className={cn(
          className,
          "ring-2 ring-[#f9dc24] ring-offset-2"
        )}
        style={style}
        onClick={(e) => e.stopPropagation()}
      >
        {editText || text}
      </Button>
      
      {/* Inline Editor - directly below the button */}
      <div 
        className="mt-3 bg-white rounded-xl shadow-2xl p-5 border border-gray-200 min-w-[320px] relative z-[100]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col gap-4">
          <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">Edit Button</h3>
          
          {/* Button Text */}
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Button Text</label>
            <input
              type="text"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#f9dc24] focus:border-transparent"
              placeholder="Button text..."
              autoFocus
            />
          </div>
          
          {/* Button Link */}
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 flex items-center gap-1">
              <LinkIcon className="h-3 w-3" />
              Link URL
            </label>
            <input
              type="text"
              value={editLink}
              onChange={(e) => setEditLink(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#f9dc24] focus:border-transparent"
              placeholder="/path or https://..."
            />
            <p className="text-xs text-gray-400 mt-1">Use / for internal, # for anchor, or full URL</p>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-2 pt-2 border-t">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500 transition-colors disabled:opacity-50"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              <span className="font-medium">Save</span>
            </button>
            <button
              onClick={handleCancel}
              disabled={isSaving}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
            >
              <X className="h-4 w-4" />
              <span className="font-medium">Cancel</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
