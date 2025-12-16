import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Languages, CheckCircle, AlertCircle, Upload, FileText, X, FolderOpen } from "lucide-react";
import { GeminiIcon } from "@/components/GeminiIcon";
import { DataHubDialog } from "./DataHubDialog";

interface DescriptionSection {
  id: string;
  heading: string;
  content: string;
  isBulletList: boolean;
}

interface DownloadTranslationEditorProps {
  downloadSlug: string;
  englishData: {
    title: string;
    teaser: string;
    description: string | null;
    download_type: string;
    category: string | null;
    pages: number | null;
    duration: string | null;
    publish_date: string;
    download_url: string | null;
    image_url: string | null;
    published: boolean;
    visibility: string;
    position: number;
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

const parseDescriptionToSections = (description: string | null): DescriptionSection[] => {
  if (!description) return [];
  try {
    const parsed = JSON.parse(description);
    if (Array.isArray(parsed)) return parsed;
  } catch {
    return [{ id: '1', heading: '', content: description, isBulletList: false }];
  }
  return [];
};

const DownloadTranslationEditor = ({ downloadSlug, englishData, onSave }: DownloadTranslationEditorProps) => {
  const [selectedLanguage, setSelectedLanguage] = useState("de");
  const [isTranslating, setIsTranslating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showMediaSelector, setShowMediaSelector] = useState(false);
  const [translationStatus, setTranslationStatus] = useState<TranslationStatus>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Target language form data
  const [targetTitle, setTargetTitle] = useState("");
  const [targetTeaser, setTargetTeaser] = useState("");
  const [targetDescription, setTargetDescription] = useState("");
  const [targetDownloadUrl, setTargetDownloadUrl] = useState<string | null>(null);

  // Load translation status for all languages
  useEffect(() => {
    const loadTranslationStatus = async () => {
      const status: TranslationStatus = {};
      
      for (const lang of LANGUAGES) {
        const { data } = await supabase
          .from("downloads")
          .select("title, teaser, description")
          .eq("slug", downloadSlug)
          .eq("language_code", lang.code.toUpperCase())
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
  }, [downloadSlug]);

  // Load target language data when language changes
  useEffect(() => {
    const loadTargetData = async () => {
      const { data } = await supabase
        .from("downloads")
        .select("title, teaser, description, download_url")
        .eq("slug", downloadSlug)
        .eq("language_code", selectedLanguage.toUpperCase())
        .maybeSingle();
      
      if (data) {
        setTargetTitle(data.title || "");
        setTargetTeaser(data.teaser || "");
        setTargetDescription(data.description || "");
        setTargetDownloadUrl(data.download_url);
      } else {
        setTargetTitle("");
        setTargetTeaser("");
        setTargetDescription("");
        setTargetDownloadUrl(null);
      }
    };
    
    loadTargetData();
  }, [downloadSlug, selectedLanguage]);

  // Handle PDF upload for target language
  const handlePdfUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast.error("Please select a PDF file");
      return;
    }

    setIsUploading(true);
    
    try {
      const langCode = selectedLanguage.toLowerCase();
      const fileName = `${downloadSlug}_${langCode}_${Date.now()}.pdf`;
      const filePath = `info-hub/${englishData.category?.toLowerCase().replace(/\s+/g, '-') || 'general'}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('page-images')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('page-images')
        .getPublicUrl(filePath);

      setTargetDownloadUrl(publicUrl);
      toast.success(`PDF for ${LANGUAGES.find(l => l.code === selectedLanguage)?.name} uploaded!`);
      
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload PDF");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemovePdf = () => {
    setTargetDownloadUrl(null);
    toast.info("Language-specific PDF removed. Will use English version.");
  };

  const handleMediaSelect = (url: string) => {
    setTargetDownloadUrl(url);
    setShowMediaSelector(false);
    toast.success(`PDF from Media Management selected for ${LANGUAGES.find(l => l.code === selectedLanguage)?.name}!`);
  };

  const handleAutoTranslate = async () => {
    setIsTranslating(true);
    
    try {
      const textsToTranslate: Record<string, string> = {
        title: englishData.title,
        teaser: englishData.teaser,
      };

      // Add description sections
      const sections = parseDescriptionToSections(englishData.description);
      sections.forEach((section, idx) => {
        if (section.heading) textsToTranslate[`desc_heading_${idx}`] = section.heading;
        if (section.content) textsToTranslate[`desc_content_${idx}`] = section.content;
      });

      const { data, error } = await supabase.functions.invoke("translate-content", {
        body: {
          texts: textsToTranslate,
          targetLanguage: selectedLanguage,
        },
      });

      if (error) throw error;
      
      const translated = data.translatedTexts;
      
      setTargetTitle(translated.title || englishData.title);
      setTargetTeaser(translated.teaser || englishData.teaser);
      
      // Build translated description
      if (sections.length > 0) {
        const translatedSections = sections.map((section, idx) => ({
          ...section,
          heading: translated[`desc_heading_${idx}`] || section.heading,
          content: translated[`desc_content_${idx}`] || section.content,
        }));
        setTargetDescription(JSON.stringify(translatedSections));
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
      const { data: existing } = await supabase
        .from("downloads")
        .select("id")
        .eq("slug", downloadSlug)
        .eq("language_code", selectedLanguage.toUpperCase())
        .maybeSingle();
      
      const downloadData = {
        slug: downloadSlug,
        language_code: selectedLanguage.toUpperCase(),
        title: targetTitle,
        teaser: targetTeaser,
        description: targetDescription || null,
        // Copy non-translatable fields from English
        download_type: englishData.download_type,
        category: englishData.category,
        pages: englishData.pages,
        duration: englishData.duration,
        publish_date: englishData.publish_date,
        // Use language-specific PDF if available, otherwise fallback to English
        download_url: targetDownloadUrl || englishData.download_url,
        image_url: englishData.image_url,
        published: englishData.published,
        visibility: englishData.visibility,
        position: englishData.position,
      };
      
      if (existing) {
        const { error } = await supabase
          .from("downloads")
          .update(downloadData)
          .eq("id", existing.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("downloads")
          .insert([downloadData]);
        
        if (error) throw error;
      }
      
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

  const englishSections = parseDescriptionToSections(englishData.description);
  const targetSections = parseDescriptionToSections(targetDescription);

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
                  Translate download content to multiple languages
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
            <div className="p-3 bg-[#2a2a2a] border border-gray-700 rounded-md text-gray-300 min-h-[100px] max-h-[200px] overflow-y-auto">
              {englishSections.length > 0 ? (
                <div className="space-y-3">
                  {englishSections.map((section, idx) => (
                    <div key={section.id || idx}>
                      {section.heading && (
                        <div className="font-semibold text-gray-200">{section.heading}</div>
                      )}
                      {section.content && (
                        <div className="text-gray-400 text-sm whitespace-pre-wrap">{section.content}</div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <span className="text-gray-500 italic">No description</span>
              )}
            </div>
          </div>

          {/* English PDF (Read-only) */}
          <div>
            <Label className="text-gray-400 text-sm">PDF File</Label>
            <div className="p-3 bg-[#2a2a2a] border border-gray-700 rounded-md text-gray-300">
              {englishData.download_url ? (
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-red-400" />
                  <a 
                    href={englishData.download_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline text-sm truncate"
                  >
                    {englishData.download_url.split('/').pop()}
                  </a>
                </div>
              ) : (
                <span className="text-gray-500 italic">No PDF uploaded</span>
              )}
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
            <Label className="text-gray-300 text-sm">Title *</Label>
            <Input
              value={targetTitle}
              onChange={(e) => setTargetTitle(e.target.value)}
              placeholder="Translated title..."
              className="bg-[#1a1a1a] border-gray-600 text-white"
            />
          </div>
          
          <div>
            <Label className="text-gray-300 text-sm">Teaser *</Label>
            <Textarea
              value={targetTeaser}
              onChange={(e) => setTargetTeaser(e.target.value)}
              placeholder="Translated teaser..."
              className="bg-[#1a1a1a] border-gray-600 text-white min-h-[80px]"
            />
          </div>
          
          <div>
            <Label className="text-gray-300 text-sm">Description</Label>
            <div className="p-3 bg-[#1a1a1a] border border-gray-600 rounded-md text-gray-300 min-h-[100px] max-h-[200px] overflow-y-auto">
              {targetSections.length > 0 ? (
                <div className="space-y-3">
                  {targetSections.map((section, idx) => (
                    <div key={section.id || idx}>
                      {section.heading && (
                        <div className="font-semibold text-gray-200">{section.heading}</div>
                      )}
                      {section.content && (
                        <div className="text-gray-400 text-sm whitespace-pre-wrap">{section.content}</div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <span className="text-gray-500 italic">Use auto-translate to populate content</span>
              )}
            </div>
          </div>

          {/* Target Language PDF Upload */}
          <div>
            <Label className="text-gray-300 text-sm">
              PDF File ({LANGUAGES.find(l => l.code === selectedLanguage)?.name} Version)
            </Label>
            <div className="p-3 bg-[#1a1a1a] border border-gray-600 rounded-md space-y-2">
              {targetDownloadUrl && targetDownloadUrl !== englishData.download_url ? (
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <FileText className="w-4 h-4 text-red-400 flex-shrink-0" />
                    <a 
                      href={targetDownloadUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:underline text-sm truncate"
                    >
                      {targetDownloadUrl.split('/').pop()}
                    </a>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleRemovePdf}
                    className="text-red-400 hover:text-red-300 hover:bg-red-900/20 flex-shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="text-gray-500 text-sm italic">
                  {englishData.download_url ? "Using English PDF (default)" : "No PDF available"}
                </div>
              )}
              
              <div className="pt-2 border-t border-gray-700 space-y-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={handlePdfUpload}
                  className="hidden"
                  id="pdf-upload"
                />
                <div className="flex gap-2">
                  {/* Yellow - Upload from Computer */}
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="flex-1 bg-[#f9dc24] hover:bg-[#f9dc24]/90 text-black"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {isUploading ? "Uploading..." : "Upload PDF"}
                  </Button>
                  
                  {/* Blue - Select from Media Management */}
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => setShowMediaSelector(true)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <FolderOpen className="w-4 h-4 mr-2" />
                    Media Management
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Save Button - inside target language column */}
          <Button
            onClick={handleSave}
            disabled={isSaving || !targetTitle || !targetTeaser}
            className="w-full bg-[#f9dc24] hover:bg-[#f9dc24]/90 text-black mt-2"
          >
            {isSaving ? "Saving..." : `Save ${LANGUAGES.find(l => l.code === selectedLanguage)?.name} Version`}
          </Button>
        </div>
      </div>

      {/* Media Selector Dialog */}
      <DataHubDialog
        isOpen={showMediaSelector}
        onClose={() => setShowMediaSelector(false)}
        selectionMode={true}
        onSelect={handleMediaSelect}
      />
    </div>
  );
};

export default DownloadTranslationEditor;
