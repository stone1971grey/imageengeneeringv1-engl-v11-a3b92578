import { useState, useEffect } from "react";
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
import { Loader2 } from "lucide-react";

interface DynamicCMSPageProps {
  pageSlug: string;
}

const DynamicCMSPage = ({ pageSlug }: DynamicCMSPageProps) => {
  const [content, setContent] = useState<Record<string, string>>({});
  const [pageSegments, setPageSegments] = useState<any[]>([]);
  const [tabOrder, setTabOrder] = useState<string[]>([]);
  const [segmentIdMap, setSegmentIdMap] = useState<Record<string, number>>({});
  const [seoData, setSeoData] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContent();
  }, [pageSlug]);

  const loadContent = async () => {
    try {
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
        const contentMap: Record<string, string> = {};

        data.forEach((item: any) => {
          if (item.section_key === "page_segments") {
            const segments = JSON.parse(item.content_value);
            segments.forEach((segment: any) => {
              const segmentDataItem = data.find((d: any) => d.section_key === segment.id);
              if (segmentDataItem) {
                segment.data = JSON.parse(segmentDataItem.content_value);
              }
            });
            setPageSegments(segments);
          } else if (item.section_key === "tab_order") {
            const parsedTabOrder = JSON.parse(item.content_value);
            const validTabOrder = parsedTabOrder.filter((id: any) => 
              segmentData?.some(seg => seg.segment_id.toString() === id.toString() || seg.segment_key === id)
            );
            setTabOrder(validTabOrder);
          } else if (item.section_key === "seo_data") {
            setSeoData(JSON.parse(item.content_value));
          } else {
            contentMap[item.section_key] = item.content_value;
          }
        });
        
        // Check for legacy static segments that are NOT in page_segments
        const existingSegmentIds = new Set(
          (pageSegments.length > 0 ? pageSegments : []).map((s: any) => s.id)
        );
        
        const legacySegments: any[] = [];
        segmentData?.forEach((seg: any) => {
          // Only load legacy data if segment is not already in page_segments
          if (!existingSegmentIds.has(seg.segment_key) && seg.segment_type !== 'footer') {
            const legacyData: any = {};
            
            if (seg.segment_type === 'hero') {
              legacyData.title = contentMap.hero_title;
              legacyData.subtitle = contentMap.hero_subtitle;
              legacyData.description = contentMap.hero_description;
              legacyData.imageUrl = contentMap.hero_image_url;
              legacyData.imagePosition = contentMap.hero_image_position;
              legacyData.layoutRatio = contentMap.hero_layout;
              legacyData.topSpacing = contentMap.hero_top_padding;
              legacyData.ctaText = contentMap.hero_cta_text;
              legacyData.ctaLink = contentMap.hero_cta_link;
              legacyData.ctaStyle = contentMap.hero_cta_style;
            }
            
            if (seg.segment_type === 'tiles') {
              legacyData.title = contentMap.applications_title;
              legacyData.subtitle = contentMap.applications_description;
              try {
                legacyData.items = JSON.parse(contentMap.applications_items || '[]');
              } catch (e) {
                legacyData.items = [];
              }
              legacyData.columns = contentMap.tiles_columns || 3;
            }
            
            if (seg.segment_type === 'banner') {
              legacyData.sectionTitle = contentMap.banner_title;
              legacyData.sectionDescription = contentMap.banner_subtext;
              try {
                legacyData.bannerImages = JSON.parse(contentMap.banner_images || '[]');
              } catch (e) {
                legacyData.bannerImages = [];
              }
              legacyData.bannerButtonText = contentMap.banner_button_text;
              legacyData.bannerButtonLink = contentMap.banner_button_link;
              legacyData.bannerButtonStyle = contentMap.banner_button_style;
            }
            
            if (seg.segment_type === 'solutions') {
              legacyData.title = contentMap.solutions_title;
              legacyData.description = contentMap.solutions_subtext;
              legacyData.solutionsLayout = contentMap.solutions_layout;
              try {
                legacyData.solutionsItems = JSON.parse(contentMap.solutions_items || '[]');
              } catch (e) {
                legacyData.solutionsItems = [];
              }
            }
            
            // Only add if there's actual data
            if (Object.keys(legacyData).length > 0) {
              legacySegments.push({
                id: seg.segment_key,
                type: seg.segment_type,
                data: legacyData
              });
            }
          }
        });
        
        // Merge legacy segments with dynamic segments
        if (legacySegments.length > 0) {
          setPageSegments(prev => [...prev, ...legacySegments]);
        }
      }
    } catch (error) {
      console.error("Error loading content:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderSegment = (segmentId: string) => {
    const segment = pageSegments.find(
      (seg) => seg.id === segmentId || seg.id === segmentId.toString()
    );

    if (!segment) return null;

    const numericSegmentId = segmentIdMap[segmentId] || parseInt(segmentId);
    const stringSegmentId = numericSegmentId.toString();

    switch (segment.type) {
      case "hero":
        // Hero rendering with legacy data support
        if (segment.data?.title || segment.data?.subtitle) {
          const topPaddingClass = {
            'small': 'pt-16',
            'medium': 'pt-24',
            'large': 'pt-32',
            'extra-large': 'pt-40'
          }[segment.data?.topSpacing || 'medium'] || 'pt-24';
          
          const layoutRatioClass = {
            '1-1': 'lg:grid-cols-2',
            '2-3': 'lg:grid-cols-5',
            '2-5': 'lg:grid-cols-7'
          }[segment.data?.layoutRatio || '2-5'] || 'lg:grid-cols-7';
          
          const textColClass = {
            '1-1': 'lg:col-span-1',
            '2-3': 'lg:col-span-2',
            '2-5': 'lg:col-span-3'
          }[segment.data?.layoutRatio || '2-5'] || 'lg:col-span-3';
          
          const imageColClass = {
            '1-1': 'lg:col-span-1',
            '2-3': 'lg:col-span-3',
            '2-5': 'lg:col-span-4'
          }[segment.data?.layoutRatio || '2-5'] || 'lg:col-span-4';
          
          return (
            <section key={segmentId} id={stringSegmentId} className={`min-h-[60vh] bg-white font-roboto relative overflow-hidden py-8 ${topPaddingClass}`}>
              <div className="container mx-auto px-6 py-16 lg:py-24 pb-8 lg:pb-12 relative z-10">
                <div className={`grid ${layoutRatioClass} gap-16 items-center ${segment.data?.imagePosition === 'left' ? 'flex-row-reverse' : ''}`}>
                  <div className={`${textColClass} space-y-8 ${segment.data?.imagePosition === 'left' ? 'order-2' : 'order-1'}`}>
                    <div>
                      <h1 className="text-5xl lg:text-6xl xl:text-7xl font-light leading-[0.9] tracking-tight mb-6 text-black">
                        {segment.data.title}
                      </h1>
                      {segment.data.subtitle && (
                        <p className="text-xl lg:text-2xl text-black font-light leading-relaxed max-w-lg">
                          {segment.data.subtitle}
                        </p>
                      )}
                    </div>
                    {segment.data.ctaText && segment.data.ctaLink && (
                      <div className="pt-4">
                        <a href={segment.data.ctaLink}>
                          <button 
                            className={
                              segment.data.ctaStyle === "technical"
                                ? "bg-[#1f2937] text-white hover:bg-[#1f2937]/90 px-8 py-4 text-lg font-medium rounded-md"
                                : "bg-[#f9dc24] text-black hover:bg-[#f9dc24]/90 px-8 py-4 text-lg font-medium rounded-md"
                            }
                          >
                            {segment.data.ctaText}
                          </button>
                        </a>
                      </div>
                    )}
                  </div>
                  {segment.data.imageUrl && (
                    <div className={`${imageColClass} relative ${segment.data?.imagePosition === 'left' ? 'order-1' : 'order-2'}`}>
                      <img 
                        src={segment.data.imageUrl} 
                        alt={segment.data.title || "Hero image"} 
                        className="w-full h-auto rounded-lg shadow-lg"
                      />
                    </div>
                  )}
                </div>
              </div>
            </section>
          );
        }
        return null;
      case "meta-navigation":
        return <MetaNavigation key={segmentId} data={segment.data || { links: [] }} segmentIdMap={segmentIdMap} />;
      case "product-hero-gallery":
        return <ProductHeroGallery key={segmentId} data={segment.data || {}} />;
      case "feature-overview":
        return <FeatureOverview key={segmentId} id={stringSegmentId} title={segment.data?.title} subtext={segment.data?.subtext} layout={segment.data?.layout} rows={segment.data?.rows} items={segment.data?.items || []} />;
      case "table":
        return <Table key={segmentId} id={stringSegmentId} title={segment.data?.title} subtext={segment.data?.subtext} headers={segment.data?.headers || []} rows={segment.data?.rows || []} />;
      case "faq":
        return <FAQ key={segmentId} id={stringSegmentId} title={segment.data?.title} subtext={segment.data?.subtext} items={segment.data?.items || []} />;
      case "specification":
        return <Specification key={segmentId} id={stringSegmentId} title={segment.data?.title} rows={segment.data?.rows || []} />;
      case "video":
        return <Video key={segmentId} id={stringSegmentId} data={segment.data || {}} />;
      case "full-hero":
        return (
          <FullHero
            key={segmentId}
            titleLine1={segment.data?.titleLine1 || ""}
            titleLine2={segment.data?.titleLine2 || ""}
            subtitle={segment.data?.subtitle || ""}
            backgroundType={segment.data?.backgroundType || "image"}
            button1Text={segment.data?.button1Text}
            button1Link={segment.data?.button1Link}
            button1Color={segment.data?.button1Color}
            button2Text={segment.data?.button2Text}
            button2Link={segment.data?.button2Link}
            button2Color={segment.data?.button2Color}
          />
        );
      case "tiles":
        return <IndustriesSegment key={segmentId} title={segment.data?.title} subtitle={segment.data?.subtitle} columns={parseInt(segment.data?.columns || "3")} items={segment.data?.items || []} />;
      case "banner":
        // Check if it's legacy banner with images or new NewsSegment
        if (segment.data?.bannerImages || segment.data?.bannerButtonText) {
          // Legacy banner structure
          return (
            <section key={segmentId} id={stringSegmentId} className="py-20 bg-gray-50">
              <div className="container mx-auto px-4">
                {segment.data?.sectionTitle && (
                  <h2 className="text-4xl font-bold text-center mb-4">{segment.data.sectionTitle}</h2>
                )}
                {segment.data?.sectionDescription && (
                  <p className="text-center text-lg text-gray-600 mb-12 max-w-2xl mx-auto">
                    {segment.data.sectionDescription}
                  </p>
                )}
                {segment.data?.bannerImages && segment.data.bannerImages.length > 0 && (
                  <div className="flex flex-wrap justify-center items-center gap-12 mb-12">
                    {segment.data.bannerImages.map((img: any, index: number) => (
                      <div key={index} className="grayscale hover:grayscale-0 transition-all duration-500">
                        <img
                          src={img.url || img.imageUrl}
                          alt={img.alt || img.altText || "Partner logo"}
                          className="h-20 object-contain"
                        />
                      </div>
                    ))}
                  </div>
                )}
                {segment.data?.bannerButtonText && segment.data?.bannerButtonLink && (
                  <div className="text-center">
                    <a href={segment.data.bannerButtonLink}>
                      <button 
                        className={
                          segment.data.bannerButtonStyle === "technical"
                            ? "bg-[#1f2937] text-white hover:bg-[#1f2937]/90 px-8 py-3 rounded-md"
                            : "bg-[#f9dc24] text-black hover:bg-[#f9dc24]/90 px-8 py-3 rounded-md"
                        }
                      >
                        {segment.data.bannerButtonText}
                      </button>
                    </a>
                  </div>
                )}
              </div>
            </section>
          );
        } else {
          // New NewsSegment structure
          return <NewsSegment key={segmentId} id={stringSegmentId} sectionTitle={segment.data?.sectionTitle} sectionDescription={segment.data?.sectionDescription} articleLimit={segment.data?.articleLimit} categories={segment.data?.categories} />;
        }
      case "image-text":
      case "solutions":
        // Check if it's legacy solutions structure or new Intro
        if (segment.data?.solutionsItems || segment.data?.solutionsLayout) {
          // Legacy solutions structure
          const layout = segment.data?.solutionsLayout || "2-col";
          const items = segment.data?.solutionsItems || [];
          
          const getGridClass = () => {
            switch(layout) {
              case "1-col": return "grid-cols-1";
              case "2-col": return "grid-cols-1 md:grid-cols-2";
              case "3-col": return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
              default: return "grid-cols-1 md:grid-cols-2";
            }
          };
          
          return (
            <section key={segmentId} id={stringSegmentId} className="py-20 bg-white">
              <div className="grid gap-8 max-w-7xl mx-auto grid-cols-1 px-4">
                {segment.data?.title && (
                  <h2 className="text-4xl font-bold mb-4">{segment.data.title}</h2>
                )}
                {segment.data?.description && (
                  <p className="text-lg text-gray-600 mb-8">{segment.data.description}</p>
                )}
                <div className={`grid ${getGridClass()} gap-8`}>
                  {items.map((item: any, index: number) => (
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
        } else {
          // New Intro structure
          return <Intro key={segmentId} title={segment.data?.title} description={segment.data?.description} />;
        }
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <SEOHead
        title={seoData?.title || ""}
        description={seoData?.description || ""}
      />
      <Navigation />
      {tabOrder.map((segmentId) => renderSegment(segmentId))}
      <Footer />
    </div>
  );
};

export default DynamicCMSPage;
