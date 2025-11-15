import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import AnnouncementBanner from "@/components/AnnouncementBanner";
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
import { SEOHead } from "@/components/SEOHead";
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
  const [tilesColumns, setTilesColumns] = useState<string>("3");
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
  const [hasHeroContent, setHasHeroContent] = useState(false);
  const [segmentIdMap, setSegmentIdMap] = useState<Record<string, number>>({});
  const [seoData, setSeoData] = useState<any>({});

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    const { data, error } = await supabase
      .from("page_content")
      .select("*")
      .eq("page_slug", "scanners-archiving");

    // Load segment registry for ID mapping
    const { data: segmentData } = await supabase
      .from("segment_registry")
      .select("*")
      .eq("page_slug", "scanners-archiving");

    if (segmentData) {
      const idMap: Record<string, number> = {};
      segmentData.forEach((seg: any) => {
        idMap[seg.segment_key] = seg.segment_id;
      });
      setSegmentIdMap(idMap);
    }

    if (!error && data) {
      const contentMap: Record<string, string> = {};
      let heroExists = false;

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
          heroExists = true;
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
        } else if (item.section_key === "hero_title") {
          contentMap[item.section_key] = item.content_value;
          heroExists = true;
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
        } else if (item.section_key === "tiles_columns") {
          setTilesColumns(item.content_value || "3");
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
        } else if (item.section_key === "seo_settings") {
          try {
            const seoSettings = JSON.parse(item.content_value);
            setSeoData(seoSettings);
          } catch {
            // Keep empty seo data
          }
        } else {
          contentMap[item.section_key] = item.content_value;
        }
      });

      setContent(contentMap);
      setHasHeroContent(heroExists);
    }

    setLoading(false);
  };

  const renderSegment = (segmentId: string) => {
    // Check if it's a dynamic segment
    const dynamicSegment = pageSegments.find(seg => seg.id === segmentId);
    if (dynamicSegment) {
      if (dynamicSegment.type === 'meta-navigation') {
        return <MetaNavigation key={segmentId} data={dynamicSegment.data} segmentIdMap={segmentIdMap} />;
      }
      if (dynamicSegment.type === 'product-hero-gallery') {
        return <ProductHeroGallery key={segmentId} id={segmentId} data={dynamicSegment.data} />;
      }
      if (dynamicSegment.type === 'feature-overview') {
        return <FeatureOverview key={segmentId} id={segmentId} {...dynamicSegment.data} />;
      }
      if (dynamicSegment.type === 'table') {
        return <Table key={segmentId} id={segmentId} {...dynamicSegment.data} />;
      }
      if (dynamicSegment.type === 'faq') {
        return <FAQ key={segmentId} id={segmentId} {...dynamicSegment.data} />;
      }
      if (dynamicSegment.type === 'specification') {
        return <Specification key={segmentId} id={segmentId} {...dynamicSegment.data} />;
      }
      if (dynamicSegment.type === 'full-hero') {
        return <FullHero key={segmentId} {...dynamicSegment.data} />;
      }
      if (dynamicSegment.type === 'intro') {
        return <Intro key={segmentId} {...dynamicSegment.data} />;
      }
      if (dynamicSegment.type === 'industries') {
        return <IndustriesSegment key={segmentId} {...dynamicSegment.data} />;
      }
      if (dynamicSegment.type === 'banner') {
        return (
          <section key={segmentId} id={segmentId} className="py-16" style={{ backgroundColor: '#f3f3f5' }}>
            <div className="container mx-auto px-4 text-center">
              {dynamicSegment.data.title && (
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  {dynamicSegment.data.title}
                </h2>
              )}
              {dynamicSegment.data.subtext && (
                <p className="text-lg text-gray-600 mb-12 max-w-2xl mx-auto">
                  {dynamicSegment.data.subtext}
                </p>
              )}
              {dynamicSegment.data.images && dynamicSegment.data.images.length > 0 && (
                <div className="flex flex-wrap justify-center items-center gap-8 mb-12">
                  {dynamicSegment.data.images.map((image: any, index: number) => (
                    <div key={index} className="h-16 flex items-center">
                      <img 
                        src={image.url}
                        alt={image.alt || `Banner image ${index + 1}`}
                        className="max-h-full max-w-full object-contain filter grayscale hover:grayscale-0 transition-all duration-300"
                      />
                    </div>
                  ))}
                </div>
              )}
              {dynamicSegment.data.buttonText && (
                <div className="flex justify-center">
                  {dynamicSegment.data.buttonLink ? (
                    dynamicSegment.data.buttonLink.startsWith('http://') || dynamicSegment.data.buttonLink.startsWith('https://') ? (
                      <a
                        href={dynamicSegment.data.buttonLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block px-8 py-4 rounded-md text-lg font-medium transition-all duration-300 hover:scale-105"
                        style={{
                          backgroundColor: dynamicSegment.data.buttonStyle === "technical" ? "#1f2937" : "#f9dc24",
                          color: dynamicSegment.data.buttonStyle === "technical" ? "#ffffff" : "#000000"
                        }}
                      >
                        {dynamicSegment.data.buttonText}
                      </a>
                    ) : (
                      <Link to={dynamicSegment.data.buttonLink}>
                        <button 
                          className="px-8 py-4 rounded-md text-lg font-medium transition-all duration-300 hover:scale-105"
                          style={{
                            backgroundColor: dynamicSegment.data.buttonStyle === "technical" ? "#1f2937" : "#f9dc24",
                            color: dynamicSegment.data.buttonStyle === "technical" ? "#ffffff" : "#000000"
                          }}
                        >
                          {dynamicSegment.data.buttonText}
                        </button>
                      </Link>
                    )
                  ) : (
                    <button 
                      className="px-8 py-4 rounded-md text-lg font-medium transition-all duration-300 hover:scale-105"
                      style={{
                        backgroundColor: dynamicSegment.data.buttonStyle === "technical" ? "#1f2937" : "#f9dc24",
                        color: dynamicSegment.data.buttonStyle === "technical" ? "#ffffff" : "#000000"
                      }}
                    >
                      {dynamicSegment.data.buttonText}
                    </button>
                  )}
                </div>
              )}
            </div>
          </section>
        );
      }
      if (dynamicSegment.type === 'image-text') {
        return (
          <section key={segmentId} id={segmentId} className="bg-gray-50 py-20">
            <div className="w-full px-6">
              {(dynamicSegment.data.title || dynamicSegment.data.subtext) && (
                <div className="text-center mb-16">
                  {dynamicSegment.data.title && (
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                      {dynamicSegment.data.title}
                    </h2>
                  )}
                  {dynamicSegment.data.subtext && (
                    <p className="text-xl text-gray-600 max-w-4xl mx-auto">
                      {dynamicSegment.data.subtext}
                    </p>
                  )}
                </div>
              )}
              {dynamicSegment.data.items && dynamicSegment.data.items.length > 0 && (
                <div className={`grid gap-8 max-w-7xl mx-auto ${
                  dynamicSegment.data.layout === "1-col" ? "grid-cols-1" :
                  dynamicSegment.data.layout === "2-col" ? "grid-cols-1 md:grid-cols-2" :
                  "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                }`}>
                  {dynamicSegment.data.items.map((item: any, index: number) => (
                    <Card key={index} className="bg-white border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden">
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
      }
      if (dynamicSegment.type === 'tiles') {
        const tilesData = dynamicSegment.data;
        return (
          <section key={segmentId} id={segmentId} className="py-8 bg-gray-50">
            <div className="container mx-auto px-6">
              <div className="text-center mb-16">
                {tilesData.title && (
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                    {tilesData.title}
                  </h2>
                )}
                {tilesData.description && (
                  <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                    {tilesData.description}
                  </p>
                )}
              </div>
            </div>
            <div className="container mx-auto px-6">
              <div className={`grid gap-8 max-w-7xl mx-auto ${
                tilesData.columns === "2" ? "md:grid-cols-2" :
                tilesData.columns === "4" ? "md:grid-cols-2 lg:grid-cols-4" :
                "md:grid-cols-2 lg:grid-cols-3"
              }`}>
                {tilesData.items?.map((app: any, index: number) => {
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
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        );
      }
    }

    // Static Tiles segment
    if (segmentId === 'tiles') {
      if (!tilesData.title && tilesData.items.length === 0) return null;
      
      return (
        <section key="tiles" id={segmentIdMap['tiles']?.toString() || 'tiles'} className="py-8 bg-gray-50">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              {tilesData.title && (
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  {tilesData.title}
                </h2>
              )}
              {tilesData.subtext && (
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                  {tilesData.subtext}
                </p>
              )}
            </div>
          </div>

          <div className="container mx-auto px-6">
            <div className={`grid gap-8 max-w-7xl mx-auto ${
              tilesColumns === "2" ? "md:grid-cols-2" :
              tilesColumns === "4" ? "md:grid-cols-2 lg:grid-cols-4" :
              "md:grid-cols-2 lg:grid-cols-3"
            }`}>
              {tilesData.items?.map((app: any, index: number) => {
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
                         <a href={app.ctaLink} className="w-full">
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

    // Static Banner segment
    if (segmentId === 'banner') {
      if (!bannerData.title && bannerData.images.length === 0) return null;
      
      return (
        <section key="banner" id={segmentIdMap['banner']?.toString() || 'banner'} className="py-16" style={{ backgroundColor: '#f3f3f5' }}>
          <div className="container mx-auto px-6">
            {bannerData.title && (
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 text-center">
                {bannerData.title}
              </h2>
            )}
            
            {bannerData.subtext && (
              <p className="text-lg text-gray-600 mb-12 text-center mx-auto" style={{ maxWidth: '600px' }}>
                {bannerData.subtext}
              </p>
            )}
            
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 mb-12">
              {bannerData.images.map((image: any, index: number) => (
                <div key={index} className="flex items-center justify-center h-24 w-40">
                  <img 
                    src={image.url} 
                    alt={image.alt || `Banner image ${index + 1}`}
                    className="max-h-full max-w-full object-contain filter grayscale hover:grayscale-0 transition-all duration-300"
                  />
                </div>
              ))}
            </div>

            {bannerData.buttonText && (
              <div className="flex justify-center">
                {bannerData.buttonLink ? (
                  bannerData.buttonLink.startsWith('http://') || bannerData.buttonLink.startsWith('https://') ? (
                    <a 
                      href={bannerData.buttonLink}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <button
                        className="px-8 py-4 text-lg font-medium rounded-md border-0 shadow-soft hover:shadow-lg transition-all duration-300"
                        style={{
                          backgroundColor: bannerData.buttonStyle === "technical" ? "#1f2937" : "#f9dc24",
                          color: bannerData.buttonStyle === "technical" ? "#ffffff" : "#000000"
                        }}
                      >
                        {bannerData.buttonText}
                      </button>
                    </a>
                  ) : (
                    <a href={bannerData.buttonLink}>
                      <button
                        className="px-8 py-4 text-lg font-medium rounded-md border-0 shadow-soft hover:shadow-lg transition-all duration-300"
                        style={{
                          backgroundColor: bannerData.buttonStyle === "technical" ? "#1f2937" : "#f9dc24",
                          color: bannerData.buttonStyle === "technical" ? "#ffffff" : "#000000"
                        }}
                      >
                        {bannerData.buttonText}
                      </button>
                    </a>
                  )
                ) : (
                  <button
                    className="px-8 py-4 text-lg font-medium rounded-md border-0 shadow-soft hover:shadow-lg transition-all duration-300"
                    style={{
                      backgroundColor: bannerData.buttonStyle === "technical" ? "#1f2937" : "#f9dc24",
                      color: bannerData.buttonStyle === "technical" ? "#ffffff" : "#000000"
                    }}
                  >
                    {bannerData.buttonText}
                  </button>
                )}
              </div>
            )}
          </div>
        </section>
      );
    }

    // Static Solutions/Image-Text segment
    if (segmentId === 'solutions') {
      if (!solutionsData.title && solutionsData.items.length === 0) return null;
      
      return (
        <section key="solutions" id={segmentIdMap['solutions']?.toString() || 'solutions'} className="py-20 bg-gray-50">
          <div className="w-full px-6">
            <div className="text-center mb-16">
              {solutionsData.title && (
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  {solutionsData.title}
                </h2>
              )}
              {solutionsData.subtext && (
                <p className="text-xl text-gray-600 max-w-4xl mx-auto">
                  {solutionsData.subtext}
                </p>
              )}
            </div>

            <div className={`grid gap-8 max-w-7xl mx-auto ${
              solutionsData.layout === "1-col" ? "grid-cols-1" :
              solutionsData.layout === "2-col" ? "grid-cols-1 md:grid-cols-2" :
              "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
            }`}>
              {solutionsData.items?.map((item: any, index: number) => (
                <Card key={index} className="bg-white border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden">
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
          </div>
        </section>
      );
    }

    // Dynamic segments - find by ID
    const segment = pageSegments.find(s => s.id === segmentId);
    if (!segment) return null;

    if (segment.type === 'tiles') {
      return (
          <section key={segmentId} id={segmentId} className="py-8 bg-gray-50">
            <div className="container mx-auto px-6">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  {segment.data.title || "Section Title"}
                </h2>
                {segment.data.description && (
                  <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                    {segment.data.description}
                  </p>
                )}
              </div>
            </div>

            <div className="container mx-auto px-6">
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
                {segment.data.items?.map((item: any, itemIndex: number) => {
                  const IconComponent = item.icon ? iconMap[item.icon] : null;
                  
                  return (
                    <div 
                      key={itemIndex}
                      className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200 flex flex-col overflow-hidden group"
                    >
                      {item.imageUrl && (
                        <div className="w-full h-[200px] overflow-hidden">
                          <img 
                            src={item.imageUrl} 
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}

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

                      <div className="p-6 flex flex-col flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-3 transition-colors group-hover:text-[#f9dc24]">
                          {item.title}
                        </h3>
                        <p className="text-lg text-gray-600 leading-relaxed mb-6 flex-1">
                          {item.description}
                        </p>
                        {item.ctaLink && (
                          item.ctaLink.startsWith('http://') || item.ctaLink.startsWith('https://') ? (
                            <a 
                              href={item.ctaLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full"
                            >
                              <button
                                className="w-full px-8 py-3 text-lg font-medium rounded-md shadow-sm hover:shadow-md transition-all duration-300"
                                style={{ 
                                  backgroundColor: item.ctaStyle === "technical" ? "#1f2937" : "#f9dc24",
                                  color: item.ctaStyle === "technical" ? "white" : "black"
                                }}
                              >
                                {item.ctaText || 'Learn More'}
                              </button>
                            </a>
                          ) : (
                            <a href={item.ctaLink} className="w-full">
                              <button
                                className="w-full px-8 py-3 text-lg font-medium rounded-md shadow-sm hover:shadow-md transition-all duration-300"
                                style={{ 
                                  backgroundColor: item.ctaStyle === "technical" ? "#1f2937" : "#f9dc24",
                                  color: item.ctaStyle === "technical" ? "white" : "black"
                                }}
                              >
                                {item.ctaText || 'Learn More'}
                              </button>
                            </a>
                          )
                        )}
                        {!item.ctaLink && item.ctaText && (
                          <button
                            className="w-full px-8 py-3 text-lg font-medium rounded-md shadow-sm hover:shadow-md transition-all duration-300"
                            style={{ 
                              backgroundColor: item.ctaStyle === "technical" ? "#1f2937" : "#f9dc24",
                              color: item.ctaStyle === "technical" ? "white" : "black"
                            }}
                          >
                            {item.ctaText}
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
      
      if (segment.type === 'image-text') {
        return (
          <section key={segmentId} id={segment.id?.toString() || segmentId} className="py-20 bg-gray-50">
            <div className="w-full px-6">
              {segment.data.heroImageUrl && (
                <div className="mb-12 max-w-7xl mx-auto">
                  <img 
                    src={segment.data.heroImageUrl}
                    alt={segment.data.title || "Section hero"}
                    className="w-full h-[400px] object-cover rounded-lg shadow-lg"
                  />
                </div>
              )}
              
              <div className="text-center mb-16">
                {segment.data.title && (
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                    {segment.data.title}
                  </h2>
                )}
                {segment.data.subtext && (
                  <p className="text-xl text-gray-600 max-w-4xl mx-auto">
                    {segment.data.subtext}
                  </p>
                )}
              </div>

              <div className={`grid gap-8 max-w-7xl mx-auto ${
                segment.data.layout === "1-col" ? "grid-cols-1" :
                segment.data.layout === "2-col" ? "grid-cols-1 md:grid-cols-2" :
                "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
              }`}>
                {segment.data.items?.map((item: any, itemIndex: number) => (
                  <Card key={itemIndex} className="bg-white border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden">
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
            </div>
          </section>
        );
      }

      if (segment.type === 'feature-overview') {
        return (
          <FeatureOverview
            key={segmentId}
            id={segment.id?.toString() || segmentId}
            title={segment.data.title}
            subtext={segment.data.subtext}
            layout={segment.data.layout}
            items={segment.data.items}
          />
        );
      }

      if (segment.type === 'table') {
        return (
          <Table
            key={segmentId}
            id={segment.id?.toString() || segmentId}
            title={segment.data.title}
            subtext={segment.data.subtext}
            headers={segment.data.headers}
            rows={segment.data.rows}
          />
        );
      }

      if (segment.type === 'banner') {
        return (
          <section key={segmentId} id="standards" className="py-16" style={{ backgroundColor: '#f3f3f5' }}>
            <div className="container mx-auto px-6">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 text-center">
                {segment.data.title || ""}
              </h2>
              
              {segment.data.subtext && (
                <p className="text-lg text-gray-600 mb-12 text-center mx-auto" style={{ maxWidth: '600px' }}>
                  {segment.data.subtext}
                </p>
              )}
              
              <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 mb-12">
                {segment.data.images?.map((image: any, index: number) => (
                  <div key={index} className="flex items-center justify-center h-24 w-40">
                    <img 
                      src={image.url} 
                      alt={image.alt || `Banner image ${index + 1}`}
                      className="max-h-full max-w-full object-contain filter grayscale hover:grayscale-0 transition-all duration-300"
                    />
                  </div>
                ))}
              </div>

              {segment.data.buttonText && (
                <div className="flex justify-center">
                  {segment.data.buttonLink ? (
                    segment.data.buttonLink.startsWith('http://') || segment.data.buttonLink.startsWith('https://') ? (
                      <a 
                        href={segment.data.buttonLink}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <button
                          className="px-8 py-4 text-lg font-medium rounded-md border-0 shadow-soft hover:shadow-lg transition-all duration-300"
                          style={{
                            backgroundColor: segment.data.buttonStyle === "technical" ? "#1f2937" : "#f9dc24",
                            color: segment.data.buttonStyle === "technical" ? "#ffffff" : "#000000"
                          }}
                        >
                          {segment.data.buttonText}
                        </button>
                      </a>
                    ) : (
                      <a href={segment.data.buttonLink}>
                        <button
                          className="px-8 py-4 text-lg font-medium rounded-md border-0 shadow-soft hover:shadow-lg transition-all duration-300"
                          style={{
                            backgroundColor: segment.data.buttonStyle === "technical" ? "#1f2937" : "#f9dc24",
                            color: segment.data.buttonStyle === "technical" ? "#ffffff" : "#000000"
                          }}
                        >
                          {segment.data.buttonText}
                        </button>
                      </a>
                    )
                  ) : (
                    <button
                      className="px-8 py-4 text-lg font-medium rounded-md border-0 shadow-soft hover:shadow-lg transition-all duration-300"
                      style={{
                        backgroundColor: segment.data.buttonStyle === "technical" ? "#1f2937" : "#f9dc24",
                        color: segment.data.buttonStyle === "technical" ? "#ffffff" : "#000000"
                      }}
                    >
                      {segment.data.buttonText}
                    </button>
                  )}
                </div>
              )}
            </div>
          </section>
        );
      }

    return null;
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* SEO Meta Tags */}
      <SEOHead
        title={seoData.title}
        description={seoData.metaDescription}
        canonical={seoData.canonical}
        ogTitle={seoData.ogTitle}
        ogDescription={seoData.ogDescription}
        ogImage={seoData.ogImage}
        twitterCard={seoData.twitterCard}
        robotsIndex={seoData.robotsIndex}
        robotsFollow={seoData.robotsFollow}
      />
      
      <Navigation />

      {/* MANDATORY: Meta Navigation - Always First (Below Nav Bar) */}
      {tabOrder
        .filter(segmentId => {
          const dynamicSegment = pageSegments.find(seg => seg.id === segmentId);
          return dynamicSegment && dynamicSegment.type === 'meta-navigation';
        })
        .map(segmentId => renderSegment(segmentId))}

      <AnnouncementBanner 
        message={content.banner_message || ""}
        ctaText={content.banner_cta || "Learn more"}
        ctaLink={content.banner_link || "#"}
        icon="calendar"
      />

      {/* Hero Section - Product Hero Template - Only render if hero content exists */}
      {hasHeroContent && (
        <section id="hero" className="min-h-[60vh] bg-white font-roboto relative overflow-hidden py-8">
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
      )}

      {/* Dynamic Segments (excluding meta-navigation already rendered above) */}
      {tabOrder
        .filter(segmentId => {
          const dynamicSegment = pageSegments.find(seg => seg.id === segmentId);
          return !(dynamicSegment && dynamicSegment.type === 'meta-navigation');
        })
        .map((segmentId) => renderSegment(segmentId))}

      <Footer />
    </div>
  );
};

export default ScannersArchiving;
