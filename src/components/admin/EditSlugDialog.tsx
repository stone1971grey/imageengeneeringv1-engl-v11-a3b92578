import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Edit2 } from "lucide-react";
import { toast } from "sonner";

interface EditSlugDialogProps {
  pageId: number;
  currentSlug: string;
  pageTitle: string;
  onSlugUpdated: () => void;
}

export const EditSlugDialog = ({ pageId, currentSlug, pageTitle, onSlugUpdated }: EditSlugDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newSlug, setNewSlug] = useState(currentSlug);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleOpen = () => {
    setNewSlug(currentSlug);
    setIsOpen(true);
  };

  const validateSlug = (slug: string): string | null => {
    if (!slug.trim()) {
      return "Slug cannot be empty";
    }
    
    // Check for invalid characters
    if (!/^[a-z0-9/-]+$/.test(slug)) {
      return "Slug can only contain lowercase letters, numbers, hyphens, and forward slashes";
    }
    
    // Check for double slashes
    if (slug.includes('//')) {
      return "Slug cannot contain double slashes";
    }
    
    // Check if starts or ends with slash
    if (slug.startsWith('/') || slug.endsWith('/')) {
      return "Slug cannot start or end with a slash";
    }
    
    return null;
  };

  const handleUpdate = async () => {
    const validationError = validateSlug(newSlug);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    if (newSlug === currentSlug) {
      toast.info("No changes made");
      setIsOpen(false);
      return;
    }

    setIsUpdating(true);
    try {
      // Check if new slug already exists
      const { data: existingPage, error: checkError } = await supabase
        .from('page_registry')
        .select('page_id')
        .eq('page_slug', newSlug)
        .maybeSingle();

      if (checkError) throw checkError;

      if (existingPage && existingPage.page_id !== pageId) {
        toast.error(`Slug "${newSlug}" is already in use by another page`);
        setIsUpdating(false);
        return;
      }

      // Step 1: Update page_registry
      const { error: pageError } = await supabase
        .from('page_registry')
        .update({ page_slug: newSlug })
        .eq('page_id', pageId);

      if (pageError) throw pageError;

      // Step 2: Update segment_registry (all segments for this page)
      const { error: segmentError } = await supabase
        .from('segment_registry')
        .update({ page_slug: newSlug })
        .eq('page_slug', currentSlug);

      if (segmentError) throw segmentError;

      // Step 3: Update page_content (all content for this page)
      const { error: contentError } = await supabase
        .from('page_content')
        .update({ page_slug: newSlug })
        .eq('page_slug', currentSlug);

      if (contentError) throw contentError;

      // Step 4: Update parent_slug for child pages
      const { error: childError } = await supabase
        .from('page_registry')
        .update({ parent_slug: newSlug })
        .eq('parent_slug', currentSlug);

      if (childError) throw childError;

      toast.success(`Slug successfully updated from "${currentSlug}" to "${newSlug}"`);
      toast.info("Please update navigationData.ts manually for all language versions", {
        duration: 10000,
      });
      
      setIsOpen(false);
      onSlugUpdated();
    } catch (error) {
      console.error('Error updating slug:', error);
      toast.error('Failed to update slug. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="ghost"
          className="text-gray-400 hover:text-white hover:bg-gray-700"
          onClick={handleOpen}
        >
          <Edit2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] bg-gray-900 text-white border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-[#f9dc24]">Edit Page Slug</DialogTitle>
          <DialogDescription className="text-gray-400">
            Update the URL slug for "{pageTitle}" (Page ID: {pageId})
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="current-slug" className="text-gray-300">
              Current Slug
            </Label>
            <Input
              id="current-slug"
              value={currentSlug}
              disabled
              className="bg-gray-800 border-gray-700 text-gray-500"
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="new-slug" className="text-gray-300">
              New Slug
            </Label>
            <Input
              id="new-slug"
              value={newSlug}
              onChange={(e) => setNewSlug(e.target.value.toLowerCase())}
              placeholder="e.g., your-solution/photography"
              className="bg-gray-800 border-gray-700 text-white"
            />
            <p className="text-xs text-gray-500">
              Only lowercase letters, numbers, hyphens, and forward slashes allowed
            </p>
          </div>
        </div>

        <div className="bg-blue-900/20 border border-blue-700 rounded-md p-3 mb-2">
          <p className="text-sm text-blue-300 font-medium mb-1">⚠️ Important Notes:</p>
          <ul className="text-xs text-blue-200 space-y-1 list-disc list-inside">
            <li>All segments, content, and child pages will be updated automatically</li>
            <li>You must manually update navigationData.ts for all 5 language versions</li>
            <li>Consider adding a redirect from old URL to new URL</li>
            <li>Old bookmarks and external links will break</li>
          </ul>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isUpdating}
            className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpdate}
            disabled={isUpdating}
            className="bg-[#f9dc24] text-black hover:bg-[#f9dc24]/90"
          >
            {isUpdating ? "Updating..." : "Update Slug"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
