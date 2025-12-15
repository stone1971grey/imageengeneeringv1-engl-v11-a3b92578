import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, Languages } from "lucide-react";
import { GeminiIcon } from "@/components/GeminiIcon";

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

// Available filter categories with default English labels
const FILTER_CATEGORIES = [
  { key: "productTypes", label: "Product Type" },
  { key: "measurementFocus", label: "Measurement Focus" },
  { key: "formatFov", label: "Format / FOV" },
  { key: "applications", label: "Application" },
  { key: "integrationFeatures", label: "Integration Features" }
];

// Default UI labels (English)
const DEFAULT_UI_LABELS = {
  searchPlaceholder: "Search products...",
  clearFiltersButton: "Clear Filters",
  noProductsFound: "No products found",
  viewDetailsButton: "View Details",
  filterByLabel: "Filter by",
  sortByLabel: "Sort by",
  showingLabel: "Showing",
  ofLabel: "of",
  productsLabel: "products",
  previousButton: "Previous",
  nextButton: "Next",
  // Filter category labels
  filterProductTypes: "Product Type",
  filterMeasurementFocus: "Measurement Focus",
  filterFormatFov: "Format / FOV",
  filterApplications: "Application",
  filterIntegrationFeatures: "Integration Features"
};

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
];

export const ProductListSegmentEditor = ({
  segmentId,
  pageSlug,
  language: initialLanguage,
  onSave
}: ProductListSegmentEditorProps) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [targetLanguage, setTargetLanguage] = useState(initialLanguage === 'en' ? 'de' : initialLanguage);
  const [isSplitScreenEnabled, setIsSplitScreenEnabled] = useState(() => {
    const saved = localStorage.getItem('cms-split-screen-mode');
    return saved !== null ? saved === 'true' : true;
  });
  
  // English content (left panel - read-only display)
  const [enTitle, setEnTitle] = useState("Our Products");
  const [enDescription, setEnDescription] = useState("Browse our complete product catalog");
  const [enUiLabels, setEnUiLabels] = useState<Record<string, string>>(DEFAULT_UI_LABELS);
  
  // Target language content (right panel - editable)
  const [targetTitle, setTargetTitle] = useState("");
  const [targetDescription, setTargetDescription] = useState("");
  const [targetUiLabels, setTargetUiLabels] = useState<Record<string, string>>({});
  
  // Shared configuration (not translatable)
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
    loadAllContent();
  }, [segmentId, pageSlug]);

  useEffect(() => {
    loadTargetLanguageContent();
  }, [targetLanguage, segmentId, pageSlug]);

  // Listen for Rainbow SplitScreen translate button
  useEffect(() => {
    if (targetLanguage === 'en') return;

    const handleExternalTranslate = () => {
      handleTranslate();
    };

    window.addEventListener('product-list-translate', handleExternalTranslate);
    return () => window.removeEventListener('product-list-translate', handleExternalTranslate);
  }, [targetLanguage, pageSlug, segmentId, enTitle, enDescription]);

  const handleSplitScreenToggle = (checked: boolean) => {
    setIsSplitScreenEnabled(checked);
    localStorage.setItem('cms-split-screen-mode', String(checked));
  };

  const handleTargetLanguageChange = (lang: string) => {
    setTargetLanguage(lang);
  };

  const loadAllContent = async () => {
    setLoading(true);
    try {
      const sectionKey = `product-list-${segmentId}`;
      
      // Load English content (source)
      const { data: enData } = await supabase
        .from("page_content")
        .select("content_value")
        .eq("page_slug", pageSlug)
        .eq("section_key", sectionKey)
        .eq("language", "en")
        .maybeSingle();

      if (enData?.content_value) {
        const config = JSON.parse(enData.content_value);
        setEnTitle(config.title || "Our Products");
        setEnDescription(config.description || "");
        setEnUiLabels({ ...DEFAULT_UI_LABELS, ...(config.uiLabels || {}) });
        setCategory(config.category || "All");
        setShowFilters(config.showFilters !== false);
        setShowSearch(config.showSearch !== false);
        setMaxProducts(config.maxProducts);
        setLayout(config.layout || 'grid');
        
        if (config.visibleFilters) {
          setVisibleFilters(prev => ({
            ...prev,
            ...config.visibleFilters
          }));
        }
      } else {
        // No English content yet, use defaults
        setEnUiLabels(DEFAULT_UI_LABELS);
      }

      // Load target language content
      await loadTargetLanguageContent();
    } catch (error) {
      console.error("Error loading product list config:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadTargetLanguageContent = async () => {
    try {
      const sectionKey = `product-list-${segmentId}`;
      
      const { data } = await supabase
        .from("page_content")
        .select("content_value")
        .eq("page_slug", pageSlug)
        .eq("section_key", sectionKey)
        .eq("language", targetLanguage)
        .maybeSingle();

      if (data?.content_value) {
        const config = JSON.parse(data.content_value);
        setTargetTitle(config.title || "");
        setTargetDescription(config.description || "");
        setTargetUiLabels(config.uiLabels || {});
      } else {
        // No translation yet, show empty
        setTargetTitle("");
        setTargetDescription("");
        setTargetUiLabels({});
      }
    } catch (error) {
      console.error("Error loading target language content:", error);
    }
  };

  const handleTranslate = async () => {
    if (targetLanguage === 'en') {
      toast.error('Translation not needed - English is the source language');
      return;
    }

    if (!enTitle && !enDescription) {
      toast.error('No English content to translate');
      return;
    }

    setIsTranslating(true);

    try {
      // Include all translatable content: title, description, AND UI labels
      const textsToTranslate: Record<string, string> = {
        title: enTitle || '',
        description: enDescription || '',
        ...enUiLabels
      };

      const { data: translateData, error: translateError } = await supabase.functions.invoke('translate-content', {
        body: {
          texts: textsToTranslate,
          targetLanguage: targetLanguage,
        },
      });

      if (translateError) throw translateError;

      if (translateData?.translatedTexts) {
        // Extract title and description
        setTargetTitle(translateData.translatedTexts.title || enTitle || '');
        setTargetDescription(translateData.translatedTexts.description || enDescription || '');
        
        // Extract UI labels (all keys except title and description)
        const translatedUiLabels: Record<string, string> = {};
        Object.keys(enUiLabels).forEach(key => {
          if (translateData.translatedTexts[key]) {
            translatedUiLabels[key] = translateData.translatedTexts[key];
          }
        });
        setTargetUiLabels(translatedUiLabels);
        
        toast.success(`Translated to ${LANGUAGES.find(l => l.code === targetLanguage)?.name} (including UI labels)`);
      }
    } catch (error) {
      console.error('Translation error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to translate content');
    } finally {
      setTimeout(() => setIsTranslating(false), 600);
    }
  };

  const handleSaveEnglish = async () => {
    setSaving(true);
    try {
      const sectionKey = `product-list-${segmentId}`;
      const config = {
        title: enTitle,
        description: enDescription,
        uiLabels: enUiLabels,
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
          language: "en",
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'page_slug,section_key,language'
        });

      if (error) throw error;
      toast.success("English configuration saved");
      onSave?.();
    } catch (error: any) {
      console.error("Error saving English config:", error);
      toast.error(error.message || "Failed to save configuration");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveTarget = async () => {
    setSaving(true);
    try {
      const sectionKey = `product-list-${segmentId}`;
      const config = {
        title: targetTitle,
        description: targetDescription,
        uiLabels: targetUiLabels,
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
          language: targetLanguage,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'page_slug,section_key,language'
        });

      if (error) throw error;
      toast.success(`${LANGUAGES.find(l => l.code === targetLanguage)?.name} configuration saved`);
      onSave?.();
    } catch (error: any) {
      console.error("Error saving target config:", error);
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

  const renderEditor = (isTarget: boolean = false) => {
    const title = isTarget ? targetTitle : enTitle;
    const description = isTarget ? targetDescription : enDescription;
    const setTitle = isTarget ? setTargetTitle : setEnTitle;
    const setDescription = isTarget ? setTargetDescription : setEnDescription;
    const handleSave = isTarget ? handleSaveTarget : handleSaveEnglish;

    return (
      <div className="space-y-4 p-4 bg-background border rounded-lg">
        <div className="space-y-2">
          <Label>Section Title</Label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Our Products"
          />
        </div>

        <div className="space-y-2">
          <Label>Section Description</Label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Browse our complete product catalog"
            rows={2}
          />
        </div>

        <Button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-[#f9dc24] hover:bg-[#f9dc24]/90 text-black"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          Save
        </Button>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Translation Progress Feedback - Rainbow Style */}
      {isTranslating && (
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 border-2 border-purple-400 rounded-lg p-4 text-center text-white font-semibold animate-pulse shadow-lg shadow-purple-500/50">
          ⏳ Translating content...
        </div>
      )}

      {/* Language Selector Card - Rainbow Template Style */}
      <Card className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 border-blue-700">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Languages className="h-5 w-5 text-blue-300" />
              <div>
                <CardTitle className="text-white text-lg">Multi-Language Editor</CardTitle>
                <CardDescription className="text-blue-200 text-sm mt-1">
                  Compare and edit Product List in multiple languages side-by-side
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch 
                  id="split-screen-toggle"
                  checked={isSplitScreenEnabled}
                  onCheckedChange={handleSplitScreenToggle}
                  className="data-[state=checked]:bg-blue-600"
                />
                <Label htmlFor="split-screen-toggle" className="text-white text-sm cursor-pointer">
                  Split-Screen Mode
                </Label>
              </div>
              {isSplitScreenEnabled && (
                <Badge variant="outline" className="bg-blue-950/50 text-blue-200 border-blue-600">
                  Active
                </Badge>
              )}
            </div>
          </div>
          
          {isSplitScreenEnabled && (
            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-blue-700/50">
              <label className="text-white font-medium text-sm">Target Language:</label>
              <Select value={targetLanguage} onValueChange={handleTargetLanguageChange}>
                <SelectTrigger className="w-[220px] bg-blue-950/70 border-blue-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-blue-700 z-50">
                  {LANGUAGES.filter(lang => lang.code !== 'en').map(lang => (
                    <SelectItem 
                      key={lang.code} 
                      value={lang.code}
                      className="text-white hover:bg-blue-900/50 cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-lg">{lang.flag}</span>
                        <span>{lang.name}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button
                onClick={handleTranslate}
                disabled={isTranslating}
                className="ml-auto bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
              >
                <GeminiIcon className="h-4 w-4 mr-2" />
                {isTranslating ? "Translating..." : "Translate Automatically"}
              </Button>
            </div>
          )}
        </CardHeader>
      </Card>

      {/* Split Screen or Single View */}
      <div className={isSplitScreenEnabled ? "grid grid-cols-2 gap-6" : ""}>
        {isSplitScreenEnabled ? (
          <>
            {/* Left Panel - English */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-green-900/30 to-green-800/30 border-2 border-green-600/50 rounded-lg">
                <span className="text-2xl">🇺🇸</span>
                <div>
                  <div className="text-white font-semibold">English (Reference)</div>
                  <div className="text-green-300 text-xs">Source Language</div>
                </div>
              </div>
              {renderEditor(false)}
            </div>

            {/* Right Panel - Target Language */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-900/30 to-blue-800/30 border-2 border-blue-600/50 rounded-lg">
                <span className="text-2xl">{LANGUAGES.find(l => l.code === targetLanguage)?.flag}</span>
                <div>
                  <div className="text-white font-semibold">{LANGUAGES.find(l => l.code === targetLanguage)?.name}</div>
                  <div className="text-blue-300 text-xs">Target Language</div>
                </div>
              </div>
              {renderEditor(true)}
            </div>
          </>
        ) : (
          renderEditor(false)
        )}
      </div>

      {/* Shared Configuration (below split screen) */}
      <div className="p-4 bg-background border rounded-lg space-y-4">
        <h3 className="font-semibold border-b pb-2 mb-4">
          Display Configuration (applies to all languages)
        </h3>

        <div className="space-y-2">
          <Label>Filter by Category</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white z-50">
              {CATEGORIES.map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Layout</Label>
            <Select value={layout} onValueChange={(v) => setLayout(v as 'grid' | 'list')}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-700 z-50">
                <SelectItem value="grid" className="text-white hover:bg-gray-800">Grid (3 columns)</SelectItem>
                <SelectItem value="list" className="text-white hover:bg-gray-800">List (1 column)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Products per Page</Label>
            <Input
              type="number"
              value={maxProducts || ""}
              onChange={(e) => setMaxProducts(e.target.value ? parseInt(e.target.value) : undefined)}
              placeholder="No limit (show all)"
            />
            <p className="text-xs text-muted-foreground">Leave empty to show all products.</p>
          </div>
        </div>

        <div className="flex gap-6">
          <div className="flex items-center gap-3">
            <Switch
              checked={showSearch}
              onCheckedChange={setShowSearch}
            />
            <Label>Show Search</Label>
          </div>
          <div className="flex items-center gap-3">
            <Switch
              checked={showFilters}
              onCheckedChange={setShowFilters}
            />
            <Label>Show Filters</Label>
          </div>
        </div>

        {/* Individual Filter Visibility */}
        {showFilters && (
          <div className="space-y-3 p-4 bg-muted/30 rounded-lg">
            <Label className="font-semibold">Visible Filter Categories</Label>
            <p className="text-xs text-muted-foreground mb-3">Select which filter categories to display</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {FILTER_CATEGORIES.map(filter => (
                <label 
                  key={filter.key} 
                  className="flex items-center gap-2 cursor-pointer text-sm hover:text-foreground"
                >
                  <Checkbox
                    checked={visibleFilters[filter.key] !== false}
                    onCheckedChange={() => toggleFilterVisibility(filter.key)}
                    className="data-[state=checked]:bg-[#f9dc24] data-[state=checked]:border-[#f9dc24]"
                  />
                  {filter.label}
                </label>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductListSegmentEditor;
