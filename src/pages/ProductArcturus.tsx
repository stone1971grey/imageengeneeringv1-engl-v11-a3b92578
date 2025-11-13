import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, TestTube, Monitor, Play, Car, Lightbulb, Code, Shield, Zap, Eye, Brain, FileText, Download, BarChart3, Smartphone, Heart, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import AnnouncementBanner from "@/components/AnnouncementBanner";
import Footer from "@/components/Footer";
import MetaNavigation from "@/components/segments/MetaNavigation";
import ProductHeroGallery from "@/components/segments/ProductHeroGallery";
import FeatureOverview from "@/components/segments/FeatureOverview";
import Table from "@/components/segments/Table";
import FAQ from "@/components/segments/FAQ";
import { Video } from "@/components/segments/Video";
import Specification from "@/components/segments/Specification";
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

const ProductArcturus = () => {
  const [content, setContent] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [segments, setSegments] = useState<any[]>([]);
  const [tabOrder, setTabOrder] = useState<string[]>([]);
  const [seoData, setSeoData] = useState<any>(null);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      const { data, error } = await supabase
        .from("page_content")
        .select("*")
        .eq("page_slug", "arcturus");

      if (error) throw error;

      if (data) {
        const contentMap: Record<string, string> = {};
        let loadedSegments: any[] = [];
        let loadedTabOrder: string[] = [];

        data.forEach((item) => {
          if (item.section_key === "page_segments") {
            try {
              loadedSegments = JSON.parse(item.content_value);
            } catch (e) {
              console.error("Error parsing page_segments:", e);
            }
          } else if (item.section_key === "tab_order") {
            try {
              loadedTabOrder = JSON.parse(item.content_value);
            } catch (e) {
              console.error("Error parsing tab_order:", e);
            }
          } else if (item.section_key === "seo_config") {
            try {
              setSeoData(JSON.parse(item.content_value));
            } catch (e) {
              console.error("Error parsing seo_config:", e);
            }
          } else {
            contentMap[item.section_key] = item.content_value;
          }
        });

        setContent(contentMap);
        setSegments(loadedSegments);
        setTabOrder(loadedTabOrder);
      }

      setLoading(false);
    } catch (error) {
      console.error("Error loading content:", error);
      setLoading(false);
    }
  };

  const renderSegment = (segment: any) => {
    const segmentData = segment.data;

    switch (segment.type) {
      case "hero":
        return (
          <section key={segment.id} id={segment.id} className={`py-${
            segmentData.hero_top_spacing === 'small' ? '16' :
            segmentData.hero_top_spacing === 'large' ? '32' :
            segmentData.hero_top_spacing === 'extra-large' ? '40' :
            '24'
          }`}>
            <div className="container mx-auto px-4">
              <div className={`grid gap-8 items-center ${
                segmentData.hero_layout_ratio === '1-1' ? 'grid-cols-1 lg:grid-cols-2' :
                segmentData.hero_layout_ratio === '2-3' ? 'lg:grid-cols-[2fr_3fr]' :
                segmentData.hero_layout_ratio === '3-2' ? 'lg:grid-cols-[3fr_2fr]' :
                'lg:grid-cols-[2fr_5fr]'
              } ${segmentData.hero_image_position === 'left' ? 'lg:flex-row-reverse' : ''}`}>
                <div className={segmentData.hero_image_position === 'left' ? 'lg:order-2' : ''}>
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-foreground">
                    {segmentData.hero_title}
                  </h1>
                  {segmentData.hero_subtitle && (
                    <p className="text-xl md:text-2xl text-muted-foreground mb-6">
                      {segmentData.hero_subtitle}
                    </p>
                  )}
                  {segmentData.hero_description && (
                    <p className="text-lg text-muted-foreground mb-8">
                      {segmentData.hero_description}
                    </p>
                  )}
                  {segmentData.hero_cta_text && segmentData.hero_cta_link && (
                    <Button
                      asChild
                      size="lg"
                      className={
                        segmentData.hero_cta_style === 'technical'
                          ? 'bg-[#1f2937] text-white hover:bg-[#1f2937]/90'
                          : 'bg-[#f9dc24] text-black hover:bg-[#f9dc24]/90'
                      }
                    >
                      <Link to={segmentData.hero_cta_link}>{segmentData.hero_cta_text}</Link>
                    </Button>
                  )}
                </div>
                {segmentData.hero_image_url && (
                  <div className={segmentData.hero_image_position === 'left' ? 'lg:order-1' : ''}>
                    <img
                      src={segmentData.hero_image_url}
                      alt={segmentData.hero_image_metadata?.altText || segmentData.hero_title}
                      className="w-full h-auto rounded-lg shadow-lg"
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
            key={segment.id}
            data={segmentData}
          />
        );

      case "product-hero-gallery":
        return (
          <ProductHeroGallery
            key={segment.id}
            id={segment.id}
            data={segmentData}
          />
        );

      case "feature-overview":
        return (
          <FeatureOverview
            key={segment.id}
            id={segment.id}
            title={segmentData.title || ""}
            subtext={segmentData.subtext || ""}
            rows={segmentData.rows || "2"}
            layout={segmentData.layout || "3"}
            items={segmentData.items || []}
          />
        );

      case "table":
        return (
          <Table
            key={segment.id}
            id={segment.id}
            title={segmentData.title || ""}
            subtext={segmentData.subtext || ""}
            headers={segmentData.headers || []}
            rows={segmentData.rows || []}
          />
        );

      case "faq":
        return (
          <FAQ
            key={segment.id}
            id={segment.id}
            title={segmentData.title || ""}
            subtext={segmentData.subtext || ""}
            items={segmentData.items || []}
          />
        );

      case "video":
        return (
          <Video
            key={segment.id}
            id={segment.id}
            data={segmentData}
          />
        );

      case "specification":
        return (
          <Specification
            key={segment.id}
            id={segment.id}
            title={segmentData.title || ""}
            rows={segmentData.rows || []}
          />
        );

      case "tiles":
        return (
          <section key={segment.id} id={segment.id} className="py-20 bg-background">
            <div className="container mx-auto px-4">
              <div className="text-center mb-16">
                <h2 className="text-4xl font-bold mb-4 text-foreground">
                  {segmentData.title || ""}
                </h2>
                {segmentData.description && (
                  <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                    {segmentData.description}
                  </p>
                )}
              </div>

              <div className={`grid gap-8 ${
                segmentData.columns === "2" ? "grid-cols-1 md:grid-cols-2" :
                segmentData.columns === "3" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" :
                segmentData.columns === "4" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-4" :
                "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
              }`}>
                {(segmentData.items || []).map((item: any, index: number) => {
                  const IconComponent = iconMap[item.icon] || FileText;
                  return (
                    <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-2 border-border/50 hover:border-primary/50">
                      <CardContent className="p-8">
                        <div className="flex flex-col items-start gap-4">
                          <div className="w-16 h-16 rounded-xl bg-[#f9dc24] flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                            <IconComponent className="h-8 w-8 text-black" />
                          </div>
                          <h3 className="text-2xl font-bold text-foreground">{item.title}</h3>
                          <p className="text-muted-foreground leading-relaxed">{item.description}</p>
                          {item.ctaText && item.ctaLink && (
                            <Button
                              asChild
                              variant={item.ctaStyle === "technical" ? "outline" : "default"}
                              className={
                                item.ctaStyle === "technical"
                                  ? "w-full bg-[#1f2937] text-white hover:bg-[#1f2937]/90 border-[#1f2937]"
                                  : "w-full bg-[#f9dc24] text-black hover:bg-[#f9dc24]/90"
                              }
                            >
                              <Link to={item.ctaLink}>{item.ctaText}</Link>
                            </Button>
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
          <section key={segment.id} id={segment.id} className="py-20 bg-background">
            <div className="container mx-auto px-4">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold mb-4 text-foreground">
                  {segmentData.title || ""}
                </h2>
                {segmentData.subtext && (
                  <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                    {segmentData.subtext}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap justify-center items-center gap-12 mb-12">
                {(segmentData.images || []).map((image: any, index: number) => (
                  <div
                    key={index}
                    className="grayscale hover:grayscale-0 transition-all duration-300"
                  >
                    <img
                      src={image.imageUrl}
                      alt={image.alt || `Logo ${index + 1}`}
                      className="h-20 w-auto object-contain"
                    />
                  </div>
                ))}
              </div>

              {segmentData.buttonText && segmentData.buttonLink && (
                <div className="text-center">
                  <Button
                    asChild
                    size="lg"
                    variant={segmentData.buttonStyle === "technical" ? "outline" : "default"}
                    className={
                      segmentData.buttonStyle === "technical"
                        ? "bg-[#1f2937] text-white hover:bg-[#1f2937]/90 px-8 py-6 text-lg"
                        : "bg-[#f9dc24] text-black hover:bg-[#f9dc24]/90 px-8 py-6 text-lg"
                    }
                  >
                    <Link to={segmentData.buttonLink}>{segmentData.buttonText}</Link>
                  </Button>
                </div>
              )}
            </div>
          </section>
        );

      case "image-text":
      case "solutions":
        const layoutClass =
          segmentData.layout === "1-col"
            ? "grid-cols-1"
            : segmentData.layout === "2-col"
            ? "grid-cols-1 md:grid-cols-2"
            : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";

        return (
          <section key={segment.id} id={segment.id} className="bg-gray-50 py-20">
            <div className="w-full px-6">
              {(segmentData.title || segmentData.subtext) && (
                <div className="text-center mb-16">
                  {segmentData.title && (
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                      {segmentData.title}
                    </h2>
                  )}
                  {segmentData.subtext && (
                    <p className="text-xl text-gray-600 max-w-4xl mx-auto">
                      {segmentData.subtext}
                    </p>
                  )}
                </div>
              )}

              {(segmentData.items || []).length > 0 && (
                <div className={`grid gap-8 max-w-7xl mx-auto ${layoutClass}`}>
                  {(segmentData.items || []).map((item: any, index: number) => (
                    <Card key={index} className="bg-white border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden">
                      <CardContent className="p-0">
                        {item.imageUrl && (
                          <div className="aspect-[4/3] bg-gray-900 overflow-hidden relative">
                            <img
                              src={item.imageUrl}
                              alt={item.metadata?.altText || item.title}
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

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading Arcturus content...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEOHead
        title={seoData?.title || "Arcturus LED System"}
        description={seoData?.description || "High-performance LED illumination system"}
        canonical={seoData?.canonicalUrl}
        ogTitle={seoData?.ogTitle}
        ogDescription={seoData?.ogDescription}
        ogImage={seoData?.ogImage}
        twitterCard={seoData?.twitterCard}
        robotsIndex={seoData?.robotsIndex}
        robotsFollow={seoData?.robotsFollow}
      />
      <div className="min-h-screen bg-background">
        <Navigation />
        <AnnouncementBanner 
          message="Visit us at IBC 2025"
          ctaText="Learn more"
          ctaLink="#"
          icon="calendar"
        />

        {/* MANDATORY: Meta Navigation - Always First (Below Nav Bar) */}
        {tabOrder
          .filter(segmentId => {
            const segment = segments.find((s) => s.id === segmentId);
            return segment && segment.type === 'meta-navigation';
          })
          .map((segmentId) => {
            const segment = segments.find((s) => s.id === segmentId);
            return segment ? renderSegment(segment) : null;
          })}

        {/* Render other segments (excluding meta-navigation) based on tab_order */}
        {tabOrder.map((segmentId) => {
            // Handle dynamic segments
            const segment = segments.find((s) => s.id === segmentId);
            if (segment && segment.type !== 'meta-navigation') {
              return renderSegment(segment);
            }
            return null;
          })}

        <Footer />
      </div>
    </>
  );
};

export default ProductArcturus;
