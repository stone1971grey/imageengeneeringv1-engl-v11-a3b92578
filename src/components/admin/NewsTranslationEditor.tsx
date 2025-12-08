import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Globe, Languages, CheckCircle, AlertCircle, Sparkles, Eye } from "lucide-react";
import { ContentBlock, htmlToBlocks, blocksToHtml } from "./NewsBlockEditor";
import { GeminiIcon } from "@/components/GeminiIcon";

interface NewsTranslationEditorProps {
  articleSlug: string;
  englishData: {
    title: string;
    teaser: string;
    content: string; // JSON stringified blocks
    image_url: string;
    date: string;
    author: string | null;
    category: string | null;
    published: boolean;
  };
  onSave: () => void;
}

const LANGUAGES = [
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "ja", name: "日本語", flag: "🇯🇵" },
  { code: "ko", name: "한국어", flag: "🇰🇷" },
  { code: "zh", name: "中文", flag: "🇨🇳" },
];

interface TranslationStatus {
  [lang: string]: "none" | "partial" | "complete";
}

const NewsTranslationEditor = ({ articleSlug, englishData, onSave }: NewsTranslationEditorProps) => {
  const [selectedLanguage, setSelectedLanguage] = useState("de");
  const [isTranslating, setIsTranslating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [translationStatus, setTranslationStatus] = useState<TranslationStatus>({});
  
  // Target language form data
  const [targetTitle, setTargetTitle] = useState("");
  const [targetTeaser, setTargetTeaser] = useState("");
  const [targetBlocks, setTargetBlocks] = useState<ContentBlock[]>([]);
  
  // Parse English blocks
  const englishBlocks: ContentBlock[] = (() => {
    try {
      return JSON.parse(englishData.content);
    } catch {
      return htmlToBlocks(englishData.content);
    }
  })();

  // Load translation status for all languages
  useEffect(() => {
    const loadTranslationStatus = async () => {
      const status: TranslationStatus = {};
      
      for (const lang of LANGUAGES) {
        const { data } = await supabase
          .from("news_articles")
          .select("title, teaser, content")
          .eq("slug", articleSlug)
          .eq("language", lang.code)
          .maybeSingle();
        
        if (!data) {
          status[lang.code] = "none";
        } else if (data.title && data.teaser && data.content) {
          status[lang.code] = "complete";
        } else {
          status[lang.code] = "partial";
        }
      }
      
      setTranslationStatus(status);
    };
    
    loadTranslationStatus();
  }, [articleSlug]);

  // Load target language data when language changes
  useEffect(() => {
    const loadTargetData = async () => {
      const { data } = await supabase
        .from("news_articles")
        .select("title, teaser, content")
        .eq("slug", articleSlug)
        .eq("language", selectedLanguage)
        .maybeSingle();
      
      if (data) {
        setTargetTitle(data.title || "");
        setTargetTeaser(data.teaser || "");
        try {
          setTargetBlocks(JSON.parse(data.content));
        } catch {
          setTargetBlocks(htmlToBlocks(data.content));
        }
      } else {
        // No translation exists yet - start with empty
        setTargetTitle("");
        setTargetTeaser("");
        setTargetBlocks([]);
      }
    };
    
    loadTargetData();
  }, [articleSlug, selectedLanguage]);

  const handleAutoTranslate = async () => {
    setIsTranslating(true);
    
    try {
      // Prepare texts for translation
      const textsToTranslate: Record<string, string> = {
        title: englishData.title,
        teaser: englishData.teaser,
      };
      
      // Add block texts
      englishBlocks.forEach((block, index) => {
        if (block.type === "paragraph" || block.type === "heading2" || block.type === "heading3" || block.type === "quote") {
          textsToTranslate[`block_${index}_content`] = block.content;
        }
        if (block.type === "image" && block.imageCaption) {
          textsToTranslate[`block_${index}_caption`] = block.imageCaption;
        }
        if (block.type === "list" && block.listItems) {
          block.listItems.forEach((item, itemIndex) => {
            textsToTranslate[`block_${index}_item_${itemIndex}`] = item;
          });
        }
      });

      const { data, error } = await supabase.functions.invoke("translate-content", {
        body: {
          texts: textsToTranslate,
          targetLanguage: selectedLanguage,
        },
      });

      if (error) throw error;
      
      const translated = data.translatedTexts;
      
      // Apply translations
      setTargetTitle(translated.title || englishData.title);
      setTargetTeaser(translated.teaser || englishData.teaser);
      
      // Build translated blocks
      const translatedBlocks = englishBlocks.map((block, index) => {
        const newBlock = { ...block };
        
        if (block.type === "paragraph" || block.type === "heading2" || block.type === "heading3" || block.type === "quote") {
          newBlock.content = translated[`block_${index}_content`] || block.content;
        }
        if (block.type === "image" && block.imageCaption) {
          newBlock.imageCaption = translated[`block_${index}_caption`] || block.imageCaption;
        }
        if (block.type === "list" && block.listItems) {
          newBlock.listItems = block.listItems.map((item, itemIndex) => 
            translated[`block_${index}_item_${itemIndex}`] || item
          );
        }
        
        return newBlock;
      });
      
      setTargetBlocks(translatedBlocks);
      toast.success(`Translation to ${LANGUAGES.find(l => l.code === selectedLanguage)?.name} completed!`);
      
    } catch (error) {
      console.error("Translation error:", error);
      toast.error("Translation failed. Please try again.");
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSave = async () => {
    if (!targetTitle || !targetTeaser || targetBlocks.length === 0) {
      toast.error("Please fill in all required fields or use auto-translate first.");
      return;
    }
    
    setIsSaving(true);
    
    try {
      // Check if translation already exists
      const { data: existing } = await supabase
        .from("news_articles")
        .select("id")
        .eq("slug", articleSlug)
        .eq("language", selectedLanguage)
        .maybeSingle();
      
      const articleData = {
        slug: articleSlug,
        language: selectedLanguage,
        title: targetTitle,
        teaser: targetTeaser,
        content: JSON.stringify(targetBlocks),
        image_url: englishData.image_url, // Same image across languages
        date: englishData.date,
        author: englishData.author,
        category: englishData.category,
        published: englishData.published,
      };
      
      if (existing) {
        // Update existing translation
        const { error } = await supabase
          .from("news_articles")
          .update(articleData)
          .eq("id", existing.id);
        
        if (error) throw error;
      } else {
        // Insert new translation
        const { error } = await supabase
          .from("news_articles")
          .insert([articleData]);
        
        if (error) throw error;
      }
      
      // Update translation status
      setTranslationStatus(prev => ({
        ...prev,
        [selectedLanguage]: "complete"
      }));
      
      toast.success(`${LANGUAGES.find(l => l.code === selectedLanguage)?.name} version saved!`);
      onSave();
      
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Failed to save translation.");
    } finally {
      setIsSaving(false);
    }
  };

  const updateTargetBlock = (index: number, updates: Partial<ContentBlock>) => {
    setTargetBlocks(prev => prev.map((block, i) => 
      i === index ? { ...block, ...updates } : block
    ));
  };

  return (
    <div className="space-y-4">
      {/* Translation Feedback Bar */}
      {isTranslating && (
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 border-2 border-purple-400 rounded-lg p-4 text-center text-white font-semibold animate-pulse shadow-lg shadow-purple-500/50">
          ⏳ Translating content...
        </div>
      )}

      {/* Rainbow Template Header Card */}
      <Card className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 border-blue-700">
        <div className="p-4 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Languages className="h-5 w-5 text-blue-300" />
              <div>
                <h3 className="text-white text-lg font-semibold">Multi-Language Editor</h3>
                <p className="text-blue-200 text-sm mt-1">
                  Translate news article content to multiple languages
                </p>
              </div>
            </div>
          </div>
          
          {/* Language Selector Row */}
          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-blue-700/50">
            <label className="text-white font-medium text-sm">Target Language:</label>
            <div className="flex gap-2">
              {LANGUAGES.map((lang) => {
                const status = translationStatus[lang.code];
                return (
                  <button
                    key={lang.code}
                    onClick={() => setSelectedLanguage(lang.code)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                      selectedLanguage === lang.code
                        ? "bg-[#f9dc24] text-black border-[#f9dc24]"
                        : "bg-blue-950/70 text-gray-300 border-blue-600 hover:border-[#f9dc24]"
                    }`}
                  >
                    <span className="text-lg">{lang.flag}</span>
                    <span className="font-medium">{lang.name}</span>
                    {status === "complete" && <CheckCircle className="w-4 h-4 text-green-500" />}
                    {status === "partial" && <AlertCircle className="w-4 h-4 text-yellow-500" />}
                  </button>
                );
              })}
            </div>
            
            {/* Auto-Translate Button */}
            <Button
              type="button"
              onClick={handleAutoTranslate}
              disabled={isTranslating}
              className="ml-auto bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
            >
              <GeminiIcon className="w-4 h-4 mr-2" />
              {isTranslating ? "Translating..." : "Translate Automatically"}
            </Button>
          </div>
        </div>
      </Card>

      {/* Split Screen Editor */}
      <div className="grid grid-cols-2 gap-6">
        {/* Left: English (Read-only) */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-green-900/30 to-green-800/30 border-2 border-green-600/50 rounded-lg">
            <span className="text-2xl">🇺🇸</span>
            <div>
              <div className="text-white font-semibold">English (Reference)</div>
              <div className="text-green-300 text-xs">Source Language</div>
            </div>
          </div>
          
          <div>
            <Label className="text-gray-400 text-sm">Title</Label>
            <div className="p-3 bg-[#2a2a2a] border border-gray-700 rounded-md text-gray-300">
              {englishData.title}
            </div>
          </div>
          
          <div>
            <Label className="text-gray-400 text-sm">Teaser</Label>
            <div className="p-3 bg-[#2a2a2a] border border-gray-700 rounded-md text-gray-300 min-h-[80px]">
              {englishData.teaser}
            </div>
          </div>
          
          <div>
            <Label className="text-gray-400 text-sm">Content Blocks</Label>
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
              {englishBlocks.map((block, index) => (
                <Card key={block.id} className="p-3 bg-[#2a2a2a] border-gray-700">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-xs text-gray-400 border-gray-600">
                      {block.type} #{index + 1}
                    </Badge>
                  </div>
                  {block.type === "image" ? (
                    <div className="space-y-2">
                      <img src={block.imageUrl} alt="" className="w-full max-h-32 object-cover rounded" />
                      {block.imageCaption && (
                        <p className="text-sm text-gray-400 italic">{block.imageCaption}</p>
                      )}
                    </div>
                  ) : block.type === "list" ? (
                    <ul className="list-disc list-inside text-gray-300 text-sm">
                      {block.listItems?.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-300 text-sm">{block.content}</p>
                  )}
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Target Language (Editable) */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-900/30 to-blue-800/30 border-2 border-blue-600/50 rounded-lg">
            <span className="text-2xl">{LANGUAGES.find(l => l.code === selectedLanguage)?.flag}</span>
            <div>
              <div className="text-white font-semibold">{LANGUAGES.find(l => l.code === selectedLanguage)?.name}</div>
              <div className="text-blue-300 text-xs">Target Language</div>
            </div>
          </div>
          
          <div>
            <Label className="text-gray-300 text-sm">Title</Label>
            <Input
              value={targetTitle}
              onChange={(e) => setTargetTitle(e.target.value)}
              placeholder="Translated title..."
              className="bg-[#3a3a3a] border-gray-600 text-white"
            />
          </div>
          
          <div>
            <Label className="text-gray-300 text-sm">Teaser</Label>
            <Textarea
              value={targetTeaser}
              onChange={(e) => setTargetTeaser(e.target.value)}
              placeholder="Translated teaser..."
              className="bg-[#3a3a3a] border-gray-600 text-white min-h-[80px]"
            />
          </div>
          
          <div>
            <Label className="text-gray-300 text-sm">Content Blocks</Label>
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
              {targetBlocks.length === 0 ? (
                <Card className="p-4 bg-[#2a2a2a] border-gray-700 border-dashed">
                  <p className="text-gray-500 text-center">
                    Click "Auto-Translate" to generate translated content, or start typing manually.
                  </p>
                </Card>
              ) : (
                targetBlocks.map((block, index) => (
                  <Card key={block.id || index} className="p-3 bg-[#3a3a3a] border-gray-600">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="text-xs text-gray-400 border-gray-500">
                        {block.type} #{index + 1}
                      </Badge>
                    </div>
                    {block.type === "image" ? (
                      <div className="space-y-2">
                        <img src={block.imageUrl} alt="" className="w-full max-h-32 object-cover rounded" />
                        <Input
                          value={block.imageCaption || ""}
                          onChange={(e) => updateTargetBlock(index, { imageCaption: e.target.value })}
                          placeholder="Image caption..."
                          className="bg-[#2a2a2a] border-gray-600 text-white text-sm"
                        />
                      </div>
                    ) : block.type === "list" ? (
                      <div className="space-y-1">
                        {block.listItems?.map((item, i) => (
                          <Input
                            key={i}
                            value={item}
                            onChange={(e) => {
                              const newItems = [...(block.listItems || [])];
                              newItems[i] = e.target.value;
                              updateTargetBlock(index, { listItems: newItems });
                            }}
                            className="bg-[#2a2a2a] border-gray-600 text-white text-sm"
                          />
                        ))}
                      </div>
                    ) : (
                      <Textarea
                        value={block.content}
                        onChange={(e) => updateTargetBlock(index, { content: e.target.value })}
                        className="bg-[#2a2a2a] border-gray-600 text-white text-sm min-h-[60px]"
                      />
                    )}
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between pt-4 border-t border-gray-700">
        {/* Preview Button - solid green with white text */}
        <Button
          type="button"
          onClick={() => window.open(`/${selectedLanguage}/news/${articleSlug}`, '_blank')}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <Eye className="w-4 h-4 mr-2" />
          Preview {LANGUAGES.find(l => l.code === selectedLanguage)?.name} Version
        </Button>
        
        {/* Save Button */}
        <Button
          onClick={handleSave}
          disabled={isSaving || !targetTitle || !targetTeaser}
          className="bg-[#f9dc24] text-black hover:bg-[#f9dc24]/90 px-8"
        >
          {isSaving ? "Saving..." : `Save ${LANGUAGES.find(l => l.code === selectedLanguage)?.name} Version`}
        </Button>
      </div>
    </div>
  );
};

export default NewsTranslationEditor;
