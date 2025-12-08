import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Link2, X } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface ShortcutEditorProps {
  pageId: number;
  pageSlug: string;
  pageTitle: string;
  currentTargetSlug: string | null;
  onShortcutUpdated: () => void;
}

interface PageOption {
  page_id: number;
  page_slug: string;
  page_title: string;
}

export const ShortcutEditor = ({
  pageId,
  pageSlug,
  pageTitle,
  currentTargetSlug,
  onShortcutUpdated,
}: ShortcutEditorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isShortcut, setIsShortcut] = useState(!!currentTargetSlug);
  const [targetSlug, setTargetSlug] = useState(currentTargetSlug || "");
  const [availablePages, setAvailablePages] = useState<PageOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadAvailablePages();
    }
  }, [isOpen]);

  useEffect(() => {
    setIsShortcut(!!currentTargetSlug);
    setTargetSlug(currentTargetSlug || "");
  }, [currentTargetSlug]);

  const loadAvailablePages = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("page_registry")
        .select("page_id, page_slug, page_title")
        .neq("page_id", pageId) // Exclude current page
        .is("target_page_slug", null) // Only non-shortcut pages as targets
        .order("page_slug", { ascending: true });

      if (error) throw error;
      setAvailablePages(data || []);
    } catch (error) {
      console.error("Error loading pages:", error);
      toast.error("Failed to load available pages");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const newTargetSlug = isShortcut && targetSlug ? targetSlug : null;

      const { error } = await supabase
        .from("page_registry")
        .update({ target_page_slug: newTargetSlug })
        .eq("page_id", pageId);

      if (error) throw error;

      // Also update navigation_links if applicable
      if (newTargetSlug) {
        await supabase
          .from("navigation_links")
          .update({ target_page_slug: newTargetSlug })
          .like("slug", `%${pageSlug}%`);
      } else {
        await supabase
          .from("navigation_links")
          .update({ target_page_slug: null })
          .like("slug", `%${pageSlug}%`);
      }

      toast.success(
        newTargetSlug
          ? `Shortcut saved: redirects to ${newTargetSlug}`
          : "Shortcut removed"
      );
      setIsOpen(false);
      onShortcutUpdated();
    } catch (error) {
      console.error("Error saving shortcut:", error);
      toast.error("Failed to save shortcut");
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveShortcut = async () => {
    setIsShortcut(false);
    setTargetSlug("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="ghost"
          className={
            currentTargetSlug
              ? "text-orange-400 hover:text-orange-300 hover:bg-orange-900/20"
              : "text-gray-500 hover:text-gray-300 hover:bg-gray-700"
          }
          title={currentTargetSlug ? `Shortcut to: ${currentTargetSlug}` : "Set as shortcut"}
        >
          <Link2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <Link2 className="h-5 w-5 text-orange-400" />
            Shortcut Configuration
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="bg-gray-800 p-4 rounded-lg">
            <p className="text-sm text-gray-400 mb-1">Current Page</p>
            <p className="font-medium">{pageTitle}</p>
            <p className="text-sm text-gray-500 font-mono">{pageSlug}</p>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="shortcut-toggle" className="text-base">
                This page is a shortcut
              </Label>
              <p className="text-sm text-gray-400 mt-1">
                Visitors will be redirected to another page
              </p>
            </div>
            <Switch
              id="shortcut-toggle"
              checked={isShortcut}
              onCheckedChange={(checked) => {
                setIsShortcut(checked);
                if (!checked) {
                  setTargetSlug("");
                }
              }}
            />
          </div>

          {isShortcut && (
            <div className="space-y-3">
              <Label>Redirect to</Label>
              {loading ? (
                <div className="text-gray-400 text-sm">Loading pages...</div>
              ) : (
                <Select value={targetSlug} onValueChange={setTargetSlug}>
                  <SelectTrigger className="bg-gray-800 border-gray-600">
                    <SelectValue placeholder="Select target page..." />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600 max-h-80">
                    {availablePages.map((page) => (
                      <SelectItem
                        key={page.page_id}
                        value={page.page_slug}
                        className="text-white hover:bg-gray-700"
                      >
                        <div className="flex flex-col items-start">
                          <span>{page.page_title}</span>
                          <span className="text-xs text-gray-400 font-mono">
                            {page.page_slug}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {targetSlug && (
                <div className="bg-orange-900/20 border border-orange-600/30 p-3 rounded-lg">
                  <p className="text-sm text-orange-200">
                    <span className="font-medium">Preview:</span> When users visit{" "}
                    <span className="font-mono text-orange-300">/{pageSlug}</span>,
                    they will be redirected to{" "}
                    <span className="font-mono text-orange-300">/{targetSlug}</span>
                  </p>
                </div>
              )}
            </div>
          )}

          {currentTargetSlug && !isShortcut && (
            <div className="bg-yellow-900/20 border border-yellow-600/30 p-3 rounded-lg">
              <p className="text-sm text-yellow-200">
                The shortcut will be removed when you save.
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            className="bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || (isShortcut && !targetSlug)}
            className="bg-orange-600 hover:bg-orange-700 text-white"
          >
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Badge component for showing shortcut status in tables
export const ShortcutBadge = ({ targetSlug }: { targetSlug: string | null }) => {
  if (!targetSlug) return null;

  return (
    <Badge
      variant="outline"
      className="bg-orange-900/30 border-orange-600 text-orange-200 text-xs"
      title={`Shortcut to: ${targetSlug}`}
    >
      <Link2 className="h-3 w-3 mr-1" />
      Shortcut
    </Badge>
  );
};
