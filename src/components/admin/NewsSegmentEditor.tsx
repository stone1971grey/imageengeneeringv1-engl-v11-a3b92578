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
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, Languages } from "lucide-react";
import { GeminiIcon } from "@/components/GeminiIcon";

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

const LANGUAGES = [
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
];

interface NewsConfig {
  title: string;
  description: string;
  articleLimit: number;
  categories: string[];
}

const NewsSegmentEditor = ({ pageSlug, segmentId, onUpdate }: NewsSegmentEditorProps) => {
  const [config, setConfig] = useState<NewsConfig>({
    title: "Latest News",
    description: "Stay updated with the latest developments in image quality testing and measurement technology",
    articleLimit: 12,
    categories: [...ALL_CATEGORIES],
  });
  const [availableCategories, setAvailableCategories] = useState<string[]>([...ALL_CATEGORIES]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Multilingual Rainbow Template states
  const [isSplitScreenEnabled, setIsSplitScreenEnabled] = useState(() => {
    const saved = localStorage.getItem('cms-split-screen-mode');
    return saved !== null ? saved === 'true' : true;
  });
  const [targetLanguage, setTargetLanguage] = useState('de');
  const [targetConfig, setTargetConfig] = useState<NewsConfig>({
    title: '',
    description: '',
    articleLimit: 12,
    categories: [...ALL_CATEGORIES],
  });
  const [isTranslating, setIsTranslating] = useState(false);
  const [isSavingTarget, setIsSavingTarget] = useState(false);

  // Unique section key for this news segment's config
  const configSectionKey = `news-config-${segmentId}`;

  // Load config on mount
  useEffect(() => {
    loadConfig();
    loadAvailableCategories();
  }, [pageSlug, segmentId]);

  // Load target language content when language changes
  useEffect(() => {
    if (isSplitScreenEnabled) {
      loadTargetConfig();
    }
  }, [targetLanguage, isSplitScreenEnabled, pageSlug, segmentId]);

  // Save split screen preference
  useEffect(() => {
    localStorage.setItem('cms-split-screen-mode', String(isSplitScreenEnabled));
  }, [isSplitScreenEnabled]);

  const loadAvailableCategories = async () => {
    try {
      const { data } = await supabase
        .from("news_articles")
        .select("category")
        .not("category", "is", null);

      if (data) {
        const dbCategories = [...new Set(data.map((item) => item.category).filter(Boolean))] as string[];
        const allCategories = [...new Set([...dbCategories, ...ALL_CATEGORIES])].sort();
        setAvailableCategories(allCategories);
      }
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  };

  const loadConfig = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("page_content")
        .select("content_value")
        .eq("page_slug", pageSlug)
        .eq("section_key", configSectionKey)
        .eq("language", "en")
        .maybeSingle();

      if (error) throw error;

      if (data?.content_value) {
        const savedConfig = JSON.parse(data.content_value) as NewsConfig;
        setConfig({
          title: savedConfig.title || "Latest News",
          description: savedConfig.description || "Stay updated with the latest developments",
          articleLimit: savedConfig.articleLimit || 12,
          categories: Array.isArray(savedConfig.categories) && savedConfig.categories.length > 0 
            ? savedConfig.categories 
            : [...ALL_CATEGORIES],
        });
      } else {
        await migrateFromPageSegments();
      }
    } catch (error) {
      console.error("Error loading config:", error);
      toast.error("Failed to load configuration");
    } finally {
      setIsLoading(false);
    }
  };

  const loadTargetConfig = async () => {
    try {
      const { data, error } = await supabase
        .from("page_content")
        .select("content_value")
        .eq("page_slug", pageSlug)
        .eq("section_key", configSectionKey)
        .eq("language", targetLanguage.split('-')[0])
        .maybeSingle();

      if (error) throw error;

      if (data?.content_value) {
        const savedConfig = JSON.parse(data.content_value) as NewsConfig;
        setTargetConfig({
          title: savedConfig.title || '',
          description: savedConfig.description || '',
          articleLimit: savedConfig.articleLimit || config.articleLimit,
          categories: savedConfig.categories || config.categories,
        });
      } else {
        // No translation yet - empty state
        setTargetConfig({
          title: '',
          description: '',
          articleLimit: config.articleLimit,
          categories: config.categories,
        });
      }
    } catch (error) {
      console.error("Error loading target config:", error);
    }
  };

  const migrateFromPageSegments = async () => {
    try {
      const { data } = await supabase
        .from("page_content")
        .select("content_value")
        .eq("page_slug", pageSlug)
        .eq("section_key", "page_segments")
        .eq("language", "en")
        .maybeSingle();

      if (data?.content_value) {
        const pageSegments = JSON.parse(data.content_value);
        const newsSegment = pageSegments.find((seg: any) => String(seg.id) === String(segmentId));
        
        if (newsSegment?.data) {
          setConfig({
            title: newsSegment.data.title || "Latest News",
            description: newsSegment.data.description || "Stay updated with the latest developments",
            articleLimit: newsSegment.data.articleLimit || 12,
            categories: Array.isArray(newsSegment.data.categories) && newsSegment.data.categories.length > 0
              ? newsSegment.data.categories
              : [...ALL_CATEGORIES],
          });
        }
      }
    } catch (error) {
      console.error("Error migrating from page_segments:", error);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      const configJson = JSON.stringify(config);
      
      const { error } = await supabase
        .from("page_content")
        .upsert({
          page_slug: pageSlug,
          section_key: configSectionKey,
          language: "en",
          content_type: "json",
          content_value: configJson,
        }, {
          onConflict: "page_slug,section_key,language"
        });

      if (error) throw error;

      toast.success("English content saved successfully");
      onUpdate?.();
    } catch (error: any) {
      console.error("Error saving config:", error);
      toast.error("Failed to save: " + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveTarget = async () => {
    setIsSavingTarget(true);
    
    try {
      const configJson = JSON.stringify({
        ...targetConfig,
        articleLimit: config.articleLimit,
        categories: config.categories,
      });
      
      const { error } = await supabase
        .from("page_content")
        .upsert({
          page_slug: pageSlug,
          section_key: configSectionKey,
          language: targetLanguage.split('-')[0],
          content_type: "json",
          content_value: configJson,
        }, {
          onConflict: "page_slug,section_key,language"
        });

      if (error) throw error;

      const langName = LANGUAGES.find(l => l.code === targetLanguage)?.name || targetLanguage;
      toast.success(`${langName} content saved successfully`);
      onUpdate?.();
    } catch (error: any) {
      console.error("Error saving target config:", error);
      toast.error("Failed to save: " + error.message);
    } finally {
      setIsSavingTarget(false);
    }
  };

  const handleTranslate = async () => {
    if (!config.title && !config.description) {
      toast.error("No English content to translate");
      return;
    }

    setIsTranslating(true);

    try {
      const langName = LANGUAGES.find(l => l.code === targetLanguage)?.name || targetLanguage;
      
      // Build texts object with keys for proper response mapping
      const textsToTranslate: Record<string, string> = {};
      if (config.title) textsToTranslate.title = config.title;
      if (config.description) textsToTranslate.description = config.description;
      
      const { data, error } = await supabase.functions.invoke('translate-content', {
        body: {
          texts: textsToTranslate,
          targetLanguage: targetLanguage.split('-')[0],
          sourceLanguage: 'en'
        }
      });

      if (error) throw error;

      console.log("[NewsSegmentEditor] Translation response:", data);

      if (data?.translations) {
        // Handle both object and array response formats
        const translations = data.translations;
        setTargetConfig(prev => ({
          ...prev,
          title: translations.title || translations["0"] || prev.title,
          description: translations.description || translations["1"] || prev.description,
        }));
        toast.success(`Translated to ${langName}`);
      }
    } catch (error: any) {
      console.error("Translation error:", error);
      toast.error("Translation failed: " + error.message);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleCategoryToggle = (category: string) => {
    setConfig(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

  const handleSelectAll = () => {
    setConfig(prev => ({ ...prev, categories: [...availableCategories] }));
  };

  const handleDeselectAll = () => {
    setConfig(prev => ({ ...prev, categories: [] }));
  };

  if (isLoading) {
    return (
      <CardContent className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-[#f9dc24]" />
        <span className="ml-3 text-white">Loading configuration...</span>
      </CardContent>
    );
  }

  // Shared header with Split-Screen toggle
  const renderHeader = () => (
    <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-600">
      <div className="flex items-center gap-3">
        <Languages className="h-5 w-5 text-[#f9dc24]" />
        <span className="text-white font-medium">Multilingual Editor</span>
        <Badge variant="outline" className="border-[#f9dc24] text-[#f9dc24]">
          Rainbow Template
        </Badge>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-400">Split-Screen</span>
        <Switch
          checked={isSplitScreenEnabled}
          onCheckedChange={setIsSplitScreenEnabled}
        />
      </div>
    </div>
  );

  // Render single panel (English or Target)
  const renderPanel = (isTarget: boolean) => {
    const currentConfig = isTarget ? targetConfig : config;
    const setCurrentConfig = isTarget ? setTargetConfig : setConfig;
    const saving = isTarget ? isSavingTarget : isSaving;

    return (
      <div className="space-y-6">
        {/* Panel Header */}
        <div className="flex items-center justify-between">
          {isTarget ? (
            <>
              <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                <SelectTrigger className="w-[180px] border-gray-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  {LANGUAGES.map(lang => (
                    <SelectItem key={lang.code} value={lang.code} className="text-white">
                      {lang.flag} {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {/* Translate Button */}
              <Button
                onClick={handleTranslate}
                disabled={isTranslating}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
              >
                {isTranslating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Translating...
                  </>
                ) : (
                  <>
                    <GeminiIcon className="mr-2 h-4 w-4" />
                    Auto-Translate
                  </>
                )}
              </Button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-2xl">🇺🇸</span>
              <span className="text-white font-semibold">English (Source)</span>
            </div>
          )}
        </div>

        {/* Translating Feedback Bar */}
        {isTarget && isTranslating && (
          <div className="h-2 bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 rounded-full animate-pulse shadow-lg shadow-purple-500/50" />
        )}

        {/* Content Fields */}
        <div className="space-y-4">
          <div>
            <Label htmlFor={`title-${isTarget ? 'target' : 'en'}`} className="text-white">
              Section Title (H2)
            </Label>
            <Input
              id={`title-${isTarget ? 'target' : 'en'}`}
              value={currentConfig.title}
              onChange={(e) => setCurrentConfig(prev => ({ ...prev, title: e.target.value }))}
              placeholder={isTarget ? "Translated title..." : "Latest News"}
              className="border-2 border-gray-600 bg-gray-800 text-white"
            />
          </div>

          <div>
            <Label htmlFor={`desc-${isTarget ? 'target' : 'en'}`} className="text-white">
              Section Description
            </Label>
            <Textarea
              id={`desc-${isTarget ? 'target' : 'en'}`}
              value={currentConfig.description}
              onChange={(e) => setCurrentConfig(prev => ({ ...prev, description: e.target.value }))}
              placeholder={isTarget ? "Translated description..." : "Stay updated with the latest developments..."}
              rows={3}
              className="border-2 border-gray-600 bg-gray-800 text-white"
            />
          </div>
        </div>

        {/* Settings (English Only) */}
        {!isTarget && (
          <div className="space-y-4 border-t border-gray-600 pt-6">
            <div>
              <Label htmlFor="article-limit" className="text-white">Number of Articles to Display</Label>
              <Select 
                value={String(config.articleLimit)} 
                onValueChange={(val) => setConfig(prev => ({ ...prev, articleLimit: parseInt(val) }))}
              >
                <SelectTrigger id="article-limit" className="border-2 border-gray-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  <SelectItem value="3" className="text-white">3 Articles</SelectItem>
                  <SelectItem value="6" className="text-white">6 Articles</SelectItem>
                  <SelectItem value="9" className="text-white">9 Articles</SelectItem>
                  <SelectItem value="12" className="text-white">12 Articles</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-white mb-3 block">Category Filter</Label>
              <p className="text-sm text-gray-400 mb-3">
                Select which categories to display. Uncheck categories you don't want to show.
              </p>
              
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
                      checked={config.categories.includes(category)}
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
              
              {config.categories.length > 0 ? (
                <p className="text-sm text-[#f9dc24] mt-2">
                  {config.categories.length} categor{config.categories.length === 1 ? 'y' : 'ies'} selected
                </p>
              ) : (
                <p className="text-sm text-red-400 mt-2">
                  No categories selected - no articles will be displayed!
                </p>
              )}
            </div>
          </div>
        )}

        {/* Save Button */}
        <Button
          onClick={isTarget ? handleSaveTarget : handleSave}
          disabled={saving}
          className="w-full bg-[#f9dc24] text-black hover:bg-[#f9dc24]/90 font-semibold py-3"
        >
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            `Save ${isTarget ? LANGUAGES.find(l => l.code === targetLanguage)?.name || 'Target' : 'English'}`
          )}
        </Button>
      </div>
    );
  };

  return (
    <CardContent className="space-y-4">
      {renderHeader()}

      {isSplitScreenEnabled ? (
        <div className="grid grid-cols-2 gap-6">
          {/* English Panel */}
          <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-600">
            {renderPanel(false)}
          </div>
          
          {/* Target Language Panel */}
          <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-600">
            {renderPanel(true)}
          </div>
        </div>
      ) : (
        <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-600">
          {renderPanel(false)}
        </div>
      )}
    </CardContent>
  );
};

export default NewsSegmentEditor;
