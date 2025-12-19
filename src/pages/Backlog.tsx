import Navigation from "@/components/Navigation";
import EngineersSlider from "@/components/EngineersSlider";
import Footer from "@/components/Footer";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Link } from "react-router-dom";
import { ExternalLink } from "lucide-react";

const Backlog = () => {
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
      backlogUrl: "/en/products/test-charts/le7", // CMS page - use original
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
      backlogUrl: "/en/products/illumination-devices/arcturus-led", // CMS page - use original
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
            <p className="text-sm text-gray-500">
              Click on each item to view the content snapshot.
            </p>
          </div>
        </div>
      </div>

      <section className="py-6 bg-white">
        <div className="container mx-auto px-6">
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
        </div>
      </section>

      <EngineersSlider />
      <Footer />
    </div>
  );
};

export default Backlog;
