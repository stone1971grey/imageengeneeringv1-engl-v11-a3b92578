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
import { Input } from "@/components/ui/input";
import { Link2, ArrowRight, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface ShortcutEditorProps {
  pageId: number;
  pageSlug: string;
  pageTitle: string;
  currentTargetSlug: string | null;
  onShortcutUpdated: () => void;
}

interface TargetPageInfo {
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
  const [targetPageId, setTargetPageId] = useState<string>("");
  const [targetPageInfo, setTargetPageInfo] = useState<TargetPageInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && currentTargetSlug) {
      loadCurrentTargetInfo();
    }
  }, [isOpen, currentTargetSlug]);

  useEffect(() => {
    setIsShortcut(!!currentTargetSlug);
  }, [currentTargetSlug]);

  const loadCurrentTargetInfo = async () => {
    if (!currentTargetSlug) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("page_registry")
        .select("page_id, page_slug, page_title")
        .eq("page_slug", currentTargetSlug)
        .maybeSingle();

      if (!error && data) {
        setTargetPageId(data.page_id.toString());
        setTargetPageInfo(data);
      }
    } catch (error) {
      console.error("Error loading target info:", error);
    } finally {
      setLoading(false);
    }
  };

  const validatePageId = async (inputPageId: string) => {
    setValidationError(null);
    setTargetPageInfo(null);

    if (!inputPageId.trim()) {
      return;
    }

    const numericId = parseInt(inputPageId, 10);
    if (isNaN(numericId)) {
      setValidationError("Please enter a valid number");
      return;
    }

    if (numericId === pageId) {
      setValidationError("Cannot redirect to itself");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("page_registry")
        .select("page_id, page_slug, page_title, target_page_slug")
        .eq("page_id", numericId)
        .maybeSingle();

      if (error || !data) {
        setValidationError(`Page ID ${numericId} not found`);
        return;
      }

      if (data.target_page_slug) {
        setValidationError("Target page is itself a shortcut");
        return;
      }

      setTargetPageInfo(data);
    } catch (error) {
      setValidationError("Error validating page");
    } finally {
      setLoading(false);
    }
  };

  const handlePageIdChange = (value: string) => {
    setTargetPageId(value);
    // Debounce validation
    const timeoutId = setTimeout(() => {
      validatePageId(value);
    }, 500);
    return () => clearTimeout(timeoutId);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const newTargetSlug = isShortcut && targetPageInfo ? targetPageInfo.page_slug : null;

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
          ? `Shortcut saved: redirects to ID ${targetPageInfo?.page_id}`
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

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-1.5 bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200 hover:border-blue-300"
          title={currentTargetSlug ? `Shortcut to: ${currentTargetSlug}` : "Configure shortcut"}
        >
          <Link2 className="h-3.5 w-3.5" />
          Shortcut
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <Link2 className="h-5 w-5 text-[#f9dc24]" />
            Shortcut Configuration
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="bg-gray-800 p-4 rounded-lg">
            <p className="text-sm text-gray-400 mb-1">Current Page</p>
            <div className="flex items-center gap-2">
              <Badge className="bg-blue-600 text-white">ID {pageId}</Badge>
              <span className="font-medium">{pageTitle}</span>
            </div>
            <p className="text-sm text-gray-500 font-mono mt-1">{pageSlug}</p>
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
                  setTargetPageId("");
                  setTargetPageInfo(null);
                  setValidationError(null);
                }
              }}
            />
          </div>

          {isShortcut && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="target-page-id" className="text-sm font-medium">
                  Target Page ID
                </Label>
                <Input
                  id="target-page-id"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="Enter Page ID (e.g., 123)"
                  value={targetPageId}
                  onChange={(e) => handlePageIdChange(e.target.value)}
                  className="mt-2 bg-gray-800 border-gray-600 text-white placeholder:text-gray-500"
                />
              </div>

              {loading && (
                <div className="text-gray-400 text-sm flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                  Validating...
                </div>
              )}

              {validationError && (
                <div className="flex items-center gap-2 text-red-400 text-sm bg-red-900/20 p-3 rounded-lg border border-red-600/30">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  {validationError}
                </div>
              )}

              {targetPageInfo && !validationError && (
                <div className="bg-green-900/20 border border-green-600/30 p-4 rounded-lg">
                  <div className="flex items-center gap-2 text-green-300 mb-2">
                    <CheckCircle className="h-4 w-4" />
                    <span className="font-medium">Valid target</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Badge className="bg-blue-600 text-white">ID {targetPageInfo.page_id}</Badge>
                    <span className="text-white">{targetPageInfo.page_title}</span>
                  </div>
                  <p className="text-xs text-gray-400 font-mono mt-2">{targetPageInfo.page_slug}</p>
                  
                  <div className="mt-3 pt-3 border-t border-green-600/30 flex items-center gap-2 text-green-200 text-sm">
                    <span className="font-mono text-xs">/{pageSlug}</span>
                    <ArrowRight className="h-4 w-4" />
                    <span className="font-mono text-xs">/{targetPageInfo.page_slug}</span>
                  </div>
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
            disabled={saving || (isShortcut && (!targetPageInfo || !!validationError))}
            className="bg-[#f9dc24] hover:bg-[#f9dc24]/90 text-black font-semibold"
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
      className="bg-[#f9dc24] text-black border-[#f9dc24] text-xs font-semibold"
      title={`Shortcut → ${targetSlug}`}
    >
      <Link2 className="h-3 w-3 mr-1" />
      Shortcut
    </Badge>
  );
};