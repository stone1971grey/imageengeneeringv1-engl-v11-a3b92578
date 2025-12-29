import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, Copy, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CopyPageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sourcePageSlug: string;
  sourcePageTitle: string;
  onSuccess?: (newSlug: string) => void;
}

export function CopyPageDialog({ 
  open, 
  onOpenChange, 
  sourcePageSlug, 
  sourcePageTitle,
  onSuccess 
}: CopyPageDialogProps) {
  const [newSlug, setNewSlug] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [validationSuccess, setValidationSuccess] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isCopying, setIsCopying] = useState(false);

  // Initialize with suggested values when dialog opens
  useEffect(() => {
    if (open && sourcePageSlug) {
      setNewSlug(`${sourcePageSlug}-copy`);
      setNewTitle(`${sourcePageTitle} (Copy)`);
      setValidationError(null);
      setValidationSuccess(null);
    }
  }, [open, sourcePageSlug, sourcePageTitle]);

  const handleSlugChange = (value: string) => {
    setNewSlug(value);
    setValidationError(null);
    setValidationSuccess(null);
  };

  const validateSlug = async (): Promise<boolean> => {
    if (!newSlug.trim()) {
      setValidationError("Please enter a slug");
      return false;
    }

    if (!newTitle.trim()) {
      setValidationError("Please enter a title");
      return false;
    }

    setIsValidating(true);
    setValidationError(null);
    setValidationSuccess(null);

    try {
      const trimmedSlug = newSlug.trim().replace(/\s+/g, "");

      // Check if a page with this slug already exists
      const { data: existingPage, error: existingError } = await supabase
        .from('page_registry')
        .select('page_id, page_slug, page_title')
        .eq('page_slug', trimmedSlug)
        .maybeSingle();

      if (existingError) {
        console.error("Error checking existing page:", existingError);
        setValidationError("Database error checking existing page");
        setIsValidating(false);
        return false;
      }

      if (existingPage) {
        setValidationError(`Page "${trimmedSlug}" already exists (ID ${existingPage.page_id}).`);
        setIsValidating(false);
        return false;
      }

      // For hierarchical slugs, check if parent exists
      const slugParts = trimmedSlug.split('/').filter(Boolean);
      if (slugParts.length > 1) {
        const parentSlug = slugParts.slice(0, -1).join('/');
        const { data: parentPage, error: parentError } = await supabase
          .from('page_registry')
          .select('page_id, page_slug')
          .or(`page_slug.eq.${parentSlug},page_slug.ilike.%/${parentSlug}`)
          .maybeSingle();

        if (parentError) {
          console.error("Error checking parent:", parentError);
          setValidationError("Database error checking parent page");
          setIsValidating(false);
          return false;
        }

        if (!parentPage) {
          setValidationError(`Parent page "${parentSlug}" does not exist.`);
          setIsValidating(false);
          return false;
        }
      }

      setValidationSuccess("✓ Slug is available");
      setIsValidating(false);
      return true;

    } catch (err) {
      console.error("Validation error:", err);
      setValidationError("Unexpected error during validation");
      setIsValidating(false);
      return false;
    }
  };

  const handleCopy = async () => {
    // Validate first
    const isValid = await validateSlug();
    if (!isValid) return;

    setIsCopying(true);

    try {
      const trimmedSlug = newSlug.trim();
      const languages = ['en', 'de', 'ja', 'ko', 'zh'];

      // 1. Get source page info from page_registry
      const { data: sourcePage, error: sourceError } = await supabase
        .from('page_registry')
        .select('*')
        .eq('page_slug', sourcePageSlug)
        .maybeSingle();

      if (sourceError || !sourcePage) {
        throw new Error("Source page not found in registry");
      }

      // 2. Get next page_id atomically (prevents reuse of deleted IDs)
      const { data: nextIdResult, error: nextIdError } = await supabase
        .rpc('get_next_page_id');

      if (nextIdError) {
        console.error('Error getting next page_id:', nextIdError);
        throw new Error('Failed to get next page ID');
      }

      const newPageId = nextIdResult as number;

      // Determine parent_slug and parent_id for the new page
      const slugParts = trimmedSlug.split('/').filter(Boolean);
      let parentSlug: string | null = null;
      let parentId: number | null = null;

      if (slugParts.length > 1) {
        parentSlug = slugParts.slice(0, -1).join('/');
        const { data: parentPage } = await supabase
          .from('page_registry')
          .select('page_id')
          .eq('page_slug', parentSlug)
          .maybeSingle();
        parentId = parentPage?.page_id || null;
      }

      // 3. Create new page_registry entry
      const { error: registryError } = await supabase
        .from('page_registry')
        .insert({
          page_id: newPageId,
          page_slug: trimmedSlug,
          page_title: newTitle.trim(),
          parent_slug: parentSlug,
          parent_id: parentId,
          design_icon: sourcePage.design_icon,
          flyout_image_url: sourcePage.flyout_image_url,
          flyout_description: sourcePage.flyout_description,
          flyout_description_translations: sourcePage.flyout_description_translations,
        });

      if (registryError) throw registryError;

      // 4. Copy segment_registry entries
      const { data: sourceSegments, error: segmentsError } = await supabase
        .from('segment_registry')
        .select('*')
        .eq('page_slug', sourcePageSlug)
        .eq('deleted', false);

      if (segmentsError) throw segmentsError;

      // Get max segment_id
      const { data: maxSegment } = await supabase
        .from('segment_registry')
        .select('segment_id')
        .order('segment_id', { ascending: false })
        .limit(1)
        .single();

      let nextSegmentId = (maxSegment?.segment_id || 0) + 1;
      const segmentIdMap: Record<string, number> = {}; // old_id -> new_id

      // Create new segment entries
      for (const segment of sourceSegments || []) {
        const newSegmentId = nextSegmentId++;
        const newSegmentKey = `${segment.segment_type}-${newSegmentId}`;
        segmentIdMap[segment.segment_id.toString()] = newSegmentId;

        const { error: insertError } = await supabase
          .from('segment_registry')
          .insert({
            segment_id: newSegmentId,
            page_slug: trimmedSlug,
            segment_type: segment.segment_type,
            segment_key: newSegmentKey,
            is_static: false,
            deleted: false,
            position: segment.position,
          });

        if (insertError) throw insertError;
      }

      // 5. Copy page_content for all languages
      for (const lang of languages) {
        // Get all content for this page and language
        const { data: sourceContent, error: contentError } = await supabase
          .from('page_content')
          .select('*')
          .eq('page_slug', sourcePageSlug)
          .eq('language', lang);

        if (contentError) throw contentError;

        for (const content of sourceContent || []) {
          let newSectionKey = content.section_key;
          let newContentValue = content.content_value;

          // Handle segment-specific content (e.g., "intro-5", "faq-12")
          // Check if section_key matches a segment pattern
          const segmentMatch = content.section_key.match(/^(.+)-(\d+)$/);
          if (segmentMatch) {
            const oldId = segmentMatch[2];
            if (segmentIdMap[oldId]) {
              newSectionKey = `${segmentMatch[1]}-${segmentIdMap[oldId]}`;
            }
          }

          // Handle page_segments array - update segment IDs
          if (content.section_key === 'page_segments') {
            try {
              const segments = JSON.parse(content.content_value);
              const updatedSegments = segments.map((seg: any) => ({
                ...seg,
                id: segmentIdMap[seg.id]?.toString() || seg.id,
              }));
              newContentValue = JSON.stringify(updatedSegments);
            } catch (e) {
              console.error('Error parsing page_segments:', e);
            }
          }

          // Handle tab_order array - update segment IDs
          if (content.section_key === 'tab_order') {
            try {
              const tabOrder = JSON.parse(content.content_value);
              const updatedTabOrder = tabOrder.map((id: string) => 
                segmentIdMap[id]?.toString() || id
              );
              newContentValue = JSON.stringify(updatedTabOrder);
            } catch (e) {
              console.error('Error parsing tab_order:', e);
            }
          }

          const { error: insertContentError } = await supabase
            .from('page_content')
            .insert({
              page_slug: trimmedSlug,
              section_key: newSectionKey,
              content_type: content.content_type,
              content_value: newContentValue,
              language: lang,
            });

          if (insertContentError) {
            console.error('Error inserting content:', insertContentError);
            // Continue with other content even if one fails
          }
        }
      }

      // Success!
      toast.success(`Page copied successfully! New page: "${newTitle}" (ID: ${newPageId})`);
      onOpenChange(false);
      
      // Trigger refresh of page selector
      window.dispatchEvent(new Event('refreshPageSelector'));

      if (onSuccess) {
        onSuccess(trimmedSlug);
      }

    } catch (error) {
      console.error('Error copying page:', error);
      toast.error(error instanceof Error ? error.message : "Failed to copy page");
    } finally {
      setIsCopying(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Copy className="h-5 w-5" />
            Copy Page
          </DialogTitle>
          <DialogDescription>
            Create a complete copy of "{sourcePageTitle}" including all segments and content in all languages.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Source Info */}
          <div className="p-3 bg-gray-100 rounded-lg">
            <p className="text-sm text-gray-600">Copying from:</p>
            <p className="font-semibold text-gray-900">{sourcePageTitle}</p>
            <p className="text-sm font-mono text-gray-500">{sourcePageSlug}</p>
          </div>

          {/* New Title */}
          <div className="space-y-2">
            <Label htmlFor="new-title">New Page Title</Label>
            <Input
              id="new-title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Enter the title for the new page"
            />
          </div>

          {/* New Slug */}
          <div className="space-y-2">
            <Label htmlFor="new-slug">New Page Slug</Label>
            <div className="flex gap-2">
              <Input
                id="new-slug"
                value={newSlug}
                onChange={(e) => handleSlugChange(e.target.value)}
                placeholder="e.g., products/test-charts/new-chart"
                className="flex-1"
              />
              <Button 
                onClick={validateSlug} 
                disabled={isValidating || !newSlug.trim()}
                variant="outline"
              >
                {isValidating ? "Checking..." : "Validate"}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Use slashes (/) to maintain hierarchy. Parent pages must exist.
            </p>
          </div>

          {/* Validation Feedback */}
          {validationError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{validationError}</AlertDescription>
            </Alert>
          )}

          {validationSuccess && (
            <Alert className="border-green-500 bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">{validationSuccess}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isCopying}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleCopy}
            disabled={isCopying || !newSlug.trim() || !newTitle.trim()}
            className="bg-[#f9dc24] text-black hover:bg-[#f9dc24]/90"
          >
            {isCopying ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Copying...
              </>
            ) : (
              <>
                <Copy className="mr-2 h-4 w-4" />
                Copy Page
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
