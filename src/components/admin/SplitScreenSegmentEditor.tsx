import { useState, useEffect, memo } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Languages, Lock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GeminiIcon } from "@/components/GeminiIcon";
import { useEditorLanguageAccess } from "@/hooks/useEditorLanguageAccess";

type LanguageCode = 'en' | 'de' | 'ja' | 'ko' | 'zh';

interface SplitScreenSegmentEditorProps {
  children: (language: LanguageCode, readOnly?: boolean) => React.ReactNode;
  segmentTitle: string;
  segmentType: string;
  pageSlug?: string;
}

const LANGUAGES = [
  { code: 'en' as LanguageCode, name: 'English', flag: '🇺🇸' },
  { code: 'de' as LanguageCode, name: 'German', flag: '🇩🇪' },
  { code: 'ja' as LanguageCode, name: 'Japanese', flag: '🇯🇵' },
  { code: 'ko' as LanguageCode, name: 'Korean', flag: '🇰🇷' },
  { code: 'zh' as LanguageCode, name: 'Chinese', flag: '🇨🇳' },
];

const SplitScreenSegmentEditorComponent = ({ 
  children, 
  segmentTitle,
  segmentType,
  pageSlug
}: SplitScreenSegmentEditorProps) => {
  const { allowedLanguages, isLoading, canEditEnglish, isLanguageRestricted } = useEditorLanguageAccess(pageSlug);
  
  const [targetLanguage, setTargetLanguage] = useState<LanguageCode>('de');
  const [isSplitScreenEnabled, setIsSplitScreenEnabled] = useState(() => {
    const saved = localStorage.getItem('cms-split-screen-mode');
    return saved !== null ? saved === 'true' : true;
  });

  // For language-restricted editors who cannot edit English: force split-screen and set their allowed language
  useEffect(() => {
    if (isLanguageRestricted && !canEditEnglish && allowedLanguages && allowedLanguages.length > 0) {
      setIsSplitScreenEnabled(true);
      // Set the first allowed language as target (exclude EN since they can't edit it)
      const nonEnLanguages = allowedLanguages.filter(l => l !== 'en') as LanguageCode[];
      if (nonEnLanguages.length > 0 && !nonEnLanguages.includes(targetLanguage)) {
        setTargetLanguage(nonEnLanguages[0]);
      }
    }
  }, [isLanguageRestricted, canEditEnglish, allowedLanguages, targetLanguage]);

  const handleSplitScreenToggle = (checked: boolean) => {
    // Language-restricted editors who cannot edit English cannot disable split-screen
    if (isLanguageRestricted && !canEditEnglish) return;
    setIsSplitScreenEnabled(checked);
    localStorage.setItem('cms-split-screen-mode', String(checked));
  };

  // Filter available languages based on editor access
  const availableTargetLanguages = LANGUAGES.filter(lang => {
    if (!isLanguageRestricted) return true; // Full access - show all languages
    return allowedLanguages?.includes(lang.code); // Only show allowed languages
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Language selector area - no restriction notice needed */}

      {/* Language Selector */}
      <Card className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 border-blue-700">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Languages className="h-5 w-5 text-blue-300" />
              <div>
                <CardTitle className="text-white text-lg">Multi-Language Editor</CardTitle>
                <CardDescription className="text-blue-200 text-sm mt-1">
                  Compare and edit {segmentTitle} in multiple languages side-by-side
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch 
                  id="split-screen-toggle"
                  checked={isSplitScreenEnabled}
                  onCheckedChange={handleSplitScreenToggle}
                  disabled={isLanguageRestricted}
                  className="data-[state=checked]:bg-blue-600"
                />
                <Label 
                  htmlFor="split-screen-toggle" 
                  className={`text-white text-sm ${isLanguageRestricted ? 'opacity-50' : 'cursor-pointer'}`}
                >
                  Split-Screen Mode
                  {isLanguageRestricted && <Lock className="h-3 w-3 inline ml-1" />}
                </Label>
              </div>
              {isSplitScreenEnabled && (
                <Badge variant="outline" className="bg-blue-950/50 text-blue-200 border-blue-600">
                  Active
                </Badge>
              )}
            </div>
          </div>
          
          {/* Target Language Selector - only visible when split-screen is enabled */}
          {isSplitScreenEnabled && (
            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-blue-700/50">
              <label className="text-white font-medium text-sm">Target Language:</label>
              <Select 
                value={targetLanguage} 
                onValueChange={(value) => setTargetLanguage(value as LanguageCode)}
                disabled={availableTargetLanguages.length <= 1}
              >
                <SelectTrigger className="w-[220px] bg-blue-950/70 border-blue-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-blue-700 z-50">
                  {availableTargetLanguages.map(lang => (
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
                onClick={() => {
                  const eventName = `${segmentType}-translate`;
                  window.dispatchEvent(new CustomEvent(eventName));
                }}
                className="ml-auto min-w-[200px] bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
              >
                <GeminiIcon className="h-4 w-4 mr-2" />
                Translate Automatically
              </Button>
            </div>
          )}
        </CardHeader>
      </Card>

      {/* Split Screen Layout or Single View */}
      <div className={isSplitScreenEnabled ? "grid grid-cols-2 gap-6" : ""}>
        {isSplitScreenEnabled ? (
          <>
            {/* Left Panel - English (Reference or Editable) */}
            <div className="space-y-3">
              <div className={`flex items-center gap-2 px-4 py-3 rounded-lg ${
                !canEditEnglish 
                  ? 'bg-gradient-to-r from-gray-800/50 to-gray-700/50 border-2 border-gray-600/50'
                  : 'bg-gradient-to-r from-green-900/30 to-green-800/30 border-2 border-green-600/50'
              }`}>
                <span className="text-2xl">🇺🇸</span>
                <div className="flex-1">
                  <p className="text-white font-semibold text-sm flex items-center gap-2">
                    English {canEditEnglish ? '' : '(Reference)'}
                    {!canEditEnglish && (
                      <Badge variant="outline" className="bg-gray-700/50 text-gray-300 border-gray-500 text-xs">
                        <Lock className="h-3 w-3 mr-1" />
                        Schreibgeschützt
                      </Badge>
                    )}
                  </p>
                  <p className={`text-xs ${!canEditEnglish ? 'text-gray-400' : 'text-green-200'}`}>
                    {!canEditEnglish 
                      ? 'Nur Ansicht - Sie können diese Version nicht bearbeiten'
                      : 'Master language - editable'
                    }
                  </p>
                </div>
              </div>
              <div className={`rounded-lg ${!canEditEnglish ? 'pointer-events-none opacity-75' : ''}`}>
                {children('en', !canEditEnglish)}
              </div>
            </div>

            {/* Right Panel - Target Language */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-900/30 to-purple-800/30 border-2 border-purple-600/50 rounded-lg">
                <span className="text-2xl">
                  {LANGUAGES.find(l => l.code === targetLanguage)?.flag}
                </span>
                <div>
                  <p className="text-white font-semibold text-sm">
                    {LANGUAGES.find(l => l.code === targetLanguage)?.name}
                  </p>
                  <p className="text-purple-200 text-xs">Edit translation for this language</p>
                </div>
              </div>
              <div className="rounded-lg">
                {children(targetLanguage, false)}
              </div>
            </div>
          </>
        ) : (
          /* Single View - English Only (only available for full-access editors) */
          <div className="space-y-3">
            <div className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-green-900/30 to-green-800/30 border-2 border-green-600/50 rounded-lg">
              <span className="text-2xl">🇺🇸</span>
              <div>
                <p className="text-white font-semibold text-sm">English (Single View)</p>
                <p className="text-green-200 text-xs">Editing in single-language mode</p>
              </div>
            </div>
            <div className="rounded-lg">
              {children('en', false)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const SplitScreenSegmentEditor = memo(SplitScreenSegmentEditorComponent);
