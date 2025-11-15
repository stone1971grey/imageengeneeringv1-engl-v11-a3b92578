import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, Lightbulb, Code, Shield, Zap, Eye, Car, Smartphone, Grid, BarChart, Settings } from "lucide-react";
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
import { SEOHead } from "@/components/SEOHead";
import { supabase } from "@/integrations/supabase/client";

const iconMap: Record<string, any> = {
  Camera, Lightbulb, Code, Shield, Zap, Eye, Car, Smartphone, Grid, BarChart, Settings,
};

interface TileItem {
  title: string;
  description: string;
  ctaLink: string;
  ctaStyle: string;
  ctaText: string;
  imageUrl: string;
  icon: string;
}

interface PageSegment {
  id: string;
  type: string;
  position: number | null;
  data: any;
}

const CMSPage = () => {
  const { pageSlug, parentSlug } = useParams<{ pageSlug: string; parentSlug?: string }>();
  // For 3-level URLs like /your-solution/scanners-archiving/universal-test-target
  // pageSlug will be "universal-test-target", parentSlug will be "scanners-archiving"
  // We want the actual page slug which is the last segment
  const actualPageSlug = pageSlug || '';
  
  console.log('CMSPage params:', { pageSlug, parentSlug, actualPageSlug });
  
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState<Record<string, string>>({});
  const [applications, setApplications] = useState<TileItem[]>([]);
  const [hasHeroContent, setHasHeroContent] = useState(false);
  const [heroTopPadding, setHeroTopPadding] = useState<string>("medium");
  const [heroLayout, setHeroLayout] = useState<string>("2-5");
  const [heroImagePosition, setHeroImagePosition] = useState<string>("right");
  const [tilesColumns, setTilesColumns] = useState<string>("3");
  const [pageSegments, setPageSegments] = useState<PageSegment[]>([]);
  const [tabOrder, setTabOrder] = useState<string[]>([]);
  const [segmentIdMap, setSegmentIdMap] = useState<Record<string, number>>({});

  useEffect(() => {
    console.log('CMSPage useEffect triggered, actualPageSlug:', actualPageSlug);
    if (actualPageSlug) {
      loadContent();
    } else {
      console.error('No actualPageSlug found!');
      setLoading(false);
    }
  }, [actualPageSlug]);

  const loadContent = async () => {
    console.log('loadContent called for:', actualPageSlug);
    setLoading(true);

    const { data: contentData, error: contentError } = await supabase
      .from("page_content")
      .select("*")
      .eq("page_slug", actualPageSlug);

    console.log('Content data:', contentData, 'Error:', contentError);

    const { data: segmentRegistryData, error: segmentError } = await supabase
      .from("segment_registry")
      .select("*")
      .eq("page_slug", actualPageSlug)
      .eq("deleted", false)
      .order("position", { ascending: true });

    console.log('Segment data:', segmentRegistryData, 'Error:', segmentError);

    if (contentData && segmentRegistryData) {
      const contentMap: Record<string, string> = {};
      contentData.forEach((item) => {
        contentMap[item.section_key] = item.content_value;
      });

      const idMap: Record<string, number> = {};
      segmentRegistryData.forEach((seg) => {
        idMap[seg.segment_key] = seg.segment_id;
      });
      setSegmentIdMap(idMap);

      let apps: TileItem[] = [];
      if (contentMap.tiles_items) {
        try { apps = JSON.parse(contentMap.tiles_items); } catch { apps = []; }
      }

      const heroExists = !!(contentMap.hero_title || contentMap.hero_subtitle);
      setHeroTopPadding(contentMap.hero_top_padding || "medium");
      setHeroLayout(contentMap.hero_layout || "2-5");
      setHeroImagePosition(contentMap.hero_image_position || "right");
      setTilesColumns(contentMap.tiles_columns || "3");

      const segments: PageSegment[] = [];
      for (const seg of segmentRegistryData) {
        const segmentData: any = {};
        const segmentPrefix = seg.segment_key;
        Object.keys(contentMap).forEach((key) => {
          if (key.startsWith(segmentPrefix + "_")) {
            const fieldName = key.substring(segmentPrefix.length + 1);
            let value: any = contentMap[key];
            if (["links", "items", "faqs", "rows", "images", "cards", "specifications"].includes(fieldName)) {
              try { value = JSON.parse(value) || []; } catch { value = []; }
            }
            segmentData[fieldName] = value;
          }
        });

        segments.push({
          id: seg.segment_id.toString(),
          type: seg.segment_type,
          position: seg.position,
          data: segmentData,
        });
      }

      setPageSegments(segments);
      const tabs = segments.filter((seg) => seg.position !== null && seg.position > 0).sort((a, b) => (a.position || 0) - (b.position || 0)).map((seg) => seg.id);
      setTabOrder(tabs);
      setContent(contentMap);
      setApplications(apps);
      setHasHeroContent(heroExists);
    }
    setLoading(false);
  };

  const renderSegment = (segmentId: string) => {
    const dynamicSegment = pageSegments.find((seg) => seg.id === segmentId);
    if (!dynamicSegment) return null;

    if (dynamicSegment.type === "meta-navigation") return <MetaNavigation key={segmentId} data={dynamicSegment.data} segmentIdMap={segmentIdMap} />;
    if (dynamicSegment.type === "product-hero-gallery") return <ProductHeroGallery key={segmentId} id={segmentId} data={dynamicSegment.data} />;
    if (dynamicSegment.type === "feature-overview") return <FeatureOverview key={segmentId} id={segmentId} {...dynamicSegment.data} />;
    if (dynamicSegment.type === "table") return <Table key={segmentId} id={segmentId} {...dynamicSegment.data} />;
    if (dynamicSegment.type === "faq") return <FAQ key={segmentId} id={segmentId} {...dynamicSegment.data} />;
    if (dynamicSegment.type === "video") return <Video key={segmentId} id={segmentId} data={dynamicSegment.data} />;
    if (dynamicSegment.type === "specification") return <Specification key={segmentId} id={segmentId} {...dynamicSegment.data} />;
    if (dynamicSegment.type === "full-hero") return <FullHero key={segmentId} {...dynamicSegment.data} />;
    if (dynamicSegment.type === "intro") return <Intro key={segmentId} id={segmentId} {...dynamicSegment.data} />;
    if (dynamicSegment.type === "industries") return <IndustriesSegment key={segmentId} id={segmentId} {...dynamicSegment.data} />;
    return null;
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div></div>;
  }

  const getLayoutClasses = (layout: string) => ({ "1-1": "lg:grid-cols-2", "2-5": "lg:grid-cols-[2fr_5fr]", "5-2": "lg:grid-cols-[5fr_2fr]", "1-2": "lg:grid-cols-[1fr_2fr]", "2-1": "lg:grid-cols-[2fr_1fr]" }[layout] || "lg:grid-cols-2");
  const getPaddingClass = (padding: string) => ({ none: "pt-0", small: "pt-8 lg:pt-12", medium: "pt-16 lg:pt-24", large: "pt-24 lg:pt-32", xlarge: "pt-32 lg:pt-40" }[padding] || "pt-16 lg:pt-24");

  return (
    <div className="min-h-screen bg-white font-roboto">
      <SEOHead title={content.seo_title || content.hero_title || "Page"} description={content.seo_description || content.hero_subtitle || ""} canonical={content.seo_canonical || ""} ogImage={content.seo_og_image || content.hero_image || ""} />
      <Navigation />
      {tabOrder.filter((segmentId) => { const seg = pageSegments.find((s) => s.id === segmentId); return seg && seg.type === "meta-navigation"; }).map((segmentId) => renderSegment(segmentId))}
      {pageSegments.filter((seg) => seg.position === 0).map((seg) => renderSegment(seg.id))}
      {hasHeroContent && (
        <section id="hero" className={`min-h-[60vh] bg-white relative overflow-hidden py-8 ${getPaddingClass(heroTopPadding)}`}>
          <div className="container mx-auto px-6 pb-8 lg:pb-12 relative z-10">
            <div className={`grid ${getLayoutClasses(heroLayout)} gap-8 lg:gap-12 items-center`}>
              {heroImagePosition === "left" && content.hero_image && <div className="order-1"><img src={content.hero_image} alt={content.hero_title} className="w-full h-auto rounded-lg shadow-2xl" /></div>}
              <div className={heroImagePosition === "left" ? "order-2" : "order-1"}>
                <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">{content.hero_title}</h1>
                {content.hero_subtitle && <p className="text-xl lg:text-2xl text-gray-700 mb-8">{content.hero_subtitle}</p>}
                {content.hero_description && <p className="text-lg text-gray-600 mb-8">{content.hero_description}</p>}
                {content.hero_cta && content.hero_cta_link && <a href={content.hero_cta_link} className="bg-[#f9dc24] text-black hover:bg-[#e5ca1f] px-8 py-6 text-lg font-semibold rounded-lg transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl">{content.hero_cta}</a>}
              </div>
              {heroImagePosition === "right" && content.hero_image && <div className="order-2"><img src={content.hero_image} alt={content.hero_title} className="w-full h-auto rounded-lg shadow-2xl" /></div>}
            </div>
          </div>
        </section>
      )}
      <div id="applications-start" className="scroll-mt-32"></div>
      {content.tiles_title && applications.length > 0 && (
        <section className="py-16 lg:py-24 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-4">{content.tiles_title}</h2>
              {content.tiles_description && <p className="text-xl text-gray-600 max-w-3xl mx-auto">{content.tiles_description}</p>}
            </div>
            <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${tilesColumns} gap-8`}>
              {applications.map((item, index) => {
                const IconComponent = iconMap[item.icon] || Lightbulb;
                return (
                  <Card key={index} className="hover:shadow-xl transition-shadow">
                    <CardContent className="p-6">
                      {item.imageUrl ? <img src={item.imageUrl} alt={item.title} className="w-full h-48 object-cover rounded-lg mb-4" /> : <div className="flex justify-center mb-4"><IconComponent className="h-12 w-12 text-gray-700" /></div>}
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                      <p className="text-gray-600 mb-4">{item.description}</p>
                      {item.ctaText && item.ctaLink && <Link to={item.ctaLink}><Button>{item.ctaText}</Button></Link>}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>
      )}
      {tabOrder.filter((segmentId) => { const seg = pageSegments.find((s) => s.id === segmentId); return seg && seg.type !== "meta-navigation"; }).map((segmentId) => renderSegment(segmentId))}
      <Footer />
    </div>
  );
};

export default CMSPage;
