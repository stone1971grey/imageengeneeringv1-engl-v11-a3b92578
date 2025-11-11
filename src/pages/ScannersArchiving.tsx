import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Download, BarChart3, Zap, Shield, Eye, Car, Smartphone, Heart, CheckCircle, Lightbulb, Monitor } from "lucide-react";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
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

interface Application {
  title: string;
  description: string;
  ctaLink: string;
  ctaStyle: string;
  ctaText: string;
  imageUrl: string;
  icon: string;
}

const ScannersArchiving = () => {
  const [content, setContent] = useState<Record<string, string>>({});
  const [applications, setApplications] = useState<any[]>([]);
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
  const [tabOrder, setTabOrder] = useState<string[]>(['tiles', 'banner', 'solutions']);

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
      let apps: any[] = [];

      data.forEach((item: any) => {
        if (item.section_key === "page_segments") {
          const segments = JSON.parse(item.content_value);
          setPageSegments(segments);
        } else if (item.section_key === "tab_order") {
          try {
            const order = JSON.parse(item.content_value);
            setTabOrder(order || ['tiles', 'banner', 'solutions']);
          } catch {
            setTabOrder(['tiles', 'banner', 'solutions']);
          }
        } else if (item.section_key === "applications_items") {
          apps = JSON.parse(item.content_value);
        } else if (item.section_key === "solutions_title") {
          setSolutionsTitle(item.content_value);
        } else if (item.section_key === "solutions_subtext") {
          setSolutionsSubtext(item.content_value);
        } else if (item.section_key === "solutions_layout") {
          setSolutionsLayout(item.content_value || "2-col");
        } else if (item.section_key === "solutions_items") {
          setSolutionsItems(JSON.parse(item.content_value));
        } else if (item.section_key === "banner_images") {
          setBannerImages(JSON.parse(item.content_value));
        } else if (item.section_key === "banner_title") {
          setBannerTitle(item.content_value);
        } else if (item.section_key === "banner_subtext") {
          setBannerSubtext(item.content_value);
        } else if (item.section_key === "banner_button_text") {
          setBannerButtonText(item.content_value);
        } else if (item.section_key === "banner_button_link") {
          setBannerButtonLink(item.content_value);
        } else if (item.section_key === "banner_button_style") {
          setBannerButtonStyle(item.content_value || "standard");
        } else if (item.section_key === "hero_image_url") {
          setHeroImageUrl(item.content_value);
        } else if (item.section_key === "hero_image_position") {
          setHeroImagePosition(item.content_value || "right");
        } else if (item.section_key === "hero_layout") {
          setHeroLayout(item.content_value || "2-5");
        } else if (item.section_key === "hero_top_padding") {
          setHeroTopPadding(item.content_value || "medium");
        } else if (item.section_key === "hero_cta_link") {
          setHeroCtaLink(item.content_value || "#applications-start");
        } else if (item.section_key === "hero_cta_style") {
          setHeroCtaStyle(item.content_value || "standard");
        } else {
          contentMap[item.section_key] = item.content_value;
        }
      });

      setContent(contentMap);
      setApplications(apps);
    }
    setLoading(false);
  };

  // Helper function to render segment by ID
  const renderSegment = (segmentId: string) => {
    // Static segments
    if (segmentId === 'tiles') {
      return (
        <section key="tiles" id="applications" className="py-8 bg-gray-50">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {content.applications_title || "Main Applications"}
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                {content.applications_description || "Scanner and archiving solutions for document digitization."}
              </p>
            </div>
          </div>

          <div className="container mx-auto px-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
              {applications.map((app: Application, index) => {
                const IconComponent = app.icon ? iconMap[app.icon] : null;
                
                return (
                   <div 
                     key={index}
                     className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200 flex flex-col overflow-hidden group"
                   >
                     {IconComponent && (
                       <div className="w-full flex justify-center pt-8">
                         <div className="relative">
                           <div className="w-20 h-20 bg-[#f9dc24]/10 rounded-full flex items-center justify-center border-2 border-[#f9dc24]/20 shadow-lg group-hover:shadow-xl group-hover:bg-[#f9dc24]/20 group-hover:border-[#f9dc24]/40 transition-all duration-500 ease-out group-hover:-translate-y-1 group-hover:scale-105">
                             <IconComponent 
                               size={36} 
                               className="text-black group-hover:text-gray-900 group-hover:scale-125 transition-all duration-300" 
                               strokeWidth={1.8}
                             />
                           </div>
                           <div className="absolute inset-0 w-20 h-20 bg-[#f9dc24] rounded-full opacity-0 group-hover:opacity-15 transition-opacity duration-500 blur-xl" />
                         </div>
                       </div>
                     )}
                     
                     {app.imageUrl && (
                       <div className={`w-full h-[200px] overflow-hidden ${IconComponent ? 'mt-4' : ''}`}>
                         <img 
                           src={app.imageUrl} 
                           alt={app.title} 
                           className="w-full h-full object-cover"
                         />
                       </div>
                     )}
                     
                     <div className={`p-8 flex flex-col items-center text-center flex-1 ${!IconComponent && !app.imageUrl ? 'pt-8' : ''}`}>
                       <h3 className="text-xl font-bold text-gray-900 mb-4 leading-tight">
                         {app.title}
                       </h3>
                       
                       <p className="text-base text-gray-600 leading-relaxed mb-6 flex-1">
                         {app.description}
                       </p>
                    
                     {app.ctaLink && app.ctaLink.trim() ? (
                       app.ctaLink.startsWith('http://') || app.ctaLink.startsWith('https://') ? (
                         <a 
                           href={app.ctaLink}
                           target="_blank"
                           rel="noopener noreferrer"
                           className="w-full"
                         >
                           <button
                             className="w-full px-4 py-2 rounded-md border-0 font-medium text-lg transition-opacity hover:opacity-90"
                             style={{
                               backgroundColor: app.ctaStyle === "technical" ? "#1f2937" : "#f9dc24",
                               color: app.ctaStyle === "technical" ? "white" : "black"
                             }}
                           >
                             {app.ctaText || 'Learn More'}
                           </button>
                         </a>
                       ) : (
                         <Link to={app.ctaLink} className="w-full">
                           <button
                             className="w-full px-4 py-2 rounded-md border-0 font-medium text-lg transition-opacity hover:opacity-90"
                             style={{
                               backgroundColor: app.ctaStyle === "technical" ? "#1f2937" : "#f9dc24",
                               color: app.ctaStyle === "technical" ? "white" : "black"
                             }}
                           >
                             {app.ctaText || 'Learn More'}
                           </button>
                         </Link>
                       )
                     ) : (
                       <button
                         className="w-full px-4 py-2 rounded-md border-0 font-medium text-lg transition-opacity hover:opacity-90"
                         style={{
                           backgroundColor: app.ctaStyle === "technical" ? "#1f2937" : "#f9dc24",
                           color: app.ctaStyle === "technical" ? "white" : "black"
                         }}
                       >
                         {app.ctaText || 'Learn More'}
                       </button>
                     )}
                   </div>
                 </div>
               );
             })}
           </div>
         </div>
       </section>
      );
    }

    if (segmentId === 'banner') {
      return (
        <section key="banner" id="standards" className="py-16" style={{ backgroundColor: '#f3f3f5' }}>
          <div className="container mx-auto px-6">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 text-center">
              {bannerTitle || "Standards"}
            </h2>
            
            {bannerSubtext && (
              <p className="text-lg text-gray-600 mb-12 text-center mx-auto" style={{ maxWidth: '600px' }}>
                {bannerSubtext}
              </p>
            )}
            
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 mb-12">
              {bannerImages.map((image: any, index: number) => (
                <div key={index} className="flex items-center justify-center h-24 w-40">
                  <img 
                    src={image.url} 
                    alt={image.alt || `Banner image ${index + 1}`}
                    className="max-h-full max-w-full object-contain filter grayscale hover:grayscale-0 transition-all duration-300"
                  />
                </div>
              ))}
            </div>

            {bannerButtonText && (
              <div className="flex justify-center">
                {bannerButtonLink ? (
                  bannerButtonLink.startsWith('http://') || bannerButtonLink.startsWith('https://') ? (
                    <a 
                      href={bannerButtonLink}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <button
                        className="px-8 py-4 text-lg font-medium rounded-md border-0 shadow-soft hover:shadow-lg transition-all duration-300"
                        style={{
                          backgroundColor: bannerButtonStyle === "technical" ? "#1f2937" : "#f9dc24",
                          color: bannerButtonStyle === "technical" ? "#ffffff" : "#000000"
                        }}
                      >
                        {bannerButtonText}
                      </button>
                    </a>
                  ) : (
                    <Link to={bannerButtonLink}>
                      <button
                        className="px-8 py-4 text-lg font-medium rounded-md border-0 shadow-soft hover:shadow-lg transition-all duration-300"
                        style={{
                          backgroundColor: bannerButtonStyle === "technical" ? "#1f2937" : "#f9dc24",
                          color: bannerButtonStyle === "technical" ? "#ffffff" : "#000000"
                        }}
                      >
                        {bannerButtonText}
                      </button>
                    </Link>
                  )
                ) : (
                  <button
                    className="px-8 py-4 text-lg font-medium rounded-md border-0 shadow-soft hover:shadow-lg transition-all duration-300"
                    style={{
                      backgroundColor: bannerButtonStyle === "technical" ? "#1f2937" : "#f9dc24",
                      color: bannerButtonStyle === "technical" ? "#ffffff" : "#000000"
                    }}
                  >
                    {bannerButtonText}
                  </button>
                )}
              </div>
            )}
          </div>
        </section>
      );
    }

    if (segmentId === 'solutions') {
      const getLayoutClasses = () => {
        switch (solutionsLayout) {
          case '1-col':
            return 'grid-cols-1';
          case '3-col':
            return 'md:grid-cols-2 lg:grid-cols-3';
          case '2-col':
          default:
            return 'md:grid-cols-2';
        }
      };

      return (
        <section key="solutions" id="solutions" className="py-16 bg-background">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {solutionsTitle || "Solutions"}
              </h2>
              {solutionsSubtext && (
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  {solutionsSubtext}
                </p>
              )}
            </div>

            <div className={`grid ${getLayoutClasses()} gap-8`}>
              {solutionsItems.map((item: any, index: number) => (
                <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
                  {item.imageUrl && (
                    <div className="w-full h-64 overflow-hidden">
                      <img 
                        src={item.imageUrl} 
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 whitespace-pre-line">
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

    // Dynamic segments
    const dynamicSegment = pageSegments.find((seg, idx) => `segment-${idx}` === segmentId);
    if (!dynamicSegment) return null;

    if (dynamicSegment.type === 'tiles') {
      const data = dynamicSegment.data;
      return (
        <section key={segmentId} className="py-8 bg-gray-50">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {data.title}
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                {data.description}
              </p>
            </div>
          </div>

          <div className="container mx-auto px-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
              {data.items?.map((item: any, index: number) => {
                const IconComponent = item.icon ? iconMap[item.icon] : null;
                
                return (
                  <div 
                    key={index}
                    className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200 flex flex-col overflow-hidden group"
                  >
                    {IconComponent && (
                      <div className="w-full flex justify-center pt-8">
                        <div className="relative">
                          <div className="w-20 h-20 bg-[#f9dc24]/10 rounded-full flex items-center justify-center border-2 border-[#f9dc24]/20 shadow-lg group-hover:shadow-xl group-hover:bg-[#f9dc24]/20 group-hover:border-[#f9dc24]/40 transition-all duration-500 ease-out group-hover:-translate-y-1 group-hover:scale-105">
                            <IconComponent 
                              size={36} 
                              className="text-black group-hover:text-gray-900 group-hover:scale-125 transition-all duration-300" 
                              strokeWidth={1.8}
                            />
                          </div>
                          <div className="absolute inset-0 w-20 h-20 bg-[#f9dc24] rounded-full opacity-0 group-hover:opacity-15 transition-opacity duration-500 blur-xl" />
                        </div>
                      </div>
                    )}
                    
                    {item.imageUrl && (
                      <div className={`w-full h-[200px] overflow-hidden ${IconComponent ? 'mt-4' : ''}`}>
                        <img 
                          src={item.imageUrl} 
                          alt={item.title} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    
                    <div className={`p-8 flex flex-col items-center text-center flex-1 ${!IconComponent && !item.imageUrl ? 'pt-8' : ''}`}>
                      <h3 className="text-xl font-bold text-gray-900 mb-4 leading-tight">
                        {item.title}
                      </h3>
                      
                      <p className="text-base text-gray-600 leading-relaxed mb-6 flex-1">
                        {item.description}
                      </p>
                   
                    {item.ctaLink && item.ctaLink.trim() ? (
                      item.ctaLink.startsWith('http://') || item.ctaLink.startsWith('https://') ? (
                        <a 
                          href={item.ctaLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full"
                        >
                          <button
                            className="w-full px-4 py-2 rounded-md border-0 font-medium text-lg transition-opacity hover:opacity-90"
                            style={{
                              backgroundColor: item.ctaStyle === "technical" ? "#1f2937" : "#f9dc24",
                              color: item.ctaStyle === "technical" ? "white" : "black"
                            }}
                          >
                            {item.ctaText || 'Learn More'}
                          </button>
                        </a>
                      ) : (
                        <Link to={item.ctaLink} className="w-full">
                          <button
                            className="w-full px-4 py-2 rounded-md border-0 font-medium text-lg transition-opacity hover:opacity-90"
                            style={{
                              backgroundColor: item.ctaStyle === "technical" ? "#1f2937" : "#f9dc24",
                              color: item.ctaStyle === "technical" ? "white" : "black"
                            }}
                          >
                            {item.ctaText || 'Learn More'}
                          </button>
                        </Link>
                      )
                    ) : (
                      <button
                        className="w-full px-4 py-2 rounded-md border-0 font-medium text-lg transition-opacity hover:opacity-90"
                        style={{
                          backgroundColor: item.ctaStyle === "technical" ? "#1f2937" : "#f9dc24",
                          color: item.ctaStyle === "technical" ? "white" : "black"
                        }}
                      >
                        {item.ctaText || 'Learn More'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
      );
    }

    if (dynamicSegment.type === 'banner') {
      const data = dynamicSegment.data;
      return (
        <section key={segmentId} className="py-16" style={{ backgroundColor: '#f3f3f5' }}>
          <div className="container mx-auto px-6">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 text-center">
              {data.title}
            </h2>
            
            {data.subtext && (
              <p className="text-lg text-gray-600 mb-12 text-center mx-auto" style={{ maxWidth: '600px' }}>
                {data.subtext}
              </p>
            )}
            
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 mb-12">
              {data.images?.map((image: any, index: number) => (
                <div key={index} className="flex items-center justify-center h-24 w-40">
                  <img 
                    src={image.url} 
                    alt={image.alt || `Banner image ${index + 1}`}
                    className="max-h-full max-w-full object-contain filter grayscale hover:grayscale-0 transition-all duration-300"
                  />
                </div>
              ))}
            </div>

            {data.buttonText && (
              <div className="flex justify-center">
                {data.buttonLink ? (
                  data.buttonLink.startsWith('http://') || data.buttonLink.startsWith('https://') ? (
                    <a 
                      href={data.buttonLink}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <button
                        className="px-8 py-4 text-lg font-medium rounded-md border-0 shadow-soft hover:shadow-lg transition-all duration-300"
                        style={{
                          backgroundColor: data.buttonStyle === "technical" ? "#1f2937" : "#f9dc24",
                          color: data.buttonStyle === "technical" ? "#ffffff" : "#000000"
                        }}
                      >
                        {data.buttonText}
                      </button>
                    </a>
                  ) : (
                    <Link to={data.buttonLink}>
                      <button
                        className="px-8 py-4 text-lg font-medium rounded-md border-0 shadow-soft hover:shadow-lg transition-all duration-300"
                        style={{
                          backgroundColor: data.buttonStyle === "technical" ? "#1f2937" : "#f9dc24",
                          color: data.buttonStyle === "technical" ? "#ffffff" : "#000000"
                        }}
                      >
                        {data.buttonText}
                      </button>
                    </Link>
                  )
                ) : (
                  <button
                    className="px-8 py-4 text-lg font-medium rounded-md border-0 shadow-soft hover:shadow-lg transition-all duration-300"
                    style={{
                      backgroundColor: data.buttonStyle === "technical" ? "#1f2937" : "#f9dc24",
                      color: data.buttonStyle === "technical" ? "#ffffff" : "#000000"
                    }}
                  >
                    {data.buttonText}
                  </button>
                )}
              </div>
            )}
          </div>
        </section>
      );
    }

    if (dynamicSegment.type === 'image-text') {
      const data = dynamicSegment.data;
      const getLayoutClasses = () => {
        switch (data.layout) {
          case '1-col':
            return 'grid-cols-1';
          case '3-col':
            return 'md:grid-cols-2 lg:grid-cols-3';
          case '2-col':
          default:
            return 'md:grid-cols-2';
        }
      };

      return (
        <section key={segmentId} className="py-16 bg-background">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {data.title}
              </h2>
              {data.subtext && (
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  {data.subtext}
                </p>
              )}
            </div>

            <div className={`grid ${getLayoutClasses()} gap-8`}>
              {data.items?.map((item: any, index: number) => (
                <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
                  {item.imageUrl && (
                    <div className="w-full h-64 overflow-hidden">
                      <img 
                        src={item.imageUrl} 
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 whitespace-pre-line">
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

    return null;
  };

  // Get padding class based on heroTopPadding
  const getPaddingClass = () => {
    switch (heroTopPadding) {
      case 'small': return 'pt-16';
      case 'medium': return 'pt-24';
      case 'large': return 'pt-32';
      case 'xlarge': return 'pt-40';
      default: return 'pt-24';
    }
  };

  // Get layout grid classes
  const getLayoutGridClasses = () => {
    switch (heroLayout) {
      case '5-5': return 'md:grid-cols-2';
      case '2-3': return heroImagePosition === 'left' ? 'md:grid-cols-[2fr,3fr]' : 'md:grid-cols-[3fr,2fr]';
      case '2-5': return heroImagePosition === 'left' ? 'md:grid-cols-[2fr,5fr]' : 'md:grid-cols-[5fr,2fr]';
      default: return 'md:grid-cols-2';
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section - Produkt-Hero Template */}
      <section className={`${getPaddingClass()} pb-8 bg-background`}>
        <div className="container mx-auto px-6">
          <div className={`grid ${getLayoutGridClasses()} gap-12 items-center`}>
            {heroImagePosition === 'left' && heroImageUrl && (
              <div className="relative h-[500px] rounded-lg overflow-hidden shadow-2xl order-1">
                <img 
                  src={heroImageUrl} 
                  alt={content.hero_title || "Hero"}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            <div className={heroImagePosition === 'left' ? 'order-2' : 'order-1'}>
              <div className="inline-block mb-4">
                <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                  {content.hero_subtitle || "Industries"}
                </span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                {content.hero_title || "Scanners & Archiving"}
              </h1>
              
              <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed max-w-2xl">
                {content.hero_description || "Quality assurance in digitization of documents, books, and photos."}
              </p>
              
              {content.hero_cta && (
                heroCtaLink.startsWith('http://') || heroCtaLink.startsWith('https://') ? (
                  <a 
                    href={heroCtaLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <button
                      className="px-8 py-4 text-lg font-medium rounded-md border-0 shadow-soft hover:shadow-lg transition-all duration-300"
                      style={{
                        backgroundColor: heroCtaStyle === "technical" ? "#1f2937" : "#f9dc24",
                        color: heroCtaStyle === "technical" ? "#ffffff" : "#000000"
                      }}
                    >
                      {content.hero_cta}
                    </button>
                  </a>
                ) : (
                  <a href={heroCtaLink}>
                    <button
                      className="px-8 py-4 text-lg font-medium rounded-md border-0 shadow-soft hover:shadow-lg transition-all duration-300"
                      style={{
                        backgroundColor: heroCtaStyle === "technical" ? "#1f2937" : "#f9dc24",
                        color: heroCtaStyle === "technical" ? "#ffffff" : "#000000"
                      }}
                    >
                      {content.hero_cta}
                    </button>
                  </a>
                )
              )}
            </div>

            {heroImagePosition === 'right' && heroImageUrl && (
              <div className="relative h-[500px] rounded-lg overflow-hidden shadow-2xl order-2">
                <img 
                  src={heroImageUrl} 
                  alt={content.hero_title || "Hero"}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Render segments in tabOrder */}
      {tabOrder.map((segmentId) => renderSegment(segmentId))}

      <Footer />
    </div>
  );
};

export default ScannersArchiving;
