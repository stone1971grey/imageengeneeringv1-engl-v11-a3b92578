import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
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

// Available filter categories
const FILTER_CATEGORIES = [
  { key: "productTypes", label: "Product Type" },
  { key: "measurementFocus", label: "Measurement Focus" },
  { key: "formatFov", label: "Format / FOV" },
  { key: "applications", label: "Application" },
  { key: "integrationFeatures", label: "Integration Features" }
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
  
  // Individual filter visibility
  const [visibleFilters, setVisibleFilters] = useState<Record<string, boolean>>({
    productTypes: true,
    measurementFocus: true,
    formatFov: true,
    applications: true,
    integrationFeatures: true
  });

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
        
        // Load individual filter visibility
        if (config.visibleFilters) {
          setVisibleFilters(prev => ({
            ...prev,
            ...config.visibleFilters
          }));
        }
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
        layout,
        visibleFilters
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

  const toggleFilterVisibility = (key: string) => {
    setVisibleFilters(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
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
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Browse our complete product catalog"
            className="bg-[#2a2a2a] border-gray-600 text-white"
            rows={2}
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
                <SelectItem value="grid">Grid (3 columns)</SelectItem>
                <SelectItem value="list">List (1 column)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-white">Products per Page</Label>
            <Input
              type="number"
              value={maxProducts || ""}
              onChange={(e) => setMaxProducts(e.target.value ? parseInt(e.target.value) : undefined)}
              placeholder="No limit (show all)"
              className="bg-[#2a2a2a] border-gray-600 text-white"
            />
            <p className="text-xs text-gray-500">Leave empty to show all products. Set a number to enable pagination.</p>
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

        {/* Individual Filter Visibility */}
        {showFilters && (
          <div className="space-y-3 p-4 bg-[#222] rounded-lg">
            <Label className="text-white font-semibold">Visible Filter Categories</Label>
            <p className="text-xs text-gray-400 mb-3">Select which filter categories to display</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {FILTER_CATEGORIES.map(filter => (
                <label 
                  key={filter.key} 
                  className="flex items-center gap-2 cursor-pointer text-gray-300 text-sm hover:text-white"
                >
                  <Checkbox
                    checked={visibleFilters[filter.key] !== false}
                    onCheckedChange={() => toggleFilterVisibility(filter.key)}
                    className="border-gray-600 data-[state=checked]:bg-[#f9dc24] data-[state=checked]:border-[#f9dc24]"
                  />
                  {filter.label}
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      <Button
        onClick={handleSave}
        disabled={saving}
        className="w-full bg-[hsl(var(--yellow))] text-black hover:bg-[hsl(var(--yellow))]/90"
      >
        {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
        Save
      </Button>
    </div>
  );
};

export default ProductListSegmentEditor;