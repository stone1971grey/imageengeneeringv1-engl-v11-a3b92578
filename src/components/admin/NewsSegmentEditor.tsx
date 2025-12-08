import { useState, useEffect, useRef } from "react";
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

// All standard categories
const ALL_CATEGORIES = [
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

const NewsSegmentEditor = ({ pageSlug, segmentId, onUpdate }: NewsSegmentEditorProps) => {
  // Track which segment we loaded to detect changes
  const loadedSegmentRef = useRef<string | null>(null);

  const [sectionTitle, setSectionTitle] = useState("");
  const [sectionDescription, setSectionDescription] = useState("");
  const [articleLimit, setArticleLimit] = useState("12");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [availableCategories, setAvailableCategories] = useState<string[]>([...ALL_CATEGORIES]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load content when segment changes
  useEffect(() => {
    const segmentKey = `${pageSlug}-${segmentId}`;
    
    // Only load if this is a different segment than what we already loaded
    if (loadedSegmentRef.current === segmentKey) {
      return;
    }
    
    const loadData = async () => {
      setIsLoading(true);
      
      try {
        // Load categories from news_articles
        const { data: catData } = await supabase
          .from("news_articles")
          .select("category")
          .not("category", "is", null);

        if (catData) {
          const dbCategories = [...new Set(catData.map((item) => item.category).filter(Boolean))] as string[];
          const allCategories = [...new Set([...dbCategories, ...ALL_CATEGORIES])].sort();
          setAvailableCategories(allCategories);
        }

        // Load segment data from page_content
        const { data, error } = await supabase
          .from("page_content")
          .select("content_value")
          .eq("page_slug", pageSlug)
          .eq("section_key", "page_segments")
          .eq("language", "en")
          .maybeSingle();

        if (error) throw error;

        if (data?.content_value) {
          const pageSegments = JSON.parse(data.content_value);
          const newsSegment = pageSegments.find((seg: any) => String(seg.id) === String(segmentId));
          
          if (newsSegment?.data) {
            setSectionTitle(newsSegment.data.title || "Latest News");
            setSectionDescription(newsSegment.data.description || "Stay updated with the latest developments");
            setArticleLimit(String(newsSegment.data.articleLimit || 12));
            
            const savedCategories = newsSegment.data.categories;
            if (Array.isArray(savedCategories) && savedCategories.length > 0) {
              setSelectedCategories([...savedCategories]);
            } else {
              setSelectedCategories([...ALL_CATEGORIES]);
            }
          } else {
            setSectionTitle("Latest News");
            setSectionDescription("Stay updated with the latest developments");
            setArticleLimit("12");
            setSelectedCategories([...ALL_CATEGORIES]);
          }
        }
        
        // Mark this segment as loaded
        loadedSegmentRef.current = segmentKey;
      } catch (error) {
        console.error("Error loading content:", error);
        toast.error("Failed to load content");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [pageSlug, segmentId]);

  const handleSave = async () => {
    setIsSaving(true);
    
    // Capture current state values at the moment of save
    const currentTitle = sectionTitle;
    const currentDescription = sectionDescription;
    const currentArticleLimit = articleLimit;
    const currentCategories = [...selectedCategories];
    
    console.log("[NewsSegmentEditor] SAVE - articleLimit:", currentArticleLimit, "categories:", currentCategories);
    
    try {
      // Load current page_segments
      const { data, error } = await supabase
        .from("page_content")
        .select("content_value")
        .eq("page_slug", pageSlug)
        .eq("section_key", "page_segments")
        .eq("language", "en")
        .maybeSingle();

      if (error) throw error;

      if (data?.content_value) {
        const pageSegments = JSON.parse(data.content_value);
        
        // Find and update the news segment
        let foundSegment = false;
        const updatedSegments = pageSegments.map((seg: any) => {
          if (String(seg.id) === String(segmentId)) {
            foundSegment = true;
            return {
              ...seg,
              data: {
                ...seg.data,
                title: currentTitle,
                description: currentDescription,
                articleLimit: parseInt(currentArticleLimit) || 12,
                categories: currentCategories,
              }
            };
          }
          return seg;
        });

        if (!foundSegment) {
          toast.error("Segment not found in page data");
          setIsSaving(false);
          return;
        }

        console.log("[NewsSegmentEditor] SAVE - Updating DB with:", JSON.stringify(updatedSegments.find((s: any) => String(s.id) === String(segmentId))?.data));

        // Save back to database
        const { error: updateError } = await supabase
          .from("page_content")
          .update({ content_value: JSON.stringify(updatedSegments) })
          .eq("page_slug", pageSlug)
          .eq("section_key", "page_segments")
          .eq("language", "en");

        if (updateError) throw updateError;

        console.log("[NewsSegmentEditor] SAVE - Success!");
        toast.success("News segment saved successfully");
        onUpdate?.();
      } else {
        toast.error("No page data found");
      }
    } catch (error: any) {
      console.error("Error saving content:", error);
      toast.error("Failed to save content: " + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories((prev) => {
      if (prev.includes(category)) {
        return prev.filter((c) => c !== category);
      } else {
        return [...prev, category];
      }
    });
  };

  const handleSelectAll = () => {
    setSelectedCategories([...availableCategories]);
  };

  const handleDeselectAll = () => {
    setSelectedCategories([]);
  };

  // Show loading state while fetching data
  if (isLoading) {
    return (
      <CardContent className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-[#f9dc24]" />
        <span className="ml-3 text-white">Loading segment data...</span>
      </CardContent>
    );
  }

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
            Select which categories to display. Uncheck categories you don't want to show.
          </p>
          
          {/* Select All / Deselect All Buttons */}
          <div className="flex gap-2 mb-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
              className="text-xs"
            >
              Select All
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDeselectAll}
              className="text-xs"
            >
              Deselect All
            </Button>
          </div>
          
          <div className="grid grid-cols-2 gap-3 bg-gray-700 p-4 rounded-lg border border-gray-600 max-h-[300px] overflow-y-auto">
            {availableCategories.map((category) => (
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
            ))}
          </div>
          
          {selectedCategories.length > 0 ? (
            <p className="text-sm text-[#f9dc24] mt-2">
              {selectedCategories.length} categor{selectedCategories.length === 1 ? 'y' : 'ies'} selected: {selectedCategories.join(", ")}
            </p>
          ) : (
            <p className="text-sm text-red-400 mt-2">
              No categories selected - no articles will be displayed!
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

export default NewsSegmentEditor;
