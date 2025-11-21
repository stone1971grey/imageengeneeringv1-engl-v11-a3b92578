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
            // Filter tab_order to only include valid segments
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
        setContent(contentMap);
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
        return <IndustriesSegment key={segmentId} title={segment.data?.title} subtitle={segment.data?.subtitle} columns={segment.data?.columns} items={segment.data?.items || []} />;
      case "banner":
        return <NewsSegment key={segmentId} id={stringSegmentId} sectionTitle={segment.data?.sectionTitle} sectionDescription={segment.data?.sectionDescription} articleLimit={segment.data?.articleLimit} categories={segment.data?.categories} />;
      case "image-text":
      case "solutions":
        return <Intro key={segmentId} title={segment.data?.title} description={segment.data?.description} />;
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
