/**
 * Config Protection System
 * 
 * Schutzmechanismus für tenant-spezifische Konfigurationen.
 * Verhindert versehentliches Überschreiben während Sync-Operationen.
 * 
 * @version 1.7.0
 */

// ============================================================================
// PROTECTED FILES - NIEMALS SYNCHRONISIEREN
// ============================================================================

/**
 * Liste aller Dateien/Ordner, die niemals zwischen Tenants synchronisiert werden dürfen.
 * Diese enthalten tenant-spezifische Daten und Konfigurationen.
 */
export const PROTECTED_PATHS = [
  // Config Files
  'src/config/siteConfig.ts',
  '.env',
  '.env.local',
  '.env.production',
  
  // Tenant Branding
  'public/logos/',
  'public/favicon.ico',
  'public/og-default.jpg',
  'src/assets/logo-*.png',
  'src/assets/logo-*.svg',
  
  // Database Content (Supabase)
  'supabase/seed.sql',
  
  // Build Artifacts
  'dist/',
  '.lovable/',
  'node_modules/',
] as const;

/**
 * Dateien die bei Sync überprüft werden müssen (partial sync)
 */
export const PARTIAL_SYNC_PATHS = [
  'src/pages/',           // Nur neue Seiten, keine Überschreibung
  'supabase/migrations/', // Nur neue Migrationen
  'public/',              // Nur neue Assets
] as const;

/**
 * Dateien die 1:1 synchronisiert werden können (safe sync)
 */
export const SAFE_SYNC_PATHS = [
  'src/components/',
  'src/hooks/',
  'src/lib/',
  'src/contexts/',
  'src/config/index.ts',
  'src/config/presets/',
  'src/config/siteConfigSchema.ts',
  'supabase/functions/',
] as const;

// ============================================================================
// PROTECTION UTILITIES
// ============================================================================

export interface ProtectionCheckResult {
  isProtected: boolean;
  reason?: string;
  category: 'protected' | 'partial' | 'safe';
}

/**
 * Prüft ob ein Pfad geschützt ist
 */
export const checkPathProtection = (path: string): ProtectionCheckResult => {
  // Normalize path
  const normalizedPath = path.replace(/\\/g, '/');
  
  // Check protected paths
  for (const protectedPath of PROTECTED_PATHS) {
    if (normalizedPath.includes(protectedPath.replace('*', ''))) {
      return {
        isProtected: true,
        reason: `"${protectedPath}" ist tenant-spezifisch und darf nicht synchronisiert werden.`,
        category: 'protected',
      };
    }
  }
  
  // Check partial sync paths
  for (const partialPath of PARTIAL_SYNC_PATHS) {
    if (normalizedPath.startsWith(partialPath)) {
      return {
        isProtected: false,
        reason: `"${partialPath}" erfordert manuelle Überprüfung vor dem Sync.`,
        category: 'partial',
      };
    }
  }
  
  // Safe to sync
  return {
    isProtected: false,
    category: 'safe',
  };
};

/**
 * Gruppiert Pfade nach Schutz-Kategorie
 */
export const categorizePathsForSync = (paths: string[]): {
  protected: string[];
  partial: string[];
  safe: string[];
} => {
  const result = {
    protected: [] as string[],
    partial: [] as string[],
    safe: [] as string[],
  };
  
  for (const path of paths) {
    const check = checkPathProtection(path);
    result[check.category].push(path);
  }
  
  return result;
};

// ============================================================================
// FOLDER STRUCTURE DOCUMENTATION
// ============================================================================

export interface FolderDoc {
  path: string;
  description: string;
  syncType: 'protected' | 'partial' | 'safe';
  contents: string[];
}

/**
 * Dokumentation der Ordnerstruktur für Multi-Tenancy
 */
export const FOLDER_STRUCTURE: FolderDoc[] = [
  // PROTECTED
  {
    path: 'src/config/siteConfig.ts',
    description: 'Zentrale Tenant-Konfiguration (Branding, Features, Kontakt)',
    syncType: 'protected',
    contents: ['Tenant-ID', 'Logos', 'Farben', 'Feature-Flags', 'Integrationen'],
  },
  {
    path: '.env',
    description: 'Umgebungsvariablen und Secrets',
    syncType: 'protected',
    contents: ['SUPABASE_URL', 'SUPABASE_ANON_KEY', 'API Keys'],
  },
  {
    path: 'public/logos/',
    description: 'Tenant-spezifische Logos und Markenelemente',
    syncType: 'protected',
    contents: ['logo-primary.png', 'logo-dark.png', 'favicon.ico'],
  },
  
  // PARTIAL SYNC
  {
    path: 'src/pages/',
    description: 'Seiten-Komponenten (neue hinzufügen, bestehende prüfen)',
    syncType: 'partial',
    contents: ['Index.tsx', 'Auth.tsx', 'AdminDashboard.tsx', '...'],
  },
  {
    path: 'supabase/migrations/',
    description: 'Datenbank-Migrationen (nur neue hinzufügen)',
    syncType: 'partial',
    contents: ['0001_initial.sql', '0002_add_news.sql', '...'],
  },
  {
    path: 'public/',
    description: 'Statische Assets (nur neue hinzufügen)',
    syncType: 'partial',
    contents: ['images/', 'fonts/', 'documents/'],
  },
  
  // SAFE SYNC
  {
    path: 'src/components/',
    description: 'Wiederverwendbare UI-Komponenten',
    syncType: 'safe',
    contents: ['ui/', 'admin/', 'segments/', 'layout/'],
  },
  {
    path: 'src/hooks/',
    description: 'Custom React Hooks',
    syncType: 'safe',
    contents: ['useAuth.ts', 'usePageContent.ts', 'useTranslation.ts'],
  },
  {
    path: 'src/lib/',
    description: 'Utility-Funktionen und Helper',
    syncType: 'safe',
    contents: ['utils.ts', 'translationUtils.ts', 'seoUtils.ts'],
  },
  {
    path: 'supabase/functions/',
    description: 'Edge Functions (Backend-Logik)',
    syncType: 'safe',
    contents: ['lookup-username/', 'translate-content/', 'upload-image/'],
  },
];

/**
 * Generiert Markdown-Dokumentation der Ordnerstruktur
 */
export const generateFolderDocumentation = (): string => {
  let md = `# Spade CMS - Ordnerstruktur für Multi-Tenancy

> Diese Dokumentation beschreibt die Sync-Regeln für Multi-Tenant-Projekte.

## Sync-Kategorien

| Kategorie | Bedeutung |
|-----------|-----------|
| 🔴 Protected | NIEMALS synchronisieren - Tenant-spezifisch |
| 🟡 Partial | Manuell prüfen - Nur neue Dateien hinzufügen |
| 🟢 Safe | Kann 1:1 synchronisiert werden |

---

`;

  // Group by sync type
  const grouped = {
    protected: FOLDER_STRUCTURE.filter(f => f.syncType === 'protected'),
    partial: FOLDER_STRUCTURE.filter(f => f.syncType === 'partial'),
    safe: FOLDER_STRUCTURE.filter(f => f.syncType === 'safe'),
  };

  md += `## 🔴 Geschützte Dateien (NIEMALS synchronisieren)\n\n`;
  for (const folder of grouped.protected) {
    md += `### \`${folder.path}\`\n`;
    md += `${folder.description}\n\n`;
    md += `**Enthält:** ${folder.contents.join(', ')}\n\n`;
  }

  md += `---\n\n## 🟡 Teilweise Sync (Manuell prüfen)\n\n`;
  for (const folder of grouped.partial) {
    md += `### \`${folder.path}\`\n`;
    md += `${folder.description}\n\n`;
    md += `**Enthält:** ${folder.contents.join(', ')}\n\n`;
  }

  md += `---\n\n## 🟢 Sicherer Sync (1:1 kopieren)\n\n`;
  for (const folder of grouped.safe) {
    md += `### \`${folder.path}\`\n`;
    md += `${folder.description}\n\n`;
    md += `**Enthält:** ${folder.contents.join(', ')}\n\n`;
  }

  return md;
};

// ============================================================================
// BACKUP UTILITIES
// ============================================================================

export interface BackupManifest {
  tenantId: string;
  createdAt: string;
  version: string;
  files: BackupFileInfo[];
  database: {
    tables: string[];
    rowCounts: Record<string, number>;
  };
}

export interface BackupFileInfo {
  path: string;
  size: number;
  hash?: string;
  category: 'config' | 'content' | 'media';
}

/**
 * Generiert eine Backup-Manifest-Struktur für einen Tenant
 */
export const createBackupManifest = (
  tenantId: string,
  version: string
): Omit<BackupManifest, 'files' | 'database'> => ({
  tenantId,
  createdAt: new Date().toISOString(),
  version,
});

/**
 * Liste der Tabellen für Tenant-Backup
 */
export const BACKUP_TABLES = [
  // Core CMS
  'page_registry',
  'segment_registry',
  'page_content',
  'page_content_backups',
  
  // Content Types
  'news_articles',
  'events',
  'products',
  'downloads',
  
  // Navigation & Media
  'navigation_links',
  'file_segment_mappings',
  'media_folders',
  
  // User Data
  'profiles',
  'user_roles',
  'user_seo_permissions',
  'editor_page_access',
  
  // Form Submissions
  'contact_submissions',
  'newsletter_subscriptions',
  'download_requests',
  'event_registrations',
  
  // System
  'glossary',
  'redirects',
  'page_id_sequence',
] as const;

/**
 * SQL-Template für Tenant-Backup
 */
export const generateBackupSQL = (tables: readonly string[]): string => {
  let sql = `-- Spade CMS Tenant Backup
-- Generated: ${new Date().toISOString()}
-- Tables: ${tables.length}

`;

  for (const table of tables) {
    sql += `-- Export: ${table}
COPY public.${table} TO STDOUT WITH CSV HEADER;

`;
  }

  return sql;
};

/**
 * SQL-Template für Tenant-Restore
 */
export const generateRestoreSQL = (tables: readonly string[]): string => {
  let sql = `-- Spade CMS Tenant Restore
-- Generated: ${new Date().toISOString()}
-- Tables: ${tables.length}

-- WARNUNG: Dieser Befehl löscht alle bestehenden Daten!

BEGIN;

`;

  // Delete in reverse order (foreign key constraints)
  const reverseTables = [...tables].reverse();
  for (const table of reverseTables) {
    sql += `TRUNCATE TABLE public.${table} CASCADE;\n`;
  }

  sql += `\n-- Import data from CSV files\n`;
  for (const table of tables) {
    sql += `COPY public.${table} FROM 'backup/${table}.csv' WITH CSV HEADER;\n`;
  }

  sql += `\nCOMMIT;\n`;

  return sql;
};
