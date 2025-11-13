import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, TestTube, Monitor, Play, Car, Lightbulb, Code, Shield, Zap, Eye, Brain, FileText, Download, BarChart3, Smartphone, Heart, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import AnnouncementBanner from "@/components/AnnouncementBanner";
import Footer from "@/components/Footer";
import MetaNavigation from "@/components/segments/MetaNavigation";
import ProductHeroGallery from "@/components/segments/ProductHeroGallery";
import FeatureOverview from "@/components/segments/FeatureOverview";
import Table from "@/components/segments/Table";
import FAQ from "@/components/segments/FAQ";
import { Video } from "@/components/segments/Video";
import { SEOHead } from "@/components/SEOHead";
import automotiveLab from "@/assets/automotive-lab.jpg";
import automotiveHero from "@/assets/automotive-hero-clean-new.jpg";
import HotspotImage from "@/components/HotspotImage";
import manufacturersImage from "@/assets/manufacturers-image.png";
import suppliersImage from "@/assets/suppliers-image.png";
import arcturusProduct from "@/assets/arcturus-main-product-new.png";
import arcturusAutomotiveLab from "@/assets/arcturus-automotive-lab-installation.jpg";
import testLabServices from "@/assets/test-lab-services.jpg";
import te42Image from "@/assets/te42-ll.jpg";
import le7Image from "@/assets/le7-product.png";
import te292Image from "@/assets/te292-vis-ir.png";
import camspecsImage from "@/assets/geocal-product.jpg";
import iqAnalyzerImage from "@/assets/iq-analyzer-new.png";
import climateImage from "@/assets/climate-chamber.png";
import emvaLogo from "@/assets/emva-logo.jpg";
import isoStandardsLogo from "@/assets/iso-standards-logo-new.jpg";
import ieeeLogo from "@/assets/ieee-logo.jpg";
import solutionsInCabin from "@/assets/solutions-in-cabin.png";
import solutionsAdas from "@/assets/solutions-adas.png";
import solutionsGeometric from "@/assets/solutions-geometric-calibration.jpg";
import solutionsClimate from "@/assets/solutions-climate-control.png";
import photographyHeroDefault from "@/assets/photography-hero-default.jpg";
import { supabase } from "@/integrations/supabase/client";

const iconMap: Record<string, any> = {
  FileText,
  Download,
  BarChart3,
  Zap,
  Shield,
  Eye,
  Car,
  Smartphone,
  Heart,
  CheckCircle,
  Lightbulb,
  Monitor,
};

interface Application {
  title: string;
  description: string;
  ctaLink: string;
  ctaStyle: string;
  ctaText: string;
  imageUrl: string;
  icon: string;
}

// Mobile Phone landing page component
const MobilePhone = () => {
  const [hoveredPoint, setHoveredPoint] = useState<string>("Live Processing");
  const [content, setContent] = useState<Record<string, string>>({});
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [heroImageUrl, setHeroImageUrl] = useState<string>("");
  const [heroImagePosition, setHeroImagePosition] = useState<string>("right");
  const [heroLayout, setHeroLayout] = useState<string>("2-5");
  const [heroTopPadding, setHeroTopPadding] = useState<string>("medium");
  const [heroCtaLink, setHeroCtaLink] = useState<string>("#applications-start");
  const [heroCtaStyle, setHeroCtaStyle] = useState<string>("standard");
  const [bannerTitle, setBannerTitle] = useState<string>("");
  const [bannerSubtext, setBannerSubtext] = useState<string>("");
  const [bannerImages, setBannerImages] = useState<any[]>([]);
  const [bannerButtonText, setBannerButtonText] = useState<string>("");
  const [bannerButtonLink, setBannerButtonLink] = useState<string>("");
  const [bannerButtonStyle, setBannerButtonStyle] = useState<string>("standard");
  const [solutionsTitle, setSolutionsTitle] = useState<string>("");
  const [solutionsSubtext, setSolutionsSubtext] = useState<string>("");
  const [solutionsLayout, setSolutionsLayout] = useState<string>("2-col");
  const [solutionsItems, setSolutionsItems] = useState<any[]>([]);
  const [pageSegments, setPageSegments] = useState<any[]>([]);
  const [tabOrder, setTabOrder] = useState<string[]>(['tiles', 'banner', 'solutions']);
  const [hasHeroContent, setHasHeroContent] = useState(false);
  const [segmentIdMap, setSegmentIdMap] = useState<Record<string, number>>({});
  const [seoData, setSeoData] = useState<any>({});

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    const { data, error } = await supabase
      .from("page_content")
      .select("*")
      .eq("page_slug", "mobile-phone");

    // Load segment registry for ID mapping
    const { data: segmentData } = await supabase
      .from("segment_registry")
      .select("*")
      .eq("page_slug", "mobile-phone");

    if (segmentData) {
      const idMap: Record<string, number> = {};
      segmentData.forEach((seg: any) => {
        idMap[seg.segment_key] = seg.segment_id;
      });
      setSegmentIdMap(idMap);
    }

    if (!error && data) {
      const contentMap: Record<string, string> = {};
      let apps: any[] = [];
      let heroExists = false;

      data.forEach((item: any) => {
        if (item.section_key === "page_segments") {
          const segments = JSON.parse(item.content_value);
          setPageSegments(segments);
        } else if (item.section_key === "tab_order") {
          try {
            const order = JSON.parse(item.content_value);
            setTabOrder(order || ['tiles', 'banner', 'solutions']);
          } catch {
            setTabOrder(['tiles', 'banner', 'solutions']);
          }
        } else if (item.section_key === "applications_items") {
          apps = JSON.parse(item.content_value);
        } else if (item.section_key === "solutions_title") {
          setSolutionsTitle(item.content_value);
        } else if (item.section_key === "solutions_subtext") {
          setSolutionsSubtext(item.content_value);
        } else if (item.section_key === "solutions_layout") {
          setSolutionsLayout(item.content_value || "2-col");
        } else if (item.section_key === "solutions_items") {
          setSolutionsItems(JSON.parse(item.content_value));
        } else if (item.section_key === "banner_images") {
          setBannerImages(JSON.parse(item.content_value));
        } else if (item.section_key === "banner_title") {
          setBannerTitle(item.content_value);
        } else if (item.section_key === "banner_subtext") {
          setBannerSubtext(item.content_value);
        } else if (item.section_key === "banner_button_text") {
          setBannerButtonText(item.content_value);
        } else if (item.section_key === "banner_button_link") {
          setBannerButtonLink(item.content_value);
        } else if (item.section_key === "banner_button_style") {
          setBannerButtonStyle(item.content_value || "standard");
        } else if (item.section_key === "hero_image_url") {
          setHeroImageUrl(item.content_value);
          heroExists = true;
        } else if (item.section_key === "hero_image_position") {
          setHeroImagePosition(item.content_value || "right");
        } else if (item.section_key === "hero_layout") {
          setHeroLayout(item.content_value || "2-5");
        } else if (item.section_key === "hero_top_padding") {
          setHeroTopPadding(item.content_value || "medium");
        } else if (item.section_key === "hero_cta_link") {
          setHeroCtaLink(item.content_value || "#applications-start");
        } else if (item.section_key === "hero_cta_style") {
          setHeroCtaStyle(item.content_value || "standard");
        } else if (item.section_key === "hero_title") {
          contentMap[item.section_key] = item.content_value;
          heroExists = true;
        } else if (item.section_key === "seo_settings") {
          try {
            const seoSettings = JSON.parse(item.content_value);
            setSeoData(seoSettings);
          } catch {
            // Keep empty seo data
          }
        } else {
          contentMap[item.section_key] = item.content_value;
        }
      });

      setContent(contentMap);
      setApplications(apps);
      setHasHeroContent(heroExists);
    }
    setLoading(false);
  };

  // Helper function to render segment by ID
  const renderSegment = (segmentId: string) => {
    // Check if it's a dynamic segment
    const dynamicSegment = pageSegments.find(seg => seg.id === segmentId);
    if (dynamicSegment) {
      if (dynamicSegment.type === 'meta-navigation') {
        return <MetaNavigation key={segmentId} data={dynamicSegment.data} segmentIdMap={segmentIdMap} />;
      }
      if (dynamicSegment.type === 'product-hero-gallery') {
        return <ProductHeroGallery key={segmentId} id={segmentId} data={dynamicSegment.data} />;
      }
      if (dynamicSegment.type === 'feature-overview') {
        return <FeatureOverview key={segmentId} id={segmentId} {...dynamicSegment.data} />;
      }
      if (dynamicSegment.type === 'table') {
        return <Table key={segmentId} id={segmentId} {...dynamicSegment.data} />;
      }
      if (dynamicSegment.type === 'faq') {
        return <FAQ key={segmentId} id={segmentId} {...dynamicSegment.data} />;
      }
      if (dynamicSegment.type === 'video') {
        return <Video key={segmentId} id={segmentId} data={dynamicSegment.data} />;
      }
    }

    // Static segments
    if (segmentId === 'tiles') {
      return (
        <section key="tiles" id={segmentIdMap['tiles']?.toString() || 'tiles'} className="py-8 bg-gray-50">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              {content.applications_title && (
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  {content.applications_title}
                </h2>
              )}
              {content.applications_description && (
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                  {content.applications_description}
                </p>
              )}
            </div>
          </div>

          <div className="container mx-auto px-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
              {applications.map((app: Application, index) => {
                const IconComponent = app.icon ? iconMap[app.icon] : null;
                
                return (
                   <div 
                     key={index}
                     className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200 flex flex-col overflow-hidden group"
                   >
                     {IconComponent && (
                       <div className="w-full flex justify-center pt-8">
                         <div className="relative">
                           <div className="w-20 h-20 bg-[#f9dc24]/10 rounded-full flex items-center justify-center border-2 border-[#f9dc24]/20 shadow-lg group-hover:shadow-xl group-hover:bg-[#f9dc24]/20 group-hover:border-[#f9dc24]/40 transition-all duration-500 ease-out group-hover:-translate-y-1 group-hover:scale-105">
                             <IconComponent 
                               size={36} 
                               className="text-black group-hover:text-gray-900 group-hover:scale-125 transition-all duration-300" 
                               strokeWidth={1.8}
                             />
                           </div>
                           <div className="absolute inset-0 w-20 h-20 bg-[#f9dc24] rounded-full opacity-0 group-hover:opacity-15 transition-opacity duration-500 blur-xl" />
                         </div>
                       </div>
                     )}
                     
                     {app.imageUrl && (
                       <div className={`w-full h-[200px] overflow-hidden ${IconComponent ? 'mt-4' : ''}`}>
                         <img 
                           src={app.imageUrl} 
                           alt={app.title} 
                           className="w-full h-full object-cover"
                         />
                       </div>
                     )}
                     
                     <div className={`p-8 flex flex-col items-center text-center flex-1 ${!IconComponent && !app.imageUrl ? 'pt-8' : ''}`}>
                       <h3 className="text-xl font-bold text-gray-900 mb-4 leading-tight">
                         {app.title}
                       </h3>
                       
                       <p className="text-base text-gray-600 leading-relaxed mb-6 flex-1">
                         {app.description}
                       </p>
                     
                     {app.ctaLink && app.ctaLink.trim() ? (
                       app.ctaLink.startsWith('http://') || app.ctaLink.startsWith('https://') ? (
                         <a 
                           href={app.ctaLink}
                           target="_blank"
                           rel="noopener noreferrer"
                           className="w-full"
                         >
                           <button
                             className="w-full px-4 py-2 rounded-md border-0 font-medium text-lg transition-opacity hover:opacity-90"
                             style={{
                               backgroundColor: app.ctaStyle === "technical" ? "#1f2937" : "#f9dc24",
                               color: app.ctaStyle === "technical" ? "white" : "black"
                             }}
                           >
                             {app.ctaText || 'Learn More'}
                           </button>
                         </a>
                       ) : (
                         <Link to={app.ctaLink} className="w-full">
                           <button
                             className="w-full px-4 py-2 rounded-md border-0 font-medium text-lg transition-opacity hover:opacity-90"
                             style={{
                               backgroundColor: app.ctaStyle === "technical" ? "#1f2937" : "#f9dc24",
                               color: app.ctaStyle === "technical" ? "white" : "black"
                             }}
                           >
                             {app.ctaText || 'Learn More'}
                           </button>
                         </Link>
                       )
                     ) : (
                       <button
                         className="w-full px-4 py-2 rounded-md border-0 font-medium text-lg transition-opacity hover:opacity-90"
                         style={{
                           backgroundColor: app.ctaStyle === "technical" ? "#1f2937" : "#f9dc24",
                           color: app.ctaStyle === "technical" ? "white" : "black"
                         }}
                       >
                         {app.ctaText || 'Learn More'}
                       </button>
                     )}
                   </div>
                 </div>
               );
             })}
           </div>
         </div>
       </section>
      );
    }

    if (segmentId === 'banner') {
      return (
        <section key="banner" id={segmentIdMap['banner']?.toString() || 'banner'} className="py-16" style={{ backgroundColor: '#f3f3f5' }}>
          <div className="container mx-auto px-6">
            {bannerTitle && (
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 text-center">
                {bannerTitle}
              </h2>
            )}
            
            {bannerSubtext && (
              <p className="text-lg text-gray-600 mb-12 text-center mx-auto" style={{ maxWidth: '600px' }}>
                {bannerSubtext}
              </p>
            )}
            
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 mb-12">
              {bannerImages.map((img: any, idx: number) => (
                <div key={idx} className="relative grayscale hover:grayscale-0 transition-all duration-500">
                  <img 
                    src={img.url} 
                    alt={img.alt || `Logo ${idx + 1}`} 
                    className="h-16 object-contain" 
                  />
                </div>
              ))}
            </div>

            {bannerButtonText && (
              <div className="text-center">
                {bannerButtonLink && (bannerButtonLink.startsWith('http://') || bannerButtonLink.startsWith('https://')) ? (
                  <a 
                    href={bannerButtonLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button
                      size="lg"
                      className="text-lg px-8"
                      style={{
                        backgroundColor: bannerButtonStyle === "technical" ? "#1f2937" : "#f9dc24",
                        color: bannerButtonStyle === "technical" ? "white" : "black"
                      }}
                    >
                      {bannerButtonText}
                    </Button>
                  </a>
                ) : (
                  <Link to={bannerButtonLink || "#"}>
                    <Button
                      size="lg"
                      className="text-lg px-8"
                      style={{
                        backgroundColor: bannerButtonStyle === "technical" ? "#1f2937" : "#f9dc24",
                        color: bannerButtonStyle === "technical" ? "white" : "black"
                      }}
                    >
                      {bannerButtonText}
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </div>
        </section>
      );
    }

    if (segmentId === 'solutions') {
      const getColsClass = () => {
        switch (solutionsLayout) {
          case '1-col':
            return 'grid-cols-1';
          case '2-col':
            return 'md:grid-cols-2';
          case '3-col':
            return 'md:grid-cols-2 lg:grid-cols-3';
          default:
            return 'md:grid-cols-2';
        }
      };

      return (
        <section key="solutions" id={segmentIdMap['solutions']?.toString() || 'solutions'} className="py-16 bg-white">
          <div className="container mx-auto px-6">
            {solutionsTitle && (
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 text-center">
                {solutionsTitle}
              </h2>
            )}
            
            {solutionsSubtext && (
              <p className="text-lg text-gray-600 mb-12 text-center mx-auto max-w-3xl">
                {solutionsSubtext}
              </p>
            )}

            <div className={`grid ${getColsClass()} gap-8`}>
              {solutionsItems.map((item: any, idx: number) => (
                <Card key={idx} className="overflow-hidden hover:shadow-lg transition-shadow">
                  {item.imageUrl && (
                    <div className="w-full h-48 overflow-hidden">
                      <img 
                        src={item.imageUrl} 
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardContent className="p-6">
                    {item.title && (
                      <h3 className="text-xl font-bold text-gray-900 mb-3">
                        {item.title}
                      </h3>
                    )}
                    {item.description && (
                      <p className="text-gray-600 leading-relaxed">
                        {item.description}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      );
    }

    return null;
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen">
      {/* SEO Meta Tags */}
      <SEOHead
        title={seoData.title}
        description={seoData.metaDescription}
        canonical={seoData.canonical}
        ogTitle={seoData.ogTitle}
        ogDescription={seoData.ogDescription}
        ogImage={seoData.ogImage}
        twitterCard={seoData.twitterCard}
        robotsIndex={seoData.robotsIndex}
        robotsFollow={seoData.robotsFollow}
      />
      
      <Navigation />

      {/* MANDATORY: Meta Navigation - Always First (Below Nav Bar) */}
      {tabOrder
        .filter(segmentId => {
          const dynamicSegment = pageSegments.find(seg => seg.id === segmentId);
          return dynamicSegment && dynamicSegment.type === 'meta-navigation';
        })
        .map(segmentId => renderSegment(segmentId))}
      
      {/* Hero Section - Only render if hero content exists */}
      {hasHeroContent && (
        <section id={segmentIdMap['hero']?.toString() || 'hero'} className="min-h-[60vh] bg-white font-roboto relative overflow-hidden py-8">
        <div className={`container mx-auto px-6 pb-8 lg:pb-12 relative z-10 ${
          heroTopPadding === "small" ? "pt-16 lg:pt-16" :
          heroTopPadding === "medium" ? "pt-24 lg:pt-24" :
          heroTopPadding === "large" ? "pt-32 lg:pt-32" :
          heroTopPadding === "xlarge" ? "pt-40 lg:pt-40" :
          "pt-32 lg:pt-32"
        }`}>
          <div className={`grid gap-16 items-center ${
            heroLayout === "50-50" ? "lg:grid-cols-2" : 
            heroLayout === "2-3" ? "lg:grid-cols-5" :
            heroLayout === "1-2" ? "lg:grid-cols-3" :
            "lg:grid-cols-5"
          }`}>
            
            {/* Text Content */}
            <div className={`space-y-8 ${
              heroLayout === "50-50" ? "" :
              heroLayout === "2-3" ? "lg:col-span-2" :
              heroLayout === "1-2" ? "" :
              "lg:col-span-2"
            } ${heroImagePosition === "left" ? "order-2" : "order-1"}`}>
              <div>
                <h1 className="text-5xl lg:text-6xl xl:text-7xl font-light leading-[0.9] tracking-tight mb-6 text-black mt-8 md:mt-0">
                  {content.hero_title || "Mobile Phone"}
                  <br />
                  <span className="font-medium text-black">{content.hero_subtitle || "Image Quality"}</span>
                </h1>
                
                <p className="text-xl lg:text-2xl text-black font-light leading-relaxed max-w-lg">
                  {content.hero_description || "Precision-engineered camera system test solutions for mobile phone cameras."}
                </p>
              </div>
              
              <div className="pt-4">
                {heroCtaLink.startsWith('http://') || heroCtaLink.startsWith('https://') ? (
                  <a 
                    href={heroCtaLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button 
                      size="lg"
                      className={`border-0 px-8 py-4 text-lg font-medium shadow-soft hover:shadow-lg transition-all duration-300 group ${
                        heroCtaStyle === "technical" ? "text-white" : "text-black"
                      }`}
                      style={{ 
                        backgroundColor: heroCtaStyle === "technical" ? "#1f2937" : "#f9dc24"
                      }}
                    >
                      {content.hero_cta || "Discover Solutions"}
                    </Button>
                  </a>
                ) : (
                  <Link to={heroCtaLink}>
                    <Button 
                      size="lg"
                      className={`border-0 px-8 py-4 text-lg font-medium shadow-soft hover:shadow-lg transition-all duration-300 group ${
                        heroCtaStyle === "technical" ? "text-white" : "text-black"
                      }`}
                      style={{ 
                        backgroundColor: heroCtaStyle === "technical" ? "#1f2937" : "#f9dc24"
                      }}
                    >
                      {content.hero_cta || "Discover Solutions"}
                    </Button>
                  </Link>
                )}
              </div>
            </div>

            {/* Image Content */}
            <div className={`relative ${
              heroLayout === "50-50" ? "" :
              heroLayout === "2-3" ? "lg:col-span-3" :
              heroLayout === "1-2" ? "lg:col-span-2" :
              "lg:col-span-3"
            } ${heroImagePosition === "left" ? "order-1" : "order-2"}`}>
              <div className="aspect-[4/3] rounded-lg overflow-hidden relative group h-[500px]">
                <img
                  src={heroImageUrl || photographyHeroDefault}
                  alt="Mobile Phone Camera Testing"
                  className="w-full h-full object-cover transform transition-transform duration-700"
                />
              </div>
            </div>
          </div>
        </div>
        </section>
      )}

      {/* Dynamic and Static Segments (excluding meta-navigation which is already rendered above) */}
      {tabOrder
        .filter(segmentId => {
          const dynamicSegment = pageSegments.find(seg => seg.id === segmentId);
          // Include dynamic segments (except meta-navigation) OR static segments
          return (dynamicSegment && dynamicSegment.type !== 'meta-navigation') || 
                 (segmentId === 'tiles' || segmentId === 'banner' || segmentId === 'solutions');
        })
        .map((segmentId) => renderSegment(segmentId))}

      <Footer />
    </div>
  );
};

export default MobilePhone;
