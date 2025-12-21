# CMS Setup Guide

Diese Dokumentation beschreibt, wie das CMS auf ein neues Projekt ausgerollt werden kann.

## Inhaltsverzeichnis

1. [Übersicht](#übersicht)
2. [Voraussetzungen](#voraussetzungen)
3. [Schritt-für-Schritt Installation](#schritt-für-schritt-installation)
4. [Konfiguration](#konfiguration)
5. [Datenbank-Setup](#datenbank-setup)
6. [Anpassungen](#anpassungen)
7. [Fehlerbehebung](#fehlerbehebung)

---

## Übersicht

Das CMS besteht aus folgenden Hauptkomponenten:

### Dateistruktur

```
src/
├── components/
│   └── admin/
│       ├── dashboard/                    # CMS Dashboard Komponenten
│       │   ├── AdminConstants.ts         # Konstanten und Labels
│       │   ├── AdminErrorBoundary.tsx    # Error Boundary
│       │   ├── AdminHeader.tsx           # Header Komponente
│       │   ├── config.ts                 # ⭐ KONFIGURATION
│       │   ├── types.ts                  # TypeScript Typen
│       │   ├── DynamicSegmentRenderer.tsx
│       │   ├── TemplateSelectionDialog.tsx
│       │   ├── DesignElementDialog.tsx
│       │   ├── NavigationCtaDialog.tsx
│       │   ├── FlyoutContentDialog.tsx
│       │   ├── WelcomeTab.tsx
│       │   ├── SortableTab.tsx
│       │   ├── cmsPageUtils.tsx
│       │   ├── contentLoadingUtils.ts
│       │   ├── imageUploadUtils.ts
│       │   ├── pageRegistryUtils.ts
│       │   ├── saveContentUtils.ts
│       │   ├── segmentManagementUtils.ts
│       │   ├── segmentOperationsUtils.ts
│       │   ├── segmentRegistryUtils.ts
│       │   ├── segmentUtils.ts
│       │   └── index.ts
│       ├── ActionHeroEditor.tsx          # Segment Editoren
│       ├── BannerEditor.tsx
│       ├── FAQEditor.tsx
│       ├── FeatureOverviewEditor.tsx
│       ├── FooterEditor.tsx
│       ├── FullHeroEditor.tsx
│       ├── ImageTextEditor.tsx
│       ├── IntroEditor.tsx
│       ├── ProductHeroEditor.tsx
│       ├── SEOEditor.tsx
│       ├── SpecificationEditor.tsx
│       ├── TableEditor.tsx
│       ├── TilesSegmentEditor.tsx
│       ├── VideoSegmentEditor.tsx
│       └── ...
│   └── segments/                         # Frontend Segment Renderer
│       ├── ActionHero.tsx
│       ├── BannerP.tsx
│       ├── DownloadsSegment.tsx
│       ├── EventsSegment.tsx
│       ├── FAQ.tsx
│       ├── FeatureOverview.tsx
│       ├── FullHero.tsx
│       ├── IndustriesSegment.tsx
│       ├── Intro.tsx
│       ├── MetaNavigation.tsx
│       ├── NewsListSegment.tsx
│       ├── NewsSegment.tsx
│       ├── ProductHeroGallery.tsx
│       ├── ProductListSegment.tsx
│       ├── Specification.tsx
│       ├── Table.tsx
│       └── Video.tsx
├── hooks/
│   ├── useAdminAuth.ts                   # Admin Authentifizierung
│   ├── useAdminAutosave.ts               # Auto-Save Hook
│   └── useAdminPageState.ts              # Page State Management
├── pages/
│   ├── AdminDashboard.tsx                # Haupt-Admin Seite
│   └── DynamicCMSPage.tsx                # Frontend CMS Renderer
└── types/
    └── imageMetadata.ts                  # Bild-Metadaten Typen
```

---

## Voraussetzungen

### Technische Anforderungen

- React 18+
- TypeScript 5+
- Vite
- Tailwind CSS
- shadcn/ui Komponenten
- Supabase (Cloud oder Self-Hosted)

### Benötigte Dependencies

```json
{
  "@dnd-kit/core": "^6.3.1",
  "@dnd-kit/sortable": "^10.0.0",
  "@dnd-kit/utilities": "^3.2.2",
  "@supabase/supabase-js": "^2.76.1",
  "@tiptap/extension-image": "^3.10.7",
  "@tiptap/extension-link": "^3.10.7",
  "@tiptap/react": "^3.10.7",
  "@tiptap/starter-kit": "^3.10.7",
  "lucide-react": "^0.462.0",
  "sonner": "^1.5.0"
}
```

---

## Schritt-für-Schritt Installation

### 1. Dateien kopieren

Kopiere alle Dateien aus den folgenden Verzeichnissen:

```bash
# CMS Admin Komponenten
cp -r src/components/admin/* [ZIEL]/src/components/admin/

# Frontend Segment Renderer
cp -r src/components/segments/* [ZIEL]/src/components/segments/

# Hooks
cp src/hooks/useAdminAuth.ts [ZIEL]/src/hooks/
cp src/hooks/useAdminAutosave.ts [ZIEL]/src/hooks/
cp src/hooks/useAdminPageState.ts [ZIEL]/src/hooks/

# Seiten
cp src/pages/AdminDashboard.tsx [ZIEL]/src/pages/
cp src/pages/DynamicCMSPage.tsx [ZIEL]/src/pages/

# Types
cp src/types/imageMetadata.ts [ZIEL]/src/types/
```

### 2. Routes konfigurieren

Füge in `App.tsx` hinzu:

```tsx
import AdminDashboard from "@/pages/AdminDashboard";
import DynamicCMSPage from "@/pages/DynamicCMSPage";

// In den Routes:
<Route path="/:lang/admin-dashboard" element={<AdminDashboard />} />
<Route path="/:lang/:pageSlug" element={<DynamicCMSPage />} />
```

### 3. Dependencies installieren

```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-link @tiptap/extension-image
```

---

## Konfiguration

### Hauptkonfiguration: `config.ts`

Die wichtigste Konfigurationsdatei ist `src/components/admin/dashboard/config.ts`.

#### Sprachen anpassen

```typescript
export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  // Weitere Sprachen hinzufügen oder entfernen
];
```

#### Segmente aktivieren/deaktivieren

```typescript
export const CMS_FEATURES = {
  splitScreenTranslation: true,
  versionHistory: true,
  glossary: true,
  seoEditor: true,
  designElements: true,
  ctaConfig: true,
  flyoutContent: true,
  autoSave: true,
  segmentCopy: true,
  debugSegments: false, // Nur für Entwicklung
};
```

#### Upload-Limits anpassen

```typescript
export const MAX_IMAGE_SIZE_MB = 5;
export const PAGE_IMAGES_BUCKET = 'page-images';
```

---

## Datenbank-Setup

### Benötigte Tabellen

Das CMS benötigt folgende Supabase-Tabellen:

#### 1. `page_registry`

```sql
CREATE TABLE page_registry (
  id SERIAL PRIMARY KEY,
  page_id INTEGER NOT NULL,
  page_slug TEXT NOT NULL,
  page_title TEXT NOT NULL,
  parent_slug TEXT,
  parent_id INTEGER,
  position INTEGER,
  design_icon TEXT,
  flyout_image_url TEXT,
  flyout_description TEXT,
  flyout_description_translations JSONB DEFAULT '{}',
  cta_group TEXT,
  cta_label TEXT,
  cta_icon TEXT,
  target_page_slug TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 2. `segment_registry`

```sql
CREATE TABLE segment_registry (
  id SERIAL PRIMARY KEY,
  page_slug TEXT NOT NULL,
  segment_id INTEGER NOT NULL,
  segment_key TEXT NOT NULL,
  segment_type TEXT NOT NULL,
  position INTEGER,
  is_static BOOLEAN DEFAULT FALSE,
  deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 3. `page_content`

```sql
CREATE TABLE page_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_slug TEXT NOT NULL,
  section_key TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'en',
  content_type TEXT NOT NULL,
  content_value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID,
  UNIQUE(page_slug, section_key, language)
);
```

#### 4. `page_content_backups`

```sql
CREATE TABLE page_content_backups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_slug TEXT NOT NULL,
  section_key TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'en',
  content_type TEXT NOT NULL,
  content_value TEXT NOT NULL,
  original_updated_at TIMESTAMPTZ,
  original_updated_by UUID,
  backup_created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 5. `user_roles`

```sql
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enum für Rollen
CREATE TYPE app_role AS ENUM ('admin', 'editor', 'user');
```

#### 6. `editor_page_access`

```sql
CREATE TABLE editor_page_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  page_slug TEXT NOT NULL,
  language_code TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### RLS Policies

```sql
-- page_content: Jeder kann lesen, nur Admins/Editoren können schreiben
ALTER TABLE page_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view page content" 
ON page_content FOR SELECT USING (true);

CREATE POLICY "Admins and editors can manage page content"
ON page_content FOR ALL 
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'editor'));
```

### Storage Bucket

```sql
-- Erstelle Storage Bucket für Bilder
INSERT INTO storage.buckets (id, name, public) 
VALUES ('page-images', 'page-images', true);

-- Policy für Uploads
CREATE POLICY "Admins and editors can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'page-images' AND
  (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'editor'))
);
```

---

## Anpassungen

### Neue Segment-Typen hinzufügen

1. **Editor erstellen** (`src/components/admin/NewSegmentEditor.tsx`)
2. **Frontend Renderer erstellen** (`src/components/segments/NewSegment.tsx`)
3. **In `config.ts` registrieren**:

```typescript
export const SEGMENT_CONFIG: Record<SegmentType, {...}> = {
  // ...
  'new-segment': {
    label: 'Neues Segment',
    shortCode: 'NS',
    category: 'content',
    allowMultiple: true,
    description: 'Beschreibung'
  }
};
```

4. **In `DynamicSegmentRenderer.tsx` hinzufügen**
5. **In `DynamicCMSPage.tsx` hinzufügen**

### Branding anpassen

Die CMS-Farben sind in den Tailwind-Klassen definiert:

- Primärfarbe: `#f9dc24` (Gelb)
- Hintergrund: `bg-gray-800`, `bg-gray-700`
- Text: `text-white`, `text-gray-300`

Suche nach diesen Werten und ersetze sie mit deinem Branding.

---

## Fehlerbehebung

### Häufige Probleme

#### "Page not found" im Admin

- Prüfe, ob `page_registry` Einträge hat
- Prüfe RLS Policies

#### Bilder werden nicht hochgeladen

- Prüfe Storage Bucket `page-images`
- Prüfe Storage Policies
- Prüfe `MAX_IMAGE_SIZE_MB` in config.ts

#### Segmente werden nicht gespeichert

- Prüfe `segment_registry` Tabelle
- Prüfe `page_content` Tabelle
- Prüfe RLS Policies

#### User hat keinen Zugriff

- Prüfe `user_roles` Tabelle
- Prüfe `editor_page_access` für Editoren

---

## Support

Bei Fragen oder Problemen:

1. Prüfe die Browser-Konsole auf Fehler
2. Prüfe die Supabase-Logs
3. Prüfe die RLS Policies

---

## Version

CMS Version: **0.9.3**

Letzte Aktualisierung: 2025-12-21
