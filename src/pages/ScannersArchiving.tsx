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
  const [tilesData, setTilesData] = useState<any>({ title: "", subtext: "", items: [] });
  const [bannerData, setBannerData] = useState<any>({ title: "", subtext: "", images: [], buttonText: "", buttonLink: "", buttonStyle: "standard" });
  const [solutionsData, setSolutionsData] = useState<any>({ title: "", subtext: "", layout: "2-col", items: [] });

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
        } else if (item.section_key === "applications_title") {
          setTilesData((prev: any) => ({ ...prev, title: item.content_value }));
        } else if (item.section_key === "applications_description") {
          setTilesData((prev: any) => ({ ...prev, subtext: item.content_value }));
        } else if (item.section_key === "applications_items") {
          try {
            const items = JSON.parse(item.content_value);
            setTilesData((prev: any) => ({ ...prev, items: items || [] }));
          } catch {
            setTilesData((prev: any) => ({ ...prev, items: [] }));
          }
        } else if (item.section_key === "banner_title") {
          setBannerData((prev: any) => ({ ...prev, title: item.content_value }));
        } else if (item.section_key === "banner_subtext") {
          setBannerData((prev: any) => ({ ...prev, subtext: item.content_value }));
        } else if (item.section_key === "banner_images") {
          try {
            const images = JSON.parse(item.content_value);
            setBannerData((prev: any) => ({ ...prev, images: images || [] }));
          } catch {
            setBannerData((prev: any) => ({ ...prev, images: [] }));
          }
        } else if (item.section_key === "banner_button_text") {
          setBannerData((prev: any) => ({ ...prev, buttonText: item.content_value }));
        } else if (item.section_key === "banner_button_link") {
          setBannerData((prev: any) => ({ ...prev, buttonLink: item.content_value }));
        } else if (item.section_key === "banner_button_style") {
          setBannerData((prev: any) => ({ ...prev, buttonStyle: item.content_value || "standard" }));
        } else if (item.section_key === "solutions_title") {
          setSolutionsData((prev: any) => ({ ...prev, title: item.content_value }));
        } else if (item.section_key === "solutions_subtext") {
          setSolutionsData((prev: any) => ({ ...prev, subtext: item.content_value }));
        } else if (item.section_key === "solutions_layout") {
          setSolutionsData((prev: any) => ({ ...prev, layout: item.content_value || "2-col" }));
        } else if (item.section_key === "solutions_items") {
          try {
            const items = JSON.parse(item.content_value);
            setSolutionsData((prev: any) => ({ ...prev, items: items || [] }));
          } catch {
            setSolutionsData((prev: any) => ({ ...prev, items: [] }));
          }
        } else {
          contentMap[item.section_key] = item.content_value;
        }
      });

      setContent(contentMap);
    }

    setLoading(false);
  };

  const renderSegment = (segmentId: string) => {
    // Static Tiles segment
    if (segmentId === 'tiles') {
      if (!tilesData.title && tilesData.items.length === 0) return null;
      
      return (
        <section key="tiles" className="w-full py-16 bg-background">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
                {tilesData.title}
              </h2>
              {tilesData.subtext && (
                <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                  {tilesData.subtext}
                </p>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {tilesData.items?.map((tile: any, idx: number) => {
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

    // Static Banner segment
    if (segmentId === 'banner') {
      if (!bannerData.title && bannerData.images.length === 0) return null;
      
      return (
        <section key="banner" className="w-full py-16 bg-muted/30">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
                {bannerData.title}
              </h2>
              {bannerData.subtext && (
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
                  {bannerData.subtext}
                </p>
              )}
            </div>
            {bannerData.images && bannerData.images.length > 0 && (
              <div className="flex flex-wrap justify-center items-center gap-8 mb-8">
                {bannerData.images.map((img: any, idx: number) => (
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
            {bannerData.buttonText && (
              <div className="text-center">
                <button
                  onClick={() => {
                    if (bannerData.buttonLink?.startsWith('http')) {
                      window.open(bannerData.buttonLink, '_blank');
                    } else if (bannerData.buttonLink) {
                      window.location.href = bannerData.buttonLink;
                    }
                  }}
                  className="px-8 py-3 rounded-md font-medium transition-all"
                  style={{
                    backgroundColor: bannerData.buttonStyle === 'technical' ? '#1f2937' : '#f9dc24',
                    color: bannerData.buttonStyle === 'technical' ? 'white' : 'black'
                  }}
                >
                  {bannerData.buttonText}
                </button>
              </div>
            )}
          </div>
        </section>
      );
    }

    // Static Solutions/Image-Text segment
    if (segmentId === 'solutions') {
      if (!solutionsData.title && solutionsData.items.length === 0) return null;
      
      const getLayoutClass = () => {
        switch (solutionsData.layout) {
          case '1-col': return 'grid-cols-1';
          case '2-col': return 'grid-cols-1 md:grid-cols-2';
          case '3-col': return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
          default: return 'grid-cols-1 md:grid-cols-2';
        }
      };

      return (
        <section key="solutions" className="w-full py-16 bg-background">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
                {solutionsData.title}
              </h2>
              {solutionsData.subtext && (
                <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                  {solutionsData.subtext}
                </p>
              )}
            </div>
            <div className={`grid ${getLayoutClass()} gap-8`}>
              {solutionsData.items?.map((item: any, idx: number) => (
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

    // Dynamic segments (tiles, banner, image-text)
    if (segmentId.startsWith('segment-') || typeof segmentId === 'number' || (typeof segmentId === 'string' && segmentId.match(/^\d+$/))) {
      const segment = pageSegments.find(s => s.id === segmentId || s.id === String(segmentId));
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

      {/* Hero Section - Product Hero Template */}
      <section id="introduction" className="min-h-[60vh] bg-white font-roboto relative overflow-hidden py-8">
        <div className={`container mx-auto px-6 pb-8 lg:pb-12 relative z-10 ${
          heroTopPadding === "small" ? "pt-16 lg:pt-16" :
          heroTopPadding === "medium" ? "pt-24 lg:pt-24" :
          heroTopPadding === "large" ? "pt-32 lg:pt-32" :
          heroTopPadding === "xlarge" ? "pt-40 lg:pt-40" :
          "pt-32 lg:pt-32"
        }`}>
          <div className={`grid gap-16 items-center ${
            heroLayout === "50-50" ? "lg:grid-cols-2" : 
            heroLayout === "2-3" ? "lg:grid-cols-5" :
            heroLayout === "1-2" ? "lg:grid-cols-3" :
            "lg:grid-cols-5"
          }`}>
            
            {/* Text Content */}
            <div className={`space-y-8 ${
              heroLayout === "50-50" ? "" :
              heroLayout === "2-3" ? "lg:col-span-2" :
              heroLayout === "1-2" ? "" :
              "lg:col-span-2"
            } ${heroImagePosition === "left" ? "order-2" : "order-1"}`}>
              <div>
                <h1 className="text-5xl lg:text-6xl xl:text-7xl font-light leading-[0.9] tracking-tight mb-6 text-black mt-8 md:mt-0">
                  {content.hero_title || "Scanners & Archiving"}
                  {content.hero_subtitle && (
                    <>
                      <br />
                      <span className="font-medium text-black">{content.hero_subtitle}</span>
                    </>
                  )}
                </h1>
                
                <p className="text-xl lg:text-2xl text-black font-light leading-relaxed max-w-lg">
                  {content.hero_description || "Advanced scanning solutions for digital archiving"}
                </p>
              </div>
              
              {content.hero_cta && (
                <div className="pt-4">
                  {heroCtaLink.startsWith('http://') || heroCtaLink.startsWith('https://') ? (
                    <a 
                      href={heroCtaLink}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button 
                        size="lg"
                        className={`border-0 px-8 py-4 text-lg font-medium shadow-soft hover:shadow-lg transition-all duration-300 group ${
                          heroCtaStyle === "technical" ? "text-white" : "text-black"
                        }`}
                        style={{ 
                          backgroundColor: heroCtaStyle === "technical" ? "#1f2937" : "#f9dc24"
                        }}
                      >
                        {content.hero_cta}
                      </Button>
                    </a>
                  ) : (
                    <Button 
                      size="lg"
                      className={`border-0 px-8 py-4 text-lg font-medium shadow-soft hover:shadow-lg transition-all duration-300 group ${
                        heroCtaStyle === "technical" ? "text-white" : "text-black"
                      }`}
                      style={{ 
                        backgroundColor: heroCtaStyle === "technical" ? "#1f2937" : "#f9dc24"
                      }}
                      onClick={() => {
                        if (heroCtaLink) {
                          window.location.href = heroCtaLink;
                        }
                      }}
                    >
                      {content.hero_cta}
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Image Content */}
            <div className={`relative px-6 ${
              heroLayout === "50-50" ? "" :
              heroLayout === "2-3" ? "lg:col-span-3" :
              heroLayout === "1-2" ? "lg:col-span-2" :
              "lg:col-span-3"
            } ${heroImagePosition === "left" ? "order-1" : "order-2"}`}>
              <div className="relative overflow-hidden rounded-lg shadow-soft">
                {heroImageUrl ? (
                  <img 
                    src={heroImageUrl} 
                    alt="Scanners & Archiving" 
                    className="w-full h-[500px] object-cover"
                  />
                ) : (
                  <div className="w-full h-[500px] bg-gray-200 flex items-center justify-center">
                    <p className="text-gray-400">Hero Image</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic Segments */}
      {tabOrder.map((segmentId) => renderSegment(segmentId))}

      <Footer />
    </div>
  );
};

export default ScannersArchiving;
