import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, TestTube, Monitor, Play, Car, Lightbulb, Code, Shield, Zap, Eye, Brain, FileText, Download, BarChart3, Smartphone, Heart, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import MetaNavigation from "@/components/segments/MetaNavigation";
import ProductHeroGallery from "@/components/segments/ProductHeroGallery";
import FeatureOverview from "@/components/segments/FeatureOverview";
import Table from "@/components/segments/Table";
import FAQ from "@/components/segments/FAQ";
import Specification from "@/components/segments/Specification";
import { Video } from "@/components/segments/Video";
import { SEOHead } from "@/components/SEOHead";
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
  Camera,
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

const ProductIQLED = () => {
  const [content, setContent] = useState<Record<string, string>>({});
  const [applications, setApplications] = useState<any[]>([]);
  const [tilesColumns, setTilesColumns] = useState<string>("3");
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
  const [hasHeroContent, setHasHeroContent] = useState(false);
  const [segmentIdMap, setSegmentIdMap] = useState<Record<string, number>>({});
  const [seoData, setSeoData] = useState<any>({});
  const [pageSegments, setPageSegments] = useState<any[]>([]);
  const [tabOrder, setTabOrder] = useState<string[]>([]);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    const { data, error } = await supabase
      .from("page_content")
      .select("*")
      .eq("page_slug", "iq-led");

    // Load segment registry for ID mapping
    const { data: segmentData } = await supabase
      .from("segment_registry")
      .select("*")
      .eq("page_slug", "iq-led");

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
          try {
            const segments = JSON.parse(item.content_value);
            console.log("Loading page_segments:", segments);
            setPageSegments(segments);
          } catch (e) {
            console.error("Error parsing page_segments:", e);
          }
        } else if (item.section_key === "tab_order") {
          try {
            const order = JSON.parse(item.content_value);
            setTabOrder(order || ['tiles', 'banner', 'solutions']);
          } catch {
            setTabOrder(['tiles', 'banner', 'solutions']);
          }
        } else if (item.section_key === "applications") {
          try {
            apps = JSON.parse(item.content_value);
          } catch (e) {
            console.error("Error parsing applications:", e);
          }
        } else if (item.section_key === "banner_images") {
          try {
            const images = JSON.parse(item.content_value);
            setBannerImages(images);
          } catch (e) {
            console.error("Error parsing banner images:", e);
          }
        } else if (item.section_key === "solutions_items") {
          try {
            const items = JSON.parse(item.content_value);
            setSolutionsItems(items);
          } catch (e) {
            console.error("Error parsing solutions items:", e);
          }
        } else if (item.section_key === "seo") {
          try {
            const seoSettings = JSON.parse(item.content_value);
            setSeoData(seoSettings);
          } catch {
            // Keep empty seo data
          }
        } else {
          contentMap[item.section_key] = item.content_value;
        }

        // Check if hero content exists
        if (item.section_key.startsWith("hero_") && item.content_value && item.content_value.trim() !== "") {
          heroExists = true;
        }
      });

      setContent(contentMap);
      setApplications(apps);
      setHasHeroContent(heroExists);
      
      // Set individual state values
      setHeroImageUrl(contentMap.hero_image_url || "");
      setHeroImagePosition(contentMap.hero_image_position || "right");
      setHeroLayout(contentMap.hero_layout || "2-5");
      setHeroTopPadding(contentMap.hero_top_padding || "medium");
      setHeroCtaLink(contentMap.hero_cta_link || "#applications-start");
      setHeroCtaStyle(contentMap.hero_cta_style || "standard");
      setTilesColumns(contentMap.tiles_columns || "3");
      setBannerTitle(contentMap.banner_title || "");
      setBannerSubtext(contentMap.banner_subtext || "");
      setBannerButtonText(contentMap.banner_button_text || "");
      setBannerButtonLink(contentMap.banner_button_link || "");
      setBannerButtonStyle(contentMap.banner_button_style || "standard");
      setSolutionsTitle(contentMap.solutions_title || "");
      setSolutionsSubtext(contentMap.solutions_subtext || "");
      setSolutionsLayout(contentMap.solutions_layout || "2-col");
    }
    setLoading(false);
  };

  const getLayoutClasses = () => {
    const layouts: Record<string, string> = {
      "50-50": "md:grid-cols-2",
      "1-6": "md:grid-cols-[1fr_6fr]",
      "2-5": "md:grid-cols-[2fr_5fr]",
      "3-4": "md:grid-cols-[3fr_4fr]",
      "4-3": "md:grid-cols-[4fr_3fr]",
      "5-2": "md:grid-cols-[5fr_2fr]",
      "6-1": "md:grid-cols-[6fr_1fr]",
    };
    return layouts[heroLayout] || "md:grid-cols-[2fr_5fr]";
  };

  const getPaddingClass = () => {
    const paddings: Record<string, string> = {
      none: "pt-0",
      small: "pt-8 md:pt-12",
      medium: "pt-16 md:pt-20",
      large: "pt-24 md:pt-32",
    };
    return paddings[heroTopPadding] || "pt-16 md:pt-20";
  };

  const getButtonClasses = (style: string) => {
    if (style === "technical") {
      return "inline-flex items-center justify-center px-8 py-4 rounded-md text-lg font-medium transition-all duration-300 hover:scale-105 bg-gray-900 text-white hover:bg-gray-800";
    }
    return "inline-flex items-center justify-center px-8 py-4 rounded-md text-lg font-medium transition-all duration-300 hover:scale-105 bg-[#f9dc24] text-black hover:bg-[#e5ca20]";
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
      if (dynamicSegment.type === 'specification') {
        return <Specification key={segmentId} id={segmentId} {...dynamicSegment.data} />;
      }
      if (dynamicSegment.type === 'video') {
        return <Video key={segmentId} id={segmentId} {...dynamicSegment.data} />;
      }
    }

    // Default static segments
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-20">
          <div className="text-center">Loading...</div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <>
      <SEOHead
        title={seoData.title || "iQ-LED Professional LED Illumination | Image Engineering"}
        description={seoData.description || "High-performance LED illumination system for professional test environments."}
        canonical={seoData.canonical}
        robotsIndex={seoData.robotsIndex !== false ? "index" : "noindex"}
        robotsFollow={seoData.robotsFollow !== false ? "follow" : "nofollow"}
      />
      <div className="min-h-screen bg-background">
        <Navigation />
        
        {/* Render dynamic segments from page_segments */}
        {pageSegments
          .filter(seg => seg.position === 0) // Only render segments with position 0 (before hero)
          .map(seg => renderSegment(seg.id))}
        
        {/* Hero Section - Segment ID 108 */}
        {hasHeroContent && (
          <section id="108" className={`w-full bg-gradient-to-b from-gray-50 to-white ${getPaddingClass()} pb-12 md:pb-20`}>
            <div className="w-full px-6">
              <div className={`grid grid-cols-1 ${getLayoutClasses()} gap-8 md:gap-12 items-center max-w-7xl mx-auto`}>
                {heroImagePosition === "left" && heroImageUrl && (
                  <div className="w-full flex justify-center items-center order-1 md:order-1">
                    <div className="relative w-full aspect-video overflow-hidden rounded-lg">
                      <img
                        src={heroImageUrl}
                        alt={content.hero_title || "Hero"}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}
                <div className={`order-2 ${heroImagePosition === "left" ? "md:order-2" : "md:order-1"}`}>
                  {content.hero_title && (
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
                      {content.hero_title}
                    </h1>
                  )}
                  {content.hero_subtitle && (
                    <h2 className="text-2xl md:text-3xl text-gray-700 mb-6 font-medium">
                      {content.hero_subtitle}
                    </h2>
                  )}
                  {content.hero_description && (
                    <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed">
                      {content.hero_description}
                    </p>
                  )}
                  {content.hero_cta && (
                    <a href={heroCtaLink} className={getButtonClasses(heroCtaStyle)}>
                      {content.hero_cta}
                    </a>
                  )}
                </div>
                {heroImagePosition === "right" && heroImageUrl && (
                  <div className="w-full flex justify-center items-center order-1 md:order-2">
                    <div className="relative w-full aspect-video overflow-hidden rounded-lg">
                      <img
                        src={heroImageUrl}
                        alt={content.hero_title || "Hero"}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Tiles Section - Segment ID 109 */}
        {applications.length > 0 && (
          <section id="109" className="py-20 bg-white">
            <div className="w-full px-6">
              <div className={`grid gap-8 max-w-7xl mx-auto grid-cols-1 ${tilesColumns === "2" ? "md:grid-cols-2" : tilesColumns === "4" ? "md:grid-cols-2 lg:grid-cols-4" : "md:grid-cols-2 lg:grid-cols-3"}`}>
                {applications.map((app, index) => {
                  const IconComponent = iconMap[app.icon] || Camera;
                  return (
                    <Card key={index} className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-[#f9dc24]">
                      <CardContent className="p-6 h-full flex flex-col">
                        <div className="mb-4 text-gray-900">
                          <IconComponent className="w-12 h-12 group-hover:scale-110 transition-transform duration-300" />
                        </div>
                        <h3 className="text-xl font-bold mb-3 text-gray-900 group-hover:text-[#f9dc24] transition-colors duration-300">
                          {app.title}
                        </h3>
                        <p className="text-gray-600 mb-6 flex-grow leading-relaxed">
                          {app.description}
                        </p>
                        {app.ctaText && app.ctaLink && (
                          <Link to={app.ctaLink}>
                            <Button
                              variant={app.ctaStyle === "technical" ? "default" : "outline"}
                              className={`w-full ${app.ctaStyle === "technical" ? "bg-gray-900 hover:bg-gray-800 text-white" : "border-2 border-[#f9dc24] hover:bg-[#f9dc24] text-gray-900"}`}
                            >
                              {app.ctaText}
                            </Button>
                          </Link>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* Banner Section - Segment ID 110 */}
        {bannerTitle && (
          <section id="110" className="py-20 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
            <div className="w-full px-6">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  {bannerTitle}
                </h2>
                {bannerSubtext && (
                  <p className="text-lg text-gray-300 max-w-2xl mx-auto">
                    {bannerSubtext}
                  </p>
                )}
              </div>
              {bannerImages && bannerImages.length > 0 && (
                <div className="flex flex-wrap justify-center items-center gap-8 mb-12">
                  {bannerImages.map((image: any, index: number) => (
                    <div key={index} className="h-16 flex items-center">
                      <img 
                        src={image.url}
                        alt={image.alt || `Banner image ${index + 1}`}
                        className="max-h-full max-w-full object-contain filter brightness-0 invert opacity-60 hover:opacity-100 transition-all duration-300"
                      />
                    </div>
                  ))}
                </div>
              )}
              {bannerButtonText && (
                <div className="flex justify-center">
                  {bannerButtonLink ? (
                    bannerButtonLink.startsWith('http://') || bannerButtonLink.startsWith('https://') ? (
                      <a
                        href={bannerButtonLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={getButtonClasses(bannerButtonStyle)}
                      >
                        {bannerButtonText}
                      </a>
                    ) : (
                      <Link to={bannerButtonLink}>
                        <button className={getButtonClasses(bannerButtonStyle)}>
                          {bannerButtonText}
                        </button>
                      </Link>
                    )
                  ) : (
                    <button className={getButtonClasses(bannerButtonStyle)}>
                      {bannerButtonText}
                    </button>
                  )}
                </div>
              )}
            </div>
          </section>
        )}

        {/* Solutions/Image-Text Section - Segment ID 111 */}
        {solutionsItems && solutionsItems.length > 0 && (
          <section id="111" className="bg-gray-50 py-20">
...
          </section>
        )}

        {/* Render all segments in tabOrder */}
        {tabOrder
          .filter(segmentId => {
            const dynamicSegment = pageSegments.find(seg => seg.id === segmentId);
            return !(dynamicSegment && dynamicSegment.type === 'meta-navigation');
          })
          .map((segmentId) => renderSegment(segmentId))}

        {/* Footer - Segment ID 85 */}
        <Footer />
      </div>
    </>
  );
};

export default ProductIQLED;
