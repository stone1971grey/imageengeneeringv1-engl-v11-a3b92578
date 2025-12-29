import React, { useState, createContext, useContext, useCallback } from 'react';
import { useFrontendEditOptional } from '@/contexts/FrontendEditContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Edit3, Check, X, Layers, Save, Clock, Loader2, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

// Context for segment-level editing state
interface SegmentEditContextType {
  isSegmentEditing: boolean;
  setSegmentEditing: (editing: boolean) => void;
  segmentKey: string;
  pageSlug: string;
  language: string;
}

const SegmentEditContext = createContext<SegmentEditContextType | undefined>(undefined);

export const useSegmentEdit = () => {
  return useContext(SegmentEditContext);
};

interface EditableSegmentProps {
  children: React.ReactNode;
  segmentKey: string;
  pageSlug: string;
  language: string;
  contentStatus?: 'draft' | 'pending' | 'approved';
  importStage?: number;
  onContentUpdate?: () => void;
  className?: string;
}

export const EditableSegment: React.FC<EditableSegmentProps> = ({
  children,
  segmentKey,
  pageSlug,
  language,
  contentStatus = 'approved',
  importStage = 1,
  onContentUpdate,
  className
}) => {
  const editContext = useFrontendEditOptional();
  const [isHovered, setIsHovered] = useState(false);
  const [isSegmentEditing, setIsSegmentEditing] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  // If no edit context, just render children
  if (!editContext) {
    return <>{children}</>;
  }

  const { isEditMode, canEdit, canApprove, userId } = editContext;

  // If not in edit mode, just render children normally
  if (!isEditMode) {
    return <>{children}</>;
  }

  const needsApproval = contentStatus === 'pending' || contentStatus === 'draft';
  const isStage2 = importStage >= 2;
  const showIndicator = needsApproval || isStage2;

  // Get border color based on status
  const getBorderColor = () => {
    if (isSegmentEditing) return 'border-l-[#f9dc24]';
    if (contentStatus === 'draft') return 'border-l-yellow-400';
    if (contentStatus === 'pending') return 'border-l-orange-400';
    if (isStage2) return 'border-l-blue-400';
    return 'border-l-transparent';
  };

  // Get status config
  const getStatusConfig = () => {
    if (contentStatus === 'draft') {
      return { 
        label: 'Draft - Not Approved', 
        icon: Edit3, 
        bgClass: 'bg-yellow-500', 
        textClass: 'text-yellow-950',
        description: 'This content was imported and awaits your approval.'
      };
    }
    if (contentStatus === 'pending') {
      return { 
        label: 'Pending Approval', 
        icon: Clock, 
        bgClass: 'bg-orange-500', 
        textClass: 'text-orange-950',
        description: 'This content was edited and awaits admin approval.'
      };
    }
    if (isStage2) {
      return { 
        label: `Import Stage ${importStage}`, 
        icon: Layers, 
        bgClass: 'bg-blue-500', 
        textClass: 'text-blue-950',
        description: 'This content was updated in a subsequent import.'
      };
    }
    return null;
  };

  const statusConfig = getStatusConfig();

  // Approve all content in this segment
  const handleApproveSegment = async () => {
    setIsApproving(true);
    try {
      // Update all page_content entries that match this segment's pattern
      const { error } = await supabase
        .from('page_content')
        .update({
          content_status: 'approved',
          approved_at: new Date().toISOString(),
          approved_by: userId
        })
        .eq('page_slug', pageSlug)
        .like('section_key', `${segmentKey}%`)
        .eq('language', language)
        .in('content_status', ['draft', 'pending']);

      if (error) {
        console.error('[EditableSegment] Approve error:', error);
        toast.error('Approval failed');
        return;
      }

      toast.success('Segment approved!', {
        description: 'All content in this segment has been approved.'
      });
      onContentUpdate?.();
    } catch (error) {
      console.error('[EditableSegment] Approve error:', error);
      toast.error('Freigabe fehlgeschlagen');
    } finally {
      setIsApproving(false);
    }
  };

  // Reject/discard changes in this segment
  const handleRejectSegment = async () => {
    setIsRejecting(true);
    try {
      // Discard drafts - restore original content
      const { error } = await supabase
        .from('page_content')
        .update({
          content_status: 'approved',
          draft_value: null
        })
        .eq('page_slug', pageSlug)
        .like('section_key', `${segmentKey}%`)
        .eq('language', language)
        .in('content_status', ['draft', 'pending']);

      if (error) {
        console.error('[EditableSegment] Reject error:', error);
        toast.error('Discard failed');
        return;
      }

      toast.info('Changes discarded', {
        description: 'The drafts have been discarded.'
      });
      onContentUpdate?.();
    } catch (error) {
      console.error('[EditableSegment] Reject error:', error);
      toast.error('Discard failed');
    } finally {
      setIsRejecting(false);
    }
  };

  // Extract segment ID from key (e.g., "intro-549" -> "549")
  const getSegmentId = () => {
    const parts = segmentKey.split('-');
    const lastPart = parts[parts.length - 1];
    if (/^\d+$/.test(lastPart)) {
      return lastPart;
    }
    return segmentKey;
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSegmentEditing(true);
  };

  const handleDoneEditing = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSegmentEditing(false);
    onContentUpdate?.();
  };

  const StatusIcon = statusConfig?.icon || Edit3;

  return (
    <SegmentEditContext.Provider value={{
      isSegmentEditing,
      setSegmentEditing: setIsSegmentEditing,
      segmentKey,
      pageSlug,
      language
    }}>
      <div 
        className={cn(
          "relative transition-all duration-200",
          showIndicator && "border-l-4 pl-4",
          isSegmentEditing && "border-l-4 pl-4 border-l-[#f9dc24] bg-[#f9dc24]/5",
          !isSegmentEditing && getBorderColor(),
          isHovered && isEditMode && !isSegmentEditing && "bg-gray-900/5 dark:bg-white/5 rounded-r-lg",
          className
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Approval Banner - Always visible when content needs approval */}
        {needsApproval && !isSegmentEditing && statusConfig && (
          <div className="absolute -top-3 left-0 right-0 z-20 flex items-center justify-between px-2">
            <div className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-lg shadow-lg font-medium text-sm",
              statusConfig.bgClass,
              statusConfig.textClass
            )}>
              <StatusIcon className="h-4 w-4" />
              <span>{statusConfig.label}</span>
            </div>
            
            {/* Approval Actions */}
            {canApprove && (
              <div className="flex items-center gap-3">
                <Button
                  size="default"
                  onClick={handleApproveSegment}
                  disabled={isApproving || isRejecting}
                  className="h-9 bg-green-600 hover:bg-green-500 text-white font-semibold shadow-lg gap-2 text-base"
                >
                  {isApproving ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-5 w-5" />
                  )}
                  Approve Segment
                </Button>
                <Button
                  size="default"
                  variant="outline"
                  onClick={handleRejectSegment}
                  disabled={isApproving || isRejecting}
                  className="h-9 border-red-500/50 text-red-600 hover:bg-red-500/10 hover:text-red-500 font-semibold shadow-lg gap-2 text-base"
                >
                  {isRejecting ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <X className="h-5 w-5" />
                  )}
                  Discard
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Stage 2 Badge - when approved but stage 2+ */}
        {isStage2 && contentStatus === 'approved' && !isSegmentEditing && (
          <div className="absolute -top-2 -left-1 z-20">
            <div className={cn(
              "flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium shadow-lg",
              "bg-blue-500 text-blue-950"
            )}>
              <Layers className="h-3 w-3" />
              <span>Import Stage {importStage}</span>
            </div>
          </div>
        )}

        {/* Editing Mode Banner - Fixed position aligned with Preview/Admin Dashboard buttons */}
        {isSegmentEditing && (
          <div className="fixed top-[110px] right-6 z-40 flex items-center gap-3">
            <div className="flex items-center gap-2 bg-[#f9dc24] text-black px-4 py-2 rounded-lg shadow-lg font-semibold text-base">
              <Edit3 className="h-5 w-5" />
              <span>Editing Mode Active</span>
            </div>
            <Button
              size="default"
              onClick={handleDoneEditing}
              className="h-9 px-4 bg-black text-[#f9dc24] hover:bg-gray-900 font-semibold shadow-lg text-base"
            >
              <Save className="h-5 w-5 mr-2" />
              Done
            </Button>
          </div>
        )}

        {/* Floating Action Bar - appears on hover when NOT in segment editing mode and NOT needing approval */}
        {isEditMode && isHovered && !isSegmentEditing && !needsApproval && (
          <div className="absolute top-4 left-4 z-30 flex items-center gap-2">
            {/* Segment ID Badge - now on the left */}
            <div className="flex items-center bg-black rounded-md px-3 py-1.5 shadow-lg">
              <span className="text-sm text-[#f9dc24] font-medium">ID: {getSegmentId()}</span>
            </div>

            {/* Edit Button */}
            {canEdit && (
              <div className="flex items-center gap-1 bg-black rounded-md px-2 py-1.5 shadow-lg">
                <Button 
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0 rounded text-[#f9dc24] hover:text-white hover:bg-[#f9dc24]/20"
                  onClick={handleEditClick}
                  title="Edit segment"
                >
                  <Edit3 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Content */}
        <div className={cn(
          "transition-opacity",
          contentStatus === 'draft' && "opacity-90",
          isSegmentEditing && "pt-8",
          needsApproval && !isSegmentEditing && "pt-10"
        )}>
          {children}
        </div>
      </div>
    </SegmentEditContext.Provider>
  );
};