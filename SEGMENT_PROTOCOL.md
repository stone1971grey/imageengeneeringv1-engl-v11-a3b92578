# Segment-Protokoll
## Basis für alle CMS-Segment-Definitionen

Dieses Dokument definiert alle Segment-Typen im CMS-System, deren Erscheinungsbild, Funktionalität und technische Implementierung. Es dient als verbindliche Referenz für die Entwicklung und Wartung aller Segmente.

---

## Status: Definierte und validierte Segmente

**Aktueller Stand:** 5 von 18 Segmenten vollständig definiert und validiert

### ✅ 1. INTRO-SEGMENT
**Status:** Vollständig definiert und validiert

#### Beschreibung
Das Intro-Segment dient als einleitende Textsektion direkt unter dem Hero-Bereich. Es präsentiert einen großen Titel und eine Beschreibung zentral auf der Seite.

#### Visuelle Eigenschaften
- **Hintergrund:** Weiß (`bg-white`)
- **Abstände:** `pt-14 pb-12` (Top/Bottom Padding)
- **Container:** Standard Container mit `px-6`
- **Zentrierung:** Vollständig zentriert (`text-center`)

#### Inhaltsstruktur
1. **Titel (H1)**
   - Schriftgröße: `text-4xl md:text-5xl`
   - Schriftgewicht: Bold (`font-bold`)
   - Farbe: `text-light-foreground`
   - Abstand unten: `mb-8`
   - Tracking: Tight (`tracking-tight`)

2. **Beschreibung (Paragraph)**
   - Schriftgröße: `text-xl`
   - Farbe: `text-light-muted`
   - Schriftgewicht: Light (`font-light`)
   - Maximale Breite: `max-w-2xl`
   - Zentrierung: `mx-auto`
   - Unterstützt: Zeilenumbrüche (`whitespace-pre-line`)

#### Backend-Konfiguration
```typescript
interface IntroSegmentData {
  title: string;           // Haupttitel (erforderlich)
  description: string;     // Beschreibungstext (erforderlich)
}
```

#### Standard-Werte
- Titel: "Your Partner for Objective Camera & Sensor Testing"
- Beschreibung: "Industry-leading solutions for comprehensive camera and sensor evaluation"

#### Verwendung
- Positionierung: Direkt nach Hero-Segment
- Zweck: Einführung in die Seite, Hauptbotschaft
- Einsatzgebiet: Alle Seiten, die eine textbasierte Einleitung benötigen

---

### ✅ 2. TILES-SEGMENT
**Status:** Vollständig definiert und validiert

#### Beschreibung
Das Tiles-Segment zeigt eine Grid-basierte Anordnung von Kacheln (Tiles), die jeweils ein Icon oder Bild, einen Titel, eine Beschreibung und optional einen CTA-Button enthalten.

#### Visuelle Eigenschaften
- **Hintergrund:** Hellgrau (`bg-gray-50`)
- **Abstände:** `py-20` (Vertical Padding)
- **Container:** Standard Container mit `px-6`

#### Inhaltsstruktur

**1. Segment-Header (Optional)**
- **Titel:** `text-4xl font-bold text-gray-900 mb-4`
- **Beschreibung:** `text-xl text-gray-600`
- **Zentrierung:** `text-center mb-16`
- **Max-Breite Beschreibung:** `max-w-3xl mx-auto`

**2. Grid-Layout**
- **Spalten-Konfigurationen:**
  - 2 Spalten: `grid-cols-1 md:grid-cols-2`
  - 3 Spalten: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
  - 4 Spalten: `grid-cols-1 md:grid-cols-2 lg:grid-cols-4`
- **Gap:** `gap-8`

**3. Einzelne Tile (Card)**
- **Card:**
  - Basis: Weiß (`bg-white`)
  - Border: Keine (`border-none`)
  - Hover: `hover:shadow-xl transition-all duration-300`

- **Card Content:**
  - Padding: `p-8`
  - Layout: Flexbox Column, zentriert

**4. Icon/Bild-Darstellung**

**Wenn Bild vorhanden:**
- **Container:** `w-full aspect-square overflow-hidden`
- **Bild:** 
  - Vollflächig: `w-full h-full object-cover`
  - Hover: `hover:scale-105 transition-transform duration-300`
  - Position: Oben in der Tile, volle Breite, quadratisch

**Wenn Icon verwendet:**
- **Container:**
  - Padding: `p-4`
  - Hintergrund: `bg-[#f9dc24]/10`
  - Border: `border-2 border-[#f9dc24]/20`
  - Form: **Kreisförmig** (`rounded-full`)
  - Hover: `hover:bg-[#f9dc24]/20 hover:border-[#f9dc24]/40`
  - Transition: `transition-all duration-300`
- **Icon:**
  - Größe: `h-8 w-8`
  - Farbe: `text-gray-900`
- **Position:** Zentriert oberhalb des Textes

**5. Text-Content**
- **Container:** `p-8` (nur wenn Bild vorhanden, sonst inline)
- **Titel:** `text-2xl font-bold text-gray-900`
- **Beschreibung:** `text-gray-600 leading-relaxed`
- **Zentrierung:** `text-center`

**6. CTA-Button (Optional)**
- **Anzeige:** Nur wenn `showButton !== false`
- **Container:** `mt-6 flex justify-center`
- **Button-Stile:**
  - **Standard:** `bg-[#f9dc24] text-gray-900 hover:bg-yellow-400`
  - **Technical:** `bg-gray-800 text-white hover:bg-gray-900`
- **Padding:** `px-6 py-3`
- **Border Radius:** `rounded-lg`
- **Font:** `font-semibold`
- **Transition:** `transition-all duration-200`

#### Backend-Konfiguration
```typescript
interface TileItem {
  title: string;              // Tile-Titel (erforderlich)
  description: string;        // Tile-Beschreibung (erforderlich)
  icon?: string;              // Icon-Name aus iconMap (optional)
  imageUrl?: string;          // Bild-URL (optional, alternativ zu Icon)
  metadata?: ImageMetadata;   // Bild-Metadaten (wenn imageUrl vorhanden)
  showButton?: boolean;       // Button anzeigen (default: true)
  ctaText?: string;           // Button-Text (optional)
  ctaLink?: string;           // Button-Link (optional)
  ctaStyle?: 'standard' | 'technical'; // Button-Stil (default: 'standard')
}

interface TilesSegmentData {
  title?: string;             // Segment-Titel (optional)
  description?: string;       // Segment-Beschreibung (optional)
  columns: '2' | '3' | '4';  // Anzahl Spalten (erforderlich)
  items: TileItem[];          // Array von Tiles (erforderlich)
}
```

#### Design-Regeln
1. **Icon vs. Bild:**
   - Icons: Kreisförmiger gelber Hintergrund, zentriert über Text
   - Bilder: Quadratisch, vollflächig, oben in Tile, größer als Icons
   
2. **Button-Logik:**
   - Checkbox "Show Button" im Backend steuert Anzeige
   - Button wird nur gerendert wenn: `showButton !== false && ctaText && ctaLink`
   
3. **Responsive Verhalten:**
   - Mobile: 1 Spalte
   - Tablet: 2 Spalten (unabhängig von Einstellung)
   - Desktop: Gewählte Spaltenanzahl (2/3/4)

#### Verwendung
- Positionierung: Flexibel, typisch nach Intro-Segment
- Zweck: Präsentation von Features, Anwendungen, Services
- Einsatzgebiet: Alle Seiten, die strukturierte Content-Kacheln benötigen

---

### ✅ 3. INDUSTRIES-SEGMENT
**Status:** Vollständig definiert und validiert

#### Beschreibung
Das Industries-Segment zeigt eine Grid-Anordnung von Branchen oder Kategorien mit Icons, Titeln und Beschreibungen. Jedes Item kann optional verlinkt sein.

#### Visuelle Eigenschaften
- **Hintergrund:** Slate-Hellgrau (`bg-slate-50`)
- **Abstände:** `py-20` (Vertical Padding)
- **Container:** Standard Container mit `px-6`

#### Inhaltsstruktur

**1. Segment-Header**
- **Titel (H2):**
  - Schriftgröße: `text-4xl md:text-5xl`
  - Schriftgewicht: Bold (`font-bold`)
  - Farbe: `text-light-foreground`
  - Abstand unten: `mb-6`
  - Tracking: Tight (`tracking-tight`)
  
- **Untertitel (Paragraph):**
  - Schriftgröße: `text-xl`
  - Farbe: `text-light-muted`
  - Schriftgewicht: Light (`font-light`)
  - Max-Breite: `max-w-2xl mx-auto`

- **Header-Container:**
  - Zentrierung: `text-center`
  - Abstand unten: `mb-20`

**2. Grid-Layout**
- **Spalten-Konfigurationen:**
  - 1 Spalte: `grid-cols-1`
  - 2 Spalten: `grid-cols-1 md:grid-cols-2`
  - 3 Spalten: `grid-cols-1 md:grid-cols-3`
  - 4 Spalten: `grid-cols-2 md:grid-cols-4` (Default)
- **Gap:** `gap-8 md:gap-12`
- **Max-Breite:** `max-w-6xl mx-auto`

**3. Industry Item**
- **Container:**
  - Layout: Flexbox Column (`flex flex-col items-center`)
  - Group: `group` (für Hover-Effekte)
  - Animation: Slide-in-up mit gestaffeltem Delay

**4. Icon-Circle**
- **Äußerer Container:**
  - Position: `relative mb-6`
  
- **Circle:**
  - Größe: `w-20 h-20 md:w-24 md:h-24`
  - Hintergrund: `bg-[#f9dc24]/10`
  - Border: `border-2 border-[#f9dc24]/20`
  - Form: **Kreisförmig** (`rounded-full`)
  - Shadow: `shadow-lg hover:shadow-xl`
  - Hover: 
    - `hover:bg-[#f9dc24]/20`
    - `hover:border-[#f9dc24]/40`
    - `hover:-translate-y-1`
    - `hover:scale-105`
  - Transition: `transition-all duration-500 ease-out`
  - Cursor: `cursor-pointer`

- **Icon:**
  - Größe: `size={36}`
  - Farbe: `text-black`
  - Hover: `group-hover:text-gray-900 group-hover:scale-125`
  - Stroke Width: `strokeWidth={1.8}`
  - Transition: `transition-all duration-300`

- **Glow-Effekt:**
  - Position: `absolute inset-0`
  - Größe: Identisch zu Circle
  - Hintergrund: `bg-[#f9dc24]`
  - Form: `rounded-full`
  - Opacity: `opacity-0 group-hover:opacity-15`
  - Blur: `blur-xl`
  - Transition: `transition-opacity duration-500`

**5. Text-Content**
- **Container:**
  - Zentrierung: `text-center`
  - Spacing: `space-y-1`

- **Titel:**
  - Schriftgröße: `text-lg md:text-xl`
  - Schriftgewicht: Bold (`font-bold`)
  - Farbe: `text-gray-900`
  - Hover: `group-hover:text-gray-800`
  - Transition: `transition-colors duration-200`

- **Beschreibung:**
  - Schriftgröße: `text-sm md:text-base`
  - Farbe: `text-gray-600`
  - Schriftgewicht: Light (`font-light`)
  - Line Height: `leading-relaxed`
  - Padding: `px-2`

**6. Link-Wrapper (Optional)**
- Nur wenn `item.link` vorhanden
- Component: `<Link>` (react-router-dom)
- Hover: `hover:scale-105 transition-transform duration-300`

#### Backend-Konfiguration
```typescript
interface IndustryItem {
  icon: IconName;            // Icon-Name aus availableIcons (erforderlich)
  title: string;             // Item-Titel (erforderlich)
  description: string;       // Item-Beschreibung (erforderlich)
  link?: string;             // Optionaler Link (intern oder extern)
}

interface IndustriesSegmentData {
  title?: string;            // Segment-Titel (optional, default: "Trusted Across All Industries")
  subtitle?: string;         // Segment-Untertitel (optional, default: "Professional solutions...")
  columns?: number;          // Anzahl Spalten (optional, default: 4)
  items: IndustryItem[];     // Array von Industry Items (erforderlich)
}

// Verfügbare Icons
type IconName = 
  | "Camera" | "Smartphone" | "Car" | "Tv" | "Shield" | "Cog" 
  | "Stethoscope" | "ScanLine" | "Lightbulb" | "Microscope" 
  | "Factory" | "Cpu" | "Layers" | "Zap" | "TrendingUp" 
  | "Award" | "Globe" | "Target" | "Settings" | "Package";
```

#### Design-Regeln
1. **Icons:**
   - Immer kreisförmig mit gelbem Hintergrund
   - Größe: 20-24 (w-20 h-20 bis w-24 h-24)
   - Glow-Effekt bei Hover
   - Scale-Animation bei Hover

2. **Animation:**
   - Slide-in-up Animation beim Laden
   - Gestaffelter Delay: `index * 100ms`
   - Hover: -translate-y und scale

3. **Responsive Verhalten:**
   - Mobile: 2 Spalten (bei columns=4) oder 1 Spalte
   - Desktop: Gewählte Spaltenanzahl

4. **Leer-Zustand:**
   - Segment wird nicht gerendert wenn `items.length === 0`

#### Verwendung
- Positionierung: Flexibel, typisch nach Tiles-Segment
- Zweck: Darstellung von Branchen, Kategorien, Anwendungsbereichen
- Einsatzgebiet: Übersichtsseiten, die verschiedene Branchen/Bereiche zeigen

---

### ✅ 4. PRODUCT HERO SEGMENT
**Status:** Vollständig definiert und validiert

#### Beschreibung
Das Product Hero Segment ist ein zweispaltiger Hero-Bereich für Produktseiten mit großem Text (Titel und Subtitle), Beschreibung, zwei CTA-Buttons und einem Produktbild. Die Anordnung und Proportionen sind flexibel konfigurierbar.

#### Visuelle Eigenschaften
- **Hintergrund:** Weiß (`bg-white`)
- **Abstände:** 
  - **Top Spacing:** Konfigurierbar (siehe Top Spacing System)
  - **Bottom:** `pb-16`
- **Container:** Standard Container mit `px-6`

#### Top Spacing System
Das Top Spacing wird vom **Boden der Navigation** gemessen (nicht vom Viewport-Top).
- **Berechnung:** Navigation (~80px) + Top-Offset (10px) = 90px Basis
- **Optionen:**
  - **Small:** `pt-[120px]` = 90px Nav + 30px Abstand
  - **Medium:** `pt-[140px]` = 90px Nav + 50px Abstand (Default)
  - **Large:** `pt-[160px]` = 90px Nav + 70px Abstand
  - **Extra Large:** `pt-[180px]` = 90px Nav + 90px Abstand

#### Inhaltsstruktur

**1. Grid-Layout**
- **Basis:** `grid items-center gap-12`
- **Layout Ratio Optionen:**
  - **1:1 (50:50):** `grid-cols-1 lg:grid-cols-2`
  - **2:3 (2/3:1/3):** `grid-cols-1 lg:grid-cols-5 [&>*:first-child]:lg:col-span-2 [&>*:last-child]:lg:col-span-3`
  - **2:5 (2/5:3/5):** `grid-cols-1 lg:grid-cols-5 [&>*:first-child]:lg:col-span-2 [&>*:last-child]:lg:col-span-3` (Default)
- **Image Position:** Links oder Rechts (über `order-` Classes gesteuert)

**2. Text-Content-Bereich**

**Überschrift (H2):**
- **Schriftgröße:** `text-5xl lg:text-6xl xl:text-7xl`
- **Schriftgewicht:** `font-light` (Titel) + `font-medium` (Subtitle im gleichen H2)
- **Line Height:** `leading-[0.9]`
- **Tracking:** `tracking-tight`
- **Farbe:** `text-gray-900`
- **Abstand:** `mb-6`
- **Struktur:** Titel und Subtitle beide innerhalb eines H2-Tags, Subtitle als `<span className="font-medium block">`

**Beschreibung (Paragraph):**
- **Schriftgröße:** `text-2xl lg:text-3xl`
- **Farbe:** `text-gray-700`
- **Schriftgewicht:** `font-light`
- **Line Height:** `leading-relaxed`
- **Abstand:** `mb-8`

**CTA-Buttons (2 Stück):**
- **Container:** `pt-4 flex gap-4`
- **Button-Größen:** `px-8 py-4 text-lg font-medium`
- **Border Radius:** `rounded-lg`
- **Shadow:** `shadow-soft`
- **Transition:** `transition-all duration-300`
- **Drei Stil-Optionen:**
  - **Standard (Yellow):** `bg-[#f9dc24] text-black`
  - **Technical (Dark Gray):** `bg-[#1f2937] text-white`
  - **Outline White:** `bg-white text-black border border-[#e5e5e5]` → Hover: `bg-black text-white border-black`

**3. Bild-Bereich**
- **Bild:**
  - Klasse: `w-full h-auto object-cover shadow-2xl`
  - Alt-Text: Verwendet `metadata.altText` oder Fallback auf Titel
- **Positionierung:** Order-Klassen für responsive Links/Rechts-Wechsel

#### Backend-Konfiguration
```typescript
interface ProductHeroData {
  hero_title: string;                          // Titel (erforderlich)
  hero_subtitle?: string;                      // Subtitle (optional)
  hero_description: string;                    // Beschreibung (erforderlich)
  hero_image_url?: string;                     // Bild-URL (optional)
  hero_image_metadata?: ImageMetadata;         // Bild-Metadaten (optional)
  hero_image_position?: 'left' | 'right';      // Bildposition (default: 'right')
  hero_layout_ratio?: '1-1' | '2-3' | '2-5';  // Layout-Verhältnis (default: '2-5')
  hero_top_spacing?: 'small' | 'medium' | 'large' | 'xlarge'; // Top Spacing (default: 'medium')
  hero_cta_text?: string;                      // CTA 1 Text (optional)
  hero_cta_link?: string;                      // CTA 1 Link (optional)
  hero_cta_style?: 'standard' | 'technical' | 'outline-white'; // CTA 1 Stil (default: 'standard')
  hero_cta2_text?: string;                     // CTA 2 Text (optional)
  hero_cta2_link?: string;                     // CTA 2 Link (optional)
  hero_cta2_style?: 'standard' | 'technical' | 'outline-white'; // CTA 2 Stil (default: 'standard')
}
```

#### Design-Regeln
1. **H2 statt H1:**
   - Titel und Subtitle werden beide als H2 gerendert
   - Subtitle hat `font-medium` zur Unterscheidung vom `font-light` Titel

2. **Top Spacing:**
   - MUSS vom Boden der Navigation gemessen werden
   - Bild darf niemals an Navigation "kleben"
   
3. **Layout Flexibilität:**
   - Drei Ratio-Optionen für unterschiedliche Text-zu-Bild-Verhältnisse
   - Bild kann links oder rechts positioniert werden
   
4. **Button-Hierarchie:**
   - Zwei CTA-Buttons für primäre und sekundäre Aktionen
   - Buttons werden nur gerendert wenn Text UND Link vorhanden

5. **Responsive:**
   - Mobile: Einspaltig, Bild immer oberhalb (order-1)
   - Desktop: Zweispaltig nach gewählter Ratio und Position

#### Verwendung
- Positionierung: Direkt unter Navigation (erster Content-Bereich)
- Zweck: Produkt-Vorstellung mit starker visueller Präsenz
- Einsatzgebiet: Produktseiten, Lösungsseiten mit Produktfokus

---

### ✅ 5. PRODUCT HERO GALLERY SEGMENT
**Status:** Vollständig definiert und validiert

#### Beschreibung
Erweiterte Version des Product Hero mit Galerie-Funktionalität. Unterstützt mehrere Produktbilder mit Thumbnail-Navigation, Modal-Ansicht und vollständiger Layout-Kontrolle wie Product Hero.

#### Visuelle Eigenschaften
Identisch zu Product Hero Segment, mit folgenden Erweiterungen:

#### Galerie-Funktionalität

**1. Hauptbild-Bereich**
- **Container:** `relative rounded-lg shadow-soft group cursor-pointer`
- **Bild:** 
  - Größe: `w-full h-[500px] lg:h-[600px]`
  - Object-Fit: `object-contain`
  - Hintergrund: `bg-white`
  - Transition: `transition-all duration-300`

**Hintergrund-Effekte:**
- **Animated Glow:** `absolute inset-0 bg-gradient-to-br from-soft-blue/20 via-transparent to-accent-soft-blue/20 animate-pulse`
- **Subtle Overlay:** `absolute inset-0 bg-gradient-to-t from-black/5 to-transparent`
- **Light Beam Animation:** Beweglicher Lichtstrahl-Effekt mit `animate-[slide-in-right_3s_ease-in-out_infinite]`

**Expand-Icon Overlay:**
- **Anzeige:** Bei Hover sichtbar
- **Container:** `absolute inset-0 bg-black/0 group-hover:bg-black/10`
- **Icon:** `Expand` (lucide-react) in weißem Kreis mit `bg-white/90 rounded-full p-3 shadow-lg`
- **Transition:** Opacity fade-in bei Hover

**2. Thumbnail-Navigation**
- **Container:** `flex justify-center gap-3 mt-4`
- **Thumbnail:**
  - Größe: `w-16 lg:w-20 aspect-[4/3]`
  - Border: `border-2`
    - Aktiv: `border-accent-soft-blue shadow-md`
    - Inaktiv: `border-gray-200 hover:border-gray-300`
  - Border Radius: `rounded-lg`
  - Bild: `w-full h-full object-contain bg-white`
  - Transition: `transition-all duration-300`

**3. Bild-Beschreibung**
- **Container:** `text-center mt-4`
- **Titel:** `font-medium text-light-foreground text-sm lg:text-base mb-1`
- **Beschreibung:** `text-xs lg:text-sm text-scandi-grey`
- **Anzeige:** Nur wenn Titel oder Beschreibung für aktuelles Bild vorhanden

**4. Modal-Ansicht (Lightbox)**
- **Dialog:** Verwendet `Dialog` und `DialogContent` von shadcn/ui
- **Content:** `max-w-5xl max-h-[80vh] p-4 bg-white`
- **Bild:** `w-full h-full max-h-[75vh] object-contain`
- **Navigation Arrows:**
  - Position: `left-4` / `right-4`, `top-1/2 -translate-y-1/2`
  - Style: `bg-white/90 hover:bg-white p-3 rounded-full shadow-lg`
  - Icons: `ChevronLeft` / `ChevronRight` (w-6 h-6)
  - Nur sichtbar wenn mehrere Bilder vorhanden

**Hintergrund-Animationen (Page-Level):**
- **Gradient Orbs:** Zwei animierte Blur-Gradienten im Hintergrund
  - Orb 1: `top-1/4 left-1/4 w-96 h-96 blur-3xl animate-pulse`
  - Orb 2: `top-1/3 right-1/4 w-64 h-64 blur-2xl animate-pulse` mit 1s Delay

#### Backend-Konfiguration
```typescript
interface ProductImage {
  imageUrl: string;             // Bild-URL (erforderlich)
  title: string;                // Bild-Titel (erforderlich)
  description: string;          // Bild-Beschreibung (erforderlich)
  metadata?: ImageMetadata;     // Bild-Metadaten (optional)
}

interface ProductHeroGalleryData {
  title: string;                           // Haupttitel (erforderlich)
  subtitle: string;                        // Subtitle (erforderlich)
  description: string;                     // Beschreibung (erforderlich)
  imagePosition: 'left' | 'right';         // Bildposition (default: 'right')
  layoutRatio: '1-1' | '2-3' | '2-5';     // Layout-Verhältnis (default: '2-5')
  topSpacing: 'small' | 'medium' | 'large' | 'extra-large'; // Top Spacing (default: 'medium')
  cta1Text: string;                        // CTA 1 Text (optional)
  cta1Link: string;                        // CTA 1 Link (optional)
  cta1Style: 'standard' | 'technical' | 'outline-white'; // CTA 1 Stil (default: 'standard')
  cta2Text: string;                        // CTA 2 Text (optional)
  cta2Link: string;                        // CTA 2 Link (optional)
  cta2Style: 'standard' | 'technical' | 'outline-white'; // CTA 2 Stil (default: 'standard')
  images: ProductImage[];                  // Array von Produktbildern (erforderlich)
}
```

#### Design-Regeln
1. **Galerie-Mindestanzahl:**
   - Thumbnail-Navigation wird nur bei `images.length > 1` angezeigt
   - Modal-Arrows nur bei mehreren Bildern
   
2. **Bild-Wechsel:**
   - Click auf Thumbnail wechselt Hauptbild
   - Click auf Hauptbild öffnet Modal
   - Arrows im Modal navigieren zwischen Bildern
   
3. **Animation-Details:**
   - Hintergrund-Orbs: Pulse-Animation gestaffelt
   - Light Beam: Kontinuierliche Slide-Animation (3s Loop)
   - Thumbnails: Smooth Transition bei Border-Änderung
   
4. **Alle Product Hero Regeln gelten:**
   - Top Spacing vom Navigation-Boden
   - H2-Tags für Überschriften (Subtitle mit font-medium)
   - Gleiche Layout-Ratio-Optionen
   - Gleiche Button-Stile und -Logik

#### Technische Besonderheiten
- **State Management:** `currentImageIndex` für aktuelle Bildauswahl, `isModalOpen` für Lightbox
- **Keyboard Navigation:** Modal unterstützt Pfeiltasten (über Button-Handlers)
- **Accessibility:** 
  - Alt-Texte für alle Bilder erforderlich
  - ARIA-Labels für Navigation-Buttons
  - Expand-Icon mit visueller Hover-Indikation

#### Verwendung
- Positionierung: Direkt unter Navigation (erster Content-Bereich)
- Zweck: Produkt-Vorstellung mit mehreren Ansichten/Varianten
- Einsatzgebiet: Produktseiten mit mehreren Produktbildern, Varianten oder Perspektiven
- Referenzseite: `/products/test-charts/le7`

---

## Gemeinsame Design-Prinzipien

### Farbschema
- **Primärfarbe (Gelb):** `#f9dc24`
- **Akzent-Varianten:**
  - Sehr Hell: `bg-[#f9dc24]/10` (10% Opacity)
  - Hell: `bg-[#f9dc24]/20` (20% Opacity)
  - Border Hell: `border-[#f9dc24]/20`
  - Border Hover: `border-[#f9dc24]/40`
- **Text-Farben:**
  - Haupttext: `text-gray-900`
  - Sekundärtext: `text-gray-600`
  - Muted: `text-light-muted`
- **Hintergründe:**
  - Weiß: `bg-white`
  - Hellgrau: `bg-gray-50`
  - Slate: `bg-slate-50`

### Icon-Darstellung
**Kreisförmige Icons (Standard):**
- Form: `rounded-full`
- Hintergrund: Gelb mit 10% Opacity
- Border: 2px gelb mit 20% Opacity
- Hover: Intensivere Farben + Scale + Translation
- Einsatz: Industries-Segment, Tiles-Segment (wenn kein Bild)

**Quadratische Bilder (Tiles):**
- Form: `rounded-lg` oder keine Rundung
- Vollflächig: `w-full aspect-square`
- Hover: Scale-Effekt
- Einsatz: Tiles-Segment (alternativ zu Icons)

### Spacing-System
- **Segment Vertical Padding:** `py-20` (Standard)
- **Intro Segment:** `pt-14 pb-12` (Ausnahme)
- **Container Horizontal:** `px-6`
- **Header Margin Bottom:** `mb-16` bis `mb-20`
- **Element-Abstände:** Konsistent mit `gap-8` oder `space-y-*`

### Typografie
- **H1 (Intro):** `text-4xl md:text-5xl font-bold`
- **H2 (Segment-Titel):** `text-4xl md:text-5xl font-bold` oder `text-4xl font-bold`
- **H3 (Item-Titel):** `text-2xl font-bold` (Tiles) oder `text-lg md:text-xl font-bold` (Industries)
- **Body Text:** `text-xl` (Intro/Header) oder `text-base` (Items)
- **Font Weight:**
  - Titel: `font-bold`
  - Beschreibungen: `font-light` oder normal
  - Buttons: `font-semibold`

### Transitions & Animations
- **Standard Duration:** `duration-300`
- **Langsam:** `duration-500`
- **Button/Quick:** `duration-200`
- **Easing:** `ease-out` oder Tailwind default
- **Hover Effects:**
  - Transform: `hover:scale-105` oder `hover:-translate-y-1`
  - Shadow: `hover:shadow-xl`
  - Colors: Dunklere/Hellere Varianten

### Button-Stile (CTA)
**Standard (Gelb):**
```
bg-[#f9dc24] text-gray-900 hover:bg-yellow-400
```

**Technical (Dunkelgrau):**
```
bg-gray-800 text-white hover:bg-gray-900
```

**Gemeinsam:**
- Padding: `px-6 py-3`
- Border Radius: `rounded-lg`
- Font Weight: `font-semibold`
- Transition: `transition-all duration-200`

---

## Implementierungs-Checkliste für neue Segmente

Bei der Erstellung neuer Segmente müssen folgende Punkte sichergestellt werden:

### ✅ Frontend-Komponente
- [ ] Eigenständige React-Komponente in `src/components/segments/`
- [ ] TypeScript Interface für Props definiert
- [ ] Standard-Werte für alle optionalen Props
- [ ] Responsive Design (Mobile-first)
- [ ] Accessibility (ARIA labels, semantisches HTML)

### ✅ Backend-Integration
- [ ] Editor-Komponente in `src/components/admin/` (falls dynamisch)
- [ ] Datenstruktur in `page_segments` Array
- [ ] Handler in `DynamicCMSPage.tsx` `renderSegment()` Switch
- [ ] Segment-Typ in `segment_registry` mit eindeutiger ID

### ✅ Design-Konsistenz
- [ ] Verwendung des definierten Farbschemas
- [ ] Konsistente Spacing-Werte
- [ ] Typografie entspricht Design-System
- [ ] Icons verwenden lucide-react
- [ ] Transitions/Animations wie definiert

### ✅ Datenbank-Struktur
- [ ] Segment-Registry Eintrag mit `segment_id`
- [ ] `page_content` mit korrektem `segment.type`
- [ ] `tab_order` berücksichtigt neues Segment
- [ ] Migration (falls Schema-Änderungen)

### ✅ Dokumentation
- [ ] Eintrag in diesem Segment-Protokoll
- [ ] Backend-Konfiguration dokumentiert
- [ ] Visuelle Eigenschaften beschrieben
- [ ] Verwendungsbeispiele

---

## Validierungsstatus Page ID 11

**Datum:** 2025-11-22  
**Status:** Segmente angelegt und getestet, 3 kritische Issues identifiziert

### ✅ Vollständig funktionierende Segmente

1. **Intro-Segment** - Form, Design und Funktion vollständig OK
2. **Tiles-Segment** - Form, Design und Funktion vollständig OK
3. **Industry-Segment** - Form, Design und Funktion vollständig OK
4. **Specification-Segment** - Form, Design und Funktion vollständig OK
5. **Product Hero Gallery** - Form, Design und Funktion vollständig OK
6. **Image & Text-Segment** - Form, Design und Funktion vollständig OK
7. **Benefits-Segment** - Form, Design und Funktion vollständig OK
8. **Table-Segment** - Form, Design und Funktion vollständig OK
9. **Video-Segment** - Form, Design und Funktion vollständig OK
10. **Footer** - Form, Design und Funktion vollständig OK

### ⚠️ Segmente mit Einschränkungen

#### 1. Meta Navigation
- **Form und Design:** ✅ Sehr gut
- **Funktion:** ⚠️ Eingeschränkt
- **Issue:** Anker-Links funktionieren nur teilweise (manche ja, manche nein)
- **Priorität:** Hoch - Kernfunktionalität beeinträchtigt

#### 2. Product Hero (Zero)
- **Form und Design:** ✅ Soweit okay
- **Funktion:** ⚠️ Eingeschränkt
- **Issue:** Top Spacing passt nicht (Bild klebt zu nah an Navigation)
- **Priorität:** Mittel - Visuelles Problem

#### 3. Latest News
- **Form und Design:** ✅ Sieht gut aus
- **Funktion:** ⚠️ Eingeschränkt
- **Issue:** Backend-Einstellungen unzureichend - Kategorien und Anzahl-Konfiguration reicht nicht aus
- **Priorität:** Mittel - Funktionalität muss erweitert werden

### Zusammenfassung

**Gesamt:** 13 Segmente getestet  
**Vollständig OK:** 10 Segmente (77%)  
**Mit Einschränkungen:** 3 Segmente (23%)  
**Kritisch:** 0 Segmente (0%)

### Nächste Schritte

1. **Meta Navigation Anker-Links:** Debugging erforderlich, um herauszufinden, warum nur manche Links funktionieren
2. **Product Hero Top Spacing:** Adaptive Spacing-Logik für Meta Navigation-Kontext implementieren
3. **Latest News Backend:** Kategorie-Filter und Anzahl-Einstellungen erweitern

---

## Änderungshistorie

| Datum | Version | Änderung |
|-------|---------|----------|
| 2025-11-22 | 1.0 | Initial: Intro, Tiles, Industries definiert und validiert |
| 2025-11-22 | 1.1 | Product Hero und Product Hero Gallery definiert und validiert |
| 2025-11-22 | 1.2 | Validierungsstatus Page ID 11 dokumentiert: 13 Segmente getestet, 10 vollständig OK, 3 mit Einschränkungen |

---

## Nächste Schritte

Folgende Segmente müssen noch dokumentiert und validiert werden:
- Meta Navigation
- Banner-Segment
- Image & Text / Solutions
- Feature Overview
- Table
- FAQ
- Specification
- Video
- News
- Full Hero
- Footer

Diese werden schrittweise in zukünftigen Versionen dieses Protokolls ergänzt.
