/**
 * Template Preset Selector Component
 * 
 * Interaktive Auswahl für Projekt-Templates mit Vorschau und Download.
 * 
 * @version 1.5.0
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Copy, Download, Newspaper, Package, Building2, Zap, ChevronRight, Eye } from "lucide-react";
import { toast } from "sonner";
import { PRESET_INFO, PresetType } from "@/config/presets";
import { generateNewsPortalConfig } from "@/config/presets/newsPortalPreset";
import { generateProductCatalogConfig } from "@/config/presets/productCatalogPreset";
import { generateCorporateWebsiteConfig } from "@/config/presets/corporateWebsitePreset";
import { generateMinimalStarterConfig } from "@/config/presets/minimalStarterPreset";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

const ICON_MAP = {
  Newspaper,
  Package,
  Building2,
  Zap,
};

const getPresetConfig = (presetId: PresetType): string => {
  switch (presetId) {
    case 'news-portal':
      return generateNewsPortalConfig();
    case 'product-catalog':
      return generateProductCatalogConfig();
    case 'corporate-website':
      return generateCorporateWebsiteConfig();
    case 'minimal-starter':
      return generateMinimalStarterConfig();
    default:
      return '';
  }
};

interface PresetSelectorProps {
  onSelect?: (presetId: PresetType) => void;
}

export const PresetSelector = ({ onSelect }: PresetSelectorProps) => {
  const [selectedPreset, setSelectedPreset] = useState<PresetType | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewContent, setPreviewContent] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleSelect = (presetId: PresetType) => {
    setSelectedPreset(presetId);
    onSelect?.(presetId);
  };

  const handleCopy = async (presetId: PresetType) => {
    const config = getPresetConfig(presetId);
    await navigator.clipboard.writeText(config);
    setCopiedId(presetId);
    toast.success("siteConfig.ts kopiert!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownload = (presetId: PresetType) => {
    const config = getPresetConfig(presetId);
    const preset = PRESET_INFO.find(p => p.id === presetId);
    const blob = new Blob([config], { type: 'text/typescript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `siteConfig-${preset?.id || 'preset'}.ts`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("siteConfig.ts heruntergeladen!");
  };

  const handlePreview = (presetId: PresetType) => {
    const config = getPresetConfig(presetId);
    setPreviewContent(config);
    setPreviewOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Projekt-Template wählen
        </h2>
        <p className="text-muted-foreground">
          Wähle ein passendes Template für dein neues Spade CMS Projekt.
          Die siteConfig wird automatisch mit den richtigen Feature-Flags generiert.
        </p>
      </div>

      {/* Preset Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {PRESET_INFO.map((preset) => {
          const Icon = ICON_MAP[preset.icon as keyof typeof ICON_MAP] || Zap;
          const isSelected = selectedPreset === preset.id;

          return (
            <Card
              key={preset.id}
              className={`relative cursor-pointer transition-all duration-200 hover:border-primary/50 ${
                isSelected 
                  ? 'border-primary ring-2 ring-primary/20 bg-primary/5' 
                  : 'border-border bg-card'
              }`}
              onClick={() => handleSelect(preset.id)}
            >
              {/* Selected Indicator */}
              {isSelected && (
                <div className="absolute top-3 right-3">
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                    <Check className="w-4 h-4 text-primary-foreground" />
                  </div>
                </div>
              )}

              <CardHeader className="pb-3">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg ${isSelected ? 'bg-primary/20' : 'bg-muted'}`}>
                    <Icon className={`w-6 h-6 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{preset.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {preset.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                {/* Features */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {preset.features.map((feature) => (
                    <Badge key={feature} variant="secondary" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                </div>

                {/* Active Modules */}
                <div className="text-xs text-muted-foreground">
                  <span className="font-medium">Module: </span>
                  {preset.modules.join(', ')}
                </div>

                {/* Actions (only show when selected) */}
                {isSelected && (
                  <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePreview(preset.id);
                      }}
                    >
                      <Eye className="w-3.5 h-3.5 mr-1.5" />
                      Vorschau
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopy(preset.id);
                      }}
                    >
                      {copiedId === preset.id ? (
                        <Check className="w-3.5 h-3.5 mr-1.5" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 mr-1.5" />
                      )}
                      {copiedId === preset.id ? 'Kopiert' : 'Kopieren'}
                    </Button>
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(preset.id);
                      }}
                    >
                      <Download className="w-3.5 h-3.5 mr-1.5" />
                      Download
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Start Hint */}
      {selectedPreset && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="flex items-center gap-4 py-4">
            <ChevronRight className="w-5 h-5 text-primary" />
            <div className="flex-1">
              <p className="font-medium text-foreground">
                Template "{PRESET_INFO.find(p => p.id === selectedPreset)?.name}" ausgewählt
              </p>
              <p className="text-sm text-muted-foreground">
                Kopiere die generierte siteConfig.ts in dein neues Projekt nach <code className="bg-muted px-1.5 py-0.5 rounded text-xs">src/config/siteConfig.ts</code>
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>siteConfig.ts Vorschau</DialogTitle>
            <DialogDescription>
              Die generierte Konfigurationsdatei für dein Projekt
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[60vh]">
            <pre className="text-xs bg-muted p-4 rounded-lg overflow-x-auto">
              <code>{previewContent}</code>
            </pre>
          </ScrollArea>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setPreviewOpen(false)}>
              Schließen
            </Button>
            <Button onClick={() => {
              navigator.clipboard.writeText(previewContent);
              toast.success("Kopiert!");
            }}>
              <Copy className="w-4 h-4 mr-2" />
              Kopieren
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PresetSelector;
