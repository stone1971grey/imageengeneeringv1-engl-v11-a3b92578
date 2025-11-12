import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Expand, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface ProductImage {
  imageUrl: string;
  title: string;
  description: string;
}

interface ProductHeroGalleryProps {
  data: {
    title: string;
    subtitle: string;
    description: string;
    cta1Text: string;
    cta1Link: string;
    cta1Style: 'standard' | 'technical' | 'outline-white';
    cta2Text: string;
    cta2Link: string;
    cta2Style: 'standard' | 'technical' | 'outline-white';
    images: ProductImage[];
  };
}

const ProductHeroGallery = ({ data }: ProductHeroGalleryProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getButtonStyle = (style: string) => {
    switch (style) {
      case 'technical':
        return { backgroundColor: '#1f2937', color: 'white' };
      case 'outline-white':
        return { 
          backgroundColor: 'white', 
          color: 'black',
          border: '1px solid #e5e5e5'
        };
      default:
        return { backgroundColor: '#f9dc24', color: 'black' };
    }
  };

  const renderButton = (text: string, link: string, style: string, size: string = 'lg') => {
    const buttonStyle = getButtonStyle(style);
    const buttonClasses = `border-0 px-8 py-4 text-lg font-medium shadow-soft transition-all duration-300 group ${
      style === 'outline-white' ? 'hover:bg-black hover:text-white' : 'hover:shadow-lg'
    }`;

    const buttonElement = (
      <Button 
        size={size as any}
        className={buttonClasses}
        style={buttonStyle}
      >
        {text}
      </Button>
    );

    if (link.startsWith('http://') || link.startsWith('https://')) {
      return (
        <a href={link} target="_blank" rel="noopener noreferrer">
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

  return (
    <section className="min-h-[60vh] bg-scandi-white font-roboto relative overflow-hidden">
      {/* Animated background light effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-soft-blue/20 to-accent-soft-blue/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-gradient-to-l from-soft-blue/15 to-accent-soft-blue/15 rounded-full blur-2xl animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>
      
      <div className="container mx-auto px-6 py-6 lg:py-10 pt-3 md:pt-14 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Content */}
          <div className="space-y-8">
            <div>
              <h1 className="text-5xl lg:text-6xl xl:text-7xl font-light leading-[0.9] tracking-tight mb-6 text-gray-900 mt-8 md:mt-0">
                {data.title}
                <br />
                <span className="font-medium text-gray-900">{data.subtitle}</span>
              </h1>
              
              <p className="text-xl lg:text-2xl text-gray-700 font-light leading-relaxed max-w-lg">
                {data.description}
              </p>
            </div>
            
            <div className="pt-4 flex gap-4">
              {data.cta1Text && renderButton(data.cta1Text, data.cta1Link, data.cta1Style)}
              {data.cta2Text && renderButton(data.cta2Text, data.cta2Link, data.cta2Style)}
            </div>
          </div>

          {/* Right Product Image Gallery */}
          <div className="relative">
            <div className="relative overflow-hidden rounded-lg shadow-soft group cursor-pointer" onClick={() => setIsModalOpen(true)}>
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
        </div>
      </div>

      {/* Image Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-[90vw] max-h-[90vh] p-0">
          <div className="relative">
            <img 
              src={data.images[currentImageIndex]?.imageUrl} 
              alt={data.images[currentImageIndex]?.title || data.title}
              className="w-full h-full object-contain"
            />
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default ProductHeroGallery;
