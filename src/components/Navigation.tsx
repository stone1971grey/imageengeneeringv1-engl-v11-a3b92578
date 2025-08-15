import { Button } from "@/components/ui/button";
import { Menu, X, Camera, Wrench, Building2, Download, Info, MessageCircle, Smartphone, Car, Tv, Shield, Cog, Stethoscope, ScanLine, FlaskConical, Monitor, Zap, Package, Lightbulb, Puzzle, Cpu, CheckCircle, Microscope, Target, BarChart3, Settings, Search, Users, Building, GraduationCap, FileText, BookOpen, Video, Link2, ScrollText, Phone, MapPin, Calendar, Briefcase, Handshake, Leaf, Recycle, ShieldCheck } from "lucide-react";
import { BadgeCheck, Sprout } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import logoIE from "@/assets/logo-ie.png";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

// Import industry images
import industryPhotography from "@/assets/industry-photography.jpg";
import industryMobile from "@/assets/industry-mobile.jpg";
import industryAutomotive from "@/assets/industry-automotive.jpg";
import industryBroadcast from "@/assets/industry-broadcast.jpg";
import industrySecurity from "@/assets/industry-security.jpg";
import industryMachineVision from "@/assets/industry-machine-vision.jpg";
import industryMedical from "@/assets/industry-medical.jpg";
import industryScanning from "@/assets/industry-scanning.jpg";
import industryLabTesting from "@/assets/industry-lab-testing.jpg";
import arcturusMainProduct from "@/assets/arcturus-main-product.png";
import iqAnalyzerIntro from "@/assets/iq-analyzer-intro.png";
import productBundleIeee from "@/assets/product-bundle-ieee.png";
import iqLedIllumination from "@/assets/iq-led-illumination.png";
import technology2025 from "@/assets/technology-2025.png";
import trainingMobileTesting from "@/assets/training-mobile-testing.jpg";
import arcturusSetupVegaLaptop from "@/assets/arcturus-setup-vega-laptop.jpg";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredIndustry, setHoveredIndustry] = useState<string | null>(null);
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);
  const [hoveredSolution, setHoveredSolution] = useState<string | null>(null);

  // Preload all images for faster hover experience
  useEffect(() => {
    const preloadImages = () => {
      // Collect all images from data objects
      const allImages = [
        ...Object.values(industryData).map(item => item.image),
        ...Object.values(productData).map(item => item.image),
        ...Object.values(solutionData).map(item => item.image),
        ...Object.values(solutionPackages).map(item => item.image),
        ...Object.values(targetGroupsData).map(item => item.image)
      ];

      // Preload each image
      allImages.forEach(imageSrc => {
        const img = new Image();
        img.src = imageSrc;
      });
    };

    preloadImages();
  }, []);

  // Industry data mapping
  const industryData = {
    "Fotografie": {
      image: industryPhotography,
      description: "Digitalkameras für professionelle und Amateur-Anwendungen"
    },
    "Mobiltelefone": {
      image: industryMobile,
      description: "Bildqualitätstests nach VCX-Standards"
    },
    "Automotive & ADAS": {
      image: industryAutomotive,
      description: "Kamerasysteme in Fahrzeugen, Fahrerassistenz und autonomes Fahren"
    },
    "Broadcast & HDTV": {
      image: industryBroadcast,
      description: "Videoübertragung, TV-Kameras, farbgetreue Wiedergabe"
    },
    "Sicherheit / Überwachung": {
      image: industrySecurity,
      description: "CCTV-Systeme, Videoüberwachung"
    },
    "Machine Vision": {
      image: industryMachineVision,
      description: "Kamerasysteme für Inspektion, Robotik, Qualitätskontrolle"
    },
    "Medizin / Endoskopie": {
      image: industryMedical,
      description: "Bildqualität in medizinischer Bildgebung und Diagnosesystemen"
    },
    "Scannen & Archivierung": {
      image: industryScanning,
      description: "Qualitätssicherung bei der Digitalisierung von Dokumenten, Büchern, Fotos"
    },
    "iQ‑Lab Testing": {
      image: industryLabTesting,
      description: "Unabhängige Labordienstleistungen für zahlreiche Branchen (z.B. Mobile, Automotive)"
    }
  };

  // Product data mapping
  const productData = {
    "Charts": {
      image: "/images/custom-chart.png",
      description: "Hochpräzise Testmuster und Farbcharts für umfassende Bildqualitätsanalyse"
    },
    "Geräte": {
      image: arcturusMainProduct,
      description: "Professionelle Testausrüstung einschließlich LED-Beleuchtungssystemen und Messgeräten"
    },
    "Software": {
      image: iqAnalyzerIntro,
      description: "Fortschrittliche Softwarelösungen für Bildanalyse, Kalibrierung und Qualitätskontrolle"
    },
    "Produktbündel": {
      image: productBundleIeee,
      description: "Komplette Testlösungen mit Hardware, Software und Zubehör"
    },
    "Lösungen": {
      image: iqLedIllumination,
      description: "Komplette Beleuchtungs- und Illuminationslösungen für professionelle Testumgebungen"
    },
    "Zubehör": {
      image: "/images/chart-case.png",
      description: "Professionelles Zubehör einschließlich Chart-Koffer, Halterungen und Kalibrierungstools"
    },
    "Technologie": {
      image: technology2025,
      description: "Neueste Innovationen und modernste Technologie in der Bildqualitätsmessung"
    },
    "Schulungen": {
      image: trainingMobileTesting,
      description: "Professionelle Schulungen zu Bildqualitätstests in verschiedenen Branchen - Was muss wie getestet werden? (z.B. Mobile Phones, Automotive, Medical) - Was gibt es an neuen Tests für meine Branche?"
    }
  };

  // Solution data mapping  
  const solutionData = {
    "Kamera-Qualitätsvalidierung": {
      image: industryPhotography,
      description: "Für Kamerahersteller, die präzise Beleuchtungssysteme und Testcharts benötigen.",
      subline: "Geeignet für: Consumer & Professional Kameras"
    },
    "ADAS Testing / Automotive Vision": {
      image: industryAutomotive,
      description: "Für Entwickler von Fahrerassistenzsystemen, die stabile Beleuchtungsbedingungen benötigen.",
      subline: "Geeignet für: Automotive Labs, IEEE P2020"
    },
    "Testumgebungen für Smartphones & Displays": {
      image: industryMobile,
      description: "Für OEMs und Forschung bei Tests der Farbwiedergabe und Schärfe.",
      subline: "Geeignet für: Mobile Industry, VCX Testing"
    },
    "Mikroskopie & Medizinische Bildgebung": {
      image: industryMedical,
      description: "Für Medizintechnik & Life Sciences.",
      subline: "Geeignet für: Medizinische Geräte, Endoskopie"
    },
    "ISO und IEEE konforme Test-Setups": {
      image: industryLabTesting,
      description: "Für Unternehmen, die standards-konforme Umgebungen benötigen.",
      subline: "Geeignet für: Standards Compliance, Labs"
    }
  };

  const solutionPackages = {
    "Arcturus HDR Test Bundle": {
      image: arcturusSetupVegaLaptop,
      description: "HDR‑Testbundle mit Arcturus LED, Vega Software und Testcharts – ideal für Automotive & Mobile.",
      subline: "Komplettpaket: Beleuchtung + Software + Charts"
    },
    "Arcturus LED + Vega Software + Test Charts": {
      image: arcturusMainProduct,
      description: "Komplettlösung für Beleuchtungstests",
      subline: "Hardware + Software + Charts Bundle"
    },
    "Kamera-Kalibrierungs-Paket": {
      image: "/images/custom-chart.png",
      description: "Beleuchtungssystem, Charts, Software – speziell für kalibrierte Tests",
      subline: "Kalibrierungs-Komplettlösung"
    },
    "Labor-Komplettlösung": {
      image: industryLabTesting,
      description: "Für Forschungseinrichtungen mit Hardware + Analyse",
      subline: "Forschungslabor Komplett-Setup"
    },
    "Spektrale Mess- & Analyse-Set": {
      image: iqAnalyzerIntro,
      description: "Lichtquelle + Auswertung + Export-Funktionen",
      subline: "Spektralanalyse Komplett-Kit"
    }
  };

  // Target groups data mapping
  const targetGroupsData = {
    "Hersteller": {
      image: industryAutomotive,
      description: "OEMs und Gerätehersteller, die Bildqualitätslösungen für ihre Produktentwicklung benötigen",
      subline: "Für: Kamerahersteller, Automotive OEMs, Consumer Electronics"
    },
    "Zulieferer": {
      image: industryMachineVision,
      description: "Tier-1 und Tier-2 Zulieferer, die Komponenten und Systeme für ihre Kunden validieren",
      subline: "Für: Automotive Suppliers, Sensor-Hersteller, Komponenten-Lieferanten"
    },
    "Forschungseinrichtungen": {
      image: industryLabTesting,
      description: "Universitäten und Forschungsinstitute für wissenschaftliche Untersuchungen und Standardentwicklung",
      subline: "Für: Universitäten, Institute, R&D-Abteilungen"
    }
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border py-3 lg:py-12">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center hover:opacity-80 transition-opacity">
            <img 
              src={logoIE} 
              alt="Image Engineering" 
              className="h-10 lg:h-16 w-auto max-w-[250px] object-contain brightness-0 invert" 
              style={{ width: '250px' }}
            />
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center flex-row gap-x-8">
            <NavigationMenu>
              <NavigationMenuList className="gap-x-8">
                <NavigationMenuItem className="mx-4">
                  <NavigationMenuTrigger className="px-4 py-2 rounded-md text-lg font-medium text-white hover:bg-[#E0F2FE] hover:text-black transition-colors duration-200 bg-transparent border-none h-auto">Ihre Lösung finden</NavigationMenuTrigger>
                  <NavigationMenuContent className="bg-white p-[20px] border-0 shadow-lg z-50">
                    <div className="flex flex-col gap-2 w-[1000px] bg-[#f3f3f3]">
                      {/* Main navigation grid */}
                        <div className="flex gap-6 p-6">
                        {/* Left Column: Typische Anwendungen */}
                          <div className="space-y-4 flex-1 pr-6 border-r border-border">
                          <h4 className="font-semibold mb-3 flex items-center gap-2 text-lg text-black">
                            <Target className="h-6 w-6" />
                            Typische Anwendungen
                          </h4>
                          <div 
                            className="flex items-center gap-3 text-lg text-black hover:text-blue-400 transition-colors cursor-pointer"
                            onMouseEnter={() => setHoveredSolution("Kamera-Qualitätsvalidierung")}
                            onMouseLeave={() => setHoveredSolution(null)}
                          >
                            <CheckCircle className="h-5 w-5" />
                            <span>Kamera-Qualitätsvalidierung</span>
                          </div>
                          <Link 
                            to="/automotive"
                            className="flex items-center gap-3 text-lg text-black hover:text-blue-400 transition-colors"
                            onMouseEnter={() => setHoveredSolution("ADAS Testing / Automotive Vision")}
                            onMouseLeave={() => setHoveredSolution(null)}
                          >
                            <CheckCircle className="h-5 w-5" />
                            <span>ADAS Testing / Automotive Vision</span>
                          </Link>
                          <div 
                            className="flex items-center gap-3 text-lg text-black hover:text-blue-400 transition-colors cursor-pointer"
                            onMouseEnter={() => setHoveredSolution("Testumgebungen für Smartphones & Displays")}
                            onMouseLeave={() => setHoveredSolution(null)}
                          >
                            <CheckCircle className="h-6 w-6" />
                            <span>Testumgebungen für Smartphones & Displays</span>
                          </div>
                          <div 
                            className="flex items-center gap-3 text-lg text-black hover:text-blue-400 transition-colors cursor-pointer"
                            onMouseEnter={() => setHoveredSolution("Mikroskopie & Medizinische Bildgebung")}
                            onMouseLeave={() => setHoveredSolution(null)}
                          >
                            <CheckCircle className="h-5 w-5" />
                            <span>Mikroskopie & Medizinische Bildgebung</span>
                          </div>
                          <div 
                            className="flex items-center gap-3 text-lg text-black hover:text-blue-400 transition-colors cursor-pointer"
                            onMouseEnter={() => setHoveredSolution("ISO und IEEE konforme Test-Setups")}
                            onMouseLeave={() => setHoveredSolution(null)}
                          >
                            <CheckCircle className="h-5 w-5" />
                            <span>ISO und IEEE konforme Test-Setups</span>
                          </div>
                        </div>
                        
                        
                        {/* Middle Column: Vorkonfigurierte Lösungspakete */}
                          <div className="space-y-4 flex-1 pr-6 border-r border-border">
                          <h4 className="font-semibold mb-3 flex items-center gap-2 text-lg text-black">
                            <Package className="h-6 w-6" />
                            Lösungspakete
                          </h4>
                          <Link
                            to="/solution/arcturus-bundle"
                            className="flex items-center gap-3 text-lg text-black hover:text-blue-400 transition-colors"
                            onMouseEnter={() => setHoveredSolution("Arcturus HDR Test Bundle")}
                            onMouseLeave={() => setHoveredSolution(null)}
                          >
                            <Zap className="h-5 w-5" />
                            <span>Arcturus HDR Test Bundle</span>
                          </Link>
                          <div 
                            className="flex items-center gap-3 text-lg text-black hover:text-blue-400 transition-colors cursor-pointer"
                            onMouseEnter={() => setHoveredSolution("Kamera-Kalibrierungs-Paket")}
                            onMouseLeave={() => setHoveredSolution(null)}
                          >
                            <Settings className="h-5 w-5" />
                            <span>Kamera-Kalibrierungs-Paket</span>
                          </div>
                          <div 
                            className="flex items-center gap-3 text-lg text-black hover:text-blue-400 transition-colors cursor-pointer"
                            onMouseEnter={() => setHoveredSolution("Labor-Komplettlösung")}
                            onMouseLeave={() => setHoveredSolution(null)}
                          >
                            <Microscope className="h-5 w-5" />
                            <span>Labor-Komplettlösung</span>
                          </div>
                          <div 
                            className="flex items-center gap-3 text-lg text-black hover:text-blue-400 transition-colors cursor-pointer"
                            onMouseEnter={() => setHoveredSolution("Spektrale Mess- & Analyse-Set")}
                            onMouseLeave={() => setHoveredSolution(null)}
                          >
                            <BarChart3 className="h-5 w-5" />
                            <span>Spektrale Mess- & Analyse-Set</span>
                          </div>
                        </div>


                        {/* Right Column: Zielgruppen */}
                        <div className="space-y-4 flex-1">
                          <h4 className="font-semibold mb-3 flex items-center gap-2 text-lg text-black">
                            <Users className="h-6 w-6" />
                            Zielgruppen
                          </h4>
                          <div 
                            className="flex items-center gap-3 text-lg text-black hover:text-blue-400 transition-colors cursor-pointer"
                            onMouseEnter={() => setHoveredSolution("Hersteller")}
                            onMouseLeave={() => setHoveredSolution(null)}
                          >
                            <Building className="h-5 w-5" />
                            <span>Hersteller</span>
                          </div>
                          <div 
                            className="flex items-center gap-3 text-lg text-black hover:text-blue-400 transition-colors cursor-pointer"
                            onMouseEnter={() => setHoveredSolution("Zulieferer")}
                            onMouseLeave={() => setHoveredSolution(null)}
                          >
                            <Cog className="h-5 w-5" />
                            <span>Zulieferer</span>
                          </div>
                          <div 
                            className="flex items-center gap-3 text-lg text-black hover:text-blue-400 transition-colors cursor-pointer"
                            onMouseEnter={() => setHoveredSolution("Forschungseinrichtungen")}
                            onMouseLeave={() => setHoveredSolution(null)}
                          >
                            <GraduationCap className="h-5 w-5" />
                            <span>Forschungseinrichtungen</span>
                          </div>
                        </div>
                      </div>
                      
                       {/* Solution-Finder CTA */}
                      <div className="bg-[#f3f3f3] px-6 pt-6 pb-6">
                        <div className="bg-[#56bef9] hover:bg-[#4aa8e0] p-4 rounded flex items-center justify-center transition-colors cursor-pointer">
                          <div className="flex items-center gap-3 text-black">
                            <Search className="h-5 w-5" />
                            <span className="text-lg font-medium">Hilfe bei der Auswahl? → Lösungsfinder starten</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Image and description section */}
                      {hoveredSolution && (solutionData[hoveredSolution as keyof typeof solutionData] || solutionPackages[hoveredSolution as keyof typeof solutionPackages] || targetGroupsData[hoveredSolution as keyof typeof targetGroupsData]) && (
                        <div className="bg-[#f3f3f3] p-4">
                          <div className="flex items-center gap-6 p-4 bg-white rounded">
                            <img 
                              src={(solutionData[hoveredSolution as keyof typeof solutionData] || solutionPackages[hoveredSolution as keyof typeof solutionPackages] || targetGroupsData[hoveredSolution as keyof typeof targetGroupsData]).image} 
                              alt={hoveredSolution}
                              className="w-[190px] h-auto object-cover rounded"
                            />
                            <div className="text-black">
                              <h4 className="font-semibold text-xl">{hoveredSolution}</h4>
                              <p className="text-lg text-gray-600">{(solutionData[hoveredSolution as keyof typeof solutionData] || solutionPackages[hoveredSolution as keyof typeof solutionPackages] || targetGroupsData[hoveredSolution as keyof typeof targetGroupsData]).description}</p>
                              <p className="text-sm text-blue-600 mt-1">{(solutionData[hoveredSolution as keyof typeof solutionData] || solutionPackages[hoveredSolution as keyof typeof solutionPackages] || targetGroupsData[hoveredSolution as keyof typeof targetGroupsData]).subline}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem className="mx-4">
                  <Link to="/industries">
                    <NavigationMenuTrigger className="px-4 py-2 rounded-md text-lg font-medium text-white hover:bg-[#E0F2FE] hover:text-black transition-colors duration-200 bg-transparent border-none h-auto">Branchen</NavigationMenuTrigger>
                  </Link>
                  <NavigationMenuContent className="bg-white p-[20px] border-0 shadow-none">
                    <div className="flex flex-col gap-2 w-[800px] bg-[#f3f3f3]">
                      {/* Main navigation grid */}
                      <div className="flex gap-8 p-6 h-[200px]">
                        <div className="space-y-4 flex-1">
                          <div 
                            className="flex items-center gap-3 text-lg text-black hover:text-blue-400 transition-colors cursor-pointer"
                            onMouseEnter={() => setHoveredIndustry("Fotografie")}
                            onMouseLeave={() => setHoveredIndustry(null)}
                          >
                            <Camera className="h-6 w-6" />
                            <span>Fotografie</span>
                          </div>
                          <div 
                            className="flex items-center gap-3 text-lg text-black hover:text-blue-400 transition-colors cursor-pointer"
                            onMouseEnter={() => setHoveredIndustry("Mobiltelefone")}
                            onMouseLeave={() => setHoveredIndustry(null)}
                          >
                            <Smartphone className="h-6 w-6" />
                            <span>Mobiltelefone</span>
                          </div>
                          <Link 
                            to="/automotive" 
                            className="flex items-center gap-3 text-lg text-black hover:text-blue-400 transition-colors"
                            onMouseEnter={() => setHoveredIndustry("Automotive & ADAS")}
                            onMouseLeave={() => setHoveredIndustry(null)}
                          >
                            <Car className="h-6 w-6" />
                            <span>Automotive & ADAS</span>
                          </Link>
                        </div>
                        
                        <Separator orientation="vertical" className="bg-black h-40" />
                        
                        <div className="space-y-4 flex-1">
                          <div 
                            className="flex items-center gap-3 text-lg text-black hover:text-blue-400 transition-colors cursor-pointer"
                            onMouseEnter={() => setHoveredIndustry("Broadcast & HDTV")}
                            onMouseLeave={() => setHoveredIndustry(null)}
                          >
                            <Tv className="h-6 w-6" />
                            <span>Broadcast & HDTV</span>
                          </div>
                          <div 
                            className="flex items-center gap-3 text-lg text-black hover:text-blue-400 transition-colors cursor-pointer"
                            onMouseEnter={() => setHoveredIndustry("Sicherheit / Überwachung")}
                            onMouseLeave={() => setHoveredIndustry(null)}
                          >
                            <Shield className="h-6 w-6" />
                            <span>Sicherheit / Überwachung</span>
                          </div>
                          <div 
                            className="flex items-center gap-3 text-lg text-black hover:text-blue-400 transition-colors cursor-pointer"
                            onMouseEnter={() => setHoveredIndustry("Machine Vision")}
                            onMouseLeave={() => setHoveredIndustry(null)}
                          >
                            <Cog className="h-6 w-6" />
                            <span>Machine Vision</span>
                          </div>
                        </div>
                        
                        <Separator orientation="vertical" className="bg-black h-40" />
                        
                        <div className="space-y-4 flex-1">
                          <div 
                            className="flex items-center gap-3 text-lg text-black hover:text-blue-400 transition-colors cursor-pointer"
                            onMouseEnter={() => setHoveredIndustry("Medizin / Endoskopie")}
                            onMouseLeave={() => setHoveredIndustry(null)}
                          >
                            <Stethoscope className="h-6 w-6" />
                            <span>Medizin / Endoskopie</span>
                          </div>
                          <div 
                            className="flex items-center gap-3 text-lg text-black hover:text-blue-400 transition-colors cursor-pointer"
                            onMouseEnter={() => setHoveredIndustry("Scannen & Archivierung")}
                            onMouseLeave={() => setHoveredIndustry(null)}
                          >
                            <ScanLine className="h-6 w-6" />
                            <span>Scannen & Archivierung</span>
                          </div>
                          <div 
                            className="flex items-center gap-3 text-lg text-black hover:text-blue-400 transition-colors cursor-pointer"
                            onMouseEnter={() => setHoveredIndustry("iQ‑Lab Testing")}
                            onMouseLeave={() => setHoveredIndustry(null)}
                          >
                            <FlaskConical className="h-6 w-6" />
                            <span>iQ‑Lab Testing</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Image and description section */}
                      {hoveredIndustry && industryData[hoveredIndustry as keyof typeof industryData] && (
                        <div className="bg-[#f3f3f3] p-4">
                          <div className="flex items-center gap-6 p-4 bg-white rounded">
                            <img 
                              src={industryData[hoveredIndustry as keyof typeof industryData].image} 
                              alt={hoveredIndustry}
                              className="w-[190px] h-auto object-cover rounded"
                            />
                            <div className="text-black">
                              <h4 className="font-semibold text-xl">{hoveredIndustry}</h4>
                              <p className="text-lg text-gray-600">{industryData[hoveredIndustry as keyof typeof industryData].description}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem className="mx-4">
                  <Link to="/products">
                    <NavigationMenuTrigger className="px-4 py-2 rounded-md text-lg font-medium text-white hover:bg-[#E0F2FE] hover:text-black transition-colors duration-200 bg-transparent border-none h-auto">Produkte</NavigationMenuTrigger>
                  </Link>
                  <NavigationMenuContent className="bg-white p-[20px] border-0 shadow-lg z-50">
                    <div className="flex flex-col gap-2 w-[800px] bg-[#f3f3f3]">
                      {/* Main navigation grid */}
                        <div className="flex gap-8 p-6">
                          <div className="space-y-4 flex-1 pr-6 border-r border-border">
                           <Link
                            to="/products/charts"
                            className="flex items-center gap-3 text-lg text-black hover:text-blue-400 transition-colors"
                            onMouseEnter={() => setHoveredProduct("Charts")}
                            onMouseLeave={() => setHoveredProduct(null)}
                          >
                            <Target className="h-6 w-6" />
                            <span>Charts</span>
                          </Link>
                           <div 
                            className="flex items-center gap-3 text-lg text-black hover:text-blue-400 transition-colors cursor-pointer"
                            onMouseEnter={() => setHoveredProduct("Geräte")}
                            onMouseLeave={() => setHoveredProduct(null)}
                          >
                            <Camera className="h-6 w-6" />
                            <span>Geräte</span>
                          </div>
                          <div 
                            className="flex items-center gap-3 text-lg text-black hover:text-blue-400 transition-colors cursor-pointer"
                            onMouseEnter={() => setHoveredProduct("Software")}
                            onMouseLeave={() => setHoveredProduct(null)}
                          >
                            <Monitor className="h-6 w-6" />
                            <span>Software</span>
                          </div>
                        </div>
                        
                        
                          <div className="space-y-4 flex-1 pr-6 border-r border-border">
                           <div 
                            className="flex items-center gap-3 text-lg text-black hover:text-blue-400 transition-colors cursor-pointer"
                            onMouseEnter={() => setHoveredProduct("Produktbündel")}
                            onMouseLeave={() => setHoveredProduct(null)}
                          >
                            <Package className="h-6 w-6" />
                            <span>Produktbündel</span>
                          </div>
                           <div 
                            className="flex items-center gap-3 text-lg text-black hover:text-blue-400 transition-colors cursor-pointer"
                            onMouseEnter={() => setHoveredProduct("Lösungen")}
                            onMouseLeave={() => setHoveredProduct(null)}
                          >
                            <Lightbulb className="h-6 w-6" />
                            <span>Lösungen</span>
                          </div>
                        </div>
                        
                        
                         <div className="space-y-4 flex-1">
                           <div 
                            className="flex items-center gap-3 text-lg text-black hover:text-blue-400 transition-colors cursor-pointer"
                            onMouseEnter={() => setHoveredProduct("Zubehör")}
                            onMouseLeave={() => setHoveredProduct(null)}
                          >
                            <Puzzle className="h-6 w-6" />
                            <span>Zubehör</span>
                          </div>
                           <div 
                            className="flex items-center gap-3 text-lg text-black hover:text-blue-400 transition-colors cursor-pointer"
                            onMouseEnter={() => setHoveredProduct("Technologie")}
                            onMouseLeave={() => setHoveredProduct(null)}
                          >
                            <Cpu className="h-6 w-6" />
                            <span>Technologie</span>
                          </div>
                           <div 
                            className="flex items-center gap-3 text-lg text-black hover:text-blue-400 transition-colors cursor-pointer"
                            onMouseEnter={() => setHoveredProduct("Schulungen")}
                            onMouseLeave={() => setHoveredProduct(null)}
                          >
                            <GraduationCap className="h-6 w-6" />
                            <span>Schulungen</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Testlabor CTA */}
                      <div className="bg-[#f3f3f3] px-6 pt-6 pb-6">
                        <Link to="/inside-lab">
                          <div className="bg-[#56bef9] hover:bg-[#4aa8e0] p-4 rounded flex items-center justify-center transition-colors cursor-pointer">
                            <div className="flex items-center gap-3 text-black">
                              <Microscope className="h-5 w-5" />
                              <span className="text-lg font-medium">Blick ins Testlabor</span>
                            </div>
                          </div>
                        </Link>
                      </div>
                      
                      {/* Image and description section */}
                      {hoveredProduct && productData[hoveredProduct as keyof typeof productData] && (
                        <div className="bg-[#f3f3f3] p-4">
                          <div className="flex items-center gap-6 p-4 bg-white rounded">
                            <img 
                              src={productData[hoveredProduct as keyof typeof productData].image} 
                              alt={hoveredProduct}
                              className="w-[190px] h-[190px] object-cover rounded"
                            />
                            <div className="text-black">
                              <h4 className="font-semibold text-xl">{hoveredProduct}</h4>
                              <p className="text-lg text-gray-600">{productData[hoveredProduct as keyof typeof productData].description}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem className="mx-4">
                  <NavigationMenuTrigger className="px-4 py-2 rounded-md text-lg font-medium text-white hover:bg-[#E0F2FE] hover:text-black transition-colors duration-200 bg-transparent border-none h-auto">Ressourcen</NavigationMenuTrigger>
                  <NavigationMenuContent className="bg-white p-[20px] border-0 shadow-lg z-50">
                    <div className="flex flex-col gap-2 w-[1000px] bg-[#f3f3f3]">
                        <div className="flex gap-6 p-6">
                        {/* Column 1: Downloads */}
                          <div className="space-y-4 flex-1 pr-6 border-r border-border">
                          <h4 className="font-semibold mb-3 flex items-center gap-2 text-lg text-black">
                            <Download className="h-6 w-6" />
                            Downloads
                          </h4>
                          <div className="flex items-center gap-3 text-lg text-black hover:text-blue-400 transition-colors cursor-pointer">
                            <Package className="h-5 w-5" />
                            <Link to="/downloads">Software</Link>
                          </div>
                          <div className="flex items-center gap-3 text-lg text-black hover:text-blue-400 transition-colors cursor-pointer">
                            <FileText className="h-5 w-5" />
                            <a href="#">Dokumentation</a>
                          </div>
                          <div className="flex items-center gap-3 text-lg text-black hover:text-blue-400 transition-colors cursor-pointer">
                            <BookOpen className="h-5 w-5" />
                            <a href="#">White Papers</a>
                          </div>
                        </div>


                        {/* Column 2: Support & Hilfe */}
                          <div className="space-y-4 flex-1 pr-6 border-r border-border">
                          <h4 className="font-semibold mb-3 flex items-center gap-2 text-lg text-black">
                            <Wrench className="h-6 w-6" />
                            Support & Hilfe
                          </h4>
                          <div className="flex items-center gap-3 text-lg text-black hover:text-blue-400 transition-colors cursor-pointer">
                            <Lightbulb className="h-5 w-5" />
                            <a href="#">Knowledge Base</a>
                          </div>
                          <div className="flex items-center gap-3 text-lg text-black hover:text-blue-400 transition-colors cursor-pointer">
                            <Wrench className="h-5 w-5" />
                            <a href="#">Technischer Support</a>
                          </div>
                          <div className="flex items-center gap-3 text-lg text-black hover:text-blue-400 transition-colors cursor-pointer">
                            <Users className="h-5 w-5" />
                            <a href="#">Community</a>
                          </div>
                        </div>


                        {/* Column 3: Zusatzressourcen */}
                        <div className="space-y-4 flex-1">
                          <h4 className="font-semibold mb-3 flex items-center gap-2 text-lg text-black">
                            <Info className="h-6 w-6" />
                            Zusatzressourcen
                          </h4>
                          <div className="flex items-center gap-3 text-lg text-black hover:text-blue-400 transition-colors cursor-pointer">
                            <Video className="h-5 w-5" />
                            <a href="#">Tutorials & Video-Guides</a>
                          </div>
                          <div className="flex items-center gap-3 text-lg text-black hover:text-blue-400 transition-colors cursor-pointer">
                            <Link2 className="h-5 w-5" />
                            <a href="#">API-Dokumentation</a>
                          </div>
                          <div className="flex items-center gap-3 text-lg text-black hover:text-blue-400 transition-colors cursor-pointer">
                            <ScrollText className="h-5 w-5" />
                            <a href="#">Release Notes</a>
                          </div>
                        </div>
                      </div>

                      {/* CTA Button */}
                      <div className="bg-[#f3f3f3] px-6 pt-6 pb-6">
                        <Link to="/downloads">
                          <div className="bg-[#56bef9] hover:bg-[#4aa8e0] p-4 rounded flex items-center justify-center transition-colors cursor-pointer">
                            <div className="flex items-center gap-3 text-black">
                              <Search className="h-5 w-5" />
                              <span className="text-lg font-medium">Zum Downloadcenter</span>
                            </div>
                          </div>
                        </Link>
                      </div>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem className="mx-4">
                  <NavigationMenuTrigger className="px-4 py-2 rounded-md text-lg font-medium text-white hover:bg-[#E0F2FE] hover:text-black transition-colors duration-200 bg-transparent border-none h-auto">Über uns</NavigationMenuTrigger>
                  <NavigationMenuContent className="bg-white p-[20px] border-0 shadow-lg z-50">
                    <div className="flex flex-col gap-2 w-[1000px] bg-[#f3f3f3]">
                      {/* Main grid */}
                      <div className="flex gap-6 p-6">
                        {/* Column 1: Kontakt & Standort */}
                         <div className="space-y-4 flex-1 pr-6 border-r border-border">
                          <h4 className="font-semibold mb-3 flex items-center gap-2 text-lg text-black">
                            <Building2 className="h-6 w-6" />
                            Kontakt & Standort
                          </h4>
                          <div className="flex items-center gap-3 text-lg text-black hover:text-blue-400 transition-colors cursor-pointer">
                            <MessageCircle className="h-5 w-5" />
                            <a href="#">Kontakt</a>
                          </div>
                          <div className="flex items-center gap-3 text-lg text-black hover:text-blue-400 transition-colors cursor-pointer">
                            <MapPin className="h-5 w-5" />
                            <a href="#">Besuch uns</a>
                          </div>
                          <div className="flex items-center gap-3 text-lg text-black hover:text-blue-400 transition-colors cursor-pointer">
                            <Building className="h-5 w-5" />
                            <a href="#">Händler / Reseller</a>
                          </div>
                          <div className="flex items-center gap-3 text-lg text-black hover:text-blue-400 transition-colors cursor-pointer">
                            <Calendar className="h-5 w-5" />
                            <a href="#">Events</a>
                          </div>
                          <div className="flex items-center gap-3 text-lg text-black hover:text-blue-400 transition-colors cursor-pointer">
                            <Calendar className="h-5 w-5" />
                            <Link to="/veranstaltungen">Veranstaltungen</Link>
                          </div>
                        </div>


                        {/* Column 2: Über das Unternehmen */}
                         <div className="space-y-4 flex-1 pr-6 border-r border-border">
                          <div className="flex items-center gap-3 text-lg text-black hover:text-blue-400 transition-colors cursor-pointer">
                            <Info className="h-5 w-5" />
                            <a href="#about">Über Image Engineering</a>
                          </div>
                          <div className="flex items-center gap-3 text-lg text-black hover:text-blue-400 transition-colors cursor-pointer">
                            <Users className="h-5 w-5" />
                            <a href="#">Team</a>
                          </div>
                          <div className="flex items-center gap-3 text-lg text-black hover:text-blue-400 transition-colors cursor-pointer">
                            <Building2 className="h-5 w-5" />
                            <a href="#">Nynomic Group</a>
                          </div>
                          <div className="flex items-center gap-3 text-lg text-black hover:text-blue-400 transition-colors cursor-pointer">
                            <Briefcase className="h-5 w-5" />
                            <a href="#">Stellenangebote</a>
                          </div>
                          <div className="flex items-center gap-3 text-lg text-black hover:text-blue-400 transition-colors cursor-pointer">
                            <Handshake className="h-5 w-5" />
                            <a href="#">Mitgliedschaften & Partnerschaften</a>
                          </div>
                        </div>

                        

                        {/* Column 3: Qualität & Nachhaltigkeit */}
                        <div className="space-y-4 flex-1">
                          <div className="flex items-center gap-3 text-lg text-black hover:text-blue-400 transition-colors cursor-pointer">
                            <BadgeCheck className="h-5 w-5" />
                            <a href="#" aria-label="Qualitätsmanagement">{/* TODO: link to /company/quality-management when route exists */}Qualitätsmanagement</a>
                          </div>
                          <div className="flex items-center gap-3 text-lg text-black hover:text-blue-400 transition-colors cursor-pointer">
                            <Leaf className="h-5 w-5" />
                            <a href="#" aria-label="Klimaneutralität">{/* TODO: link to /company/climate-neutrality when route exists */}Klimaneutralität</a>
                          </div>
                          <div className="flex items-center gap-3 text-lg text-black hover:text-blue-400 transition-colors cursor-pointer">
                            <Sprout className="h-5 w-5" />
                            <a href="#" aria-label="ESG – Nachhaltigkeit">{/* TODO: link to /company/esg-sustainability when route exists */}ESG – Nachhaltigkeit</a>
                          </div>
                          <div className="flex items-center gap-3 text-lg text-black hover:text-blue-400 transition-colors cursor-pointer">
                            <Recycle className="h-5 w-5" />
                            <a href="#" aria-label="Entsorgung & Recycling">{/* TODO: link to /company/disposal-recycling when route exists */}Entsorgung & Recycling</a>
                          </div>
                        </div>
                      </div>

                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
            
            <Button variant="default" className="bg-gradient-primary hover:bg-white hover:text-black transition-all duration-300 ml-4 text-lg">
              Kontakt
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation - Drawer with Accordions */}
        <div className="lg:hidden">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetContent side="right" className="w-full sm:max-w-sm p-0">
              <div className="h-full overflow-y-auto">
                <nav className="px-4 pt-6 pb-28">
                  <Accordion type="single" collapsible className="space-y-0">
                    {/* Ihre Lösung finden */}
                    <AccordionItem value="solutions">
                      <AccordionTrigger className="px-4 py-3 text-base">
                        <div className="flex items-center gap-3">
                          <Search className="w-5 h-5 shrink-0 text-muted-foreground" />
                          <span className="text-foreground">Ihre Lösung finden</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4 pt-2">
                          {/* Typische Anwendungen */}
                          <div>
                            <ul className="space-y-1">
                              <li>
                                <div className="min-h-12 px-4 flex items-center gap-3 py-3">
                                  <CheckCircle className="w-5 h-5 shrink-0 text-muted-foreground" />
                                  <span className="text-foreground">Kamera-Qualitätsvalidierung</span>
                                </div>
                              </li>
                              <li>
                                <div className="min-h-12 px-4 flex items-center gap-3 py-3">
                                  <CheckCircle className="w-5 h-5 shrink-0 text-muted-foreground" />
                                  <span className="text-foreground">ADAS Testing / Automotive Vision</span>
                                </div>
                              </li>
                              <li>
                                <div className="min-h-12 px-4 flex items-center gap-3 py-3">
                                  <CheckCircle className="w-5 h-5 shrink-0 text-muted-foreground" />
                                  <span className="text-foreground">Testumgebungen für Smartphones & Displays</span>
                                </div>
                              </li>
                              <li>
                                <div className="min-h-12 px-4 flex items-center gap-3 py-3">
                                  <CheckCircle className="w-5 h-5 shrink-0 text-muted-foreground" />
                                  <span className="text-foreground">Mikroskopie & Medizinische Bildgebung</span>
                                </div>
                              </li>
                              <li>
                                <div className="min-h-12 px-4 flex items-center gap-3 py-3">
                                  <CheckCircle className="w-5 h-5 shrink-0 text-muted-foreground" />
                                  <span className="text-foreground">ISO und IEEE konforme Test-Setups</span>
                                </div>
                              </li>
                            </ul>
                          </div>
                          <Separator />
                          {/* Lösungspakete */}
                          <div>
                            <ul className="space-y-1">
                              <li>
                                <div className="min-h-12 px-4 flex items-center gap-3 py-3">
                                  <Zap className="w-5 h-5 shrink-0 text-muted-foreground" />
                                  <span className="text-foreground">Arcturus HDR Test Bundle</span>
                                </div>
                              </li>
                              <li>
                                <div className="min-h-12 px-4 flex items-center gap-3 py-3">
                                  <Settings className="w-5 h-5 shrink-0 text-muted-foreground" />
                                  <span className="text-foreground">Kamera-Kalibrierungs-Paket</span>
                                </div>
                              </li>
                              <li>
                                <div className="min-h-12 px-4 flex items-center gap-3 py-3">
                                  <Microscope className="w-5 h-5 shrink-0 text-muted-foreground" />
                                  <span className="text-foreground">Labor-Komplettlösung</span>
                                </div>
                              </li>
                              <li>
                                <div className="min-h-12 px-4 flex items-center gap-3 py-3">
                                  <BarChart3 className="w-5 h-5 shrink-0 text-muted-foreground" />
                                  <span className="text-foreground">Spektrale Mess- & Analyse-Set</span>
                                </div>
                              </li>
                            </ul>
                          </div>
                          <Separator />
                          {/* Zielgruppen */}
                          <div>
                            <ul className="space-y-1">
                              <li>
                                <div className="min-h-12 px-4 flex items-center gap-3 py-3">
                                  <Building className="w-5 h-5 shrink-0 text-muted-foreground" />
                                  <span className="text-foreground">Hersteller</span>
                                </div>
                              </li>
                              <li>
                                <div className="min-h-12 px-4 flex items-center gap-3 py-3">
                                  <Cog className="w-5 h-5 shrink-0 text-muted-foreground" />
                                  <span className="text-foreground">Zulieferer</span>
                                </div>
                              </li>
                              <li>
                                <div className="min-h-12 px-4 flex items-center gap-3 py-3">
                                  <GraduationCap className="w-5 h-5 shrink-0 text-muted-foreground" />
                                  <span className="text-foreground">Forschungseinrichtungen</span>
                                </div>
                              </li>
                            </ul>
                          </div>
                          <Button className="w-full h-12 mt-4 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90">Lösungsfinder starten</Button>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    {/* Branchen */}
                    <AccordionItem value="industries">
                      <AccordionTrigger className="px-4 py-3 text-base">
                        <div className="flex items-center gap-3">
                          <Building2 className="w-5 h-5 shrink-0 text-muted-foreground" />
                          <span className="text-foreground">Branchen</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-2 pt-2">
                          <ul className="space-y-1">
                            <li>
                              <Link to="/industries" className="min-h-12 px-4 flex items-center gap-3 py-3">
                                <Camera className="w-5 h-5 shrink-0 text-muted-foreground" />
                                <span className="text-foreground">Fotografie</span>
                              </Link>
                            </li>
                            <li>
                              <Link to="/industries" className="min-h-12 px-4 flex items-center gap-3 py-3">
                                <Smartphone className="w-5 h-5 shrink-0 text-muted-foreground" />
                                <span className="text-foreground">Mobiltelefone</span>
                              </Link>
                            </li>
                            <li>
                              <Link to="/automotive" className="min-h-12 px-4 flex items-center gap-3 py-3">
                                <Car className="w-5 h-5 shrink-0 text-muted-foreground" />
                                <span className="text-foreground">Automotive & ADAS</span>
                              </Link>
                            </li>
                            <li>
                              <Link to="/industries" className="min-h-12 px-4 flex items-center gap-3 py-3">
                                <Tv className="w-5 h-5 shrink-0 text-muted-foreground" />
                                <span className="text-foreground">Broadcast & HDTV</span>
                              </Link>
                            </li>
                            <li>
                              <Link to="/industries" className="min-h-12 px-4 flex items-center gap-3 py-3">
                                <Shield className="w-5 h-5 shrink-0 text-muted-foreground" />
                                <span className="text-foreground">Sicherheit / Überwachung</span>
                              </Link>
                            </li>
                            <li>
                              <Link to="/industries" className="min-h-12 px-4 flex items-center gap-3 py-3">
                                <Cog className="w-5 h-5 shrink-0 text-muted-foreground" />
                                <span className="text-foreground">Machine Vision</span>
                              </Link>
                            </li>
                            <li>
                              <Link to="/industries" className="min-h-12 px-4 flex items-center gap-3 py-3">
                                <Stethoscope className="w-5 h-5 shrink-0 text-muted-foreground" />
                                <span className="text-foreground">Medizin / Endoskopie</span>
                              </Link>
                            </li>
                            <li>
                              <Link to="/industries" className="min-h-12 px-4 flex items-center gap-3 py-3">
                                <ScanLine className="w-5 h-5 shrink-0 text-muted-foreground" />
                                <span className="text-foreground">Scannen & Archivierung</span>
                              </Link>
                            </li>
                            <li>
                              <Link to="/industries" className="min-h-12 px-4 flex items-center gap-3 py-3">
                                <FlaskConical className="w-5 h-5 shrink-0 text-muted-foreground" />
                                <span className="text-foreground">iQ‑Lab Testing</span>
                              </Link>
                            </li>
                          </ul>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    {/* Produkte */}
                    <AccordionItem value="products">
                      <AccordionTrigger className="px-4 py-3 text-base">
                        <div className="flex items-center gap-3">
                          <Package className="w-5 h-5 shrink-0 text-muted-foreground" />
                          <span className="text-foreground">Produkte</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-2 pt-2">
                          <ul className="space-y-1">
                            <li>
                              <Link to="/products/charts" className="min-h-12 px-4 flex items-center gap-3 py-3 hover:bg-accent rounded-md transition-colors"><Target className="w-5 h-5 shrink-0 text-muted-foreground" /><span className="text-foreground">Charts</span></Link>
                            </li>
                            <li>
                              <div className="min-h-12 px-4 flex items-center gap-3 py-3"><Camera className="w-5 h-5 shrink-0 text-muted-foreground" /><span className="text-foreground">Geräte</span></div>
                            </li>
                            <li>
                              <div className="min-h-12 px-4 flex items-center gap-3 py-3"><Monitor className="w-5 h-5 shrink-0 text-muted-foreground" /><span className="text-foreground">Software</span></div>
                            </li>
                            <li>
                              <div className="min-h-12 px-4 flex items-center gap-3 py-3"><Package className="w-5 h-5 shrink-0 text-muted-foreground" /><span className="text-foreground">Produktbündel</span></div>
                            </li>
                            <li>
                              <div className="min-h-12 px-4 flex items-center gap-3 py-3"><Lightbulb className="w-5 h-5 shrink-0 text-muted-foreground" /><span className="text-foreground">Lösungen</span></div>
                            </li>
                            <li>
                              <div className="min-h-12 px-4 flex items-center gap-3 py-3"><Puzzle className="w-5 h-5 shrink-0 text-muted-foreground" /><span className="text-foreground">Zubehör</span></div>
                            </li>
                            <li>
                              <div className="min-h-12 px-4 flex items-center gap-3 py-3"><Cpu className="w-5 h-5 shrink-0 text-muted-foreground" /><span className="text-foreground">Technologie</span></div>
                            </li>
                            <li>
                              <div className="min-h-12 px-4 flex items-center gap-3 py-3"><GraduationCap className="w-5 h-5 shrink-0 text-muted-foreground" /><span className="text-foreground">Schulungen</span></div>
                            </li>
                          </ul>
                          <Button className="w-full h-12 mt-4 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90">Inside the Lab – Real Test Setups</Button>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    {/* Ressourcen */}
                    <AccordionItem value="resources">
                      <AccordionTrigger className="px-4 py-3 text-base">
                        <div className="flex items-center gap-3">
                          <Download className="w-5 h-5 shrink-0 text-muted-foreground" />
                          <span className="text-foreground">Ressourcen</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4 pt-2">
                          <div>
                            <h4 className="font-medium mb-2 px-4">Downloads</h4>
                            <ul className="space-y-1">
                              <li>
                                <div className="min-h-12 px-4 flex items-center gap-3 py-3"><Package className="w-5 h-5 shrink-0 text-muted-foreground" /><span className="text-foreground">Software</span></div>
                              </li>
                              <li>
                                <div className="min-h-12 px-4 flex items-center gap-3 py-3"><FileText className="w-5 h-5 shrink-0 text-muted-foreground" /><span className="text-foreground">Dokumentation</span></div>
                              </li>
                              <li>
                                <div className="min-h-12 px-4 flex items-center gap-3 py-3"><BookOpen className="w-5 h-5 shrink-0 text-muted-foreground" /><span className="text-foreground">White Papers</span></div>
                              </li>
                            </ul>
                          </div>
                          <Separator />
                          <div>
                            <h4 className="font-medium mb-2 px-4">Support & Hilfe</h4>
                            <ul className="space-y-1">
                              <li>
                                <div className="min-h-12 px-4 flex items-center gap-3 py-3"><Lightbulb className="w-5 h-5 shrink-0 text-muted-foreground" /><span className="text-foreground">Knowledge Base</span></div>
                              </li>
                              <li>
                                <div className="min-h-12 px-4 flex items-center gap-3 py-3"><Wrench className="w-5 h-5 shrink-0 text-muted-foreground" /><span className="text-foreground">Technischer Support</span></div>
                              </li>
                              <li>
                                <div className="min-h-12 px-4 flex items-center gap-3 py-3"><Users className="w-5 h-5 shrink-0 text-muted-foreground" /><span className="text-foreground">Community</span></div>
                              </li>
                            </ul>
                          </div>
                          <Separator />
                          <div>
                            <h4 className="font-medium mb-2 px-4">Zusatzressourcen</h4>
                            <ul className="space-y-1">
                              <li>
                                <div className="min-h-12 px-4 flex items-center gap-3 py-3"><Video className="w-5 h-5 shrink-0 text-muted-foreground" /><span className="text-foreground">Tutorials & Video-Guides</span></div>
                              </li>
                              <li>
                                <div className="min-h-12 px-4 flex items-center gap-3 py-3"><Link2 className="w-5 h-5 shrink-0 text-muted-foreground" /><span className="text-foreground">API-Dokumentation</span></div>
                              </li>
                              <li>
                                <div className="min-h-12 px-4 flex items-center gap-3 py-3"><ScrollText className="w-5 h-5 shrink-0 text-muted-foreground" /><span className="text-foreground">Release Notes</span></div>
                              </li>
                            </ul>
                          </div>
                          <Button className="w-full h-12 mt-4 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90">Zum Downloadcenter →</Button>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    {/* Über uns */}
                    <AccordionItem value="about">
                      <AccordionTrigger className="px-4 py-3 text-base">
                        <div className="flex items-center gap-3">
                          <Info className="w-5 h-5 shrink-0 text-muted-foreground" />
                          <span className="text-foreground">Über uns</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="pt-2">
                          <ul className="space-y-1">
                            <li>
                              <div className="min-h-12 px-4 flex items-center gap-3 py-3"><MessageCircle className="w-5 h-5 shrink-0 text-muted-foreground" /><span className="text-foreground">Kontakt</span></div>
                            </li>
                            <li>
                              <div className="min-h-12 px-4 flex items-center gap-3 py-3"><MapPin className="w-5 h-5 shrink-0 text-muted-foreground" /><span className="text-foreground">Besuch uns</span></div>
                            </li>
                            <li>
                              <div className="min-h-12 px-4 flex items-center gap-3 py-3"><Building className="w-5 h-5 shrink-0 text-muted-foreground" /><span className="text-foreground">Händler / Reseller</span></div>
                            </li>
                            <li>
                              <div className="min-h-12 px-4 flex items-center gap-3 py-3"><Calendar className="w-5 h-5 shrink-0 text-muted-foreground" /><span className="text-foreground">Events</span></div>
                            </li>
                            <li>
                              <Link to="/veranstaltungen" className="min-h-12 px-4 flex items-center gap-3 py-3"><Calendar className="w-5 h-5 shrink-0 text-muted-foreground" /><span className="text-foreground">Veranstaltungen</span></Link>
                            </li>
                            <li>
                              <div className="min-h-12 px-4 flex items-center gap-3 py-3"><Info className="w-5 h-5 shrink-0 text-muted-foreground" /><span className="text-foreground">Über Image Engineering</span></div>
                            </li>
                            <li>
                              <div className="min-h-12 px-4 flex items-center gap-3 py-3"><Users className="w-5 h-5 shrink-0 text-muted-foreground" /><span className="text-foreground">Team</span></div>
                            </li>
                            <li>
                              <div className="min-h-12 px-4 flex items-center gap-3 py-3"><Building2 className="w-5 h-5 shrink-0 text-muted-foreground" /><span className="text-foreground">Nynomic Group</span></div>
                            </li>
                            <li>
                              <div className="min-h-12 px-4 flex items-center gap-3 py-3"><Briefcase className="w-5 h-5 shrink-0 text-muted-foreground" /><span className="text-foreground">Stellenangebote</span></div>
                            </li>
                            <li>
                              <div className="min-h-12 px-4 flex items-center gap-3 py-3"><Handshake className="w-5 h-5 shrink-0 text-muted-foreground" /><span className="text-foreground">Mitgliedschaften & Partnerschaften</span></div>
                            </li>
                            <li>
                              <Link to="#" aria-label="Qualitätsmanagement" className="flex items-center gap-3 px-4 py-3 rounded-md hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                                <BadgeCheck className="w-[18px] h-[18px] shrink-0 text-muted-foreground" />
                                <span className="text-[15px] leading-5 text-foreground">Qualitätsmanagement</span>
                              </Link>
                            </li>
                            <li>
                              <Link to="#" aria-label="Klimaneutralität" className="flex items-center gap-3 px-4 py-3 rounded-md hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                                <Leaf className="w-[18px] h-[18px] shrink-0 text-muted-foreground" />
                                <span className="text-[15px] leading-5 text-foreground">Klimaneutralität</span>
                              </Link>
                            </li>
                            <li>
                              <Link to="#" aria-label="ESG – Nachhaltigkeit" className="flex items-center gap-3 px-4 py-3 rounded-md hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                                <Sprout className="w-[18px] h-[18px] shrink-0 text-muted-foreground" />
                                <span className="text-[15px] leading-5 text-foreground">ESG – Nachhaltigkeit</span>
                              </Link>
                            </li>
                            <li>
                              <Link to="#" aria-label="Entsorgung & Recycling" className="flex items-center gap-3 px-4 py-3 rounded-md hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                                <Recycle className="w-[18px] h-[18px] shrink-0 text-muted-foreground" />
                                <span className="text-[15px] leading-5 text-foreground">Entsorgung & Recycling</span>
                              </Link>
                            </li>
                          </ul>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </nav>

                {/* Sticky Kontakt Button */}
                <div className="sticky bottom-0 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 pb-[env(safe-area-inset-bottom)] pt-3 border-t">
                  <Link to="/contact">
                    <Button className="w-full h-12 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90">
                      Kontakt
                    </Button>
                  </Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
