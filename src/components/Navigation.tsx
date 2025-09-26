import { Button } from "@/components/ui/button";
import { Menu, X, Camera, Wrench, Building2, Download, Info, MessageCircle, Smartphone, Car, Tv, Shield, Cog, Stethoscope, ScanLine, FlaskConical, Monitor, Zap, Package, Lightbulb, Puzzle, Cpu, CheckCircle, Microscope, Target, BarChart3, Settings, Search, Users, Building, GraduationCap, FileText, BookOpen, Video, Link2, ScrollText, Phone, MapPin, Calendar, Briefcase, Handshake, Leaf, Recycle, ShieldCheck, ChevronRight } from "lucide-react";
import { BadgeCheck, Sprout } from "lucide-react";
import { CustomTargetIcon } from "./CustomTargetIcon";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import logoIE from "@/assets/logo-ie-white.png";
import UtilityNavigation from "@/components/UtilityNavigation";
import { SimpleDropdown } from "./SimpleNavigation";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import IntelligentSearchBar from "@/components/IntelligentSearchBar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  const [hoveredTestService, setHoveredTestService] = useState<string | null>(null);

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

  // Industry data mapping with subgroups
  const industryData = {
    "Automotive": {
      image: industryAutomotive,
      description: "Camera systems in vehicles, driver assistance and autonomous driving",
      subgroups: [
        { name: "Advanced Driver Assistance Systems (ADAS)", link: "/automotive" },
        { name: "In-Cabin Testing", link: "/in-cabin-testing", active: true },
        { name: "IEEE-P2020 Testing", link: "#" },
        { name: "High Dynamic Range (HDR)", link: "#" },
        { name: "Near-Infrared (NIR)", link: "#" },
        { name: "Geometric Calibration", link: "#" }
      ]
    },
    "Security & Surveillance": {
      image: industrySecurity,
      description: "CCTV systems, video surveillance",
      subgroups: [
        { name: "IEC 62676-5 Testing", link: "#" },
        { name: "Low-light (ISO 19093)", link: "#" },
        { name: "High Dynamic Range (HDR)", link: "#" },
        { name: "ISP Tuning", link: "#" },
        { name: "Spectral Sensitivities", link: "#" }
      ]
    },
    "Mobile Phone": {
      image: industryMobile,
      description: "Image quality testing according to VCX standards",
      subgroups: [
        { name: "VCX PhoneCam", link: "#" },
        { name: "Color Calibration", link: "#" },
        { name: "Camera Stabilization", link: "#" },
        { name: "ISP Tuning", link: "#" },
        { name: "Timing Measurements", link: "#" }
      ]
    },
    "Web Camera": {
      image: industryBroadcast,
      description: "Web cameras for video conferencing and streaming applications",
      subgroups: [
        { name: "VCX WebCam", link: "#" },
        { name: "ISP Tuning", link: "#" },
        { name: "Color Calibration", link: "#" },
        { name: "Timing Measurements", link: "#" }
      ]
    },
    "Machine Vision": {
      image: industryMachineVision,
      description: "Camera systems for inspection, robotics, quality control",
      subgroups: [
        { name: "EMVA 1288 (ISO 24942)", link: "#" },
        { name: "Production Line Calibration", link: "#" },
        { name: "Lens Distortion", link: "#" },
        { name: "Signal-to-Noise Ratio (SNR)", link: "#" }
      ]
    },
    "Medical & Endoscopy": {
      image: industryMedical,
      description: "Image quality in medical imaging and diagnostic systems",
      subgroups: [
        { name: "Color Calibration", link: "#" },
        { name: "Low-Light Testing", link: "#" },
        { name: "Optical Distortion", link: "#" },
        { name: "ISP Tuning", link: "#" },
        { name: "Endoscopic Illumination", link: "#" }
      ]
    },
    "Scanners & Archiving": {
      image: industryScanning,
      description: "Quality assurance in digitization of documents, books, photos",
      subgroups: [
        { name: "ISO 21550", link: "#" },
        { name: "Universal Test Target", link: "#" },
        { name: "Multispectral Illumination", link: "#" },
        { name: "Scanner Dynamic Range", link: "#" },
        { name: "Spectral Sensitivities", link: "#" }
      ]
    },
    "Photo & Video": {
      image: industryPhotography,
      description: "Digital cameras for professional and amateur applications",
      subgroups: [
        { name: "Broadcast & HDTV", link: "#" },
        { name: "Spectral Sensitivities", link: "#" },
        { name: "ISP Tuning", link: "#" },
        { name: "iQ-LED Illumination", link: "#" }
      ]
    }
  };

  // Product data mapping with subgroups
  const productData = {
    "Test Charts": {
      image: "/images/custom-chart.png",
      description: "High-precision test patterns and color charts for comprehensive image quality analysis including multipurpose, reflective, and transparent options",
      subgroups: [
        { name: "iQ-Analyzer-X", link: "#" },
        { name: "Multipurpose", link: "#" },
        { name: "Image Quality Factor", link: "#" },
        { name: "Infrared (VIS-IR)", link: "#" },
        { name: "Reflective", link: "/charts" },
        { name: "Transparent", link: "#" },
        { name: "See All Charts", link: "/charts" }
      ]
    },
    "Illumination Devices": {
      image: iqLedIllumination,
      description: "Professional LED lighting systems and uniform light sources for stable testing environments",
      subgroups: [
        { name: "iQ-LED", link: "#" },
        { name: "IEEE-P2020", link: "#" },
        { name: "Production Line Calibration", link: "#" },
        { name: "Flicker (PWM/MMP)", link: "#" },
        { name: "Test Chart Illumination", link: "#" },
        { name: "All Light Sources", link: "#" }
      ]
    },
    "Measurement Devices": {
      image: arcturusMainProduct,
      description: "Precision colorimeters, photometers and spectroradiometers for accurate optical measurements",
      subgroups: [
        { name: "Geometric Calibration", link: "#" },
        { name: "Timing Performance", link: "#" },
        { name: "Climate-Controlled", link: "#" },
        { name: "Machine Vision", link: "#" },
        { name: "Spectral Sensitivity", link: "#" },
        { name: "All Measurement Devices", link: "#" }
      ]
    },
    "Software & APIs": {
      image: iqAnalyzerIntro,
      description: "Advanced software solutions for image analysis, calibration and automated quality control",
      subgroups: [
        { name: "iQ-Analyzer-X", link: "#" },
        { name: "Control APIs", link: "#" },
        { name: "iQ-Luminance", link: "#" },
        { name: "All Software & APIs", link: "#" }
      ]
    },
    "Product Accessories": {
      image: "/images/chart-case.png",
      description: "Professional accessories including mounting systems, cables, connectors and protective cases",
      subgroups: [
        { name: "Storage & Transport", link: "#" },
        { name: "Luxmeters", link: "#" },
        { name: "Camera Alignment", link: "#" },
        { name: "Test Chart Mounts", link: "#" },
        { name: "VCX & Webcam", link: "#" },
        { name: "All Accessories", link: "#" }
      ]
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

  // Test Services data mapping
  const testServicesData = {
    "Overview": {
      image: industryLabTesting,
      description: "Comprehensive introduction to our testing laboratory capabilities and methodologies",
      services: [
        { name: "Learn about the Lab", link: "/inside-lab" },
        { name: "Testing Consultation", link: "#" }
      ]
    },
    "Automotive": {
      image: industryAutomotive,
      description: "Specialized testing services for automotive camera systems and ADAS applications",
      services: [
        { name: "camPAS", link: "#" },
        { name: "In-Cabin Testing", link: "/in-cabin-testing", active: true },
        { name: "HDR Testing", link: "#" },
        { name: "Geometric Calibration", link: "#" },
        { name: "Baseline Evaluations", link: "#" }
      ]
    },
    "VCX": {
      image: industryMobile,
      description: "VCX testing protocols for mobile devices and webcam applications",
      services: [
        { name: "VCX - PhoneCam", link: "#" },
        { name: "VCX - WebCam", link: "#" },
        { name: "Color Characterizations", link: "#" },
        { name: "Baseline Evaluations", link: "#" }
      ]
    },
    "Image Quality": {
      image: industryPhotography,
      description: "Comprehensive image quality analysis and measurement services",
      services: [
        { name: "Resolution & Texture Loss", link: "#" },
        { name: "Dynamic Range (OECF)", link: "#" },
        { name: "Lens Distortion", link: "#" },
        { name: "Image Shading & Flare", link: "#" },
        { name: "Color Accuracy", link: "#" }
      ]
    },
    "Standardized": {
      image: industryLabTesting,
      description: "Testing services according to international standards and protocols",
      services: [
        { name: "IEEE-P2020 (ADAS)", link: "#" },
        { name: "VCX (Mobile/Webcam)", link: "#" },
        { name: "IEC 62676-5 (Security)", link: "#" },
        { name: "EMVA 1288 (Machine Vision)", link: "#" },
        { name: "ISO 12233 (SFR)", link: "#" }
      ]
    },
    "Specialized/Custom": {
      image: industryMedical,
      description: "Custom testing solutions and specialized measurement services",
      services: [
        { name: "Baseline Evaluations", link: "#" },
        { name: "Proof of Concepts", link: "#" },
        { name: "Luminance Calibrations", link: "#" },
        { name: "Sample-to-Sample Deviations", link: "#" },
        { name: "Development Validation Tests", link: "#" },
        { name: "Temperature-Controlled", link: "#" },
        { name: "Underwater Tests", link: "#" }
      ]
    }
  };

  return (
    <nav className="fixed top-8 left-4 right-4 z-40 bg-[#4B4A4A]/95 backdrop-blur-sm rounded-xl shadow-lg border border-white/10">
      {/* Main Navigation with integrated Utility Navigation */}
      <div className="w-full px-6 py-6">
        {/* Single row - main nav left, utility right */}
        <div className="flex items-center justify-between w-full">
          {/* Main Navigation - moved to left */}
          <div className="hidden 2xl:flex items-center gap-6 ml-[300px]">
            <SimpleDropdown trigger="Your Solution">
                <div className="flex flex-col gap-2 w-[700px] max-w-[90vw] bg-[#f3f3f3] rounded-lg z-50"
                     onMouseLeave={() => setHoveredIndustry(null)}>
                  <div className="flex gap-6 p-6">
                    {/* Left Column: Industries */}
                    <div className="space-y-4 flex-1 pr-6 border-r border-border">
                      <h4 className="font-semibold mb-3 text-lg text-black">Industries</h4>
                      
                       <div className="flex items-center gap-3 text-lg text-black hover:text-[#d9c409] transition-colors cursor-pointer bg-green-100 p-2 rounded-md border-2 border-green-300"
                         onMouseEnter={() => setHoveredIndustry("Automotive")}>
                         <Car className="h-5 w-5" />
                         <Link to="/automotive">Automotive</Link>
                         <span className="ml-2 text-xs bg-green-200 text-green-800 px-2 py-1 rounded font-semibold">ACTIVE</span>
                       </div>
                      
                      <div className="flex items-center gap-3 text-lg text-black hover:text-[#d9c409] transition-colors cursor-pointer"
                        onMouseEnter={() => setHoveredIndustry("Security & Surveillance")}>
                        <Shield className="h-5 w-5" />
                        <span>Security & Surveillance</span>
                      </div>
                      
                      <div className="flex items-center gap-3 text-lg text-black hover:text-[#d9c409] transition-colors cursor-pointer"
                        onMouseEnter={() => setHoveredIndustry("Mobile Phone")}>
                        <Smartphone className="h-5 w-5" />
                        <span>Mobile Phone</span>
                      </div>
                      
                      <div className="flex items-center gap-3 text-lg text-black hover:text-[#d9c409] transition-colors cursor-pointer"
                        onMouseEnter={() => setHoveredIndustry("Web Camera")}>
                        <Camera className="h-5 w-5" />
                        <span>Web Camera</span>
                      </div>
                      
                      <div className="flex items-center gap-3 text-lg text-black hover:text-[#d9c409] transition-colors cursor-pointer"
                        onMouseEnter={() => setHoveredIndustry("Machine Vision")}>
                        <Cog className="h-5 w-5" />
                        <span>Machine Vision</span>
                      </div>
                      
                      <div className="flex items-center gap-3 text-lg text-black hover:text-[#d9c409] transition-colors cursor-pointer"
                        onMouseEnter={() => setHoveredIndustry("Medical & Endoscopy")}>
                        <Stethoscope className="h-5 w-5" />
                        <span>Medical & Endoscopy</span>
                      </div>
                      
                      <div className="flex items-center gap-3 text-lg text-black hover:text-[#d9c409] transition-colors cursor-pointer"
                        onMouseEnter={() => setHoveredIndustry("Scanners & Archiving")}>
                        <ScanLine className="h-5 w-5" />
                        <span>Scanners & Archiving</span>
                      </div>
                      
                      <div className="flex items-center gap-3 text-lg text-black hover:text-[#d9c409] transition-colors cursor-pointer"
                        onMouseEnter={() => setHoveredIndustry("Photo & Video")}>
                        <Camera className="h-5 w-5" />
                        <span>Photo & Video</span>
                      </div>
                    </div>
                    
                    {/* Right Column: Applications */}
                    <div className="space-y-4 flex-1">
                      <h4 className="font-semibold mb-3 text-lg text-black">
                        {hoveredIndustry ? `${hoveredIndustry} - Applications` : "Applications"}
                      </h4>
                      
                      {/* Conditional Rendering of Applications */}
                      {hoveredIndustry && industryData[hoveredIndustry as keyof typeof industryData] && (
                        <div className="space-y-3">
                           {industryData[hoveredIndustry as keyof typeof industryData].subgroups.map((application, index) => (
                             <div key={index} className="flex items-center gap-3 text-lg transition-colors cursor-pointer text-black hover:text-[#d9c409]">
                               <ChevronRight className="h-4 w-4" />
                               {application.link === "#" ? (
                                 <span>{application.name}</span>
                               ) : (
                                 <Link to={application.link}>{application.name}</Link>
                               )}
                               {(application as any).active && (
                                 <span className="ml-2 text-xs bg-green-200 text-green-800 px-2 py-1 rounded font-semibold">ACTIVE</span>
                               )}
                             </div>
                           ))}
                        </div>
                      )}
                      
                      {/* Default state when no industry is hovered */}
                      {!hoveredIndustry && (
                        <div className="text-gray-500 text-center py-8">
                          <Building2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                          <p>Hover over an industry to see applications</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* CTA Button */}
                  <div className="bg-[#f3f3f3] px-6 pt-6 pb-6">
                    <Button variant="default" className="w-full bg-[#d9c409] text-black hover:bg-[#e5d825] hover:text-black">
                      <Search className="h-5 w-5 mr-3" />
                      <span className="text-lg font-medium">Find Your Perfect Solution</span>
                    </Button>
                  </div>
                  
                  {/* Image Rollover under Flyout */}
                  {hoveredIndustry && industryData[hoveredIndustry as keyof typeof industryData] && (
                    <div className="bg-[#f3f3f3] p-4">
                      <div className="flex items-center gap-6 p-4 bg-white rounded-lg shadow-sm">
                        <img 
                          src={industryData[hoveredIndustry as keyof typeof industryData].image} 
                          alt={hoveredIndustry} 
                          className="w-[190px] h-[190px] object-cover rounded-lg" 
                        />
                        <div className="text-black">
                          <h4 className="font-semibold text-xl mb-2">{hoveredIndustry}</h4>
                          <p className="text-lg text-gray-600 leading-relaxed">
                            {industryData[hoveredIndustry as keyof typeof industryData].description}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
            </SimpleDropdown>

            <SimpleDropdown trigger="Products">
                <div className="flex flex-col gap-2 w-[700px] max-w-[90vw] bg-[#f3f3f3] rounded-lg z-50"
                     onMouseLeave={() => setHoveredProduct(null)}>
                  <div className="flex gap-6 p-6">
                    {/* Left Column: Product Groups */}
                    <div className="space-y-4 flex-1 pr-6 border-r border-border">
                      <h4 className="font-semibold mb-3 text-lg text-black">Product Groups</h4>
                      
                       <Link to="/products/charts" className="flex items-center gap-3 text-lg text-black hover:text-[#d9c409] transition-colors cursor-pointer bg-green-100 p-2 rounded-md border-2 border-green-300"
                         onMouseEnter={() => setHoveredProduct("Test Charts")}>
                         <CustomTargetIcon className="h-5 w-5" />
                         <span>Test Charts</span>
                         <span className="ml-2 text-xs bg-green-200 text-green-800 px-2 py-1 rounded font-semibold">ACTIVE</span>
                       </Link>
                      
                      <div className="flex items-center gap-3 text-lg text-black hover:text-[#d9c409] transition-colors cursor-pointer"
                        onMouseEnter={() => setHoveredProduct("Illumination Devices")}>
                        <CustomTargetIcon className="h-5 w-5" />
                        <span>Illumination Devices</span>
                      </div>
                      
                      <div className="flex items-center gap-3 text-lg text-black hover:text-[#d9c409] transition-colors cursor-pointer"
                        onMouseEnter={() => setHoveredProduct("Measurement Devices")}>
                        <CustomTargetIcon className="h-5 w-5" />
                        <span>Measurement Devices</span>
                      </div>
                      
                      <div className="flex items-center gap-3 text-lg text-black hover:text-[#d9c409] transition-colors cursor-pointer"
                        onMouseEnter={() => setHoveredProduct("Software & APIs")}>
                        <CustomTargetIcon className="h-5 w-5" />
                        <span>Software & APIs</span>
                      </div>
                      
                      <div className="flex items-center gap-3 text-lg text-black hover:text-[#d9c409] transition-colors cursor-pointer"
                        onMouseEnter={() => setHoveredProduct("Product Accessories")}>
                        <CustomTargetIcon className="h-5 w-5" />
                        <span>Product Accessories</span>
                      </div>
                    </div>
                    
                    {/* Right Column: Subgroups */}
                    <div className="space-y-4 flex-1">
                      <h4 className="font-semibold mb-3 text-lg text-black">
                        {hoveredProduct ? `${hoveredProduct} - Subgroups` : "Subgroups"}
                      </h4>
                      
                      {/* Conditional Rendering of Subgroups */}
                      {hoveredProduct && productData[hoveredProduct as keyof typeof productData] && (
                        <div className="space-y-3">
                          {productData[hoveredProduct as keyof typeof productData].subgroups.map((subgroup, index) => (
                            <div key={index} className="flex items-center gap-3 text-lg transition-colors cursor-pointer text-black hover:text-[#d9c409]">
                              <ChevronRight className="h-4 w-4" />
                              {subgroup.link === "#" ? (
                                <span>{subgroup.name}</span>
                              ) : (
                                <Link to={subgroup.link}>{subgroup.name}</Link>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* Default state when no product is hovered */}
                      {!hoveredProduct && (
                        <div className="text-gray-500 text-center py-8">
                          <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                          <p>Hover over a product group to see subgroups</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* CTA Button */}
                  <div className="bg-[#f3f3f3] px-6 pt-6 pb-6">
                    <Link to="/inside-lab">
                      <Button variant="default" className="w-full bg-[#d9c409] text-black hover:bg-[#e5d825] hover:text-black">
                        <Microscope className="h-5 w-5 mr-3" />
                        <span className="text-lg font-medium">Inside the Testing Lab</span>
                      </Button>
                    </Link>
                  </div>
                  
                  {/* Image Rollover under Flyout */}
                  {hoveredProduct && productData[hoveredProduct as keyof typeof productData] && (
                    <div className="bg-[#f3f3f3] p-4">
                      <div className="flex items-center gap-6 p-4 bg-white rounded-lg shadow-sm">
                        <img 
                          src={productData[hoveredProduct as keyof typeof productData].image} 
                          alt={hoveredProduct} 
                          className="w-[190px] h-[190px] object-cover rounded-lg" 
                        />
                        <div className="text-black">
                          <h4 className="font-semibold text-xl mb-2">{hoveredProduct}</h4>
                          <p className="text-lg text-gray-600 leading-relaxed">
                            {productData[hoveredProduct as keyof typeof productData].description}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </SimpleDropdown>

              <SimpleDropdown trigger="Test Lab">
                <div className="flex flex-col gap-2 w-[700px] max-w-[90vw] bg-[#f3f3f3] rounded-lg z-50"
                     onMouseLeave={() => setHoveredTestService(null)}>
                  <div className="flex gap-6 p-6">
                    {/* Left Column: Service Categories */}
                    <div className="space-y-4 flex-1 pr-6 border-r border-border">
                      <h4 className="font-semibold mb-3 text-lg text-black">Test Services</h4>
                      
                      <div className="flex items-center gap-3 text-lg text-black hover:text-[#d9c409] transition-colors cursor-pointer"
                        onMouseEnter={() => setHoveredTestService("Overview")}>
                        <FlaskConical className="h-5 w-5" />
                        <span>Overview</span>
                      </div>
                      
                      <div className="flex items-center gap-3 text-lg text-black hover:text-[#d9c409] transition-colors cursor-pointer"
                        onMouseEnter={() => setHoveredTestService("Automotive")}>
                        <Car className="h-5 w-5" />
                        <span>Automotive</span>
                      </div>
                      
                      <div className="flex items-center gap-3 text-lg text-black hover:text-[#d9c409] transition-colors cursor-pointer"
                        onMouseEnter={() => setHoveredTestService("VCX")}>
                        <Smartphone className="h-5 w-5" />
                        <span>VCX</span>
                      </div>
                      
                      <div className="flex items-center gap-3 text-lg text-black hover:text-[#d9c409] transition-colors cursor-pointer"
                        onMouseEnter={() => setHoveredTestService("Image Quality")}>
                        <Camera className="h-5 w-5" />
                        <span>Image Quality</span>
                      </div>
                      
                      <div className="flex items-center gap-3 text-lg text-black hover:text-[#d9c409] transition-colors cursor-pointer"
                        onMouseEnter={() => setHoveredTestService("Standardized")}>
                        <CheckCircle className="h-5 w-5" />
                        <span>Standardized</span>
                      </div>
                      
                      <div className="flex items-center gap-3 text-lg text-black hover:text-[#d9c409] transition-colors cursor-pointer"
                        onMouseEnter={() => setHoveredTestService("Specialized/Custom")}>
                        <Settings className="h-5 w-5" />
                        <span>Specialized/Custom</span>
                      </div>
                    </div>
                    
                    {/* Right Column: Services */}
                    <div className="space-y-4 flex-1">
                      <h4 className="font-semibold mb-3 text-lg text-black">
                        {hoveredTestService ? `${hoveredTestService} - Services` : "Services"}
                      </h4>
                      
                      {/* Conditional Rendering of Services */}
                      {hoveredTestService && testServicesData[hoveredTestService as keyof typeof testServicesData] && (
                        <div className="space-y-3">
                          {testServicesData[hoveredTestService as keyof typeof testServicesData].services.map((service, index) => (
                            <div key={index} className={`flex items-center gap-3 text-lg transition-colors cursor-pointer text-black hover:text-[#d9c409] ${(service as any).active ? 'bg-green-100 p-2 rounded-md border-2 border-green-300' : ''}`}>
                              <ChevronRight className="h-4 w-4" />
                              {service.link === "#" ? (
                                <span>{service.name}</span>
                              ) : (
                                <Link to={service.link}>{service.name}</Link>
                              )}
                              {(service as any).active && (
                                <span className="ml-2 text-xs bg-green-200 text-green-800 px-2 py-1 rounded font-semibold">ACTIVE</span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* Default state when no service category is hovered */}
                      {!hoveredTestService && (
                        <div className="text-gray-500 text-center py-8">
                          <FlaskConical className="h-12 w-12 mx-auto mb-3 opacity-50" />
                          <p>Hover over a service category to see available tests</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* CTA Button */}
                  <div className="bg-[#f3f3f3] px-6 pt-6 pb-6">
                    <Link to="/inside-lab">
                      <Button variant="default" className="w-full bg-[#d9c409] text-black hover:bg-[#e5d825] hover:text-black">
                        <FlaskConical className="h-5 w-5 mr-3" />
                        <span className="text-lg font-medium">Visit Our Testing Lab</span>
                      </Button>
                    </Link>
                  </div>
                  
                  {/* Image Rollover under Flyout */}
                  {hoveredTestService && testServicesData[hoveredTestService as keyof typeof testServicesData] && (
                    <div className="bg-[#f3f3f3] p-4">
                      <div className="flex items-center gap-6 p-4 bg-white rounded-lg shadow-sm">
                        <img 
                          src={testServicesData[hoveredTestService as keyof typeof testServicesData].image} 
                          alt={hoveredTestService} 
                          className="w-[190px] h-[190px] object-cover rounded-lg" 
                        />
                        <div className="text-black">
                          <h4 className="font-semibold text-xl mb-2">{hoveredTestService}</h4>
                          <p className="text-lg text-gray-600 leading-relaxed">
                            {testServicesData[hoveredTestService as keyof typeof testServicesData].description}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </SimpleDropdown>

              <SimpleDropdown trigger="Training & Events" className="right-aligned">
                <div className="flex flex-col gap-2 w-[315px] max-w-[90vw] bg-[#f3f3f3] rounded-lg">
                   <div className="flex gap-6 p-6">
                     <div className="space-y-4 flex-1">
                       <h4 className="font-semibold mb-3 text-lg text-black">Resources</h4>
                       <div className="flex items-center gap-3 text-lg text-black hover:text-blue-400 transition-colors cursor-pointer">
                         <CustomTargetIcon className="h-5 w-5" />
                         <a href="#">Webinars</a>
                       </div>
                       <div className="flex items-center gap-3 text-lg text-black hover:text-blue-400 transition-colors cursor-pointer">
                         <CustomTargetIcon className="h-5 w-5" />
                         <a href="#">On-Site Training</a>
                       </div>
                       <div className="flex items-center gap-3 text-lg text-black hover:text-blue-400 transition-colors cursor-pointer">
                         <CustomTargetIcon className="h-5 w-5" />
                         <Link to="/inside-lab">Visit our Test Lab</Link>
                       </div>
                       <div className="flex items-center gap-3 text-lg text-black hover:text-blue-400 transition-colors cursor-pointer">
                         <CustomTargetIcon className="h-5 w-5" />
                         <a href="#">Event Schedule</a>
                       </div>
                     </div>
                   </div>

                  <div className="bg-[#f3f3f3] px-6 pt-6 pb-6">
                    <Link to="/events" className="bg-green-100 p-2 rounded-md border-2 border-green-300">
                      <Button variant="default" className="w-full bg-[#d9c409] text-black hover:bg-[#e5d825] hover:text-black">
                        <GraduationCap className="h-5 w-5 mr-3" />
                        <span className="text-lg font-medium">View Training & Events</span>
                        <span className="ml-2 text-xs bg-green-200 text-green-800 px-2 py-1 rounded">ACTIVE</span>
                      </Button>
                    </Link>
                  </div>
                </div>
              </SimpleDropdown>

              <SimpleDropdown trigger="Image Quality" className="right-aligned">
                <div className="flex flex-col gap-2 w-[600px] max-w-[90vw] bg-[#f3f3f3] rounded-lg">
                  <div className="flex gap-6 p-6">
                    <div className="space-y-4 flex-1 pr-6 border-r border-border">
                      <h4 className="font-semibold mb-3 text-lg text-black">Resources</h4>
                      <div className="flex items-center gap-3 text-lg text-black hover:text-blue-400 transition-colors cursor-pointer">
                        <CustomTargetIcon className="h-5 w-5" />
                        <a href="#">Image Quality Factors</a>
                      </div>
                      <div className="flex items-center gap-3 text-lg text-black hover:text-blue-400 transition-colors cursor-pointer">
                        <CustomTargetIcon className="h-5 w-5" />
                        <a href="#">Blog</a>
                      </div>
                      <div className="flex items-center gap-3 text-lg text-black hover:text-blue-400 transition-colors cursor-pointer">
                        <CustomTargetIcon className="h-5 w-5" />
                        <a href="#">International Standards</a>
                      </div>
                      <div className="flex items-center gap-3 text-lg text-black hover:text-blue-400 transition-colors cursor-pointer">
                        <CustomTargetIcon className="h-5 w-5" />
                        <a href="#">IE Technology</a>
                      </div>
                    </div>

                    <div className="space-y-4 flex-1">
                      <h4 className="font-semibold mb-3 text-lg text-black">Publications</h4>
                      <div className="flex items-center gap-3 text-lg text-black hover:text-blue-400 transition-colors cursor-pointer">
                        <CustomTargetIcon className="h-5 w-5" />
                        <a href="#">Conference Papers</a>
                      </div>
                      <div className="flex items-center gap-3 text-lg text-black hover:text-blue-400 transition-colors cursor-pointer">
                        <CustomTargetIcon className="h-5 w-5" />
                        <a href="#">White Papers & Theses</a>
                      </div>
                      <div className="flex items-center gap-3 text-lg text-black hover:text-blue-400 transition-colors cursor-pointer">
                        <CustomTargetIcon className="h-5 w-5" />
                        <a href="#">Video Archive</a>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#f3f3f3] px-6 pt-6 pb-6">
                    <Link to="/downloads" className="w-full">
                      <Button variant="technical" className="w-full" style={{ backgroundColor: '#103e7c', borderColor: '#103e7c', color: 'white' }}>
                        <Microscope className="h-5 w-5 mr-3" />
                        <span className="text-lg font-medium">Explore Image Quality Resources</span>
                        <span className="ml-2 text-xs bg-green-200 text-green-800 px-2 py-1 rounded font-bold">ACTIVE</span>
                      </Button>
                    </Link>
                  </div>
                </div>
            </SimpleDropdown>

            <SimpleDropdown trigger="Company" className="right-aligned">
                <div className="flex flex-col gap-2 w-[600px] max-w-[90vw] bg-[#f3f3f3] rounded-lg">
                   <div className="flex gap-8 p-6">
                       <div className="space-y-4 flex-1 pr-6 border-r border-border">
                         <h4 className="font-semibold mb-3 text-lg text-black">About IE</h4>
                         <Link to="/about" className="flex items-center gap-3 text-lg text-black hover:text-blue-400 transition-colors">
                           <CustomTargetIcon className="h-5 w-5" />
                           <span>About us</span>
                         </Link>
                         <Link to="/team" className="flex items-center gap-3 text-lg text-black hover:text-blue-400 transition-colors">
                           <CustomTargetIcon className="h-5 w-5" />
                           <span>Team</span>
                         </Link>
                         <Link to="/nynomic-group" className="flex items-center gap-3 text-lg text-black hover:text-blue-400 transition-colors">
                           <CustomTargetIcon className="h-5 w-5" />
                           <span>Nynomic Group</span>
                         </Link>
                         <Link to="/visit-us" className="flex items-center gap-3 text-lg text-black hover:text-blue-400 transition-colors">
                           <CustomTargetIcon className="h-5 w-5" />
                           <span>Visit Us</span>
                         </Link>
                         <Link to="/careers" className="flex items-center gap-3 text-lg text-black hover:text-blue-400 transition-colors">
                           <CustomTargetIcon className="h-5 w-5" />
                           <span>Careers</span>
                         </Link>
                       </div>
                       
                       <div className="space-y-4 flex-1">
                         <h4 className="font-semibold mb-3 text-lg text-black">Business & Partnerships</h4>
                         <Link to="/resellers-subsidiaries" className="flex items-center gap-3 text-lg text-black hover:text-blue-400 transition-colors">
                           <CustomTargetIcon className="h-5 w-5" />
                           <span>Resellers & Subsidiaries</span>
                         </Link>
                         <Link to="/strategic-partnerships" className="flex items-center gap-3 text-lg text-black hover:text-blue-400 transition-colors">
                           <CustomTargetIcon className="h-5 w-5" />
                           <span>Strategic Partnerships</span>
                         </Link>
                         <Link to="/group-memberships" className="flex items-center gap-3 text-lg text-black hover:text-blue-400 transition-colors">
                           <CustomTargetIcon className="h-5 w-5" />
                           <span>Group Memberships</span>
                         </Link>
                         <Link to="/iso-9001" className="flex items-center gap-3 text-lg text-black hover:text-blue-400 transition-colors">
                           <CustomTargetIcon className="h-5 w-5" />
                           <span>ISO 9001</span>
                         </Link>
                       </div>
                    </div>
                  </div>
                </SimpleDropdown>
          </div>
          
          {/* Utility Navigation - positioned at far right */}
          <div className="hidden 2xl:flex ml-auto">
            <UtilityNavigation />
          </div>

          {/* Mobile menu button - always on the right */}
          <div className="2xl:hidden ml-auto relative z-50">
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center justify-center w-10 h-10 bg-[#d9c409] text-black rounded-md hover:bg-[#c5b008] transition-colors shadow-lg"
            >
              {isOpen ? (
                <X size={22} className="stroke-[3]" />
              ) : (
                <Menu size={22} className="stroke-[3]" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation - positioned below navbar, right-aligned, 760px width */}
        <div className="2xl:hidden relative">
          {isOpen && (
            <>
              {/* Backdrop - but exclude the button area */}
              <div 
                className="fixed inset-0 bg-black/20 z-40"
                onClick={() => setIsOpen(false)}
              />
              
              {/* Mobile Menu */}
              <div className="absolute top-full right-0 w-[760px] max-w-[calc(100vw-2rem)] bg-white border border-gray-200 rounded-lg shadow-xl z-50 mt-2">
                {/* Navigation content */}
                <nav className="px-6 py-4">
                  <Accordion type="single" collapsible className="space-y-0">
                    
                    {/* Your Solution */}
                    <AccordionItem value="solutions" className="border-none">
                      <AccordionTrigger className="px-0 py-4 text-lg font-medium text-gray-900 hover:no-underline">
                        Your Solution
                      </AccordionTrigger>
                      <AccordionContent className="px-0 pb-4">
                        <div className="space-y-3">
                          <Link to="/automotive" className="block py-2 text-gray-700 hover:text-gray-900" onClick={() => setIsOpen(false)}>
                            Automotive Testing
                          </Link>
                          <Link to="/in-cabin-testing" className="block py-2 text-gray-700 hover:text-gray-900" onClick={() => setIsOpen(false)}>
                            In-Cabin Testing
                          </Link>
                          <div className="block py-2 text-gray-700">Machine Vision</div>
                          <div className="block py-2 text-gray-700">Mobile & Webcam</div>
                          <div className="block py-2 text-gray-700">Medical Imaging</div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    {/* Products */}
                    <AccordionItem value="products" className="border-none">
                      <AccordionTrigger className="px-0 py-4 text-lg font-medium text-gray-900 hover:no-underline">
                        Products
                      </AccordionTrigger>
                      <AccordionContent className="px-0 pb-4">
                        <div className="space-y-3">
                          <Link to="/charts" className="block py-2 text-gray-700 hover:text-gray-900" onClick={() => setIsOpen(false)}>
                            Test Charts
                          </Link>
                          <div className="block py-2 text-gray-700">Illumination Devices</div>
                          <div className="block py-2 text-gray-700">Measurement Devices</div>
                          <div className="block py-2 text-gray-700">Software & APIs</div>
                          <div className="block py-2 text-gray-700">Accessories</div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    {/* Test Services */}
                    <AccordionItem value="test-services" className="border-none">
                      <AccordionTrigger className="px-0 py-4 text-lg font-medium text-gray-900 hover:no-underline">
                        Test Services
                      </AccordionTrigger>
                      <AccordionContent className="px-0 pb-4">
                        <div className="space-y-3">
                          <Link to="/inside-lab" className="block py-2 text-gray-700 hover:text-gray-900" onClick={() => setIsOpen(false)}>
                            Our Lab
                          </Link>
                          <div className="block py-2 text-gray-700">Automotive Testing</div>
                          <div className="block py-2 text-gray-700">VCX Testing</div>
                          <div className="block py-2 text-gray-700">Image Quality Analysis</div>
                          <div className="block py-2 text-gray-700">Custom Testing</div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    {/* Resources */}
                    <AccordionItem value="resources" className="border-none">
                      <AccordionTrigger className="px-0 py-4 text-lg font-medium text-gray-900 hover:no-underline">
                        Resources
                      </AccordionTrigger>
                      <AccordionContent className="px-0 pb-4">
                        <div className="space-y-4">
                          <div>
                            <div className="font-medium text-gray-900 py-2">Downloads</div>
                            <p className="text-sm text-gray-600 mb-3">Access technical documents, datasheets and software downloads.</p>
                          </div>
                          <div>
                            <Link to="/news" className="font-medium text-gray-900 py-2 block hover:text-gray-700" onClick={() => setIsOpen(false)}>
                              News & Updates
                            </Link>
                            <p className="text-sm text-gray-600 mb-3">Stay informed about latest developments in image quality testing.</p>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    {/* Training & Events - Simple item without accordion */}
                    <div className="border-none">
                      <Link to="/events" className="flex items-center justify-between px-0 py-4 text-lg font-medium text-gray-900 hover:text-gray-700" onClick={() => setIsOpen(false)}>
                        Training & Events
                      </Link>
                    </div>

                    {/* About */}
                    <div className="border-none">
                      <div className="px-0 py-4 text-lg font-medium text-gray-900">
                        About
                      </div>
                    </div>

                  </Accordion>

                  {/* Bottom section with Search, Language Picker and Contact Button */}
                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <div className="flex items-center gap-4">
                      {/* Search Bar */}
                      <div className="flex-1">
                        <IntelligentSearchBar variant="mobile" />
                      </div>
                      
                      {/* Language Selector */}
                      <Select value="en" onValueChange={() => {}}>
                        <SelectTrigger className="w-[60px] bg-[#103e7c] border-[#103e7c] text-white hover:bg-[#0d3468] transition-all duration-300">
                          <SelectValue placeholder="EN" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
                          <SelectItem value="en" className="flex items-center gap-2 hover:bg-gray-100 cursor-pointer text-black">
                            EN
                          </SelectItem>
                          <SelectItem value="de" className="flex items-center gap-2 hover:bg-gray-100 cursor-pointer text-black">
                            DE
                          </SelectItem>
                          <SelectItem value="zh" className="flex items-center gap-2 hover:bg-gray-100 cursor-pointer text-black">
                            ZH
                          </SelectItem>
                          <SelectItem value="ja" className="flex items-center gap-2 hover:bg-gray-100 cursor-pointer text-black">
                            JA
                          </SelectItem>
                          <SelectItem value="ko" className="flex items-center gap-2 hover:bg-gray-100 cursor-pointer text-black">
                            KO
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      
                      {/* Contact Button */}
                      <Link to="/contact" onClick={() => setIsOpen(false)}>
                        <Button className="w-[60px] h-10 bg-[#d9c409] hover:bg-[#c4b108] text-black border border-[#d9c409] hover:border-[#c4b108] transition-all duration-300 flex items-center justify-center">
                          <MessageCircle className="h-5 w-5" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </nav>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
