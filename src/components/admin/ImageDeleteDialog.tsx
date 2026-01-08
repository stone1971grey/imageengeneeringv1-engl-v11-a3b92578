import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ImageDeleteDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  pageSlug: string;
  sectionKeys: string[]; // e.g., ["footer_team_image_url", "footer_team_image_metadata"]
  language: string;
  imageLabel?: string; // e.g., "Team Image", "Background Image"
  onDeleteComplete: () => void;
}

const ALL_LANGUAGES = ["en", "de", "ja", "ko", "zh"];

export const ImageDeleteDialog = ({
  isOpen,
  onOpenChange,
  pageSlug,
  sectionKeys,
  language,
  imageLabel = "Image",
  onDeleteComplete,
}: ImageDeleteDialogProps) => {
  const handleDeleteCurrentLanguage = async () => {
    console.log(`[ImageDeleteDialog] Deleting ${imageLabel} for ${language} only...`);
    
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) {
        toast.error("User not authenticated");
        return;
      }

      for (const sectionKey of sectionKeys) {
        const { error } = await supabase
          .from("page_content")
          .delete()
          .eq("page_slug", pageSlug)
          .eq("section_key", sectionKey)
          .eq("language", language);

        if (error) {
          console.error(`[ImageDeleteDialog] Delete error for ${sectionKey}:`, error);
        }
      }

      toast.success(`${imageLabel} deleted for ${language.toUpperCase()} only.`);
      onDeleteComplete();
      onOpenChange(false);
    } catch (error: any) {
      console.error("[ImageDeleteDialog] Error:", error);
      toast.error("Failed to delete image: " + error.message);
    }
  };

  const handleDeleteAllLanguages = async () => {
    console.log(`[ImageDeleteDialog] Deleting ${imageLabel} for ALL languages...`);
    
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) {
        toast.error("User not authenticated");
        return;
      }

      for (const lang of ALL_LANGUAGES) {
        for (const sectionKey of sectionKeys) {
          const { error } = await supabase
            .from("page_content")
            .delete()
            .eq("page_slug", pageSlug)
            .eq("section_key", sectionKey)
            .eq("language", lang);

          if (error) {
            console.error(`[ImageDeleteDialog] Delete error for ${sectionKey} (${lang}):`, error);
          }
        }
      }

      toast.success(`${imageLabel} deleted for all languages.`);
      onDeleteComplete();
      onOpenChange(false);
    } catch (error: any) {
      console.error("[ImageDeleteDialog] Error:", error);
      toast.error("Failed to delete image: " + error.message);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-gray-900 border-gray-700">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-white">Delete {imageLabel}</AlertDialogTitle>
          <AlertDialogDescription className="text-gray-400">
            Do you want to delete this image only in {language.toUpperCase()} or in all language versions?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex flex-col sm:flex-row gap-2 mt-4">
          <Button
            variant="outline"
            className="bg-gray-700 text-white hover:bg-gray-600 border-none"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            className="bg-brand-primary text-brand-primary-foreground hover:bg-brand-primary-hover"
            onClick={handleDeleteCurrentLanguage}
          >
            {language.toUpperCase()} only
          </Button>
          <Button
            className="bg-red-500 text-white hover:bg-red-600"
            onClick={handleDeleteAllLanguages}
          >
            All languages
          </Button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};

// Helper for segment-based editors (page_segments JSON storage)
interface SegmentImageDeleteDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  pageSlug: string;
  segmentId: string;
  imageField: string; // e.g., "backgroundImage", "imageUrl", "heroImageUrl"
  language: string;
  imageLabel?: string;
  onDeleteComplete: () => void;
}

export const SegmentImageDeleteDialog = ({
  isOpen,
  onOpenChange,
  pageSlug,
  segmentId,
  imageField,
  language,
  imageLabel = "Image",
  onDeleteComplete,
}: SegmentImageDeleteDialogProps) => {
  const deleteImageFromSegment = async (targetLanguage: string) => {
    try {
      const { data: pageContent, error: fetchError } = await supabase
        .from("page_content")
        .select("*")
        .eq("page_slug", pageSlug)
        .eq("section_key", "page_segments")
        .eq("language", targetLanguage)
        .single();

      if (fetchError || !pageContent) {
        console.log(`[SegmentImageDeleteDialog] No content for ${targetLanguage}`);
        return;
      }

      const segments = JSON.parse(pageContent.content_value);
      const segmentIndex = segments.findIndex((s: any) => String(s.id) === String(segmentId));

      if (segmentIndex >= 0 && segments[segmentIndex].data) {
        // Clear the image field
        segments[segmentIndex].data[imageField] = "";
        // Also clear related metadata fields if they exist
        if (imageField === "backgroundImage") {
          segments[segmentIndex].data.altText = "";
        } else if (imageField === "imageUrl") {
          segments[segmentIndex].data.imageAlt = "";
          segments[segmentIndex].data.imageMetadata = null;
        } else if (imageField === "heroImageUrl") {
          segments[segmentIndex].data.heroImageMetadata = null;
        }

        const { error: updateError } = await supabase
          .from("page_content")
          .update({
            content_value: JSON.stringify(segments),
            updated_at: new Date().toISOString(),
          })
          .eq("page_slug", pageSlug)
          .eq("section_key", "page_segments")
          .eq("language", targetLanguage);

        if (updateError) {
          console.error(`[SegmentImageDeleteDialog] Update error for ${targetLanguage}:`, updateError);
        }
      }
    } catch (error) {
      console.error(`[SegmentImageDeleteDialog] Error deleting for ${targetLanguage}:`, error);
    }
  };

  const handleDeleteCurrentLanguage = async () => {
    console.log(`[SegmentImageDeleteDialog] Deleting ${imageLabel} for ${language} only...`);
    await deleteImageFromSegment(language);
    toast.success(`${imageLabel} deleted for ${language.toUpperCase()} only.`);
    onDeleteComplete();
    onOpenChange(false);
  };

  const handleDeleteAllLanguages = async () => {
    console.log(`[SegmentImageDeleteDialog] Deleting ${imageLabel} for ALL languages...`);
    for (const lang of ALL_LANGUAGES) {
      await deleteImageFromSegment(lang);
    }
    toast.success(`${imageLabel} deleted for all languages.`);
    onDeleteComplete();
    onOpenChange(false);
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-gray-900 border-gray-700">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-white">Delete {imageLabel}</AlertDialogTitle>
          <AlertDialogDescription className="text-gray-400">
            Do you want to delete this image only in {language.toUpperCase()} or in all language versions?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex flex-col sm:flex-row gap-2 mt-4">
          <Button
            variant="outline"
            className="bg-gray-700 text-white hover:bg-gray-600 border-none"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            className="bg-brand-primary text-brand-primary-foreground hover:bg-brand-primary-hover"
            onClick={handleDeleteCurrentLanguage}
          >
            {language.toUpperCase()} only
          </Button>
          <Button
            className="bg-red-500 text-white hover:bg-red-600"
            onClick={handleDeleteAllLanguages}
          >
            All languages
          </Button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};
