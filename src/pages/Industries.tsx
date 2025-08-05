import Navigation from "@/components/Navigation";
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
      name: "Photography",
      description: "Digital cameras for professional and amateur applications",
      applications: ["DSLR Testing", "Sensor Validation", "Color Accuracy"]
    },
    {
      icon: Smartphone,
      name: "Mobile Phones",
      description: "Image quality testing according to VCX standards",
      applications: ["Display Testing", "Camera Validation", "Performance Analysis"]
    },
    {
      icon: Car,
      name: "Automotive & ADAS",
      description: "Camera systems in vehicles, driver assistance and autonomous driving",
      link: "/automotive",
      applications: ["ADAS Testing", "Night Vision", "HDR Validation"]
    },
    {
      icon: Tv,
      name: "Broadcast & HDTV",
      description: "Video transmission, TV cameras, color-accurate reproduction",
      applications: ["Color Grading", "Signal Quality", "Video Standards"]
    },
    {
      icon: Shield,
      name: "Security / Surveillance",
      description: "CCTV systems, video surveillance",
      applications: ["Low-light Performance", "Motion Detection", "Image Clarity"]
    },
    {
      icon: Cog,
      name: "Machine Vision",
      description: "Camera systems for inspection, robotics, quality control",
      applications: ["Quality Control", "Robotics", "Inspection Systems"]
    },
    {
      icon: Stethoscope,
      name: "Medical / Endoscopy",
      description: "Image quality in medical imaging and diagnostic systems",
      applications: ["Medical Imaging", "Endoscopy", "Diagnostic Tools"]
    },
    {
      icon: ScanLine,
      name: "Scanning & Archiving",
      description: "Quality assurance in digitization of documents, books, photos",
      applications: ["Document Scanning", "Photo Archiving", "Quality Assurance"]
    },
    {
      icon: FlaskConical,
      name: "iQ‑Lab Testing",
      description: "Independent laboratory services for numerous industries",
      applications: ["Independent Testing", "Certification", "Standards Compliance"]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <AnnouncementBanner 
        message="Visit us at IBC 2025"
        ctaText="Learn more"
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
                Precision Solutions
                <br />
                <span className="font-medium text-[#7a933b]">Across Industries</span>
              </h1>
              
              <p className="text-xl lg:text-2xl text-white/90 font-light leading-relaxed max-w-3xl mx-auto">
                From automotive safety to medical diagnostics, our advanced image processing 
                technologies power innovation across diverse sectors worldwide.
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
                Meet us at IBC 2025
              </h2>
              <p className="text-lg text-muted-foreground mb-4 max-w-2xl">
                Book a meeting with us at IBC 2025 to get a tailored walkthrough of how we can help you streamline your media operations and stay ahead of changes.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>12-15 September 2025</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>Amsterdam, Netherlands</span>
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
              Book a Meeting
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="border-primary text-primary hover:bg-primary/5 px-8"
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Industries;