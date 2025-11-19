import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import precisionTestingHero from "@/assets/precision-testing-hero.jpg";
import { useTranslation } from "@/hooks/useTranslation";

const Hero = () => {
  const { t } = useTranslation();
  return (
    <section className="relative overflow-hidden" style={{ minHeight: 'calc(100vh - 220px)' }}>
      {/* Hero Background Image with Ken Burns Effect */}
      <div className="absolute inset-0 animate-fade-in">
        <img 
          src={precisionTestingHero}
          alt="Precision Engineering Process"
          className="w-full h-full object-cover animate-ken-burns"
          style={{ objectPosition: 'center center', transform: 'scale(1.3)' }}
        />
        <div className="absolute inset-0 bg-black/15"></div>
        {/* Left fade overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent"></div>
      </div>
      
      {/* Navigation Spacer */}
      <div className="h-16"></div>
      
      {/* Hero Content */}
      <div className="container mx-auto px-6 py-16 lg:py-24 relative z-10 flex items-center" style={{ minHeight: 'calc(100vh - 300px)' }}>
        <div className="flex items-center justify-start min-h-full">
          
          {/* Left-aligned Content */}
          <div className="text-left space-y-8 max-w-4xl w-full pr-4 md:pr-0">
            <div>
              <h1 className="text-5xl lg:text-6xl xl:text-7xl font-light text-white leading-[0.9] tracking-tight mb-6">
                {t.hero.title}
                <br />
                <span className="font-medium">{t.hero.subtitle}</span>
              </h1>
              
              <p className="text-lg md:text-xl lg:text-2xl text-white/90 font-light leading-relaxed max-w-2xl">
                {t.hero.description}
              </p>
            </div>
            
            <div className="pt-4 flex flex-col md:flex-row gap-4">
              <Button 
                size="lg"
                variant="decision"
                className="border-0 px-12 py-4 w-full md:w-auto"
                style={{ backgroundColor: '#f9dc24', color: 'black' }}
                onClick={() => {
                  const element = document.getElementById('trusted-industries');
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
              >
                {t.hero.findYourSolution}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;