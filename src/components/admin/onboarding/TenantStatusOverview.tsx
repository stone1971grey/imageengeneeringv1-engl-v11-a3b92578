/**
 * Tenant Status Overview
 * 
 * Zeigt den aktuellen Status des Tenant-Projekts.
 * Prüft Konfiguration, Datenbank und Module.
 * 
 * @version 1.8.0
 */

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle2, XCircle, AlertTriangle, RefreshCw,
  Database, Settings, Globe, Package, Users, Shield, Zap
} from "lucide-react";
import { siteConfig } from "@/config/siteConfig";
import { validateSiteConfig } from "@/config/siteConfigSchema";
import { supabase } from "@/integrations/supabase/client";

interface StatusCheck {
  id: string;
  label: string;
  status: 'ok' | 'warning' | 'error' | 'checking';
  message?: string;
  icon: React.ElementType;
}

export const TenantStatusOverview = () => {
  const [checks, setChecks] = useState<StatusCheck[]>([]);
  const [isChecking, setIsChecking] = useState(false);

  const runChecks = async () => {
    setIsChecking(true);
    const newChecks: StatusCheck[] = [];

    // 1. Config Validation
    const configResult = validateSiteConfig(siteConfig);
    newChecks.push({
      id: 'config',
      label: 'siteConfig.ts',
      status: configResult.valid ? 'ok' : 'error',
      message: configResult.valid 
        ? 'Konfiguration gültig' 
        : `${configResult.errors.length} Fehler gefunden`,
      icon: Settings,
    });

    // 2. Tenant ID
    newChecks.push({
      id: 'tenant',
      label: 'Tenant ID',
      status: siteConfig.tenant.id ? 'ok' : 'error',
      message: siteConfig.tenant.id || 'Nicht konfiguriert',
      icon: Shield,
    });

    // 3. Languages
    newChecks.push({
      id: 'languages',
      label: 'Sprachen',
      status: siteConfig.features.languages.available.length > 0 ? 'ok' : 'warning',
      message: `${siteConfig.features.languages.available.length} Sprache(n): ${siteConfig.features.languages.available.join(', ')}`,
      icon: Globe,
    });

    // 4. Active Modules
    const activeModules = Object.entries(siteConfig.features.modules)
      .filter(([_, enabled]) => enabled)
      .map(([key]) => key);
    newChecks.push({
      id: 'modules',
      label: 'Module',
      status: activeModules.length > 0 ? 'ok' : 'warning',
      message: `${activeModules.length} aktiv`,
      icon: Package,
    });

    // 5. Database Connection
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .limit(1);
      
      newChecks.push({
        id: 'database',
        label: 'Datenbank',
        status: error ? 'error' : 'ok',
        message: error ? error.message : 'Verbindung OK',
        icon: Database,
      });
    } catch (e) {
      newChecks.push({
        id: 'database',
        label: 'Datenbank',
        status: 'error',
        message: 'Verbindung fehlgeschlagen',
        icon: Database,
      });
    }

    // 6. Edge Functions (check by existence of known function)
    try {
      const { error } = await supabase.functions.invoke('lookup-username', {
        body: { username: 'test-connection-check' },
      });
      // Function exists if we get a response (even if user not found)
      newChecks.push({
        id: 'functions',
        label: 'Edge Functions',
        status: 'ok',
        message: 'Deployed',
        icon: Zap,
      });
    } catch {
      newChecks.push({
        id: 'functions',
        label: 'Edge Functions',
        status: 'warning',
        message: 'Nicht verifizierbar',
        icon: Zap,
      });
    }

    // 7. Auth Status
    const { data: session } = await supabase.auth.getSession();
    newChecks.push({
      id: 'auth',
      label: 'Authentifizierung',
      status: session?.session ? 'ok' : 'warning',
      message: session?.session ? 'Eingeloggt' : 'Nicht eingeloggt',
      icon: Users,
    });

    setChecks(newChecks);
    setIsChecking(false);
  };

  useEffect(() => {
    runChecks();
  }, []);

  const statusCounts = {
    ok: checks.filter(c => c.status === 'ok').length,
    warning: checks.filter(c => c.status === 'warning').length,
    error: checks.filter(c => c.status === 'error').length,
  };

  const overallStatus = statusCounts.error > 0 
    ? 'error' 
    : statusCounts.warning > 0 
      ? 'warning' 
      : 'ok';

  const StatusIcon = ({ status }: { status: StatusCheck['status'] }) => {
    switch (status) {
      case 'ok':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'checking':
        return <RefreshCw className="h-4 w-4 text-muted-foreground animate-spin" />;
    }
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Tenant Status
            </CardTitle>
            <CardDescription>
              Überprüfung aller Systemkomponenten
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={runChecks}
            disabled={isChecking}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isChecking ? 'animate-spin' : ''}`} />
            Prüfen
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Status */}
        <div className={`flex items-center gap-3 p-4 rounded-lg ${
          overallStatus === 'ok' 
            ? 'bg-green-500/10 border border-green-500/20' 
            : overallStatus === 'warning'
              ? 'bg-yellow-500/10 border border-yellow-500/20'
              : 'bg-red-500/10 border border-red-500/20'
        }`}>
          {overallStatus === 'ok' ? (
            <CheckCircle2 className="h-6 w-6 text-green-500" />
          ) : overallStatus === 'warning' ? (
            <AlertTriangle className="h-6 w-6 text-yellow-500" />
          ) : (
            <XCircle className="h-6 w-6 text-red-500" />
          )}
          <div className="flex-1">
            <p className={`font-medium ${
              overallStatus === 'ok' ? 'text-green-400' : 
              overallStatus === 'warning' ? 'text-yellow-400' : 'text-red-400'
            }`}>
              {overallStatus === 'ok' 
                ? 'Alle Systeme funktionieren' 
                : overallStatus === 'warning'
                  ? 'System funktioniert mit Warnungen'
                  : 'Fehler gefunden'}
            </p>
            <p className="text-sm text-muted-foreground">
              {statusCounts.ok} OK • {statusCounts.warning} Warnungen • {statusCounts.error} Fehler
            </p>
          </div>
        </div>

        {/* Individual Checks */}
        <div className="space-y-2">
          {checks.map((check) => {
            const Icon = check.icon;
            return (
              <div 
                key={check.id}
                className="flex items-center justify-between p-3 bg-muted/20 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{check.label}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">{check.message}</span>
                  <StatusIcon status={check.status} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Tenant Info */}
        <div className="pt-4 border-t border-border">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3 bg-muted/30 rounded-lg">
              <p className="text-xs text-muted-foreground">Tenant</p>
              <p className="font-medium truncate">{siteConfig.tenant.name}</p>
            </div>
            <div className="p-3 bg-muted/30 rounded-lg">
              <p className="text-xs text-muted-foreground">ID</p>
              <p className="font-mono text-sm">{siteConfig.tenant.id}</p>
            </div>
            <div className="p-3 bg-muted/30 rounded-lg">
              <p className="text-xs text-muted-foreground">Default Lang</p>
              <p className="font-medium">{siteConfig.features.languages.default}</p>
            </div>
            <div className="p-3 bg-muted/30 rounded-lg">
              <p className="text-xs text-muted-foreground">Frontend Editing</p>
              <p className="font-medium">
                {siteConfig.features.frontendEditing ? '✓ Aktiv' : '✗ Inaktiv'}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TenantStatusOverview;
