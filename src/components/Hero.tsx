import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";
import precisionTestingHero from "@/assets/precision-testing-hero.jpg";

const Hero = () => {
  return (
    <section className="min-h-screen bg-scandi-white font-inter relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-soft-blue/15 to-accent-soft-blue/15 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-gradient-to-l from-soft-blue/10 to-accent-soft-blue/10 rounded-full blur-2xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-1/4 left-1/3 w-48 h-48 bg-gradient-to-r from-accent-soft-blue/8 to-soft-blue/8 rounded-full blur-xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      {/* Hero Background Image with Ken Burns Effect */}
      <div className="absolute inset-0 animate-fade-in">
        <img 
          src={precisionTestingHero}
          alt="Precision Engineering Process"
          className="w-full h-full object-cover animate-ken-burns opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-scandi-white/80 via-scandi-white/60 to-scandi-white/40"></div>
      </div>
      
      {/* Navigation Spacer */}
      <div className="h-16"></div>
      
      {/* Hero Content */}
      <div className="container mx-auto px-6 py-16 lg:py-24 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center min-h-[80vh]">
          
          {/* Left Content */}
          <div className="space-y-8 lg:pr-8">
            <div>
              <h1 className="text-6xl lg:text-7xl xl:text-8xl font-light text-light-foreground leading-[0.9] tracking-tight mb-6">
                Wir entwickeln
                <br />
                <span className="font-medium">Bildqualität</span>
              </h1>
              
              <p className="text-xl lg:text-2xl text-scandi-grey font-light leading-relaxed max-w-lg">
                Präzisionstests für Vision-Systeme der nächsten Generation. 
                Von der Entwicklung bis zur Zertifizierung.
              </p>
            </div>
            
            <div className="pt-4">
              <Button 
                size="lg"
                className="bg-soft-blue hover:bg-soft-blue/90 text-white border-0 px-8 py-4 text-lg font-medium shadow-soft hover:shadow-lg transition-all duration-300 group"
              >
                Testlösungen entdecken
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>

            {/* Minimal stats */}
            <div className="flex items-center space-x-12 pt-8">
              <div>
                <div className="text-2xl font-medium text-light-foreground">99.9%</div>
                <div className="text-sm text-scandi-grey font-light">Genauigkeit</div>
              </div>
              <div>
                <div className="text-2xl font-medium text-light-foreground">50ms</div>
                <div className="text-sm text-scandi-grey font-light">Reaktionszeit</div>
              </div>
              <div>
                <div className="text-2xl font-medium text-light-foreground">100+</div>
                <div className="text-sm text-scandi-grey font-light">Projekte</div>
              </div>
            </div>
          </div>

          {/* Right Content - Enhanced with Animation */}
          <div className="relative">
            <div className="relative overflow-hidden rounded-lg shadow-soft">
              {/* Animated glow effect behind image */}
              <div className="absolute inset-0 bg-gradient-to-br from-soft-blue/20 via-transparent to-accent-soft-blue/20 animate-pulse"></div>
              
              <img 
                src={precisionTestingHero}
                alt="Precision Engineering Process"
                className="w-full h-[500px] lg:h-[600px] object-cover relative z-10"
              />
              
              {/* Video overlay simulation */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent z-20"></div>
              
              {/* Moving light beam effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent transform -skew-x-12 translate-x-[-100%] animate-[slide-in-right_4s_ease-in-out_infinite] z-30"></div>
              
              {/* Play button overlay for video feeling */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300 z-40">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30">
                  <Play className="h-6 w-6 text-white ml-1" fill="currentColor" />
                </div>
              </div>
            </div>
            
            {/* Floating stats */}
            <div className="absolute -bottom-6 -left-6 bg-scandi-white p-6 rounded-lg shadow-soft border border-scandi-light-grey">
              <div className="text-sm text-scandi-grey font-light mb-1">Echtzeit-Verarbeitung</div>
              <div className="text-2xl font-medium text-light-foreground">Live</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;