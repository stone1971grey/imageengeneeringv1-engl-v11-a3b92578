# CMS Page Template - Anleitung

## Neue CMS-fähige Produktseite erstellen

### 1. Datei erstellen
Erstelle eine neue Datei in `src/pages/` z.B. `ProductNEWPRODUCT.tsx`

### 2. Imports (IMMER ALLE erforderlich)
```typescript
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, TestTube, Monitor, /* weitere Icons */ } from "lucide-react";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import MetaNavigation from "@/components/segments/MetaNavigation";
import ProductHeroGallery from "@/components/segments/ProductHeroGallery";
import FeatureOverview from "@/components/segments/FeatureOverview";
import Table from "@/components/segments/Table";
import FAQ from "@/components/segments/FAQ";
import Specification from "@/components/segments/Specification";
import { Video } from "@/components/segments/Video";
import { SEOHead } from "@/components/SEOHead";
import { supabase } from "@/integrations/supabase/client";
```

### 3. Icon Map (für Tiles & Solutions)
```typescript
const iconMap: Record<string, any> = {
  FileText, Download, BarChart3, Zap, Shield, Eye,
  Car, Smartphone, Heart, CheckCircle, Lightbulb,
  Monitor, Camera, TestTube, /* weitere Icons */
};
```

### 4. State Variables (ALLE erforderlich)
```typescript
const [content, setContent] = useState<Record<string, string>>({});
const [applications, setApplications] = useState<any[]>([]);
const [tilesColumns, setTilesColumns] = useState<string>("3");
const [loading, setLoading] = useState(true);
const [heroImageUrl, setHeroImageUrl] = useState<string>("");
const [heroImagePosition, setHeroImagePosition] = useState<string>("right");
const [heroLayout, setHeroLayout] = useState<string>("2-5");
const [heroTopPadding, setHeroTopPadding] = useState<string>("medium");
const [heroCtaLink, setHeroCtaLink] = useState<string>("#applications-start");
const [heroCtaStyle, setHeroCtaStyle] = useState<string>("standard");
const [bannerTitle, setBannerTitle] = useState<string>("");
const [bannerSubtext, setBannerSubtext] = useState<string>("");
const [bannerImages, setBannerImages] = useState<any[]>([]);
const [bannerButtonText, setBannerButtonText] = useState<string>("");
const [bannerButtonLink, setBannerButtonLink] = useState<string>("");
const [bannerButtonStyle, setBannerButtonStyle] = useState<string>("standard");
const [solutionsTitle, setSolutionsTitle] = useState<string>("");
const [solutionsSubtext, setSolutionsSubtext] = useState<string>("");
const [solutionsLayout, setSolutionsLayout] = useState<string>("2-col");
const [solutionsItems, setSolutionsItems] = useState<any[]>([]);
const [hasHeroContent, setHasHeroContent] = useState(false);
const [segmentIdMap, setSegmentIdMap] = useState<Record<string, number>>({});
const [seoData, setSeoData] = useState<any>({});
const [pageSegments, setPageSegments] = useState<any[]>([]);
const [tabOrder, setTabOrder] = useState<string[]>([]);
```

### 5. loadContent Funktion (KRITISCH)
```typescript
const loadContent = async () => {
  const { data, error } = await supabase
    .from("page_content")
    .select("*")
    .eq("page_slug", "YOUR-PAGE-SLUG"); // <-- ANPASSEN!

  // Load segment registry for ID mapping
  const { data: segmentData } = await supabase
    .from("segment_registry")
    .select("*")
    .eq("page_slug", "YOUR-PAGE-SLUG"); // <-- ANPASSEN!

  if (segmentData) {
    const idMap: Record<string, number> = {};
    segmentData.forEach((seg: any) => {
      idMap[seg.segment_key] = seg.segment_id;
    });
    setSegmentIdMap(idMap);
  }

  if (!error && data) {
    const contentMap: Record<string, string> = {};
    let apps: any[] = [];
    let heroExists = false;

    data.forEach((item: any) => {
      // WICHTIG: Alle diese Checks einbauen!
      if (item.section_key === "page_segments") {
        try {
          const segments = JSON.parse(item.content_value);
          setPageSegments(segments);
        } catch (e) {
          console.error("Error parsing page_segments:", e);
        }
      } else if (item.section_key === "tab_order") {
        try {
          const order = JSON.parse(item.content_value);
          setTabOrder(order || ['tiles', 'banner', 'solutions']);
        } catch {
          setTabOrder(['tiles', 'banner', 'solutions']);
        }
      } else if (item.section_key === "applications") {
        try {
          apps = JSON.parse(item.content_value);
        } catch (e) {
          console.error("Error parsing applications:", e);
        }
      } else if (item.section_key === "banner_images") {
        try {
          const images = JSON.parse(item.content_value);
          setBannerImages(images);
        } catch (e) {
          console.error("Error parsing banner images:", e);
        }
      } else if (item.section_key === "solutions_items") {
        try {
          const items = JSON.parse(item.content_value);
          setSolutionsItems(items);
        } catch (e) {
          console.error("Error parsing solutions items:", e);
        }
      } else if (item.section_key === "seo") {
        try {
          const seoSettings = JSON.parse(item.content_value);
          setSeoData(seoSettings);
        } catch {
          // Keep empty seo data
        }
      } else {
        contentMap[item.section_key] = item.content_value;
      }

      // Check if hero content exists
      if (item.section_key.startsWith("hero_") && item.content_value && item.content_value.trim() !== "") {
        heroExists = true;
      }
    });

    setContent(contentMap);
    setApplications(apps);
    setHasHeroContent(heroExists);
    
    // Set individual state values
    setHeroImageUrl(contentMap.hero_image_url || "");
    setHeroImagePosition(contentMap.hero_image_position || "right");
    setHeroLayout(contentMap.hero_layout || "2-5");
    setHeroTopPadding(contentMap.hero_top_padding || "medium");
    setHeroCtaLink(contentMap.hero_cta_link || "#applications-start");
    setHeroCtaStyle(contentMap.hero_cta_style || "standard");
    setTilesColumns(contentMap.tiles_columns || "3");
    setBannerTitle(contentMap.banner_title || "");
    setBannerSubtext(contentMap.banner_subtext || "");
    setBannerButtonText(contentMap.banner_button_text || "");
    setBannerButtonLink(contentMap.banner_button_link || "");
    setBannerButtonStyle(contentMap.banner_button_style || "standard");
    setSolutionsTitle(contentMap.solutions_title || "");
    setSolutionsSubtext(contentMap.solutions_subtext || "");
    setSolutionsLayout(contentMap.solutions_layout || "2-col");
  }
  setLoading(false);
};
```

### 6. Helper Functions (IMMER erforderlich)
```typescript
const getLayoutClasses = () => {
  const layouts: Record<string, string> = {
    "50-50": "md:grid-cols-2",
    "1-6": "md:grid-cols-[1fr_6fr]",
    "2-5": "md:grid-cols-[2fr_5fr]",
    "3-4": "md:grid-cols-[3fr_4fr]",
    "4-3": "md:grid-cols-[4fr_3fr]",
    "5-2": "md:grid-cols-[5fr_2fr]",
    "6-1": "md:grid-cols-[6fr_1fr]",
  };
  return layouts[heroLayout] || "md:grid-cols-[2fr_5fr]";
};

const getPaddingClass = () => {
  const paddings: Record<string, string> = {
    none: "pt-0",
    small: "pt-8 md:pt-12",
    medium: "pt-16 md:pt-20",
    large: "pt-24 md:pt-32",
  };
  return paddings[heroTopPadding] || "pt-16 md:pt-20";
};

const getButtonClasses = (style: string) => {
  if (style === "technical") {
    return "inline-flex items-center justify-center px-8 py-4 rounded-md text-lg font-medium transition-all duration-300 hover:scale-105 bg-gray-900 text-white hover:bg-gray-800";
  }
  return "inline-flex items-center justify-center px-8 py-4 rounded-md text-lg font-medium transition-all duration-300 hover:scale-105 bg-[#f9dc24] text-black hover:bg-[#e5ca20]";
};

// KRITISCH: Segment Rendering
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
    if (dynamicSegment.type === 'specification') {
      return <Specification key={segmentId} id={segmentId} {...dynamicSegment.data} />;
    }
    if (dynamicSegment.type === 'video') {
      return <Video key={segmentId} id={segmentId} {...dynamicSegment.data} />;
    }
  }
  return null;
};
```

### 7. Render Structure (KRITISCH für CMS)
```tsx
return (
  <>
    <SEOHead
      title={seoData.title || "Product Title"}
      description={seoData.description || "Product description"}
      canonical={seoData.canonical}
      robotsIndex={seoData.robotsIndex !== false ? "index" : "noindex"}
      robotsFollow={seoData.robotsFollow !== false ? "follow" : "nofollow"}
    />
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* WICHTIG: Dynamische Segmente mit position 0 (Meta-Nav etc.) */}
      {pageSegments
        .filter(seg => seg.position === 0)
        .map(seg => renderSegment(seg.id))}
      
      {/* Hero Section */}
      {hasHeroContent && (
        <section id="108" className={`w-full bg-gradient-to-b from-gray-50 to-white ${getPaddingClass()} pb-12 md:pb-20`}>
          {/* Hero Content hier */}
        </section>
      )}

      {/* Tiles Section */}
      {applications.length > 0 && (
        <section id="109" className="py-20 bg-white">
          {/* Tiles Content hier */}
        </section>
      )}

      {/* Banner Section */}
      {bannerTitle && (
        <section id="110" className="bg-gray-50 py-16">
          {/* Banner Content hier */}
        </section>
      )}

      {/* Solutions Section */}
      {solutionsItems && solutionsItems.length > 0 && (
        <section id="111" className="bg-gray-50 py-20">
          {/* Solutions Content hier */}
        </section>
      )}

      {/* WICHTIG: Alle dynamischen Segmente aus tabOrder rendern */}
      {tabOrder
        .filter(segmentId => {
          const dynamicSegment = pageSegments.find(seg => seg.id === segmentId);
          return !(dynamicSegment && dynamicSegment.type === 'meta-navigation');
        })
        .map((segmentId) => renderSegment(segmentId))}

      <Footer />
    </div>
  </>
);
```

## CHECKLISTE für neue CMS-Seiten

- [ ] Alle Imports vorhanden (besonders Segment-Komponenten)
- [ ] Icon Map definiert
- [ ] Alle State Variables deklariert
- [ ] `pageSegments` und `tabOrder` State vorhanden
- [ ] `loadContent` lädt `page_segments` und `tab_order`
- [ ] `segmentIdMap` wird aus `segment_registry` geladen
- [ ] `renderSegment` Funktion implementiert
- [ ] Dynamische Segmente mit `position: 0` werden VOR Hero gerendert
- [ ] `tabOrder` Segmente werden AM ENDE gerendert
- [ ] Layout Classes unterstützen "50-50" Option
- [ ] Padding Classes sind konsistent
- [ ] Bilddarstellung mit `aspect-video` und `object-cover`
- [ ] Button verwendet `content.hero_cta` nicht `content.hero_cta_text`

## Häufige Fehler vermeiden

❌ **FALSCH**: `content.hero_cta_text` → ✅ **RICHTIG**: `content.hero_cta`
❌ **FALSCH**: `object-contain` → ✅ **RICHTIG**: `object-cover` mit `aspect-video`
❌ **FALSCH**: Nur statische Segmente → ✅ **RICHTIG**: Auch dynamische Segmente rendern
❌ **FALSCH**: `pt-56` für Hero → ✅ **RICHTIG**: `pt-8 md:pt-12` für small
❌ **FALSCH**: Meta-Nav nicht rendern → ✅ **RICHTIG**: `position: 0` Segmente rendern

## Database Setup für neue Seite

1. **segment_registry** Einträge erstellen:
```sql
INSERT INTO segment_registry (page_slug, segment_id, segment_key, segment_type, is_static)
VALUES 
  ('your-slug', 108, 'hero', 'hero', true),
  ('your-slug', 109, 'tiles', 'tiles', true),
  ('your-slug', 110, 'banner', 'banner', true),
  ('your-slug', 111, 'solutions', 'solutions', true),
  ('your-slug', 112, 'footer', 'footer', true);
```

2. **page_content** Basis-Einträge:
```sql
INSERT INTO page_content (page_slug, section_key, content_type, content_value)
VALUES 
  ('your-slug', 'page_segments', 'json', '[]'),
  ('your-slug', 'tab_order', 'json', '["tiles","banner","solutions"]'),
  ('your-slug', 'applications', 'json', '[]'),
  ('your-slug', 'hero_top_padding', 'text', 'small'),
  ('your-slug', 'hero_layout', 'text', '2-5');
```
