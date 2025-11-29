import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GeminiIcon } from "@/components/GeminiIcon";

interface SplitScreenSegmentEditorProps {
  children: (language: string) => React.ReactNode;
  segmentTitle: string;
  segmentType: string;
}

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
];

export const SplitScreenSegmentEditor = ({ 
  children, 
  segmentTitle,
  segmentType 
}: SplitScreenSegmentEditorProps) => {
  const [targetLanguage, setTargetLanguage] = useState('de');
  const [isSplitScreenEnabled, setIsSplitScreenEnabled] = useState(() => {
    const saved = localStorage.getItem('cms-split-screen-mode');
    return saved !== null ? saved === 'true' : true;
  });

  const handleSplitScreenToggle = (checked: boolean) => {
    setIsSplitScreenEnabled(checked);
    localStorage.setItem('cms-split-screen-mode', String(checked));
  };

  return (
    <div className="space-y-4">
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
          
          {/* Target Language Selector - only visible when split-screen is enabled */}
          {isSplitScreenEnabled && (
            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-blue-700/50">
              <label className="text-white font-medium text-sm">Target Language:</label>
              <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                <SelectTrigger className="w-[220px] bg-blue-950/70 border-blue-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-blue-700 z-50">
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

              {segmentType === 'product-hero-gallery' && (
                <Button
                  onClick={() => window.dispatchEvent(new CustomEvent('phg-translate'))}
                  className="ml-auto bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                >
                  <GeminiIcon className="h-4 w-4 mr-2" />
                  Translate Automatically
                </Button>
              )}
            </div>
          )}
        </CardHeader>
      </Card>

      {/* Split Screen Layout or Single View */}
      <div className={isSplitScreenEnabled ? "grid grid-cols-2 gap-6" : ""}>
        {isSplitScreenEnabled ? (
          <>
            {/* Left Panel - English (Reference) */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-green-900/30 to-green-800/30 border-2 border-green-600/50 rounded-lg">
                <span className="text-2xl">🇺🇸</span>
                <div>
                  <p className="text-white font-semibold text-sm">English (Reference)</p>
                  <p className="text-green-200 text-xs">Master language - all translations reference this</p>
                </div>
              </div>
              <div className="border-2 border-green-600/30 rounded-lg p-1 bg-green-950/20">
                {children('en')}
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
              <div className="border-2 border-purple-600/30 rounded-lg p-1 bg-purple-950/20">
                {children(targetLanguage)}
              </div>
            </div>
          </>
        ) : (
          /* Single View - English Only */
          <div className="space-y-3">
            <div className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-green-900/30 to-green-800/30 border-2 border-green-600/50 rounded-lg">
              <span className="text-2xl">🇺🇸</span>
              <div>
                <p className="text-white font-semibold text-sm">English (Single View)</p>
                <p className="text-green-200 text-xs">Editing in single-language mode</p>
              </div>
            </div>
            <div className="border-2 border-green-600/30 rounded-lg p-1 bg-green-950/20">
              {children('en')}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
