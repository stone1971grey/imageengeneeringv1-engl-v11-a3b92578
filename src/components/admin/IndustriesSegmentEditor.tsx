import { useState, useEffect, memo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, GripVertical, Languages } from "lucide-react";
import { GeminiIcon } from "@/components/GeminiIcon";
import { availableIcons, IconName, IndustryItem } from "@/components/segments/IndustriesSegment";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface IndustriesSegmentEditorProps {
  data: {
    title?: string;
    subtitle?: string;
    columns?: number;
    items?: IndustryItem[];
  };
  onChange: (data: any) => void;
  onSave?: () => void;
  pageSlug: string;
  segmentKey: string;
  language: string;
}

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
];

const IndustriesSegmentEditorComponent = ({ 
  data, 
  onChange, 
  onSave, 
  pageSlug, 
  segmentKey,
  language: editorLanguage 
}: IndustriesSegmentEditorProps) => {
  const [targetLanguage, setTargetLanguage] = useState('de');
  const [isSplitScreenEnabled, setIsSplitScreenEnabled] = useState(() => {
    const saved = localStorage.getItem('cms-split-screen-mode');
    return saved !== null ? saved === 'true' : true;
  });
  // CRITICAL: Initialize empty, NOT from English data prop - prevents state contamination
  const [targetData, setTargetData] = useState<any>({});
  const [isTranslating, setIsTranslating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSplitScreenToggle = (checked: boolean) => {
    setIsSplitScreenEnabled(checked);
    localStorage.setItem('cms-split-screen-mode', String(checked));
  };

  const items = data.items || [];
  const columns = data.columns || 4;
  const targetItems = targetData.items || [];

  // Load target language data on mount and when target language changes
  useEffect(() => {
    loadTargetLanguageData(targetLanguage);
  }, [targetLanguage]);

  // Load target language data - CRITICAL: Only set state if actual data exists
  const loadTargetLanguageData = async (lang: string) => {
    const { data: content, error } = await supabase
      .from('page_content')
      .select('content_value')
      .eq('page_slug', pageSlug)
      .eq('section_key', segmentKey)
      .eq('language', lang)
      .maybeSingle();

    if (!error && content?.content_value) {
      try {
        const parsedData = JSON.parse(content.content_value);
        // Check if we have actual translated content (not empty)
        const hasContent = parsedData.title || parsedData.subtitle || (parsedData.items && parsedData.items.length > 0);
        if (hasContent) {
          setTargetData(parsedData);
          return;
        }
      } catch (e) {
        console.error('Error parsing target language data:', e);
      }
    }
    // Fallback: Show empty state to indicate translation is needed (NOT English data)
    setTargetData({
      title: '',
      subtitle: '',
      columns: data.columns || 4,
      items: data.items?.map(item => ({
        ...item,
        title: '',
        description: ''
      })) || []
    });
  };

  const handleTargetLanguageChange = async (lang: string) => {
    setTargetLanguage(lang);
    await loadTargetLanguageData(lang);
  };

  const handleAddItem = () => {
    const newItem: IndustryItem = {
      icon: 'Camera',
      title: 'New Industry',
      description: 'Description',
      link: ''
    };
    onChange({ ...data, items: [...items, newItem] });
  };

  const handleRemoveItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    onChange({ ...data, items: newItems });
  };

  const handleItemChange = (index: number, field: keyof IndustryItem, value: string) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    onChange({ ...data, items: newItems });
  };

  const handleTargetItemChange = (index: number, field: keyof IndustryItem, value: string) => {
    const newItems = [...targetItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setTargetData({ ...targetData, items: newItems });
  };

  const handleTranslate = async () => {
    setIsTranslating(true);
    try {
      const textsToTranslate: Record<string, string> = {
        title: data.title || '',
        subtitle: data.subtitle || ''
      };

      // Add all item titles and descriptions
      items.forEach((item, index) => {
        textsToTranslate[`item_${index}_title`] = item.title || '';
        textsToTranslate[`item_${index}_description`] = item.description || '';
      });

      console.log('Translating Industries Segment:', textsToTranslate);

      const { data: translationResult, error } = await supabase.functions.invoke('translate-content', {
        body: {
          texts: textsToTranslate,
          targetLanguage
        }
      });

      if (error) throw error;

      console.log('Translation result:', translationResult);

      if (translationResult?.translatedTexts) {
        const translated = translationResult.translatedTexts;
        
        // Update translated items
        const translatedItems = items.map((item, index) => ({
          ...item,
          title: translated[`item_${index}_title`] || item.title,
          description: translated[`item_${index}_description`] || item.description
        }));

        setTargetData({
          ...targetData,
          title: translated.title || data.title || '',
          subtitle: translated.subtitle || data.subtitle || '',
          items: translatedItems,
          columns: data.columns
        });

        toast.success(`Translated to ${LANGUAGES.find(l => l.code === targetLanguage)?.name}`);
      }
    } catch (error) {
      console.error('Translation error:', error);
      toast.error('Translation failed');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSaveEnglish = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('page_content')
        .upsert({
          page_slug: pageSlug,
          section_key: segmentKey,
          language: 'en',
          content_type: 'industries',
          content_value: JSON.stringify(data)
        }, {
          onConflict: 'page_slug,section_key,language'
        });

      if (error) throw error;
      toast.success('Saved English version');
      if (onSave) onSave();
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Save failed');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveTarget = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('page_content')
        .upsert({
          page_slug: pageSlug,
          section_key: segmentKey,
          language: targetLanguage,
          content_type: 'industries',
          content_value: JSON.stringify(targetData)
        }, {
          onConflict: 'page_slug,section_key,language'
        });

      if (error) throw error;
      toast.success(`Saved ${LANGUAGES.find(l => l.code === targetLanguage)?.name} version`);
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Save failed');
    } finally {
      setIsSaving(false);
    }
  };

  const renderEditor = (lang: string, isTarget: boolean = false) => {
    const currentData = isTarget ? targetData : data;
    const currentItems = isTarget ? targetItems : items;
    const handleChange = isTarget 
      ? (newData: any) => setTargetData(newData)
      : onChange;
    const handleItemUpdate = isTarget ? handleTargetItemChange : handleItemChange;

    return (
      <div className="space-y-6 p-4 bg-background border rounded-lg">
        {/* Header Section */}
        <div className="space-y-4">
          <div>
            <Label htmlFor={`title-${lang}`} className="font-medium">Title (H2)</Label>
            <Input
              id={`title-${lang}`}
              value={currentData.title || ''}
              onChange={(e) => handleChange({ ...currentData, title: e.target.value })}
              placeholder="e.g. Trusted Across All Industries"
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor={`subtitle-${lang}`} className="font-medium">Subtitle</Label>
            <Input
              id={`subtitle-${lang}`}
              value={currentData.subtitle || ''}
              onChange={(e) => handleChange({ ...currentData, subtitle: e.target.value })}
              placeholder="e.g. Professional solutions for diverse applications"
              className="mt-2"
            />
          </div>

          {!isTarget && (
            <div>
              <Label htmlFor="columns" className="font-medium">Number of Columns (1-4)</Label>
              <Select
                value={columns.toString()}
                onValueChange={(value) => onChange({ ...data, columns: parseInt(value) })}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Column</SelectItem>
                  <SelectItem value="2">2 Columns</SelectItem>
                  <SelectItem value="3">3 Columns</SelectItem>
                  <SelectItem value="4">4 Columns</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Items Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="font-medium text-lg">Industries ({currentItems.length})</Label>
            {!isTarget && (
              <Button
                type="button"
                onClick={handleAddItem}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Add
              </Button>
            )}
          </div>

          <div className="space-y-4">
            {currentItems.map((item, index) => (
              <div key={index} className="p-4 border rounded-lg bg-muted/30 space-y-3">
                <div className="flex items-center gap-2">
                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium text-sm">Industry {index + 1}</span>
                  {!isTarget && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveItem(index)}
                      className="ml-auto"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {!isTarget && (
                    <div>
                      <Label className="text-xs">Icon</Label>
                      <Select
                        value={item.icon}
                        onValueChange={(value) => handleItemUpdate(index, 'icon', value)}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue>
                            {(() => {
                              const Icon = availableIcons[item.icon as IconName];
                              return Icon ? (
                                <div className="flex items-center gap-2">
                                  <Icon className="h-4 w-4" />
                                  <span>{item.icon}</span>
                                </div>
                              ) : (
                                <span>{item.icon}</span>
                              );
                            })()}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {Object.keys(availableIcons).map((iconName) => {
                            const Icon = availableIcons[iconName as IconName];
                            return (
                              <SelectItem key={iconName} value={iconName}>
                                <div className="flex items-center gap-2">
                                  <Icon className="h-4 w-4" />
                                  <span>{iconName}</span>
                                </div>
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className={!isTarget ? "" : "col-span-2"}>
                    <Label className="text-xs">Title</Label>
                    <Input
                      value={item.title}
                      onChange={(e) => handleItemUpdate(index, 'title', e.target.value)}
                      placeholder="Industry Name"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-xs">Description</Label>
                  <Textarea
                    value={item.description}
                    onChange={(e) => handleItemUpdate(index, 'description', e.target.value)}
                    placeholder="Short description..."
                    rows={2}
                    className="mt-1 resize-none"
                  />
                </div>

                {!isTarget && (
                  <div>
                    <Label className="text-xs">Link (Optional)</Label>
                    <Input
                      value={item.link || ''}
                      onChange={(e) => handleItemUpdate(index, 'link', e.target.value)}
                      placeholder="/automotive"
                      className="mt-1"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          {currentItems.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No industries available. {!isTarget && "Click \"Add\" to add one."}
            </div>
          )}
        </div>

        {/* Save Button */}
        <Button
          onClick={isTarget ? handleSaveTarget : handleSaveEnglish}
          disabled={isSaving}
          className="w-full bg-[#f9dc24] text-black hover:bg-[#f9dc24]/90"
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {isTranslating && (
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 border-2 border-purple-400 rounded-lg p-4 text-center text-white font-semibold animate-pulse shadow-lg shadow-purple-500/50">
          ⏳ Translating content...
        </div>
      )}

      {/* Language Selector Card */}
      <Card className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 border-blue-700">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Languages className="h-5 w-5 text-blue-300" />
              <div>
                <CardTitle className="text-white text-lg">Multi-Language Editor</CardTitle>
                <CardDescription className="text-blue-200 text-sm mt-1">
                  Compare and edit Industries Segment in multiple languages side-by-side
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
                <SelectContent className="bg-gray-900 border-blue-700">
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
              {renderEditor('en', false)}
            </div>

            {/* Right Panel - Target Language */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-900/30 to-blue-800/30 border-2 border-blue-600/50 rounded-lg">
                <span className="text-2xl">{LANGUAGES.find(l => l.code === targetLanguage)?.flag}</span>
                <div>
                  <div className="text-white font-semibold">
                    {LANGUAGES.find(l => l.code === targetLanguage)?.name}
                  </div>
                  <div className="text-blue-300 text-xs">Target Language</div>
                </div>
              </div>
              {renderEditor(targetLanguage, true)}
            </div>
          </>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-green-900/30 to-green-800/30 border-2 border-green-600/50 rounded-lg">
              <span className="text-2xl">🇺🇸</span>
              <div>
                <div className="text-white font-semibold">English (Reference)</div>
                <div className="text-green-300 text-xs">Source Language</div>
              </div>
            </div>
            {renderEditor('en', false)}
          </div>
        )}
      </div>
    </div>
  );
};

export const IndustriesSegmentEditor = memo(IndustriesSegmentEditorComponent);