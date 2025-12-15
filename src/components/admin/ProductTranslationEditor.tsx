import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Languages, CheckCircle, AlertCircle } from "lucide-react";
import { GeminiIcon } from "@/components/GeminiIcon";

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
    features: string[];
    applications: string[];
    published: boolean;
    visibility: string;
    availability: string;
    position: number;
    // Filter fields - not translated
    product_types: string[];
    measurement_focus: string[];
    format_fov: string[];
    integration_features: string[];
    display_badges: string[];
    gallery_images: string[];
    documents: { url: string; title: string; type: string }[];
    video_url: string | null;
    price_info: string | null;
    chart_sizes: any;
  };
  onSave: () => void;
}

const LANGUAGES = [
  { code: "de", name: "German", flag: "🇩🇪" },
  { code: "ja", name: "Japanese", flag: "🇯🇵" },
  { code: "ko", name: "Korean", flag: "🇰🇷" },
  { code: "zh", name: "Chinese", flag: "🇨🇳" },
];

interface TranslationStatus {
  [lang: string]: "none" | "partial" | "complete";
}

const ProductTranslationEditor = ({ productSlug, englishData, onSave }: ProductTranslationEditorProps) => {
  const [selectedLanguage, setSelectedLanguage] = useState("de");
  const [isTranslating, setIsTranslating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [translationStatus, setTranslationStatus] = useState<TranslationStatus>({});
  
  // Target language form data
  const [targetTitle, setTargetTitle] = useState("");
  const [targetTeaser, setTargetTeaser] = useState("");
  const [targetDescription, setTargetDescription] = useState("");
  const [targetFeatures, setTargetFeatures] = useState<string[]>([]);

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
        .select("title, teaser, description, features")
        .eq("slug", productSlug)
        .eq("language_code", selectedLanguage.toUpperCase())
        .maybeSingle();
      
      if (data) {
        setTargetTitle(data.title || "");
        setTargetTeaser(data.teaser || "");
        setTargetDescription(data.description || "");
        const features = Array.isArray(data.features) 
          ? (data.features as unknown as string[]).filter(f => typeof f === 'string')
          : [];
        setTargetFeatures(features);
      } else {
        // No translation exists yet - start with empty
        setTargetTitle("");
        setTargetTeaser("");
        setTargetDescription("");
        setTargetFeatures([]);
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
      
      // Add features
      englishData.features.forEach((feature, index) => {
        textsToTranslate[`feature_${index}`] = feature;
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
      setTargetDescription(translated.description || englishData.description);
      
      // Build translated features
      const translatedFeatures = englishData.features.map((_, index) => 
        translated[`feature_${index}`] || englishData.features[index]
      );
      setTargetFeatures(translatedFeatures);
      
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
        features: targetFeatures,
        // Copy non-translatable fields from English
        image_url: englishData.image_url,
        video_url: englishData.video_url,
        gallery_images: englishData.gallery_images,
        documents: englishData.documents,
        category: englishData.category,
        subcategory: englishData.subcategory,
        sku: englishData.sku,
        specifications: englishData.specifications,
        applications: englishData.applications,
        product_types: englishData.product_types,
        measurement_focus: englishData.measurement_focus,
        format_fov: englishData.format_fov,
        integration_features: englishData.integration_features,
        display_badges: englishData.display_badges,
        chart_sizes: englishData.chart_sizes,
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
          
          {englishData.features.length > 0 && (
            <div>
              <Label className="text-gray-400 text-sm">Features</Label>
              <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                {englishData.features.map((feature, index) => (
                  <Card key={index} className="p-3 bg-[#2a2a2a] border-gray-700">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs text-gray-400 border-gray-600">
                        Feature #{index + 1}
                      </Badge>
                    </div>
                    <p className="text-gray-300 text-sm">{feature}</p>
                  </Card>
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
          
          {englishData.features.length > 0 && (
            <div>
              <Label className="text-gray-300 text-sm">Features</Label>
              <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                {englishData.features.map((_, index) => (
                  <Card key={index} className="p-3 bg-[#3a3a3a] border-gray-600">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="text-xs text-blue-300 border-blue-600">
                        Feature #{index + 1}
                      </Badge>
                    </div>
                    <Input
                      value={targetFeatures[index] || ""}
                      onChange={(e) => {
                        const newFeatures = [...targetFeatures];
                        newFeatures[index] = e.target.value;
                        setTargetFeatures(newFeatures);
                      }}
                      placeholder="Translated feature..."
                      className="bg-[#2a2a2a] border-gray-700 text-white text-sm"
                    />
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Save Button */}
      <Button
        onClick={handleSave}
        disabled={isSaving || !targetTitle || !targetTeaser}
        className="w-full bg-[#f9dc24] text-black hover:bg-[#f9dc24]/90 font-semibold py-3"
      >
        {isSaving ? "Saving..." : `Save ${LANGUAGES.find(l => l.code === selectedLanguage)?.name} Version`}
      </Button>
    </div>
  );
};

export default ProductTranslationEditor;
