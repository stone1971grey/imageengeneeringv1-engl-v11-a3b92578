import { Button } from "@/components/ui/button";
import { Menu, X, Camera, Wrench, Building2, Download, Info, MessageCircle, Smartphone, Car, Tv, Shield, Cog, Stethoscope, ScanLine, FlaskConical, Monitor, Zap, Package, Lightbulb, Puzzle, Cpu, CheckCircle, Microscope, Target, BarChart3, Settings, Search, Users, Building, GraduationCap } from "lucide-react";
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
import customChart from "@/assets/custom-chart.png";
import arcturusMainProduct from "@/assets/arcturus-main-product.png";
import iqAnalyzerIntro from "@/assets/iq-analyzer-intro.png";
import productBundleIeee from "@/assets/product-bundle-ieee.png";
import iqLedIllumination from "@/assets/iq-led-illumination.png";
import chartCase from "@/assets/chart-case.png";
import technology2025 from "@/assets/technology-2025.png";
import trainingMobileTesting from "@/assets/training-mobile-testing.jpg";

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
      image: customChart,
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
      image: chartCase,
      description: "Professionelles Zubehör einschließlich Chart-Koffer, Halterungen und Kalibrierungstools"
    },
    "Technologie": {
      image: technology2025,
      description: "Neueste Innovationen und modernste Technologie in der Bildqualitätsmessung"
    },
    "Schulungen": {
      image: trainingMobileTesting,
      description: "Professionelle Schulungen zu Bildqualitätstests in verschiedenen Branchen - Was muss wie getestet werden? (z.B. Mobile Phones, Automotive, Medical)"
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
    "Arcturus LED + Vega Software + Test Charts": {
      image: arcturusMainProduct,
      description: "Komplettlösung für Beleuchtungstests",
      subline: "Hardware + Software + Charts Bundle"
    },
    "Kamera-Kalibrierungs-Paket": {
      image: customChart,
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
    <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border py-12">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center hover:opacity-80 transition-opacity">
            <img 
              src={logoIE} 
              alt="Image Engineering" 
              className="h-12 md:h-16 w-auto max-w-[200px] object-contain brightness-0 invert" 
            />
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center flex-row gap-x-8">
            <NavigationMenu>
              <NavigationMenuList className="gap-x-8">
                <NavigationMenuItem className="mx-4">
                  <NavigationMenuTrigger className="px-4 py-2 rounded-md text-lg font-medium text-white hover:bg-[#E0F2FE] hover:text-black transition-colors duration-200 bg-transparent border-none h-auto">Ihre Lösung finden</NavigationMenuTrigger>
                  <NavigationMenuContent className="bg-white p-[20px] border-0 shadow-lg z-50">
                    <div className="flex flex-col gap-2 w-[1000px] bg-[#f3f3f3]">
                      {/* Main navigation grid */}
                      <div className="flex gap-6 p-6 h-[320px]">
                        {/* Left Column: Typische Anwendungen */}
                        <div className="space-y-4 flex-1">
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
                        
                        <Separator orientation="vertical" className="bg-black h-72" />
                        
                        {/* Middle Column: Vorkonfigurierte Lösungspakete */}
                        <div className="space-y-4 flex-1">
                          <h4 className="font-semibold mb-3 flex items-center gap-2 text-lg text-black">
                            <Package className="h-6 w-6" />
                            Lösungspakete
                          </h4>
                          <div 
                            className="flex items-center gap-3 text-lg text-black hover:text-blue-400 transition-colors cursor-pointer"
                            onMouseEnter={() => setHoveredSolution("Arcturus LED + Vega Software + Test Charts")}
                            onMouseLeave={() => setHoveredSolution(null)}
                          >
                            <Zap className="h-5 w-5" />
                            <span>Arcturus LED + Vega Software + Test Charts</span>
                          </div>
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

                        <Separator orientation="vertical" className="bg-black h-72" />

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
                      <div className="bg-[#f3f3f3] px-6 pt-8 pb-8">
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
                      <div className="flex gap-8 p-6 h-[200px]">
                        <div className="space-y-4 flex-1">
                           <div 
                            className="flex items-center gap-3 text-lg text-black hover:text-blue-400 transition-colors cursor-pointer"
                            onMouseEnter={() => setHoveredProduct("Charts")}
                            onMouseLeave={() => setHoveredProduct(null)}
                          >
                            <Target className="h-6 w-6" />
                            <span>Charts</span>
                          </div>
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
                        
                        <Separator orientation="vertical" className="bg-black h-40" />
                        
                        <div className="space-y-4 flex-1">
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
                        
                        <Separator orientation="vertical" className="bg-black h-40" />
                        
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
                      <div className="bg-[#f3f3f3] px-6 pt-8 pb-8">
                        <div className="bg-[#56bef9] hover:bg-[#4aa8e0] p-4 rounded flex items-center justify-center transition-colors cursor-pointer">
                          <div className="flex items-center gap-3 text-black">
                            <Microscope className="h-5 w-5" />
                            <span className="text-lg font-medium">Blick ins Testlabor</span>
                          </div>
                        </div>
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
                  <NavigationMenuContent className="bg-white p-[20px] border-0 shadow-none">
                    <div className="bg-[#f3f3f3] p-6 w-[400px]">
                      <div className="flex gap-8 h-[200px]">
                        <div className="space-y-4 flex-1">
                          <h4 className="font-semibold mb-3 flex items-center gap-2 text-lg text-black">
                            <Download className="h-6 w-6" />
                            Downloads
                          </h4>
                          <ul className="space-y-4">
                            <li><Link to="/downloads" className="text-lg text-black hover:text-blue-400 transition-colors">Software</Link></li>
                            <li><a href="#" className="text-lg text-black hover:text-blue-400 transition-colors">Documentation</a></li>
                            <li><a href="#" className="text-lg text-black hover:text-blue-400 transition-colors">White Papers</a></li>
                          </ul>
                        </div>
                        
                        <Separator orientation="vertical" className="bg-black h-40" />
                        
                        <div className="space-y-4 flex-1">
                          <h4 className="font-semibold mb-3 text-lg text-black">Support</h4>
                          <ul className="space-y-4">
                            <li><a href="#" className="text-lg text-black hover:text-blue-400 transition-colors">Knowledge Base</a></li>
                            <li><a href="#" className="text-lg text-black hover:text-blue-400 transition-colors">Technical Support</a></li>
                            <li><a href="#" className="text-lg text-black hover:text-blue-400 transition-colors">Community</a></li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem className="mx-4">
                  <NavigationMenuTrigger className="px-4 py-2 rounded-md text-lg font-medium text-white hover:bg-[#E0F2FE] hover:text-black transition-colors duration-200 bg-transparent border-none h-auto">Über uns</NavigationMenuTrigger>
                  <NavigationMenuContent className="bg-white p-[20px] border-0 shadow-none">
                    <div className="bg-[#f3f3f3] p-6 w-[300px]">
                      <div className="flex gap-8 h-[200px]">
                        <div className="space-y-4 flex-1">
                          <h4 className="font-semibold mb-3 text-lg text-black">Company</h4>
                          <ul className="space-y-4">
                            <li><a href="#about" className="text-lg text-black hover:text-blue-400 transition-colors">About Us</a></li>
                            <li><a href="#" className="text-lg text-black hover:text-blue-400 transition-colors">Team</a></li>
                            <li><a href="#" className="text-lg text-black hover:text-blue-400 transition-colors">Careers</a></li>
                            <li><a href="#" className="text-lg text-black hover:text-blue-400 transition-colors">News</a></li>
                          </ul>
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
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col space-y-3">
              <a href="#services" className="text-muted-foreground hover:text-foreground transition-colors">
                Services
              </a>
              <Link to="/automotive" className="text-muted-foreground hover:text-foreground transition-colors">
                Automotive
              </Link>
              <Link to="/downloads" className="text-muted-foreground hover:text-foreground transition-colors">
                Downloads
              </Link>
              <a href="#technology" className="text-muted-foreground hover:text-foreground transition-colors">
                Technology
              </a>
              <a href="#about" className="text-muted-foreground hover:text-foreground transition-colors">
                About
              </a>
              <Button variant="default" className="bg-gradient-primary w-fit">
                Contact
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
