/**
 * Export-Kit Generator für bestehende Lovable Projekte
 * 
 * Generiert einen kompletten "Starter-Prompt" der in ein bestehendes
 * Lovable-Projekt eingefügt werden kann, um das Spade CMS zu installieren.
 * 
 * @version 1.2.6
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  Copy, 
  Check, 
  Rocket, 
  Settings, 
  Palette, 
  Mail, 
  Globe, 
  Package,
  FileCode,
  Database,
  Shield,
  Layers,
  Eye
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TenantConfig {
  projectName: string;
  legalName: string;
  tagline: string;
  description: string;
  
  // Branding
  primaryColor: string;
  accentColor: string;
  headingFont: string;
  bodyFont: string;
  
  // Contact
  email: string;
  phone: string;
  street: string;
  city: string;
  zip: string;
  country: string;
  
  // Social
  linkedin: string;
  twitter: string;
  youtube: string;
  
  // Features
  enableNews: boolean;
  enableNewsletterMautic: boolean; // Newsletter via Mautic
  enableEvents: boolean;
  enableDownloads: boolean;
  enableProducts: boolean;
  enableSeoTools: boolean;
  enableGlossary: boolean;
  enableContact: boolean;
  
  // Languages
  defaultLanguage: string;
  additionalLanguages: string[];
  
  // Integrations
  enableMautic: boolean;
  enableResend: boolean;
  resendFromEmail: string;
}

const DEFAULT_CONFIG: TenantConfig = {
  projectName: "",
  legalName: "",
  tagline: "",
  description: "",
  
  primaryColor: "220 70% 50%",
  accentColor: "45 100% 50%",
  headingFont: "Inter, sans-serif",
  bodyFont: "Inter, sans-serif",
  
  email: "",
  phone: "",
  street: "",
  city: "",
  zip: "",
  country: "Deutschland",
  
  linkedin: "",
  twitter: "",
  youtube: "",
  
  enableNews: true,
  enableNewsletterMautic: true, // Newsletter via Mautic
  enableEvents: true,
  enableDownloads: true,
  enableProducts: false,
  enableSeoTools: true, // Default on - core feature
  enableGlossary: false,
  enableContact: true,
  
  defaultLanguage: "de",
  additionalLanguages: ["en"],
  
  enableMautic: false,
  enableResend: true,
  resendFromEmail: "",
};

// Convert project name to slug
const toSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export const ExportKitGenerator = () => {
  const [config, setConfig] = useState<TenantConfig>(DEFAULT_CONFIG);
  const [copied, setCopied] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [generatedPrompt, setGeneratedPrompt] = useState("");

  const updateConfig = (key: keyof TenantConfig, value: string | boolean | string[]) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const generatePrompt = (): string => {
    const tenantId = toSlug(config.projectName || 'mein-projekt');
    const enabledModules = [
      config.enableNews && 'news',
      config.enableNewsletterMautic && 'newsletter (Mautic)',
      config.enableEvents && 'events',
      config.enableDownloads && 'downloads',
      config.enableProducts && 'products',
      config.enableSeoTools && 'seoTools',
      config.enableGlossary && 'glossary',
      config.enableContact && 'contact',
    ].filter(Boolean);

    const languages = [config.defaultLanguage, ...config.additionalLanguages].filter(Boolean);

    return `# 🔧 SPADE CMS INSTALLATION - Starter Prompt v1.2.6

Bitte installiere das **Spade CMS** auf diesem bestehenden Lovable-Projekt. Das Design und die Seiten sollen erhalten bleiben. Das CMS soll als Backend-System für Content-Management integriert werden.

---

## 📋 PROJEKT-KONFIGURATION

### Tenant-Daten
- **Projekt-ID:** ${tenantId}
- **Name:** ${config.projectName || 'Mein Projekt'}
- **Rechtlicher Name:** ${config.legalName || 'Mein Unternehmen GmbH'}
- **Tagline:** ${config.tagline || 'Ihr Slogan hier'}
- **Beschreibung:** ${config.description || 'Projektbeschreibung für SEO'}

### Branding
- **Primärfarbe (HSL):** ${config.primaryColor}
- **Akzentfarbe (HSL):** ${config.accentColor}
- **Heading-Font:** ${config.headingFont}
- **Body-Font:** ${config.bodyFont}

### Kontakt
- **E-Mail:** ${config.email || 'info@beispiel.de'}
- **Telefon:** ${config.phone || '+49 123 456789'}
- **Adresse:** ${config.street || 'Musterstraße 1'}, ${config.zip || '10115'} ${config.city || 'Berlin'}, ${config.country}

### Social Media
${config.linkedin ? `- **LinkedIn:** ${config.linkedin}` : '- **LinkedIn:** (nicht konfiguriert)'}
${config.twitter ? `- **Twitter:** ${config.twitter}` : '- **Twitter:** (nicht konfiguriert)'}
${config.youtube ? `- **YouTube:** ${config.youtube}` : '- **YouTube:** (nicht konfiguriert)'}

### Aktivierte Module
${enabledModules.map(m => `- ✅ ${m}`).join('\n') || '- (keine Module ausgewählt)'}

### Sprachen
- **Standard:** ${config.defaultLanguage}
- **Verfügbar:** ${languages.join(', ')}

### Integrationen
${config.enableMautic ? '- ✅ Mautic (Marketing Automation)' : '- ❌ Mautic'}
${config.enableResend ? `- ✅ Resend (E-Mail: ${config.resendFromEmail || 'noreply@' + tenantId + '.de'})` : '- ❌ Resend'}

---

## 🗄️ DATENBANK-SETUP

Bitte erstelle die folgenden Datenbank-Tabellen und RLS-Policies:

### 1. Basis-Tabellen (PFLICHT)
\`\`\`sql
-- Enum für Benutzerrollen
CREATE TYPE public.app_role AS ENUM ('admin', 'editor', 'user');

-- Profiles Tabelle
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  username TEXT UNIQUE,
  full_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- User Roles
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Page Registry
CREATE TABLE public.page_registry (
  id SERIAL PRIMARY KEY,
  page_id INTEGER NOT NULL UNIQUE,
  page_slug TEXT NOT NULL UNIQUE,
  page_title TEXT NOT NULL,
  title_translations JSONB DEFAULT '{}',
  parent_id INTEGER REFERENCES page_registry(page_id),
  parent_slug TEXT,
  status TEXT DEFAULT 'draft',
  position INTEGER DEFAULT 0,
  nav_visible BOOLEAN DEFAULT true,
  nav_category TEXT,
  nav_position INTEGER,
  design_icon TEXT,
  frontend_editing_enabled BOOLEAN DEFAULT true,
  flyout_description TEXT,
  flyout_description_translations JSONB DEFAULT '{}',
  flyout_image_url TEXT,
  cta_group TEXT,
  cta_label TEXT,
  cta_icon TEXT,
  target_page_slug TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Segment Registry
CREATE TABLE public.segment_registry (
  id SERIAL PRIMARY KEY,
  segment_id INTEGER NOT NULL,
  page_slug TEXT NOT NULL REFERENCES page_registry(page_slug) ON DELETE CASCADE,
  segment_key TEXT NOT NULL,
  segment_type TEXT NOT NULL,
  position INTEGER DEFAULT 0,
  is_static BOOLEAN DEFAULT false,
  deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(page_slug, segment_id)
);

-- Page Content
CREATE TABLE public.page_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_slug TEXT NOT NULL,
  section_key TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'de',
  content_type TEXT NOT NULL,
  content_value TEXT NOT NULL,
  draft_value TEXT,
  content_status TEXT DEFAULT 'published',
  import_stage INTEGER,
  updated_by UUID,
  updated_at TIMESTAMPTZ DEFAULT now(),
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  UNIQUE(page_slug, section_key, language)
);

-- Page Content Backups
CREATE TABLE public.page_content_backups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_slug TEXT NOT NULL,
  section_key TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'de',
  content_type TEXT NOT NULL,
  content_value TEXT NOT NULL,
  original_updated_by UUID,
  original_updated_at TIMESTAMPTZ,
  backup_created_at TIMESTAMPTZ DEFAULT now()
);

-- Page ID Sequence
CREATE TABLE public.page_id_sequence (
  id SERIAL PRIMARY KEY,
  last_used_page_id INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now()
);
INSERT INTO page_id_sequence (last_used_page_id) VALUES (100);

-- Helper Function
CREATE OR REPLACE FUNCTION public.get_next_page_id()
RETURNS INTEGER AS $$
DECLARE
  new_id INTEGER;
BEGIN
  UPDATE page_id_sequence SET last_used_page_id = last_used_page_id + 1, updated_at = now()
  WHERE id = 1
  RETURNING last_used_page_id INTO new_id;
  RETURN new_id;
END;
$$ LANGUAGE plpgsql;

-- Has Role Function
CREATE OR REPLACE FUNCTION public.has_role(_role app_role, _user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = _user_id AND role = _role
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profile Trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
\`\`\`

### 2. RLS Policies (PFLICHT)
\`\`\`sql
-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE segment_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_content_backups ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Profiles viewable by authenticated" ON profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Page Registry Policies
CREATE POLICY "Page registry viewable by all" ON page_registry FOR SELECT USING (true);
CREATE POLICY "Admins can manage pages" ON page_registry FOR ALL TO authenticated 
  USING (has_role('admin', auth.uid()) OR has_role('editor', auth.uid()));

-- Segment Registry Policies
CREATE POLICY "Segments viewable by all" ON segment_registry FOR SELECT USING (true);
CREATE POLICY "Admins can manage segments" ON segment_registry FOR ALL TO authenticated 
  USING (has_role('admin', auth.uid()) OR has_role('editor', auth.uid()));

-- Page Content Policies
CREATE POLICY "Content viewable by all" ON page_content FOR SELECT USING (true);
CREATE POLICY "Admins can manage content" ON page_content FOR ALL TO authenticated 
  USING (has_role('admin', auth.uid()) OR has_role('editor', auth.uid()));

-- User Roles Policies
CREATE POLICY "Admins can view roles" ON user_roles FOR SELECT TO authenticated 
  USING (has_role('admin', auth.uid()));
CREATE POLICY "Admins can manage roles" ON user_roles FOR ALL TO authenticated 
  USING (has_role('admin', auth.uid()));
\`\`\`

${config.enableNews ? `### 3. News-Modul
\`\`\`sql
CREATE TABLE public.news_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  teaser TEXT NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT NOT NULL,
  category TEXT,
  author TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  language TEXT DEFAULT 'de',
  published BOOLEAN DEFAULT false,
  visibility TEXT DEFAULT 'public',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE news_articles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "News viewable when published" ON news_articles FOR SELECT USING (published = true OR has_role('admin', auth.uid()) OR has_role('editor', auth.uid()));
CREATE POLICY "Admins can manage news" ON news_articles FOR ALL TO authenticated USING (has_role('admin', auth.uid()) OR has_role('editor', auth.uid()));
\`\`\`` : ''}

${config.enableEvents ? `### 4. Events-Modul
\`\`\`sql
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  teaser TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  category TEXT DEFAULT 'messe',
  date DATE NOT NULL,
  time_start TEXT NOT NULL,
  time_end TEXT,
  location_venue TEXT,
  location_city TEXT NOT NULL,
  location_country TEXT NOT NULL,
  location_coordinates POINT,
  is_online BOOLEAN DEFAULT false,
  external_url TEXT,
  max_participants INTEGER,
  registration_deadline DATE,
  language_code TEXT DEFAULT 'de',
  published BOOLEAN DEFAULT false,
  visibility TEXT DEFAULT 'public',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.event_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_slug TEXT NOT NULL,
  event_title TEXT NOT NULL,
  event_date DATE NOT NULL,
  event_location TEXT NOT NULL,
  evt_image_url TEXT,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT NOT NULL,
  position TEXT NOT NULL,
  phone TEXT,
  industry TEXT,
  current_test_systems TEXT,
  automotive_interests TEXT[],
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Events viewable when published" ON events FOR SELECT USING (published = true OR has_role('admin', auth.uid()));
CREATE POLICY "Registrations insertable" ON event_registrations FOR INSERT WITH CHECK (true);
\`\`\`` : ''}

${config.enableDownloads ? `### 5. Downloads-Modul
\`\`\`sql
CREATE TABLE public.downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  teaser TEXT NOT NULL,
  description TEXT,
  download_type TEXT NOT NULL,
  download_url TEXT,
  image_url TEXT,
  category TEXT,
  pages INTEGER,
  duration TEXT,
  language_code TEXT DEFAULT 'de',
  publish_date DATE DEFAULT CURRENT_DATE,
  published BOOLEAN DEFAULT false,
  visibility TEXT DEFAULT 'public',
  position INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.download_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id TEXT NOT NULL,
  item_title TEXT NOT NULL,
  download_type TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT NOT NULL,
  position TEXT NOT NULL,
  consent BOOLEAN DEFAULT false,
  category_tag TEXT,
  title_tag TEXT,
  dl_title TEXT,
  dl_type TEXT,
  dl_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE download_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Downloads viewable when published" ON downloads FOR SELECT USING (published = true OR has_role('admin', auth.uid()));
CREATE POLICY "Download requests insertable" ON download_requests FOR INSERT WITH CHECK (true);
\`\`\`` : ''}

${config.enableProducts ? `### 6. Produkte-Modul
\`\`\`sql
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  teaser TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  category TEXT DEFAULT 'standard',
  subcategory TEXT,
  sku TEXT,
  price_info TEXT,
  availability TEXT,
  features JSONB DEFAULT '[]',
  specifications JSONB DEFAULT '{}',
  applications JSONB DEFAULT '[]',
  gallery_images JSONB DEFAULT '[]',
  documents JSONB DEFAULT '[]',
  related_products JSONB DEFAULT '[]',
  video_url TEXT,
  language_code TEXT DEFAULT 'de',
  published BOOLEAN DEFAULT false,
  visibility TEXT DEFAULT 'public',
  position INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Products viewable when published" ON products FOR SELECT USING (published = true OR has_role('admin', auth.uid()));
CREATE POLICY "Admins can manage products" ON products FOR ALL TO authenticated USING (has_role('admin', auth.uid()));
\`\`\`` : ''}

${config.enableNewsletterMautic ? `### 7. Newsletter-Modul (Mautic)
\`\`\`sql
CREATE TABLE public.newsletter_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  first_name TEXT NOT NULL,
  language TEXT DEFAULT 'de',
  topics TEXT[],
  confirmed BOOLEAN DEFAULT false,
  mautic_contact_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE newsletter_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Newsletter subscriptions insertable" ON newsletter_subscriptions FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view subscriptions" ON newsletter_subscriptions FOR SELECT TO authenticated USING (has_role('admin', auth.uid()));
\`\`\`` : ''}

${config.enableContact ? `### 8. Kontakt-Modul
\`\`\`sql
CREATE TABLE public.contact_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Contact submissions insertable" ON contact_submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view contacts" ON contact_submissions FOR SELECT TO authenticated USING (has_role('admin', auth.uid()));
\`\`\`` : ''}

---

## 📁 STORAGE BUCKETS

Bitte erstelle diese Storage Buckets:
- \`page-images\` (public) - Für Seiten-Bilder
- \`cms-media\` (public) - Für CMS-Medien
- \`user-uploads\` (private) - Für private Uploads

---

## 🎨 DESIGN SYSTEM & FONTS

### index.html - Fonts einbinden
Füge im \`<head>\` ein:
\`\`\`html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
\`\`\`

### tailwind.config.ts - Font-Konfiguration
Erweitere \`theme.extend.fontFamily\`:
\`\`\`typescript
fontFamily: {
  'inter': ['Inter', 'sans-serif'],
  'sans': ['Inter', 'sans-serif'],
},
\`\`\`

### index.css - CSS-Variablen (Auth Dark Theme)
Füge diese Variablen in \`:root\` hinzu:
\`\`\`css
/* Spade CMS Auth Dark Theme */
--auth-background: 220 20% 6%;
--auth-card: 220 25% 8%;
--auth-border: 220 15% 15%;
--auth-input: 220 15% 15%;
--auth-muted: 215 20% 65%;
--spade-yellow: 52 95% 56%;
--spade-blue: 211 77% 28%;
\`\`\`

---

## 🔐 AUTH-KOMPONENTE

Erstelle \`src/pages/Auth.tsx\`:
\`\`\`typescript
import { useState, useEffect } from "react";
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
import { siteConfig } from "@/config/siteConfig";

// Spade CMS Logo (als Data-URL oder importieren)
const SPADE_CMS_LOGO = "https://afrcagkprhtvvucukubf.supabase.co/storage/v1/object/public/cms-media/spade-cms-logo.png";
const CMS_VERSION = "1.2.6";

const Auth = () => {
  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          setTimeout(() => navigate("/admin-dashboard"), 0);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) navigate("/admin-dashboard");
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

    const { error } = await supabase.auth.signInWithPassword({
      email: loginIdentifier,
      password,
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
          {/* Spade CMS Logo + Version */}
          <div className="flex justify-center">
            <div className="bg-white rounded-xl px-6 py-4 shadow-lg flex items-center justify-between gap-6 w-full">
              <img src={SPADE_CMS_LOGO} alt="SpadeCMS" className="h-20 w-auto" />
              <Badge 
                variant="outline" 
                className="bg-[#4B7BF5] text-white border-[#4B7BF5] text-[10px] font-semibold px-2 py-0.5"
              >
                v{CMS_VERSION}
              </Badge>
            </div>
          </div>
          
          <div className="border-t border-zinc-700 my-4" />
          
          {/* Tenant Logo */}
          <div className="flex justify-center">
            <img 
              src={siteConfig.branding.logos.primary} 
              alt={siteConfig.tenant.name} 
              className="h-16 w-auto"
            />
          </div>
          
          <CardTitle className="text-2xl text-center text-white">Login</CardTitle>
          <CardDescription className="text-center text-zinc-400">
            Melden Sie sich an, um auf das Admin-Panel zuzugreifen
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="loginIdentifier" className="text-zinc-300">E-Mail</Label>
              <Input
                id="loginIdentifier"
                type="email"
                placeholder="email@beispiel.de"
                value={loginIdentifier}
                onChange={(e) => setLoginIdentifier(e.target.value)}
                disabled={loading}
                required
                className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-zinc-300">Passwort</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                  className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200"
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
              {loading ? "Bitte warten..." : "Login"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
\`\`\`

---

## 🔐 SECRETS (Falls benötigt)

${config.enableResend ? `- **RESEND_API_KEY**: Für E-Mail-Versand (in Lovable Settings → Secrets)` : ''}
${config.enableMautic ? `- **MAUTIC_BASE_URL**, **MAUTIC_USER**, **MAUTIC_PASS**: Für Marketing Automation` : ''}

---

## 📄 SITECONFIG.TS

Erstelle die Datei \`src/config/siteConfig.ts\`:

\`\`\`typescript
export const siteConfig = {
  tenant: {
    id: '${tenantId}',
    name: '${config.projectName || 'Mein Projekt'}',
    legalName: '${config.legalName || 'Mein Unternehmen GmbH'}',
    tagline: '${config.tagline || 'Ihr Slogan'}',
  },
  branding: {
    logos: {
      primary: '/logos/${tenantId}-logo.svg',
      inverted: '/logos/${tenantId}-logo-dark.svg',
      icon: '/favicon.svg',
    },
    colors: {
      primary: '${config.primaryColor}',
      accent: '${config.accentColor}',
    },
    fonts: {
      heading: '${config.headingFont}',
      body: '${config.bodyFont}',
    },
  },
  contact: {
    email: '${config.email || 'info@beispiel.de'}',
    phone: '${config.phone}',
    address: {
      street: '${config.street}',
      city: '${config.city}',
      zip: '${config.zip}',
      country: '${config.country}',
    },
  },
  social: {
    ${config.linkedin ? `linkedin: '${config.linkedin}',` : 'linkedin: null,'}
    ${config.twitter ? `twitter: '${config.twitter}',` : 'twitter: null,'}
    ${config.youtube ? `youtube: '${config.youtube}',` : 'youtube: null,'}
  },
  seo: {
    defaultTitle: '${config.projectName || 'Mein Projekt'}',
    titleTemplate: '%s | ${config.projectName || 'Mein Projekt'}',
    defaultDescription: '${config.description || 'Projektbeschreibung'}',
  },
  features: {
    modules: {
      news: ${config.enableNews},
      newsletterMautic: ${config.enableNewsletterMautic},
      events: ${config.enableEvents},
      downloads: ${config.enableDownloads},
      products: ${config.enableProducts},
      seoTools: ${config.enableSeoTools},
      glossary: ${config.enableGlossary},
      contact: ${config.enableContact},
    },
    languages: ${JSON.stringify(languages)},
    defaultLanguage: '${config.defaultLanguage}',
    frontendEditing: true,
  },
  integrations: {
    mautic: { enabled: ${config.enableMautic} },
    resend: { enabled: ${config.enableResend}, fromEmail: '${config.resendFromEmail || 'noreply@' + tenantId + '.de'}' },
  },
  storage: {
    mediaBucket: 'cms-media',
    publicBucket: 'page-images',
  },
} as const;

export type SiteConfig = typeof siteConfig;
export const isModuleEnabled = (module: keyof typeof siteConfig.features.modules) => siteConfig.features.modules[module];
export const getPageTitle = (title?: string) => title ? siteConfig.seo.titleTemplate.replace('%s', title) : siteConfig.seo.defaultTitle;
\`\`\`

---

## 🛤️ ROUTING SETUP

Füge in deinem Router (z.B. \`App.tsx\` oder \`main.tsx\`) diese Route hinzu:
\`\`\`typescript
import Auth from "@/pages/Auth";

// In deinem Router:
<Route path="/auth" element={<Auth />} />
\`\`\`

---

## 🚀 NÄCHSTE SCHRITTE

Nach der Installation:

1. **Datenbank-Migration ausführen**: Führe das obige SQL-Script aus.

2. **Auto-Confirm aktivieren**: In Lovable Cloud → Auth Settings → "Confirm Email" deaktivieren für schnelleres Testen.

3. **Ersten User registrieren**: Öffne \`/auth\`, registriere dich, und mache dich zum Admin:
   \`\`\`sql
   UPDATE user_roles SET role = 'admin' WHERE user_id = 'DEINE_USER_ID';
   \`\`\`

4. **Tenant-Logo hochladen**: Lade dein Logo in den \`cms-media\` Bucket und aktualisiere den Pfad in \`siteConfig.ts\`.

5. **Testen**: Öffne \`/auth\` und logge dich ein. Du solltest zum Admin-Dashboard weitergeleitet werden.

---

## ⚠️ WICHTIGE HINWEISE

- **Design bleibt erhalten**: Das bestehende Frontend-Design wird NICHT überschrieben!
- **CMS als Backend-Layer**: Das Spade CMS integriert sich als Backend, nicht als Ersatz.
- **Spade CMS Branding**: Die Auth-Seite zeigt immer das Spade CMS Logo (h-20) + dein Tenant-Logo (h-16).
- **Version**: ${`v1.2.6`} - Multi-Tenancy Ready
`;
  };

  const handleCopy = async () => {
    const prompt = generatePrompt();
    await navigator.clipboard.writeText(prompt);
    setCopied(true);
    toast.success("Export-Kit Prompt kopiert! Füge ihn in dein Zielprojekt ein.");
    setTimeout(() => setCopied(false), 3000);
  };

  const handlePreview = () => {
    setGeneratedPrompt(generatePrompt());
    setPreviewOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-br from-emerald-500/20 to-zinc-900 border-emerald-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-white text-2xl">
            <Rocket className="h-6 w-6 text-emerald-400" />
            Export-Kit für bestehende Projekte
          </CardTitle>
          <CardDescription className="text-zinc-300 text-lg">
            Generiere einen Starter-Prompt, um das Spade CMS auf ein bestehendes Lovable-Projekt zu installieren.
            Dein bestehendes Design bleibt erhalten!
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Configuration Form */}
      <Accordion type="multiple" defaultValue={["tenant", "features"]} className="space-y-4">
        {/* Tenant Info */}
        <AccordionItem value="tenant" className="bg-zinc-900 border-zinc-800 rounded-lg">
          <AccordionTrigger className="px-6 text-white hover:no-underline">
            <div className="flex items-center gap-3">
              <Settings className="h-5 w-5 text-blue-400" />
              <span className="text-lg">Projekt-Informationen</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-zinc-300">Projektname *</Label>
                <Input
                  value={config.projectName}
                  onChange={e => updateConfig('projectName', e.target.value)}
                  placeholder="z.B. Aftermarket Update"
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-300">Rechtlicher Name</Label>
                <Input
                  value={config.legalName}
                  onChange={e => updateConfig('legalName', e.target.value)}
                  placeholder="z.B. Aftermarket Update Media GmbH"
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-300">Tagline</Label>
                <Input
                  value={config.tagline}
                  onChange={e => updateConfig('tagline', e.target.value)}
                  placeholder="z.B. Das Fachportal für den Kfz-Teilehandel"
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-300">SEO-Beschreibung</Label>
                <Input
                  value={config.description}
                  onChange={e => updateConfig('description', e.target.value)}
                  placeholder="Kurze Beschreibung für Suchmaschinen"
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Features */}
        <AccordionItem value="features" className="bg-zinc-900 border-zinc-800 rounded-lg">
          <AccordionTrigger className="px-6 text-white hover:no-underline">
            <div className="flex items-center gap-3">
              <Package className="h-5 w-5 text-purple-400" />
              <span className="text-lg">Module & Features</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { key: 'enableNews', label: 'News-Artikel', icon: '📰' },
                { key: 'enableNewsletterMautic', label: 'Newsletter (Mautic)', icon: '📧' },
                { key: 'enableEvents', label: 'Events', icon: '📅' },
                { key: 'enableDownloads', label: 'Downloads', icon: '📥' },
                { key: 'enableProducts', label: 'Produkte', icon: '📦' },
                { key: 'enableContact', label: 'Kontakt', icon: '💬' },
                { key: 'enableSeoTools', label: 'SEO-Tools', icon: '🔍' },
                { key: 'enableGlossary', label: 'Glossar', icon: '📖' },
              ].map(({ key, label, icon }) => (
                <div key={key} className="flex items-center justify-between bg-zinc-800/50 p-3 rounded-lg">
                  <span className="text-zinc-300">{icon} {label}</span>
                  <Switch
                    checked={config[key as keyof TenantConfig] as boolean}
                    onCheckedChange={checked => updateConfig(key as keyof TenantConfig, checked)}
                  />
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Branding */}
        <AccordionItem value="branding" className="bg-zinc-900 border-zinc-800 rounded-lg">
          <AccordionTrigger className="px-6 text-white hover:no-underline">
            <div className="flex items-center gap-3">
              <Palette className="h-5 w-5 text-pink-400" />
              <span className="text-lg">Branding & Design</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-zinc-300">Primärfarbe (HSL)</Label>
                <Input
                  value={config.primaryColor}
                  onChange={e => updateConfig('primaryColor', e.target.value)}
                  placeholder="z.B. 220 70% 50%"
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
                <p className="text-xs text-zinc-500">Format: H S% L% (ohne Kommas)</p>
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-300">Akzentfarbe (HSL)</Label>
                <Input
                  value={config.accentColor}
                  onChange={e => updateConfig('accentColor', e.target.value)}
                  placeholder="z.B. 45 100% 50%"
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-300">Heading-Font</Label>
                <Input
                  value={config.headingFont}
                  onChange={e => updateConfig('headingFont', e.target.value)}
                  placeholder="z.B. Playfair Display, serif"
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-300">Body-Font</Label>
                <Input
                  value={config.bodyFont}
                  onChange={e => updateConfig('bodyFont', e.target.value)}
                  placeholder="z.B. Inter, sans-serif"
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Contact */}
        <AccordionItem value="contact" className="bg-zinc-900 border-zinc-800 rounded-lg">
          <AccordionTrigger className="px-6 text-white hover:no-underline">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-yellow-400" />
              <span className="text-lg">Kontakt & Social Media</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-zinc-300">E-Mail</Label>
                <Input
                  value={config.email}
                  onChange={e => updateConfig('email', e.target.value)}
                  placeholder="info@beispiel.de"
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-300">Telefon</Label>
                <Input
                  value={config.phone}
                  onChange={e => updateConfig('phone', e.target.value)}
                  placeholder="+49 123 456789"
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-300">LinkedIn</Label>
                <Input
                  value={config.linkedin}
                  onChange={e => updateConfig('linkedin', e.target.value)}
                  placeholder="https://linkedin.com/company/..."
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-300">Twitter</Label>
                <Input
                  value={config.twitter}
                  onChange={e => updateConfig('twitter', e.target.value)}
                  placeholder="https://twitter.com/..."
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Integrations */}
        <AccordionItem value="integrations" className="bg-zinc-900 border-zinc-800 rounded-lg">
          <AccordionTrigger className="px-6 text-white hover:no-underline">
            <div className="flex items-center gap-3">
              <Globe className="h-5 w-5 text-cyan-400" />
              <span className="text-lg">Integrationen</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-zinc-800/50 p-4 rounded-lg">
                <div>
                  <span className="text-white font-medium">Resend (E-Mail-Versand)</span>
                  <p className="text-sm text-zinc-400">Für Kontaktformulare, Download-Links, etc.</p>
                </div>
                <Switch
                  checked={config.enableResend}
                  onCheckedChange={checked => updateConfig('enableResend', checked)}
                />
              </div>
              {config.enableResend && (
                <div className="space-y-2 ml-4">
                  <Label className="text-zinc-300">Absender E-Mail</Label>
                  <Input
                    value={config.resendFromEmail}
                    onChange={e => updateConfig('resendFromEmail', e.target.value)}
                    placeholder="noreply@deinprojekt.de"
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>
              )}
              <div className="flex items-center justify-between bg-zinc-800/50 p-4 rounded-lg">
                <div>
                  <span className="text-white font-medium">Mautic (Marketing Automation)</span>
                  <p className="text-sm text-zinc-400">Für Newsletter-Integration & Lead-Tracking</p>
                </div>
                <Switch
                  checked={config.enableMautic}
                  onCheckedChange={checked => updateConfig('enableMautic', checked)}
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Action Buttons */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <Button
              onClick={handlePreview}
              variant="outline"
              size="lg"
              className="border-zinc-700 hover:bg-zinc-800 text-lg"
            >
              <Eye className="h-5 w-5 mr-2" />
              Prompt ansehen
            </Button>
            <Button
              onClick={handleCopy}
              size="lg"
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-lg"
              disabled={!config.projectName}
            >
              {copied ? (
                <>
                  <Check className="h-5 w-5 mr-2" />
                  Kopiert!
                </>
              ) : (
                <>
                  <Copy className="h-5 w-5 mr-2" />
                  Export-Kit Prompt kopieren
                </>
              )}
            </Button>
          </div>
          {!config.projectName && (
            <p className="text-sm text-amber-400 mt-3">
              ⚠️ Bitte gib mindestens einen Projektnamen ein
            </p>
          )}
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white text-lg flex items-center gap-2">
            <FileCode className="h-5 w-5 text-blue-400" />
            So verwendest du das Export-Kit
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-zinc-300">
          <div className="flex gap-3">
            <Badge className="bg-blue-500/20 text-blue-300 border-0">1</Badge>
            <span>Fülle die Konfiguration oben aus (mindestens Projektname)</span>
          </div>
          <div className="flex gap-3">
            <Badge className="bg-blue-500/20 text-blue-300 border-0">2</Badge>
            <span>Klicke auf "Export-Kit Prompt kopieren"</span>
          </div>
          <div className="flex gap-3">
            <Badge className="bg-blue-500/20 text-blue-300 border-0">3</Badge>
            <span>Öffne dein bestehendes Lovable-Projekt</span>
          </div>
          <div className="flex gap-3">
            <Badge className="bg-blue-500/20 text-blue-300 border-0">4</Badge>
            <span>Füge den kopierten Prompt in den Chat ein und sende ihn ab</span>
          </div>
          <div className="flex gap-3">
            <Badge className="bg-blue-500/20 text-blue-300 border-0">5</Badge>
            <span>Lovable führt die Installation durch und erstellt alle nötigen Strukturen</span>
          </div>
        </CardContent>
      </Card>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[85vh] bg-zinc-900 border-zinc-700">
          <DialogHeader>
            <DialogTitle className="text-white">Export-Kit Prompt Vorschau</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Dieser Prompt wird in das Zielprojekt eingefügt
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[60vh]">
            <pre className="text-xs bg-zinc-950 p-4 rounded-lg overflow-x-auto text-zinc-300 whitespace-pre-wrap">
              {generatedPrompt}
            </pre>
          </ScrollArea>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setPreviewOpen(false)} className="border-zinc-700">
              Schließen
            </Button>
            <Button onClick={handleCopy} className="bg-emerald-600 hover:bg-emerald-700">
              <Copy className="w-4 h-4 mr-2" />
              Kopieren
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExportKitGenerator;
