/**
 * Configuration Validator Component
 * 
 * Validiert die aktuelle siteConfig und zeigt Fehler/Warnungen an.
 * 
 * @version 1.6.0
 */

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2, XCircle, AlertTriangle, Info, Shield } from "lucide-react";
import { siteConfig } from "@/config/siteConfig";
import { validateSiteConfig, ValidationResult } from "@/config/siteConfigSchema";

export const ConfigValidator = () => {
  const validationResult: ValidationResult = useMemo(() => {
    return validateSiteConfig(siteConfig);
  }, []);

  const { valid, errors, warnings } = validationResult;

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Konfiguration Validierung
        </CardTitle>
        <CardDescription>
          Überprüfung der siteConfig.ts auf Fehler und Optimierungspotenzial
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Status */}
        <div className={`flex items-center gap-3 p-4 rounded-lg ${
          valid ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'
        }`}>
          {valid ? (
            <>
              <CheckCircle2 className="h-6 w-6 text-green-500" />
              <div>
                <p className="font-medium text-green-400">Konfiguration gültig</p>
                <p className="text-sm text-muted-foreground">
                  Alle Pflichtfelder sind korrekt ausgefüllt
                </p>
              </div>
            </>
          ) : (
            <>
              <XCircle className="h-6 w-6 text-red-500" />
              <div>
                <p className="font-medium text-red-400">
                  {errors.length} Fehler gefunden
                </p>
                <p className="text-sm text-muted-foreground">
                  Bitte korrigiere die Fehler in der siteConfig.ts
                </p>
              </div>
            </>
          )}
          <Badge 
            variant="outline" 
            className={`ml-auto ${valid ? 'border-green-500 text-green-400' : 'border-red-500 text-red-400'}`}
          >
            {valid ? 'OK' : 'Fehler'}
          </Badge>
        </div>

        {/* Errors */}
        {errors.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-red-400 flex items-center gap-2">
              <XCircle className="h-4 w-4" />
              Fehler ({errors.length})
            </h4>
            {errors.map((error, index) => (
              <Alert key={index} variant="destructive" className="bg-red-500/10 border-red-500/20">
                <AlertTitle className="text-sm font-mono">{error.path}</AlertTitle>
                <AlertDescription className="text-sm">
                  {error.message}
                </AlertDescription>
              </Alert>
            ))}
          </div>
        )}

        {/* Warnings */}
        {warnings.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-yellow-400 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Warnungen ({warnings.length})
            </h4>
            {warnings.map((warning, index) => (
              <Alert key={index} className="bg-yellow-500/10 border-yellow-500/20">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                <AlertTitle className="text-sm font-mono text-yellow-400">{warning.path}</AlertTitle>
                <AlertDescription className="text-sm text-muted-foreground">
                  {warning.message}
                  {warning.suggestion && (
                    <p className="mt-1 text-xs text-yellow-400/80">
                      💡 {warning.suggestion}
                    </p>
                  )}
                </AlertDescription>
              </Alert>
            ))}
          </div>
        )}

        {/* No Issues */}
        {valid && warnings.length === 0 && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Info className="h-4 w-4" />
            <span className="text-sm">Keine Warnungen oder Optimierungsvorschläge</span>
          </div>
        )}

        {/* Config Summary */}
        <div className="pt-4 border-t border-border">
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <Info className="h-4 w-4 text-primary" />
            Konfiguration-Übersicht
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3 bg-muted/30 rounded-lg">
              <p className="text-xs text-muted-foreground">Tenant</p>
              <p className="font-medium truncate">{siteConfig.tenant.name}</p>
            </div>
            <div className="p-3 bg-muted/30 rounded-lg">
              <p className="text-xs text-muted-foreground">Sprachen</p>
              <p className="font-medium">{siteConfig.features.languages.available.length}</p>
            </div>
            <div className="p-3 bg-muted/30 rounded-lg">
              <p className="text-xs text-muted-foreground">Module</p>
              <p className="font-medium">
                {Object.values(siteConfig.features.modules).filter(Boolean).length} / 
                {Object.keys(siteConfig.features.modules).length}
              </p>
            </div>
            <div className="p-3 bg-muted/30 rounded-lg">
              <p className="text-xs text-muted-foreground">Integrationen</p>
              <p className="font-medium">
                {[
                  siteConfig.integrations.mautic.enabled,
                  siteConfig.integrations.resend.enabled,
                  siteConfig.integrations.firecrawl.enabled,
                  siteConfig.integrations.sistrix.enabled,
                ].filter(Boolean).length}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConfigValidator;
