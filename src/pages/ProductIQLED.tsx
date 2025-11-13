import { useState, useEffect } from "react";
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

const ProductIQLED = () => {
  const [pageSegments, setPageSegments] = useState<any[]>([]);
  const [segmentIdMap, setSegmentIdMap] = useState<Record<string, number>>({});
  const [seoData, setSeoData] = useState<any>({});
  const [loading, setLoading] = useState(true);

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
      let segments: any[] = [];

      data.forEach((item: any) => {
        if (item.section_key === "page_segments") {
          segments = JSON.parse(item.content_value);
        } else if (item.section_key === "seo_settings") {
          try {
            const seoSettings = JSON.parse(item.content_value);
            setSeoData(seoSettings);
          } catch {
            // Keep empty seo data
          }
        }
      });

      setPageSegments(segments);
    }
    setLoading(false);
  };

  const renderSegment = (segment: any) => {
    if (!segment || !segment.type) return null;

    switch (segment.type) {
      case 'meta-navigation':
        return <MetaNavigation key={segment.id} data={segment.data} segmentIdMap={segmentIdMap} />;
      case 'product-hero-gallery':
        return <ProductHeroGallery key={segment.id} id={segment.id} data={segment.data} />;
      case 'feature-overview':
        return <FeatureOverview key={segment.id} id={segment.id} {...segment.data} />;
      case 'specification':
        return <Specification key={segment.id} id={segment.id} {...segment.data} />;
      case 'table':
        return <Table key={segment.id} id={segment.id} {...segment.data} />;
      case 'video':
        return <Video key={segment.id} id={segment.id} data={segment.data} />;
      case 'faq':
        return <FAQ key={segment.id} id={segment.id} {...segment.data} />;
      default:
        return null;
    }
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
        
        {pageSegments.map((segment) => renderSegment(segment))}
        
        <Footer />
      </div>
    </>
  );
};

export default ProductIQLED;
