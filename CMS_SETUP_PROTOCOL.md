# CMS Setup Protocol - Verified Workflow

Dieses Protokoll beschreibt den vollständigen, fehlerfreien Workflow zur Einrichtung einer neuen CMS-Seite im System.

## Übersicht

Wenn eine neue Backend-Seite angelegt wird, folgt das System einem strikten, mehrstufigen Workflow, der sicherstellt, dass alle Komponenten korrekt eingerichtet und miteinander verbunden sind.

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

## Phase 4: Frontend-Integration (VEREINFACHT mit DynamicCMSPage)

### 4.1 Universelle CMS-Architektur
**WICHTIG:** Seit der Einführung der universellen `DynamicCMSPage`-Komponente werden **KEINE individuellen Frontend-Komponenten mehr erstellt**!

Die `DynamicCMSPage`-Komponente rendert automatisch alle CMS-Seiten basierend auf dem `pageSlug`-Parameter.

### 4.2 Route in App.tsx hinzufügen
Füge lediglich eine neue Route in `src/App.tsx` hinzu:

```tsx
// Hierarchische Routes mit DynamicCMSPage
<Route path="/your-solution/[page-slug]" element={<DynamicCMSPage pageSlug="[page-slug]" />} />

// Beispiele:
<Route path="/your-solution/photography" element={<DynamicCMSPage pageSlug="photography" />} />
<Route path="/your-solution/nir-automotive" element={<DynamicCMSPage pageSlug="nir-automotive" />} />
<Route path="/products/illumination/iq-led" element={<DynamicCMSPage pageSlug="iq-led" />} />
```

**Das war's!** Keine individuelle Komponente mehr nötig.

### 4.3 DynamicCMSPage - Automatische Segment-Rendering
Die `DynamicCMSPage`-Komponente (`src/components/DynamicCMSPage.tsx`) enthält automatisch Handler für **ALLE Segment-Typen**:
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

### 6.1 CMS-Funktionalität (Automatisch durch DynamicCMSPage)
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

## Best Practices

### 1. Immer von Parent Page erben
- Frontend-Struktur kopieren, nicht neu schreiben
- Sicherstellt Template-Konsistenz

### 2. Keine statischen Segmente außer Footer
- Hero, Tiles, Banner, Solutions sind dynamisch
- Nur Footer bleibt statisch und nicht-löschbar

### 3. ID-Vergabe strikt global
- Segment-IDs niemals wiederverwendung
- Page-IDs niemals wiederverwendung
- Fortlaufende Nummerierung über alle Seiten hinweg

### 4. Automatische Cleanup-Mechanismen
- Gelöschte Segmente aus tab_order filtern
- Segment-Existenz gegen segment_registry prüfen

### 5. Vollständige Handler-Abdeckung
- Alle 14 Segment-Typen müssen Handler haben
- Bei neuen Segment-Typen: Handler system-weit hinzufügen

---

## Checkliste für neue CMS-Seite

- [ ] Parent Page identifiziert
- [ ] Page ID & Parent ID bestimmt
- [ ] page_registry Eintrag erstellt
- [ ] segment_registry: Footer-Segment hinzugefügt
- [ ] page_content: tab_order, page_segments, seo_data angelegt
- [ ] Frontend-Komponente von Parent Page kopiert
- [ ] Alle 14 Segment-Handler implementiert
- [ ] Route in App.tsx hinzugefügt
- [ ] Navigation (Desktop & Mobile) aktualisiert
- [ ] Navigation.tsx urlToPageSlug mapping hinzugefügt
- [ ] Qualitäts-Check durchgeführt
- [ ] Seite ist gelb im Dropdown
- [ ] Preview-Button funktioniert
- [ ] Frontend-Navigation funktioniert
- [ ] Nur konfigurierte Segmente werden angezeigt
- [ ] Memory aktualisiert

---

**Letzte Aktualisierung:** 2025-11-17
**Autor:** AI Assistant
**Status:** Produktionsreif
