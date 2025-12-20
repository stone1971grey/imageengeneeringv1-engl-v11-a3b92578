import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save } from "lucide-react";
import { CTA_GROUP_OPTIONS } from './AdminConstants';

interface NavigationCtaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pageInfo: {
    pageTitle: string;
  } | null;
  ctaGroup: string;
  setCtaGroup: (group: string) => void;
  ctaIcon: string;
  setCtaIcon: (icon: string) => void;
  ctaLabel: string;
  setCtaLabel: (label: string) => void;
  isSaving: boolean;
  onSave: () => void;
}

export function NavigationCtaDialog({
  open,
  onOpenChange,
  pageInfo,
  ctaGroup,
  setCtaGroup,
  ctaIcon,
  setCtaIcon,
  ctaLabel,
  setCtaLabel,
  isSaving,
  onSave,
}: NavigationCtaDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl bg-[hsl(var(--background))] text-[hsl(var(--foreground))] border border-[hsl(var(--border))]">
        <DialogHeader>
          <DialogTitle>Navigation CTA for this page</DialogTitle>
          <DialogDescription className="text-[hsl(var(--muted-foreground))]">
            Define whether this page should be used as a call-to-action button in the main navigation flyouts.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div>
            <p className="text-xs text-[hsl(var(--muted-foreground))] mb-2">
              Only one page can be assigned per CTA group. Saving here will replace any existing CTA for the selected group.
            </p>
            <Label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">CTA Group</Label>
            <select
              className="w-full rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-sm text-[hsl(var(--foreground))]"
              value={ctaGroup}
              onChange={(e) => setCtaGroup(e.target.value)}
            >
              {CTA_GROUP_OPTIONS.map((opt) => (
                <option key={opt.key} value={opt.key}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">CTA Icon</Label>
            <select
              className="w-full rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-sm text-[hsl(var(--foreground))]"
              value={ctaIcon}
              onChange={(e) => setCtaIcon(e.target.value)}
            >
              <option value="auto">Automatic (recommended)</option>
              <option value="search">Search icon (magnifier)</option>
              <option value="microscope">Microscope icon</option>
              <option value="none">No icon</option>
            </select>
            <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
              The selected icon appears left of the CTA label in the navigation flyout.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">Button label</label>
            <Input
              type="text"
              value={ctaLabel}
              onChange={(e) => setCtaLabel(e.target.value)}
              placeholder={pageInfo?.pageTitle || 'Button label'}
              className="bg-[hsl(var(--background))] text-[hsl(var(--foreground))] border-[hsl(var(--border))]"
            />
            <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
              If left empty, the page title "{pageInfo?.pageTitle}" will be used.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t mt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setCtaGroup('none');
                setCtaLabel('');
              }}
            >
              Clear CTA
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={onSave}
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : (
                <>
                  <Save className="h-3 w-3 mr-1" />
                  Save CTA
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
