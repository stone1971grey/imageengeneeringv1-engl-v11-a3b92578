import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import AnnouncementBanner from "@/components/AnnouncementBanner";
import IndustrySection from "@/components/IndustrySection";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, MapPin, FileText, Download, BarChart3, Zap, Shield, Eye, Car, Smartphone, Heart, CheckCircle, Lightbulb, Monitor } from "lucide-react";
import industriesHero from "@/assets/industries-hero.jpg";
import ibcBanner from "@/assets/ibc.png";
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

const YourSolution = () => {
  const [content, setContent] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [heroImageUrl, setHeroImageUrl] = useState<string>(industriesHero);
  const [heroImagePosition, setHeroImagePosition] = useState<string>("center");
  const [heroLayout, setHeroLayout] = useState<string>("1-1");
  const [heroTopPadding, setHeroTopPadding] = useState<string>("large");
  const [heroCtaLink, setHeroCtaLink] = useState<string>("#content");
  const [heroCtaStyle, setHeroCtaStyle] = useState<string>("standard");
  const [pageSegments, setPageSegments] = useState<any[]>([]);
  const [tabOrder, setTabOrder] = useState<string[]>(['industry-section', 'ibc-banner']);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    const { data, error } = await supabase
      .from("page_content")
      .select("*")
      .eq("page_slug", "your-solution");

    if (!error && data) {
      const contentMap: Record<string, string> = {};

      data.forEach((item: any) => {
        if (item.section_key === "page_segments") {
          const segments = JSON.parse(item.content_value);
          setPageSegments(segments);
        } else if (item.section_key === "tab_order") {
          try {
            const order = JSON.parse(item.content_value);
            setTabOrder(order || ['industry-section', 'ibc-banner']);
          } catch {
            setTabOrder(['industry-section', 'ibc-banner']);
          }
        } else if (item.section_key === "hero_image_url") {
          setHeroImageUrl(item.content_value || industriesHero);
        } else if (item.section_key === "hero_image_position") {
          setHeroImagePosition(item.content_value || "center");
        } else if (item.section_key === "hero_layout") {
          setHeroLayout(item.content_value || "1-1");
        } else if (item.section_key === "hero_top_padding") {
          setHeroTopPadding(item.content_value || "large");
        } else if (item.section_key === "hero_cta_link") {
          setHeroCtaLink(item.content_value || "#content");
        } else if (item.section_key === "hero_cta_style") {
          setHeroCtaStyle(item.content_value || "standard");
        } else {
          contentMap[item.section_key] = item.content_value;
        }
      });

      setContent(contentMap);
    }

    setLoading(false);
  };

  const getPaddingClass = () => {
    switch (heroTopPadding) {
      case 'small': return 'pt-16';
      case 'medium': return 'pt-24';
      case 'large': return 'pt-32';
      case 'extra-large': return 'pt-40';
      default: return 'pt-24';
    }
  };

  const renderSegment = (segmentId: string) => {
    // Static segments
    if (segmentId === 'industry-section') {
      return (
        <div key="industry-section" id="content">
          <IndustrySection />
        </div>
      );
    }

    if (segmentId === 'ibc-banner') {
      return (
        <section key="ibc-banner" className="w-full bg-gradient-to-r from-primary/5 to-accent-soft-blue/5 border-b border-muted-foreground/10">
          <div className="container mx-auto px-6 py-8">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
              <div className="flex-1 text-center lg:text-left">
                <h2 className="text-2xl lg:text-3xl font-semibold text-foreground mb-3">
                  {content.ibc_title || "Meet us at IBC 2025"}
                </h2>
                <p className="text-lg text-muted-foreground mb-4 max-w-2xl">
                  {content.ibc_description || "Schedule a meeting with us at IBC 2025 to get a customized introduction on how we can help you optimize your media operations and stay ahead of change."}
                </p>
                <div className="flex flex-col sm:flex-row items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{content.ibc_date || "September 12-15, 2025"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{content.ibc_location || "Amsterdam, Netherlands"}</span>
                  </div>
                </div>
              </div>
              <div className="flex-shrink-0">
                <img 
                  src={ibcBanner} 
                  alt="IBC 2025 Banner" 
                  className="w-auto h-24 lg:h-32 object-contain"
                />
              </div>
            </div>
            <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button 
                size="lg" 
                className="bg-primary hover:bg-primary/90 text-white px-8"
              >
                {content.ibc_cta_primary || "Schedule Appointment"}
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="border-primary text-primary hover:bg-primary/5 px-8"
              >
                {content.ibc_cta_secondary || "Learn More"}
              </Button>
            </div>
          </div>
        </section>
      );
    }

    // Dynamic segments (tiles, banner, image-text)
    if (segmentId.startsWith('segment-')) {
      const segment = pageSegments.find(s => s.id === segmentId);
      if (!segment) return null;

      // Render based on segment type
      if (segment.type === 'tiles') {
        return (
          <section key={segmentId} className="w-full py-16 bg-background">
            <div className="container mx-auto px-6">
              <div className="text-center mb-12">
                <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
                  {segment.data.title}
                </h2>
                {segment.data.subtext && (
                  <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                    {segment.data.subtext}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {segment.data.items?.map((tile: any, idx: number) => {
                  const IconComponent = tile.icon ? iconMap[tile.icon] : null;
                  return (
                    <Card key={idx} className="hover:shadow-lg transition-all">
                      <CardContent className="p-6">
                        {tile.imageUrl && (
                          <div className="w-full h-[200px] mb-4 overflow-hidden rounded-md">
                            <img 
                              src={tile.imageUrl} 
                              alt={tile.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        {IconComponent && (
                          <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: '#f9dc24' }}>
                            <IconComponent className="w-8 h-8 text-black" />
                          </div>
                        )}
                        <h3 className="text-xl font-semibold text-foreground mb-3">
                          {tile.title}
                        </h3>
                        <p className="text-muted-foreground mb-4">
                          {tile.description}
                        </p>
                        {tile.ctaLink && (
                          <button
                            onClick={() => {
                              if (tile.ctaLink.startsWith('http')) {
                                window.open(tile.ctaLink, '_blank');
                              } else {
                                window.location.href = tile.ctaLink;
                              }
                            }}
                            className="px-6 py-2 rounded-md font-medium transition-all"
                            style={{
                              backgroundColor: tile.ctaStyle === 'technical' ? '#1f2937' : '#f9dc24',
                              color: tile.ctaStyle === 'technical' ? 'white' : 'black'
                            }}
                          >
                            {tile.ctaText || "Learn More"}
                          </button>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </section>
        );
      }

      if (segment.type === 'banner') {
        return (
          <section key={segmentId} className="w-full py-16 bg-muted/30">
            <div className="container mx-auto px-6">
              <div className="text-center mb-12">
                <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
                  {segment.data.title}
                </h2>
                {segment.data.subtext && (
                  <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
                    {segment.data.subtext}
                  </p>
                )}
              </div>
              {segment.data.images && segment.data.images.length > 0 && (
                <div className="flex flex-wrap justify-center items-center gap-8 mb-8">
                  {segment.data.images.map((img: any, idx: number) => (
                    <div key={idx} className="grayscale hover:grayscale-0 transition-all duration-300">
                      <img 
                        src={img.url} 
                        alt={img.alt || `Banner image ${idx + 1}`}
                        className="h-16 object-contain"
                      />
                    </div>
                  ))}
                </div>
              )}
              {segment.data.buttonText && (
                <div className="text-center">
                  <button
                    onClick={() => {
                      if (segment.data.buttonLink?.startsWith('http')) {
                        window.open(segment.data.buttonLink, '_blank');
                      } else if (segment.data.buttonLink) {
                        window.location.href = segment.data.buttonLink;
                      }
                    }}
                    className="px-8 py-3 rounded-md font-medium transition-all"
                    style={{
                      backgroundColor: segment.data.buttonStyle === 'technical' ? '#1f2937' : '#f9dc24',
                      color: segment.data.buttonStyle === 'technical' ? 'white' : 'black'
                    }}
                  >
                    {segment.data.buttonText}
                  </button>
                </div>
              )}
            </div>
          </section>
        );
      }

      if (segment.type === 'image-text') {
        const getLayoutClass = () => {
          switch (segment.data.layout) {
            case '1-col': return 'grid-cols-1';
            case '2-col': return 'grid-cols-1 md:grid-cols-2';
            case '3-col': return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
            default: return 'grid-cols-1 md:grid-cols-2';
          }
        };

        return (
          <section key={segmentId} className="w-full py-16 bg-background">
            <div className="container mx-auto px-6">
              <div className="text-center mb-12">
                <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
                  {segment.data.title}
                </h2>
                {segment.data.subtext && (
                  <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                    {segment.data.subtext}
                  </p>
                )}
              </div>
              <div className={`grid ${getLayoutClass()} gap-8`}>
                {segment.data.items?.map((item: any, idx: number) => (
                  <Card key={idx} className="overflow-hidden hover:shadow-lg transition-all">
                    {item.imageUrl && (
                      <div className="w-full h-[250px] overflow-hidden">
                        <img 
                          src={item.imageUrl} 
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <CardContent className="p-6">
                      <h3 className="text-xl font-semibold text-foreground mb-3">
                        {item.title}
                      </h3>
                      <p className="text-muted-foreground">
                        {item.description}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        );
      }
    }

    return null;
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <AnnouncementBanner 
        message={content.banner_message || "Visit us at IBC 2025"}
        ctaText={content.banner_cta || "Learn more"}
        ctaLink={content.banner_link || "#"}
        icon="calendar"
      />

      {/* Hero Section */}
      <section className="relative min-h-screen overflow-hidden">
        <div className="absolute inset-0 animate-fade-in">
          <img 
            src={heroImageUrl} 
            alt="Your Solution Hero" 
            className="w-full h-full object-cover animate-ken-burns"
          />
          <div className="absolute inset-0 bg-black/40"></div>
        </div>

        <div className="h-16"></div>
        
        <div className={`relative z-10 container mx-auto px-6 py-24 lg:py-32 ${getPaddingClass()}`}>
          <div className="text-center max-w-5xl mx-auto -mt-[50px]">
            <div className="mb-8">
              <h1 className="text-5xl lg:text-6xl xl:text-7xl font-light text-white leading-[0.9] tracking-tight mb-6 pt-20 md:pt-0">
                {content.hero_title || (
                  <>
                    Precision Solutions
                    <br />
                    <span className="font-medium text-[#74952a]">for All Industries</span>
                  </>
                )}
              </h1>
              
              <p className="text-xl lg:text-2xl text-white/90 font-light leading-relaxed max-w-3xl mx-auto">
                {content.hero_subtitle || "From vehicle safety to medical diagnostics - our advanced image processing technologies drive innovation across various sectors worldwide."}
              </p>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-[#74952a]/40 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-[#74952a]/60 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Dynamic Segments */}
      {tabOrder.map((segmentId) => renderSegment(segmentId))}

      <Footer />
    </div>
  );
};

export default YourSolution;
