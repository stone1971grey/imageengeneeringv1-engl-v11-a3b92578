import { Button } from "@/components/ui/button";
import { Menu, X, Camera, Wrench, Building2, Download, Info, MessageCircle, Smartphone, Car, Tv, Shield, Cog, Stethoscope, ScanLine, FlaskConical, Monitor, Zap, Package, Lightbulb, Puzzle, Cpu, CheckCircle, Microscope, Target, BarChart3, Settings, Search, Users, Building, GraduationCap, FileText, BookOpen, Video, Link2, ScrollText, Phone, MapPin, Calendar, Briefcase, Handshake, Leaf, Recycle, ShieldCheck, ChevronRight } from "lucide-react";
import { BadgeCheck, Sprout } from "lucide-react";
import { CustomTargetIcon } from "./CustomTargetIcon";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import logoIE from "@/assets/logo-ie-new-v7.png";
import UtilityNavigation from "@/components/UtilityNavigation";
import { SimpleDropdown } from "./SimpleNavigation";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import IntelligentSearchBar from "@/components/IntelligentSearchBar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslation } from "@/hooks/useTranslation";
import { useNavigationData } from "@/hooks/useNavigationData";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

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
import iqAnalyzerIntro from "@/assets/iq-analyzer-intro.png";
import productBundleIeee from "@/assets/product-bundle-ieee.png";
import iqLedIllumination from "@/assets/iq-led-illumination.png";
import technology2025 from "@/assets/technology-2025.png";
import trainingMobileTesting from "@/assets/training-mobile-testing.jpg";

const Navigation = () => {
  const { t } = useTranslation();
  const navData = useNavigationData();
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredIndustry, setHoveredIndustry] = useState<string | null>(null);
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);
  const [hoveredSolution, setHoveredSolution] = useState<string | null>(null);
  const [hoveredTestService, setHoveredTestService] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAdminOrEditor, setIsAdminOrEditor] = useState(false);
  const [allowedPages, setAllowedPages] = useState<string[]>([]);

  // Check authentication status
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Check user role
  useEffect(() => {
    const checkUserRole = async () => {
      if (!user) {
        setIsAdminOrEditor(false);
        return;
      }

      // Check if admin
      const { data: adminData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (adminData) {
        setIsAdminOrEditor(true);
        setAllowedPages([]);
        return;
      }

      // Check if editor
      const { data: editorData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "editor")
        .maybeSingle();

      if (editorData) {
        const { data: pageAccessData } = await supabase
          .from("editor_page_access")
          .select("page_slug")
          .eq("user_id", user.id);

        if (pageAccessData && pageAccessData.length > 0) {
          setIsAdminOrEditor(true);
          setAllowedPages(pageAccessData.map(p => p.page_slug));
        }
      }
    };

    checkUserRole();
  }, [user]);

  // URL to page_slug mapping for admin links
  const urlToPageSlug: { [key: string]: string } = {
    '/products/test-charts/le7': 'le7',
    '/your-solution/photography': 'photography',
    '/your-solution/scanners-archiving': 'scanners-archiving',
    '/your-solution/scanners-archiving/multispectral-illumination': 'multispectral-illumination',
    '/your-solution/scanners-archiving/scanner-dynamic-range': 'scanner-dynamic-range',
    '/your-solution/scanners-archiving/universal-test-target': 'universal-test-target',
    '/your-solution/scanners-archiving/iso-21550': 'iso-21550',
    '/your-solution/medical-endoscopy': 'medical-endoscopy',
    '/your-solution/web-camera': 'web-camera',
    '/your-solution/machine-vision': 'machine-vision',
    '/your-solution/mobile-phone': 'mobile-phone',
    '/your-solution/automotive': 'automotive',
    '/your-solution/automotive/in-cabin-testing': 'in-cabin-testing',
    '/your-solution': 'your-solution'
  };

  // Helper function to get admin link if user is admin/editor
  const getLink = (pageSlugOrPath: string, defaultPath?: string) => {
    const path = defaultPath || pageSlugOrPath;
    
    if (!isAdminOrEditor) return path;
    
    // Try to find page_slug from URL mapping
    const pageSlug = urlToPageSlug[path] || pageSlugOrPath;
    
    // For editors, check if they have access to this page
    if (allowedPages.length > 0 && !allowedPages.includes(pageSlug)) {
      return path;
    }
    
    return `/admin-dashboard?page=${pageSlug}`;
  };

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
    "Automotive": { ...(navData.industries?.["Automotive"] || { description: "", subgroups: [] }), image: industryAutomotive },
    "Security & Surveillance": { ...(navData.industries?.["Security & Surveillance"] || { description: "", subgroups: [] }), image: industrySecurity },
    "Mobile Phone": { ...(navData.industries?.["Mobile Phone"] || { description: "", subgroups: [] }), image: industryMobile },
    "Web Camera": { ...(navData.industries?.["Web Camera"] || { description: "", subgroups: [] }), image: industryBroadcast },
    "Machine Vision": { ...(navData.industries?.["Machine Vision"] || { description: "", subgroups: [] }), image: industryMachineVision },
    "Medical & Endoscopy": { ...(navData.industries?.["Medical & Endoscopy"] || { description: "", subgroups: [] }), image: industryMedical },
    "Scanners & Archiving": { ...(navData.industries?.["Scanners & Archiving"] || { description: "", subgroups: [] }), image: industryScanning },
    "Photo & Video": { ...(navData.industries?.["Photo & Video"] || { description: "", subgroups: [] }), image: industryPhotography }
  };
  
  // Product data mapping with subgroups - now using translated data
  const productData = {
    "Test Charts": { ...(navData.products?.["Test Charts"] || { description: "", subgroups: [] }), image: "/images/custom-chart.png" },
    "Illumination Devices": { ...(navData.products?.["Illumination Devices"] || { description: "", subgroups: [] }), image: iqLedIllumination },
    "Measurement Devices": { ...(navData.products?.["Measurement Devices"] || { description: "", subgroups: [] }), image: iqAnalyzerIntro },
    "Software & APIs": { ...(navData.products?.["Software & APIs"] || { description: "", subgroups: [] }), image: iqAnalyzerIntro },
    "Product Accessories": { ...(navData.products?.["Product Accessories"] || { description: "", subgroups: [] }), image: "/images/chart-case.png" }
  };
  
  // Solution data mapping - now using translated data
  const solutionData = {
    "Camera Quality Validation": { ...(navData.solutions?.["Camera Quality Validation"] || { description: "", subgroups: [] }), image: industryPhotography },
    "In-Cabin Performance Testing": { ...(navData.solutions?.["In-Cabin Performance Testing"] || { description: "", subgroups: [] }), image: industryAutomotive },
    "Test Environments for Smartphones & Displays": { ...(navData.solutions?.["Test Environments for Smartphones & Displays"] || { description: "", subgroups: [] }), image: industryMobile },
    "Microscopy & Medical Imaging": { ...(navData.solutions?.["Microscopy & Medical Imaging"] || { description: "", subgroups: [] }), image: industryMedical },
    "ISO and IEEE Compliant Test Setups": { ...(navData.solutions?.["ISO and IEEE Compliant Test Setups"] || { description: "", subgroups: [] }), image: industryLabTesting }
  };

  const solutionPackages = {
    "Camera Calibration Package": { ...(navData.solutionPackages?.["Camera Calibration Package"] || { description: "", subgroups: [] }), image: "/images/custom-chart.png" },
    "Laboratory Complete Solution": { ...(navData.solutionPackages?.["Laboratory Complete Solution"] || { description: "", subgroups: [] }), image: industryLabTesting },
    "Spectral Measurement & Analysis Set": { ...(navData.solutionPackages?.["Spectral Measurement & Analysis Set"] || { description: "", subgroups: [] }), image: iqAnalyzerIntro }
  };
  
  // Target groups data mapping - now using translated data
  const targetGroupsData = {
    "Manufacturers": { ...(navData.targetGroups?.["Manufacturers"] || { description: "", subgroups: [] }), image: industryAutomotive },
    "Suppliers": { ...(navData.targetGroups?.["Suppliers"] || { description: "", subgroups: [] }), image: industryMachineVision },
    "Research Institutions": { ...(navData.targetGroups?.["Research Institutions"] || { description: "", subgroups: [] }), image: industryLabTesting }
  };
  
  // Test Services data mapping - now using translated data
  const testServicesData = {
    "Overview": { ...(navData.testServices?.["Overview"] || { description: "", services: [] }), image: industryLabTesting },
    "Automotive": { ...(navData.testServices?.["Automotive"] || { description: "", services: [] }), image: industryAutomotive },
    "VCX": { ...(navData.testServices?.["VCX"] || { description: "", services: [] }), image: industryMobile },
    "Image Quality": { ...(navData.testServices?.["Image Quality"] || { description: "", services: [] }), image: industryPhotography },
    "Standardized": { ...(navData.testServices?.["Standardized"] || { description: "", services: [] }), image: industryLabTesting },
    "Specialized/Custom": { ...(navData.testServices?.["Specialized/Custom"] || { description: "", services: [] }), image: industryMedical }
  };

  return (
    <nav className="fixed top-[10px] left-[10px] right-[10px] z-40 bg-[#f3f3f5]/95 backdrop-blur-sm shadow-lg border-b border-white/10 rounded-lg">
      {/* Main Navigation with integrated Utility Navigation */}
      <div className="w-full px-3 sm:px-6 py-4 sm:py-6">
        {/* Single row - logo left, main nav center, utility right */}
        <div className="flex items-center w-full gap-2 sm:gap-8">
          {/* Logo on the left - integrated for proper vertical centering */}
          <Link to="/" className="flex items-center hover:opacity-80 transition-opacity flex-shrink-0">
            <img 
              src={logoIE} 
              alt="Image Engineering" 
              className="h-[36px] sm:h-[54px] w-auto max-w-[180px] sm:max-w-[270px] object-contain"
              style={{ width: 'auto' }}
            />
          </Link>
          
          <div className="flex-1"></div>
          {/* Main Navigation - aligned with search */}
          <div className="hidden 2xl:flex items-center gap-6">
            <SimpleDropdown trigger={t.nav.yourSolution}>
                <div className="flex flex-col gap-2 w-[700px] max-w-[90vw] bg-[#f3f3f3] rounded-lg z-50"
                     onMouseLeave={() => setHoveredIndustry(null)}>
                  <div className="flex gap-6 p-6">
                    {/* Left Column: Industries */}
                    <div className="space-y-4 flex-1 pr-6 border-r border-border">
                       <h4 className="font-semibold mb-3 text-lg text-black">{t.nav.industries}</h4>
                       
                       <Link to="/your-solution/automotive" className="flex items-center gap-3 text-lg text-black hover:text-[#f9dc24] transition-colors cursor-pointer bg-green-100 p-2 rounded-md border-2 border-green-300"
                          onMouseEnter={() => setHoveredIndustry("Automotive")}>
                          <Car className="h-5 w-5" />
                          <span>{t.nav.automotive}</span>
                          <span className="ml-2 text-xs bg-green-200 text-green-800 px-2 py-1 rounded font-semibold">{t.nav.active}</span>
                       </Link>
                       
                       <div className="flex items-center gap-3 text-lg text-black hover:text-[#f9dc24] transition-colors cursor-pointer"
                         onMouseEnter={() => setHoveredIndustry("Security & Surveillance")}>
                         <Shield className="h-5 w-5" />
                         <span>{t.nav.securitySurveillance}</span>
                       </div>
                       
                       <Link to={getLink("mobile-phone", "/your-solution/mobile-phone")} className="flex items-center gap-3 text-lg text-black hover:text-[#f9dc24] transition-colors cursor-pointer"
                         onMouseEnter={() => setHoveredIndustry("Mobile Phone")}>
                         <Smartphone className="h-5 w-5" />
                         <span>{t.nav.mobilePhone}</span>
                       </Link>
                       
                         <Link to={getLink("web-camera", "/your-solution/web-camera")} className="flex items-center gap-3 text-lg text-black hover:text-[#f9dc24] transition-colors cursor-pointer"
                          onMouseEnter={() => setHoveredIndustry("Web Camera")}>
                          <Camera className="h-5 w-5" />
                          <span>{t.nav.webCamera}</span>
                        </Link>
                        
                        <Link to={getLink("machine-vision", "/your-solution/machine-vision")} className="flex items-center gap-3 text-lg text-black hover:text-[#f9dc24] transition-colors cursor-pointer"
                          onMouseEnter={() => setHoveredIndustry("Machine Vision")}>
                          <Cog className="h-5 w-5" />
                          <span>{t.nav.machineVision}</span>
                        </Link>
                       
                        <Link to={getLink("medical-endoscopy", "/your-solution/medical-endoscopy")} className="flex items-center gap-3 text-lg text-black hover:text-[#f9dc24] transition-colors cursor-pointer"
                          onMouseEnter={() => setHoveredIndustry("Medical & Endoscopy")}>
                          <Stethoscope className="h-5 w-5" />
                          <span>{t.nav.medicalEndoscopy}</span>
                        </Link>
                       
                        <Link to={getLink("scanners-archiving", "/your-solution/scanners-archiving")} className="flex items-center gap-3 text-lg text-black hover:text-[#f9dc24] transition-colors cursor-pointer"
                          onMouseEnter={() => setHoveredIndustry("Scanners & Archiving")}>
                          <ScanLine className="h-5 w-5" />
                          <span>{t.nav.scannersArchiving}</span>
                        </Link>
                        
                        <Link to={getLink("photography", "/your-solution/photography")} className="flex items-center gap-3 text-lg text-black hover:text-[#f9dc24] transition-colors cursor-pointer"
                          onMouseEnter={() => setHoveredIndustry("Photo & Video")}>
                          <Camera className="h-5 w-5" />
                          <span>{t.nav.photoVideo}</span>
                        </Link>
                    </div>
                    
                     {/* Right Column: Applications */}
                     <div className="space-y-4 flex-1">
                       <h4 className="font-semibold mb-3 text-lg text-black">
                         {hoveredIndustry ? `${(t.nav as any)[hoveredIndustry] || hoveredIndustry} - ${t.nav.applications}` : t.nav.applications}
                       </h4>
                       
                       {/* Conditional Rendering of Applications */}
                       {hoveredIndustry && industryData[hoveredIndustry as keyof typeof industryData] && (
                         <div className="space-y-3">
                            {industryData[hoveredIndustry as keyof typeof industryData].subgroups.map((application, index) => (
                              <div key={index} className="flex items-center gap-3 text-lg transition-colors cursor-pointer text-black hover:text-[#f9dc24]">
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
                           <p>{t.nav.hoverForApplications}</p>
                         </div>
                       )}
                     </div>
                  </div>

                  {/* CTA Button */}
                  <div className="bg-[#f3f3f3] px-6 pt-6 pb-6">
                    <Button variant="default" className="w-full bg-[#f9dc24] text-black hover:bg-[#f9dc24]/90 hover:text-black">
                      <Search className="h-5 w-5 mr-3" />
                      <span className="text-lg font-medium">{t.hero.findYourSolution}</span>
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
                       
                       <Link to="/products/charts" className="flex items-center gap-3 text-lg text-black hover:text-[#f9dc24] transition-colors cursor-pointer bg-green-100 p-2 rounded-md border-2 border-green-300"
                          onMouseEnter={() => setHoveredProduct("Test Charts")}>
                          <CustomTargetIcon className="h-5 w-5" />
                          <span>{t.nav.testCharts}</span>
                          <span className="ml-2 text-xs bg-green-200 text-green-800 px-2 py-1 rounded font-semibold">{t.nav.active}</span>
                       </Link>
                       
                       <div className="flex items-center gap-3 text-lg text-black hover:text-[#f9dc24] transition-colors cursor-pointer"
                         onMouseEnter={() => setHoveredProduct("Illumination Devices")}>
                         <CustomTargetIcon className="h-5 w-5" />
                         <span>{t.nav.illuminationDevices}</span>
                       </div>
                       
                       <div className="flex items-center gap-3 text-lg text-black hover:text-[#f9dc24] transition-colors cursor-pointer"
                         onMouseEnter={() => setHoveredProduct("Measurement Devices")}>
                         <CustomTargetIcon className="h-5 w-5" />
                         <span>{t.nav.measurementDevices}</span>
                       </div>
                       
                       <div className="flex items-center gap-3 text-lg text-black hover:text-[#f9dc24] transition-colors cursor-pointer"
                         onMouseEnter={() => setHoveredProduct("Software & APIs")}>
                         <CustomTargetIcon className="h-5 w-5" />
                         <span>{t.nav.softwareApis}</span>
                       </div>
                       
                       <div className="flex items-center gap-3 text-lg text-black hover:text-[#f9dc24] transition-colors cursor-pointer"
                         onMouseEnter={() => setHoveredProduct("Product Accessories")}>
                         <CustomTargetIcon className="h-5 w-5" />
                         <span>{t.nav.productAccessories}</span>
                       </div>
                    </div>
                    
                     {/* Right Column: Subgroups */}
                     <div className="space-y-4 flex-1">
                       <h4 className="font-semibold mb-3 text-lg text-black">
                         {hoveredProduct ? `${(t.nav as any)[hoveredProduct] || hoveredProduct} - ${t.nav.subgroups}` : t.nav.subgroups}
                       </h4>
                       
                       {/* Conditional Rendering of Subgroups */}
                        {hoveredProduct && productData[hoveredProduct as keyof typeof productData] && (
                          <div className="space-y-3">
                            {productData[hoveredProduct as keyof typeof productData].subgroups.map((subgroup, index) => (
                              <div key={index} className="flex items-center gap-3 text-lg transition-colors cursor-pointer text-black hover:text-[#f9dc24]">
                                <ChevronRight className="h-4 w-4" />
                                {subgroup.link === "#" ? (
                                  <span>{subgroup.name}</span>
                                ) : (
                                  <Link to={getLink(subgroup.link)}>{subgroup.name}</Link>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                       
                       {/* Default state when no product is hovered */}
                       {!hoveredProduct && (
                         <div className="text-gray-500 text-center py-8">
                           <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                           <p>{t.nav.hoverForSubgroups}</p>
                         </div>
                       )}
                     </div>
                  </div>

                  {/* CTA Button */}
                  <div className="bg-[#f3f3f3] px-6 pt-6 pb-6">
                    <Link to="/inside-lab">
                      <Button variant="default" className="w-full bg-black text-white hover:bg-gray-800">
                        <Microscope className="h-5 w-5 mr-3" />
                        <span className="text-lg font-medium">{t.nav.insideTestingLab}</span>
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
                      <h4 className="font-semibold mb-3 text-lg text-black">{t.nav.testServices}</h4>
                      
                       <div className="flex items-center gap-3 text-lg text-black hover:text-[#f9dc24] transition-colors cursor-pointer"
                         onMouseEnter={() => setHoveredTestService("Overview")}>
                         <FlaskConical className="h-5 w-5" />
                         <span>{t.nav.overview}</span>
                       </div>
                       
                       <div className="flex items-center gap-3 text-lg text-black hover:text-[#f9dc24] transition-colors cursor-pointer"
                         onMouseEnter={() => setHoveredTestService("Automotive")}>
                         <Car className="h-5 w-5" />
                         <span>{t.nav.automotive}</span>
                       </div>
                       
                       <div className="flex items-center gap-3 text-lg text-black hover:text-[#f9dc24] transition-colors cursor-pointer"
                         onMouseEnter={() => setHoveredTestService("VCX")}>
                         <Smartphone className="h-5 w-5" />
                         <span>VCX</span>
                       </div>
                       
                        <div className="flex items-center gap-3 text-lg text-black hover:text-[#f9dc24] transition-colors cursor-pointer"
                          onMouseEnter={() => setHoveredTestService("Image Quality")}>
                          <Camera className="h-5 w-5" />
                          <span>{t.nav.infoHub}</span>
                        </div>
                       
                       <div className="flex items-center gap-3 text-lg text-black hover:text-[#f9dc24] transition-colors cursor-pointer"
                         onMouseEnter={() => setHoveredTestService("Standardized")}>
                         <CheckCircle className="h-5 w-5" />
                         <span>{t.nav.standardized}</span>
                       </div>
                       
                       <div className="flex items-center gap-3 text-lg text-black hover:text-[#f9dc24] transition-colors cursor-pointer"
                         onMouseEnter={() => setHoveredTestService("Specialized/Custom")}>
                         <Settings className="h-5 w-5" />
                         <span>{t.nav.specializedCustom}</span>
                       </div>
                    </div>
                    
                     {/* Right Column: Services */}
                     <div className="space-y-4 flex-1">
                       <h4 className="font-semibold mb-3 text-lg text-black">
                         {hoveredTestService ? `${(t.nav as any)[hoveredTestService] || hoveredTestService} - ${t.nav.services}` : t.nav.services}
                       </h4>
                       
                       {/* Conditional Rendering of Services */}
                       {hoveredTestService && testServicesData[hoveredTestService as keyof typeof testServicesData] && (
                         <div className="space-y-3">
                           {testServicesData[hoveredTestService as keyof typeof testServicesData].services.map((service, index) => (
                             <div key={index} className={`flex items-center gap-3 text-lg transition-colors cursor-pointer text-black hover:text-[#f9dc24] ${(service as any).active ? 'bg-green-100 p-2 rounded-md border-2 border-green-300' : ''}`}>
                               <ChevronRight className="h-4 w-4" />
                               {service.link === "#" ? (
                                 <span>{service.name}</span>
                               ) : (
                                 <Link to={service.link}>{service.name}</Link>
                               )}
                               {(service as any).active && (
                                 <span className="ml-2 text-xs bg-green-200 text-green-800 px-2 py-1 rounded font-semibold">{t.nav.active}</span>
                               )}
                             </div>
                           ))}
                         </div>
                       )}
                       
                       {/* Default state when no service category is hovered */}
                       {!hoveredTestService && (
                         <div className="text-gray-500 text-center py-8">
                           <FlaskConical className="h-12 w-12 mx-auto mb-3 opacity-50" />
                           <p>{t.nav.hoverForServices}</p>
                         </div>
                       )}
                     </div>
                  </div>

                  {/* CTA Button */}
                  <div className="bg-[#f3f3f3] px-6 pt-6 pb-6">
                    <Link to="/inside-lab">
                      <Button variant="default" className="w-full bg-[#f9dc24] text-black hover:bg-[#f9dc24]/90 hover:text-black">
                        <FlaskConical className="h-5 w-5 mr-3" />
                        <span className="text-lg font-medium">{t.nav.visitTestingLab}</span>
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
                       <h4 className="font-semibold mb-3 text-lg text-black">{t.nav.resources}</h4>
                       <div className="flex items-center gap-3 text-lg text-black hover:text-blue-400 transition-colors cursor-pointer">
                         <CustomTargetIcon className="h-5 w-5" />
                         <a href="#">{t.nav.webinars}</a>
                       </div>
                       <div className="flex items-center gap-3 text-lg text-black hover:text-blue-400 transition-colors cursor-pointer">
                         <CustomTargetIcon className="h-5 w-5" />
                         <a href="#">{t.nav.onSiteTraining}</a>
                       </div>
                       <div className="flex items-center gap-3 text-lg text-black hover:text-blue-400 transition-colors cursor-pointer">
                         <CustomTargetIcon className="h-5 w-5" />
                         <Link to="/inside-lab">{t.nav.visitTestLab}</Link>
                       </div>
                       <div className="flex items-center gap-3 text-lg text-black hover:text-blue-400 transition-colors cursor-pointer">
                         <CustomTargetIcon className="h-5 w-5" />
                         <a href="#">{t.nav.eventSchedule}</a>
                       </div>
                     </div>
                   </div>

                  <div className="bg-[#f3f3f3] px-6 pt-6 pb-6">
                    <Link to="/events" className="bg-green-100 p-2 rounded-md border-2 border-green-300">
                      <Button variant="default" className="w-full bg-[#f9dc24] text-black hover:bg-[#f9dc24]/90 hover:text-black">
                        <GraduationCap className="h-5 w-5 mr-3" />
                        <span className="text-lg font-medium">{t.nav.viewTrainingEvents}</span>
                        <span className="ml-2 text-xs bg-green-200 text-green-800 px-2 py-1 rounded">{t.nav.active}</span>
                      </Button>
                    </Link>
                  </div>
                </div>
              </SimpleDropdown>

              <SimpleDropdown trigger={t.nav.about} className="right-aligned">
                <div className="flex flex-col gap-2 w-[600px] max-w-[90vw] bg-[#f3f3f3] rounded-lg">
                  <div className="flex gap-6 p-6">
                    <div className="space-y-4 flex-1 pr-6 border-r border-border">
                      <h4 className="font-semibold mb-3 text-lg text-black">{t.nav.resources}</h4>
                      <div className="flex items-center gap-3 text-lg text-black hover:text-blue-400 transition-colors cursor-pointer">
                        <CustomTargetIcon className="h-5 w-5" />
                        <a href="#">{t.nav.imageQualityFactors}</a>
                      </div>
                      <div className="flex items-center gap-3 text-lg text-black hover:text-blue-400 transition-colors cursor-pointer">
                        <CustomTargetIcon className="h-5 w-5" />
                        <a href="#">{t.nav.blog}</a>
                      </div>
                      <div className="flex items-center gap-3 text-lg text-black hover:text-blue-400 transition-colors cursor-pointer">
                        <CustomTargetIcon className="h-5 w-5" />
                        <a href="#">{t.nav.internationalStandards}</a>
                      </div>
                      <div className="flex items-center gap-3 text-lg text-black hover:text-blue-400 transition-colors cursor-pointer">
                        <CustomTargetIcon className="h-5 w-5" />
                        <a href="#">{t.nav.ieTechnology}</a>
                      </div>
                    </div>

                    <div className="space-y-4 flex-1">
                      <h4 className="font-semibold mb-3 text-lg text-black">{t.nav.publications}</h4>
                      <div className="flex items-center gap-3 text-lg text-black hover:text-blue-400 transition-colors cursor-pointer">
                        <CustomTargetIcon className="h-5 w-5" />
                        <a href="#">{t.nav.conferencePapers}</a>
                      </div>
                      <div className="flex items-center gap-3 text-lg text-black hover:text-blue-400 transition-colors cursor-pointer">
                        <CustomTargetIcon className="h-5 w-5" />
                        <Link to="/whitepaper">{t.nav.whitePapersTheses}</Link>
                      </div>
                      <div className="flex items-center gap-3 text-lg text-black hover:text-blue-400 transition-colors cursor-pointer">
                        <CustomTargetIcon className="h-5 w-5" />
                        <a href="#">{t.nav.videoArchive}</a>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#f3f3f3] px-6 pt-6 pb-6">
                    <Link to="/downloads" className="w-full">
                      <Button variant="default" className="w-full bg-[#f9dc24] text-black hover:bg-[#f9dc24]/90">
                        <Microscope className="h-5 w-5 mr-3" />
                        <span className="text-lg font-medium">{t.nav.exploreInfoHub}</span>
                        <span className="ml-2 text-xs bg-green-200 text-green-800 px-2 py-1 rounded font-bold">{t.nav.active}</span>
                      </Button>
                    </Link>
                  </div>
                </div>
            </SimpleDropdown>

            <SimpleDropdown trigger={t.nav.company} className="right-aligned">
                <div className="flex flex-col gap-2 w-[600px] max-w-[90vw] bg-[#f3f3f3] rounded-lg">
                   <div className="flex gap-8 p-6">
                       <div className="space-y-4 flex-1 pr-6 border-r border-border">
                         <h4 className="font-semibold mb-3 text-lg text-black">{t.nav.aboutIE}</h4>
                         <Link to="/news" className="flex items-center gap-3 text-lg text-black hover:text-[#f9dc24] transition-colors">
                           <CustomTargetIcon className="h-5 w-5" />
                           <span>{t.nav.news}</span>
                         </Link>
                         <Link to="/about" className="flex items-center gap-3 text-lg text-black hover:text-[#f9dc24] transition-colors">
                           <CustomTargetIcon className="h-5 w-5" />
                           <span>{t.nav.aboutUs}</span>
                         </Link>
                         <Link to="/team" className="flex items-center gap-3 text-lg text-black hover:text-[#f9dc24] transition-colors">
                           <CustomTargetIcon className="h-5 w-5" />
                           <span>{t.nav.team}</span>
                         </Link>
                         <Link to="/nynomic-group" className="flex items-center gap-3 text-lg text-black hover:text-[#f9dc24] transition-colors">
                           <CustomTargetIcon className="h-5 w-5" />
                           <span>{t.nav.nynomicGroup}</span>
                         </Link>
                         <Link to="/visit-us" className="flex items-center gap-3 text-lg text-black hover:text-[#f9dc24] transition-colors">
                           <CustomTargetIcon className="h-5 w-5" />
                           <span>{t.nav.visitUs}</span>
                         </Link>
                         <Link to="/careers" className="flex items-center gap-3 text-lg text-black hover:text-[#f9dc24] transition-colors">
                           <CustomTargetIcon className="h-5 w-5" />
                           <span>{t.nav.careers}</span>
                         </Link>
                       </div>
                       
                       <div className="space-y-4 flex-1">
                         <h4 className="font-semibold mb-3 text-lg text-black">Business & Partnerships</h4>
                         <Link to="/resellers-subsidiaries" className="flex items-center gap-3 text-lg text-black hover:text-[#f9dc24] transition-colors">
                           <CustomTargetIcon className="h-5 w-5" />
                           <span>Resellers & Subsidiaries</span>
                         </Link>
                         <Link to="/strategic-partnerships" className="flex items-center gap-3 text-lg text-black hover:text-[#f9dc24] transition-colors">
                           <CustomTargetIcon className="h-5 w-5" />
                           <span>Strategic Partnerships</span>
                         </Link>
                         <Link to="/group-memberships" className="flex items-center gap-3 text-lg text-black hover:text-[#f9dc24] transition-colors">
                           <CustomTargetIcon className="h-5 w-5" />
                           <span>Group Memberships</span>
                         </Link>
                         <Link to="/iso-9001" className="flex items-center gap-3 text-lg text-black hover:text-[#f9dc24] transition-colors">
                           <CustomTargetIcon className="h-5 w-5" />
                           <span>ISO 9001</span>
                         </Link>
                       </div>
                    </div>
                  </div>
                </SimpleDropdown>
          </div>
          
          {/* Utility Navigation - aligned with main nav */}
          <div className="hidden 2xl:flex">
            <UtilityNavigation />
          </div>

          {/* Mobile menu button - always on the right */}
          <div className="2xl:hidden ml-auto relative z-50 flex-shrink-0">
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 bg-[#f9dc24] text-black rounded-md hover:bg-[#f9dc24]/90 transition-colors shadow-lg"
            >
              {isOpen ? (
                <X size={20} className="stroke-[3]" />
              ) : (
                <Menu size={20} className="stroke-[3]" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation - positioned below navbar, right-aligned */}
        <div className="2xl:hidden relative">
          {isOpen && (
            <>
              {/* Mobile Menu */}
              <div className="absolute top-full right-0 w-[calc(100vw-32px)] max-w-[500px] bg-white border border-gray-200 rounded-lg shadow-xl z-50 mt-[18px] max-h-[60vh] overflow-y-auto">
                {/* Mobile Utility Navigation - Only for screens < 576px */}
                <div className="px-6 pt-4 pb-2 block sm:hidden">
                  {/* Search Bar - Full Width */}
                  <div className="mb-3 w-full">
                    <IntelligentSearchBar variant="mobile" />
                  </div>
                  
                  {/* Language Selector + Contact Button - Side by Side */}
                  <div className="flex items-center gap-3">
                    <Select value={language} onValueChange={(value) => setLanguage(value as any)}>
                      <SelectTrigger className="w-[70px] h-10 bg-white border border-gray-200 text-black hover:bg-gray-100 transition-all duration-300 [&>svg]:hidden text-3xl justify-center px-0 focus:ring-0 focus:ring-offset-0">
                        <SelectValue className="text-center w-full flex justify-center">
                          {[
                            { code: "en", label: "EN", flag: "🇺🇸" },
                            { code: "de", label: "DE", flag: "🇩🇪" },
                            { code: "zh", label: "ZH", flag: "🇨🇳" },
                            { code: "ja", label: "JA", flag: "🇯🇵" },
                            { code: "ko", label: "KO", flag: "🇰🇷" }
                          ].find(lang => lang.code === language)?.flag}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-gray-200 shadow-lg z-50 min-w-[70px] w-[70px]">
                        {[
                          { code: "en", label: "EN", flag: "🇺🇸" },
                          { code: "de", label: "DE", flag: "🇩🇪" },
                          { code: "zh", label: "ZH", flag: "🇨🇳" },
                          { code: "ja", label: "JA", flag: "🇯🇵" },
                          { code: "ko", label: "KO", flag: "🇰🇷" }
                        ].map((lang) => (
                          <SelectItem 
                            key={lang.code} 
                            value={lang.code}
                            className="justify-center hover:bg-gray-100 cursor-pointer text-black text-3xl py-3 pl-0 pr-0 [&_svg]:hidden [&>span:first-child]:hidden"
                          >
                            {lang.flag}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Link to="/contact" className="flex-1" onClick={() => setIsOpen(false)}>
                      <Button 
                        variant="default" 
                        className="w-full h-10 bg-[#f9dc24] hover:bg-[#f9dc24]/90 text-black border border-[#f9dc24] hover:border-[#f9dc24]/90 transition-all duration-300 flex items-center justify-center px-6"
                      >
                        <MessageCircle className="h-4 w-4 mr-2" />
                        {t.nav.contact}
                      </Button>
                    </Link>
                  </div>
                </div>
                
                {/* Navigation content */}
                <nav className="px-6 py-4">
                  <Accordion type="single" collapsible className="space-y-0">
                    
                    {/* Your Solution */}
                    <AccordionItem value="solutions" className="border-none">
                       <AccordionTrigger className="px-4 py-4 text-lg font-medium text-gray-900 hover:no-underline bg-[#f3f3f5] rounded-lg mx-2 mb-2 data-[state=open]:bg-[#4d4c4c] data-[state=open]:text-white">
                          {t.nav.yourSolution}
                       </AccordionTrigger>
                      <AccordionContent className="px-0 pb-4">
                        <div className="space-y-1">
                          <div className="font-medium text-gray-900 py-3 mb-2">{t.nav.industries}</div>
                          
                          {/* Automotive with sub-applications */}
                          <Accordion type="single" collapsible className="ml-2">
                            <AccordionItem value="automotive" className="border-none">
                               <AccordionTrigger className="px-2 py-2 text-gray-700 hover:text-gray-900 hover:no-underline bg-[#f3f3f5] rounded-lg mx-2 mb-2">
                                 <div className="flex items-center justify-between w-full">
                                   <Link to="/your-solution/automotive" className="flex items-center gap-3 flex-1" onClick={() => setIsOpen(false)}>
                                      <Car className="h-4 w-4" />
                                      <span>{t.nav.automotive}</span>
                                      <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded font-semibold">{t.nav.active}</span>
                                    </Link>
                                 </div>
                               </AccordionTrigger>
                               <AccordionContent className="px-4 pb-2 bg-[#f3f3f5] mx-2 rounded-lg">
                                 <div className="space-y-2">
                                   {industryData["Automotive"].subgroups.map((item, idx) => (
                                     item.link === "#" ? (
                                       <div key={idx} className="block py-2 text-sm text-gray-600">{item.name}</div>
                                     ) : (
                                       <Link key={idx} to={item.link} className="block py-2 text-sm text-gray-600 hover:text-gray-800" onClick={() => setIsOpen(false)}>
                                         {item.name} {(item as any).active && <span className="text-xs bg-green-200 text-green-800 px-1 py-0.5 rounded ml-1">{t.nav.active}</span>}
                                       </Link>
                                     )
                                   ))}
                                 </div>
                               </AccordionContent>
                            </AccordionItem>
                          </Accordion>
                          
                          {/* Security & Surveillance */}
                          <Accordion type="single" collapsible className="ml-2">
                            <AccordionItem value="security" className="border-none">
                               <AccordionTrigger className="px-2 py-2 text-gray-700 hover:text-gray-900 hover:no-underline bg-[#f3f3f5] rounded-lg mx-2 mb-2">
                                 <div className="flex items-center justify-between w-full">
                                    <div className="flex items-center gap-3 flex-1 cursor-pointer">
                                      <Shield className="h-4 w-4" />
                                      <span>{t.nav.securitySurveillance}</span>
                                    </div>
                                 </div>
                               </AccordionTrigger>
                               <AccordionContent className="px-4 pb-2 bg-[#f3f3f5] mx-2 rounded-lg">
                                 <div className="space-y-2">
                                   {industryData["Security & Surveillance"].subgroups.map((item, idx) => (
                                     item.link === "#" ? (
                                       <div key={idx} className="block py-2 text-sm text-gray-600">{item.name}</div>
                                     ) : (
                                       <Link key={idx} to={item.link} className="block py-2 text-sm text-gray-600 hover:text-gray-800" onClick={() => setIsOpen(false)}>
                                         {item.name}
                                       </Link>
                                     )
                                   ))}
                                 </div>
                               </AccordionContent>
                            </AccordionItem>
                          </Accordion>
                          
                          {/* Mobile Phone */}
                          <Accordion type="single" collapsible className="ml-2">
                            <AccordionItem value="mobile" className="border-none">
                               <AccordionTrigger className="px-2 py-2 text-gray-700 hover:text-gray-900 hover:no-underline bg-[#f3f3f5] rounded-lg mx-2 mb-2">
                                 <div className="flex items-center justify-between w-full">
                                    <Link to={getLink("mobile-phone", "/your-solution/mobile-phone")} className="flex items-center gap-3 flex-1" onClick={() => setIsOpen(false)}>
                                      <Smartphone className="h-4 w-4" />
                                      <span>{t.nav.mobilePhone}</span>
                                    </Link>
                                 </div>
                               </AccordionTrigger>
                               <AccordionContent className="px-4 pb-2 bg-[#f3f3f5] mx-2 rounded-lg">
                                 <div className="space-y-2">
                                   {industryData["Mobile Phone"].subgroups.map((item, idx) => (
                                     item.link === "#" ? (
                                       <div key={idx} className="block py-2 text-sm text-gray-600">{item.name}</div>
                                     ) : (
                                       <Link key={idx} to={item.link} className="block py-2 text-sm text-gray-600 hover:text-gray-800" onClick={() => setIsOpen(false)}>
                                         {item.name}
                                       </Link>
                                     )
                                   ))}
                                 </div>
                               </AccordionContent>
                            </AccordionItem>
                          </Accordion>
                          
                           {/* Web Camera */}
                           <Accordion type="single" collapsible className="ml-2">
                             <AccordionItem value="webcam" className="border-none">
                                <AccordionTrigger className="px-2 py-2 text-gray-700 hover:text-gray-900 hover:no-underline bg-[#f3f3f5] rounded-lg mx-2 mb-2">
                                   <div className="flex items-center justify-between w-full">
                                      <Link to={getLink("web-camera", "/your-solution/web-camera")} className="flex items-center gap-3 flex-1" onClick={() => setIsOpen(false)}>
                                        <Camera className="h-4 w-4" />
                                        <span>{t.nav.webCamera}</span>
                                      </Link>
                                   </div>
                                </AccordionTrigger>
                               <AccordionContent className="px-4 pb-2 bg-[#f3f3f5] mx-2 rounded-lg">
                                 <div className="space-y-2">
                                   {industryData["Web Camera"].subgroups.map((item, idx) => (
                                     item.link === "#" ? (
                                       <div key={idx} className="block py-2 text-sm text-gray-600">{item.name}</div>
                                     ) : (
                                       <Link key={idx} to={item.link} className="block py-2 text-sm text-gray-600 hover:text-gray-800" onClick={() => setIsOpen(false)}>
                                         {item.name}
                                       </Link>
                                     )
                                   ))}
                                 </div>
                               </AccordionContent>
                            </AccordionItem>
                          </Accordion>
                          
                           {/* Machine Vision */}
                           <Accordion type="single" collapsible className="ml-2">
                             <AccordionItem value="machine-vision" className="border-none">
                                <AccordionTrigger className="px-2 py-2 text-gray-700 hover:text-gray-900 hover:no-underline bg-[#f3f3f5] rounded-lg mx-2 mb-2">
                                   <div className="flex items-center justify-between w-full">
                                      <Link to={getLink("machine-vision", "/your-solution/machine-vision")} className="flex items-center gap-3 flex-1" onClick={() => setIsOpen(false)}>
                                        <Cog className="h-4 w-4" />
                                        <span>{t.nav.machineVision}</span>
                                      </Link>
                                   </div>
                                </AccordionTrigger>
                               <AccordionContent className="px-4 pb-2 bg-[#f3f3f5] mx-2 rounded-lg">
                                 <div className="space-y-2">
                                   {industryData["Machine Vision"].subgroups.map((item, idx) => (
                                     item.link === "#" ? (
                                       <div key={idx} className="block py-2 text-sm text-gray-600">{item.name}</div>
                                     ) : (
                                       <Link key={idx} to={item.link} className="block py-2 text-sm text-gray-600 hover:text-gray-800" onClick={() => setIsOpen(false)}>
                                         {item.name}
                                       </Link>
                                     )
                                   ))}
                                 </div>
                               </AccordionContent>
                            </AccordionItem>
                          </Accordion>
                          
                          {/* Medical & Endoscopy */}
                          <Accordion type="single" collapsible className="ml-2">
                            <AccordionItem value="medical" className="border-none">
                               <AccordionTrigger className="px-2 py-2 text-gray-700 hover:text-gray-900 hover:no-underline bg-[#f3f3f5] rounded-lg mx-2 mb-2">
                                  <div className="flex items-center justify-between w-full">
                                      <Link to={getLink("medical-endoscopy", "/your-solution/medical-endoscopy")} className="flex items-center gap-3 flex-1" onClick={() => setIsOpen(false)}>
                                        <Stethoscope className="h-4 w-4" />
                                        <span>{t.nav.medicalEndoscopy}</span>
                                      </Link>
                                  </div>
                               </AccordionTrigger>
                               <AccordionContent className="px-4 pb-2 bg-[#f3f3f5] mx-2 rounded-lg">
                                 <div className="space-y-2">
                                   {industryData["Medical & Endoscopy"].subgroups.map((item, idx) => (
                                     item.link === "#" ? (
                                       <div key={idx} className="block py-2 text-sm text-gray-600">{item.name}</div>
                                     ) : (
                                       <Link key={idx} to={item.link} className="block py-2 text-sm text-gray-600 hover:text-gray-800" onClick={() => setIsOpen(false)}>
                                         {item.name}
                                       </Link>
                                     )
                                   ))}
                                 </div>
                               </AccordionContent>
                            </AccordionItem>
                          </Accordion>
                          
                          {/* Scanners & Archiving */}
                          <Accordion type="single" collapsible className="ml-2">
                            <AccordionItem value="scanning" className="border-none">
                               <AccordionTrigger className="px-2 py-2 text-gray-700 hover:text-gray-900 hover:no-underline bg-[#f3f3f5] rounded-lg mx-2 mb-2">
                                  <div className="flex items-center justify-between w-full">
                                     <Link to={getLink("scanners-archiving", "/your-solution/scanners-archiving")} className="flex items-center gap-3 flex-1" onClick={() => setIsOpen(false)}>
                                       <ScanLine className="h-4 w-4" />
                                       <span>{t.nav.scannersArchiving}</span>
                                     </Link>
                                  </div>
                               </AccordionTrigger>
                               <AccordionContent className="px-4 pb-2 bg-[#f3f3f5] mx-2 rounded-lg">
                                 <div className="space-y-2">
                                   {industryData["Scanners & Archiving"].subgroups.map((item, idx) => (
                                     item.link === "#" ? (
                                       <div key={idx} className="block py-2 text-sm text-gray-600">{item.name}</div>
                                     ) : (
                                       <Link key={idx} to={item.link} className="block py-2 text-sm text-gray-600 hover:text-gray-800" onClick={() => setIsOpen(false)}>
                                         {item.name}
                                       </Link>
                                     )
                                   ))}
                                 </div>
                               </AccordionContent>
                            </AccordionItem>
                          </Accordion>
                          
                          {/* Photo & Video */}
                          <Accordion type="single" collapsible className="ml-2">
                            <AccordionItem value="photo-video" className="border-none">
                               <AccordionTrigger className="px-2 py-2 text-gray-700 hover:text-gray-900 hover:no-underline bg-[#f3f3f5] rounded-lg mx-2 mb-2">
                                  <div className="flex items-center justify-between w-full">
                                     <Link to={getLink("photography", "/your-solution/photography")} className="flex items-center gap-3 flex-1" onClick={() => setIsOpen(false)}>
                                       <Camera className="h-4 w-4" />
                                       <span>{t.nav.photoVideo}</span>
                                     </Link>
                                  </div>
                               </AccordionTrigger>
                               <AccordionContent className="px-4 pb-2 bg-[#f3f3f5] mx-2 rounded-lg">
                                 <div className="space-y-2">
                                   {industryData["Photo & Video"].subgroups.map((item, idx) => (
                                     item.link === "#" ? (
                                       <div key={idx} className="block py-2 text-sm text-gray-600">{item.name}</div>
                                     ) : (
                                       <Link key={idx} to={item.link} className="block py-2 text-sm text-gray-600 hover:text-gray-800" onClick={() => setIsOpen(false)}>
                                         {item.name}
                                       </Link>
                                     )
                                   ))}
                                 </div>
                               </AccordionContent>
                            </AccordionItem>
                          </Accordion>
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-200 mx-2">
                          <Link to={getLink("your-solution", "/your-solution")} onClick={() => setIsOpen(false)}>
                            <Button className="w-full bg-[#f9dc24] text-black hover:bg-[#f9dc24]/90 rounded-lg font-medium">
                              <Search className="h-4 w-4 mr-2" />
                               <span className="hidden sm:inline">{t.hero.findYourSolution}</span>
                               <span className="sm:hidden">Your Perfect Solution</span>
                            </Button>
                          </Link>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    {/* Products */}
                    <AccordionItem value="products" className="border-none">
                       <AccordionTrigger className="px-4 py-4 text-lg font-medium text-gray-900 hover:no-underline bg-[#f3f3f5] rounded-lg mx-2 mb-2 data-[state=open]:bg-[#4d4c4c] data-[state=open]:text-white">
                          {t.nav.products}
                         </AccordionTrigger>
                       <AccordionContent className="px-0 pb-4">
                         <div className="space-y-2">
                           <div className="font-medium text-gray-900 py-3 mb-2">{t.nav.products}</div>
                          
                           {/* Test Charts with subgroups */}
                           <Accordion type="single" collapsible className="ml-2">
                             <AccordionItem value="test-charts" className="border-none">
                                <AccordionTrigger className="px-2 py-2 text-gray-700 hover:text-gray-900 hover:no-underline bg-[#f3f3f5] rounded-lg mx-2 mb-2">
                                   <div className="flex items-center justify-between w-full">
                                     <Link to="/charts" className="flex items-center gap-3 flex-1" onClick={() => setIsOpen(false)}>
                                       <CustomTargetIcon className="h-4 w-4" />
                                       <span>{t.nav.testCharts}</span>
                                       <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded font-semibold">{t.nav.active}</span>
                                     </Link>
                                   </div>
                                </AccordionTrigger>
                               <AccordionContent className="px-4 pb-2 bg-[#f3f3f5] mx-2 rounded-lg">
                                  <div className="space-y-2">
                                    {productData["Test Charts"].subgroups.map((item, idx) => (
                                      item.link === "#" ? (
                                        <div key={idx} className="block py-2 text-sm text-gray-600">{item.name}</div>
                                      ) : (
                                        <Link key={idx} to={getLink(item.link)} className="block py-2 text-sm text-gray-600 hover:text-gray-800" onClick={() => setIsOpen(false)}>
                                          {item.name}
                                        </Link>
                                      )
                                    ))}
                                 </div>
                               </AccordionContent>
                             </AccordionItem>
                           </Accordion>
                           
                           {/* Illumination Devices */}
                           <Accordion type="single" collapsible className="ml-2">
                             <AccordionItem value="illumination" className="border-none">
                                <AccordionTrigger className="px-2 py-2 text-gray-700 hover:text-gray-900 hover:no-underline bg-[#f3f3f5] rounded-lg mx-2 mb-2">
                                   <div className="flex items-center justify-between w-full">
                                     <div className="flex items-center gap-3 flex-1 cursor-pointer">
                                       <CustomTargetIcon className="h-4 w-4" />
                                       <span>{t.nav.illuminationDevices}</span>
                                     </div>
                                   </div>
                                </AccordionTrigger>
                               <AccordionContent className="px-4 pb-2 bg-[#f3f3f5] mx-2 rounded-lg">
                                   <div className="space-y-2">
                                     {productData["Illumination Devices"].subgroups.map((item, idx) => (
                                       item.link === "#" ? (
                                         <div key={idx} className="block py-2 text-sm text-gray-600">{item.name}</div>
                                       ) : (
                                         <Link key={idx} to={getLink(item.link)} className="block py-2 text-sm text-gray-600 hover:text-gray-800" onClick={() => setIsOpen(false)}>
                                           {item.name}
                                         </Link>
                                       )
                                     ))}
                                  </div>
                               </AccordionContent>
                             </AccordionItem>
                           </Accordion>
                           
                           {/* Measurement Devices */}
                           <Accordion type="single" collapsible className="ml-2">
                             <AccordionItem value="measurement" className="border-none">
                                <AccordionTrigger className="px-2 py-2 text-gray-700 hover:text-gray-900 hover:no-underline bg-[#f3f3f5] rounded-lg mx-2 mb-2">
                                   <div className="flex items-center justify-between w-full">
                                     <div className="flex items-center gap-3 flex-1 cursor-pointer">
                                       <CustomTargetIcon className="h-4 w-4" />
                                       <span>{t.nav.measurementDevices}</span>
                                     </div>
                                   </div>
                                </AccordionTrigger>
                               <AccordionContent className="px-4 pb-2 bg-[#f3f3f5] mx-2 rounded-lg">
                                   <div className="space-y-2">
                                     {productData["Measurement Devices"].subgroups.map((item, idx) => (
                                       item.link === "#" ? (
                                         <div key={idx} className="block py-2 text-sm text-gray-600">{item.name}</div>
                                       ) : (
                                         <Link key={idx} to={getLink(item.link)} className="block py-2 text-sm text-gray-600 hover:text-gray-800" onClick={() => setIsOpen(false)}>
                                           {item.name}
                                         </Link>
                                       )
                                     ))}
                                  </div>
                               </AccordionContent>
                             </AccordionItem>
                           </Accordion>
                           
                           {/* Software & APIs */}
                           <Accordion type="single" collapsible className="ml-2">
                             <AccordionItem value="software" className="border-none">
                                <AccordionTrigger className="px-2 py-2 text-gray-700 hover:text-gray-900 hover:no-underline bg-[#f3f3f5] rounded-lg mx-2 mb-2">
                                   <div className="flex items-center justify-between w-full">
                                     <div className="flex items-center gap-3 flex-1 cursor-pointer">
                                       <CustomTargetIcon className="h-4 w-4" />
                                       <span>{t.nav.softwareApis}</span>
                                     </div>
                                   </div>
                                </AccordionTrigger>
                               <AccordionContent className="px-4 pb-2 bg-[#f3f3f5] mx-2 rounded-lg">
                                  <div className="space-y-2">
                                    {productData["Software & APIs"].subgroups.map((item, idx) => (
                                      item.link === "#" ? (
                                        <div key={idx} className="block py-2 text-sm text-gray-600">{item.name}</div>
                                      ) : (
                                        <Link key={idx} to={getLink(item.link)} className="block py-2 text-sm text-gray-600 hover:text-gray-800" onClick={() => setIsOpen(false)}>
                                          {item.name}
                                        </Link>
                                      )
                                    ))}
                                 </div>
                               </AccordionContent>
                             </AccordionItem>
                           </Accordion>
                           
                           {/* Product Accessories */}
                           <Accordion type="single" collapsible className="ml-2">
                             <AccordionItem value="accessories" className="border-none">
                                <AccordionTrigger className="px-2 py-2 text-gray-700 hover:text-gray-900 hover:no-underline bg-[#f3f3f5] rounded-lg mx-2 mb-2">
                                   <div className="flex items-center justify-between w-full">
                                     <div className="flex items-center gap-3 flex-1 cursor-pointer">
                                       <CustomTargetIcon className="h-4 w-4" />
                                       <span>{t.nav.productAccessories}</span>
                                     </div>
                                   </div>
                                </AccordionTrigger>
                               <AccordionContent className="px-4 pb-2 bg-[#f3f3f5] mx-2 rounded-lg">
                                  <div className="space-y-2">
                                    {productData["Product Accessories"].subgroups.map((item, idx) => (
                                      item.link === "#" ? (
                                        <div key={idx} className="block py-2 text-sm text-gray-600">{item.name}</div>
                                      ) : (
                                        <Link key={idx} to={getLink(item.link)} className="block py-2 text-sm text-gray-600 hover:text-gray-800" onClick={() => setIsOpen(false)}>
                                          {item.name}
                                        </Link>
                                      )
                                    ))}
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
                       <AccordionTrigger className="px-4 py-4 text-lg font-medium text-gray-900 hover:no-underline bg-[#f3f3f5] rounded-lg mx-2 mb-2 data-[state=open]:bg-[#4d4c4c] data-[state=open]:text-white">
                          {t.nav.testServices}
                        </AccordionTrigger>
                      <AccordionContent className="px-0 pb-4">
                         <div className="space-y-2">
                           <div className="font-medium text-gray-900 py-3 mb-2">{t.nav.testServices}</div>
                          
                          {/* Overview */}
                          <Accordion type="single" collapsible className="ml-2">
                            <AccordionItem value="overview" className="border-none">
                              <AccordionTrigger className="px-2 py-2 text-gray-700 hover:text-gray-900 hover:no-underline bg-[#f3f3f5] rounded-lg mx-2 mb-2">
                                <div className="flex items-center gap-3">
                                  <CustomTargetIcon className="h-4 w-4" />
                                  <span>Overview</span>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent className="px-4 pb-2 bg-[#f3f3f5] mx-2 rounded-lg">
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
                               <AccordionTrigger className="px-2 py-2 text-gray-700 hover:text-gray-900 hover:no-underline bg-[#f3f3f5] rounded-lg mx-2 mb-2">
                                 <div className="flex items-center justify-between w-full">
                                   <Link to="/your-solution/automotive" className="flex items-center gap-3 flex-1" onClick={() => setIsOpen(false)}>
                                       <CustomTargetIcon className="h-4 w-4" />
                                      <span>{t.nav.automotive}</span>
                                    </Link>
                                 </div>
                               </AccordionTrigger>
                              <AccordionContent className="px-4 pb-2 bg-[#f3f3f5] mx-2 rounded-lg">
                                 <div className="space-y-2">
                                   <div className="block py-2 text-sm text-gray-600">camPAS</div>
                                    <Link to="/your-solution/automotive/in-cabin-testing" className="block py-2 text-sm text-gray-600 hover:text-gray-800" onClick={() => setIsOpen(false)}>
                                      {t.nav.inCabinTesting} <span className="text-xs bg-green-200 text-green-800 px-1 py-0.5 rounded ml-1">{t.nav.active}</span>
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
                              <AccordionTrigger className="px-2 py-2 text-gray-700 hover:text-gray-900 hover:no-underline bg-[#f3f3f5] rounded-lg mx-2 mb-2">
                                <div className="flex items-center gap-3">
                                  <CustomTargetIcon className="h-4 w-4" />
                                  <span>VCX</span>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent className="px-4 pb-2 bg-[#f3f3f5] mx-2 rounded-lg">
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
                              <AccordionTrigger className="px-2 py-2 text-gray-700 hover:text-gray-900 hover:no-underline bg-[#f3f3f5] rounded-lg mx-2 mb-2">
                                <div className="flex items-center gap-3">
                                  <CustomTargetIcon className="h-4 w-4" />
                                  <span>Image Quality</span>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent className="px-4 pb-2 bg-[#f3f3f5] mx-2 rounded-lg">
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
                              <AccordionTrigger className="px-2 py-2 text-gray-700 hover:text-gray-900 hover:no-underline bg-[#f3f3f5] rounded-lg mx-2 mb-2">
                                <div className="flex items-center gap-3">
                                  <CustomTargetIcon className="h-4 w-4" />
                                  <span>Standardized</span>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent className="px-4 pb-2 bg-[#f3f3f5] mx-2 rounded-lg">
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
                              <AccordionTrigger className="px-2 py-2 text-gray-700 hover:text-gray-900 hover:no-underline bg-[#f3f3f5] rounded-lg mx-2 mb-2">
                                <div className="flex items-center gap-3">
                                  <CustomTargetIcon className="h-4 w-4" />
                                  <span>Specialized/Custom</span>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent className="px-4 pb-2 bg-[#f3f3f5] mx-2 rounded-lg">
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
                            <Button className="w-full bg-[#f9dc24] text-black hover:bg-[#f9dc24]/90 rounded-lg font-medium">
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
                          {t.nav.trainingEvents}
                        </AccordionTrigger>
                      <AccordionContent className="px-0 pb-4">
                        <div className="space-y-4">
                          <div className="font-medium text-gray-900 py-3 mb-2">{t.nav.resources}</div>
                          <div className="flex items-center gap-3 py-2 text-gray-700 hover:text-gray-900 px-2 bg-gray-200 rounded-lg mx-2 mb-2">
                            <CustomTargetIcon className="h-4 w-4" />
                            <span>{t.nav.webinars}</span>
                          </div>
                          <div className="flex items-center gap-3 py-2 text-gray-700 hover:text-gray-900 px-2 bg-gray-200 rounded-lg mx-2 mb-2">
                            <CustomTargetIcon className="h-4 w-4" />
                            <span>{t.nav.onSiteTraining}</span>
                          </div>
                          <Link to="/inside-lab" className="flex items-center gap-3 py-2 text-gray-700 hover:text-gray-900 px-2 bg-gray-200 rounded-lg mx-2 mb-2" onClick={() => setIsOpen(false)}>
                            <CustomTargetIcon className="h-4 w-4" />
                            <span>{t.nav.visitTestLab}</span>
                          </Link>
                          <div className="flex items-center gap-3 py-2 text-gray-700 hover:text-gray-900 px-2 bg-gray-200 rounded-lg mx-2 mb-2">
                            <CustomTargetIcon className="h-4 w-4" />
                            <span>{t.nav.eventSchedule}</span>
                          </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-200 mx-2">
                          <Link to="/events" onClick={() => setIsOpen(false)}>
                            <Button className="w-full bg-[#f9dc24] text-black hover:bg-[#f9dc24]/90 rounded-lg font-medium">
                              <GraduationCap className="h-4 w-4 mr-2" />
                              {t.nav.viewTrainingEvents}
                              <span className="ml-2 text-xs bg-green-200 text-green-800 px-2 py-1 rounded">{t.nav.active}</span>
                            </Button>
                          </Link>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    {/* Info Hub */}
                    <AccordionItem value="info-hub" className="border-none">
                       <AccordionTrigger className="px-4 py-4 text-lg font-medium text-gray-900 hover:no-underline bg-gray-100 rounded-lg mx-2 mb-2 data-[state=open]:bg-[#4d4c4c] data-[state=open]:text-white">
                          {t.nav.infoHub}
                        </AccordionTrigger>
                      <AccordionContent className="px-0 pb-4">
                        <div className="space-y-4">
                          <div className="font-medium text-gray-900 py-3 mb-2">{t.nav.resources}</div>
                          <Link to="/image-quality-factors" className="flex items-center gap-3 py-2 text-gray-700 hover:text-gray-900 px-2 bg-gray-200 rounded-lg mx-2 mb-2" onClick={() => setIsOpen(false)}>
                            <CustomTargetIcon className="h-4 w-4" />
                            <span>{t.nav.imageQualityFactors}</span>
                          </Link>
                          <Link to="/blog" className="flex items-center gap-3 py-2 text-gray-700 hover:text-gray-900 px-2 bg-gray-200 rounded-lg mx-2 mb-2" onClick={() => setIsOpen(false)}>
                            <CustomTargetIcon className="h-4 w-4" />
                            <span>{t.nav.blog}</span>
                          </Link>
                          <Link to="/international-standards" className="flex items-center gap-3 py-2 text-gray-700 hover:text-gray-900 px-2 bg-gray-200 rounded-lg mx-2 mb-2" onClick={() => setIsOpen(false)}>
                            <CustomTargetIcon className="h-4 w-4" />
                            <span>{t.nav.internationalStandards}</span>
                          </Link>
                          <Link to="/ie-technology" className="flex items-center gap-3 py-2 text-gray-700 hover:text-gray-900 px-2 bg-gray-200 rounded-lg mx-2 mb-2" onClick={() => setIsOpen(false)}>
                            <CustomTargetIcon className="h-4 w-4" />
                            <span>{t.nav.ieTechnology}</span>
                          </Link>
                          <div className="font-medium text-gray-900 py-3 mb-2 mt-4">{t.nav.publications}</div>
                          <Link to="/conference-papers" className="flex items-center gap-3 py-2 text-gray-700 hover:text-gray-900 px-2 bg-gray-200 rounded-lg mx-2 mb-2" onClick={() => setIsOpen(false)}>
                            <CustomTargetIcon className="h-4 w-4" />
                            <span>{t.nav.conferencePapers}</span>
                          </Link>
                          <Link to="/whitepaper" className="flex items-center gap-3 py-2 text-gray-700 hover:text-gray-900 px-2 bg-gray-200 rounded-lg mx-2 mb-2" onClick={() => setIsOpen(false)}>
                            <CustomTargetIcon className="h-4 w-4" />
                            <span>{t.nav.whitePapersTheses}</span>
                          </Link>
                          <Link to="/video-archive" className="flex items-center gap-3 py-2 text-gray-700 hover:text-gray-900 px-2 bg-gray-200 rounded-lg mx-2 mb-2" onClick={() => setIsOpen(false)}>
                            <CustomTargetIcon className="h-4 w-4" />
                            <span>{t.nav.videoArchive}</span>
                          </Link>
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-200 mx-2">
                          <Link to="/downloads" onClick={() => setIsOpen(false)}>
                             <Button className="w-full bg-[#f9dc24] text-black hover:bg-[#f9dc24]/90 rounded-lg font-medium">
                               <Microscope className="h-4 w-4 mr-2" />
                               <span className="hidden sm:inline">{t.nav.exploreInfoHub}</span>
                               <span className="sm:hidden">Info Hub</span>
                               <span className="ml-2 text-xs bg-green-200 text-green-800 px-2 py-1 rounded font-bold">{t.nav.active}</span>
                             </Button>
                          </Link>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    {/* Company */}
                    <AccordionItem value="company" className="border-none">
                       <AccordionTrigger className="px-4 py-4 text-lg font-medium text-gray-900 hover:no-underline bg-gray-100 rounded-lg mx-2 mb-2 data-[state=open]:bg-[#4d4c4c] data-[state=open]:text-white">
                          {t.nav.company}
                        </AccordionTrigger>
                      <AccordionContent className="px-0 pb-4">
                         <div className="space-y-4">
                           <div className="font-medium text-gray-900 py-3 mb-2">{t.nav.aboutIE}</div>
                            <Link to="/news" className="flex items-center gap-3 py-2 text-gray-700 hover:text-gray-900 px-2 bg-gray-200 rounded-lg mx-2 mb-2" onClick={() => setIsOpen(false)}>
                              <CustomTargetIcon className="h-4 w-4" />
                              <span>{t.nav.news}</span>
                            </Link>
                           <Link to="/about" className="flex items-center gap-3 py-2 text-gray-700 hover:text-gray-900 px-2 bg-gray-200 rounded-lg mx-2 mb-2" onClick={() => setIsOpen(false)}>
                             <CustomTargetIcon className="h-4 w-4" />
                             <span>{t.nav.aboutUs}</span>
                           </Link>
                           <Link to="/team" className="flex items-center gap-3 py-2 text-gray-700 hover:text-gray-900 px-2 bg-gray-200 rounded-lg mx-2 mb-2" onClick={() => setIsOpen(false)}>
                             <CustomTargetIcon className="h-4 w-4" />
                             <span>{t.nav.team}</span>
                           </Link>
                           <Link to="/nynomic-group" className="flex items-center gap-3 py-2 text-gray-700 hover:text-gray-900 px-2 bg-gray-200 rounded-lg mx-2 mb-2" onClick={() => setIsOpen(false)}>
                             <CustomTargetIcon className="h-4 w-4" />
                             <span>{t.nav.nynomicGroup}</span>
                           </Link>
                           <Link to="/visit-us" className="flex items-center gap-3 py-2 text-gray-700 hover:text-gray-900 px-2 bg-gray-200 rounded-lg mx-2 mb-2" onClick={() => setIsOpen(false)}>
                             <CustomTargetIcon className="h-4 w-4" />
                             <span>Visit Us</span>
                           </Link>
                           <Link to="/careers" className="flex items-center gap-3 py-2 text-gray-700 hover:text-gray-900 px-2 bg-gray-200 rounded-lg mx-2 mb-2" onClick={() => setIsOpen(false)}>
                             <CustomTargetIcon className="h-4 w-4" />
                             <span>{t.nav.careers}</span>
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
                  <div className="mt-8 pt-6 border-t border-gray-200 hidden sm:block">
                    <div className="flex items-center gap-4">
                      {/* Search Bar */}
                      <div className="flex-1">
                        <IntelligentSearchBar />
                      </div>
                      
                      {/* Language Selector */}
                      <Select value={language} onValueChange={(value) => setLanguage(value as any)}>
                        <SelectTrigger className="w-[70px] h-10 bg-white border border-gray-300 text-black hover:bg-gray-100 transition-all duration-300 [&>svg]:hidden text-3xl justify-center px-2 focus:ring-0 focus:ring-offset-0 rounded-md">
                          <SelectValue className="text-center w-full flex justify-center">
                            {language === "en" ? "🇺🇸" : language === "de" ? "🇩🇪" : language === "zh" ? "🇨🇳" : language === "ja" ? "🇯🇵" : "🇰🇷"}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent className="bg-white border border-gray-200 shadow-lg z-50 min-w-[70px] w-[70px]">
                          <SelectItem 
                            value="en"
                            className="justify-center hover:bg-gray-100 cursor-pointer text-black text-3xl py-3 pl-0 pr-0 [&_svg]:hidden [&>span:first-child]:hidden"
                          >
                            🇺🇸
                          </SelectItem>
                          <SelectItem 
                            value="de"
                            className="justify-center hover:bg-gray-100 cursor-pointer text-black text-3xl py-3 pl-0 pr-0 [&_svg]:hidden [&>span:first-child]:hidden"
                          >
                            🇩🇪
                          </SelectItem>
                          <SelectItem 
                            value="zh"
                            className="justify-center hover:bg-gray-100 cursor-pointer text-black text-3xl py-3 pl-0 pr-0 [&_svg]:hidden [&>span:first-child]:hidden"
                          >
                            🇨🇳
                          </SelectItem>
                          <SelectItem 
                            value="ja"
                            className="justify-center hover:bg-gray-100 cursor-pointer text-black text-3xl py-3 pl-0 pr-0 [&_svg]:hidden [&>span:first-child]:hidden"
                          >
                            🇯🇵
                          </SelectItem>
                          <SelectItem 
                            value="ko"
                            className="justify-center hover:bg-gray-100 cursor-pointer text-black text-3xl py-3 pl-0 pr-0 [&_svg]:hidden [&>span:first-child]:hidden"
                          >
                            🇰🇷
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      
                       {/* Contact Button */}
                       <Link to="/contact" onClick={() => setIsOpen(false)}>
                         <Button 
                           variant="default" 
                           className="h-10 bg-[#f9dc24] hover:bg-[#f9dc24]/90 text-black border border-[#f9dc24] hover:border-[#f9dc24]/90 transition-all duration-300 flex items-center justify-center px-6"
                         >
                           {t.nav.contact}
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
