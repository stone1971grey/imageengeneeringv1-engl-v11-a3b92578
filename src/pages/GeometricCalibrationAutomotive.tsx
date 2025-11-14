import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, TestTube, Monitor, Play, Car, Lightbulb, Code, Shield, Zap, Eye, Brain, FileText, Download, BarChart3, Smartphone, Heart, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import Industries from "@/components/Industries";
import InternationalStandards from "@/components/InternationalStandards";
import MetaNavigation from "@/components/segments/MetaNavigation";
import ProductHeroGallery from "@/components/segments/ProductHeroGallery";
import FeatureOverview from "@/components/segments/FeatureOverview";
import Table from "@/components/segments/Table";
import FAQ from "@/components/segments/FAQ";
import Specification from "@/components/segments/Specification";
import { Video } from "@/components/segments/Video";
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

const GeometricCalibrationAutomotive = () => {
  const [content, setContent] = useState<Record<string, string>>({});
  const [applications, setApplications] = useState<any[]>([]);
  const [tilesColumns, setTilesColumns] = useState<string>("3");
  const [loading, setLoading] = useState(true);
  const [heroImageUrl, setHeroImageUrl] = useState<string>("");
  const [heroImagePosition, setHeroImagePosition] = useState<string>("right");
  const [heroLayout, setHeroLayout] = useState<string>("2-5");
  const [heroTopPadding, setHeroTopPadding] = useState<string>("medium");
  const [heroCtaLink, setHeroCtaLink] = useState<string>("#applications-start");
  const [heroCtaStyle, setHeroCtaStyle] = useState<string>("standard");
  const [bannerTitle, setBannerTitle] = useState<string>("");
  const [bannerSubtext, setBannerSubtext] = useState<string>("");
  const [bannerImages, setBannerImages] = useState<any[]>([]);
  const [bannerButtonText, setBannerButtonText] = useState<string>("");
  const [bannerButtonLink, setBannerButtonLink] = useState<string>("");
  const [bannerButtonStyle, setBannerButtonStyle] = useState<string>("standard");
  const [solutionsTitle, setSolutionsTitle] = useState<string>("");
  const [solutionsSubtext, setSolutionsSubtext] = useState<string>("");
  const [solutionsLayout, setSolutionsLayout] = useState<string>("2-col");
  const [solutionsItems, setSolutionsItems] = useState<any[]>([]);
  const [pageSegments, setPageSegments] = useState<any[]>([]);
  const [hasHeroContent, setHasHeroContent] = useState(false);
  const [segmentIdMap, setSegmentIdMap] = useState<Record<string, number>>({});
  const [seoData, setSeoData] = useState<any>({});
  
  const pageSlug = "geometric-calibration-automotive";

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    const { data, error } = await supabase
      .from("page_content")
      .select("*")
      .eq("page_slug", pageSlug);

    // Load segment registry for ID mapping
    const { data: segmentData } = await supabase
      .from("segment_registry")
      .select("*")
      .eq("page_slug", pageSlug);

    if (segmentData) {
      const idMap: Record<string, number> = {};
      segmentData.forEach((seg: any) => {
        idMap[seg.segment_key] = seg.segment_id;
      });
      setSegmentIdMap(idMap);
    }

    if (!error && data) {
      const contentMap: Record<string, string> = {};
      let apps: any[] = [];
      let heroExists = false;

      data.forEach((item: any) => {
        if (item.content_type === "text") {
          contentMap[item.section_key] = item.content_value;
          
          // Check specific hero fields
          if (item.section_key === "hero_image_url" && item.content_value) {
            setHeroImageUrl(item.content_value);
          }
          if (item.section_key === "hero_image_position") {
            setHeroImagePosition(item.content_value || "right");
          }
          if (item.section_key === "hero_layout") {
            setHeroLayout(item.content_value || "2-5");
          }
          if (item.section_key === "hero_top_padding") {
            setHeroTopPadding(item.content_value || "medium");
          }
          if (item.section_key === "hero_cta_link") {
            setHeroCtaLink(item.content_value || "#applications-start");
          }
          if (item.section_key === "hero_cta_style") {
            setHeroCtaStyle(item.content_value || "standard");
          }
          if (item.section_key === "banner_title") {
            setBannerTitle(item.content_value);
          }
          if (item.section_key === "banner_subtext") {
            setBannerSubtext(item.content_value);
          }
          if (item.section_key === "banner_button_text") {
            setBannerButtonText(item.content_value);
          }
          if (item.section_key === "banner_button_link") {
            setBannerButtonLink(item.content_value);
          }
          if (item.section_key === "banner_button_style") {
            setBannerButtonStyle(item.content_value || "standard");
          }
          if (item.section_key === "solutions_title") {
            setSolutionsTitle(item.content_value);
          }
          if (item.section_key === "solutions_subtext") {
            setSolutionsSubtext(item.content_value);
          }
          if (item.section_key === "solutions_layout") {
            setSolutionsLayout(item.content_value || "2-col");
          }
          if (item.section_key === "tiles_columns") {
            setTilesColumns(item.content_value || "3");
          }
          
          if (item.section_key.startsWith("hero_") && item.content_value) {
            heroExists = true;
          }
        } else if (item.content_type === "json") {
          try {
            const parsed = JSON.parse(item.content_value);
            if (item.section_key === "applications_items") {
              apps = parsed;
            }
            if (item.section_key === "banner_images") {
              setBannerImages(parsed || []);
            }
            if (item.section_key === "solutions_items") {
              setSolutionsItems(parsed || []);
            }
            if (item.section_key === "page_segments") {
              setPageSegments(parsed || []);
            }
            if (item.section_key === "seo_settings") {
              setSeoData(parsed || {});
            }
          } catch (e) {
            console.error("Error parsing JSON:", e);
          }
        }
      });

      setContent(contentMap);
      setApplications(apps);
      setHasHeroContent(heroExists);
    }
    
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading content...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEOHead
        title={seoData.title || "Geometric Calibration for Automotive | Image Engineering"}
        description={seoData.description || ""}
        canonical={seoData.canonical || `https://www.image-engineering.de/your-solution/automotive/${pageSlug}`}
        noIndex={!seoData.robotsIndex}
        noFollow={!seoData.robotsFollow}
      />
      
      <div className="min-h-screen bg-background">
        <Navigation />
        
        {/* Hero Section - CMS Controlled */}
        {hasHeroContent && (
          <Hero
            title={content.hero_title}
            subtitle={content.hero_subtitle}
            description={content.hero_description}
            ctaText={content.hero_cta}
            ctaLink={heroCtaLink}
            ctaStyle={heroCtaStyle}
            heroImageUrl={heroImageUrl}
            heroImagePosition={heroImagePosition}
            heroLayout={heroLayout}
            heroTopPadding={heroTopPadding}
          />
        )}

        {/* Dynamic Page Segments - CMS Controlled */}
        {pageSegments
          .sort((a, b) => a.position - b.position)
          .map((segment) => {
            switch (segment.type) {
              case 'meta-navigation':
                return <MetaNavigation key={segment.id} data={segment.data} />;
              case 'product-hero-gallery':
                return <ProductHeroGallery key={segment.id} data={segment.data} />;
              case 'feature-overview':
                return <FeatureOverview key={segment.id} data={segment.data} />;
              case 'table':
                return <Table key={segment.id} data={segment.data} />;
              case 'faq':
                return <FAQ key={segment.id} data={segment.data} />;
              case 'video':
                return <Video key={segment.id} data={segment.data} />;
              case 'specification':
                return <Specification key={segment.id} data={segment.data} />;
              case 'tiles':
                return (
                  <div key={segment.id} id={`segment-${segment.id}`}>
                    <Industries
                      title={segment.data.title}
                      description={segment.data.description}
                      applications={segment.data.items || []}
                      columns={segment.data.columns || "3"}
                    />
                  </div>
                );
              case 'banner':
                return (
                  <div key={segment.id} id={`segment-${segment.id}`}>
                    <InternationalStandards
                      title={segment.data.title}
                      subtext={segment.data.subtext}
                      logos={segment.data.images || []}
                      buttonText={segment.data.buttonText}
                      buttonLink={segment.data.buttonLink}
                      buttonStyle={segment.data.buttonStyle}
                    />
                  </div>
                );
              case 'image-text':
                return (
                  <section key={segment.id} id={`segment-${segment.id}`} className="py-20 bg-background">
                    <div className="container mx-auto px-6">
                      {segment.data.title && (
                        <div className="text-center mb-16">
                          <h2 className="text-4xl lg:text-5xl font-light mb-6 text-foreground">
                            {segment.data.title}
                          </h2>
                          {segment.data.subtext && (
                            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                              {segment.data.subtext}
                            </p>
                          )}
                        </div>
                      )}
                      <div className={`grid gap-8 ${
                        segment.data.layout === '1-col' ? 'grid-cols-1' :
                        segment.data.layout === '3-col' ? 'md:grid-cols-2 lg:grid-cols-3' :
                        'md:grid-cols-2'
                      }`}>
                        {(segment.data.items || []).map((item: any, idx: number) => (
                          <Card key={idx} className="overflow-hidden hover:shadow-lg transition-shadow">
                            {item.imageUrl && (
                              <img src={item.imageUrl} alt={item.title} className="w-full h-48 object-cover" />
                            )}
                            <CardContent className="p-6">
                              <h3 className="text-2xl font-semibold mb-3 text-foreground">{item.title}</h3>
                              <p className="text-muted-foreground">{item.description}</p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </section>
                );
              default:
                return null;
            }
          })}

        {/* Static Applications Section - CMS Controlled */}
        {content.applications_title && applications.length > 0 && (
          <div id="applications-start">
            <Industries
              title={content.applications_title}
              description={content.applications_description}
              applications={applications}
              columns={tilesColumns}
            />
          </div>
        )}

        {/* Static Solutions Section - CMS Controlled */}
        {solutionsTitle && solutionsItems.length > 0 && (
          <section className="py-20 bg-background">
            <div className="container mx-auto px-6">
              {solutionsTitle && (
                <div className="text-center mb-16">
                  <h2 className="text-4xl lg:text-5xl font-light mb-6 text-foreground">
                    {solutionsTitle}
                  </h2>
                  {solutionsSubtext && (
                    <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                      {solutionsSubtext}
                    </p>
                  )}
                </div>
              )}
              <div className={`grid gap-8 ${
                solutionsLayout === '1-col' ? 'grid-cols-1' :
                solutionsLayout === '3-col' ? 'md:grid-cols-2 lg:grid-cols-3' :
                'md:grid-cols-2'
              }`}>
                {solutionsItems.map((item: any, index: number) => (
                  <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
                    {item.imageUrl && (
                      <img src={item.imageUrl} alt={item.title} className="w-full h-48 object-cover" />
                    )}
                    <CardContent className="p-6">
                      <h3 className="text-2xl font-semibold mb-3 text-foreground">{item.title}</h3>
                      <p className="text-muted-foreground">{item.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Static Banner Section - CMS Controlled */}
        {bannerTitle && bannerImages.length > 0 && (
          <InternationalStandards
            title={bannerTitle}
            subtext={bannerSubtext}
            logos={bannerImages}
            buttonText={bannerButtonText}
            buttonLink={bannerButtonLink}
            buttonStyle={bannerButtonStyle}
          />
        )}

        <Footer page={pageSlug} />
      </div>
    </>
  );
};

export default GeometricCalibrationAutomotive;
