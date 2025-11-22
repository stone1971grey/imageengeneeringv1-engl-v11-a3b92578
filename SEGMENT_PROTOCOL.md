# Segment-Protokoll
## Basis für alle CMS-Segment-Definitionen

Dieses Dokument definiert alle Segment-Typen im CMS-System, deren Erscheinungsbild, Funktionalität und technische Implementierung. Es dient als verbindliche Referenz für die Entwicklung und Wartung aller Segmente.

---

## Status: Definierte und validierte Segmente

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

## Änderungshistorie

| Datum | Version | Änderung |
|-------|---------|----------|
| 2025-11-22 | 1.0 | Initial: Intro, Tiles, Industries definiert und validiert |

---

## Nächste Schritte

Folgende Segmente müssen noch dokumentiert und validiert werden:
- Hero-Segment (Product Hero)
- Product Hero Gallery
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
