import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface ProductListSegmentEditorProps {
  segmentId: number;
  pageSlug: string;
  language: string;
  onSave?: () => void;
}

const CATEGORIES = [
  "All",
  "Test Charts",
  "Illumination Devices",
  "Measurement Devices",
  "Software",
  "Bundles & Services"
];

export const ProductListSegmentEditor = ({
  segmentId,
  pageSlug,
  language,
  onSave
}: ProductListSegmentEditorProps) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [title, setTitle] = useState("Our Products");
  const [description, setDescription] = useState("Browse our complete product catalog");
  const [category, setCategory] = useState("All");
  const [showFilters, setShowFilters] = useState(true);
  const [showSearch, setShowSearch] = useState(true);
  const [maxProducts, setMaxProducts] = useState<number | undefined>(undefined);
  const [layout, setLayout] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    loadConfig();
  }, [segmentId, language]);

  const loadConfig = async () => {
    try {
      const sectionKey = `product-list-${segmentId}`;
      
      const { data } = await supabase
        .from("page_content")
        .select("content_value")
        .eq("page_slug", pageSlug)
        .eq("section_key", sectionKey)
        .eq("language", language)
        .maybeSingle();

      if (data?.content_value) {
        const config = JSON.parse(data.content_value);
        setTitle(config.title || "Our Products");
        setDescription(config.description || "");
        setCategory(config.category || "All");
        setShowFilters(config.showFilters !== false);
        setShowSearch(config.showSearch !== false);
        setMaxProducts(config.maxProducts);
        setLayout(config.layout || 'grid');
      }
    } catch (error) {
      console.error("Error loading product list config:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const sectionKey = `product-list-${segmentId}`;
      const config = {
        title,
        description,
        category: category === "All" ? undefined : category,
        showFilters,
        showSearch,
        maxProducts,
        layout
      };

      const { error } = await supabase
        .from("page_content")
        .upsert({
          page_slug: pageSlug,
          section_key: sectionKey,
          content_type: "json",
          content_value: JSON.stringify(config),
          language,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'page_slug,section_key,language'
        });

      if (error) throw error;
      toast.success("Product list configuration saved");
      onSave?.();
    } catch (error: any) {
      console.error("Error saving product list config:", error);
      toast.error(error.message || "Failed to save configuration");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 bg-[#1a1a1a] rounded-lg">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-white">Section Title</Label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Our Products"
            className="bg-[#2a2a2a] border-gray-600 text-white"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-white">Section Description</Label>
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Browse our complete product catalog"
            className="bg-[#2a2a2a] border-gray-600 text-white"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-white">Filter by Category</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="bg-[#2a2a2a] border-gray-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-white">Layout</Label>
            <Select value={layout} onValueChange={(v) => setLayout(v as 'grid' | 'list')}>
              <SelectTrigger className="bg-[#2a2a2a] border-gray-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="grid">Grid</SelectItem>
                <SelectItem value="list">List</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-white">Max Products</Label>
            <Input
              type="number"
              value={maxProducts || ""}
              onChange={(e) => setMaxProducts(e.target.value ? parseInt(e.target.value) : undefined)}
              placeholder="No limit"
              className="bg-[#2a2a2a] border-gray-600 text-white"
            />
          </div>
        </div>

        <div className="flex gap-6">
          <div className="flex items-center gap-3">
            <Switch
              checked={showSearch}
              onCheckedChange={setShowSearch}
            />
            <Label className="text-white">Show Search</Label>
          </div>
          <div className="flex items-center gap-3">
            <Switch
              checked={showFilters}
              onCheckedChange={setShowFilters}
            />
            <Label className="text-white">Show Filters</Label>
          </div>
        </div>
      </div>

      <Button
        onClick={handleSave}
        disabled={saving}
        className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
      >
        {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
        Save
      </Button>
    </div>
  );
};

export default ProductListSegmentEditor;
