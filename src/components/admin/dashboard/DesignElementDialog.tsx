import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Save, Trash2 } from "lucide-react";
import { DESIGN_ICON_OPTIONS } from './AdminConstants';

interface DesignElementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pageInfo: {
    pageId: number;
    designIcon?: string | null;
  } | null;
  pendingDesignIcon: string | null;
  setPendingDesignIcon: (icon: string | null) => void;
  onSave: () => void;
  onRemove: () => void;
}

export function DesignElementDialog({
  open,
  onOpenChange,
  pageInfo,
  pendingDesignIcon,
  setPendingDesignIcon,
  onSave,
  onRemove,
}: DesignElementDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Select design element</DialogTitle>
          <DialogDescription>
            Choose an icon that will appear in the segment bar and navigation for this page.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <p className="text-xs text-gray-500">
            Design elements can only be selected for second-level navigation pages (direct children of main sections like "Industries" or "Products").
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {DESIGN_ICON_OPTIONS.map((option) => {
              const IconComp = option.Icon;
              const isActive = (pendingDesignIcon ?? pageInfo?.designIcon) === option.key;
              return (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => setPendingDesignIcon(option.key)}
                  className={`flex flex-col items-center justify-center rounded-lg border px-3 py-2 text-sm transition-colors ${
                    isActive
                      ? 'border-primary bg-primary/10 text-primary-foreground'
                      : 'border-border bg-card text-foreground hover:border-primary hover:bg-muted'
                  }`}
                >
                  <IconComp className="h-5 w-5 mb-1" />
                  <span>{option.label}</span>
                </button>
              );
            })}
          </div>
          <div className="flex justify-between items-center pt-2 border-t mt-2">
            <div className="text-xs text-gray-500">
              {pageInfo?.designIcon
                ? `Current: ${pageInfo.designIcon}`
                : 'No design element selected yet'}
            </div>
            <div className="flex gap-2">
              {pageInfo?.designIcon && (
                <Button variant="outline" size="sm" onClick={onRemove}>
                  <Trash2 className="h-3 w-3 mr-1" />
                  Remove
                </Button>
              )}
              <Button size="sm" onClick={onSave} disabled={!pendingDesignIcon}>
                <Save className="h-3 w-3 mr-1" />
                Save
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
