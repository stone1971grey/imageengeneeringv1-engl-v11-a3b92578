import { Button } from "@/components/ui/button";
import { Menu, X, Camera, Wrench, Building2, Download, Info, MessageCircle, Smartphone, Car, Tv, Shield, Cog, Stethoscope, ScanLine, FlaskConical, Monitor, Zap, Package, Lightbulb, Puzzle, Cpu, CheckCircle, Microscope, Target, BarChart3, Settings, Search, Users, Building, GraduationCap, FileText, BookOpen, Video, Link2, ScrollText, Phone, MapPin, Calendar, Briefcase, Handshake, Leaf, Recycle, ShieldCheck, ChevronRight, ChevronDown } from "lucide-react";
import { BadgeCheck, Sprout } from "lucide-react";
import { CustomTargetIcon } from "./CustomTargetIcon";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import logoIE from "@/assets/logo-ie.png";
import UtilityNavigation from "@/components/UtilityNavigation";
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
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

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
    "In-Cabin Performance Testing": {
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
    <nav className="fixed top-0 w-full z-50 bg-[#4B4A4A] border-b border-[#4B4A4A]">
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
          <div className="hidden lg:flex items-center">
            <div className="flex items-center gap-x-8">
              
              {/* Find Your Solution Dropdown */}
              <div 
                className="relative group"
                onMouseEnter={() => setActiveDropdown('findSolution')}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <button className="flex items-center gap-1 px-4 py-2 rounded-md text-lg font-medium text-white hover:bg-[#d9c409] hover:text-black transition-colors duration-200 bg-transparent border-none h-auto">
                  Find Your Solution
                  <ChevronDown className="h-4 w-4" />
                </button>
                
                <div className={`absolute top-full left-0 mt-2 bg-white border-0 shadow-lg z-[100] p-5 transition-all duration-200 ${activeDropdown === 'findSolution' ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
                  <div className="flex gap-6 bg-[#f3f3f3] p-6">
                    {/* Left Column: Industries */}
                    <div className="w-[300px] pr-4 border-r border-border">
                      <h4 className="font-semibold mb-3 text-lg text-black">Industries</h4>
                      <div className="space-y-3">
                        <div 
                          className="flex items-center gap-3 text-lg text-black hover:text-[#d9c409] transition-colors cursor-pointer"
                          onMouseEnter={() => setHoveredIndustry("Photography")}
                          onMouseLeave={() => setHoveredIndustry(null)}
                        >
                          <Camera className="h-5 w-5" />
                          <span>Photography</span>
                        </div>
                        <div 
                          className="flex items-center gap-3 text-lg text-black hover:text-[#d9c409] transition-colors cursor-pointer"
                          onMouseEnter={() => setHoveredIndustry("Mobile Phones")}
                          onMouseLeave={() => setHoveredIndustry(null)}
                        >
                          <Smartphone className="h-5 w-5" />
                          <span>Mobile Phones</span>
                        </div>
                        <Link 
                          to="/automotive"
                          className="flex items-center gap-3 text-lg text-black hover:text-[#d9c409] transition-colors bg-green-100 p-2 rounded-md border-2 border-green-300"
                          onMouseEnter={() => setHoveredIndustry("Automotive & ADAS")}
                          onMouseLeave={() => setHoveredIndustry(null)}
                        >
                          <Car className="h-5 w-5" />
                          <span>Automotive & ADAS</span>
                          <span className="ml-2 text-xs bg-green-200 text-green-800 px-2 py-1 rounded">ACTIVE</span>
                        </Link>
                        <div 
                          className="flex items-center gap-3 text-lg text-black hover:text-[#d9c409] transition-colors cursor-pointer"
                          onMouseEnter={() => setHoveredIndustry("Broadcast & HDTV")}
                          onMouseLeave={() => setHoveredIndustry(null)}
                        >
                          <Tv className="h-5 w-5" />
                          <span>Broadcast & HDTV</span>
                        </div>
                        <div 
                          className="flex items-center gap-3 text-lg text-black hover:text-[#d9c409] transition-colors cursor-pointer"
                          onMouseEnter={() => setHoveredIndustry("Security / Surveillance")}
                          onMouseLeave={() => setHoveredIndustry(null)}
                        >
                          <Shield className="h-5 w-5" />
                          <span>Security / Surveillance</span>
                        </div>
                        <div 
                          className="flex items-center gap-3 text-lg text-black hover:text-[#d9c409] transition-colors cursor-pointer"
                          onMouseEnter={() => setHoveredIndustry("Machine Vision")}
                          onMouseLeave={() => setHoveredIndustry(null)}
                        >
                          <Cog className="h-5 w-5" />
                          <span>Machine Vision</span>
                        </div>
                        <div 
                          className="flex items-center gap-3 text-lg text-black hover:text-[#d9c409] transition-colors cursor-pointer"
                          onMouseEnter={() => setHoveredIndustry("Medical / Endoscopy")}
                          onMouseLeave={() => setHoveredIndustry(null)}
                        >
                          <Stethoscope className="h-5 w-5" />
                          <span>Medical / Endoscopy</span>
                        </div>
                        <div 
                          className="flex items-center gap-3 text-lg text-black hover:text-[#d9c409] transition-colors cursor-pointer"
                          onMouseEnter={() => setHoveredIndustry("Scanning & Archiving")}
                          onMouseLeave={() => setHoveredIndustry(null)}
                        >
                          <ScanLine className="h-5 w-5" />
                          <span>Scanning & Archiving</span>
                        </div>
                        <div 
                          className="flex items-center gap-3 text-lg text-black hover:text-[#d9c409] transition-colors cursor-pointer"
                          onMouseEnter={() => setHoveredIndustry("iQ‑Lab Testing")}
                          onMouseLeave={() => setHoveredIndustry(null)}
                        >
                          <FlaskConical className="h-5 w-5" />
                          <span>iQ‑Lab Testing</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Right Column: Popular Applications */}
                    <div className="w-[300px] pl-4">
                      <h4 className="font-semibold mb-3 text-lg text-black">Popular Applications</h4>
                      <div className="space-y-3">
                        <div 
                          className="flex items-center gap-3 text-lg text-black hover:text-[#d9c409] transition-colors cursor-pointer"
                          onMouseEnter={() => setHoveredSolution("Camera Quality Validation")}
                          onMouseLeave={() => setHoveredSolution(null)}
                        >
                          <CustomTargetIcon className="h-5 w-5 flex-shrink-0" />
                          <span>Camera Quality Validation</span>
                        </div>
                        <Link 
                          to="/in-cabin-testing"
                          className="flex items-center gap-3 text-lg text-black hover:text-[#d9c409] transition-colors bg-green-100 p-2 rounded-md border-2 border-green-300"
                          onMouseEnter={() => setHoveredSolution("In-Cabin Performance Testing")}
                          onMouseLeave={() => setHoveredSolution(null)}
                        >
                          <CustomTargetIcon className="h-5 w-5 flex-shrink-0" />
                          <span>In-Cabin Performance Testing</span>
                          <span className="ml-2 text-xs bg-green-200 text-green-800 px-2 py-1 rounded">ACTIVE</span>
                        </Link>
                        <div 
                          className="flex items-center gap-3 text-lg text-black hover:text-[#d9c409] transition-colors cursor-pointer"
                          onMouseEnter={() => setHoveredSolution("Test Environments for Smartphones & Displays")}
                          onMouseLeave={() => setHoveredSolution(null)}
                        >
                          <CustomTargetIcon className="h-5 w-5 flex-shrink-0" />
                          <span>Test Environments for Smartphones & Displays</span>
                        </div>
                        <div 
                          className="flex items-center gap-3 text-lg text-black hover:text-[#d9c409] transition-colors cursor-pointer"
                          onMouseEnter={() => setHoveredSolution("Microscopy & Medical Imaging")}
                          onMouseLeave={() => setHoveredSolution(null)}
                        >
                          <CustomTargetIcon className="h-5 w-5 flex-shrink-0" />
                          <span>Microscopy & Medical Imaging</span>
                        </div>
                        <div 
                          className="flex items-center gap-3 text-lg text-black hover:text-[#d9c409] transition-colors cursor-pointer"
                          onMouseEnter={() => setHoveredSolution("ISO and IEEE Compliant Test Setups")}
                          onMouseLeave={() => setHoveredSolution(null)}
                        >
                          <CustomTargetIcon className="h-5 w-5 flex-shrink-0" />
                          <span>ISO and IEEE Compliant Test Setups</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right side preview image */}
                  <div className="absolute top-0 left-full ml-4 w-[200px] h-[250px] bg-white shadow-lg border">
                    {(hoveredIndustry || hoveredSolution) && (
                      <div className="p-4 h-full flex flex-col">
                        <img
                          src={hoveredIndustry ? industryData[hoveredIndustry as keyof typeof industryData]?.image : solutionData[hoveredSolution as keyof typeof solutionData]?.image}
                          alt={hoveredIndustry || hoveredSolution || ''}
                          className="w-full h-32 object-cover rounded mb-3"
                        />
                        <h5 className="font-medium text-sm mb-2 text-black">
                          {hoveredIndustry || hoveredSolution}
                        </h5>
                        <p className="text-xs text-gray-600 flex-1">
                          {hoveredIndustry ? industryData[hoveredIndustry as keyof typeof industryData]?.description : solutionData[hoveredSolution as keyof typeof solutionData]?.description}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Products Dropdown */}
              <div 
                className="relative group"
                onMouseEnter={() => setActiveDropdown('products')}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <button className="flex items-center gap-1 px-4 py-2 rounded-md text-lg font-medium text-white hover:bg-[#d9c409] hover:text-black transition-colors duration-200 bg-transparent border-none h-auto">
                  Products
                  <ChevronDown className="h-4 w-4" />
                </button>
                
                <div className={`absolute top-full left-0 mt-2 bg-white border-0 shadow-lg z-[100] p-5 transition-all duration-200 ${activeDropdown === 'products' ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
                  <div className="flex gap-6 bg-[#f3f3f3] p-6">
                    <div className="grid grid-cols-2 gap-8 w-full">
                      <div className="space-y-4">
                        <div 
                          className="flex items-center gap-3 text-lg text-black hover:text-[#d9c409] transition-colors cursor-pointer"
                          onMouseEnter={() => setHoveredProduct("Test Charts")}
                          onMouseLeave={() => setHoveredProduct(null)}
                        >
                          <Target className="h-5 w-5" />
                          <span>Test Charts</span>
                        </div>
                        <div 
                          className="flex items-center gap-3 text-lg text-black hover:text-[#d9c409] transition-colors cursor-pointer"
                          onMouseEnter={() => setHoveredProduct("Illumination Devices")}
                          onMouseLeave={() => setHoveredProduct(null)}
                        >
                          <Lightbulb className="h-5 w-5" />
                          <span>Illumination Devices</span>
                        </div>
                        <div 
                          className="flex items-center gap-3 text-lg text-black hover:text-[#d9c409] transition-colors cursor-pointer"
                          onMouseEnter={() => setHoveredProduct("Measurement Devices")}
                          onMouseLeave={() => setHoveredProduct(null)}
                        >
                          <BarChart3 className="h-5 w-5" />
                          <span>Measurement Devices</span>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div 
                          className="flex items-center gap-3 text-lg text-black hover:text-[#d9c409] transition-colors cursor-pointer"
                          onMouseEnter={() => setHoveredProduct("Software")}
                          onMouseLeave={() => setHoveredProduct(null)}
                        >
                          <Monitor className="h-5 w-5" />
                          <span>Software</span>
                        </div>
                        <div 
                          className="flex items-center gap-3 text-lg text-black hover:text-[#d9c409] transition-colors cursor-pointer"
                          onMouseEnter={() => setHoveredProduct("Accessories")}
                          onMouseLeave={() => setHoveredProduct(null)}
                        >
                          <Package className="h-5 w-5" />
                          <span>Accessories</span>
                        </div>
                        <div 
                          className="flex items-center gap-3 text-lg text-black hover:text-[#d9c409] transition-colors cursor-pointer"
                          onMouseEnter={() => setHoveredProduct("Services")}
                          onMouseLeave={() => setHoveredProduct(null)}
                        >
                          <Settings className="h-5 w-5" />
                          <span>Services</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="absolute top-0 left-full ml-4 w-[200px] h-[250px] bg-white shadow-lg border">
                    {hoveredProduct && (
                      <div className="p-4 h-full flex flex-col">
                        <img
                          src={productData[hoveredProduct as keyof typeof productData]?.image}
                          alt={hoveredProduct}
                          className="w-full h-32 object-cover rounded mb-3"
                        />
                        <h5 className="font-medium text-sm mb-2 text-black">
                          {hoveredProduct}
                        </h5>
                        <p className="text-xs text-gray-600 flex-1">
                          {productData[hoveredProduct as keyof typeof productData]?.description}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Services Dropdown */}
              <div 
                className="relative group"
                onMouseEnter={() => setActiveDropdown('services')}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <button className="flex items-center gap-1 px-4 py-2 rounded-md text-lg font-medium text-white hover:bg-[#d9c409] hover:text-black transition-colors duration-200 bg-transparent border-none h-auto">
                  Services
                  <ChevronDown className="h-4 w-4" />
                </button>
                
                <div className={`absolute top-full left-0 mt-2 bg-white border-0 shadow-lg z-[100] p-5 transition-all duration-200 ${activeDropdown === 'services' ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
                  <div className="flex gap-6 w-[620px] bg-[#f3f3f3] p-6">
                    <div className="space-y-4 w-full">
                      <h4 className="font-semibold text-lg text-black mb-4">Our Services</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 text-lg text-black hover:text-[#d9c409] transition-colors cursor-pointer">
                          <GraduationCap className="h-5 w-5" />
                          <span>Training & Education</span>
                        </div>
                        <div className="flex items-center gap-3 text-lg text-black hover:text-[#d9c409] transition-colors cursor-pointer">
                          <Search className="h-5 w-5" />
                          <span>Consulting Services</span>
                        </div>
                        <div className="flex items-center gap-3 text-lg text-black hover:text-[#d9c409] transition-colors cursor-pointer">
                          <Wrench className="h-5 w-5" />
                          <span>Technical Support</span>
                        </div>
                        <div className="flex items-center gap-3 text-lg text-black hover:text-[#d9c409] transition-colors cursor-pointer">
                          <Puzzle className="h-5 w-5" />
                          <span>Custom Solutions</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Image Quality Dropdown - RIGHT ALIGNED */}
              <div 
                className="relative group"
                onMouseEnter={() => setActiveDropdown('imageQuality')}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <button className="flex items-center gap-1 px-4 py-2 rounded-md text-lg font-medium text-white hover:bg-[#d9c409] hover:text-black transition-colors duration-200 bg-transparent border-none h-auto">
                  Image Quality
                  <ChevronDown className="h-4 w-4" />
                </button>
                
                <div className={`absolute top-full right-0 mt-2 bg-white border-0 shadow-lg z-[100] p-5 transition-all duration-200 ${activeDropdown === 'imageQuality' ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
                  <div className="flex gap-6 w-[620px] bg-[#f3f3f3] p-6">
                    <div className="w-[300px] pr-4 border-r border-border">
                      <h4 className="font-semibold mb-3 text-lg text-black">Technical Resources</h4>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 text-lg text-black hover:text-[#d9c409] transition-colors cursor-pointer">
                          <FlaskConical className="h-4 w-4" />
                          <span>IQ-Lab</span>
                        </div>
                        <div className="flex items-center gap-3 text-lg text-black hover:text-[#d9c409] transition-colors cursor-pointer">
                          <BarChart3 className="h-4 w-4" />
                          <span>Image quality factors</span>
                        </div>
                        <div className="flex items-center gap-3 text-lg text-black hover:text-[#d9c409] transition-colors cursor-pointer">
                          <FileText className="h-4 w-4" />
                          <span>Blog</span>
                        </div>
                        <div className="flex items-center gap-3 text-lg text-black hover:text-[#d9c409] transition-colors cursor-pointer">
                          <MessageCircle className="h-4 w-4" />
                          <span>Newsletter</span>
                        </div>
                        <div className="flex items-center gap-3 text-lg text-black hover:text-[#d9c409] transition-colors cursor-pointer">
                          <ShieldCheck className="h-4 w-4" />
                          <span>International standards</span>
                        </div>
                      </div>
                    </div>

                    <div className="w-[300px] pl-4">
                      <h4 className="font-semibold mb-3 text-lg text-black">Training & Resources</h4>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 text-lg text-black hover:text-[#d9c409] transition-colors cursor-pointer">
                          <Cpu className="h-4 w-4" />
                          <span>IE Technology</span>
                        </div>
                        <div className="flex items-center gap-3 text-lg text-black hover:text-[#d9c409] transition-colors cursor-pointer">
                          <Calendar className="h-4 w-4" />
                          <span>Webinar schedule</span>
                        </div>
                        <div className="flex items-center gap-3 text-lg text-black hover:text-[#d9c409] transition-colors cursor-pointer">
                          <Video className="h-4 w-4" />
                          <span>Video Archive</span>
                        </div>
                        <div className="flex items-center gap-3 text-lg text-black hover:text-[#d9c409] transition-colors cursor-pointer">
                          <BookOpen className="h-4 w-4" />
                          <span>Whitepapers</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 px-6">
                    <button className="bg-[#0066cc] text-white px-6 py-3 rounded-md font-medium hover:bg-[#0052a3] transition-colors w-full flex items-center justify-center gap-2">
                      <Search className="h-4 w-4" />
                      Explore Image Quality Resources
                      <span className="bg-[#004d99] text-white text-xs px-2 py-1 rounded ml-2">ACTIVE</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Company Dropdown - RIGHT ALIGNED */}
              <div 
                className="relative group"
                onMouseEnter={() => setActiveDropdown('company')}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <button className="flex items-center gap-1 px-4 py-2 rounded-md text-lg font-medium text-white hover:bg-[#d9c409] hover:text-black transition-colors duration-200 bg-transparent border-none h-auto">
                  Company
                  <ChevronDown className="h-4 w-4" />
                </button>
                
                <div className={`absolute top-full right-0 mt-2 bg-white border-0 shadow-lg z-[100] p-5 transition-all duration-200 ${activeDropdown === 'company' ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
                  <div className="flex gap-6 w-[620px] bg-[#f3f3f3] p-6">
                    <div className="w-[300px] pr-4 border-r border-border">
                      <h4 className="font-semibold mb-3 text-lg text-black">Company Information</h4>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 text-lg text-black hover:text-[#d9c409] transition-colors cursor-pointer">
                          <Info className="h-4 w-4" />
                          <span>About Image Engineering</span>
                        </div>
                        <div className="flex items-center gap-3 text-lg text-black hover:text-[#d9c409] transition-colors cursor-pointer">
                          <Users className="h-4 w-4" />
                          <span>Team</span>
                        </div>
                        <div className="flex items-center gap-3 text-lg text-black hover:text-[#d9c409] transition-colors cursor-pointer">
                          <Building className="h-4 w-4" />
                          <span>Subsidiaries/Resellers</span>
                        </div>
                        <div className="flex items-center gap-3 text-lg text-black hover:text-[#d9c409] transition-colors cursor-pointer">
                          <Sprout className="h-4 w-4" />
                          <span>Nynomic Group</span>
                        </div>
                      </div>
                    </div>

                    <div className="w-[300px] pl-4">
                      <h4 className="font-semibold mb-3 text-lg text-black">Business & Partnerships</h4>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 text-lg text-black hover:text-[#d9c409] transition-colors bg-green-100 p-2 rounded-md border-2 border-green-300">
                          <Calendar className="h-4 w-4" />
                          <span>Events</span>
                          <span className="ml-2 text-xs bg-green-200 text-green-800 px-2 py-1 rounded">ACTIVE</span>
                        </div>
                        <div className="flex items-center gap-3 text-lg text-black hover:text-[#d9c409] transition-colors cursor-pointer">
                          <Briefcase className="h-4 w-4" />
                          <span>Careers</span>
                        </div>
                        <div className="flex items-center gap-3 text-lg text-black hover:text-[#d9c409] transition-colors cursor-pointer">
                          <Handshake className="h-4 w-4" />
                          <span>Partnerships</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
              className="text-white hover:bg-[#d9c409] hover:text-black"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Sheet */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="right" className="w-full max-w-md bg-white p-0">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-6 border-b">
              <img 
                src={logoIE} 
                alt="Image Engineering" 
                className="h-8 w-auto" 
              />
              <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
                <X size={20} />
              </Button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              <Accordion type="single" collapsible className="space-y-4">
                <AccordionItem value="solutions" className="border-b-0">
                  <AccordionTrigger className="text-lg font-medium hover:no-underline py-3">
                    Find Your Solution
                  </AccordionTrigger>
                  <AccordionContent className="pt-2">
                    <div className="space-y-3 pl-4">
                      <h5 className="font-medium text-base mb-2">Industries</h5>
                      <Link to="/automotive" className="flex items-center gap-2 text-base text-gray-700 py-1">
                        <Car className="h-4 w-4" />
                        Automotive & ADAS
                      </Link>
                      <div className="flex items-center gap-2 text-base text-gray-700 py-1">
                        <Camera className="h-4 w-4" />
                        Photography
                      </div>
                      <div className="flex items-center gap-2 text-base text-gray-700 py-1">
                        <Smartphone className="h-4 w-4" />
                        Mobile Phones
                      </div>
                      <div className="flex items-center gap-2 text-base text-gray-700 py-1">
                        <Stethoscope className="h-4 w-4" />
                        Medical / Endoscopy
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="products" className="border-b-0">
                  <AccordionTrigger className="text-lg font-medium hover:no-underline py-3">
                    Products
                  </AccordionTrigger>
                  <AccordionContent className="pt-2">
                    <div className="space-y-3 pl-4">
                      <div className="flex items-center gap-2 text-base text-gray-700 py-1">
                        <Target className="h-4 w-4" />
                        Test Charts
                      </div>
                      <div className="flex items-center gap-2 text-base text-gray-700 py-1">
                        <Lightbulb className="h-4 w-4" />
                        Illumination Devices
                      </div>
                      <div className="flex items-center gap-2 text-base text-gray-700 py-1">
                        <BarChart3 className="h-4 w-4" />
                        Measurement Devices
                      </div>
                      <div className="flex items-center gap-2 text-base text-gray-700 py-1">
                        <Monitor className="h-4 w-4" />
                        Software
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="services" className="border-b-0">
                  <AccordionTrigger className="text-lg font-medium hover:no-underline py-3">
                    Services
                  </AccordionTrigger>
                  <AccordionContent className="pt-2">
                    <div className="space-y-3 pl-4">
                      <div className="flex items-center gap-2 text-base text-gray-700 py-1">
                        <GraduationCap className="h-4 w-4" />
                        Training & Education
                      </div>
                      <div className="flex items-center gap-2 text-base text-gray-700 py-1">
                        <Search className="h-4 w-4" />
                        Consulting Services
                      </div>
                      <div className="flex items-center gap-2 text-base text-gray-700 py-1">
                        <Wrench className="h-4 w-4" />
                        Technical Support
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="image-quality" className="border-b-0">
                  <AccordionTrigger className="text-lg font-medium hover:no-underline py-3">
                    Image Quality
                  </AccordionTrigger>
                  <AccordionContent className="pt-2">
                    <div className="space-y-3 pl-4">
                      <div className="flex items-center gap-2 text-base text-gray-700 py-1">
                        <FlaskConical className="h-4 w-4" />
                        IQ-Lab
                      </div>
                      <div className="flex items-center gap-2 text-base text-gray-700 py-1">
                        <FileText className="h-4 w-4" />
                        Blog
                      </div>
                      <div className="flex items-center gap-2 text-base text-gray-700 py-1">
                        <Video className="h-4 w-4" />
                        Video Archive
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="company" className="border-b-0">
                  <AccordionTrigger className="text-lg font-medium hover:no-underline py-3">
                    Company
                  </AccordionTrigger>
                  <AccordionContent className="pt-2">
                    <div className="space-y-3 pl-4">
                      <div className="flex items-center gap-2 text-base text-gray-700 py-1">
                        <Info className="h-4 w-4" />
                        About Us
                      </div>
                      <div className="flex items-center gap-2 text-base text-gray-700 py-1">
                        <Users className="h-4 w-4" />
                        Team
                      </div>
                      <div className="flex items-center gap-2 text-base text-gray-700 py-1">
                        <Calendar className="h-4 w-4" />
                        Events
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>

            <div className="p-6 border-t">
              <Button className="w-full bg-[#d9c409] hover:bg-[#c4b108] text-black">
                Contact
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </nav>
  );
};

export default Navigation;