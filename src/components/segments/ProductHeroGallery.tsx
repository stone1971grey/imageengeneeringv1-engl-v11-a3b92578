import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Expand, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface ProductImage {
  imageUrl: string;
  title: string;
  description: string;
}

interface ProductHeroGalleryProps {
  id?: string;
  hasMetaNavigation?: boolean;
  data: {
    title: string;
    subtitle: string;
    description: string;
    imagePosition?: 'left' | 'right';
    layoutRatio?: '1-1' | '2-3' | '2-5';
    topSpacing?: 'small' | 'medium' | 'large' | 'extra-large';
    cta1Text: string;
    cta1Link: string;
    cta1Style: 'standard' | 'technical' | 'outline-white';
    cta2Text: string;
    cta2Link: string;
    cta2Style: 'standard' | 'technical' | 'outline-white';
    images: ProductImage[];
  };
}

const ProductHeroGallery = ({ id, hasMetaNavigation = false, data }: ProductHeroGalleryProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);

  const imagePosition = data.imagePosition || 'right';
  const layoutRatio = data.layoutRatio || '1-1';
  const topSpacing = data.topSpacing || 'medium';

  // Fixed Navigation ist ~80px hoch + 10px top offset = 90px
  // Meta Navigation (wenn vorhanden) ist ~60px hoch
  // Dazu kommt der gewünschte Abstand: small(30px), medium(50px), large(70px), extra-large(90px)
  const getTopPaddingClass = () => {
    const metaNavOffset = hasMetaNavigation ? 60 : 0;
    switch (topSpacing) {
      case 'small': return hasMetaNavigation ? 'pt-[180px]' : 'pt-[120px]';        // +60px wenn Meta Nav
      case 'medium': return hasMetaNavigation ? 'pt-[200px]' : 'pt-[140px]';       // +60px wenn Meta Nav
      case 'large': return hasMetaNavigation ? 'pt-[220px]' : 'pt-[160px]';        // +60px wenn Meta Nav
      case 'extra-large': return hasMetaNavigation ? 'pt-[240px]' : 'pt-[180px]';  // +60px wenn Meta Nav
      default: return hasMetaNavigation ? 'pt-[200px]' : 'pt-[140px]';             // medium als default
    }
  };

  const getLayoutClasses = () => {
    switch (layoutRatio) {
      case '1-1':
        return 'lg:grid-cols-2';
      case '2-3':
        return 'lg:grid-cols-[2fr_1fr]';
      case '2-5':
        return 'lg:grid-cols-[2fr_3fr]';
      default:
        return 'lg:grid-cols-2';
    }
  };

  const getButtonStyle = (style: string, isHovered: boolean, buttonId: string) => {
    switch (style) {
      case 'technical':
        return { backgroundColor: '#1f2937', color: 'white' };
      case 'outline-white':
        return isHovered && hoveredButton === buttonId
          ? { backgroundColor: 'black', color: 'white', border: '1px solid black' }
          : { backgroundColor: 'white', color: 'black', border: '1px solid #e5e5e5' };
      default:
        return { backgroundColor: '#f9dc24', color: 'black' };
    }
  };

  const isExternalLink = (link: string): boolean => {
    // Check if it starts with protocol
    if (link.startsWith('http://') || link.startsWith('https://')) return true;
    
    // Check if it starts with www.
    if (link.startsWith('www.')) return true;
    
    // Check if it contains a TLD pattern (e.g., example.com, example.de)
    // Must not start with / (internal route) or # (anchor)
    if (!link.startsWith('/') && !link.startsWith('#')) {
      const tldPattern = /\.[a-z]{2,}$/i;
      return tldPattern.test(link);
    }
    
    return false;
  };

  const normalizeExternalLink = (link: string): string => {
    // If already has protocol, return as-is
    if (link.startsWith('http://') || link.startsWith('https://')) {
      return link;
    }
    
    // Add https:// for www. or domain.tld links
    return `https://${link}`;
  };

  const renderButton = (text: string, link: string, style: string, size: string = 'lg', buttonId: string = 'cta1') => {
    const buttonStyle = getButtonStyle(style, true, buttonId);
    const buttonClasses = `border-0 px-8 py-4 text-lg font-medium shadow-soft transition-all duration-300`;

    const buttonElement = (
      <Button 
        size={size as any}
        className={buttonClasses}
        style={buttonStyle}
        onMouseEnter={() => setHoveredButton(buttonId)}
        onMouseLeave={() => setHoveredButton(null)}
      >
        {text}
      </Button>
    );

    if (isExternalLink(link)) {
      return (
        <a href={normalizeExternalLink(link)} target="_blank" rel="noopener noreferrer">
          {buttonElement}
        </a>
      );
    } else if (link.startsWith('#')) {
      return (
        <a
          href={link}
          onClick={(e) => {
            e.preventDefault();
            const element = document.querySelector(link);
            if (element) {
              element.scrollIntoView({ behavior: 'smooth' });
            }
          }}
        >
          {buttonElement}
        </a>
      );
    } else {
      return <Link to={link}>{buttonElement}</Link>;
    }
  };

  const textContent = (
    <div className="space-y-8">
      <div>
        <h1 className="text-5xl lg:text-6xl xl:text-7xl font-light leading-[0.9] tracking-tight mb-6 text-gray-900 mt-8 md:mt-0">
          {data.title}
          <br />
          <span className="font-medium text-gray-900">{data.subtitle}</span>
        </h1>
        
        <p className="text-lg md:text-xl lg:text-2xl text-gray-700 font-light leading-relaxed max-w-2xl">
          {data.description}
        </p>
      </div>
      
      <div className="pt-4 flex gap-4">
        {data.cta1Text && renderButton(data.cta1Text, data.cta1Link, data.cta1Style, 'lg', 'cta1')}
        {data.cta2Text && renderButton(data.cta2Text, data.cta2Link, data.cta2Style, 'lg', 'cta2')}
      </div>
    </div>
  );

  const imageGallery = (
    <div className="relative">
      <div className="relative rounded-lg shadow-soft group cursor-pointer" onClick={() => setIsModalOpen(true)}>
        {/* Animated glow effect behind image */}
        <div className="absolute inset-0 bg-gradient-to-br from-soft-blue/20 via-transparent to-accent-soft-blue/20 animate-pulse"></div>
        
        <img 
          src={data.images[currentImageIndex]?.imageUrl} 
          alt={data.images[currentImageIndex]?.title || data.title}
          className="w-full h-[500px] lg:h-[600px] object-contain bg-white relative z-10 transition-all duration-300"
        />
        
        {/* Subtle overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent z-20"></div>
        
        {/* Moving light beam effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 translate-x-[-100%] animate-[slide-in-right_3s_ease-in-out_infinite] z-30"></div>
        
        {/* Expand Icon Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 flex items-center justify-center z-40">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 rounded-full p-3 shadow-lg">
            <Expand className="w-6 h-6 text-light-foreground" />
          </div>
        </div>
      </div>
      
      {/* Thumbnail Navigation */}
      {data.images.length > 1 && (
        <div className="flex justify-center gap-3 mt-4">
          {data.images.map((image, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`relative aspect-[4/3] w-16 lg:w-20 rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                currentImageIndex === index 
                  ? 'border-accent-soft-blue shadow-md' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <img 
                src={image.imageUrl} 
                alt={image.title || `Image ${index + 1}`}
                className="w-full h-full object-contain bg-white"
              />
            </button>
          ))}
        </div>
      )}
      
      {/* Image Description */}
      {(data.images[currentImageIndex]?.title || data.images[currentImageIndex]?.description) && (
        <div className="text-center mt-4">
          {data.images[currentImageIndex].title && (
            <h4 className="font-medium text-light-foreground mb-1 text-sm lg:text-base">
              {data.images[currentImageIndex].title}
            </h4>
          )}
          {data.images[currentImageIndex].description && (
            <p className="text-xs lg:text-sm text-scandi-grey">
              {data.images[currentImageIndex].description}
            </p>
          )}
        </div>
      )}
    </div>
  );

  return (
    <section
      id={id}
      className={`min-h-[60vh] bg-scandi-white font-roboto relative overflow-hidden border-4 border-dashed border-destructive ${getTopPaddingClass()} pb-4`}
    >
      {/* Animated background light effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-soft-blue/20 to-accent-soft-blue/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-gradient-to-l from-soft-blue/15 to-accent-soft-blue/15 rounded-full blur-2xl animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>
      
      <div className="container mx-auto px-6 relative z-10">
        <div className={`grid ${getLayoutClasses()} gap-16 items-center`}>
          {imagePosition === 'left' ? (
            <>
              {imageGallery}
              {textContent}
            </>
          ) : (
            <>
              {textContent}
              {imageGallery}
            </>
          )}
        </div>
      </div>

      {/* Image Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-5xl max-h-[80vh] p-4 bg-white">
          <div className="relative">
            <img 
              src={data.images[currentImageIndex]?.imageUrl} 
              alt={data.images[currentImageIndex]?.title || data.title}
              className="w-full h-full max-h-[75vh] object-contain"
            />
            
            {/* Navigation Arrows */}
            {data.images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex((prev) => (prev === 0 ? data.images.length - 1 : prev - 1));
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transition-all duration-300 z-50"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-6 h-6 text-gray-800" />
                </button>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex((prev) => (prev === data.images.length - 1 ? 0 : prev + 1));
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transition-all duration-300 z-50"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-6 h-6 text-gray-800" />
                </button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default ProductHeroGallery;
