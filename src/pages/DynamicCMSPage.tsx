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
import Debug from "@/components/segments/Debug";
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
  const [fullHeroOverrides, setFullHeroOverrides] = useState<Record<string, any>>({});
  
  // Debug mode aktivieren mit ?debug=true in der URL
  const isDebugMode = new URLSearchParams(location.search).get('debug') === 'true';

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
      let loadedSegments: any[] = [];
      let loadedTabOrder: string[] = [];
      const fullHeroOverridesLocal: Record<string, any> = {};
      
      data.forEach((item: any) => {
        if (item.section_key === "page_segments") {
          try {
            loadedSegments = JSON.parse(item.content_value);
          } catch (e) {
            console.error('[DynamicCMSPage] Error parsing page_segments:', e);
          }
        } else if (item.section_key === "tab_order") {
          try {
            loadedTabOrder = JSON.parse(item.content_value);
          } catch (e) {
            console.error('[DynamicCMSPage] Error parsing tab_order:', e);
          }
        } else if (item.section_key === "seo") {
          try {
            setSeoData(JSON.parse(item.content_value));
          } catch (e) {
            console.error('[DynamicCMSPage] Error parsing SEO data:', e);
          }
        } else if (item.section_key.startsWith('full_hero_')) {
          try {
            const heroData = JSON.parse(item.content_value);
            const segmentIdFromKey = item.section_key.split('full_hero_')[1];
            if (segmentIdFromKey) {
              fullHeroOverridesLocal[segmentIdFromKey] = heroData;
            }
          } catch (e) {
            console.error('[DynamicCMSPage] Error parsing full_hero override:', e);
          }
        }
      });

      setFullHeroOverrides(fullHeroOverridesLocal);

      setPageSegments(loadedSegments);
      setTabOrder(loadedTabOrder);

      // CRITICAL: Auto-sync tab_order with page_segments
      // Ensure all segments in page_segments are also in tab_order
      if (loadedSegments.length > 0) {
        const allSegmentIds = loadedSegments.map((s) => s.id || s.segment_key);
        const missingInTabOrder = allSegmentIds.filter((id) => !loadedTabOrder.includes(id));
        
        if (missingInTabOrder.length > 0) {
          console.log(`[DynamicCMSPage] Auto-syncing tab_order: adding missing segments ${missingInTabOrder.join(', ')}`);
          
          // Add missing segments to tab_order
          const updatedTabOrder = [...missingInTabOrder, ...loadedTabOrder];
          
          // Update tab_order in database
          const { data: existingTabOrder } = await supabase
            .from("page_content")
            .select("id")
            .eq("page_slug", pageSlug)
            .eq("section_key", "tab_order")
            .maybeSingle();

          if (existingTabOrder) {
            await supabase
              .from("page_content")
              .update({
                content_value: JSON.stringify(updatedTabOrder),
                updated_at: new Date().toISOString(),
              })
              .eq("page_slug", pageSlug)
              .eq("section_key", "tab_order");
          } else {
            await supabase
              .from("page_content")
              .insert({
                page_slug: pageSlug,
                section_key: "tab_order",
                content_type: "json",
                content_value: JSON.stringify(updatedTabOrder),
              });
          }
          
          setTabOrder(updatedTabOrder);
        }
      }
    }

    setLoading(false);
  };

  // Check if page has Meta Navigation segment
  const hasMetaNavigation = pageSegments.some(seg => seg.type === "meta-navigation");

  const renderSegment = (segmentId: string) => {
    const segment = pageSegments.find((s) => s.id === segmentId || s.segment_key === segmentId);
    
    if (!segment) {
      return null;
    }

    const segmentDbId = segmentIdMap[segment.segment_key || segment.id];

    switch (segment.type) {
      case "hero":
        // Fixed Navigation ist ~80px hoch + 10px top offset = 90px
        // Dazu kommt der gewünschte Abstand: small(30px), medium(50px), large(70px), xlarge(90px)
        const topSpacingClass = 
          segment.data?.hero_top_spacing === 'small' ? 'pt-[120px]' :      // 90px Nav + 30px = 120px
          segment.data?.hero_top_spacing === 'large' ? 'pt-[160px]' :      // 90px Nav + 70px = 160px
          segment.data?.hero_top_spacing === 'xlarge' ? 'pt-[180px]' :     // 90px Nav + 90px = 180px
          'pt-[140px]';                                                     // 90px Nav + 50px = 140px (medium default)
        
        return (
          <section
            key={segmentId}
            id={segmentDbId?.toString()}
            data-segment-key={segment.segment_key || segment.id}
            data-segment-id={segmentDbId?.toString()}
            className={`${topSpacingClass} pb-16`}
          >
            <div className="container mx-auto px-6">
              <div className={`grid gap-12 items-center ${
                segment.data?.hero_layout_ratio === '1-1' ? 'grid-cols-1 lg:grid-cols-2' :
                segment.data?.hero_layout_ratio === '2-3' ? 'grid-cols-1 lg:grid-cols-5 [&>*:first-child]:lg:col-span-2 [&>*:last-child]:lg:col-span-3' :
                'grid-cols-1 lg:grid-cols-5 [&>*:first-child]:lg:col-span-2 [&>*:last-child]:lg:col-span-3'
              }`}>
                <div className={segment.data?.hero_image_position === 'left' ? 'order-2 lg:order-2' : 'order-1 lg:order-1'}>
                  <h2 className="text-5xl lg:text-6xl xl:text-7xl font-light leading-[0.9] tracking-tight mb-6 text-gray-900">
                    {segment.data?.hero_title || ''}
                    {segment.data?.hero_subtitle && (
                      <span className="font-medium block">{segment.data.hero_subtitle}</span>
                    )}
                  </h2>
                  <p className="text-lg md:text-xl lg:text-2xl text-gray-700 font-light leading-relaxed mb-8">
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
              // Support legacy and new data structures
              links: segment.data?.navigationItems || segment.data?.links || segment.navigationItems || []
            }}
            segmentIdMap={segmentIdMap}
          />
        );

      case "product-hero-gallery":
        return (
          <ProductHeroGallery
            key={segmentId}
            id={segmentDbId?.toString()}
            hasMetaNavigation={hasMetaNavigation}
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
            rows={segment.data?.rows || []}
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

      case "full-hero": {
        const segmentKey = segment.segment_key || segment.id;
        const overrideKey = segmentDbId?.toString() || String(segmentKey || "");
        const override = fullHeroOverrides[overrideKey] || fullHeroOverrides[String(segmentKey || "")] || {};
        const heroData = {
          ...(segment.data || {}),
        };

        // Fallback: wenn kein imageUrl im gemeinsamen Segment steht, nutze alten Full-Hero-Eintrag
        const finalHeroData = (!heroData.imageUrl && override.imageUrl)
          ? { ...heroData, ...override }
          : heroData;

        return (
          <FullHero
            key={segmentId}
            id={segmentDbId?.toString()}
            hasMetaNavigation={hasMetaNavigation}
            titleLine1={finalHeroData.titleLine1 || ""}
            titleLine2={finalHeroData.titleLine2 || ""}
            subtitle={finalHeroData.subtitle || ""}
            button1Text={finalHeroData.button1Text}
            button1Link={finalHeroData.button1Link}
            button1Color={finalHeroData.button1Color || "yellow"}
            button2Text={finalHeroData.button2Text}
            button2Link={finalHeroData.button2Link}
            button2Color={finalHeroData.button2Color || "black"}
            backgroundType={finalHeroData.backgroundType || "image"}
            imageUrl={finalHeroData.imageUrl}
            videoUrl={finalHeroData.videoUrl}
            kenBurnsEffect={finalHeroData.kenBurnsEffect || "standard"}
            overlayOpacity={finalHeroData.overlayOpacity || 15}
            useH1={finalHeroData.useH1 || false}
          />
        );
      }


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

      case "debug":
        return (
          <Debug
            key={segmentId}
            id={segmentDbId?.toString()}
            imageUrl={segment.data?.imageUrl}
            title={segment.data?.title}
          />
        );

      case "tiles":
        return (
          <section
            key={segmentId}
            id={segmentDbId?.toString()}
            data-segment-key={segment.segment_key || segment.id}
            data-segment-id={segmentDbId?.toString()}
            className="py-20 bg-gray-50"
          >
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
                    <Card key={idx} className="hover:shadow-xl transition-all duration-300 border-none bg-white overflow-hidden">
                      <CardContent className="p-0">
                        {hasImage ? (
                          <div className="w-full aspect-square overflow-hidden">
                            <img 
                              src={tile.imageUrl} 
                              alt={tile.metadata?.altText || tile.title}
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        ) : (
                          <div className="flex justify-center pt-8">
                            <div className="p-4 bg-[#f9dc24]/10 rounded-full border-2 border-[#f9dc24]/20 hover:bg-[#f9dc24]/20 hover:border-[#f9dc24]/40 transition-all duration-300">
                              <Icon className="h-8 w-8 text-gray-900" />
                            </div>
                          </div>
                        )}
                        <div className="p-8">
                          <div className="space-y-3 flex-1 text-center">
                            <h3 className="text-2xl font-bold text-gray-900">{tile.title}</h3>
                            <p className="text-gray-600 leading-relaxed">{tile.description}</p>
                          </div>
                          {tile.showButton !== false && tile.ctaText && tile.ctaLink && (
                            <div className="mt-6 flex justify-center">
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
                            </div>
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
          <section
            key={segmentId}
            id={segmentDbId?.toString()}
            data-segment-key={segment.segment_key || segment.id}
            data-segment-id={segmentDbId?.toString()}
            className="py-20 bg-white"
          >
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

        // DEBUG: Log full segment data to console
        console.log(`[DynamicCMSPage] 🔍 Image-Text Segment Debug:`, {
          segmentId,
          segmentDbId,
          segmentType: segment.type,
          segmentDataKeys: Object.keys(segment.data || {}),
          fullSegmentData: segment.data,
          itemsCount: segment.data?.items?.length || 0,
          items: segment.data?.items,
        });

        // DEBUG: Log each item's image URL
        (segment.data?.items || []).forEach((item: any, idx: number) => {
          console.log(`[DynamicCMSPage] 📸 Item ${idx + 1} Image:`, {
            hasImageUrl: !!item.imageUrl,
            imageUrl: item.imageUrl,
            title: item.title,
          });
        });

        return (
          <section
            key={segmentId}
            id={segmentDbId?.toString()}
            data-segment-key={segment.segment_key || segment.id}
            data-segment-id={segmentDbId?.toString()}
            className="py-20 bg-gray-50"
          >
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
                {(segment.data?.items || []).map((solution: any, idx: number) => {
                  console.log(`[DynamicCMSPage] 🖼️ Rendering Item ${idx + 1}:`, {
                    hasImageUrl: !!solution.imageUrl,
                    imageUrl: solution.imageUrl,
                    willRenderImage: !!solution.imageUrl
                  });
                  
                  return (
                  <div key={idx} className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                    {solution.imageUrl && (
                      <div className="w-full h-64 overflow-hidden">
                        <img
                          src={solution.imageUrl}
                          alt={solution.title}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          onLoad={() => console.log(`[DynamicCMSPage] ✅ Image loaded successfully: Item ${idx + 1}`)}
                          onError={(e) => console.error(`[DynamicCMSPage] ❌ Image failed to load: Item ${idx + 1}`, solution.imageUrl, e)}
                        />
                      </div>
                    )}
                    <div className="p-8">
                      <h3 className="text-2xl font-bold text-gray-900 mb-4">{solution.title}</h3>
                      <p className="text-gray-600 leading-relaxed">{solution.description}</p>
                    </div>
                  </div>
                )})}
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

  // Extract Meta Navigation segment (must render before all other segments)
  const metaNavSegment = pageSegments.find(seg => seg.type === 'meta-navigation');

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
      
      {/* DEBUG PANEL - Nur sichtbar mit ?debug=true */}
      {isDebugMode && (
        <div className="bg-yellow-100 border-4 border-yellow-500 p-6 mx-4 my-4 rounded-lg">
          <h2 className="text-2xl font-bold text-black mb-4">🔍 DEBUG MODE - Image & Text Segments</h2>
          <div className="space-y-4">
            {pageSegments
              .filter(seg => seg.type === 'image-text')
              .map((seg, segIdx) => (
                <div key={seg.id} className="bg-white p-4 rounded border-2 border-gray-300">
                  <h3 className="font-bold text-lg mb-2">
                    Segment ID: {segmentIdMap[seg.id] || seg.id} | Type: {seg.type}
                  </h3>
                  <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                    <div><strong>Title:</strong> {seg.data?.title || '(keine)'}</div>
                    <div><strong>Items Count:</strong> {seg.data?.items?.length || 0}</div>
                    <div><strong>Layout:</strong> {seg.data?.layout || '2-col'}</div>
                  </div>
                  
                  {seg.data?.items?.length > 0 ? (
                    <div className="space-y-3">
                      <h4 className="font-semibold">Items:</h4>
                      {seg.data.items.map((item: any, itemIdx: number) => (
                        <div key={itemIdx} className="bg-gray-50 p-3 rounded border border-gray-200">
                          <div className="font-semibold mb-2">Item {itemIdx + 1}</div>
                          <div className="grid gap-1 text-xs">
                            <div><strong>Title:</strong> {item.title || '(leer)'}</div>
                            <div><strong>Has imageUrl:</strong> {item.imageUrl ? '✅ JA' : '❌ NEIN'}</div>
                            {item.imageUrl && (
                              <>
                                <div className="break-all"><strong>Image URL:</strong> {item.imageUrl}</div>
                                <div className="mt-2">
                                  <strong>Image Test:</strong>
                                  <img 
                                    src={item.imageUrl} 
                                    alt={item.title}
                                    className="w-32 h-32 object-cover border-2 border-green-500 mt-1"
                                    onLoad={() => console.log(`✅ Debug Panel: Item ${itemIdx + 1} loaded`)}
                                    onError={(e) => console.error(`❌ Debug Panel: Item ${itemIdx + 1} failed`, e)}
                                  />
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-red-600 font-semibold">⚠️ Keine Items in diesem Segment!</div>
                  )}
                </div>
              ))}
            
            {pageSegments.filter(seg => seg.type === 'image-text').length === 0 && (
              <div className="bg-red-100 p-4 rounded border-2 border-red-500 text-red-800 font-semibold">
                ⚠️ Keine Image & Text Segmente auf dieser Seite gefunden!
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Meta Navigation - Always rendered directly under Navigation (mandatory position) */}
      {metaNavSegment && (
        <MetaNavigation
          key={`meta-nav-${metaNavSegment.segment_id}`}
          data={{
            // Support legacy and new data structures
            links: metaNavSegment.data?.navigationItems || metaNavSegment.data?.links || metaNavSegment.navigationItems || []
          }}
          segmentIdMap={segmentIdMap}
        />
      )}
      
      {/* Render all other segments in tab order (excluding meta-navigation) */}
      {tabOrder
        .filter(segmentId => {
          const segment = pageSegments.find(s => s.segment_id === segmentId);
          return segment?.type !== 'meta-navigation';
        })
        .map((segmentId) => renderSegment(segmentId))
      }
      <Footer />
    </div>
  );
};

export default DynamicCMSPage;
