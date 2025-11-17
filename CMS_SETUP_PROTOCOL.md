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

## Phase 4: Frontend-Komponente

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
