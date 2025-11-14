# CMS-Seiten Erstellungsprotokoll

## Übersicht
Dieses Dokument beschreibt Schritt für Schritt, wie eine neue CMS-fähige Produktseite erstellt wird, die über das Admin-Dashboard bearbeitbar ist.

## Referenz-Seite
**Machine Vision** (`src/pages/MachineVision.tsx`) ist die Referenzimplementierung. Alle neuen CMS-Seiten sollten dieser Struktur folgen.

## Verfügbare Segment-Typen & Editoren

### Im AdminDashboard verfügbare Editoren
Diese Segment-Typen können vollständig über das Admin-Dashboard bearbeitet werden:

| Segment-Typ | Editor | Komponente | Verwendung |
|------------|--------|------------|------------|
| `meta-navigation` | ✅ Aktiv | MetaNavigationEditor | Inhaltsverzeichnis mit Sprungmarken |
| `product-hero-gallery` | ✅ Aktiv | ProductHeroGalleryEditor | Hero mit Produktgalerie |
| `tiles` | ✅ Aktiv | Inline Editor | Kachel-Grid für Applications |
| `banner` | ✅ Aktiv | BannerEditor | Logo-Banner mit optionalem CTA |
| `image-text` | ✅ Aktiv | Inline Editor | Bild-Text-Kombinationen (Solutions) |
| `feature-overview` | ✅ Aktiv | FeatureOverviewEditor | Feature-Listen ohne Bilder |
| `table` | ✅ Aktiv | TableEditor | Tabellen mit Daten |
| `faq` | ✅ Aktiv | FAQEditor | FAQ-Accordion |
| `video` | ✅ Aktiv | VideoSegmentEditor | Video-Einbettung |
| `specification` | ✅ Aktiv | SpecificationEditor | Technische Spezifikationen |

### Statische Segmente (im Code definiert)
Diese Segmente werden NICHT über das Admin-Dashboard bearbeitet:

| Segment-Typ | Status | Bearbeitung |
|------------|--------|-------------|
| `hero` | ❌ Kein Editor | Direkt in page_content (hero_title, hero_subtitle, etc.) |

### Segment-Typ Mapping (wichtig für Verständnis!)
- **`applications`** = wird als **`tiles`** Segment gerendert
- **`solutions`** = wird als **`image-text`** Segment gerendert

### Editor-Status Meldung
Wenn im Admin-Dashboard die Meldung erscheint:
> "Segment editor for [type] coming soon. This segment has been saved."

Bedeutet das: Der Segment-Typ existiert und wird gespeichert, aber es fehlt noch ein Editor im AdminDashboard (Zeile 5078+). Die Daten werden trotzdem auf der Frontend-Seite korrekt angezeigt.

---

## Phase 1: Datenbank-Setup

### 1.1 Segment Registry erstellen
Die Segment Registry definiert alle verfügbaren Segmente für die Seite.

**Erforderliche Einträge in `segment_registry`:**

```sql
-- Beispiel für Seite mit slug "my-product"
INSERT INTO segment_registry (page_slug, segment_key, segment_id, segment_type, is_static, deleted) VALUES
  ('my-product', 'hero', 100, 'hero', true, false),
  ('my-product', 'tiles', 101, 'tiles', true, false),
  ('my-product', 'banner', 102, 'banner', true, false),
  ('my-product', 'solutions', 103, 'solutions', true, false),
  ('my-product', 'footer', 104, 'footer', true, false);
```

**Wichtig:**
- `segment_id` muss einzigartig sein (prüfe höchste ID und zähle hoch)
- `is_static` = true für Standard-Segmente (hero, tiles, banner, solutions)
- `is_static` = false für dynamische Segmente (meta-navigation, table, faq, etc.)

### 1.2 Page Content initialisieren
Grundlegende Inhalte für die Seite anlegen:

```sql
INSERT INTO page_content (page_slug, section_key, content_type, content_value) VALUES
  -- Tab Order (definiert Reihenfolge der Segmente)
  ('my-product', 'tab_order', 'json', '["tiles", "banner", "solutions"]'),
  
  -- Page Segments (dynamische Segmente wie Meta-Nav)
  ('my-product', 'page_segments', 'json', '[]'),
  
  -- Hero Inhalte
  ('my-product', 'hero_title', 'text', 'Produkt Titel'),
  ('my-product', 'hero_subtitle', 'text', ''),
  ('my-product', 'hero_description', 'text', ''),
  ('my-product', 'hero_cta', 'text', 'Mehr erfahren'),
  ('my-product', 'hero_cta_link', 'text', '#applications-start'),
  ('my-product', 'hero_cta_style', 'text', 'standard'),
  ('my-product', 'hero_image_url', 'text', ''),
  ('my-product', 'hero_image_position', 'text', 'right'),
  ('my-product', 'hero_layout', 'text', '2-5'),
  ('my-product', 'hero_top_padding', 'text', 'medium'),
  
  -- Tiles/Applications
  ('my-product', 'applications_title', 'text', ''),
  ('my-product', 'applications_description', 'text', ''),
  ('my-product', 'applications_items', 'json', '[]'),
  ('my-product', 'tiles_columns', 'text', '3'),
  
  -- Banner
  ('my-product', 'banner_title', 'text', ''),
  ('my-product', 'banner_subtext', 'text', ''),
  ('my-product', 'banner_images', 'json', '[]'),
  ('my-product', 'banner_button_text', 'text', ''),
  ('my-product', 'banner_button_link', 'text', ''),
  ('my-product', 'banner_button_style', 'text', 'standard'),
  
  -- Solutions
  ('my-product', 'solutions_title', 'text', ''),
  ('my-product', 'solutions_subtext', 'text', ''),
  ('my-product', 'solutions_items', 'json', '[]'),
  ('my-product', 'solutions_layout', 'text', '2-col'),
  
  -- SEO
  ('my-product', 'seo_settings', 'json', '{
    "title": "Produkt Titel | Image Engineering",
    "description": "Produkt Beschreibung",
    "canonical": "https://www.image-engineering.de/products/my-product",
    "robotsIndex": true,
    "robotsFollow": true
  }');
```

### 1.3 Page Registry (optional aber empfohlen)
```sql
INSERT INTO page_registry (page_id, page_slug, page_title, parent_id, parent_slug) VALUES
  (200, 'my-product', 'Mein Produkt', NULL, NULL);
```

---

## Phase 2: React-Komponente erstellen

### 2.1 Datei erstellen
Erstelle `src/pages/ProductMYPRODUCT.tsx` (PascalCase)

### 2.2 Basis-Struktur kopieren
**WICHTIG:** Kopiere die GESAMTE Struktur von `src/pages/MachineVision.tsx` und passe nur folgende Stellen an:

#### Anpassung 1: page_slug in loadContent (3 Stellen!)
```typescript
// Zeile ~77
.eq("page_slug", "my-product"); // <-- DEIN SLUG

// Zeile ~84
.eq("page_slug", "my-product"); // <-- DEIN SLUG

// Optional: Im Komponenten-Namen
const ProductMYPRODUCT = () => {
```

### 2.3 Segment-Rendering-Logik (NICHT ÄNDERN!)
Die `renderSegment()` Funktion MUSS exakt wie in Machine Vision sein:

```typescript
const renderSegment = (segmentId: string) => {
  // 1. Dynamische Segmente prüfen
  const dynamicSegment = pageSegments.find(seg => seg.id === segmentId);
  if (dynamicSegment) {
    // Meta-Navigation, Tables, FAQs, etc.
    // ... exakter Code wie in MachineVision.tsx
  }

  // 2. Statische Segmente
  if (segmentId === 'tiles') {
    // ... exakter Code wie in MachineVision.tsx
  }
  
  if (segmentId === 'banner') {
    // ... exakter Code wie in MachineVision.tsx
  }
  
  if (segmentId === 'solutions') {
    // ... exakter Code wie in MachineVision.tsx
  }

  return null;
};
```

**KRITISCH:** Die statischen Segmente verwenden:
- `bg-white` für Cards
- `text-gray-900` für Überschriften
- `text-gray-600` für Text
- `#f9dc24` für Akzentfarbe (gelb)
- `#1f2937` für technische Buttons (dunkelgrau)

### 2.4 JSX-Struktur (MANDATORY Pattern)

**WICHTIG: Meta-Navigation IMMER direkt nach Haupt-Navigation!**

```typescript
return (
  <>
    <SEOHead {...seoData} />
    
    {/* Navigation */}
    <Navigation />

    {/* MANDATORY: Meta Navigation - Always First (Below Nav Bar) */}
    {tabOrder
      .filter(segmentId => {
        const dynamicSegment = pageSegments.find(seg => seg.id === segmentId);
        return dynamicSegment && dynamicSegment.type === 'meta-navigation';
      })
      .map(segmentId => renderSegment(segmentId))}
    
    {/* Hero Section (optional) */}
    {hasHeroContent && (
      <section id={segmentIdMap['hero']?.toString() || 'hero'}>
        {/* Hero Content */}
      </section>
    )}

    {/* Render all segments in tabOrder (excluding meta-navigation) */}
    {tabOrder
      .filter(segmentId => {
        const dynamicSegment = pageSegments.find(seg => seg.id === segmentId);
        return !(dynamicSegment && dynamicSegment.type === 'meta-navigation');
      })
      .map((segmentId) => renderSegment(segmentId))}

    <Footer />
  </>
);
```

**Kritische Regeln:**
1. ✅ **Meta-Navigation ZUERST** - direkt nach `<Navigation />`
2. ✅ **Hero DANACH** - falls vorhanden
3. ✅ **Alle anderen Segmente** - in tabOrder, aber meta-navigation ausfiltern
4. ❌ **NICHT** `pageSegments.filter(seg => seg.position === 0)` verwenden
5. ❌ **NICHT** `tabOrder.map()` ohne Filter (rendert meta-nav doppelt)

---

## Phase 3: Routing konfigurieren

### 3.1 Route in App.tsx hinzufügen
```typescript
import ProductMYPRODUCT from "@/pages/ProductMYPRODUCT";

// In der Route-Konfiguration:
<Route path="/products/category/my-product" element={<ProductMYPRODUCT />} />
```

### 3.3 Navigation-Links aktualisieren
**WICHTIG:** Nach dem Hinzufügen der Route MUSS die Seite in der Navigation verlinkt werden!

**Dateien:** `src/translations/navigationData*.ts` (alle 5 Sprachen: en, de, zh, ja, ko)

**Wo die Seite verlinkt werden sollte:**
1. **Industries > [passende Industrie]** - wenn Seite branchenspezifisch
2. **Products > [passende Kategorie]** - für Produktseiten
3. **Services > Standardized** - wenn Standards-konform

**Beispiel IEEE-P2020 (3 Stellen in jeder Sprach-Datei):**

```typescript
// 1. Industries > Automotive
"Automotive": {
  subgroups: [
    { name: "IEEE-P2020 Testing", link: "/products/standards/ieee-p2020" }
  ]
}

// 2. Products > Illumination Devices (oder passende Kategorie)
"Illumination Devices": {
  subgroups: [
    { name: "IEEE-P2020", link: "/products/standards/ieee-p2020" }
  ]
}

// 3. Services > Standardized
"Standardized": {
  services: [
    { name: "IEEE-P2020 (ADAS)", link: "/products/standards/ieee-p2020" }
  ]
}
```

**Alle 5 Sprach-Dateien aktualisieren:**
- `navigationData.ts` (EN)
- `navigationData.de.ts` (DE)
- `navigationData.zh.ts` (ZH)
- `navigationData.ja.ts` (JA)
- `navigationData.ko.ts` (KO)

**Ohne diesen Schritt:** Seite ist nicht über Navigation erreichbar, nur via direkter URL!

---

## Phase 4: Admin-Dashboard-Zugriff

### 4.1 Editor-Zugriff gewähren (optional)
Wenn bestimmte User nur diese Seite bearbeiten dürfen:

```sql
INSERT INTO editor_page_access (user_id, page_slug) VALUES
  ('user-uuid-hier', 'my-product');
```

---

## Checkliste vor Go-Live

### Code-Ebene
- [ ] Alle 3 `page_slug` Stellen in der Komponente angepasst
- [ ] `renderSegment()` Funktion ist identisch mit Machine Vision
- [ ] Alle State-Variablen vorhanden
- [ ] `loadContent()` prüft auf `applications_items` (NICHT `applications`)
- [ ] SEOHead mit korrekten Props
- [ ] Route in App.tsx eingetragen
- [ ] **Preview-Button Route in AdminDashboard.tsx eingetragen** (urlMap)

### Datenbank-Ebene
- [ ] Segment Registry Einträge für alle Segmente
- [ ] Page Content mit allen erforderlichen section_keys
- [ ] tab_order definiert
- [ ] SEO Settings vorhanden
- [ ] Page Registry Eintrag (optional)

### Darstellung testen
- [ ] Seite lädt ohne Fehler
- [ ] Meta-Navigation wird angezeigt (wenn vorhanden)
- [ ] Hero Section zeigt korrekt (wenn befüllt)
- [ ] Tiles haben weißen Hintergrund und schwarzen Text
- [ ] Banner hat hellgrauen Hintergrund (#f3f3f5)
- [ ] Solutions-Cards haben weißen Hintergrund
- [ ] Alle Segmente werden in richtiger Reihenfolge angezeigt

### Console-Check
- [ ] Keine Fehler in Browser-Console
- [ ] Keine 404-Fehler bei Supabase-Abfragen
- [ ] Loading-State funktioniert

---

## Häufige Fehler vermeiden

### ❌ FEHLER 1: Falsche Farben (gelb statt weiß)
**Problem:** Cards haben `bg-card` statt `bg-white`
**Lösung:** Verwende exakt die Klassen aus Machine Vision:
```typescript
className="bg-white rounded-lg shadow-sm hover:shadow-lg..."
```

### ❌ FEHLER 2: Segmente werden nicht angezeigt
**Problem:** `applications.length > 0` Check in renderSegment
**Lösung:** Statische Segmente OHNE Length-Check:
```typescript
if (segmentId === 'tiles') { // KEIN && applications.length > 0
```

### ❌ FEHLER 3: Applications-Array leer
**Problem:** Code lädt `applications` statt `applications_items`
**Lösung:** In loadContent:
```typescript
} else if (item.section_key === "applications_items") {
  apps = JSON.parse(item.content_value);
```

### ❌ FEHLER 4: Inkonsistente Abstände
**Problem:** Eigene Padding-Werte verwendet
**Lösung:** Verwende Standard-Pattern:
- Hero: `pt-16 md:pt-20` (medium)
- Tiles: `py-8` 
- Banner: `py-16`
- Solutions: `py-20`

### ❌ FEHLER 5: Meta-Navigation falsch positioniert
**Problem:** Meta-Navigation wird nicht direkt nach Haupt-Navigation gerendert  
**Symptom:** Meta-Nav erscheint irgendwo auf der Seite oder gar nicht  
**KRITISCH:** Meta-Navigation MUSS IMMER direkt nach `<Navigation />` kommen!

**❌ FALSCHE Lösungen:**
```typescript
// FALSCH 1: Position-Filter (veraltet)
{pageSegments.filter(seg => seg.position === 0).map(seg => renderSegment(seg.id))}

// FALSCH 2: Ohne Filter (rendert doppelt)
{tabOrder.map(segmentId => renderSegment(segmentId))}
```

**✅ RICHTIGE Lösung:**
```typescript
{/* Navigation */}
<Navigation />

{/* MANDATORY: Meta Navigation - Always First (Below Nav Bar) */}
{tabOrder
  .filter(segmentId => {
    const dynamicSegment = pageSegments.find(seg => seg.id === segmentId);
    return dynamicSegment && dynamicSegment.type === 'meta-navigation';
  })
  .map(segmentId => renderSegment(segmentId))}

{/* Hero Section DANACH */}
{renderSegment('hero')}

{/* Alle anderen Segmente (meta-navigation ausfiltern!) */}
{tabOrder
  .filter(segmentId => {
    const dynamicSegment = pageSegments.find(seg => seg.id === segmentId);
    return !(dynamicSegment && dynamicSegment.type === 'meta-navigation');
  })
  .map(segmentId => renderSegment(segmentId))}
```

**Warum wichtig:**
- Meta-Navigation = Inhaltsverzeichnis mit Sprungmarken
- MUSS unter Haupt-Navigation sichtbar sein
- Nutzer erwarten es dort (UX-Standard)

### ❌ FEHLER 6: Editor zeigt "coming soon"
**Problem:** Segment-Typ hat keinen Editor im AdminDashboard
**Status prüfen:** Siehe Tabelle "Verfügbare Segment-Typen & Editoren" oben
**Für neue Editoren:** Editor-Komponente erstellen und in AdminDashboard.tsx einbinden (ca. Zeile 5057+)

### ❌ FEHLER 7: Preview-Button führt zur Startseite
**Problem:** Neue Seite nicht im `urlMap` des AdminDashboards eingetragen  
**Symptom:** Klick auf "Preview Frontend" öffnet `/` statt `/products/category/my-product`  
**Lösung:** In `src/pages/AdminDashboard.tsx` (ca. Zeile 2240+):
```typescript
const urlMap: Record<string, string> = {
  // ... bestehende Routes
  'my-product': '/products/category/my-product'  // <-- HINZUFÜGEN
};
```
**Testen:** Nach Fix: Preview-Button klicken → korrekte Seite öffnet sich

---

## Segment-Typen im Detail

### Meta-Navigation (`meta-navigation`)
**Verwendung:** Inhaltsverzeichnis mit Sprungmarken  
**Position:** Immer Position 0 (oberhalb Hero)  
**Datenstruktur:**
```json
{
  "links": [
    { "label": "Overview", "anchor": "segment-id-100" },
    { "label": "Applications", "anchor": "segment-id-101" }
  ]
}
```
**Editor:** ✅ MetaNavigationEditor

### Product Hero Gallery (`product-hero-gallery`)
**Verwendung:** Hero-Sektion mit Produktbildern in Galerie  
**Position:** Beliebig (meist nach Meta-Navigation)  
**Datenstruktur:**
```json
{
  "title": "Produktname",
  "subtitle": "Produktvarianten",
  "description": "Beschreibung",
  "imagePosition": "right",
  "layoutRatio": "1-1",
  "topSpacing": "medium",
  "cta1Text": "Contact Sales",
  "cta1Link": "#contact",
  "cta1Style": "standard",
  "images": [
    {
      "imageUrl": "https://...",
      "title": "Variante 1",
      "description": "Beschreibung"
    }
  ]
}
```
**Editor:** ✅ ProductHeroGalleryEditor

### Tiles (`tiles`)
**Verwendung:** Kachel-Grid für Applications/Features  
**Segment-Key in DB:** `applications` oder `tiles`  
**Datenstruktur in page_content:**
```sql
('my-product', 'applications_title', 'text', 'Anwendungsbereiche'),
('my-product', 'applications_description', 'text', 'Beschreibung'),
('my-product', 'applications_items', 'json', '[...]'),
('my-product', 'tiles_columns', 'text', '3')
```
**Editor:** ✅ Inline Editor im AdminDashboard  
**Rendering:** Siehe Machine Vision Zeile 318-427

### Banner (`banner`)
**Verwendung:** Logo-Streifen mit optionalem CTA-Button  
**Hintergrund:** Immer `#f3f3f5`  
**Datenstruktur:**
```json
{
  "title": "Banner Titel",
  "subtext": "Optionaler Untertitel",
  "images": [
    { "url": "https://...", "alt": "Logo 1" }
  ],
  "buttonText": "Learn More",
  "buttonLink": "https://...",
  "buttonStyle": "standard"
}
```
**Editor:** ✅ BannerEditor  
**Rendering:** Siehe Machine Vision Zeile 194-265

### Image-Text (`image-text`)
**Verwendung:** Bild-Text-Kombinationen (z.B. Solutions)  
**Segment-Key in DB:** `solutions` oder `image-text`  
**Layout-Optionen:** `1-col`, `2-col`, `3-col`  
**Datenstruktur:**
```json
{
  "title": "Lösungen",
  "subtext": "Optionaler Untertitel",
  "layout": "2-col",
  "items": [
    {
      "imageUrl": "https://...",
      "title": "Lösung 1",
      "description": "Beschreibung"
    }
  ]
}
```
**Editor:** ✅ Inline Editor im AdminDashboard  
**Rendering:** Siehe Machine Vision Zeile 267-316

### Feature Overview (`feature-overview`)
**Verwendung:** Feature-Listen OHNE Bilder  
**Layout-Optionen:** `2`, `3`, `4` (Spalten)  
**Editor:** ✅ FeatureOverviewEditor  
**Komponente:** `src/components/segments/FeatureOverview.tsx`

### Table (`table`)
**Verwendung:** Daten-Tabellen mit Kopfzeile  
**Editor:** ✅ TableEditor  
**Komponente:** `src/components/segments/Table.tsx`

### FAQ (`faq`)
**Verwendung:** Accordion mit Fragen & Antworten  
**Editor:** ✅ FAQEditor  
**Komponente:** `src/components/segments/FAQ.tsx`

### Video (`video`)
**Verwendung:** Video-Einbettung (YouTube, Vimeo)  
**Editor:** ✅ VideoSegmentEditor  
**Komponente:** `src/components/segments/Video.tsx`

### Specification (`specification`)
**Verwendung:** Technische Spezifikationen in Tabelle  
**Editor:** ✅ SpecificationEditor  
**Komponente:** `src/components/segments/Specification.tsx`

---

## Workflow-Zusammenfassung

```
1. Datenbank vorbereiten
   └─> segment_registry Einträge
   └─> page_content Einträge
   └─> page_registry (optional)

2. React-Komponente erstellen
   └─> Von Machine Vision kopieren
   └─> Nur page_slug ändern (3x)
   └─> NICHTS anderes ändern!

3. Route hinzufügen
   └─> App.tsx aktualisieren

4. Testen
   └─> Seite aufrufen
   └─> Console prüfen
   └─> Darstellung prüfen
   └─> Admin-Dashboard testen

5. Inhalte befüllen
   └─> Über Admin-Dashboard
   └─> Oder direkt in Datenbank
```

---

## Troubleshooting

### Seite ist leer / lädt nicht
1. Browser-Console öffnen
2. Nach Supabase-Fehlern suchen
3. Prüfen: Gibt es page_content Einträge für den slug?
4. Prüfen: Ist page_slug korrekt geschrieben?

### Tiles werden nicht angezeigt
1. Prüfen: `applications_items` in DB vorhanden und JSON-Array?
2. Prüfen: In loadContent wird `applications_items` geladen?
3. Prüfen: renderSegment hat KEIN `&& applications.length > 0`

### Falsche Farben
1. Vergleiche deine Klassen mit Machine Vision
2. Suche nach `bg-card` → ersetze mit `bg-white`
3. Suche nach Design-System-Tokens → ersetze mit expliziten Klassen

### Meta-Navigation fehlt
1. Prüfen: page_segments in DB mit position: 0?
2. Prüfen: Filter für position 0 VOR Hero?
3. Prüfen: segmentIdMap wird korrekt geladen?

### Editor zeigt "coming soon"
1. Prüfen: Ist der Segment-Typ in der Editor-Tabelle oben aufgeführt?
2. Wenn Editor fehlt: In `src/pages/AdminDashboard.tsx` (Zeile 5057+) nachsehen
3. Neue Editoren: In `src/components/admin/` erstellen und in AdminDashboard einbinden
4. Wichtig: Doppelte meta-navigation Editoren vermeiden (einer mit availableSegments bei ~Zeile 4114)

### Bilder werden nicht hochgeladen
1. Prüfen: Supabase Storage Bucket `page-images` existiert und ist public
2. Prüfen: `extractImageMetadata` erhält 2 Parameter: `(file, url)`
3. Prüfen: Metadata enthält `altText` Feld (erforderlich)

---

## Support & Referenzen

- **Referenz-Code:** `src/pages/MachineVision.tsx`
- **Admin Dashboard:** `/admin` (als Admin einloggen)
- **Segment-Komponenten:** `src/components/segments/`
- **Design-System:** `src/index.css`, `tailwind.config.ts`

Bei Problemen: Vergleiche IMMER mit Machine Vision - das ist die funktionierende Vorlage!
