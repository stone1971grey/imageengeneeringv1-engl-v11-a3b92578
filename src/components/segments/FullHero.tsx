import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";

interface FullHeroProps {
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
  kenBurnsEffect?: 'none' | 'standard' | 'slow' | 'fast' | 'zoom-out' | 'pan-left' | 'pan-right';
  overlayOpacity?: number;
  useH1?: boolean; // NEW: determines if title should be h1 or div
}

const FullHero = ({
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
  kenBurnsEffect = 'standard',
  overlayOpacity = 15,
  useH1 = false, // Default to false for backwards compatibility
}: FullHeroProps) => {
  
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
    <section className="relative overflow-hidden" style={{ minHeight: 'calc(100vh - 220px)' }}>
      {/* Background (Image or Video) */}
      <div className="absolute inset-0 animate-fade-in">
        {backgroundType === 'image' && imageUrl ? (
          <>
            <img 
              src={imageUrl}
              alt="Hero Background"
              className={`w-full h-full object-cover ${getKenBurnsClass()}`}
              style={{ objectPosition: 'center center', transform: kenBurnsEffect !== 'none' ? 'scale(1.3)' : 'scale(1)' }}
            />
          </>
        ) : backgroundType === 'video' && videoUrl ? (
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
            style={{ objectPosition: 'center center' }}
          >
            <source src={videoUrl} type="video/mp4" />
          </video>
        ) : null}
        
        {/* Overlay */}
        <div 
          className="absolute inset-0 bg-black"
          style={{ opacity: overlayOpacity / 100 }}
        ></div>
        
        {/* Left fade gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent"></div>
      </div>
      
      {/* Navigation Spacer */}
      <div className="h-16"></div>
      
      {/* Hero Content */}
      <div className="container mx-auto px-6 pt-28 pb-16 lg:pt-36 lg:pb-24 relative z-10 flex items-center" style={{ minHeight: 'calc(100vh - 300px)' }}>
        <div className="flex items-center justify-start min-h-full">
          
          {/* Left-aligned Content */}
          <div className="text-left space-y-8 max-w-4xl w-full pr-4 md:pr-0">
            <div>
      {/* Two-line title - dynamic h1 or h2 based on useH1 prop */}
      {useH1 ? (
        <h1 className="text-5xl lg:text-6xl xl:text-7xl leading-[0.9] tracking-tight mb-6">
          <span className="font-light text-white block">{titleLine1}</span>
          <span className="font-medium text-white block">{titleLine2}</span>
        </h1>
      ) : (
        <h2 className="text-5xl lg:text-6xl xl:text-7xl leading-[0.9] tracking-tight mb-6">
          <span className="font-light text-white block">{titleLine1}</span>
          <span className="font-medium text-white block">{titleLine2}</span>
        </h2>
      )}
              
              {/* Subtitle */}
              {subtitle && (
                <p className="text-lg md:text-xl lg:text-2xl text-white/90 font-light leading-relaxed max-w-2xl">
                  {subtitle}
                </p>
              )}
            </div>
            
            {/* Buttons */}
            {(button1Text || button2Text) && (
              <div className="pt-4 flex flex-col md:flex-row gap-4">
                {button1Text && (
                  <Button 
                    size="lg"
                    variant="decision"
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
                    variant="outline"
                    className="px-12 py-4 w-full md:w-auto border-2"
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