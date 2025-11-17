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
import Intro from "@/components/segments/Intro";
import IndustriesSegment from "@/components/segments/IndustriesSegment";
import FullHero from "@/components/segments/FullHero";
import NewsSegment from "@/components/segments/NewsSegment";
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
};

const MultispectralIllumination = () => {
  const [content, setContent] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [pageSegments, setPageSegments] = useState<any[]>([]);
  const [tabOrder, setTabOrder] = useState<string[]>([]);
  const [segmentIdMap, setSegmentIdMap] = useState<Record<string, number>>({});
  const [seoData, setSeoData] = useState<any>({});

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    const { data, error } = await supabase
      .from("page_content")
      .select("*")
      .eq("page_slug", "multispectral-illumination");

    // Load segment registry for ID mapping
    const { data: segmentData } = await supabase
      .from("segment_registry")
      .select("*")
      .eq("page_slug", "multispectral-illumination");

    if (segmentData) {
      const idMap: Record<string, number> = {};
      segmentData.forEach((seg: any) => {
        idMap[seg.segment_key] = seg.segment_id;
      });
      setSegmentIdMap(idMap);
    }

    if (!error && data) {
      const contentMap: Record<string, string> = {};
      data.forEach((item: any) => {
        contentMap[item.section_key] = item.content_value;
      });
      setContent(contentMap);

      // Parse dynamic segments
      if (contentMap.page_segments) {
        try {
          const segments = JSON.parse(contentMap.page_segments);
          setPageSegments(segments);
        } catch (e) {
          console.error("Error parsing page_segments:", e);
        }
      }

      // Parse tab order
      if (contentMap.tab_order) {
        try {
          const order = JSON.parse(contentMap.tab_order);
          setTabOrder(order);
        } catch (e) {
          console.error("Error parsing tab_order:", e);
        }
      }

      // Load SEO data
      if (contentMap.seo_data) {
        try {
          const seo = JSON.parse(contentMap.seo_data);
          setSeoData(seo);
        } catch (e) {
          console.error("Error parsing seo_data:", e);
        }
      }
    }

    setLoading(false);
  };

  const renderSegment = (segmentId: string) => {
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
      if (dynamicSegment.type === 'specification') {
        return <Specification key={segmentId} id={segmentId} {...dynamicSegment.data} />;
      }
      if (dynamicSegment.type === 'intro') {
        return <Intro key={segmentId} id={segmentId} {...dynamicSegment.data} />;
      }
      if (dynamicSegment.type === 'industries') {
        return <IndustriesSegment key={segmentId} id={segmentId} {...dynamicSegment.data} />;
      }
      if (dynamicSegment.type === 'full-hero') {
        return <FullHero key={segmentId} {...dynamicSegment.data} />;
      }
      if (dynamicSegment.type === 'news') {
        return (
          <NewsSegment
            key={segmentId}
            id={segmentId}
            sectionTitle={dynamicSegment.data?.sectionTitle}
            sectionDescription={dynamicSegment.data?.sectionDescription}
            articleLimit={parseInt(dynamicSegment.data?.articleLimit || "6")}
            categories={dynamicSegment.data?.categories || []}
          />
        );
      }
      if (dynamicSegment.type === 'tiles') {
        const tilesData = dynamicSegment.data || {};
        const tilesItems = tilesData.items || [];
        const tilesColsConfig = tilesData.tiles_columns || "3";
        
        const getGridColsClass = () => {
          switch(tilesColsConfig) {
            case "2": return "grid-cols-1 md:grid-cols-2";
            case "3": return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
            case "4": return "grid-cols-1 md:grid-cols-2 lg:grid-cols-4";
            default: return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
          }
        };

        return (
          <section key={segmentId} id={String(segmentIdMap[segmentId] || segmentId)} className="py-20 bg-white">
            <div className="container mx-auto px-4">
              {tilesData.sectionTitle && (
                <h2 className="text-4xl font-bold text-center mb-4">{tilesData.sectionTitle}</h2>
              )}
              {tilesData.sectionDescription && (
                <p className="text-center text-lg text-gray-600 mb-12 max-w-3xl mx-auto">
                  {tilesData.sectionDescription}
                </p>
              )}
              <div className={`grid ${getGridColsClass()} gap-8`}>
                {tilesItems.map((app: any, index: number) => {
                  const IconComponent = iconMap[app.icon] || Camera;
                  return (
                    <Card key={index} className="hover:shadow-xl transition-all duration-300 group border-2 hover:border-[#f9dc24]">
                      <CardContent className="p-8">
                        <div className="mb-6 h-16 w-16 rounded-2xl bg-[#f9dc24] flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <IconComponent className="h-8 w-8 text-black" />
                        </div>
                        <h3 className="text-2xl font-bold mb-4">{app.title}</h3>
                        <p className="text-gray-600 mb-6 leading-relaxed">{app.description}</p>
                        {app.ctaLink && app.ctaText && (
                          <Link to={app.ctaLink}>
                            <Button 
                              className={
                                app.ctaStyle === "technical"
                                  ? "bg-[#1f2937] text-white hover:bg-[#1f2937]/90"
                                  : "bg-[#f9dc24] text-black hover:bg-[#f9dc24]/90"
                              }
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
        );
      }
      if (dynamicSegment.type === 'banner') {
        const bannerData = dynamicSegment.data || {};
        return (
          <section key={segmentId} id={String(segmentIdMap[segmentId] || segmentId)} className="py-20 bg-gray-50">
            <div className="container mx-auto px-4">
              {bannerData.title && (
                <h2 className="text-4xl font-bold text-center mb-4">{bannerData.title}</h2>
              )}
              {bannerData.subtext && (
                <p className="text-center text-lg text-gray-600 mb-12 max-w-2xl mx-auto">
                  {bannerData.subtext}
                </p>
              )}
              {bannerData.images && bannerData.images.length > 0 && (
                <div className="flex flex-wrap justify-center items-center gap-12 mb-12">
                  {bannerData.images.map((img: any, index: number) => (
                    <div key={index} className="grayscale hover:grayscale-0 transition-all duration-500">
                      <img
                        src={img.imageUrl}
                        alt={img.altText || "Partner logo"}
                        className="h-20 object-contain"
                      />
                    </div>
                  ))}
                </div>
              )}
              {bannerData.buttonText && bannerData.buttonLink && (
                <div className="text-center">
                  <Link to={bannerData.buttonLink}>
                    <Button 
                      className={
                        bannerData.buttonStyle === "technical"
                          ? "bg-[#1f2937] text-white hover:bg-[#1f2937]/90"
                          : "bg-[#f9dc24] text-black hover:bg-[#f9dc24]/90"
                      }
                    >
                      {bannerData.buttonText}
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </section>
        );
      }
      if (dynamicSegment.type === 'image-text') {
        const imageTextData = dynamicSegment.data || {};
        const imageTextItems = imageTextData.items || [];
        const imageTextLayout = imageTextData.layout || "2-col";
        
        const getImageTextGridClass = () => {
          switch(imageTextLayout) {
            case "1-col": return "grid-cols-1";
            case "2-col": return "grid-cols-1 md:grid-cols-2";
            case "3-col": return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
            default: return "grid-cols-1 md:grid-cols-2";
          }
        };

        return (
          <section key={segmentId} id={String(segmentIdMap[segmentId] || segmentId)} className="py-20 bg-white">
            <div className="grid gap-8 max-w-7xl mx-auto grid-cols-1">
              {imageTextData.title && (
                <h2 className="text-4xl font-bold mb-4 px-4">{imageTextData.title}</h2>
              )}
              {imageTextData.subtext && (
                <p className="text-lg text-gray-600 mb-8 px-4">{imageTextData.subtext}</p>
              )}
              <div className={`grid ${getImageTextGridClass()} gap-8`}>
                {imageTextItems.map((item: any, index: number) => (
                  <div key={index} className="space-y-4">
                    {item.imageUrl && (
                      <img 
                        src={item.imageUrl} 
                        alt={item.title || "Content image"} 
                        className="w-full h-auto rounded-lg shadow-md"
                      />
                    )}
                    {item.title && <h3 className="text-2xl font-bold">{item.title}</h3>}
                    {item.description && <p className="text-gray-600 leading-relaxed">{item.description}</p>}
                  </div>
                ))}
              </div>
            </div>
          </section>
        );
      }
    }
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-roboto">
      <SEOHead
        title={seoData.title || "Multispectral Illumination"}
        description={seoData.description || ""}
        canonical={seoData.canonical || ""}
        ogImage={seoData.ogImage || ""}
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

      {/* Render all other segments except meta-navigation */}
      {tabOrder
        .filter(segmentId => {
          const dynamicSegment = pageSegments.find(seg => seg.id === segmentId);
          return dynamicSegment && dynamicSegment.type !== 'meta-navigation';
        })
        .map(segmentId => renderSegment(segmentId))}

      <Footer />
    </div>
  );
};

export default MultispectralIllumination;
