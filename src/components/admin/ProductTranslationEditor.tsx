import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Languages, CheckCircle, AlertCircle, X } from "lucide-react";
import { GeminiIcon } from "@/components/GeminiIcon";
import { useEditorLanguageAccess } from "@/hooks/useEditorLanguageAccess";

interface ChartSizeSection {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  rows: any[];
}

interface ChartSizesData {
  introText: string;
  introImageUrl: string;
  sections: ChartSizeSection[];
}

interface ProductTranslationEditorProps {
  productSlug: string;
  englishData: {
    title: string;
    teaser: string;
    description: string;
    image_url: string;
    category: string;
    subcategory: string | null;
    sku: string | null;
    specifications: Record<string, string>;
    applications: string[];
    published: boolean;
    visibility: string;
    availability: string;
    position: number;
    product_types: string[];
    measurement_focus: string[];
    format_fov: string[];
    integration_features: string[];
    display_badges: string[];
    gallery_images: string[];
    documents: { url: string; title: string; type: string }[];
    video_url: string | null;
    price_info: string | null;
    chart_sizes: ChartSizesData | null;
  };
  onSave: () => void;
}

const ALL_LANGUAGES = [
  { code: "de", name: "German", flag: "🇩🇪" },
  { code: "ja", name: "Japanese", flag: "🇯🇵" },
  { code: "ko", name: "Korean", flag: "🇰🇷" },
  { code: "zh", name: "Chinese", flag: "🇨🇳" },
];

interface TranslationStatus {
  [lang: string]: "none" | "partial" | "complete";
}

const ProductTranslationEditor = ({ productSlug, englishData, onSave }: ProductTranslationEditorProps) => {
  // Get editor's language access - use 'products' as the page context
  const { allowedLanguages, canEditLanguage, isLoading: languageAccessLoading } = useEditorLanguageAccess('products');
  
  // Filter languages based on editor's access
  const LANGUAGES = ALL_LANGUAGES.filter(lang => canEditLanguage(lang.code as 'en' | 'de' | 'ja' | 'ko' | 'zh'));
  
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [translationStatus, setTranslationStatus] = useState<TranslationStatus>({});
  
  // Set initial selected language when languages are loaded
  useEffect(() => {
    if (!languageAccessLoading && LANGUAGES.length > 0 && !selectedLanguage) {
      setSelectedLanguage(LANGUAGES[0].code);
    }
  }, [languageAccessLoading, LANGUAGES.length, selectedLanguage]);
  
  // Target language form data
  const [targetTitle, setTargetTitle] = useState("");
  const [targetTeaser, setTargetTeaser] = useState("");
  const [targetDescription, setTargetDescription] = useState("");
  const [targetSpecifications, setTargetSpecifications] = useState<Record<string, string>>({});
  const [targetChartSizes, setTargetChartSizes] = useState<ChartSizesData | null>(null);

  // Load translation status for all languages
  useEffect(() => {
    const loadTranslationStatus = async () => {
      const status: TranslationStatus = {};
      
      for (const lang of LANGUAGES) {
        const { data } = await supabase
          .from("products")
          .select("title, teaser, description")
          .eq("slug", productSlug)
          .eq("language_code", lang.code.toUpperCase())
          .maybeSingle();
        
        if (!data) {
          status[lang.code] = "none";
        } else if (data.title && data.teaser && data.description) {
          status[lang.code] = "complete";
        } else {
          status[lang.code] = "partial";
        }
      }
      
      setTranslationStatus(status);
    };
    
    loadTranslationStatus();
  }, [productSlug]);

  // Load target language data when language changes
  useEffect(() => {
    const loadTargetData = async () => {
      const { data } = await supabase
        .from("products")
        .select("title, teaser, description, specifications, chart_sizes")
        .eq("slug", productSlug)
        .eq("language_code", selectedLanguage.toUpperCase())
        .maybeSingle();
      
      if (data) {
        setTargetTitle(data.title || "");
        setTargetTeaser(data.teaser || "");
        setTargetDescription(data.description || "");
        setTargetSpecifications(
          typeof data.specifications === 'object' && data.specifications !== null
            ? (data.specifications as Record<string, string>)
            : {}
        );
        setTargetChartSizes(data.chart_sizes as unknown as ChartSizesData | null);
      } else {
        // No translation exists yet - start with empty or copy from English
        setTargetTitle("");
        setTargetTeaser("");
        setTargetDescription("");
        setTargetSpecifications({});
        setTargetChartSizes(null);
      }
    };
    
    loadTargetData();
  }, [productSlug, selectedLanguage]);

  const handleAutoTranslate = async () => {
    setIsTranslating(true);
    
    try {
      // Prepare texts for translation
      const textsToTranslate: Record<string, string> = {
        title: englishData.title,
        teaser: englishData.teaser,
        description: englishData.description || "",
      };
      
      // Add specifications
      Object.entries(englishData.specifications).forEach(([key, value]) => {
        textsToTranslate[`spec_key_${key}`] = key;
        textsToTranslate[`spec_value_${key}`] = value;
      });

      // Add chart sizes texts
      if (englishData.chart_sizes) {
        textsToTranslate['chartSizes_introText'] = englishData.chart_sizes.introText || "";
        englishData.chart_sizes.sections?.forEach((section, idx) => {
          textsToTranslate[`chartSizes_section_${idx}_title`] = section.title || "";
          textsToTranslate[`chartSizes_section_${idx}_description`] = section.description || "";
        });
      }

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
      setTargetDescription(translated.description || englishData.description);
      
      // Build translated specifications
      const translatedSpecs: Record<string, string> = {};
      Object.keys(englishData.specifications).forEach((key) => {
        const translatedKey = translated[`spec_key_${key}`] || key;
        const translatedValue = translated[`spec_value_${key}`] || englishData.specifications[key];
        translatedSpecs[translatedKey] = translatedValue;
      });
      setTargetSpecifications(translatedSpecs);

      // Build translated chart sizes
      if (englishData.chart_sizes) {
        const translatedChartSizes: ChartSizesData = {
          introText: translated['chartSizes_introText'] || englishData.chart_sizes.introText,
          introImageUrl: englishData.chart_sizes.introImageUrl, // Images not translated
          sections: englishData.chart_sizes.sections?.map((section, idx) => ({
            ...section,
            title: translated[`chartSizes_section_${idx}_title`] || section.title,
            description: translated[`chartSizes_section_${idx}_description`] || section.description,
          })) || []
        };
        setTargetChartSizes(translatedChartSizes);
      }
      
      toast.success(`Translation to ${LANGUAGES.find(l => l.code === selectedLanguage)?.name} completed!`);
      
    } catch (error) {
      console.error("Translation error:", error);
      toast.error("Translation failed. Please try again.");
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSave = async () => {
    if (!targetTitle || !targetTeaser) {
      toast.error("Please fill in at least Title and Teaser, or use auto-translate first.");
      return;
    }
    
    setIsSaving(true);
    
    try {
      // Check if translation already exists
      const { data: existing } = await supabase
        .from("products")
        .select("id")
        .eq("slug", productSlug)
        .eq("language_code", selectedLanguage.toUpperCase())
        .maybeSingle();
      
      const productData = {
        slug: productSlug,
        language_code: selectedLanguage.toUpperCase(),
        title: targetTitle,
        teaser: targetTeaser,
        description: targetDescription || null,
        specifications: targetSpecifications,
        chart_sizes: targetChartSizes ? JSON.parse(JSON.stringify(targetChartSizes)) : null,
        // Copy non-translatable fields from English
        image_url: englishData.image_url,
        video_url: englishData.video_url,
        gallery_images: englishData.gallery_images,
        documents: englishData.documents,
        category: englishData.category,
        subcategory: englishData.subcategory,
        sku: englishData.sku,
        applications: englishData.applications,
        product_types: englishData.product_types,
        measurement_focus: englishData.measurement_focus,
        format_fov: englishData.format_fov,
        integration_features: englishData.integration_features,
        display_badges: englishData.display_badges,
        price_info: englishData.price_info,
        availability: englishData.availability,
        published: englishData.published,
        visibility: englishData.visibility,
        position: englishData.position,
      };
      
      if (existing) {
        // Update existing translation
        const { error } = await supabase
          .from("products")
          .update(productData)
          .eq("id", existing.id);
        
        if (error) throw error;
      } else {
        // Insert new translation
        const { error } = await supabase
          .from("products")
          .insert([productData]);
        
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

  const specEntries = Object.entries(englishData.specifications);
  const hasChartSizes = englishData.chart_sizes && (
    englishData.chart_sizes.introText || 
    (englishData.chart_sizes.sections && englishData.chart_sizes.sections.length > 0)
  );

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
                  Translate product content to multiple languages
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
            <Label className="text-gray-400 text-sm">Description</Label>
            <div className="p-3 bg-[#2a2a2a] border border-gray-700 rounded-md text-gray-300 min-h-[120px] max-h-[200px] overflow-y-auto">
              {englishData.description || <span className="text-gray-500 italic">No description</span>}
            </div>
          </div>
          
          {/* Specifications (English) */}
          {specEntries.length > 0 && (
            <div>
              <Label className="text-gray-400 text-sm">Specifications</Label>
              <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                {specEntries.map(([key, value]) => (
                  <div key={key} className="p-2 bg-[#2a2a2a] border border-gray-700 rounded-md">
                    <span className="text-gray-400 text-sm">{key}:</span>
                    <span className="text-gray-300 text-sm ml-2">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Chart Sizes (English) */}
          {hasChartSizes && (
            <div>
              <Label className="text-gray-400 text-sm">Chart Sizes</Label>
              <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                {englishData.chart_sizes?.introText && (
                  <div className="p-2 bg-[#2a2a2a] border border-gray-700 rounded-md">
                    <span className="text-gray-400 text-xs block">Intro Text:</span>
                    <span className="text-gray-300 text-sm">{englishData.chart_sizes.introText}</span>
                  </div>
                )}
                {englishData.chart_sizes?.sections?.map((section, idx) => (
                  <div key={section.id || idx} className="p-2 bg-[#2a2a2a] border border-gray-700 rounded-md">
                    <Badge variant="outline" className="text-xs text-gray-400 border-gray-600 mb-1">
                      Section {idx + 1}
                    </Badge>
                    <div className="text-gray-300 text-sm font-medium">{section.title}</div>
                    {section.description && (
                      <div className="text-gray-400 text-xs mt-1">{section.description}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
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
            <Label className="text-gray-300 text-sm">Title *</Label>
            <Input
              value={targetTitle}
              onChange={(e) => setTargetTitle(e.target.value)}
              placeholder="Translated title..."
              className="bg-[#3a3a3a] border-gray-600 text-white"
            />
          </div>
          
          <div>
            <Label className="text-gray-300 text-sm">Teaser *</Label>
            <Textarea
              value={targetTeaser}
              onChange={(e) => setTargetTeaser(e.target.value)}
              placeholder="Translated teaser..."
              className="bg-[#3a3a3a] border-gray-600 text-white min-h-[80px]"
            />
          </div>
          
          <div>
            <Label className="text-gray-300 text-sm">Description</Label>
            <Textarea
              value={targetDescription}
              onChange={(e) => setTargetDescription(e.target.value)}
              placeholder="Translated description..."
              className="bg-[#3a3a3a] border-gray-600 text-white min-h-[120px] max-h-[200px]"
            />
          </div>
          
          {/* Specifications (Target) */}
          {specEntries.length > 0 && (
            <div>
              <Label className="text-gray-300 text-sm">Specifications</Label>
              <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                {specEntries.map(([engKey, engValue]) => {
                  // Find corresponding translated key
                  const targetKeys = Object.keys(targetSpecifications);
                  const targetKeyIdx = Object.keys(englishData.specifications).indexOf(engKey);
                  const currentTargetKey = targetKeys[targetKeyIdx] || engKey;
                  const currentTargetValue = targetSpecifications[currentTargetKey] || "";
                  
                  return (
                    <div key={engKey} className="p-2 bg-[#3a3a3a] border border-gray-600 rounded-md space-y-1">
                      <div className="flex gap-2">
                        <Input
                          value={currentTargetKey}
                          onChange={(e) => {
                            const newSpecs = { ...targetSpecifications };
                            delete newSpecs[currentTargetKey];
                            newSpecs[e.target.value] = currentTargetValue;
                            setTargetSpecifications(newSpecs);
                          }}
                          placeholder={`Key: ${engKey}`}
                          className="bg-[#2a2a2a] border-gray-700 text-white text-sm flex-1"
                        />
                        <Input
                          value={currentTargetValue}
                          onChange={(e) => {
                            setTargetSpecifications(prev => ({
                              ...prev,
                              [currentTargetKey]: e.target.value
                            }));
                          }}
                          placeholder={`Value: ${engValue}`}
                          className="bg-[#2a2a2a] border-gray-700 text-white text-sm flex-1"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Chart Sizes (Target) */}
          {hasChartSizes && (
            <div>
              <Label className="text-gray-300 text-sm">Chart Sizes</Label>
              <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                {englishData.chart_sizes?.introText && (
                  <div className="p-2 bg-[#3a3a3a] border border-gray-600 rounded-md">
                    <span className="text-gray-400 text-xs block mb-1">Intro Text:</span>
                    <Textarea
                      value={targetChartSizes?.introText || ""}
                      onChange={(e) => setTargetChartSizes(prev => ({
                        ...prev!,
                        introText: e.target.value,
                        introImageUrl: prev?.introImageUrl || englishData.chart_sizes?.introImageUrl || "",
                        sections: prev?.sections || englishData.chart_sizes?.sections || []
                      }))}
                      placeholder={englishData.chart_sizes.introText}
                      className="bg-[#2a2a2a] border-gray-700 text-white text-sm"
                      rows={2}
                    />
                  </div>
                )}
                {englishData.chart_sizes?.sections?.map((section, idx) => (
                  <div key={section.id || idx} className="p-2 bg-[#3a3a3a] border border-gray-600 rounded-md space-y-2">
                    <Badge variant="outline" className="text-xs text-blue-300 border-blue-600">
                      Section {idx + 1}
                    </Badge>
                    <Input
                      value={targetChartSizes?.sections?.[idx]?.title || ""}
                      onChange={(e) => {
                        setTargetChartSizes(prev => {
                          const sections = [...(prev?.sections || englishData.chart_sizes?.sections || [])];
                          sections[idx] = { ...sections[idx], title: e.target.value };
                          return {
                            ...prev!,
                            introText: prev?.introText || englishData.chart_sizes?.introText || "",
                            introImageUrl: prev?.introImageUrl || englishData.chart_sizes?.introImageUrl || "",
                            sections
                          };
                        });
                      }}
                      placeholder={section.title}
                      className="bg-[#2a2a2a] border-gray-700 text-white text-sm"
                    />
                    <Textarea
                      value={targetChartSizes?.sections?.[idx]?.description || ""}
                      onChange={(e) => {
                        setTargetChartSizes(prev => {
                          const sections = [...(prev?.sections || englishData.chart_sizes?.sections || [])];
                          sections[idx] = { ...sections[idx], description: e.target.value };
                          return {
                            ...prev!,
                            introText: prev?.introText || englishData.chart_sizes?.introText || "",
                            introImageUrl: prev?.introImageUrl || englishData.chart_sizes?.introImageUrl || "",
                            sections
                          };
                        });
                      }}
                      placeholder={section.description}
                      className="bg-[#2a2a2a] border-gray-700 text-white text-sm"
                      rows={2}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Save Button - aligned with right column */}
      <div className="grid grid-cols-2 gap-6">
        <div></div>
        <Button
          onClick={handleSave}
          disabled={isSaving || !targetTitle || !targetTeaser}
          className="w-full bg-[#f9dc24] text-black hover:bg-[#f9dc24]/90 font-semibold py-3"
        >
          {isSaving ? "Saving..." : `Save ${LANGUAGES.find(l => l.code === selectedLanguage)?.name} Version`}
        </Button>
      </div>
    </div>
  );
};

export default ProductTranslationEditor;
