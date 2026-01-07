import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Copy, Download, FileCode, FolderOpen } from "lucide-react";
import { toast } from "sonner";

// ============================================================================
// FILE CONTENTS - All files needed for aftermarket-update project
// ============================================================================

const SITE_CONFIG_CONTENT = `/**
 * Site Configuration for aftermarket-update.de
 */

export type AvailableLanguage = 'de' | 'en';

export type FeatureModule = 
  | 'news' 
  | 'events' 
  | 'products' 
  | 'downloads' 
  | 'newsletter' 
  | 'contact' 
  | 'glossary'
  | 'seoTools';

export interface SiteConfig {
  tenant: { id: string; name: string; legalName: string; tagline: string; };
  branding: {
    logos: { primary: string; inverted?: string; icon?: string; };
    colors: {
      primary: string; primaryForeground: string; secondary: string;
      accent: string; background: string; foreground: string;
      muted: string; mutedForeground: string;
    };
    fonts: { heading: string; body: string; };
  };
  contact: { email: string; phone?: string; address?: { street: string; city: string; zip: string; country: string; }; };
  social: { linkedin?: string; twitter?: string; facebook?: string; instagram?: string; youtube?: string; };
  seo: { defaultTitle: string; titleTemplate: string; defaultDescription: string; defaultOgImage?: string; twitterHandle?: string; };
  features: { modules: Record<FeatureModule, boolean>; languages: AvailableLanguage[]; defaultLanguage: AvailableLanguage; frontendEditing: boolean; };
  integrations: { mautic?: { enabled: boolean; baseUrl?: string; }; resend?: { enabled: boolean; fromEmail?: string; }; analytics?: { enabled: boolean; googleAnalyticsId?: string; }; };
  storage: { mediaBucket: string; publicBucket: string; };
}

export const siteConfig: SiteConfig = {
  tenant: { id: 'aftermarket-update', name: 'Aftermarket Update', legalName: 'Aftermarket Update Media GmbH', tagline: 'Das Fachportal für den Automotive Aftermarket' },
  branding: {
    logos: { primary: '/logo-aftermarket-update.svg', inverted: '/logo-aftermarket-update-white.svg', icon: '/favicon.svg' },
    colors: { primary: '220 90% 45%', primaryForeground: '0 0% 100%', secondary: '220 15% 20%', accent: '45 100% 50%', background: '0 0% 100%', foreground: '220 15% 15%', muted: '220 10% 96%', mutedForeground: '220 10% 40%' },
    fonts: { heading: 'Georgia, serif', body: 'system-ui, sans-serif' },
  },
  contact: { email: 'redaktion@aftermarket-update.de', phone: '+49 123 456789', address: { street: 'Musterstraße 1', city: 'München', zip: '80331', country: 'Deutschland' } },
  social: { linkedin: 'https://linkedin.com/company/aftermarket-update', twitter: 'https://twitter.com/aftermarket_upd' },
  seo: { defaultTitle: 'Aftermarket Update', titleTemplate: '%s | Aftermarket Update', defaultDescription: 'Aktuelle News aus dem Automotive Aftermarket.', defaultOgImage: '/og-image-aftermarket.jpg', twitterHandle: '@aftermarket_upd' },
  features: { modules: { news: true, newsletter: true, contact: true, events: true, downloads: true, products: false, glossary: false, seoTools: false }, languages: ['de'], defaultLanguage: 'de', frontendEditing: true },
  integrations: { mautic: { enabled: false }, resend: { enabled: true, fromEmail: 'noreply@aftermarket-update.de' }, analytics: { enabled: false } },
  storage: { mediaBucket: 'cms-media', publicBucket: 'public-assets' },
};

export const isModuleEnabled = (module: FeatureModule): boolean => siteConfig.features.modules[module] ?? false;
export const isLanguageAvailable = (lang: string): lang is AvailableLanguage => siteConfig.features.languages.includes(lang as AvailableLanguage);
export const getPageTitle = (pageTitle?: string): string => !pageTitle ? siteConfig.seo.defaultTitle : siteConfig.seo.titleTemplate.replace('%s', pageTitle);
export const getContactEmail = (): string => siteConfig.contact.email;`;

const INDEX_CONTENT = `/**
 * Config Module Exports
 */
export { 
  siteConfig, isModuleEnabled, isLanguageAvailable, getPageTitle, getContactEmail,
  type SiteConfig, type AvailableLanguage, type FeatureModule,
} from './siteConfig';`;

const AUTH_CONTENT = `import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { User, Session } from "@supabase/supabase-js";
import { Eye, EyeOff } from "lucide-react";
import { siteConfig } from "@/config";
import spadeCmsLogo from "@/assets/spade-cms-logo.png";
import { CMS_VERSION } from "@/components/admin/dashboard/config";

const Auth = () => {
  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const tenantLogo = siteConfig.branding.logos.primary;
  const tenantName = siteConfig.tenant.name;

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) { setTimeout(() => { sessionStorage.removeItem("admin_selected_page"); navigate("/de/admin-dashboard"); }, 0); }
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) { sessionStorage.removeItem("admin_selected_page"); navigate("/de/admin-dashboard"); }
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (!loginIdentifier || !password) { toast.error("Bitte alle Felder ausfüllen"); setLoading(false); return; }
    let emailToUse = loginIdentifier;
    if (!loginIdentifier.includes('@')) {
      try {
        const { data, error } = await supabase.functions.invoke('lookup-username', { body: { username: loginIdentifier } });
        if (error || !data?.found || !data?.email) { toast.error("Benutzername nicht gefunden"); setLoading(false); return; }
        emailToUse = data.email;
      } catch { toast.error("Fehler bei der Benutzersuche"); setLoading(false); return; }
    }
    const { error } = await supabase.auth.signInWithPassword({ email: emailToUse, password });
    setLoading(false);
    if (error) toast.error(error.message); else toast.success("Erfolgreich eingeloggt!");
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-zinc-900 border-zinc-800">
        <CardHeader className="space-y-4">
          <div className="flex justify-center">
            <div className="bg-white rounded-xl px-6 py-4 shadow-lg flex items-center justify-between gap-6 w-full">
              <img src={spadeCmsLogo} alt="SpadeCMS" className="h-20 w-auto" />
              <Badge variant="outline" className="bg-[#4B7BF5] text-white border-[#4B7BF5] text-[10px] font-semibold px-2 py-0.5">v{CMS_VERSION}</Badge>
            </div>
          </div>
          <div className="border-t border-zinc-700 my-4" />
          <div className="flex justify-center"><img src={tenantLogo} alt={tenantName} className="h-16 w-auto" /></div>
          <CardTitle className="text-2xl text-center text-white">Login</CardTitle>
          <CardDescription className="text-center text-zinc-400">Melden Sie sich an</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="loginIdentifier" className="text-zinc-300">Benutzername oder E-Mail</Label>
              <Input id="loginIdentifier" type="text" value={loginIdentifier} onChange={(e) => setLoginIdentifier(e.target.value)} disabled={loading} required className="bg-zinc-800 border-zinc-700 text-white" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-zinc-300">Passwort</Label>
              <div className="relative">
                <Input id="password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading} required className="bg-zinc-800 border-zinc-700 text-white pr-10" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400" tabIndex={-1}>
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full bg-[#f9dc24] text-black hover:bg-[#f9dc24]/90" disabled={loading}>{loading ? "Bitte warten..." : "Anmelden"}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
export default Auth;`;

const ROADMAP_CONTENT = `export type FeatureStatus = 'done' | 'planned';
export type VersionStatus = 'released' | 'current' | 'planned' | 'complete';
export interface RoadmapFeature { label: string; status: FeatureStatus; }
export interface RoadmapVersion { key: string; label: string; status: VersionStatus; features: RoadmapFeature[]; isAdminOnly?: boolean; }

export const CMS_VERSION = '1.1.2';

export const ROADMAP_VERSIONS: RoadmapVersion[] = [
  { key: 'v1.0', label: 'v1.0.0 – Release', status: 'released', features: [{ label: 'Draft/Publish Workflow', status: 'done' }, { label: 'Segment-Registry', status: 'done' }] },
  { key: 'v1.1', label: 'v1.1 – Current', status: 'current', features: [{ label: 'News Management', status: 'done' }, { label: 'Frontend Editing', status: 'done' }] },
];

export const getReleasedVersions = () => ROADMAP_VERSIONS.filter(v => v.status === 'released' || v.status === 'current');
export const getRoadmapVersions = () => ROADMAP_VERSIONS.filter(v => v.status === 'planned' && v.isAdminOnly);
export const getCurrentVersion = () => ROADMAP_VERSIONS.find(v => v.status === 'current');`;

const CONFIG_TOML_CONTENT = `project_id = "DEINE_PROJECT_ID"

[functions.lookup-username]
verify_jwt = false

[functions.admin-create-user]
verify_jwt = true

[functions.admin-update-user]
verify_jwt = true

[functions.admin-delete-user]
verify_jwt = true

[functions.translate-content]
verify_jwt = true

[functions.upload-image]
verify_jwt = true

[functions.upload-news-images]
verify_jwt = false

[functions.register-event]
verify_jwt = false

[functions.send-download-email]
verify_jwt = false

[functions.generate-og-image]
verify_jwt = true

[functions.get-logo-base64]
verify_jwt = false

[functions.download-external-file]
verify_jwt = false`;

const ONBOARDING_CHECKLIST_CONTENT = `# Tenant Onboarding Checklist

## Spade CMS – Multi-Tenancy Setup Guide (v1.1.2)

Diese Checkliste beschreibt alle Schritte, um ein neues Tenant-Projekt (z.B. aftermarket-update.de) basierend auf dem Spade CMS Core aufzusetzen.

---

## Phase 1: Lovable Projekt erstellen

- [ ] Neues Lovable-Projekt erstellen auf [lovable.dev](https://lovable.dev)
- [ ] Lovable Cloud aktivieren (Supabase-Backend)
- [ ] Projekt-URL notieren: \`https://preview--[PROJECT_NAME].lovable.app\`

---

## Phase 2: Konfigurationsdateien hochladen

Diese 5 Dateien aus dem Download-Hub (\`/aftermarket-update\`) in das neue Projekt hochladen:

| Datei | Zielort | Beschreibung |
|-------|---------|--------------|
| \`siteConfig.ts\` | \`src/config/siteConfig.ts\` | Tenant-spezifische Konfiguration |
| \`Auth.tsx\` | \`src/pages/Auth.tsx\` | Login-Seite mit Tenant-Branding |
| \`config.toml\` | \`supabase/config.toml\` | Edge Function Konfiguration |
| \`index.ts\` | \`src/config/index.ts\` | Config-Export |
| \`LoginOverlay.tsx\` | \`src/components/LoginOverlay.tsx\` | Login-Overlay Komponente |

---

## Phase 3: Core-Ordner kopieren (1:1)

Diese Ordner müssen **komplett** vom Haupt-Projekt kopiert werden:

### Pflicht-Ordner

\`\`\`
src/components/          → Alle UI-Komponenten inkl. Segment-Editoren
src/hooks/               → Alle Custom Hooks
src/lib/                 → Utility-Funktionen
src/assets/              → Icons, Bilder (außer tenant-spezifische Logos)
src/types/               → TypeScript Typen
src/contexts/            → React Contexts
supabase/functions/      → Alle Edge Functions
\`\`\`

### Styling-Dateien

\`\`\`
src/index.css            → Design Tokens (CSS Variables)
tailwind.config.ts       → Tailwind-Konfiguration
\`\`\`

### Teilweise kopieren (mit Anpassungen)

\`\`\`
src/pages/               → Nur benötigte Seiten (je nach aktivierten Modulen)
src/App.tsx              → Routing-Anpassungen
src/main.tsx             → Entry Point
\`\`\`

---

## Phase 4: Datenbank-Migration ausführen

Die SQL-Migration \`tenant-database-migration.sql\` im neuen Projekt ausführen.

**Reihenfolge:**
1. Enum-Typen erstellen
2. Hilfsfunktionen erstellen (\`has_role\`, \`get_next_page_id\`)
3. Core-Tabellen erstellen
4. RLS aktivieren
5. RLS-Policies erstellen
6. Storage Buckets erstellen
7. Trigger für Profile-Erstellung

**Benötigte Kern-Tabellen:**
- \`profiles\` - Benutzerprofile
- \`user_roles\` - Rollen-Zuordnung
- \`user_seo_permissions\` - SEO-Berechtigungen
- \`editor_page_access\` - Editor-Zugriffsrechte
- \`page_id_sequence\` - ID-Generator
- \`page_registry\` - Seiten-Verwaltung
- \`segment_registry\` - Segmente
- \`page_content\` - Inhalte
- \`page_content_backups\` - Backup-System
- \`media_folders\` - Medien-Ordner
- \`file_segment_mappings\` - Datei-Segment-Zuordnungen
- \`navigation_links\` - Navigation (Legacy)
- \`glossary\` - Übersetzungs-Glossar
- \`redirects\` - URL-Weiterleitungen

**Content-Module (je nach Feature-Flags):**
- \`news_articles\` - News-Modul
- \`events\` + \`event_registrations\` - Events-Modul
- \`products\` - Produkte-Modul
- \`downloads\` + \`download_requests\` - Downloads-Modul
- \`newsletter_subscriptions\` - Newsletter-Modul
- \`contact_submissions\` - Kontaktformular
- \`backlog_tasks\` - Backlog/Tasks

---

## Phase 5: Konfiguration anpassen

### siteConfig.ts anpassen

\`\`\`typescript
// Tenant-spezifische Werte
tenant: {
  id: 'aftermarket-update',
  name: 'Aftermarket Update',
  legalName: 'Aftermarket Update Media GmbH',
  tagline: 'Das Fachportal für den freien Kfz-Teilehandel',
  // ...
}

// Feature-Flags aktivieren/deaktivieren
features: {
  enabledModules: ['news', 'newsletter', 'events'], // Keine 'products'
  // ...
}

// Branding
branding: {
  logos: {
    primary: '/logos/aftermarket-update-logo.svg',
    // ...
  },
  colors: {
    primary: '220 14% 28%',  // Newspaper-Look (HSL!)
    accent: '43 96% 56%',    // Gelb-Akzent
    // ...
  },
  fonts: {
    heading: 'Playfair Display',
    body: 'Source Sans Pro',
  }
}
\`\`\`

### Logos hochladen

\`\`\`
public/logos/aftermarket-update-logo.svg
public/logos/aftermarket-update-logo-dark.svg
public/favicon.ico
\`\`\`

---

## Phase 6: Edge Functions konfigurieren

### config.toml anpassen

\`\`\`toml
project_id = "NEUE_SUPABASE_PROJECT_ID"

[functions.lookup-username]
verify_jwt = false

[functions.admin-create-user]
verify_jwt = false

[functions.upload-image]
verify_jwt = false

[functions.generate-og-image]
verify_jwt = false

# ... weitere Functions nach Bedarf
\`\`\`

### Secrets konfigurieren (in Lovable Settings → Secrets)

| Secret | Benötigt für | Pflicht? |
|--------|-------------|----------|
| \`MAUTIC_BASE_URL\` | Mautic-Integration | Nein |
| \`MAUTIC_USER\` | Mautic-Integration | Nein |
| \`MAUTIC_PASS\` | Mautic-Integration | Nein |
| \`RESEND_API_KEY\` | E-Mail-Versand | Nein |
| \`SISTRIX_API_KEY\` | SEO-Tools | Nein |
| \`FIRECRAWL_API_KEY\` | Web-Scraping | Nein |

**Hinweis:** Nur Secrets eintragen, die für aktivierte Integrationen benötigt werden!

---

## Phase 7: Storage Buckets erstellen

In Lovable Cloud → Storage:

| Bucket | Public? | Beschreibung |
|--------|---------|--------------|
| \`page-images\` | Ja | Seiten-Bilder |
| \`cms-media\` | Ja | CMS-Medien |
| \`user-uploads\` | Nein | Private Uploads |

---

## Phase 8: Ersten Admin-User anlegen

1. Registrierung über \`/auth\` durchführen
2. User-UUID aus der \`auth.users\` Tabelle kopieren
3. Admin-Rolle zuweisen:

\`\`\`sql
INSERT INTO user_roles (user_id, role)
VALUES ('USER_UUID_HIER', 'admin');
\`\`\`

---

## Phase 9: Initiale Seiten anlegen

Mindestens diese Einträge in \`page_registry\`:

\`\`\`sql
INSERT INTO page_registry (page_id, page_slug, page_title, status, nav_visible)
VALUES 
  (1, 'home', 'Startseite', 'published', true),
  (2, 'news', 'News', 'published', true),
  (3, 'contact', 'Kontakt', 'published', true);
\`\`\`

---

## Phase 10: Verifizierung

- [ ] Login als Admin funktioniert
- [ ] Dashboard ist erreichbar (\`/admin\`)
- [ ] Seiten-Editor funktioniert
- [ ] Segment-Erstellung funktioniert
- [ ] Frontend-Editing (\`?edit=true\`) funktioniert
- [ ] Branding (Logo, Farben) korrekt angezeigt
- [ ] Feature-Flags werden respektiert (keine deaktivierten Module sichtbar)
- [ ] Navigation zeigt korrekte Seiten

---

## Phase 11: Go-Live Checkliste

- [ ] Domain verbinden (Settings → Domains)
- [ ] SSL-Zertifikat aktiv
- [ ] SEO-Defaults in siteConfig geprüft
- [ ] Favicon & OG-Images hochgeladen
- [ ] Impressum & Datenschutz angelegt
- [ ] Cookie-Banner konfiguriert (wenn benötigt)
- [ ] Analytics eingerichtet (wenn gewünscht)
- [ ] Produktiv-Publish durchführen

---

## NIEMALS synchronisieren

Diese Dateien/Ordner sind **tenant-spezifisch** und dürfen NIE vom Haupt-Projekt überschrieben werden:

| Datei/Ordner | Grund |
|--------------|-------|
| \`src/config/siteConfig.ts\` | Tenant-Branding & Feature-Flags |
| \`supabase/migrations/\` | Eigene Datenbank-Struktur |
| \`.env\` | Eigene Secrets |
| \`public/logos/\` | Tenant-Logos |
| \`supabase/config.toml\` (project_id) | Eigene Supabase-Instanz |
| Datenbank-Inhalte | Tenant-Content |

---

## Geschätzte Zeit

| Phase | Dauer |
|-------|-------|
| Projekt erstellen | 2 Min |
| Config-Dateien hochladen | 5 Min |
| Core-Ordner kopieren | 15 Min |
| DB-Migration ausführen | 10 Min |
| Konfiguration anpassen | 15 Min |
| Edge Functions & Secrets | 10 Min |
| Admin einrichten | 5 Min |
| Initiale Seiten | 10 Min |
| Verifizierung | 10 Min |
| **Gesamt** | **~80 Min** |

---

## Wartung & Updates

Siehe \`TENANT_UPDATE_CHECKLIST.md\` für das Protokoll bei Core-Updates.

Bei Updates des Haupt-Projekts:
1. Changelog prüfen
2. Core-Ordner aktualisieren (components, hooks, lib)
3. Neue Migrations separat ausführen
4. Kompatibilität testen
`;

const DATABASE_MIGRATION_CONTENT = `-- ============================================
-- SPADE CMS - Tenant Database Migration
-- Version: 1.1.2
-- ============================================
-- Diese Migration erstellt alle notwendigen Tabellen,
-- RLS-Policies und Funktionen für ein neues Tenant-Projekt.
-- 
-- WICHTIG: In Lovable Cloud ausführen über das Migration-Tool
-- oder direkt im SQL-Editor.
-- ============================================

-- ============================================
-- PHASE 1: ENUM-TYPEN
-- ============================================

-- App-Rollen Enum
DO $$ BEGIN
    CREATE TYPE app_role AS ENUM ('admin', 'user', 'editor');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================
-- PHASE 2: HILFSFUNKTIONEN
-- ============================================

-- Funktion: Rolle prüfen
CREATE OR REPLACE FUNCTION public.has_role(_role app_role, _user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Funktion: Nächste Page-ID generieren
CREATE OR REPLACE FUNCTION public.get_next_page_id()
RETURNS integer AS $$
DECLARE
  next_id integer;
BEGIN
  UPDATE page_id_sequence
  SET last_used_page_id = last_used_page_id + 1,
      updated_at = now()
  WHERE id = 1
  RETURNING last_used_page_id INTO next_id;
  
  RETURN next_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ============================================
-- PHASE 3: CORE-TABELLEN
-- ============================================

-- Profiles (User-Erweiterung)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY,
  email text NOT NULL,
  full_name text,
  username text,
  created_at timestamptz DEFAULT now()
);

-- User Roles
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role app_role NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- User SEO Permissions
CREATE TABLE IF NOT EXISTS public.user_seo_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  seo_basic boolean DEFAULT false,
  seo_social boolean DEFAULT false,
  seo_advanced boolean DEFAULT false,
  seo_enterprise boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Editor Page Access
CREATE TABLE IF NOT EXISTS public.editor_page_access (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  page_slug text NOT NULL,
  language_code text,
  can_draft boolean DEFAULT true,
  can_publish boolean DEFAULT false,
  frontend_editing_enabled boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Page ID Sequence
CREATE TABLE IF NOT EXISTS public.page_id_sequence (
  id integer PRIMARY KEY DEFAULT 1,
  last_used_page_id integer NOT NULL DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);

-- Initial sequence row
INSERT INTO page_id_sequence (id, last_used_page_id)
VALUES (1, 100)
ON CONFLICT (id) DO NOTHING;

-- Page Registry
CREATE TABLE IF NOT EXISTS public.page_registry (
  id serial PRIMARY KEY,
  page_id integer NOT NULL,
  page_slug text NOT NULL UNIQUE,
  page_title text NOT NULL,
  parent_id integer,
  parent_slug text,
  position integer,
  design_icon text,
  flyout_image_url text,
  flyout_description text,
  flyout_description_translations jsonb DEFAULT '{}'::jsonb,
  title_translations jsonb DEFAULT '{}'::jsonb,
  cta_group text,
  cta_label text,
  cta_icon text,
  target_page_slug text,
  status text NOT NULL DEFAULT 'published',
  nav_category text DEFAULT 'main',
  nav_visible boolean DEFAULT true,
  nav_position integer,
  frontend_editing_enabled boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Segment Registry
CREATE TABLE IF NOT EXISTS public.segment_registry (
  id serial PRIMARY KEY,
  page_slug text NOT NULL,
  segment_id integer NOT NULL,
  segment_type text NOT NULL,
  segment_key text NOT NULL,
  position integer,
  is_static boolean DEFAULT false,
  deleted boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Page Content
CREATE TABLE IF NOT EXISTS public.page_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_slug text NOT NULL,
  section_key text NOT NULL,
  content_type text NOT NULL,
  content_value text NOT NULL,
  language text NOT NULL DEFAULT 'en',
  content_status text NOT NULL DEFAULT 'approved',
  draft_value text,
  import_stage integer DEFAULT 1,
  updated_at timestamptz DEFAULT now(),
  updated_by uuid,
  approved_at timestamptz,
  approved_by uuid
);

-- Page Content Backups
CREATE TABLE IF NOT EXISTS public.page_content_backups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_slug text NOT NULL,
  section_key text NOT NULL,
  content_type text NOT NULL,
  content_value text NOT NULL,
  language text NOT NULL DEFAULT 'en',
  original_updated_at timestamptz,
  original_updated_by uuid,
  backup_created_at timestamptz DEFAULT now()
);

-- Media Folders
CREATE TABLE IF NOT EXISTS public.media_folders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  storage_path text NOT NULL,
  parent_id uuid REFERENCES media_folders(id),
  position integer DEFAULT 999,
  created_by uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- File Segment Mappings
CREATE TABLE IF NOT EXISTS public.file_segment_mappings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  file_path text NOT NULL,
  bucket_id text NOT NULL DEFAULT 'page-images',
  segment_ids text[] NOT NULL,
  alt_text text,
  alt_text_translations jsonb DEFAULT '{}'::jsonb,
  visibility text NOT NULL DEFAULT 'public',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Navigation Links (Legacy-Support)
CREATE TABLE IF NOT EXISTS public.navigation_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL,
  label_key text NOT NULL,
  language text NOT NULL,
  category text NOT NULL,
  parent_category text,
  parent_label text,
  description text,
  icon_key text,
  target_page_slug text,
  position integer DEFAULT 0,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Glossary
CREATE TABLE IF NOT EXISTS public.glossary (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  term text NOT NULL,
  term_type text NOT NULL,
  context text,
  translations jsonb DEFAULT '{}'::jsonb,
  created_by uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Redirects
CREATE TABLE IF NOT EXISTS public.redirects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_url text NOT NULL,
  target_url text NOT NULL,
  redirect_type integer NOT NULL DEFAULT 301,
  is_active boolean NOT NULL DEFAULT true,
  notes text,
  created_by uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================
-- PHASE 4: CONTENT-MODULE TABELLEN
-- ============================================

-- News Articles
CREATE TABLE IF NOT EXISTS public.news_articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  teaser text NOT NULL,
  content text NOT NULL,
  image_url text NOT NULL,
  category text,
  author text,
  date date NOT NULL DEFAULT CURRENT_DATE,
  language text NOT NULL DEFAULT 'en',
  visibility text NOT NULL DEFAULT 'public',
  published boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Events
CREATE TABLE IF NOT EXISTS public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  teaser text NOT NULL,
  description text,
  image_url text NOT NULL,
  date date NOT NULL,
  time_start text NOT NULL,
  time_end text,
  location_city text NOT NULL,
  location_country text NOT NULL,
  location_venue text,
  location_coordinates point,
  category text NOT NULL DEFAULT 'Workshop',
  language_code text NOT NULL DEFAULT 'EN',
  external_url text,
  is_online boolean DEFAULT false,
  max_participants integer,
  registration_deadline date,
  visibility text NOT NULL DEFAULT 'public',
  published boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Event Registrations
CREATE TABLE IF NOT EXISTS public.event_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_slug text NOT NULL DEFAULT '',
  event_title text NOT NULL,
  event_date text NOT NULL,
  event_location text NOT NULL,
  evt_image_url text,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL,
  company text NOT NULL,
  position text NOT NULL,
  phone text,
  industry text,
  current_test_systems text,
  automotive_interests text[],
  created_at timestamptz DEFAULT now()
);

-- Products (optional - je nach Feature-Flag)
CREATE TABLE IF NOT EXISTS public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  teaser text NOT NULL,
  description text,
  image_url text NOT NULL,
  category text NOT NULL DEFAULT 'Test Charts',
  subcategory text,
  sku text,
  price_info text,
  availability text DEFAULT 'available',
  language_code text NOT NULL DEFAULT 'EN',
  visibility text NOT NULL DEFAULT 'public',
  video_url text,
  specifications jsonb DEFAULT '{}'::jsonb,
  features jsonb DEFAULT '[]'::jsonb,
  applications jsonb DEFAULT '[]'::jsonb,
  related_products jsonb DEFAULT '[]'::jsonb,
  gallery_images jsonb DEFAULT '[]'::jsonb,
  documents jsonb DEFAULT '[]'::jsonb,
  chart_sizes jsonb DEFAULT '[]'::jsonb,
  product_types jsonb DEFAULT '[]'::jsonb,
  measurement_focus jsonb DEFAULT '[]'::jsonb,
  format_fov jsonb DEFAULT '[]'::jsonb,
  integration_features jsonb DEFAULT '[]'::jsonb,
  display_badges jsonb DEFAULT '[]'::jsonb,
  position integer DEFAULT 999,
  published boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Downloads
CREATE TABLE IF NOT EXISTS public.downloads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  teaser text NOT NULL,
  description text,
  download_type text NOT NULL,
  category text,
  download_url text,
  image_url text,
  duration text,
  pages integer,
  language_code text NOT NULL DEFAULT 'EN',
  visibility text NOT NULL DEFAULT 'public',
  position integer DEFAULT 999,
  publish_date date NOT NULL DEFAULT CURRENT_DATE,
  published boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Download Requests
CREATE TABLE IF NOT EXISTS public.download_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL,
  company text NOT NULL,
  position text NOT NULL,
  download_type text NOT NULL,
  item_id text NOT NULL,
  item_title text NOT NULL,
  category_tag text,
  title_tag text,
  dl_type text,
  dl_title text,
  dl_url text,
  consent boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Newsletter Subscriptions
CREATE TABLE IF NOT EXISTS public.newsletter_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  email text NOT NULL UNIQUE,
  topics text[] DEFAULT '{}',
  language text DEFAULT 'en',
  mautic_contact_id text,
  confirmed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Contact Submissions
CREATE TABLE IF NOT EXISTS public.contact_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL,
  phone text,
  subject text NOT NULL,
  message text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Backlog Tasks
CREATE TABLE IF NOT EXISTS public.backlog_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'todo',
  priority text NOT NULL DEFAULT 'medium',
  category text,
  assigned_to uuid,
  created_by uuid NOT NULL DEFAULT auth.uid(),
  due_date timestamptz,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================
-- PHASE 5: RLS AKTIVIEREN
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_seo_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE editor_page_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_id_sequence ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE segment_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_content_backups ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_segment_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE navigation_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE glossary ENABLE ROW LEVEL SECURITY;
ALTER TABLE redirects ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE download_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE backlog_tasks ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PHASE 6: RLS POLICIES
-- ============================================

-- Profiles Policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON profiles FOR SELECT USING (has_role('admin', auth.uid()));
CREATE POLICY "Admins can manage all profiles" ON profiles FOR UPDATE USING (has_role('admin', auth.uid()));

-- User Roles Policies
CREATE POLICY "Users can view their own roles" ON user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all user roles" ON user_roles FOR SELECT USING (has_role('admin', auth.uid()));
CREATE POLICY "Allow creating first admin or admins can manage" ON user_roles FOR INSERT 
  WITH CHECK ((NOT EXISTS (SELECT 1 FROM user_roles WHERE role = 'admin')) OR has_role('admin', auth.uid()));
CREATE POLICY "Admins can update roles" ON user_roles FOR UPDATE USING (has_role('admin', auth.uid()));
CREATE POLICY "Admins can delete roles" ON user_roles FOR DELETE USING (has_role('admin', auth.uid()));

-- User SEO Permissions Policies
CREATE POLICY "Users can read own SEO permissions" ON user_seo_permissions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can read all SEO permissions" ON user_seo_permissions FOR SELECT USING (has_role('admin', auth.uid()));
CREATE POLICY "Admins can insert SEO permissions" ON user_seo_permissions FOR INSERT WITH CHECK (has_role('admin', auth.uid()));
CREATE POLICY "Admins can update SEO permissions" ON user_seo_permissions FOR UPDATE USING (has_role('admin', auth.uid()));
CREATE POLICY "Admins can delete SEO permissions" ON user_seo_permissions FOR DELETE USING (has_role('admin', auth.uid()));

-- Editor Page Access Policies
CREATE POLICY "Editors can view their own page access" ON editor_page_access FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage editor page access" ON editor_page_access FOR ALL USING (has_role('admin', auth.uid()));

-- Page ID Sequence Policies
CREATE POLICY "Allow authenticated users to read page_id_sequence" ON page_id_sequence FOR SELECT USING (true);
CREATE POLICY "Allow authenticated users to update page_id_sequence" ON page_id_sequence FOR UPDATE USING (true) WITH CHECK (true);

-- Page Registry Policies
CREATE POLICY "Anyone can view page registry" ON page_registry FOR SELECT USING (true);
CREATE POLICY "Admins can insert page registry" ON page_registry FOR INSERT WITH CHECK (has_role('admin', auth.uid()));
CREATE POLICY "Admins and editors can update page registry" ON page_registry FOR UPDATE 
  USING (has_role('admin', auth.uid()) OR has_role('editor', auth.uid()));
CREATE POLICY "Admins can delete page registry" ON page_registry FOR DELETE USING (has_role('admin', auth.uid()));

-- Segment Registry Policies
CREATE POLICY "Anyone can view segment registry" ON segment_registry FOR SELECT USING (true);
CREATE POLICY "Admins can manage segment registry" ON segment_registry FOR ALL USING (has_role('admin', auth.uid()));
CREATE POLICY "Editors can manage segments for their pages" ON segment_registry FOR ALL
  USING (has_role('editor', auth.uid()) AND (
    EXISTS (SELECT 1 FROM editor_page_access WHERE user_id = auth.uid() AND page_slug = '__all__')
    OR EXISTS (SELECT 1 FROM editor_page_access WHERE user_id = auth.uid() AND page_slug = '__global__')
    OR page_slug IN (SELECT epa.page_slug FROM editor_page_access epa WHERE epa.user_id = auth.uid() AND epa.page_slug NOT IN ('__global__', '__all__'))
  ))
  WITH CHECK (has_role('editor', auth.uid()) AND (
    EXISTS (SELECT 1 FROM editor_page_access WHERE user_id = auth.uid() AND page_slug = '__all__')
    OR EXISTS (SELECT 1 FROM editor_page_access WHERE user_id = auth.uid() AND page_slug = '__global__')
    OR page_slug IN (SELECT epa.page_slug FROM editor_page_access epa WHERE epa.user_id = auth.uid() AND epa.page_slug NOT IN ('__global__', '__all__'))
  ));

-- Page Content Policies
CREATE POLICY "Anyone can view page content" ON page_content FOR SELECT USING (true);
CREATE POLICY "Admins and editors can insert page content" ON page_content FOR INSERT 
  WITH CHECK (has_role('admin', auth.uid()) OR (has_role('editor', auth.uid()) AND (
    EXISTS (SELECT 1 FROM editor_page_access WHERE user_id = auth.uid() AND page_slug = '__global__' AND language_code = page_content.language)
    OR page_slug IN (SELECT epa.page_slug FROM editor_page_access epa WHERE epa.user_id = auth.uid() AND epa.page_slug <> '__global__')
    OR EXISTS (SELECT 1 FROM editor_page_access WHERE user_id = auth.uid() AND page_slug = '__all__')
  )));
CREATE POLICY "Admins and editors can update page content" ON page_content FOR UPDATE 
  USING (has_role('admin', auth.uid()) OR (has_role('editor', auth.uid()) AND (
    EXISTS (SELECT 1 FROM editor_page_access WHERE user_id = auth.uid() AND page_slug = '__global__' AND language_code = page_content.language)
    OR page_slug IN (SELECT epa.page_slug FROM editor_page_access epa WHERE epa.user_id = auth.uid() AND epa.page_slug <> '__global__')
    OR EXISTS (SELECT 1 FROM editor_page_access WHERE user_id = auth.uid() AND page_slug = '__all__')
  )));
CREATE POLICY "Admins and editors can delete page content" ON page_content FOR DELETE 
  USING (has_role('admin', auth.uid()) OR (has_role('editor', auth.uid()) AND (
    EXISTS (SELECT 1 FROM editor_page_access WHERE user_id = auth.uid() AND page_slug = '__global__' AND language_code = page_content.language)
    OR page_slug IN (SELECT epa.page_slug FROM editor_page_access epa WHERE epa.user_id = auth.uid() AND epa.page_slug <> '__global__')
    OR EXISTS (SELECT 1 FROM editor_page_access WHERE user_id = auth.uid() AND page_slug = '__all__')
  )));

-- Page Content Backups Policies
CREATE POLICY "Admins and editors can view backups" ON page_content_backups FOR SELECT 
  USING (has_role('admin', auth.uid()) OR has_role('editor', auth.uid()));
CREATE POLICY "Admins and editors can create backups" ON page_content_backups FOR INSERT 
  WITH CHECK (has_role('admin', auth.uid()) OR has_role('editor', auth.uid()));
CREATE POLICY "Admins can delete old backups" ON page_content_backups FOR DELETE 
  USING (has_role('admin', auth.uid()));

-- Media Folders Policies
CREATE POLICY "Anyone can view media folders" ON media_folders FOR SELECT USING (true);
CREATE POLICY "Admins and editors can manage media folders" ON media_folders FOR ALL 
  USING (has_role('admin', auth.uid()) OR has_role('editor', auth.uid()));

-- File Segment Mappings Policies
CREATE POLICY "Anyone can view file mappings" ON file_segment_mappings FOR SELECT USING (true);
CREATE POLICY "Admins and editors can manage file mappings" ON file_segment_mappings FOR ALL 
  USING (has_role('admin', auth.uid()) OR has_role('editor', auth.uid()));

-- Navigation Links Policies
CREATE POLICY "Anyone can view navigation links" ON navigation_links FOR SELECT USING (true);
CREATE POLICY "Admins and editors can manage navigation links" ON navigation_links FOR ALL 
  USING (has_role('admin', auth.uid()) OR has_role('editor', auth.uid()));

-- Glossary Policies
CREATE POLICY "Anyone can view glossary" ON glossary FOR SELECT USING (true);
CREATE POLICY "Admins and editors can manage glossary" ON glossary FOR ALL 
  USING (has_role('admin', auth.uid()) OR has_role('editor', auth.uid()));

-- Redirects Policies
CREATE POLICY "Anyone can view active redirects" ON redirects FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage all redirects" ON redirects FOR ALL USING (has_role('admin', auth.uid()));

-- News Articles Policies
CREATE POLICY "Anyone can view published news" ON news_articles FOR SELECT USING (published = true);
CREATE POLICY "Admins can manage all news" ON news_articles FOR ALL USING (has_role('admin', auth.uid()));

-- Events Policies
CREATE POLICY "Anyone can view published events" ON events FOR SELECT USING (published = true);
CREATE POLICY "Admins can manage all events" ON events FOR ALL USING (has_role('admin', auth.uid()));

-- Event Registrations Policies
CREATE POLICY "Anyone can insert event registrations" ON event_registrations FOR INSERT WITH CHECK (true);
CREATE POLICY "Only admins can view event registrations" ON event_registrations FOR SELECT 
  USING (has_role('admin', auth.uid()));

-- Products Policies
CREATE POLICY "Anyone can view published products" ON products FOR SELECT USING (published = true);
CREATE POLICY "Admins can manage all products" ON products FOR ALL USING (has_role('admin', auth.uid()));

-- Downloads Policies
CREATE POLICY "Anyone can view published downloads" ON downloads FOR SELECT USING (published = true);
CREATE POLICY "Admins can manage all downloads" ON downloads FOR ALL USING (has_role('admin', auth.uid()));

-- Download Requests Policies
CREATE POLICY "Anyone can insert download requests" ON download_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Only admins can view download requests" ON download_requests FOR SELECT 
  USING (has_role('admin', auth.uid()));

-- Newsletter Subscriptions Policies
CREATE POLICY "Anyone can subscribe to newsletter" ON newsletter_subscriptions FOR INSERT WITH CHECK (true);
CREATE POLICY "Only admins can view newsletter subscriptions" ON newsletter_subscriptions FOR SELECT 
  USING (has_role('admin', auth.uid()));
CREATE POLICY "Only admins can update newsletter subscriptions" ON newsletter_subscriptions FOR UPDATE 
  USING (has_role('admin', auth.uid()));
CREATE POLICY "Only admins can delete newsletter subscriptions" ON newsletter_subscriptions FOR DELETE 
  USING (has_role('admin', auth.uid()));

-- Contact Submissions Policies
CREATE POLICY "Anyone can insert contact submissions" ON contact_submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "Only admins can view contact submissions" ON contact_submissions FOR SELECT 
  USING (has_role('admin', auth.uid()));

-- Backlog Tasks Policies
CREATE POLICY "Block anonymous access to backlog tasks" ON backlog_tasks FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can view their own or assigned tasks" ON backlog_tasks FOR SELECT 
  USING (auth.uid() = created_by OR auth.uid() = assigned_to);
CREATE POLICY "Admins can view all backlog tasks" ON backlog_tasks FOR SELECT USING (has_role('admin', auth.uid()));
CREATE POLICY "Users can create backlog tasks" ON backlog_tasks FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update their own or assigned tasks" ON backlog_tasks FOR UPDATE 
  USING (auth.uid() = created_by OR auth.uid() = assigned_to);
CREATE POLICY "Admins can manage all backlog tasks" ON backlog_tasks FOR ALL USING (has_role('admin', auth.uid()));

-- ============================================
-- PHASE 7: STORAGE BUCKETS
-- ============================================

-- Diese müssen über die Lovable Cloud UI erstellt werden:
-- 1. page-images (public)
-- 2. cms-media (public)
-- 3. user-uploads (private)

-- ============================================
-- PHASE 8: TRIGGER FÜR PROFILE-ERSTELLUNG
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger erstellen (nur wenn nicht existiert)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- FERTIG!
-- ============================================
-- Nach Ausführung dieser Migration:
-- 1. Ersten User registrieren
-- 2. User-ID aus auth.users kopieren
-- 3. Admin-Rolle zuweisen:
--    INSERT INTO user_roles (user_id, role) VALUES ('USER_UUID', 'admin');
-- ============================================
`;

const FILES: Record<string, string> = {
  "src/config/siteConfig.ts": SITE_CONFIG_CONTENT,
  "src/config/index.ts": INDEX_CONTENT,
  "src/pages/Auth.tsx": AUTH_CONTENT,
  "src/components/admin/dashboard/roadmapConfig.ts": ROADMAP_CONTENT,
  "supabase/config.toml": CONFIG_TOML_CONTENT,
};

const DOCS_FILES: Record<string, string> = {
  "docs/TENANT_ONBOARDING_CHECKLIST.md": ONBOARDING_CHECKLIST_CONTENT,
  "docs/tenant-database-migration.sql": DATABASE_MIGRATION_CONTENT,
};

const INDEX_CSS_CONTENT = `@tailwind base;
@tailwind components;
@tailwind utilities;

/* Definition of the design system. All colors, gradients, fonts, etc should be defined here. 
All colors MUST be HSL.
*/

@layer base {
  :root {
    --background: 220 20% 6%;
    --foreground: 210 40% 98%;

    --card: 220 25% 8%;
    --card-foreground: 210 40% 98%;

    --popover: 220 25% 8%;
    --popover-foreground: 210 40% 98%;

    --primary: 211 77% 28%;
    --primary-foreground: 0 0% 100%;

    --secondary: 220 15% 12%;
    --secondary-foreground: 210 40% 98%;

    --muted: 220 15% 12%;
    --muted-foreground: 215 20% 65%;

    --accent: 211 77% 28%;
    --accent-foreground: 0 0% 100%;

    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;

    --border: 220 15% 15%;
    --input: 220 15% 15%;
    --ring: 211 77% 28%;

    /* Custom design tokens */
    --primary-glow: 211 77% 38%;
    --gradient-primary: linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary-glow)));
    --gradient-hero: linear-gradient(135deg, hsl(220 25% 8%) 0%, hsl(220 20% 10%) 50%, hsl(220 25% 8%) 100%);
    --gradient-card: linear-gradient(145deg, hsl(220 25% 9%), hsl(220 20% 11%));
    --shadow-glow: 0 0 40px hsl(var(--primary) / 0.15);
    --shadow-card: 0 8px 32px hsl(220 30% 3% / 0.3);
    --shadow-lift: 0 10px 40px hsl(220 30% 5% / 0.15);
    --transition-smooth: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    
    /* Light section tokens */
    --light-background: 30 15% 95%;
    --light-foreground: 30 8% 35%;
    --light-muted: 30 6% 55%;
    --light-card: 30 20% 97%;
    --light-border: 30 12% 88%;
    --accent-violet: 261 83% 65%;
    --accent-soft-blue: 215 100% 70%;
    
    /* Scandinavian design tokens */
    --scandi-grey: 220 6% 55%;
    --scandi-light-grey: 220 4% 88%;
    --scandi-white: 0 0% 100%;
    --shadow-soft: 0 4px 20px hsl(220 15% 20% / 0.06);
    --shadow-gentle: 0 2px 12px hsl(220 10% 40% / 0.08);
    --shadow-warm: 0 6px 25px hsl(220 8% 30% / 0.12);
    
    /* Navigation tokens */
    --nav-surface: 240 9% 96%;
    
    /* Downloads section tokens */
    --downloads-bg: 220 3% 98%;
    --downloads-text: 220 12% 20%;
    --downloads-border: 220 6% 92%;
    --downloads-hover: 220 3% 96%;

    /* Icon background tokens */
    --icon-camera: 215 30% 85%;
    --icon-camera-fg: 215 100% 45%;
    --icon-testing: 261 25% 85%;
    --icon-testing-fg: 261 83% 50%;
    --icon-performance: 193 28% 85%;
    --icon-performance-fg: 193 93% 45%;
    --icon-general: 220 18% 85%;
    --icon-general-fg: 220 60% 45%;
    
    /* Automotive button colors */
    --automotive-button: 77 56% 37%;
    --automotive-icon-bg: 77 30% 75%;
    --automotive-tests-bg: 77 30% 90%;
    --training-button: 45 95% 49%;
    --training-bg: 45 60% 85%;

    /* SEO button color */
    --seo-button: 34 96% 52%;
    
    /* Button variants */
    --decision-button: 77 56% 37%;
    --decision-icon-bg: 77 30% 75%;
    --academia-button: 45 95% 49%;
    --academia-button-hover: 45 95% 60%;
    --academia-icon-bg: 45 60% 85%;

    /* Events & Products buttons */
    --events-button: 211 77% 42%;
    --accent-blue: 195 85% 45%;
    
    /* Admin dashboard control buttons */
    --admin-control-1: 48 96% 46%;
    --admin-control-2: 48 96% 54%;
    --admin-control-3: 48 96% 62%;

    /* Admin utility buttons */
    --admin-utility-1: 280 86% 60%;
    --admin-utility-2: 190 90% 45%;
    --admin-utility-3: 340 82% 58%;
    
    /* Hotspot color */
    --hotspot-primary: 205 45% 44%;
    
    /* Standard Yellow #f9dc24 */
    --explore-button: 52 95% 56%;
    --orange: 52 95% 56%;
    --orange-foreground: 0 0% 0%;
    --orange-accent: 52 95% 56%;
    --orange-accent-foreground: 0 0% 0%;
    --yellow: 52 95% 56%;
    --yellow-foreground: 0 0% 0%;

    --radius: 0.5rem;

    --sidebar-background: 0 0% 98%;
    --sidebar-foreground: 240 5.3% 26.1%;
    --sidebar-primary: 240 5.9% 10%;
    --sidebar-primary-foreground: 0 0% 98%;
    --sidebar-accent: 240 4.8% 95.9%;
    --sidebar-accent-foreground: 240 5.9% 10%;
    --sidebar-border: 220 13% 91%;
    --sidebar-ring: 217.2 91.2% 59.8%;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 210 40% 98%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 212.7 26.8% 83.9%;
    --sidebar-background: 240 5.9% 10%;
    --sidebar-foreground: 240 4.8% 95.9%;
    --sidebar-primary: 224.3 76.3% 48%;
    --sidebar-primary-foreground: 0 0% 100%;
    --sidebar-accent: 240 3.7% 15.9%;
    --sidebar-accent-foreground: 240 4.8% 95.9%;
    --sidebar-border: 240 3.7% 15.9%;
    --sidebar-ring: 217.2 91.2% 59.8%;
  }
}

@layer base {
  * { @apply border-border; }
  html { scroll-behavior: smooth; }
  body { @apply bg-background text-foreground; }
}

@layer utilities {
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .line-clamp-3 {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
}
`;

const TAILWIND_CONFIG_CONTENT = `import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: { '2xl': '1400px' }
    },
    extend: {
      fontFamily: {
        'roboto': ['Roboto', 'sans-serif'],
        'roboto-thin': ['Roboto', 'sans-serif'],
        'roboto-regular': ['Roboto', 'sans-serif'],
        'roboto-bold': ['Roboto', 'sans-serif'],
      },
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
          glow: 'hsl(var(--primary-glow))'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
        light: {
          background: 'hsl(var(--light-background))',
          foreground: 'hsl(var(--light-foreground))',
          muted: 'hsl(var(--light-muted))',
          card: 'hsl(var(--light-card))',
          border: 'hsl(var(--light-border))'
        },
        'accent-violet': 'hsl(var(--accent-violet))',
        'accent-soft-blue': 'hsl(var(--accent-soft-blue))',
        'soft-blue': 'hsl(var(--accent-soft-blue))',
        scandi: {
          grey: 'hsl(var(--scandi-grey))',
          'light-grey': 'hsl(var(--scandi-light-grey))',
          white: 'hsl(var(--scandi-white))'
        },
        nav: { surface: 'hsl(var(--nav-surface))' },
        downloads: {
          bg: 'hsl(var(--downloads-bg))',
          text: 'hsl(var(--downloads-text))',
          border: 'hsl(var(--downloads-border))',
          hover: 'hsl(var(--downloads-hover))'
        },
        icon: {
          camera: 'hsl(var(--icon-camera))',
          'camera-fg': 'hsl(var(--icon-camera-fg))',
          testing: 'hsl(var(--icon-testing))',
          'testing-fg': 'hsl(var(--icon-testing-fg))',
          performance: 'hsl(var(--icon-performance))',
          'performance-fg': 'hsl(var(--icon-performance-fg))',
          general: 'hsl(var(--icon-general))',
          'general-fg': 'hsl(var(--icon-general-fg))'
        },
        automotive: {
          button: 'hsl(var(--automotive-button))',
          'icon-bg': 'hsl(var(--automotive-icon-bg))',
          'tests-bg': 'hsl(var(--automotive-tests-bg))'
        },
        yellow: {
          DEFAULT: 'hsl(var(--yellow))',
          foreground: 'hsl(var(--yellow-foreground))'
        },
        training: {
          button: 'hsl(var(--training-button))',
          bg: 'hsl(var(--training-bg))'
        },
        decision: {
          button: 'hsl(var(--decision-button))',
          'icon-bg': 'hsl(var(--decision-icon-bg))'
        },
        academia: {
          button: 'hsl(var(--academia-button))',
          'icon-bg': 'hsl(var(--academia-icon-bg))'
        },
        hotspot: { primary: 'hsl(var(--hotspot-primary))' },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))'
        }
      },
      backgroundImage: {
        'gradient-primary': 'var(--gradient-primary)',
        'gradient-hero': 'var(--gradient-hero)',
        'gradient-card': 'var(--gradient-card)'
      },
      boxShadow: {
        'glow': 'var(--shadow-glow)',
        'card': 'var(--shadow-card)',
        'lift': 'var(--shadow-lift)',
        'soft': 'var(--shadow-soft)',
        'gentle': 'var(--shadow-gentle)',
        'warm': 'var(--shadow-warm)'
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },
      keyframes: {
        'accordion-down': { from: { height: '0' }, to: { height: 'var(--radix-accordion-content-height)' } },
        'accordion-up': { from: { height: 'var(--radix-accordion-content-height)' }, to: { height: '0' } },
        'slide-in-up': { "0%": { transform: "translateY(20px)", opacity: "0" }, "100%": { transform: "translateY(0)", opacity: "1" } },
        'fade-in': { "0%": { opacity: "0", transform: "scale(1.05)" }, "100%": { opacity: "1", transform: "scale(1)" } },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'slide-in-up': 'slide-in-up 0.4s ease-out',
        'fade-in': 'fade-in 1.2s ease-out',
      }
    }
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;`;

const STYLING_FILES: Record<string, string> = {
  "src/index.css": INDEX_CSS_CONTENT,
  "tailwind.config.ts": TAILWIND_CONFIG_CONTENT,
};

const FOLDER_STRUCTURE = `aftermarket-update/
├── docs/
│   ├── TENANT_ONBOARDING_CHECKLIST.md  📋 Setup-Guide
│   └── tenant-database-migration.sql   🗄️ DB-Migration
├── src/
│   ├── config/
│   │   ├── siteConfig.ts      ✅ Tenant-Konfiguration
│   │   └── index.ts           ✅ Exports
│   ├── pages/
│   │   └── Auth.tsx           ✅ Login-Seite
│   ├── components/
│   │   └── admin/dashboard/
│   │       └── roadmapConfig.ts  ✅ CMS Version
│   ├── index.css              🎨 Design System
│   └── assets/
│       ├── spade-cms-logo.png    📦 Aus Haupt-Projekt
│       └── [dein-logo].svg       📦 Eigenes Logo
├── supabase/
│   ├── config.toml            ✅ Edge Function Config
│   └── functions/             📦 Aus Haupt-Projekt
├── tailwind.config.ts         🎨 Tailwind Tokens
└── README.md`;

const AftermarketDownload = () => {
  const [copiedFile, setCopiedFile] = useState<string | null>(null);

  const copyToClipboard = async (filename: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedFile(filename);
      toast.success(filename + " kopiert!");
      setTimeout(() => setCopiedFile(null), 2000);
    } catch (err) {
      toast.error("Kopieren fehlgeschlagen");
    }
  };

  const downloadFile = (filename: string, content: string) => {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename.split("/").pop() || filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(filename + " heruntergeladen!");
  };

  const downloadAll = () => {
    const allFiles = { ...FILES, ...DOCS_FILES, ...STYLING_FILES };
    Object.entries(allFiles).forEach(([filename, content], index) => {
      setTimeout(() => downloadFile(filename, content), index * 200);
    });
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            📦 Aftermarket Update - Projekt-Dateien
          </h1>
          <p className="text-zinc-400 text-lg">
            Alle Konfigurationsdateien für das neue Spade CMS Projekt
          </p>
        </div>

        <Card className="bg-zinc-900 border-zinc-800 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <FolderOpen className="h-5 w-5" />
              Ordnerstruktur
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-sm text-zinc-300 font-mono whitespace-pre overflow-x-auto">
              {FOLDER_STRUCTURE}
            </pre>
          </CardContent>
        </Card>

        <div className="flex justify-center mb-8">
          <Button 
            onClick={downloadAll}
            size="lg"
            className="bg-[#f9dc24] text-black hover:bg-[#f9dc24]/90"
          >
            <Download className="h-5 w-5 mr-2" />
            Alle Dateien herunterladen
          </Button>
        </div>

        {/* Dokumentation Sektion */}
        <Card className="bg-blue-950/30 border-blue-800 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              📚 Dokumentation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-zinc-300 mb-4">
              Diese beiden Dokumente sind essenziell für das Tenant-Onboarding:
            </p>
            <div className="space-y-3">
              {Object.entries(DOCS_FILES).map(([filename, content]) => (
                <div key={filename} className="flex items-center justify-between bg-zinc-900 p-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <FileCode className="h-4 w-4 text-blue-400" />
                    <span className="text-white font-mono text-sm">{filename}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(filename, content)}
                      className="border-zinc-700 hover:bg-zinc-800"
                    >
                      {copiedFile === filename ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadFile(filename, content)}
                      className="border-zinc-700 hover:bg-zinc-800"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Styling-Dateien Sektion */}
        <Card className="bg-purple-950/30 border-purple-800 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              🎨 Design System (Styling)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-zinc-300 mb-4">
              Diese Dateien definieren das komplette visuelle Design (Farben, Tokens, Animationen):
            </p>
            <div className="space-y-3">
              {Object.entries(STYLING_FILES).map(([filename, content]) => (
                <div key={filename} className="flex items-center justify-between bg-zinc-900 p-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <FileCode className="h-4 w-4 text-purple-400" />
                    <span className="text-white font-mono text-sm">{filename}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(filename, content)}
                      className="border-zinc-700 hover:bg-zinc-800"
                    >
                      {copiedFile === filename ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadFile(filename, content)}
                      className="border-zinc-700 hover:bg-zinc-800"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Config-Dateien Sektion */}
        <h2 className="text-xl font-bold text-white mb-4">⚙️ Konfigurationsdateien</h2>
        <div className="space-y-4">
          {Object.entries(FILES).map(([filename, content]) => (
            <Card key={filename} className="bg-zinc-900 border-zinc-800">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-white text-base">
                    <FileCode className="h-4 w-4 text-[#f9dc24]" />
                    {filename}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(filename, content)}
                      className="border-zinc-700 hover:bg-zinc-800"
                    >
                      {copiedFile === filename ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadFile(filename, content)}
                      className="border-zinc-700 hover:bg-zinc-800"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <pre className="text-xs text-zinc-400 font-mono bg-zinc-950 p-4 rounded-lg overflow-x-auto max-h-64">
                  {content.length > 600 ? content.slice(0, 600) + "\n\n... (weitere Zeilen)" : content}
                </pre>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="bg-zinc-900 border-zinc-800 mt-8">
          <CardHeader>
            <CardTitle className="text-white">📋 Nächste Schritte</CardTitle>
          </CardHeader>
          <CardContent className="text-zinc-300 space-y-2">
            <p>1. Lade die <strong>Onboarding-Checkliste</strong> herunter und folge den Schritten</p>
            <p>2. Führe die <strong>Datenbank-Migration</strong> im neuen Projekt aus</p>
            <p>3. Lade alle Config-Dateien herunter und kopiere sie ins neue Projekt</p>
            <p>4. Ersetze <code className="bg-zinc-800 px-1 rounded">DEINE_PROJECT_ID</code> in config.toml</p>
            <p>5. Lade dein Logo hoch</p>
            <p>6. Kopiere die Edge Functions aus dem Haupt-Projekt</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AftermarketDownload;
