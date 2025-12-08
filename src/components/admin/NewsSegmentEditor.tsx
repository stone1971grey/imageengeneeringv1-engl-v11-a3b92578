import { useState, useEffect, memo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface NewsSegmentEditorProps {
  pageSlug: string;
  segmentId: string;
  onUpdate?: () => void;
  currentPageSlug: string;
}

const NewsSegmentEditorComponent = ({ pageSlug, segmentId, onUpdate, currentPageSlug }: NewsSegmentEditorProps) => {
  const [sectionTitle, setSectionTitle] = useState("Latest News");
  const [sectionDescription, setSectionDescription] = useState(
    "Stay updated with the latest developments in image quality testing and measurement technology"
  );
  const [articleLimit, setArticleLimit] = useState("12");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadContent();
    loadAvailableCategories();
  }, [pageSlug, segmentId]);

  const loadAvailableCategories = async () => {
    try {
      // Fetch ALL unique categories from NewsEditor's NEWS_CATEGORIES plus database
      const { data, error } = await supabase
        .from("news_articles")
        .select("category")
        .not("category", "is", null);

      if (error) throw error;

      // Get unique categories from all articles (published and unpublished)
      const dbCategories = [...new Set(data.map((item) => item.category).filter(Boolean))] as string[];
      
      // Also add standard categories that might not have articles yet
      const standardCategories = [
        "Company",
        "Product Launch",
        "Technology",
        "Standards",
        "Innovation",
        "Partnership",
        "Event",
        "Research",
        "Technical Report",
        "Industry News"
      ];
      
      // Merge and deduplicate
      const allCategories = [...new Set([...dbCategories, ...standardCategories])].sort();
      setAvailableCategories(allCategories);
    } catch (error: any) {
      console.error("Error loading categories:", error);
    }
  };

  const loadContent = async () => {
    try {
      // Load from page_segments JSON in page_content
      const { data, error } = await supabase
        .from("page_content")
        .select("*")
        .eq("page_slug", pageSlug)
        .eq("section_key", "page_segments")
        .eq("language", "en");

      if (error) throw error;

      if (data && data.length > 0) {
        const pageSegments = JSON.parse(data[0].content_value || "[]");
        const newsSegment = pageSegments.find((seg: any) => seg.id === segmentId);
        
        if (newsSegment?.data) {
          setSectionTitle(newsSegment.data.title || "Latest News");
          setSectionDescription(newsSegment.data.description || "Stay updated with the latest developments in image quality testing and measurement technology");
          setArticleLimit(String(newsSegment.data.articleLimit || 12));
          setSelectedCategories(newsSegment.data.categories || []);
        }
      }
    } catch (error: any) {
      console.error("Error loading content:", error);
      toast.error("Failed to load content");
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    console.log("[NewsSegmentEditor] Starting save with:", {
      pageSlug,
      segmentId,
      sectionTitle,
      sectionDescription,
      articleLimit,
      selectedCategories
    });
    
    try {
      // Load current page_segments
      const { data, error } = await supabase
        .from("page_content")
        .select("*")
        .eq("page_slug", pageSlug)
        .eq("section_key", "page_segments")
        .eq("language", "en");

      if (error) {
        console.error("[NewsSegmentEditor] Error loading page_segments:", error);
        throw error;
      }

      console.log("[NewsSegmentEditor] Loaded page_content data:", data);

      if (data && data.length > 0) {
        const pageSegments = JSON.parse(data[0].content_value || "[]");
        console.log("[NewsSegmentEditor] Current page_segments:", pageSegments);
        console.log("[NewsSegmentEditor] Looking for segment with id:", segmentId);
        
        // Find and update the news segment
        let foundSegment = false;
        const updatedSegments = pageSegments.map((seg: any) => {
          console.log("[NewsSegmentEditor] Checking segment:", seg.id, "type:", typeof seg.id, "vs segmentId:", segmentId, "type:", typeof segmentId);
          if (String(seg.id) === String(segmentId)) {
            foundSegment = true;
            console.log("[NewsSegmentEditor] Found matching segment, updating data");
            return {
              ...seg,
              data: {
                ...seg.data,
                title: sectionTitle,
                description: sectionDescription,
                articleLimit: parseInt(articleLimit),
                categories: selectedCategories,
              }
            };
          }
          return seg;
        });

        if (!foundSegment) {
          console.error("[NewsSegmentEditor] Segment not found in page_segments!");
          toast.error("Segment not found in page data");
          setIsSaving(false);
          return;
        }

        console.log("[NewsSegmentEditor] Updated segments:", updatedSegments);

        // Save back to database
        const { error: updateError } = await supabase
          .from("page_content")
          .update({ content_value: JSON.stringify(updatedSegments) })
          .eq("page_slug", pageSlug)
          .eq("section_key", "page_segments")
          .eq("language", "en");

        if (updateError) {
          console.error("[NewsSegmentEditor] Error updating page_content:", updateError);
          throw updateError;
        }

        console.log("[NewsSegmentEditor] Save successful!");
        toast.success("News segment saved successfully");
        onUpdate?.();
      } else {
        console.error("[NewsSegmentEditor] No page_segments found for pageSlug:", pageSlug);
        toast.error("No page data found");
      }
    } catch (error: any) {
      console.error("[NewsSegmentEditor] Error saving content:", error);
      toast.error("Failed to save content: " + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  return (
    <CardContent className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="section-title" className="text-white">Section Title (H2)</Label>
          <Input
            id="section-title"
            value={sectionTitle}
            onChange={(e) => setSectionTitle(e.target.value)}
            placeholder="Latest News"
            className="border-2 border-gray-600"
          />
        </div>

        <div>
          <Label htmlFor="section-description" className="text-white">Section Description</Label>
          <Textarea
            id="section-description"
            value={sectionDescription}
            onChange={(e) => setSectionDescription(e.target.value)}
            placeholder="Stay updated with the latest developments..."
            rows={3}
            className="border-2 border-gray-600"
          />
        </div>
      </div>

      <div className="space-y-4 border-t border-gray-600 pt-6">
        <div>
          <Label htmlFor="article-limit" className="text-white">Number of Articles to Display</Label>
          <Select value={articleLimit} onValueChange={setArticleLimit}>
            <SelectTrigger id="article-limit" className="border-2 border-gray-600">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3">3 Articles</SelectItem>
              <SelectItem value="6">6 Articles</SelectItem>
              <SelectItem value="9">9 Articles</SelectItem>
              <SelectItem value="12">12 Articles</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-white mb-3 block">Category Filter</Label>
          <p className="text-sm text-gray-400 mb-3">
            Select specific categories to filter displayed articles. Leave all unchecked to show all categories.
          </p>
          <div className="grid grid-cols-2 gap-3 bg-gray-700 p-4 rounded-lg border border-gray-600 max-h-[300px] overflow-y-auto">
            {availableCategories.length === 0 ? (
              <p className="text-gray-400 col-span-2">Loading categories...</p>
            ) : (
              availableCategories.map((category) => (
                <div key={category} className="flex items-center space-x-2">
                  <Checkbox
                    id={`category-${category}`}
                    checked={selectedCategories.includes(category)}
                    onCheckedChange={() => handleCategoryToggle(category)}
                  />
                  <label
                    htmlFor={`category-${category}`}
                    className="text-sm text-white cursor-pointer"
                  >
                    {category}
                  </label>
                </div>
              ))
            )}
          </div>
          {selectedCategories.length > 0 && (
            <p className="text-sm text-[#f9dc24] mt-2">
              {selectedCategories.length} categor{selectedCategories.length === 1 ? 'y' : 'ies'} selected: {selectedCategories.join(", ")}
            </p>
          )}
        </div>
      </div>

      <div className="pt-4 border-t border-gray-600">
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full bg-[#f9dc24] text-black hover:bg-[#f9dc24]/90 font-semibold py-3"
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>
    </CardContent>
  );
};

const NewsSegmentEditor = memo(NewsSegmentEditorComponent);
export default NewsSegmentEditor;
