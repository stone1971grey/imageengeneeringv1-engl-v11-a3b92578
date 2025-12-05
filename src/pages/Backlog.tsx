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
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div aria-hidden="true" className="block h-[320px]" />
      <div className="pb-16">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-center mb-8">Backlog</h1>
            <p className="text-xl text-center text-muted-foreground mb-4">
              Snapshots of pages currently in focus for design and implementation work.
            </p>
            <p className="text-sm text-muted-foreground">
              Click on each item to view the content snapshot.
            </p>
          </div>
        </div>
      </div>

      <section className="py-10 bg-background">
        <div className="container mx-auto px-6">
          <Accordion type="single" collapsible className="space-y-4">
            {backlogItems.map((item) => (
              <AccordionItem
                key={item.id}
                value={item.id}
                className="border border-border rounded-lg px-4"
              >
                <AccordionTrigger className="hover:no-underline py-4">
                  <div className="text-left">
                    <p className="font-semibold text-foreground">{item.title}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Original: {item.originalUrl}
                    </p>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-6">
                  <div className="mb-4">
                    <Link 
                      to={item.backlogUrl} 
                      className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View Page
                    </Link>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-6">
                    <pre className="whitespace-pre-wrap font-sans text-sm text-foreground leading-relaxed">
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
