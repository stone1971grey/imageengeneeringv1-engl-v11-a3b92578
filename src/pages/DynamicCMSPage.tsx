import { useState, useEffect, useMemo, useCallback, lazy, Suspense } from "react";
import { useLocation, Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Download, BarChart3, Zap, Shield, Eye, Car, Smartphone, Heart, CheckCircle, Lightbulb, Monitor } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { SEOHead } from "@/components/SEOHead";
import { supabase } from "@/integrations/supabase/client";

// Lazy load segment components for better performance
const MetaNavigation = lazy(() => import("@/components/segments/MetaNavigation"));
const ProductHeroGallery = lazy(() => import("@/components/segments/ProductHeroGallery"));
const FeatureOverview = lazy(() => import("@/components/segments/FeatureOverview"));
const Table = lazy(() => import("@/components/segments/Table"));
const FAQ = lazy(() => import("@/components/segments/FAQ"));
const Video = lazy(() => import("@/components/segments/Video").then(m => ({ default: m.Video })));
const Specification = lazy(() => import("@/components/segments/Specification"));
const FullHero = lazy(() => import("@/components/segments/FullHero"));
const Intro = lazy(() => import("@/components/segments/Intro"));
const IndustriesSegment = lazy(() => import("@/components/segments/IndustriesSegment"));
const NewsSegment = lazy(() => import("@/components/segments/NewsSegment"));
const Debug = lazy(() => import("@/components/segments/Debug"));

// Segment loading fallback
const SegmentLoader = () => (
  <div className="w-full h-32 flex items-center justify-center">
    <div className="animate-pulse bg-gray-200 rounded w-full h-full" />
  </div>
);

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

  // Extract page_slug from full URL pathname (hierarchical)
  // Examples with language prefix:
  // /en/your-solution/photography -> your-solution/photography
  // /de/your-solution/scanners-archiving/iso-21550 -> your-solution/scanners-archiving/iso-21550
  const extractPageSlug = (pathname: string): string => {
    // Remove leading slash, split into parts
    const parts = pathname.replace(/^\/+/, "").split('/');
    
    // Check if first part is a language code
    const validLanguages = ['en', 'de', 'zh', 'ja', 'ko'];
    if (validLanguages.includes(parts[0])) {
      // Remove language prefix and rejoin
      return parts.slice(1).join('/');
    }
    
    // No language prefix, return as is
    return parts.join('/');
  };

  const pageSlug = extractPageSlug(location.pathname);
  
  // Extract language from URL for dependency tracking
  const pathParts = location.pathname.replace(/^\/+/, "").split('/');
  const validLanguages = ['en', 'de', 'zh', 'ja', 'ko'];
  const currentUrlLanguage = validLanguages.includes(pathParts[0]) ? pathParts[0] : 'en';

  useEffect(() => {
    if (pageSlug) {
      loadContent();
    }
  }, [pageSlug, currentUrlLanguage]);

  const loadContent = async () => {
    if (!pageSlug) {
      setPageNotFound(true);
      setLoading(false);
      return;
    }

    // Extract language from URL
    const pathParts = location.pathname.replace(/^\/+/, "").split('/');
    const validLanguages = ['en', 'de', 'zh', 'ja', 'ko'];
    const urlLanguage = validLanguages.includes(pathParts[0]) ? pathParts[0] : 'en';

    // Check if page exists in page_registry
    // IMPORTANT: CMS-Pages sollen niemals eine harte 404 werfen.
    // Wenn kein Eintrag gefunden wird, behandeln wir die Seite als "leer" und zeigen den
    // generischen "Page Created Successfully" Screen statt einer 404.
    const { data: pageExists } = await supabase
      .from("page_registry")
      .select("page_slug")
      .eq("page_slug", pageSlug)
      .maybeSingle();

    if (!pageExists) {
      console.warn(`[DynamicCMSPage] page_registry entry not found for slug: ${pageSlug} – rendering as empty CMS page`);
      setLoading(false);
      return;
    }

    // Try to load content in requested language first
    let { data, error } = await supabase
      .from("page_content")
      .select("*")
      .eq("page_slug", pageSlug)
      .eq("language", urlLanguage);

    // Fallback to English if no content found in requested language
    if (!data || data.length === 0) {
      console.log(`[DynamicCMSPage] No content found for ${pageSlug} in ${urlLanguage}, falling back to English`);
      const fallback = await supabase
        .from("page_content")
        .select("*")
        .eq("page_slug", pageSlug)
        .eq("language", 'en');
      
      data = fallback.data;
      error = fallback.error;
    }

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
      const introLegacyMap: Record<string, { title?: string; description?: string }> = {};
      const industriesOverrideMap: Record<string, any> = {};
      
      const parseContentRows = (rows: any[] | null | undefined) => {
        let segments: any[] = [];
        let tabs: string[] = [];
        const localIntroLegacyMap: Record<string, { title?: string; description?: string }> = {};
        const localIndustriesOverrideMap: Record<string, any> = {};

        (rows || []).forEach((item: any) => {
          if (item.section_key === "page_segments") {
            try {
              segments = JSON.parse(item.content_value || "[]");
            } catch (e) {
              console.error('[DynamicCMSPage] Error parsing page_segments:', e);
            }
          } else if (item.section_key === "tab_order") {
            try {
              tabs = JSON.parse(item.content_value || "[]");
            } catch (e) {
              console.error('[DynamicCMSPage] Error parsing tab_order:', e);
            }
          } else if (item.section_key === "seo") {
            try {
              setSeoData(JSON.parse(item.content_value || '{}'));
            } catch (e) {
              console.error('[DynamicCMSPage] Error parsing SEO data:', e);
            }
          } else if (item.section_key.startsWith('full_hero_')) {
            try {
              const heroData = JSON.parse(item.content_value || '{}');
              const segmentIdFromKey = item.section_key.split('full_hero_')[1];
              if (segmentIdFromKey) {
                fullHeroOverridesLocal[segmentIdFromKey] = heroData;
              }
            } catch (e) {
              console.error('[DynamicCMSPage] Error parsing full_hero override:', e);
            }
          } else {
            // Numerische section_keys können für Intro (legacy) oder Industries-Overrides verwendet werden
            const isNumericKey = /^\d+$/.test(item.section_key);
            if (isNumericKey) {
              try {
                const parsed = JSON.parse(item.content_value || '{}');
                // Legacy Intro: headingLevel-Feld vorhanden
                if (parsed && typeof parsed === 'object' && 'headingLevel' in parsed) {
                  localIntroLegacyMap[item.section_key] = {
                    title: parsed.title,
                    description: parsed.description,
                  };
                } else if (item.content_type === 'industries') {
                  // Industries-Overrides pro Sprache
                  localIndustriesOverrideMap[item.section_key] = parsed;
                }
              } catch (e) {
                console.error('[DynamicCMSPage] Error parsing numeric section content:', e);
              }
            }
          }
        });

        return { segments, tabs, localIntroLegacyMap, localIndustriesOverrideMap };
      };

      // Zuerst versuchen, die Inhalte der gewünschten Sprache zu verwenden
      let { segments, tabs, localIntroLegacyMap, localIndustriesOverrideMap } = parseContentRows(data);

      // Wenn für die gewünschte Sprache keine gültigen Segmente gefunden wurden,
      // auf Englisch zurückfallen (wichtig für Fälle mit kaputtem JSON in der Zielsprache)
      if ((!segments || segments.length === 0) && urlLanguage !== 'en') {
        console.warn(`[DynamicCMSPage] No valid segments for ${pageSlug} in ${urlLanguage}, falling back to English segments`);
        const { data: fallbackRows, error: fallbackErr } = await supabase
          .from("page_content")
          .select("*")
          .eq("page_slug", pageSlug)
          .eq("language", 'en');

        if (!fallbackErr) {
          const fallbackParsed = parseContentRows(fallbackRows || []);
          segments = fallbackParsed.segments;
          tabs = fallbackParsed.tabs;
          localIntroLegacyMap = fallbackParsed.localIntroLegacyMap;
          localIndustriesOverrideMap = fallbackParsed.localIndustriesOverrideMap;
        }
      }

      loadedSegments = segments;
      loadedTabOrder = tabs;
      Object.assign(introLegacyMap, localIntroLegacyMap);
      Object.assign(industriesOverrideMap, localIndustriesOverrideMap);

      setFullHeroOverrides(fullHeroOverridesLocal);

      // Für Nicht-Englisch-Sprachen: Bild- und Layout-Fallback von EN für Banner-Segmente
      let englishSegmentsForFallback: any[] = [];
      if (urlLanguage !== 'en') {
        const { data: enRows, error: enError } = await supabase
          .from("page_content")
          .select("*")
          .eq("page_slug", pageSlug)
          .eq("language", 'en');

        if (!enError && enRows) {
          const parsedEn = parseContentRows(enRows || []);
          englishSegmentsForFallback = parsedEn.segments || [];
        }
      }

      // Intro-/Industries-Segmente mit Overrides anreichern + Banner-Fallback anwenden
      const enhancedSegments = Array.isArray(loadedSegments)
        ? loadedSegments.map((seg: any) => {
            const type = String(seg.type || '').toLowerCase();
            const key = seg.id ?? seg.segment_key;

            if (type === 'intro') {
              const legacy = key ? introLegacyMap[String(key)] : undefined;
              if (legacy) {
                return {
                  ...seg,
                  data: {
                    ...(seg.data || {}),
                    ...legacy,
                  },
                };
              }
            }

            if (type === 'industries') {
              const override = key ? industriesOverrideMap[String(key)] : undefined;
              if (override) {
                return {
                  ...seg,
                  data: {
                    ...(seg.data || {}),
                    ...override,
                  },
                };
              }
            }

            // Banner / Banner-P: Bilder & Layout aus EN übernehmen, wenn in Zielsprache leer
            if ((type === 'banner' || type === 'banner-p') && urlLanguage !== 'en') {
              const enMatch = englishSegmentsForFallback.find((enSeg: any) => {
                const enKey = enSeg.id ?? enSeg.segment_key;
                return (
                  String(enSeg.type || '').toLowerCase() === type &&
                  String(enKey) === String(key)
                );
              });

              if (enMatch?.data) {
                const hasImages = Array.isArray(seg.data?.images) && seg.data.images.length > 0;
                const enHasImages = Array.isArray(enMatch.data.images) && enMatch.data.images.length > 0;

                if (!hasImages && enHasImages) {
                  return {
                    ...seg,
                    data: {
                      // Layout & Bilder aus EN, Texte aus Zielsprache
                      ...enMatch.data,
                      ...seg.data,
                      images: enMatch.data.images,
                    },
                  };
                }
              }
            }

            return seg;
          })
        : loadedSegments;

      setPageSegments(enhancedSegments);
      setTabOrder(loadedTabOrder);

      console.log('[DynamicCMSPage] Loaded content', {
        pageSlug,
        urlLanguage,
        segmentsCount: enhancedSegments.length,
        tabOrderCount: loadedTabOrder.length,
        tabOrder: loadedTabOrder,
        segmentTypes: enhancedSegments.map(s => ({ id: s.id, key: s.segment_key, type: s.type })),
      });

      // REMOVED: Auto-sync tab_order logic that was adding unwanted empty segments
      // tab_order is now authoritative - only segments explicitly in tab_order will be rendered
    }

    setLoading(false);
  };

  // Memoize hasMetaNavigation check
  const hasMetaNavigation = useMemo(() => 
    pageSegments.some(seg => seg.type === "meta-navigation"), 
    [pageSegments]
  );

  // Memoize renderSegment function
  const renderSegment = useCallback((segmentId: string) => {
    const segment = pageSegments.find((s) =>
      String(s.id) === String(segmentId) || String(s.segment_key) === String(segmentId)
    );
    
    if (!segment) {
      console.warn(`[DynamicCMSPage] Segment not found for ID: ${segmentId}`);
      return null;
    }

    // Skip segments with empty/invalid data for Full Hero
    if (segment.type === 'full-hero') {
      const hasValidData = segment.data?.titleLine1 || segment.data?.titleLine2 || segment.data?.imageUrl;
      if (!hasValidData) {
        console.warn(`[DynamicCMSPage] Skipping empty Full Hero segment: ${segmentId}`);
        return null;
      }
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
        // Full Hero data comes from page_segments which is already language-specific
        // No need for overrides anymore, use segment.data directly
        const heroData = segment.data || {};

        return (
          <FullHero
            key={segmentId}
            id={segmentDbId?.toString()}
            hasMetaNavigation={hasMetaNavigation}
            titleLine1={heroData.titleLine1 || ""}
            titleLine2={heroData.titleLine2 || ""}
            subtitle={heroData.subtitle || ""}
            button1Text={heroData.button1Text}
            button1Link={heroData.button1Link}
            button1Color={heroData.button1Color || "yellow"}
            button2Text={heroData.button2Text}
            button2Link={heroData.button2Link}
            button2Color={heroData.button2Color || "black"}
            backgroundType={heroData.backgroundType || "image"}
            imageUrl={heroData.imageUrl}
            imageAlt={heroData.imageMetadata?.altText || heroData.titleLine1}
            imageMetadata={heroData.imageMetadata}
            videoUrl={heroData.videoUrl}
            imagePosition={heroData.imagePosition}
            layoutRatio={heroData.layoutRatio}
            topSpacing={heroData.topSpacing}
            kenBurnsEffect={heroData.kenBurnsEffect || "standard"}
            overlayOpacity={heroData.overlayOpacity ?? 15}
            useH1={heroData.useH1 ?? false}
          />
        );
      }


      case "intro":
        // Render Intro even with empty data (shows section structure)
        const introTitle = segment.data?.title || "";
        const introDescription = segment.data?.description || "";
        
        return (
          <Intro
            key={segmentId}
            title={introTitle}
            description={introDescription}
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
            className="py-16 bg-gray-100"
          >
            <div className="container mx-auto px-6">
              <div className="max-w-4xl mx-auto text-center">
                {segment.data?.title && (
                  <h2 className="text-4xl font-bold text-gray-900 mb-4">
                    {segment.data.title}
                  </h2>
                )}

                {segment.data?.subtext && (
                  <p className="text-lg text-gray-700 mb-8">
                    {segment.data.subtext}
                  </p>
                )}

                {segment.data?.images && segment.data.images.length > 0 && (
                  <div className="flex flex-wrap justify-center items-center gap-8 mb-8">
                    {segment.data.images.map((image: any) => 
                      image.url ? (
                        <div key={image.id} className="bg-gray-200 rounded-lg p-6 w-48 h-32 flex items-center justify-center">
                          <img
                            src={image.url}
                            alt={image.alt || 'Banner image'}
                            className="max-h-20 max-w-full object-contain grayscale hover:grayscale-0 transition-all duration-300"
                          />
                        </div>
                      ) : null
                    )}
                  </div>
                )}

                {segment.data?.buttonText && segment.data?.buttonLink && (() => {
                  const buttonClasses = 
                    segment.data.buttonStyle === 'technical'
                      ? 'inline-block px-8 py-3 rounded-lg font-semibold transition-all bg-gray-800 text-white hover:bg-gray-900'
                      : segment.data.buttonStyle === 'outline-white'
                      ? 'inline-block px-8 py-3 rounded-lg font-semibold transition-all bg-white text-black border border-gray-300 hover:bg-black hover:text-white'
                      : 'inline-block px-8 py-3 rounded-lg font-semibold transition-all bg-[#f9dc24] text-black hover:bg-[#f9dc24]/90';

                  const buttonLink = segment.data.buttonLink || '#';
                  const isExternal = buttonLink.startsWith('http://') || buttonLink.startsWith('https://');

                  if (isExternal) {
                    return (
                      <a
                        href={buttonLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={buttonClasses}
                      >
                        {segment.data.buttonText}
                      </a>
                    );
                  }

                  return (
                    <Link to={buttonLink} className={buttonClasses}>
                      {segment.data.buttonText}
                    </Link>
                  );
                })()}
              </div>
            </div>
          </section>
        );

      case "banner-p":
        return (
          <section
            key={segmentId}
            id={segmentDbId?.toString()}
            data-segment-key={segment.segment_key || segment.id}
            data-segment-id={segmentDbId?.toString()}
            className="py-16 bg-gray-100"
          >
            <div className="container mx-auto px-6">
              <div className="max-w-4xl mx-auto text-center">
                {segment.data?.title && (
                  <h2 className="text-4xl font-bold text-gray-900 mb-4">
                    {segment.data.title}
                  </h2>
                )}

                {segment.data?.subtext && (
                  <p className="text-lg text-gray-700 mb-8">
                    {segment.data.subtext}
                  </p>
                )}

                {segment.data?.images && segment.data.images.length > 0 && (
                  <div className="flex flex-wrap justify-center items-center gap-8 mb-8">
                    {segment.data.images.map((image: any) => 
                      image.url ? (
                        <div key={image.id} className="bg-gray-200 rounded-lg p-6 w-48 h-32 flex items-center justify-center">
                          <img
                            src={image.url}
                            alt={image.alt || 'Banner image'}
                            className="max-h-20 max-w-full object-contain grayscale hover:grayscale-0 transition-all duration-300"
                          />
                        </div>
                      ) : null
                    )}
                  </div>
                )}

                {segment.data?.buttonText && segment.data?.buttonLink && (() => {
                  const buttonClasses = 
                    segment.data.buttonStyle === 'technical'
                      ? 'inline-block px-8 py-3 rounded-lg font-semibold transition-all bg-gray-800 text-white hover:bg-gray-900'
                      : segment.data.buttonStyle === 'outline-white'
                      ? 'inline-block px-8 py-3 rounded-lg font-semibold transition-all bg-white text-black border border-gray-300 hover:bg-black hover:text-white'
                      : 'inline-block px-8 py-3 rounded-lg font-semibold transition-all bg-[#f9dc24] text-black hover:bg-[#f9dc24]/90';

                  const buttonLink = segment.data.buttonLink || '#';
                  const isExternal = buttonLink.startsWith('http://') || buttonLink.startsWith('https://');

                  if (isExternal) {
                    return (
                      <a
                        href={buttonLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={buttonClasses}
                      >
                        {segment.data.buttonText}
                      </a>
                    );
                  }

                  return (
                    <Link to={buttonLink} className={buttonClasses}>
                      {segment.data.buttonText}
                    </Link>
                  );
                })()}
              </div>
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
          <section
            key={segmentId}
            id={segmentDbId?.toString()}
            data-segment-key={segment.segment_key || segment.id}
            data-segment-id={segmentDbId?.toString()}
            className="py-20 bg-gray-50"
          >
            <div className="container mx-auto px-6">
              {/* Section Title & Subtext FIRST */}
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
              
              {/* Grid with Items - Each item has integrated image */}
              <div className={`grid gap-8 max-w-7xl mx-auto ${layoutClass}`}>
                {(segment.data?.items || []).map((solution: any, idx: number) => {
                  // Prefer item-level image, fallback to section hero image for first item
                  const imageSrc = solution.imageUrl || (idx === 0 ? segment.data?.heroImageUrl : undefined);
                  const imageAlt = solution.metadata?.altText || solution.title || segment.data?.heroImageMetadata?.altText || segment.data?.title;
                  
                  // Dynamic image height based on layout (1-col needs double height)
                  const imageHeightClass = segment.data?.layout === "1-col" ? "h-[512px]" : "h-64";

                  return (
                    <div key={idx} className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                      {imageSrc && (
                        <div className={`w-full ${imageHeightClass} overflow-hidden`}>
                          <img
                            src={imageSrc}
                            alt={imageAlt || "Section image"}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}
                      <div className="p-8">
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">{solution.title}</h3>
                        <p className="text-gray-600 leading-relaxed">{solution.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        );

      default:
        return null;
    }
  }, [pageSegments, segmentIdMap, fullHeroOverrides, iconMap]);

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

  // Memoize Meta Navigation segment extraction
  const metaNavSegment = useMemo(() => 
    pageSegments.find(seg => seg.type === 'meta-navigation'),
    [pageSegments]
  );
  
  // Memoize isEmpty check
  const isEmpty = useMemo(() => {
    const contentSegments = pageSegments.filter(seg => 
      seg.type !== 'footer' && seg.type !== 'meta-navigation'
    );
    return contentSegments.length === 0;
  }, [pageSegments]);

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
      
      {/* Empty Page Indicator */}
      {isEmpty && (
        <div className="flex items-center justify-center min-h-[60vh] px-4">
          <div className="text-center max-w-2xl">
            <div className="mb-6">
              <div className="w-24 h-24 bg-[#f9dc24] rounded-full mx-auto flex items-center justify-center">
                <span className="text-5xl">📄</span>
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Page Created Successfully</h1>
            <p className="text-xl text-gray-600 mb-6">
              This page has been created and is ready to be configured.
            </p>
            <p className="text-lg text-gray-500">
              Visit the Admin Dashboard to add content segments and customize this page.
            </p>
            <div className="mt-8">
              <Link
                to="/en/admin-dashboard"
                className="inline-flex items-center px-6 py-3 bg-[#f9dc24] text-gray-900 rounded-lg font-semibold hover:bg-yellow-400 transition-colors"
              >
                Go to Admin Dashboard
              </Link>
            </div>
          </div>
        </div>
      )}
      
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
                  
                  {/* Section Hero Image Check */}
                  {seg.data?.heroImageUrl && (
                    <div className="bg-blue-50 p-3 rounded border border-blue-300 mb-3">
                      <div className="font-semibold text-blue-800 mb-2">📸 Section Hero Image (vorhanden)</div>
                      <div className="text-xs break-all mb-2"><strong>URL:</strong> {seg.data.heroImageUrl}</div>
                      <img 
                        src={seg.data.heroImageUrl} 
                        alt="Section Hero"
                        className="w-32 h-32 object-cover border-2 border-blue-500"
                      />
                    </div>
                  )}
                  
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
        <Suspense fallback={<SegmentLoader />}>
          <MetaNavigation
            key={`meta-nav-${metaNavSegment.segment_id}`}
            data={{
              // Support legacy and new data structures
              links: metaNavSegment.data?.navigationItems || metaNavSegment.data?.links || metaNavSegment.navigationItems || []
            }}
            segmentIdMap={segmentIdMap}
          />
        </Suspense>
      )}
      
      {/* Render all other segments in tab order (excluding meta-navigation) */}
      <Suspense fallback={<SegmentLoader />}>
        {tabOrder
          .filter(segmentId => {
            const segment = pageSegments.find(
              s => String(s.id) === String(segmentId) || String(s.segment_key) === String(segmentId)
            );
            return segment?.type !== 'meta-navigation';
          })
          .map((segmentId) => renderSegment(segmentId))
        }
      </Suspense>
      <Footer />
    </div>
  );
};

export default DynamicCMSPage;
