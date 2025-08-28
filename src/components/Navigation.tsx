import { Button } from "@/components/ui/button";
import { Menu, X, Camera, Wrench, Building2, Download, Info, MessageCircle, Smartphone, Car, Tv, Shield, Cog, Stethoscope, ScanLine, FlaskConical, Monitor, Zap, Package, Lightbulb, Puzzle, Cpu, CheckCircle, Microscope, Target, BarChart3, Settings, Search, Users, Building, GraduationCap, FileText, BookOpen, Video, Link2, ScrollText, Phone, MapPin, Calendar, Briefcase, Handshake, Leaf, Recycle, ShieldCheck, ChevronRight } from "lucide-react";
import { BadgeCheck, Sprout } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import logoIE from "@/assets/logo-ie.png";
import UtilityNavigation from "@/components/UtilityNavigation";
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
    "Photography": {
      image: industryPhotography,
      description: "Digital cameras for professional and amateur applications"
    },
    "Mobile Phones": {
      image: industryMobile,
      description: "Image quality testing according to VCX standards"
    },
    "Automotive & ADAS": {
      image: industryAutomotive,
      description: "Camera systems in vehicles, driver assistance and autonomous driving"
    },
    "Broadcast & HDTV": {
      image: industryBroadcast,
      description: "Video transmission, TV cameras, color-accurate reproduction"
    },
    "Security / Surveillance": {
      image: industrySecurity,
      description: "CCTV systems, video surveillance"
    },
    "Machine Vision": {
      image: industryMachineVision,
      description: "Camera systems for inspection, robotics, quality control"
    },
    "Medical / Endoscopy": {
      image: industryMedical,
      description: "Image quality in medical imaging and diagnostic systems"
    },
    "Scanning & Archiving": {
      image: industryScanning,
      description: "Quality assurance in digitization of documents, books, photos"
    },
    "iQ‑Lab Testing": {
      image: industryLabTesting,
      description: "Independent laboratory services for numerous industries (e.g. Mobile, Automotive)"
    }
  };

  // Product data mapping
  const productData = {
    "Test Charts": {
      image: "/images/custom-chart.png",
      description: "High-precision test patterns and color charts for comprehensive image quality analysis including multipurpose, reflective, and transparent options"
    },
    "Illumination Devices": {
      image: iqLedIllumination,
      description: "Professional LED lighting systems and uniform light sources for stable testing environments"
    },
    "Measurement Devices": {
      image: arcturusMainProduct,
      description: "Precision colorimeters, photometers and spectroradiometers for accurate optical measurements"
    },
    "Software": {
      image: iqAnalyzerIntro,
      description: "Advanced software solutions for image analysis, calibration and automated quality control"
    },
    "Accessories": {
      image: "/images/chart-case.png",
      description: "Professional accessories including mounting systems, cables, connectors and protective cases"
    },
    "Services": {
      image: trainingMobileTesting,
      description: "Comprehensive training, support, custom solutions and professional consultation services"
    }
  };

  // Solution data mapping  
  const solutionData = {
    "Camera Quality Validation": {
      image: industryPhotography,
      description: "For camera manufacturers who need precise lighting systems and test charts.",
      subline: "Suitable for: Consumer & Professional Cameras"
    },
    "ADAS Testing / Automotive Vision": {
      image: industryAutomotive,
      description: "For developers of driver assistance systems who need stable lighting conditions.",
      subline: "Suitable for: Automotive Labs, IEEE P2020"
    },
    "Test Environments for Smartphones & Displays": {
      image: industryMobile,
      description: "For OEMs and research in color reproduction and sharpness testing.",
      subline: "Suitable for: Mobile Industry, VCX Testing"
    },
    "Microscopy & Medical Imaging": {
      image: industryMedical,
      description: "For medical technology & life sciences.",
      subline: "Suitable for: Medical Devices, Endoscopy"
    },
    "ISO and IEEE Compliant Test Setups": {
      image: industryLabTesting,
      description: "For companies that need standards-compliant environments.",
      subline: "Suitable for: Standards Compliance, Labs"
    }
  };

  const solutionPackages = {
    "Arcturus HDR Test Bundle": {
      image: arcturusSetupVegaLaptop,
      description: "HDR test bundle with Arcturus LED, Vega software and test charts – ideal for Automotive & Mobile.",
      subline: "Complete package: Lighting + Software + Charts"
    },
    "Arcturus LED + Vega Software + Test Charts": {
      image: arcturusMainProduct,
      description: "Complete solution for lighting tests",
      subline: "Hardware + Software + Charts Bundle"
    },
    "Camera Calibration Package": {
      image: "/images/custom-chart.png",
      description: "Lighting system, charts, software – specially for calibrated tests",
      subline: "Complete calibration solution"
    },
    "Laboratory Complete Solution": {
      image: industryLabTesting,
      description: "For research institutions with hardware + analysis",
      subline: "Complete research lab setup"
    },
    "Spectral Measurement & Analysis Set": {
      image: iqAnalyzerIntro,
      description: "Light source + evaluation + export functions",
      subline: "Complete spectral analysis kit"
    }
  };

  // Target groups data mapping
  const targetGroupsData = {
    "Manufacturers": {
      image: industryAutomotive,
      description: "OEMs and device manufacturers who need image quality solutions for their product development",
      subline: "For: Camera manufacturers, Automotive OEMs, Consumer Electronics"
    },
    "Suppliers": {
      image: industryMachineVision,
      description: "Tier-1 and Tier-2 suppliers who validate components and systems for their customers",
      subline: "For: Automotive Suppliers, Sensor manufacturers, Component suppliers"
    },
    "Research Institutions": {
      image: industryLabTesting,
      description: "Universities and research institutes for scientific investigations and standards development",
      subline: "For: Universities, Institutes, R&D departments"
    }
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border">
      {/* Utility Navigation */}
      <div className="container mx-auto px-6 pt-5 pb-2">
        <div className="flex justify-end">
          <UtilityNavigation />
        </div>
      </div>
      
      {/* Main Navigation */}
      <div className="container mx-auto px-6 py-3 lg:py-6">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center hover:opacity-80 transition-opacity">
            <img 
              src={logoIE} 
              alt="Image Engineering" 
              className="h-10 lg:h-20 w-auto max-w-[300px] object-contain brightness-0 invert" 
              style={{ width: '300px' }}
            />
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center flex-row gap-x-8">
            <NavigationMenu>
              <NavigationMenuList className="gap-x-8">
                <NavigationMenuItem className="mx-4">
                  <NavigationMenuTrigger className="px-4 py-2 rounded-md text-lg font-medium text-white hover:bg-[#E0F2FE] hover:text-black transition-colors duration-200 bg-transparent border-none h-auto">Find Your Solution</NavigationMenuTrigger>
                  <NavigationMenuContent className="bg-white p-[20px] border-0 shadow-lg z-50">
                    <div className="flex flex-col gap-2 w-[1000px] bg-[#f3f3f3]">
                      {/* Main navigation grid */}
                        <div className="flex gap-6 p-6">
                        {/* Left Column: Industries */}
                          <div className="space-y-4 flex-1 pr-6 border-r border-border">
                          <h4 className="font-semibold mb-3 flex items-center gap-2 text-lg text-black">
                            <Building2 className="h-6 w-6" />
                            Industries
                          </h4>
                          <Link 
                            to="/automotive"
                            className="flex items-center gap-3 text-lg text-black hover:text-blue-400 transition-colors"
                            onMouseEnter={() => setHoveredIndustry("Automotive & ADAS")}
                            onMouseLeave={() => setHoveredIndustry(null)}
                          >
                            <Car className="h-5 w-5" />
                            <span>Automotive & ADAS</span>
                          </Link>
                          <div 
                            className="flex items-center gap-3 text-lg text-black hover:text-blue-400 transition-colors cursor-pointer"
                            onMouseEnter={() => setHoveredIndustry("Mobile Phones")}
                            onMouseLeave={() => setHoveredIndustry(null)}
                          >
                            <Smartphone className="h-5 w-5" />
                            <span>Smartphones & Consumer Electronics</span>
                          </div>
                          <div 
                            className="flex items-center gap-3 text-lg text-black hover:text-blue-400 transition-colors cursor-pointer"
                            onMouseEnter={() => setHoveredIndustry("Medical / Endoscopy")}
                            onMouseLeave={() => setHoveredIndustry(null)}
                          >
                            <Stethoscope className="h-5 w-5" />
                            <span>Medical Imaging</span>
                          </div>
                          <div 
                            className="flex items-center gap-3 text-lg text-black hover:text-blue-400 transition-colors cursor-pointer"
                            onMouseEnter={() => setHoveredIndustry("Security / Surveillance")}
                            onMouseLeave={() => setHoveredIndustry(null)}
                          >
                            <Shield className="h-5 w-5" />
                            <span>Security & Surveillance</span>
                          </div>
                          <div 
                            className="flex items-center gap-3 text-lg text-black hover:text-blue-400 transition-colors cursor-pointer"
                            onMouseEnter={() => setHoveredIndustry("Broadcast & HDTV")}
                            onMouseLeave={() => setHoveredIndustry(null)}
                          >
                            <Tv className="h-5 w-5" />
                            <span>Broadcast & Film</span>
                          </div>
                          <div 
                            className="flex items-center gap-3 text-lg text-black hover:text-blue-400 transition-colors cursor-pointer"
                            onMouseEnter={() => setHoveredIndustry("iQ‑Lab Testing")}
                            onMouseLeave={() => setHoveredIndustry(null)}
                          >
                            <GraduationCap className="h-5 w-5" />
                            <span>Research & Academia</span>
                          </div>
                        </div>
                        
                        
                        {/* Right Column: Popular Applications */}
                          <div className="space-y-4 flex-1">
                          <h4 className="font-semibold mb-3 flex items-center gap-2 text-lg text-black">
                            <Target className="h-6 w-6" />
                            Popular Applications
                          </h4>
                          <div 
                            className="flex items-center gap-3 text-lg text-black hover:text-blue-400 transition-colors cursor-pointer"
                            onMouseEnter={() => setHoveredSolution("Camera Quality Validation")}
                            onMouseLeave={() => setHoveredSolution(null)}
                          >
                            <CheckCircle className="h-5 w-5" />
                            <span>Camera Quality Validation</span>
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
                            onMouseEnter={() => setHoveredSolution("Test Environments for Smartphones & Displays")}
                            onMouseLeave={() => setHoveredSolution(null)}
                          >
                            <CheckCircle className="h-5 w-5" />
                            <span>Test Environments for Smartphones & Displays</span>
                          </div>
                          <div 
                            className="flex items-center gap-3 text-lg text-black hover:text-blue-400 transition-colors cursor-pointer"
                            onMouseEnter={() => setHoveredSolution("Microscopy & Medical Imaging")}
                            onMouseLeave={() => setHoveredSolution(null)}
                          >
                            <CheckCircle className="h-5 w-5" />
                            <span>Microscopy & Medical Imaging</span>
                          </div>
                          <div 
                            className="flex items-center gap-3 text-lg text-black hover:text-blue-400 transition-colors cursor-pointer"
                            onMouseEnter={() => setHoveredSolution("ISO and IEEE Compliant Test Setups")}
                            onMouseLeave={() => setHoveredSolution(null)}
                          >
                            <CheckCircle className="h-5 w-5" />
                            <span>ISO and IEEE Compliant Test Setups</span>
                          </div>
                        </div>
                      </div>
                      
                       {/* Solution-Finder CTA */}
                      <div className="bg-[#f3f3f3] px-6 pt-6 pb-6">
                        <div className="flex items-center justify-center transition-colors cursor-pointer">
                          <Button variant="decision" className="w-full">
                            <Search className="h-5 w-5 mr-3" />
                            <span className="text-lg font-medium">Need Help Choosing? → Start Solution Finder</span>
                          </Button>
                        </div>
                      </div>
                      
                      {/* Image and description section */}
                      {(hoveredIndustry && industryData[hoveredIndustry as keyof typeof industryData]) && (
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
                    <NavigationMenuTrigger className="px-4 py-2 rounded-md text-lg font-medium text-white hover:bg-[#E0F2FE] hover:text-black transition-colors duration-200 bg-transparent border-none h-auto">Industries</NavigationMenuTrigger>
                  </Link>
                  <NavigationMenuContent className="bg-white p-[20px] border-0 shadow-none">
                    <div className="flex flex-col gap-2 w-[800px] bg-[#f3f3f3]">
                      {/* Main navigation grid */}
                      <div className="flex gap-8 p-6 h-[200px]">
                        <div className="space-y-4 flex-1">
                          <div 
                            className="flex items-center gap-3 text-lg text-black hover:text-blue-400 transition-colors cursor-pointer"
                            onMouseEnter={() => setHoveredIndustry("Photography")}
                            onMouseLeave={() => setHoveredIndustry(null)}
                          >
                            <Camera className="h-6 w-6" />
                            <span>Photography</span>
                          </div>
                          <div 
                            className="flex items-center gap-3 text-lg text-black hover:text-blue-400 transition-colors cursor-pointer"
                            onMouseEnter={() => setHoveredIndustry("Mobile Phones")}
                            onMouseLeave={() => setHoveredIndustry(null)}
                          >
                            <Smartphone className="h-6 w-6" />
                            <span>Mobile Phones</span>
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
                            onMouseEnter={() => setHoveredIndustry("Security / Surveillance")}
                            onMouseLeave={() => setHoveredIndustry(null)}
                          >
                            <Shield className="h-6 w-6" />
                            <span>Security / Surveillance</span>
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
                            onMouseEnter={() => setHoveredIndustry("Medical / Endoscopy")}
                            onMouseLeave={() => setHoveredIndustry(null)}
                          >
                            <Stethoscope className="h-6 w-6" />
                            <span>Medical / Endoscopy</span>
                          </div>
                          <div 
                            className="flex items-center gap-3 text-lg text-black hover:text-blue-400 transition-colors cursor-pointer"
                            onMouseEnter={() => setHoveredIndustry("Scanning & Archiving")}
                            onMouseLeave={() => setHoveredIndustry(null)}
                          >
                            <ScanLine className="h-6 w-6" />
                            <span>Scanning & Archiving</span>
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
                    <NavigationMenuTrigger className="px-4 py-2 rounded-md text-lg font-medium text-white hover:bg-[#E0F2FE] hover:text-black transition-colors duration-200 bg-transparent border-none h-auto">Products</NavigationMenuTrigger>
                  </Link>
                  <NavigationMenuContent className="bg-white p-[20px] border-0 shadow-lg z-50">
                    <div className="flex flex-col gap-2 w-[800px] bg-[#f3f3f3]">
                      {/* Main navigation grid - Two column layout */}
                      <div className="flex gap-8 p-6">
                        {/* Left Column: Product Groups */}
                        <div className="space-y-4 flex-1">
                          <h4 className="font-semibold mb-3 flex items-center gap-2 text-lg text-black">
                            <Package className="h-6 w-6" />
                            Product Groups
                          </h4>
                          <Link
                            to="/products/charts"
                            className="flex items-center gap-3 text-lg text-black hover:text-blue-400 transition-colors"
                            onMouseEnter={() => setHoveredProduct("Test Charts")}
                            onMouseLeave={() => setHoveredProduct(null)}
                          >
                            <Target className="h-5 w-5" />
                            <span>Test Charts</span>
                          </Link>
                          <div 
                            className="flex items-center gap-3 text-lg text-black hover:text-blue-400 transition-colors cursor-pointer"
                            onMouseEnter={() => setHoveredProduct("Illumination Devices")}
                            onMouseLeave={() => setHoveredProduct(null)}
                          >
                            <Lightbulb className="h-5 w-5" />
                            <span>Illumination Devices</span>
                          </div>
                          <div 
                            className="flex items-center gap-3 text-lg text-black hover:text-blue-400 transition-colors cursor-pointer"
                            onMouseEnter={() => setHoveredProduct("Measurement Devices")}
                            onMouseLeave={() => setHoveredProduct(null)}
                          >
                            <Camera className="h-5 w-5" />
                            <span>Measurement Devices</span>
                          </div>
                          <div 
                            className="flex items-center gap-3 text-lg text-black hover:text-blue-400 transition-colors cursor-pointer"
                            onMouseEnter={() => setHoveredProduct("Software")}
                            onMouseLeave={() => setHoveredProduct(null)}
                          >
                            <Monitor className="h-5 w-5" />
                            <span>Software</span>
                          </div>
                          <div 
                            className="flex items-center gap-3 text-lg text-black hover:text-blue-400 transition-colors cursor-pointer"
                            onMouseEnter={() => setHoveredProduct("Accessories")}
                            onMouseLeave={() => setHoveredProduct(null)}
                          >
                            <Puzzle className="h-5 w-5" />
                            <span>Accessories</span>
                          </div>
                          <div 
                            className="flex items-center gap-3 text-lg text-black hover:text-blue-400 transition-colors cursor-pointer"
                            onMouseEnter={() => setHoveredProduct("Services")}
                            onMouseLeave={() => setHoveredProduct(null)}
                          >
                            <GraduationCap className="h-5 w-5" />
                            <span>Services</span>
                          </div>
                        </div>
                        
                        {/* Right Column: Subgroups (placeholder for now) */}
                        <div className="space-y-4 flex-1">
                          <h4 className="font-semibold mb-3 flex items-center gap-2 text-lg text-black">
                            <ChevronRight className="h-6 w-6" />
                            Subgroups
                          </h4>
                          <div className="text-gray-500 italic">
                            Hover over a product group to see subcategories
                          </div>
                          {/* Test Charts subgroups */}
                          {hoveredProduct === "Test Charts" && (
                            <div className="space-y-2">
                              <Link to="/products/charts/multipurpose" className="block text-lg text-black hover:text-blue-400 transition-colors cursor-pointer">Multipurpose</Link>
                              <Link to="/products/charts/reflective" className="block text-lg text-black hover:text-blue-400 transition-colors cursor-pointer">Reflective</Link>
                              <Link to="/products/charts/transparent" className="block text-lg text-black hover:text-blue-400 transition-colors cursor-pointer">Transparent</Link>
                              <Link to="/products/charts/hdr" className="block text-lg text-black hover:text-blue-400 transition-colors cursor-pointer">HDR Testing</Link>
                            </div>
                          )}
                          {/* Illumination Devices subgroups */}
                          {hoveredProduct === "Illumination Devices" && (
                            <div className="space-y-2">
                              <Link to="/products/illumination/led" className="block text-lg text-black hover:text-blue-400 transition-colors cursor-pointer">LED Illumination</Link>
                              <Link to="/products/illumination/uniform" className="block text-lg text-black hover:text-blue-400 transition-colors cursor-pointer">Uniform Light Sources</Link>
                              <Link to="/products/illumination/specialized" className="block text-lg text-black hover:text-blue-400 transition-colors cursor-pointer">Specialized Lighting</Link>
                            </div>
                          )}
                          {/* Measurement Devices subgroups */}
                          {hoveredProduct === "Measurement Devices" && (
                            <div className="space-y-2">
                              <Link to="/products/measurement/colorimeters" className="block text-lg text-black hover:text-blue-400 transition-colors cursor-pointer">Colorimeters</Link>
                              <Link to="/products/measurement/photometers" className="block text-lg text-black hover:text-blue-400 transition-colors cursor-pointer">Photometers</Link>
                              <Link to="/products/measurement/spectroradiometers" className="block text-lg text-black hover:text-blue-400 transition-colors cursor-pointer">Spectroradiometers</Link>
                            </div>
                          )}
                          {/* Software subgroups */}
                          {hoveredProduct === "Software" && (
                            <div className="space-y-2">
                              <Link to="/products/software/analysis" className="block text-lg text-black hover:text-blue-400 transition-colors cursor-pointer">Analysis Software</Link>
                              <Link to="/products/software/measurement" className="block text-lg text-black hover:text-blue-400 transition-colors cursor-pointer">Measurement Tools</Link>
                              <Link to="/products/software/automation" className="block text-lg text-black hover:text-blue-400 transition-colors cursor-pointer">Automation Suite</Link>
                            </div>
                          )}
                          {/* Accessories subgroups */}
                          {hoveredProduct === "Accessories" && (
                            <div className="space-y-2">
                              <Link to="/products/accessories/mounting" className="block text-lg text-black hover:text-blue-400 transition-colors cursor-pointer">Mounting Systems</Link>
                              <Link to="/products/accessories/cables" className="block text-lg text-black hover:text-blue-400 transition-colors cursor-pointer">Cables & Connectors</Link>
                              <Link to="/products/accessories/cases" className="block text-lg text-black hover:text-blue-400 transition-colors cursor-pointer">Protective Cases</Link>
                            </div>
                          )}
                          {/* Services subgroups */}
                          {hoveredProduct === "Services" && (
                            <div className="space-y-2">
                              <Link to="/services/training" className="block text-lg text-black hover:text-blue-400 transition-colors cursor-pointer">Training & Support</Link>
                              <Link to="/services/custom" className="block text-lg text-black hover:text-blue-400 transition-colors cursor-pointer">Custom Solutions</Link>
                              <Link to="/services/consultation" className="block text-lg text-black hover:text-blue-400 transition-colors cursor-pointer">Consultation</Link>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Lab View CTA */}
                      <div className="bg-[#f3f3f3] px-6 pt-6 pb-6">
                        <Link to="/inside-lab">
                          <div className="flex items-center justify-center transition-colors cursor-pointer">
                            <Button variant="technical" className="w-full">
                              <Microscope className="h-5 w-5 mr-3" />
                              <span className="text-lg font-medium">Inside the Testing Lab</span>
                            </Button>
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
                  <NavigationMenuTrigger className="px-4 py-2 rounded-md text-lg font-medium text-white hover:bg-[#E0F2FE] hover:text-black transition-colors duration-200 bg-transparent border-none h-auto">Resources</NavigationMenuTrigger>
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
                            <a href="#">Documentation</a>
                          </div>
                          <div className="flex items-center gap-3 text-lg text-black hover:text-blue-400 transition-colors cursor-pointer">
                            <BookOpen className="h-5 w-5" />
                            <a href="#">White Papers</a>
                          </div>
                        </div>


                        {/* Column 2: Support & Help */}
                          <div className="space-y-4 flex-1 pr-6 border-r border-border">
                          <h4 className="font-semibold mb-3 flex items-center gap-2 text-lg text-black">
                            <Wrench className="h-6 w-6" />
                            Support & Help
                          </h4>
                          <div className="flex items-center gap-3 text-lg text-black hover:text-blue-400 transition-colors cursor-pointer">
                            <Lightbulb className="h-5 w-5" />
                            <a href="#">Knowledge Base</a>
                          </div>
                          <div className="flex items-center gap-3 text-lg text-black hover:text-blue-400 transition-colors cursor-pointer">
                            <Wrench className="h-5 w-5" />
                            <a href="#">Technical Support</a>
                          </div>
                          <div className="flex items-center gap-3 text-lg text-black hover:text-blue-400 transition-colors cursor-pointer">
                            <Users className="h-5 w-5" />
                            <a href="#">Community</a>
                          </div>
                        </div>


                        {/* Column 3: Additional Resources */}
                        <div className="space-y-4 flex-1">
                          <h4 className="font-semibold mb-3 flex items-center gap-2 text-lg text-black">
                            <Info className="h-6 w-6" />
                            Additional Resources
                          </h4>
                          <div className="flex items-center gap-3 text-lg text-black hover:text-blue-400 transition-colors cursor-pointer">
                            <Video className="h-5 w-5" />
                            <a href="#">Tutorials & Video Guides</a>
                          </div>
                          <div className="flex items-center gap-3 text-lg text-black hover:text-blue-400 transition-colors cursor-pointer">
                            <Link2 className="h-5 w-5" />
                            <a href="#">API Documentation</a>
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
                          <div className="flex items-center justify-center transition-colors cursor-pointer">
                            <Button variant="technical" className="w-full">
                              <Search className="h-5 w-5 mr-3" />
                              <span className="text-lg font-medium">To Download Center</span>
                            </Button>
                          </div>
                        </Link>
                      </div>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem className="mx-4">
                  <NavigationMenuTrigger className="px-4 py-2 rounded-md text-lg font-medium text-white hover:bg-[#E0F2FE] hover:text-black transition-colors duration-200 bg-transparent border-none h-auto">About Us</NavigationMenuTrigger>
                  <NavigationMenuContent className="bg-white p-[20px] border-0 shadow-lg z-50">
                    <div className="flex flex-col gap-2 w-[1000px] bg-[#f3f3f3]">
                      {/* Main grid */}
                      <div className="flex gap-6 p-6">
                        {/* Column 1: Contact & Location */}
                         <div className="space-y-4 flex-1 pr-6 border-r border-border">
                          <h4 className="font-semibold mb-3 flex items-center gap-2 text-lg text-black">
                            <Building2 className="h-6 w-6" />
                            Contact & Location
                          </h4>
                          <div className="flex items-center gap-3 text-lg text-black hover:text-blue-400 transition-colors cursor-pointer">
                            <MessageCircle className="h-5 w-5" />
                            <a href="#">Contact</a>
                          </div>
                          <div className="flex items-center gap-3 text-lg text-black hover:text-blue-400 transition-colors cursor-pointer">
                            <MapPin className="h-5 w-5" />
                            <a href="#">Visit Us</a>
                          </div>
                          <div className="flex items-center gap-3 text-lg text-black hover:text-blue-400 transition-colors cursor-pointer">
                            <Building className="h-5 w-5" />
                            <a href="#">Dealers / Resellers</a>
                          </div>
                          <Link to="/events" className="flex items-center gap-3 text-lg text-black hover:text-blue-400 transition-colors">
                            <Calendar className="h-5 w-5" />
                            <span>Events</span>
                          </Link>
                        </div>


                        {/* Column 2: About the Company */}
                         <div className="space-y-4 flex-1 pr-6 border-r border-border">
                          <div className="flex items-center gap-3 text-lg text-black hover:text-blue-400 transition-colors cursor-pointer">
                            <Info className="h-5 w-5" />
                            <a href="#about">About Image Engineering</a>
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
                            <a href="#">Job Opportunities</a>
                          </div>
                          <div className="flex items-center gap-3 text-lg text-black hover:text-blue-400 transition-colors cursor-pointer">
                            <Handshake className="h-5 w-5" />
                            <a href="#">Memberships & Partnerships</a>
                          </div>
                        </div>

                        

                        {/* Column 3: Quality & Sustainability */}
                        <div className="space-y-4 flex-1">
                          <div className="flex items-center gap-3 text-lg text-black hover:text-blue-400 transition-colors cursor-pointer">
                            <BadgeCheck className="h-5 w-5" />
                            <a href="#" aria-label="Quality Management">{/* TODO: link to /company/quality-management when route exists */}Quality Management</a>
                          </div>
                          <div className="flex items-center gap-3 text-lg text-black hover:text-blue-400 transition-colors cursor-pointer">
                            <Leaf className="h-5 w-5" />
                            <a href="#" aria-label="Climate Neutrality">{/* TODO: link to /company/climate-neutrality when route exists */}Climate Neutrality</a>
                          </div>
                          <div className="flex items-center gap-3 text-lg text-black hover:text-blue-400 transition-colors cursor-pointer">
                            <Sprout className="h-5 w-5" />
                            <a href="#" aria-label="ESG – Sustainability">{/* TODO: link to /company/esg-sustainability when route exists */}ESG – Sustainability</a>
                          </div>
                          <div className="flex items-center gap-3 text-lg text-black hover:text-blue-400 transition-colors cursor-pointer">
                            <Recycle className="h-5 w-5" />
                            <a href="#" aria-label="Disposal & Recycling">{/* TODO: link to /company/disposal-recycling when route exists */}Disposal & Recycling</a>
                          </div>
                        </div>
                      </div>

                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
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

                    {/* Industries */}
                    <AccordionItem value="industries">
                      <AccordionTrigger className="px-4 py-3 text-base">
                        <div className="flex items-center gap-3">
                          <Building2 className="w-5 h-5 shrink-0 text-muted-foreground" />
                          <span className="text-foreground">Industries</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-2 pt-2">
                          <ul className="space-y-1">
                            <li>
                              <Link to="/industries" className="min-h-12 px-4 flex items-center gap-3 py-3">
                                <Camera className="w-5 h-5 shrink-0 text-muted-foreground" />
                                <span className="text-foreground">Photography</span>
                              </Link>
                            </li>
                            <li>
                              <Link to="/industries" className="min-h-12 px-4 flex items-center gap-3 py-3">
                                <Smartphone className="w-5 h-5 shrink-0 text-muted-foreground" />
                                <span className="text-foreground">Mobile Phones</span>
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
                                <span className="text-foreground">Security / Surveillance</span>
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
                                <span className="text-foreground">Medical / Endoscopy</span>
                              </Link>
                            </li>
                            <li>
                              <Link to="/industries" className="min-h-12 px-4 flex items-center gap-3 py-3">
                                <ScanLine className="w-5 h-5 shrink-0 text-muted-foreground" />
                                <span className="text-foreground">Scanning & Archiving</span>
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

                    {/* Products */}
                    <AccordionItem value="products">
                      <AccordionTrigger className="px-4 py-3 text-base">
                        <div className="flex items-center gap-3">
                          <Package className="w-5 h-5 shrink-0 text-muted-foreground" />
                          <span className="text-foreground">Products</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-2 pt-2">
                          <ul className="space-y-1">
                            <li>
                              <Link to="/products/charts" className="min-h-12 px-4 flex items-center gap-3 py-3 hover:bg-accent rounded-md transition-colors"><Target className="w-5 h-5 shrink-0 text-muted-foreground" /><span className="text-foreground">Charts</span></Link>
                            </li>
                            <li>
                              <div className="min-h-12 px-4 flex items-center gap-3 py-3"><Camera className="w-5 h-5 shrink-0 text-muted-foreground" /><span className="text-foreground">Equipment</span></div>
                            </li>
                            <li>
                              <div className="min-h-12 px-4 flex items-center gap-3 py-3"><Monitor className="w-5 h-5 shrink-0 text-muted-foreground" /><span className="text-foreground">Software</span></div>
                            </li>
                            <li>
                              <div className="min-h-12 px-4 flex items-center gap-3 py-3"><Package className="w-5 h-5 shrink-0 text-muted-foreground" /><span className="text-foreground">Product Bundles</span></div>
                            </li>
                            <li>
                              <div className="min-h-12 px-4 flex items-center gap-3 py-3"><Lightbulb className="w-5 h-5 shrink-0 text-muted-foreground" /><span className="text-foreground">Solutions</span></div>
                            </li>
                            <li>
                              <div className="min-h-12 px-4 flex items-center gap-3 py-3"><Puzzle className="w-5 h-5 shrink-0 text-muted-foreground" /><span className="text-foreground">Accessories</span></div>
                            </li>
                            <li>
                              <div className="min-h-12 px-4 flex items-center gap-3 py-3"><Cpu className="w-5 h-5 shrink-0 text-muted-foreground" /><span className="text-foreground">Technology</span></div>
                            </li>
                            <li>
                              <div className="min-h-12 px-4 flex items-center gap-3 py-3"><GraduationCap className="w-5 h-5 shrink-0 text-muted-foreground" /><span className="text-foreground">Training</span></div>
                            </li>
                          </ul>
                          <Button className="w-full h-12 mt-4 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90">Inside the Lab – Real Test Setups</Button>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    {/* Resources */}
                    <AccordionItem value="resources">
                      <AccordionTrigger className="px-4 py-3 text-base">
                        <div className="flex items-center gap-3">
                          <Download className="w-5 h-5 shrink-0 text-muted-foreground" />
                          <span className="text-foreground">Resources</span>
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
                                <div className="min-h-12 px-4 flex items-center gap-3 py-3"><FileText className="w-5 h-5 shrink-0 text-muted-foreground" /><span className="text-foreground">Documentation</span></div>
                              </li>
                              <li>
                                <div className="min-h-12 px-4 flex items-center gap-3 py-3"><BookOpen className="w-5 h-5 shrink-0 text-muted-foreground" /><span className="text-foreground">White Papers</span></div>
                              </li>
                            </ul>
                          </div>
                          <Separator />
                          <div>
                            <h4 className="font-medium mb-2 px-4">Support & Help</h4>
                            <ul className="space-y-1">
                              <li>
                                <div className="min-h-12 px-4 flex items-center gap-3 py-3"><Lightbulb className="w-5 h-5 shrink-0 text-muted-foreground" /><span className="text-foreground">Knowledge Base</span></div>
                              </li>
                              <li>
                                <div className="min-h-12 px-4 flex items-center gap-3 py-3"><Wrench className="w-5 h-5 shrink-0 text-muted-foreground" /><span className="text-foreground">Technical Support</span></div>
                              </li>
                              <li>
                                <div className="min-h-12 px-4 flex items-center gap-3 py-3"><Users className="w-5 h-5 shrink-0 text-muted-foreground" /><span className="text-foreground">Community</span></div>
                              </li>
                            </ul>
                          </div>
                          <Separator />
                          <div>
                            <h4 className="font-medium mb-2 px-4">Additional Resources</h4>
                            <ul className="space-y-1">
                              <li>
                                <div className="min-h-12 px-4 flex items-center gap-3 py-3"><Video className="w-5 h-5 shrink-0 text-muted-foreground" /><span className="text-foreground">Tutorials & Video Guides</span></div>
                              </li>
                              <li>
                                <div className="min-h-12 px-4 flex items-center gap-3 py-3"><Link2 className="w-5 h-5 shrink-0 text-muted-foreground" /><span className="text-foreground">API Documentation</span></div>
                              </li>
                              <li>
                                <div className="min-h-12 px-4 flex items-center gap-3 py-3"><ScrollText className="w-5 h-5 shrink-0 text-muted-foreground" /><span className="text-foreground">Release Notes</span></div>
                              </li>
                            </ul>
                          </div>
                          <Button className="w-full h-12 mt-4 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90">To Download Center →</Button>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    {/* About Us */}
                    <AccordionItem value="about">
                      <AccordionTrigger className="px-4 py-3 text-base">
                        <div className="flex items-center gap-3">
                          <Info className="w-5 h-5 shrink-0 text-muted-foreground" />
                          <span className="text-foreground">About Us</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="pt-2">
                          <ul className="space-y-1">
                            <li>
                              <div className="min-h-12 px-4 flex items-center gap-3 py-3"><MessageCircle className="w-5 h-5 shrink-0 text-muted-foreground" /><span className="text-foreground">Contact</span></div>
                            </li>
                            <li>
                              <div className="min-h-12 px-4 flex items-center gap-3 py-3"><MapPin className="w-5 h-5 shrink-0 text-muted-foreground" /><span className="text-foreground">Visit Us</span></div>
                            </li>
                            <li>
                              <div className="min-h-12 px-4 flex items-center gap-3 py-3"><Building className="w-5 h-5 shrink-0 text-muted-foreground" /><span className="text-foreground">Dealers / Resellers</span></div>
                            </li>
                            <li>
                              <Link to="/events" className="min-h-12 px-4 flex items-center gap-3 py-3"><Calendar className="w-5 h-5 shrink-0 text-muted-foreground" /><span className="text-foreground">Events</span></Link>
                            </li>
                            <li>
                              <div className="min-h-12 px-4 flex items-center gap-3 py-3"><Info className="w-5 h-5 shrink-0 text-muted-foreground" /><span className="text-foreground">About Image Engineering</span></div>
                            </li>
                            <li>
                              <div className="min-h-12 px-4 flex items-center gap-3 py-3"><Users className="w-5 h-5 shrink-0 text-muted-foreground" /><span className="text-foreground">Team</span></div>
                            </li>
                            <li>
                              <div className="min-h-12 px-4 flex items-center gap-3 py-3"><Building2 className="w-5 h-5 shrink-0 text-muted-foreground" /><span className="text-foreground">Nynomic Group</span></div>
                            </li>
                            <li>
                              <div className="min-h-12 px-4 flex items-center gap-3 py-3"><Briefcase className="w-5 h-5 shrink-0 text-muted-foreground" /><span className="text-foreground">Job Opportunities</span></div>
                            </li>
                            <li>
                              <div className="min-h-12 px-4 flex items-center gap-3 py-3"><Handshake className="w-5 h-5 shrink-0 text-muted-foreground" /><span className="text-foreground">Memberships & Partnerships</span></div>
                            </li>
                            <li>
                              <Link to="#" aria-label="Quality Management" className="flex items-center gap-3 px-4 py-3 rounded-md hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                                <BadgeCheck className="w-[18px] h-[18px] shrink-0 text-muted-foreground" />
                                <span className="text-[15px] leading-5 text-foreground">Quality Management</span>
                              </Link>
                            </li>
                            <li>
                              <Link to="#" aria-label="Climate Neutrality" className="flex items-center gap-3 px-4 py-3 rounded-md hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                                <Leaf className="w-[18px] h-[18px] shrink-0 text-muted-foreground" />
                                <span className="text-[15px] leading-5 text-foreground">Climate Neutrality</span>
                              </Link>
                            </li>
                            <li>
                              <Link to="#" aria-label="ESG – Sustainability" className="flex items-center gap-3 px-4 py-3 rounded-md hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                                <Sprout className="w-[18px] h-[18px] shrink-0 text-muted-foreground" />
                                <span className="text-[15px] leading-5 text-foreground">ESG – Sustainability</span>
                              </Link>
                            </li>
                            <li>
                              <Link to="#" aria-label="Disposal & Recycling" className="flex items-center gap-3 px-4 py-3 rounded-md hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                                <Recycle className="w-[18px] h-[18px] shrink-0 text-muted-foreground" />
                                <span className="text-[15px] leading-5 text-foreground">Disposal & Recycling</span>
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
