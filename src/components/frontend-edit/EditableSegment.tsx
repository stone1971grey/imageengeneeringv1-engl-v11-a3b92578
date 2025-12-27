import React, { useState } from 'react';
import { useFrontendEditOptional } from '@/contexts/FrontendEditContext';
import { ApprovalBadge } from './ApprovalBadge';
import { ApproveButton } from './ApproveButton';
import { Edit3, Check, X, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

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

  const { isEditMode, canEdit, canApprove } = editContext;

  // If not in edit mode, just render children normally
  if (!isEditMode) {
    return <>{children}</>;
  }

  const needsApproval = contentStatus === 'pending' || contentStatus === 'draft';
  const isStage2 = importStage >= 2;
  const showIndicator = needsApproval || isStage2;

  // Get border color based on status
  const getBorderColor = () => {
    if (contentStatus === 'draft') return 'border-l-yellow-400';
    if (contentStatus === 'pending') return 'border-l-orange-400';
    if (isStage2) return 'border-l-blue-400';
    return 'border-l-transparent';
  };

  // Get status label
  const getStatusLabel = () => {
    if (contentStatus === 'draft') return 'Entwurf';
    if (contentStatus === 'pending') return 'Wartet auf Freigabe';
    if (isStage2) return 'Stage 2 Import';
    return null;
  };

  const handleApproved = () => {
    onContentUpdate?.();
  };

  const handleRejected = () => {
    onContentUpdate?.();
  };

  // Extract clean segment name from key (e.g., "intro-549" -> "Intro")
  const getSegmentDisplayName = () => {
    const baseName = segmentKey.split('-')[0];
    return baseName.charAt(0).toUpperCase() + baseName.slice(1);
  };

  return (
    <div 
      className={cn(
        "relative transition-all duration-200",
        showIndicator && "border-l-4 pl-4",
        getBorderColor(),
        isHovered && isEditMode && "bg-gray-900/5 dark:bg-white/5 rounded-r-lg",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Corner Badge - always visible when there's status to show */}
      {showIndicator && (
        <div className="absolute -top-2 -left-1 z-20">
          <div className={cn(
            "flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium shadow-lg",
            contentStatus === 'draft' && "bg-yellow-500 text-yellow-950",
            contentStatus === 'pending' && "bg-orange-500 text-orange-950",
            isStage2 && contentStatus === 'approved' && "bg-blue-500 text-blue-950"
          )}>
            {isStage2 && <Layers className="h-3 w-3" />}
            <span>{getStatusLabel()}</span>
          </div>
        </div>
      )}

      {/* Floating Action Bar - appears on hover, positioned at top-right corner */}
      {isEditMode && isHovered && (
        <div className="absolute -top-3 right-4 z-30 flex items-center gap-2">
          {/* Segment Info Pill */}
          <div className="flex items-center gap-2 bg-gray-800/95 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-lg border border-gray-600">
            <span className="text-xs text-gray-300 font-medium">{getSegmentDisplayName()}</span>
            <span className="text-xs text-gray-500 font-mono">{segmentKey}</span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1 bg-gray-800/95 backdrop-blur-sm rounded-full px-2 py-1 shadow-lg border border-gray-600">
            {canEdit && (
              <Button 
                size="sm"
                variant="ghost"
                className="h-7 w-7 p-0 rounded-full text-blue-400 hover:text-blue-300 hover:bg-blue-500/20"
                onClick={(e) => {
                  e.stopPropagation();
                  // TODO: Trigger inline edit mode
                  console.log('Edit clicked for:', segmentKey);
                }}
              >
                <Edit3 className="h-3.5 w-3.5" />
              </Button>
            )}
            
            {needsApproval && canApprove && (
              <>
                <Button 
                  size="sm"
                  variant="ghost"
                  className="h-7 w-7 p-0 rounded-full text-green-400 hover:text-green-300 hover:bg-green-500/20"
                  onClick={(e) => {
                    e.stopPropagation();
                    editContext.approveSegment(segmentKey).then(success => {
                      if (success) handleApproved();
                    });
                  }}
                >
                  <Check className="h-3.5 w-3.5" />
                </Button>
                <Button 
                  size="sm"
                  variant="ghost"
                  className="h-7 w-7 p-0 rounded-full text-red-400 hover:text-red-300 hover:bg-red-500/20"
                  onClick={(e) => {
                    e.stopPropagation();
                    editContext.rejectSegment(segmentKey).then(success => {
                      if (success) handleRejected();
                    });
                  }}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Content */}
      <div className={cn(
        "transition-opacity",
        contentStatus === 'draft' && "opacity-90"
      )}>
        {children}
      </div>
    </div>
  );
};