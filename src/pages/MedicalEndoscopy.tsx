import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Lightbulb, Zap, Shield, FileText, Download, BarChart3, Eye, Car, Smartphone, Heart, CheckCircle, Monitor } from "lucide-react";

const PAGE_SLUG = "medical-endoscopy";

interface PageSegment {
  id: string;
  type: string;
  position: number;
  data: any;
}

const MedicalEndoscopy = () => {
  const [pageSegments, setPageSegments] = useState<PageSegment[]>([]);
  const [content, setContent] = useState<Record<string, string>>({});
  const [heroImageUrl, setHeroImageUrl] = useState<string>("");
  const [heroImagePosition, setHeroImagePosition] = useState<string>("right");
  const [heroLayout, setHeroLayout] = useState<string>("2-5");
  const [heroTopPadding, setHeroTopPadding] = useState<string>("medium");
  const [heroCtaLink, setHeroCtaLink] = useState<string>("#applications");
  const [heroCtaStyle, setHeroCtaStyle] = useState<string>("standard");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPageContent();
  }, []);

  const loadPageContent = async () => {
    try {
      const { data, error } = await supabase
        .from("page_content")
        .select("*")
        .eq("page_slug", PAGE_SLUG);

      if (error) throw error;

      if (data) {
        const contentMap: Record<string, string> = {};
        
        data.forEach((item: any) => {
          if (item.section_key === "page_segments") {
            const segments = JSON.parse(item.content_value);
            setPageSegments(segments.sort((a: PageSegment, b: PageSegment) => a.position - b.position));
          } else if (item.section_key === "hero_image_url") {
            setHeroImageUrl(item.content_value);
          } else if (item.section_key === "hero_image_position") {
            setHeroImagePosition(item.content_value || "right");
          } else if (item.section_key === "hero_layout") {
            setHeroLayout(item.content_value || "2-5");
          } else if (item.section_key === "hero_top_padding") {
            setHeroTopPadding(item.content_value || "medium");
          } else if (item.section_key === "hero_cta_link") {
            setHeroCtaLink(item.content_value || "#applications");
          } else if (item.section_key === "hero_cta_style") {
            setHeroCtaStyle(item.content_value || "standard");
          } else {
            contentMap[item.section_key] = item.content_value;
          }
        });

        setContent(contentMap);
      }
    } catch (error) {
      console.error("Error loading page content:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getIconComponent = (iconName?: string) => {
    const iconMap: { [key: string]: any } = {
      FileText, Download, BarChart3, Zap, Shield, Eye, Car, Smartphone, Heart, CheckCircle, Lightbulb, Monitor
    };
    return iconMap[iconName || "Lightbulb"] || Lightbulb;
  };

  const getTopSpacingClass = (spacing: string) => {
    switch (spacing) {
      case "small": return "pt-16";
      case "medium": return "pt-24";
      case "large": return "pt-32";
      case "xlarge": return "pt-40";
      default: return "pt-24";
    }
  };

  const getLayoutClasses = (layout: string, imagePosition: string) => {
    const layoutMap: { [key: string]: { text: string; image: string } } = {
      "50-50": { text: "md:w-1/2", image: "md:w-1/2" },
      "2-3": { text: "md:w-2/3", image: "md:w-1/3" },
      "2-5": { text: "md:w-2/5", image: "md:w-3/5" },
    };
    
    const classes = layoutMap[layout] || layoutMap["2-5"];
    
    if (imagePosition === "left") {
      return {
        containerClass: "flex-col-reverse md:flex-row",
        textClass: classes.text,
        imageClass: classes.image
      };
    }
    return {
      containerClass: "flex-col md:flex-row",
      textClass: classes.text,
      imageClass: classes.image
    };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  const topSpacing = getTopSpacingClass(heroTopPadding);
  const layoutClasses = getLayoutClasses(heroLayout, heroImagePosition);

  return (
    <div className="min-h-screen">
      <Navigation />
      
      {/* Hero Section - from old format */}
      {(heroImageUrl || content.hero_title) && (
        <section className={`${topSpacing} pb-16`}>
          <div className="container mx-auto px-4">
            <div className={`flex ${layoutClasses.containerClass} gap-12 items-center`}>
              <div className={`${layoutClasses.textClass}`}>
                {content.hero_subtitle && (
                  <p className="text-sm font-semibold text-primary mb-4 uppercase tracking-wide">
                    {content.hero_subtitle}
                  </p>
                )}
                <h1 className="text-4xl md:text-5xl font-bold mb-6">
                  {content.hero_title || "Medical & Endoscopy Solutions"}
                </h1>
                <p className="text-lg text-muted-foreground mb-8">
                  {content.hero_description || "Advanced image quality testing for medical imaging systems"}
                </p>
                {content.hero_cta && heroCtaLink && (
                  <button
                    onClick={() => {
                      if (heroCtaLink.startsWith("http")) {
                        window.open(heroCtaLink, "_blank");
                      } else {
                        window.location.href = heroCtaLink;
                      }
                    }}
                    style={{
                      backgroundColor: heroCtaStyle === "technical" ? "#1f2937" : "#f9dc24",
                      color: heroCtaStyle === "technical" ? "#ffffff" : "#000000",
                      padding: "0.75rem 2rem",
                      borderRadius: "0.5rem",
                      fontWeight: "600",
                      border: "none",
                      cursor: "pointer",
                      transition: "opacity 0.2s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                  >
                    {content.hero_cta}
                  </button>
                )}
              </div>
              {heroImageUrl && (
                <div className={`${layoutClasses.imageClass}`}>
                  <img
                    src={heroImageUrl}
                    alt={content.hero_title || "Hero image"}
                    className="w-full h-[500px] object-cover rounded-lg"
                  />
                </div>
              )}
            </div>
          </div>
        </section>
      )}
      
      {/* Dynamic Segments from new format */}
      {pageSegments.map((segment) => {
        if (segment.type === "hero") {
          const segTopSpacing = getTopSpacingClass(segment.data.topSpacing);
          const segLayoutClasses = getLayoutClasses(segment.data.layout, segment.data.imagePosition);
          
          return (
            <section key={segment.id} className={`${segTopSpacing} pb-16`}>
              <div className="container mx-auto px-4">
                <div className={`flex ${segLayoutClasses.containerClass} gap-12 items-center`}>
                  <div className={`${segLayoutClasses.textClass}`}>
                    {segment.data.subtitle && (
                      <p className="text-sm font-semibold text-primary mb-4 uppercase tracking-wide">
                        {segment.data.subtitle}
                      </p>
                    )}
                    <h1 className="text-4xl md:text-5xl font-bold mb-6">{segment.data.title}</h1>
                    <p className="text-lg text-muted-foreground mb-8">{segment.data.description}</p>
                    {segment.data.ctaText && segment.data.ctaLink && (
                      <button
                        onClick={() => {
                          if (segment.data.ctaExternal) {
                            window.open(segment.data.ctaLink, "_blank");
                          } else {
                            window.location.href = segment.data.ctaLink;
                          }
                        }}
                        style={{
                          backgroundColor: segment.data.ctaStyle === "technical" ? "#1f2937" : "#f9dc24",
                          color: segment.data.ctaStyle === "technical" ? "#ffffff" : "#000000",
                          padding: "0.75rem 2rem",
                          borderRadius: "0.5rem",
                          fontWeight: "600",
                          border: "none",
                          cursor: "pointer",
                          transition: "opacity 0.2s",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
                        onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                      >
                        {segment.data.ctaText}
                      </button>
                    )}
                  </div>
                  <div className={`${segLayoutClasses.imageClass}`}>
                    <img
                      src={segment.data.imageUrl}
                      alt={segment.data.title}
                      className="w-full h-[500px] object-cover rounded-lg"
                    />
                  </div>
                </div>
              </div>
            </section>
          );
        }

        if (segment.type === "tiles") {
          return (
            <section key={segment.id} className="py-24 bg-background">
              <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                  <h2 className="text-4xl font-bold mb-4">{segment.data.title}</h2>
                  {segment.data.subtitle && (
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                      {segment.data.subtitle}
                    </p>
                  )}
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                  {segment.data.tiles?.map((tile: any) => {
                    const IconComponent = getIconComponent(tile.icon);
                    return (
                      <div
                        key={tile.id}
                        className="bg-card p-8 rounded-lg hover:shadow-lg transition-shadow"
                      >
                        {tile.imageUrl && (
                          <img
                            src={tile.imageUrl}
                            alt={tile.title}
                            className="w-full h-[200px] object-cover rounded-lg mb-6"
                          />
                        )}
                        {tile.icon && (
                          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-6">
                            <IconComponent className="w-8 h-8 text-primary-foreground" />
                          </div>
                        )}
                        <h3 className="text-2xl font-bold mb-4">{tile.title}</h3>
                        <p className="text-muted-foreground mb-6">{tile.description}</p>
                        {tile.ctaText && tile.ctaLink && (
                          <button
                            onClick={() => {
                              if (tile.ctaExternal) {
                                window.open(tile.ctaLink, "_blank");
                              } else {
                                window.location.href = tile.ctaLink;
                              }
                            }}
                            style={{
                              backgroundColor: tile.ctaStyle === "technical" ? "#1f2937" : "#f9dc24",
                              color: tile.ctaStyle === "technical" ? "#ffffff" : "#000000",
                              padding: "0.75rem 2rem",
                              borderRadius: "0.5rem",
                              fontWeight: "600",
                              border: "none",
                              cursor: "pointer",
                              transition: "opacity 0.2s",
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
                            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                          >
                            {tile.ctaText}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          );
        }

        if (segment.type === "banner") {
          return (
            <section key={segment.id} className="py-24 bg-muted/30">
              <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                  <h2 className="text-4xl font-bold mb-4">{segment.data.title}</h2>
                  {segment.data.subtitle && (
                    <p className="text-lg text-muted-foreground max-w-[600px] mx-auto">
                      {segment.data.subtitle}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap justify-center gap-8 mb-12">
                  {segment.data.images?.map((image: any) => (
                    <div
                      key={image.id}
                      className="grayscale hover:grayscale-0 transition-all duration-300"
                    >
                      <img
                        src={image.imageUrl}
                        alt={image.alt}
                        className="h-16 object-contain"
                      />
                    </div>
                  ))}
                </div>

                {segment.data.ctaText && segment.data.ctaLink && (
                  <div className="text-center">
                    <button
                      onClick={() => {
                        if (segment.data.ctaExternal) {
                          window.open(segment.data.ctaLink, "_blank");
                        } else {
                          window.location.href = segment.data.ctaLink;
                        }
                      }}
                      style={{
                        backgroundColor: segment.data.ctaStyle === "technical" ? "#1f2937" : "#f9dc24",
                        color: segment.data.ctaStyle === "technical" ? "#ffffff" : "#000000",
                        padding: "0.75rem 2rem",
                        borderRadius: "0.5rem",
                        fontWeight: "600",
                        border: "none",
                        cursor: "pointer",
                        transition: "opacity 0.2s",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
                      onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                    >
                      {segment.data.ctaText}
                    </button>
                  </div>
                )}
              </div>
            </section>
          );
        }

        if (segment.type === "solutions") {
          const getLayoutClass = () => {
            switch (segment.data.layout) {
              case "1-column":
                return "grid-cols-1";
              case "2-column":
                return "md:grid-cols-2";
              case "3-column":
                return "md:grid-cols-3";
              default:
                return "md:grid-cols-3";
            }
          };

          return (
            <section key={segment.id} className="py-24 bg-background">
              <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                  <h2 className="text-4xl font-bold mb-4">{segment.data.title}</h2>
                  {segment.data.subtitle && (
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                      {segment.data.subtitle}
                    </p>
                  )}
                </div>

                <div className={`grid ${getLayoutClass()} gap-8`}>
                  {segment.data.items?.map((item: any) => (
                    <div key={item.id} className="bg-card rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                      {item.imageUrl && (
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-full h-64 object-cover"
                        />
                      )}
                      <div className="p-6">
                        <h3 className="text-2xl font-bold mb-4">{item.title}</h3>
                        <p className="text-muted-foreground">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          );
        }

        return null;
      })}

      <Footer />
    </div>
  );
};

export default MedicalEndoscopy;
