import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";
import precisionTestingHero from "@/assets/precision-testing-hero.jpg";

const Hero = () => {
  return (
    <section className="min-h-screen bg-scandi-white font-inter">
      {/* Navigation Spacer */}
      <div className="h-16"></div>
      
      {/* Hero Content */}
      <div className="container mx-auto px-6 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-16 items-center min-h-[80vh]">
          
          {/* Left Content */}
          <div className="space-y-8 lg:pr-8">
            <div>
              <h1 className="text-6xl lg:text-7xl xl:text-8xl font-light text-light-foreground leading-[0.9] tracking-tight mb-6">
                Precision
                <br />
                <span className="font-medium">Vision</span>
              </h1>
              
              <p className="text-xl lg:text-2xl text-scandi-grey font-light leading-relaxed max-w-lg">
                Advanced image processing and computer vision solutions 
                engineered for tomorrow's technologies.
              </p>
            </div>
            
            <div className="pt-4">
              <Button 
                size="lg"
                className="bg-soft-blue hover:bg-soft-blue/90 text-white border-0 px-8 py-4 text-lg font-medium shadow-soft hover:shadow-lg transition-all duration-300 group"
              >
                Explore Solutions
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>

            {/* Minimal stats */}
            <div className="flex items-center space-x-12 pt-8">
              <div>
                <div className="text-2xl font-medium text-light-foreground">99.9%</div>
                <div className="text-sm text-scandi-grey font-light">Accuracy</div>
              </div>
              <div>
                <div className="text-2xl font-medium text-light-foreground">50ms</div>
                <div className="text-sm text-scandi-grey font-light">Response</div>
              </div>
              <div>
                <div className="text-2xl font-medium text-light-foreground">100+</div>
                <div className="text-sm text-scandi-grey font-light">Projects</div>
              </div>
            </div>
          </div>

          {/* Right Content - Video/Image */}
          <div className="relative">
            <div className="relative overflow-hidden rounded-lg shadow-soft">
              <img 
                src={precisionTestingHero}
                alt="Precision Engineering Process"
                className="w-full h-[500px] lg:h-[600px] object-cover"
              />
              
              {/* Video overlay simulation */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
              
              {/* Play button overlay for video feeling */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30">
                  <Play className="h-6 w-6 text-white ml-1" fill="currentColor" />
                </div>
              </div>
            </div>
            
            {/* Floating stats */}
            <div className="absolute -bottom-6 -left-6 bg-scandi-white p-6 rounded-lg shadow-soft border border-scandi-light-grey">
              <div className="text-sm text-scandi-grey font-light mb-1">Real-time Processing</div>
              <div className="text-2xl font-medium text-light-foreground">Live</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;