/**
 * Configuration Dashboard
 * 
 * Zentrales Dashboard für alle Konfigurationseinstellungen.
 * Kombiniert Validator, Feature-Flags und Branding-Preview.
 * 
 * @version 1.6.0
 */

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Settings, Shield, Palette, Package, Globe, Plug } from "lucide-react";
import { ConfigValidator } from "./ConfigValidator";
import { FeatureFlagManager } from "./FeatureFlagManager";
import { BrandingPreview } from "./BrandingPreview";
import { siteConfig } from "@/config/siteConfig";

export const ConfigDashboard = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Settings className="h-6 w-6 text-primary" />
            Konfiguration
          </h2>
          <p className="text-muted-foreground mt-1">
            Übersicht und Validierung der Tenant-Konfiguration
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          {siteConfig.tenant.id}
        </Badge>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="bg-card/50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Package className="h-4 w-4" />
              <span className="text-xs">Module</span>
            </div>
            <p className="text-2xl font-bold mt-1">
              {Object.values(siteConfig.features.modules).filter(Boolean).length}
              <span className="text-sm text-muted-foreground font-normal">
                /{Object.keys(siteConfig.features.modules).length}
              </span>
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card/50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Globe className="h-4 w-4" />
              <span className="text-xs">Sprachen</span>
            </div>
            <p className="text-2xl font-bold mt-1">
              {siteConfig.features.languages.available.length}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card/50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Plug className="h-4 w-4" />
              <span className="text-xs">Integrationen</span>
            </div>
            <p className="text-2xl font-bold mt-1">
              {[
                siteConfig.integrations.mautic.enabled,
                siteConfig.integrations.resend.enabled,
                siteConfig.integrations.firecrawl.enabled,
                siteConfig.integrations.sistrix.enabled,
              ].filter(Boolean).length}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card/50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Shield className="h-4 w-4" />
              <span className="text-xs">Frontend-Editing</span>
            </div>
            <p className="text-lg font-bold mt-1">
              {siteConfig.features.frontendEditing ? (
                <span className="text-green-400">Aktiv</span>
              ) : (
                <span className="text-red-400">Inaktiv</span>
              )}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card/50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Palette className="h-4 w-4" />
              <span className="text-xs">Multi-User</span>
            </div>
            <p className="text-lg font-bold mt-1">
              {siteConfig.features.multiUser ? (
                <span className="text-green-400">Aktiv</span>
              ) : (
                <span className="text-muted-foreground">Inaktiv</span>
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="validator" className="space-y-6">
        <TabsList className="bg-muted/30">
          <TabsTrigger value="validator" className="data-[state=active]:bg-background">
            <Shield className="h-4 w-4 mr-2" />
            Validierung
          </TabsTrigger>
          <TabsTrigger value="modules" className="data-[state=active]:bg-background">
            <Package className="h-4 w-4 mr-2" />
            Module
          </TabsTrigger>
          <TabsTrigger value="branding" className="data-[state=active]:bg-background">
            <Palette className="h-4 w-4 mr-2" />
            Branding
          </TabsTrigger>
          <TabsTrigger value="integrations" className="data-[state=active]:bg-background">
            <Plug className="h-4 w-4 mr-2" />
            Integrationen
          </TabsTrigger>
        </TabsList>

        <TabsContent value="validator">
          <ConfigValidator />
        </TabsContent>

        <TabsContent value="modules">
          <FeatureFlagManager />
        </TabsContent>

        <TabsContent value="branding">
          <BrandingPreview />
        </TabsContent>

        <TabsContent value="integrations">
          <IntegrationsOverview />
        </TabsContent>
      </Tabs>
    </div>
  );
};

/**
 * Integrations Overview Component
 */
const IntegrationsOverview = () => {
  const { integrations } = siteConfig;

  const integrationsList = [
    {
      key: 'mautic',
      name: 'Mautic',
      description: 'Marketing Automation Platform',
      enabled: integrations.mautic.enabled,
      icon: '📧',
    },
    {
      key: 'resend',
      name: 'Resend',
      description: 'E-Mail-Versand Service',
      enabled: integrations.resend.enabled,
      details: integrations.resend.enabled ? `${integrations.resend.fromName} <${integrations.resend.fromEmail}>` : null,
      icon: '✉️',
    },
    {
      key: 'firecrawl',
      name: 'Firecrawl',
      description: 'Web Scraping & Content Import',
      enabled: integrations.firecrawl.enabled,
      icon: '🔥',
    },
    {
      key: 'sistrix',
      name: 'Sistrix',
      description: 'SEO-Analyse & Visibility Tracking',
      enabled: integrations.sistrix.enabled,
      details: integrations.sistrix.enabled ? integrations.sistrix.domain : null,
      icon: '📊',
    },
  ];

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plug className="h-5 w-5 text-primary" />
          Integrationen
        </CardTitle>
        <CardDescription>
          Externe Services und deren Konfigurationsstatus
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {integrationsList.map((integration) => (
          <div
            key={integration.key}
            className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
              integration.enabled 
                ? 'bg-muted/30 border-primary/20' 
                : 'bg-muted/10 border-border opacity-60'
            }`}
          >
            <div className="flex items-center gap-4">
              <span className="text-2xl">{integration.icon}</span>
              <div>
                <p className="font-medium">{integration.name}</p>
                <p className="text-sm text-muted-foreground">{integration.description}</p>
                {integration.details && (
                  <p className="text-xs text-primary mt-1 font-mono">{integration.details}</p>
                )}
              </div>
            </div>
            <Badge variant={integration.enabled ? "default" : "secondary"}>
              {integration.enabled ? 'Aktiv' : 'Inaktiv'}
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default ConfigDashboard;
