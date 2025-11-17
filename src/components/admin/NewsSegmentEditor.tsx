import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Loader2, Copy } from "lucide-react";
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
      const { data, error } = await supabase
        .from("page_content")
        .select("*")
        .eq("page_slug", pageSlug)
        .eq("section_key", segmentId);

      if (error) throw error;

      if (data && data.length > 0) {
        data.forEach((item) => {
          if (item.content_type === "news_section_title") {
            setSectionTitle(item.content_value);
          } else if (item.content_type === "news_section_description") {
            setSectionDescription(item.content_value);
          } else if (item.content_type === "news_article_limit") {
            setArticleLimit(item.content_value);
          } else if (item.content_type === "news_categories") {
            setSelectedCategories(JSON.parse(item.content_value));
          }
        });
      }
    } catch (error: any) {
      console.error("Error loading content:", error);
      toast.error("Failed to load content");
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Delete existing content for this segment
      await supabase
        .from("page_content")
        .delete()
        .eq("page_slug", pageSlug)
        .eq("section_key", segmentId);

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

      const { error: insertError } = await supabase
        .from("page_content")
        .insert(contentItems);

      if (insertError) throw insertError;

      toast.success("News segment saved successfully");
      onUpdate?.();
    } catch (error: any) {
      console.error("Error saving content:", error);
      toast.error("Failed to save content");
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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Section Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="section-title">Section Title (H2)</Label>
            <Input
              id="section-title"
              value={sectionTitle}
              onChange={(e) => setSectionTitle(e.target.value)}
              placeholder="Latest News"
            />
          </div>

          <div>
            <Label htmlFor="section-description">Section Description</Label>
            <Textarea
              id="section-description"
              value={sectionDescription}
              onChange={(e) => setSectionDescription(e.target.value)}
              placeholder="Stay updated with the latest developments..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Display Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="article-limit">Number of Articles to Display</Label>
            <Select value={articleLimit} onValueChange={setArticleLimit}>
              <SelectTrigger id="article-limit">
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
            <Label className="mb-3 block">Category Filter</Label>
            <p className="text-sm text-gray-600 mb-3">
              Select specific categories or leave all unchecked to show articles from all categories
            </p>
            <div className="space-y-3 bg-gray-50 p-4 rounded-lg border">
              {availableCategories.length === 0 ? (
                <p className="text-gray-500">No categories available</p>
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
                      className="text-sm cursor-pointer"
                    >
                      {category}
                    </label>
                  </div>
                ))
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="flex-1"
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
    </div>
  );
};

export default NewsSegmentEditor;