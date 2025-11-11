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

interface PageSegment {
  id: string;
  type: 'hero' | 'tiles' | 'banner' | 'image-text';
  position: number;
  data: any;
}

const Photography = () => {
  const [segments, setSegments] = useState<PageSegment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSegments();
  }, []);

  const loadSegments = async () => {
    const { data, error } = await supabase
      .from("page_content")
      .select("*")
      .eq("page_slug", "photography")
      .eq("section_key", "page_segments");

    if (!error && data && data.length > 0) {
      const loadedSegments = JSON.parse(data[0].content_value);
      setSegments(loadedSegments.sort((a: PageSegment, b: PageSegment) => a.position - b.position));
    }
    
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="flex items-center justify-center h-96">
          <p className="text-lg">Loading...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      
      {segments.map((segment) => (
        <div key={segment.id}>
          {segment.type === 'hero' && <HeroSegment data={segment.data} />}
          {segment.type === 'tiles' && <TilesSegment data={segment.data} />}
          {segment.type === 'banner' && <BannerSegment data={segment.data} />}
          {segment.type === 'image-text' && <ImageTextSegment data={segment.data} />}
        </div>
      ))}

      <Footer />
    </div>
  );
};

// Hero Segment Component
const HeroSegment = ({ data }: { data: any }) => {
  const getPaddingClass = (padding: string) => {
    switch (padding) {
      case 'small': return 'pt-16';
      case 'medium': return 'pt-24';
      case 'large': return 'pt-32';
      case 'xlarge': return 'pt-40';
      default: return 'pt-24';
    }
  };

  const getLayoutClasses = (layout: string, position: string) => {
    if (layout === '1-1') {
      return position === 'left' 
        ? { text: 'md:w-1/2', image: 'md:w-1/2' }
        : { text: 'md:w-1/2', image: 'md:w-1/2' };
    } else if (layout === '2-3') {
      return position === 'left'
        ? { text: 'md:w-1/3', image: 'md:w-2/3' }
        : { text: 'md:w-2/3', image: 'md:w-1/3' };
    } else if (layout === '2-5') {
      return position === 'left'
        ? { text: 'md:w-2/5', image: 'md:w-3/5' }
        : { text: 'md:w-2/5', image: 'md:w-3/5' };
    }
    return { text: 'md:w-2/5', image: 'md:w-3/5' };
  };

  const layoutClasses = getLayoutClasses(data.layout, data.imagePosition);

  const ctaButton = (
    <button
      onClick={() => {
        if (data.ctaLink?.startsWith('http')) {
          window.open(data.ctaLink, '_blank');
        } else {
          window.location.href = data.ctaLink || '#';
        }
      }}
      style={{
        backgroundColor: data.ctaStyle === 'technical' ? '#1f2937' : '#f9dc24',
        color: data.ctaStyle === 'technical' ? '#ffffff' : '#000000',
        padding: '0.75rem 2rem',
        borderRadius: '0.5rem',
        fontSize: '1.125rem',
        fontWeight: '600',
        border: 'none',
        cursor: 'pointer',
        transition: 'all 0.3s ease'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.opacity = '0.9';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.opacity = '1';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {data.ctaText || 'Learn More'}
    </button>
  );

  return (
    <section className={`py-20 ${getPaddingClass(data.topPadding)}`}>
      <div className="container mx-auto px-4">
        <div className={`flex flex-col ${data.imagePosition === 'left' ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-12`}>
          <div className={`w-full ${layoutClasses.text} space-y-6`}>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              {data.title}
            </h1>
            {data.subtitle && (
              <p className="text-xl text-gray-600 leading-relaxed">
                {data.subtitle}
              </p>
            )}
            <div className="pt-4">
              {ctaButton}
            </div>
          </div>
          
          {data.imageUrl && (
            <div className={`w-full ${layoutClasses.image}`}>
              <div className="relative rounded-2xl overflow-hidden shadow-2xl h-[500px]">
                <img
                  src={data.imageUrl}
                  alt={data.title}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

// Tiles Segment Component
const TilesSegment = ({ data }: { data: any }) => {
  return (
    <section className="py-20 bg-gray-50" id="applications-start">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {data.title}
          </h2>
          {data.subtitle && (
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {data.subtitle}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {data.items && data.items.map((tile: any, index: number) => {
            const IconComponent = iconMap[tile.icon] || FileText;
            
            return (
              <Card key={tile.id || index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                {tile.imageUrl && (
                  <div className="w-full h-[200px] overflow-hidden">
                    <img
                      src={tile.imageUrl}
                      alt={tile.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                <CardContent className="p-8">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mb-6" style={{ backgroundColor: '#f9dc24' }}>
                    <IconComponent className="w-8 h-8 text-black" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    {tile.title}
                  </h3>
                  
                  <p className="text-gray-600 mb-6 leading-relaxed">
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
                      style={{
                        backgroundColor: tile.ctaStyle === 'technical' ? '#1f2937' : '#f9dc24',
                        color: tile.ctaStyle === 'technical' ? '#ffffff' : '#000000',
                        padding: '0.5rem 1.5rem',
                        borderRadius: '0.5rem',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.opacity = '0.9';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.opacity = '1';
                      }}
                    >
                      {tile.ctaText || 'Learn More'}
                    </button>
                  )}

                  {!tile.ctaLink && tile.ctaText && (
                    <button
                      style={{
                        backgroundColor: tile.ctaStyle === 'technical' ? '#1f2937' : '#f9dc24',
                        color: tile.ctaStyle === 'technical' ? '#ffffff' : '#000000',
                        padding: '0.5rem 1.5rem',
                        borderRadius: '0.5rem',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        border: 'none',
                        cursor: 'default'
                      }}
                    >
                      {tile.ctaText}
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
};

// Banner Segment Component
const BannerSegment = ({ data }: { data: any }) => {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {data.title}
          </h2>
          {data.subtext && (
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {data.subtext}
            </p>
          )}
        </div>

        <div className="flex flex-wrap justify-center items-center gap-12 mb-12">
          {data.images && data.images.map((img: any, index: number) => (
            <div 
              key={img.id || index} 
              className="grayscale hover:grayscale-0 transition-all duration-300 cursor-pointer"
            >
              <img
                src={img.url}
                alt={img.alt || `Partner ${index + 1}`}
                className="h-16 w-auto object-contain"
              />
            </div>
          ))}
        </div>

        {data.buttonText && data.buttonLink && (
          <div className="text-center">
            <button
              onClick={() => {
                if (data.buttonLink.startsWith('http')) {
                  window.open(data.buttonLink, '_blank');
                } else {
                  window.location.href = data.buttonLink;
                }
              }}
              style={{
                backgroundColor: data.buttonStyle === 'technical' ? '#1f2937' : '#f9dc24',
                color: data.buttonStyle === 'technical' ? '#ffffff' : '#000000',
                padding: '0.75rem 2rem',
                borderRadius: '0.5rem',
                fontSize: '1.125rem',
                fontWeight: '600',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '0.9';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {data.buttonText}
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

// Image & Text Segment Component
const ImageTextSegment = ({ data }: { data: any }) => {
  const getGridClass = (layout: string) => {
    switch (layout) {
      case '1-col': return 'grid-cols-1';
      case '2-col': return 'grid-cols-1 md:grid-cols-2';
      case '3-col': return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
      default: return 'grid-cols-1 md:grid-cols-2';
    }
  };

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {data.title}
          </h2>
          {data.subtext && (
            <p className="text-xl text-gray-600 max-w-4xl mx-auto">
              {data.subtext}
            </p>
          )}
        </div>

        <div className={`grid ${getGridClass(data.layout)} gap-8 max-w-7xl mx-auto`}>
          {data.items && data.items.map((item: any, index: number) => (
            <Card key={item.id || index} className="border-0 shadow-lg overflow-hidden">
              {item.imageUrl && (
                <div className="w-full h-[300px] overflow-hidden">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {item.title}
                </h3>
                
                <p className="text-gray-600 leading-relaxed">
                  {item.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Photography;
