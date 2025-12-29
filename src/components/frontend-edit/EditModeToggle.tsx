import React from 'react';
import { Button } from '@/components/ui/button';
import { Edit3, Eye, Loader2 } from 'lucide-react';
import { useFrontendEditOptional } from '@/contexts/FrontendEditContext';
import { cn } from '@/lib/utils';

interface EditModeToggleProps {
  className?: string;
}

export const EditModeToggle: React.FC<EditModeToggleProps> = ({ className }) => {
  const editContext = useFrontendEditOptional();

  // Don't render if no context or user can't edit
  if (!editContext || !editContext.canEdit) {
    return null;
  }

  const { isEditMode, setEditMode, isLoading, pendingChanges } = editContext;
  const pendingCount = pendingChanges.size;

  if (isLoading) {
    return (
      <Button
        variant="outline"
        size="sm"
        disabled
        className={cn("gap-2", className)}
      >
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading...
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setEditMode(!isEditMode)}
      className={cn(
        "gap-2 transition-all font-medium",
        isEditMode 
          ? "bg-[#f9dc24] hover:bg-[#e5c820] text-black" 
          : "bg-black hover:bg-gray-800 text-white",
        className
      )}
    >
      {isEditMode ? (
        <>
          <Edit3 className="h-4 w-4" />
          Editing active
          {pendingCount > 0 && (
            <span className="ml-1 bg-black text-[#f9dc24] text-xs px-1.5 py-0.5 rounded-full font-medium">
              {pendingCount}
            </span>
          )}
        </>
      ) : (
        <>
          <Edit3 className="h-4 w-4" />
          Edit
        </>
      )}
    </Button>
  );
};
