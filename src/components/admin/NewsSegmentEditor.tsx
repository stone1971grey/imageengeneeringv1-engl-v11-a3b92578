import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
  
  // Multilingual Editor states
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
      const textsToTranslate = {
        title: config.title || '',
        description: config.description || ''
      };
      
      console.log("[NewsSegmentEditor] Sending translation request:", textsToTranslate);
      
      const { data, error } = await supabase.functions.invoke('translate-content', {
        body: {
          texts: textsToTranslate,
          targetLanguage: targetLanguage.split('-')[0],
        }
      });

      if (error) {
        console.error("[NewsSegmentEditor] Translation error:", error);
        throw error;
      }

      console.log("[NewsSegmentEditor] Translation response:", data);

      // Edge Function returns { translatedTexts: { title: '...', description: '...' } }
      if (data?.translatedTexts) {
        setTargetConfig(prev => ({
          ...prev,
          title: data.translatedTexts.title || prev.title,
          description: data.translatedTexts.description || prev.description,
        }));
        toast.success(`Translated to ${langName}`);
      } else {
        console.error("[NewsSegmentEditor] No translatedTexts in response:", data);
        toast.error("Translation response empty");
      }
    } catch (error: any) {
      console.error("[NewsSegmentEditor] Translation error:", error);
      toast.error("Translation failed: " + error.message);
    } finally {
      // Small delay so the visual translation feedback bar is clearly visible
      setTimeout(() => setIsTranslating(false), 600);
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

  const handleSplitScreenToggle = (checked: boolean) => {
    setIsSplitScreenEnabled(checked);
    localStorage.setItem('cms-split-screen-mode', String(checked));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-[#f9dc24]" />
        <span className="ml-3 text-muted-foreground">Loading configuration...</span>
      </div>
    );
  }

  // Render single panel (English or Target)
  const renderEditor = (isTarget: boolean) => {
    const currentConfig = isTarget ? targetConfig : config;
    const setCurrentConfig = isTarget ? setTargetConfig : setConfig;
    const saving = isTarget ? isSavingTarget : isSaving;

    return (
      <div className="space-y-6 p-4 bg-background border rounded-lg">
        {/* Content Fields */}
        <div className="space-y-4">
          <div>
            <Label htmlFor={`title-${isTarget ? 'target' : 'en'}`} className="font-medium">
              Section Title (H2)
            </Label>
            <Input
              id={`title-${isTarget ? 'target' : 'en'}`}
              value={currentConfig.title}
              onChange={(e) => setCurrentConfig(prev => ({ ...prev, title: e.target.value }))}
              placeholder={isTarget ? "Translated title..." : "Latest News"}
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor={`desc-${isTarget ? 'target' : 'en'}`} className="font-medium">
              Section Description
            </Label>
            <Textarea
              id={`desc-${isTarget ? 'target' : 'en'}`}
              value={currentConfig.description}
              onChange={(e) => setCurrentConfig(prev => ({ ...prev, description: e.target.value }))}
              placeholder={isTarget ? "Translated description..." : "Stay updated with the latest developments..."}
              rows={3}
              className="mt-2"
            />
          </div>
        </div>

        {/* Settings (English Only) */}
        {!isTarget && (
          <div className="space-y-4 border-t border-border pt-6">
            <div>
              <Label htmlFor="article-limit" className="font-medium">Number of Articles to Display</Label>
              <Select 
                value={String(config.articleLimit)} 
                onValueChange={(val) => setConfig(prev => ({ ...prev, articleLimit: parseInt(val) }))}
              >
                <SelectTrigger id="article-limit" className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 Articles</SelectItem>
                  <SelectItem value="6">6 Articles</SelectItem>
                  <SelectItem value="9">9 Articles</SelectItem>
                  <SelectItem value="12">12 Articles</SelectItem>
                  <SelectItem value="24">24 Articles</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="font-medium">Categories to Display</Label>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleSelectAll}>
                    Select All
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleDeselectAll}>
                    Deselect All
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto p-2 border rounded-lg">
                {availableCategories.map((category) => (
                  <label
                    key={category}
                    className="flex items-center space-x-2 cursor-pointer p-2 rounded hover:bg-accent"
                  >
                    <Checkbox
                      checked={config.categories.includes(category)}
                      onCheckedChange={() => handleCategoryToggle(category)}
                    />
                    <span className="text-sm">{category}</span>
                  </label>
                ))}
              </div>

              {config.categories.length === 0 && (
                <p className="text-sm text-destructive">
                  Please select at least one category
                </p>
              )}

              <div className="flex flex-wrap gap-1 mt-2">
                {config.categories.map((cat) => (
                  <Badge key={cat} variant="secondary" className="text-xs">
                    {cat}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Save Button */}
        <Button 
          onClick={isTarget ? handleSaveTarget : handleSave}
          disabled={saving}
          className="w-full bg-[#f9dc24] hover:bg-[#f9dc24]/90 text-black"
        >
          {saving ? "Saving..." : `Save ${isTarget ? LANGUAGES.find(l => l.code === targetLanguage)?.name || 'Translation' : 'English'} Changes`}
        </Button>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Translation Feedback Bar */}
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
                  Compare and edit Latest News Segment in multiple languages side-by-side
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
              <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                <SelectTrigger className="w-[220px] bg-blue-950/70 border-blue-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-blue-700 z-50">
                  {LANGUAGES.map(lang => (
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
    </div>
  );
};

export default NewsSegmentEditor;
