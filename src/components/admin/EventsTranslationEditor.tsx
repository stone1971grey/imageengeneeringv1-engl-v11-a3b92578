import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Languages, CheckCircle, AlertCircle, List } from "lucide-react";
import { GeminiIcon } from "@/components/GeminiIcon";

interface DescriptionSection {
  id: string;
  heading: string;
  content: string;
  isBulletList: boolean;
}

interface EventsTranslationEditorProps {
  eventSlug: string;
  englishData: {
    title: string;
    teaser: string;
    description: string | null;
    image_url: string;
    date: string;
    time_start: string;
    time_end: string | null;
    location_city: string;
    location_country: string;
    location_venue: string | null;
    category: string;
    is_online: boolean;
    max_participants: number | null;
    registration_deadline: string | null;
    external_url: string | null;
    published: boolean;
  };
  onSave: () => void;
}

const LANGUAGES = [
  { code: "DE", name: "German", flag: "🇩🇪" },
  { code: "JA", name: "Japanese", flag: "🇯🇵" },
  { code: "KO", name: "Korean", flag: "🇰🇷" },
  { code: "ZH", name: "Chinese", flag: "🇨🇳" },
];

interface TranslationStatus {
  [lang: string]: "none" | "partial" | "complete";
}

const parseDescriptionToSections = (description: string | null): DescriptionSection[] => {
  if (!description) return [{ id: '1', heading: '', content: '', isBulletList: false }];
  try {
    const parsed = JSON.parse(description);
    if (Array.isArray(parsed)) return parsed;
  } catch {
    return [{ id: '1', heading: '', content: description, isBulletList: false }];
  }
  return [{ id: '1', heading: '', content: '', isBulletList: false }];
};

const sectionsToJson = (sections: DescriptionSection[]): string => {
  const filledSections = sections.filter(s => s.heading.trim() || s.content.trim());
  return filledSections.length > 0 ? JSON.stringify(filledSections) : '';
};

const EventsTranslationEditor = ({ eventSlug, englishData, onSave }: EventsTranslationEditorProps) => {
  const [selectedLanguage, setSelectedLanguage] = useState("DE");
  const [isTranslating, setIsTranslating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [translationStatus, setTranslationStatus] = useState<TranslationStatus>({});
  
  // Target language form data
  const [targetTitle, setTargetTitle] = useState("");
  const [targetTeaser, setTargetTeaser] = useState("");
  const [targetSections, setTargetSections] = useState<DescriptionSection[]>([]);
  const [targetLocationCity, setTargetLocationCity] = useState("");
  const [targetLocationCountry, setTargetLocationCountry] = useState("");
  const [targetLocationVenue, setTargetLocationVenue] = useState("");
  
  // Parse English sections
  const englishSections = parseDescriptionToSections(englishData.description);

  // Load translation status for all languages
  useEffect(() => {
    const loadTranslationStatus = async () => {
      const status: TranslationStatus = {};
      
      for (const lang of LANGUAGES) {
        const { data } = await supabase
          .from("events")
          .select("title, teaser, description")
          .eq("slug", eventSlug)
          .eq("language_code", lang.code)
          .maybeSingle();
        
        if (!data) {
          status[lang.code] = "none";
        } else if (data.title && data.teaser) {
          status[lang.code] = "complete";
        } else {
          status[lang.code] = "partial";
        }
      }
      
      setTranslationStatus(status);
    };
    
    loadTranslationStatus();
  }, [eventSlug]);

  // Load target language data when language changes
  useEffect(() => {
    const loadTargetData = async () => {
      const { data } = await supabase
        .from("events")
        .select("title, teaser, description, location_city, location_country, location_venue")
        .eq("slug", eventSlug)
        .eq("language_code", selectedLanguage)
        .maybeSingle();
      
      if (data) {
        setTargetTitle(data.title || "");
        setTargetTeaser(data.teaser || "");
        setTargetSections(parseDescriptionToSections(data.description));
        setTargetLocationCity(data.location_city || "");
        setTargetLocationCountry(data.location_country || "");
        setTargetLocationVenue(data.location_venue || "");
      } else {
        // No translation exists yet - start with empty
        setTargetTitle("");
        setTargetTeaser("");
        setTargetSections([]);
        setTargetLocationCity("");
        setTargetLocationCountry("");
        setTargetLocationVenue("");
      }
    };
    
    loadTargetData();
  }, [eventSlug, selectedLanguage]);

  const handleAutoTranslate = async () => {
    setIsTranslating(true);
    
    try {
      // Prepare texts for translation
      const textsToTranslate: Record<string, string> = {
        title: englishData.title,
        teaser: englishData.teaser,
        location_city: englishData.location_city,
        location_country: englishData.location_country,
      };
      
      if (englishData.location_venue) {
        textsToTranslate.location_venue = englishData.location_venue;
      }
      
      // Add section texts
      englishSections.forEach((section, index) => {
        if (section.heading) {
          textsToTranslate[`section_${index}_heading`] = section.heading;
        }
        if (section.content) {
          textsToTranslate[`section_${index}_content`] = section.content;
        }
      });

      const { data, error } = await supabase.functions.invoke("translate-content", {
        body: {
          texts: textsToTranslate,
          targetLanguage: selectedLanguage.toLowerCase(),
        },
      });

      if (error) throw error;
      
      const translated = data.translatedTexts;
      
      // Apply translations
      setTargetTitle(translated.title || englishData.title);
      setTargetTeaser(translated.teaser || englishData.teaser);
      setTargetLocationCity(translated.location_city || englishData.location_city);
      setTargetLocationCountry(translated.location_country || englishData.location_country);
      setTargetLocationVenue(translated.location_venue || englishData.location_venue || "");
      
      // Build translated sections
      const translatedSections = englishSections.map((section, index) => ({
        ...section,
        heading: translated[`section_${index}_heading`] || section.heading,
        content: translated[`section_${index}_content`] || section.content,
      }));
      
      setTargetSections(translatedSections);
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
      toast.error("Please fill in title and teaser, or use auto-translate first.");
      return;
    }
    
    setIsSaving(true);
    
    try {
      // Check if translation already exists
      const { data: existing } = await supabase
        .from("events")
        .select("id")
        .eq("slug", eventSlug)
        .eq("language_code", selectedLanguage)
        .maybeSingle();
      
      const eventData = {
        slug: eventSlug,
        language_code: selectedLanguage,
        title: targetTitle,
        teaser: targetTeaser,
        description: sectionsToJson(targetSections) || null,
        image_url: englishData.image_url,
        date: englishData.date,
        time_start: englishData.time_start,
        time_end: englishData.time_end,
        location_city: targetLocationCity || englishData.location_city,
        location_country: targetLocationCountry || englishData.location_country,
        location_venue: targetLocationVenue || englishData.location_venue,
        category: englishData.category,
        is_online: englishData.is_online,
        max_participants: englishData.max_participants,
        registration_deadline: englishData.registration_deadline,
        external_url: englishData.external_url,
        published: englishData.published,
      };
      
      if (existing) {
        // Update existing translation
        const { error } = await supabase
          .from("events")
          .update(eventData)
          .eq("id", existing.id);
        
        if (error) throw error;
      } else {
        // Insert new translation
        const { error } = await supabase
          .from("events")
          .insert([eventData]);
        
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

  const updateTargetSection = (id: string, field: keyof DescriptionSection, value: string | boolean) => {
    setTargetSections(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
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
                  Translate event content to multiple languages
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
          
          <div className="grid grid-cols-3 gap-2">
            <div>
              <Label className="text-gray-400 text-sm">City</Label>
              <div className="p-2 bg-[#2a2a2a] border border-gray-700 rounded-md text-gray-300 text-sm">
                {englishData.location_city}
              </div>
            </div>
            <div>
              <Label className="text-gray-400 text-sm">Country</Label>
              <div className="p-2 bg-[#2a2a2a] border border-gray-700 rounded-md text-gray-300 text-sm">
                {englishData.location_country}
              </div>
            </div>
            <div>
              <Label className="text-gray-400 text-sm">Venue</Label>
              <div className="p-2 bg-[#2a2a2a] border border-gray-700 rounded-md text-gray-300 text-sm">
                {englishData.location_venue || "-"}
              </div>
            </div>
          </div>
          
          <div>
            <Label className="text-gray-400 text-sm">Description Sections</Label>
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
              {englishSections.map((section, index) => (
                <Card key={section.id} className="p-3 bg-[#2a2a2a] border-gray-700">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-xs text-gray-400 border-gray-600">
                      Section #{index + 1}
                    </Badge>
                    {section.isBulletList && (
                      <Badge variant="outline" className="text-xs text-yellow-400 border-yellow-600">
                        <List className="w-3 h-3 mr-1" /> Bullet List
                      </Badge>
                    )}
                  </div>
                  {section.heading && (
                    <p className="text-gray-200 font-semibold text-sm mb-1">{section.heading}</p>
                  )}
                  <p className="text-gray-400 text-sm whitespace-pre-wrap">{section.content}</p>
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
          
          <div className="grid grid-cols-3 gap-2">
            <div>
              <Label className="text-gray-300 text-sm">City</Label>
              <Input
                value={targetLocationCity}
                onChange={(e) => setTargetLocationCity(e.target.value)}
                placeholder="City..."
                className="bg-[#3a3a3a] border-gray-600 text-white text-sm"
              />
            </div>
            <div>
              <Label className="text-gray-300 text-sm">Country</Label>
              <Input
                value={targetLocationCountry}
                onChange={(e) => setTargetLocationCountry(e.target.value)}
                placeholder="Country..."
                className="bg-[#3a3a3a] border-gray-600 text-white text-sm"
              />
            </div>
            <div>
              <Label className="text-gray-300 text-sm">Venue</Label>
              <Input
                value={targetLocationVenue}
                onChange={(e) => setTargetLocationVenue(e.target.value)}
                placeholder="Venue..."
                className="bg-[#3a3a3a] border-gray-600 text-white text-sm"
              />
            </div>
          </div>
          
          <div>
            <Label className="text-gray-300 text-sm">Description Sections</Label>
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
              {targetSections.length === 0 ? (
                <Card className="p-4 bg-[#2a2a2a] border-gray-700 border-dashed">
                  <p className="text-gray-500 text-center">
                    Click "Translate Automatically" to generate translated content.
                  </p>
                </Card>
              ) : (
                targetSections.map((section, index) => (
                  <Card key={section.id || index} className="p-3 bg-[#3a3a3a] border-gray-600">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="text-xs text-gray-400 border-gray-500">
                        Section #{index + 1}
                      </Badge>
                      {section.isBulletList && (
                        <Badge variant="outline" className="text-xs text-yellow-400 border-yellow-600">
                          <List className="w-3 h-3 mr-1" /> Bullet List
                        </Badge>
                      )}
                    </div>
                    <Input
                      value={section.heading}
                      onChange={(e) => updateTargetSection(section.id, "heading", e.target.value)}
                      placeholder="Section heading..."
                      className="bg-[#2a2a2a] border-gray-600 text-white text-sm mb-2"
                    />
                    <Textarea
                      value={section.content}
                      onChange={(e) => updateTargetSection(section.id, "content", e.target.value)}
                      placeholder="Section content..."
                      className="bg-[#2a2a2a] border-gray-600 text-white text-sm min-h-[60px]"
                    />
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <Button
        onClick={handleSave}
        disabled={isSaving}
        className="w-full bg-[#f9dc24] hover:bg-[#f9dc24]/90 text-black"
      >
        {isSaving ? "Saving..." : `Save ${LANGUAGES.find(l => l.code === selectedLanguage)?.name} Translation`}
      </Button>
    </div>
  );
};

export default EventsTranslationEditor;
