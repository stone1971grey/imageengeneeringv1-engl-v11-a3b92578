import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, Trash2, FolderOpen, Sparkles, Languages } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { DataHubDialog } from '@/components/admin/DataHubDialog';

interface FlyoutContentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pageInfo: {
    pageTitle: string;
    pageSlug: string;
    ctaGroup?: string | null;
    ctaIcon?: string | null;
  } | null;
  hasDesignButtons: boolean;
  flyoutImageUrl: string | null;
  setFlyoutImageUrl: (url: string | null) => void;
  flyoutDescriptionTranslations: Record<string, string>;
  setFlyoutDescriptionTranslations: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  isSaving: boolean;
  onSave: () => void;
  onClear: () => void;
  onImageSelect: (url: string) => void;
}

export function FlyoutContentDialog({
  open,
  onOpenChange,
  pageInfo,
  hasDesignButtons,
  flyoutImageUrl,
  setFlyoutImageUrl,
  flyoutDescriptionTranslations,
  setFlyoutDescriptionTranslations,
  isSaving,
  onSave,
  onClear,
  onImageSelect,
}: FlyoutContentDialogProps) {
  const [flyoutDescriptionLanguage, setFlyoutDescriptionLanguage] = useState('en');
  const [isTranslatingFlyout, setIsTranslatingFlyout] = useState(false);
  const [isFlyoutMediaDialogOpen, setIsFlyoutMediaDialogOpen] = useState(false);

  const handleTranslateSingle = async () => {
    const englishText = flyoutDescriptionTranslations['en'];
    if (!englishText) {
      toast.error('Please enter English description first');
      return;
    }
    setIsTranslatingFlyout(true);
    try {
      const { data, error } = await supabase.functions.invoke('translate-content', {
        body: {
          texts: { description: englishText },
          targetLanguage: flyoutDescriptionLanguage
        }
      });
      if (error) throw error;
      if (data?.translatedTexts?.description) {
        setFlyoutDescriptionTranslations(prev => ({
          ...prev,
          [flyoutDescriptionLanguage]: data.translatedTexts.description
        }));
        toast.success('Translation complete');
      }
    } catch (err) {
      console.error('Translation error:', err);
      toast.error('Translation failed');
    } finally {
      setIsTranslatingFlyout(false);
    }
  };

  const handleTranslateAll = async () => {
    const englishText = flyoutDescriptionTranslations['en'];
    if (!englishText) {
      toast.error('Please enter English description first');
      return;
    }
    setIsTranslatingFlyout(true);
    const targetLangs = ['de', 'ja', 'ko', 'zh'];
    try {
      const results = await Promise.all(
        targetLangs.map(async (lang) => {
          const { data, error } = await supabase.functions.invoke('translate-content', {
            body: {
              texts: { description: englishText },
              targetLanguage: lang
            }
          });
          if (error) throw error;
          return { lang, text: data?.translatedTexts?.description || '' };
        })
      );
      const newTranslations = { ...flyoutDescriptionTranslations };
      results.forEach(({ lang, text }) => {
        if (text) newTranslations[lang] = text;
      });
      setFlyoutDescriptionTranslations(newTranslations);
      toast.success('All translations complete');
    } catch (err) {
      console.error('Translation error:', err);
      toast.error('Some translations failed');
    } finally {
      setIsTranslatingFlyout(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Flyout teaser for this navigation item</DialogTitle>
          <DialogDescription>
            Configure the image and description that appear in the lower flyout area for this second-level navigation item.
          </DialogDescription>
        </DialogHeader>

        {!hasDesignButtons && (
          <p className="text-xs text-red-600 mb-3">
            Flyout content is only available for navigation pages with design buttons enabled.
          </p>
        )}

        <div className="space-y-4 mt-2">
          <div>
            <p className="text-xs text-gray-600 mb-1 flex items-center gap-2">
              <span>
                Current page: <span className="font-semibold">{pageInfo?.pageTitle}</span> ({pageInfo?.pageSlug})
              </span>
              {pageInfo?.ctaGroup && pageInfo.ctaGroup !== 'none' && (
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-semibold ${
                    pageInfo.ctaGroup === 'your-solution'
                      ? 'bg-[#f9dc24] text-black border-[#f9dc24]'
                      : 'bg-black text-white border-gray-600'
                  }`}
                >
                  {pageInfo.ctaIcon === 'microscope' ? (
                    <span className="inline-flex items-center">🔬</span>
                  ) : (
                    <span className="inline-flex items-center">🔍</span>
                  )}
                  <span>
                    {(() => {
                      const labelMap: Record<string, string> = {
                        'your-solution': 'Navigation CTA: Your Solution',
                        'products': 'Navigation CTA: Products',
                        'test-lab': 'Navigation CTA: Test Lab',
                        'training-events': 'Navigation CTA: Training & Events',
                        'info-hub': 'Navigation CTA: Info Hub',
                      };
                      return labelMap[pageInfo.ctaGroup] || `Navigation CTA: ${pageInfo.ctaGroup}`;
                    })()}
                  </span>
                </span>
              )}
            </p>
            <p className="text-xs text-gray-500">
              This teaser is used in the main navigation flyout below the list of items.
            </p>
          </div>

          {/* Image selection via Media Management */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Flyout image</label>

            {flyoutImageUrl ? (
              <div className="relative w-full h-40 rounded-lg overflow-hidden border border-border bg-black mb-2">
                <img
                  src={flyoutImageUrl}
                  alt={flyoutDescriptionTranslations['en'] || 'Flyout teaser image'}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => setFlyoutImageUrl(null)}
                  className="absolute top-2 right-2 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded transition-colors z-10 text-xs"
                  title="Remove flyout image"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <p className="text-xs text-gray-500 mb-1">No image selected yet.</p>
            )}

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1 flex items-center justify-center gap-2"
                onClick={() => setIsFlyoutMediaDialogOpen(true)}
                disabled={!hasDesignButtons}
              >
                <FolderOpen className="h-4 w-4" />
                <span>Select from Media Management</span>
              </Button>
            </div>

            {isFlyoutMediaDialogOpen && (
              <DataHubDialog
                isOpen={isFlyoutMediaDialogOpen}
                onClose={() => setIsFlyoutMediaDialogOpen(false)}
                selectionMode={true}
                onSelect={(url) => {
                  onImageSelect(url);
                  setIsFlyoutMediaDialogOpen(false);
                }}
              />
            )}

            <p className="text-[11px] text-gray-500 mt-1">
              When you select an image, the system will try to use its alt text as an initial description.
            </p>
          </div>

          {/* Description text with language selector */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Flyout description</label>
              <div className="flex items-center gap-2">
                <Select value={flyoutDescriptionLanguage} onValueChange={setFlyoutDescriptionLanguage}>
                  <SelectTrigger className="w-[120px] h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">🇺🇸 English</SelectItem>
                    <SelectItem value="de">🇩🇪 Deutsch</SelectItem>
                    <SelectItem value="ja">🇯🇵 日本語</SelectItem>
                    <SelectItem value="ko">🇰🇷 한국어</SelectItem>
                    <SelectItem value="zh">🇨🇳 中文</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Textarea
              value={flyoutDescriptionTranslations[flyoutDescriptionLanguage] || ''}
              onChange={(e) => setFlyoutDescriptionTranslations(prev => ({
                ...prev,
                [flyoutDescriptionLanguage]: e.target.value
              }))}
              rows={3}
              placeholder={flyoutDescriptionLanguage === 'en' 
                ? "Short description that appears under the title in the flyout..." 
                : `Translation for ${flyoutDescriptionLanguage.toUpperCase()}...`
              }
            />
            
            {/* Auto-translate buttons */}
            <div className="flex gap-2">
              {flyoutDescriptionLanguage !== 'en' && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="text-xs border-purple-500 text-purple-600 hover:bg-purple-50"
                  disabled={isTranslatingFlyout || !flyoutDescriptionTranslations['en']}
                  onClick={handleTranslateSingle}
                >
                  <Sparkles className="h-3 w-3 mr-1" />
                  {isTranslatingFlyout ? 'Translating...' : 'Auto-Translate'}
                </Button>
              )}
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="text-xs border-purple-500 text-purple-600 hover:bg-purple-50"
                disabled={isTranslatingFlyout || !flyoutDescriptionTranslations['en']}
                onClick={handleTranslateAll}
              >
                <Languages className="h-3 w-3 mr-1" />
                {isTranslatingFlyout ? 'Translating...' : 'Translate All'}
              </Button>
            </div>
            
            {isTranslatingFlyout && (
              <div className="h-1 bg-gradient-to-r from-purple-500 via-blue-500 to-purple-500 rounded animate-pulse" />
            )}
            
            <p className="text-[11px] text-gray-500">
              Enter English first, then translate to other languages.
            </p>
          </div>

          <div className="flex justify-between items-center pt-2 border-t mt-2">
            <div className="text-xs text-gray-500">
              {flyoutImageUrl ? 'Flyout image selected' : 'No flyout image selected yet'}
            </div>
            <div className="flex gap-2">
              {flyoutImageUrl || Object.keys(flyoutDescriptionTranslations).some(k => flyoutDescriptionTranslations[k]) ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onClear}
                  disabled={isSaving}
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Clear
                </Button>
              ) : null}
              <Button
                type="button"
                size="sm"
                onClick={onSave}
                disabled={isSaving || !hasDesignButtons}
              >
                {isSaving ? (
                  'Saving...'
                ) : (
                  <>
                    <Save className="h-3 w-3 mr-1" />
                    Save
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
