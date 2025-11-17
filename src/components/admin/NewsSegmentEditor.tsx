import { useState, useEffect } from "react";
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
import { Loader2, Copy, Save } from "lucide-react";
import { CopySegmentDialog } from "./CopySegmentDialog";

interface NewsSegmentEditorProps {
  pageSlug: string;
  segmentId: string;
  onUpdate?: () => void;
  currentPageSlug: string;
}

const NewsSegmentEditor = ({ pageSlug, segmentId, onUpdate, currentPageSlug }: NewsSegmentEditorProps) => {
  const [sectionTitle, setSectionTitle] = useState("Latest News");
  const [sectionDescription, setSectionDescription] = useState(
    "Stay updated with the latest developments in image quality testing and measurement technology"
  );
  const [articleLimit, setArticleLimit] = useState("6");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [copyDialogOpen, setCopyDialogOpen] = useState(false);

  useEffect(() => {
    loadContent();
    loadAvailableCategories();
  }, [pageSlug, segmentId]);

  const loadAvailableCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("news_articles")
        .select("category")
        .eq("published", true)
        .not("category", "is", null);

      if (error) throw error;

      // Get unique categories
      const categories = [...new Set(data.map((item) => item.category).filter(Boolean))];
      setAvailableCategories(categories as string[]);
    } catch (error: any) {
      console.error("Error loading categories:", error);
    }
  };

  const loadContent = async () => {
    try {
      console.log(`Loading news content for pageSlug: ${pageSlug}, segmentId: ${segmentId}`);
      const { data, error } = await supabase
        .from("page_content")
        .select("*")
        .eq("page_slug", pageSlug)
        .eq("section_key", segmentId);

      if (error) throw error;

      console.log(`Loaded ${data?.length || 0} news content items:`, data);

      if (data && data.length > 0) {
        data.forEach((item) => {
          if (item.content_type === "news_section_title") {
            setSectionTitle(item.content_value);
          } else if (item.content_type === "news_section_description") {
            setSectionDescription(item.content_value);
          } else if (item.content_type === "news_article_limit") {
            setArticleLimit(item.content_value);
          } else if (item.content_type === "news_categories") {
            try {
              const categories = JSON.parse(item.content_value);
              console.log(`Loaded categories:`, categories);
              setSelectedCategories(categories);
            } catch (e) {
              console.error("Error parsing categories:", e);
              setSelectedCategories([]);
            }
          }
        });
      } else {
        console.log("No existing news content found, using defaults");
      }
    } catch (error: any) {
      console.error("Error loading content:", error);
      toast.error("Failed to load content");
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      console.log(`Saving news segment - pageSlug: ${pageSlug}, segmentId: ${segmentId}`);
      console.log(`Categories to save:`, selectedCategories);
      
      // Delete existing content for this segment
      const { error: deleteError } = await supabase
        .from("page_content")
        .delete()
        .eq("page_slug", pageSlug)
        .eq("section_key", segmentId);

      if (deleteError) {
        console.error("Delete error:", deleteError);
        throw deleteError;
      }

      // Insert new content
      const contentItems = [
        {
          page_slug: pageSlug,
          section_key: segmentId,
          content_type: "news_section_title",
          content_value: sectionTitle,
        },
        {
          page_slug: pageSlug,
          section_key: segmentId,
          content_type: "news_section_description",
          content_value: sectionDescription,
        },
        {
          page_slug: pageSlug,
          section_key: segmentId,
          content_type: "news_article_limit",
          content_value: articleLimit,
        },
        {
          page_slug: pageSlug,
          section_key: segmentId,
          content_type: "news_categories",
          content_value: JSON.stringify(selectedCategories),
        },
      ];

      console.log("Content items to insert:", contentItems);

      const { error: insertError } = await supabase
        .from("page_content")
        .insert(contentItems);

      if (insertError) {
        console.error("Insert error:", insertError);
        throw insertError;
      }

      console.log("News segment saved successfully");
      toast.success("News segment saved successfully. Please reload the frontend page to see changes.");
      onUpdate?.();
    } catch (error: any) {
      console.error("Error saving content:", error);
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
            Select specific categories or leave all unchecked to show articles from all categories
          </p>
          <div className="space-y-3 bg-gray-700 p-4 rounded-lg border border-gray-600">
            {availableCategories.length === 0 ? (
              <p className="text-gray-400">No categories available</p>
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
        </div>
      </div>

      <div className="flex gap-2 pt-4 border-t border-gray-600">
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="flex-1 bg-[#f9dc24] text-black hover:bg-[#f9dc24]/90"
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
        
        <Button
          variant="outline"
          onClick={() => setCopyDialogOpen(true)}
          className="flex items-center gap-2"
        >
          <Copy className="h-4 w-4" />
          Copy to Page...
        </Button>
      </div>

      <CopySegmentDialog
        open={copyDialogOpen}
        onOpenChange={setCopyDialogOpen}
        currentPageSlug={currentPageSlug}
        segmentId={segmentId}
        segmentType="news"
        segmentData={{
          sectionTitle,
          sectionDescription,
          articleLimit,
          categories: selectedCategories,
        }}
      />
    </CardContent>
  );
};

export default NewsSegmentEditor;