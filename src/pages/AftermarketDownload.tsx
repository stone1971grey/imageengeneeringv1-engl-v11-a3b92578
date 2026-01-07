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

const FILES: Record<string, string> = {
  "src/config/siteConfig.ts": SITE_CONFIG_CONTENT,
  "src/config/index.ts": INDEX_CONTENT,
  "src/pages/Auth.tsx": AUTH_CONTENT,
  "src/components/admin/dashboard/roadmapConfig.ts": ROADMAP_CONTENT,
  "supabase/config.toml": CONFIG_TOML_CONTENT,
};

const FOLDER_STRUCTURE = `aftermarket-update/
├── src/
│   ├── config/
│   │   ├── siteConfig.ts      ✅ Tenant-Konfiguration
│   │   └── index.ts           ✅ Exports
│   ├── pages/
│   │   └── Auth.tsx           ✅ Login-Seite
│   ├── components/
│   │   └── admin/dashboard/
│   │       └── roadmapConfig.ts  ✅ CMS Version
│   └── assets/
│       ├── spade-cms-logo.png    📦 Aus Haupt-Projekt
│       └── [dein-logo].svg       📦 Eigenes Logo
├── supabase/
│   ├── config.toml            ✅ Edge Function Config
│   └── functions/             📦 Aus Haupt-Projekt
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
    Object.entries(FILES).forEach(([filename, content], index) => {
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
            <p>1. Lade alle Dateien herunter und kopiere sie ins neue Projekt</p>
            <p>2. Ersetze <code className="bg-zinc-800 px-1 rounded">DEINE_PROJECT_ID</code> in config.toml</p>
            <p>3. Lade dein Logo hoch</p>
            <p>4. Kopiere die Edge Functions aus dem Haupt-Projekt</p>
            <p>5. Kopiere <code className="bg-zinc-800 px-1 rounded">spade-cms-logo.png</code> aus dem Haupt-Projekt</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AftermarketDownload;
