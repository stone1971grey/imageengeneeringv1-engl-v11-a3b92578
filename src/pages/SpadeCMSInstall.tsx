import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Check, Copy, Download, FileCode, FolderOpen, Package, Database, Settings, Shield, Zap, BookOpen, CheckCircle2, AlertTriangle, Info, Layers } from "lucide-react";
import { toast } from "sonner";
import { PresetSelector } from "@/components/install/PresetSelector";
import { ConfigDashboard } from "@/components/admin/config";

// ============================================================================
// SPADE CMS INSTALLATION - COMPLETE EXPORT FILES
// Version: 1.1.2
// ============================================================================

// === SITE CONFIG TEMPLATE ===
const SITE_CONFIG_TEMPLATE = `/**
 * Site Configuration Template - Spade CMS v1.1.2
 * 
 * Diese Datei ist die zentrale Konfiguration für jeden Tenant.
 * Passe die Werte unten an dein Projekt an.
 */

export type AvailableLanguage = 'de' | 'en' | 'ja' | 'ko' | 'zh';

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
  tenant: {
    id: string;
    name: string;
    legalName: string;
    tagline: string;
  };
  branding: {
    logos: {
      primary: string;
      inverted?: string;
      icon?: string;
    };
    colors: {
      primary: string;
      primaryForeground: string;
      secondary: string;
      accent: string;
      background: string;
      foreground: string;
      muted: string;
      mutedForeground: string;
    };
    fonts: {
      heading: string;
      body: string;
    };
  };
  contact: {
    email: string;
    phone?: string;
    address?: {
      street: string;
      city: string;
      zip: string;
      country: string;
    };
  };
  social: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
    instagram?: string;
    youtube?: string;
  };
  seo: {
    defaultTitle: string;
    titleTemplate: string;
    defaultDescription: string;
    defaultOgImage?: string;
    twitterHandle?: string;
  };
  features: {
    modules: Record<FeatureModule, boolean>;
    languages: AvailableLanguage[];
    defaultLanguage: AvailableLanguage;
    frontendEditing: boolean;
  };
  integrations: {
    mautic?: { enabled: boolean; baseUrl?: string; };
    resend?: { enabled: boolean; fromEmail?: string; };
    analytics?: { enabled: boolean; googleAnalyticsId?: string; };
  };
  storage: {
    mediaBucket: string;
    publicBucket: string;
  };
}

// ============================================================================
// HIER ANPASSEN: Deine Tenant-Konfiguration
// ============================================================================

export const siteConfig: SiteConfig = {
  tenant: {
    id: 'dein-projekt-id',           // Eindeutige ID (slug-style)
    name: 'Dein Projektname',        // Anzeigename
    legalName: 'Deine Firma GmbH',   // Rechtlicher Name
    tagline: 'Dein Slogan hier',     // Tagline/Claim
  },
  branding: {
    logos: {
      primary: '/logos/dein-logo.svg',           // Hauptlogo (hell)
      inverted: '/logos/dein-logo-dark.svg',     // Logo für dunkle Hintergründe
      icon: '/favicon.svg',                       // Favicon/Icon
    },
    colors: {
      // WICHTIG: Alle Farben in HSL-Format!
      primary: '211 77% 28%',           // Hauptfarbe
      primaryForeground: '0 0% 100%',   // Text auf Hauptfarbe
      secondary: '220 15% 12%',         // Sekundärfarbe
      accent: '52 95% 56%',             // Akzentfarbe (z.B. Gelb)
      background: '220 20% 6%',         // Hintergrund
      foreground: '210 40% 98%',        // Text
      muted: '220 15% 12%',             // Gedämpfte Elemente
      mutedForeground: '215 20% 65%',   // Gedämpfter Text
    },
    fonts: {
      heading: 'Roboto, sans-serif',    // Überschriften-Font
      body: 'Roboto, sans-serif',       // Text-Font
    },
  },
  contact: {
    email: 'info@deinprojekt.de',
    phone: '+49 123 456789',
    address: {
      street: 'Musterstraße 1',
      city: 'München',
      zip: '80331',
      country: 'Deutschland',
    },
  },
  social: {
    linkedin: 'https://linkedin.com/company/dein-unternehmen',
    twitter: 'https://twitter.com/dein_handle',
  },
  seo: {
    defaultTitle: 'Dein Projektname',
    titleTemplate: '%s | Dein Projektname',
    defaultDescription: 'Beschreibung deines Projekts für Suchmaschinen.',
    defaultOgImage: '/og-image.jpg',
    twitterHandle: '@dein_handle',
  },
  features: {
    modules: {
      news: true,           // News-Modul aktivieren
      newsletter: true,     // Newsletter aktivieren
      contact: true,        // Kontaktformular aktivieren
      events: true,         // Events aktivieren
      downloads: true,      // Downloads aktivieren
      products: false,      // Produkte deaktivieren
      glossary: false,      // Glossar deaktivieren
      seoTools: false,      // SEO-Tools deaktivieren
    },
    languages: ['de', 'en'],        // Verfügbare Sprachen
    defaultLanguage: 'de',          // Standard-Sprache
    frontendEditing: true,          // Frontend-Editing aktivieren
  },
  integrations: {
    mautic: { enabled: false },
    resend: { enabled: true, fromEmail: 'noreply@deinprojekt.de' },
    analytics: { enabled: false },
  },
  storage: {
    mediaBucket: 'cms-media',
    publicBucket: 'public-assets',
  },
};

// ============================================================================
// Helper-Funktionen (nicht ändern)
// ============================================================================

export const isModuleEnabled = (module: FeatureModule): boolean => 
  siteConfig.features.modules[module] ?? false;

export const isLanguageAvailable = (lang: string): lang is AvailableLanguage => 
  siteConfig.features.languages.includes(lang as AvailableLanguage);

export const getPageTitle = (pageTitle?: string): string => 
  !pageTitle ? siteConfig.seo.defaultTitle : siteConfig.seo.titleTemplate.replace('%s', pageTitle);

export const getContactEmail = (): string => siteConfig.contact.email;
`;

// === CONFIG INDEX ===
const CONFIG_INDEX = `/**
 * Config Module Exports
 */
export { 
  siteConfig, 
  isModuleEnabled, 
  isLanguageAvailable, 
  getPageTitle, 
  getContactEmail,
  type SiteConfig, 
  type AvailableLanguage, 
  type FeatureModule,
} from './siteConfig';
`;

// === AUTH.TSX ===
const AUTH_CONTENT = `import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
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
  
  // Dynamisches Tenant-Logo aus siteConfig
  const tenantLogo = siteConfig.branding.logos.primary;
  const tenantName = siteConfig.tenant.name;

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setTimeout(() => {
          sessionStorage.removeItem("admin_selected_page");
          navigate("/" + siteConfig.features.defaultLanguage + "/admin-dashboard");
        }, 0);
      }
    });
    
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        sessionStorage.removeItem("admin_selected_page");
        navigate("/" + siteConfig.features.defaultLanguage + "/admin-dashboard");
      }
    });
    
    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    if (!loginIdentifier || !password) {
      toast.error("Bitte alle Felder ausfüllen");
      setLoading(false);
      return;
    }
    
    let emailToUse = loginIdentifier;
    
    // Username-Lookup falls kein @-Zeichen
    if (!loginIdentifier.includes('@')) {
      try {
        const { data, error } = await supabase.functions.invoke('lookup-username', {
          body: { username: loginIdentifier }
        });
        if (error || !data?.found || !data?.email) {
          toast.error("Benutzername nicht gefunden");
          setLoading(false);
          return;
        }
        emailToUse = data.email;
      } catch {
        toast.error("Fehler bei der Benutzersuche");
        setLoading(false);
        return;
      }
    }
    
    const { error } = await supabase.auth.signInWithPassword({
      email: emailToUse,
      password
    });
    
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Erfolgreich eingeloggt!");
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-zinc-900 border-zinc-800">
        <CardHeader className="space-y-4">
          {/* Spade CMS Logo + Version Badge */}
          <div className="flex justify-center">
            <div className="bg-white rounded-xl px-6 py-4 shadow-lg flex items-center justify-between gap-6 w-full">
              <img 
                src={spadeCmsLogo} 
                alt="SpadeCMS" 
                className="h-20 w-auto"
              />
              <Badge 
                variant="outline" 
                className="bg-[#4B7BF5] text-white border-[#4B7BF5] text-[10px] font-semibold px-2 py-0.5"
              >
                v{CMS_VERSION}
              </Badge>
            </div>
          </div>
          
          {/* Trennlinie */}
          <div className="border-t border-zinc-700 my-4" />
          
          {/* Tenant Logo (dynamisch aus siteConfig) */}
          <div className="flex justify-center">
            <img 
              src={tenantLogo} 
              alt={tenantName} 
              className="h-16 w-auto"
            />
          </div>
          
          <CardTitle className="text-2xl text-center text-white">Login</CardTitle>
          <CardDescription className="text-center text-zinc-400">
            Melden Sie sich an
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="loginIdentifier" className="text-zinc-300">
                Benutzername oder E-Mail
              </Label>
              <Input
                id="loginIdentifier"
                type="text"
                value={loginIdentifier}
                onChange={(e) => setLoginIdentifier(e.target.value)}
                disabled={loading}
                required
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-zinc-300">
                Passwort
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                  className="bg-zinc-800 border-zinc-700 text-white pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            
            <Button
              type="submit"
              className="w-full bg-[#f9dc24] text-black hover:bg-[#f9dc24]/90"
              disabled={loading}
            >
              {loading ? "Bitte warten..." : "Anmelden"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
`;

// === ROADMAP CONFIG ===
const ROADMAP_CONFIG = `export type FeatureStatus = 'done' | 'planned';
export type VersionStatus = 'released' | 'current' | 'planned' | 'complete';

export interface RoadmapFeature {
  label: string;
  status: FeatureStatus;
}

export interface RoadmapVersion {
  key: string;
  label: string;
  status: VersionStatus;
  features: RoadmapFeature[];
  isAdminOnly?: boolean;
}

export const CMS_VERSION = '1.1.2';

export const ROADMAP_VERSIONS: RoadmapVersion[] = [
  {
    key: 'v1.0',
    label: 'v1.0.0 – Release',
    status: 'released',
    features: [
      { label: 'Draft/Publish Workflow', status: 'done' },
      { label: 'Segment-Registry', status: 'done' },
      { label: 'Page-Registry', status: 'done' },
    ]
  },
  {
    key: 'v1.1',
    label: 'v1.1.2 – Current',
    status: 'current',
    features: [
      { label: 'News Management', status: 'done' },
      { label: 'Frontend Editing', status: 'done' },
      { label: 'Segment Auto-Save', status: 'done' },
      { label: 'Multi-Tenancy Support', status: 'done' },
    ]
  },
];

export const getReleasedVersions = () => 
  ROADMAP_VERSIONS.filter(v => v.status === 'released' || v.status === 'current');

export const getCurrentVersion = () => 
  ROADMAP_VERSIONS.find(v => v.status === 'current');
`;

// === CONFIG.TOML TEMPLATE ===
const CONFIG_TOML = `# Spade CMS - Supabase Edge Functions Configuration
# WICHTIG: project_id durch deine Supabase Project ID ersetzen!

project_id = "DEINE_SUPABASE_PROJECT_ID"

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
verify_jwt = false

[functions.move-storage-file]
verify_jwt = true

[functions.update-image-metadata]
verify_jwt = true

[functions.cleanup-orphaned-images]
verify_jwt = true
`;

// === INDEX.CSS (Design System) ===
const INDEX_CSS = `@tailwind base;
@tailwind components;
@tailwind utilities;

/* ============================================================================
   SPADE CMS - DESIGN SYSTEM v1.1.2
   
   Alle Farben sind in HSL-Format definiert.
   Diese Tokens werden von Tailwind und allen Komponenten verwendet.
   ============================================================================ */

@layer base {
  :root {
    /* Core Colors */
    --background: 220 20% 6%;
    --foreground: 210 40% 98%;
    --card: 220 25% 8%;
    --card-foreground: 210 40% 98%;
    --popover: 220 25% 8%;
    --popover-foreground: 210 40% 98%;
    
    /* Primary Brand Colors */
    --primary: 211 77% 28%;
    --primary-foreground: 0 0% 100%;
    --primary-glow: 211 77% 38%;
    
    /* Secondary Colors */
    --secondary: 220 15% 12%;
    --secondary-foreground: 210 40% 98%;
    
    /* Muted Colors */
    --muted: 220 15% 12%;
    --muted-foreground: 215 20% 65%;
    
    /* Accent Colors */
    --accent: 211 77% 28%;
    --accent-foreground: 0 0% 100%;
    
    /* Destructive */
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    
    /* Border & Input */
    --border: 220 15% 15%;
    --input: 220 15% 15%;
    --ring: 211 77% 28%;
    
    /* Gradients */
    --gradient-primary: linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary-glow)));
    --gradient-hero: linear-gradient(135deg, hsl(220 25% 8%) 0%, hsl(220 20% 10%) 50%, hsl(220 25% 8%) 100%);
    --gradient-card: linear-gradient(145deg, hsl(220 25% 9%), hsl(220 20% 11%));
    
    /* Shadows */
    --shadow-glow: 0 0 40px hsl(var(--primary) / 0.15);
    --shadow-card: 0 8px 32px hsl(220 30% 3% / 0.3);
    --shadow-lift: 0 10px 40px hsl(220 30% 5% / 0.15);
    --shadow-soft: 0 4px 20px hsl(220 15% 20% / 0.06);
    --shadow-gentle: 0 2px 12px hsl(220 10% 40% / 0.08);
    --shadow-warm: 0 6px 25px hsl(220 8% 30% / 0.12);
    
    /* Transitions */
    --transition-smooth: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    
    /* Light Section Tokens */
    --light-background: 30 15% 95%;
    --light-foreground: 30 8% 35%;
    --light-muted: 30 6% 55%;
    --light-card: 30 20% 97%;
    --light-border: 30 12% 88%;
    
    /* Accent Variants */
    --accent-violet: 261 83% 65%;
    --accent-soft-blue: 215 100% 70%;
    
    /* Scandinavian Design Tokens */
    --scandi-grey: 220 6% 55%;
    --scandi-light-grey: 220 4% 88%;
    --scandi-white: 0 0% 100%;
    
    /* Navigation */
    --nav-surface: 240 9% 96%;
    
    /* Downloads Section */
    --downloads-bg: 220 3% 98%;
    --downloads-text: 220 12% 20%;
    --downloads-border: 220 6% 92%;
    --downloads-hover: 220 3% 96%;

    /* Icon Backgrounds */
    --icon-camera: 215 30% 85%;
    --icon-camera-fg: 215 100% 45%;
    --icon-testing: 261 25% 85%;
    --icon-testing-fg: 261 83% 50%;
    --icon-performance: 193 28% 85%;
    --icon-performance-fg: 193 93% 45%;
    --icon-general: 220 18% 85%;
    --icon-general-fg: 220 60% 45%;
    
    /* Industry Colors */
    --automotive-button: 217 90% 50%;
    --automotive-icon-bg: 217 90% 96%;
    --automotive-tests-bg: 217 100% 97%;
    --training-button: 220 60% 40%;
    --training-bg: 40 60% 97%;
    --decision-button: 220 60% 40%;
    --decision-icon-bg: 220 60% 96%;
    --academia-button: 220 60% 40%;
    --academia-icon-bg: 220 60% 96%;
    
    /* Admin Dashboard Tokens */
    --admin-success: 142 76% 36%;
    --admin-warning: 38 92% 50%;
    --admin-error: 0 84% 60%;
    --admin-info: 199 89% 48%;
    --admin-utility-1: 220 90% 56%;
    --admin-utility-2: 190 90% 45%;
    --admin-utility-3: 340 82% 58%;
    
    /* Yellow Accent (Standard #f9dc24) */
    --explore-button: 52 95% 56%;
    --orange: 52 95% 56%;
    --orange-foreground: 0 0% 0%;
    --orange-accent: 52 95% 56%;
    --orange-accent-foreground: 0 0% 0%;
    --yellow: 52 95% 56%;
    --yellow-foreground: 0 0% 0%;
    
    /* Hotspot */
    --hotspot-primary: 205 45% 44%;

    /* Border Radius */
    --radius: 0.5rem;

    /* Sidebar */
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

// === TAILWIND CONFIG ===
const TAILWIND_CONFIG = `import type { Config } from "tailwindcss";

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
} satisfies Config;
`;

// === DATABASE MIGRATION SQL ===
const DATABASE_MIGRATION = `-- ============================================
-- SPADE CMS - Complete Database Migration
-- Version: 1.1.2
-- ============================================
-- Diese Migration erstellt ALLE notwendigen Tabellen,
-- RLS-Policies und Funktionen für ein neues Tenant-Projekt.
-- ============================================

-- ============================================
-- PHASE 1: ENUM-TYPEN
-- ============================================

DO $$ BEGIN
    CREATE TYPE app_role AS ENUM ('admin', 'user', 'editor');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================
-- PHASE 2: HILFSFUNKTIONEN
-- ============================================

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

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
  
  IF next_id IS NULL THEN
    INSERT INTO page_id_sequence (id, last_used_page_id)
    VALUES (1, 1)
    ON CONFLICT (id) DO UPDATE SET last_used_page_id = page_id_sequence.last_used_page_id + 1
    RETURNING last_used_page_id INTO next_id;
  END IF;
  
  RETURN next_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

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

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ============================================
-- PHASE 3: CORE-TABELLEN
-- ============================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY,
  email text NOT NULL,
  full_name text,
  username text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role app_role NOT NULL,
  created_at timestamptz DEFAULT now()
);

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

CREATE TABLE IF NOT EXISTS public.page_id_sequence (
  id integer PRIMARY KEY DEFAULT 1,
  last_used_page_id integer NOT NULL DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);

INSERT INTO page_id_sequence (id, last_used_page_id)
VALUES (1, 100)
ON CONFLICT (id) DO NOTHING;

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

-- Profiles
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON profiles FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage all profiles" ON profiles FOR UPDATE USING (has_role(auth.uid(), 'admin'));

-- User Roles
CREATE POLICY "Users can view their own roles" ON user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all user roles" ON user_roles FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Allow creating first admin or admins can manage" ON user_roles FOR INSERT 
  WITH CHECK ((NOT EXISTS (SELECT 1 FROM user_roles WHERE role = 'admin')) OR has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update roles" ON user_roles FOR UPDATE USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete roles" ON user_roles FOR DELETE USING (has_role(auth.uid(), 'admin'));

-- User SEO Permissions
CREATE POLICY "Users can read own SEO permissions" ON user_seo_permissions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can read all SEO permissions" ON user_seo_permissions FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert SEO permissions" ON user_seo_permissions FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update SEO permissions" ON user_seo_permissions FOR UPDATE USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete SEO permissions" ON user_seo_permissions FOR DELETE USING (has_role(auth.uid(), 'admin'));

-- Editor Page Access
CREATE POLICY "Editors can view their own page access" ON editor_page_access FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage editor page access" ON editor_page_access FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Page ID Sequence
CREATE POLICY "Allow authenticated users to read page_id_sequence" ON page_id_sequence FOR SELECT USING (true);
CREATE POLICY "Allow authenticated users to update page_id_sequence" ON page_id_sequence FOR UPDATE USING (true) WITH CHECK (true);

-- Page Registry
CREATE POLICY "Anyone can view page registry" ON page_registry FOR SELECT USING (true);
CREATE POLICY "Admins can insert page registry" ON page_registry FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins and editors can update page registry" ON page_registry FOR UPDATE 
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'editor'));
CREATE POLICY "Admins can delete page registry" ON page_registry FOR DELETE USING (has_role(auth.uid(), 'admin'));

-- Segment Registry
CREATE POLICY "Anyone can view segment registry" ON segment_registry FOR SELECT USING (true);
CREATE POLICY "Admins can manage segment registry" ON segment_registry FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Editors can manage segments" ON segment_registry FOR ALL
  USING (has_role(auth.uid(), 'editor'))
  WITH CHECK (has_role(auth.uid(), 'editor'));

-- Page Content
CREATE POLICY "Anyone can view page content" ON page_content FOR SELECT USING (true);
CREATE POLICY "Admins and editors can insert page content" ON page_content FOR INSERT 
  WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'editor'));
CREATE POLICY "Admins and editors can update page content" ON page_content FOR UPDATE 
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'editor'));
CREATE POLICY "Admins and editors can delete page content" ON page_content FOR DELETE 
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'editor'));

-- Page Content Backups
CREATE POLICY "Admins and editors can view backups" ON page_content_backups FOR SELECT 
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'editor'));
CREATE POLICY "Admins and editors can create backups" ON page_content_backups FOR INSERT 
  WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'editor'));
CREATE POLICY "Admins can delete old backups" ON page_content_backups FOR DELETE 
  USING (has_role(auth.uid(), 'admin'));

-- Media Folders
CREATE POLICY "Anyone can view media folders" ON media_folders FOR SELECT USING (true);
CREATE POLICY "Admins and editors can manage media folders" ON media_folders FOR ALL 
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'editor'));

-- File Segment Mappings
CREATE POLICY "Anyone can view file mappings" ON file_segment_mappings FOR SELECT USING (true);
CREATE POLICY "Admins and editors can manage file mappings" ON file_segment_mappings FOR ALL 
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'editor'));

-- Navigation Links
CREATE POLICY "Anyone can view navigation links" ON navigation_links FOR SELECT USING (true);
CREATE POLICY "Admins and editors can manage navigation links" ON navigation_links FOR ALL 
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'editor'));

-- Glossary
CREATE POLICY "Anyone can view glossary" ON glossary FOR SELECT USING (true);
CREATE POLICY "Admins and editors can manage glossary" ON glossary FOR ALL 
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'editor'));

-- Redirects
CREATE POLICY "Anyone can view active redirects" ON redirects FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage all redirects" ON redirects FOR ALL USING (has_role(auth.uid(), 'admin'));

-- News Articles
CREATE POLICY "Anyone can view published news" ON news_articles FOR SELECT USING (published = true);
CREATE POLICY "Admins can view all news" ON news_articles FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage all news" ON news_articles FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Events
CREATE POLICY "Anyone can view published events" ON events FOR SELECT USING (published = true);
CREATE POLICY "Admins can view all events" ON events FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage all events" ON events FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Event Registrations
CREATE POLICY "Anyone can insert event registrations" ON event_registrations FOR INSERT WITH CHECK (true);
CREATE POLICY "Only admins can view event registrations" ON event_registrations FOR SELECT 
  USING (has_role(auth.uid(), 'admin'));

-- Products
CREATE POLICY "Anyone can view published products" ON products FOR SELECT USING (published = true);
CREATE POLICY "Admins can view all products" ON products FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage all products" ON products FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Downloads
CREATE POLICY "Anyone can view published downloads" ON downloads FOR SELECT USING (published = true);
CREATE POLICY "Admins can view all downloads" ON downloads FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage all downloads" ON downloads FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Download Requests
CREATE POLICY "Anyone can insert download requests" ON download_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Only admins can view download requests" ON download_requests FOR SELECT 
  USING (has_role(auth.uid(), 'admin'));

-- Newsletter Subscriptions
CREATE POLICY "Anyone can subscribe to newsletter" ON newsletter_subscriptions FOR INSERT WITH CHECK (true);
CREATE POLICY "Only admins can view newsletter subscriptions" ON newsletter_subscriptions FOR SELECT 
  USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Only admins can update newsletter subscriptions" ON newsletter_subscriptions FOR UPDATE 
  USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Only admins can delete newsletter subscriptions" ON newsletter_subscriptions FOR DELETE 
  USING (has_role(auth.uid(), 'admin'));

-- Contact Submissions
CREATE POLICY "Anyone can insert contact submissions" ON contact_submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "Only admins can view contact submissions" ON contact_submissions FOR SELECT 
  USING (has_role(auth.uid(), 'admin'));

-- Backlog Tasks
CREATE POLICY "Users can view their own or assigned tasks" ON backlog_tasks FOR SELECT 
  USING (auth.uid() = created_by OR auth.uid() = assigned_to);
CREATE POLICY "Admins can view all backlog tasks" ON backlog_tasks FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can create backlog tasks" ON backlog_tasks FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update their own or assigned tasks" ON backlog_tasks FOR UPDATE 
  USING (auth.uid() = created_by OR auth.uid() = assigned_to);
CREATE POLICY "Admins can manage all backlog tasks" ON backlog_tasks FOR ALL USING (has_role(auth.uid(), 'admin'));

-- ============================================
-- PHASE 7: TRIGGER
-- ============================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- FERTIG! Nächste Schritte:
-- 1. Storage Buckets erstellen (page-images, cms-media)
-- 2. Ersten User registrieren
-- 3. Admin-Rolle zuweisen: INSERT INTO user_roles (user_id, role) VALUES ('USER_UUID', 'admin');
-- ============================================
`;

// === ONBOARDING CHECKLIST ===
const ONBOARDING_CHECKLIST = `# Spade CMS – Tenant Onboarding Checklist v1.1.2

Diese Checkliste führt durch alle Schritte zur Einrichtung eines neuen Spade CMS Projekts.

---

## Phase 1: Lovable Projekt erstellen (5 Min)

- [ ] Neues Lovable-Projekt erstellen auf [lovable.dev](https://lovable.dev)
- [ ] Lovable Cloud aktivieren (automatisches Supabase-Backend)
- [ ] Projekt-URL notieren: \`https://preview--[PROJECT_NAME].lovable.app\`
- [ ] Supabase Project ID notieren (aus Lovable Cloud Settings)

---

## Phase 2: Core-Ordner kopieren (20 Min)

Diese Ordner **komplett** vom Haupt-Projekt kopieren:

### Pflicht-Ordner (1:1 kopieren)

| Ordner | Beschreibung |
|--------|--------------|
| \`src/components/\` | Alle UI-Komponenten inkl. Segment-Editoren |
| \`src/components/admin/\` | Admin Dashboard |
| \`src/components/ui/\` | shadcn UI-Basis |
| \`src/hooks/\` | Alle Custom Hooks |
| \`src/lib/\` | Utility-Funktionen |
| \`src/assets/\` | Icons, spade-cms-logo.png |
| \`src/types/\` | TypeScript Typen |
| \`src/contexts/\` | React Contexts |
| \`supabase/functions/\` | Alle Edge Functions |

---

## Phase 3: Konfigurationsdateien hochladen (10 Min)

Von der Download-Seite (\`/spade-cms-install\`) herunterladen und anpassen:

| Datei | Zielort | Aktion |
|-------|---------|--------|
| \`siteConfig.ts\` | \`src/config/siteConfig.ts\` | ⚠️ Anpassen |
| \`index.ts\` | \`src/config/index.ts\` | ✅ Unverändert |
| \`Auth.tsx\` | \`src/pages/Auth.tsx\` | ✅ Unverändert |
| \`roadmapConfig.ts\` | \`src/components/admin/dashboard/config.ts\` | ✅ Unverändert |
| \`config.toml\` | \`supabase/config.toml\` | ⚠️ Project ID anpassen |
| \`index.css\` | \`src/index.css\` | ✅ Unverändert |
| \`tailwind.config.ts\` | \`tailwind.config.ts\` | ✅ Unverändert |

---

## Phase 4: siteConfig.ts anpassen

\`\`\`typescript
export const siteConfig: SiteConfig = {
  tenant: {
    id: 'mein-projekt',              // Eindeutige ID
    name: 'Mein Projekt',            // Anzeigename
    legalName: 'Meine Firma GmbH',   // Rechtlicher Name
    tagline: 'Mein Slogan',          // Tagline
  },
  branding: {
    logos: {
      primary: '/logos/mein-logo.svg',
      inverted: '/logos/mein-logo-dark.svg',
    },
    colors: {
      primary: '211 77% 28%',         // HSL!
      // ...
    },
  },
  features: {
    modules: {
      news: true,
      events: true,
      products: false,  // Deaktiviert
      // ...
    },
    languages: ['de', 'en'],
    defaultLanguage: 'de',
  },
  // ...
};
\`\`\`

---

## Phase 5: Datenbank-Migration ausführen (10 Min)

1. Die Datei \`tenant-database-migration.sql\` herunterladen
2. In Lovable Cloud → SQL ausführen (oder via Supabase CLI)
3. Auf erfolgreiche Ausführung prüfen

---

## Phase 6: Storage Buckets erstellen

In Lovable Cloud → Storage:

| Bucket | Public? | Beschreibung |
|--------|---------|--------------|
| \`page-images\` | ✅ Ja | Seiten-Bilder |
| \`cms-media\` | ✅ Ja | CMS-Medien |
| \`user-uploads\` | ❌ Nein | Private Uploads |

---

## Phase 7: Logos hochladen

\`\`\`
public/logos/mein-logo.svg           → Hauptlogo
public/logos/mein-logo-dark.svg      → Logo für dunkle Hintergründe
public/favicon.ico                   → Favicon
src/assets/spade-cms-logo.png        → Vom Haupt-Projekt kopieren!
\`\`\`

---

## Phase 8: Admin-User anlegen

1. \`/auth\` aufrufen und ersten User registrieren
2. User-UUID aus der Datenbank holen:
   \`\`\`sql
   SELECT id, email FROM auth.users;
   \`\`\`
3. Admin-Rolle zuweisen:
   \`\`\`sql
   INSERT INTO user_roles (user_id, role) VALUES ('USER_UUID_HIER', 'admin');
   \`\`\`

---

## Phase 9: Erste Seiten anlegen

\`\`\`sql
INSERT INTO page_registry (page_id, page_slug, page_title, status, nav_visible)
VALUES 
  (1, 'home', 'Startseite', 'published', true),
  (2, 'contact', 'Kontakt', 'published', true);
\`\`\`

---

## Phase 10: Verifizierung

- [ ] Login als Admin funktioniert
- [ ] Dashboard erreichbar (\`/de/admin-dashboard\`)
- [ ] Segment-Editor funktioniert
- [ ] Frontend-Editing (\`?edit=true\`) funktioniert
- [ ] Branding korrekt (Logo, Farben)
- [ ] Feature-Flags werden respektiert

---

## Geschätzte Gesamtzeit: ~90 Minuten

---

## NIEMALS synchronisieren

| Datei/Ordner | Grund |
|--------------|-------|
| \`src/config/siteConfig.ts\` | Tenant-Branding |
| \`.env\` | Eigene Secrets |
| \`public/logos/\` | Tenant-Logos |
| Datenbank-Inhalte | Tenant-Content |
`;

// === FILE COLLECTIONS ===
const CONFIG_FILES: Record<string, { content: string; description: string }> = {
  "src/config/siteConfig.ts": { content: SITE_CONFIG_TEMPLATE, description: "Tenant-Konfiguration (ANPASSEN!)" },
  "src/config/index.ts": { content: CONFIG_INDEX, description: "Config-Exports" },
  "src/pages/Auth.tsx": { content: AUTH_CONTENT, description: "Login-Seite mit Branding" },
  "src/components/admin/dashboard/config.ts": { content: ROADMAP_CONFIG, description: "CMS Version & Roadmap" },
  "supabase/config.toml": { content: CONFIG_TOML, description: "Edge Function Konfiguration" },
};

const STYLING_FILES: Record<string, { content: string; description: string }> = {
  "src/index.css": { content: INDEX_CSS, description: "Design System (CSS Tokens)" },
  "tailwind.config.ts": { content: TAILWIND_CONFIG, description: "Tailwind Konfiguration" },
};

const DOCS_FILES: Record<string, { content: string; description: string }> = {
  "docs/tenant-database-migration.sql": { content: DATABASE_MIGRATION, description: "Komplette DB-Migration" },
  "docs/TENANT_ONBOARDING_CHECKLIST.md": { content: ONBOARDING_CHECKLIST, description: "Setup-Anleitung" },
};

// === CORE FOLDERS LIST ===
const CORE_FOLDERS = [
  { path: "src/components/admin/", description: "Admin Dashboard & Editoren", files: "60+ Dateien" },
  { path: "src/components/ui/", description: "shadcn UI Komponenten", files: "40+ Dateien" },
  { path: "src/hooks/", description: "Custom React Hooks", files: "15 Dateien" },
  { path: "src/lib/", description: "Utility-Funktionen", files: "3 Dateien" },
  { path: "src/contexts/", description: "React Contexts", files: "2 Dateien" },
  { path: "src/assets/", description: "Icons & Bilder", files: "spade-cms-logo.png" },
  { path: "supabase/functions/", description: "Edge Functions", files: "35+ Functions" },
];

const EDGE_FUNCTIONS = [
  "lookup-username", "admin-create-user", "admin-update-user", "admin-delete-user",
  "translate-content", "upload-image", "upload-news-images", "register-event",
  "send-download-email", "generate-og-image", "get-logo-base64", "download-external-file",
  "move-storage-file", "update-image-metadata", "cleanup-orphaned-images",
  "fetch-external-content", "generate-seo-title", "generate-seo-description",
  "generate-h1-headline", "generate-h2-headlines", "generate-h3-headlines",
  "generate-intro-text", "generate-focus-keyword", "optimize-readability",
  "optimize-keyword-density", "suggest-content-links", "generate-internal-links",
  "generate-external-links", "validate-redirect"
];

// ============================================================================
// COMPONENT
// ============================================================================

const SpadeCMSInstall = () => {
  const [copiedFile, setCopiedFile] = useState<string | null>(null);

  const copyToClipboard = async (filename: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedFile(filename);
      toast.success(`${filename.split('/').pop()} kopiert!`);
      setTimeout(() => setCopiedFile(null), 2000);
    } catch {
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
    toast.success(`${filename.split('/').pop()} heruntergeladen!`);
  };

  const downloadAllFiles = () => {
    const allFiles = { ...CONFIG_FILES, ...STYLING_FILES, ...DOCS_FILES };
    Object.entries(allFiles).forEach(([filename, { content }], index) => {
      setTimeout(() => downloadFile(filename, content), index * 200);
    });
    toast.success(`${Object.keys(allFiles).length} Dateien werden heruntergeladen...`);
  };

  const FileRow = ({ filename, content, description, iconColor = "text-yellow-500" }: { 
    filename: string; 
    content: string; 
    description: string;
    iconColor?: string;
  }) => (
    <div className="flex items-center justify-between bg-zinc-800/50 p-3 rounded-lg hover:bg-zinc-800 transition-colors">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <FileCode className={`h-4 w-4 ${iconColor} shrink-0`} />
        <div className="min-w-0">
          <span className="text-white font-mono text-sm block truncate">{filename}</span>
          <span className="text-zinc-500 text-xs">{description}</span>
        </div>
      </div>
      <div className="flex gap-2 shrink-0 ml-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => copyToClipboard(filename, content)}
          className="border-zinc-700 hover:bg-zinc-700"
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
          className="border-zinc-700 hover:bg-zinc-700"
        >
          <Download className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Package className="h-8 w-8 text-[#f9dc24]" />
                Spade CMS Installation
              </h1>
              <p className="text-zinc-400 mt-1">Komplettes Setup-Paket für neue Projekte</p>
            </div>
            <Badge className="bg-[#4B7BF5] text-white border-0 text-sm px-3 py-1">
              v1.1.2
            </Badge>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Quick Start */}
        <Card className="bg-gradient-to-br from-[#4B7BF5]/20 to-zinc-900 border-[#4B7BF5]/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Zap className="h-5 w-5 text-[#f9dc24]" />
              Quick Start
            </CardTitle>
            <CardDescription className="text-zinc-300">
              Alles herunterladen und der Onboarding-Checkliste folgen
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            <Button 
              onClick={downloadAllFiles}
              size="lg"
              className="bg-[#f9dc24] text-black hover:bg-[#f9dc24]/90 font-semibold"
            >
              <Download className="h-5 w-5 mr-2" />
              Alle Dateien herunterladen
            </Button>
            <Button 
              variant="outline"
              size="lg"
              onClick={() => downloadFile("docs/TENANT_ONBOARDING_CHECKLIST.md", ONBOARDING_CHECKLIST)}
              className="border-zinc-600 hover:bg-zinc-800"
            >
              <BookOpen className="h-5 w-5 mr-2" />
              Setup-Anleitung
            </Button>
          </CardContent>
        </Card>

        {/* Tabs for different sections */}
        <Tabs defaultValue="presets" className="space-y-6">
          <TabsList className="bg-zinc-800 border-zinc-700">
            <TabsTrigger value="presets" className="data-[state=active]:bg-zinc-700">
              <Layers className="h-4 w-4 mr-2" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="files" className="data-[state=active]:bg-zinc-700">
              <FileCode className="h-4 w-4 mr-2" />
              Dateien
            </TabsTrigger>
            <TabsTrigger value="folders" className="data-[state=active]:bg-zinc-700">
              <FolderOpen className="h-4 w-4 mr-2" />
              Ordner-Struktur
            </TabsTrigger>
            <TabsTrigger value="database" className="data-[state=active]:bg-zinc-700">
              <Database className="h-4 w-4 mr-2" />
              Datenbank
            </TabsTrigger>
            <TabsTrigger value="config" className="data-[state=active]:bg-zinc-700">
              <Settings className="h-4 w-4 mr-2" />
              Config Check
            </TabsTrigger>
            <TabsTrigger value="checklist" className="data-[state=active]:bg-zinc-700">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Checkliste
            </TabsTrigger>
          </TabsList>

          {/* PRESETS TAB - NEW */}
          <TabsContent value="presets" className="space-y-6">
            <PresetSelector />
          </TabsContent>

          {/* FILES TAB */}
          <TabsContent value="files" className="space-y-6">
            {/* Config Files */}
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Settings className="h-5 w-5 text-yellow-500" />
                  Konfigurationsdateien
                </CardTitle>
                <CardDescription>Kernkonfiguration für das neue Projekt</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(CONFIG_FILES).map(([filename, { content, description }]) => (
                  <FileRow key={filename} filename={filename} content={content} description={description} />
                ))}
              </CardContent>
            </Card>

            {/* Styling Files */}
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <span className="text-purple-500">🎨</span>
                  Design System
                </CardTitle>
                <CardDescription>Farben, Tokens, Animationen</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(STYLING_FILES).map(([filename, { content, description }]) => (
                  <FileRow key={filename} filename={filename} content={content} description={description} iconColor="text-purple-500" />
                ))}
              </CardContent>
            </Card>

            {/* Documentation Files */}
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <BookOpen className="h-5 w-5 text-blue-500" />
                  Dokumentation
                </CardTitle>
                <CardDescription>Anleitungen und SQL-Migration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(DOCS_FILES).map(([filename, { content, description }]) => (
                  <FileRow key={filename} filename={filename} content={content} description={description} iconColor="text-blue-500" />
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* FOLDERS TAB */}
          <TabsContent value="folders" className="space-y-6">
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <FolderOpen className="h-5 w-5 text-green-500" />
                  Core-Ordner (1:1 kopieren)
                </CardTitle>
                <CardDescription>Diese Ordner müssen komplett vom Haupt-Projekt übernommen werden</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {CORE_FOLDERS.map((folder) => (
                    <div key={folder.path} className="flex items-start gap-4 p-4 bg-zinc-800/50 rounded-lg">
                      <FolderOpen className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                      <div className="flex-1">
                        <code className="text-white font-mono text-sm">{folder.path}</code>
                        <p className="text-zinc-400 text-sm mt-1">{folder.description}</p>
                        <Badge variant="outline" className="mt-2 text-xs">{folder.files}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Edge Functions */}
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Zap className="h-5 w-5 text-orange-500" />
                  Edge Functions
                </CardTitle>
                <CardDescription>Alle verfügbaren Backend-Functions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {EDGE_FUNCTIONS.map((fn) => (
                    <Badge key={fn} variant="outline" className="bg-zinc-800 border-zinc-700 text-zinc-300">
                      {fn}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Warning */}
            <Card className="bg-red-950/30 border-red-800/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-400">
                  <AlertTriangle className="h-5 w-5" />
                  NIEMALS synchronisieren
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-zinc-300">
                  <li className="flex items-center gap-2">
                    <span className="text-red-500">✗</span>
                    <code>src/config/siteConfig.ts</code> – Tenant-spezifisch
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-red-500">✗</span>
                    <code>.env</code> – Secrets
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-red-500">✗</span>
                    <code>public/logos/</code> – Tenant-Logos
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-red-500">✗</span>
                    Datenbank-Inhalte – Tenant-Content
                  </li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          {/* DATABASE TAB */}
          <TabsContent value="database" className="space-y-6">
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Database className="h-5 w-5 text-blue-500" />
                  Datenbank-Migration
                </CardTitle>
                <CardDescription>Komplettes Schema mit allen Tabellen und RLS-Policies</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <Button 
                    onClick={() => downloadFile("docs/tenant-database-migration.sql", DATABASE_MIGRATION)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    SQL-Migration herunterladen
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => copyToClipboard("migration.sql", DATABASE_MIGRATION)}
                    className="border-zinc-700 hover:bg-zinc-800"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    In Zwischenablage
                  </Button>
                </div>

                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="tables" className="border-zinc-800">
                    <AccordionTrigger className="text-white hover:no-underline">
                      <span className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-green-500" />
                        Enthaltene Tabellen (23)
                      </span>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 pt-2">
                        {[
                          "profiles", "user_roles", "user_seo_permissions", "editor_page_access",
                          "page_id_sequence", "page_registry", "segment_registry", "page_content",
                          "page_content_backups", "media_folders", "file_segment_mappings",
                          "navigation_links", "glossary", "redirects", "news_articles", "events",
                          "event_registrations", "products", "downloads", "download_requests",
                          "newsletter_subscriptions", "contact_submissions", "backlog_tasks"
                        ].map((table) => (
                          <Badge key={table} variant="outline" className="justify-start bg-zinc-800">
                            {table}
                          </Badge>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="rls" className="border-zinc-800">
                    <AccordionTrigger className="text-white hover:no-underline">
                      <span className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-yellow-500" />
                        RLS-Policies
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="text-zinc-400">
                      Alle Tabellen haben RLS aktiviert mit rollenbasierten Policies (admin, editor, user).
                      Die <code>has_role()</code> Funktion wird für sichere Berechtigungsprüfung verwendet.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="functions" className="border-zinc-800">
                    <AccordionTrigger className="text-white hover:no-underline">
                      <span className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-purple-500" />
                        Datenbank-Funktionen
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="text-zinc-400">
                      <ul className="space-y-1">
                        <li><code>has_role()</code> – Rollenprüfung</li>
                        <li><code>get_next_page_id()</code> – Eindeutige Page-IDs</li>
                        <li><code>handle_new_user()</code> – Automatische Profil-Erstellung</li>
                        <li><code>update_updated_at_column()</code> – Timestamp-Trigger</li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>

            {/* Storage Buckets */}
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <FolderOpen className="h-5 w-5 text-purple-500" />
                  Storage Buckets erstellen
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge className="bg-green-500/20 text-green-400">PUBLIC</Badge>
                      <code>page-images</code>
                    </div>
                    <span className="text-zinc-500 text-sm">Seiten-Bilder</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge className="bg-green-500/20 text-green-400">PUBLIC</Badge>
                      <code>cms-media</code>
                    </div>
                    <span className="text-zinc-500 text-sm">CMS-Medien</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge className="bg-red-500/20 text-red-400">PRIVATE</Badge>
                      <code>user-uploads</code>
                    </div>
                    <span className="text-zinc-500 text-sm">Private Uploads</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* CONFIG CHECK TAB - NEW */}
          <TabsContent value="config" className="space-y-6">
            <ConfigDashboard />
          </TabsContent>

          {/* CHECKLIST TAB */}
          <TabsContent value="checklist" className="space-y-6">
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  Onboarding Checkliste
                </CardTitle>
                <CardDescription>Schritt-für-Schritt Anleitung (~90 Minuten)</CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => downloadFile("docs/TENANT_ONBOARDING_CHECKLIST.md", ONBOARDING_CHECKLIST)}
                  className="mb-6 bg-green-600 hover:bg-green-700"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Checkliste herunterladen
                </Button>

                <Accordion type="multiple" className="w-full space-y-2">
                  {[
                    { phase: "1", title: "Lovable Projekt erstellen", time: "5 Min", items: ["Neues Projekt erstellen", "Lovable Cloud aktivieren", "Project ID notieren"] },
                    { phase: "2", title: "Core-Ordner kopieren", time: "20 Min", items: ["src/components/", "src/hooks/", "src/lib/", "supabase/functions/"] },
                    { phase: "3", title: "Konfigurationsdateien", time: "10 Min", items: ["siteConfig.ts anpassen", "config.toml anpassen", "Design-Dateien kopieren"] },
                    { phase: "4", title: "Datenbank-Migration", time: "10 Min", items: ["SQL-Migration ausführen", "Storage Buckets erstellen"] },
                    { phase: "5", title: "Admin-User anlegen", time: "5 Min", items: ["User registrieren", "Admin-Rolle zuweisen"] },
                    { phase: "6", title: "Verifizierung", time: "10 Min", items: ["Login testen", "Dashboard prüfen", "Frontend-Editing testen"] },
                  ].map((phase) => (
                    <AccordionItem key={phase.phase} value={`phase-${phase.phase}`} className="border border-zinc-800 rounded-lg px-4">
                      <AccordionTrigger className="text-white hover:no-underline">
                        <div className="flex items-center gap-3">
                          <Badge className="bg-zinc-700">{phase.phase}</Badge>
                          <span>{phase.title}</span>
                          <Badge variant="outline" className="ml-auto mr-4">{phase.time}</Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <ul className="space-y-2 py-2">
                          {phase.items.map((item, i) => (
                            <li key={i} className="flex items-center gap-2 text-zinc-400">
                              <div className="w-4 h-4 rounded border border-zinc-600" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>

            {/* First Admin User */}
            <Card className="bg-amber-950/30 border-amber-800/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-400">
                  <Info className="h-5 w-5" />
                  Ersten Admin-User anlegen
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-zinc-300">Nach der Registration den folgenden SQL-Befehl ausführen:</p>
                <div className="bg-zinc-900 p-4 rounded-lg font-mono text-sm">
                  <code className="text-green-400">
                    INSERT INTO user_roles (user_id, role)<br />
                    VALUES ('DEINE_USER_UUID', 'admin');
                  </code>
                </div>
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard("admin-sql", "INSERT INTO user_roles (user_id, role) VALUES ('DEINE_USER_UUID', 'admin');")}
                  className="border-zinc-700 hover:bg-zinc-800"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  SQL kopieren
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <footer className="text-center py-8 border-t border-zinc-800">
          <p className="text-zinc-500">
            Spade CMS v1.1.2 • Vollständiges Export-Paket für Multi-Tenancy
          </p>
        </footer>
      </main>
    </div>
  );
};

export default SpadeCMSInstall;
