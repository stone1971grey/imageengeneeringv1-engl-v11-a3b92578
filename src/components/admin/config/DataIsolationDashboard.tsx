/**
 * Data Isolation Dashboard Component
 * 
 * Visualisiert die Ordnerstruktur und Sync-Regeln für Multi-Tenancy.
 * 
 * @version 1.7.0
 */

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Shield, FolderLock, FolderSync, FolderCheck, 
  Download, Copy, AlertTriangle, CheckCircle2, Info,
  Database, FileText, Image
} from "lucide-react";
import { toast } from "sonner";
import { 
  FOLDER_STRUCTURE, 
  PROTECTED_PATHS, 
  SAFE_SYNC_PATHS,
  BACKUP_TABLES,
  generateFolderDocumentation,
  generateBackupSQL,
  generateRestoreSQL,
} from "@/config/configProtection";

const SYNC_TYPE_CONFIG = {
  protected: {
    label: 'Geschützt',
    icon: FolderLock,
    color: 'text-red-400',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/20',
    badgeColor: 'bg-red-500/20 text-red-400 border-red-500/30',
  },
  partial: {
    label: 'Prüfen',
    icon: FolderSync,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/20',
    badgeColor: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  },
  safe: {
    label: 'Sicher',
    icon: FolderCheck,
    color: 'text-green-400',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/20',
    badgeColor: 'bg-green-500/20 text-green-400 border-green-500/30',
  },
};

export const DataIsolationDashboard = () => {
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} kopiert!`);
  };

  const downloadFile = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`${filename} heruntergeladen!`);
  };

  const folderDoc = generateFolderDocumentation();
  const backupSQL = generateBackupSQL(BACKUP_TABLES);
  const restoreSQL = generateRestoreSQL(BACKUP_TABLES);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            Data Isolation
          </h2>
          <p className="text-muted-foreground mt-1">
            Ordnerstruktur, Sync-Regeln und Backup-Verwaltung
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className={`${SYNC_TYPE_CONFIG.protected.bgColor} ${SYNC_TYPE_CONFIG.protected.borderColor} border`}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <FolderLock className={`h-5 w-5 ${SYNC_TYPE_CONFIG.protected.color}`} />
              <span className="text-sm text-muted-foreground">Geschützt</span>
            </div>
            <p className="text-2xl font-bold mt-1">{PROTECTED_PATHS.length}</p>
            <p className="text-xs text-muted-foreground">Pfade</p>
          </CardContent>
        </Card>

        <Card className={`${SYNC_TYPE_CONFIG.safe.bgColor} ${SYNC_TYPE_CONFIG.safe.borderColor} border`}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <FolderCheck className={`h-5 w-5 ${SYNC_TYPE_CONFIG.safe.color}`} />
              <span className="text-sm text-muted-foreground">Sync-sicher</span>
            </div>
            <p className="text-2xl font-bold mt-1">{SAFE_SYNC_PATHS.length}</p>
            <p className="text-xs text-muted-foreground">Ordner</p>
          </CardContent>
        </Card>

        <Card className="bg-primary/10 border-primary/20 border">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              <span className="text-sm text-muted-foreground">Backup-Tabellen</span>
            </div>
            <p className="text-2xl font-bold mt-1">{BACKUP_TABLES.length}</p>
            <p className="text-xs text-muted-foreground">Tabellen</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="structure" className="space-y-6">
        <TabsList className="bg-muted/30">
          <TabsTrigger value="structure" className="data-[state=active]:bg-background">
            <FolderLock className="h-4 w-4 mr-2" />
            Ordnerstruktur
          </TabsTrigger>
          <TabsTrigger value="backup" className="data-[state=active]:bg-background">
            <Database className="h-4 w-4 mr-2" />
            Backup & Restore
          </TabsTrigger>
        </TabsList>

        {/* STRUCTURE TAB */}
        <TabsContent value="structure" className="space-y-6">
          {/* Legend */}
          <div className="flex flex-wrap gap-4 p-4 bg-muted/20 rounded-lg border border-border">
            <div className="flex items-center gap-2">
              <FolderLock className="h-4 w-4 text-red-400" />
              <span className="text-sm">🔴 Geschützt - NIEMALS synchronisieren</span>
            </div>
            <div className="flex items-center gap-2">
              <FolderSync className="h-4 w-4 text-yellow-400" />
              <span className="text-sm">🟡 Partial - Manuell prüfen</span>
            </div>
            <div className="flex items-center gap-2">
              <FolderCheck className="h-4 w-4 text-green-400" />
              <span className="text-sm">🟢 Sicher - 1:1 kopieren</span>
            </div>
          </div>

          {/* Folder Cards */}
          <div className="space-y-3">
            {FOLDER_STRUCTURE.map((folder) => {
              const config = SYNC_TYPE_CONFIG[folder.syncType];
              const Icon = config.icon;

              return (
                <Card 
                  key={folder.path} 
                  className={`${config.bgColor} ${config.borderColor} border`}
                >
                  <CardContent className="py-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <Icon className={`h-5 w-5 mt-0.5 ${config.color}`} />
                        <div>
                          <div className="flex items-center gap-2">
                            <code className="font-mono text-sm font-medium">{folder.path}</code>
                            <Badge variant="outline" className={config.badgeColor}>
                              {config.label}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {folder.description}
                          </p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {folder.contents.map((item) => (
                              <Badge key={item} variant="secondary" className="text-xs">
                                {item}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Download Documentation */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="h-5 w-5 text-primary" />
                Dokumentation exportieren
              </CardTitle>
            </CardHeader>
            <CardContent className="flex gap-3">
              <Button 
                onClick={() => downloadFile('FOLDER_STRUCTURE.md', folderDoc)}
              >
                <Download className="h-4 w-4 mr-2" />
                Als Markdown
              </Button>
              <Button 
                variant="outline"
                onClick={() => copyToClipboard(folderDoc, 'Dokumentation')}
              >
                <Copy className="h-4 w-4 mr-2" />
                Kopieren
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* BACKUP TAB */}
        <TabsContent value="backup" className="space-y-6">
          {/* Info */}
          <Card className="bg-blue-500/10 border-blue-500/20 border">
            <CardContent className="flex items-start gap-3 pt-4">
              <Info className="h-5 w-5 text-blue-400 mt-0.5" />
              <div>
                <p className="font-medium text-blue-400">Tenant-spezifische Backups</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Die folgenden SQL-Skripte ermöglichen das Exportieren und Importieren aller 
                  tenant-spezifischen Daten. Führe diese über die Supabase SQL-Konsole aus.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Backup Tables List */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-primary" />
                Backup-Tabellen ({BACKUP_TABLES.length})
              </CardTitle>
              <CardDescription>
                Alle Tabellen die für ein vollständiges Tenant-Backup benötigt werden
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {BACKUP_TABLES.map((table) => (
                  <Badge key={table} variant="outline" className="font-mono text-xs">
                    {table}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Backup Script */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Download className="h-5 w-5 text-green-500" />
                Backup SQL
              </CardTitle>
              <CardDescription>
                Exportiert alle Tenant-Daten als CSV
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <pre className="text-xs bg-muted/30 p-4 rounded-lg overflow-x-auto max-h-48">
                <code>{backupSQL}</code>
              </pre>
              <div className="flex gap-3">
                <Button 
                  onClick={() => downloadFile('tenant-backup.sql', backupSQL)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => copyToClipboard(backupSQL, 'Backup SQL')}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Kopieren
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Restore Script */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                Restore SQL
              </CardTitle>
              <CardDescription className="text-red-400">
                ACHTUNG: Löscht alle bestehenden Daten vor dem Import!
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <pre className="text-xs bg-red-500/10 p-4 rounded-lg overflow-x-auto max-h-48 border border-red-500/20">
                <code>{restoreSQL}</code>
              </pre>
              <div className="flex gap-3">
                <Button 
                  onClick={() => downloadFile('tenant-restore.sql', restoreSQL)}
                  variant="destructive"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => copyToClipboard(restoreSQL, 'Restore SQL')}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Kopieren
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Checklist */}
          <Card className="bg-muted/20 border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                Backup-Checkliste
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {[
                  'Supabase-Projekt pausieren (empfohlen)',
                  'Backup-SQL in SQL-Editor ausführen',
                  'CSV-Dateien sicher speichern',
                  'siteConfig.ts separat sichern',
                  'Storage-Buckets manuell exportieren',
                  'Backup verifizieren',
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <div className="w-5 h-5 rounded border border-border flex items-center justify-center text-xs text-muted-foreground">
                      {i + 1}
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DataIsolationDashboard;
