import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import AnnouncementBanner from "@/components/AnnouncementBanner";
import { Camera, Smartphone, Car, Tv, Shield, Cog, Stethoscope, ScanLine, FlaskConical, ArrowRight, Calendar, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import industriesHero from "@/assets/industries-hero.jpg";
import ibcBanner from "@/assets/ibc.png";

const Industries = () => {
  const industries = [
    {
      icon: Camera,
      name: "Fotografie",
      description: "Digitalkameras für professionelle und Amateur-Anwendungen",
      applications: ["DSLR Testing", "Sensor-Validierung", "Farbgenauigkeit"]
    },
    {
      icon: Smartphone,
      name: "Mobiltelefone",
      description: "Bildqualitätstests nach VCX-Standards",
      applications: ["Display-Tests", "Kamera-Validierung", "Leistungsanalyse"]
    },
    {
      icon: Car,
      name: "Automotive & ADAS",
      description: "Kamerasysteme in Fahrzeugen, Fahrerassistenz und autonomes Fahren",
      link: "/automotive",
      applications: ["ADAS-Tests", "Nachtsicht", "HDR-Validierung"]
    },
    {
      icon: Tv,
      name: "Broadcast & HDTV",
      description: "Videoübertragung, TV-Kameras, farbgetreue Wiedergabe",
      applications: ["Color Grading", "Signalqualität", "Video-Standards"]
    },
    {
      icon: Shield,
      name: "Sicherheit / Überwachung",
      description: "CCTV-Systeme, Videoüberwachung",
      applications: ["Schwachlicht-Leistung", "Bewegungserkennung", "Bildklarheit"]
    },
    {
      icon: Cog,
      name: "Machine Vision",
      description: "Kamerasysteme für Inspektion, Robotik, Qualitätskontrolle",
      applications: ["Qualitätskontrolle", "Robotik", "Inspektionssysteme"]
    },
    {
      icon: Stethoscope,
      name: "Medizin / Endoskopie",
      description: "Bildqualität in medizinischer Bildgebung und Diagnosesystemen",
      applications: ["Medizinische Bildgebung", "Endoskopie", "Diagnose-Tools"]
    },
    {
      icon: ScanLine,
      name: "Scannen & Archivierung",
      description: "Qualitätssicherung bei der Digitalisierung von Dokumenten, Büchern, Fotos",
      applications: ["Dokument-Scannen", "Foto-Archivierung", "Qualitätssicherung"]
    },
    {
      icon: FlaskConical,
      name: "iQ‑Lab Testing",
      description: "Unabhängige Labordienstleistungen für zahlreiche Branchen",
      applications: ["Unabhängige Tests", "Zertifizierung", "Standards-Konformität"]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <AnnouncementBanner 
        message="Besuchen Sie uns auf der IBC 2025"
        ctaText="Mehr erfahren"
        ctaLink="#"
        icon="calendar"
      />

      {/* Hero Section - Full Width */}
      <section className="relative min-h-screen overflow-hidden">
        {/* Hero Background Image */}
        <div className="absolute inset-0 animate-fade-in">
          <img 
            src={industriesHero} 
            alt="Industries Hero" 
            className="w-full h-full object-cover animate-ken-burns"
          />
          <div className="absolute inset-0 bg-black/40"></div>
        </div>

        {/* Navigation Spacer */}
        <div className="h-16"></div>
        
        {/* Hero Content */}
        <div className="relative z-10 container mx-auto px-6 py-24 lg:py-32">
          <div className="text-center max-w-5xl mx-auto">
            
            {/* Main Headline */}
            <div className="mb-8">
              <h1 id="industries-hero" className="text-6xl lg:text-7xl xl:text-8xl font-light text-white leading-[0.9] tracking-tight mb-6 -mt-64 pt-64">
                Präzisionslösungen
                <br />
                <span className="font-medium text-[#7a933b]">für alle Branchen</span>
              </h1>
              
              <p className="text-xl lg:text-2xl text-white/90 font-light leading-relaxed max-w-3xl mx-auto">
                Von der Fahrzeugsicherheit bis zur medizinischen Diagnostik - unsere fortschrittlichen Bildverarbeitungstechnologien 
                treiben Innovationen in verschiedenen Sektoren weltweit voran.
              </p>
            </div>
            
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-[#7a933b]/40 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-[#7a933b]/60 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* IBC 2025 Teaser Banner */}
      <section className="w-full bg-gradient-to-r from-primary/5 to-accent-soft-blue/5 border-b border-muted-foreground/10">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="flex-1 text-center lg:text-left">
              <h2 className="text-2xl lg:text-3xl font-semibold text-foreground mb-3">
                Treffen Sie uns auf der IBC 2025
              </h2>
              <p className="text-lg text-muted-foreground mb-4 max-w-2xl">
                Vereinbaren Sie ein Treffen mit uns auf der IBC 2025, um eine maßgeschneiderte Einführung darüber zu erhalten, wie wir Ihnen helfen können, Ihre Medienoperationen zu optimieren und Veränderungen voraus zu sein.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>12-15 September 2025</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>Amsterdam, Niederlande</span>
                </div>
              </div>
            </div>
            <div className="flex-shrink-0">
              <img 
                src={ibcBanner} 
                alt="IBC 2025 Banner" 
                className="w-auto h-24 lg:h-32 object-contain"
              />
            </div>
          </div>
          <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <Button 
              size="lg" 
              className="bg-primary hover:bg-primary/90 text-white px-8"
            >
              Termin vereinbaren
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="border-primary text-primary hover:bg-primary/5 px-8"
            >
              Mehr erfahren
            </Button>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Industries;