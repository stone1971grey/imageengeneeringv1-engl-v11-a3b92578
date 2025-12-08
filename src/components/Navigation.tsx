import { Button } from "@/components/ui/button";
import { Menu, X, Camera, Wrench, Building2, Download, Info, MessageCircle, Smartphone, Car, Tv, Shield, Cog, Stethoscope, ScanLine, FlaskConical, Monitor, Zap, Package, Lightbulb, Puzzle, Cpu, CheckCircle, Microscope, Target, BarChart3, Settings, Search, Users, Building, GraduationCap, FileText, BookOpen, Video, Link2, ScrollText, Phone, MapPin, Calendar, Briefcase, Handshake, Leaf, Recycle, ShieldCheck, ChevronRight } from "lucide-react";
import { BadgeCheck, Sprout } from "lucide-react";
import { CustomTargetIcon } from "./CustomTargetIcon";
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
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

const PAGE_DESIGN_ICON_MAP: Record<string, any> = {
  car: Car,
  shield: Shield,
  smartphone: Smartphone,
  camera: Camera,
  cog: Cog,
  stethoscope: Stethoscope,
  scanline: ScanLine,
  monitor: Monitor,
  zap: Zap,
  file: FileText,
  target: CustomTargetIcon,
  flask: FlaskConical,
  'check-circle': CheckCircle,
  settings: Settings,
};

const Navigation = () => {
  const { t } = useTranslation();
  const navData = useNavigationData();
  const { language, setLanguage } = useLanguage();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredIndustry, setHoveredIndustry] = useState<string | null>(null);
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);
  const [hoveredSolution, setHoveredSolution] = useState<string | null>(null);
  const [hoveredTestService, setHoveredTestService] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAdminOrEditor, setIsAdminOrEditor] = useState(false);
  const [allowedPages, setAllowedPages] = useState<string[]>([]);
  const [styleguidePages, setStyleguidePages] = useState<Array<{ slug: string; title: string; children?: Array<{ slug: string; title: string }> }>>([]);
  const [hoveredStyleguide, setHoveredStyleguide] = useState<string | null>(null);
  const [pageDesignIcons, setPageDesignIcons] = useState<Record<string, string>>({});
  const [pageFlyoutData, setPageFlyoutData] = useState<Record<string, { imageUrl: string; descriptions: Record<string, string> }>>({});
  const [pageCtaConfig, setPageCtaConfig] = useState<Record<string, { slug: string; label: string; icon: string | null }>>({});

  const defaultStyleguidePage = styleguidePages[0] || null;
  const activeStyleguideSlug = hoveredStyleguide || defaultStyleguidePage?.slug || null;
  const activeStyleguidePage = activeStyleguideSlug
    ? styleguidePages.find((p) => p.slug === activeStyleguideSlug) || defaultStyleguidePage
    : defaultStyleguidePage;
  const activeStyleguideChildren = activeStyleguidePage?.children || [];
  
  // Check if current path is within styleguide section (with language prefix support)
  const isStyleguidePath = location.pathname.includes('/styleguide');
  // Check if current path is within backlog section
  const isBacklogPath = location.pathname.includes('/backlog');
  // Check if current path is admin dashboard
  const isAdminDashboard = location.pathname.includes('/admin-dashboard');
  
  // Combined check for styleguide-like navigation (styleguide OR backlog)
  const isStyleguideOrBacklog = isStyleguidePath || isBacklogPath;

  // Helper function to check if a link is active
  const isActive = (path: string) => {
    const currentPath = location.pathname;
    // Remove language prefix for comparison
    const pathWithoutLang = currentPath.replace(/^\/(en|de|ja|ko|zh)/, '');
    return pathWithoutLang === path || pathWithoutLang.startsWith(path + '/');
  };

  // Load styleguide pages from page_registry with hierarchy
  // ALWAYS load (not just when on styleguide path) so flyout menu shows current data
  useEffect(() => {
    const loadStyleguidePages = async () => {
      const { data, error } = await supabase
        .from('page_registry')
        .select('page_slug, page_title, parent_slug, page_id, position')
        .ilike('page_slug', 'styleguide%')
        .order('position', { ascending: true }); // Sort by position (drag & drop order)

      if (!error && data) {
        // Build hierarchy: pages directly under styleguide
        const directChildren = data.filter(p => p.parent_slug === 'styleguide');
        
        // For each direct child, find its children
        const pagesWithChildren = directChildren.map(parent => {
          const children = data
            .filter(p => p.parent_slug === parent.page_slug)
            .map(child => ({ slug: child.page_slug, title: child.page_title }));
          
          return {
            slug: parent.page_slug,
            title: parent.page_title,
            children: children.length > 0 ? children : undefined
          };
        });
        
        setStyleguidePages(pagesWithChildren);
      }
    };

    // Load styleguide pages immediately on mount for flyout menu
    loadStyleguidePages();
  }, []); // Empty dependency array - load once on mount

  // Load design icons for pages (used in navigation)
  useEffect(() => {
    const loadDesignIcons = async () => {
      const { data, error } = await supabase
        .from('page_registry')
        .select('page_slug, design_icon')
        .not('design_icon', 'is', null);

      if (error) {
        console.error('Error loading design icons:', error);
        return;
      }

      const mapping: Record<string, string> = {};
      (data || []).forEach((row: any) => {
        if (row.design_icon) {
          mapping[row.page_slug] = row.design_icon;
        }
      });
      setPageDesignIcons(mapping);
    };

    loadDesignIcons();
  }, []);

  // Load flyout images and descriptions for pages (used for enriched navigation hover)
  useEffect(() => {
    const loadFlyoutData = async () => {
      const { data, error } = await supabase
        .from('page_registry')
        .select('page_slug, flyout_image_url, flyout_description, flyout_description_translations')
        .not('flyout_image_url', 'is', null);

      if (error) {
        console.error('Error loading flyout data:', error);
        return;
      }

      const mapping: Record<string, { imageUrl: string; descriptions: Record<string, string> }> = {};
      (data || []).forEach((row: any) => {
        if (row.flyout_image_url) {
          // Use translations if available, otherwise fall back to legacy description as English
          let descriptions: Record<string, string> = {};
          if (row.flyout_description_translations && typeof row.flyout_description_translations === 'object') {
            descriptions = row.flyout_description_translations;
          } else if (row.flyout_description) {
            descriptions = { en: row.flyout_description };
          }
          
          mapping[row.page_slug] = {
            imageUrl: row.flyout_image_url,
            descriptions,
          };
        }
      });

      setPageFlyoutData(mapping);
    };

    loadFlyoutData();
  }, []);

  // Load CTA configuration for navigation buttons (per group like "your-solution" or "products")
  useEffect(() => {
    const loadCtaConfig = async () => {
      const { data, error } = await supabase
        .from('page_registry')
        .select('page_slug, cta_group, cta_label, cta_icon')
        .not('cta_group', 'is', null);

      if (error) {
        console.error('Error loading CTA config:', error);
        return;
      }

      const mapping: Record<string, { slug: string; label: string; icon: string | null }> = {};
      (data || []).forEach((row: any) => {
        if (row.cta_group) {
          mapping[row.cta_group] = {
            slug: row.page_slug,
            label: row.cta_label || '',
            icon: row.cta_icon || null,
          };
        }
      });

      setPageCtaConfig(mapping);
    };

    loadCtaConfig();
  }, []);
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

  // URL to page_slug mapping for admin links - now uses full hierarchical slugs
  // Convert URL path (e.g., "/your-solution/automotive") to database page_slug (e.g., "your-solution/automotive")
  const getPageSlugFromPath = (path: string): string => {
    // Remove leading slash and language prefix if present
    let slug = path.replace(/^\//, '');
    
    // Remove language prefix if present (e.g., "en/your-solution/automotive" -> "your-solution/automotive")
    const langMatch = slug.match(/^(en|de|ja|ko|zh)\//);
    if (langMatch) {
      slug = slug.replace(langMatch[0], '');
    }
    
    return slug;
  };

  // Helper function to get link: in Admin-Dashboard-Modus gehen Links ins Backend,
  // im normalen Frontend immer auf die öffentliche Seite – unabhängig von der Rolle.
  const getLink = (pageSlugOrPath: string, defaultPath?: string) => {
    const path = defaultPath || pageSlugOrPath;

    // Wenn wir NICHT im Admin-Dashboard sind, immer normale FE-Links benutzen
    if (!isAdminDashboard || !isAdminOrEditor) {
      if (!path.startsWith(`/${language}/`) && !path.startsWith('#')) {
        return `/${language}${path}`;
      }
      return path;
    }

    // Ab hier: Admin-Dashboard + Admin/Editor → Links steuern CMS-Ansicht
    // Extract page_slug from path using full hierarchical slug
    const pageSlug = getPageSlugFromPath(path);

    // Für Editor-Rollen Zugriff auf erlaubte Seiten prüfen
    if (allowedPages.length > 0 && !allowedPages.includes(pageSlug)) {
      if (!path.startsWith(`/${language}/`) && !path.startsWith('#')) {
        return `/${language}${path}`;
      }
      return path;
    }

    // Im Admin-Dashboard immer über englische Admin-UI routen (with URL encoding)
    return `/en/admin-dashboard?page=${encodeURIComponent(pageSlug)}`;
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

  // Industry slug mapping (used to connect hover state with page-level design elements)
  const industrySlugMap: Record<string, string> = {
    "Automotive": "your-solution/automotive",
    "Security & Surveillance": "your-solution/security-surveillance",
    "Mobile Phone": "your-solution/mobile-phone",
    "Web Camera": "your-solution/web-camera",
    "Machine Vision": "your-solution/machine-vision",
    "Medical & Endoscopy": "your-solution/medical-endoscopy",
    "Scanners & Archiving": "your-solution/scanners-archiving",
    "Photo & Video": "your-solution/photography",
  };

  // Product slug mapping (used to connect hover state with page-level design elements)
  const productSlugMap: Record<string, string> = {
    "Test Charts": "products/test-charts",
    "Illumination Devices": "products/illumination-devices",
    "Measurement Devices": "products/measurement-devices",
    "Software & APIs": "products/software",
    "Product Accessories": "products/accessories",
  };

  // Industry data mapping with subgroups - now using translated data
  const industryData = {
    "Automotive": { ...(navData.industries?.["Automotive"] || { description: "", subgroups: [] }), image: industryAutomotive },
    "Security & Surveillance": { ...(navData.industries?.["Security & Surveillance"] || { description: "", subgroups: [] }), image: industrySecurity },
    "Mobile Phone": { ...(navData.industries?.["Mobile Phone"] || { description: "", subgroups: [] }), image: industryMobile },
    "Web Camera": { ...(navData.industries?.["Web Camera"] || { description: "", subgroups: [] }), image: industryBroadcast },
    "Machine Vision": { ...(navData.industries?.["Machine Vision"] || { description: "", subgroups: [] }), image: industryMachineVision },
    "Medical & Endoscopy": { ...(navData.industries?.["Medical & Endoscopy"] || { description: "", subgroups: [] }), image: industryMedical },
    "Scanners & Archiving": { ...(navData.industries?.["Scanners & Archiving"] || { description: "", subgroups: [] }), image: industryScanning },
    "Photo & Video": { ...(navData.industries?.["Photo & Video"] || { description: "", subgroups: [] }), image: industryPhotography },
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
      <div className="w-full px-3 sm:px-6 py-2 sm:py-4">
        {/* Single row - logo left, main nav center, utility right */}
        <div className="flex items-center w-full gap-2 sm:gap-8">
          {/* Logo on the left - integrated for proper vertical centering */}
          <Link to={isAdminDashboard ? "/en/admin-dashboard" : "/"} className="flex items-center hover:opacity-80 transition-opacity flex-shrink-0 pl-2 md:pl-6 lg:pl-8">
            <img 
              src={logoIE} 
              alt="Image Engineering" 
              className="h-[36px] sm:h-[54px] w-auto max-w-[180px] sm:max-w-[270px] object-contain"
              style={{ width: 'auto' }}
            />
          </Link>
          
          <div className="flex-1"></div>
          {/* Main Navigation - aligned with search - Hide in Admin Dashboard */}
          {!isAdminDashboard && (
            <div className="hidden 2xl:flex items-center gap-6">
              {isStyleguideOrBacklog ? (
                /* Styleguide-specific Navigation with Flyout */
                <SimpleDropdown trigger={t.nav.styleguide} className="right-aligned" disabled={isAdminDashboard}>
                <div className="w-[640px] max-w-[90vw] bg-[#f3f3f3] rounded-lg z-50"
                     onMouseLeave={() => !isAdminDashboard && setHoveredStyleguide(null)}>
                  <div className="flex p-6 gap-6">
                    {/* Left Column: Sub-pages (expanded to the left) */}
                    <div className="space-y-4 flex-1 min-w-0 pr-4">
                      {activeStyleguideChildren && activeStyleguideChildren.length > 0 ? (
                        <div className="space-y-3">
                          {activeStyleguideChildren.map((subpage) => {
                            const translatedSubTitle = subpage.title;
                            
                            return (
                              <Link 
                                key={subpage.slug}
                                to={`/${language}/${subpage.slug}`}
                                className={`flex items-center gap-3 text-lg text-black transition-colors whitespace-nowrap rounded px-2 py-1 ${
                                  isActive(`/${subpage.slug}`) ? 'bg-[#f9dc24]' : 'hover:bg-[#f9dc24]'
                                }`}
                              >
                                <ChevronRight className="h-4 w-4 flex-shrink-0" />
                                <span>{translatedSubTitle}</span>
                              </Link>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-gray-500 text-center py-8">
                          <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                          <p>Keine Styleguide-Unterseiten verfügbar</p>
                        </div>
                      )}
                    </div>

                    {/* Right Column: Main Styleguide Pages (e.g., "Segmente") */}
                    <div className="space-y-4 w-[240px] flex-shrink-0 pl-4 border-l border-border">
                      <div className="space-y-3">
                        {styleguidePages.length > 0 ? (
                          <>
                            {styleguidePages.map((page) => {
                              const translatedTitle = page.title;
                              const isActiveParent = activeStyleguidePage?.slug === page.slug;
                              
                              return (
                                <div key={page.slug}>
                                  <Link 
                                    to={`/${language}/${page.slug}`}
                                    className={`flex items-center gap-3 text-lg text-black transition-colors whitespace-nowrap rounded px-2 py-1 ${
                                      isActiveParent ? 'bg-[#f9dc24]' : 'hover:bg-[#f9dc24]'
                                    }`}
                                    onMouseEnter={() => !isAdminDashboard && setHoveredStyleguide(page.slug)}
                                  >
                                    <FileText className="h-5 w-5 flex-shrink-0" />
                                    <span>{translatedTitle}</span>
                                  </Link>
                                </div>
                              );
                            })}
                            <div>
                              <Link
                                to={getLink('/backlog')}
                                className={`flex items-center gap-3 text-lg text-black transition-colors whitespace-nowrap rounded px-2 py-1 ${
                                  isActive('/backlog') ? 'bg-[#f9dc24]' : 'hover:bg-[#f9dc24]'
                                }`}
                              >
                                <FileText className="h-5 w-5 flex-shrink-0" />
                                <span>Backlog</span>
                              </Link>
                            </div>
                          </>
                        ) : (
                          <p className="text-gray-500 text-center py-4">No styleguide pages yet</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </SimpleDropdown>
            ) : (
              /* Regular Navigation */
              <>
            <SimpleDropdown trigger={t.nav.yourSolution} disabled={isAdminDashboard} triggerLink={`/${language}/your-solution`}>
                <div className="flex flex-col gap-2 w-[700px] max-w-[90vw] bg-[#f3f3f3] rounded-lg z-50"
                     onMouseLeave={() => !isAdminDashboard && setHoveredIndustry(null)}>
                  <div className="flex gap-4 p-4">
                    {/* Left Column: Industries */}
                    <div className="space-y-3 flex-1 pr-4 border-r border-border">
                       <h4 className="font-semibold mb-2 text-lg text-black">{t.nav.industries}</h4>
                       
                       <Link to={`/${language}/your-solution/automotive`} className={`flex items-center gap-3 text-lg text-black transition-colors cursor-pointer py-1 px-2 rounded-md ${
                          isActive('/your-solution/automotive') ? 'bg-[#f9dc24]' : 'hover:bg-[#f9dc24]'
                        }`}
                           onMouseEnter={() => !isAdminDashboard && setHoveredIndustry("Automotive")}>
                           {(() => {
                             const key = pageDesignIcons['your-solution/automotive'];
                             const IconComp = key ? PAGE_DESIGN_ICON_MAP[key] : null;
                             return IconComp ? <IconComp className="h-5 w-5" /> : null;
                           })()}
                           <span>{t.nav.automotive}</span>
                       </Link>
                        
                        <Link to={`/${language}/your-solution/security-surveillance`} className={`flex items-center gap-3 text-lg text-black transition-colors cursor-pointer py-1 px-2 rounded-md ${
                          isActive('/your-solution/security-surveillance') ? 'bg-[#f9dc24]' : 'hover:bg-[#f9dc24]'
                        }`}
                         onMouseEnter={() => !isAdminDashboard && setHoveredIndustry("Security & Surveillance")}>
                          {(() => {
                            const key = pageDesignIcons['your-solution/security-surveillance'];
                            const IconComp = key ? PAGE_DESIGN_ICON_MAP[key] : null;
                            return IconComp ? <IconComp className="h-5 w-5" /> : null;
                          })()}
                          <span>{t.nav.securitySurveillance}</span>
                       </Link>
                        
                       <Link to={getLink("mobile-phone", "/your-solution/mobile-phone")} className={`flex items-center gap-3 text-lg text-black transition-colors cursor-pointer py-1 px-2 rounded-md ${
                         isActive('/your-solution/mobile-phone') ? 'bg-[#f9dc24]' : 'hover:bg-[#f9dc24]'
                        }`}
                          onMouseEnter={() => !isAdminDashboard && setHoveredIndustry("Mobile Phone")}>
                          {(() => {
                            const key = pageDesignIcons['your-solution/mobile-phone'];
                            const IconComp = key ? PAGE_DESIGN_ICON_MAP[key] : null;
                            return IconComp ? <IconComp className="h-5 w-5" /> : null;
                          })()}
                          <span>{t.nav.mobilePhone}</span>
                       </Link>
                        
                         <Link to={getLink("web-camera", "/your-solution/web-camera")} className={`flex items-center gap-3 text-lg text-black transition-colors cursor-pointer py-1 px-2 rounded-md ${
                          isActive('/your-solution/web-camera') ? 'bg-[#f9dc24]' : 'hover:bg-[#f9dc24]'
                         }`}
                           onMouseEnter={() => !isAdminDashboard && setHoveredIndustry("Web Camera")}>
                           {(() => {
                             const key = pageDesignIcons['your-solution/web-camera'];
                             const IconComp = key ? PAGE_DESIGN_ICON_MAP[key] : null;
                             return IconComp ? <IconComp className="h-5 w-5" /> : null;
                           })()}
                           <span>{t.nav.webCamera}</span>
                        </Link>
                        
                        <Link to={getLink("machine-vision", "/your-solution/machine-vision")} className={`flex items-center gap-3 text-lg text-black transition-colors cursor-pointer py-1 px-2 rounded-md ${
                          isActive('/your-solution/machine-vision') ? 'bg-[#f9dc24]' : 'hover:bg-[#f9dc24]'
                         }`}
                           onMouseEnter={() => !isAdminDashboard && setHoveredIndustry("Machine Vision")}>
                           {(() => {
                             const key = pageDesignIcons['your-solution/machine-vision'];
                             const IconComp = key ? PAGE_DESIGN_ICON_MAP[key] : null;
                             return IconComp ? <IconComp className="h-5 w-5" /> : null;
                           })()}
                           <span>{t.nav.machineVision}</span>
                        </Link>
                        
                        <Link to={getLink("medical-endoscopy", "/your-solution/medical-endoscopy")} className={`flex items-center gap-3 text-lg text-black transition-colors cursor-pointer py-1 px-2 rounded-md ${
                          isActive('/your-solution/medical-endoscopy') ? 'bg-[#f9dc24]' : 'hover:bg-[#f9dc24]'
                         }`}
                           onMouseEnter={() => !isAdminDashboard && setHoveredIndustry("Medical & Endoscopy")}>
                           {(() => {
                             const key = pageDesignIcons['your-solution/medical-endoscopy'];
                             const IconComp = key ? PAGE_DESIGN_ICON_MAP[key] : null;
                             return IconComp ? <IconComp className="h-5 w-5" /> : null;
                           })()}
                           <span>{t.nav.medicalEndoscopy}</span>
                        </Link>
                        
                        <Link to={getLink("scanners-archiving", "/your-solution/scanners-archiving")} className={`flex items-center gap-3 text-lg text-black transition-colors cursor-pointer py-1 px-2 rounded-md ${
                          isActive('/your-solution/scanners-archiving') ? 'bg-[#f9dc24]' : 'hover:bg-[#f9dc24]'
                         }`}
                           onMouseEnter={() => !isAdminDashboard && setHoveredIndustry("Scanners & Archiving")}>
                           {(() => {
                             const key = pageDesignIcons['your-solution/scanners-archiving'];
                             const IconComp = key ? PAGE_DESIGN_ICON_MAP[key] : null;
                             return IconComp ? <IconComp className="h-5 w-5" /> : null;
                           })()}
                           <span>{t.nav.scannersArchiving}</span>
                        </Link>
                        
                        <Link to={getLink("photography", "/your-solution/photography")} className={`flex items-center gap-3 text-lg text-black transition-colors cursor-pointer py-1 px-2 rounded-md ${
                          isActive('/your-solution/photography') ? 'bg-[#f9dc24]' : 'hover:bg-[#f9dc24]'
                        }`}
                          onMouseEnter={() => !isAdminDashboard && setHoveredIndustry("Photo & Video")}>
                          {(() => {
                            const key = pageDesignIcons['your-solution/photography'];
                            const IconComp = key ? PAGE_DESIGN_ICON_MAP[key] : null;
                            return IconComp ? <IconComp className="h-5 w-5" /> : null;
                          })()}
                          <span>{t.nav.photoVideo}</span>
                        </Link>
                    </div>
                    
                     {/* Right Column: Applications */}
                     <div className="space-y-3 flex-1">
                       <h4 className="font-semibold mb-2 text-lg text-black">
                         {hoveredIndustry ? `${(t.nav as any)[hoveredIndustry] || hoveredIndustry} - ${t.nav.applications}` : t.nav.applications}
                       </h4>
                       
                       {/* Conditional Rendering of Applications */}
                       {hoveredIndustry && industryData[hoveredIndustry as keyof typeof industryData] && (
                         <div className="space-y-3">
                             {industryData[hoveredIndustry as keyof typeof industryData].subgroups.map((application, index) => {
                               const linkPath = application.link !== "#" ? application.link : null;
                               const isLinkActive = linkPath ? isActive(linkPath) : false;
                               return (
                                 <div key={index} className={`flex items-center gap-3 text-lg transition-colors cursor-pointer text-black py-1 px-2 rounded-md ${
                                   isLinkActive ? 'bg-[#f9dc24]' : 'hover:bg-[#f9dc24]'
                                 }`}>
                                   <ChevronRight className="h-4 w-4" />
                                   {application.link === "#" ? (
                                     <span>{application.name}</span>
                                   ) : (
                                     <Link to={getLink(application.link)}>{application.name}</Link>
                                   )}
                                 </div>
                               );
                             })}
                         </div>
                       )}
                       
                       {/* Default state when no industry is hovered */}
                       {!hoveredIndustry && (
                         <div className="text-gray-500 text-center py-4">
                           <Building2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                           <p className="text-sm">{t.nav.hoverForApplications}</p>
                         </div>
                       )}
                     </div>
                  </div>

                  {/* CTA Button */}
                  <div className="bg-[#f3f3f3] px-4 pt-3 pb-3">
                    {(() => {
                      const cta = pageCtaConfig['your-solution'];
                      const targetSlug = cta?.slug || 'your-solution';
                      const label = cta?.label || t.hero.findYourSolution;

                      const iconKey = cta?.icon || 'search';
                      const CtaIcon = iconKey === 'microscope' ? Microscope : iconKey === 'flask' ? FlaskConical : iconKey === 'target' ? Target : Search;

                      return (
                        <Link to={getLink(targetSlug, `/${targetSlug}`)}>
                          <Button variant="default" className="w-full bg-[#f9dc24] text-black hover:bg-[#e5c820] py-3">
                            <CtaIcon className="h-5 w-5 mr-2" />
                            <span className="text-base font-medium">{label}</span>
                          </Button>
                        </Link>
                      );
                    })()}
                  </div>
                  {/* Image Rollover under Flyout - only show if flyout data exists in backend */}
                  {hoveredIndustry && (() => {
                    const pageSlug = industrySlugMap[hoveredIndustry] || "";
                    const flyout = pageSlug ? pageFlyoutData[pageSlug] : undefined;
                    
                    // Only render if flyout data is configured in backend
                    if (!flyout?.imageUrl) return null;

                    return (
                      <div className="bg-[#f3f3f3] p-3">
                        <div className="flex items-center gap-4 p-3 bg-white rounded-lg shadow-sm">
                          <img
                            src={flyout.imageUrl}
                            alt={(t.nav as any)[hoveredIndustry] || hoveredIndustry}
                            className="w-[180px] h-[180px] object-cover rounded-lg"
                          />
                          <div className="text-black">
                            <h4 className="font-semibold text-lg mb-1">{(t.nav as any)[hoveredIndustry] || hoveredIndustry}</h4>
                            <p className="text-base text-gray-700 leading-relaxed">
                              {flyout.descriptions[language] || flyout.descriptions['en'] || ''}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
            </SimpleDropdown>

            <SimpleDropdown trigger={t.nav.products} disabled={isAdminDashboard} triggerLink={`/${language}/products`}>
                <div className="flex flex-col gap-2 w-[700px] max-w-[90vw] bg-[#f3f3f3] rounded-lg z-50"
                     onMouseLeave={() => !isAdminDashboard && setHoveredProduct(null)}>
                  <div className="flex gap-4 p-4">
                    {/* Left Column: Product Groups */}
                    <div className="space-y-3 flex-1 pr-4 border-r border-border">
                      <h4 className="font-semibold mb-2 text-lg text-black">{t.nav.products}</h4>
                       
                       <Link to={`/${language}/products/test-charts`} className={`flex items-center gap-3 text-lg text-black transition-colors cursor-pointer py-1 px-2 rounded-md ${
                          isActive('/products/test-charts') ? 'bg-[#f9dc24]' : 'hover:bg-[#f9dc24]'
                       }`}
                          onMouseEnter={() => !isAdminDashboard && setHoveredProduct("Test Charts")}>
                          {(() => {
                            const key = pageDesignIcons['products/test-charts'];
                            const IconComp = key ? PAGE_DESIGN_ICON_MAP[key] : null;
                            return IconComp ? <IconComp className="h-5 w-5" /> : null;
                          })()}
                          <span>{t.nav.testCharts}</span>
                       </Link>
                       
                       <Link to={`/${language}/products/illumination-devices`} className={`flex items-center gap-3 text-lg text-black transition-colors cursor-pointer py-1 px-2 rounded-md ${
                          isActive('/products/illumination-devices') ? 'bg-[#f9dc24]' : 'hover:bg-[#f9dc24]'
                       }`}
                         onMouseEnter={() => !isAdminDashboard && setHoveredProduct("Illumination Devices")}>
                         {(() => {
                           const key = pageDesignIcons['products/illumination-devices'];
                           const IconComp = key ? PAGE_DESIGN_ICON_MAP[key] : null;
                           return IconComp ? <IconComp className="h-5 w-5" /> : null;
                         })()}
                         <span>{t.nav.illuminationDevices}</span>
                       </Link>
                       
                       <Link to={`/${language}/products/measurement-devices`} className={`flex items-center gap-3 text-lg text-black transition-colors cursor-pointer py-1 px-2 rounded-md ${
                          isActive('/products/measurement-devices') ? 'bg-[#f9dc24]' : 'hover:bg-[#f9dc24]'
                       }`}
                         onMouseEnter={() => !isAdminDashboard && setHoveredProduct("Measurement Devices")}>
                         {(() => {
                           const key = pageDesignIcons['products/measurement-devices'];
                           const IconComp = key ? PAGE_DESIGN_ICON_MAP[key] : null;
                           return IconComp ? <IconComp className="h-5 w-5" /> : null;
                         })()}
                         <span>{t.nav.measurementDevices}</span>
                       </Link>
                       
                       <Link to={`/${language}/products/software`} className={`flex items-center gap-3 text-lg text-black transition-colors cursor-pointer py-1 px-2 rounded-md ${
                          isActive('/products/software') ? 'bg-[#f9dc24]' : 'hover:bg-[#f9dc24]'
                       }`}
                         onMouseEnter={() => !isAdminDashboard && setHoveredProduct("Software & APIs")}>
                         {(() => {
                           const key = pageDesignIcons['products/software'];
                           const IconComp = key ? PAGE_DESIGN_ICON_MAP[key] : null;
                           return IconComp ? <IconComp className="h-5 w-5" /> : null;
                         })()}
                         <span>{t.nav.softwareApis}</span>
                       </Link>
                       
                       <Link to={`/${language}/products/bundles-services`} className={`flex items-center gap-3 text-lg text-black transition-colors cursor-pointer py-1 px-2 rounded-md ${
                          isActive('/products/bundles-services') ? 'bg-[#f9dc24]' : 'hover:bg-[#f9dc24]'
                       }`}
                         onMouseEnter={() => !isAdminDashboard && setHoveredProduct("Product Accessories")}>
                         {(() => {
                           const key = pageDesignIcons['products/bundles-services'];
                           const IconComp = key ? PAGE_DESIGN_ICON_MAP[key] : null;
                           return IconComp ? <IconComp className="h-5 w-5" /> : null;
                         })()}
                         <span>{t.nav.productAccessories}</span>
                       </Link>
                    </div>
                    
                     {/* Right Column: Subgroups */}
                     <div className="space-y-3 flex-1">
                       <h4 className="font-semibold mb-2 text-lg text-black">
                         {hoveredProduct ? `${(t.nav as any)[hoveredProduct] || hoveredProduct} - ${t.nav.subgroups}` : t.nav.subgroups}
                       </h4>
                       
                       {/* Conditional Rendering of Subgroups */}
                        {hoveredProduct && productData[hoveredProduct as keyof typeof productData] && (
                          <div className="space-y-3">
                            {productData[hoveredProduct as keyof typeof productData].subgroups.map((subgroup, index) => {
                              const linkPath = subgroup.link !== "#" ? subgroup.link : null;
                              const isLinkActive = linkPath ? isActive(linkPath) : false;
                              return (
                                <div key={index} className={`flex items-center gap-3 text-lg transition-colors cursor-pointer text-black py-1 px-2 rounded-md ${
                                  isLinkActive ? 'bg-[#f9dc24]' : 'hover:bg-[#f9dc24]'
                                }`}>
                                  <ChevronRight className="h-4 w-4" />
                                  {subgroup.link === "#" ? (
                                    <span>{subgroup.name}</span>
                                  ) : (
                                    <Link to={getLink(subgroup.link)}>{subgroup.name}</Link>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                       
                       {/* Default state when no product is hovered */}
                       {!hoveredProduct && (
                         <div className="text-gray-500 text-center py-4">
                           <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                           <p className="text-sm">{t.nav.hoverForSubgroups}</p>
                         </div>
                       )}
                     </div>
                  </div>

                  {/* CTA Button */}
                  <div className="bg-[#f3f3f3] px-4 pt-3 pb-3">
                    <Link to="/inside-lab">
                      <Button variant="default" className="w-full bg-black text-white hover:bg-gray-800 py-3">
                        <Microscope className="h-5 w-5 mr-2" />
                        <span className="text-base font-medium">{t.nav.insideTestingLab}</span>
                      </Button>
                    </Link>
                  </div>
                  
                  {/* Image Rollover under Flyout - only show if flyout data exists in backend */}
                  {hoveredProduct && (() => {
                    const pageSlug = productSlugMap[hoveredProduct] || "";
                    const flyout = pageSlug ? pageFlyoutData[pageSlug] : undefined;
                    
                    // Only render if flyout data is configured in backend
                    if (!flyout?.imageUrl) return null;

                    return (
                      <div className="bg-[#f3f3f3] p-3">
                        <div className="flex items-center gap-4 p-3 bg-white rounded-lg shadow-sm">
                          <img 
                            src={flyout.imageUrl} 
                            alt={(t.nav as any)[hoveredProduct] || hoveredProduct} 
                            className="w-[180px] h-[180px] object-cover rounded-lg" 
                          />
                          <div className="text-black">
                            <h4 className="font-semibold text-base mb-1">{(t.nav as any)[hoveredProduct] || hoveredProduct}</h4>
                            <p className="text-sm text-gray-600 leading-relaxed">
                              {flyout.descriptions[language] || flyout.descriptions['en'] || ''}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </SimpleDropdown>

              <SimpleDropdown trigger={t.nav.testServices} disabled={isAdminDashboard}>
                <div className="flex flex-col gap-2 w-[700px] max-w-[90vw] bg-[#f3f3f3] rounded-lg z-50"
                     onMouseLeave={() => !isAdminDashboard && setHoveredTestService(null)}>
                  <div className="flex gap-4 p-4">
                    {/* Left Column: Service Categories */}
                    <div className="space-y-3 flex-1 pr-4 border-r border-border">
                      <h4 className="font-semibold mb-2 text-lg text-black">{t.nav.testServices}</h4>
                      
                       <Link to={getLink('/test-lab/overview')} 
                         className="flex items-center gap-3 text-lg text-black hover:bg-[#f9dc24] transition-colors cursor-pointer py-1 px-2 rounded-md"
                         onMouseEnter={() => !isAdminDashboard && setHoveredTestService("Overview")}>
                         {(() => {
                           const key = pageDesignIcons['test-lab/overview'];
                           const IconComp = key ? PAGE_DESIGN_ICON_MAP[key] : null;
                           return IconComp ? <IconComp className="h-5 w-5" /> : null;
                         })()}
                         <span>{t.nav.overview}</span>
                       </Link>
                       
                       <Link to={getLink('/test-lab/automotive')}
                         className="flex items-center gap-3 text-lg text-black hover:bg-[#f9dc24] transition-colors cursor-pointer py-1 px-2 rounded-md"
                         onMouseEnter={() => !isAdminDashboard && setHoveredTestService("Automotive")}>
                         {(() => {
                           const key = pageDesignIcons['test-lab/automotive'];
                           const IconComp = key ? PAGE_DESIGN_ICON_MAP[key] : null;
                           return IconComp ? <IconComp className="h-5 w-5" /> : null;
                         })()}
                         <span>{t.nav.automotive}</span>
                       </Link>
                       
                       <Link to={getLink('/test-lab/vcx')}
                         className="flex items-center gap-3 text-lg text-black hover:bg-[#f9dc24] transition-colors cursor-pointer py-1 px-2 rounded-md"
                         onMouseEnter={() => !isAdminDashboard && setHoveredTestService("VCX")}>
                         {(() => {
                           const key = pageDesignIcons['test-lab/vcx'];
                           const IconComp = key ? PAGE_DESIGN_ICON_MAP[key] : null;
                           return IconComp ? <IconComp className="h-5 w-5" /> : null;
                         })()}
                         <span>VCX</span>
                       </Link>
                       
                        <Link to={getLink('/test-lab/image-quality')}
                          className="flex items-center gap-3 text-lg text-black hover:bg-[#f9dc24] transition-colors cursor-pointer py-1 px-2 rounded-md"
                          onMouseEnter={() => !isAdminDashboard && setHoveredTestService("Image Quality")}>
                          {(() => {
                            const key = pageDesignIcons['test-lab/image-quality'];
                            const IconComp = key ? PAGE_DESIGN_ICON_MAP[key] : null;
                            return IconComp ? <IconComp className="h-5 w-5" /> : null;
                          })()}
                          <span>{t.nav.infoHub}</span>
                        </Link>
                       
                       <Link to={getLink('/test-lab/standardized')}
                         className="flex items-center gap-3 text-lg text-black hover:bg-[#f9dc24] transition-colors cursor-pointer py-1 px-2 rounded-md"
                         onMouseEnter={() => !isAdminDashboard && setHoveredTestService("Standardized")}>
                         {(() => {
                           const key = pageDesignIcons['test-lab/standardized'];
                           const IconComp = key ? PAGE_DESIGN_ICON_MAP[key] : null;
                           return IconComp ? <IconComp className="h-5 w-5" /> : null;
                         })()}
                         <span>{t.nav.standardized}</span>
                       </Link>
                       
                       <Link to={getLink('/test-lab/specialized')}
                         className="flex items-center gap-3 text-lg text-black hover:bg-[#f9dc24] transition-colors cursor-pointer py-1 px-2 rounded-md"
                         onMouseEnter={() => !isAdminDashboard && setHoveredTestService("Specialized/Custom")}>
                         {(() => {
                           const key = pageDesignIcons['test-lab/specialized'];
                           const IconComp = key ? PAGE_DESIGN_ICON_MAP[key] : null;
                           return IconComp ? <IconComp className="h-5 w-5" /> : null;
                         })()}
                         <span>{t.nav.specializedCustom}</span>
                       </Link>
                    </div>
                    
                     {/* Right Column: Services */}
                     <div className="space-y-3 flex-1">
                       <h4 className="font-semibold mb-2 text-lg text-black">
                         {hoveredTestService ? `${(t.nav as any)[hoveredTestService] || hoveredTestService} - ${t.nav.services}` : t.nav.services}
                       </h4>
                       
                       {/* Conditional Rendering of Services */}
                       {hoveredTestService && testServicesData[hoveredTestService as keyof typeof testServicesData] && (
                         <div className="space-y-3">
                           {testServicesData[hoveredTestService as keyof typeof testServicesData].services.map((service, index) => (
                             <div key={index} className={`flex items-center gap-3 text-lg transition-colors cursor-pointer text-black py-1 px-2 rounded-md ${
                               (service as any).active ? 'bg-[#f9dc24]' : 'hover:bg-[#f9dc24]'
                             }`}>
                               <ChevronRight className="h-4 w-4" />
                                {service.link === "#" ? (
                                  <span>{service.name}</span>
                                ) : (
                                  <Link to={getLink(service.link)}>{service.name}</Link>
                                )}
                              </div>
                           ))}
                         </div>
                       )}
                       
                       {/* Default state when no service category is hovered */}
                       {!hoveredTestService && (
                         <div className="text-gray-500 text-center py-4">
                           <FlaskConical className="h-8 w-8 mx-auto mb-2 opacity-50" />
                           <p className="text-sm">{t.nav.hoverForServices}</p>
                         </div>
                       )}
                     </div>
                  </div>

                  {/* CTA Button */}
                  <div className="bg-[#f3f3f3] px-4 pt-3 pb-3">
                    <Link to={getLink('inside-lab', '/inside-lab')}>
                      <Button variant="default" className="w-full bg-[#f9dc24] text-black hover:bg-[#e5c820] py-3">
                        <FlaskConical className="h-5 w-5 mr-2" />
                        <span className="text-base font-medium">Visit our Testing Lab</span>
                      </Button>
                    </Link>
                  </div>
                  {/* Image Rollover under Flyout - only show if flyout data exists in backend */}
                  {hoveredTestService && (() => {
                    // Map hover state to page slug
                    const testLabSlugMap: Record<string, string> = {
                      "Overview": "test-lab/overview",
                      "Automotive": "test-lab/automotive",
                      "VCX": "test-lab/vcx",
                      "Image Quality": "test-lab/image-quality",
                      "Standardized": "test-lab/standardized",
                      "Specialized/Custom": "test-lab/specialized",
                    };
                    const pageSlug = testLabSlugMap[hoveredTestService] || "";
                    const flyout = pageSlug ? pageFlyoutData[pageSlug] : undefined;
                    
                    // Only render if flyout data is configured in backend
                    if (!flyout?.imageUrl) return null;

                    return (
                      <div className="bg-[#f3f3f3] p-3">
                        <div className="flex items-center gap-4 p-3 bg-white rounded-lg shadow-sm">
                          <img
                            src={flyout.imageUrl}
                            alt={(t.nav as any)[hoveredTestService] || hoveredTestService}
                            className="w-[180px] h-[180px] object-cover rounded-lg"
                          />
                          <div className="text-black">
                            <h4 className="font-semibold text-lg mb-1">{(t.nav as any)[hoveredTestService] || hoveredTestService}</h4>
                            <p className="text-base text-gray-700 leading-relaxed">
                              {flyout.descriptions[language] || flyout.descriptions['en'] || ''}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </SimpleDropdown>

              <SimpleDropdown trigger={t.nav.resources} className="right-aligned" disabled={isAdminDashboard}>
                <div className="flex flex-col gap-2 w-[280px] max-w-[90vw] bg-[#f3f3f3] rounded-lg">
                   <div className="flex gap-4 p-4">
                     <div className="space-y-3 flex-1">
                       <h4 className="font-semibold mb-2 text-lg text-black">{t.nav.resources}</h4>
                       <Link to={getLink('training-events/webinars', `/${language}/training-events/webinars`)} className="flex items-center gap-3 text-lg text-black hover:bg-[#f9dc24] transition-colors cursor-pointer py-1 px-2 rounded-md">
                         {(() => {
                           const key = pageDesignIcons['training-events/webinars'];
                           const IconComp = key ? PAGE_DESIGN_ICON_MAP[key] : null;
                           return IconComp ? <IconComp className="h-5 w-5" /> : null;
                         })()}
                         <span>{t.nav.webinars}</span>
                       </Link>
                       <Link to={getLink('training-events/onsite-training', `/${language}/training-events/onsite-training`)} className="flex items-center gap-3 text-lg text-black hover:bg-[#f9dc24] transition-colors cursor-pointer py-1 px-2 rounded-md">
                         {(() => {
                           const key = pageDesignIcons['training-events/onsite-training'];
                           const IconComp = key ? PAGE_DESIGN_ICON_MAP[key] : null;
                           return IconComp ? <IconComp className="h-5 w-5" /> : null;
                         })()}
                         <span>{t.nav.onSiteTraining}</span>
                       </Link>
                       <Link to={getLink('training-events/visit-our-lab', `/${language}/training-events/visit-our-lab`)} className="flex items-center gap-3 text-lg text-black hover:bg-[#f9dc24] transition-colors cursor-pointer py-1 px-2 rounded-md">
                         {(() => {
                           const key = pageDesignIcons['training-events/visit-our-lab'];
                           const IconComp = key ? PAGE_DESIGN_ICON_MAP[key] : null;
                           return IconComp ? <IconComp className="h-5 w-5" /> : null;
                         })()}
                         <span>{t.nav.visitTestLab}</span>
                       </Link>
                       <Link to={getLink('training-events/event-schedule', `/${language}/training-events/event-schedule`)} className="flex items-center gap-3 text-lg text-black hover:bg-[#f9dc24] transition-colors cursor-pointer py-1 px-2 rounded-md">
                         {(() => {
                           const key = pageDesignIcons['training-events/event-schedule'];
                           const IconComp = key ? PAGE_DESIGN_ICON_MAP[key] : null;
                           return IconComp ? <IconComp className="h-5 w-5" /> : null;
                         })()}
                         <span>{t.nav.eventSchedule}</span>
                       </Link>
                     </div>
                   </div>

                  <div className="bg-[#f3f3f3] px-4 pt-3 pb-3">
                    <Link to={`/${language}/events`}>
                      <Button variant="default" className="w-full bg-[#f9dc24] text-black hover:bg-[#e5c820] py-3">
                        <GraduationCap className="h-5 w-5 mr-2" />
                        <span className="text-base font-medium">{t.nav.viewTrainingEvents}</span>
                      </Button>
                    </Link>
                  </div>
                </div>
              </SimpleDropdown>

              <SimpleDropdown trigger={t.nav.infoHub} className="right-aligned" disabled={isAdminDashboard}>
                <div className="flex flex-col gap-2 w-[520px] max-w-[90vw] bg-[#f3f3f3] rounded-lg">
                  <div className="flex gap-4 p-4">
                    <div className="space-y-3 flex-1 pr-4 border-r border-border">
                      <h4 className="font-semibold mb-2 text-lg text-black">Resources</h4>
                      <Link to={getLink('info-hub/image-quality-factors', `/${language}/info-hub/image-quality-factors`)} className="flex items-center gap-3 text-lg text-black hover:bg-[#f9dc24] transition-colors cursor-pointer py-1 px-2 rounded-md">
                        {(() => {
                          const key = pageDesignIcons['info-hub/image-quality-factors'];
                          const IconComp = key ? PAGE_DESIGN_ICON_MAP[key] : null;
                          return IconComp ? <IconComp className="h-5 w-5" /> : null;
                        })()}
                        <span>{t.nav.imageQualityFactors}</span>
                      </Link>
                      <Link to={getLink('info-hub/blog', `/${language}/info-hub/blog`)} className="flex items-center gap-3 text-lg text-black hover:bg-[#f9dc24] transition-colors cursor-pointer py-1 px-2 rounded-md">
                        {(() => {
                          const key = pageDesignIcons['info-hub/blog'];
                          const IconComp = key ? PAGE_DESIGN_ICON_MAP[key] : null;
                          return IconComp ? <IconComp className="h-5 w-5" /> : null;
                        })()}
                        <span>{t.nav.blog}</span>
                      </Link>
                      <Link to={getLink('info-hub/international-standards', `/${language}/info-hub/international-standards`)} className="flex items-center gap-3 text-lg text-black hover:bg-[#f9dc24] transition-colors cursor-pointer py-1 px-2 rounded-md">
                        {(() => {
                          const key = pageDesignIcons['info-hub/international-standards'];
                          const IconComp = key ? PAGE_DESIGN_ICON_MAP[key] : null;
                          return IconComp ? <IconComp className="h-5 w-5" /> : null;
                        })()}
                        <span>{t.nav.internationalStandards}</span>
                      </Link>
                      <Link to={getLink('info-hub/ie-technology', `/${language}/info-hub/ie-technology`)} className="flex items-center gap-3 text-lg text-black hover:bg-[#f9dc24] transition-colors cursor-pointer py-1 px-2 rounded-md">
                        {(() => {
                          const key = pageDesignIcons['info-hub/ie-technology'];
                          const IconComp = key ? PAGE_DESIGN_ICON_MAP[key] : null;
                          return IconComp ? <IconComp className="h-5 w-5" /> : null;
                        })()}
                        <span>{t.nav.ieTechnology}</span>
                      </Link>
                    </div>

                    <div className="space-y-3 flex-1">
                      <h4 className="font-semibold mb-2 text-lg text-black">{t.nav.publications}</h4>
                      <Link to={`/${language}/conference_paper_download`} className="flex items-center gap-3 text-lg text-black hover:bg-[#f9dc24] transition-colors cursor-pointer py-1 px-2 rounded-md">
                        <CustomTargetIcon className="h-5 w-5" />
                        <span>{t.nav.conferencePapers}</span>
                      </Link>
                      <Link to={`/${language}/whitepaper`} className="flex items-center gap-3 text-lg text-black hover:bg-[#f9dc24] transition-colors cursor-pointer py-1 px-2 rounded-md">
                        <CustomTargetIcon className="h-5 w-5" />
                        <span>{t.nav.whitePapersTheses}</span>
                      </Link>
                      <Link to={`/${language}/video_download`} className="flex items-center gap-3 text-lg text-black hover:bg-[#f9dc24] transition-colors cursor-pointer py-1 px-2 rounded-md">
                        <CustomTargetIcon className="h-5 w-5" />
                        <span>{t.nav.videoArchive}</span>
                      </Link>
                    </div>
                  </div>

                  <div className="bg-[#f3f3f3] px-4 pt-3 pb-3">
                    <Link to="/downloads" className="w-full">
                      <Button variant="default" className="w-full bg-[#f9dc24] text-black hover:bg-[#e5c820] py-3">
                        <Microscope className="h-5 w-5 mr-2" />
                        <span className="text-base font-medium">{t.nav.exploreInfoHub}</span>
                      </Button>
                    </Link>
                  </div>
                </div>
            </SimpleDropdown>

            <SimpleDropdown trigger={t.nav.company} className="right-aligned" disabled={isAdminDashboard}>
                <div className="flex flex-col gap-2 w-[520px] max-w-[90vw] bg-[#f3f3f3] rounded-lg">
                   <div className="flex gap-4 p-4">
                       <div className="space-y-3 flex-1 pr-4 border-r border-border">
                         <h4 className="font-semibold mb-2 text-lg text-black">{t.nav.aboutIE}</h4>
                         <Link to={`/${language}/news`} className={`flex items-center gap-3 text-lg text-black transition-colors py-1 px-2 rounded-md ${
                           isActive('/news') ? 'bg-[#f9dc24]' : 'hover:bg-[#f9dc24]'
                         }`}>
                           <CustomTargetIcon className="h-5 w-5" />
                           <span>{t.nav.news}</span>
                         </Link>
                          <Link to={getLink('company/about', `/${language}/company/about`)} className="flex items-center gap-3 text-lg text-black hover:bg-[#f9dc24] transition-colors py-1 px-2 rounded-md">
                            {(() => {
                              const key = pageDesignIcons['company/about'];
                              const IconComp = key ? PAGE_DESIGN_ICON_MAP[key] : null;
                              return IconComp ? <IconComp className="h-5 w-5" /> : null;
                            })()}
                            <span>{t.nav.aboutUs}</span>
                          </Link>
                          <Link to={getLink('company/team', `/${language}/company/team`)} className="flex items-center gap-3 text-lg text-black hover:bg-[#f9dc24] transition-colors py-1 px-2 rounded-md">
                            {(() => {
                              const key = pageDesignIcons['company/team'];
                              const IconComp = key ? PAGE_DESIGN_ICON_MAP[key] : null;
                              return IconComp ? <IconComp className="h-5 w-5" /> : null;
                            })()}
                            <span>{t.nav.team}</span>
                          </Link>
                          <Link to={getLink('company/nynomic-group', `/${language}/company/nynomic-group`)} className="flex items-center gap-3 text-lg text-black hover:bg-[#f9dc24] transition-colors py-1 px-2 rounded-md">
                            {(() => {
                              const key = pageDesignIcons['company/nynomic-group'];
                              const IconComp = key ? PAGE_DESIGN_ICON_MAP[key] : null;
                              return IconComp ? <IconComp className="h-5 w-5" /> : null;
                            })()}
                            <span>{t.nav.nynomicGroup}</span>
                          </Link>
                          <Link to={getLink('company/visit-us', `/${language}/company/visit-us`)} className="flex items-center gap-3 text-lg text-black hover:bg-[#f9dc24] transition-colors py-1 px-2 rounded-md">
                            {(() => {
                              const key = pageDesignIcons['company/visit-us'];
                              const IconComp = key ? PAGE_DESIGN_ICON_MAP[key] : null;
                              return IconComp ? <IconComp className="h-5 w-5" /> : null;
                            })()}
                            <span>{t.nav.visitUs}</span>
                          </Link>
                          <Link to={getLink('company/careers', `/${language}/company/careers`)} className="flex items-center gap-3 text-lg text-black hover:bg-[#f9dc24] transition-colors py-1 px-2 rounded-md">
                            {(() => {
                              const key = pageDesignIcons['company/careers'];
                              const IconComp = key ? PAGE_DESIGN_ICON_MAP[key] : null;
                              return IconComp ? <IconComp className="h-5 w-5" /> : null;
                            })()}
                            <span>{t.nav.careers}</span>
                          </Link>
                       </div>
                       
                       <div className="space-y-3 flex-1">
                         <h4 className="font-semibold mb-2 text-lg text-black">Business & Partnerships</h4>
                          <Link to={getLink('company/resellers-subsidiaries', `/${language}/company/resellers-subsidiaries`)} className="flex items-center gap-3 text-lg text-black hover:bg-[#f9dc24] transition-colors py-1 px-2 rounded-md">
                            {(() => {
                              const key = pageDesignIcons['company/resellers-subsidiaries'];
                              const IconComp = key ? PAGE_DESIGN_ICON_MAP[key] : null;
                              return IconComp ? <IconComp className="h-5 w-5" /> : null;
                            })()}
                            <span>Resellers & Subsidiaries</span>
                          </Link>
                          <Link to={getLink('company/strategic-partnerships', `/${language}/company/strategic-partnerships`)} className="flex items-center gap-3 text-lg text-black hover:bg-[#f9dc24] transition-colors py-1 px-2 rounded-md">
                            {(() => {
                              const key = pageDesignIcons['company/strategic-partnerships'];
                              const IconComp = key ? PAGE_DESIGN_ICON_MAP[key] : null;
                              return IconComp ? <IconComp className="h-5 w-5" /> : null;
                            })()}
                            <span>Strategic Partnerships</span>
                          </Link>
                          <Link to={getLink('company/group-memberships', `/${language}/company/group-memberships`)} className="flex items-center gap-3 text-lg text-black hover:bg-[#f9dc24] transition-colors py-1 px-2 rounded-md">
                            {(() => {
                              const key = pageDesignIcons['company/group-memberships'];
                              const IconComp = key ? PAGE_DESIGN_ICON_MAP[key] : null;
                              return IconComp ? <IconComp className="h-5 w-5" /> : null;
                            })()}
                            <span>Group Memberships</span>
                          </Link>
                          <Link to={getLink('company/iso-9001', `/${language}/company/iso-9001`)} className="flex items-center gap-3 text-lg text-black hover:bg-[#f9dc24] transition-colors py-1 px-2 rounded-md">
                            {(() => {
                              const key = pageDesignIcons['company/iso-9001'];
                              const IconComp = key ? PAGE_DESIGN_ICON_MAP[key] : null;
                              return IconComp ? <IconComp className="h-5 w-5" /> : null;
                            })()}
                            <span>ISO 9001</span>
                          </Link>
                        </div>
                     </div>
                   </div>
                 </SimpleDropdown>
              </>
            )}
          </div>
          )}
          
          {/* Utility Navigation - aligned with main nav - Hide in Admin Dashboard */}
          {!isAdminDashboard && (
            <div className="hidden 2xl:flex">
              <UtilityNavigation />
            </div>
          )}

          {/* Mobile menu button - Hide in Admin Dashboard */}
          {!isAdminDashboard && (
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
          )}
        </div>

        {/* Mobile Navigation - Hide in Admin Dashboard */}
        {!isAdminDashboard && (
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
                  {isStyleguideOrBacklog && (
                    <Accordion type="single" collapsible className="space-y-0 mb-4">
                      {/* Styleguide mobile navigation */}
                      <AccordionItem value="styleguide-root" className="border-none">
                        <AccordionTrigger className="px-4 py-4 text-lg font-medium text-gray-900 hover:no-underline bg-[#f3f3f5] rounded-lg mx-2 mb-2 data-[state=open]:bg-[#4d4c4c] data-[state=open]:text-white">
                          {t.nav.styleguide}
                        </AccordionTrigger>
                        <AccordionContent className="px-0 pb-4">
                          <div className="space-y-2">
                            <Link
                              to={`/${language}/styleguide`}
                              className="block px-4 py-2 text-gray-700 hover:text-gray-900"
                              onClick={() => setIsOpen(false)}
                            >
                              Styleguide
                            </Link>
                            <Link
                              to={`/${language}/backlog`}
                              className="block px-4 py-2 text-gray-700 hover:text-gray-900"
                              onClick={() => setIsOpen(false)}
                            >
                              Backlog
                            </Link>
                          </div>
                        </AccordionContent>
                      </AccordionItem>

                      {styleguidePages.map((page) => (
                        <AccordionItem key={page.slug} value={page.slug} className="border-none">
                          <AccordionTrigger className="px-4 py-3 text-base font-medium text-gray-900 hover:no-underline bg-[#f3f3f5] rounded-lg mx-2 mb-2 data-[state=open]:bg-[#4d4c4c] data-[state=open]:text-white">
                            {page.title}
                          </AccordionTrigger>
                          <AccordionContent className="px-0 pb-3">
                            <div className="space-y-1">
                              <Link
                                to={`/${language}/${page.slug}`}
                                className="block px-4 py-2 text-gray-700 hover:text-gray-900"
                                onClick={() => setIsOpen(false)}
                              >
                                {page.title}
                              </Link>
                              {page.children && page.children.length > 0 && (
                                <div className="mt-1 ml-4 space-y-1">
                                  {page.children.map((child) => (
                                    <Link
                                      key={child.slug}
                                      to={`/${language}/${child.slug}`}
                                      className="block px-4 py-1 text-sm text-gray-600 hover:text-gray-800"
                                      onClick={() => setIsOpen(false)}
                                    >
                                      {child.title}
                                    </Link>
                                  ))}
                                </div>
                              )}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  )}
                  <Accordion
                    type="single"
                    collapsible
                    className={isStyleguideOrBacklog ? "space-y-0 hidden" : "space-y-0"}
                  >
                    
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
                                   <Link to={`/${language}/your-solution/automotive`} className="flex items-center gap-3 flex-1" onClick={() => setIsOpen(false)}>
                                      {(() => {
                                        const key = pageDesignIcons['your-solution/automotive'];
                                        const IconComp = key ? PAGE_DESIGN_ICON_MAP[key] : null;
                                        return IconComp ? <IconComp className="h-4 w-4" /> : null;
                                      })()}
                                      <span>{t.nav.automotive}</span>
                                    </Link>
                                 </div>
                               </AccordionTrigger>
                               <AccordionContent className="px-4 pb-2 bg-[#f3f3f5] mx-2 rounded-lg">
                                 <div className="space-y-2">
                                   {industryData["Automotive"].subgroups.map((item, idx) => (
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
                          
                          {/* Security & Surveillance */}
                          <Accordion type="single" collapsible className="ml-2">
                            <AccordionItem value="security" className="border-none">
                               <AccordionTrigger className="px-2 py-2 text-gray-700 hover:text-gray-900 hover:no-underline bg-[#f3f3f5] rounded-lg mx-2 mb-2">
                                 <div className="flex items-center justify-between w-full">
                                    <div className="flex items-center gap-3 flex-1 cursor-pointer">
                                      {(() => {
                                        const key = pageDesignIcons['your-solution/security-surveillance'];
                                        const IconComp = key ? PAGE_DESIGN_ICON_MAP[key] : null;
                                        return IconComp ? <IconComp className="h-4 w-4" /> : null;
                                      })()}
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
                                       {(() => {
                                         const key = pageDesignIcons['your-solution/mobile-phone'];
                                         const IconComp = key ? PAGE_DESIGN_ICON_MAP[key] : null;
                                         return IconComp ? <IconComp className="h-4 w-4" /> : null;
                                       })()}
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
                                         {(() => {
                                           const key = pageDesignIcons['your-solution/web-camera'];
                                           const IconComp = key ? PAGE_DESIGN_ICON_MAP[key] : null;
                                           return IconComp ? <IconComp className="h-4 w-4" /> : null;
                                         })()}
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
                                         {(() => {
                                           const key = pageDesignIcons['your-solution/machine-vision'];
                                           const IconComp = key ? PAGE_DESIGN_ICON_MAP[key] : null;
                                           return IconComp ? <IconComp className="h-4 w-4" /> : null;
                                         })()}
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
                                        {(() => {
                                          const key = pageDesignIcons['your-solution/medical-endoscopy'];
                                          const IconComp = key ? PAGE_DESIGN_ICON_MAP[key] : Stethoscope;
                                          return <IconComp className="h-4 w-4" />;
                                        })()}
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
                                        {(() => {
                                          const key = pageDesignIcons['your-solution/scanners-archiving'];
                                          const IconComp = key ? PAGE_DESIGN_ICON_MAP[key] : null;
                                          return IconComp ? <IconComp className="h-4 w-4" /> : null;
                                        })()}
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
                          <Link to={getLink("your-solution/find-your-solution", "/your-solution/find-your-solution")} onClick={() => setIsOpen(false)}>
                            <Button className="w-full bg-[#f9dc24] text-black hover:bg-[#f9dc24]/90 rounded-lg font-medium text-lg">
                              <Search className="h-5 w-5 mr-2" />
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
                          {(() => {
                             const cta = pageCtaConfig['products'];
                             const targetSlug = cta?.slug || 'inside-lab';
                             const label = cta?.label || t.nav.visitTestingLab;

                             const iconKey = cta?.icon || 'microscope';
                             const CtaIcon = iconKey === 'search' ? Search : iconKey === 'flask' ? FlaskConical : iconKey === 'target' ? Target : Microscope;

                            return (
                              <Link to={getLink(targetSlug, '/inside-lab')} onClick={() => setIsOpen(false)}>
                                <Button className="w-full bg-black text-white hover:bg-gray-800 rounded-lg font-medium text-xl">
                                  <CtaIcon className="h-6 w-6 mr-2" />
                                  {label}
                                </Button>
                              </Link>
                            );
                          })()}
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
                                   <Link to={`/${language}/your-solution/automotive`} className="flex items-center gap-3 flex-1" onClick={() => setIsOpen(false)}>
                                       <CustomTargetIcon className="h-4 w-4" />
                                      <span>{t.nav.automotive}</span>
                                    </Link>
                                 </div>
                               </AccordionTrigger>
                              <AccordionContent className="px-4 pb-2 bg-[#f3f3f5] mx-2 rounded-lg">
                                 <div className="space-y-2">
                                    <div className="block py-2 text-sm text-gray-600">camPAS</div>
                                     <Link to={`/${language}/your-solution/automotive/in-cabin-testing`} className="block py-2 text-sm text-gray-600 hover:text-gray-800" onClick={() => setIsOpen(false)}>
                                       {t.nav.inCabinTesting}
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
                            <Button className="w-full bg-[#f9dc24] text-black hover:bg-[#f9dc24]/90 rounded-lg font-medium text-xl">
                              <FlaskConical className="h-6 w-6 mr-2" />
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
        )}
      </div>
    </nav>
  );
};

export default Navigation;
