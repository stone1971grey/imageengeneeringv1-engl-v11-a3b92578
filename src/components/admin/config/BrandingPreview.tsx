/**
 * Branding Preview Component
 * 
 * Zeigt eine Vorschau der konfigurierten Branding-Einstellungen.
 * 
 * @version 1.6.0
 */

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Palette, Type, Image, Copy } from "lucide-react";
import { siteConfig } from "@/config/siteConfig";
import { toast } from "sonner";

export const BrandingPreview = () => {
  const { branding, tenant } = siteConfig;

  const copyColor = (name: string, value: string) => {
    navigator.clipboard.writeText(value);
    toast.success(`${name} kopiert: ${value}`);
  };

  const ColorSwatch = ({ name, value, label }: { name: string; value: string; label: string }) => (
    <button
      onClick={() => copyColor(label, value)}
      className="group flex items-center gap-3 p-3 bg-muted/20 rounded-lg border border-border hover:border-primary/50 transition-colors"
    >
      <div 
        className="w-10 h-10 rounded-lg border border-white/10 shadow-inner"
        style={{ backgroundColor: `hsl(${value})` }}
      />
      <div className="text-left flex-1">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground font-mono">{value}</p>
      </div>
      <Copy className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
    </button>
  );

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5 text-primary" />
          Branding Vorschau
        </CardTitle>
        <CardDescription>
          Aktuelle Branding-Einstellungen aus siteConfig.ts
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Logo Preview */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-2">
            <Image className="h-4 w-4" />
            Logos
          </h4>
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-white rounded-lg">
              <img 
                src={branding.logos.primary} 
                alt="Primary Logo"
                className="h-12 w-auto mx-auto object-contain"
                onError={(e) => {
                  e.currentTarget.src = '/placeholder.svg';
                }}
              />
              <p className="text-xs text-center mt-2 text-gray-500">Primary</p>
            </div>
            <div className="p-4 bg-zinc-900 rounded-lg">
              <img 
                src={branding.logos.dark} 
                alt="Dark Logo"
                className="h-12 w-auto mx-auto object-contain"
                onError={(e) => {
                  e.currentTarget.src = '/placeholder.svg';
                }}
              />
              <p className="text-xs text-center mt-2 text-zinc-500">Dark</p>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg flex flex-col items-center justify-center">
              <img 
                src={branding.logos.favicon} 
                alt="Favicon"
                className="h-8 w-8 object-contain"
                onError={(e) => {
                  e.currentTarget.src = '/placeholder.svg';
                }}
              />
              <p className="text-xs text-center mt-2 text-muted-foreground">Favicon</p>
            </div>
          </div>
        </div>

        {/* Colors */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Farben (HSL)
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <ColorSwatch name="primary" value={branding.colors.primary} label="Primary" />
            <ColorSwatch name="primaryGlow" value={branding.colors.primaryGlow} label="Primary Glow" />
            <ColorSwatch name="accent" value={branding.colors.accent} label="Accent" />
            <ColorSwatch name="accentForeground" value={branding.colors.accentForeground} label="Accent Foreground" />
          </div>
        </div>

        {/* Color Demo */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
            Farb-Demo
          </h4>
          <div className="p-6 rounded-lg border border-border space-y-4" style={{ 
            background: `linear-gradient(135deg, hsl(${branding.colors.primary}) 0%, hsl(${branding.colors.primaryGlow}) 100%)`
          }}>
            <h3 className="text-xl font-bold text-white">{tenant.name}</h3>
            <p className="text-white/80">{tenant.tagline}</p>
            <Button 
              className="text-black font-medium"
              style={{ 
                backgroundColor: `hsl(${branding.colors.accent})`,
                color: `hsl(${branding.colors.accentForeground})`
              }}
            >
              Beispiel Button
            </Button>
          </div>
        </div>

        {/* Fonts */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-2">
            <Type className="h-4 w-4" />
            Schriftarten
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-muted/20 rounded-lg border border-border">
              <p className="text-xs text-muted-foreground mb-2">Überschriften</p>
              <p className="text-lg font-bold" style={{ fontFamily: branding.fonts.heading }}>
                {branding.fonts.heading}
              </p>
              <p className="text-xl mt-2" style={{ fontFamily: branding.fonts.heading }}>
                Aa Bb Cc 123
              </p>
            </div>
            <div className="p-4 bg-muted/20 rounded-lg border border-border">
              <p className="text-xs text-muted-foreground mb-2">Fließtext</p>
              <p className="text-lg" style={{ fontFamily: branding.fonts.body }}>
                {branding.fonts.body}
              </p>
              <p className="mt-2" style={{ fontFamily: branding.fonts.body }}>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              </p>
            </div>
          </div>
        </div>

        {/* Tenant Info */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
            Tenant-Information
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-muted/20 rounded-lg">
              <p className="text-xs text-muted-foreground">ID</p>
              <p className="font-mono text-sm">{tenant.id}</p>
            </div>
            <div className="p-3 bg-muted/20 rounded-lg">
              <p className="text-xs text-muted-foreground">Name</p>
              <p className="text-sm font-medium">{tenant.name}</p>
            </div>
            <div className="p-3 bg-muted/20 rounded-lg col-span-2">
              <p className="text-xs text-muted-foreground">Legal Name</p>
              <p className="text-sm">{tenant.legalName}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BrandingPreview;
