import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";

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
  videoUrl,
  imagePosition = 'right',
  layoutRatio = '1-1',
  topSpacing = 'medium',
  kenBurnsEffect = 'standard',
  overlayOpacity = 15,
  useH1 = false,
}: FullHeroProps) => {
  
  const getTopPaddingClass = () => {
    // Meta Navigation (wenn vorhanden) ist ~60px hoch, zusätzlicher Space erforderlich
    switch (topSpacing) {
      case 'small': return hasMetaNavigation ? 'pt-32' : 'pt-16';
      case 'medium': return hasMetaNavigation ? 'pt-40' : 'pt-24';
      case 'large': return hasMetaNavigation ? 'pt-48' : 'pt-32';
      case 'extra-large': return hasMetaNavigation ? 'pt-56' : 'pt-40';
      default: return hasMetaNavigation ? 'pt-40' : 'pt-24';
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
    <section id={id?.toString()} className={`relative overflow-hidden ${getTopPaddingClass()}`}>
      <div className="container mx-auto px-6 pb-16 lg:pb-24 relative z-10">
        <div className={layoutClasses.container}>
          
          {/* Text Content */}
          <div className={`text-left space-y-8 ${layoutClasses.text} ${layoutClasses.order}`}>
            <div>
              {useH1 ? (
                <h1 className="text-4xl lg:text-5xl xl:text-6xl leading-tight tracking-tight mb-6 text-foreground">
                  <span className="font-light block">{titleLine1}</span>
                  <span className="font-medium block">{titleLine2}</span>
                </h1>
              ) : (
                <h2 className="text-4xl lg:text-5xl xl:text-6xl leading-tight tracking-tight mb-6 text-foreground">
                  <span className="font-light block">{titleLine1}</span>
                  <span className="font-medium block">{titleLine2}</span>
                </h2>
              )}
              
              {subtitle && (
                <p className="text-lg lg:text-xl text-muted-foreground leading-relaxed">
                  {subtitle}
                </p>
              )}
            </div>
            
            {(button1Text || button2Text) && (
              <div className="pt-4 flex flex-col sm:flex-row gap-4">
                {button1Text && (
                  <Button 
                    size="lg"
                    className="px-8 py-6 text-base"
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
                    className="px-8 py-6 text-base"
                    style={getButtonStyle(button2Color)}
                    onClick={() => handleButtonClick(button2Link)}
                  >
                    {button2Text}
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Image Section */}
          <div className={`relative ${layoutClasses.image} ${imagePosition === 'left' ? 'lg:order-1' : 'lg:order-2'}`}>
            {backgroundType === 'image' && imageUrl ? (
              <div className="relative rounded-xl overflow-hidden shadow-2xl">
                <img 
                  src={imageUrl}
                  alt="Product Hero"
                  className={`w-full h-auto object-cover ${getKenBurnsClass()}`}
                  style={{ transform: kenBurnsEffect !== 'none' ? 'scale(1.1)' : 'scale(1)' }}
                />
                <div 
                  className="absolute inset-0 bg-black"
                  style={{ opacity: overlayOpacity / 100 }}
                />
              </div>
            ) : backgroundType === 'video' && videoUrl ? (
              <div className="relative rounded-xl overflow-hidden shadow-2xl">
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-auto object-cover"
                  onContextMenu={(e) => e.preventDefault()}
                >
                  <source src={videoUrl} type="video/mp4" />
                </video>
                <div 
                  className="absolute inset-0 bg-black"
                  style={{ opacity: overlayOpacity / 100 }}
                />
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FullHero;