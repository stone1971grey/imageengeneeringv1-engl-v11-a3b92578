import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Download, BarChart3, Zap, Shield, Eye, Car, Smartphone, Heart, CheckCircle, Lightbulb, Monitor } from "lucide-react";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import MetaNavigation from "@/components/segments/MetaNavigation";
import ProductHeroGallery from "@/components/segments/ProductHeroGallery";
import FeatureOverview from "@/components/segments/FeatureOverview";
import Table from "@/components/segments/Table";
import FAQ from "@/components/segments/FAQ";
import { Video } from "@/components/segments/Video";
import Specification from "@/components/segments/Specification";
import FullHero from "@/components/segments/FullHero";
import Intro from "@/components/segments/Intro";
import IndustriesSegment from "@/components/segments/IndustriesSegment";
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

const Photography = () => {
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
      .eq("page_slug", "photography");

    // Load segment registry for ID mapping
    const { data: segmentData } = await supabase
      .from("segment_registry")
      .select("*")
      .eq("page_slug", "photography")
      .eq("deleted", false);

    if (segmentData) {
      const idMap: Record<string, number> = {};
      segmentData.forEach((seg: any) => {
        idMap[seg.segment_key] = seg.segment_id;
      });
      setSegmentIdMap(idMap);
    }

    if (!error && data) {
      data.forEach((item: any) => {
        if (item.section_key === "page_segments") {
          const segments = JSON.parse(item.content_value);
          
          // Merge segment data from separate entries
          segments.forEach((segment: any) => {
            if (segment.type === 'full-hero') {
              const fullHeroKey = `full_hero_${segment.id}`;
              const fullHeroData = data.find((d: any) => d.section_key === fullHeroKey);
              if (fullHeroData) {
                segment.data = JSON.parse(fullHeroData.content_value);
              }
            }
            if (segment.type === 'intro') {
              const introData = data.find((d: any) => d.section_key === segment.id);
              if (introData) {
                segment.data = JSON.parse(introData.content_value);
              }
            }
            if (segment.type === 'news') {
              const newsData = data.filter((d: any) => d.section_key === segment.id);
              if (newsData.length > 0) {
                const newsConfig: any = {};
                newsData.forEach((newsItem: any) => {
                  if (newsItem.content_type === 'news_section_title') {
                    newsConfig.sectionTitle = newsItem.content_value;
                  } else if (newsItem.content_type === 'news_section_description') {
                    newsConfig.sectionDescription = newsItem.content_value;
                  } else if (newsItem.content_type === 'news_article_limit') {
                    newsConfig.articleLimit = newsItem.content_value;
                  } else if (newsItem.content_type === 'news_categories') {
                    newsConfig.categories = JSON.parse(newsItem.content_value);
                  }
                });
                segment.data = newsConfig;
              }
            }
          });
          
          setPageSegments(segments);
        } else if (item.section_key === "tab_order") {
          try {
            const order = JSON.parse(item.content_value);
            setTabOrder(order || []);
          } catch {
            setTabOrder([]);
          }
        } else if (item.section_key === "seo_settings") {
          try {
            const seoSettings = JSON.parse(item.content_value);
            setSeoData(seoSettings);
          } catch {
            // Keep empty seo data
          }
        }
      });
    }
    setLoading(false);
  };

  // Helper function to render segment by ID
  const renderSegment = (segmentId: string) => {
    // Check if it's a dynamic segment
    const dynamicSegment = pageSegments.find(seg => seg.id === segmentId);
    if (!dynamicSegment) return null;

    // Meta Navigation
    if (dynamicSegment.type === 'meta-navigation') {
      return <MetaNavigation key={segmentId} data={dynamicSegment.data} segmentIdMap={segmentIdMap} />;
    }

    // Product Hero Gallery
    if (dynamicSegment.type === 'product-hero-gallery') {
      return <ProductHeroGallery key={segmentId} id={segmentId} data={dynamicSegment.data} />;
    }

    // Feature Overview
    if (dynamicSegment.type === 'feature-overview') {
      return <FeatureOverview key={segmentId} id={segmentId} {...dynamicSegment.data} />;
    }

    // Table
    if (dynamicSegment.type === 'table') {
      return <Table key={segmentId} id={segmentId} {...dynamicSegment.data} />;
    }

    // FAQ
    if (dynamicSegment.type === 'faq') {
      return <FAQ key={segmentId} id={segmentId} {...dynamicSegment.data} />;
    }

    // Specification
    if (dynamicSegment.type === 'specification') {
      return <Specification key={segmentId} id={segmentId} {...dynamicSegment.data} />;
    }

    // Full Hero
    if (dynamicSegment.type === 'full-hero') {
      return <FullHero key={segmentId} id={segmentIdMap[segmentId] || segmentId} {...dynamicSegment.data} />;
    }

    // Intro
    if (dynamicSegment.type === 'intro') {
      return <Intro key={segmentId} {...dynamicSegment.data} />;
    }

    // Industries
    if (dynamicSegment.type === 'industries') {
      return <IndustriesSegment key={segmentId} {...dynamicSegment.data} />;
    }

    // News
    if (dynamicSegment.type === 'news') {
      return (
        <NewsSegment
          key={segmentId}
          id={segmentId}
          sectionTitle={dynamicSegment.data.sectionTitle}
          sectionDescription={dynamicSegment.data.sectionDescription}
          articleLimit={parseInt(dynamicSegment.data.articleLimit || "6")}
          categories={dynamicSegment.data.categories || []}
        />
      );
    }

    // Video
    if (dynamicSegment.type === 'video') {
      return <Video key={segmentId} id={segmentId} data={dynamicSegment.data} />;
    }

    // Tiles
    if (dynamicSegment.type === 'tiles') {
      const tilesData = dynamicSegment.data;
      return (
        <section key={segmentId} id={segmentId} className="py-8 bg-gray-50">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              {tilesData.title && (
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  {tilesData.title}
                </h2>
              )}
              {tilesData.description && (
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                  {tilesData.description}
                </p>
              )}
            </div>
          </div>
          <div className="container mx-auto px-6">
            <div className={`grid gap-8 max-w-7xl mx-auto ${
              tilesData.columns === "2" ? "md:grid-cols-2" :
              tilesData.columns === "4" ? "md:grid-cols-2 lg:grid-cols-4" :
              "md:grid-cols-2 lg:grid-cols-3"
            }`}>
              {tilesData.items?.map((app: any, index: number) => {
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
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      );
    }

    // Banner
    if (dynamicSegment.type === 'banner') {
      return (
        <section key={segmentId} id={segmentId} className="py-16" style={{ backgroundColor: '#f3f3f5' }}>
          <div className="container mx-auto px-4 text-center">
            {dynamicSegment.data.title && (
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {dynamicSegment.data.title}
              </h2>
            )}
            {dynamicSegment.data.subtext && (
              <p className="text-lg text-gray-600 mb-12 max-w-2xl mx-auto">
                {dynamicSegment.data.subtext}
              </p>
            )}
            {dynamicSegment.data.images && dynamicSegment.data.images.length > 0 && (
              <div className="flex flex-wrap justify-center items-center gap-8 mb-12">
                {dynamicSegment.data.images.map((image: any, index: number) => (
                  <div key={index} className="h-16 flex items-center">
                    <img 
                      src={image.url}
                      alt={image.alt || `Banner image ${index + 1}`}
                      className="max-h-full max-w-full object-contain filter grayscale hover:grayscale-0 transition-all duration-300"
                    />
                  </div>
                ))}
              </div>
            )}
            {dynamicSegment.data.buttonText && (
              <div className="flex justify-center">
                {dynamicSegment.data.buttonLink ? (
                  dynamicSegment.data.buttonLink.startsWith('http://') || dynamicSegment.data.buttonLink.startsWith('https://') ? (
                    <a
                      href={dynamicSegment.data.buttonLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block px-8 py-4 rounded-md text-lg font-medium transition-all duration-300 hover:scale-105"
                      style={{
                        backgroundColor: dynamicSegment.data.buttonStyle === "technical" ? "#1f2937" : "#f9dc24",
                        color: dynamicSegment.data.buttonStyle === "technical" ? "#ffffff" : "#000000"
                      }}
                    >
                      {dynamicSegment.data.buttonText}
                    </a>
                  ) : (
                    <Link to={dynamicSegment.data.buttonLink}>
                      <button 
                        className="px-8 py-4 rounded-md text-lg font-medium transition-all duration-300 hover:scale-105"
                        style={{
                          backgroundColor: dynamicSegment.data.buttonStyle === "technical" ? "#1f2937" : "#f9dc24",
                          color: dynamicSegment.data.buttonStyle === "technical" ? "#ffffff" : "#000000"
                        }}
                      >
                        {dynamicSegment.data.buttonText}
                      </button>
                    </Link>
                  )
                ) : (
                  <button 
                    className="px-8 py-4 rounded-md text-lg font-medium transition-all duration-300 hover:scale-105"
                    style={{
                      backgroundColor: dynamicSegment.data.buttonStyle === "technical" ? "#1f2937" : "#f9dc24",
                      color: dynamicSegment.data.buttonStyle === "technical" ? "#ffffff" : "#000000"
                    }}
                  >
                    {dynamicSegment.data.buttonText}
                  </button>
                )}
              </div>
            )}
          </div>
        </section>
      );
    }

    // Image & Text
    if (dynamicSegment.type === 'image-text') {
      return (
        <section key={segmentId} id={segmentId} className="bg-gray-50 py-20">
          <div className="w-full px-6">
            {(dynamicSegment.data.title || dynamicSegment.data.subtext) && (
              <div className="text-center mb-16">
                {dynamicSegment.data.title && (
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                    {dynamicSegment.data.title}
                  </h2>
                )}
                {dynamicSegment.data.subtext && (
                  <p className="text-xl text-gray-600 max-w-4xl mx-auto">
                    {dynamicSegment.data.subtext}
                  </p>
                )}
              </div>
            )}
            {dynamicSegment.data.items && dynamicSegment.data.items.length > 0 && (
              <div className={`grid gap-8 max-w-7xl mx-auto ${
                dynamicSegment.data.layout === "1-col" ? "grid-cols-1" :
                dynamicSegment.data.layout === "2-col" ? "grid-cols-1 md:grid-cols-2" :
                "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
              }`}>
                {dynamicSegment.data.items.map((item: any, index: number) => (
                  <Card key={index} className="bg-white border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden">
                    <CardContent className="p-0">
                      {item.imageUrl && (
                        <div className="aspect-[4/3] bg-gray-900 overflow-hidden relative">
                          <img 
                            src={item.imageUrl}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="p-8">
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">{item.title}</h3>
                        <div className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                          {item.description}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>
      );
    }

    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <SEOHead
        title={seoData.title}
        description={seoData.description}
        canonical={seoData.canonical}
        ogTitle={seoData.ogTitle}
        ogDescription={seoData.ogDescription}
        ogImage={seoData.ogImage}
        twitterCard={seoData.twitterCard}
        robotsIndex={seoData.noIndex ? 'noindex' : 'index'}
        robotsFollow={seoData.noFollow ? 'nofollow' : 'follow'}
      />
      
      <Navigation />
      
      <main className="flex-grow">
        {tabOrder.map((segmentId) => renderSegment(segmentId))}
      </main>

      <Footer />
    </div>
  );
};

export default Photography;
