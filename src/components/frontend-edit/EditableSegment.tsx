import React, { useState, createContext, useContext } from 'react';
import { useFrontendEditOptional } from '@/contexts/FrontendEditContext';
import { ApprovalBadge } from './ApprovalBadge';
import { ApproveButton } from './ApproveButton';
import { Edit3, Check, X, Layers, Save } from 'lucide-react';
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
    if (isSegmentEditing) return 'border-l-[#f9dc24]';
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

  // Extract segment ID from key (e.g., "intro-549" -> "549")
  const getSegmentId = () => {
    const parts = segmentKey.split('-');
    const lastPart = parts[parts.length - 1];
    // Check if last part is a number
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
        {/* Corner Badge - always visible when there's status to show */}
        {showIndicator && !isSegmentEditing && (
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

        {/* Editing Mode Banner */}
        {isSegmentEditing && (
          <div className="absolute -top-3 left-0 right-0 z-30 flex items-center justify-between px-4">
            <div className="flex items-center gap-2 bg-[#f9dc24] text-black px-3 py-1.5 rounded-lg shadow-lg font-medium text-sm">
              <Edit3 className="h-4 w-4" />
              <span>Bearbeitungsmodus aktiv</span>
            </div>
            <Button
              size="sm"
              onClick={handleDoneEditing}
              className="bg-black text-[#f9dc24] hover:bg-gray-900 font-medium shadow-lg"
            >
              <Save className="h-4 w-4 mr-1.5" />
              Fertig
            </Button>
          </div>
        )}

        {/* Floating Action Bar - appears on hover when NOT in segment editing mode */}
        {isEditMode && isHovered && !isSegmentEditing && (
          <div className="absolute top-4 right-4 z-30 flex items-center gap-2">
            {/* Segment ID Badge - Black with Yellow */}
            <div className="flex items-center bg-black rounded-md px-3 py-1.5 shadow-lg">
              <span className="text-sm text-[#f9dc24] font-medium">ID: {getSegmentId()}</span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-1 bg-black rounded-md px-2 py-1.5 shadow-lg">
              {canEdit && (
                <Button 
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0 rounded text-[#f9dc24] hover:text-white hover:bg-[#f9dc24]/20"
                  onClick={handleEditClick}
                  title="Segment bearbeiten"
                >
                  <Edit3 className="h-4 w-4" />
                </Button>
              )}
              
              {needsApproval && canApprove && (
                <>
                  <Button 
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 rounded text-green-400 hover:text-green-300 hover:bg-green-500/20"
                    onClick={(e) => {
                      e.stopPropagation();
                      editContext.approveSegment(segmentKey).then(success => {
                        if (success) handleApproved();
                      });
                    }}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 rounded text-red-400 hover:text-red-300 hover:bg-red-500/20"
                    onClick={(e) => {
                      e.stopPropagation();
                      editContext.rejectSegment(segmentKey).then(success => {
                        if (success) handleRejected();
                      });
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Content */}
        <div className={cn(
          "transition-opacity",
          contentStatus === 'draft' && "opacity-90",
          isSegmentEditing && "pt-8"
        )}>
          {children}
        </div>
      </div>
    </SegmentEditContext.Provider>
  );
};