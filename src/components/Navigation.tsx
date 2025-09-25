import { Button } from "@/components/ui/button";
import { Menu, X, Camera, Wrench, Building2, Download, Info, MessageCircle, Smartphone, Car, Tv, Shield, Cog, Stethoscope, ScanLine, FlaskConical, Monitor, Zap, Package, Lightbulb, Puzzle, Cpu, CheckCircle, Microscope, Target, BarChart3, Settings, Search, Users, Building, GraduationCap, FileText, BookOpen, Video, Link2, ScrollText, Phone, MapPin, Calendar, Briefcase, Handshake, Leaf, Recycle, ShieldCheck, ChevronRight } from "lucide-react";
import { BadgeCheck, Sprout } from "lucide-react";
import { CustomTargetIcon } from "./CustomTargetIcon";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import UtilityNavigation from "@/components/UtilityNavigation";
import { SimpleDropdown } from "./SimpleNavigation";
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
    <nav className="fixed top-8 left-[320px] right-4 z-50 bg-[#4B4A4A]/95 backdrop-blur-sm rounded-xl shadow-lg border border-white/10">
      {/* Main Navigation with integrated Utility Navigation */}
      <div className="container mx-auto px-6 py-2">
        {/* Single row - utility and main nav separated */}
        <div className="flex items-center justify-between w-full">
          
          {/* Main Navigation on the left */}
          <div className="hidden lg:flex items-center gap-x-1">
            <div className="flex items-center gap-x-1">
              <SimpleDropdown trigger="Find Your Solution">
                <div className="flex flex-col gap-2 w-[600px] max-w-[90vw] bg-[#f3f3f3] rounded-lg">
                  {/* Main navigation grid */}
                  <div className="flex gap-6 p-6">
                    {/* Left Column: Industries */}
                    <div className="space-y-4 flex-1 pr-6 border-r border-border">
                      <h4 className="font-semibold mb-3 text-lg text-black">Industries</h4>
                      <div className="flex items-center gap-3 text-lg text-black hover:text-[#d9c409] transition-colors cursor-pointer"
                        onMouseEnter={() => setHoveredIndustry("Photography")}
                        onMouseLeave={() => setHoveredIndustry(null)}>
                        <Camera className="h-5 w-5" />
                        <span>Photography</span>
                      </div>
                      <div className="flex items-center gap-3 text-lg text-black hover:text-[#d9c409] transition-colors cursor-pointer"
                        onMouseEnter={() => setHoveredIndustry("Mobile Phones")}
                        onMouseLeave={() => setHoveredIndustry(null)}>
                        <Smartphone className="h-5 w-5" />
                        <span>Mobile Phones</span>
                      </div>
                      <Link to="/automotive" className="flex items-center gap-3 text-lg text-black hover:text-[#d9c409] transition-colors bg-green-100 p-2 rounded-md border-2 border-green-300"
                        onMouseEnter={() => setHoveredIndustry("Automotive & ADAS")}
                        onMouseLeave={() => setHoveredIndustry(null)}>
                        <Car className="h-5 w-5" />
                        <span>Automotive & ADAS</span>
                        <span className="ml-2 text-xs bg-green-200 text-green-800 px-2 py-1 rounded">ACTIVE</span>
                      </Link>
                      <div className="flex items-center gap-3 text-lg text-black hover:text-[#d9c409] transition-colors cursor-pointer"
                        onMouseEnter={() => setHoveredIndustry("Broadcast & HDTV")}
                        onMouseLeave={() => setHoveredIndustry(null)}>
                        <Tv className="h-5 w-5" />
                        <span>Broadcast & HDTV</span>
                      </div>
                      <div className="flex items-center gap-3 text-lg text-black hover:text-[#d9c409] transition-colors cursor-pointer"
                        onMouseEnter={() => setHoveredIndustry("Security / Surveillance")}
                        onMouseLeave={() => setHoveredIndustry(null)}>
                        <Shield className="h-5 w-5" />
                        <span>Security / Surveillance</span>
                      </div>
                      <div className="flex items-center gap-3 text-lg text-black hover:text-[#d9c409] transition-colors cursor-pointer"
                        onMouseEnter={() => setHoveredIndustry("Machine Vision")}
                        onMouseLeave={() => setHoveredIndustry(null)}>
                        <Cog className="h-5 w-5" />
                        <span>Machine Vision</span>
                      </div>
                      <div className="flex items-center gap-3 text-lg text-black hover:text-[#d9c409] transition-colors cursor-pointer"
                        onMouseEnter={() => setHoveredIndustry("Medical / Endoscopy")}
                        onMouseLeave={() => setHoveredIndustry(null)}>
                        <Stethoscope className="h-5 w-5" />
                        <span>Medical / Endoscopy</span>
                      </div>
                      <div className="flex items-center gap-3 text-lg text-black hover:text-[#d9c409] transition-colors cursor-pointer"
                        onMouseEnter={() => setHoveredIndustry("Scanning & Archiving")}
                        onMouseLeave={() => setHoveredIndustry(null)}>
                        <ScanLine className="h-5 w-5" />
                        <span>Scanning & Archiving</span>
                      </div>
                      <div className="flex items-center gap-3 text-lg text-black hover:text-[#d9c409] transition-colors cursor-pointer"
                        onMouseEnter={() => setHoveredIndustry("iQ‑Lab Testing")}
                        onMouseLeave={() => setHoveredIndustry(null)}>
                        <FlaskConical className="h-5 w-5" />
                        <span>iQ‑Lab Testing</span>
                      </div>
                    </div>
                    
                    {/* Right Column: Popular Applications */}
                    <div className="space-y-4 flex-1">
                      <h4 className="font-semibold mb-3 text-lg text-black">Popular Applications</h4>
                      <div className="flex items-center gap-3 text-lg text-black hover:text-[#d9c409] transition-colors cursor-pointer"
                        onMouseEnter={() => setHoveredSolution("Camera Quality Validation")}
                        onMouseLeave={() => setHoveredSolution(null)}>
                        <CustomTargetIcon className="h-5 w-5 flex-shrink-0" />
                        <span>Camera Quality Validation</span>
                      </div>
                      <div className="space-y-2">
                        <Link to="/in-cabin-testing" className="flex items-center gap-3 text-lg text-black hover:text-[#d9c409] transition-colors bg-green-100 p-2 rounded-md border-2 border-green-300"
                          onMouseEnter={() => setHoveredSolution("In-Cabin Performance Testing")}
                          onMouseLeave={() => setHoveredSolution(null)}>
                          <CustomTargetIcon className="h-5 w-5 flex-shrink-0" />
                          <span>In-Cabin Performance Testing</span>
                          <span className="ml-2 text-xs bg-green-200 text-green-800 px-2 py-1 rounded">ACTIVE</span>
                        </Link>
                      </div>
                      <div className="flex items-center gap-3 text-lg text-black hover:text-[#d9c409] transition-colors cursor-pointer"
                        onMouseEnter={() => setHoveredSolution("Test Environments for Smartphones & Displays")}
                        onMouseLeave={() => setHoveredSolution(null)}>
                        <CustomTargetIcon className="h-5 w-5 flex-shrink-0" />
                        <span>Test Environments for Smartphones & Displays</span>
                      </div>
                      <div className="flex items-center gap-3 text-lg text-black hover:text-[#d9c409] transition-colors cursor-pointer"
                        onMouseEnter={() => setHoveredSolution("Microscopy & Medical Imaging")}
                        onMouseLeave={() => setHoveredSolution(null)}>
                        <CustomTargetIcon className="h-5 w-5 flex-shrink-0" />
                        <span>Microscopy & Medical Imaging</span>
                      </div>
                      <div className="flex items-center gap-3 text-lg text-black hover:text-[#d9c409] transition-colors cursor-pointer"
                        onMouseEnter={() => setHoveredSolution("ISO and IEEE Compliant Test Setups")}
                        onMouseLeave={() => setHoveredSolution(null)}>
                        <CustomTargetIcon className="h-5 w-5 flex-shrink-0" />
                        <span>ISO and IEEE Compliant Test Setups</span>
                      </div>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <div className="bg-[#f3f3f3] px-6 pt-6 pb-6">
                    <Button variant="default" className="w-full bg-[#d9c409] text-black hover:bg-[#e5d825] hover:text-black">
                      <Search className="h-5 w-5 mr-3" />
                      <span className="text-lg font-medium">Find Your Perfect Solution</span>
                    </Button>
                  </div>
                  
                  {/* Image sections */}
                  {(hoveredIndustry && industryData[hoveredIndustry as keyof typeof industryData]) && (
                    <div className="bg-[#f3f3f3] p-4">
                      <div className="flex items-center gap-6 p-4 bg-white rounded">
                        <img src={industryData[hoveredIndustry as keyof typeof industryData].image} alt={hoveredIndustry} className="w-[190px] h-[190px] object-cover rounded" />
                        <div className="text-black">
                          <h4 className="font-semibold text-xl">{hoveredIndustry}</h4>
                          <p className="text-lg text-gray-600">{industryData[hoveredIndustry as keyof typeof industryData].description}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {(hoveredSolution && solutionData[hoveredSolution as keyof typeof solutionData]) && (
                    <div className="bg-[#f3f3f3] p-4">
                      <div className="flex items-center gap-6 p-4 bg-white rounded">
                        <img src={solutionData[hoveredSolution as keyof typeof solutionData].image} alt={hoveredSolution} className="w-[190px] h-[190px] object-cover rounded" />
                        <div className="text-black">
                          <h4 className="font-semibold text-xl">{hoveredSolution}</h4>
                          <p className="text-lg text-gray-600 mb-2">{solutionData[hoveredSolution as keyof typeof solutionData].description}</p>
                          <p className="text-sm text-[#d9c409] font-medium">{solutionData[hoveredSolution as keyof typeof solutionData].subline}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </SimpleDropdown>

              <SimpleDropdown trigger="Products">
                <div className="flex flex-col gap-2 w-[600px] max-w-[90vw] bg-[#f3f3f3] rounded-lg">
                  <div className="flex gap-6 p-6">
                    {/* Left Column */}
                    <div className="space-y-4 flex-1 pr-6 border-r border-border">
                      <h4 className="font-semibold mb-3 text-lg text-black">Product Categories</h4>
                      <div className="flex items-center gap-3 text-lg text-black hover:text-[#d9c409] transition-colors cursor-pointer"
                        onMouseEnter={() => setHoveredProduct("Test Charts")}
                        onMouseLeave={() => setHoveredProduct(null)}>
                        <CustomTargetIcon className="h-5 w-5" />
                        <span>Test Charts</span>
                      </div>
                      <div className="flex items-center gap-3 text-lg text-black hover:text-[#d9c409] transition-colors cursor-pointer"
                        onMouseEnter={() => setHoveredProduct("Illumination Devices")}
                        onMouseLeave={() => setHoveredProduct(null)}>
                        <Lightbulb className="h-5 w-5" />
                        <span>Illumination Devices</span>
                      </div>
                      <div className="flex items-center gap-3 text-lg text-black hover:text-[#d9c409] transition-colors cursor-pointer"
                        onMouseEnter={() => setHoveredProduct("Measurement Devices")}
                        onMouseLeave={() => setHoveredProduct(null)}>
                        <Monitor className="h-5 w-5" />
                        <span>Measurement Devices</span>
                      </div>
                      <div className="flex items-center gap-3 text-lg text-black hover:text-[#d9c409] transition-colors cursor-pointer"
                        onMouseEnter={() => setHoveredProduct("Software")}
                        onMouseLeave={() => setHoveredProduct(null)}>
                        <Cpu className="h-5 w-5" />
                        <span>Software</span>
                      </div>
                      <div className="flex items-center gap-3 text-lg text-black hover:text-[#d9c409] transition-colors cursor-pointer"
                        onMouseEnter={() => setHoveredProduct("Accessories")}
                        onMouseLeave={() => setHoveredProduct(null)}>
                        <Package className="h-5 w-5" />
                        <span>Accessories</span>
                      </div>
                      <div className="flex items-center gap-3 text-lg text-black hover:text-[#d9c409] transition-colors cursor-pointer"
                        onMouseEnter={() => setHoveredProduct("Services")}
                        onMouseLeave={() => setHoveredProduct(null)}>
                        <Wrench className="h-5 w-5" />
                        <span>Services</span>
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-4 flex-1">
                      <h4 className="font-semibold mb-3 text-lg text-black">Solution Packages</h4>
                      <Link to="/solution-arcturus-bundle" className="flex items-center gap-3 text-lg text-black hover:text-[#d9c409] transition-colors bg-green-100 p-2 rounded-md border-2 border-green-300 cursor-pointer">
                        <Puzzle className="h-5 w-5" />
                        <span>Arcturus HDR Test Bundle</span>
                        <span className="ml-2 text-xs bg-green-200 text-green-800 px-2 py-1 rounded">ACTIVE</span>
                      </Link>
                      <div className="flex items-center gap-3 text-lg text-black hover:text-[#d9c409] transition-colors cursor-pointer">
                        <Puzzle className="h-5 w-5" />
                        <span>Camera Calibration Package</span>
                      </div>
                      <div className="flex items-center gap-3 text-lg text-black hover:text-[#d9c409] transition-colors cursor-pointer">
                        <Puzzle className="h-5 w-5" />
                        <span>Laboratory Complete Solution</span>
                      </div>
                      <div className="flex items-center gap-3 text-lg text-black hover:text-[#d9c409] transition-colors cursor-pointer">
                        <Puzzle className="h-5 w-5" />
                        <span>Spectral Measurement & Analysis Set</span>
                      </div>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <div className="bg-[#f3f3f3] px-6 pt-6 pb-6">
                    <Button variant="default" className="w-full bg-[#d9c409] text-black hover:bg-[#e5d825] hover:text-black">
                      <Package className="h-5 w-5 mr-3" />
                      <span className="text-lg font-medium">Explore All Products</span>
                    </Button>
                  </div>

                  {/* Image sections */}
                  {(hoveredProduct && productData[hoveredProduct as keyof typeof productData]) && (
                    <div className="bg-[#f3f3f3] p-4">
                      <div className="flex items-center gap-6 p-4 bg-white rounded">
                        <img src={productData[hoveredProduct as keyof typeof productData].image} alt={hoveredProduct} className="w-[190px] h-[190px] object-cover rounded" />
                        <div className="text-black">
                          <h4 className="font-semibold text-xl">{hoveredProduct}</h4>
                          <p className="text-lg text-gray-600">{productData[hoveredProduct as keyof typeof productData].description}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </SimpleDropdown>

              <SimpleDropdown trigger="Services">
                <div className="flex flex-col gap-2 w-[600px] max-w-[90vw] bg-[#f3f3f3] rounded-lg">
                  <div className="flex gap-6 p-6">
                    {/* Left Column */}
                    <div className="space-y-4 flex-1 pr-6 border-r border-border">
                      <h4 className="font-semibold mb-3 text-lg text-black">Training & Consultation</h4>
                      <div className="flex items-center gap-3 text-lg text-black hover:text-[#d9c409] transition-colors cursor-pointer">
                        <GraduationCap className="h-5 w-5" />
                        <span>Professional Training</span>
                      </div>
                      <div className="flex items-center gap-3 text-lg text-black hover:text-[#d9c409] transition-colors cursor-pointer">
                        <Users className="h-5 w-5" />
                        <span>Technical Consultation</span>
                      </div>
                      <div className="flex items-center gap-3 text-lg text-black hover:text-[#d9c409] transition-colors cursor-pointer">
                        <Building className="h-5 w-5" />
                        <span>On-site Support</span>
                      </div>
                      <div className="flex items-center gap-3 text-lg text-black hover:text-[#d9c409] transition-colors cursor-pointer">
                        <Settings className="h-5 w-5" />
                        <span>Custom Solutions</span>
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-4 flex-1">
                      <h4 className="font-semibold mb-3 text-lg text-black">Technical Resources</h4>
                      <div className="flex items-center gap-3 text-lg text-black hover:text-[#d9c409] transition-colors cursor-pointer">
                        <FileText className="h-5 w-5" />
                        <span>Documentation</span>
                      </div>
                      <div className="flex items-center gap-3 text-lg text-black hover:text-[#d9c409] transition-colors cursor-pointer">
                        <BookOpen className="h-5 w-5" />
                        <span>Knowledge Base</span>
                      </div>
                      <div className="flex items-center gap-3 text-lg text-black hover:text-[#d9c409] transition-colors cursor-pointer">
                        <Video className="h-5 w-5" />
                        <span>Video Tutorials</span>
                      </div>
                      <div className="flex items-center gap-3 text-lg text-black hover:text-[#d9c409] transition-colors cursor-pointer">
                        <Link2 className="h-5 w-5" />
                        <span>API Documentation</span>
                      </div>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <div className="bg-[#f3f3f3] px-6 pt-6 pb-6">
                    <Button variant="default" className="w-full bg-[#d9c409] text-black hover:bg-[#e5d825] hover:text-black">
                      <Wrench className="h-5 w-5 mr-3" />
                      <span className="text-lg font-medium">Get Support</span>
                    </Button>
                  </div>
                </div>
              </SimpleDropdown>

              <SimpleDropdown trigger="Target Groups">
                <div className="flex flex-col gap-2 w-[600px] max-w-[90vw] bg-[#f3f3f3] rounded-lg">
                  <div className="flex gap-6 p-6">
                    {/* Left Column */}
                    <div className="space-y-4 flex-1 pr-6 border-r border-border">
                      <h4 className="font-semibold mb-3 text-lg text-black">Industry Segments</h4>
                      <div className="flex items-center gap-3 text-lg text-black hover:text-[#d9c409] transition-colors cursor-pointer">
                        <Building2 className="h-5 w-5" />
                        <span>Manufacturers</span>
                      </div>
                      <div className="flex items-center gap-3 text-lg text-black hover:text-[#d9c409] transition-colors cursor-pointer">
                        <Handshake className="h-5 w-5" />
                        <span>Suppliers</span>
                      </div>
                      <div className="flex items-center gap-3 text-lg text-black hover:text-[#d9c409] transition-colors cursor-pointer">
                        <GraduationCap className="h-5 w-5" />
                        <span>Research Institutions</span>
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-4 flex-1">
                      <h4 className="font-semibold mb-3 text-lg text-black">Expertise Areas</h4>
                      <div className="flex items-center gap-3 text-lg text-black hover:text-[#d9c409] transition-colors cursor-pointer">
                        <Microscope className="h-5 w-5" />
                        <span>R&D Departments</span>
                      </div>
                      <div className="flex items-center gap-3 text-lg text-black hover:text-[#d9c409] transition-colors cursor-pointer">
                        <CheckCircle className="h-5 w-5" />
                        <span>Quality Assurance</span>
                      </div>
                      <div className="flex items-center gap-3 text-lg text-black hover:text-[#d9c409] transition-colors cursor-pointer">
                        <BarChart3 className="h-5 w-5" />
                        <span>Test Laboratories</span>
                      </div>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <div className="bg-[#f3f3f3] px-6 pt-6 pb-6">
                    <Button variant="default" className="w-full bg-[#d9c409] text-black hover:bg-[#e5d825] hover:text-black">
                      <Target className="h-5 w-5 mr-3" />
                      <span className="text-lg font-medium">Find Your Category</span>
                    </Button>
                  </div>
                </div>
              </SimpleDropdown>

              <SimpleDropdown trigger="Company">
                <div className="flex flex-col gap-2 w-[600px] max-w-[90vw] bg-[#f3f3f3] rounded-lg">
                  <div className="flex gap-6 p-6">
                    {/* Left Column */}
                    <div className="space-y-4 flex-1 pr-6 border-r border-border">
                      <h4 className="font-semibold mb-3 text-lg text-black">About Image Engineering</h4>
                      <div className="flex items-center gap-3 text-lg text-black hover:text-[#d9c409] transition-colors cursor-pointer">
                        <Building2 className="h-5 w-5" />
                        <span>Company Profile</span>
                      </div>
                      <div className="flex items-center gap-3 text-lg text-black hover:text-[#d9c409] transition-colors cursor-pointer">
                        <Users className="h-5 w-5" />
                        <span>Team</span>
                      </div>
                      <div className="flex items-center gap-3 text-lg text-black hover:text-[#d9c409] transition-colors cursor-pointer">
                        <Briefcase className="h-5 w-5" />
                        <span>Careers</span>
                      </div>
                      <Link to="/news" className="flex items-center gap-3 text-lg text-black hover:text-[#d9c409] transition-colors cursor-pointer">
                        <ScrollText className="h-5 w-5" />
                        <span>News & Press</span>
                      </Link>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-4 flex-1">
                      <h4 className="font-semibold mb-3 text-lg text-black">Contact & Events</h4>
                      <div className="flex items-center gap-3 text-lg text-black hover:text-[#d9c409] transition-colors cursor-pointer">
                        <Phone className="h-5 w-5" />
                        <span>Contact Information</span>
                      </div>
                      <div className="flex items-center gap-3 text-lg text-black hover:text-[#d9c409] transition-colors cursor-pointer">
                        <MapPin className="h-5 w-5" />
                        <span>Locations</span>
                      </div>
                      <Link to="/events" className="flex items-center gap-3 text-lg text-black hover:text-[#d9c409] transition-colors cursor-pointer">
                        <Calendar className="h-5 w-5" />
                        <span>Events & Trade Shows</span>
                      </Link>
                    </div>
                  </div>

                  {/* Sustainability Section */}
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 mx-6 rounded-lg">
                    <h4 className="font-semibold mb-3 text-lg text-black flex items-center gap-2">
                      <Leaf className="h-5 w-5 text-green-600" />
                      Sustainability & Responsibility
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2 text-sm text-black hover:text-[#d9c409] transition-colors cursor-pointer">
                        <Recycle className="h-4 w-4 text-green-600" />
                        <span>Environmental Policy</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-black hover:text-[#d9c409] transition-colors cursor-pointer">
                        <ShieldCheck className="h-4 w-4 text-blue-600" />
                        <span>Quality Standards</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-black hover:text-[#d9c409] transition-colors cursor-pointer">
                        <Sprout className="h-4 w-4 text-green-600" />
                        <span>Green Manufacturing</span>
                      </div>
                      <Link to="/hidden-segments" className="flex items-center gap-2 text-sm text-black hover:text-[#d9c409] transition-colors cursor-pointer">
                        <CustomTargetIcon className="h-4 w-4" />
                        <span>ISO 9001</span>
                      </Link>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <div className="bg-[#f3f3f3] px-6 pt-6 pb-6">
                    <Button variant="default" className="w-full bg-[#d9c409] text-black hover:bg-[#e5d825] hover:text-black">
                      <Info className="h-5 w-5 mr-3" />
                      <span className="text-lg font-medium">Learn More About Us</span>
                    </Button>
                  </div>
                </div>
              </SimpleDropdown>
            </div>
          </div>
          
          {/* Utility Navigation on the right */}
          <div className="hidden lg:flex">
            <UtilityNavigation />
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(!isOpen)}>
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
                    
                    {/* Find Your Solution */}
                    <AccordionItem value="solutions">
                      <AccordionTrigger className="px-4 py-3 text-base">
                        <div className="flex items-center gap-3">
                          <Search className="w-5 h-5 shrink-0 text-muted-foreground" />
                          <span className="text-foreground">Find Your Solution</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4 pt-2">
                          
                          {/* Industries */}
                          <div>
                            <h4 className="font-medium mb-2 px-4 text-sm text-muted-foreground">Industries</h4>
                            <ul className="space-y-1">
                              <li>
                                <div className="min-h-12 px-4 flex items-center gap-3 py-3">
                                  <Camera className="w-5 h-5 shrink-0 text-muted-foreground" />
                                  <span className="text-foreground">Photography</span>
                                </div>
                              </li>
                              <li>
                                <div className="min-h-12 px-4 flex items-center gap-3 py-3">
                                  <Smartphone className="w-5 h-5 shrink-0 text-muted-foreground" />
                                  <span className="text-foreground">Mobile Phones</span>
                                </div>
                              </li>
                              <li>
                                <Link to="/automotive" className="min-h-12 px-4 flex items-center gap-3 py-3 bg-green-100 rounded-md border-2 border-green-300">
                                  <Car className="w-5 h-5 shrink-0 text-green-600" />
                                  <span className="text-green-800">Automotive & ADAS</span>
                                  <span className="ml-2 text-xs bg-green-200 text-green-800 px-2 py-1 rounded">ACTIVE</span>
                                </Link>
                              </li>
                              <li>
                                <div className="min-h-12 px-4 flex items-center gap-3 py-3">
                                  <Tv className="w-5 h-5 shrink-0 text-muted-foreground" />
                                  <span className="text-foreground">Broadcast & HDTV</span>
                                </div>
                              </li>
                              <li>
                                <div className="min-h-12 px-4 flex items-center gap-3 py-3">
                                  <Shield className="w-5 h-5 shrink-0 text-muted-foreground" />
                                  <span className="text-foreground">Security / Surveillance</span>
                                </div>
                              </li>
                              <li>
                                <div className="min-h-12 px-4 flex items-center gap-3 py-3">
                                  <Cog className="w-5 h-5 shrink-0 text-muted-foreground" />
                                  <span className="text-foreground">Machine Vision</span>
                                </div>
                              </li>
                              <li>
                                <div className="min-h-12 px-4 flex items-center gap-3 py-3">
                                  <Stethoscope className="w-5 h-5 shrink-0 text-muted-foreground" />
                                  <span className="text-foreground">Medical / Endoscopy</span>
                                </div>
                              </li>
                              <li>
                                <div className="min-h-12 px-4 flex items-center gap-3 py-3">
                                  <ScanLine className="w-5 h-5 shrink-0 text-muted-foreground" />
                                  <span className="text-foreground">Scanning & Archiving</span>
                                </div>
                              </li>
                              <li>
                                <div className="min-h-12 px-4 flex items-center gap-3 py-3">
                                  <FlaskConical className="w-5 h-5 shrink-0 text-muted-foreground" />
                                  <span className="text-foreground">iQ‑Lab Testing</span>
                                </div>
                              </li>
                            </ul>
                          </div>
                          
                          <Separator />
                          
                          {/* Popular Applications */}
                          <div>
                            <h4 className="font-medium mb-2 px-4 text-sm text-muted-foreground">Popular Applications</h4>
                            <ul className="space-y-1">
                              <li>
                                <div className="min-h-12 px-4 flex items-center gap-3 py-3">
                                  <CustomTargetIcon className="w-5 h-5 shrink-0 text-muted-foreground" />
                                  <span className="text-foreground">Camera Quality Validation</span>
                                </div>
                              </li>
                              <li>
                                <Link to="/in-cabin-testing" className="min-h-12 px-4 flex items-center gap-3 py-3 bg-green-100 rounded-md border-2 border-green-300">
                                  <CustomTargetIcon className="w-5 h-5 shrink-0 text-green-600" />
                                  <span className="text-green-800">In-Cabin Performance Testing</span>
                                  <span className="ml-2 text-xs bg-green-200 text-green-800 px-2 py-1 rounded">ACTIVE</span>
                                </Link>
                              </li>
                              <li>
                                <div className="min-h-12 px-4 flex items-center gap-3 py-3">
                                  <CustomTargetIcon className="w-5 h-5 shrink-0 text-muted-foreground" />
                                  <span className="text-foreground">Test Environments for Smartphones & Displays</span>
                                </div>
                              </li>
                              <li>
                                <div className="min-h-12 px-4 flex items-center gap-3 py-3">
                                  <CustomTargetIcon className="w-5 h-5 shrink-0 text-muted-foreground" />
                                  <span className="text-foreground">Microscopy & Medical Imaging</span>
                                </div>
                              </li>
                              <li>
                                <div className="min-h-12 px-4 flex items-center gap-3 py-3">
                                  <CustomTargetIcon className="w-5 h-5 shrink-0 text-muted-foreground" />
                                  <span className="text-foreground">ISO and IEEE Compliant Test Setups</span>
                                </div>
                              </li>
                            </ul>
                          </div>
                          
                          <Button className="w-full h-12 mt-4 rounded-lg bg-[#d9c409] text-black hover:bg-[#e5d825]">
                            <Search className="h-5 w-5 mr-3" />
                            Find Your Perfect Solution
                          </Button>
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
                        <div className="space-y-4 pt-2">
                          <div>
                            <h4 className="font-medium mb-2 px-4 text-sm text-muted-foreground">Product Categories</h4>
                            <ul className="space-y-1">
                              <li>
                                <Link to="/charts" className="min-h-12 px-4 flex items-center gap-3 py-3 bg-green-100 rounded-md border-2 border-green-300">
                                  <CustomTargetIcon className="w-5 h-5 shrink-0 text-green-600" />
                                  <span className="text-green-800">Test Charts</span>
                                  <span className="ml-2 text-xs bg-green-200 text-green-800 px-2 py-1 rounded">ACTIVE</span>
                                </Link>
                              </li>
                              <li>
                                <div className="min-h-12 px-4 flex items-center gap-3 py-3">
                                  <Lightbulb className="w-5 h-5 shrink-0 text-muted-foreground" />
                                  <span className="text-foreground">Illumination Devices</span>
                                </div>
                              </li>
                              <li>
                                <div className="min-h-12 px-4 flex items-center gap-3 py-3">
                                  <Monitor className="w-5 h-5 shrink-0 text-muted-foreground" />
                                  <span className="text-foreground">Measurement Devices</span>
                                </div>
                              </li>
                              <li>
                                <div className="min-h-12 px-4 flex items-center gap-3 py-3">
                                  <Cpu className="w-5 h-5 shrink-0 text-muted-foreground" />
                                  <span className="text-foreground">Software</span>
                                </div>
                              </li>
                              <li>
                                <div className="min-h-12 px-4 flex items-center gap-3 py-3">
                                  <Package className="w-5 h-5 shrink-0 text-muted-foreground" />
                                  <span className="text-foreground">Accessories</span>
                                </div>
                              </li>
                              <li>
                                <div className="min-h-12 px-4 flex items-center gap-3 py-3">
                                  <GraduationCap className="w-5 h-5 shrink-0 text-muted-foreground" />
                                  <span className="text-foreground">Services</span>
                                </div>
                              </li>
                            </ul>
                          </div>
                          
                          <Button className="w-full h-12 mt-4 rounded-lg bg-[#d9c409] text-black hover:bg-[#e5d825]">
                            <FlaskConical className="h-5 w-5 mr-3" />
                            Contact Our Lab Team
                          </Button>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    {/* Training & Events */}
                    <AccordionItem value="training">
                      <AccordionTrigger className="px-4 py-3 text-base">
                        <div className="flex items-center gap-3">
                          <GraduationCap className="w-5 h-5 shrink-0 text-muted-foreground" />
                          <span className="text-foreground">Training & Events</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4 pt-2">
                          <div>
                            <h4 className="font-medium mb-2 px-4 text-sm text-muted-foreground">Training & Education</h4>
                            <ul className="space-y-1">
                              <li>
                                <div className="min-h-12 px-4 flex items-center gap-3 py-3">
                                  <CustomTargetIcon className="w-5 h-5 shrink-0 text-muted-foreground" />
                                  <span className="text-foreground">Professional Training</span>
                                </div>
                              </li>
                              <li>
                                <div className="min-h-12 px-4 flex items-center gap-3 py-3">
                                  <CustomTargetIcon className="w-5 h-5 shrink-0 text-muted-foreground" />
                                  <span className="text-foreground">Webinars & Workshops</span>
                                </div>
                              </li>
                              <li>
                                <div className="min-h-12 px-4 flex items-center gap-3 py-3">
                                  <CustomTargetIcon className="w-5 h-5 shrink-0 text-muted-foreground" />
                                  <span className="text-foreground">Certification Programs</span>
                                </div>
                              </li>
                            </ul>
                          </div>
                          
                          <Link to="/events" className="bg-green-100 p-2 rounded-md border-2 border-green-300 block">
                            <Button className="w-full h-12 rounded-lg bg-[#d9c409] text-black hover:bg-[#e5d825] flex items-center justify-center">
                              <GraduationCap className="h-5 w-5 mr-3" />
                              <span>View Training & Events</span>
                              <span className="ml-2 text-xs bg-green-200 text-green-800 px-2 py-1 rounded">ACTIVE</span>
                            </Button>
                          </Link>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    {/* Image Quality */}
                    <AccordionItem value="image-quality">
                      <AccordionTrigger className="px-4 py-3 text-base">
                        <div className="flex items-center gap-3">
                          <Target className="w-5 h-5 shrink-0 text-muted-foreground" />
                          <span className="text-foreground">Image Quality</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4 pt-2">
                          <div>
                            <h4 className="font-medium mb-2 px-4 text-sm text-muted-foreground">Testing Services</h4>
                            <ul className="space-y-1">
                              <li>
                                <div className="min-h-12 px-4 flex items-center gap-3 py-3">
                                  <CustomTargetIcon className="w-5 h-5 shrink-0 text-muted-foreground" />
                                  <span className="text-foreground">Professional Testing Services</span>
                                </div>
                              </li>
                              <li>
                                <div className="min-h-12 px-4 flex items-center gap-3 py-3">
                                  <CustomTargetIcon className="w-5 h-5 shrink-0 text-muted-foreground" />
                                  <span className="text-foreground">Custom Calibration</span>
                                </div>
                              </li>
                              <li>
                                <div className="min-h-12 px-4 flex items-center gap-3 py-3">
                                  <CustomTargetIcon className="w-5 h-5 shrink-0 text-muted-foreground" />
                                  <span className="text-foreground">Consulting & Analysis</span>
                                </div>
                              </li>
                            </ul>
                          </div>
                          
                          <Button className="w-full h-12 mt-4 rounded-lg bg-[#d9c409] text-black hover:bg-[#e5d825]">
                            <Target className="h-5 w-5 mr-3" />
                            Get Testing Quote
                          </Button>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    {/* Company */}
                    <AccordionItem value="company">
                      <AccordionTrigger className="px-4 py-3 text-base">
                        <div className="flex items-center gap-3">
                          <Building2 className="w-5 h-5 shrink-0 text-muted-foreground" />
                          <span className="text-foreground">Company</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4 pt-2">
                          <div>
                            <h4 className="font-medium mb-2 px-4 text-sm text-muted-foreground">About Us</h4>
                            <ul className="space-y-1">
                              <li>
                                <div className="min-h-12 px-4 flex items-center gap-3 py-3">
                                  <CustomTargetIcon className="w-5 h-5 shrink-0 text-muted-foreground" />
                                  <span className="text-foreground">Our Story</span>
                                </div>
                              </li>
                              <li>
                                <div className="min-h-12 px-4 flex items-center gap-3 py-3">
                                  <CustomTargetIcon className="w-5 h-5 shrink-0 text-muted-foreground" />
                                  <span className="text-foreground">Team & Expertise</span>
                                </div>
                              </li>
                              <li>
                                <div className="min-h-12 px-4 flex items-center gap-3 py-3">
                                  <CustomTargetIcon className="w-5 h-5 shrink-0 text-muted-foreground" />
                                  <span className="text-foreground">Quality & Standards</span>
                                </div>
                              </li>
                              <li>
                                <div className="min-h-12 px-4 flex items-center gap-3 py-3">
                                  <CustomTargetIcon className="w-5 h-5 shrink-0 text-muted-foreground" />
                                  <span className="text-foreground">Subsidiaries/Resellers</span>
                                </div>
                              </li>
                              <li>
                                <div className="min-h-12 px-4 flex items-center gap-3 py-3">
                                  <CustomTargetIcon className="w-5 h-5 shrink-0 text-muted-foreground" />
                                  <span className="text-foreground">Nynomic Group</span>
                                </div>
                              </li>
                              <li>
                                <Link to="/news" className="min-h-12 px-4 flex items-center gap-3 py-3 hover:bg-gray-100 transition-colors">
                                  <FileText className="w-5 h-5 shrink-0 text-muted-foreground" />
                                  <span className="text-foreground">News</span>
                                </Link>
                              </li>
                            </ul>
                          </div>
                          
                          <Separator />
                          
                          <div>
                            <h4 className="font-medium mb-2 px-4 text-sm text-muted-foreground">Business & Partnerships</h4>
                            <ul className="space-y-1">
                              <li>
                                <div className="min-h-12 px-4 flex items-center gap-3 py-3">
                                  <CustomTargetIcon className="w-5 h-5 shrink-0 text-muted-foreground" />
                                  <span className="text-foreground">Careers</span>
                                </div>
                              </li>
                              <li>
                                <div className="min-h-12 px-4 flex items-center gap-3 py-3">
                                  <CustomTargetIcon className="w-5 h-5 shrink-0 text-muted-foreground" />
                                  <span className="text-foreground">Partnerships</span>
                                </div>
                              </li>
                              <li>
                                <div className="min-h-12 px-4 flex items-center gap-3 py-3">
                                  <CustomTargetIcon className="w-5 h-5 shrink-0 text-muted-foreground" />
                                  <span className="text-foreground">Sustainability</span>
                                </div>
                              </li>
                            </ul>
                          </div>
                          
                          <Button className="w-full h-12 mt-4 rounded-lg bg-[#d9c409] text-black hover:bg-[#e5d825]">
                            <Building2 className="h-5 w-5 mr-3" />
                            Learn More About Us
                          </Button>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                  </Accordion>
                </nav>

                {/* Sticky Contact Button */}
                <div className="sticky bottom-0 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 pb-[env(safe-area-inset-bottom)] pt-3 border-t">
                  <Link to="/contact">
                    <Button className="w-full h-12 rounded-lg bg-[#d9c409] text-black hover:bg-[#e5d825]">
                      Contact
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
