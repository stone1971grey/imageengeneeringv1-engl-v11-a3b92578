import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";
import precisionTestingHero from "@/assets/precision-testing-hero.jpg";

const Hero = () => {
  return (
    <section className="min-h-screen bg-scandi-white font-inter relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-soft-blue/50 to-accent-soft-blue/50 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-gradient-to-l from-soft-blue/40 to-accent-soft-blue/40 rounded-full blur-2xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-1/4 left-1/3 w-48 h-48 bg-gradient-to-r from-accent-soft-blue/35 to-soft-blue/35 rounded-full blur-xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      {/* Hero Background Image with Ken Burns Effect */}
      <div className="absolute inset-0 animate-fade-in">
        <img 
          src={precisionTestingHero}
          alt="Precision Engineering Process"
          className="w-full h-full object-cover animate-ken-burns opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-scandi-white/60 via-scandi-white/40 to-scandi-white/20"></div>
      </div>
      
      {/* Navigation Spacer */}
      <div className="h-16"></div>
      
      {/* Hero Content */}
      <div className="container mx-auto px-6 py-16 lg:py-24 relative z-10">
        <div className="flex items-center justify-center min-h-[80vh]">
          
          {/* Centered Content */}
          <div className="text-center space-y-8 max-w-4xl">
            <div>
              <h1 className="text-6xl lg:text-7xl xl:text-8xl font-light text-light-foreground leading-[0.9] tracking-tight mb-6">
                Test Charts
                <br />
                <span className="font-medium">Made by Image Engineering</span>
              </h1>
              
              <p className="text-xl lg:text-2xl text-scandi-grey font-light leading-relaxed max-w-2xl mx-auto">
                Wir entwickeln und produzieren hochpräzise Testcharts für professionelle Bildqualitätstests. 
                Jetzt direkt im Shop bestellen.
              </p>
            </div>
            
            <div className="pt-4">
              <Button 
                size="lg"
                className="text-white border-0 px-8 py-4 text-lg font-medium shadow-soft hover:shadow-lg transition-all duration-300 group"
                style={{ backgroundColor: '#7a933b' }}
                onClick={() => window.location.href = '/products/charts'}
              >
                Charts entdecken
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>

            {/* Minimal stats */}
            <div className="flex items-center justify-center space-x-12 pt-8">
              <div>
                <div className="text-2xl font-medium text-light-foreground">200+</div>
                <div className="text-sm text-scandi-grey font-light">Testchart-Varianten</div>
              </div>
              <div>
                <div className="text-2xl font-medium text-light-foreground">0,01%</div>
                <div className="text-sm text-scandi-grey font-light">Messtoleranz</div>
              </div>
              <div>
                <div className="text-2xl font-medium text-light-foreground">15+</div>
                <div className="text-sm text-scandi-grey font-light">Jahre Erfahrung</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;