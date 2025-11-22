import { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Download, BarChart3, Zap, Shield, Eye, Car, Smartphone, Heart, CheckCircle, Lightbulb, Monitor } from "lucide-react";
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

const DynamicCMSPage = () => {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [pageSegments, setPageSegments] = useState<any[]>([]);
  const [tabOrder, setTabOrder] = useState<string[]>([]);
  const [segmentIdMap, setSegmentIdMap] = useState<Record<string, number>>({});
  const [seoData, setSeoData] = useState<any>({});
  const [pageNotFound, setPageNotFound] = useState(false);

  // Extract page_slug from URL pathname
  // Examples:
  // /your-solution/photography -> photography
  // /your-solution/scanners-archiving/iso-21550 -> iso-21550
  const extractPageSlug = (pathname: string): string => {
    const parts = pathname.split('/').filter(Boolean);
    // Return the last segment of the URL
    return parts[parts.length - 1];
  };

  const pageSlug = extractPageSlug(location.pathname);

  useEffect(() => {
    if (pageSlug) {
      loadContent();
    }
  }, [pageSlug]);

  const loadContent = async () => {
    if (!pageSlug) {
      setPageNotFound(true);
      setLoading(false);
      return;
    }

    // Check if page exists in page_registry
    const { data: pageExists } = await supabase
      .from("page_registry")
      .select("page_slug")
      .eq("page_slug", pageSlug)
      .maybeSingle();

    if (!pageExists) {
      setPageNotFound(true);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("page_content")
      .select("*")
      .eq("page_slug", pageSlug);

    const { data: segmentData } = await supabase
      .from("segment_registry")
      .select("*")
      .eq("page_slug", pageSlug)
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
            const seo = JSON.parse(item.content_value);
            setSeoData(seo);
          } catch {
            setSeoData({});
          }
        }
      });
    }

    setLoading(false);
  };

  const renderSegment = (segmentId: string) => {
    const segment = pageSegments.find((s) => s.id === segmentId || s.segment_key === segmentId);
    
    if (!segment) {
      return null;
    }

    const segmentDbId = segmentIdMap[segment.segment_key || segment.id];

    switch (segment.type) {
      case "hero":
        const topSpacingClass = 
          segment.data?.hero_top_spacing === 'small' ? 'pt-[30px]' : 
          segment.data?.hero_top_spacing === 'large' ? 'pt-[70px]' : 
          segment.data?.hero_top_spacing === 'xlarge' ? 'pt-[90px]' : 
          'pt-[50px]';
        
        return (
          <section key={segmentId} id={segmentDbId?.toString()} className={`${topSpacingClass} pb-16`}>
            <div className="container mx-auto px-6">
              <div className={`grid gap-12 items-center ${
                segment.data?.hero_layout_ratio === '1-1' ? 'grid-cols-1 lg:grid-cols-2' :
                segment.data?.hero_layout_ratio === '2-3' ? 'grid-cols-1 lg:grid-cols-5 [&>*:first-child]:lg:col-span-2 [&>*:last-child]:lg:col-span-3' :
                'grid-cols-1 lg:grid-cols-5 [&>*:first-child]:lg:col-span-2 [&>*:last-child]:lg:col-span-3'
              }`}>
                <div className={segment.data?.hero_image_position === 'left' ? 'order-2 lg:order-2' : 'order-1 lg:order-1'}>
                  <h1 className="text-4xl lg:text-5xl xl:text-6xl font-light text-gray-900 leading-tight tracking-tight mb-6">
                    {segment.data?.hero_title || ''}
                    {segment.data?.hero_subtitle && (
                      <span className="font-medium block">{segment.data.hero_subtitle}</span>
                    )}
                  </h1>
                  <p className="text-lg lg:text-xl text-gray-600 leading-relaxed mb-8">
                    {segment.data?.hero_description || ''}
                  </p>
                  {segment.data?.hero_cta_text && (
                    <Link
                      to={segment.data.hero_cta_link || '#'}
                      className={`inline-flex items-center px-8 py-4 rounded-lg font-bold text-base transition-all duration-200 ${
                        segment.data.hero_cta_style === 'technical'
                          ? 'bg-gray-800 text-white hover:bg-gray-900'
                          : 'bg-[#f9dc24] text-gray-900 hover:bg-yellow-400'
                      }`}
                    >
                      {segment.data.hero_cta_text}
                    </Link>
                  )}
                </div>
                {segment.data?.hero_image_url && (
                  <div className={segment.data?.hero_image_position === 'left' ? 'order-1 lg:order-1' : 'order-2 lg:order-2'}>
                    <img
                      src={segment.data.hero_image_url}
                      alt={segment.data.hero_image_metadata?.altText || segment.data.hero_title || 'Hero image'}
                      className="w-full h-auto object-cover shadow-2xl"
                    />
                  </div>
                )}
              </div>
            </div>
          </section>
        );

      case "meta-navigation":
        return (
          <MetaNavigation
            key={segmentId}
            data={{
              links: segment.data?.navigationItems || []
            }}
            segmentIdMap={segmentIdMap}
          />
        );

      case "product-hero-gallery":
        return (
          <ProductHeroGallery
            key={segmentId}
            id={segmentDbId?.toString()}
            data={{
              title: segment.data?.title || "",
              subtitle: segment.data?.subtitle || "",
              description: segment.data?.description || "",
              images: segment.data?.images || [],
              cta1Text: segment.data?.cta1Text || "",
              cta1Link: segment.data?.cta1Link || "",
              cta1Style: segment.data?.cta1Style || "standard",
              cta2Text: segment.data?.cta2Text || "",
              cta2Link: segment.data?.cta2Link || "",
              cta2Style: segment.data?.cta2Style || "standard",
              imagePosition: segment.data?.imagePosition || "right",
              layoutRatio: segment.data?.layoutRatio || "2-5",
              topSpacing: segment.data?.topSpacing || "medium",
            }}
          />
        );

      case "feature-overview":
        return (
          <FeatureOverview
            key={segmentId}
            id={segmentDbId?.toString()}
            title={segment.data?.title || ""}
            subtext={segment.data?.subtext}
            layout={segment.data?.layout}
            rows={segment.data?.rows}
            items={segment.data?.items || []}
          />
        );

      case "table":
        return (
          <Table
            key={segmentId}
            id={segmentDbId?.toString() || ""}
            title={segment.data?.title || ""}
            subtext={segment.data?.description}
            headers={segment.data?.headers || []}
            rows={segment.data?.rows || []}
          />
        );

      case "faq":
        return (
          <FAQ
            key={segmentId}
            id={segmentDbId?.toString()}
            title={segment.data?.title || ""}
            subtext={segment.data?.subtext}
            items={segment.data?.items || []}
          />
        );

      case "specification":
        return (
          <Specification
            key={segmentId}
            id={segmentDbId?.toString() || ""}
            title={segment.data?.title || ""}
            rows={segment.data?.specifications || []}
          />
        );

      case "video":
        return (
          <Video
            key={segmentId}
            id={segmentDbId?.toString()}
            data={{
              title: segment.data?.title || "",
              videoUrl: segment.data?.videoUrl || "",
              caption: segment.data?.caption
            }}
          />
        );

      case "full-hero":
        return (
          <FullHero
            key={segmentId}
            id={segmentDbId?.toString()}
            titleLine1={segment.data?.titleLine1 || ""}
            titleLine2={segment.data?.titleLine2 || ""}
            subtitle={segment.data?.subtitle || ""}
            button1Text={segment.data?.button1Text}
            button1Link={segment.data?.button1Link}
            button1Color={segment.data?.button1Color || "yellow"}
            button2Text={segment.data?.button2Text}
            button2Link={segment.data?.button2Link}
            button2Color={segment.data?.button2Color || "black"}
            backgroundType={segment.data?.backgroundType || "image"}
            imageUrl={segment.data?.imageUrl}
            videoUrl={segment.data?.videoUrl}
            kenBurnsEffect={segment.data?.kenBurnsEffect || "standard"}
            overlayOpacity={segment.data?.overlayOpacity || 15}
            useH1={segment.data?.useH1 || false}
          />
        );

      case "intro":
        return (
          <Intro
            key={segmentId}
            title={segment.data?.title || ""}
            description={segment.data?.description || ""}
          />
        );

      case "industries":
        return (
          <IndustriesSegment
            key={segmentId}
            title={segment.data?.title || ""}
            subtitle={segment.data?.subtitle || ""}
            columns={segment.data?.columns}
            items={segment.data?.items || []}
          />
        );

      case "news":
        return (
          <NewsSegment
            key={segmentId}
            id={segmentDbId?.toString()}
            sectionTitle={segment.data?.title || "Latest News"}
            sectionDescription={segment.data?.description}
            articleLimit={segment.data?.articleLimit}
            categories={segment.data?.categories}
          />
        );

      case "tiles":
        return (
          <section key={segmentId} id={segmentDbId?.toString()} className="py-20 bg-gray-50">
            <div className="container mx-auto px-6">
              {segment.data?.title && (
                <div className="text-center mb-16">
                  <h2 className="text-4xl font-bold text-gray-900 mb-4">
                    {segment.data.title}
                  </h2>
                  {segment.data?.description && (
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                      {segment.data.description}
                    </p>
                  )}
                </div>
              )}
              <div className={`grid gap-8 ${
                segment.data?.columns === '4' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4' :
                segment.data?.columns === '3' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' :
                'grid-cols-1 md:grid-cols-2'
              }`}>
                {(segment.data?.items || []).map((tile: any, idx: number) => {
                  const Icon = iconMap[tile.icon] || FileText;
                  const hasImage = tile.imageUrl;
                  
                  return (
                    <Card key={idx} className="hover:shadow-xl transition-all duration-300 border-none bg-white">
                      <CardContent className="p-8">
                        <div className="flex flex-col items-center space-y-4">
                          {hasImage ? (
                            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#f9dc24]/20 hover:border-[#f9dc24]/40 transition-all duration-300">
                              <img 
                                src={tile.imageUrl} 
                                alt={tile.metadata?.altText || tile.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="p-4 bg-[#f9dc24]/10 rounded-full border-2 border-[#f9dc24]/20 hover:bg-[#f9dc24]/20 hover:border-[#f9dc24]/40 transition-all duration-300">
                              <Icon className="h-8 w-8 text-gray-900" />
                            </div>
                          )}
                          <div className="space-y-3 flex-1 text-center">
                            <h3 className="text-2xl font-bold text-gray-900">{tile.title}</h3>
                            <p className="text-gray-600 leading-relaxed">{tile.description}</p>
                          </div>
                          {tile.ctaText && tile.ctaLink && (
                            <Link
                              to={tile.ctaLink}
                              className={`inline-flex items-center px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                                tile.ctaStyle === "technical"
                                  ? "bg-gray-800 text-white hover:bg-gray-900"
                                  : "bg-[#f9dc24] text-gray-900 hover:bg-yellow-400"
                              }`}
                            >
                              {tile.ctaText}
                            </Link>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </section>
        );

      case "banner":
        return (
          <section key={segmentId} id={segmentDbId?.toString()} className="py-20 bg-white">
            <div className="container mx-auto px-6">
              {segment.data?.title && (
                <div className="text-center mb-16">
                  <h2 className="text-4xl font-bold text-gray-900 mb-4">
                    {segment.data.title}
                  </h2>
                  {segment.data?.subtext && (
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                      {segment.data.subtext}
                    </p>
                  )}
                </div>
              )}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
                {(segment.data?.images || []).map((banner: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-center justify-center p-6 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
                  >
                    <img
                      src={banner.url}
                      alt={banner.alt}
                      className="max-h-16 w-auto object-contain grayscale group-hover:grayscale-0 transition-all duration-300"
                    />
                  </div>
                ))}
              </div>
              {segment.data?.buttonText && segment.data?.buttonLink && (
                <div className="text-center">
                  <Link
                    to={segment.data.buttonLink}
                    className={`inline-flex items-center px-8 py-4 rounded-lg font-bold text-lg transition-all duration-200 ${
                      segment.data.buttonStyle === "technical"
                        ? "bg-gray-800 text-white hover:bg-gray-900"
                        : "bg-[#f9dc24] text-gray-900 hover:bg-yellow-400"
                    }`}
                  >
                    {segment.data.buttonText}
                  </Link>
                </div>
              )}
            </div>
          </section>
        );

      case "image-text":
      case "solutions":
        const layoutClass =
          segment.data?.layout === "1-col"
            ? "grid-cols-1"
            : segment.data?.layout === "3-col"
            ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
            : "grid-cols-1 md:grid-cols-2";

        return (
          <section key={segmentId} id={segmentDbId?.toString()} className="py-20 bg-gray-50">
            <div className="container mx-auto px-6">
              {segment.data?.title && (
                <div className="text-center mb-16">
                  <h2 className="text-4xl font-bold text-gray-900 mb-4">
                    {segment.data.title}
                  </h2>
                  {segment.data?.subtext && (
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                      {segment.data.subtext}
                    </p>
                  )}
                </div>
              )}
              <div className={`grid gap-8 max-w-7xl mx-auto ${layoutClass}`}>
                {(segment.data?.items || []).map((solution: any, idx: number) => (
                  <div key={idx} className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                    {solution.imageUrl && (
                      <div className="w-full h-64 overflow-hidden">
                        <img
                          src={solution.imageUrl}
                          alt={solution.title}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <div className="p-8">
                      <h3 className="text-2xl font-bold text-gray-900 mb-4">{solution.title}</h3>
                      <p className="text-gray-600 leading-relaxed">{solution.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#f9dc24] mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading page...</p>
        </div>
      </div>
    );
  }

  if (pageNotFound) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Navigation />
        <div className="text-center">
          <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
          <p className="text-xl text-gray-600 mb-8">Page not found</p>
          <Link
            to="/"
            className="inline-flex items-center px-6 py-3 bg-[#f9dc24] text-gray-900 rounded-lg font-semibold hover:bg-yellow-400 transition-colors"
          >
            Back to Home
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SEOHead
        title={seoData?.title || "Image Engineering"}
        description={seoData?.description || ""}
        canonical={seoData?.canonical}
        ogTitle={seoData?.ogTitle}
        ogDescription={seoData?.ogDescription}
        ogImage={seoData?.ogImage}
        robotsIndex={seoData?.robotsIndex ? 'index' : 'noindex'}
        robotsFollow={seoData?.robotsFollow ? 'follow' : 'nofollow'}
      />
      <Navigation />
      {tabOrder.map((segmentId) => renderSegment(segmentId))}
      <Footer />
    </div>
  );
};

export default DynamicCMSPage;
