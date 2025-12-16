import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface DownloadsSegmentEditorProps {
  segmentId: number | string;
  pageSlug: string;
  language: string;
  onSave?: () => void;
}

const DOWNLOAD_TYPES = [
  { value: "white-paper", label: "White Papers" },
  { value: "conference-paper", label: "Conference Papers" },
  { value: "video", label: "Videos" },
  { value: "brochure", label: "Brochures" },
  { value: "datasheet", label: "Datasheets" },
];

export const DownloadsSegmentEditor = ({
  segmentId,
  pageSlug,
  language,
  onSave,
}: DownloadsSegmentEditorProps) => {
  const [title, setTitle] = useState("Downloads");
  const [description, setDescription] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [maxItems, setMaxItems] = useState<number>(12);
  const [showCategories, setShowCategories] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadConfiguration();
  }, [segmentId, pageSlug, language]);

  const loadConfiguration = async () => {
    try {
      const { data, error } = await supabase
        .from("page_content")
        .select("content_value")
        .eq("page_slug", pageSlug)
        .eq("section_key", `downloads-${segmentId}`)
        .eq("language", language)
        .maybeSingle();

      if (error) throw error;

      if (data?.content_value) {
        const config = JSON.parse(data.content_value);
        setTitle(config.title || "Downloads");
        setDescription(config.description || "");
        setSelectedTypes(config.selectedTypes || []);
        setMaxItems(config.maxItems || 12);
        setShowCategories(config.showCategories !== false);
      }
    } catch (error) {
      console.error("Error loading downloads config:", error);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const config = {
        title,
        description,
        selectedTypes,
        maxItems,
        showCategories,
      };

      const { error } = await supabase
        .from("page_content")
        .upsert(
          {
            page_slug: pageSlug,
            section_key: `downloads-${segmentId}`,
            content_type: "json",
            content_value: JSON.stringify(config),
            language,
          },
          { onConflict: "page_slug,section_key,language" }
        );

      if (error) throw error;

      toast.success("Downloads segment saved");
      onSave?.();
    } catch (error) {
      console.error("Error saving downloads config:", error);
      toast.error("Failed to save configuration");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleType = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type)
        ? prev.filter((t) => t !== type)
        : [...prev, type]
    );
  };

  return (
    <div className="space-y-6 p-6 bg-[#2a2a2a] rounded-lg">
      <div className="space-y-4">
        <div>
          <Label className="text-white">Segment Title</Label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Downloads"
            className="bg-[#1a1a1a] border-gray-600 text-white mt-1"
          />
        </div>

        <div>
          <Label className="text-white">Description</Label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional description for the downloads section"
            className="bg-[#1a1a1a] border-gray-600 text-white mt-1"
            rows={3}
          />
        </div>

        <div>
          <Label className="text-white mb-2 block">Filter by Type</Label>
          <p className="text-gray-400 text-sm mb-3">
            Leave empty to show all types, or select specific types to filter
          </p>
          <div className="grid grid-cols-2 gap-3">
            {DOWNLOAD_TYPES.map((type) => (
              <div
                key={type.value}
                className="flex items-center space-x-2"
              >
                <Checkbox
                  id={`type-${type.value}`}
                  checked={selectedTypes.includes(type.value)}
                  onCheckedChange={() => toggleType(type.value)}
                />
                <label
                  htmlFor={`type-${type.value}`}
                  className="text-white text-sm cursor-pointer"
                >
                  {type.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label className="text-white">Maximum Items</Label>
          <Input
            type="number"
            value={maxItems}
            onChange={(e) => setMaxItems(parseInt(e.target.value) || 12)}
            min={1}
            max={50}
            className="bg-[#1a1a1a] border-gray-600 text-white mt-1 w-32"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="showCategories"
            checked={showCategories}
            onCheckedChange={(checked) => setShowCategories(checked === true)}
          />
          <label
            htmlFor="showCategories"
            className="text-white text-sm cursor-pointer"
          >
            Show category filter buttons
          </label>
        </div>
      </div>

      <Button
        onClick={handleSave}
        disabled={isLoading}
        className="w-full bg-[#f9dc24] text-black hover:bg-[#f9dc24]/90"
      >
        {isLoading ? "Saving..." : "Save"}
      </Button>
    </div>
  );
};

export default DownloadsSegmentEditor;
