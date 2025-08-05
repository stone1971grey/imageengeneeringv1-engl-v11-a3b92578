import { Button } from "@/components/ui/button";
import { Menu, X, Camera, Wrench, Building2, Download, Info, MessageCircle, Smartphone, Car, Tv, Shield, Cog, Stethoscope, ScanLine, FlaskConical, Monitor, Zap, Package, Lightbulb, Puzzle, Cpu, CheckCircle, Microscope, Target, BarChart3, Settings, Search } from "lucide-react";
import { useState } from "react";
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

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredIndustry, setHoveredIndustry] = useState<string | null>(null);
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);
  const [hoveredSolution, setHoveredSolution] = useState<string | null>(null);

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
    "Charts": {
      image: customChart,
      description: "High-precision test patterns and color charts for comprehensive image quality analysis"
    },
    "Equipment": {
      image: arcturusMainProduct,
      description: "Professional testing equipment including LED lighting systems and measurement devices"
    },
    "Software": {
      image: iqAnalyzerIntro,
      description: "Advanced software solutions for image analysis, calibration, and quality control"
    },
    "Product Bundles": {
      image: productBundleIeee,
      description: "Complete testing solutions combining hardware, software, and accessories"
    },
    "Solutions": {
      image: iqLedIllumination,
      description: "Complete lighting and illumination solutions for professional testing environments"
    },
    "Accessories": {
      image: chartCase,
      description: "Professional accessories including chart cases, mounts, and calibration tools"
    },
    "Technology": {
      image: technology2025,
      description: "Latest innovations and cutting-edge technology in image quality measurement"
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
      description: "For OEMs and research testing color reproduction and sharpness.",
      subline: "Suitable for: Mobile Industry, VCX Testing"
    },
    "Microscopy & Medical Imaging": {
      image: industryMedical,
      description: "For medical technology & life sciences.",
      subline: "Suitable for: Medical Devices, Endoscopy"
    },
    "ISO and IEEE Compliant Test Setups": {
      image: industryLabTesting,
      description: "For companies requiring standards-compliant environments.",
      subline: "Suitable for: Standards Compliance, Labs"
    }
  };

  const solutionPackages = {
    "Arcturus LED + Vega Software + Test Charts": {
      image: arcturusMainProduct,
      description: "Complete solution for lighting tests",
      subline: "Hardware + Software + Charts Bundle"
    },
    "Camera Calibration Package": {
      image: customChart,
      description: "Lighting system, charts, software – specially for calibrated testing",
      subline: "Calibration Complete Solution"
    },
    "Lab Complete Solution": {
      image: industryLabTesting,
      description: "For research institutions with hardware + analysis",
      subline: "Research Lab Complete Setup"
    },
    "Spectral Measurement & Analysis Set": {
      image: iqAnalyzerIntro,
      description: "Light source + evaluation + export functions",
      subline: "Spectral Analysis Complete Kit"
    }
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border py-12">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center hover:opacity-80 transition-opacity">
            <img src={logoIE} alt="Image Engineering" className="h-16 brightness-0 invert" />
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center flex-row gap-x-8">
            <NavigationMenu>
              <NavigationMenuList className="gap-x-8">
                <NavigationMenuItem className="mx-4">
                  <NavigationMenuTrigger className="px-4 py-2 rounded-md text-lg font-medium text-white hover:bg-[#E0F2FE] hover:text-black transition-colors duration-200 bg-transparent border-none h-auto">Find your solution</NavigationMenuTrigger>
                  <NavigationMenuContent className="bg-white p-[20px] border-0 shadow-none">
                    <div className="flex flex-col gap-2 w-[800px] bg-[#f3f3f3]">
                      {/* Main navigation grid */}
                      <div className="flex gap-8 p-6 h-[200px]">
                        {/* Left Column: Typische Anwendungen */}
                        <div className="space-y-4 flex-1">
                          <h4 className="font-semibold mb-3 flex items-center gap-2 text-lg text-black">
                            <Target className="h-6 w-6" />
                            Typical Applications
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
                            <CheckCircle className="h-6 w-6" />
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
                        
                        <Separator orientation="vertical" className="bg-black h-40" />
                        
                        {/* Right Column: Vorkonfigurierte Lösungspakete */}
                        <div className="space-y-4 flex-1">
                          <h4 className="font-semibold mb-3 flex items-center gap-2 text-lg text-black">
                            <Package className="h-6 w-6" />
                            Pre-configured Solution Packages
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
                            onMouseEnter={() => setHoveredSolution("Camera Calibration Package")}
                            onMouseLeave={() => setHoveredSolution(null)}
                          >
                            <Settings className="h-5 w-5" />
                            <span>Camera Calibration Package</span>
                          </div>
                          <div 
                            className="flex items-center gap-3 text-lg text-black hover:text-blue-400 transition-colors cursor-pointer"
                            onMouseEnter={() => setHoveredSolution("Lab Complete Solution")}
                            onMouseLeave={() => setHoveredSolution(null)}
                          >
                            <Microscope className="h-5 w-5" />
                            <span>Lab Complete Solution</span>
                          </div>
                          <div 
                            className="flex items-center gap-3 text-lg text-black hover:text-blue-400 transition-colors cursor-pointer"
                            onMouseEnter={() => setHoveredSolution("Spectral Measurement & Analysis Set")}
                            onMouseLeave={() => setHoveredSolution(null)}
                          >
                            <BarChart3 className="h-5 w-5" />
                            <span>Spectral Measurement & Analysis Set</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Solution-Finder CTA */}
                      <div className="bg-[#f3f3f3] px-6 pt-8 pb-8">
                        <div className="bg-blue-600 hover:bg-blue-700 p-4 rounded flex items-center justify-center transition-colors cursor-pointer">
                          <div className="flex items-center gap-3 text-white">
                            <Search className="h-5 w-5" />
                            <span className="text-lg font-medium">Need help choosing? → Start Solution Finder</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Image and description section */}
                      {hoveredSolution && (solutionData[hoveredSolution as keyof typeof solutionData] || solutionPackages[hoveredSolution as keyof typeof solutionPackages]) && (
                        <div className="bg-[#f3f3f3] p-4">
                          <div className="flex items-center gap-6 p-4 bg-white rounded">
                            <img 
                              src={(solutionData[hoveredSolution as keyof typeof solutionData] || solutionPackages[hoveredSolution as keyof typeof solutionPackages]).image} 
                              alt={hoveredSolution}
                              className="w-[190px] h-auto object-cover rounded"
                            />
                            <div className="text-black">
                              <h4 className="font-semibold text-xl">{hoveredSolution}</h4>
                              <p className="text-lg text-gray-600">{(solutionData[hoveredSolution as keyof typeof solutionData] || solutionPackages[hoveredSolution as keyof typeof solutionPackages]).description}</p>
                              <p className="text-sm text-blue-600 mt-1">{(solutionData[hoveredSolution as keyof typeof solutionData] || solutionPackages[hoveredSolution as keyof typeof solutionPackages]).subline}</p>
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
                  <NavigationMenuContent className="bg-white p-[20px] border-0 shadow-none">
                    <div className="flex flex-col gap-2 w-[800px] bg-[#f3f3f3]">
                      {/* Main navigation grid */}
                      <div className="flex gap-8 p-6 h-[200px]">
                        <div className="space-y-4 flex-1">
                          <div 
                            className="flex items-center gap-3 text-lg text-black hover:text-blue-400 transition-colors cursor-pointer"
                            onMouseEnter={() => setHoveredProduct("Charts")}
                            onMouseLeave={() => setHoveredProduct(null)}
                          >
                            <Camera className="h-6 w-6" />
                            <span>Charts</span>
                          </div>
                          <div 
                            className="flex items-center gap-3 text-lg text-black hover:text-blue-400 transition-colors cursor-pointer"
                            onMouseEnter={() => setHoveredProduct("Equipment")}
                            onMouseLeave={() => setHoveredProduct(null)}
                          >
                            <Zap className="h-6 w-6" />
                            <span>Equipment</span>
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
                            onMouseEnter={() => setHoveredProduct("Product Bundles")}
                            onMouseLeave={() => setHoveredProduct(null)}
                          >
                            <Package className="h-6 w-6" />
                            <span>Product Bundles</span>
                          </div>
                          <div 
                            className="flex items-center gap-3 text-lg text-black hover:text-blue-400 transition-colors cursor-pointer"
                            onMouseEnter={() => setHoveredProduct("Solutions")}
                            onMouseLeave={() => setHoveredProduct(null)}
                          >
                            <Lightbulb className="h-6 w-6" />
                            <span>Solutions</span>
                          </div>
                        </div>
                        
                        <Separator orientation="vertical" className="bg-black h-40" />
                        
                        <div className="space-y-4 flex-1">
                          <div 
                            className="flex items-center gap-3 text-lg text-black hover:text-blue-400 transition-colors cursor-pointer"
                            onMouseEnter={() => setHoveredProduct("Accessories")}
                            onMouseLeave={() => setHoveredProduct(null)}
                          >
                            <Puzzle className="h-6 w-6" />
                            <span>Accessories</span>
                          </div>
                          <div 
                            className="flex items-center gap-3 text-lg text-black hover:text-blue-400 transition-colors cursor-pointer"
                            onMouseEnter={() => setHoveredProduct("Technology")}
                            onMouseLeave={() => setHoveredProduct(null)}
                          >
                            <Cpu className="h-6 w-6" />
                            <span>Technology</span>
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
                  <NavigationMenuTrigger className="px-4 py-2 rounded-md text-lg font-medium text-white hover:bg-[#E0F2FE] hover:text-black transition-colors duration-200 bg-transparent border-none h-auto">Resources</NavigationMenuTrigger>
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
                  <NavigationMenuTrigger className="px-4 py-2 rounded-md text-lg font-medium text-white hover:bg-[#E0F2FE] hover:text-black transition-colors duration-200 bg-transparent border-none h-auto">About</NavigationMenuTrigger>
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
              Contact
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
