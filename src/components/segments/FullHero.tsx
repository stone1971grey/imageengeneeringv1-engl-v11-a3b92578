import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { ImageMetadata } from "@/types/imageMetadata";
import { navigateToLink } from "@/lib/utils";

interface FullHeroProps {
  id?: string | number;
  hasMetaNavigation?: boolean;
  titleLine1: string;
  titleLine2: string;
  subtitle: string;
  button1Text?: string;
  button1Link?: string;
  button1Color?: 'yellow' | 'black' | 'white';
  button2Text?: string;
  button2Link?: string;
  button2Color?: 'yellow' | 'black' | 'white';
  backgroundType: 'image' | 'video';
  imageUrl?: string;
  imageAlt?: string;
  imageMetadata?: Omit<ImageMetadata, 'altText'> | null;
  videoUrl?: string;
  imagePosition?: 'left' | 'right';
  layoutRatio?: '1-1' | '2-3' | '2-5';
  topSpacing?: 'small' | 'medium' | 'large' | 'extra-large';
  kenBurnsEffect?: 'none' | 'standard' | 'slow' | 'fast' | 'zoom-out' | 'pan-left' | 'pan-right';
  overlayOpacity?: number;
  useH1?: boolean;
}

const FullHero = ({
  id,
  hasMetaNavigation = false,
  titleLine1,
  titleLine2,
  subtitle,
  button1Text,
  button1Link,
  button1Color = 'yellow',
  button2Text,
  button2Link,
  button2Color = 'black',
  backgroundType,
  imageUrl,
  imageAlt,
  imageMetadata,
  videoUrl,
  imagePosition = 'right',
  layoutRatio = '1-1',
  topSpacing = 'medium',
  kenBurnsEffect = 'standard',
  overlayOpacity = 15,
  useH1 = false,
}: FullHeroProps) => {
  
  const getTopPaddingClass = () => {
    // Navigation ist ~100-120px hoch, Meta Navigation (wenn vorhanden) ist ~60px hoch zusätzlich
    switch (topSpacing) {
      case 'small': return hasMetaNavigation ? 'pt-[190px]' : 'pt-[130px]';
      case 'medium': return hasMetaNavigation ? 'pt-[210px]' : 'pt-[150px]';
      case 'large': return hasMetaNavigation ? 'pt-[230px]' : 'pt-[170px]';
      case 'extra-large': return hasMetaNavigation ? 'pt-[250px]' : 'pt-[190px]';
      default: return hasMetaNavigation ? 'pt-[210px]' : 'pt-[150px]';
    }
  };

  const getLayoutClasses = () => {
    const isImageLeft = imagePosition === 'left';
    switch (layoutRatio) {
      case '1-1':
        return {
          container: 'grid grid-cols-1 lg:grid-cols-2 gap-12 items-center',
          text: 'lg:col-span-1',
          image: 'lg:col-span-1',
          order: isImageLeft ? 'lg:order-2' : 'lg:order-1'
        };
      case '2-3':
        return {
          container: 'grid grid-cols-1 lg:grid-cols-5 gap-12 items-center',
          text: 'lg:col-span-2',
          image: 'lg:col-span-3',
          order: isImageLeft ? 'lg:order-2' : 'lg:order-1'
        };
      case '2-5':
        return {
          container: 'grid grid-cols-1 lg:grid-cols-7 gap-12 items-center',
          text: 'lg:col-span-2',
          image: 'lg:col-span-5',
          order: isImageLeft ? 'lg:order-2' : 'lg:order-1'
        };
      default:
        return {
          container: 'grid grid-cols-1 lg:grid-cols-2 gap-12 items-center',
          text: 'lg:col-span-1',
          image: 'lg:col-span-1',
          order: isImageLeft ? 'lg:order-2' : 'lg:order-1'
        };
    }
  };

  const layoutClasses = getLayoutClasses();
  
  const getButtonStyle = (color: 'yellow' | 'black' | 'white') => {
    switch (color) {
      case 'yellow':
        return { backgroundColor: '#f9dc24', color: '#000000' };
      case 'black':
        return { backgroundColor: '#000000', color: '#ffffff' };
      case 'white':
        return { backgroundColor: '#ffffff', color: '#000000' };
    }
  };

  const getKenBurnsClass = () => {
    switch (kenBurnsEffect) {
      case 'none':
        return '';
      case 'slow':
        return 'animate-ken-burns-slow';
      case 'fast':
        return 'animate-ken-burns-fast';
      case 'zoom-out':
        return 'animate-ken-burns-zoom-out';
      case 'pan-left':
        return 'animate-ken-burns-pan-left';
      case 'pan-right':
        return 'animate-ken-burns-pan-right';
      case 'standard':
      default:
        return 'animate-ken-burns';
    }
  };

  const handleButtonClick = (link?: string) => {
    navigateToLink(link);
  };

  return (
    <section
      id={id?.toString()}
      className={`relative overflow-hidden ${getTopPaddingClass()}`}
      style={{ minHeight: 'calc(100vh - 220px)' }}
    >
      {/* Background layer: image or video full-width */}
      {backgroundType === 'image' && imageUrl && (
        <div className="absolute inset-0 z-0 animate-fade-in">
          <img
            src={imageUrl}
            alt={imageAlt || "Full hero background"}
            className={`w-full h-full object-cover ${getKenBurnsClass()}`}
            style={{ 
              objectPosition: 'center center',
              transform: kenBurnsEffect !== 'none' ? 'scale(1.3)' : 'scale(1)' 
            }}
          />
          <div
            className="absolute inset-0 bg-black"
            style={{ opacity: overlayOpacity / 100 }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent"></div>
        </div>
      )}

      {backgroundType === 'video' && videoUrl && (
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
            onContextMenu={(e) => e.preventDefault()}
          >
            <source src={videoUrl} type="video/mp4" />
          </video>
          <div
            className="absolute inset-0 bg-black"
            style={{ opacity: overlayOpacity / 100 }}
          />
        </div>
      )}

      {/* Content layer */}
      <div className="container mx-auto px-6 py-16 lg:py-24 relative z-10 flex items-center" style={{ minHeight: 'calc(100vh - 300px)' }}>
        <div className="max-w-4xl w-full">
          {useH1 ? (
            <h1 className="text-5xl lg:text-6xl xl:text-7xl font-light text-white leading-[0.9] tracking-tight mb-6">
              {titleLine1}
              <br />
              <span className="font-medium">{titleLine2}</span>
            </h1>
          ) : (
            <h2 className="text-5xl lg:text-6xl xl:text-7xl font-light text-white leading-[0.9] tracking-tight mb-6">
              {titleLine1}
              <br />
              <span className="font-medium">{titleLine2}</span>
            </h2>
          )}

          {subtitle && (
            <p className="text-lg md:text-xl lg:text-2xl text-white/90 font-light leading-relaxed max-w-2xl">
              {subtitle}
            </p>
          )}

          {(button1Text || button2Text) && (
            <div className="pt-4 flex flex-col md:flex-row gap-4">
              {button1Text && (
                <Button
                  size="lg"
                  className="border-0 px-12 py-4 w-full md:w-auto"
                  style={getButtonStyle(button1Color)}
                  onClick={() => handleButtonClick(button1Link)}
                >
                  {button1Text}
                </Button>
              )}

              {button2Text && (
                <Button
                  size="lg"
                  className={`px-12 py-4 w-full md:w-auto ${button2Color === 'white' ? 'border border-white/40 hover:bg-black hover:text-white' : 'border-0'}`}
                  style={getButtonStyle(button2Color)}
                  onClick={() => handleButtonClick(button2Link)}
                >
                  {button2Text}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default FullHero;