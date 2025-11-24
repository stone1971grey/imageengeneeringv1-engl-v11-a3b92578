# CMS Setup Protocol - Universal Dynamic Page System (UDPS) mit Vollautomatik

Dieses Protokoll beschreibt den vollautomatischen, fehlerfreien Workflow zur Einrichtung einer neuen CMS-Seite im **Universal Dynamic Page System (UDPS)** mit **Universal Dynamic Architecture (UDA)**.

---

## 📊 System-Hierarchie & URL-Struktur

### Wichtige Prinzipien:
- **Eindeutige Page IDs:** Jede Seite hat eine unique ID (niemals wiederverwendet)
- **Lücken erlaubt:** IDs müssen nicht lückenlos sein (z.B. 1, 2, 9, 10, 20, 307)
- **No-Reuse-Policy:** Gelöschte IDs werden NIE neu vergeben
- **Hierarchische URLs:** URLs folgen der Navigationsstruktur (Parent-Slugs als Präfix)

### Komplette Seitenhierarchie:

```
📁 Homepage (ID: 1) → /
│
├── 📁 Your Solution (ID: 2) → /your-solution
│   ├── 📄 Photography (ID: 9) → /your-solution/photography [CMS]
│   ├── 📁 Scanners & Archiving (ID: 10) → /your-solution/scanners-archiving [CMS]
│   │   ├── 📄 Universal Test Target (ID: 239) → /your-solution/scanners-archiving/universal-test-target [CMS]
│   │   ├── 📄 ISO 21550 (ID: 260) → /your-solution/scanners-archiving/iso-21550 [CMS]
│   │   └── 📄 Multispectral Illumination (ID: 261) → /your-solution/scanners-archiving/multispectral-illumination [CMS]
│   ├── 📄 Medical & Endoscopy (ID: 11) → /your-solution/medical-endoscopy [CMS]
│   ├── 📄 Web Camera (ID: 12) → /your-solution/web-camera [CMS]
│   ├── 📁 Machine Vision (ID: 13) → /your-solution/machine-vision [CMS]
│   │   └── 📄 Lens Distortion (ID: 241) → /your-solution/machine-vision/lens-distortion [CMS]
│   ├── 📁 Automotive (ID: 14) → /your-solution/automotive [CMS]
│   │   └── 📄 In-Cabin Testing (ID: 19) → /your-solution/automotive/in-cabin-testing [CMS]
│   ├── 📁 Mobile Phone (ID: 20) → /your-solution/mobile-phone [CMS]
│   │   ├── 📄 Color Calibration (ID: 286) → /your-solution/mobile-phone/color-calibration [CMS]
│   │   └── 📄 ISP Tuning (ID: 307) → /your-solution/mobile-phone/isp-tuning [CMS]
│   ├── 📄 Broadcast & Video (ID: 221) → /your-solution/broadcast-video [CMS]
│   └── 📄 Security & Surveillance (ID: 222) → /your-solution/security-surveillance [CMS]
│
├── 📁 Products (ID: 3) → /products
│   ├── 📁 Test Charts (ID: 15) → /products/test-charts
│   │   ├── 📄 LE7 (ID: 17) → /products/test-charts/le7 [CMS]
│   │   ├── 📄 TE42-LL (ID: 225) → /products/test-charts/te42-ll [CMS]
│   │   ├── 📄 TE292 (ID: 226) → /products/test-charts/te292 [CMS]
│   │   ├── 📄 TE294 (ID: 227) → /products/test-charts/te294 [CMS]
│   │   └── 📄 TE42 (ID: 228) → /products/test-charts/te42 [CMS]
│   ├── 📁 Illumination Devices (ID: 16) → /products/illumination-devices
│   │   ├── 📄 Arcturus (ID: 18) → /products/illumination-devices/arcturus [CMS]
│   │   └── 📄 iQ-LED (ID: 21) → /products/illumination/iq-led [CMS]
│   ├── 📁 Software (ID: 223) → /products/software
│   │   ├── 📄 iQ-Analyzer (ID: 229) → /products/software/iq-analyzer [Static]
│   │   ├── 📄 Camspecs (ID: 230) → /products/software/camspecs [Static]
│   │   └── 📄 VEGA (ID: 231) → /products/software/vega [Static]
│   └── 📁 Bundles & Services (ID: 224) → /products/bundles-services
│       └── 📄 IEEE P2020 Bundle (ID: 232) → /products/bundles-services/product-bundle-ieee [Static]
│
├── 📄 Downloads (ID: 4) → /downloads [Static]
├── 📄 Events (ID: 5) → /events [Static]
├── 📄 News (ID: 6) → /news [Static]
├── 📄 Inside Lab (ID: 7) → /inside-lab [Static]
├── 📄 Contact (ID: 8) → /contact [Static]
└── 📄 ADAS Testing (ID: 233) → /adas-testing [Static]
```

### Legende:
- **[CMS]** = Seite wird über CMS verwaltet (Universal Dynamic Page System)
- **[Static]** = Statische React-Komponente (nicht im CMS)
- **📁** = Parent-Kategorie (hat Unterseiten)
- **📄** = Einzelseite

### ID-Vergabe-Regeln:
1. **Fortlaufend:** Neue Seiten erhalten die nächsthöhere ID (aktuell: 308+)
2. **Global eindeutig:** IDs über alle Seitentypen hinweg (CMS + Static)
3. **Chronologisch:** Reihenfolge entspricht Erstellungszeitpunkt
4. **Permanent:** Gelöschte IDs werden niemals wiederverwendet
5. **Lücken normal:** Durch Löschungen entstehen Lücken (z.B. 20 → 221 → 222)

### URL-Konstruktion:
```
Hierarchische URL = /{parent_slug}/{page_slug}

Beispiele:
- Seite unter "Your Solution": /your-solution/photography
- Unterseite 2. Ebene: /your-solution/mobile-phone/isp-tuning
- Unterseite 3. Ebene: /products/test-charts/le7

Direkter ID-Zugriff:
- Jede Seite auch über /{page_id} erreichbar
- Beispiel: /307 → redirect zu /your-solution/mobile-phone/isp-tuning
```

---

## 🎯 SITEMAP-BASIERTE CMS-SEITENERSTELLUNG (Next Generation)

### ⚡ Das Problem der alten Methode:
- ❌ Manuelle `parent_slug` Eingabe führt zu Hierarchie-Fehlern
- ❌ `navigationData.ts` Updates in 5 Sprachdateien fehleranfällig
- ❌ Inkonsistenzen zwischen Slug-Hierarchie und Navigation
- ❌ Nachträgliche Korrekturzyklen notwendig

### ✨ Die Sitemap-Lösung (ab Version 2.0):

**Grundprinzip:** Die Navigation IST die Quelle der Wahrheit - nicht umgekehrt!

### Workflow:

**1️⃣ Redakteur klickt "Create New CMS Page"**
```
Admin Dashboard → visuelle Sitemap-Ansicht öffnet sich
```

**2️⃣ Sitemap zeigt die komplette Website-Struktur:**
```
📁 Homepage
├── 📁 Your Solution
│   ├── ✅ Photography (CMS)
│   ├── ✅ Scanners & Archiving (CMS)
│   │   ├── ✅ Universal Test Target (CMS)
│   │   ├── ✅ ISO 21550 (CMS)
│   │   └── 📄 [+ NEUE SEITE HIER ERSTELLEN]
│   ├── ✅ Medical & Endoscopy (CMS)
│   ├── 📄 Broadcast & Video (statisch)
│   └── ✅ Security & Surveillance (CMS)
│       ├── ✅ IEC 62676-5 Testing (CMS)
│       └── 📄 [+ NEUE SEITE HIER ERSTELLEN]
├── 📁 Products
│   ├── 📁 Test Charts
│   │   └── 📄 [+ NEUE SEITE HIER ERSTELLEN]
...
```

**Visuelle Unterscheidung:**
- ✅ **Grüner Checkmark** = CMS-Seite (editierbar)
- 📄 **Graues Icon** = Statische Seite (wird später durch CMS ersetzt)
- 📄 **[+ Neue Seite]** = Platzhalter zum Hinzufügen

**3️⃣ Redakteur wählt Position in der Hierarchie:**
```
Klick auf: "Security & Surveillance" → "+ Add child page"
```

**4️⃣ System leitet automatisch ab:**
```json
{
  "parent_id": 222,                    // Aus page_registry
  "parent_slug": "security-surveillance", // Aus page_registry
  "page_slug": "low-light-iso-19093",     // User-Eingabe (nur der letzte Teil!)
  "hierarchical_slug": "your-solution/security-surveillance/low-light-iso-19093",  // Automatisch konstruiert!
  "page_title": "Low Light (ISO 19093)"   // User-Eingabe (deutsch als Default)
}
```

**5️⃣ Automatische Backend-Erstellung:**
```sql
-- 1. page_registry (mit korrekter Hierarchie)
INSERT INTO page_registry (page_id, page_slug, page_title, parent_id, parent_slug)
VALUES (318, 'your-solution/security-surveillance/low-light-iso-19093', 
        'Low Light (ISO 19093)', 222, 'security-surveillance');

-- 2. segment_registry (Footer)
INSERT INTO segment_registry (segment_id, page_slug, segment_type, segment_key, is_static)
VALUES (400, 'your-solution/security-surveillance/low-light-iso-19093', 
        'footer', 'footer', true);

-- 3. page_content (tab_order, page_segments, seo_data)
INSERT INTO page_content ...
```

**6️⃣ Automatische navigationData.ts Synchronisation:**
```typescript
// System aktualisiert ALLE 5 Sprachdateien automatisch:
// navigationData.ts (EN)
// navigationData.de.ts (DE) 
// navigationData.ja.ts (JA)
// navigationData.ko.ts (KO)
// navigationData.zh.ts (ZH)

// Beispiel navigationData.ts:
"Security & Surveillance": {
  description: "CCTV systems, video surveillance",
  subgroups: [
    { name: "IEC 62676-5 Testing", link: "/your-solution/security-surveillance/iec-62676-5-testing" },
    { name: "Low Light (ISO 19093)", link: "/your-solution/security-surveillance/low-light-iso-19093" }, // ✅ NEU!
    { name: "High Dynamic Range (HDR)", link: "#" }
  ]
}
```

**7️⃣ Mehrsprachigkeit (Phase 1):**
```
Default: Seite wird in DEUTSCH angelegt
- navigationData.de.ts: "Schwachlicht (ISO 19093)"
- navigationData.ts: "Low Light (ISO 19093)" [Placeholder oder manuell]
- navigationData.ja.ts: "低照度(ISO 19093)" [Placeholder oder manuell]
- ...andere Sprachen: [Placeholder oder manuell]
```

**Mehrsprachigkeit Phase 2 (Admin Interface V2 - nächster Meilenstein):**
```
Separater Prozess im Admin Dashboard:
- "Erstelle englische Version dieser Seite"
- "Erstelle chinesische Version dieser Seite"
- → Übersetzt Content & navigationData automatisch
```

### 🎯 Vorteile:

| Vorteil | Beschreibung |
|---------|-------------|
| **Single Source of Truth** | Sitemap IST die Hierarchie → keine Diskrepanzen mehr |
| **Visuelle Klarheit** | Redakteur sieht exakt, wo die Seite erscheinen wird |
| **Automatische Slug-Hierarchie** | Wird direkt aus der Sitemap-Position abgeleitet |
| **Automatische navigationData.ts Sync** | Alle 5 Sprachdateien werden synchron aktualisiert |
| **Fehlerprävention** | Unmöglich, falsche `parent_slug` einzugeben |
| **Redaktions-Flexibilität** | Sitemap kann frei gestaltet werden |
| **Zero Post-Processing** | Keine manuellen Korrekturen mehr nötig |

### 🔧 Technische Implementierung:

**Sitemap Datenquelle:**
```typescript
// Liest navigationData.ts als Basis
import { navigationDataEn } from '@/translations/navigationData';

// Anreichert mit page_registry Status
const enrichedSitemap = await enrichWithCMSStatus(navigationDataEn);

// Zeigt: ✅ CMS | 📄 Static | 📄 [+ Add]
```

**Status-Check-Logik:**
```typescript
async function enrichWithCMSStatus(navData) {
  for each page in navData:
    // Check if page exists in page_registry
    const exists = await supabase
      .from('page_registry')
      .select('page_id')
      .eq('page_slug', page.link.replace('/', ''))
      .maybeSingle();
    
    // Check if page has segments in segment_registry
    const hasSegments = await supabase
      .from('segment_registry')
      .select('segment_id')
      .eq('page_slug', page.link.replace('/', ''))
      .not('deleted', 'eq', true);
    
    page.status = exists && hasSegments.length > 0 ? 'CMS' : 'STATIC';
}
```

### ⚠️ Übergangsphase:

**Aktuell:** Statische Seiten existieren noch parallel
- 📄 Statische React-Komponenten (nicht im CMS)
- ✅ CMS-Seiten (über UDPS gerendert)

**Ziel:** Alle statischen Seiten werden sukzessive durch CMS-Seiten ersetzt
- Sitemap zeigt beide Typen während der Migration
- Statische Seiten werden nicht vom Erstellungsprozess betroffen
- Nach vollständiger Migration: Nur noch CMS-Seiten

---

## 🚀 VOLLAUTOMATIK - Ein Klick genügt! (Legacy-Methode)

### ✨ So funktioniert es:

1. **Klicke "Create Page" Button** im Admin Dashboard
2. **Wähle eine Seite** aus dem Dropdown
3. **Klicke "Create Page"**
4. **✅ FERTIG!** Die Seite ist sofort live und editierbar

### 🎯 Was passiert automatisch:

**Backend-Setup (automatisch):**
- ✅ `page_registry` Eintrag erstellt
- ✅ `segment_registry` Eintrag (Footer) erstellt
- ✅ `page_content` Einträge (tab_order, page_segments, seo_settings) erstellt

**Frontend-Setup (automatisch):**
- ✅ Seite funktioniert sofort durch **catch-all Routes** in App.tsx
- ✅ Preview-Button funktioniert (dynamisch aus DB)
- ✅ PageIdRouter funktioniert (dynamisch aus DB)
- ✅ Admin Dashboard kann die Seite editieren

### 🔧 Catch-All Routes System

Die App.tsx enthält universelle catch-all Routes, die JEDE neue Seite automatisch fangen:

```tsx
// In App.tsx - diese Routes fangen automatisch ALLE neuen Seiten:
<Route path="/your-solution/:slug" element={<DynamicCMSPage />} />
<Route path="/your-solution/automotive/:slug" element={<DynamicCMSPage />} />
<Route path="/your-solution/scanners-archiving/:slug" element={<DynamicCMSPage />} />
```

**Beispiele:**
- Neue Seite `/your-solution/broadcasting-video` → wird automatisch von `/your-solution/:slug` gefangen ✅
- Neue Seite `/your-solution/automotive/sensor-fusion` → wird automatisch von `/your-solution/automotive/:slug` gefangen ✅
- Neue Seite `/your-solution/scanners-archiving/color-accuracy` → wird automatisch von `/your-solution/scanners-archiving/:slug` gefangen ✅

**Keine Code-Änderungen nötig!** 🎉

### ⚠️ Optional: Navigation Updates

Die Navigation-Links in den 5 Sprachdateien müssen noch manuell aktualisiert werden (falls gewünscht):
- `src/translations/navigationData.ts`
- `src/translations/navigationData.de.ts`
- `src/translations/navigationData.ja.ts`
- `src/translations/navigationData.ko.ts`
- `src/translations/navigationData.zh.ts`

**ABER:** Die Seite funktioniert auch OHNE diese Navigation-Updates bereits vollständig! Sie ist nur noch nicht in der Hauptnavigation verlinkt.

---

## 🚀 UDPS/UDA - Architektur-Übersicht

### Was ist UDPS?
Das **Universal Dynamic Page System** ist eine revolutionäre CMS-Architektur, die es ermöglicht:
- **Keine individuellen Page-Komponenten mehr** - Eine zentrale `DynamicCMSPage.tsx` rendert ALLE CMS-Seiten
- **Automatische Route-Erkennung** - Slug-basiertes Routing ohne manuelle Route-Konfiguration
- **Instant Page Creation** - Neue Seiten sind sofort live ohne Code-Deployment
- **Zero-Maintenance** - Kein manuelles Frontend-Component-Management

### Wie funktioniert UDPS?

**Vorher (Legacy):**
```tsx
// 8 separate Komponenten mit identischem Code:
Photography.tsx (350+ Zeilen)
WebCamera.tsx (350+ Zeilen)
MedicalEndoscopy.tsx (350+ Zeilen)
... und 5 weitere = ~2.900 Zeilen duplicate Code
```

**Jetzt (UDPS):**
```tsx
// Eine zentrale Komponente für ALLE:
DynamicCMSPage.tsx (491 Zeilen)
↓
Rendert automatisch alle 14 Segment-Typen
↓
Lädt Content dynamisch aus Datenbank
↓
Keine Code-Änderungen für neue Seiten nötig!
```

### UDPS-Flow:

```
User besucht: /your-solution/photography
↓
DynamicCMSPage extrahiert: "photography" (letztes URL-Segment)
↓
Query page_registry: Seite existiert?
↓ 
Query page_content: Lade tab_order, page_segments, seo_data
↓
Query segment_registry: Lade Segment-IDs
↓
Render Segmente basierend auf tab_order
↓
Fertiges Frontend - OHNE separate Component!
```

---

## Übersicht

Wenn eine neue Backend-Seite angelegt wird, folgt das System einem strikten, mehrstufigen Workflow, der sicherstellt, dass alle Komponenten korrekt eingerichtet und miteinander verbunden sind.

**WICHTIG:** Mit UDPS entfällt Phase 4 (Frontend-Komponente erstellen) komplett - das System rendert automatisch!

---

## Phase 1: Initiale Planung

### 1.1 Parent Page Identifikation
- **Frage an den Benutzer:** Von welcher Seite sollen die Frontend-Eigenschaften vererbt werden?
- **Standard-Referenz:** `/photography` ist die definitive Referenzseite für alle CMS-Implementierungen
- **Zweck:** Sicherstellen, dass alle Template-Darstellungen identisch bleiben

### 1.2 Hierarchie-Analyse
- **Page ID:** Fortlaufende, niemals wiederverwendbare numerische ID
- **Parent ID:** Verweis auf die übergeordnete Seite in der Navigationsstruktur
- **Page Slug:** URL-freundlicher Bezeichner (z.B. "multispectral-illumination")
- **Parent Slug:** Slug der übergeordneten Seite (z.B. "scanners-archiving")

---

## Phase 2: Backend-Einrichtung

### 2.1 Page Registry Eintrag
```sql
INSERT INTO page_registry (page_id, page_slug, page_title, parent_id, parent_slug)
VALUES (
  [nächste_fortlaufende_page_id],
  '[page-slug]',
  '[Display Title]',
  [parent_page_id],
  '[parent-slug]'
);
```

**Wichtig:** Page IDs werden niemals wiederverwendet, auch wenn Seiten gelöscht werden!

### 2.2 Segment Registry Einträge

**Nur Footer als statisches Segment:**
```sql
INSERT INTO segment_registry (segment_id, page_slug, segment_type, segment_key, is_static, position, deleted)
VALUES 
  ([nächste_fortlaufende_segment_id], '[page-slug]', 'footer', 'footer', true, 4, false);
```

**Wichtig:** 
- Segment IDs sind global eindeutig und chronologisch sequenziell über alle Seiten hinweg
- Segment IDs werden niemals wiederverwendet (No-Reuse-Policy)
- Hero, Tiles, Banner, Solutions werden NICHT mehr als statische Segmente angelegt
- Nur Footer bleibt als statisches Segment

### 2.3 Initial Page Content

**Tab Order (nur Footer):**
```sql
INSERT INTO page_content (page_slug, section_key, content_type, content_value)
VALUES 
  ('[page-slug]', 'tab_order', 'json', '["[footer_segment_id]"]');
```

**Page Segments (leeres Array):**
```sql
INSERT INTO page_content (page_slug, section_key, content_type, content_value)
VALUES 
  ('[page-slug]', 'page_segments', 'json', '[]');
```

**SEO Data (Defaults):**
```sql
INSERT INTO page_content (page_slug, section_key, content_type, content_value)
VALUES 
  ('[page-slug]', 'seo_data', 'json', '{"title":"[Page Title]","description":"","canonical":"","robotsIndex":true,"robotsFollow":true}');
```

---

## Phase 3: Dynamisches Segment hinzufügen

### 3.1 Segment über Admin Dashboard hinzufügen
- Im Admin Dashboard die neue Seite auswählen
- "+ Add Segment" Button klicken
- Segment-Typ auswählen (z.B. "Latest News")
- Segment konfigurieren und speichern

### 3.2 Automatische Datenbankeinträge
Das System erstellt automatisch:

**Segment Registry Eintrag:**
```sql
INSERT INTO segment_registry (segment_id, page_slug, segment_type, segment_key, is_static, deleted)
VALUES 
  ([nächste_fortlaufende_segment_id], '[page-slug]', '[segment-type]', '[segment_id]', false, false);
```

**Page Segments Update:**
```sql
UPDATE page_content 
SET content_value = '[{"id":"[segment_id]","type":"[segment-type]","data":{...}}]'
WHERE page_slug = '[page-slug]' AND section_key = 'page_segments';
```

**Tab Order Update:**
```sql
UPDATE page_content 
SET content_value = '["[segment_id]", "[footer_segment_id]"]'
WHERE page_slug = '[page-slug]' AND section_key = 'tab_order';
```

**Segment Content Felder:**
- Für News-Segment: `[segment_id]_title`, `[segment_id]_description`, `[segment_id]_article_limit`, `[segment_id]_categories`
- Für andere Segmente: je nach Segment-Typ spezifische Felder

---

## Phase 4: UDPS Auto-Rendering (Keine manuelle Component-Erstellung!)

### 4.1 ✨ **Das ist das WICHTIGSTE Feature des ganzen CMS!** ✨

**Mit UDPS gibt es KEINE separate Frontend-Komponente mehr!**

Die Seite wird **automatisch** von `DynamicCMSPage.tsx` gerendert, sobald:
1. ✅ `page_registry` Eintrag existiert
2. ✅ `segment_registry` mindestens Footer-Segment hat
3. ✅ `page_content` tab_order + page_segments hat
4. ✅ Route in App.tsx auf DynamicCMSPage zeigt

### 4.2 Route-Konfiguration (einmalig in App.tsx)

**Für Seiten unter /your-solution/:**
```tsx
<Route path="/your-solution/[page-slug]" element={<DynamicCMSPage />} />
```

**Für Unterseiten:**
```tsx
<Route path="/your-solution/[parent-slug]/[page-slug]" element={<DynamicCMSPage />} />
```

**Beispiele:**
```tsx
// Bereits konfiguriert:
<Route path="/your-solution/photography" element={<DynamicCMSPage />} />
<Route path="/your-solution/web-camera" element={<DynamicCMSPage />} />
<Route path="/your-solution/scanners-archiving/iso-21550" element={<DynamicCMSPage />} />
```

### 4.3 DynamicCMSPage - Was passiert intern?

**1. URL-Parsing:**
```typescript
const extractPageSlug = (pathname: string): string => {
  const parts = pathname.split('/').filter(Boolean);
  return parts[parts.length - 1]; // Letztes Segment
};
// /your-solution/photography → "photography"
// /your-solution/scanners-archiving/iso-21550 → "iso-21550"
```

**2. Content Loading:**
```typescript
// Check page exists
const { data: pageExists } = await supabase
  .from("page_registry")
  .select("page_slug")
  .eq("page_slug", pageSlug)
  .maybeSingle();

// Load page content
const { data } = await supabase
  .from("page_content")
  .select("*")
  .eq("page_slug", pageSlug);

// Load segment registry
const { data: segmentData } = await supabase
  .from("segment_registry")
  .select("*")
  .eq("page_slug", pageSlug)
  .eq("deleted", false);
```

**3. Dynamic Rendering:**
```typescript
// Render segments in tab_order sequence
{tabOrder.map(segmentId => renderSegment(segmentId))}

// renderSegment() has handlers for ALL 14 segment types:
switch (segment.type) {
  case "meta-navigation": return <MetaNavigation ... />;
  case "product-hero-gallery": return <ProductHeroGallery ... />;
  case "tiles": return <section>...</section>;
  case "banner": return <section>...</section>;
  // ... 10 weitere Typen
}
```

### 4.4 Segment-Handler - Alle 14 Typen ✅

**KRITISCH:** `DynamicCMSPage.tsx` muss Handler für ALLE Segment-Typen haben:

| Segment Type | Component | Status |
|--------------|-----------|--------|
| meta-navigation | MetaNavigation | ✅ |
| product-hero-gallery | ProductHeroGallery | ✅ |
| feature-overview | FeatureOverview | ✅ |
| table | Table | ✅ |
| faq | FAQ | ✅ |
| specification | Specification | ✅ |
| video | Video | ✅ |
| full-hero | FullHero | ✅ |
| intro | Intro | ✅ |
| industries | IndustriesSegment | ✅ |
| news | NewsSegment | ✅ |
| tiles | Inline Rendering | ✅ |
| banner | Inline Rendering | ✅ |
| image-text / solutions | Inline Rendering | ✅ |

**Bei neuen Segment-Typen:** Handler EINMALIG in DynamicCMSPage hinzufügen → funktioniert sofort auf ALLEN Seiten!

---

### 4.1 Komponenten-Struktur
Die Frontend-Komponente muss die komplette dynamische Segment-Architektur von der Parent Page übernehmen:

```tsx
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { SEOHead } from "@/components/SEOHead";
import MetaNavigation from "@/components/segments/MetaNavigation";
import ProductHeroGallery from "@/components/segments/ProductHeroGallery";
import FeatureOverview from "@/components/segments/FeatureOverview";
import Table from "@/components/segments/Table";
import FAQ from "@/components/segments/FAQ";
import Specification from "@/components/segments/Specification";
import { Video } from "@/components/segments/Video";
import Intro from "@/components/segments/Intro";
import IndustriesSegment from "@/components/segments/IndustriesSegment";
import FullHero from "@/components/segments/FullHero";
import NewsSegment from "@/components/segments/NewsSegment";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, FileText, Download, BarChart3, Zap, Shield, Eye, Car, Smartphone, Heart, CheckCircle, Lightbulb, Monitor } from "lucide-react";
import { Link } from "react-router-dom";

const iconMap: Record<string, any> = {
  FileText,
  Download,
  BarChart3,
  Zap,
  Shield,
  Eye,
  Car,
  Smartphone,
  Heart,
  CheckCircle,
  Lightbulb,
  Monitor,
};

const [PageName] = () => {
  const [content, setContent] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [pageSegments, setPageSegments] = useState<any[]>([]);
  const [tabOrder, setTabOrder] = useState<string[]>([]);
  const [segmentIdMap, setSegmentIdMap] = useState<Record<string, number>>({});
  const [seoData, setSeoData] = useState<any>({});

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    const { data, error } = await supabase
      .from("page_content")
      .select("*")
      .eq("page_slug", "[page-slug]");

    const { data: segmentData } = await supabase
      .from("segment_registry")
      .select("*")
      .eq("page_slug", "[page-slug]");

    if (segmentData) {
      const idMap: Record<string, number> = {};
      segmentData.forEach((seg: any) => {
        idMap[seg.segment_key] = seg.segment_id;
      });
      setSegmentIdMap(idMap);
    }

    if (!error && data) {
      const contentMap: Record<string, string> = {};
      data.forEach((item: any) => {
        contentMap[item.section_key] = item.content_value;
      });
      setContent(contentMap);

      if (contentMap.page_segments) {
        try {
          const segments = JSON.parse(contentMap.page_segments);
          setPageSegments(segments);
        } catch (e) {
          console.error("Error parsing page_segments:", e);
        }
      }

      if (contentMap.tab_order) {
        try {
          const order = JSON.parse(contentMap.tab_order);
          setTabOrder(order);
        } catch (e) {
          console.error("Error parsing tab_order:", e);
        }
      }

      if (contentMap.seo_data) {
        try {
          const seo = JSON.parse(contentMap.seo_data);
          setSeoData(seo);
        } catch (e) {
          console.error("Error parsing seo_data:", e);
        }
      }
    }

    setLoading(false);
  };

  const renderSegment = (segmentId: string) => {
    const dynamicSegment = pageSegments.find(seg => seg.id === segmentId);
    if (dynamicSegment) {
      if (dynamicSegment.type === 'meta-navigation') {
        return <MetaNavigation key={segmentId} data={dynamicSegment.data} segmentIdMap={segmentIdMap} />;
      }
      if (dynamicSegment.type === 'product-hero-gallery') {
        return <ProductHeroGallery key={segmentId} id={segmentId} data={dynamicSegment.data} />;
      }
      if (dynamicSegment.type === 'feature-overview') {
        return <FeatureOverview key={segmentId} id={segmentId} {...dynamicSegment.data} />;
      }
      if (dynamicSegment.type === 'table') {
        return <Table key={segmentId} id={segmentId} {...dynamicSegment.data} />;
      }
      if (dynamicSegment.type === 'faq') {
        return <FAQ key={segmentId} id={segmentId} {...dynamicSegment.data} />;
      }
      if (dynamicSegment.type === 'video') {
        return <Video key={segmentId} id={segmentId} data={dynamicSegment.data} />;
      }
      if (dynamicSegment.type === 'specification') {
        return <Specification key={segmentId} id={segmentId} {...dynamicSegment.data} />;
      }
      if (dynamicSegment.type === 'intro') {
        return <Intro key={segmentId} id={segmentId} {...dynamicSegment.data} />;
      }
      if (dynamicSegment.type === 'industries') {
        return <IndustriesSegment key={segmentId} id={segmentId} {...dynamicSegment.data} />;
      }
      if (dynamicSegment.type === 'full-hero') {
        return <FullHero key={segmentId} {...dynamicSegment.data} />;
      }
      if (dynamicSegment.type === 'news') {
        return (
          <NewsSegment
            key={segmentId}
            id={segmentId}
            sectionTitle={dynamicSegment.data?.sectionTitle}
            sectionDescription={dynamicSegment.data?.sectionDescription}
            articleLimit={parseInt(dynamicSegment.data?.articleLimit || "6")}
            categories={dynamicSegment.data?.categories || []}
          />
        );
      }
      if (dynamicSegment.type === 'tiles') {
        const tilesData = dynamicSegment.data || {};
        const tilesItems = tilesData.items || [];
        const tilesColsConfig = tilesData.tiles_columns || "3";
        
        const getGridColsClass = () => {
          switch(tilesColsConfig) {
            case "2": return "grid-cols-1 md:grid-cols-2";
            case "3": return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
            case "4": return "grid-cols-1 md:grid-cols-2 lg:grid-cols-4";
            default: return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
          }
        };

        return (
          <section key={segmentId} id={String(segmentIdMap[segmentId] || segmentId)} className="py-20 bg-white">
            <div className="container mx-auto px-4">
              {tilesData.sectionTitle && (
                <h2 className="text-4xl font-bold text-center mb-4">{tilesData.sectionTitle}</h2>
              )}
              {tilesData.sectionDescription && (
                <p className="text-center text-lg text-gray-600 mb-12 max-w-3xl mx-auto">
                  {tilesData.sectionDescription}
                </p>
              )}
              <div className={`grid ${getGridColsClass()} gap-8`}>
                {tilesItems.map((app: any, index: number) => {
                  const IconComponent = iconMap[app.icon] || Camera;
                  return (
                    <Card key={index} className="hover:shadow-xl transition-all duration-300 group border-2 hover:border-[#f9dc24]">
                      <CardContent className="p-8">
                        <div className="mb-6 h-16 w-16 rounded-2xl bg-[#f9dc24] flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <IconComponent className="h-8 w-8 text-black" />
                        </div>
                        <h3 className="text-2xl font-bold mb-4">{app.title}</h3>
                        <p className="text-gray-600 mb-6 leading-relaxed">{app.description}</p>
                        {app.ctaLink && app.ctaText && (
                          <Link to={app.ctaLink}>
                            <Button 
                              className={
                                app.ctaStyle === "technical"
                                  ? "bg-[#1f2937] text-white hover:bg-[#1f2937]/90"
                                  : "bg-[#f9dc24] text-black hover:bg-[#f9dc24]/90"
                              }
                            >
                              {app.ctaText}
                            </Button>
                          </Link>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </section>
        );
      }
      if (dynamicSegment.type === 'banner') {
        const bannerData = dynamicSegment.data || {};
        return (
          <section key={segmentId} id={String(segmentIdMap[segmentId] || segmentId)} className="py-20 bg-gray-50">
            <div className="container mx-auto px-4">
              {bannerData.title && (
                <h2 className="text-4xl font-bold text-center mb-4">{bannerData.title}</h2>
              )}
              {bannerData.subtext && (
                <p className="text-center text-lg text-gray-600 mb-12 max-w-2xl mx-auto">
                  {bannerData.subtext}
                </p>
              )}
              {bannerData.images && bannerData.images.length > 0 && (
                <div className="flex flex-wrap justify-center items-center gap-12 mb-12">
                  {bannerData.images.map((img: any, index: number) => (
                    <div key={index} className="grayscale hover:grayscale-0 transition-all duration-500">
                      <img
                        src={img.imageUrl}
                        alt={img.altText || "Partner logo"}
                        className="h-20 object-contain"
                      />
                    </div>
                  ))}
                </div>
              )}
              {bannerData.buttonText && bannerData.buttonLink && (
                <div className="text-center">
                  <Link to={bannerData.buttonLink}>
                    <Button 
                      className={
                        bannerData.buttonStyle === "technical"
                          ? "bg-[#1f2937] text-white hover:bg-[#1f2937]/90"
                          : "bg-[#f9dc24] text-black hover:bg-[#f9dc24]/90"
                      }
                    >
                      {bannerData.buttonText}
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </section>
        );
      }
      if (dynamicSegment.type === 'image-text') {
        const imageTextData = dynamicSegment.data || {};
        const imageTextItems = imageTextData.items || [];
        const imageTextLayout = imageTextData.layout || "2-col";
        
        const getImageTextGridClass = () => {
          switch(imageTextLayout) {
            case "1-col": return "grid-cols-1";
            case "2-col": return "grid-cols-1 md:grid-cols-2";
            case "3-col": return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
            default: return "grid-cols-1 md:grid-cols-2";
          }
        };

        return (
          <section key={segmentId} id={String(segmentIdMap[segmentId] || segmentId)} className="py-20 bg-white">
            <div className="grid gap-8 max-w-7xl mx-auto grid-cols-1">
              {imageTextData.title && (
                <h2 className="text-4xl font-bold mb-4 px-4">{imageTextData.title}</h2>
              )}
              {imageTextData.subtext && (
                <p className="text-lg text-gray-600 mb-8 px-4">{imageTextData.subtext}</p>
              )}
              <div className={`grid ${getImageTextGridClass()} gap-8`}>
                {imageTextItems.map((item: any, index: number) => (
                  <div key={index} className="space-y-4">
                    {item.imageUrl && (
                      <img 
                        src={item.imageUrl} 
                        alt={item.title || "Content image"} 
                        className="w-full h-auto rounded-lg shadow-md"
                      />
                    )}
                    {item.title && <h3 className="text-2xl font-bold">{item.title}</h3>}
                    {item.description && <p className="text-gray-600 leading-relaxed">{item.description}</p>}
                  </div>
                ))}
              </div>
            </div>
          </section>
        );
      }
    }
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-roboto">
      <SEOHead
        title={seoData.title || "[Page Title]"}
        description={seoData.description || ""}
        canonical={seoData.canonical || ""}
        ogImage={seoData.ogImage || ""}
        robotsIndex={seoData.robotsIndex}
        robotsFollow={seoData.robotsFollow}
      />
      
      <Navigation />

      {/* MANDATORY: Meta Navigation - Always First (Below Nav Bar) */}
      {tabOrder
        .filter(segmentId => {
          const dynamicSegment = pageSegments.find(seg => seg.id === segmentId);
          return dynamicSegment && dynamicSegment.type === 'meta-navigation';
        })
        .map(segmentId => renderSegment(segmentId))}

      {/* Render all other segments except meta-navigation */}
      {tabOrder
        .filter(segmentId => {
          const dynamicSegment = pageSegments.find(seg => seg.id === segmentId);
          return dynamicSegment && dynamicSegment.type !== 'meta-navigation';
        })
        .map(segmentId => renderSegment(segmentId))}

      <Footer />
    </div>
  );
};

export default [PageName];
```

### 4.2 Kritische Handler-Vollständigkeit
**ALLE dynamischen Segment-Typen müssen Handler haben:**
- ✅ Meta Navigation
- ✅ Product Hero Gallery
- ✅ Feature Overview
- ✅ Table
- ✅ FAQ
- ✅ Specification
- ✅ Video
- ✅ Intro
- ✅ Industries
- ✅ Full Hero
- ✅ News
- ✅ Tiles
- ✅ Banner
- ✅ Image & Text

**Fehlende Handler sind ein kritischer Bug!**

---

## Phase 5: Routing & Navigation

### 5.1 App.tsx Route
```tsx
import [ComponentName] from "./pages/[ComponentName]";

// In Routes:
<Route 
  path="/[hierarchical-url-path]" 
  element={<[ComponentName] />} 
/>
```

**Beispiel:**
```tsx
<Route 
  path="/your-solution/scanners-archiving/multispectral-illumination" 
  element={<MultispectralIllumination />} 
/>
```

### 5.2 Navigation Links

**Desktop & Mobile Navigation (`src/translations/navigationData.ts` + .de/.zh/.ja/.ko):**
```typescript
{
  name: "[Display Name]",
  link: "/[hierarchical-url-path]",
  active: true
}
```

**Navigation Component (`src/components/Navigation.tsx`):**
```typescript
const urlToPageSlug = {
  '/your-solution/automotive': 'automotive',
  '/your-solution/automotive/in-cabin-testing': 'in-cabin-testing',
  '/your-solution/photography': 'photography',
  '/your-solution/medical-endoscopy': 'medical-endoscopy',
  '/your-solution/machine-vision': 'machine-vision',
  '/your-solution/web-camera': 'web-camera',
  '/your-solution/mobile-phone': 'mobile-phone',
  '/your-solution/scanners-archiving': 'scanners-archiving',
  '/your-solution/scanners-archiving/iso-21550': 'iso-21550',
  '/your-solution/scanners-archiving/universal-test-target': 'universal-test-target',
  '/your-solution/scanners-archiving/multispectral-illumination': 'multispectral-illumination',
  '/products/test-charts/le7': 'le7',
  '/products/illumination/iq-led': 'iq-led',
  '/products/standards/ieee-p2020': 'ieee-p2020',
};
```

### 5.3 Admin Dashboard Preview Button
**Automatisch durch hierarchische URL-Logik:**
- Seiten mit `parent_slug` erhalten automatisch Preview-URL: `/[parent-slug]/[page-slug]`
- Bei 2-Level-Hierarchie: `/your-solution/[parent-slug]/[page-slug]`

---

## Phase 6: Qualitäts-Check

### 6.1 CMS-Funktionalität
- [ ] **Gelb im Dropdown:** Seite wird im HierarchicalPageSelect als CMS-ready markiert
  - Prüfung: segment_registry hat mindestens einen Eintrag für diese page_slug
- [ ] **Preview-Button funktioniert:** Klick öffnet die richtige Frontend-URL
  - Prüfung: Hierarchische URL-Generierung basierend auf parent_slug
- [ ] **Frontend-Navigation:** Links in Navigation führen zur richtigen Seite
  - Prüfung: Desktop und Mobile Navigation getestet

### 6.2 Segment-Darstellung
- [ ] **Nur konfigurierte Segmente:** Frontend zeigt NUR Segmente aus tab_order
- [ ] **Template-Konsistenz:** Alle Segment-Templates sehen identisch aus wie auf /photography
- [ ] **Keine Fehler:** Keine Console Errors, keine fehlenden Handler

### 6.3 Datenbank-Integrität
- [ ] **segment_registry:** Alle Segmente korrekt registriert, keine gelöschten Segmente in tab_order
- [ ] **page_content:** Alle erforderlichen Einträge vorhanden (tab_order, page_segments, seo_data)
- [ ] **ID-Konsistenz:** Segment-IDs in segment_registry, page_segments und tab_order stimmen überein

### 6.4 SEO & Meta
- [ ] **SEO Head:** Title, Description, Canonical korrekt konfiguriert
- [ ] **Meta Navigation:** Anchor-Links funktionieren, scrollt zu korrekten Segmenten
- [ ] **Responsive Design:** Seite funktioniert auf Desktop und Mobile

---

## Phase 7: Dokumentation

### 7.1 Memory Update
Nach erfolgreicher Implementierung:
```
[Seitenname] ([page-slug]) wurde als neue CMS-Seite eingerichtet mit:
- Page ID: [page_id]
- Parent: [parent_slug]
- Segment IDs: [list_of_segment_ids]
- URL: /[hierarchical-url-path]
- Status: CMS ready, Frontend funktionsfähig
```

---

## Häufige Fehlerquellen (VERMEIDEN!)

### ❌ Fehlende segment_registry Einträge
- **Problem:** Seite wird nicht gelb im Dropdown
- **Lösung:** Footer-Segment in segment_registry eintragen

### ❌ Gelöschte Segmente in tab_order
- **Problem:** Frontend versucht gelöschte Segmente zu rendern
- **Lösung:** Automatische Filterung beim loadContent

### ❌ Fehlende Handler für Segment-Typen
- **Problem:** Segmente werden nicht angezeigt
- **Lösung:** Alle 14 Segment-Handler in renderSegment implementieren

### ❌ Inkonsistente Navigation
- **Problem:** Links führen zu falschen Seiten oder 404
- **Lösung:** navigationData.ts, Navigation.tsx und App.tsx synchron halten

### ❌ Statische Segmente mit is_static=false
- **Problem:** Footer kann gelöscht werden
- **Lösung:** Footer MUSS is_static=true haben

### ❌ Tab Order ohne Footer
- **Problem:** Seite hat keinen Footer
- **Lösung:** Footer-Segment-ID immer am Ende von tab_order

---

## Beispiel: Multispectral Illumination

### Setup-Informationen
- **Page Slug:** multispectral-illumination
- **Page ID:** 51
- **Parent ID:** 16 (scanners-archiving)
- **Hierarchische URL:** /your-solution/scanners-archiving/multispectral-illumination
- **Segment IDs:** 178 (Footer), 179 (Latest News)
- **Tab Order:** ["179", "178"]

### Durchgeführte Schritte
1. ✅ page_registry Eintrag erstellt
2. ✅ segment_registry: Footer (178, is_static=true), News (179, is_static=false)
3. ✅ page_content: tab_order, page_segments, seo_data, News-Felder
4. ✅ Frontend-Komponente: MultispectralIllumination.tsx mit vollständigem Handler
5. ✅ Route in App.tsx hinzugefügt
6. ✅ Navigation in navigationData.ts (alle Sprachen) aktualisiert
7. ✅ Navigation.tsx urlToPageSlug mapping hinzugefügt
8. ✅ Qualitäts-Check bestanden

### Ergebnis
- Seite ist gelb im Dropdown (CMS ready)
- Preview-Button funktioniert
- Navigation führt zur richtigen Seite
- Frontend zeigt nur Latest News Segment + Footer
- Alle Templates identisch zu /photography

---

## 🎯 Best Practices (UDPS-Edition)

### 1. ⚡ **UDPS = Zero Frontend Maintenance**
- **KEINE** individuellen Page-Komponenten erstellen
- **KEINE** Handler pro Seite kopieren
- `DynamicCMSPage.tsx` rendert **automatisch ALLE** Seiten
- Neue Segmente → Handler EINMALIG in DynamicCMSPage hinzufügen

### 2. 📁 Keine statischen Segmente außer Footer
- Hero, Tiles, Banner, Solutions sind **dynamisch**
- Nur Footer bleibt statisch und nicht-löschbar
- Dynamische Segmente = editierbar + löschbar

### 3. 🔢 ID-Vergabe strikt global
- Segment-IDs **niemals** wiederverwendet
- Page-IDs **niemals** wiederverwendet
- Fortlaufende Nummerierung über alle Seiten hinweg
- Deleted-Flag statt Löschen

### 4. 🧹 Automatische Cleanup-Mechanismen
- Gelöschte Segmente aus tab_order filtern
- Segment-Existenz gegen segment_registry prüfen
- `deleted = false` Filter in allen Queries

### 5. ✅ Vollständige Handler-Abdeckung
- **DynamicCMSPage.tsx** hat Handler für alle 14 Segment-Typen
- Bei neuen Segment-Typen: Handler system-weit hinzufügen
- Handler-Update wirkt **sofort auf ALLEN Seiten!**

### 6. 🚀 Auto-Creation Requirements (Zukünftig)
Wenn "Create New CMS Page" Button geklickt:
- Automatische page_registry Erstellung
- Automatische segment_registry (Footer)
- Automatische page_content Initialisierung
- **KEINE** Frontend-Component-Erstellung nötig
- **KEINE** Route-Update nötig (DynamicCMSPage übernimmt)
- Seite sofort gelb im Dropdown + editierbar

---

## ✅ Checkliste für neue CMS-Seite (UDPS-Edition)

### Backend-Setup:
- [ ] Page ID & Parent ID bestimmt
- [ ] page_registry Eintrag erstellt
- [ ] segment_registry: Footer-Segment hinzugefügt (is_static=true)
- [ ] page_content: tab_order, page_segments, seo_data angelegt

### Routing (einmalig pro URL-Hierarchie):
- [ ] Route in App.tsx hinzugefügt (`<Route path="/your-solution/[slug]" element={<DynamicCMSPage />} />`)
- [ ] PageIdRouter mapping (automatisch via page_registry)

### Navigation:
- [ ] navigationData.ts (alle Sprachen) aktualisiert
- [ ] Link korrekt auf hierarchische URL zeigt

### Qualitäts-Check:
- [ ] Seite ist **gelb** im Admin-Dashboard Dropdown (= CMS ready)
- [ ] Preview-Button im Admin-Dashboard funktioniert
- [ ] Frontend-Navigation erreicht die Seite
- [ ] Nur konfigurierte Segmente werden angezeigt
- [ ] SEO-Daten werden korrekt geladen

### ⚠️ NICHT MEHR NÖTIG (Legacy):
- ❌ Frontend-Komponente erstellen (DynamicCMSPage übernimmt!)
- ❌ Segment-Handler pro Seite kopieren (DynamicCMSPage hat alle!)
- ❌ Navigation.tsx urlToPageSlug mapping (nicht mehr verwendet)

---

**Letzte Aktualisierung:** 2025-11-21 (UDPS/UDA Integration)
**Autor:** AI Assistant  
**Status:** Produktionsreif ✅ | Universal Dynamic | Zero-Maintenance
