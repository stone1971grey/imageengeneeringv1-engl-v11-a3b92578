import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { ImageMetadata } from '@/types/imageMetadata';

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
  imageMetadata?: ImageMetadata;
  videoUrl?: string;
  imagePosition?: 'left' | 'right';
  layoutRatio?: '1-1' | '2-3' | '2-5';
  topSpacing?: 'small' | 'medium' | 'large' | 'extra-large';
  kenBurnsEffect?: 'none' | 'standard' | 'slow' | 'fast' | 'zoom-out' | 'pan-left' | 'pan-right';
  kenBurnsLoop?: boolean;
  overlayOpacity?: number;
  gradientDirection?: 'none' | 'left-to-right' | 'right-to-left';
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
  imageMetadata,
  videoUrl,
  imagePosition = 'right',
  layoutRatio = '1-1',
  topSpacing = 'medium',
  kenBurnsEffect = 'standard',
  kenBurnsLoop = true,
  overlayOpacity = 15,
  gradientDirection = 'none',
  useH1 = false,
}: FullHeroProps) => {
  
  const getTopPaddingClass = () => {
    // Navigation ist ~100-120px hoch, Meta Navigation (wenn vorhanden) ist ~60px hoch zusätzlich
    switch (topSpacing) {
      case 'small': return hasMetaNavigation ? 'pt-[210px]' : 'pt-[150px]';
      case 'medium': return hasMetaNavigation ? 'pt-[230px]' : 'pt-[170px]';
      case 'large': return hasMetaNavigation ? 'pt-[250px]' : 'pt-[190px]';
      case 'extra-large': return hasMetaNavigation ? 'pt-[270px]' : 'pt-[210px]';
      default: return hasMetaNavigation ? 'pt-[230px]' : 'pt-[170px]';
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
    if (kenBurnsEffect === 'none') return '';
    
    const baseClass = (() => {
      switch (kenBurnsEffect) {
        case 'slow': return 'ken-burns-slow';
        case 'fast': return 'ken-burns-fast';
        case 'zoom-out': return 'ken-burns-zoom-out';
        case 'pan-left': return 'ken-burns-pan-left';
        case 'pan-right': return 'ken-burns-pan-right';
        case 'standard':
        default: return 'ken-burns';
      }
    })();
    
    return kenBurnsLoop ? `animate-${baseClass}-loop` : `animate-${baseClass}`;
  };

  const getOverlayStyle = () => {
    const baseOpacity = overlayOpacity / 100;
    
    if (gradientDirection === 'none') {
      return {
        background: 'black',
        opacity: baseOpacity
      };
    }
    
    if (gradientDirection === 'left-to-right') {
      // Darker on left, lighter on right
      return {
        background: `linear-gradient(to right, rgba(0,0,0,${baseOpacity * 1.5}), rgba(0,0,0,${baseOpacity * 0.3}))`,
        opacity: 1
      };
    }
    
    if (gradientDirection === 'right-to-left') {
      // Lighter on left, darker on right
      return {
        background: `linear-gradient(to left, rgba(0,0,0,${baseOpacity * 1.5}), rgba(0,0,0,${baseOpacity * 0.3}))`,
        opacity: 1
      };
    }
    
    return {
      background: 'black',
      opacity: baseOpacity
    };
  };

  const handleButtonClick = (link?: string) => {
    if (!link) return;
    
    if (link.startsWith('#')) {
      const element = document.getElementById(link.substring(1));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      window.location.href = link;
    }
  };

  return (
    <section id={id?.toString()} className={`relative overflow-hidden ${getTopPaddingClass()} min-h-[600px] flex items-center`}>
      {/* Background Image/Video - Full Width */}
      {backgroundType === 'image' && imageUrl ? (
        <>
          <div 
            className={`absolute inset-0 bg-cover bg-center ${getKenBurnsClass()}`}
            style={{ 
              backgroundImage: `url(${imageUrl})`,
              transform: kenBurnsEffect !== 'none' ? 'scale(1.1)' : 'scale(1)'
            }}
            role="img"
            aria-label={imageMetadata?.altText || 'Hero background image'}
          />
          <div 
            className="absolute inset-0"
            style={getOverlayStyle()}
          />
        </>
      ) : backgroundType === 'video' && videoUrl ? (
        <>
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
            onContextMenu={(e) => e.preventDefault()}
          >
            <source src={videoUrl} type="video/mp4" />
          </video>
          <div 
            className="absolute inset-0"
            style={getOverlayStyle()}
          />
        </>
      ) : null}

      {/* Content - Overlaying the background */}
      <div className="container mx-auto px-6 py-16 lg:py-24 relative z-10">
        <div className="max-w-4xl">
          <div className="text-left space-y-8">
            <div>
              {useH1 ? (
                <h1 className="text-6xl lg:text-7xl xl:text-8xl font-light text-white leading-[0.9] tracking-tight mb-6 drop-shadow-lg">
                  <span className="block">{titleLine1}</span>
                  <span className="font-medium block">{titleLine2}</span>
                </h1>
              ) : (
                <h2 className="text-6xl lg:text-7xl xl:text-8xl font-light text-white leading-[0.9] tracking-tight mb-6 drop-shadow-lg">
                  <span className="block">{titleLine1}</span>
                  <span className="font-medium block">{titleLine2}</span>
                </h2>
              )}
              
              {subtitle && (
                <p className="text-xl lg:text-2xl text-white/90 font-light leading-relaxed max-w-lg drop-shadow-lg">
                  {subtitle}
                </p>
              )}
            </div>
            
            {(button1Text || button2Text) && (
              <div className="pt-4 flex flex-col sm:flex-row gap-4">
                {button1Text && (
                  <Button 
                    size="lg"
                    className="px-8 py-6 text-base shadow-xl"
                    style={getButtonStyle(button1Color)}
                    onClick={() => handleButtonClick(button1Link)}
                  >
                    {button1Text}
                  </Button>
                )}
                
                {button2Text && (
                  <Button 
                    size="lg"
                    variant="outline"
                    className="px-8 py-6 text-base shadow-xl"
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
      </div>
    </section>
  );
};

export default FullHero;