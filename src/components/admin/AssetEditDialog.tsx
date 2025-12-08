import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { X, Save, FileText, Calendar, Weight, Image as ImageIcon, Database, Languages, Sparkles } from "lucide-react";
import { GeminiIcon } from "@/components/GeminiIcon";

interface AssetEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  asset: {
    name: string;
    url: string;
    created_at: string;
    metadata: any;
    bucket_id: string;
    segmentIds?: string[];
    filePath: string;
    id: string;
  } | null;
  onSave: () => void;
}

const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'ja', label: '日本語', flag: '🇯🇵' },
  { code: 'ko', label: '한국어', flag: '🇰🇷' },
  { code: 'zh', label: '中文', flag: '🇨🇳' },
];

export function AssetEditDialog({ isOpen, onClose, asset, onSave }: AssetEditDialogProps) {
  const [altTextTranslations, setAltTextTranslations] = useState<Record<string, string>>({});
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);

  // Load alt text translations when dialog opens
  const loadAltTextTranslations = async () => {
    if (!asset?.filePath) return;

    const bucketId = asset.bucket_id || "page-images";
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('file_segment_mappings')
        .select('alt_text, alt_text_translations')
        .eq('file_path', asset.filePath)
        .eq('bucket_id', bucketId)
        .maybeSingle();

      if (error) throw error;

      if (data?.alt_text_translations && typeof data.alt_text_translations === 'object') {
        setAltTextTranslations(data.alt_text_translations as Record<string, string>);
      } else if (data?.alt_text) {
        // Legacy: migrate single alt_text to translations object
        setAltTextTranslations({ en: data.alt_text });
      } else {
        setAltTextTranslations({});
      }
    } catch (error: any) {
      console.error('Error loading alt text translations:', error);
      setAltTextTranslations({});
    } finally {
      setIsLoading(false);
    }
  };

  // Load alt text when asset changes
  useEffect(() => {
    if (isOpen && asset) {
      loadAltTextTranslations();
      setSelectedLanguage('en');
    }
  }, [isOpen, asset]);

  // Get current alt text for selected language
  const currentAltText = altTextTranslations[selectedLanguage] || '';

  // Update alt text for current language
  const handleAltTextChange = (value: string) => {
    setAltTextTranslations(prev => ({
      ...prev,
      [selectedLanguage]: value
    }));
  };

  // Auto-translate function
  const handleAutoTranslate = async () => {
    const englishText = altTextTranslations['en'];
    if (!englishText) {
      toast.error('Please enter English alt text first');
      return;
    }

    if (selectedLanguage === 'en') {
      toast.info('Already viewing English version');
      return;
    }

    setIsTranslating(true);
    try {
      const { data, error } = await supabase.functions.invoke('translate-content', {
        body: {
          texts: { altText: englishText },
          targetLanguage: selectedLanguage
        }
      });

      if (error) throw error;

      if (data?.translatedTexts?.altText) {
        setAltTextTranslations(prev => ({
          ...prev,
          [selectedLanguage]: data.translatedTexts.altText
        }));
        toast.success(`Translated to ${SUPPORTED_LANGUAGES.find(l => l.code === selectedLanguage)?.label}`);
      }
    } catch (error: any) {
      console.error('Translation error:', error);
      toast.error('Translation failed. Please try again.');
    } finally {
      setIsTranslating(false);
    }
  };

  // Translate all languages at once
  const handleTranslateAll = async () => {
    const englishText = altTextTranslations['en'];
    if (!englishText) {
      toast.error('Please enter English alt text first');
      return;
    }

    setIsTranslating(true);
    const targetLanguages = SUPPORTED_LANGUAGES.filter(l => l.code !== 'en').map(l => l.code);
    
    try {
      const translationPromises = targetLanguages.map(async (lang) => {
        const { data, error } = await supabase.functions.invoke('translate-content', {
          body: {
            texts: { altText: englishText },
            targetLanguage: lang
          }
        });
        
        if (error) throw error;
        return { lang, text: data?.translatedTexts?.altText || '' };
      });

      const results = await Promise.all(translationPromises);
      
      const newTranslations = { ...altTextTranslations };
      results.forEach(({ lang, text }) => {
        if (text) {
          newTranslations[lang] = text;
        }
      });
      
      setAltTextTranslations(newTranslations);
      toast.success('All translations completed!');
    } catch (error: any) {
      console.error('Translation error:', error);
      toast.error('Some translations failed. Please try again.');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSave = async () => {
    if (!asset?.filePath) {
      console.error('[AssetEditDialog] No filePath provided', asset);
      toast.error('Cannot save alt text: missing image file path. Please reload the Media Management view and try again.');
      return;
    }

    const bucketId = asset.bucket_id || 'page-images';

    setIsSaving(true);
    try {
      // 1) Check if a mapping already exists for this file
      const { data: existing, error: fetchError } = await supabase
        .from('file_segment_mappings')
        .select('id, segment_ids')
        .eq('file_path', asset.filePath)
        .eq('bucket_id', bucketId)
        .maybeSingle();

      if (fetchError) {
        console.error('[AssetEditDialog] Error loading existing mapping:', fetchError);
      }

      // Preserve existing segment_ids if present
      const segmentIds = existing?.segment_ids?.length
        ? existing.segment_ids
        : (asset.segmentIds || []);

      // 2) Upsert row with translations
      const { error: upsertError } = await supabase
        .from('file_segment_mappings')
        .upsert(
          {
            id: existing?.id,
            file_path: asset.filePath,
            bucket_id: bucketId,
            segment_ids: segmentIds,
            alt_text: altTextTranslations['en'] || '', // Keep legacy field updated
            alt_text_translations: altTextTranslations,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'file_path,bucket_id' }
        );

      if (upsertError) {
        console.error('[AssetEditDialog] Database error on save:', upsertError);
        throw upsertError;
      }
      
      toast.success('✅ Alt text translations saved successfully');

      try {
        onSave();
      } catch (cbError) {
        console.error('[AssetEditDialog] onSave callback failed:', cbError);
      }

    } catch (error: any) {
      console.error('[AssetEditDialog] Save failed:', error);
      toast.error(error?.message || 'Failed to save alt text. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!asset) return null;

  // Extract metadata info
  const fileName = asset.name.split('/').pop() || asset.name;
  const fileExtension = fileName.split('.').pop()?.toUpperCase() || 'Unknown';
  const fileSize = asset.metadata?.size 
    ? (asset.metadata.size / 1024).toFixed(2) + ' KB'
    : 'Unknown';
  const createdDate = new Date(asset.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Check which languages have translations
  const translatedLanguages = SUPPORTED_LANGUAGES.filter(l => altTextTranslations[l.code]?.trim());

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        onClose();
      }
    }}>
      <DialogContent className="max-w-2xl bg-gray-900 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
            <FileText className="h-6 w-6" />
            Edit Asset
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Update multilingual alt text and view asset information
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Asset Preview */}
          <div className="relative w-full h-48 bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
            <img 
              src={asset.url} 
              alt={currentAltText || fileName}
              className="w-full h-full object-contain"
            />
          </div>

          {/* Meta Information */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-800 rounded-lg border border-gray-700">
            <div className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-gray-400" />
              <div>
                <div className="text-xs text-gray-400">Format</div>
                <div className="text-sm font-medium">{fileExtension}</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Weight className="h-4 w-4 text-gray-400" />
              <div>
                <div className="text-xs text-gray-400">Size</div>
                <div className="text-sm font-medium">{fileSize}</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <div>
                <div className="text-xs text-gray-400">Created</div>
                <div className="text-sm font-medium">{createdDate}</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-gray-400" />
              <div>
                <div className="text-xs text-gray-400">Filename</div>
                <div className="text-sm font-medium truncate max-w-[200px]" title={fileName}>
                  {fileName}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 col-span-2">
              <Database className="h-4 w-4 text-blue-400" />
              <div>
                <div className="text-xs text-gray-400">Image ID</div>
                <div className="text-sm font-mono font-medium text-blue-400" title={asset.id}>
                  {asset.id}
                </div>
              </div>
            </div>
          </div>

          {/* Segment Assignments */}
          {asset.segmentIds && asset.segmentIds.length > 0 && (
            <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
              <div className="text-xs text-gray-400 mb-2">Used in Segments:</div>
              <div className="flex flex-wrap gap-2">
                {asset.segmentIds.map(segmentId => (
                  <Badge 
                    key={segmentId}
                    className="bg-[#f9dc24] text-black hover:bg-[#f9dc24]/90"
                  >
                    #{segmentId}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Translation Status */}
          <div className="flex items-center gap-2 flex-wrap">
            <Languages className="h-4 w-4 text-gray-400" />
            <span className="text-xs text-gray-400">Translations:</span>
            {SUPPORTED_LANGUAGES.map(lang => (
              <Badge 
                key={lang.code}
                variant={altTextTranslations[lang.code]?.trim() ? "default" : "outline"}
                className={altTextTranslations[lang.code]?.trim() 
                  ? "bg-green-600 text-white" 
                  : "border-gray-600 text-gray-400"
                }
              >
                {lang.flag} {lang.code.toUpperCase()}
              </Badge>
            ))}
          </div>

          {/* Alt Text Editor with Language Selector */}
          <div className="space-y-3 p-4 bg-gray-800 rounded-lg border border-gray-700">
            <div className="flex items-center justify-between gap-4">
              <Label htmlFor="alt-text" className="text-white flex items-center gap-2">
                <Languages className="h-4 w-4" />
                Alt Text
              </Label>
              
              <div className="flex items-center gap-2">
                <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                  <SelectTrigger className="w-[140px] bg-gray-700 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    {SUPPORTED_LANGUAGES.map(lang => (
                      <SelectItem 
                        key={lang.code} 
                        value={lang.code}
                        className="text-white hover:bg-gray-700"
                      >
                        {lang.flag} {lang.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Input
              id="alt-text"
              value={currentAltText}
              onChange={(e) => handleAltTextChange(e.target.value)}
              placeholder={selectedLanguage === 'en' 
                ? "Describe this image for accessibility..." 
                : `Translation for ${SUPPORTED_LANGUAGES.find(l => l.code === selectedLanguage)?.label}...`
              }
              className="bg-gray-700 border-gray-600 text-white"
              disabled={isLoading || isTranslating}
            />

            {/* Translation Buttons */}
            <div className="flex gap-2">
              {selectedLanguage !== 'en' && (
                <Button
                  onClick={handleAutoTranslate}
                  disabled={isTranslating || !altTextTranslations['en']}
                  size="sm"
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                >
                  <GeminiIcon className="h-4 w-4 mr-2" />
                  {isTranslating ? 'Translating...' : 'Auto-Translate'}
                </Button>
              )}
              
              <Button
                onClick={handleTranslateAll}
                disabled={isTranslating || !altTextTranslations['en']}
                size="sm"
                variant="outline"
                className="border-purple-500 text-purple-400 hover:bg-purple-500/20"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                {isTranslating ? 'Translating...' : 'Translate All Languages'}
              </Button>
            </div>

            {/* Translating indicator */}
            {isTranslating && (
              <div className="h-1 bg-gradient-to-r from-purple-500 via-blue-500 to-purple-500 rounded animate-pulse" />
            )}

            <p className="text-xs text-gray-400">
              Alt text is used for accessibility and SEO. Enter English first, then translate.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={onClose}
              className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
              type="button"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving || isLoading || isTranslating}
              className="bg-[#f9dc24] text-black hover:bg-[#f9dc24]/90"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save All Translations'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
