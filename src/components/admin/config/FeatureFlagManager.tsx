/**
 * Feature Flag Manager Component
 * 
 * Übersicht aller Feature-Module mit Aktivierungsstatus.
 * (Read-only Anzeige - Änderungen erfordern siteConfig.ts Bearbeitung)
 * 
 * @version 1.6.0
 */

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  Package, Newspaper, Calendar, Download, GraduationCap, 
  Search, Bot, TrendingUp, Lock, Unlock, Info 
} from "lucide-react";
import { siteConfig } from "@/config/siteConfig";
import { MODULE_INFO, getModulesByTier } from "@/config/siteConfigSchema";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const ICON_MAP = {
  Package,
  Newspaper,
  Calendar,
  Download,
  GraduationCap,
  Search,
  Bot,
  TrendingUp,
};

const TIER_COLORS = {
  basic: 'bg-green-500/20 text-green-400 border-green-500/30',
  advanced: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  enterprise: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
};

const TIER_LABELS = {
  basic: 'Basis',
  advanced: 'Erweitert',
  enterprise: 'Enterprise',
};

export const FeatureFlagManager = () => {
  const modulesByTier = getModulesByTier();
  const modules = siteConfig.features.modules;

  const renderModuleCard = (module: typeof MODULE_INFO[0]) => {
    const Icon = ICON_MAP[module.icon as keyof typeof ICON_MAP] || Package;
    const isEnabled = modules[module.key];

    return (
      <div
        key={module.key}
        className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
          isEnabled 
            ? 'bg-muted/30 border-primary/20' 
            : 'bg-muted/10 border-border opacity-60'
        }`}
      >
        <div className="flex items-center gap-4">
          <div className={`p-2 rounded-lg ${isEnabled ? 'bg-primary/20' : 'bg-muted'}`}>
            <Icon className={`h-5 w-5 ${isEnabled ? 'text-primary' : 'text-muted-foreground'}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-medium">{module.name}</p>
              {module.dependencies && module.dependencies.length > 0 && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-3.5 w-3.5 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Benötigt: {module.dependencies.join(', ')}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{module.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className={TIER_COLORS[module.tier]}>
            {TIER_LABELS[module.tier]}
          </Badge>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <Switch 
                    checked={isEnabled} 
                    disabled 
                    className="data-[state=checked]:bg-primary"
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Änderungen in siteConfig.ts erforderlich</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    );
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="h-5 w-5 text-primary" />
          Feature-Module
        </CardTitle>
        <CardDescription>
          Übersicht aller verfügbaren Module und deren Aktivierungsstatus
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
            <div className="flex items-center gap-2">
              <Unlock className="h-4 w-4 text-green-500" />
              <span className="text-sm text-muted-foreground">Aktiviert</span>
            </div>
            <p className="text-2xl font-bold text-green-400 mt-1">
              {Object.values(modules).filter(Boolean).length}
            </p>
          </div>
          <div className="p-4 bg-muted/30 rounded-lg border border-border">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Deaktiviert</span>
            </div>
            <p className="text-2xl font-bold mt-1">
              {Object.values(modules).filter(v => !v).length}
            </p>
          </div>
          <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">Gesamt</span>
            </div>
            <p className="text-2xl font-bold text-primary mt-1">
              {Object.keys(modules).length}
            </p>
          </div>
        </div>

        {/* Basic Modules */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-2">
            <Badge variant="outline" className={TIER_COLORS.basic}>Basis</Badge>
            Kern-Module
          </h4>
          <div className="space-y-2">
            {modulesByTier.basic.map(renderModuleCard)}
          </div>
        </div>

        {/* Advanced Modules */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-2">
            <Badge variant="outline" className={TIER_COLORS.advanced}>Erweitert</Badge>
            Erweiterte Module
          </h4>
          <div className="space-y-2">
            {modulesByTier.advanced.map(renderModuleCard)}
          </div>
        </div>

        {/* Enterprise Modules */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-2">
            <Badge variant="outline" className={TIER_COLORS.enterprise}>Enterprise</Badge>
            Enterprise-Module
          </h4>
          <div className="space-y-2">
            {modulesByTier.enterprise.map(renderModuleCard)}
          </div>
        </div>

        {/* Info */}
        <div className="flex items-start gap-3 p-4 bg-muted/20 rounded-lg border border-border">
          <Info className="h-5 w-5 text-muted-foreground mt-0.5" />
          <div className="text-sm text-muted-foreground">
            <p className="font-medium text-foreground">Module aktivieren/deaktivieren</p>
            <p className="mt-1">
              Um Module zu aktivieren oder deaktivieren, bearbeite die <code className="bg-muted px-1.5 py-0.5 rounded text-xs">src/config/siteConfig.ts</code> Datei 
              und setze den entsprechenden Wert unter <code className="bg-muted px-1.5 py-0.5 rounded text-xs">features.modules</code> auf <code className="text-green-400">true</code> oder <code className="text-red-400">false</code>.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FeatureFlagManager;
