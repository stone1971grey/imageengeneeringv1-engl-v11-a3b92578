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
import FullHero from "@/components/segments/FullHero";
import Intro from "@/components/segments/Intro";
import IndustriesSegment from "@/components/segments/IndustriesSegment";
import NewsSegment from "@/components/segments/NewsSegment";
import { SEOHead } from "@/components/SEOHead";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";

const ISO21550 = () => {
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
      .eq("page_slug", "iso-21550");

    const { data: segmentData } = await supabase
      .from("segment_registry")
      .select("*")
      .eq("page_slug", "iso-21550")
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
            const seoSettings = JSON.parse(item.content_value);
            setSeoData(seoSettings);
          } catch {
            // Keep empty
          }
        }
      });
    }

    setLoading(false);
  };

  const renderSegment = (segmentId: string) => {
    const segment = pageSegments.find(seg => seg.id === segmentId);
    if (!segment) return null;

    const numericId = segmentIdMap[segmentId] || segmentId;

    switch (segment.type) {
      case 'meta-navigation':
        return <MetaNavigation key={segmentId} data={segment.data} segmentIdMap={segmentIdMap} />;
      case 'product-hero-gallery':
        return <ProductHeroGallery key={segmentId} id={String(numericId)} data={segment.data} />;
      case 'feature-overview':
        return <FeatureOverview key={segmentId} id={String(numericId)} {...segment.data} />;
      case 'table':
        return <Table key={segmentId} id={String(numericId)} {...segment.data} />;
      case 'faq':
        return <FAQ key={segmentId} id={String(numericId)} {...segment.data} />;
      case 'specification':
        return <Specification key={segmentId} id={String(numericId)} {...segment.data} />;
      case 'video':
        return <Video key={segmentId} id={String(numericId)} {...segment.data} />;
      case 'full-hero':
        return <FullHero key={segmentId} {...segment.data} />;
      case 'hero':
        return (
          <section key={segmentId} id={String(numericId)} className={`relative py-16 ${segment.data?.topPadding === 'small' ? 'pt-16' : segment.data?.topPadding === 'medium' ? 'pt-24' : segment.data?.topPadding === 'large' ? 'pt-32' : 'pt-40'}`}>
            <div className="container mx-auto px-6">
              <div className={`grid gap-12 items-center ${segment.data?.imagePosition === 'left' ? 'md:grid-cols-2' : segment.data?.imagePosition === 'right' ? 'md:grid-cols-2' : 'grid-cols-1'}`}>
                {segment.data?.imagePosition === 'left' && segment.data?.imageUrl && (
                  <div className="order-1">
                    <img src={segment.data.imageUrl} alt={segment.data.title} className="w-full h-auto rounded-lg shadow-lg" />
                  </div>
                )}
                <div className={segment.data?.imagePosition === 'left' ? 'order-2' : segment.data?.imagePosition === 'right' ? 'order-1' : 'text-center max-w-4xl mx-auto'}>
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">{segment.data?.title}</h1>
                  <p className="text-xl text-gray-600 mb-8">{segment.data?.subtitle}</p>
                  {segment.data?.ctaText && (
                    <a href={segment.data.ctaLink} className="inline-block px-8 py-4 rounded-md text-lg font-medium transition-all duration-300" style={{
                      backgroundColor: segment.data.ctaStyle === "technical" ? "#1f2937" : "#f9dc24",
                      color: segment.data.ctaStyle === "technical" ? "#ffffff" : "#000000"
                    }}>
                      {segment.data.ctaText}
                    </a>
                  )}
                </div>
                {segment.data?.imagePosition === 'right' && segment.data?.imageUrl && (
                  <div className="order-2">
                    <img src={segment.data.imageUrl} alt={segment.data.title} className="w-full h-auto rounded-lg shadow-lg" />
                  </div>
                )}
                {segment.data?.imagePosition === 'center' && segment.data?.imageUrl && (
                  <div className="w-full max-w-4xl mx-auto mt-12">
                    <img src={segment.data.imageUrl} alt={segment.data.title} className="w-full h-auto rounded-lg shadow-lg" />
                  </div>
                )}
              </div>
            </div>
          </section>
        );
      case 'intro':
        return <Intro key={segmentId} {...segment.data} />;
      case 'industries':
        return <IndustriesSegment key={segmentId} {...segment.data} />;
      case 'news':
        return (
          <NewsSegment
            key={segmentId}
            id={String(numericId)}
            sectionTitle={segment.data?.sectionTitle}
            sectionDescription={segment.data?.sectionDescription}
            articleLimit={parseInt(segment.data?.articleLimit || "6")}
            categories={segment.data?.categories || []}
          />
        );
      case 'tiles':
        return (
          <section key={segmentId} id={String(numericId)} className="py-8 bg-gray-50">
            <div className="container mx-auto px-6">
              <div className="text-center mb-16">
                {segment.data?.title && (
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                    {segment.data.title}
                  </h2>
                )}
                {segment.data?.description && (
                  <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                    {segment.data.description}
                  </p>
                )}
              </div>
              <div className={`grid gap-8 max-w-7xl mx-auto ${
                segment.data?.columns === "2" ? "md:grid-cols-2" :
                segment.data?.columns === "4" ? "md:grid-cols-2 lg:grid-cols-4" :
                "md:grid-cols-2 lg:grid-cols-3"
              }`}>
                {segment.data?.items?.map((item: any, index: number) => (
                  <Card key={index} className="bg-white border-gray-200 hover:shadow-lg transition-shadow duration-300">
                    <CardContent className="p-8">
                      <h3 className="text-2xl font-bold text-gray-900 mb-4">{item.title}</h3>
                      <p className="text-gray-600 leading-relaxed mb-6">{item.description}</p>
                      {item.ctaText && item.ctaLink && (
                        item.ctaLink.startsWith('http') ? (
                          <a
                            href={item.ctaLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block px-6 py-3 rounded-md text-base font-medium transition-all duration-300"
                            style={{
                              backgroundColor: item.ctaStyle === "technical" ? "#1f2937" : "#f9dc24",
                              color: item.ctaStyle === "technical" ? "#ffffff" : "#000000"
                            }}
                          >
                            {item.ctaText}
                          </a>
                        ) : (
                          <Link to={item.ctaLink}>
                            <button
                              className="px-6 py-3 rounded-md text-base font-medium transition-all duration-300"
                              style={{
                                backgroundColor: item.ctaStyle === "technical" ? "#1f2937" : "#f9dc24",
                                color: item.ctaStyle === "technical" ? "#ffffff" : "#000000"
                              }}
                            >
                              {item.ctaText}
                            </button>
                          </Link>
                        )
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        );
      case 'banner':
        return (
          <section key={segmentId} id={String(numericId)} className="py-16" style={{ backgroundColor: '#f3f3f5' }}>
            <div className="container mx-auto px-4 text-center">
              {segment.data?.title && (
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  {segment.data.title}
                </h2>
              )}
              {segment.data?.subtext && (
                <p className="text-lg text-gray-600 mb-12 max-w-2xl mx-auto">
                  {segment.data.subtext}
                </p>
              )}
              {segment.data?.images?.length > 0 && (
                <div className="flex flex-wrap justify-center items-center gap-8 mb-12">
                  {segment.data.images.map((image: any, idx: number) => (
                    <div key={idx} className="h-16 flex items-center">
                      <img 
                        src={image.url}
                        alt={image.alt || `Banner image ${idx + 1}`}
                        className="max-h-full max-w-full object-contain filter grayscale hover:grayscale-0 transition-all duration-300"
                      />
                    </div>
                  ))}
                </div>
              )}
              {segment.data?.buttonText && (
                <div className="flex justify-center">
                  {segment.data.buttonLink?.startsWith('http') ? (
                    <a
                      href={segment.data.buttonLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block px-8 py-4 rounded-md text-lg font-medium transition-all duration-300"
                      style={{
                        backgroundColor: segment.data.buttonStyle === "technical" ? "#1f2937" : "#f9dc24",
                        color: segment.data.buttonStyle === "technical" ? "#ffffff" : "#000000"
                      }}
                    >
                      {segment.data.buttonText}
                    </a>
                  ) : (
                    <Link to={segment.data.buttonLink || "#"}>
                      <button
                        className="px-8 py-4 rounded-md text-lg font-medium transition-all duration-300"
                        style={{
                          backgroundColor: segment.data.buttonStyle === "technical" ? "#1f2937" : "#f9dc24",
                          color: segment.data.buttonStyle === "technical" ? "#ffffff" : "#000000"
                        }}
                      >
                        {segment.data.buttonText}
                      </button>
                    </Link>
                  )}
                </div>
              )}
            </div>
          </section>
        );
      case 'image-text':
      case 'solutions':
        return (
          <section key={segmentId} id={String(numericId)} className="bg-gray-50 py-20">
            <div className="w-full px-6">
              {(segment.data?.title || segment.data?.subtext) && (
                <div className="text-center mb-16">
                  {segment.data?.title && (
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                      {segment.data.title}
                    </h2>
                  )}
                  {segment.data?.subtext && (
                    <p className="text-xl text-gray-600 max-w-4xl mx-auto">
                      {segment.data.subtext}
                    </p>
                  )}
                </div>
              )}
              {segment.data?.items?.length > 0 && (
                <div className={`grid gap-8 max-w-7xl mx-auto ${
                  segment.data.layout === "1-col" ? "grid-cols-1" :
                  segment.data.layout === "2-col" ? "grid-cols-1 md:grid-cols-2" :
                  "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                }`}>
                  {segment.data.items.map((item: any, idx: number) => (
                    <Card key={idx} className="bg-white border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden">
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
      case 'footer':
        return <Footer key={segmentId} />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SEOHead 
        title={seoData?.title || "ISO 21550"}
        description={seoData?.description || ""}
        ogImage={seoData?.ogImage || ""}
        canonical={seoData?.canonicalUrl || ""}
      />
      <Navigation />
      <main>
        {tabOrder.map(segmentId => renderSegment(segmentId))}
      </main>
    </div>
  );
};

export default ISO21550;
