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
import { useTranslation } from "@/hooks/useTranslation";
import { useNavigationData } from "@/hooks/useNavigationData";

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
  const { t } = useTranslation();
  const navData = useNavigationData();
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredIndustry, setHoveredIndustry] = useState<string | null>(null);
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);
  const [hoveredSolution, setHoveredSolution] = useState<string | null>(null);
  const [hoveredTestService, setHoveredTestService] = useState<string | null>(null);

  // Prevent background scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

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

  // Industry data mapping with subgroups - now using translated data
  const industryData = {
    "Automotive": { ...navData.industries["Automotive"], image: industryAutomotive },
    "Security & Surveillance": { ...navData.industries["Security & Surveillance"], image: industrySecurity },
    "Mobile Phone": { ...navData.industries["Mobile Phone"], image: industryMobile },
    "Web Camera": { ...navData.industries["Web Camera"], image: industryBroadcast },
    "Machine Vision": { ...navData.industries["Machine Vision"], image: industryMachineVision },
    "Medical & Endoscopy": { ...navData.industries["Medical & Endoscopy"], image: industryMedical },
    "Scanners & Archiving": { ...navData.industries["Scanners & Archiving"], image: industryScanning },
    "Photo & Video": { ...navData.industries["Photo & Video"], image: industryPhotography }
  };
  
  // Product data mapping with subgroups - now using translated data
  const productData = {
    "Test Charts": { ...navData.products["Test Charts"], image: "/images/custom-chart.png" },
    "Illumination Devices": { ...navData.products["Illumination Devices"], image: iqLedIllumination },
    "Measurement Devices": { ...navData.products["Measurement Devices"], image: arcturusMainProduct },
    "Software & APIs": { ...navData.products["Software & APIs"], image: iqAnalyzerIntro },
    "Product Accessories": { ...navData.products["Product Accessories"], image: "/images/chart-case.png" }
  };
  
  // Solution data mapping - now using translated data
  const solutionData = {
    "Camera Quality Validation": { ...navData.solutions["Camera Quality Validation"], image: industryPhotography },
    "In-Cabin Performance Testing": { ...navData.solutions["In-Cabin Performance Testing"], image: industryAutomotive },
    "Test Environments for Smartphones & Displays": { ...navData.solutions["Test Environments for Smartphones & Displays"], image: industryMobile },
    "Microscopy & Medical Imaging": { ...navData.solutions["Microscopy & Medical Imaging"], image: industryMedical },
    "ISO and IEEE Compliant Test Setups": { ...navData.solutions["ISO and IEEE Compliant Test Setups"], image: industryLabTesting }
  };

  const solutionPackages = {
    "Arcturus HDR Test Bundle": { ...navData.solutionPackages["Arcturus HDR Test Bundle"], image: arcturusSetupVegaLaptop },
    "Arcturus LED + Vega Software + Test Charts": { ...navData.solutionPackages["Arcturus LED + Vega Software + Test Charts"], image: arcturusMainProduct },
    "Camera Calibration Package": { ...navData.solutionPackages["Camera Calibration Package"], image: "/images/custom-chart.png" },
    "Laboratory Complete Solution": { ...navData.solutionPackages["Laboratory Complete Solution"], image: industryLabTesting },
    "Spectral Measurement & Analysis Set": { ...navData.solutionPackages["Spectral Measurement & Analysis Set"], image: iqAnalyzerIntro }
  };
  
  // Target groups data mapping - now using translated data
  const targetGroupsData = {
    "Manufacturers": { ...navData.targetGroups["Manufacturers"], image: industryAutomotive },
    "Suppliers": { ...navData.targetGroups["Suppliers"], image: industryMachineVision },
    "Research Institutions": { ...navData.targetGroups["Research Institutions"], image: industryLabTesting }
  };
  
  // Test Services data mapping - now using translated data
  const testServicesData = {
    "Overview": { ...navData.testServices["Overview"], image: industryLabTesting },
    "Automotive": { ...navData.testServices["Automotive"], image: industryAutomotive },
    "VCX": { ...navData.testServices["VCX"], image: industryMobile },
    "Image Quality": { ...navData.testServices["Image Quality"], image: industryPhotography },
    "Standardized": { ...navData.testServices["Standardized"], image: industryLabTesting },
    "Specialized/Custom": { ...navData.testServices["Specialized/Custom"], image: industryMedical }
  };

  return (
    <nav className="fixed top-8 left-4 right-4 z-40 bg-[#4B4A4A]/95 backdrop-blur-sm rounded-xl shadow-lg border border-white/10">
      {/* Main Navigation with integrated Utility Navigation */}
      <div className="w-full px-6 py-6">
        {/* Single row - main nav left, utility right */}
        <div className="flex items-center justify-between w-full">
          {/* Main Navigation - moved to left */}
          <div className="hidden 2xl:flex items-center gap-6 ml-[300px]">
            <SimpleDropdown trigger={t.nav.yourSolution}>
                <div className="flex flex-col gap-2 w-[700px] max-w-[90vw] bg-[#f3f3f3] rounded-lg z-50"
                     onMouseLeave={() => setHoveredIndustry(null)}>
                  <div className="flex gap-6 p-6">
                    {/* Left Column: Industries */}
                    <div className="space-y-4 flex-1 pr-6 border-r border-border">
                       <h4 className="font-semibold mb-3 text-lg text-black">{t.nav.industries}</h4>
                       
                       <Link to="/automotive" className="flex items-center gap-3 text-lg text-black hover:text-[#d9c409] transition-colors cursor-pointer bg-green-100 p-2 rounded-md border-2 border-green-300"
                          onMouseEnter={() => setHoveredIndustry("Automotive")}>
                          <Car className="h-5 w-5" />
                          <span>{t.nav.automotive}</span>
                          <span className="ml-2 text-xs bg-green-200 text-green-800 px-2 py-1 rounded font-semibold">{t.nav.active}</span>
                       </Link>
                       
                       <div className="flex items-center gap-3 text-lg text-black hover:text-[#d9c409] transition-colors cursor-pointer"
                         onMouseEnter={() => setHoveredIndustry("Security & Surveillance")}>
                         <Shield className="h-5 w-5" />
                         <span>{t.nav.securitySurveillance}</span>
                       </div>
                       
                       <div className="flex items-center gap-3 text-lg text-black hover:text-[#d9c409] transition-colors cursor-pointer"
                         onMouseEnter={() => setHoveredIndustry("Mobile Phone")}>
                         <Smartphone className="h-5 w-5" />
                         <span>{t.nav.mobilePhone}</span>
                       </div>
                       
                       <div className="flex items-center gap-3 text-lg text-black hover:text-[#d9c409] transition-colors cursor-pointer"
                         onMouseEnter={() => setHoveredIndustry("Web Camera")}>
                         <Camera className="h-5 w-5" />
                         <span>{t.nav.webCamera}</span>
                       </div>
                       
                       <div className="flex items-center gap-3 text-lg text-black hover:text-[#d9c409] transition-colors cursor-pointer"
                         onMouseEnter={() => setHoveredIndustry("Machine Vision")}>
                         <Cog className="h-5 w-5" />
                         <span>{t.nav.machineVision}</span>
                       </div>
                       
                       <div className="flex items-center gap-3 text-lg text-black hover:text-[#d9c409] transition-colors cursor-pointer"
                         onMouseEnter={() => setHoveredIndustry("Medical & Endoscopy")}>
                         <Stethoscope className="h-5 w-5" />
                         <span>{t.nav.medicalEndoscopy}</span>
                       </div>
                       
                       <div className="flex items-center gap-3 text-lg text-black hover:text-[#d9c409] transition-colors cursor-pointer"
                         onMouseEnter={() => setHoveredIndustry("Scanners & Archiving")}>
                         <ScanLine className="h-5 w-5" />
                         <span>{t.nav.scannersArchiving}</span>
                       </div>
                       
                       <div className="flex items-center gap-3 text-lg text-black hover:text-[#d9c409] transition-colors cursor-pointer"
                         onMouseEnter={() => setHoveredIndustry("Photo & Video")}>
                         <Camera className="h-5 w-5" />
                         <span>{t.nav.photoVideo}</span>
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
                                  <span className="ml-2 text-xs bg-green-200 text-green-800 px-2 py-1 rounded font-semibold">{t.nav.active}</span>
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

            <SimpleDropdown trigger={t.nav.products}>
                <div className="flex flex-col gap-2 w-[700px] max-w-[90vw] bg-[#f3f3f3] rounded-lg z-50"
                     onMouseLeave={() => setHoveredProduct(null)}>
                  <div className="flex gap-6 p-6">
                    {/* Left Column: Product Groups */}
                    <div className="space-y-4 flex-1 pr-6 border-r border-border">
                      <h4 className="font-semibold mb-3 text-lg text-black">{t.nav.products}</h4>
                       
                       <Link to="/products/charts" className="flex items-center gap-3 text-lg text-black hover:text-[#d9c409] transition-colors cursor-pointer bg-green-100 p-2 rounded-md border-2 border-green-300"
                          onMouseEnter={() => setHoveredProduct("Test Charts")}>
                          <CustomTargetIcon className="h-5 w-5" />
                          <span>{t.nav.testCharts}</span>
                          <span className="ml-2 text-xs bg-green-200 text-green-800 px-2 py-1 rounded font-semibold">{t.nav.active}</span>
                       </Link>
                       
                       <div className="flex items-center gap-3 text-lg text-black hover:text-[#d9c409] transition-colors cursor-pointer"
                         onMouseEnter={() => setHoveredProduct("Illumination Devices")}>
                         <CustomTargetIcon className="h-5 w-5" />
                         <span>{t.nav.illuminationDevices}</span>
                       </div>
                       
                       <div className="flex items-center gap-3 text-lg text-black hover:text-[#d9c409] transition-colors cursor-pointer"
                         onMouseEnter={() => setHoveredProduct("Measurement Devices")}>
                         <CustomTargetIcon className="h-5 w-5" />
                         <span>{t.nav.measurementDevices}</span>
                       </div>
                       
                       <div className="flex items-center gap-3 text-lg text-black hover:text-[#d9c409] transition-colors cursor-pointer"
                         onMouseEnter={() => setHoveredProduct("Software & APIs")}>
                         <CustomTargetIcon className="h-5 w-5" />
                         <span>{t.nav.softwareApis}</span>
                       </div>
                       
                       <div className="flex items-center gap-3 text-lg text-black hover:text-[#d9c409] transition-colors cursor-pointer"
                         onMouseEnter={() => setHoveredProduct("Product Accessories")}>
                         <CustomTargetIcon className="h-5 w-5" />
                         <span>{t.nav.productAccessories}</span>
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
                      <Button variant="default" className="w-full bg-black text-white hover:bg-gray-800">
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

              <SimpleDropdown trigger={t.nav.testServices}>
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

              <SimpleDropdown trigger={t.nav.resources} className="right-aligned">
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

              <SimpleDropdown trigger={t.nav.about} className="right-aligned">
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

            <SimpleDropdown trigger={t.nav.company} className="right-aligned">
                <div className="flex flex-col gap-2 w-[600px] max-w-[90vw] bg-[#f3f3f3] rounded-lg">
                   <div className="flex gap-8 p-6">
                       <div className="space-y-4 flex-1 pr-6 border-r border-border">
                         <h4 className="font-semibold mb-3 text-lg text-black">About IE</h4>
                         <Link to="/news" className="flex items-center gap-3 text-lg text-black hover:text-blue-400 transition-colors">
                           <CustomTargetIcon className="h-5 w-5" />
                           <span>News</span>
                         </Link>
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
              <div className="absolute top-full right-0 w-full max-w-[800px] bg-white border border-gray-200 rounded-lg shadow-xl z-50 mt-[18px] max-h-[60vh] overflow-y-auto">
                {/* Navigation content */}
                <nav className="px-6 py-4">
                  <Accordion type="single" collapsible className="space-y-0">
                    
                    {/* Your Solution */}
                    <AccordionItem value="solutions" className="border-none">
                       <AccordionTrigger className="px-4 py-4 text-lg font-medium text-gray-900 hover:no-underline bg-gray-100 rounded-lg mx-2 mb-2 data-[state=open]:bg-[#4d4c4c] data-[state=open]:text-white">
                          {t.nav.yourSolution}
                       </AccordionTrigger>
                      <AccordionContent className="px-0 pb-4">
                        <div className="space-y-1">
                          <div className="font-medium text-gray-900 py-3 mb-2">{t.nav.industries}</div>
                          
                          {/* Automotive with sub-applications */}
                          <Accordion type="single" collapsible className="ml-2">
                            <AccordionItem value="automotive" className="border-none">
                               <AccordionTrigger className="px-2 py-2 text-gray-700 hover:text-gray-900 hover:no-underline bg-gray-200 rounded-lg mx-2 mb-2">
                                 <div className="flex items-center justify-between w-full">
                                    <Link to="/automotive" className="flex items-center gap-3 flex-1" onClick={() => setIsOpen(false)}>
                                      <Car className="h-4 w-4" />
                                      <span>{t.nav.automotive}</span>
                                      <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded font-semibold">{t.nav.active}</span>
                                    </Link>
                                 </div>
                               </AccordionTrigger>
                              <AccordionContent className="px-4 pb-2 bg-gray-100 mx-2 rounded-lg">
                                <div className="space-y-2">
                                  <Link to="/automotive" className="block py-2 text-sm text-gray-600 hover:text-gray-800" onClick={() => setIsOpen(false)}>
                                    Advanced Driver Assistance Systems (ADAS)
                                  </Link>
                                   <Link to="/in-cabin-testing" className="block py-2 text-sm text-gray-600 hover:text-gray-800" onClick={() => setIsOpen(false)}>
                                     In-Cabin Testing <span className="text-xs bg-green-200 text-green-800 px-1 py-0.5 rounded ml-1">ACTIVE</span>
                                   </Link>
                                  <div className="block py-2 text-sm text-gray-600">IEEE-P2020 Testing</div>
                                  <div className="block py-2 text-sm text-gray-600">High Dynamic Range (HDR)</div>
                                  <div className="block py-2 text-sm text-gray-600">Near-Infrared (NIR)</div>
                                  <div className="block py-2 text-sm text-gray-600">Geometric Calibration</div>
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          </Accordion>
                          
                          {/* Security & Surveillance */}
                          <Accordion type="single" collapsible className="ml-2">
                            <AccordionItem value="security" className="border-none">
                               <AccordionTrigger className="px-2 py-2 text-gray-700 hover:text-gray-900 hover:no-underline bg-gray-200 rounded-lg mx-2 mb-2">
                                 <div className="flex items-center justify-between w-full">
                                    <div className="flex items-center gap-3 flex-1 cursor-pointer">
                                      <Shield className="h-4 w-4" />
                                      <span>{t.nav.securitySurveillance}</span>
                                    </div>
                                 </div>
                               </AccordionTrigger>
                              <AccordionContent className="px-4 pb-2 bg-gray-100 mx-2 rounded-lg">
                                <div className="space-y-2">
                                  <div className="block py-2 text-sm text-gray-600">IEC 62676-5 Testing</div>
                                  <div className="block py-2 text-sm text-gray-600">Low-light (ISO 19093)</div>
                                  <div className="block py-2 text-sm text-gray-600">High Dynamic Range (HDR)</div>
                                  <div className="block py-2 text-sm text-gray-600">ISP Tuning</div>
                                  <div className="block py-2 text-sm text-gray-600">Spectral Sensitivities</div>
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          </Accordion>
                          
                          {/* Mobile Phone */}
                          <Accordion type="single" collapsible className="ml-2">
                            <AccordionItem value="mobile" className="border-none">
                               <AccordionTrigger className="px-2 py-2 text-gray-700 hover:text-gray-900 hover:no-underline bg-gray-200 rounded-lg mx-2 mb-2">
                                 <div className="flex items-center justify-between w-full">
                                    <div className="flex items-center gap-3 flex-1 cursor-pointer">
                                      <Smartphone className="h-4 w-4" />
                                      <span>{t.nav.mobilePhone}</span>
                                    </div>
                                 </div>
                               </AccordionTrigger>
                              <AccordionContent className="px-4 pb-2 bg-gray-100 mx-2 rounded-lg">
                                <div className="space-y-2">
                                  <div className="block py-2 text-sm text-gray-600">VCX PhoneCam</div>
                                  <div className="block py-2 text-sm text-gray-600">Color Calibration</div>
                                  <div className="block py-2 text-sm text-gray-600">Camera Stabilization</div>
                                  <div className="block py-2 text-sm text-gray-600">ISP Tuning</div>
                                  <div className="block py-2 text-sm text-gray-600">Timing Measurements</div>
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          </Accordion>
                          
                          {/* Web Camera */}
                          <Accordion type="single" collapsible className="ml-2">
                            <AccordionItem value="webcam" className="border-none">
                               <AccordionTrigger className="px-2 py-2 text-gray-700 hover:text-gray-900 hover:no-underline bg-gray-200 rounded-lg mx-2 mb-2">
                                 <div className="flex items-center justify-between w-full">
                                    <div className="flex items-center gap-3 flex-1 cursor-pointer">
                                      <Camera className="h-4 w-4" />
                                      <span>{t.nav.webCamera}</span>
                                    </div>
                                 </div>
                               </AccordionTrigger>
                              <AccordionContent className="px-4 pb-2 bg-gray-100 mx-2 rounded-lg">
                                <div className="space-y-2">
                                  <div className="block py-2 text-sm text-gray-600">VCX WebCam</div>
                                  <div className="block py-2 text-sm text-gray-600">ISP Tuning</div>
                                  <div className="block py-2 text-sm text-gray-600">Color Calibration</div>
                                  <div className="block py-2 text-sm text-gray-600">Timing Measurements</div>
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          </Accordion>
                          
                          {/* Machine Vision */}
                          <Accordion type="single" collapsible className="ml-2">
                            <AccordionItem value="machine-vision" className="border-none">
                               <AccordionTrigger className="px-2 py-2 text-gray-700 hover:text-gray-900 hover:no-underline bg-gray-200 rounded-lg mx-2 mb-2">
                                 <div className="flex items-center justify-between w-full">
                                    <div className="flex items-center gap-3 flex-1 cursor-pointer">
                                      <Cog className="h-4 w-4" />
                                      <span>{t.nav.machineVision}</span>
                                    </div>
                                 </div>
                               </AccordionTrigger>
                              <AccordionContent className="px-4 pb-2 bg-gray-100 mx-2 rounded-lg">
                                <div className="space-y-2">
                                  <div className="block py-2 text-sm text-gray-600">EMVA 1288 (ISO 24942)</div>
                                  <div className="block py-2 text-sm text-gray-600">Production Line Calibration</div>
                                  <div className="block py-2 text-sm text-gray-600">Lens Distortion</div>
                                  <div className="block py-2 text-sm text-gray-600">Signal-to-Noise Ratio (SNR)</div>
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          </Accordion>
                          
                          {/* Medical & Endoscopy */}
                          <Accordion type="single" collapsible className="ml-2">
                            <AccordionItem value="medical" className="border-none">
                               <AccordionTrigger className="px-2 py-2 text-gray-700 hover:text-gray-900 hover:no-underline bg-gray-200 rounded-lg mx-2 mb-2">
                                 <div className="flex items-center justify-between w-full">
                                    <div className="flex items-center gap-3 flex-1 cursor-pointer">
                                      <Stethoscope className="h-4 w-4" />
                                      <span>{t.nav.medicalEndoscopy}</span>
                                    </div>
                                 </div>
                               </AccordionTrigger>
                              <AccordionContent className="px-4 pb-2 bg-gray-100 mx-2 rounded-lg">
                                <div className="space-y-2">
                                  <div className="block py-2 text-sm text-gray-600">Color Calibration</div>
                                  <div className="block py-2 text-sm text-gray-600">Low-Light Testing</div>
                                  <div className="block py-2 text-sm text-gray-600">Optical Distortion</div>
                                  <div className="block py-2 text-sm text-gray-600">ISP Tuning</div>
                                  <div className="block py-2 text-sm text-gray-600">Endoscopic Illumination</div>
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          </Accordion>
                          
                          {/* Scanners & Archiving */}
                          <Accordion type="single" collapsible className="ml-2">
                            <AccordionItem value="scanning" className="border-none">
                               <AccordionTrigger className="px-2 py-2 text-gray-700 hover:text-gray-900 hover:no-underline bg-gray-200 rounded-lg mx-2 mb-2">
                                 <div className="flex items-center justify-between w-full">
                                    <div className="flex items-center gap-3 flex-1 cursor-pointer">
                                      <ScanLine className="h-4 w-4" />
                                      <span>{t.nav.scannersArchiving}</span>
                                    </div>
                                 </div>
                               </AccordionTrigger>
                              <AccordionContent className="px-4 pb-2 bg-gray-100 mx-2 rounded-lg">
                                <div className="space-y-2">
                                  <div className="block py-2 text-sm text-gray-600">ISO 21550</div>
                                  <div className="block py-2 text-sm text-gray-600">Universal Test Target</div>
                                  <div className="block py-2 text-sm text-gray-600">Multispectral Illumination</div>
                                  <div className="block py-2 text-sm text-gray-600">Scanner Dynamic Range</div>
                                  <div className="block py-2 text-sm text-gray-600">Spectral Sensitivities</div>
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          </Accordion>
                          
                          {/* Photo & Video */}
                          <Accordion type="single" collapsible className="ml-2">
                            <AccordionItem value="photo-video" className="border-none">
                               <AccordionTrigger className="px-2 py-2 text-gray-700 hover:text-gray-900 hover:no-underline bg-gray-200 rounded-lg mx-2 mb-2">
                                 <div className="flex items-center justify-between w-full">
                                    <div className="flex items-center gap-3 flex-1 cursor-pointer">
                                      <Camera className="h-4 w-4" />
                                      <span>{t.nav.photoVideo}</span>
                                    </div>
                                 </div>
                              </AccordionTrigger>
                              <AccordionContent className="px-4 pb-2 bg-gray-100 mx-2 rounded-lg">
                                <div className="space-y-2">
                                  <div className="block py-2 text-sm text-gray-600">Broadcast & HDTV</div>
                                  <div className="block py-2 text-sm text-gray-600">Spectral Sensitivities</div>
                                  <div className="block py-2 text-sm text-gray-600">ISP Tuning</div>
                                  <div className="block py-2 text-sm text-gray-600">iQ-LED Illumination</div>
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          </Accordion>
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-200 mx-2">
                          <Link to="/industries" onClick={() => setIsOpen(false)}>
                            <Button className="w-full bg-[#d9c409] text-black hover:bg-[#e5d825] rounded-lg font-medium">
                              <Search className="h-4 w-4 mr-2" />
                              <span className="hidden sm:inline">Find Your Perfect Solution</span>
                              <span className="sm:hidden">Your Perfect Solution</span>
                            </Button>
                          </Link>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    {/* Products */}
                    <AccordionItem value="products" className="border-none">
                       <AccordionTrigger className="px-4 py-4 text-lg font-medium text-gray-900 hover:no-underline bg-gray-100 rounded-lg mx-2 mb-2 data-[state=open]:bg-[#4d4c4c] data-[state=open]:text-white">
                          Products
                        </AccordionTrigger>
                      <AccordionContent className="px-0 pb-4">
                        <div className="space-y-2">
                          <div className="font-medium text-gray-900 py-3 mb-2">Product Groups</div>
                          
                          {/* Test Charts with subgroups */}
                          <Accordion type="single" collapsible className="ml-2">
                            <AccordionItem value="test-charts" className="border-none">
                               <AccordionTrigger className="px-2 py-2 text-gray-700 hover:text-gray-900 hover:no-underline bg-gray-200 rounded-lg mx-2 mb-2">
                                 <div className="flex items-center justify-between w-full">
                                   <Link to="/charts" className="flex items-center gap-3 flex-1" onClick={() => setIsOpen(false)}>
                                     <CustomTargetIcon className="h-4 w-4" />
                                     <span>Test Charts</span>
                                     <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded font-semibold">ACTIVE</span>
                                   </Link>
                                 </div>
                               </AccordionTrigger>
                              <AccordionContent className="px-4 pb-2 bg-gray-100 mx-2 rounded-lg">
                                <div className="space-y-2">
                                  <div className="block py-2 text-sm text-gray-600">iQ-Analyzer-X</div>
                                  <div className="block py-2 text-sm text-gray-600">Multipurpose</div>
                                  <div className="block py-2 text-sm text-gray-600">Image Quality Factor</div>
                                  <div className="block py-2 text-sm text-gray-600">Infrared (VIS-IR)</div>
                                  <Link to="/charts" className="block py-2 text-sm text-gray-600 hover:text-gray-800" onClick={() => setIsOpen(false)}>
                                    Reflective
                                  </Link>
                                  <div className="block py-2 text-sm text-gray-600">Transparent</div>
                                  <Link to="/charts" className="block py-2 text-sm text-gray-600 hover:text-gray-800" onClick={() => setIsOpen(false)}>
                                    See All Charts
                                  </Link>
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          </Accordion>
                          
                          {/* Illumination Devices */}
                          <Accordion type="single" collapsible className="ml-2">
                            <AccordionItem value="illumination" className="border-none">
                               <AccordionTrigger className="px-2 py-2 text-gray-700 hover:text-gray-900 hover:no-underline bg-gray-200 rounded-lg mx-2 mb-2">
                                 <div className="flex items-center justify-between w-full">
                                   <div className="flex items-center gap-3 flex-1 cursor-pointer">
                                     <CustomTargetIcon className="h-4 w-4" />
                                     <span>Illumination Devices</span>
                                   </div>
                                 </div>
                               </AccordionTrigger>
                              <AccordionContent className="px-4 pb-2 bg-gray-100 mx-2 rounded-lg">
                                <div className="space-y-2">
                                  <div className="block py-2 text-sm text-gray-600">iQ-LED</div>
                                  <div className="block py-2 text-sm text-gray-600">IEEE-P2020</div>
                                  <div className="block py-2 text-sm text-gray-600">Production Line Calibration</div>
                                  <div className="block py-2 text-sm text-gray-600">Flicker (PWM/MMP)</div>
                                  <div className="block py-2 text-sm text-gray-600">Test Chart Illumination</div>
                                  <div className="block py-2 text-sm text-gray-600">All Light Sources</div>
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          </Accordion>
                          
                          {/* Measurement Devices */}
                          <Accordion type="single" collapsible className="ml-2">
                            <AccordionItem value="measurement" className="border-none">
                               <AccordionTrigger className="px-2 py-2 text-gray-700 hover:text-gray-900 hover:no-underline bg-gray-200 rounded-lg mx-2 mb-2">
                                 <div className="flex items-center justify-between w-full">
                                   <div className="flex items-center gap-3 flex-1 cursor-pointer">
                                     <CustomTargetIcon className="h-4 w-4" />
                                     <span>Measurement Devices</span>
                                   </div>
                                 </div>
                               </AccordionTrigger>
                              <AccordionContent className="px-4 pb-2 bg-gray-100 mx-2 rounded-lg">
                                <div className="space-y-2">
                                  <div className="block py-2 text-sm text-gray-600">Geometric Calibration</div>
                                  <div className="block py-2 text-sm text-gray-600">Timing Performance</div>
                                  <div className="block py-2 text-sm text-gray-600">Climate-Controlled</div>
                                  <div className="block py-2 text-sm text-gray-600">Machine Vision</div>
                                  <div className="block py-2 text-sm text-gray-600">Spectral Sensitivity</div>
                                  <div className="block py-2 text-sm text-gray-600">All Measurement Devices</div>
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          </Accordion>
                          
                          {/* Software & APIs */}
                          <Accordion type="single" collapsible className="ml-2">
                            <AccordionItem value="software" className="border-none">
                               <AccordionTrigger className="px-2 py-2 text-gray-700 hover:text-gray-900 hover:no-underline bg-gray-200 rounded-lg mx-2 mb-2">
                                 <div className="flex items-center justify-between w-full">
                                   <div className="flex items-center gap-3 flex-1 cursor-pointer">
                                     <CustomTargetIcon className="h-4 w-4" />
                                     <span>Software & APIs</span>
                                   </div>
                                 </div>
                               </AccordionTrigger>
                              <AccordionContent className="px-4 pb-2 bg-gray-100 mx-2 rounded-lg">
                                <div className="space-y-2">
                                  <div className="block py-2 text-sm text-gray-600">iQ-Analyzer-X</div>
                                  <div className="block py-2 text-sm text-gray-600">Control APIs</div>
                                  <div className="block py-2 text-sm text-gray-600">iQ-Luminance</div>
                                  <div className="block py-2 text-sm text-gray-600">All Software & APIs</div>
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          </Accordion>
                          
                          {/* Product Accessories */}
                          <Accordion type="single" collapsible className="ml-2">
                            <AccordionItem value="accessories" className="border-none">
                               <AccordionTrigger className="px-2 py-2 text-gray-700 hover:text-gray-900 hover:no-underline bg-gray-200 rounded-lg mx-2 mb-2">
                                 <div className="flex items-center justify-between w-full">
                                   <div className="flex items-center gap-3 flex-1 cursor-pointer">
                                     <CustomTargetIcon className="h-4 w-4" />
                                     <span>Product Accessories</span>
                                   </div>
                                 </div>
                               </AccordionTrigger>
                              <AccordionContent className="px-4 pb-2 bg-gray-100 mx-2 rounded-lg">
                                <div className="space-y-2">
                                  <div className="block py-2 text-sm text-gray-600">Storage & Transport</div>
                                  <div className="block py-2 text-sm text-gray-600">Luxmeters</div>
                                  <div className="block py-2 text-sm text-gray-600">Camera Alignment</div>
                                  <div className="block py-2 text-sm text-gray-600">Test Chart Mounts</div>
                                  <div className="block py-2 text-sm text-gray-600">VCX & Webcam</div>
                                  <div className="block py-2 text-sm text-gray-600">All Accessories</div>
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          </Accordion>
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-200 mx-2">
                          <Link to="/inside-lab" onClick={() => setIsOpen(false)}>
                            <Button className="w-full bg-black text-white hover:bg-gray-800 rounded-lg font-medium">
                              <Microscope className="h-4 w-4 mr-2" />
                              Inside the Testing Lab
                            </Button>
                          </Link>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    {/* Test Lab */}
                    <AccordionItem value="test-lab" className="border-none">
                       <AccordionTrigger className="px-4 py-4 text-lg font-medium text-gray-900 hover:no-underline bg-gray-100 rounded-lg mx-2 mb-2 data-[state=open]:bg-[#4d4c4c] data-[state=open]:text-white">
                          Test Lab
                        </AccordionTrigger>
                      <AccordionContent className="px-0 pb-4">
                        <div className="space-y-2">
                          <div className="font-medium text-gray-900 py-3 mb-2">Test Services</div>
                          
                          {/* Overview */}
                          <Accordion type="single" collapsible className="ml-2">
                            <AccordionItem value="overview" className="border-none">
                              <AccordionTrigger className="px-2 py-2 text-gray-700 hover:text-gray-900 hover:no-underline bg-gray-200 rounded-lg mx-2 mb-2">
                                <div className="flex items-center gap-3">
                                  <CustomTargetIcon className="h-4 w-4" />
                                  <span>Overview</span>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent className="px-4 pb-2 bg-gray-100 mx-2 rounded-lg">
                                <div className="space-y-2">
                                  <Link to="/inside-lab" className="block py-2 text-sm text-gray-600 hover:text-gray-800" onClick={() => setIsOpen(false)}>
                                    Learn about the Lab
                                  </Link>
                                  <div className="block py-2 text-sm text-gray-600">Testing Consultation</div>
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          </Accordion>
                          
                           {/* Automotive */}
                           <Accordion type="single" collapsible className="ml-2">
                             <AccordionItem value="auto-test" className="border-none">
                               <AccordionTrigger className="px-2 py-2 text-gray-700 hover:text-gray-900 hover:no-underline bg-gray-200 rounded-lg mx-2 mb-2">
                                 <div className="flex items-center justify-between w-full">
                                   <Link to="/automotive" className="flex items-center gap-3 flex-1" onClick={() => setIsOpen(false)}>
                                      <CustomTargetIcon className="h-4 w-4" />
                                     <span>Automotive</span>
                                   </Link>
                                 </div>
                               </AccordionTrigger>
                              <AccordionContent className="px-4 pb-2 bg-gray-100 mx-2 rounded-lg">
                                <div className="space-y-2">
                                  <div className="block py-2 text-sm text-gray-600">camPAS</div>
                                   <Link to="/in-cabin-testing" className="block py-2 text-sm text-gray-600 hover:text-gray-800" onClick={() => setIsOpen(false)}>
                                     In-Cabin Testing <span className="text-xs bg-green-200 text-green-800 px-1 py-0.5 rounded ml-1">ACTIVE</span>
                                   </Link>
                                  <div className="block py-2 text-sm text-gray-600">HDR Testing</div>
                                  <div className="block py-2 text-sm text-gray-600">Geometric Calibration</div>
                                  <div className="block py-2 text-sm text-gray-600">Baseline Evaluations</div>
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          </Accordion>
                          
                          {/* VCX */}
                          <Accordion type="single" collapsible className="ml-2">
                            <AccordionItem value="vcx-test" className="border-none">
                              <AccordionTrigger className="px-2 py-2 text-gray-700 hover:text-gray-900 hover:no-underline bg-gray-200 rounded-lg mx-2 mb-2">
                                <div className="flex items-center gap-3">
                                  <CustomTargetIcon className="h-4 w-4" />
                                  <span>VCX</span>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent className="px-4 pb-2 bg-gray-100 mx-2 rounded-lg">
                                <div className="space-y-2">
                                  <div className="block py-2 text-sm text-gray-600">VCX - PhoneCam</div>
                                  <div className="block py-2 text-sm text-gray-600">VCX - WebCam</div>
                                  <div className="block py-2 text-sm text-gray-600">Color Characterizations</div>
                                  <div className="block py-2 text-sm text-gray-600">Baseline Evaluations</div>
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          </Accordion>
                          
                          {/* Image Quality */}
                          <Accordion type="single" collapsible className="ml-2">
                            <AccordionItem value="iq-test" className="border-none">
                              <AccordionTrigger className="px-2 py-2 text-gray-700 hover:text-gray-900 hover:no-underline bg-gray-200 rounded-lg mx-2 mb-2">
                                <div className="flex items-center gap-3">
                                  <CustomTargetIcon className="h-4 w-4" />
                                  <span>Image Quality</span>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent className="px-4 pb-2 bg-gray-100 mx-2 rounded-lg">
                                <div className="space-y-2">
                                  <div className="block py-2 text-sm text-gray-600">Resolution & Texture Loss</div>
                                  <div className="block py-2 text-sm text-gray-600">Dynamic Range (OECF)</div>
                                  <div className="block py-2 text-sm text-gray-600">Lens Distortion</div>
                                  <div className="block py-2 text-sm text-gray-600">Image Shading & Flare</div>
                                  <div className="block py-2 text-sm text-gray-600">Color Accuracy</div>
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          </Accordion>
                          
                          {/* Standardized */}
                          <Accordion type="single" collapsible className="ml-2">
                            <AccordionItem value="standardized" className="border-none">
                              <AccordionTrigger className="px-2 py-2 text-gray-700 hover:text-gray-900 hover:no-underline bg-gray-200 rounded-lg mx-2 mb-2">
                                <div className="flex items-center gap-3">
                                  <CustomTargetIcon className="h-4 w-4" />
                                  <span>Standardized</span>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent className="px-4 pb-2 bg-gray-100 mx-2 rounded-lg">
                                <div className="space-y-2">
                                  <div className="block py-2 text-sm text-gray-600">IEEE-P2020 (ADAS)</div>
                                  <div className="block py-2 text-sm text-gray-600">VCX (Mobile/Webcam)</div>
                                  <div className="block py-2 text-sm text-gray-600">IEC 62676-5 (Security)</div>
                                  <div className="block py-2 text-sm text-gray-600">EMVA 1288 (Machine Vision)</div>
                                  <div className="block py-2 text-sm text-gray-600">ISO 12233 (SFR)</div>
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          </Accordion>
                          
                          {/* Specialized/Custom */}
                          <Accordion type="single" collapsible className="ml-2">
                            <AccordionItem value="custom" className="border-none">
                              <AccordionTrigger className="px-2 py-2 text-gray-700 hover:text-gray-900 hover:no-underline bg-gray-200 rounded-lg mx-2 mb-2">
                                <div className="flex items-center gap-3">
                                  <CustomTargetIcon className="h-4 w-4" />
                                  <span>Specialized/Custom</span>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent className="px-4 pb-2 bg-gray-100 mx-2 rounded-lg">
                                <div className="space-y-2">
                                  <div className="block py-2 text-sm text-gray-600">Baseline Evaluations</div>
                                  <div className="block py-2 text-sm text-gray-600">Proof of Concepts</div>
                                  <div className="block py-2 text-sm text-gray-600">Luminance Calibrations</div>
                                  <div className="block py-2 text-sm text-gray-600">Sample-to-Sample Deviations</div>
                                  <div className="block py-2 text-sm text-gray-600">Development Validation Tests</div>
                                  <div className="block py-2 text-sm text-gray-600">Temperature-Controlled</div>
                                  <div className="block py-2 text-sm text-gray-600">Underwater Tests</div>
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          </Accordion>
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-200 mx-2">
                          <Link to="/inside-lab" onClick={() => setIsOpen(false)}>
                            <Button className="w-full bg-[#d9c409] text-black hover:bg-[#e5d825] rounded-lg font-medium">
                              <FlaskConical className="h-4 w-4 mr-2" />
                              Visit Our Testing Lab
                            </Button>
                          </Link>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    {/* Training & Events */}
                    <AccordionItem value="training-events" className="border-none">
                       <AccordionTrigger className="px-4 py-4 text-lg font-medium text-gray-900 hover:no-underline bg-gray-100 rounded-lg mx-2 mb-2 data-[state=open]:bg-[#4d4c4c] data-[state=open]:text-white">
                          Training & Events
                        </AccordionTrigger>
                      <AccordionContent className="px-0 pb-4">
                        <div className="space-y-4">
                          <div className="font-medium text-gray-900 py-3 mb-2">Resources</div>
                          <div className="flex items-center gap-3 py-2 text-gray-700 hover:text-gray-900 px-2 bg-gray-200 rounded-lg mx-2 mb-2">
                            <CustomTargetIcon className="h-4 w-4" />
                            <span>Webinars</span>
                          </div>
                          <div className="flex items-center gap-3 py-2 text-gray-700 hover:text-gray-900 px-2 bg-gray-200 rounded-lg mx-2 mb-2">
                            <CustomTargetIcon className="h-4 w-4" />
                            <span>On-Site Training</span>
                          </div>
                          <Link to="/inside-lab" className="flex items-center gap-3 py-2 text-gray-700 hover:text-gray-900 px-2 bg-gray-200 rounded-lg mx-2 mb-2" onClick={() => setIsOpen(false)}>
                            <CustomTargetIcon className="h-4 w-4" />
                            <span>Visit our Test Lab</span>
                          </Link>
                          <div className="flex items-center gap-3 py-2 text-gray-700 hover:text-gray-900 px-2 bg-gray-200 rounded-lg mx-2 mb-2">
                            <CustomTargetIcon className="h-4 w-4" />
                            <span>Event Schedule</span>
                          </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-200 mx-2">
                          <Link to="/events" onClick={() => setIsOpen(false)}>
                            <Button className="w-full bg-[#d9c409] text-black hover:bg-[#e5d825] rounded-lg font-medium">
                              <GraduationCap className="h-4 w-4 mr-2" />
                              View Training & Events
                              <span className="ml-2 text-xs bg-green-200 text-green-800 px-2 py-1 rounded">ACTIVE</span>
                            </Button>
                          </Link>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    {/* Image Quality */}
                    <AccordionItem value="image-quality" className="border-none">
                       <AccordionTrigger className="px-4 py-4 text-lg font-medium text-gray-900 hover:no-underline bg-gray-100 rounded-lg mx-2 mb-2 data-[state=open]:bg-[#4d4c4c] data-[state=open]:text-white">
                          Image Quality
                        </AccordionTrigger>
                      <AccordionContent className="px-0 pb-4">
                        <div className="space-y-4">
                          <div className="font-medium text-gray-900 py-3 mb-2">Resources</div>
                          <div className="flex items-center gap-3 py-2 text-gray-700 hover:text-gray-900 px-2 bg-gray-200 rounded-lg mx-2 mb-2">
                            <CustomTargetIcon className="h-4 w-4" />
                            <span>Image Quality Factors</span>
                          </div>
                          <div className="flex items-center gap-3 py-2 text-gray-700 hover:text-gray-900 px-2 bg-gray-200 rounded-lg mx-2 mb-2">
                            <CustomTargetIcon className="h-4 w-4" />
                            <span>Blog</span>
                          </div>
                          <div className="flex items-center gap-3 py-2 text-gray-700 hover:text-gray-900 px-2 bg-gray-200 rounded-lg mx-2 mb-2">
                            <CustomTargetIcon className="h-4 w-4" />
                            <span>International Standards</span>
                          </div>
                          <div className="flex items-center gap-3 py-2 text-gray-700 hover:text-gray-900 px-2 bg-gray-200 rounded-lg mx-2 mb-2">
                            <CustomTargetIcon className="h-4 w-4" />
                            <span>IE Technology</span>
                          </div>
                          <div className="font-medium text-gray-900 py-3 mb-2 mt-4">Publications</div>
                          <div className="flex items-center gap-3 py-2 text-gray-700 hover:text-gray-900 px-2 bg-gray-200 rounded-lg mx-2 mb-2">
                            <CustomTargetIcon className="h-4 w-4" />
                            <span>Conference Papers</span>
                          </div>
                          <div className="flex items-center gap-3 py-2 text-gray-700 hover:text-gray-900 px-2 bg-gray-200 rounded-lg mx-2 mb-2">
                            <CustomTargetIcon className="h-4 w-4" />
                            <span>White Papers & Theses</span>
                          </div>
                          <div className="flex items-center gap-3 py-2 text-gray-700 hover:text-gray-900 px-2 bg-gray-200 rounded-lg mx-2 mb-2">
                            <CustomTargetIcon className="h-4 w-4" />
                            <span>Video Archive</span>
                          </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-200 mx-2">
                          <Link to="/downloads" onClick={() => setIsOpen(false)}>
                            <Button className="w-full bg-[#103e7c] text-white hover:bg-[#0d3468] rounded-lg font-medium">
                              <Microscope className="h-4 w-4 mr-2" />
                              <span className="hidden sm:inline">Explore Image Quality Resources</span>
                              <span className="sm:hidden">Quality Resources</span>
                              <span className="ml-2 text-xs bg-green-200 text-green-800 px-2 py-1 rounded font-bold">ACTIVE</span>
                            </Button>
                          </Link>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    {/* Company */}
                    <AccordionItem value="company" className="border-none">
                       <AccordionTrigger className="px-4 py-4 text-lg font-medium text-gray-900 hover:no-underline bg-gray-100 rounded-lg mx-2 mb-2 data-[state=open]:bg-[#4d4c4c] data-[state=open]:text-white">
                          Company
                        </AccordionTrigger>
                      <AccordionContent className="px-0 pb-4">
                        <div className="space-y-4">
                          <div className="font-medium text-gray-900 py-3 mb-2">About IE</div>
                          <Link to="/news" className="flex items-center gap-3 py-2 text-gray-700 hover:text-gray-900 px-2 bg-gray-200 rounded-lg mx-2 mb-2" onClick={() => setIsOpen(false)}>
                            <CustomTargetIcon className="h-4 w-4" />
                            <span>News</span>
                          </Link>
                          <Link to="/about" className="flex items-center gap-3 py-2 text-gray-700 hover:text-gray-900 px-2 bg-gray-200 rounded-lg mx-2 mb-2" onClick={() => setIsOpen(false)}>
                            <CustomTargetIcon className="h-4 w-4" />
                            <span>About us</span>
                          </Link>
                          <Link to="/team" className="flex items-center gap-3 py-2 text-gray-700 hover:text-gray-900 px-2 bg-gray-200 rounded-lg mx-2 mb-2" onClick={() => setIsOpen(false)}>
                            <CustomTargetIcon className="h-4 w-4" />
                            <span>Team</span>
                          </Link>
                          <Link to="/nynomic-group" className="flex items-center gap-3 py-2 text-gray-700 hover:text-gray-900 px-2 bg-gray-200 rounded-lg mx-2 mb-2" onClick={() => setIsOpen(false)}>
                            <CustomTargetIcon className="h-4 w-4" />
                            <span>Nynomic Group</span>
                          </Link>
                          <Link to="/visit-us" className="flex items-center gap-3 py-2 text-gray-700 hover:text-gray-900 px-2 bg-gray-200 rounded-lg mx-2 mb-2" onClick={() => setIsOpen(false)}>
                            <CustomTargetIcon className="h-4 w-4" />
                            <span>Visit Us</span>
                          </Link>
                          <Link to="/careers" className="flex items-center gap-3 py-2 text-gray-700 hover:text-gray-900 px-2 bg-gray-200 rounded-lg mx-2 mb-2" onClick={() => setIsOpen(false)}>
                            <CustomTargetIcon className="h-4 w-4" />
                            <span>Careers</span>
                          </Link>
                          <div className="font-medium text-gray-900 py-3 mb-2 mt-4">Business & Partnerships</div>
                          <Link to="/resellers-subsidiaries" className="flex items-center gap-3 py-2 text-gray-700 hover:text-gray-900 px-2 bg-gray-200 rounded-lg mx-2 mb-2" onClick={() => setIsOpen(false)}>
                            <CustomTargetIcon className="h-4 w-4" />
                            <span>Resellers & Subsidiaries</span>
                          </Link>
                          <Link to="/strategic-partnerships" className="flex items-center gap-3 py-2 text-gray-700 hover:text-gray-900 px-2 bg-gray-200 rounded-lg mx-2 mb-2" onClick={() => setIsOpen(false)}>
                            <CustomTargetIcon className="h-4 w-4" />
                            <span>Strategic Partnerships</span>
                          </Link>
                          <Link to="/group-memberships" className="flex items-center gap-3 py-2 text-gray-700 hover:text-gray-900 px-2 bg-gray-200 rounded-lg mx-2 mb-2" onClick={() => setIsOpen(false)}>
                            <CustomTargetIcon className="h-4 w-4" />
                            <span>Group Memberships</span>
                          </Link>
                          <Link to="/iso-9001" className="flex items-center gap-3 py-2 text-gray-700 hover:text-gray-900 px-2 bg-gray-200 rounded-lg mx-2 mb-2" onClick={() => setIsOpen(false)}>
                            <CustomTargetIcon className="h-4 w-4" />
                            <span>ISO 9001</span>
                          </Link>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

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
