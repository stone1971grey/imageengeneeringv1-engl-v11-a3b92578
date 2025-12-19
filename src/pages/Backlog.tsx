import Navigation from "@/components/Navigation";
import EngineersSlider from "@/components/EngineersSlider";
import Footer from "@/components/Footer";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Link, useSearchParams } from "react-router-dom";
import { ExternalLink, Printer, FileText } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

const Backlog = () => {
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get('tab') === 'protocol' ? 'protocol' : 'pages';
  const backlogItems = [
    {
      id: "in-cabin",
      title: "In-Cabin Testing (Automotive)",
      originalUrl: "/en/your-solution/automotive/in-cabin-testing",
      backlogUrl: "/en/backlog/in-cabin-testing",
      snapshot: `
## Hero Section
- **Titel:** In-Cabin Performance Testing
- **Beschreibung:** Advanced testing solutions for in-cabin monitoring systems, ensuring optimal performance and safety in automotive environments.
- **CTA:** Find Your Solution
- **Badge:** DMS/OMS - EU GSR Ready

## In-Cabin Overview
An in-depth look at the emergence of in-cabin systems in the automotive industry.

As the automotive industry continues its path toward full automation, one area of focus has become the in-cabin monitoring systems, often referred to as driver and occupant monitoring systems (DMS/OMS). These systems use cameras and sensors to enhance the safety and comfort of drivers and passengers.

European Union's General Safety Regulation (GSR) mandates all new cars from 2024 must implement DMS systems.

**What do In-Cabin systems monitor?**
- Driver facial expressions to assess distraction or unsafe emotional states
- Driver eye openness for drowsiness detection
- Driver gaze, e.g., looking down at a phone
- Driver's hand positions on the steering wheel
- Occupant presence and seatbelt usage
- Detection of children and proper child safety
- Size and posture of occupants to optimize airbag deployment

## In-Cabin KPIs
1. **Resolution (SFR)** - ISO 12233
2. **Distortion** - ISO 17850, GEOCAL device
3. **Dynamic Range (OECF)** - ISO 14524
4. **Noise (SNR)** - ISO 15739
5. **Color Accuracy** - sRGB calibration
6. **Timing Accuracy** - Frame rate, shutter speed, autofocus

## Products
- iQ-Flatlight (LE7) - Uniform light source
- iQ-LED Panel (800x600) - LED light source
- TE292 VIS-IR - Transmission chart
- iQ-Analyzer-X - Software for image quality analysis
      `,
    },
    {
      id: "automotive",
      title: "Automotive Overview",
      originalUrl: "/en/your-solution/automotive",
      backlogUrl: "/en/backlog/automotive",
      snapshot: `
## Hero Section
- **Titel:** Automotive Image Quality
- **Beschreibung:** Precision-engineered camera system test solutions for robust vehicle safety, performance and autonomy.
- **CTA:** Discover Automotive Solutions

## Main Applications (4 Karten)
1. **In-Cabin Performance Testing** - DMS/OMS use NIR sensors with active illumination
2. **ADAS Performance Testing** - Advanced Driver Assistance Systems
3. **Geometric Camera Calibration** - Essential for ADAS to detect and map 3D objects
4. **Climate-Controlled Testing** - Weather scenarios for performance thresholds

## Standards
IEEE P2020, ISO Standards, EMVA 1288

## Automotive Camera Test Solutions
1. **In-Cabin Testing** - NIR sensors, LE7 VIS-IR (380-1050 nm)
2. **ADAS Performance Testing** - IEEE-P2020, KPIs: CTA, CSNR, dynamic range
3. **Geometric Calibration** - GEOCAL device
4. **Climate Control Testing** - -40°C to +85°C, iQ-Climate Chamber

## Products (6 items)
1. Arcturus - High-intensity light source
2. LE7 VIS-IR - Uniform light source for NIR
3. GEOCAL - Geometric calibrations
4. iQ-Climate Chamber - Temperature-controlled testing
5. TE292 VIS-IR - Spectral sensitivity measurements
6. iQ-Analyzer-X - Image quality evaluation software
      `,
    },
    {
      id: "le7",
      title: "LE7 – Test Chart Product Page",
      originalUrl: "/en/products/test-charts/le7",
      backlogUrl: "/en/products/test-charts/le7",
      snapshot: `
## CMS-Seite (Page ID 17)

### Segmente:
- Product Hero Gallery (286)
- Meta Navigation (287)
- Image-Text (288)
- Banner (289)
- Feature Overview (290) - Key Benefits
- Image-Text (291)
- Table (292) - Technical Specifications
- FAQ (293)
- Tiles (294) - Related Products
- Footer (285)

*Vollständige CMS-Inhalte im Admin Dashboard verfügbar*
      `,
    },
    {
      id: "arcturus",
      title: "Arcturus LED – Illumination Device",
      originalUrl: "/en/products/illumination-devices/arcturus-led",
      backlogUrl: "/en/products/illumination-devices/arcturus-led",
      snapshot: `
## Hero
- **Titel:** ARCTURUS LED
- **Beschreibung:** Today's image sensors and High Dynamic Range configurations make testing at or near sensor saturation challenging. With Arcturus, we can generate more than enough intensity to challenge these sensors with much higher sensitivity than currently possible.

## Key Benefits (6 Items)
1. **Maximum Illuminance** - Up to 1 Mcd/m²
2. **Flicker-Free** - DC-powered LED technology
3. **High Stability** - Reproducible test conditions
4. **True HDR Scenes** - With Vega devices
5. **Wide Dynamic Range** - Constant spectral properties
6. **Flexible Control** - UI, API, Python (Windows/Linux)

## Video
- Arcturus in Action
- URL: https://www.youtube.com/watch?v=DIqRMU7gGNw

## Use Case: Simulate Bright Sunlight
Automotive camera systems must be tested following IEEE-P2020 standard. Arcturus can simulate bright sunlight illumination with very high stability.

## Specifications
- High-stable light source with large field of view based on iQ-LED technology
- 36 temperature-controlled LEDs based on DC technology

## Software
- Arcturus Software (same as Vega, controls up to 7 devices)
- VLS Evaluation Software (IEEE-P2020, CTA, MMP/Flicker, CSNR)

## Typical Applications
1. Automotive Testing (IEEE-P2020)
2. High-End Sensors (HDR configurations)
3. HDR Scene Creation
      `,
    },
    {
      id: "events",
      title: "Events & Training",
      originalUrl: "/en/events",
      backlogUrl: "/en/events",
      snapshot: `
## Statische React-Seite (src/pages/Events.tsx)

## Hero Section (ActionHero)
- **Titel:** Events & Training
- **Beschreibung:** Our current training courses, workshops and events worldwide.
- **Hintergrundbild:** events-hero.jpg

## Event-Übersicht
- **Heading:** Upcoming Events & Training
- **Beschreibung:** Join our expert-led workshops, training sessions, and industry events to expand your knowledge in camera testing, image quality measurement, and industry standards.

## Event Grid (3-spaltig auf Desktop)
Events werden nach Datum sortiert (aufsteigend) angezeigt.

### Event-Karte Struktur:
- Event-Bild (aspect-video)
- Kategorie-Badge (gelb): Schulung | Workshop | Messe
- Event-Titel
- Datum (Calendar Icon)
- Uhrzeit (Clock Icon)
- Ort (MapPin Icon)
- Kurzbeschreibung
- Karten-Platzhalter für Standort
- "Register Now" Button (öffnet Registrierungsformular)

## Sample Events (9 Events):
1. **Advanced Camera Testing Workshop** - 15.03.2026, Köln, DE (Workshop, DE)
2. **ADAS Vision Testing Seminar** - 08.04.2026, Tokyo, JP (Schulung, EN)
3. **Mobile Camera Quality Conference** - 20.05.2026, San Francisco, USA (Messe, EN)
4. **HDR Testing Masterclass** - 12.06.2026, München, DE (Workshop, DE)
5. **Automotive Vision Standards Workshop** - 15.07.2026, Shanghai, CN (Schulung, EN)
6. **Image Quality Expo 2026** - 25.09.2026, London, UK (Messe, EN)
7. **Medical Imaging Quality Seminar** - 15.12.2025, Berlin, DE (Schulung, DE)
8. **Automotive Testing Conference 2026** - 18.02.2026, Detroit, USA (Messe, EN)
9. **ADAS Innovations Live Stream** - 28.11.2025, Online Webinar (Schulung, EN)

## Registrierungsformular (erscheint bei Klick auf "Register Now")
Formular öffnet sich inline unter der angeklickten Event-Karte mit Animation.

### Formularfelder:
- First Name * (required, min 2 chars)
- Last Name * (required, min 2 chars)
- Company * (required, min 2 chars)
- Position * (required, min 2 chars)
- E-Mail * (required, valid email)
- Consent Checkbox * (required): "I agree to receive information about image quality testing and related topics via email."
- Submit Button: "Complete Registration"

### Formular-Features:
- Zod-Validierung mit react-hook-form
- Graue Inputs (bg-[#606060]) mit weißem Text
- Gelbe Checkbox und Alert-Icon
- Close-Button (X) zum Schließen
- Event-Details werden im Formular angezeigt (Titel, Datum, Zeit, Ort)
- fullDescription HTML wird gerendert (falls vorhanden)

## API Integration
- Edge Function: register-event (Supabase)
- Speichert in: event_registrations Tabelle
- Mautic-Integration via storeMauticEmail()
- Already-registered Check (HTTP 409)

## Routing nach Registrierung:
- Neuer Kontakt → /event-registration-success
- Bestehender Kontakt → /event-detail-registration-confirmation  
- Bereits registriert → /event-already-registered

## Zugehörige Dateien:
- src/pages/Events.tsx (Hauptseite)
- src/pages/EventRegistrationSuccess.tsx
- src/pages/EventDetailRegistrationConfirmation.tsx
- src/pages/EventAlreadyRegistered.tsx
- supabase/functions/register-event/index.ts (Edge Function)

## Event Interface:
\`\`\`typescript
interface Event {
  id: string;
  slug: string;
  title: string;
  date: string;
  time: string;
  location: { city: string; country: string; coordinates: [number, number] };
  category: "Schulung" | "Workshop" | "Messe";
  language: "EN" | "DE";
  description: string;
  fullDescription?: string;
  image: string;
  imageUrl?: string;
  isPast: boolean;
  registrationUrl?: string;
}
\`\`\`

## Assets:
- src/assets/events-hero.jpg
- src/assets/event-camera-workshop.jpg
- src/assets/event-automotive-conference.jpg
- src/assets/event-tech-expo.jpg
- src/assets/event-hdr-masterclass.jpg
- src/assets/event-medical-seminar.jpg
- src/assets/event-automotive-standards.jpg
- src/assets/event-adas-streaming.jpg
      `,
    },
  ];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <div aria-hidden="true" className="block h-[150px]" />
      <div className="pb-8">
        <div className="container mx-auto px-6">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-black mb-4">Backlog</h1>
            <p className="text-lg text-gray-600 mb-2">
              Snapshots of pages currently in focus for design and implementation work.
            </p>
          </div>
        </div>
      </div>

      <section className="py-6 bg-white">
        <div className="container mx-auto px-6">
          <Tabs defaultValue={defaultTab} className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
              <TabsTrigger value="pages" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Page Snapshots
              </TabsTrigger>
              <TabsTrigger value="protocol" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                CMS Protokoll
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pages">
              <p className="text-sm text-gray-500 text-center mb-6">
                Click on each item to view the content snapshot.
              </p>
              <Accordion type="single" collapsible className="space-y-4">
                {backlogItems.map((item) => (
                  <AccordionItem
                    key={item.id}
                    value={item.id}
                    className="border border-gray-300 rounded-lg px-4 bg-white"
                  >
                    <AccordionTrigger className="hover:no-underline py-4">
                      <div className="text-left flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-black">{item.title}</p>
                          <Link 
                            to={item.backlogUrl} 
                            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium text-sm mr-4"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <ExternalLink className="w-4 h-4" />
                            View Page
                          </Link>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          Original: {item.originalUrl}
                        </p>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-6">
                      <div className="bg-gray-50 rounded-lg p-6">
                        <pre className="whitespace-pre-wrap font-sans text-sm text-black leading-relaxed">
                          {item.snapshot.trim()}
                        </pre>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </TabsContent>

            <TabsContent value="protocol">
              <div className="flex justify-end mb-6 print:hidden">
                <Button onClick={handlePrint} variant="outline" className="flex items-center gap-2">
                  <Printer className="w-4 h-4" />
                  Als PDF drucken
                </Button>
              </div>
              
              <div className="bg-white border border-gray-200 rounded-lg p-8 print:border-0 print:p-0">
                <article className="prose prose-lg max-w-none print:prose-sm">
                  <h1 className="text-3xl font-bold text-black mb-2">CMS Development Backlog & Optimierungsprotokoll</h1>
                  <p className="text-gray-600 mb-6">
                    <strong>Erstellt:</strong> 2025-12-19 | <strong>Status:</strong> Analyse abgeschlossen | <strong>Projekt:</strong> Image Engineering CMS
                  </p>
                  
                  <hr className="my-8" />

                  <h2 className="text-2xl font-bold text-black mt-8 mb-4">Übersicht</h2>
                  <p className="text-gray-700">
                    Dieses Dokument dokumentiert die technische Analyse des CMS-Systems und identifiziert Optimierungspotenziale für zukünftige Entwicklung.
                  </p>

                  <hr className="my-8" />

                  <h2 className="text-2xl font-bold text-black mt-8 mb-4">1. AdminDashboard.tsx - Monolithische Struktur</h2>
                  
                  <h3 className="text-xl font-semibold text-black mt-6 mb-3">Problem</h3>
                  <p className="text-gray-700">
                    Die Datei <code className="bg-gray-100 px-1 rounded">AdminDashboard.tsx</code> enthält ~5000+ Zeilen Code mit:
                  </p>
                  <ul className="list-disc pl-6 text-gray-700 space-y-1">
                    <li>Sämtliche Editor-Logik</li>
                    <li>State-Management für alle Segment-Typen</li>
                    <li>UI-Rendering für Admin-Oberfläche</li>
                    <li>Authentifizierung und Autorisierung</li>
                  </ul>

                  <h3 className="text-xl font-semibold text-black mt-6 mb-3">Aufwandsschätzung</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full border border-gray-300 text-sm">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="border border-gray-300 px-4 py-2 text-left text-black">Schritt</th>
                          <th className="border border-gray-300 px-4 py-2 text-left text-black">Aufwand</th>
                          <th className="border border-gray-300 px-4 py-2 text-left text-black">Risiko</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr><td className="border border-gray-300 px-4 py-2 text-black">Editors extrahieren</td><td className="border border-gray-300 px-4 py-2 text-black">Medium</td><td className="border border-gray-300 px-4 py-2 text-black">Niedrig</td></tr>
                        <tr><td className="border border-gray-300 px-4 py-2 text-black">Shared Hooks erstellen</td><td className="border border-gray-300 px-4 py-2 text-black">Medium</td><td className="border border-gray-300 px-4 py-2 text-black">Niedrig</td></tr>
                        <tr><td className="border border-gray-300 px-4 py-2 text-black">State-Management entkoppeln</td><td className="border border-gray-300 px-4 py-2 text-black">Hoch</td><td className="border border-gray-300 px-4 py-2 text-black">Mittel</td></tr>
                        <tr><td className="border border-gray-300 px-4 py-2 text-black">AdminDashboard auf Router reduzieren</td><td className="border border-gray-300 px-4 py-2 text-black">Hoch</td><td className="border border-gray-300 px-4 py-2 text-black">Hoch</td></tr>
                        <tr className="font-semibold"><td className="border border-gray-300 px-4 py-2 text-black">Gesamt</td><td className="border border-gray-300 px-4 py-2 text-black" colSpan={2}>15-25 Iterationen</td></tr>
                      </tbody>
                    </table>
                  </div>

                  <hr className="my-8" />

                  <h2 className="text-2xl font-bold text-black mt-8 mb-4">2. Hardcodierte Segment-Typen</h2>
                  
                  <h3 className="text-xl font-semibold text-black mt-6 mb-3">Problem</h3>
                  <p className="text-gray-700">
                    Neue Segment-Typen erfordern Änderungen in mehreren Dateien:
                  </p>
                  <ul className="list-disc pl-6 text-gray-700 space-y-1">
                    <li><code className="bg-gray-100 px-1 rounded">AdminDashboard.tsx</code> - Switch-Case für Editor</li>
                    <li><code className="bg-gray-100 px-1 rounded">DynamicCMSPage.tsx</code> - Switch-Case für Renderer</li>
                    <li><code className="bg-gray-100 px-1 rounded">CreateCMSPageDialog.tsx</code> - Dropdown-Optionen</li>
                  </ul>

                  <h3 className="text-xl font-semibold text-black mt-6 mb-3">Lösungsvorschlag: Plugin-Registry</h3>
                  <p className="text-gray-700">Vorteile:</p>
                  <ul className="list-disc pl-6 text-gray-700 space-y-1">
                    <li>Neue Segmente: 1 Datei erstellen + Registry-Eintrag</li>
                    <li>Zentrale Konfiguration</li>
                    <li>Einfachere Tests</li>
                    <li>Potenzial für DB-basierte Plugin-Definition</li>
                  </ul>
                  <p className="text-gray-700 mt-4"><strong>Geschätzter Aufwand:</strong> 8-12 Iterationen</p>

                  <hr className="my-8" />

                  <h2 className="text-2xl font-bold text-black mt-8 mb-4">3. Priorisierte Roadmap</h2>
                  
                  <h3 className="text-xl font-semibold text-black mt-6 mb-3">Phase 1: Quick Wins</h3>
                  <ul className="list-disc pl-6 text-gray-700 space-y-1">
                    <li>Plugin-Registry für Segment-Typen erstellen</li>
                    <li><code className="bg-gray-100 px-1 rounded">useAdminAuth</code> Hook extrahieren</li>
                    <li>Dokumentation des CMS-Kerns</li>
                  </ul>

                  <h3 className="text-xl font-semibold text-black mt-6 mb-3">Phase 2: Modularisierung</h3>
                  <ul className="list-disc pl-6 text-gray-700 space-y-1">
                    <li>Weitere Hooks extrahieren</li>
                    <li>AdminDashboard State aufteilen</li>
                    <li>Editor-Komponenten standardisieren</li>
                  </ul>

                  <h3 className="text-xl font-semibold text-black mt-6 mb-3">Phase 3: Architektur</h3>
                  <ul className="list-disc pl-6 text-gray-700 space-y-1">
                    <li>AdminDashboard als reiner Router</li>
                    <li>Vollständige Plugin-Architektur</li>
                    <li>CMS-Template für neue Projekte</li>
                  </ul>

                  <hr className="my-8" />

                  <h2 className="text-2xl font-bold text-black mt-8 mb-4">4. Business-Analyse: Modulares CMS als Plattform</h2>

                  <h3 className="text-xl font-semibold text-black mt-6 mb-3">Business-Vorteile für Lovable-Projekte</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full border border-gray-300 text-sm">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="border border-gray-300 px-4 py-2 text-left text-black">Vorteil</th>
                          <th className="border border-gray-300 px-4 py-2 text-left text-black">Kernaussage</th>
                          <th className="border border-gray-300 px-4 py-2 text-left text-black">Wertbeitrag</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr><td className="border border-gray-300 px-4 py-2 text-black">80% schnellere Lieferung</td><td className="border border-gray-300 px-4 py-2 text-black">CMS kopieren statt bauen</td><td className="border border-gray-300 px-4 py-2 text-black">Zeit = Geld</td></tr>
                        <tr><td className="border border-gray-300 px-4 py-2 text-black">Konsistente Qualität</td><td className="border border-gray-300 px-4 py-2 text-black">Ein Bug-Fix für alle</td><td className="border border-gray-300 px-4 py-2 text-black">Weniger Risiko</td></tr>
                        <tr><td className="border border-gray-300 px-4 py-2 text-black">Niedrige Wartung</td><td className="border border-gray-300 px-4 py-2 text-black">Zentrale Pflege</td><td className="border border-gray-300 px-4 py-2 text-black">50% Kostenreduktion</td></tr>
                      </tbody>
                    </table>
                  </div>

                  <h3 className="text-xl font-semibold text-black mt-6 mb-3">Business-Vorteile für Endkunden</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full border border-gray-300 text-sm">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="border border-gray-300 px-4 py-2 text-left text-black">Vorteil</th>
                          <th className="border border-gray-300 px-4 py-2 text-left text-black">Kernaussage</th>
                          <th className="border border-gray-300 px-4 py-2 text-left text-black">Wertbeitrag</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr><td className="border border-gray-300 px-4 py-2 text-black">Self-Service</td><td className="border border-gray-300 px-4 py-2 text-black">Kunden helfen sich selbst</td><td className="border border-gray-300 px-4 py-2 text-black">0€ Content-Kosten</td></tr>
                        <tr><td className="border border-gray-300 px-4 py-2 text-black">No-Code-Anpassung</td><td className="border border-gray-300 px-4 py-2 text-black">Config statt Code</td><td className="border border-gray-300 px-4 py-2 text-black">Agilität</td></tr>
                        <tr><td className="border border-gray-300 px-4 py-2 text-black">Enterprise-ready</td><td className="border border-gray-300 px-4 py-2 text-black">Compliance-Features</td><td className="border border-gray-300 px-4 py-2 text-black">Größere Deals</td></tr>
                      </tbody>
                    </table>
                  </div>

                  <hr className="my-8" />

                  <h2 className="text-2xl font-bold text-black mt-8 mb-4">5. Projekt-Gesamtbewertung</h2>

                  <h3 className="text-xl font-semibold text-black mt-6 mb-3">Executive Summary</h3>
                  <p className="text-gray-700">
                    Das Image Engineering CMS ist ein <strong>solides, produktionsreifes System</strong> mit hohem Potenzial als wiederverwendbares Template für B2B-Websites mit komplexen Content-Anforderungen.
                  </p>

                  <h3 className="text-xl font-semibold text-black mt-6 mb-3">Bewertung nach Dimensionen</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full border border-gray-300 text-sm">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="border border-gray-300 px-4 py-2 text-left text-black">Dimension</th>
                          <th className="border border-gray-300 px-4 py-2 text-left text-black">Bewertung</th>
                          <th className="border border-gray-300 px-4 py-2 text-left text-black">Score</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr><td className="border border-gray-300 px-4 py-2 font-medium text-black">Professionalität</td><td className="border border-gray-300 px-4 py-2 text-black">Sehr gut</td><td className="border border-gray-300 px-4 py-2 text-black">⭐⭐⭐⭐ (4/5)</td></tr>
                        <tr><td className="border border-gray-300 px-4 py-2 font-medium text-black">Umsetzung</td><td className="border border-gray-300 px-4 py-2 text-black">Gut bis sehr gut</td><td className="border border-gray-300 px-4 py-2 text-black">⭐⭐⭐⭐ (4/5)</td></tr>
                        <tr><td className="border border-gray-300 px-4 py-2 font-medium text-black">Innovation</td><td className="border border-gray-300 px-4 py-2 text-black">Gut</td><td className="border border-gray-300 px-4 py-2 text-black">⭐⭐⭐ (3/5)</td></tr>
                        <tr><td className="border border-gray-300 px-4 py-2 font-medium text-black">Ausbaufähigkeit</td><td className="border border-gray-300 px-4 py-2 text-black">Exzellent</td><td className="border border-gray-300 px-4 py-2 text-black">⭐⭐⭐⭐⭐ (5/5)</td></tr>
                        <tr><td className="border border-gray-300 px-4 py-2 font-medium text-black">Business-Grundlage</td><td className="border border-gray-300 px-4 py-2 text-black">Exzellent</td><td className="border border-gray-300 px-4 py-2 text-black">⭐⭐⭐⭐⭐ (5/5)</td></tr>
                      </tbody>
                    </table>
                  </div>

                  <h3 className="text-xl font-semibold text-black mt-6 mb-3">Empfehlungen</h3>
                  <p className="text-gray-700"><strong>Sofort umsetzbar:</strong></p>
                  <ul className="list-disc pl-6 text-gray-700 space-y-1">
                    <li>AdminDashboard refactoring → bessere Wartbarkeit</li>
                    <li>Plugin-Registry → einfachere Erweiterung</li>
                    <li>Dokumentation → Onboarding für neue Entwickler</li>
                  </ul>

                  <p className="text-gray-700 mt-4"><strong>Mittelfristig (bei 3+ Projekten):</strong></p>
                  <ul className="list-disc pl-6 text-gray-700 space-y-1">
                    <li>Vollständige Modularisierung (~40-60 Iterationen)</li>
                    <li>Template-Erstellung für neue Projekte</li>
                    <li>Enterprise-Features (Audit-Log, Staging, Approvals)</li>
                  </ul>

                  <hr className="my-8" />

                  <h2 className="text-2xl font-bold text-black mt-8 mb-4">Fazit</h2>
                  <blockquote className="border-l-4 border-gray-400 pl-4 italic text-gray-700 my-4">
                    Das Image Engineering CMS ist eine exzellente Basis für B2B-Content-Projekte. Mit gezielter Modularisierung (~40-60 Iterationen) kann es zu einer wiederverwendbaren Plattform werden, die Projektlieferzeiten um 80% reduziert und als SaaS monetarisierbar ist.
                  </blockquote>

                  <hr className="my-8" />
                  <p className="text-sm text-gray-500 italic">
                    Dieses Dokument dient als Referenz für zukünftige Entwicklungsentscheidungen.
                  </p>
                </article>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <div className="print:hidden">
        <EngineersSlider />
        <Footer />
      </div>
    </div>
  );
};

export default Backlog;
