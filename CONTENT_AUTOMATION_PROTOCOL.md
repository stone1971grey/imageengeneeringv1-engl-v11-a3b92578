# Content Automation Protocol

**Stand:** 2025-12-26  
**Status:** VERBINDLICH - Keine Abweichungen erlaubt

---

## Übersicht

Dieses Protokoll definiert die verbindliche Vorgehensweise für den Content-Import von externen Seiten (insbesondere image-engineering.de) in das CMS via Firecrawl und Edge Function.

---

## 1. Architektur

```
┌─────────────────────┐     ┌──────────────────────────┐     ┌─────────────────┐
│ ContentAutomation   │────▶│ fetch-external-content   │────▶│ Firecrawl API   │
│ (Frontend)          │     │ (Edge Function)          │     │ (Scraping)      │
└─────────────────────┘     └──────────────────────────┘     └─────────────────┘
                                      │
                                      ▼
                            ┌──────────────────────────┐
                            │ Strukturierte Daten:     │
                            │ - title                  │
                            │ - description            │
                            │ - benefits               │
                            │ - specifications         │
                            │ - useCases               │
                            │ - downloads              │
                            │ - images                 │
                            │ - videoUrl               │
                            └──────────────────────────┘
```

---

## 2. Firecrawl-Konfiguration

```typescript
const firecrawlResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    url: url,
    formats: ['markdown', 'html', 'links'],  // ALLE DREI erforderlich
    onlyMainContent: true,                    // Navigation/Footer entfernen
    waitFor: 2000,                            // Dynamischen Content abwarten
  }),
});
```

---

## 3. Parsing-Logik für image-engineering.de

### 3.1 Content-Bereich identifizieren

Die IE-Seiten haben folgende Struktur:
```
[Navigation: Main Menu, ×, Test Equipment, etc.]
[Shop-Notice: "Our web shop is currently unavailable..."]
[HAUPTCONTENT: Produktbeschreibung in Paragraphen]
[Bilder mit Markdown: ![...](...)]
[Gallery mit JSON: {"id":..., "form_id":..., etc.}]
[Downloads-Bereich]
[Footer]
```

**Schritt 1: Start des Hauptcontents finden**
```typescript
// Strategy 1: Shop-Notice finden und zum NÄCHSTEN Absatz springen
const shopNoticeIdx = markdown.indexOf('Our web shop is currently unavailable');
if (shopNoticeIdx > 0) {
  const nextParaIdx = markdown.indexOf('\n\n', shopNoticeIdx);
  if (nextParaIdx > 0) {
    mainContentStart = nextParaIdx + 2; // Nach der Doppel-Newline
  }
}

// Strategy 2: Falls keine Shop-Notice, erstes H2 suchen
if (mainContentStart === 0) {
  const h2Idx = markdown.indexOf('## ');
  if (h2Idx > 0) {
    mainContentStart = h2Idx;
  }
}
```

**Schritt 2: Ende des Hauptcontents (JSON-Blöcke) finden**
```typescript
const jsonPatterns = [
  /\{[^{}]*"form_id":/,      // Galerie-JSON
  /\{[^{}]*"id":\d+,/,       // Objekt-JSON
  /\{[^{}]*"category":/,     // Kategorie-JSON
  /gallery images/i,          // Gallery-Marker
  /\[\s*\{/,                  // Array von Objekten
];

let jsonStartIndex = markdown.length;
for (const pattern of jsonPatterns) {
  const match = markdown.search(pattern);
  if (match > 0 && match < jsonStartIndex) {
    jsonStartIndex = match;
  }
}
```

**Schritt 3: Content-Portion extrahieren**
```typescript
const contentPortion = markdown.substring(mainContentStart, jsonStartIndex);
```

---

### 3.2 Paragraphen-Extraktion

```typescript
const blocks = contentPortion.split(/\n\n+/);

for (const block of blocks) {
  let trimmed = block.trim();
  
  // === SKIP-REGELN (in dieser Reihenfolge!) ===
  
  // 1. Header überspringen (werden für Titel verwendet)
  if (trimmed.startsWith('#')) continue;
  
  // 2. Navigation-Elemente überspringen
  if (trimmed === '×' || trimmed === 'Test Equipment' || trimmed === 'Main Menu') continue;
  
  // 3. Shop-Notice überspringen
  if (trimmed.includes('web shop is currently unavailable')) continue;
  
  // 4. Listen-Items überspringen (werden als Benefits verarbeitet)
  if (trimmed.match(/^[\-\*•]\s/)) continue;
  
  // 5. Fußnoten überspringen (escaped Asterisk am Anfang: \*)
  if (trimmed.match(/^\\\*/)) continue;
  
  // 6. Zu kurze Inhalte überspringen
  if (trimmed.length < 40) continue;
  
  // 7. Footer-Content überspringen (siehe isFooterContent())
  if (isFooterContent(trimmed)) continue;
  
  // 8. Navigation-Pfade überspringen
  if (trimmed.match(/^(Home|Products|Equipment|Software|Services|Company|Contact)\s*$/i)) continue;
  
  // === BEREINIGUNG ===
  let cleaned = trimmed
    .replace(/!\[[^\]]*\]\([^)]+\)/g, '')      // Bilder entfernen
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')   // Links entfernen, Text behalten
    .replace(/\*\*([^*]+)\*\*/g, '$1')         // Bold entfernen
    .replace(/\*([^*]+)\*/g, '$1')             // Italic entfernen
    .replace(/`([^`]+)`/g, '$1')               // Code entfernen
    .replace(/\\\*/g, '*')                      // Escaped Asterisks konvertieren
    .replace(/\\\\/g, '')                       // Escaped Backslashes entfernen
    .replace(/\s{2,}/g, ' ')                   // Whitespace normalisieren
    .trim();
  
  // === FINALE PRÜFUNGEN ===
  
  // Zu kurz nach Bereinigung
  if (cleaned.length < 40) continue;
  
  // JSON-Artefakte
  if (cleaned.includes('{"') || cleaned.includes('":"') || cleaned.includes('form_id')) continue;
  
  // Navigation-Pfade
  if (cleaned.match(/^[A-Za-z\s]+>\s/)) continue;
  
  paragraphs.push(cleaned);
}
```

---

### 3.3 Footer-Content-Erkennung

```typescript
function isFooterContent(text: string): boolean {
  const lower = text.toLowerCase();
  const footerPatterns = [
    'cookie', 'privacy policy', 'newsletter', 'subscribe', 'copyright', 
    'all rights reserved', 'impressum', 'datenschutz',
    'follow us', 'social media', 'facebook', 'twitter', 'linkedin', 'instagram',
    'menu', 'navigation', 'sitemap', 'breadcrumb',
    'login', 'register', 'anmelden', 'sign up', 'sign in',
    'related products', 'ähnliche produkte', 'you might also like',
    'web shop is currently unavailable', 'shop unavailable',
    'contact us', 'kontakt', 'get in touch',
    'back to top', 'nach oben', 'scroll to top',
    'page load', 'loading', 'please wait',
    'skip to content', 'skip to main',
  ];
  
  for (const pattern of footerPatterns) {
    if (lower.includes(pattern)) return true;
  }
  return false;
}
```

---

## 4. Segment-Erstellung (ContentAutomation.tsx)

Nach erfolgreicher Extraktion werden folgende Segmente erstellt:

| Segment-Typ | Quelle | Bedingung |
|-------------|--------|-----------|
| `product-hero-gallery` | title, description, images | Immer erstellen |
| `intro` | description (Langform) | Wenn description > 100 Zeichen |
| `specification` | specifications[] | Wenn specifications.length > 0 |
| `feature-overview` | benefits[] / useCases[] | Wenn benefits.length > 0 |
| `tiles` (Downloads) | downloads[] | Wenn downloads.length > 0 |
| `video` | videoUrl | Wenn videoUrl vorhanden |
| `faq` | - | Optional, manuell befüllen |
| `banner-p` | - | Standard-CTA-Banner |

---

## 5. Beispiel: Octa Light Player

**Input-URL:** `https://www.image-engineering.de/products/equipment/illumination-devices/1299-octa-light-player`

**Erwartete Extraktion:**

| # | Paragraph | Status |
|---|-----------|--------|
| 1 | "We recently partnered with Telelumen LLC to expand our illumination product offerings..." | ✅ Extrahiert |
| 2 | "The Octa Light Player covers the majority of the CIE color space..." | ✅ Extrahiert |
| 3 | "This light source is ideal for research environments and test labs..." | ✅ Extrahiert |
| 4 | "For further information and examples of use cases..." | ✅ Extrahiert |
| 5 | `\*This is not a recommended light source...` | ❌ Übersprungen (Fußnote) |

---

## 6. Debugging

Die Edge Function loggt ausführlich:

```
[Firecrawl] Fetching content from: <URL>
[Firecrawl] Markdown length: <n>
[Firecrawl] Found shop notice, skipping to: <index>
[Firecrawl] Main content starts at index: <index>
[Firecrawl] Content portion length: <n>
[Firecrawl] Content portion preview: <first 600 chars>
[Firecrawl] Extracted paragraph: <first 150 chars>...
[Firecrawl] Total extracted paragraphs: <n>
[Firecrawl] Final description length: <n>
```

**Logs prüfen:** Supabase Dashboard → Edge Function Logs → `fetch-external-content`

---

## 7. Wartung

Bei Änderungen an der IE-Website-Struktur:

1. Markdown einer Beispielseite mit `lov-fetch-website` abrufen
2. Neue Navigation-/Footer-Patterns identifizieren
3. `jsonPatterns` und `isFooterContent()` entsprechend anpassen
4. Edge Function deployen und testen
5. Dieses Protokoll aktualisieren

---

## 8. Verbindliche Regeln

### 8.1 STRIKTE SEGMENT-REGELN

**KEINE ERFUNDENEN SEGMENT-TYPEN:**
- Es dürfen **NUR** folgende existierende Segment-Typen verwendet werden:
  - `product-hero-gallery`
  - `action-hero`
  - `full-hero`
  - `intro`
  - `specification`
  - `feature-overview`
  - `faq`
  - `table`
  - `video`
  - `banner-p`
  - `downloads-segment`
  - `events-segment`
  - `industries-segment`
  - `news-segment`
  - `news-list-segment`
  - `product-list-segment`
  - `tiles`
- **VERBOTEN:** Erfinden von Segment-Typen wie "banner", "banner-prototype", "image-text", oder andere nicht existierende Typen

**KEINE WILLKÜRLICHEN SEGMENT-ERGÄNZUNGEN:**
- Ein Segment darf **NUR** erstellt werden, wenn:
  1. Es in der Quellseite entsprechenden Content gibt (z.B. Video nur wenn tatsächlich ein Video-URL gefunden wurde)
  2. Der Benutzer es explizit angefordert hat
- **VERBOTEN:** Hinzufügen von Placeholder-Content, Test-Videos, erfundenen URLs
- **VERBOTEN:** "Kreatives" Ergänzen von Segmenten nach eigenem Ermessen

### 8.2 CONTENT-FETCH-REGELN

**NUR GEFETCHTER CONTENT:**
- Bei Content-Import von externen Seiten wird **NUR** der tatsächlich extrahierte Content verwendet
- **VERBOTEN:** Erfinden, Hinzufügen, oder "Verbessern" von Content der nicht in der Quelle existiert
- **VERBOTEN:** Placeholder-URLs, Test-Daten, oder erfundene Informationen

**QUELL-TREUE:**
- Der importierte Content muss 1:1 der Quelle entsprechen
- Formatierung und Strukturierung ist erlaubt
- Inhaltliche Änderungen oder Ergänzungen sind **VERBOTEN**

### 8.3 ALLGEMEINE PARSING-REGELN

1. **NIEMALS** den Parsing-Algorithmus ohne vollständigen Trace ändern
2. **IMMER** vor dem Import die Edge Function mit echten Daten testen
3. **IMMER** die Logs prüfen, um die Extraktion zu verifizieren
4. **NIEMALS** auf Client-Seite parsen - alles in der Edge Function
5. **IMMER** Fußnoten (`\*...`) ausschließen
6. **IMMER** JSON-Artefakte (`{"`, `":"`, `form_id`) ausschließen

### 8.4 KI-REFINE REGELN

Für die "Refine with AI"-Funktion gelten zusätzlich:
1. **NUR** existierende Segment-Typen vorschlagen (siehe Liste in 8.1)
2. **NIEMALS** Placeholder-Content erstellen
3. Bei "Suggest Segments" nur Typen vorschlagen, für die auch Content vorhanden ist
4. **NIEMALS** willkürlich Videos, Bilder oder andere Medien hinzufügen

---

## 9. Fehlerbehebung bei falschen Segmenten

Wenn ein ungültiges oder halluziniertes Segment entdeckt wird:

1. Segment aus `segment_registry` löschen
2. Zugehörigen Content aus `page_content` löschen  
3. `tab_order` aktualisieren um das Segment zu entfernen
4. `page_segments` JSON bereinigen falls vorhanden
5. **NIEMALS** ein falsches Segment durch ein anderes willkürliches ersetzen

---

## 10. Feldnamen-Konventionen & Frontend-Kompatibilität

**KRITISCH:** Diese Feldnamen müssen exakt eingehalten werden, sonst rendert das Frontend die Inhalte nicht korrekt.

### 10.1 Segment-spezifische Feldnamen

| Segment-Typ | Datenbank-Feldname | Frontend erwartet | Fallback |
|-------------|-------------------|-------------------|----------|
| **intro** | `headline` | `headline` | `title` |
| **intro** | `introText` | `introText` | `description` |
| **tiles** (Items) | `ctaText` | `ctaText` | `buttonText` |
| **tiles** (Items) | `ctaLink` | `ctaLink` | `buttonLink` |
| **tiles** (Items) | `ctaStyle` | `ctaStyle` | `buttonStyle` |
| **tiles** (Items) | `showButton` | `showButton` | `true` |

### 10.2 URL-Typen in Buttons/CTAs

**REGEL:** Alle CTA/Button-Komponenten müssen zwischen internen und externen URLs unterscheiden:

- **Interne URLs** (z.B. `/contact`, `/products`): Verwenden `<Link to={...}>` von react-router-dom
- **Externe URLs** (z.B. `https://...`, Supabase Storage URLs): Verwenden `<a href={...} target="_blank">`

**Prüflogik:**
```typescript
if (url.startsWith('http://') || url.startsWith('https://')) {
  // Externe URL → <a> Tag mit target="_blank"
} else {
  // Interne URL → <Link> Komponente
}
```

### 10.3 Bei neuen Segment-Typen

1. **VOR dem Import:** Prüfen welche Feldnamen das Frontend erwartet (in `DynamicCMSPage.tsx` → `renderSegment` Funktion)
2. **Mapping dokumentieren:** Neue Feldnamen in diese Tabelle eintragen
3. **Fallbacks implementieren:** Im Frontend beide Varianten unterstützen während der Übergangszeit

### 10.4 Import-Checkliste (VOR jedem Content Automation Import)

- [ ] Zielseite existiert in `page_registry` mit korrektem hierarchischen Slug
- [ ] Feldnamen für alle zu erstellenden Segment-Typen sind bekannt
- [ ] Bilder werden in korrekten Ordner importiert (`page-images/{pageSlug}/`)
- [ ] Alle externen URLs (PDFs, Downloads) verwenden vollständige https:// URLs
- [ ] Bei Tiles mit Buttons: `ctaText`, `ctaLink`, `ctaStyle`, `showButton: true` verwenden

---

## 11. Asset-Download & Media Management Integration

### 11.1 Edge Function: download-external-file

**KRITISCH:** Diese Edge Function ist für den Download externer Assets (Bilder, PDFs) verantwortlich.

**Deployment-Anforderungen:**
```toml
# supabase/config.toml - MUSS enthalten:
[functions.download-external-file]
verify_jwt = false
```

**Funktionsweise:**
1. Empfängt externe URL als Parameter
2. Lädt Datei server-seitig herunter (umgeht CORS)
3. Speichert in Supabase Storage unter `page-images/{pageSlug}/{segmentType}/`
4. Erstellt `file_segment_mappings` Eintrag für Media Management

### 11.2 SOURCE_URL_MAPPING (KRITISCH!)

**REGEL:** Jede zu importierende Seite MUSS einen Eintrag in `SOURCE_URL_MAPPING` haben!

```typescript
// src/components/admin/ContentAutomation.tsx
const SOURCE_URL_MAPPING: Record<string, { default: string; de?: string; ja?: string }> = {
  'products/illumination-devices/kork': {
    default: 'https://www.image-engineering.de/products/equipment/measurement-devices/1245-kork',
    de: 'https://www.image-engineering.de/de/produkte/equipment/measurement-devices/1245-kork',
  },
  // ... weitere Seiten
};
```

**FEHLER ohne Mapping:**
- Firecrawl erhält falsche/keine URL
- 404-Seite wird gescraped → leerer Content
- Import erscheint erfolgreich, aber keine Daten

### 11.3 Asset-Speicherstruktur

```
page-images/
└── {pageSlug}/
    ├── product-hero-gallery/
    │   └── hero-image.jpg
    ├── tiles/
    │   └── download-icon.png
    └── image-text/
        └── feature-image.jpg
```

### 11.4 file_segment_mappings Pflicht

Jedes heruntergeladene Asset MUSS registriert werden:

```typescript
await supabase.from('file_segment_mappings').upsert({
  file_path: `page-images/${pageSlug}/${segmentType}/${filename}`,
  segment_ids: [segmentId],
  bucket_id: 'page-images',
  visibility: 'public',
  alt_text: extractedAltText || title,
});
```

---

## 12. Segment-Handler in DynamicCMSPage.tsx

### 12.1 Handler-Vollständigkeit

**KRITISCH:** Für jeden Segment-Typ MUSS ein `case` in der `renderSegment` Switch-Anweisung existieren!

**Aktuelle Handler:**
| Segment-Typ | Handler vorhanden | Komponente |
|-------------|-------------------|------------|
| `product-hero-gallery` | ✅ | `ProductHeroGallery` |
| `product-hero` | ✅ | `ProductHeroGallery` (single image) |
| `action-hero` | ✅ | `ActionHero` |
| `full-hero` | ✅ | `FullHero` |
| `intro` | ✅ | `IntroSection` |
| `specification` | ✅ | `Specification` |
| `feature-overview` | ✅ | `FeatureOverview` |
| `faq` | ✅ | `FAQ` |
| `table` | ✅ | `DynamicTable` |
| `video` | ✅ | `Video` |
| `banner-p` | ✅ | `BannerP` |
| `tiles` | ✅ | `Tiles` |
| `image-text` | ✅ | `ImageText` |
| `events-segment` | ✅ | `EventsSegment` |
| ... | ... | ... |

**Bei fehlendem Handler:** Segment wird NICHT gerendert, obwohl Daten vorhanden sind!

### 12.2 Handler-Template für neue Segment-Typen

```typescript
case "new-segment-type":
  return (
    <NewSegmentComponent
      key={`${segmentId}-${refreshCounter}`}
      id={segmentDbId?.toString()}
      data={{
        // Pflichtfelder aus segment.data extrahieren
        title: segment.data?.title || "",
        description: segment.data?.description || "",
        // ...
      }}
      segmentKey={`${segment.type}-${segment.id}`}
      pageSlug={pageSlug}
      language={currentUrlLanguage}
      onContentUpdate={refreshPageContent}
    />
  );
```

---

## 13. Pre-Import Checkliste (ERWEITERT)

### 13.1 VOR dem Content Automation Import

- [ ] **SOURCE_URL_MAPPING:** Korrekte URL für Zielseite eingetragen?
- [ ] **Edge Functions deployed:** `download-external-file` aktiv und `verify_jwt = false`?
- [ ] **page_registry:** Hierarchischer Slug existiert (z.B. `products/illumination-devices/kork`)?
- [ ] **Segment-Handler:** Alle benötigten Segment-Typen haben Handler in `DynamicCMSPage.tsx`?
- [ ] **Alte Daten bereinigt:** Vorherige fehlgeschlagene Importe gelöscht?

### 13.2 NACH dem Import

- [ ] **Frontend-Check:** Seite aufrufen, alle Segmente sichtbar?
- [ ] **Bilder laden:** Assets aus Supabase Storage, nicht von Originalseite?
- [ ] **Media Management:** Assets in korrektem Ordner mit Segment-Zuordnung?
- [ ] **PDFs:** Download-Links zeigen auf Supabase Storage (nicht original URL)?

---

## 14. Fehlerdiagnose-Matrix

| Symptom | Ursache | Lösung |
|---------|---------|--------|
| Leerer Content importiert | Falsche/fehlende SOURCE_URL | Mapping in ContentAutomation.tsx prüfen/ergänzen |
| Bilder nicht angezeigt | Segment-Handler fehlt | `case` in DynamicCMSPage.tsx hinzufügen |
| PDFs laden von externer URL | download-external-file nicht deployed | Edge Function deployen, config.toml prüfen |
| Assets nicht in Media Management | file_segment_mappings fehlt | Upload-Logik mit Mapping prüfen |
| 404 bei Seitenaufruf | Falscher page_slug | Hierarchischen Slug in page_registry prüfen |
| Segment existiert, wird nicht gerendert | Kein Handler für Segment-Typ | Switch-Case in renderSegment ergänzen |
| Product Hero nicht im Backend sichtbar | segment.type 'product-hero' nicht erkannt | DynamicSegmentRenderer.tsx beide Typen ('hero' + 'product-hero') unterstützen |
| Product Hero Felder leer | Feld-Naming-Konflikt | ProductHeroEditor.tsx beide Feld-Varianten (hero_* + simple) lesen/schreiben |

---

## 15. Product Hero Segment: Feld-Normalisierung

### 15.1 Zwei Feld-Varianten

Content Automation und ProductHeroEditor verwenden unterschiedliche Feldnamen:

| Content Automation | Legacy (ProductHeroEditor) |
|--------------------|---------------------------|
| `title` | `hero_title` |
| `subtitle` | `hero_subtitle` |
| `description` | `hero_description` |
| `imageUrl` | `hero_image_url` |
| `metadata` | `hero_image_metadata` |
| `ctaText` | `hero_cta_text` |
| `ctaLink` | `hero_cta_link` |

### 15.2 Normalisierungs-Regel

**BEIM LESEN:** Immer beide Varianten akzeptieren mit Fallback:
```typescript
const title = data.hero_title || data.title || '';
```

**BEIM SPEICHERN:** Immer BEIDE Varianten schreiben:
```typescript
const updatedData = {
  hero_title: title,
  title: title,
  // ... weitere Felder
};
```

### 15.3 Segment-Typ Unterstützung

Sowohl `'hero'` (Legacy) als auch `'product-hero'` (Content Automation) müssen unterstützt werden:
- `DynamicSegmentRenderer.tsx`: `segment.type === 'hero' || segment.type === 'product-hero'`
- `ProductHeroEditor.tsx`: Beide Typen beim Laden suchen
- `SEOEditor.tsx`: Beide Typen für H1-Erkennung prüfen

---

**Erstellt:** 2025-12-26  
**Letzte Aktualisierung:** 2025-12-31  
**Status:** PRODUKTIONSREIF v2.1
