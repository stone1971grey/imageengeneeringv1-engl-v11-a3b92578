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

// Available filter categories
const FILTER_CATEGORIES = [
  { key: "productTypes", label: "Product Type" },
  { key: "measurementFocus", label: "Measurement Focus" },
  { key: "formatFov", label: "Format / FOV" },
  { key: "applications", label: "Application" },
  { key: "integrationFeatures", label: "Integration Features" }
];

const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'de', label: 'Deutsch' },
  { code: 'ja', label: '日本語' },
  { code: 'ko', label: '한국어' },
  { code: 'zh', label: '中文' },
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
  
  // English content (left panel - read-only display)
  const [enTitle, setEnTitle] = useState("Our Products");
  const [enDescription, setEnDescription] = useState("Browse our complete product catalog");
  
  // Target language content (right panel - editable)
  const [targetTitle, setTargetTitle] = useState("");
  const [targetDescription, setTargetDescription] = useState("");
  
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
      } else {
        // No translation yet, show empty
        setTargetTitle("");
        setTargetDescription("");
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
      const textsToTranslate = {
        title: enTitle || '',
        description: enDescription || ''
      };

      const { data: translateData, error: translateError } = await supabase.functions.invoke('translate-content', {
        body: {
          texts: textsToTranslate,
          targetLanguage: targetLanguage,
        },
      });

      if (translateError) throw translateError;

      if (translateData?.translatedTexts) {
        setTargetTitle(translateData.translatedTexts.title || enTitle || '');
        setTargetDescription(translateData.translatedTexts.description || enDescription || '');
        toast.success(`Content translated to ${SUPPORTED_LANGUAGES.find(l => l.code === targetLanguage)?.label}`);
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
      toast.success(`${SUPPORTED_LANGUAGES.find(l => l.code === targetLanguage)?.label} configuration saved`);
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

  return (
    <div className="space-y-6">
      {/* Translation Progress Bar */}
      {isTranslating && (
        <div className="h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 animate-pulse rounded-full" />
      )}

      {/* Split Screen Header with Language Selector and Translate Button */}
      <div className="flex items-center justify-between p-4 bg-[#1a1a1a] rounded-lg">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Languages className="w-4 h-4 text-gray-400" />
            <span className="text-gray-400 text-sm">Target Language:</span>
          </div>
          <Select value={targetLanguage} onValueChange={setTargetLanguage}>
            <SelectTrigger className="w-32 bg-[#2a2a2a] border-gray-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SUPPORTED_LANGUAGES.filter(l => l.code !== 'en').map(lang => (
                <SelectItem key={lang.code} value={lang.code}>{lang.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={handleTranslate}
          disabled={isTranslating || targetLanguage === 'en'}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
        >
          {isTranslating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Translating...
            </>
          ) : (
            <>
              <GeminiIcon className="w-4 h-4 mr-2" />
              Auto-Translate
            </>
          )}
        </Button>
      </div>

      {/* Split Screen Panels */}
      <div className="grid grid-cols-2 gap-6">
        {/* Left Panel - English (Source) */}
        <div className="p-4 bg-[#1a1a1a] rounded-lg space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <span className="px-2 py-1 bg-blue-600 text-white text-xs font-semibold rounded">EN</span>
            <span className="text-white font-medium">English (Source)</span>
          </div>

          <div className="space-y-2">
            <Label className="text-white">Section Title</Label>
            <Input
              value={enTitle}
              onChange={(e) => setEnTitle(e.target.value)}
              placeholder="Our Products"
              className="bg-[#2a2a2a] border-gray-600 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-white">Section Description</Label>
            <Textarea
              value={enDescription}
              onChange={(e) => setEnDescription(e.target.value)}
              placeholder="Browse our complete product catalog"
              className="bg-[#2a2a2a] border-gray-600 text-white"
              rows={2}
            />
          </div>

          <Button
            onClick={handleSaveEnglish}
            disabled={saving}
            className="w-full bg-[hsl(var(--yellow))] text-black hover:bg-[hsl(var(--yellow))]/90"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Save
          </Button>
        </div>

        {/* Right Panel - Target Language */}
        <div className="p-4 bg-[#1a1a1a] rounded-lg space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <span className="px-2 py-1 bg-green-600 text-white text-xs font-semibold rounded uppercase">
              {targetLanguage}
            </span>
            <span className="text-white font-medium">
              {SUPPORTED_LANGUAGES.find(l => l.code === targetLanguage)?.label}
            </span>
          </div>

          <div className="space-y-2">
            <Label className="text-white">Section Title</Label>
            <Input
              value={targetTitle}
              onChange={(e) => setTargetTitle(e.target.value)}
              placeholder={enTitle || "Translation..."}
              className="bg-[#2a2a2a] border-gray-600 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-white">Section Description</Label>
            <Textarea
              value={targetDescription}
              onChange={(e) => setTargetDescription(e.target.value)}
              placeholder={enDescription || "Translation..."}
              className="bg-[#2a2a2a] border-gray-600 text-white"
              rows={2}
            />
          </div>

          <Button
            onClick={handleSaveTarget}
            disabled={saving}
            className="w-full bg-[hsl(var(--yellow))] text-black hover:bg-[hsl(var(--yellow))]/90"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Save
          </Button>
        </div>
      </div>

      {/* Shared Configuration (below split screen) */}
      <div className="p-4 bg-[#1a1a1a] rounded-lg space-y-4">
        <h3 className="text-white font-semibold border-b border-gray-700 pb-2 mb-4">
          Display Configuration (applies to all languages)
        </h3>

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
            <p className="text-xs text-gray-500">Leave empty to show all products.</p>
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
    </div>
  );
};

export default ProductListSegmentEditor;
