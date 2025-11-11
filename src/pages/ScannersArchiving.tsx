import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import AnnouncementBanner from "@/components/AnnouncementBanner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Download, BarChart3, Zap, Shield, Eye, Car, Smartphone, Heart, CheckCircle, Lightbulb, Monitor } from "lucide-react";
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

const ScannersArchiving = () => {
  const [content, setContent] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [heroImageUrl, setHeroImageUrl] = useState<string>("");
  const [heroImagePosition, setHeroImagePosition] = useState<string>("center");
  const [heroLayout, setHeroLayout] = useState<string>("1-1");
  const [heroTopPadding, setHeroTopPadding] = useState<string>("large");
  const [heroCtaLink, setHeroCtaLink] = useState<string>("#content");
  const [heroCtaStyle, setHeroCtaStyle] = useState<string>("standard");
  const [pageSegments, setPageSegments] = useState<any[]>([]);
  const [tabOrder, setTabOrder] = useState<string[]>([]);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    const { data, error } = await supabase
      .from("page_content")
      .select("*")
      .eq("page_slug", "scanners-archiving");

    if (!error && data) {
      const contentMap: Record<string, string> = {};

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
        } else if (item.section_key === "hero_image_url") {
          setHeroImageUrl(item.content_value || "");
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
        message={content.banner_message || ""}
        ctaText={content.banner_cta || "Learn more"}
        ctaLink={content.banner_link || "#"}
        icon="calendar"
      />

      {/* Hero Section */}
      {heroImageUrl && (
        <section className="relative min-h-screen overflow-hidden">
          <div className="absolute inset-0 animate-fade-in">
            <img 
              src={heroImageUrl} 
              alt="Scanners & Archiving Hero" 
              className="w-full h-full object-cover animate-ken-burns"
              style={{ objectPosition: heroImagePosition }}
            />
            <div className="absolute inset-0 bg-black/40"></div>
          </div>

          <div className="h-16"></div>
          
          <div className={`relative z-10 container mx-auto px-6 py-24 lg:py-32 ${getPaddingClass()}`}>
            <div className="text-center max-w-5xl mx-auto -mt-[50px]">
              <div className="mb-8">
                <h1 className="text-5xl lg:text-6xl xl:text-7xl font-light text-white leading-[0.9] tracking-tight mb-6 pt-20 md:pt-0">
                  {content.hero_title || "Scanners & Archiving"}
                </h1>
                
                <p className="text-xl lg:text-2xl text-white/90 font-light leading-relaxed max-w-3xl mx-auto">
                  {content.hero_subtitle || "Advanced scanning solutions for digital archiving"}
                </p>
              </div>
              
              {heroCtaLink && content.hero_cta_text && (
                <div className="pt-4">
                  <Button 
                    size="lg"
                    className="px-12 py-4"
                    style={{
                      backgroundColor: heroCtaStyle === 'technical' ? '#1f2937' : '#f9dc24',
                      color: heroCtaStyle === 'technical' ? 'white' : 'black'
                    }}
                    onClick={() => {
                      if (heroCtaLink.startsWith('http')) {
                        window.open(heroCtaLink, '_blank');
                      } else {
                        window.location.href = heroCtaLink;
                      }
                    }}
                  >
                    {content.hero_cta_text}
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
            <div className="w-6 h-10 border-2 border-white/40 rounded-full flex justify-center">
              <div className="w-1 h-3 bg-white/60 rounded-full mt-2 animate-pulse"></div>
            </div>
          </div>
        </section>
      )}

      {/* Dynamic Segments */}
      {tabOrder.map((segmentId) => renderSegment(segmentId))}

      <Footer />
    </div>
  );
};

export default ScannersArchiving;
