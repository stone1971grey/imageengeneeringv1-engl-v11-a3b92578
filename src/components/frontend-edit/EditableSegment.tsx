import React, { useState, useCallback } from 'react';
import { useFrontendEditOptional } from '@/contexts/FrontendEditContext';
import { ApprovalBadge } from './ApprovalBadge';
import { ApproveButton } from './ApproveButton';
import { Edit3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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

  // If no edit context, just render children
  if (!editContext) {
    return <>{children}</>;
  }

  const { isEditMode, canEdit, canApprove, isAdmin, userId } = editContext;

  // If not in edit mode, just render children normally
  if (!isEditMode) {
    return <>{children}</>;
  }

  const showApprovalBadge = contentStatus !== 'approved' || importStage > 1;
  const needsApproval = contentStatus === 'pending' || contentStatus === 'draft';

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);

  const handleApproved = () => {
    onContentUpdate?.();
  };

  const handleRejected = () => {
    onContentUpdate?.();
  };

  return (
    <div 
      className={cn(
        "relative group transition-all",
        isEditMode && "cursor-pointer",
        isHovered && isEditMode && "ring-2 ring-blue-500/50 ring-offset-2 ring-offset-background rounded-lg",
        className
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Edit Mode Overlay */}
      {isEditMode && isHovered && (
        <div className="absolute -top-12 left-0 right-0 z-50 flex items-center justify-between bg-gray-900/95 backdrop-blur-sm rounded-t-lg px-4 py-2 border border-gray-700 border-b-0">
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400 font-mono">{segmentKey}</span>
            {showApprovalBadge && (
              <ApprovalBadge 
                status={contentStatus} 
                importStage={importStage} 
              />
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {canEdit && (
              <button className="text-blue-400 hover:text-blue-300 p-1">
                <Edit3 className="h-4 w-4" />
              </button>
            )}
            {needsApproval && canApprove && (
              <ApproveButton 
                segmentKey={segmentKey}
                onApproved={handleApproved}
                onRejected={handleRejected}
              />
            )}
          </div>
        </div>
      )}
      
      {/* Content */}
      <div className={cn(
        "transition-opacity",
        contentStatus === 'draft' && "opacity-80"
      )}>
        {children}
      </div>
      
      {/* Status indicator line */}
      {showApprovalBadge && isEditMode && (
        <div className={cn(
          "absolute left-0 top-0 bottom-0 w-1 rounded-l-lg",
          contentStatus === 'draft' && "bg-yellow-500",
          contentStatus === 'pending' && "bg-orange-500",
          contentStatus === 'approved' && importStage > 1 && "bg-blue-500"
        )} />
      )}
    </div>
  );
};
